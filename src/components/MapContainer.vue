<template style="contain: layout">
  <div id="map" class="map">
    <!-- Map container -->
  </div>

  <ion-alert
    class="map-alert"
    :is-open="isAlertOpen"
    header="Activer la localisation pour rechercher les oeuvres à proximité"
    :buttons="alertBtn"
    @didDismiss="isAlertOpen = false"
  >
  </ion-alert>

  <!-- Closest discoveries accordion -->

  <!-- ionChange and :value here are a fix to keep the accordion from re-opening by itself caused by recenter button updating (maybe ionic re-renders accordion when recenter button in it updates) -->
  <ion-accordion-group
    class="closestDiscoveriesAccordion"
    v-if="!isPermissionDenied"
    :value="ionAccordionOpen ? 'ionaccordion' : ''"
    @ionChange="ionAccordionOpen = !ionAccordionOpen"
  >
    <!-- Put the recenter button here so that it moves with the accordion-->
    <div class="accordionButtonDiv">
      <ion-button
      @click="this.recenterView(); this.updateClosestDiscoveries();"
      id="recenter-button"
      :class="{
      'map-button': true,
      userLocationInViewport: isUserLocationInViewport,
      userLocationOutsideViewport: isUserLocationOutsideViewport,
      }"
      :fill="isUserLocationInViewport || isUserLocationOutsideViewport ? 'outline' : 'solid'"
      >
        <ion-icon :icon="isUserLocationOutsideViewport ? customLocationIconPurple : customLocationIconBlack"></ion-icon>RECENTRER LA CARTE
      </ion-button>
    </div>

    <ion-accordion value="ionaccordion">
      <!-- TODO Move recenter button with accordion and update when position changed -->
      <!-- TODO Put between 5 and 12 discoveries depending on discoveries in viewport and add number of discoveries in header?? (to confirm with team to understand what to do) -->
      <!-- TODO Check if discoveries match with user location when it changes -->
      <ion-item
        slot="header"
      >
        <ion-label>Découvertes à proximité: </ion-label>
      </ion-item>
      <div slot="content" style="height: 20vh; width: 100vw">
        <ion-list :inset="false" lines="none">
          <ion-item
            v-for="discovery of closestDiscoveriesDistance"
            :key="discovery"
            @click="
              focusDiscovery(discovery);
            "
          >
            <!-- TODO Do border gradient like on Figma -->
            <ion-grid
              :style="{
                borderColor:
                  discovery.dType === 'artwork'
                    ? '#FFDE7B'
                    : discovery.dType === 'heritage'
                      ? '#f9a186'
                      : '#B965ED',
              }"
            >
              <ion-row id="closestDiscoveryTitle">
                <!-- Discovery title -->
                {{ discovery.getTitle() }}
              </ion-row>
              <ion-row id="closestDiscoveryArtistOrUsages">
                <!-- Discovery artist or usages-->
                {{
                  discovery.dType === "artwork"
                    ? discovery.getArtists()
                    : discovery.getUsages()
                }}
              </ion-row>
              <ion-row id="closestDiscoveryDate">
                <!-- Discovery date -->
                {{
                  discovery.dType === "heritage" ||
                  discovery.dType === "artwork"
                    ? discovery.produced_at
                    : "---"
                }}
              </ion-row>
              <ion-row>
                <!-- Discovery pin icon (svg) -->
                <ion-icon
                  id="closestDiscoveryPinIcon"
                  :icon="`./assets/drawable/pins/${discovery.dType}/default.svg`"
                ></ion-icon>
                <!-- Discovery to user distance  -->
                <ion-label id="closestDiscoveryDistance"
                  >{{
                    Distance.distance2string(
                      Distance.calculateDistance(discovery, lat2, lng2),
                    )
                  }}
                </ion-label>
              </ion-row>
            </ion-grid>
          </ion-item>
          <!-- TODO Make list ordered in distance -->
          <div id="seeMoreInList" @click="this.$router.push('/tabs/list')">
            Voir plus dans l'annuaire
          </div>
        </ion-list>
      </div>
    </ion-accordion>
  </ion-accordion-group>
  <!-- Closest discoveries accordion -->

  <!-- Selected pin discovery details modal -->
  <ion-modal
    id="discoveryDetailsModal"
    :is-open="discoveryDetailsModalOpen"
    @didDismiss="this.unfocusDiscovery"
    :breakpoints="[0.2, 0.75, 1]"
    :initial-breakpoint="0.75"
    :show-backdrop="false"
  >
    <ion-content>
      <discovery-details :selected-discovery="currentSelectedDiscovery" />
    </ion-content>
  </ion-modal>

  <!-- Selected pin discovery details modal -->

</template>

<script>
import "ol/ol.css";
import { arrowForward as arrowRightIcon } from "ionicons/icons";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonAccordion,
  IonAccordionGroup,
  IonAlert,
  IonModal,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
} from "@ionic/vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { Group as layerGroup } from "ol/layer";
import { useGeographic } from "ol/proj";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { OSM } from "ol/source";
import { defaults as defaultControls } from "ol/control";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { easeOut } from "ol/easing";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { useRoute } from "vue-router";
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from "capacitor-native-settings";
import { Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle.js";
import { circular } from "ol/geom/Polygon.js";
import customLocationIconBlack from "/assets/drawable/icons/location_icon_black.svg";
import customLocationIconPurple from "/assets/drawable/icons/location_icon_purple.svg";
import {containsCoordinate, getHeight} from "ol/extent.js";
import { Geolocation } from "@capacitor/geolocation";
import { isPlatform } from "@ionic/vue";
import { App } from "@capacitor/app";
import { Distance } from "@/internal/Distance";
import DiscoveryDetails from "@/components/DiscoveryDetails.vue";

function insertAllPins(destinationLayer, discoveryList) {
  for (const discovery of discoveryList) {
    const feature = new Feature({
      geometry: new Point([discovery.location.lng, discovery.location.lat]),
      id: discovery.id,
      dType: discovery.dType,
    });
    destinationLayer.getSource().addFeature(feature);
  }
}

export default {
  name: "MapContainer",
  computed: {
    Distance() {
      return Distance;
    },
    UserData() {
      return UserData;
    },
  },

  components: {
    DiscoveryDetails,
    IonModal,
    IonLabel,
    IonContent,
    IonButton,
    IonIcon,
    IonAlert,
    IonAccordion,
    IonAccordionGroup,
    IonList,
    IonItem,
    IonGrid,
    IonRow,
  },

  data() {
    const layer = new layerGroup({
      layers: [
        new TileLayer({
          className: "basemapLayer",
          source: new OSM(),
        }),
      ],
    });

    let discovery = null;

    // If URL has discovery (because clicked on it from its description card), focus on it
    if (this.$route.query.type && this.$route.query.id) {
      discovery = Utils.getDiscovery(
        parseInt(this.$route.query.id),
        this.$route.query.type,
      );
      setTimeout(() => this.focusDiscovery(discovery), 100);
    }

    return {
      ionAccordionOpen: true,
      currentSelectedDiscovery: null,
      discoveryDetailsModalOpen: false,
      isPermissionDenied: true,
      mapPinsLayer: null,
      lat2: UserData.getLocation()[1],
      lng2: UserData.getLocation()[0],
      closestDiscoveriesDistance: [],
      formerSelectedPinFeature: null,
      isUserLocationInViewport: false,
      isUserLocationOutsideViewport: false,
      mainMap: null,
      INITIAL_COORDS: discovery
        ? [discovery.location.lng, discovery.location.lat]
        : UserData.getLocation(),
      // if location is not available, use the initial coordinates = [-68.2075, 52.8131]
      DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14, // If the map was opened by the DOD page we want to zoom more
      // if location is not available, use the default zoom level = 4.5
      TILE_LAYER: layer,
      arrowRightIcon,
      customLocationIconBlack,
      customLocationIconPurple,
      isAlertOpen: false,
      alertBtn: [
        {
          text: "Annuler",
          cssClass: "alert-button-cancel",
          handler: () => {
            this.setAlertOpen(false);
          },
        },
        {
          text: "Activer",
          cssClass: "alert-button-confirm",
          handler: () => {
            this.openAppSettings();
          },
        },
      ],
    };
  },

  created() {
    // If discovery in the URL has changed, update the focus on the discovery
    this.$watch(
      () => this.$route.params,
      () => {
        if (this.$route.query.type && this.$route.query.id) {
          const discovery = Utils.getDiscovery(
            parseInt(this.$route.query.id),
            this.$route.query.type,
          );
          setTimeout(() => this.focusDiscovery(discovery), 100);
        } else {
          this.unfocusDiscovery();
        }
      },
    );

    // Set closest discoveries to user location when opening map
    // Timeout because or else, it doesn't show closest discoveries
    setTimeout(() => {
      this.updateClosestDiscoveries();
    }, 1000);

  },

  async mounted() {
    // Foreground app state change listener
    // After user go back to the app from app settings, check if the location permission is granted
    await App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        const geoCheckPermission = await Geolocation.checkPermissions();
        this.isPermissionDenied = geoCheckPermission.location === "denied";

        if (!this.isPermissionDenied) {
          this.showLocation();
        }
      }
    });
    // If the permission is granted, this.askForPermissions() will not ask for permission again
    await this.askForPermissions();
    this.myMap();
  },

  methods: {

    updateClosestDiscoveries() {
      this.closestDiscoveriesDistance =
          UserData.getSortedDiscoveriesDistance(0, 12);
      // For distance between discoveries and user location
      this.lat2 = UserData.getLocation()[1];
      this.lng2 = UserData.getLocation()[0];
    },

    async askForPermissions() {
      try {
        const geoRequestPermission = await Geolocation.requestPermissions();
        this.isPermissionDenied = geoRequestPermission.location === "denied";
      } catch (e) {
        /* empty */
      }
    },

    myMap() {
      useGeographic();
      this.mainMap = new Map({
        // Hiding attribution (yes it's immoral)
        // ********* To put back Zoom buttons, replace 'zoom: false' by 'zoom: true' ********
        controls: defaultControls({ attribution: false, zoom: false }),

        target: "map", // html element id where map will be rendered
        view: new View({
          center: this.isPermissionDenied
            ? [-68.2075, 52.8131]
            : this.INITIAL_COORDS,
          zoom: this.isPermissionDenied ? 4.5 : this.DEFAULT_ZOOM_LEVEL,
          maxZoom: 24,
          minZoom: 3,

          // Disable rotation on map
          enableRotation: false,
        }),

        layers: [this.TILE_LAYER],
      });

      this.mainMap.on("singleclick", this.handleMapClick);
      this.mainMap.on("moveend", this.setCenterButtonAppearance);

      this.showPins();
      // Need to put an if statement here. If not, the blue circle will show up even if the user has denied the location permission
      if (!this.isPermissionDenied) this.showLocation();
    },

    setCenterButtonAppearance() {
      // Reducing decimals to make '===' possible because UserData.getLocation and this.mainMap.getView.getCenter return different numbers of decimals
      const userLocationX = UserData.getLocation()[0].toFixed(7);
      const userLocationY = UserData.getLocation()[1].toFixed(7);
      const viewCenterX = this.mainMap.getView().getCenter()[0].toFixed(7);
      const viewCenterY = this.mainMap.getView().getCenter()[1].toFixed(7);

      // (Extent of viewport on map represented by [smallest viewport x, smallest viewport y, biggest viewport x, biggest viewport y])
      const viewportExtent = this.mainMap
        .getView()
        .calculateExtent(this.mainMap.getSize());

      // userLocationOutsideViewport button
      // User location out of viewport
      if (!containsCoordinate(viewportExtent, UserData.getLocation())) {
        this.isUserLocationInViewport = false;
        this.isUserLocationOutsideViewport = true;
      }
      //Default button
      // View centered (view center = user location coordinates)
      else if (userLocationX === viewCenterX && userLocationY === viewCenterY) {
        this.isUserLocationInViewport = false;
        this.isUserLocationOutsideViewport = false;
      }
      //userLocationInViewport button
      // Not centered, but in viewport (view center != user coordinates && user location coordinates in viewport)
      else {
        this.isUserLocationInViewport = true;
        this.isUserLocationOutsideViewport = false;
      }
    },

    // Shows pins on the map
    // Called in created()
    showPins(discoveries = []) {
      const pinsLayer = new VectorLayer({
        source: new VectorSource(),
        style: this.pinStyleFunction, // style that features (pins) will take
      });

      this.mapPinsLayer = pinsLayer;

      if (discoveries.length > 0) {
        // Show a subset of discoveries (used with filters)
        insertAllPins(pinsLayer, discoveries);
      } else {
        // Show all discoveries
        insertAllPins(pinsLayer, UserData.getSortedDiscoveriesAZ());
      }

      this.mainMap.addLayer(pinsLayer);
    },

    // Taken from Utils.ts
    pinStyleFunction(feature) {
      /**
       * Style function for OSM Features (used for pins on the map).
       * Not supposed to be called manually, but rather assigned or referenced.
       *
       * @param feature - the pin feature
       * @return a new style
       */

      const id = feature.get("id");
      const type = feature.get("dType");

      const status = UserData.isCollected(id, type)
        ? "collected"
        : UserData.isTargeted(id, type)
          ? "targeted"
          : "default";

      const zoomLevel = this.mainMap.getView().getZoom();

      const pinSize =
        zoomLevel < 14
          ? 0.3
          : zoomLevel === 14
            ? 0.35
            : zoomLevel === 15
              ? 0.4
              : 0.5;

      const style = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `./assets/drawable/pins/${type}/${status}.png`,
          scale: pinSize,
        }),
      });

      return [style];
    },

    // Makes selected discovery pin bigger, makes it red, and re-establishes former selected pin's size
    highlightSelectedDiscoveryPin(selectedPinDiscovery) {
      // if there was a selected pin before, make former selected pin back to normal scale
      if (this.formerSelectedPinFeature) {
        this.formerSelectedPinFeature.setStyle(this.mapPinsLayer.getStyle());
      }

      // Setting new style for selected pin
      // Get feature on the map that corresponds to selected pin
      const selectedFeature = this.mapPinsLayer
        .getSource()
        .getClosestFeatureToCoordinate([
          selectedPinDiscovery.location.lng,
          selectedPinDiscovery.location.lat,
        ]);

      const selectedPinStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `./assets/drawable/pins/selected_pin.svg`,
          scale: 0.83, // Augment selected pin size
        }),
      });
      selectedFeature.setStyle(selectedPinStyle);

      this.formerSelectedPinFeature = selectedFeature; // assign currently selected pin as former selected pin
    },

    showLocation() {
      //User location accuracy radius in meters (transparent blue circle)
      const locationAccuracyLayer = new VectorLayer({
        source: new VectorSource(),
        style: [
          new Style({
            fill: new Fill({
              color: "rgba(72, 157, 255, 0.202945)",
            }),
          }),
        ],
      });
      locationAccuracyLayer.getSource().addFeature(
        new Feature({
          geometry: circular(UserData.getLocation(), UserData.getAccuracy()),
        }),
      );
      this.mainMap.addLayer(locationAccuracyLayer);

      //User location icon (blue opaque circle with white outline)
      const userLocationLayer = new VectorLayer({
        source: new VectorSource(),
        style: [
          // Trying to put a slight shadow behind user location image to see it better on the map
          new Style({
            image: new CircleStyle({
              fill: new Fill({
                color: "rgba(72, 157, 255, 0.05)",
              }),
              radius: 11,
            }),
          }),
          new Style({
            image: new CircleStyle({
              stroke: new Stroke({
                color: "white",
                width: 3,
              }),
              fill: new Fill({
                color: "#489DFF",
              }),
              radius: 7,
            }),
          }),
        ],
      });
      const userPointFeature = new Feature({
        geometry: new Point(UserData.getLocation()),
      });
      userLocationLayer.getSource().addFeature(userPointFeature);
      this.mainMap.addLayer(userLocationLayer);

      // Update location and accuracy radius every 5 seconds
      setInterval(() => {
        userPointFeature.getGeometry().setCoordinates(UserData.getLocation());
        // TODO Update location accuracy layer -- how? Not sure if this works:
        locationAccuracyLayer
          .getSource()
          .getFeatures()[0]
          .setGeometry(
            circular(UserData.getLocation(), UserData.getAccuracy()),
          );
      }, 5000);
    },

    // Handles click on the map
    handleMapClick(event) {
      // Get features(discoveries on the map) close to click
      const features = this.mainMap.getFeaturesAtPixel(event.pixel, {
        hitTolerance: 10,
      });

      // Check if clicked close to features
      if (features.length > 0) {
        // Get closest feature to click
        const dType = features[0].get("dType");
        const id = features[0].get("id");
        const discovery = Utils.getDiscovery(id, dType);

        // Update focus on feature closest to click
        this.focusDiscovery(discovery);

      // Did not click close to features
      } else {
        this.unfocusDiscovery();
      }
    },

    // Highlights discovery, centers on it, and opens its description modal
    focusDiscovery(discovery, map = this.mainMap) {
      if (!discovery) return;

      const currentZoom = map.getView().getZoom();

      // Highlight clicked pin
      this.highlightSelectedDiscoveryPin(discovery);

      // Center map on the selected pin with animation
        // Get viewport height coordinates at the desired zoom level
        // Temporarily set the zoom level
        this.mainMap.getView().setZoom(Math.max(currentZoom, 14.25));
        // Calculate viewport height at the temporary zoom level
        const extentHeight = getHeight(this.mainMap.getView().calculateExtent(map.getSize()));
        // Restore the original zoom level
        this.mainMap.getView().setZoom(currentZoom);

        map.getView().animate({
          // Center viewport a bit below the selected pin so that the pin is towards the top of viewport
          center: [discovery.location.lng, discovery.location.lat - 0.30 * extentHeight],
          duration: 200,
          zoom: Math.max(currentZoom, 14.25),
          easing: easeOut,
        });

      // Open pin discovery details description modal
      this.currentSelectedDiscovery = discovery;
      this.discoveryDetailsModalOpen = true;
    },

    // Re-center on user location
    recenterView() {
      if (!this.isPermissionDenied) {
        const mapView = this.mainMap.getView();

        mapView.animate({
          center: UserData.getLocation(),
          duration: 200,
          zoom: Math.max(mapView.getZoom(), 14.25),
          easing: easeOut,
        });
      } else {
        this.setAlertOpen(true);
      }
    },

    // Close modal, make former selected pin back to normal scale if there was a selected pin before, and put formerSelectedPinFeature to null because there are no more selected pin
    async unfocusDiscovery() {
      this.discoveryDetailsModalOpen = false;
      if (this.formerSelectedPinFeature) {
        await this.formerSelectedPinFeature.setStyle(this.mapPinsLayer.getStyle());
        this.formerSelectedPinFeature = null;
      }
    },

    async openAppSettings() {
      if (isPlatform("android")) {
        await NativeSettings.openAndroid({
          option: AndroidSettings.ApplicationDetails,
        });
      } else {
        await NativeSettings.openIOS({
          option: IOSSettings.App,
        });
      }
    },

    setAlertOpen(state) {
      this.isAlertOpen = state;
    },

  },
};
</script>

<style scoped>
@import url("@/theme/Map.css");
</style>

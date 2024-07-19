<template style="contain: layout">
  <div id="map" class="map">
    <div id="popup">
      <div id="popup-content" hidden>
        <div id="popup-details">
          <p id="popupTitle" class="details"></p>
          <p id="popupSubtext" class="details"></p>
        </div>
        <ion-button fill="clear" id="seeMore" router-direction="forward">
          <ion-icon slot="icon-only" :icon="arrowRightIcon"></ion-icon>
        </ion-button>
      </div>
    </div>
  </div>

  <ion-button
    @click="recenterView"
    id="recenter-button"
    :class="{
      'map-button': true,
      userLocationInViewport: isUserLocationInViewport,
      userLocationOutsideViewport: isUserLocationOutsideViewport,
    }"
    :fill="isUserLocationInViewport ? 'outline' : 'solid'"
  >
    <ion-icon :icon="locationIcon"></ion-icon>Recentrer la carte
  </ion-button>

  <!-- Closest discoveries accordion -->
  <ion-accordion-group>
    <ion-accordion>
      <!-- TODO Move recenter button with accordion and update when position changed -->
      <!-- TODO Put between 5 and 12 discoveries depending on discoveries in viewport and add number of discoveries in header?? (to confirm with team to understand what to do) -->
      <!-- TODO Check if discoveries match with user location when it changes -->
      <ion-item
        slot="header"
        @click="
          this.closestDiscoveriesDistance =
            UserData.getSortedDiscoveriesDistance().slice(0, 12);
          this.lat2 = UserData.getLocation()[1];
          this.lng2 = UserData.getLocation()[0];
        "
      >
        <ion-label>Découvertes à proximité: </ion-label>
      </ion-item>
      <div slot="content" style="height: 20vh; width: 100vw">
        <ion-list :inset="false" lines="none">
          <ion-item
            v-for="discovery of closestDiscoveriesDistance"
            :key="discovery"
            @click="focusDiscovery(discovery); openDetails(discovery)"
          >
            <!-- TODO Do border gradient like on Figma -->
            <ion-grid :style="{borderColor: discovery.dType === 'artwork' ? '#FFDE7B' : (discovery.dType === 'heritage' ? '#f9a186' : '#B965ED') }">
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
</template>

<script>
import "ol/ol.css";

import {arrowForward as arrowRightIcon} from "ionicons/icons";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonAccordion,
  IonAccordionGroup,
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
import { Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle.js";
import { circular } from "ol/geom/Polygon.js";
import customLocationIcon from "/assets/drawable/icons/location_icon.svg";
import { containsCoordinate } from "ol/extent.js";
import { Distance } from "@/internal/Distance";

// This variable is here to know if the user focuses (previous click is) on a discovery or not
let hasFocus = false;

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
    IonLabel,
    IonContent,
    IonButton,
    IonIcon,
    IonAccordion,
    IonAccordionGroup,
  },

  data() {
    const layer = new layerGroup({
      layers: [
        new TileLayer({
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
      setTimeout(() => this.focusDiscovery(discovery), 250);
    }

    return {
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
      DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14, // If the map was opened by the DOD page we want to zoom more
      TILE_LAYER: layer,
      arrowRightIcon,
      locationIcon: customLocationIcon,
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
          this.focusDiscovery(discovery);
        }
        this.showPins(); // To change the big pin when focusing on a pin from the map
      },
    );
    this.renderMap();
  },

  mounted() {
    this.myMap();
  },

  methods: {
    myMap() {
      useGeographic();
      this.mainMap = new Map({
        // Hiding attribution (yes it's immoral)
        // ********* To put back Zoom buttons, replace 'zoom: false' by 'zoom: true' ********
        controls: defaultControls({ attribution: false, zoom: true }),

        target: "map", // html element id where map will be rendered
        view: new View({
          center: this.INITIAL_COORDS,
          zoom: this.DEFAULT_ZOOM_LEVEL,
          maxZoom: 24,
          minZoom: 3,

          // Disable rotation on map
          enableRotation: false,
        }),

        layers: [this.TILE_LAYER],
      });

      this.mainMap.on("singleclick", this.handleMapClick);
      this.mainMap.on("movestart", this.unfocusDiscovery);
      this.mainMap.on("moveend", this.setCenterButtonAppearance);

      this.showPins();
      this.showLocation();
    },

    openDetails(discovery) {
      let type;
      if (discovery.dType === "artwork") type = 0;
      else if (discovery.dType === "place") type = 1;
      /* (discovery.dType == "heritage") */ else type = 2;

      this.$router.push(`/discovery-details/${type}/${discovery.id}`);
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

    renderMap() {
      const route = useRoute();
      const dType = route.params.dType;
      const id = route.params.id;
      if (dType && id) {
        const discovery = Utils.getDiscovery(
          parseInt(id.toString()),
          dType.toString(),
        );
        this.focusDiscovery(discovery);
      }
    },

    // Shows pins on the map and the pin in params
    // Called in created() and when the URL params changes
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

      // if there's selected pin in url parameters, highlights it
      if (this.$route.query.type && this.$route.query.id) {
        const discovery = Utils.getDiscovery(
          parseInt(this.$route.query.id),
          this.$route.query.type,
        );
        this.highlightSelectedDiscoveryPin(discovery);
        // if not, if there's a formerly selected pin, returns it back to its original style
      } else {
        if (this.formerSelectedPinFeature) {
          this.formerSelectedPinFeature.setStyle(pinsLayer.getStyle());
        }
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

      const status = UserData.isCollected(id, type) ? "collected"
          : UserData.isTargeted(id, type) ? "targeted" : "default";

      const zoomLevel = this.mainMap.getView().getZoom();

      const pinSize = zoomLevel < 14 ? 0.3
                      : zoomLevel === 14 ? 0.35
                      : zoomLevel === 15 ? 0.4
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

    // Makes selected discovery pin bigger and re-establishes former selected pin's size
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

    handleMapClick(event) {
      // Get features(discoveries on the map) close to click
      const features = this.mainMap.getFeaturesAtPixel(event.pixel, {
        hitTolerance: 10,
      });

      // Check if clicked close to features
      if (features.length > 0) {
        // Update focus on feature closest to click
        const dType = features[0].get("dType");
        const id = features[0].get("id");
        const discovery = Utils.getDiscovery(id, dType);

        // Highlight clicked pin
        this.highlightSelectedDiscoveryPin(discovery);

        // Close current pop-up if present and re-open pop-up for clicked feature
        if (hasFocus) this.unfocusDiscovery();

        this.focusDiscovery(discovery);
        hasFocus = true;

      // Did not click close to features
      } else {
        // if there was a selected pin before, make former selected pin back to normal scale
        if (this.formerSelectedPinFeature) {
          this.formerSelectedPinFeature.setStyle(this.mapPinsLayer.getStyle());
        }
        // Close pop-up
        if (hasFocus) {
          this.unfocusDiscovery();
          hasFocus = false;
        }
      }
    },

    // Zoom and center on discovery and open its description popup
    focusDiscovery(discovery, map = this.mainMap) {
      if (!discovery) return;

      const transitionDuration = 200; // Unit is milliseconds

      // Center map on the pin with animation if it isn't already centered
      const mapCenter = map.getView().getCenter();
      if (
        mapCenter[0] !== discovery.location.lng ||
        mapCenter[1] !== discovery.location.lat
      ) {
        const currentZoom = map.getView().getZoom();

        map.getView().animate({
          center: [discovery.location.lng, discovery.location.lat],
          duration: transitionDuration,
          zoom: Math.max(currentZoom, 14.25),
          easing: easeOut,
        });
      }

      const details = document.getElementById("popup-content");

      // Show popup AFTER the view was centered
      setTimeout(() => {
        const elem = document.getElementById("popup");
        elem.classList.add("activated");
      }, transitionDuration);

      // Show content of popup AFTER the popup was shown
      setTimeout(() => {
        const title = discovery.getTitle();
        const subtext =
          discovery.dType === "artwork"
            ? discovery.getArtists()
            : discovery.getUsages();

        let type;
        if (discovery.dType === "artwork") type = 0;
        else if (discovery.dType === "place") type = 1;
        /* if (discovery.dType === "heritage") */ else type = 2;

        // Setting the button's redirection
        const button = document.getElementById("seeMore");
        button.onclick = () =>
          this.$router.push({
            path: `/discovery-details/${type}/${discovery.id}`,
          });

        document.getElementById("popupTitle").innerHTML = title;
        document.getElementById("popupSubtext").innerHTML =
          subtext.length > 0 ? subtext : "Inconnu";
        details.hidden = false;
      }, transitionDuration + 100);
    },

    // Hide description popup
    unfocusDiscovery() {
      const details = document.getElementById("popup-content");
      const elem = document.getElementById("popup");

      details.hidden = true;
      elem.classList.remove("activated");
    },

    // Re-center on user location
    recenterView() {
      const mapView = this.mainMap.getView();

      mapView.animate({
        center: UserData.getLocation(),
        duration: 200,
        zoom: Math.max(mapView.getZoom(), 14.25),
        easing: easeOut,
      });
    },
  },
};
</script>

<style scoped>
@import url("@/theme/Map.css");
</style>

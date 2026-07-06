<template style="contain: layout">
  <div id="map" class="map">
    <!-- Map container -->
  </div>

  <ion-alert
    class="map-alert"
    :is-open="isAlertOpen"
    header="Activer la localisation pour rechercher les œuvres à proximité"
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
        @click="
          this.recenterView();
          this.updateClosestDiscoveries();
        "
        id="recenter-button"
        :class="{
          'map-button': true,
          userLocationInViewport: isUserLocationInViewport,
          userLocationOutsideViewport: isUserLocationOutsideViewport,
        }"
        :fill="
          isUserLocationInViewport || isUserLocationOutsideViewport
            ? 'outline'
            : 'solid'
        "
      >
        <ion-icon
          :icon="
            isUserLocationOutsideViewport
              ? customLocationIconPurple
              : customLocationIconBlack
          "
        ></ion-icon
        >RECENTRER LA CARTE
      </ion-button>
    </div>

    <ion-accordion value="ionaccordion" toggle-icon-slot="none">
      <!-- TODO Move recenter button with accordion and update when position changed -->
      <!-- TODO Put between 5 and 12 discoveries depending on discoveries in viewport and add number of discoveries in header?? (to confirm with team to understand what to do) -->
      <!-- TODO Check if discoveries match with user location when it changes -->
      <ion-item slot="header">
        <ion-label>Découvertes à proximité: </ion-label>
        <span class="custom-chevron" :class="{ open: ionAccordionOpen }">
          <ion-icon :icon="chevronUpOutline"></ion-icon>
        </span>
      </ion-item>
      <div slot="content" style="height: 20vh; width: 100vw">
        <ion-list :inset="false" lines="none">
          <ion-item
            v-for="discovery of closestDiscoveriesDistance"
            :key="discovery"
            @click="focusDiscovery(discovery)"
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
                <!-- Discovery pin icon (canvas-rendered, matches Annuaire style) -->
                <img
                  v-if="closestDiscoveryPinUrls[`${discovery.dType}:${discovery.id}`]"
                  id="closestDiscoveryPinIcon"
                  :src="closestDiscoveryPinUrls[`${discovery.dType}:${discovery.id}`]"
                  alt=""
                />
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
    @willDismiss="this.unfocusDiscovery"
    :breakpoints="[0, .9]"
    :initial-breakpoint=".9"
    :show-backdrop="false"
  >
      <discovery-details
        :selected-discovery="currentSelectedDiscovery"
        @close-discovery-details="discoveryDetailsModalOpen = false"
        @view-full-details="
          openDiscoveryDetailsFullModale(currentSelectedDiscovery)
        "
      />
  </ion-modal>
  <!-- Selected pin discovery details modal -->

  <!-- Selected discovery full details modal -->
  <ion-modal
    id="discoveryDetailsFullModal"
    :is-open="discoveryDetailsFullModalOpen"
    @didDismiss="discoveryDetailsFullModalOpen = false"
    :breakpoints="[0, 1]"
    :initial-breakpoint="1"
    :show-backdrop="true"
  >
      <discovery-details-full-modale
        :selected-discovery="listSelectedDiscovery"
        @close-discovery-details-full-modale="
          discoveryDetailsFullModalOpen = false
        "
      />
  </ion-modal>
  <!-- Selected discovery full details modal -->
</template>

<script>
import "ol/ol.css";
import { arrowForward as arrowRightIcon, chevronUpOutline } from "ionicons/icons";
import {
  IonButton,
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
import MultiPolygon from "ol/geom/MultiPolygon";
import Feature from "ol/Feature";
import { OSM } from "ol/source";
import { defaults as defaultControls } from "ol/control";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { easeOut } from "ol/easing";
import { eventBus } from "@/internal/eventBus";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
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
import { containsCoordinate, getHeight } from "ol/extent.js";
import { unByKey } from "ol/Observable.js";
import { Geolocation } from "@capacitor/geolocation";
import { LocationService } from "@/internal/LocationService";
import { isPlatform } from "@ionic/vue";
import { App } from "@capacitor/app";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Distance } from "@/internal/Distance";
import DiscoveryDetails from "@/components/DiscoveryDetails.vue";
import DiscoveryDetailsFullModale from "@/components/DiscoveryDetailsFullModale.vue";

import {
  getPinColors,
  buildDiscoveryKey,
  createDefaultPinCanvas,
  createCircularPhotoPinCanvas,
  createTargetedPinCanvas,
  CANVAS_RENDER_SCALE,
  getCategoryIconName,
  truncatePinTitle,
  getStaticDiscoveryPinDataUrl,
} from "@/internal/PinUtils";

// Use cached objects/methods to save on rendering time
const collectedPhotoImgCache = {}; // "type:id" -> HTMLImageElement
const collectedPhotoPinCache = {}; // "type:id:size" -> canvas
const targetedPinCache = {}; // "type:title:size" -> canvas
const defaultPinCache = {}; // "type:size" -> canvas

// --- Pin colors per discovery type ---
function getDiscoveryLocation(discovery) {
  if (!discovery) return null;

  const location =
    discovery.location ??
    (typeof discovery.getLocation === "function"
      ? discovery.getLocation()
      : null);

  if (
    !location ||
    typeof location.lng !== "number" ||
    typeof location.lat !== "number"
  ) {
    return null;
  }

  return location;
}

function getDiscoveryPolygon(discovery) {
  if (!discovery) return null;

  const polygon =
    discovery.geoAreaPolygon ??
    (typeof discovery.getGeoAreaPolygon === "function"
      ? discovery.getGeoAreaPolygon()
      : null);

  if (
    !polygon ||
    polygon.type !== "MultiPolygon" ||
    !Array.isArray(polygon.coordinates) ||
    polygon.coordinates.length === 0
  ) {
    return null;
  }

  return polygon;
}

function insertAllPins(
  destinationLayer,
  discoveryList,
  polygonKeys = new Set(),
) {
  for (const discovery of discoveryList) {
    const key = buildDiscoveryKey(discovery.dType, discovery.id);
    const hasPolygon = polygonKeys.has(key);

    const location = getDiscoveryLocation(discovery);
    if (!location) continue;

    const feature = new Feature({
      geometry: new Point([location.lng, location.lat]),
      id: discovery.id,
      dType: discovery.dType,
      hasPolygon,
      title: typeof discovery.getTitle === "function" ? discovery.getTitle() : "",
      categoryIcon: getCategoryIconName(discovery),
    });
    destinationLayer.getSource().addFeature(feature);
  }
}

function insertAllPolygons(destinationLayer, discoveryList) {
  const polygonKeys = new Set();

  for (const discovery of discoveryList) {
    const polygon = getDiscoveryPolygon(discovery);
    if (!polygon) continue;

    try {
      const feature = new Feature({
        geometry: new MultiPolygon(polygon.coordinates),
        id: discovery.id,
        dType: discovery.dType,
      });
      destinationLayer.getSource().addFeature(feature);
      polygonKeys.add(buildDiscoveryKey(discovery.dType, discovery.id));
    } catch (error) {
      console.warn(
        `[MapContainer] Failed to render polygon for ${discovery.dType}#${discovery.id}`,
        error,
      );
    }
  }

  return polygonKeys;
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
    DiscoveryDetailsFullModale,
    DiscoveryDetails,
    IonModal,
    IonLabel,
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
    let discoveryLocation = null;

    // If URL has discovery (because clicked on it from its description card), focus on it
    if (this.$route.query.type && this.$route.query.id) {
      discovery = Utils.getDiscovery(
        parseInt(this.$route.query.id),
        this.$route.query.type,
      );
      discoveryLocation = getDiscoveryLocation(discovery);
      setTimeout(() => this.focusDiscovery(discovery), 100);
    }

    return {
      ionAccordionOpen: true,
      listSelectedDiscovery: null,
      discoveryDetailsFullModalOpen: false,
      currentSelectedDiscovery: null,
      discoveryDetailsModalOpen: false,
      isPermissionDenied: true,
      userLocationLayer: null,
      locationAccuracyLayer: null,
      userPointFeature: null,
      locationUpdateInterval: null,
      locationUnsubscribe: null, // Function to unsubscribe from location updates
      mapPinsLayer: null,
      mapPolygonsLayer: null,
      lat2: UserData.getLocation(false)[1],
      lng2: UserData.getLocation(false)[0],
      closestDiscoveriesDistance: [],
      closestDiscoveryPinUrls: {}, // "dType:id" -> data URL of static pin
      formerSelectedPinFeature: null,
      formerSelectedPolygonFeature: null,
      isUserLocationInViewport: false,
      isUserLocationOutsideViewport: false,
      mainMap: null,
      INITIAL_COORDS: discoveryLocation
        ? [discoveryLocation.lng, discoveryLocation.lat]
        : UserData.getLocation(false),
      // if location is not available, use the initial coordinates = [-68.2075, 52.8131]
      DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14, // If the map was opened by the DOD page we want to zoom more
      polygonVisibilityZoomThreshold: 12, // Zoom level above which discovery polygonal areas appear on the map
      vectorRenderBuffer: 512,
      // if location is not available, use the default zoom level = 4.5
      TILE_LAYER: layer,
      arrowRightIcon,
      chevronUpOutline,
      customLocationIconBlack,
      customLocationIconPurple,
      isAlertOpen: false,
      viewResolutionListenerKey: null,
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
        if (
          this.$route.query.type &&
          this.$route.query.id &&
          this.$route.path !== "/discovery-review/"
        ) {
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

  beforeMount() {
    this.updateClosestDiscoveries();
  },

  unmounted() {
    if (this._onTargetedChanged) {
      eventBus.off("targeted-changed", this._onTargetedChanged);
    }
  },

  async mounted() {
    // Listen for target changes
    this._onTargetedChanged = () => {
      if (this.mapPinsLayer) {
        this.mapPinsLayer.changed(); // Force map to re-render pins so target style reacts immediately
      }
    };
    eventBus.on("targeted-changed", this._onTargetedChanged);

    this._onCollectedChanged = async () => {
      Object.keys(collectedPhotoImgCache).forEach((key) => {
        delete collectedPhotoImgCache[key];
      });
      Object.keys(collectedPhotoPinCache).forEach((key) => {
        delete collectedPhotoPinCache[key];
      });
      await this.loadCollectedPhotosForPins();
    };
    eventBus.on("collected-changed", this._onCollectedChanged);
    // Foreground app state change listener
    // After user go back to the app from app settings, check if the location permission is granted
    await App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        const geoCheckPermission = await Geolocation.checkPermissions();
        this.isPermissionDenied = geoCheckPermission.location === "denied";

        if (!this.isPermissionDenied) {
          this.showLocation();
          // Restart location service if needed
          if (!LocationService.isWatching()) {
            await this.startLocationService();
          }
        }
      }
    });
    // If the permission is granted, this.askForPermissions() will not ask for permission again
    await this.askForPermissions();
    this.myMap();

    // Start location service
    await this.startLocationService();

    // Update closest discoveries every 2 minutes
    this.discoveryUpdateInterval = setInterval(() => {
      this.updateClosestDiscoveries();
    }, 120000); // 120000 ms = 2 minutes
  },

  methods: {

    openDiscoveryDetailsFullModale(discovery) {
      this.discoveryDetailsFullModalOpen = true;
      this.listSelectedDiscovery = discovery;
      // Timeout to make it look smoother
      setTimeout(() => {
        this.discoveryDetailsModalOpen = false;
      }, 100);
    },

    updateClosestDiscoveries() {
      // For distance between discoveries and user location
      this.lat2 = UserData.getLocation(true)[1];
      this.lng2 = UserData.getLocation(true)[0];

      UserData.sortByDistance();
      this.closestDiscoveriesDistance = UserData.getSortedDiscoveriesDistance(
        0,
        12,
      );

      // Build/refresh static pin data URLs for the proximity list
      const nextUrls = {};
      const promises = [];
      for (const discovery of this.closestDiscoveriesDistance) {
        const key = buildDiscoveryKey(discovery.dType, discovery.id);
        if (this.closestDiscoveryPinUrls[key]) {
          nextUrls[key] = this.closestDiscoveryPinUrls[key];
          continue;
        }
        promises.push(
          getStaticDiscoveryPinDataUrl(discovery).then((url) => {
            nextUrls[key] = url;
          }),
        );
      }
      this.closestDiscoveryPinUrls = nextUrls;
      if (promises.length) {
        Promise.all(promises).then(() => {
          this.closestDiscoveryPinUrls = { ...nextUrls };
        });
      }
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
          maxZoom: 30,
          minZoom: 3,

          // Disable rotation on map
          enableRotation: false,
        }),

        layers: [this.TILE_LAYER],
      });

      this.mainMap.on("click", this.handleMapClick);
      this.mainMap.on("moveend", this.setCenterButtonAppearance);

      const view = this.mainMap.getView();
      this.viewResolutionListenerKey = view.on(
        "change:resolution",
        () => {
          this.updateDiscoveryLayerVisibility();
        },
      );

      // Need to put an if statement here. If not, the blue circle will show up even if the user has denied the location permission
      if (!this.isPermissionDenied) this.showLocation();
      this.showPins();
      this.updateDiscoveryLayerVisibility();
    },

    setCenterButtonAppearance() {
      // Reducing decimals to make '===' possible because UserData.getLocation and this.mainMap.getView.getCenter return different numbers of decimals
      const userLocationX = UserData.getLocation(false)[0].toFixed(7);
      const userLocationY = UserData.getLocation(false)[1].toFixed(7);
      const viewCenterX = this.mainMap.getView().getCenter()[0].toFixed(7);
      const viewCenterY = this.mainMap.getView().getCenter()[1].toFixed(7);

      // (Extent of viewport on map represented by [smallest viewport x, smallest viewport y, biggest viewport x, biggest viewport y])
      const viewportExtent = this.mainMap
        .getView()
        .calculateExtent(this.mainMap.getSize());

      // userLocationOutsideViewport button
      // User location out of viewport
      if (!containsCoordinate(viewportExtent, UserData.getLocation(false))) {
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
      if (this.mapPolygonsLayer) {
        this.mainMap.removeLayer(this.mapPolygonsLayer);
      }
      if (this.mapPinsLayer) {
        this.mainMap.removeLayer(this.mapPinsLayer);
      }

      const polygonLayer = new VectorLayer({
        source: new VectorSource(),
        style: this.polygonStyleFunction,
        zIndex: 250,
        renderBuffer: this.vectorRenderBuffer,
        updateWhileInteracting: true,
        updateWhileAnimating: true,
      });

      const pinsLayer = new VectorLayer({
        source: new VectorSource(),
        style: this.pinStyleFunction, // style that features (pins) will take
        zIndex: 300, // Set to a value between location accuracy radius (100) and user location pin (1000)
        renderBuffer: this.vectorRenderBuffer,
        updateWhileInteracting: false,
        updateWhileAnimating: false,
      });

      this.mapPolygonsLayer = polygonLayer;
      this.mapPinsLayer = pinsLayer;

      const baseDiscoveries =
        discoveries.length > 0
          ? discoveries
          : UserData.getSortedDiscoveriesAZ();

      const polygonKeys = insertAllPolygons(
        polygonLayer,
        baseDiscoveries,
      );
      insertAllPins(pinsLayer, baseDiscoveries, polygonKeys);

      this.mainMap.addLayer(polygonLayer);
      this.mainMap.addLayer(pinsLayer);
      this.updateDiscoveryLayerVisibility();

      // Async-load user photos for collected pins
      this.loadCollectedPhotosForPins();
    },

    async loadCollectedPhotosForPins() {
      if (!this.mapPinsLayer) return;

      const features = this.mapPinsLayer.getSource().getFeatures();
      const collectedFeatures = [];

      for (const feature of features) {
        const id = feature.get("id");
        const type = feature.get("dType");
        if (UserData.isCollected(id, type)) {
          collectedFeatures.push(feature);
        }
      }

      for (const feature of collectedFeatures) {
        const id = feature.get("id");
        const type = feature.get("dType");
        const key = buildDiscoveryKey(type, id);

        if (collectedPhotoImgCache[key]) continue;

        try {
          const review = UserData.getCollected(id, type);
          if (!review || !review.filename) {
            continue;
          }

          let file;
          try {
            file = await Filesystem.readFile({
              path: "thumbnail/" + review.filename,
              directory: Directory.Data,
            });
          } catch {
            file = await Filesystem.readFile({
              path: "img/" + review.filename,
              directory: Directory.Data,
            });
          }

          let url;
          if (file.data instanceof Blob) {
            url = URL.createObjectURL(file.data);
          } else {
            const ext = review.filename.split(".").at(-1) || "jpeg";
            const res = await fetch(`data:image/${ext};base64,${file.data}`);
            const blob = await res.blob();
            url = URL.createObjectURL(blob);
          }

          // Convert blob URL to HTMLImageElement for canvas rendering
          const img = await new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = url;
          });

          if (img) {
            collectedPhotoImgCache[key] = img;
          }
        } catch (err) {
          // Photo load failed, will use fallback pin
        }
      }

      // Force re-render of all collected features
      for (const f of collectedFeatures) {
        f.changed();
      }
      if (this.mapPinsLayer) {
        this.mapPinsLayer.changed();
      }
    },

    updateDiscoveryLayerVisibility() {
      if (!this.mainMap) return;

      const zoom = this.mainMap.getView().getZoom();
      const showPolygons =
        typeof zoom === "number" &&
        zoom >= this.polygonVisibilityZoomThreshold;

      if (this.mapPolygonsLayer) {
        this.mapPolygonsLayer.setVisible(!!showPolygons);
        this.mapPolygonsLayer.changed();
      }

      if (this.mapPinsLayer) {
        this.mapPinsLayer.setVisible(true);
        this.mapPinsLayer.changed();
      }
    },

    // Taken from Utils.ts
    pinStyleFunction(feature, explicitIsSelected) {
      const id = feature.get("id");
      const type = feature.get("dType");
      const title = feature.get("title");

      const isSelected = explicitIsSelected === true || (this.currentSelectedDiscovery?.id === id && this.currentSelectedDiscovery?.dType === type) || false;
      const isAnyPinSelected = !!this.currentSelectedDiscovery;
      const pinOpacity = (isAnyPinSelected && !isSelected) ? 0.45 : 1;

      const status = this.resolveDiscoveryStatus(id, type);
      const zoomLevel = this.mainMap.getView().getZoom();
      const colors = getPinColors(type);

      // Determine sizes based on zoom level:
      let canvasSize, circleRadius, pinScale;
      if (zoomLevel < 13.5) {
        canvasSize = 18; circleRadius = 8; pinScale = 0.7;
      } else if (zoomLevel < 14.5) {
        canvasSize = 30; circleRadius = 16; pinScale = 1.15;
      } else if (zoomLevel < 15.5) {
        canvasSize = 44; circleRadius = 24; pinScale = 1.7;
      } else if (zoomLevel < 16.5) {
        canvasSize = 52; circleRadius = 32; pinScale = 2.0;
      } else {
        canvasSize = 64; circleRadius = 40; pinScale = 2.4;
      }

      // --- Collected: circular photo pin ---
      if (status === "collected") {
        const cacheKey = buildDiscoveryKey(type, id);
        const cachedImg = collectedPhotoImgCache[cacheKey];

        if (cachedImg && cachedImg instanceof HTMLImageElement) {
          const canvasCacheKey = `${cacheKey}:${canvasSize}:${isSelected}`;

          let canvas = collectedPhotoPinCache[canvasCacheKey];
          if (!canvas) {
            canvas = createCircularPhotoPinCanvas(cachedImg, type, canvasSize, isSelected);
            collectedPhotoPinCache[canvasCacheKey] = canvas;
          }

          return [
            new Style({
              image: new Icon({
                anchor: [0.5, 1],
                img: canvas,
                imgSize: [canvas.width, canvas.height],
                scale: 1 / CANVAS_RENDER_SCALE,
                opacity: pinOpacity,
              }),
              zIndex: isSelected ? 500 : 400,
            }),
          ];
        }

        // Fallback: photo not loaded — show colored circle
        return [
          new Style({
            image: new CircleStyle({
              radius: circleRadius,
              fill: new Fill({ color: colors.fillStart }),
              stroke: new Stroke({ color: colors.border, width: 3 }),
            }),
            zIndex: isSelected ? 500 : 400,
          }),
        ];
      }

      // --- Targeted: pill with bookmark icon + title + pointer ---
      if (status === "targeted") {
        const displayTitle = truncatePinTitle(title);
        const targetedCacheKey = `${type}:${displayTitle}:${isSelected}`;

        let canvas = targetedPinCache[targetedCacheKey];
        if (!canvas) {
          canvas = createTargetedPinCanvas(title, colors, isSelected);
          targetedPinCache[targetedCacheKey] = canvas;
        }

        return [
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              img: canvas,
              imgSize: [canvas.width, canvas.height],
              scale: pinScale / CANVAS_RENDER_SCALE,
              opacity: pinOpacity,
            }),
            zIndex: isSelected ? 500 : 350,
          }),
        ];
      }

      // --- Default: teardrop pin with icon ---
      const categoryIcon = feature.get("categoryIcon") || "default";
      const defaultCacheKey = `${type}:${categoryIcon}:${isSelected}`;
      let canvas = defaultPinCache[defaultCacheKey];
      if (!canvas) {
        canvas = createDefaultPinCanvas(type, categoryIcon, isSelected);
        defaultPinCache[defaultCacheKey] = canvas;
      }

      return [
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            scale: pinScale / CANVAS_RENDER_SCALE,
            opacity: pinOpacity,
          }),
          zIndex: isSelected ? 500 : 300,
        }),
      ];
    },

    polygonStyleFunction(feature) {
      const id = feature.get("id");
      const type = feature.get("dType");
      const status = this.resolveDiscoveryStatus(id, type);

      const strokeColors = {
        default: "#f9a186",
        targeted: "#f4a259",
        collected: "#f26e5e",
      };

      const fillColors = {
        default: "rgba(249, 161, 134, 0.28)",
        targeted: "rgba(244, 162, 89, 0.28)",
        collected: "rgba(242, 110, 94, 0.35)",
      };

      return [
        new Style({
          stroke: new Stroke({
            color: strokeColors[status] ?? strokeColors.default,
            width: status === "collected" ? 2.8 : 2.2,
          }),
          fill: new Fill({
            color: fillColors[status] ?? fillColors.default,
          }),
          zIndex: 260,
        }),
      ];
    },

    resolveDiscoveryStatus(id, type) {
      if (UserData.isCollected(id, type)) return "collected";
      if (UserData.isTargeted(id, type)) return "targeted";
      return "default";
    },

    // Makes selected discovery pin bigger, makes it red, makes it appear on top of the other pins,
    // and re-establishes former selected pin's size
    highlightSelectedDiscoveryPin(selectedDiscovery) {
      const hasPolygon =
        getDiscoveryPolygon(selectedDiscovery) && this.mapPolygonsLayer;

      if (hasPolygon) {
        this.highlightSelectedDiscoveryPolygon(selectedDiscovery);
      } else if (this.formerSelectedPolygonFeature && this.mapPolygonsLayer) {
        this.formerSelectedPolygonFeature.setStyle(
          this.mapPolygonsLayer.getStyle(),
        );
        this.formerSelectedPolygonFeature = null;
      }
    },

    highlightSelectedDiscoveryPolygon(selectedDiscovery) {
      if (!this.mapPolygonsLayer) return;

      const polygonFeature = this.getPolygonFeatureForDiscovery(
        selectedDiscovery,
      );
      if (!polygonFeature) return;

      if (
        this.formerSelectedPolygonFeature &&
        this.formerSelectedPolygonFeature !== polygonFeature
      ) {
        this.formerSelectedPolygonFeature.setStyle(
          this.mapPolygonsLayer.getStyle(),
        );
      }

      polygonFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#d74f3f",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(247, 140, 111, 0.5)",
          }),
          zIndex: 400,
        }),
      );

      this.formerSelectedPolygonFeature = polygonFeature;
    },

    getPolygonFeatureForDiscovery(discovery) {
      if (!this.mapPolygonsLayer) return null;

      const targetKey = buildDiscoveryKey(discovery.dType, discovery.id);
      const features = this.mapPolygonsLayer.getSource().getFeatures();

      return (
        features.find((feature) => {
          const featureKey = buildDiscoveryKey(
            feature.get("dType"),
            feature.get("id"),
          );
          return featureKey === targetKey;
        }) || null
      );
    },

    showLocation() {
      const MAX_ACCURACY_RADIUS = 200; // Maximum radius in meters

      // Remove existing layers if they exist
      if (this.locationAccuracyLayer) {
        this.mainMap.removeLayer(this.locationAccuracyLayer);
      }
      
      if (this.userLocationLayer) {
        this.mainMap.removeLayer(this.userLocationLayer);
      }

      // User location accuracy radius in meters (transparent blue circle)
      this.locationAccuracyLayer = new VectorLayer({
        source: new VectorSource(),
        style: [
          new Style({
            fill: new Fill({
              color: "rgba(72, 157, 255, 0.202945)",
            }),
          }),
        ],
        // Set low z-index to ensure it stays behind other pins. 
        //  (If, in the future, we implement area highlights - e.g. Mont Royal highlight instead of one single pin - 
        //   then set the highlight zIndex lower than this one.)
        zIndex: 100,
      });
      
      this.locationAccuracyLayer.getSource().addFeature(
        new Feature({
          geometry: circular(
            UserData.getLocation(false), 
            Math.min(UserData.getAccuracy(), MAX_ACCURACY_RADIUS) // Cap radius to avoid too big circle
          ),
        })
      );
      
      this.mainMap.addLayer(this.locationAccuracyLayer);

      // User location icon (blue opaque circle with white outline)
      this.userLocationLayer = new VectorLayer({
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
        zIndex: 1000, // Set high z-index to ensure it stays on top of all other pins
      });
      
      this.userPointFeature = new Feature({
        geometry: new Point(UserData.getLocation(false)),
      });
      
      this.userLocationLayer.getSource().addFeature(this.userPointFeature);
      this.mainMap.addLayer(this.userLocationLayer);

      // Subscribe to location updates instead of using setInterval
      if (this.locationUnsubscribe) {
        this.locationUnsubscribe(); // Clean up existing subscription
      }
      
      this.locationUnsubscribe = LocationService.subscribe((position) => {
        if (this.userPointFeature && this.locationAccuracyLayer) {
          const coords = [position.lng, position.lat];
          this.userPointFeature.getGeometry().setCoordinates(coords);
          
          const accuracyFeature = this.locationAccuracyLayer.getSource().getFeatures()[0];
          if (accuracyFeature) {
            accuracyFeature.setGeometry(
              circular(
                coords, 
                Math.min(position.accuracy, MAX_ACCURACY_RADIUS) // Cap radius to avoid too big circle
              )
            );
          }
          
          // Update the viewport state
          this.updateUserLocationViewportState();
          this.updateClosestDiscoveries();
        }
      });
    },

    beforeDestroy() {
      // Clean up location subscription
      if (this.locationUnsubscribe) {
        this.locationUnsubscribe();
      }
      
      // Stop location service
      LocationService.stopWatching();
      
      // Clean up interval when component is destroyed
      if (this.locationUpdateInterval) {
        clearInterval(this.locationUpdateInterval);
      }

      if (this.viewResolutionListenerKey) {
        unByKey(this.viewResolutionListenerKey);
        this.viewResolutionListenerKey = null;
      }
    },

    async startLocationService() {
      try {
        if (!this.isPermissionDenied) {
          await LocationService.startWatching();
        }
      } catch (error) {
        console.error('Failed to start location service:', error);
      }
    },

    updateUserLocationViewportState() {
      if (!this.userPointFeature || !this.mainMap) return;
      
      const userCoords = this.userPointFeature.getGeometry().getCoordinates();
      const mapView = this.mainMap.getView();
      const extent = mapView.calculateExtent(this.mainMap.getSize());
      
      const isInViewport = containsCoordinate(extent, userCoords);
      this.isUserLocationInViewport = isInViewport;
      this.isUserLocationOutsideViewport = !isInViewport;
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

        if (!discovery) return;

        // Update focus on feature closest to click
        this.focusDiscovery(discovery);

        // Did not click close to features
      } else {
        this.unfocusDiscovery();
      }
    },

    // Highlights discovery, centers on it, and opens its description modal
    focusDiscovery(discovery, map = this.mainMap) {
      if (!discovery || !map) return;

      const mapView = map.getView();
      const currentZoom = mapView.getZoom();

      // Open pin discovery details description modal
      this.currentSelectedDiscovery = discovery;
      this.discoveryDetailsModalOpen = true;

      // Highlight clicked discovery
      this.highlightSelectedDiscoveryPin(discovery);
      
      // Update opacity for the rest of the pins
      if (this.mapPinsLayer) {
        this.mapPinsLayer.changed();
      }

      const polygon = getDiscoveryPolygon(discovery);
      if (polygon && this.mapPolygonsLayer) {
        const polygonFeature = this.getPolygonFeatureForDiscovery(discovery);
        if (polygonFeature) {
          mapView.fit(polygonFeature.getGeometry().getExtent(), {
            duration: 100,
            padding: [100, 80, 320, 80],
            maxZoom: Math.max(currentZoom, 17),
            easing: easeOut,
          });
        }
      } else {
        const location = getDiscoveryLocation(discovery);
        if (location) {
          // Center map on the selected pin with animation
          mapView.setZoom(Math.max(currentZoom, 14.25));
          const extentHeight = getHeight(
            mapView.calculateExtent(map.getSize()),
          );
          mapView.setZoom(currentZoom);

          mapView.animate({
            // Center viewport a bit below the selected pin so that the pin is towards the top of viewport
            center: [location.lng, location.lat - 0.3 * extentHeight],
            duration: 100,
            zoom: Math.max(currentZoom, 14.25),
            easing: easeOut,
          });
        }
      }
    },

    // Re-center on user location
    recenterView() {
      if (!this.isPermissionDenied) {
        const mapView = this.mainMap.getView();
        
        // Get current location from LocationService or fallback to UserData
        const currentLocation = LocationService.getCurrentLocationArray() || UserData.getLocation(false);

        mapView.animate({
          center: currentLocation,
          duration: 100,
          zoom: Math.max(mapView.getZoom(), 14.25),
          easing: easeOut,
        });
      } else {
        this.setAlertOpen(true);
      }
    },

    // Close modal, make former selected pin back to normal scale if there was a selected pin before, and put formerSelectedPinFeature to null because there are no more selected pin
    async unfocusDiscovery() {
      this.currentSelectedDiscovery = null;
      this.discoveryDetailsModalOpen = false;

      if (this.mapPinsLayer) {
        this.mapPinsLayer.changed(); // Restore opacity and normal sizing for all pins
      }
      if (this.formerSelectedPolygonFeature && this.mapPolygonsLayer) {
        this.formerSelectedPolygonFeature.setStyle(
          this.mapPolygonsLayer.getStyle(),
        );
        this.formerSelectedPolygonFeature = null;
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

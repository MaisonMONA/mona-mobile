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
    :breakpoints="[0, .9]"
    :initial-breakpoint=".9"
    :show-backdrop="false"
  >
      <discovery-details
        :selected-discovery="currentSelectedDiscovery"
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
import MultiPolygon from "ol/geom/MultiPolygon";
import Feature from "ol/Feature";
import { OSM } from "ol/source";
import { defaults as defaultControls } from "ol/control";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { easeOut } from "ol/easing";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from "capacitor-native-settings";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
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

const buildDiscoveryKey = (dType, id) => `${dType}:${id}`;

// --- Pin colors per discovery type ---
// Reads CSS custom properties from :root (defined in GlobalStyle.css)
// fill = inner/darker, border = outer/paler
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getPinColors(type) {
  const map = {
    artwork: { fillStart: getCSSVar('--pin-artwork-fill-start'), fillEnd: getCSSVar('--pin-artwork-fill-end'), border: getCSSVar('--pin-artwork-border') },
    heritage: { fillStart: getCSSVar('--pin-heritage-fill-start'), fillEnd: getCSSVar('--pin-heritage-fill-end'), border: getCSSVar('--pin-heritage-border') },
    place: { fillStart: getCSSVar('--pin-place-fill-start'), fillEnd: getCSSVar('--pin-place-fill-end'), border: getCSSVar('--pin-place-border') },
  };
  return map[type] ?? map.heritage;
}

// --- Icon preloading ---
const iconImages = {}; // name -> HTMLImageElement
const iconLoadPromises = {};

function preloadSvgIcon(name, path) {
  if (iconLoadPromises[name]) return iconLoadPromises[name];
  iconLoadPromises[name] = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { iconImages[name] = img; resolve(img); };
    img.onerror = () => { iconImages[name] = null; resolve(null); };
    img.src = path;
  });
  return iconLoadPromises[name];
}

function preloadAllPinIcons() {
  preloadSvgIcon("targeted", "./assets/drawable/icons/pins/targeted_bookmark.svg");
  preloadSvgIcon("default", "./assets/drawable/icons/pins/default.svg");
  preloadSvgIcon("art_public", "./assets/drawable/icons/pins/art_public.svg");
  preloadSvgIcon("murales", "./assets/drawable/icons/pins/murales.svg");
  preloadSvgIcon("sculptures", "./assets/drawable/icons/pins/sculptures2.svg");
  preloadSvgIcon("lieux_culturels", "./assets/drawable/icons/pins/lieux_culturels.svg");
  preloadSvgIcon("bibliotheques", "./assets/drawable/icons/pins/bibliotheques.svg");
  preloadSvgIcon("patrimoine", "./assets/drawable/icons/pins/patrimoine.svg");
}

/**
 * Maps a discovery's category/usage string to the corresponding preloaded icon name.
 * For artworks: uses getCategories() (e.g. "Art public", "Murale", "Sculpture")
 * For places: uses getUsages() (e.g. "Bibliothèque", "Maison de la culture")
 * For heritage: always "patrimoine"
 */
function getCategoryIconName(discovery) {
  if (!discovery) return "default";

  const dType = discovery.dType;

  if (dType === "heritage") return "patrimoine";

  // Get the first category/usage string
  let rawCategory = "";
  if (dType === "artwork" && typeof discovery.getCategories === "function") {
    rawCategory = discovery.getCategories("fr");
  } else if (dType === "place" && typeof discovery.getUsages === "function") {
    rawCategory = discovery.getUsages("fr");
  }

  // Take only the first value if comma-separated
  const first = rawCategory.split(",")[0].trim().toLowerCase();
  if (!first) {
    // No category found — use type-specific default icon
    if (dType === "artwork") return "art_public";
    if (dType === "place") return "lieux_culturels";
    return "default";
  }

  // Map to icon name
  if (first.includes("art public")) return "art_public";
  if (first.includes("murale")) return "murales";
  if (first.includes("sculpture")) return "sculptures";
  if (first.includes("biblioth")) return "bibliotheques";
  if (first.includes("lieu") || first.includes("maison de la culture") || first.includes("centre") || first.includes("galerie") || first.includes("mus")) return "lieux_culturels";
  if (first.includes("patrimoine")) return "patrimoine";

  // Unrecognized category — use type-specific default
  if (dType === "artwork") return "art_public";
  if (dType === "place") return "lieux_culturels";
  return "default";
}

// Start preloading immediately
preloadAllPinIcons();

// --- Collected photo pin caches ---
const collectedPhotoImgCache = {};
const collectedPhotoPinCache = {};

// --- Targeted pin cache ---
const targetedPinCache = {}; // "type:title:size" -> canvas

// --- Default pin cache ---
const defaultPinCache = {}; // "type:size" -> canvas

// Fixed render scale for crisp canvases on all screens (DPR-independent)
const CANVAS_RENDER_SCALE = 2;

function createCircularPhotoPinCanvas(img, type, size = 56) {
  const colors = getPinColors(type);
  const ringWidth = 2;
  const totalSize = size + ringWidth * 2;
  const pointerHeight = 10;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize * CANVAS_RENDER_SCALE;
  canvas.height = (totalSize + pointerHeight) * CANVAS_RENDER_SCALE;
  // Store logical size for OpenLayers imgSize
  canvas._logicalWidth = totalSize;
  canvas._logicalHeight = totalSize + pointerHeight;

  const ctx = canvas.getContext("2d");
  ctx.scale(CANVAS_RENDER_SCALE, CANVAS_RENDER_SCALE);

  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const photoRadius = size / 2;

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Gradient ring (single ring, no outer border)
  const ringGrad = ctx.createLinearGradient(cx, cy - (photoRadius + ringWidth), cx, cy + (photoRadius + ringWidth));
  ringGrad.addColorStop(0, colors.fillStart);
  ringGrad.addColorStop(1, colors.fillEnd);
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius + ringWidth, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Gradient pointer
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + photoRadius + ringWidth - 2);
  ctx.lineTo(cx, cy + photoRadius + ringWidth + pointerHeight - 2);
  ctx.lineTo(cx + 6, cy + photoRadius + ringWidth - 2);
  ctx.closePath();
  ctx.fillStyle = colors.fillEnd;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Clip circle and draw photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius, 0, Math.PI * 2);
  ctx.clip();

  const imgSize = Math.min(img.width, img.height);
  const sx = (img.width - imgSize) / 2;
  const sy = (img.height - imgSize) / 2;
  ctx.drawImage(img, sx, sy, imgSize, imgSize, cx - photoRadius, cy - photoRadius, size, size);
  ctx.restore();

  return canvas;
}

/**
 * Creates a targeted/bookmarked pin: rounded pill with bookmark icon + title + pointer at bottom.
 * Matches Figma design.
 */
function createTargetedPinCanvas(title, colors) {
  const paddingX = 10;
  const paddingY = 6;
  const iconSize = 12;
  const iconGap = 5;
  const fontSize = 12;
  const pointerHeight = 8;
  const borderRadius = 14;

  // Measure text
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = `700 ${fontSize}px Arial`;
  const displayTitle = truncatePinTitle(title);
  const textWidth = measureCtx.measureText(displayTitle).width;

  const pillWidth = paddingX + iconSize + iconGap + textWidth + paddingX;
  const pillHeight = paddingY * 2 + fontSize + 2;
  const totalWidth = pillWidth;
  const totalHeight = pillHeight + pointerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = totalWidth * CANVAS_RENDER_SCALE;
  canvas.height = totalHeight * CANVAS_RENDER_SCALE;
  canvas._logicalWidth = totalWidth;
  canvas._logicalHeight = totalHeight;

  const ctx = canvas.getContext("2d");
  ctx.scale(CANVAS_RENDER_SCALE, CANVAS_RENDER_SCALE);

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;

  // Pill gradient (vertical)
  const pillGrad = ctx.createLinearGradient(0, 0, 0, pillHeight);
  pillGrad.addColorStop(0, colors.fillStart);
  pillGrad.addColorStop(1, colors.fillEnd);

  // Rounded pill
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(pillWidth - borderRadius, 0);
  ctx.quadraticCurveTo(pillWidth, 0, pillWidth, borderRadius);
  ctx.lineTo(pillWidth, pillHeight - borderRadius);
  ctx.quadraticCurveTo(pillWidth, pillHeight, pillWidth - borderRadius, pillHeight);
  ctx.lineTo(borderRadius, pillHeight);
  ctx.quadraticCurveTo(0, pillHeight, 0, pillHeight - borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.quadraticCurveTo(0, 0, borderRadius, 0);
  ctx.closePath();
  ctx.fillStyle = pillGrad;
  ctx.fill();

  // Pointer (use gradient end color)
  const cx = totalWidth / 2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, pillHeight - 1);
  ctx.lineTo(cx, pillHeight + pointerHeight - 1);
  ctx.lineTo(cx + 6, pillHeight - 1);
  ctx.closePath();
  ctx.fillStyle = colors.fillEnd;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Draw bookmark icon
  const bookmarkIcon = iconImages["targeted"];
  if (bookmarkIcon) {
    const iconY = (pillHeight - iconSize) / 2;
    ctx.drawImage(bookmarkIcon, paddingX, iconY, iconSize, iconSize * (18 / 13));
  }

  // Draw title text
  ctx.font = `700 ${fontSize}px Arial`;
  ctx.fillStyle = "#1F1F1F";
  ctx.textBaseline = "middle";
  ctx.fillText(displayTitle, paddingX + iconSize + iconGap, pillHeight / 2 + 1);

  return canvas;
}

/**
 * Creates a default pin: teardrop/balloon shape with an icon inside.
 * Matches Figma design.
 */
function createDefaultPinCanvas(type, categoryIcon = "default") {
  const colors = getPinColors(type);
  const borderWidth = 1;
  const innerRadius = 12;
  const outerRadius = innerRadius + borderWidth;
  const pointerHeight = 10;
  const totalSize = (outerRadius + 2) * 2; // +2 for shadow margin
  const totalHeight = totalSize + pointerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize * CANVAS_RENDER_SCALE;
  canvas.height = totalHeight * CANVAS_RENDER_SCALE;
  canvas._logicalWidth = totalSize;
  canvas._logicalHeight = totalHeight;

  const ctx = canvas.getContext("2d");
  ctx.scale(CANVAS_RENDER_SCALE, CANVAS_RENDER_SCALE);

  const cx = totalSize / 2;
  const cy = outerRadius + 1;

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;

  // Outer pale border circle
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = colors.border;
  ctx.fill();

  // Outer pale pointer
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + outerRadius - 2);
  ctx.lineTo(cx, cy + outerRadius + pointerHeight - 2);
  ctx.lineTo(cx + 6, cy + outerRadius - 2);
  ctx.closePath();
  ctx.fillStyle = colors.border;
  ctx.fill();

  // Reset shadow for inner fill
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Inner darker fill circle (vertical gradient)
  const innerGrad = ctx.createLinearGradient(cx, cy - innerRadius, cx, cy + innerRadius);
  innerGrad.addColorStop(0, colors.fillStart);
  innerGrad.addColorStop(1, colors.fillEnd);
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // Inner darker pointer (use gradient end color)
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + innerRadius - 1);
  ctx.lineTo(cx, cy + innerRadius + pointerHeight - 4);
  ctx.lineTo(cx + 4, cy + innerRadius - 1);
  ctx.closePath();
  ctx.fillStyle = colors.fillEnd;
  ctx.fill();

  // Draw category icon inside the circle
  const icon = iconImages[categoryIcon] || iconImages["default"];
  if (icon) {
    const iconDrawSize = 13;
    ctx.drawImage(icon, cx - iconDrawSize / 2, cy - iconDrawSize / 2, iconDrawSize, iconDrawSize);
  }

  return canvas;
}

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

function truncatePinTitle(title) {
  const maxChars = 16;
  if (!title || typeof title !== "string") return "";
  return title.length > maxChars ? `${title.slice(0, maxChars)}...` : title;
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

  async mounted() {
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
      this.closestDiscoveriesDistance = UserData.getSortedDiscoveriesDistance(
        0,
        12,
      );
      // For distance between discoveries and user location
      this.lat2 = UserData.getLocation(true)[1];
      this.lng2 = UserData.getLocation(true)[0];
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

      this.mainMap.on("singleclick", this.handleMapClick);
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
    pinStyleFunction(feature) {
      const id = feature.get("id");
      const type = feature.get("dType");
      const title = feature.get("title");

      const status = this.resolveDiscoveryStatus(id, type);
      const zoomLevel = this.mainMap.getView().getZoom();
      const colors = getPinColors(type);

      // --- Collected: circular photo pin ---
      if (status === "collected") {
        const cacheKey = buildDiscoveryKey(type, id);
        const cachedImg = collectedPhotoImgCache[cacheKey];

        if (cachedImg && cachedImg instanceof HTMLImageElement) {
          const canvasSize =
            zoomLevel < 14 ? 18 : zoomLevel <= 15 ? 22 : 26;
          const canvasCacheKey = `${cacheKey}:${canvasSize}`;

          let canvas = collectedPhotoPinCache[canvasCacheKey];
          if (!canvas) {
            canvas = createCircularPhotoPinCanvas(cachedImg, type, canvasSize);
            collectedPhotoPinCache[canvasCacheKey] = canvas;
          }

          return [
            new Style({
              image: new Icon({
                anchor: [0.5, 1],
                img: canvas,
                imgSize: [canvas.width, canvas.height],
                scale: 1 / CANVAS_RENDER_SCALE,
              }),
              zIndex: 400,
            }),
          ];
        }

        // Fallback: photo not loaded — show colored circle
        const circleRadius = zoomLevel < 14 ? 8 : zoomLevel <= 15 ? 12 : 16;
        return [
          new Style({
            image: new CircleStyle({
              radius: circleRadius,
              fill: new Fill({ color: colors.fillStart }),
              stroke: new Stroke({ color: colors.border, width: 3 }),
            }),
            zIndex: 400,
          }),
        ];
      }

      // --- Targeted: pill with bookmark icon + title + pointer ---
      if (status === "targeted") {
        const displayTitle = truncatePinTitle(title);
        const targetedCacheKey = `${type}:${displayTitle}`;

        let canvas = targetedPinCache[targetedCacheKey];
        if (!canvas) {
          canvas = createTargetedPinCanvas(title, colors);
          targetedPinCache[targetedCacheKey] = canvas;
        }

        const pinScale = zoomLevel < 14 ? 0.7 : zoomLevel <= 15 ? 0.85 : 1;
        return [
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              img: canvas,
              imgSize: [canvas.width, canvas.height],
              scale: pinScale / CANVAS_RENDER_SCALE,
            }),
            zIndex: 350,
          }),
        ];
      }

      // --- Default: teardrop pin with icon ---
      const categoryIcon = feature.get("categoryIcon") || "default";
      const defaultCacheKey = `${type}:${categoryIcon}`;
      let canvas = defaultPinCache[defaultCacheKey];
      if (!canvas) {
        canvas = createDefaultPinCanvas(type, categoryIcon);
        defaultPinCache[defaultCacheKey] = canvas;
      }

      const defaultScale = zoomLevel < 14 ? 0.7 : zoomLevel <= 15 ? 0.85 : 1;
      return [
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            scale: defaultScale / CANVAS_RENDER_SCALE,
          }),
          zIndex: 300,
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

      if (!this.mapPinsLayer) return;

      // if there was a selected pin before, make former selected pin back to normal scale
      if (this.formerSelectedPinFeature) {
        this.formerSelectedPinFeature.setStyle(this.mapPinsLayer.getStyle());
      }

      const location = getDiscoveryLocation(selectedDiscovery);
      if (!location) return;

      // Setting new style for selected pin
      // Get feature on the map that corresponds to selected pin
      const selectedFeature = this.mapPinsLayer
        .getSource()
        .getClosestFeatureToCoordinate([location.lng, location.lat]);

      if (!selectedFeature) return;

      const selectedPinStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `./assets/drawable/pins/selected_pin.svg`,
          scale: 0.83, // Augment selected pin size
        }),
        zIndex: 500, // Ensures selected discovery pin appears on top of other discovery pins
      });
      selectedFeature.setStyle(selectedPinStyle);

      this.formerSelectedPinFeature = selectedFeature; // assign currently selected pin as former selected pin
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

      // Highlight clicked discovery
      this.highlightSelectedDiscoveryPin(discovery);

      const polygon = getDiscoveryPolygon(discovery);
      if (polygon && this.mapPolygonsLayer) {
        const polygonFeature = this.getPolygonFeatureForDiscovery(discovery);
        if (polygonFeature) {
          mapView.fit(polygonFeature.getGeometry().getExtent(), {
            duration: 200,
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
            duration: 200,
            zoom: Math.max(currentZoom, 14.25),
            easing: easeOut,
          });
        }
      }

      // Open pin discovery details description modal
      this.currentSelectedDiscovery = discovery;
      this.discoveryDetailsModalOpen = true;
    },

    // Re-center on user location
    recenterView() {
      if (!this.isPermissionDenied) {
        const mapView = this.mainMap.getView();
        
        // Get current location from LocationService or fallback to UserData
        const currentLocation = LocationService.getCurrentLocationArray() || UserData.getLocation(false);

        mapView.animate({
          center: currentLocation,
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
      if (this.formerSelectedPinFeature && this.mapPinsLayer) {
        await this.formerSelectedPinFeature.setStyle(
          this.mapPinsLayer.getStyle(),
        );
        this.formerSelectedPinFeature = null;
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

<template>

    <div class="page-header">
        <p>Découverte<br>du jour</p>
        <ion-icon id="headerIcon" :icon="imageOutline"></ion-icon>
    </div>

    <div class="page-body-background">
        <div class="page-body">
            <!-- IF THE DISCOVERY IS AN ARTWORK -->
            <div v-if="type === DiscoveryTypes.ARTWORK">
                <p id="dTitle">{{ discovery.getTitle() }}</p>
                <span class="separatingBar"></span>
                <p id="dArtist" v-if="discovery.artists.length">{{ discovery.getArtists() }}</p>
                <p id="dCategory">{{ discovery.getCategories() }}</p>
            </div>

            <!-- ELSE IF IT'S A PLACE -->
            <div v-else-if="type === DiscoveryTypes.PLACE">
                <p id="dTitle">{{ discovery.getTitle() }}</p>
                <span class="separatingBar"></span>
                <p id="dUsages">{{ discovery.getUsages() }}</p>
                <p id="dBorough">{{ discovery.getBorough() }}</p>
            </div>

            <!-- ELSE (IT'S A HERITAGE) -->
            <div v-else>
                <p id="dTitle">{{ discovery.getTitle() }}</p>
                <span class="separatingBar"></span>
                <p id="dBorough">{{ discovery.getBorough() }}</p>
                <p id="dUsages">{{ discovery.getUsages() }}</p>
            </div>
        </div>

        <ion-button id="cameraButton" fill="outline">
            <ion-icon :icon="camera"></ion-icon>
        </ion-button>

        <ion-button id="infoButton" fill="outline" :router-link="`/discovery-details/${type}/${discovery.id}`" router-direction="forward">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
        </ion-button>
    </div>

    <div id="mapContainer" @click="activateMap([discovery.lng, discovery.lat])"></div>
</template>

<script>
/* Vue/Ionic imports */
import { camera, imageOutline, informationCircleOutline, pin } from 'ionicons/icons';
import { IonButton, IonIcon } from "@ionic/vue";

/* Imports for the map */
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import vLayers from "@/internal/PinsVectorLayer";
import { useGeographic } from "ol/proj";
import { Group as layerGroup } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM, Stamen } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

/* Imports for the discovery */
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { RNG } from "@/internal/RNG"
import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";

// Build seed as the integer represented by ddMMyyyy
const date = new Date();
const seed = date.getDate() * 1000000 + (date.getMonth() + 1) * 10000 + date.getFullYear();
const random = new RNG(seed);

const type = random.nextInRange(0, 2);  // Choose what type of discovery to show
console.log("type", type, "seed", seed);

let discovery;
switch (type) {
    case DiscoveryEnum.ARTWORK: {   // Choose in artworks
        discovery = ArtworkDatabase.getRandomItem(seed);
        console.log("artwork id:", discovery.id);
        break
    }
    case DiscoveryEnum.PLACE: {     // Choose in places
        discovery = PlaceDatabase.getRandomItem(seed);
        console.log("place id:", discovery.id);
        break
    }
    case DiscoveryEnum.HERITAGE: {  // Choose in heritages
        discovery = HeritageDatabase.getRandomItem(seed);
        console.log("heritage id:", discovery.id)
        break
    }
}

export default {
    name: "DiscoveryOfTheDayContainer",
    components: {
        IonIcon,
        IonButton,
    },

    setup() {
        return {
            camera, pin, imageOutline, informationCircleOutline,
        }
    },

    data() {
        return {
            discovery,
            type,
            DiscoveryTypes: DiscoveryEnum,
        }
    },

    mounted() {
        this.myMap();
    },

    methods: {
        myMap() {
            const INITIAL_COORD = [discovery.location.lng, discovery.location.lat];
            useGeographic();
            this.mainMap = new Map({
                // Hiding attribution (quite immoral isn't it?)
                controls: defaultControls({ attribution: false, zoom: false }),

                // Disabling interactions
                interactions: defaultInteractions({
                    dragPan: false,
                    pinchZoom: false,
                    mouseWheelZoom: false,
                    doubleClickZoom: false
                }),

                target: "mapContainer",
                view: new View({
                    center: INITIAL_COORD,
                    zoom: 17,
                    enableRotation: false,
                }),
            });

            if (UserData.getMapStyle() === "osm") {
                this.mainMap.setLayerGroup(new layerGroup({
                    layers: [new TileLayer({ source: new OSM() })]
                }))
            } else {
                this.mainMap.setLayerGroup(new layerGroup({
                    layers: [new TileLayer({ source: new Stamen({ layer: "toner-lite" }) })]
                }))
            }

            // Showing the pin
            if (type === DiscoveryEnum.ARTWORK) {
                this.mainMap.addLayer(vLayers.artworkDoD);
                const feature = new Feature(new Point(INITIAL_COORD));
                vLayers.artworkDoD.getSource().addFeature(feature);
            } else if (type === DiscoveryEnum.PLACE) {
                this.mainMap.addLayer(vLayers.placeDoD);
                const feature = new Feature(new Point(INITIAL_COORD));
                vLayers.placeDoD.getSource().addFeature(feature);
            } else {
                this.mainMap.addLayer(vLayers.heritageDoD);
                const feature = new Feature(new Point(INITIAL_COORD));
                vLayers.heritageDoD.getSource().addFeature(feature);
            }
        },

        activateMap() {
            const mapInstructions = {
                path: "/tabs/map/",
                query: {}
            };

            if (type === DiscoveryEnum.ARTWORK) {
                mapInstructions.query.artwork = discovery.id;
            } else if (type === DiscoveryEnum.PLACE) {
                mapInstructions.query.place = discovery.id;
            }  else {
                mapInstructions.query.heritage = discovery.id;
            }

            this.$router.push(mapInstructions);
        }
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryOfTheDay.css");
@import url("ol/ol.css");
</style>

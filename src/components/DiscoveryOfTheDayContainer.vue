<template>

    <div class="page-header">
        <p>Découverte<br>du jour</p>
        <ion-icon id="headerIcon" :icon="customCalendarIcon"></ion-icon>
    </div>

    <div class="page-body-background">
        <div class="page-body">
            <!-- IF THE DISCOVERY IS AN ARTWORK -->
            <div v-if="type === DiscoveryEnum.ARTWORK">
                <p id="discovery-title">{{ discovery.getTitle() }}</p>
                <span class="separating-bar"></span>
                <p id="discovery-artist" v-if="discovery.artists.length">{{ discovery.getArtists() }}</p>
                <p id="discovery-category">{{ discovery.getCategories() }}</p>
            </div>

            <!-- ELSE IF IT'S A PLACE -->
            <div v-else-if="type === DiscoveryEnum.PLACE">
                <p id="discovery-title">{{ discovery.getTitle() }}</p>
                <span class="separating-bar"></span>
                <p id="discovery-usages">{{ discovery.getUsages() }}</p>
                <p id="discovery-borough">{{ discovery.getBorough() }}</p>
            </div>

            <!-- ELSE (IT'S A HERITAGE) -->
            <div v-else>
                <p id="discovery-title">{{ discovery.getTitle() }}</p>
                <span class="separating-bar"></span>
                <p id="discovery-borough">{{ discovery.getBorough() }}</p>
                <p id="discovery-usages">{{ discovery.getUsages() }}</p>
            </div>

        <ion-button id="cameraButton" fill="outline" @click="takePicture">
            <ion-icon :icon="camera"></ion-icon>
        </ion-button>

        <ion-button id="infoButton" fill="outline" :router-link="`/discovery-details/${type}/${discovery.id}`" router-direction="forward">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
        </ion-button>
        </div>
    </div>

    <div id="mapContainer" @click="activateMap([discovery.lng, discovery.lat])"></div>
</template>


<script>
/* Vue/Ionic imports */
import { cameraOutline, informationCircleOutline, pin } from 'ionicons/icons';
import { IonButton, IonIcon, toastController } from "@ionic/vue";

/* Imports for the map */
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { useGeographic } from "ol/proj";
import { Group as layerGroup } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

/* Imports for the discovery */
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { RNG } from "@/internal/RNG"
import { DiscoveryEnum } from "@/internal/Types";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Utils from "@/internal/Utils";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { UserData } from "@/internal/databases/UserData";
import customCalendarIcon from "@/assets/drawable/icons/calendar.svg"

// Build seed as the integer represented by ddMMyyyy
const date = new Date();
const seed = date.getDate() * 1000000 + (date.getMonth() + 1) * 10000 + date.getFullYear();
const random = new RNG(seed);

const type = random.nextInRange(0, 2);  // Choose what type of discovery to show
console.log("type", type, "seed", seed);

let discovery;
let i = 0;
do {
    switch (type) {
        case DiscoveryEnum.ARTWORK: {   // Choose in artworks
            discovery = ArtworkDatabase.getRandomItem(seed + i);
            console.log("artwork id:", discovery.id);
            break
        }
        case DiscoveryEnum.PLACE: {     // Choose in places
            discovery = PlaceDatabase.getRandomItem(seed + i);
            console.log("place id:", discovery.id);
            break
        }
        case DiscoveryEnum.HERITAGE: {  // Choose in heritages
            discovery = HeritageDatabase.getRandomItem(seed + i);
            console.log("heritage id:", discovery.id)
            break
        }
    }

    i++;
} while (UserData.isCollected(discovery.id, discovery.dType)); // Make sure the discovery is not collected

export default {
    name: "DiscoveryOfTheDayContainer",
    components: {
        IonIcon,
        IonButton,
    },

    setup() {
        return {
            camera: cameraOutline, pin, informationCircleOutline, customCalendarIcon
        }
    },

    data() {
        return {
            discovery,
            type,
            DiscoveryEnum,
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

            this.mainMap.setLayerGroup(new layerGroup({
                layers: [new TileLayer({ source: new OSM() })]
            }));

            // Showing the pin
            const pinLayer = new VectorLayer({
                source: new VectorSource(),
                style: Utils.styleFunction
            })

            const pin = new Feature({
                geometry: new Point([discovery.location.lng, discovery.location.lat]),
                id: discovery.id,
                dType: discovery.dType
            });
            pinLayer.getSource().addFeature(pin);

            this.mainMap.addLayer(pinLayer);
        },

        activateMap() {
            const mapInstructions = {
                path: "/tabs/map/",
                query: {
                    type: discovery.dType,
                    id: discovery.id
                }
            };

            this.$router.push(mapInstructions);
        },

        async takePicture() {
            if (UserData.isCollected(this.discovery.id, this.discovery.dType))
                await this.presentToast("Nous avez déjà collectionné cela");

            const img = await Utils.takePicture();
            if (img == null) return;

            const filename = await Utils.savePicture(img);
            UserData.addCollected(this.discovery, "img/" + filename, null, null);
            UserData.addPendingUpload(this.discovery.id, this.discovery.dType);

            const redirection = {
                path: "/discovery-review/",
                query: {
                    id: this.discovery.id,
                    type: this.discovery.dType,
                }
            };

            this.$router.push(redirection);
        },

        async presentToast(text) {
            const toast = await toastController.create({
                message: text,
                duration: 3000,
                button: [{ text: "Fermer" }]
            });

            await toast.present();
        },
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryOfTheDay.css");
@import url("ol/ol.css");
</style>

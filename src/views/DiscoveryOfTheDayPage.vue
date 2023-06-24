<template>
  <ion-page>

    <ion-header>
        <ion-toolbar>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <div class="page-header">
            <p>Découverte<br>du jour</p>
            <ion-icon id="headerIcon" :icon="customCalendarIcon"></ion-icon>
        </div>

        <div class="page-body-background">
            <div class="page-body">
                <div>
                    <p class="title">{{ title }}</p>
                    <span class="separating-bar"></span>
                    <p class="subtitle one" v-if="subtitle1.length > 0">{{ subtitle1 }}</p>
                    <p class="subtitle two">{{ subtitle2 }}</p>
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

    </ion-content>
  </ion-page>
</template>

<script>
/* Vue/Ionic imports */
import { cameraOutline, informationCircleOutline, pin } from 'ionicons/icons';
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonButton, IonIcon, toastController } from "@ionic/vue";

/* Imports for the map */
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import { useGeographic } from "ol/proj";
import { Group as layerGroup } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

/* Custom imports */
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { RNG } from "@/internal/RNG"
import Utils from "@/internal/Utils";
import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";
import customCalendarIcon from "@/assets/drawable/icons/calendar.svg"

export default {
    name: "DiscoveryOfTheDayContainer",
    components: {
        IonIcon, IonButton, IonPage, IonHeader, IonContent, IonToolbar, IonTitle,
    },

    setup() {
        return {
            camera: cameraOutline, pin, informationCircleOutline, customCalendarIcon
        }
    },

    data() {
        // Build seed as the integer represented by ddMMyyyy
        const date = new Date();
        const seed = date.getDate() * 1000000 + (date.getMonth() + 1) * 10000 + date.getFullYear();
        const random = new RNG(seed);

        const type = random.nextInRange(0, 2);  // Choose what type of discovery to show

        let discovery;
        let i = 0;
        do {
            if (type === DiscoveryEnum.ARTWORK)
                discovery = ArtworkDatabase.getRandomItem(seed + i);
            else if (type === DiscoveryEnum.PLACE)
                discovery = PlaceDatabase.getRandomItem(seed + i);
            else /* if (type === DiscoveryEnum.HERITAGE) */
                discovery = HeritageDatabase.getRandomItem(seed + i);

            // `i` is used to keep control of randomness when looking for an unknown discovery
            i++;
        } while (UserData.isCollected(discovery.id, discovery.dType));  // Make sure the discovery is not collected

        return {
            discovery, type, DiscoveryEnum,
            title: discovery.getTitle(),
            subtitle1: type === DiscoveryEnum.ARTWORK ? discovery.getArtists() : discovery.getUsages(),
            subtitle2: type === DiscoveryEnum.ARTWORK ? discovery.getCategories() : discovery.getBorough()
        }
    },

    mounted() {
        this.myMap();
    },

    methods: {
        myMap() {
            const INITIAL_COORD = [this.discovery.location.lng, this.discovery.location.lat];
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
                layers: [ new TileLayer({ source: new OSM() }) ]
            }));

            // Showing the pin
            const pinLayer = new VectorLayer({
                source: new VectorSource(),
                style: Utils.pinStyleFunction
            })

            const pin = new Feature({
                geometry: new Point([this.discovery.location.lng, this.discovery.location.lat]),
                id: this.discovery.id,
                dType: this.discovery.dType
            });
            pinLayer.getSource().addFeature(pin);

            this.mainMap.addLayer(pinLayer);
        },

        activateMap() {
            const mapInstructions = {
                path: "/tabs/map/",
                query: {
                    type: this.discovery.dType,
                    id: this.discovery.id
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
                buttons: [{ text: "Fermer" }]
            });

            await toast.present();
        },
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("ol/ol.css");

* {
    font-family: 'OpenSans', sans-serif;
    box-sizing: content-box;
}

ion-button ion-icon {
    font-weight: 100;
    font-size: 50px;
    --ionicon-stroke-width: 20;
}

ion-button {
    --border-radius: 15px;
}

.title {
    font-size: 6vw;
    font-weight: 600;
}

span.separating-bar {
    margin-top: 2vw;
    margin-bottom: 2vw;
    display: block;
    width: 20vw;
    border-bottom: 4px solid var(--blue-powder);
}

.subtitle.one {
    font-size: 5vw;
    font-weight: 400;
}

.subtitle.two {
    margin-top: 2vw;
    font-size: 4vw;
}

div, p {
    margin: 0;
    padding: 0;
}

.page-header {
    position: relative;
    height: 25%;
    background: var(--blue-powder);
}

.page-body-background {
    height: 70%;
    background: var(--blue-powder);
    border: 0;
}

.page-body {
    height: 100%;
    background: white;
    border-radius: 25px 25px 0 0;
    padding: 5%;
    border: 0;
}

#headerIcon {
    position: absolute;
    transform: translate(-50%, -50%);
    left: 25%;
    top: 50%;
    color: white;
    font-size: 80px;
    --ionicon-stroke-width: 20;
}

.page-header p {
    margin: 0;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 60%;
    top: 50%;
    color: white;
    font-size: 28px;
    font-weight: 600;
}

#mapContainer {
    position: absolute;
    bottom: 12.5%;
    left: 5%;
    width: 90%;
    height: 15%;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid var(--button-outline-grey);
}

#cameraButton, #infoButton {
    position: absolute;
    justify-content: center;
    bottom: 30%;
    height: 15%;
    --border-color: var(--button-outline-grey);
    --border-width: 1px;
    --background: white;
    --background-activated: white;
    color: black;
    width: 42%;
    transition: color 0.2s cubic-bezier(.3, .9, .9, .9), --border-color 0.2s cubic-bezier(.3, .9, .9, .9);
}

#cameraButton:active {
    color: var(--button-activated);
}

#infoButton:active {
    color: var(--button-activated);
}

#cameraButton {
    left: 5%;
}

#infoButton {
    right: 5%;
}

ion-header {
    margin: 0;
    padding: 0;
}
</style>

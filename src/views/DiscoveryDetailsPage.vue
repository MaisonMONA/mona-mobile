<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="discoveryPhotoContainer">
                <div id="photoContainer"></div>
                <!-- PHOTO BUTTON -->
                <ion-button id="photoButton" fill="outline">
                    <ion-icon id="targetIcon" :icon="cameraOutline"></ion-icon>
                </ion-button>

                <!-- "SEE ON MAP" BUTTON -->
                <ion-button id="seeOnMapButton" fill="outline" :to="{ name: '/tabs/map', params: { discovery } }" router-link="/tabs/map" router-direction="forward">
                    <ion-icon id="targetIcon" :icon="mapOutline"></ion-icon>
                </ion-button>

                <!-- TARGET BUTTON -->
                <ion-fab-button id="targetButton">
                    <ion-icon id="targetIcon" :icon="star"></ion-icon>
                </ion-fab-button>
            </div>

            <div class="discoveryDetailsContainer">
                <div class="discoveryDetailsContent">
                    <!-- IF THE DISCOVERY IS AN ARTWORK -->
                    <div v-if="dType === DiscoveryEnum.ARTWORK" id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <span class="separatingBar"></span>
                        <p id="dArtist">{{ discovery.getArtists() }}</p>
                        <p v-if="discovery.categories != null" id="dCategories">{{ discovery.getCategories() }}</p>
                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }}</p>
                        <p v-if="discovery.dimensions != null" id="dDimensions">{{ discovery.dimensions.fr[0].replaceAll('x', '×') }}</p>
                        <p v-if="discovery.materials != null" id="dMaterials">{{ discovery.materials.fr.join(', ') }}</p>
                        <p v-if="discovery.techniques != null" id="dTechniques">{{ discovery.techniques.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE IF IT'S A PLACE -->
                    <div v-else-if="dType === DiscoveryEnum.PLACE" id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>
                        <p id="dBorough">{{ discovery.getBorough() }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.description }}</p>
                    </div>

                    <!-- ELSE (IT'S A HERITAGE) -->
                    <div v-else id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>
                        <p id="dBorough">{{ discovery.getBorough() }}</p>
                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.synthesis }}</p>
                    </div>

                </div>
            </div>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import {
    IonContent,
    IonFabButton,
    IonButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons
} from '@ionic/vue';
import { star, cameraOutline, mapOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

import { Discovery, DiscoveryEnum } from "@/internal/Types";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";

export default {
    name: "discovery-details",

    components: {
        IonFabButton, IonPage, IonToolbar, IonHeader, IonTitle,
        IonContent, IonIcon, IonButton, IonBackButton, IonButtons
    },

    data() {
        return {
            star, cameraOutline, mapOutline
        }
    },

    setup() {
        const route = useRoute();
        let { type, id } = route.params;
        type = type.toString();
        id = id.toString();

        let discovery: Discovery;

        switch (parseInt(type)) {
            case DiscoveryEnum.ARTWORK: {
                discovery = ArtworkDatabase.getFromId(parseInt(id));
                break;
            }
            case DiscoveryEnum.HERITAGE: {
                discovery = HeritageDatabase.getFromId(parseInt(id));
                break;
            }
            default: {
                discovery = PlaceDatabase.getFromId(parseInt(id));
                break;
            }

        }

        return {
            dType: parseInt(type),
            discovery, DiscoveryEnum
        }
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryDetails.css");
ion-back-button {
    /*position: absolute;*/
    /*top: 2%;*/
    /*left: 2%;*/
    color: black;
}
</style>
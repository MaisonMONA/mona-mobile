<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
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
                <ion-button id="seeOnMapButton" fill="outline">
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
                    <div v-if="dType === DiscoveryTypes.ARTWORK" id="dDetails">
                        <p id="dTitle">{{ discovery.title.fr || discovery.title.en || '(sans titre)' }}</p>
                        <span class="separatingBar"></span>
                        <p id="dArtist">{{ discovery.artists.join(', ') }}</p>
                        <p v-if="discovery.categories != null" id="dCategories">{{ discovery.categories.fr.join(', ') }}</p>
                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }}</p>
                        <p v-if="discovery.dimensions != null" id="dDimensions">{{ discovery.dimensions.fr[0].replaceAll('x', '×') }}</p>
                        <p v-if="discovery.materials != null" id="dMaterials">{{ discovery.materials.fr.join(', ') }}</p>
                        <p v-if="discovery.techniques != null" id="dTechniques">{{ discovery.techniques.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE IF IT'S A PLACE -->
                    <div v-else-if="dType === DiscoveryTypes.PLACE" id="dDetails">
                        <p id="dTitle">{{ discovery.title }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.usages.fr.join(', ') }}</p>
                        <p id="dBorough">{{ discovery.borough }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.description }}</p>
                    </div>

                    <!-- ELSE (IT'S A HERITAGE) -->
                    <div v-else id="dDetails">
                        <p id="dTitle">{{ discovery.title }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery["sous-usages"].join(', ') }}</p>
                        <p id="dBorough">{{ discovery.borough }}</p>
                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.synthesis }}</p>
                    </div>

                </div>
            </div>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonFabButton, IonButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { star, cameraOutline, mapOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

import { DiscoveryTypes } from "@/internal/Types";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";

export default {
    name: "discovery-details",

    components: {
        IonFabButton, IonPage, IonToolbar, IonHeader, IonTitle, IonContent, IonIcon, IonButton
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

        let discovery: any;

        switch (parseInt(type)) {
            case DiscoveryTypes.ARTWORK: {
                discovery = ArtworkDatabase.getFromId(parseInt(id));
                break;
            }
            case DiscoveryTypes.HERITAGE: {
                discovery = HeritageDatabase.getFromId(parseInt(id));
                break;
            }
            case DiscoveryTypes.PLACE: {
                discovery = PlaceDatabase.getFromId(parseInt(id));
                break;
            }
        }

        return {
            dType: parseInt(type),
            discovery, DiscoveryTypes
        }
    }
}
</script>

<style scoped>
.discoveryPhotoContainer {
    width: 100%;
    height: 40%;
    background: var(--blue-powder);
}

#photoContainer {
    width: 100%;
    height: 100%;
    padding: 10%;
    background-image: url("@/assets/drawable/mona_logo_med.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: 10% 10%;

}

#photoButton, #seeOnMapButton {
    position: absolute;
    width: 35%;
    top: 27.5%;
    height: 80px;
    outline-color: white;
    --border-color: white;
    color: white;
    /*--border-radius: 10%;*/
}

ion-button ion-icon {
    font-weight: 100;
    font-size: 50px;
    --ionicon-stroke-width: 20;
}

#photoButton {
    left: 10%;
}

#seeOnMapButton {
    right: 10%;
}

#targetButton {
    transform-origin: center;
    position: absolute;
    right: 5%;
    top: 40%;
}

.discoveryDetailsContent {
    margin: 10% 5% 5%;
    font-family: 'OpenSans', sans-serif;
}

#dTitle {
    font-size: 25px;
    font-style: italic;
    font-weight: 600;
    margin: 0;
}

span.separatingBar {
    padding: 0 25% 0 0;
    border-bottom: 5px solid var(--blue-powder);
}

#dArtist, #dUsages {
    font-size: 20px;
    font-weight: 300;
}

#dCategories, #dBorough {
    font-size: 16px;
}

#dProduced, #dDimensions, #dMaterials, #dTechniques, #dDescription {
    font-size: 12px;
    color: gray;
    margin: 5px 0;
    line-height: 20px;
}
</style>
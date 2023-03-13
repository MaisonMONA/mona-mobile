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
                <div class="photoContainer">
                    <ion-img id="defaultPhoto" :src="require('@/assets/drawable/mona_logo_med.png')"></ion-img>
                    <ion-img id="userPhoto"></ion-img>
                </div>
                <!-- PHOTO BUTTON -->
                <ion-button id="photoButton" fill="outline" @click="activateCamera">
                    <ion-icon id="targetIcon" :icon="cameraOutline"></ion-icon>
                </ion-button>

                <!-- "SEE ON MAP" BUTTON -->
                <ion-button id="seeOnMapButton" fill="outline" :to="{ name: '/tabs/map', params: { discovery } }" router-link="/tabs/map" router-direction="forward">
                    <ion-icon id="targetIcon" :icon="mapOutline"></ion-icon>
                </ion-button>

                <!-- TARGET BUTTON -->
                <ion-fab-button id="targetButton" @click="targetDiscovery">
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

<script>
import {
    IonBackButton, IonButton, IonButtons, IonContent, IonFabButton,
    IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonImg
} from '@ionic/vue';
import { cameraOutline, mapOutline, star } from "ionicons/icons";
import { useRoute } from "vue-router";

import { DiscoveryEnum } from "@/internal/Types";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { UserData } from "@/internal/databases/UserData";
import Globals from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";


export default {
    name: "discovery-details",

    components: {
        IonFabButton, IonPage, IonToolbar, IonHeader, IonTitle,
        IonContent, IonIcon, IonButton, IonBackButton, IonButtons,
        IonImg
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

        let discovery;

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

        const userData = UserData.getCollected(discovery.id, discovery.dType);
        if (userData) {
            console.log(`HERE id=${userData.id}, path=${userData.imagepath}, rating=${userData.rating}, comment=${userData.comment}`);
            Filesystem.readFile({
                path: userData.imagepath,
                directory: Directory.Data
            })
            .then(async (image) => {
                const base64Res = await fetch(`data:image/${userData.imagepath.split('.')[1]};base64,${image.data}`);
                const blob = await base64Res.blob();
                const url = URL.createObjectURL(blob);
                const userImg = document.getElementById("userPhoto");
                const defaultImg = document.getElementById("defaultPhoto");
                if (userImg && defaultImg) {  // Necessary but pointless `if` block: elements should always exist
                    defaultImg.style.display = "none";
                    userImg.style.display = "block";
                    userImg.src = url;

                    // Hiding buttons
                    const photoButton = document.getElementById("photoButton");
                    const seeOnMapButton = document.getElementById("seeOnMapButton");
                    if (photoButton && seeOnMapButton) {  // Same here
                        photoButton.style.display = "none";
                        seeOnMapButton.style.display = "none";
                    }

                    // Enable image opening
                    // userImg.onclick = ;
                }
            })
        }

        return {
            dType: parseInt(type),
            discovery, DiscoveryEnum,
        }
    },

    methods: {
        async activateCamera() {
            const img = await Globals.takePicture()
            if (img == null) return;

            const userImg = document.getElementById("userPhoto");
            const defaultImg = document.getElementById("defaultPhoto");
            if (userImg && defaultImg) {  // Necessary but pointless `if` block: elements should always exist
                defaultImg.style.display = "none";
                userImg.style.display = "block";
                userImg.src = img.webPath || '';

                // Hiding buttons
                const photoButton = document.getElementById("photoButton");
                const seeOnMapButton = document.getElementById("seeOnMapButton");
                if (photoButton && seeOnMapButton) {  // Same here
                    photoButton.style.display = "none";
                    seeOnMapButton.style.display = "none";
                }

                // Enable image opening
                userImg.onclick = this.showImg;
            }

            const filename = await Globals.savePicture(img);
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

        targetDiscovery() {
            if (UserData.isTargeted(this.discovery.id, this.discovery.dType)) {
                UserData.removeTargeted(this.discovery);
            } else {
                UserData.addTargeted(this.discovery);
            }
        },

        showImg() {
            // TODO
        }
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryDetails.css");
ion-back-button {
    color: black;
}

.photoContainer {
    position: relative;
    height: 100%;
}

.photoContainer ion-img#defaultPhoto {
    position: relative;
    top: 50px;
}

.photoContainer ion-img#userPhoto {
    display: none;
    object-fit: cover;
    height: 100%;
    width: 100%
}
</style>

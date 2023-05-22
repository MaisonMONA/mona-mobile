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
                <ion-button class="discovery-button" id="photoButton" fill="solid" @click="activateCamera">
                    <ion-icon id="cameraIcon" :icon="cameraOutline"></ion-icon>
                </ion-button>

                <!-- "SEE ON MAP" BUTTON -->
                <ion-button class="discovery-button" id="seeOnMapButton" fill="solid" @click="activateMap([discovery.lng, discovery.lat])">
                    <ion-icon id="mapIcon" :icon="customMapIcon"></ion-icon>
                </ion-button>

                <!-- TARGET BUTTON -->
                <ion-fab-button id="targetButton" @click="toggleTargetDiscovery">
                    <ion-icon id="targetIcon" :icon="customTargetIcon"></ion-icon>
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
                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }} • {{ discovery.getDirections() }}</p>
                        <p v-if="discovery.dimensions != null" id="dDimensions">{{ discovery.dimensions.fr[0].replaceAll('x', '×') }}</p>
                        <p v-if="discovery.materials != null" id="dMaterials">{{ discovery.materials.fr.join(', ') }}</p>
                        <p v-if="discovery.techniques != null" id="dTechniques">{{ discovery.techniques.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE IF IT'S A PLACE -->
                    <div v-else-if="dType === DiscoveryEnum.PLACE" id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>
                        <p id="dBorough">{{ discovery.getBorough() }} • {{ discovery.getAddress() }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.description }}</p>
                    </div>

                    <!-- ELSE (IT'S A HERITAGE) -->
                    <div v-else id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>
                        <p id="dBorough">{{ discovery.getBorough() }} • {{ discovery.getAddress() }}</p>
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
    IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonImg, toastController
} from '@ionic/vue';
import { cameraOutline, mapOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

import { DiscoveryEnum } from "@/internal/Types";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import targetIconWhite from "@/assets/drawable/icons/target.svg"
import targetIconBlack from "@/assets/drawable/icons/target_black.svg"
import customMapIcon from "@/assets/drawable/icons/map.svg"


export default {
    name: "discovery-details",

    components: {
        IonFabButton, IonPage, IonToolbar, IonHeader, IonTitle,
        IonContent, IonIcon, IonButton, IonBackButton, IonButtons,
        IonImg
    },

    data() {
        return {
            cameraOutline, customMapIcon,
            customTargetIcon: targetIconWhite  // May be overriden during mount
        }
    },

    setup() {
        const route = useRoute();
        let { type, id } = route.params;
        type = parseInt(type.toString() || '-1');
        id = parseInt(id.toString() || '-1');

        let discovery;
        if (type === DiscoveryEnum.ARTWORK)
            discovery = ArtworkDatabase.getFromId(parseInt(id));
        else if (type === DiscoveryEnum.PLACE)
            discovery = PlaceDatabase.getFromId(parseInt(id));
        else if (type === DiscoveryEnum.HERITAGE)
            discovery = HeritageDatabase.getFromId(parseInt(id));
        else
            throw new Error("Invalid type");

        return {
            dType: type,
            discovery, DiscoveryEnum,
        }
    },

    mounted() {
        const userData = UserData.getCollected(this.discovery.id, this.discovery.dType);

        if (userData) {
            if (userData.imagepath) {
                Filesystem.readFile({
                    path: userData.imagepath,
                    directory: Directory.Data
                })
                .then(async (image) => {
                    const base64Result = await fetch(`data:image/${ userData.imagepath.split('.')[1] };base64,${ image.data }`);
                    const url = await base64Result.blob().then((blob) => URL.createObjectURL(blob));
                    const userImg = document.getElementById("userPhoto");
                    const defaultImg = document.getElementById("defaultPhoto");

                    defaultImg.style.display = "none";
                    userImg.style.display = "block";
                    userImg.src = url;

                    // Enable image opening
                    // TODO uncomment line below after implementing showImg
                    // userImg.onclick = this.showImg;
                });
            }

            // Hiding buttons
            document.getElementById("photoButton").style.display = "none";
            document.getElementById("seeOnMapButton").style.display = "none";
        }

        // Handling target icon color
        if (UserData.isTargeted(this.discovery.id, this.discovery.dType))
            this.customTargetIcon = targetIconBlack;
        else
            this.customTargetIcon = targetIconWhite;

        // Change the bar color based on its type
        let barColor;
        if (this.discovery.dType === "artwork")
            barColor = "#FFDE7C";
        else if (this.discovery.dType === "place")
            barColor = "#D0B9EB";
        else if (this.discovery.dType === "heritage")
            barColor = "#FFAB96";
        else
            barColor = "#C0C4E4"  // Blue powder

        const separatingBar = document.querySelector("span.separatingBar");
        separatingBar.style.borderColor = barColor;
    },

    methods: {
        async activateCamera() {
            const img = await Utils.takePicture()
            if (img == null) return;  // User cancelled

            // Displaying photo in container
            const userImg = document.getElementById("userPhoto");
            const defaultImg = document.getElementById("defaultPhoto");
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

        async toggleTargetDiscovery() {
            let toastMessage;

            if (UserData.isTargeted(this.discovery.id, this.discovery.dType)) {
                UserData.removeTargeted(this.discovery);
                this.customTargetIcon = targetIconWhite;

                toastMessage = "La découverte n'est plus ciblée";
            } else {
                UserData.addTargeted(this.discovery);
                this.customTargetIcon = targetIconBlack;

                toastMessage = "La découverte est maintenant ciblée";
            }

            toastController.create({
                message: toastMessage,
                duration: 2000,
                position: "bottom",
            })
            .then((toast) => toast.present());
        },

        showImg() {
            // TODO
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

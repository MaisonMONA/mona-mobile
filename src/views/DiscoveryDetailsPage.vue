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
                    <p>Distance: {{this.showDistance()}} km</p>
                    <!-- IF THE DISCOVERY IS AN ARTWORK -->
                    <div v-if="dType === DiscoveryEnum.ARTWORK" id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <ul id="dRating">
                            <li :key="st" v-for="st in this.showRating()">
                                <ion-icon size="large" :icon="star"></ion-icon>
                            </li>
                        </ul>
                        <span class="separatingBar"></span>
                        <p id="dArtist">{{ discovery.getArtists() }}</p>
                        <p v-if="discovery.categories != null" id="dCategories">{{ discovery.getCategories() }}</p>

                        <div v-if="discovery.produced_at != null && discovery.getDirections() != null">
                            <p>{{ discovery.produced_at }} • {{ discovery.getDirections() }}</p>
                        </div>
                        <div v-else-if="discovery.produced_at != null">
                            <p id="dProduced">{{ discovery.produced_at }}</p>
                        </div>
                        <div v-else>
                            <p id="dProduced">{{discovery.getDirections() }}</p>
                        </div>

                        <p v-if="discovery.dimensions != null" id="dDimensions">{{ discovery.dimensions.fr[0].replaceAll('x', '×') }}</p>
                        <p v-if="discovery.materials != null" id="dMaterials">{{ discovery.materials.fr.join(', ') }}</p>
                        <p v-if="discovery.techniques != null" id="dTechniques">{{ discovery.techniques.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE IF IT'S A PLACE -->
                    <div v-else-if="dType === DiscoveryEnum.PLACE" id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <ul id="dRating">
                            <li :key="st" v-for="st in this.showRating()">
                                <ion-icon size="large" :icon="star"></ion-icon>
                            </li>
                        </ul>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>
                        <p id="dBorough">{{discovery.getBorough()}} • {{discovery.getAddress()}}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.description }}</p>
                    </div>

                    <!-- ELSE (IT'S A HERITAGE) -->
                    <div v-else id="dDetails">
                        <p id="dTitle">{{ discovery.getTitle() }}</p>
                        <ul id="dRating">
                            <li :key="st" v-for="st in this.showRating()">
                                <ion-icon size="large" :icon="star"></ion-icon>
                            </li>
                        </ul>
                        <span class="separatingBar"></span>
                        <p id="dUsages">{{ discovery.getUsages() }}</p>

                        <div v-if="discovery.getBorough() !== '' && discovery.getAddress() != null">
                            <p id="dBorough">{{ discovery.getBorough() }} • {{ discovery.getAddress() }}</p>
                        </div>
                        <div v-else-if="discovery.getBorough() !== ''">
                            <p id="dBorough">{{ discovery.getBorough() }}</p>
                        </div>
                        <div v-else>
                            <p id="dBorough">{{discovery.getAddress()}}</p>
                        </div>

                        <p v-if="discovery.produced_at != null" id="dProduced">{{ discovery.produced_at }}</p>
                        <p v-if="discovery.description != null" id="dDescription">{{ discovery.synthesis }}</p>
                    </div>

                    <div class="comment-dateCreation">
                        <p id="comment">Commentaire: {{this.showComment() }}</p>

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
import { cameraOutline, star, mapOutline } from "ionicons/icons";
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
            cameraOutline, customMapIcon, star, UserData,
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
                    const base64Result = await fetch(`data:image/${ userData.imagepath.split('.')[1] };base64,${ image.data }`)
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
        },

        showComment() {
            const userData = UserData.getCollected(this.discovery.id, this.discovery.dType)
            if(userData) return userData.comment
        },

        showRating(){
            const userData = UserData.getCollected(this.discovery.id, this.discovery.dType)
            if(userData) return userData.rating
        },
        //Haversine Formula
        //inspire du code python https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128#:~:text=For%20example%2C%20haversine(%CE%B8),longitude%20of%20the%20two%20points.
        showDistance(){ //lng , lt
            const lat1 = this.discovery.location.lat
            const lat2 = UserData.getLocation()[1]
            const lng1 = this.discovery.location.lng
            const lng2 = UserData.getLocation()[0]
            const R = 6371000 //radius of Earth in m

            const phi1 = this.degrees2radians(lat1)
            const phi2 = this.degrees2radians(lat2)

            const delta_phi = this.degrees2radians(lat2 - lat1)
            const delta_lambda = this.degrees2radians(lng2 - lng1)
            const a = Math.sin(delta_phi/2.0)** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda/2.0)**2
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt((1-a)))
            const meters = R * c
            const km = meters / 1000.0

            return this.roundDown(km)

        },
        //source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-33.php
        degrees2radians(degrees){
            const pi = Math.PI;
            return degrees * (pi/180);
        },
        //inspire de https://stackoverflow.com/questions/33429136/round-to-3-decimal-points-in-javascript-jquery
        roundDown(number){ //up to 3 decimal
            return Math.round(number * 1000) / 1000
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


ion-icon {
    color: var(--mona-yellow)
}

li {
    display: inline-block;
}

ul {
    padding: 0;
}
</style>

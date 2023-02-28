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

        <div id="mapButton"></div>
    </div>
</template>

<script lang="ts">
import { camera, imageOutline, informationCircleOutline, pin } from 'ionicons/icons';
import { IonButton, IonIcon } from "@ionic/vue";

import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { RNG } from "@/internal/RNG"
import { Discovery, DiscoveryEnum } from "@/internal/Types";

console.log("Database:");
console.log("\t" + ArtworkDatabase.getSize() + " artworks");
console.log("\t" + PlaceDatabase.getSize() + " places, and");
console.log("\t" + HeritageDatabase.getSize() + " heritages");

// Build seed as the integer represented by ddMMyyyy
const date = new Date();
const seed = date.getDate() * 1000000 + (date.getMonth() + 1) * 10000 + date.getFullYear();
const random = new RNG(seed);

const type = random.nextInRange(0, 2);  // Choose what type of discovery to show

let discovery: Discovery;
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
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryOfTheDay.css");
</style>

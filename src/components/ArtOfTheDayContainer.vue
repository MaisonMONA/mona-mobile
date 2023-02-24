<template>
    <div id="main">
        <div id="heading">
            <div>
                <ion-icon id="header-AOD" size="large" :icon="imageOutline"></ion-icon>
                <label for="header-AOD" id="pagetitle">Découverte<br>du jour</label>
            </div>
        </div>
    
        <div id="AOD-info">
            <div id="AOD-details">
                <p v-if="art.title.fr" id="AOD-title">{{ art.title.fr }}</p>
                <p v-else id="AOD-title">{{ art.title.en }}</p>

                <p v-if="art.artists.length > 0" id="AOD-artist">{{ art.artists.join(', ') }}</p>

                <p id="AOD-category">{{ art.categories.fr.join(", ") }}</p>
            </div>
    
            <!-- Camera button -->
            <ion-button id="cameraicon" shape="round" fill="solid" size="large" >
                <ion-icon :icon="camera"></ion-icon>
            </ion-button>
    
            <!-- Pin button -->
            <ion-button id="pinicon" shape="round" fill="outline" size="large">
                <ion-icon :icon="pin"></ion-icon>
            </ion-button>
    
            <!-- Map button (larger) -->
            <ion-button id="mapicon" shape="round" fill="outline" size="large" >
                <ion-icon :icon="map"></ion-icon>
            </ion-button>

            <ion-button id="reroll" shape="round" fill="outline" @click="art = rerollArt()">
                <ion-icon :icon="reload"></ion-icon>
            </ion-button>
        </div>
    </div>
</template>

<script lang="ts">
import {camera, imageOutline, map, pin, reload} from 'ionicons/icons';
import {IonButton, IonIcon} from "@ionic/vue";

import {ArtworkDatabase} from "@/internal/databases/ArtworkDatabase";
import {RNG} from "@/internal/RNG"


// Build seed as the integer represented by ddMMyyyy
const date = new Date();
const seed = date.getDay() * 1000000 + date.getMonth() * 10000 + date.getFullYear();
const random = new RNG(seed);


// let art: Artwork;
// const AODCategory = random.nextInRange(1, 3);
// switch (AODCategory) {
    // case 1: {
const artId = random.nextInRange(1, ArtworkDatabase.getSize());
console.log("artId ====================", artId, ArtworkDatabase.getSize());
const art = ArtworkDatabase.getFromId(artId);
const rerollArt = () => {
    const e = ArtworkDatabase.getFromId(random.nextInRange(1, ArtworkDatabase.getSize()));
    console.log("id=" + e.id);
    console.log("title fr=" + e.title.fr, "title en=" + e.title.en);
    return e;
}
        // break
    // }
    // case 2: {
    //     oeuvreId = random.nextInRange(1, PlaceDatabase.getSize());
    //     break
    // }
    // case 3: {
    //     oeuvreId = random.nextInRange(1, HeritageDatabase.getSize());
    //     break
    // }
// }


export default {
    name: "ArtOfTheDayContainer",
    components: {
        IonIcon, IonButton
    },

    setup() {
        return {
            camera, pin, map, imageOutline, reload
        }
    },

    data() {
        return {
            art, rerollArt
        }
    }
}
</script>

<style scoped>

</style>
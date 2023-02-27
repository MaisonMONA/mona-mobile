<template>
    <div id="main">
        <div id="heading">
            <div>
                <ion-icon id="header-DOD" size="large" :icon="imageOutline"></ion-icon>
                <label for="header-DOD" id="pagetitle">Découverte<br>du jour</label>
            </div>
        </div>

        <div id="DOD-info">
            <!-- IF THE DISCOVERY IS AN ARTWORK -->
            <div v-if="type === DiscoveryTypes.ARTWORK" id="DOD-details">
                <p id="DOD-title">{{ discovery.title.fr || discovery.title.en || '(sans titre)' }}</p>
                <p id="DOD-artist">{{ discovery.artists.join(', ') }}</p>
                <p id="DOD-category" v-if="discovery.categories">{{ discovery.categories.fr.join(', ') }}</p>
            </div>

            <!-- ELSE IF IT'S A PLACE -->
            <div v-else-if="type === DiscoveryTypes.PLACE" id="DOD-details">
                <p id="DOD-title">{{ discovery.title }}</p>
                <p id="DOD-borough">{{ discovery.borough }}</p>
                <p id="DOD-usages">{{ discovery.usages.fr.join(', ') }}</p>
            </div>

            <!-- ELSE (IT'S A HERITAGE) -->
            <div v-else id="DOD-details">
                <p id="DOD-title">{{ DiscoveryTypes.title }}</p>
                <p id="DOD-borough">{{ discovery.borough }}</p>
                <p id="DOD-usages">{{ discovery.functions.fr.join(', ') }}</p>
            </div>

            <!-- Camera button -->
            <ion-button id="cameraicon" shape="round" fill="outline" size="large" >
                <ion-icon :icon="camera"></ion-icon>
            </ion-button>

            <!-- Pin button -->
            <ion-nav-link router-direction="forward">
                <ion-button id="pinicon" shape="round" fill="outline" size="large">
                    <ion-icon :icon="informationCircleOutline"></ion-icon>
                </ion-button>
            </ion-nav-link>

            <!-- Map button (larger) -->
            <ion-button id="mapicon" shape="round" fill="outline" size="large" >
                <ion-icon :icon="map"></ion-icon>
            </ion-button>
        </div>
    </div>
</template>

<script lang="ts">
import { camera, imageOutline, informationCircleOutline, map, pin, reload } from 'ionicons/icons';
import { IonButton, IonIcon, IonNavLink } from "@ionic/vue";
import DiscoveryDetailsComponent from "@/components/DiscoveryDetailsComponent.vue";

import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { RNG } from "@/internal/RNG"
import { DiscoveryTypes } from "@/internal/Types";

console.log("artworks " + ArtworkDatabase.getSize());
console.log("places " + PlaceDatabase.getSize());
console.log("heritages " + HeritageDatabase.getSize());


// Build seed as the integer represented by ddMMyyyy
const date = new Date();
const seed = date.getDate() * 1000000 + (date.getMonth() + 1) * 10000 + date.getFullYear();
const random = new RNG(seed);

const type = random.nextInRange(1, 3);  // Choose what type of discovery to show

let discovery: any;
switch (type) {
    case DiscoveryTypes.ARTWORK: {  // Choose in artworks
        const artworkId = random.nextInRange(1, ArtworkDatabase.getSize());
        discovery = ArtworkDatabase.getFromId(artworkId);
        break
    }
    case DiscoveryTypes.PLACE: {  // Choose in places
        const placeId = random.nextInRange(1, PlaceDatabase.getSize());
        discovery = PlaceDatabase.getFromId(placeId)
        break
    }
    case DiscoveryTypes.HERITAGE: {  // Choose in heritages
        const heritageId = random.nextInRange(1, HeritageDatabase.getSize());
        discovery = HeritageDatabase.getFromId(heritageId);
        break
    }
}

export default {
    name: "DiscoveryOfTheDay",
    components: {
        IonIcon, IonButton, IonNavLink
    },

    setup() {
        return {
            camera, pin, map, imageOutline, reload, informationCircleOutline
        }
    },

    data() {
        return {
            type,
            DiscoveryDetailsComponent,
            discovery,
            DiscoveryTypes
        }
    }
}
</script>

<style scoped>
@import url("@/theme/DiscoveryOfTheDay.css");
</style>

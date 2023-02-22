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
                <p id="AOD-title">Le Jardin</p>
                <p id="AOD-artist">Mono Gonzalez</p>
                <p id="AOD-category">Murales</p>
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
        </div>
    </div>
</template>

<script>
import { pin, camera, map, imageOutline } from 'ionicons/icons';
import { IonButton, IonIcon } from "@ionic/vue";

export default {
    name: "ArtOfTheDayContainer",
    components: {
        IonIcon, IonButton
    },

    setup() {
        return {
            camera, pin, map, imageOutline
        }
    }
}
</script>

<style scoped>

</style>
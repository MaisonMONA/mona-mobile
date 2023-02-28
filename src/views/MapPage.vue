<template>
  <ion-page>

    <ion-header>
        <ion-toolbar>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <MapContainer/>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import "@/theme/Map.css"
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import MapContainer from "@/components/MapContainer.vue";

export default {
    name: "MapPage",
    components: {
        IonHeader,
        IonContent,
        IonPage,
        IonToolbar, IonTitle,
        MapContainer,
    }
};
</script>

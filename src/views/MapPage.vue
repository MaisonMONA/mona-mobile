<script lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import MapTest from "@/components/MapContainer.vue";
import TopToolbarContainer from "@/components/TopToolbarContainer.vue";

export default {
    name: "MapPage",
    components: {
        TopToolbarContainer,
        IonHeader,
        IonContent,
        IonPage,
        MapTest
    }
};
</script>

<template>
  <ion-page>

    <ion-header>
        <TopToolbarContainer/>
    </ion-header>

    <ion-content :fullscreen="true">
        <MapTest/>
    </ion-content>

  </ion-page>
</template>


<style>
#mapContainer {
    width: 100%;
    height: 100%;
}
</style>

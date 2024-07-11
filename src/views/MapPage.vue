<template>
  <ion-page>

    <ion-content :fullscreen="true">
        <MapContainer/>
    </ion-content>

  </ion-page>
</template>


<script lang="ts">
import "@/theme/Map.css"
import { IonPage, IonContent } from '@ionic/vue';
import MapContainer from "@/components/MapContainer.vue";

export default {
    name: "MapPage",
    components: {
        IonContent,
        IonPage,
        MapContainer,
    }
};
</script>

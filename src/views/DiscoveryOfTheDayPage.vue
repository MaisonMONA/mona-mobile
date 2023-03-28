<template>
  <ion-page>

    <ion-header>
        <ion-toolbar>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <DiscoveryOfTheDayContainer/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import "@/theme/DiscoveryOfTheDay.css"
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle } from '@ionic/vue';
import DiscoveryOfTheDayContainer from "@/components/DiscoveryOfTheDayContainer.vue";

export default {
    components: {
        IonPage, IonHeader, IonContent, IonToolbar, IonTitle,
        DiscoveryOfTheDayContainer
    },
}
</script>

<style>
ion-header {
    margin: 0;
    padding: 0;
}
</style>

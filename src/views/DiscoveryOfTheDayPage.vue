<template>
  <ion-page>

    <ion-header>
        <ion-toolbar>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <DiscoveryOfTheDay/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import "@/theme/DiscoveryOfTheDay.css"
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle } from '@ionic/vue';
import DiscoveryOfTheDay from "@/components/DiscoveryOfTheDayContainer.vue";

export default {
    name: "discovery-of-the-day",
    components: {
        IonPage, IonHeader, IonContent, IonToolbar, IonTitle,
        DiscoveryOfTheDay
    },
    data() {
        return {
            DiscoveryOfTheDay
        }
    }
}
</script>

<style>
ion-header {
    margin: 0;
    padding: 0;
}
</style>

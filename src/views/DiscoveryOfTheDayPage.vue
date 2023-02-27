<template>
  <ion-page>

    <ion-header>
        <ion-toolbar>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <ion-nav :root="DiscoveryOfTheDay"></ion-nav>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import "@/theme/DiscoveryOfTheDay.css"
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonNav } from '@ionic/vue';
import DiscoveryOfTheDay from "@/components/DiscoveryOfTheDayContainer.vue";

export default {
    name: "discovery-of-the-day",
    components: {
        IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonNav
    },
    data() {
        return {
            DiscoveryOfTheDay
        }
    }
}
</script>

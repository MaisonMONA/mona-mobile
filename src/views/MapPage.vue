<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>MONA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <MapContainer />
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import "@/theme/Map.css";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import MapContainer from "@/components/MapContainer.vue";
import { useBadgesCollections } from "@/stores/BadgesCollections";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
const badgesCollectionsStore = useBadgesCollections();
export default {
  name: "MapPage",
  components: {
    IonHeader,
    IonContent,
    IonPage,
    IonToolbar,
    IonTitle,
    MapContainer,
  },
  created() {
    //TODO: écrire la fonction pour récupérer les badges dans le local storage
    //TODO: écrire la fonction qui modifie le state des badges -> NewCollection.newBadge()
  },
};
</script>

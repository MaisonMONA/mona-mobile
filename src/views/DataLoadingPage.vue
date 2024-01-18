<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>MONA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <p id="alertHolder"></p>
      <p>Chargement des données<br />utilisateur...</p>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { UserData } from "@/internal/databases/UserData";
import { UserBadges } from "@/internal/UserBadges";

export default {
  name: "DataLoadingPage",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  },

  mounted() {
    /* Initializing all databases */
    Promise.all([
      ArtworkDatabase.populate(),
      PlaceDatabase.populate(),
      HeritageDatabase.populate(),
      BadgeDatabase.populate(),
    ])
      .catch(() => {
        this.showAlert("Impossible de se connecter à internet !");
      })
      .then(() => Promise.all([UserData.getFromServer(), UserData.loadCache()]))
      .then(() => {
        // cache collected badges
        UserBadges.populate();
        // async functions, but DO NOT await (background tasks)
        UserData.checkForDBUpdate();
        UserData.tryUploadingPendingDiscoveries();
      })
      .then(() => this.$router.replace("/tabs/map"))
      .catch((err) => {
        throw new Error(`Could not retrieve user data (${err})`);
      });
  },

  methods: {
    showAlert(alertMessage) {
      const alertElem = document.getElementById("alertHolder");

      alertElem.innerHTML = alertMessage;
      alertElem.classList.add("show");
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

p {
  position: relative;
  font-family: "Gotham Rounded Light", sans-serif;
  text-align: center;
  top: 35%;
}

.ion-page {
  background: white;
}

#alertHolder {
  position: absolute;
  text-align: center;
  transform: translateX(-50%);
  left: 50%;

  top: 20%;

  margin: 15% 0 0;
  padding: 0.2em 0.4em;
  border-radius: 4px;

  font-weight: bolder;
  color: white;
  background: white;
  font-size: 12px;

  transition: all 0.3s linear;
}

#alertHolder.show {
  color: darkred;
  background: #e6b1b1;
}
</style>

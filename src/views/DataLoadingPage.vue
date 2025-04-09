<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toast
        :is-open="ionToastErrorMessageIsOpen"
        :message="ionToastErrorMessage"
        color="danger"
        position="top"
        position-anchor="ion-toast-anchor"
      ></ion-toast>
        <img src="/assets/animation/monaLogo.gif" />
        <p class="loading-text">Chargement en cours...</p>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonToast } from "@ionic/vue";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { UserData } from "@/internal/databases/UserData";
import {CollectedBadge} from "@/internal/CollectedBadges.ts";

export default {
  name: "DataLoadingPage",
  components: {
    IonToast,
    IonPage,
    IonContent,
  },
  data() {
    return {
      ionToastErrorMessageIsOpen: false,
      ionToastErrorMessage: "",
    };
  },

  mounted() {
    // TODO enlever ca et le .then delay en prod. ajoute delay pour tester la page loading
    const DEV_DELAY = 100000; // en ms. 1000ms = 1s

    /* Initializing all databases */
    Promise.all([
      ArtworkDatabase.populate(),
      PlaceDatabase.populate(),
      HeritageDatabase.populate(),
      BadgeDatabase.populate(),
    ])
    .then(() => {
      // TODO enlever ce .then en prod. ajoute delay
      return new Promise(resolve => setTimeout(resolve, DEV_DELAY));
    })
      .catch(() => {
        this.showAlert("Impossible de se connecter à internet !");
      })
      .then(() => Promise.all([UserData.getFromServer(), UserData.loadCache()]))
      .then(() => {
        // Fetch collected badges
        CollectedBadge.determineCollectedBadges();
        // async functions, but DO NOT await (background tasks)
        UserData.checkForDBUpdate();
        UserData.tryUploadingPendingDiscoveries();
      })
      .then(() => {

        // Set when account was created
        // TODO check if this is the right way to do it
        try {
          if (UserData.getWhenAccountCreated() === "") {
            UserData.setWhenAccountCreated();
            console.log("'whenAccountCreated' value fetched and set in UserData.");
          }
        } catch (error) {
          this.showAlert("Error: couldn't get when account was created by API.");
        }

        this.ionToastErrorMessageIsOpen = false;
        this.$router.replace("/tabs/map");
      })
      .catch((err) => {
        throw new Error(`Could not retrieve user data (${err})`);
      });
  },

  methods: {
    showAlert(alertMessage) {
      this.ionToastErrorMessageIsOpen = true;
      this.ionToastErrorMessage = alertMessage;
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

.loading-text {
  font-family: "Gotham Rounded Light", sans-serif;
  font-size: 1.125rem;
  color: #555;
  margin-top: -15rem;
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
</style>

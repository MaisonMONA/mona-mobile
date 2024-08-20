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
import { UserBadges } from "@/internal/UserBadges";

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
</style>

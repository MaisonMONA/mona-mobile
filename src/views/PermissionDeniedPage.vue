<template>
  <ion-page>
    <ion-content>
      <div class="main-content">
        <p>Certaines permissions n'ont pas été accordées à l'application.</p>
        <p>Some permissions have not been granted to the app.</p>
        <p>
          Voici la liste des permissions dont l'application a besoin pour
          fonctionner :
        </p>
        <ul>
          <li>
            <span class="bold">Accès à la caméra :</span> nécessaire pour
            prendre en photo des découvertes ;
          </li>
          <li>
            <span class="bold">Accès au stockage :</span> nécessaire pour
            enregistrer les photos sur l'appareil ;
          </li>
          <li>
            <span class="bold">Accès à la position :</span> nécessaire pour
            afficher votre position sur la carte.
          </li>
        </ul>
        <p class="cannot-ask-for-perms">
          Vous avez définitivement bloqué la demande de permissions.
        </p>
        <p class="cannot-ask-for-perms">
          You have permanently blocked some permission requests.
        </p>
        <p style="color: #4e4cbe; font-weight: bold">
          Activer les permissions en accédant au paramètre de l'app.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonButton } from "@ionic/vue";
import { Geolocation } from "@capacitor/geolocation";

export default {
  name: "PermissionDeniedPage",
  components: {
    IonPage,
    IonContent,
    IonButton,
  },

  methods: {
    async requestPermissions() {
      const locationPermStatus = await Geolocation.requestPermissions();

      if (locationPermStatus.location === "granted") {
        this.$router.replace("/register");
      } else if (locationPermStatus.location === "denied") {
        const warnings = document.getElementsByClassName(
          "cannot-ask-for-perms",
        );
        for (const warning of warnings) {
          warning.style.display = "block";
        }
      }
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.main-content {
  width: 100%;
  height: 100%;
  padding: 10%;
}

p,
li {
  font-family: "Open Sans", sans-serif;
}

p {
  text-align: center;
}

.cannot-ask-for-perms {
  display: none;
  color: red;
  font-weight: bold;
}

.bold {
  font-weight: bold;
}

ion-button {
  transform: translate(-50%, -50%);
  position: relative;
  margin-top: 5vw;
  left: 50%;
}
</style>

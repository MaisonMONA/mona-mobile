<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
} from "@ionic/vue";
import { reactive, ref } from "vue";
import {
  checkmarkCircle,
  closeCircle,
  informationCircleOutline,
} from "ionicons/icons";
import Globals from "../internal/Globals.ts";
const toastErrorMsg = ref("");
const msg200 = "Email de réinitialisation envoyé";
const msg404 = "Nom d'utilisateur introuvable";
const msg400 = "Aucun email associé à votre compte";
const inputUsername = reactive({ value: "" });

const toastCSS = ref("status404");
const toastIcon = ref(null);

function resetPassword() {
  if (inputUsername.value === "") {
    toastErrorMsg.value = "Veuillez entrer votre nom d'utilisateur";
    toastIcon.value = informationCircleOutline;
    return;
  }
  // Call API to reset password
  const formData = new FormData();
  formData.append("username", inputUsername.value.trim());

  fetch(Globals.apiRoutes.forgotPassword, {
    method: "POST",
    body: formData,
  })
    .then(async (response) => {
      const parsed = await response.json();

      if (response.ok) {
        // Show success message
        toastErrorMsg.value = msg200;
        toastCSS.value = "status200";
        toastIcon.value = checkmarkCircle;
      } else if (response.status === 404) {
        // Show appropriate error
        toastErrorMsg.value = msg404;
        toastCSS.value = "status404";
        toastIcon.value = closeCircle;
      } else if (response.status === 400) {
        // Show appropriate error
        toastErrorMsg.value = msg400;
        toastCSS.value = "status404";
        toastIcon.value = closeCircle;
      }
    })
    .catch(() => {
      toastErrorMsg.value =
        "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.";
      toastIcon.value = closeCircle;
      toastCSS.value = "status404";
    });
}
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>MONA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ion-padding">
        <ion-input
          type="email"
          label="Nom d'utilisateur"
          class="username"
          label-placement="floating"
          fill="outline"
          placeholder="Entrer votre nom d'utilisateur"
          v-model="inputUsername.value"
        ></ion-input>
        <ion-button
          expand="block"
          @click="resetPassword"
          class="reinitialiser"
          id="open-toast"
          >Réinitialiser le mot de passe</ion-button
        >
        <ion-button expand="block" router-link="/login" class="annuler"
          >Annuler</ion-button
        >
      </div>
      <ion-toast
        trigger="open-toast"
        :message="toastErrorMsg"
        :duration="3000"
        :icon="toastIcon"
        :class="toastCSS"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-toast.status200 {
  --background: #327128;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: white;
}
ion-toast.status404 {
  --background: #d82727;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: white;
}
ion-button.reinitialiser {
  --background: #4d58cb;
  --background-activated: #000000;
  --ripple-color: #000000;
  margin-bottom: 2%;
}
ion-button.annuler {
  --background: #d9d9d9;
  --background-activated: #595959;
  --ripple-color: #595959;
  --color: black;
}
ion-input.username {
  --highlight-color-focused: #000000;
  margin-bottom: 7%;
}
</style>

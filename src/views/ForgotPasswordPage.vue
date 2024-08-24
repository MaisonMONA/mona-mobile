<script setup>
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  loadingController,
} from "@ionic/vue";
import { reactive, ref } from "vue";
import {
  checkmarkCircle,
  closeCircle,
  informationCircleOutline,
} from "ionicons/icons";
import Globals from "../internal/Globals.ts";

const msg200 = "Email de réinitialisation envoyé";
const msg404 = "Nom d'utilisateur introuvable";
const msg400 = "Aucun email associé à votre compte";

const inputUsername = reactive({ value: "" });

const toastErrorMsg = reactive({ value: "" });
const toastCSS = ref("status40X");
const toastIcon = ref(null);

const isToastOpen = ref(false);
function setToast(value, icon, css, state) {
  toastErrorMsg.value = value;
  toastIcon.value = icon;
  toastCSS.value = css;
  setOpenToast(state);
}
function setOpenToast(state) {
  isToastOpen.value = state;
}

function resetPassword() {
  setOpenToast(false);

  if (inputUsername.value === "") {
    setToast(
      "Veuillez entrer votre nom d'utilisateur",
      informationCircleOutline,
      "status40X",
      true,
    );
    return;
  }
  // Call API to reset password
  const formData = new FormData();
  formData.append("username", inputUsername.value.trim());

  showLoading();
  fetch(Globals.apiRoutes.forgotPassword, {
    method: "POST",
    body: formData,
  })
    .then(async (response) => {
      await response.json();
      await loadingController.dismiss();
      return { response };
    })
    .then(({ response }) => {
      if (response.status === 200) {
        setToast(msg200, checkmarkCircle, "status200", true);
      } else if (response.status === 404) {
        setToast(msg404, closeCircle, "status40X", true);
      } else if (response.status === 400) {
        setToast(msg400, closeCircle, "status40X", true);
      }
    })
    .catch(() => {
      setToast(
        "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.",
        closeCircle,
        "status40X",
        true,
      );
    });
}

async function showLoading() {
  const loading = await loadingController.create({
    duration: 3000,
  });

  return await loading.present();
}
</script>

<template>
  <ion-page>

    <ion-content>
      <div class="ion-padding">
        <ion-input
          type="email"
          label="Entrez ici votre nom d'utilisateur"
          class="username"
          label-placement="floating"
          fill="outline"
          placeholder="Nom d'utilisateur"
          v-model="inputUsername.value"
          @keydown.enter="resetPassword"
        ></ion-input>
        <ion-button expand="block" @click="resetPassword" class="reinitialiser"
          >Réinitialiser le mot de passe</ion-button
        >
        <ion-button
          expand="block"
          router-link="/login"
          class="annuler"
          @click="setOpenToast(false)"
          >Annuler</ion-button
        >
      </div>
      <ion-toast
        :is-open="isToastOpen"
        :message="toastErrorMsg.value"
        :duration="3000"
        :icon="toastIcon"
        :class="toastCSS"
        @disDismiss="setOpenToast(false)"
        position="top"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<style scoped>
@import url("@/theme/TopToolbar.css");
div.ion-padding {
  position: relative;
  top: 8vh;
}
.ios div.ion-padding {
  top: 11vh;
}

ion-toast.status200 {
  --background: #327128;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: white;
}
ion-toast.status40X {
  --background: #d82727;
  --box-shadow: 3px 3px 10px 0 rgba(0, 0, 0, 0.2);
  --color: white;
}
ion-button.reinitialiser {
  --background: #4d58cb;
  --background-activated: #000000;
  --ripple-color: #000000;
  --color: white;
  margin-bottom: 3%;
}
ion-button.annuler {
  --background: #d9d9d9;
  --background-activated: #595959;
  --ripple-color: #595959;
  --color: black;
}
ion-input.username {
  --color: #474747;
  --highlight-color-focused: #000000;
  margin-bottom: 9%;
}
.ios ion-input.username {
  border-bottom: 0.13vh solid #bfbfbf;
}
</style>

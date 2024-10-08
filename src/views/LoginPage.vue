<template>
  <ion-page>

    <ion-content :fullscreen="true">
      <ion-toast
        :is-open="ionToastErrorMessageIsOpen"
        :message="ionToastErrorMessage"
        :duration="9000"
        @didDismiss="ionToastErrorMessageIsOpen = false"
        color="danger"
        position="top"
      ></ion-toast>

      <div class="main-content">
        <p id="welcome">Connexion</p>
        <p id="ask-for-login">Connectez-vous à votre compte.</p>

        <div class="form-section">
          <div class="input-element username">
            <label for="login-username">Nom d'utilisateur</label>
            <ion-item id="login-username">
              <ion-input></ion-input>
            </ion-item>
          </div>

          <div class="input-element password">
            <label for="login-password">Mot de passe</label>
            <ion-item id="login-password">
              <ion-input type="password" @keydown.enter="login"></ion-input>
            </ion-item>

            <p
              @click="ionToastErrorMessageIsOpen = false"
              style="
                text-align: left;
                padding-left: 7%;
                font-size: small;
                color: #0059ff !important;
              "
            >
              <router-link to="/forgot-password" class="forgotPasswordLink">
                Mot de passe oublié ?
              </router-link>
            </p>
          </div>

          <ion-button @click="login">Se connecter</ion-button>

          <p class="redirect-to-register" @click="goToRegister">
            Pas de compte ? <span>En créer un</span>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonToast,
} from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import Globals from "@/internal/Globals";

export default {
  name: "LoginPage",
  components: {
    IonToast,
    IonPage,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
  },

  data() {
    return {
      ionToastErrorMessageIsOpen: false,
      ionToastErrorMessage: "",
    };
  },

  beforeMount() {
    UserData.populate().then(() => {
      if (UserData.getToken() !== "") {
        // User is logged in, redirect
        this.$router.replace("/loading");
      }
    });
  },

  methods: {
    goToRegister() {
      this.ionToastErrorMessageIsOpen = false;
      this.$router.push("/register");
    },

    login() {
      const username = document.querySelector(
        "ion-item#login-username ion-input",
      ).value;
      const password = document.querySelector(
        "ion-item#login-password ion-input",
      ).value;

      if (username && password) {
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("password", password);

        fetch(Globals.apiRoutes.login, {
          method: "POST",
          body: formData,
        })
          .then(async (response) => {
            const parsed = await response.json();

            if (response.ok) {
              if (!parsed.token) {
                this.showAlert("Erreur de serveur");
              }

              UserData.setToken(parsed.token);
              UserData.setUsername(username.trim());
              this.$router.replace("/loading");
            } else {
              // Show appropriate error
              if (parsed.errors && parsed.errors.username) {
                console.log(parsed);
                this.showAlert(parsed.errors.username[0]);
              } else {
                this.showAlert(`Erreur serveur (code ${response.status})`);
              }
            }
          })

          .catch(() => {
            this.showAlert("Impossible de se connecter à internet.");
          });
      }
    },

    showAlert(alertMessage) {
      this.ionToastErrorMessageIsOpen = true;
      this.ionToastErrorMessage = alertMessage;
    },
  },
};
</script>

<style scoped>
@import url("@/theme/TopToolbar.css");
.forgotPasswordLink {
  color: #595959 !important;
}

p,
label {
  font-family: "Gotham Rounded Light", sans-serif;
}

#welcome {
  font-size: 20px;
  font-weight: 900;
}

.main-content {
  font-size: 14px;
  text-align: center;
  position: relative;
  top: 20%;
  width: 100%;
  height: 85%;
}

div.form-section {
  position: relative;
  width: 100%;
  height: 80%;
}

.input-element {
  width: 70%;
  margin: 5% auto;
}

.input-element * {
  text-align: center;
}

ion-input {
  font-size: 14px;
}

label {
  display: block;
  text-align: center;
}

.redirect-to-register span {
  font-weight: bolder;
  border-bottom: 1px solid black;
}
</style>

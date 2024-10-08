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
        <p id="welcome">Inscription</p>
        <p id="ask-for-registration">
          Bienvenue !<br />Commençons par créer un compte.
        </p>

        <div class="form-section">
          <div class="input-element username">
            <label for="username-input">Nom d'utilisateur</label>
            <ion-item id="username-input">
              <ion-input></ion-input>
            </ion-item>
          </div>

          <div class="input-element email">
            <label for="email">Adresse courriel (optionnel)</label>
            <ion-item id="email-input">
              <ion-input></ion-input>
            </ion-item>
          </div>

          <div class="input-element password">
            <label for="password-input">Mot de passe</label>
            <ion-item id="password-input">
              <ion-input type="password"></ion-input>
            </ion-item>
          </div>

          <div class="input-element password-confirmation">
            <label for="password-confirmation-input"
              >Vérifiez le mot de passe</label
            >
            <ion-item id="password-confirmation-input">
              <ion-input type="password" @keydown.enter="register"></ion-input>
            </ion-item>
          </div>

          <ion-button @click="register">S'inscrire</ion-button>

          <p class="redirect-to-login" @click="goToLogin">
            Déjà un compte ? <span>Se connecter</span>
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
import router from "@/router/index.ts";

export default {
  name: "RegisterPage",
  components: {
    IonPage,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonToast,
  },

  data() {
    return {
      ionToastErrorMessageIsOpen: false,
      ionToastErrorMessage: "",
    };
  },

  async beforeMount() {
    await UserData.populate();

    if (!UserData.hasSeenTutorial()) {
      // Show tutorial on first time
      this.$router.replace("/tutorial");
    } else if (UserData.getToken() !== "") {
      // If user is logged in, redirect immediately
      this.$router.replace("/loading");
    }
  },

  methods: {
    goToLogin() {
      this.ionToastErrorMessageIsOpen = false;
      this.$router.push("/login");
    },

    register() {
      const username = document.querySelector(
        "ion-item#username-input ion-input",
      ).value;
      const email = document.querySelector(
        "ion-item#email-input ion-input",
      ).value;
      const password = document.querySelector(
        "ion-item#password-input ion-input",
      ).value;
      const passwordConfirm = document.querySelector(
        "ion-item#password-confirmation-input ion-input",
      ).value;

      // Checker si les informations obligatoires sont entrées
      if (username && password && passwordConfirm) {
        const formData = new FormData();
        formData.append("username", username.trim());
        if (email) {
          formData.append("email", email);
        }
        formData.append("password", passwordConfirm);
        formData.append("password_confirmation", password);

        fetch(Globals.apiRoutes.register, {
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
              this.handleError(parsed);
            }
          })

          .catch(() => {
            this.showAlert("Impossible de se connecter à internet!");
          });
      }
    },

    handleError(parsed) {
      const passwordTooShortMessage =
        "Le mot de passe doit être d'au moins 6 caractères.\n";
      const passwordsNotMatchingMessage =
        "Les mots de passe ne concordent pas.\n";
      const usernameTakenMessage = "Le nom d'utilisateur est déjà pris.\n";
      const emailTakenMessage = "Le courriel est déjà pris.\n";
      if (parsed.errors) {
        let ionToastErrorMessage = "";
        if (parsed.errors.username)
          ionToastErrorMessage += usernameTakenMessage;
        if (parsed.errors.password) {
          // API response returns "The password must be at least 6 characters." and "The password confirmation does not match."
          if (parsed.errors.password.length === 2) {
            ionToastErrorMessage +=
              passwordTooShortMessage + passwordsNotMatchingMessage;
          }
          // API response returns only one password error
          else if (parsed.errors.password.length === 1) {
            ionToastErrorMessage +=
              parsed.errors.password[0] ===
              "The password must be at least 6 characters."
                ? passwordTooShortMessage
                : passwordsNotMatchingMessage;
          }
        }
        if (parsed.errors.email) ionToastErrorMessage += emailTakenMessage;

        this.showAlert(ionToastErrorMessage);
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

.ion-page {
  background: white;
}

p,
label {
  font-family: "Gotham Rounded Light", sans-serif;
}

#welcome {
  font-size: 20px;
  font-weight: bold;
}

.main-content {
  font-size: 14px;
  text-align: center;
  position: absolute;
  top: 15%;
  width: 100%;
  height: 85%;
}
.ios .main-content {
  top: 17%;
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

.redirect-to-login span {
  font-weight: bolder;
  border-bottom: 1px solid black;
}

ion-toast::part(message) {
  white-space: pre;
}
</style>

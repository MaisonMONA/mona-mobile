<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content>
        <div class="ion-margin">
          <!--TODO: trouver pourquoi ionChange ne fait rien-->
          <ion-input
              fill="outline"
              color="dark"
              type="text"
              @ionBlur="updateUsername($event)"
              label="Nom d'utilisateur"
              label-placement="floating"
              :value="username"
              v-model="username">
          </ion-input>

          <ion-input
              fill="outline"
              color="dark"
              @ionBlur="updateEmail($event)"
              label="Courriel"
              label-placement="floating"
              :value="email"
              v-model="email"
              type="email">
          </ion-input>

            <ion-input
                fill="outline"
                color="dark"
                @ionFocus="alertSetOpen(true)"
                label="Mot de passe"
                label-placement="floating"
                placeholder=""
                readonly="true"
                type="password">
            </ion-input>

            <ion-alert
                :is-open="alertIsOpen"
                header="Modifier votre mot de passe"
                :buttons="alertButtons"
                :inputs="alertInputs"
                class="custom-alert"
                @didDismiss=alertSetOpen(false)
            ></ion-alert>

          <ion-toast
              :is-open="toastIsopen"
              :message="toastMessage"
              position="bottom"
              :duration="5000"
              :icon="toastIcon"
              @didDismiss="toastSetOpen(false)"
          ></ion-toast>
        </div>
    </ion-content>
</template>



<script>

import {IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonToast, IonInput, IonAlert} from "@ionic/vue";
import {UserData} from "@/internal/databases/UserData";
import { checkmarkDoneOutline, checkmarkOutline, closeOutline} from 'ionicons/icons';
import Globals from "@/internal/Globals";
export default {
    name: "AboutContainer",
    computed: {
        UserData() {
            return UserData
        }
    },
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle, IonToast, IonInput, IonAlert,
    },
    created() {
      //TODO: faire ca dans pinia
      //notamment en allant chercher le token du local storage, puis faire un fetch pour obtenir tous les info necessaire.
      fetch(Globals.apiRoutes.user, {
        method: "GET",
        headers: {Authorization: `Bearer ${UserData.getToken()}`}
      }).then(async (response) => {
        const parsed = await response.json()
        if (response.ok) {
          this.email = parsed.email
        }
      }).catch((e) => {
        console.log(e)
      })
    },
  data() {
        return {
            username: UserData.getUsername(),
            email:"", //TODO UserData.getEmail(),
            password: "",
            passwordConfirmation: "",
            //Alert
            alertIsOpen: false,
            alertButtons: [
              {
                text: 'Annuler',
                role: 'cancel',
                cssClass: 'alert-button-cancel',
                handler: () => {
                  console.log('Alert canceled');
                },
              },
              {
                text: 'Confirmer',
                role: 'confirm',
                cssClass: 'alert-button-cancel',
                handler: (value) => {
                  this.password = value.nouveau
                  this.passwordConfirmation = value.confirmation
                  this.updatePassword()
                  console.log('Alert confirmed');
                },
              },
            ],
            alertInputs: [
              {
                name: 'nouveau',
                placeholder: 'Votre nouveau mot de passe',
                type: 'password',
              },
              {
                name: 'confirmation',
                placeholder: 'Entrer à nouveau le mot de passe',
                type: 'password',
              }
            ],
            //Toast
            toastMessage: "",
            toastIsopen: false,
            toastIcon: checkmarkOutline,
        }
    },
    setup() {
        return {closeOutline, checkmarkOutline , checkmarkDoneOutline,
        };
    },
    methods: {
      updateUsername() {
        const formData = new FormData();
        formData.append("new_username", this.username)

        fetch(Globals.apiRoutes.update.username, {
          method: "POST",
          headers: {Authorization: 'Bearer ' + UserData.getToken()},
          body: formData
        }).then(async (response) => {
                const parsed = await response.json()
                if (response.ok) {
                  if (!parsed.token){
                    console.log("server error")
                  }
                  UserData.setToken(parsed.token)
                  UserData.setUsername(this.username)
                  this.toast("success", "username")
                  //TODO mettre username reactif avec pinia
                } else {
                  //TODO émettre un message detaillé de l'erreur
                  this.toast("error", "username")
                }
              }).catch((e) => {
                console.log(e)
              })

      },

      updateEmail() {
        const formData = new FormData();
        formData.append("new_email", this.email)

        fetch(Globals.apiRoutes.update.email, {
          method: "POST",
          headers: {Authorization: 'Bearer ' + UserData.getToken()},
          body: formData
        }).then(async (response) => {
          const parsed = await response.json()
          if (response.ok) {
            if (!parsed.token){
              console.log("server error")
            }
            UserData.setToken(parsed.token)
            //TODO UserData.setEmail(this.email)
            this.toast("success", "email")
          } else {
            //TODO émettre un message detaillé de l'erreur
            this.toast("error", "email")
          }
        }).catch((e) => {
          console.log(e)
        })
      },
      updatePassword(){
        const formData = new FormData();
        formData.append("new_password", this.password)
        formData.append("new_password_confirmation", this.passwordConfirmation)

        fetch(Globals.apiRoutes.update.password, {
          method: "POST",
          headers: {Authorization: 'Bearer ' + UserData.getToken()},
          body: formData
        }).then(async (response) => {
          const parsed = await response.json()
          if (response.ok) {
            if (!parsed.token){
              console.log("server error")
            }
            UserData.setToken(parsed.token)
            this.toast("success", "password")
          } else {
            //TODO émettre un message detaillé de l'erreur
            this.toast("error", "password")
          }
        }).catch((e) => {
          console.log(e)
        })
      },
      alertSetOpen(state) {
        this.alertIsOpen = state;
      },
      toastSetOpen(state)  {
        this.toastIsopen = state;
      },
      toastPersonnalizeMessageIcon(result, word){
        if (result === "success"){
          this.toastMessage = "Le "+ word + " a été modifié avec succés"
          this.toastIcon = checkmarkDoneOutline
        } else {
          this.toastMessage = "Le " + word + "n'a pas pu être modifié"
          this.toastIcon = closeOutline
        }
      },
      toast(result, category){
        switch (category){
          case "username":
            this.toastPersonnalizeMessageIcon(result, "nom d'utilisateur")
            break
          case "email":
            this.toastPersonnalizeMessageIcon(result, "courriel")
            break
          case "password":
            this.toastPersonnalizeMessageIcon(result, "mot de passe")
            break
        }
        this.toastSetOpen(true)
      }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

.main-container {
    padding: 5vw;
}

ion-title {
    font-family: 'Gotham Rounded Light', sans-serif;
}

* {
    font-family: 'Open Sans', sans-serif;
}

p {
    margin-top: 2vw;
    margin-bottom: 2vw;
}

a {
    color: steelblue;
    text-decoration: none;
    font-weight: normal;
}

span.ion-text-left {
    margin-right: auto;
}
ion-input {
    --placeholder-color: black;
    --placeholder-font-weight: normal;
    --placeholder-font-style: normal;
    margin-bottom: 5%;
}

</style>

<template>
    <ion-header class="ion-no-border">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="RETOUR"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <div class="content">
            <p class="title bold">Attention</p>
            <p class="body">
                <span id="vousEtesSurLePointDeVouDeconnecter">Vous êtes sur le point de vous déconnecter.</span><br><br>Toutes les données de
                votre compte vont être supprimées. Si vous êtes certain·e de vouloir vous déconnecter, assurez-vous
                de bien connaître votre mot de passe!
              <br><br>Ces données pourront être récupérées lors de la reconnexion.
              <br><br>Votre nom d'utilisateur·rice est :
              <br>
              <span class="username-container bold">
                {{ username }}
              </span>
            </p>

            <div class="button-div">
                <ion-button fill="outline" class="go-back bold" @click="goBack">
                    ANNULER
                </ion-button>
            </div>
            <div class="button-div">
                <ion-button fill="outline" class="disconnect bold" @click="disconnectUser">
                    SE DÉCONNECTER
                </ion-button>
            </div>
        </div>
    </ion-content>
</template>

<script>
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "LogoutContainer",
    components: {
        IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton
    },

    data() {
        return {
            username: UserData.getUsername()
        }
    },

    methods: {
        goBack() {
            document.querySelector("ion-back-button").click();
        },

        async disconnectUser() {
            await UserData.clearLocalDataAndReset(false); // wipe local DBs and cache, keep tutorial flag

            // Go to main page
            this.$router.replace("/register")
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

ion-header {
  --background: transparent; /* Make the background transparent */
  height: 9vh;
}

ion-header::after { background-image: none; }

ion-toolbar {
  --background: transparent; /* Also make the toolbar transparent */
}

.bold {
    font-weight: bold;
}

ion-back-button {
  margin-left: 3.9vw;
  color: #2E389E;
  border: solid 1px #2E389E;
  border-radius: 1vw;
}

ion-back-button::part(native) {
  padding: 0 2vw;
  font-size: 3.5vw;
}

#vousEtesSurLePointDeVouDeconnecter{
  padding-left: 4vw;
}

p {
  font-size: 4vw;
    font-family: 'Open Sans', sans-serif;
    margin: 0 4vw;
    line-height: 2.6vh;
}

.title {
    font-weight: bold;
    font-family: 'Gotham Rounded Light', sans-serif;
    font-size: 5vw;
    margin-top: 11.5vh;
    text-align: center;
}

.body {
    margin-top: 3vh;
}

.username-container {
    font-weight: 700;
    margin-top: 3vh;
    margin-bottom: 5vh;
    line-height: 4vh;
    font-size: 6.3vw;
}

.go-back {
  --color: #757DD7;
  --border-color: #757DD7;
  --border-radius: 2vw;
  --border-width: 2px;
  --background: none;
  width: 92vw;
  height: 5vh;
  position: absolute;
  bottom: 17.7vh;
  margin: 0 4vw;
  --background-activated : #757DD7;
  --color-activated : white;
  font-size: 4vw;
}

.button-div {
    display: block;
}

.disconnect {
  --color: #D82727;
  --border-color: #D82727;
  --border-radius: 2vw;
  width: 92vw;
  height: 5vh;
  position: absolute;
  bottom: 25.7vh;
  margin: 0 4vw;
  --background-activated : #D82727;
  --color-activated : white;
  font-size: 4vw;
}

</style>

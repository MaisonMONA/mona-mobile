<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content>
        <div class="content">
            <p class="title bold">Attention</p>
            <p class="body">
                <span>Vous êtes sur le point de vous déconnecter.</span><br><br>Toutes les données de
                votre compte vont être supprimées. Si vous êtes certain·e de vouloir vous déconnecter, assurez-vous
                de bien connaître votre mot de passe ! Ces données pourront être récupérées lors de la reconnexion.
              <br><br>Votre nom d'utilisateur·rice est :
              <br>
            </p>
            <p class="username-container bold">
                {{ username }}
            </p>
            <div class="button-div">
                <ion-button fill="outline" class="go-back bold" @click="goBack">
                    ANNULER
                </ion-button>
            </div>
            <div class="button-div">
                <ion-button fill="outline" class="disconnect bold" @click="disconnectUser">
                    Se déconnecter
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

        disconnectUser() {
            UserData.resetPreferences(false); // `false` to keep hasSeenTutorial to true

            // Go to main page
            this.$router.replace("/register")
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.bold {
    /*display: block;*/
    /*font-family: 'Gotham Rounded Light', sans-serif;*/
    /*font-family: 'Open Sans', sans-serif;*/
    font-weight: bold;
}

ion-back-button {
  color: black;
}

p {
    position: relative;
    font-family: 'Open Sans', sans-serif;
    text-align: center;
    max-width: 80vw;
    left: 10vw;
}

.title {
    font-weight: bold;
    font-family: 'Gotham Rounded Light', sans-serif;
    font-size: 24px;
    margin-top: 15vh;
}

.body {
    margin-top: 3vh;
}

.username-container {
    font-weight: bold;
    margin-top: 3vh;
    margin-bottom: 5vh;
}

.disconnect, .go-back {

}

.go-back {
  --color: #757DD7;
  --border-color: #757DD7;
  --border-radius: 2vw;
  --background: none;
  width: 88vw;
  height: 5vh;
  position: absolute;
  bottom: 3.7vh;
  left: 5.7vw;
  --background-activated : #757DD7;
  --color-activated : white;
}

.button-div {
    display: block;
}

.disconnect {
  --color: #D82727;
  --border-color: #D82727;
  --border-radius: 1vw;
  width: 88vw;
  height: 5vh;
  position: absolute;
  bottom: 10.7vh;
  left: 5.7vw;
  --background-activated : #D82727;
  --color-activated : white;
}

</style>

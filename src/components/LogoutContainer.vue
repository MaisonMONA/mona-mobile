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
        <div class="content">
            <p class="title bold">Attention</p>
            <p class="body">
                <span class="bold">Vous êtes sur le point de vous déconnecter.</span><br><br>Toutes les données de
                votre compte vont être supprimées. Si vous êtes certain·e de vouloir vous déconnecter, assurez-vous
                de bien connaître votre mot de passe ! Ces données pourront être récupérées lors de la reconnexion.
                Votre nom d'utilisateur est :
            </p>
            <p class="username-container bold">
                {{ UserData.getUsername() }}
            </p>
            <div class="button-div">
                <ion-button color="success" class="go-back bold" @click="goBack">
                    Revenir en arrière
                </ion-button>
            </div>
            <div class="button-div">
                <ion-button color="danger" fill="outline" class="disconnect bold" @click="disconnectUser">
                    Se déconnecter
                </ion-button>
            </div>
        </div>
    </ion-content>
</template>

<script>
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "LogoutContainer",
  computed: {
    UserData() {
      return UserData
    }
  },
    components: {
        IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonButton
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
    position: relative;
    margin-top: 1vh;
    left: 50vw;
    transform: translateX(-50%);
}

.button-div {
    display: block;
}

</style>

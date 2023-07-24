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
        <ion-input label="Nom d'utilisateur" label-placement="floating" fill="outline" placeholder="Enter text"></ion-input>
        <ion-input label="Courriel" label-placement="floating" fill="outline" placeholder="Enter text"></ion-input>
        <ion-input label="Mot de passe" label-placement="floating" fill="outline" placeholder="Enter text"></ion-input>

    </ion-content>
</template>



<script>
import {IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonInput } from "@ionic/vue";
import { defineComponent } from 'vue';
export default {
    name: "AboutContainer",
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle, IonInput
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
</style>

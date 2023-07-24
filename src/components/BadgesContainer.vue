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
        <div class="main-container">
            <h1>Badges</h1>
                <img alt="count 1" src="@/assets/drawable/badges/count/locked/count1.svg" />

            <h1>Catégories</h1>
                <img alt="Murale" src="@/assets/drawable/badges/category/locked/Murale.svg" />

            <h1>Quartier</h1>
            <img alt="LaSalle" src="@/assets/drawable/badges/borough/locked/LaSalle.svg" />

        </div>
    </ion-content>
</template>

<script>
import { IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle } from "@ionic/vue";

export default {
    name: "BadgesContainer",
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle,
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

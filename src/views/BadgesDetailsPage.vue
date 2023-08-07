<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <!-- TODO: complété la page badges details
            Titre
            Photo du badge
            Bar de progression
            Message
            -->

        </ion-content>

    </ion-page>
</template>


<script>

import {defineComponent} from "vue";
import {IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/vue";

export default defineComponent({
    name: "badges-details",
    components: {IonContent, IonTitle, IonPage, IonToolbar, IonHeader, IonBackButton, IonButtons}

})
</script>

<style>

</style>
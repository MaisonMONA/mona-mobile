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
            <p>{{badge.title.fr}}</p>
            <img :alt="message" :src="getImgUrl()" />
            <!--
            <p>{{count + '/' + badge.required_count}}</p>
            <ion-progress-bar :value="(this.count / badge.required_count).toFixed(2)"></ion-progress-bar>-->
            <ion-progress-bar :value="(0.5 / badge.required_count).toFixed(2)"></ion-progress-bar>
            <p>{{message}}</p>
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
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonProgressBar,
    IonTitle,
    IonToolbar
} from "@ionic/vue";
import {BadgeDatabase} from "@/internal/databases/BadgeDatabase";

export default defineComponent({
    name: "badges-details",
    components: {IonProgressBar, IonContent, IonTitle, IonPage, IonToolbar, IonHeader, IonBackButton, IonButtons},
    data(){
        return {
            id: this.$route.params.id,
            badge: BadgeDatabase.getFromId(this.$route.params.id),
            message: this.$route.params.message,
            count: this.$route.params.count,
            type: this.$route.params.type
        }
    },
    methods: {
        getImgUrl() {
            const pathlocked = "drawable/badges/count/locked/"
            /*
            const pathUnlocked = "drawable/badges/count/unlocked/"
            if (this.badge.required_count === this.count)
                return require('../assets/'+ pathUnlocked + this.id + '.svg')
            */
            return require('../assets/'+ pathlocked + this.id + '.svg')
        },
    }

})
</script>

<style>

</style>
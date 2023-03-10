<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <div class="rating">
            <p class="hint">Notez l'œuvre</p>
            <ul>
                <li :key="st" v-for="st in 5" @click="updateRating(st)">
                    <ion-icon size="large" :icon="st <= givenRating ? star : starOutline"></ion-icon>
                </li>
            </ul>
        </div>
        <div class="comment">
            <p class="hint">Commentaire</p>
            <ion-item class="commentForm" counter="true">
                <ion-input id="input" maxlength="300"></ion-input>
            </ion-item>
        </div>
        <ion-button fill="solid" @click="submitDiscovery()">Envoyer</ion-button>
    </ion-page>
</template>

<script>
import { IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonInput, IonButton, IonItem } from "@ionic/vue";
import {starOutline, star, camera } from "ionicons/icons";

import { UserData } from "@/internal/databases/UserData";
import Globals from "@/internal/Utils";


export default {
    name: "DiscoveryReviewPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonIcon, IonInput, IonButton, IonItem
    },
    data() {
        return {
            starOutline, star, camera,
            givenRating: 0,
        }
    },

    methods: {
        updateRating(rating) {
            this.givenRating = rating;
        },
        submitDiscovery() {
            const id = this.$route.query.id;
            const type = this.$route.query.type;

            const { imagepath } = UserData.getCollected(parseInt(id), type);
            const comment = document.getElementById("input").value;

            UserData.editCollected(type, { id, imagepath, rating: this.givenRating, comment });
            Globals.sendPictureAndDetails(id, type);

            // Redirect to the previous page
            this.$router.go(-1);
        },
    },
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
.ion-page {
    background: white;
}

.comment p {
}

ion-icon {
    color: var(--mona-yellow)
}

.rating {
    position: absolute;
    top: 35%;
    width: 100%;
    text-align: center;
}

.hint {
    font-family: 'Gotham Rounded Light', sans-serif;
}

ul {
    padding: 0;
}

li {
    display: inline-block;
}

.commentForm {
    position: absolute;
    top: 50%;
    width: 70%;
    left: 15%;
    text-align: center;
    margin-top: 15%;
}

.comment {
    text-align: center;
    margin-top: 50%;
    /*bottom: 20%;*/
}

ion-button {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 35%;
}

</style>

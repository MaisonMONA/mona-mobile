<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="more-page-header">
                <p>{{ username }}</p>
            </div>
            <ion-list :inset="true">
                <ion-nav-link router-direction="forward" :component="/* todo */ ''"> <!-- todo -->
                    <ion-item>
                        <ion-label>Tutoriel</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
                <ion-nav-link router-direction="forward" :component="whoweare">
                    <ion-item>
                        <ion-label>Qui sommes-nous ?</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
                <ion-nav-link router-direction="forward" :component="about">
                    <ion-item>
                        <ion-label>À propos</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonNavLink, IonLabel, IonIcon } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import AboutContainer from "@/components/AboutContainer.vue";
import { arrowForward } from "ionicons/icons";
import WhoWeAreContainer from "@/components/WhoWeAreContainer.vue";

export default {
    name: "MorePageContainer",
    components: {
        IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonNavLink, IonLabel, IonIcon, IonPage
    },

    data() {
        return {
            username: UserData.getUsername(),
            about: AboutContainer,
            whoweare: WhoWeAreContainer,
            arrowForward,
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.more-page-header {
    height: 25%;
    background: var(--blue-powder);
    display: flex;
}

.more-page-header p {
    color: white;
    font-family: 'Open Sans', sans-serif;
    font-size: 8vw;
    font-weight: 500;
    align-self: flex-end;
    padding: 8vw;
}

ion-icon, ion-label {
    color: black;
}
</style>

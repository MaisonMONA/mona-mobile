<template>
        <div class="main-container">
            <div style="display: flex; justify-content: space-between; align-items: center">
                <h1 style="margin-top: 0">Badges</h1>
                <span>1/22</span>
            </div>

            <ion-segment :scrollable="true" >
                <div v-for="e in [1,2,3]" :key="e" id="badgeContainer" class="ion-margin-end border ion-padding">
                        <img alt="count {{e}}" src="@/assets/drawable/badges/count/locked/count1.svg" style="width: 70%"/>
                        <span style="white-space: normal; margin-top: 2%">Item {{e}} dssdgfsf</span>
                </div>
            </ion-segment>

            <h1>Catégories</h1>
            <ion-row v-for="e in [1,2,3]" :key="e" class="ion-margin-bottom ion-margin-top border">
                <ion-col size="auto">
                    <img alt="Murale" src="@/assets/drawable/badges/category/locked/Murale.svg" />
                </ion-col>
                <ion-col>
                    <div id="container_progression">
                        <ion-label>Item {{e}}</ion-label>
                        <div id="progressBar" class="ion-margin-top">
                            <span class="ion-margin-end">1/5</span>
                            <ion-progress-bar value="0.25"></ion-progress-bar>
                        </div>
                    </div>
                </ion-col>
            </ion-row>

            <h1>Quartier</h1>
            <ion-row v-for="e in [1,2,3]" :key="e" class="ion-margin-bottom ion-margin-top border">
                <ion-col size="auto">
                    <img src="@/assets/drawable/badges/borough/locked/LaSalle.svg" alt="LaSalle" />
                </ion-col>
                <ion-col>
                    <div id="container_progression">
                            <ion-label>Item {{e}}</ion-label>
                            <div id="progressBar" class="ion-margin-top">
                                <span class="ion-margin-end">1/5</span>
                                <ion-progress-bar value="0.25"></ion-progress-bar>
                            </div>
                    </div>
                </ion-col>
            </ion-row>
        </div>

</template>

<script>

import {IonSegment, IonLabel, IonProgressBar, IonRow, IonCol} from "@ionic/vue";

export default {
    name: "BadgesContainer",
    components: {
        IonSegment, IonLabel, IonProgressBar, IonRow, IonCol
    },

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

.border {
    border-style: solid;
    border-color: #D9D9D9;
    border-radius: 11px;
    border-width: 1.4px
}

#container_progression{
    position:absolute; top: 50%;
    transform: translateY(-50%);
    width: 95%;
}

#progressBar {
    display: flex;
    flex-direction: row;
    justify-content:space-between;
    align-items: center
}
#badgeContainer {
    display: flex;
    flex-direction: column;
    width: 25%;
    justify-content: center;
    align-items: center;

}
</style>

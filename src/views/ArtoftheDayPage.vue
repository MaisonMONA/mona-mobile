<template>
  <ion-page>

    <ion-header>
        <TopToolbarContainer/>
    </ion-header>

    <ion-content :fullscreen="true">
        <ArtOfTheDayContainer/>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonHeader, IonContent } from '@ionic/vue';

// Icons
import TopToolbarContainer from "@/components/TopToolbarContainer.vue";
import ArtOfTheDayContainer from "@/components/ArtOfTheDayContainer.vue";

export default {
    name: "artwork-of-the-day",
    components: {
        ArtOfTheDayContainer,
        TopToolbarContainer,
        IonPage, IonHeader, IonContent,
    },
}

</script>

<style>
#heading * {
    padding-top: 0.3em;
}

#heading {
    height: 20vh; padding-left: 20%; color: white; font-size: 64px; background-color: #cbcef5;
}

#AOD-title {
    font-size: x-large;
    font-weight: bolder;
}

#pagetitle {
    padding-left: 1em;
    line-height: 30px;
    font-weight: bold;
    vertical-align: middle;
    display: inline-block;
    font-size: 32px;
}

#header-AOD {
    font-size: 65px; vertical-align: middle; display: inline-block
}

#pinicon {
    position: absolute;
    width: 35%;
    right: 10%
}

#cameraicon {
    position: absolute;
    width: 35%;
    left: 10%;
}

#AOD-artist {
    font-weight: lighter;
    font-size: large;
}

#AOD-info {
    margin-left: 10%;
}

#AOD-category {
    font-size: small;
    margin-top: 1em;
}

#mapicon {
    position: absolute;
    display: block;
    margin: 0 auto;
    bottom: 20%;
    width: 80%;
    height: 15%;
}

#reroll {
    color: black;
    position: absolute;
    bottom: 10%;
    right: 5%;
}
</style>

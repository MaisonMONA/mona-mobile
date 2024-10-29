<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <img src="/assets/drawable/mona_logo_med.png" alt="MONA logo" />
      <ion-button
          @click="nextSlide"
          v-if="pageNumber === 1 || pageNumber === 9"
          :style="{
            width: pageNumber === 9 ? '92vw' : '55.5vw',
            left: pageNumber === 9 ? '50vw' : '68.3vw',
          }"
      >{{ pageNumber < 9 ? "SUIVANT" : "COMMENCER L'EXPÉRIENCE" }}
        <ion-icon
            v-if="pageNumber === 1"
            :icon="chevronForwardOutline"
        ></ion-icon>
      </ion-button>
      <div
        class="page"
        @click="
          !(pageNumber === 1 || pageNumber === 9) ? pageNumber++ : pageNumber
        "
      >
        <p id="tutorialTitle">
          {{
            pageNumber === 1
              ? "Bienvenue dans le tutoriel"
              : pageNumber < 9
                ? "Découvrez l'art qui vous entoure"
                : "C’est parti!"
          }}
        </p>
        <p
          v-if="!(pageNumber === 2 || pageNumber === 9)"
          :style="{
            bottom: pageNumber > 2 && pageNumber < 9 ? '90vh' : '4.8vh',
            left: pageNumber > 2 && pageNumber < 9 ? '78vw' : '11vw',
          }"
          @click="returnBack"
          id="passer"
        >
          PASSER
        </p>

<!--        <img
          class="background-blurred"
          :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`"
        />-->
        <ion-progress-bar class="progressBarTutorial"
          v-if="!(pageNumber === 1 || pageNumber === 9)"
          :value="(pageNumber / 9).toFixed(2)"
        ></ion-progress-bar>
        <div class="content"
        :style="{height: pageNumber===1 ? '45.5vh' : (pageNumber === 9 ? '50vh' : '55.4vh'),
        width: pageNumber === 9 ? '50vw' : '92vw', left: pageNumber === 9 ? '25vw' : '3.9vw',
        top: pageNumber===9 ? '25vh' : '31vh'}">
          <img v-if="pageNumber!==9" :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`" alt="tutorial content"/>
          <img v-if="pageNumber===3" :src="`./assets/drawable/tutorial/map_example.png`" alt="map example">
          <img v-if="pageNumber===4" :src="`./assets/drawable/tutorial/nearest_discoveries_example.png`" alt="example closest discoveries app photo">
          <img v-if="pageNumber===9" :style="{borderRadius: '4vw'}" :src="`./assets/drawable/tutorial/closest_discoveries_fullscreen.PNG`" alt="example closest discoveries fullscreen app photo">
        </div>
        <p v-if="pageNumber===9" id="termsAndConditions">En poursuivant, vous indiquez que vous avez lu et compris <span class="underline">les conditions d’utilisation</span> et que vous acceptez de les respecter pour utiliser l'application.</p>
        </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonProgressBar,
} from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import { chevronForwardOutline } from "ionicons/icons";

export default {
  name: "TutorialPage",
  components: {
    IonProgressBar,
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
  },

  data() {
    return {
      pageNumber: 1,
      chevronForwardOutline,
    };
  },

  methods: {
    nextSlide() {
      if (this.pageNumber < 9) this.pageNumber++;
      else {
        this.returnBack();
      }
    },
    returnBack() {
      // The user played the tutorial form `/tabs/more`, don't check perms
      if (this.$route.query.callbackurl) {
        this.$router.replace(this.$route.query.callbackurl);
        return;
      }

      UserData.setSeenTutorial(true);
      this.$router.replace("/register");
    },
  },
};
</script>

<style scoped>

.underline {
  text-decoration: underline;
  text-underline-offset: 0.3vw;
}

#termsAndConditions {
  position: absolute;
  margin: 0 4vw;
  bottom: 10vh;
  font-size: 3.4vw;
  line-height: 4.8vw;
  text-align: center;
}

.content {
  position: absolute;
  background: white;
  width: 92vw;
  left: 3.9vw;
  height: 45.5vh;
  top: 28vh;
  border-radius: 7vw;
}

ion-progress-bar.progressBarTutorial {
  margin: 0 19vw;
  position: absolute;
  bottom: 3.6vh;
  max-width: 61vw;
  min-height: 1vh;
  left: 1.5vw;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  --background: #F3F2F7;
  --progress-background: #171C4F;
}

ion-progress-bar::part(progress) {
  border-radius: 90vw;
}

#tutorialTitle {
  position: absolute;
  top: 13.4vh;
  left: 7.7vw;
  font-size: 9.7vw;
  font-weight: bold;
  z-index: 3;
}

img[alt="MONA logo"] {
  position: absolute;
  left: 4vw;
  top: 7vh;
  max-width: 35vw;
  max-height: 4vh;
  z-index: 3;
}

* {
  margin: 0;
  padding: 0;
}

div.page {
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: linear-gradient(#dadcf1, #b5bae3);
}

#passer {
  position: absolute;
  color: black;
  left: 11vw;
  z-index: 3;
  font-size: 4.3vw;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}

ion-button {
  --background: #4d58cb;
  --background-activated: #444a84;
  height: 5.4vh;
  width: 55.5vw;
  --border-radius: 2vw;
  position: absolute;
  bottom: 0.6%;
  left: 68.3%;
  transform: translate(-50%, -50%);
  z-index: 3;
  --color: white;
  font-size: 4vw;
}

img {
  position: absolute;
  object-fit: contain;
  z-index: 2;
  bottom: 0;
}

img[alt="example closest discoveries fullscreen app photo"] {
  object-fit: contain;
  overflow: hidden;
}

img[alt="example closest discoveries app photo"] {
  left: 5.8vw;
  top: 10vh;
  width: 81vw;
  border-radius: 4vw;
}

img[alt="map example"] {
  width: 81vw;
  left: 5.8vw;
  bottom: 5vh;
  height: 24vh;
  border-radius: 4vw;
}

img.background-blurred {
  object-fit: cover;
  filter: blur(20px);
  z-index: 1;
}

/*.background {*/
/*    z-index: 1;*/
/*    background: linear-gradient(to top right, #656EB8, #55F454, #FADA00);*/
/*    height: 100%;*/
/*    width: 100%;*/
/*}*/
</style>

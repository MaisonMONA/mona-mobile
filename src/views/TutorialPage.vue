<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <p
          v-if="!(pageNumber === 2 || pageNumber === 9)"
          :class="(pageNumber > 2 && pageNumber < 9) ? 'toTopRight' : 'toBottomLeft'"
          @click="returnBack"
          id="passer"
      >
        PASSER
      </p>
      <ion-progress-bar class="progressBarTutorial"
                        v-if="!(pageNumber === 1 || pageNumber === 9)"
                        :value="(pageNumber / 9).toFixed(2)"
      ></ion-progress-bar>

      <div
        class="page"
        @click="
          !(pageNumber === 1 || pageNumber === 9) ? pageNumber++ : pageNumber
        "
      >
        <div class="tutorialHeader">
          <img src="/assets/drawable/mona_logo_med.png" alt="MONA logo"/>
          <p class="tutorialTitle">
            {{
                pageNumber === 1
                ? "Bienvenue dans le tutoriel"
                : pageNumber < 9
                    ? "Découvrez l'art qui vous entoure"
                    : "C’est parti!"
            }}
          </p>
      </div>
<!--        <img
          class="background-blurred"
          :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`"
        />-->

        <div v-if="!(pageNumber===9)" :style="{height: pageNumber===1 ? '45.5vh' :  '55.4vh'}" class="tutorial_content">
          <img v-if="pageNumber!==9" :style="{height: pageNumber===1 ? '45.5vh' :  '55.4vh'}" :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`" alt="tutorial background content"/>
          <img v-if="pageNumber===3" :src="`./assets/drawable/tutorial/page 3 photo.jpeg`" alt="page 3 photo">
          <img v-if="pageNumber===4" :src="`./assets/drawable/tutorial/page 4 photo.png`" alt="page 4 photo">
          <img v-if="pageNumber===6" :src="`./assets/drawable/tutorial/page 6 photo.png`" alt="page 6 photo">
          <img v-if="pageNumber===7" :src="`./assets/drawable/tutorial/page 7 photo.png`" alt="page 7 photo">
          <img v-if="pageNumber===8" :src="`./assets/drawable/tutorial/page 8 photo.png`" alt="page 8 photo">
        </div>
        <img v-if="pageNumber===9" :src="`./assets/drawable/tutorial/page 9 photo.png`" alt="page 9 photo">

        </div>

      <p v-if="pageNumber===9" id="termsAndConditions">En poursuivant, vous indiquez que vous avez lu et compris
        <a href="https://monamontreal.org/politique-confidentialite.html" class="underline">les conditions d’utilisation</a>
        et que vous acceptez de les respecter pour utiliser l'application.</p>
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

* {
  margin: 0;
  padding: 0;
}

.underline {
  color: black;
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

.tutorial_content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92vw;
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

.tutorialTitle {
  /*position: absolute;
  top: 13.4vh;
  left: 7.7vw;*/
  font-size: 9.7vw;
  font-weight: 500;
  z-index: 3;
}

ion-content {
  --background: none;
  background: linear-gradient(#dadcf1, #b5bae3);
}

div.page {

  /*overflow: hidden;
  height: 100%;
  width: 100%;
  background: linear-gradient(#dadcf1, #b5bae3);*/
  padding: 3vh 4vw;
}
.ios div.page {
  padding: 0 4vw;
  padding-top: 6vh;
}

#passer {
  position: absolute;
  color: black;
  left: 11vw;
  bottom: 4.8vh;
  z-index: 3;
  font-size: 4.3vw;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}
#passer.toTopRight {
  bottom: 94vh;
  left: 78vw;
}
.ios #passer.toTopRight {
  bottom: 91vh;
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

.tutorialHeader {
  padding: 0 4vw;
  margin-right: 4.8vw;
  margin-bottom: 8vh;
}

img[alt="MONA logo"] {
  margin-bottom: 2.7vh;
  max-width: 30vw;
  max-height: 4vh;
  z-index: 3;
}

img[alt="page 9 photo"] {
  border-radius: 4vw;
  height: 50vh;
  position: absolute;
  top:0;
  bottom: 0;
  left: 0;
  right: 0;

  margin: auto;
}


img[alt="page 8 photo"] {
  margin: 0 5.8vw;
  position: absolute;
  margin-top: 51%;
  height: 51%;
  border-radius: 4vw;
  border: 1px solid #BFBFBF;
}

img[alt="page 7 photo"] {
  margin: 5% 5.8vw;
  position: absolute;
  margin-top: 55%;
  height: 49%;
  border-radius: 4vw;
  border: 1px solid #BFBFBF;
}

img[alt="page 6 photo"] {
  margin: 5% 5.8vw;
  position: absolute;
  margin-top: 40%;
  height: 60%;
  border-radius: 4vw;
}

img[alt="page 4 photo"] {
  margin: 0 5.8vw;
  position: absolute;
  margin-top: 11%;
  height: 78%;
  border-radius: 4vw;
}

img[alt="page 3 photo"] {
  height: 43%;
  margin: 0 5.8vw;
  position: absolute;
  margin-top: 50%;
  border-radius: 4vw;
}

img[alt="tutorial background content"] {
  width: 92vw;
  z-index: 0;
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

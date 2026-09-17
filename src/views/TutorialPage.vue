<template>
  <ion-page>
    <ion-content :fullscreen="true" :class="{ 'bg-lines': pageNumber === 2 }">

      <div @click="handlePageTap">
        <div class="tutorialHeader" 
        :style="{padding: pageNumber === 1 ? '7.59vh 10vw 0' : 
                          (pageNumber === 2 || pageNumber === maxPageNumber) ? '7.59vh 6vw 0' : null}">
          {{
              pageNumber === 1
              ? "Bienvenue dans le tutoriel"
                : pageNumber === 2
                ? "Découvrez l'art qui vous entoure"
                  : pageNumber === maxPageNumber
                  ? "À vous de jouer, la découverte commence!"
                    : null
          }}
        </div>

        <div v-if="pageNumber===1" class="tutorial_page_1_content">
          
          <img :src="`./assets/drawable/tutorial/page 1.svg`"/>
          <p>MONA est produit par la Maison MONA, un organisme à but non lucratif basé à Montréal (QC).</p>
          <p>Le projet est bâti en collaboration avec le groupe de recherche art+site à l’Université de Montréal.</p>

        </div>
        <div v-if="pageNumber===2" class="tutorial_page_2_content">

          <img :src="`./assets/drawable/tutorial/page_2_app_screenshots_examples.png`">
          <ol class="steps">
            <li>Identifiez des découvertes à proximité</li>
            <li>Prenez-les en photo</li>
            <li>Créez votre propre collection!</li>
          </ol>

        </div>
        <div v-if="pageNumber===3" class="tutorial_page_3_content">

          <img :src="`./assets/drawable/tutorial/page_3_map_screenshot.png`"/>

        </div>
        <div v-if="pageNumber===4" class="tutorial_page_4_content">

          <img :src="`./assets/drawable/tutorial/page_4_app_screenshot.svg`"/>

        </div>
        <div v-if="pageNumber===5" class="tutorial_page_5_content">

          <img id="collectionHeaderExample" :src="`./assets/drawable/tutorial/page_5_collection_header_example.svg`"/>
          <img id="collectionImagesScreenshotExample" :src="`./assets/drawable/tutorial/page_5_collection_images_screenshot_example.png`"/>

        </div>
        <div v-if ="pageNumber===maxPageNumber" class="tutorial_page_6_content">

          <img :src="`./assets/drawable/tutorial/page_6_little_characters_plus_app_screenshots_examples.svg`"/>

        </div>

        <p id="tutorialDisclaimer">

          <template v-if="pageNumber===1">
          Les données que nous recueillons servent uniquement à la recherche académique. Ce projet entièrement non-commercial n’implique aucun tiers.
          </template>

          <template v-if="pageNumber===maxPageNumber">
          En poursuivant, vous indiquez que vous avez lu et compris
          <a href="https://monamontreal.org/politique-confidentialite.html" class="underline">les conditions d’utilisation</a>
          et que vous acceptez de les respecter pour utiliser l'application.
          </template>

        </p>
      </div>

      <div id="tutorialBottomBar" 
      :style="{height: pageNumber === 3 ? '35.27vh' : 
                        pageNumber === 4 ? '59.38vh' : 
                        pageNumber === 5 ? '38.84vh' : null}">
        
        <ion-button v-if="pageNumber >= 3 && pageNumber <= 5"
          id="carteAnnuaireCollection" 
          :style="{width: pageNumber === 3 ? '26.5vw' : 
                          pageNumber === 4 ? '35.51vw' : 
                          pageNumber === 5 ? '36.96vw' : null}"
        >

          <ion-icon :icon="`./assets/drawable/icons/active_${pageNumber === 3 ? 'map' : 
                                                              pageNumber === 4 ? 'list' : 
                                                              pageNumber === 5 ? 'collection' : null}_tab_icon.svg`"/>
          <ion-label>
            {{ pageNumber === 3 ? "Carte" : 
                pageNumber === 4 ? "Annuaire" : 
                pageNumber === 5 ? "Collection" : null }}
          </ion-label>

        </ion-button>

        <p id="tutorialBottomBarText"> {{ 
          pageNumber === 3 ? "En autorisant l’application à accéder à votre géolocalisation, vous pourrez vous situer en temps réel." : 
            pageNumber === 4 ? "Découvrez près de 1500 œuvres d’art, 1400 biens patrimoniaux et 800 bibliothèques et lieux culturels au Québec." : 
              pageNumber === 5 ? "Retrouvez toutes vos découvertes dans votre collection personnelle et accédez aux badges récompensant vos efforts de collectionneur·se MONA." : 
              null 
          }}
        </p>

        <img v-if="pageNumber===4" style="margin-top: 2.68vh; width: 92vw;" :src="`./assets/drawable/tutorial/page_4_bottom_bar_content.svg`">
        
        <p
          v-if="pageNumber !== maxPageNumber"
          @click="returnBack"
          id="passer"
        >
          QUITTER
        </p>

        <ion-button id="next"
          @click="nextSlide" :style="{width: pageNumber === maxPageNumber ? '92.27vw' : '54.7vw'}"
        >
          {{ pageNumber === 1 ? "COMMENCER" : (pageNumber < maxPageNumber ? "SUIVANT" : "C'EST PARTI !") }}
        </ion-button>

        <div class="progress-dots">
          <div 
            v-for="n in maxPageNumber" 
            :key="n" 
            class="progress-dot"
            :class="{ 'active': pageNumber >= n }"
          ></div>
        </div>
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
      maxPageNumber: 6,
    };
  },

  methods: {
    handlePageTap() {
      if (this.pageNumber === 1 || this.pageNumber === this.maxPageNumber) return;
      this.nextSlide();
    },
    nextSlide() {
      if (this.pageNumber < this.maxPageNumber) this.pageNumber++;
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

.tutorial_page_1_content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92vw;
  gap: 2.68vh;
  margin: 0 4vw;
}
.tutorial_page_1_content p {
  width: 84.5vw;
  font-family: 'Open Sans', sans-serif;
  font-size: 3.86vw;
  text-align: center;
}
.tutorial_page_1_content img {
  width: 78.5vw;
  height: 17.97vh;
  margin-top: 10.49vh;
}

.tutorial_page_2_content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92vw;
  margin: 0 4vw;
}
.tutorial_page_2_content img {
  width: 92vw;
  height: auto;
  margin-top: 4vh;
}
.steps {
  position: relative;
  list-style: none;
  counter-reset: step;
  display: flex;
  flex-direction: column;
  gap: 4.02vh;
  padding-left: 8.75vw;
  margin-top: 4vh;
}
.steps li {
  counter-increment: step;
  position: relative;
  font-family: 'Open Sans', sans-serif;
  font-size: 3.86vw;
  /* each step fades in one after the other (delays set below) */
  animation: stepIn 0.55s ease-out both;
}
.steps li:nth-child(1) { animation-delay: 0.25s; }
.steps li:nth-child(2) { animation-delay: 1.15s; }
.steps li:nth-child(3) { animation-delay: 2.05s; }

@keyframes stepIn {
  from {
    opacity: 0;
    transform: translateY(2vh);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* circles */
.steps li::before {
  content: counter(step);
  position: absolute;
  left: -10vw;
  top: 50%;
  transform: translateY(-50%);
  width: 8vw;
  height: 8vw;
  border-radius: 50%;
  background: #FADA00;
  display: grid;
  place-items: center;
  font-weight: 400;
}
/* connector line behind the circles */
.steps li:not(:last-child)::after {
  content: "";
  position: absolute;
  left: -6.2vw;
  top: 50%;
  width: 0.4vw;
  height: calc(100% + 4vh);
  background: #FADA00;
  z-index: -1;
  /* the line draws itself downwards, bridging to the next step */
  transform-origin: top center;
  animation: lineGrow 0.4s ease-out both;
}
.steps li:nth-child(1)::after { animation-delay: 0.9s; }
.steps li:nth-child(2)::after { animation-delay: 1.8s; }

@keyframes lineGrow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

/* honour the OS "reduce motion" setting */
@media (prefers-reduced-motion: reduce) {
  .steps li,
  .steps li:not(:last-child)::after {
    animation: none;
  }
}

.tutorial_page_3_content img {
  width: 100%;
}

.tutorial_page_4_content img {
  display: block;
  width: 100%;
  height: auto;
}

.tutorial_page_5_content {
  margin: 0 4vw;
}
.tutorial_page_5_content img {
  width: 92.3vw;
  height: auto;
}
.tutorial_page_5_content #collectionHeaderExample {
  margin-top: 3.57vh;
}
.tutorial_page_5_content #collectionImagesScreenshotExample {
  margin-top: 2.68vh;
}

.tutorial_page_6_content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 4vw;
}
.tutorial_page_6_content img {
  width: 90.34vw;
  height: auto;
  margin-top: 3.9vh;
  /* the artwork sits ~2% left of center inside its own viewBox
     (phones span 0.77->359.11 of a 374-wide frame), so nudge it back */
  transform: translateX(1.8vw);
}

#tutorialDisclaimer {
  font-family: 'Open Sans', sans-serif;
  color: #333333;
  position: absolute;
  bottom: 13.8vh;
  font-size: 3.38vw;
  text-align: center;
  width: 92vw;
  margin: 0 4vw;
}

.progress-dots {
  position: absolute;
  bottom: 2.68vh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  width: 70vw;
}

.progress-dot {
  width: 5.31vw;
  height: 0.4469vh;
  border-radius: 99px;
  background-color: #BFBFBF;
  margin: 0 1vw;
  transition: all 0.3s ease;
}

.progress-dot.active {
  background-color: #171C4F;
}

ion-content.bg-lines {
  --background: url('/assets/drawable/tutorial/page_2_background_line_design.svg')
                no-repeat center center / cover;
}
ion-content::part(background) {
  opacity: 0.4;
}

#passer {
  position: absolute;
  color: black;
  left: 11.7vw;
  bottom: 7.14vh;
  z-index: 3;
  font-size: 4.3vw;
  font-weight: bold;
}

#tutorialBottomBar {
  background-color: white;
  padding: 2.68vh 3.86vw 0;
  border-radius: 24px 24px 0 0;
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 0;
}

ion-button#carteAnnuaireCollection {
  --background: #FFD966;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  height: 5.36vh;
  --border-radius: 999px;
  --padding-start: 1.5vw;
  --padding-end: 1.5vw;
  --padding-top: 0;
  --padding-bottom: 0;
}
ion-button#carteAnnuaireCollection ion-label {
  color: black;
  font-size: 3.86vw;
  padding-left: 1.93vw;
  font-weight: 410;
}
ion-button#carteAnnuaireCollection ion-icon {
  font-size: 6.5vw;
}

#tutorialBottomBarText {
  font-family: 'Open Sans', sans-serif;
  color: #000000;
  font-size: 4.83vw;
  width: 92vw;
  margin-top: 2.68vh;
  line-height: 3.57vh;
}

ion-button#next {
  --background: #4d58cb;
  --background-activated: #444a84;
  height: 5.36vh;
  --border-radius: 2vw;
  position: absolute;
  right: 3.86vw;
  bottom: 5.8vh;
  z-index: 3;
  --color: white;
  font-size: 4vw;
}

.tutorialHeader {
  font-family: 'Open Sans', sans-serif;
  width: 92.3vw;
  margin: 0 4vw;
  font-size: 9.66vw;
  font-weight: 500;
  z-index: 3;
  text-align: center;
  line-height: 5.35vh;
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

</style>

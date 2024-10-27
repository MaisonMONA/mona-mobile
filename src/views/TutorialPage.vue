<template>
  <ion-page>
    <ion-content>
      <div class="page">
        <ion-button @click="nextSlide">{{pageNumber < 9 ? "SUIVANT" : "COMMENCER L'EXPÉRIENCE" }}
          <ion-icon :icon="chevronForwardOutline"></ion-icon></ion-button>
        <p  @click="returnBack" id="passer">PASSER</p>
        <img :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`" />
        <img
          class="background-blurred"
          :src="`./assets/drawable/tutorial/page ${pageNumber}.svg`"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {IonPage, IonContent, IonButton, IonIcon} from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import { chevronForwardOutline } from "ionicons/icons";

export default {
  name: "TutorialPage",
  components: {
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
    }
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

div.page {
  overflow: hidden;
  height: 100%;
  width: 100%;
}

#passer {
  position: absolute;
  background: #B5BAE3;
  color: black;
  bottom: 4.8%;
  left: 11%;
  z-index: 3;
  font-size: 4.3vw;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}

ion-button {
  --background: #4D58CB;
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
  height: 100%;
  width: 100%;
  object-fit: contain;
  z-index: 2;
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

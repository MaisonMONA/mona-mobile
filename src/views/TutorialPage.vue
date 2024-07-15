<template>
  <ion-page>
    <ion-content>
      <div class="page">
        <ion-button @click="nextSlide">Continuer</ion-button>
        <img :src="`./assets/drawable/tutorial/page ${pageNumber}.jpg`" />
        <img
          class="background-blurred"
          :src="`./assets/drawable/tutorial/page ${pageNumber}.jpg`"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonButton } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";

export default {
  name: "TutorialPage",
  components: {
    IonPage,
    IonContent,
    IonButton,
  },

  data() {
    return {
      pageNumber: 1,
    };
  },

  methods: {
    nextSlide() {
      if (this.pageNumber < 12) this.pageNumber++;
      else {
        // The user played the tutorial form `/tabs/more`, don't check perms
        if (this.$route.query.callbackurl) {
          this.$router.replace(this.$route.query.callbackurl);
          return;
        }

        UserData.setSeenTutorial(true);
        this.$router.replace("/register");
      }
    },
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

ion-button {
  --background: #656eb8;
  --background-activated: #444a84;
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

ion-button {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}
</style>

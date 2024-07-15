<template>
  <ion-page>

    <ion-content class="ion-padding">
      <div id="discoveryReviewContent">
        <div class="rating">
          <p class="">Notez l'œuvre</p>
          <ul>
            <li :key="st" v-for="st in 5" @click="updateRating(st)">
              <ion-icon
                size="large"
                :icon="st <= givenRating ? star : starOutline"
              ></ion-icon>
            </li>
          </ul>
        </div>

        <div class="comment">
          <p>Commentaires :</p>
          <ion-textarea
            label-placement="floating"
            :counter="true"
            maxlength="300"
            :auto-grow="true"
            id="input"
          ></ion-textarea>
        </div>

        <ion-button fill="solid" @click="submitDiscovery()">Envoyer</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonIcon,
  IonButton,
  IonTextarea,
  IonContent,
} from "@ionic/vue";
import { starOutline, star, camera } from "ionicons/icons";
import { useBadgesCollections } from "@/stores/BadgesCollections";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";

const badgesCollectionsStore = useBadgesCollections();

export default {
  name: "DiscoveryReviewPage",
  components: {
    IonPage,
    IonIcon,
    IonButton,
    IonTextarea,
    IonContent,
  },
  data() {
    return {
      starOutline,
      star,
      camera,
      givenRating: 0,
    };
  },

  methods: {
    updateRating(rating) {
      this.givenRating = rating;
    },

    submitDiscovery() {
      const id = this.$route.query.id;
      const type = this.$route.query.type;

      const { filename } = UserData.getCollected(parseInt(id), type);
      const comment = document.getElementById("input").value;

      UserData.editCollected(type, {
        id: parseInt(id),
        dType: type,
        filename,
        rating: this.givenRating,
        comment,
      });
      Utils.sendPictureAndDetails(id, type);

      badgesCollectionsStore.newBadge(id, type);
      // Redirect to the previous page
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

#discoveryReviewContent {
  position: relative;
  margin-top: auto;
  text-align: center;
}

ion-icon {
  color: var(--mona-yellow);
}

.rating {
  margin-top: 40%;
}

ul {
  padding: 0;
}

li {
  display: inline-block;
}

.comment {
  margin: 20% 10% 20% 10%;
}

ion-button {
  --background: var(--mona-yellow);
}
</style>

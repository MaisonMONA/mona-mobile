<template>
  <ion-page>

    <ion-content class="ion-padding">
      <div id="discoveryReviewContent">
        <div class="rating">
          <p class="rating-label">Notez l'œuvre</p>
          <ul>
            <li :key="st" v-for="st in 5" @click="updateRating(st)">
              <ion-icon
                size="large"
                :icon="st <= givenRating ? star : starOutline"
                :style="{ color: givenRating == null ? '#d7d7d7': 'var(--mona-yellow)' }"
              ></ion-icon>
            </li>
          </ul>
          <p v-if="!isRatingSelected" class="rating-hint">Veuillez sélectionner une note</p>
        </div>

        <div class="comment">
          <p>Que pensez-vous de l'œuvre? <span class="optional">(optionnel)</span></p>
          <ion-textarea
            label-placement="floating"
            :counter="true"
            maxlength="300"
            :auto-grow="true"
            id="input"
          ></ion-textarea>
        </div>

        <ion-button
          fill="solid"
          @click="submitDiscovery()"
          :disabled="!isRatingSelected"
          class="save-button"
          :class="{ 'button-enabled': isRatingSelected, 'button-disabled': !isRatingSelected }"
        >Enregistrer</ion-button>
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
import {useCollection} from "@/stores/Collection.ts";

const badgesCollectionsStore = useBadgesCollections();
const useCollectionStore = useCollection();

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
      givenRating: null,
    };
  },

  computed: {
    isRatingSelected() {
      return this.givenRating !== null;
    }
  },

  methods: {
    updateRating(rating) {
      this.givenRating = rating;
    },

    submitDiscovery() {
      // Don't proceed if no rating is selected
      if (!this.isRatingSelected) {
        return;
      }
      
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

      badgesCollectionsStore.newBadge(id, type); // update badges in badges collection page
      useCollectionStore.updateCollected(); // update discoveries in collection page
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

.rating-label {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-hint {
  color: #FF6B6B;
  font-size: small;
  margin-top: 8px;
}

.optional {
  color: #888888;
  font-size: 0.9em;
  font-style: italic;
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

.save-button {
  --background: var(--mona-yellow);
}

.button-disabled {
  --background: #d7d7d7 !important;
  --color: #a0a0a0 !important;
  opacity: 0.8;
}

.button-enabled {
  --background: var(--mona-yellow) !important;
}
</style>
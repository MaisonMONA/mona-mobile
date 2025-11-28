<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div id="discoveryReviewContent">
        <div class="rating">
          <p class="rating-label">Avez-vous aimé la découverte?*</p>
          <div class="rating-container">
            <!-- Surface container to capture sliding events -->
            <div 
              class="stars-interaction-layer"
              ref="starsContainer"
              @touchstart="handleTouchStart" 
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            ></div>
            
            <!-- Visual stars with z-index behind the surface container -->
            <ul class="stars-container">
              <li v-for="st in 5" :key="st" class="star-item">
                <ion-icon
                  size="large"
                  :icon="st <= givenRating ? star : starOutline"
                  :style="{ 
                    color: givenRating == null ? '#d7d7d7': 'var(--mona-yellow)',
                    transform: isDragging && st <= givenRating ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.1s ease-in-out'
                  }"
                ></ion-icon>
              </li>
            </ul>
          </div>
        </div>

        <div class="comment">
          <p>Qu'en pensez-vous? <br><span class="optional">(optionnel)</span></p>
          <ion-textarea
            label-placement="stacked"
            :counter="true"
            maxlength="300"
            :auto-grow="true"
              rows="3"
              placeholder="Partagez votre expérience..."
            fill="outline"
            id="input"
          ></ion-textarea>
        </div>

        <!-- Container to catch submission attempts without a rating -->
        <div @click="handleButtonClick" class="button-container">
          <ion-button
            fill="solid"
            class="save-button"
            :class="{ 'button-enabled': isRatingSelected, 'button-disabled': !isRatingSelected }"
          >Enregistrer</ion-button>
        </div>
        
        <p v-if="!isRatingSelected && hasAttemptedSubmit" class="rating-hint">Veuillez sélectionner une note</p>
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
      isDragging: false,
      hasAttemptedSubmit: false,
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
    
    handleTouchStart(event) {
      this.isDragging = true;
      this.updateRatingFromPosition(event.touches[0].clientX);
    },
    
    handleTouchMove(event) {
      if (this.isDragging) {
        event.preventDefault(); // Prevent scrolling while dragging
        this.updateRatingFromPosition(event.touches[0].clientX);
      }
    },
    
    handleTouchEnd() {
      this.isDragging = false;
    },
    
    // Helper function to calculate rating based on position
    updateRatingFromPosition(clientX) {
      const starsContainer = this.$refs.starsContainer;
      const containerRect = starsContainer.getBoundingClientRect();
      const starWidth = containerRect.width / 5; // 5 stars
      
      // Calculate where the touch/click is relative to the container
      const relativeX = clientX - containerRect.left;
      
      // Calculate which star is being touched (1-5)
      let starPosition = Math.ceil(relativeX / starWidth);
      
      // Ensure the rating is between 1 and 5
      starPosition = Math.max(1, Math.min(5, starPosition));
      
      // Update the rating
      this.givenRating = starPosition;
    },

    handleButtonClick() {
      // Mark that user attempted to submit
      this.hasAttemptedSubmit = true;
      
      // Only proceed with actual submission if rating is selected
      if (this.isRatingSelected) {
        this.submitDiscovery();
      }
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
  font-size: medium;
  margin-top: 10px;
  text-align: center;
}

.rating-value {
  font-weight: bold;
  color: var(--mona-yellow);
  margin-top: 8px;
}

.optional {
  color: #888888;
  font-size: 0.9em;
  font-style: italic;
}

.rating-container {
  position: relative;
  height: 50px;
  margin: 10px auto;
  width: 80%;
  max-width: 250px;
}

.stars-interaction-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* In front of stars-interaction-layer. Interaction on this layer. No interaction on stars-container. */
  z-index: 10;
  cursor: pointer;
  touch-action: none; /* Disable default browser touch actions */
  user-select: none; /* Prevent text selection during sliding */
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  /* Behind stars-interaction-layer. No interaction on stars-container. */
  z-index: 5;
  pointer-events: none;
}

.star-item {
  display: inline-block;
  padding: 0 4px;
}

.comment {
  margin: 20% 10% 20% 10%;
}

.comment ion-textarea {
  --background: #ffffff;
  --border-width: 2px;
  --border-style: solid;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 5px;
  --padding-bottom: 17px;
  margin-top: 8px;
  min-height: 120px;
  font-size: 16px;
  line-height: 1.5;
  text-align: left;
}

.button-container {
  cursor: pointer;
  display: inline-block;
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
<template v-if="badgesCollectionsStore.countCollection.length">
  <div class="main-container">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1 style="margin-top: 0">Nombre de découvertes</h1>
      <span>{{
        nbrCountUnlocked + "/" + badgesCollectionsStore.countCollection.length
      }}</span>
    </div>

    <swiper :slides-per-view="3.5" :spaceBetween="10">
      <swiper-slide
        v-for="elem in badgesCollectionsStore.countCollection"
        :key="elem"
        class="badgeContainer ion-margin-end border ion-padding"
        style="height: 100%"
        @click="openBadgeDetails(elem)"
      >
        <img
          :alt="elem.message"
          :src="elem.src"
          style="max-width: none"
        />
        <span style="margin-top: 2%; font-size: small"> {{ elem.title }} </span>
      </swiper-slide>
    </swiper>

    <div class="section-header" @click="toggleCategories">
      <h1>Catégories</h1>
      <ion-icon :icon="showCategories ? chevronUpOutline : chevronDownOutline"></ion-icon>
    </div>
    <div v-if="showCategories">
      <ion-row
        v-for="elem in badgesCollectionsStore.categoryCollection"
        :key="elem"
        class="ion-margin-bottom ion-margin-top border badge-row"
        @click="openBadgeDetails(elem)"
      >
        <ion-col size="auto">
          <img :alt="elem.message" :src="elem.src" />
        </ion-col>
        <ion-col>
          <div class="container_progression">
            <ion-label>{{ typeof elem.title === 'object' ? elem.title.fr : elem.title }}</ion-label>
            <div class="progressBar ion-margin-top">
              <span class="ion-margin-end"
                    :style="{color: elem.count >= elem.requireCount ? '#facc00' : 'black'}">{{
                elem.count >= elem.requireCount ? "Complété!" : elem.count + "/" + elem.requireCount
              }}</span>
              <ion-progress-bar
                v-if="elem.count < elem.requireCount"
                :value="(elem.count / elem.requireCount).toFixed(2)"
              ></ion-progress-bar>
            </div>
          </div>
        </ion-col>
      </ion-row>
    </div>

    <div class="section-header" @click="toggleNeighborhoods">
      <h1>Quartiers</h1>
      <ion-icon :icon="showNeighborhoods ? chevronUpOutline : chevronDownOutline"></ion-icon>
    </div>
    <div v-if="showNeighborhoods">
      <ion-row
        v-for="elem in badgesCollectionsStore.boroughCollection"
        :key="elem"
        class="ion-margin-bottom ion-margin-top border badge-row"
        @click="openBadgeDetails(elem)"
      >
        <ion-col size="auto">
          <img :alt="elem.message" :src="elem.src" />
        </ion-col>
        <ion-col>
          <div class="container_progression">
            <ion-label>{{ elem.title }}</ion-label>
            <div class="progressBar ion-margin-top">
              <span class="ion-margin-end"
                  :style="{color: elem.count >= elem.requireCount ? '#facc00' : 'black'}">{{
                  elem.count >= elem.requireCount ? "Complété!" : elem.count + "/" + elem.requireCount
              }}</span>
              <ion-progress-bar
                v-if="elem.count < elem.requireCount"
                :value="(elem.count / elem.requireCount).toFixed(2)"
              ></ion-progress-bar>
            </div>
          </div>
        </ion-col>
      </ion-row>
      <ion-row
        v-for="elem in badgesCollectionsStore.ownerCollection"
        :key="elem"
        class="ion-margin-bottom ion-margin-top border badge-row"
        @click="openBadgeDetails(elem)"
      >
        <ion-col size="auto">
          <img :alt="elem.message" :src="elem.src" />
        </ion-col>
        <ion-col>
          <div class="container_progression">
            <ion-label>{{ elem.title }}</ion-label>
            <div class="progressBar ion-margin-top">
              <span class="ion-margin-end"
                    :style="{color: elem.count >= elem.requireCount ? '#facc00' : 'black'}">{{
                  elem.count >= elem.requireCount ? "Complété!" : elem.count + "/" + elem.requireCount
              }}</span>
              <ion-progress-bar
                  v-if="elem.count < elem.requireCount"
                :value="(elem.count / elem.requireCount).toFixed(2)"
              ></ion-progress-bar>
            </div>
          </div>
        </ion-col>
      </ion-row>
    </div>
  </div>

  <!-- Badge Details Modal -->
  <ion-modal :is-open="isBadgeModalOpen" @didDismiss="closeBadgeModal" class="badge-details-modal">
    <div class="badge-modal-content">
      <!-- Close button at top right -->
      <div class="close-button-container" @click="closeBadgeModal">
        <button class="close-icon">✕</button>
      </div>
      
      <div class="badge-header">
        <img :src="selectedBadge?.src" alt="Badge" class="badge-image" />
        <!-- Larger badge title -->
        <h1>{{ getBadgeTitle(selectedBadge) }}</h1>
      </div>
      
      <div class="badge-description">
        <p>{{ getBadgeDescription(selectedBadge) }}</p>
        
        <div class="badge-progress" v-if="selectedBadge?.requireCount">
          <div v-if="selectedBadge.count >= selectedBadge.requireCount" class="completed-badge">
            <p>Badge complété!</p>
          </div>
          <div v-else>
            <!-- Progress bar -->
            <p>Progression:</p>
            <div class="custom-progress-bar">
              <div 
                v-for="step in selectedBadge.requireCount" 
                :key="step" 
                class="progress-segment"
                :class="{'completed-segment': step <= selectedBadge.count}"
              >
                <div class="segment-fill" v-if="step <= selectedBadge.count"></div>
                <div class="ridge" v-if="step < selectedBadge.requireCount"></div>
              </div>
              
              <!-- Yellow bubble indicator -->
              <div 
                class="bubble-indicator" 
                :style="{ left: `calc(${(selectedBadge.count / selectedBadge.requireCount) * 100}% - 15px)` }"
                :class="{ 'zero-progress': selectedBadge.count === 0 }"
              >
                <div class="bubble">
                  <ion-icon :icon="checkmarkOutline"></ion-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { IonLabel, IonProgressBar, IonRow, IonCol, IonIcon, IonModal, IonButton } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "@ionic/vue/css/ionic-swiper.css";
import { useBadgesCollections } from "@/stores/BadgesCollections";
import { chevronDownOutline, chevronUpOutline, checkmarkOutline } from 'ionicons/icons';
import { eventBus } from '@/internal/eventBus';

const badgesCollectionsStore = useBadgesCollections();
export default {
  name: "BadgesContainer",
  components: {
    IonLabel,
    IonProgressBar,
    IonRow,
    IonCol,
    IonIcon,
    IonModal,
    IonButton,
    Swiper,
    SwiperSlide,
  },
  setup() {
    return { 
      badgesCollectionsStore, 
      chevronDownOutline, 
      chevronUpOutline,
      checkmarkOutline
    };
  },
  beforeMount() {
    badgesCollectionsStore.instantiateBadgesToShow();
    this.borough = badgesCollectionsStore.boroughCollection.concat(
      badgesCollectionsStore.ownerCollection,
    );
  },
  data() {
    return {
      showCategories: true,
      showNeighborhoods: true,
      isBadgeModalOpen: false,
      selectedBadge: null,
    };
  },
  computed: {
    nbrCountUnlocked() {
      return badgesCollectionsStore.collectedCountBadgesId.length;
    },
  },
  methods: {
    getBadgeTitle(badge) {
      if (!badge) return '';
      
      // Check if title is an object with 'fr' property
      if (badge.title && typeof badge.title === 'object' && badge.title.fr) {
        return badge.title.fr;
      }
      
      // Return title as is if it's a string
      return badge.title;
    },
    
    getBadgeDescription(badge) {
      if (!badge) return '';
      
      // Check if badge is unlocked (either count meets requirement or image shows unlocked badge)
      const isUnlocked = 
        (badge.count && badge.requireCount && (badge.count >= badge.requireCount));
      
      // If unlocked, show notification text, otherwise show description
      if (isUnlocked && badge.notification) {
        // Badge is unlocked, show notification text
        if (typeof badge.notification === 'object' && badge.notification.fr) {
          return badge.notification.fr;
        }
        return badge.notification;

      } else {
        // Check if description is an object with 'fr' property
        if (badge.description && typeof badge.description === 'object' && badge.description.fr) {
          return badge.description.fr;
        }
        
        // Return description as is if it's a string
        return badge.description;
      }
    },
    
    getBadgeNotification(badge) {
      if (!badge) return 'Félicitations!';
      
      // Handle notification structure  
      if (badge.notification && typeof badge.notification === 'object' && badge.notification.fr) {
        return badge.notification.fr;
      }
      return badge.notification || 'Félicitations!';
    },
    
    toggleCategories() {
      this.showCategories = !this.showCategories;
    },
    toggleNeighborhoods() {
      this.showNeighborhoods = !this.showNeighborhoods;
    },
    openBadgeDetails(badge) {
      this.selectedBadge = badge;
      this.isBadgeModalOpen = true;
    },
    closeBadgeModal() {
      this.isBadgeModalOpen = false;
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

.main-container {
  padding: 5vw;
}

ion-title {
  font-family: "Gotham Rounded Light", sans-serif;
}

* {
  font-family: "Open Sans", sans-serif;
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
  border-color: #d9d9d9;
  border-radius: 11px;
  border-width: 1.4px;
}

.container_progression {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 95%;
}
.progressBar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.badgeContainer {
  display: flex;
  flex-direction: column;
  min-width: 25%;
  justify-content: center;
  align-items: center;
  padding: 1%;
  cursor: pointer;
}
.swiper .swiper-slide {
  height: auto !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.section-header ion-icon {
  font-size: 24px;
}

/* Make rows clickable */
.badge-row {
  cursor: pointer;
}

/* Badge Modal Styles with relative units */
.badge-details-modal {
  --height: auto;
  --width: 90%;
  --border-radius: 4vw;
  --box-shadow: 0 2vh 3vh rgba(0, 0, 0, 0.2);
}

.badge-modal-content {
  position: relative;
  padding: 3vh 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 4vw;
}

.close-button-container {
  position: absolute;
  top: 4.5vw;
  right: 4.5vw;
  background: none;
  border: none;
  font-size: 5vw;
  color: #888;
  cursor: pointer;
}

.close-icon {
  background: none;
  border: none;
  font-size: 20px;
  color: #888;
  padding: 0; /* Remove any default padding */
  margin: 0; /* Remove any default margin */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* Progress bar styling */
.progress-container {
  display: flex;
  align-items: center;
  gap: 3vw;
  width: 100%;
  margin-top: 1vh;
}

.progress-container ion-progress-bar {
  flex: 1;
  height: 1.5vh;
  --progress-background: #facc00;
  --background: #e0e0e0;
}

.progress-fraction {
  font-size: 3.8vw;
  font-weight: 500;
  white-space: nowrap;
}

.badge-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0vh;
  text-align: center;
}

.badge-image {
  width: 30vw;
  height: auto;
  margin-bottom: 2vh;
}

/* .badge-header h2 {
  font-size: 5vw;
  font-weight: bold;
  margin: 0;
} */

.badge-header h1 {
  font-size: 6.5vw;
  font-weight: bold;
  margin: 2vh 0 0 0;
  text-align: center;
}

.badge-description {
  text-align: center;
  margin-bottom: vh;
  width: 90%;
}

.badge-description p {
  font-size: 3.8vw;
  line-height: 1.4;
  color: #444;
}

.badge-progress {
  margin-top: 4vh;
  font-weight: 500;
}

.completed-badge {
  color: var(--mona-yellow);
  font-weight: bold;
}

.close-button {
  --background: var(--mona-yellow);
  --color: black;
  --border-radius: 2vw;
  font-weight: 500;
  margin-top: 2vh;
  height: 5vh;
}

/* For badges in the swiper */
.badgeContainer img {
  transition: transform 0.2s, filter 0.2s;
}

.badgeContainer:hover img {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* For badges in the lists */
.badge-row:hover img {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* For badge title/name in the swiper */
.badgeContainer span {
  transition: color 0.2s;
}

.badgeContainer:hover span {
  color: #4D58CB;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .badge-details-modal {
    --width: 95%;
  }

  .badge-header h2 {
    font-size: 6vw;
  }

  .badge-description p {
    font-size: 4.2vw;
  }

  .badge-progress {
    font-size: 4vw;
  }
}

.custom-progress-bar {
  position: relative;
  display: flex;
  height: 13px;
  margin: 12px 0 8px 0;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: visible;
}

.progress-segment {
  flex: 1;
  position: relative;
  height: 100%;
}

.segment-fill {
  height: 100%;
  background-color: var(--mona-yellow);
}

/* White ridges between segments */
.ridge {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: white;
}

/* Yellow bubble indicator */
.bubble-indicator {
  position: absolute;
  top: -0.6vh;
}

.bubble {
  width: 19px;
  height: 19px;
  background-color: var(--mona-yellow);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: black;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Different bubble style when progress is zero  */
.bubble-indicator.zero-progress .bubble {
  background-color: #e1e1e1; /* Grey color */
  /* visibility: hidden; */
}

.bubble ion-icon {
  color: black;
  font-size: 16px;
  width: 16px;
  height: 16px;
  --ionicon-stroke-width: 50px; /* Makes the icon bolder */
}
</style>

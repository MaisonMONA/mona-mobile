<template v-if="badgesCollectionsStore.countCollection.length">
  <div class="main-container">
    <div class="section-header" @click="toggleCountBadges">
      <h1>Nombre de découvertes</h1>
      <ion-icon :icon="showCountBadges ? chevronUpOutline : chevronDownOutline"></ion-icon>
    </div>

    <div v-if="showCountBadges" class="count-badges-grid">
      <div
        v-for="elem in badgesCollectionsStore.countCollection"
        :key="elem"
        class="count-badge-item"
        @click="openBadgeDetails(elem)"
      >
        <div class="count-badge-container" :class="{ unlocked: elem.src.includes('unlocked') }">
          <img
            :alt="elem.message"
            :src="getCountBadgeImageSrc(elem)"
            @error="handleImageError($event, elem)"
          />
          <span class="count-badge-title">{{ elem.title }}</span>
        </div>
      </div>
    </div>

    <div class="section-header" @click="toggleCategories">
      <h1>Catégories</h1>
      <ion-icon :icon="showCategories ? chevronUpOutline : chevronDownOutline"></ion-icon>
    </div>
    <div v-if="showCategories" class="badge-grid">
      <div
        v-for="elem in badgesCollectionsStore.categoryCollection"
        :key="elem"
        class="badge-item"
        @click="openBadgeDetails(elem)"
      >
        <div class="circular-badge-container">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle
              v-if="elem.count < elem.requireCount"
              class="progress-ring__circle-bg"
              stroke-width="10"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring__circle"
              :stroke="elem.count > 0 ? 'var(--mona-yellow)' : '#E0E0E0'"
              stroke-width="10"
              :stroke-dasharray="circumference + ' ' + circumference"
              :stroke-dashoffset="elem.count >= elem.requireCount ? 0 : getProgressOffset(elem.count, elem.requireCount)"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
          </svg>
          <div class="circular-badge" :class="{ unlocked: elem.count >= elem.requireCount }">
            <img :alt="elem.message" :src="getRoundBadgeImageSrc(elem)" @error="handleImageError($event, elem)" />
          </div>
        </div>
        <span class="badge-title">{{ typeof elem.title === 'object' ? elem.title.fr : elem.title }}</span>
        <span class="badge-progress" :class="{ 'completed': elem.count >= elem.requireCount }">{{ elem.count >= elem.requireCount ? elem.requireCount + "/" + elem.requireCount : elem.count + "/" + elem.requireCount }}</span>
      </div>
    </div>

    <div class="section-header" @click="toggleNeighborhoods">
      <h1>Quartiers</h1>
      <ion-icon :icon="showNeighborhoods ? chevronUpOutline : chevronDownOutline"></ion-icon>
    </div>
    <div v-if="showNeighborhoods" class="badge-grid">
      <div
        v-for="elem in [...badgesCollectionsStore.boroughCollection, ...badgesCollectionsStore.ownerCollection]"
        :key="elem"
        class="badge-item"
        @click="openBadgeDetails(elem)"
      >
        <div class="circular-badge-container">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle
              v-if="elem.count < elem.requireCount"
              class="progress-ring__circle-bg"
              stroke-width="10"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring__circle"
              :stroke="elem.count > 0 ? 'var(--mona-yellow)' : '#E0E0E0'"
              stroke-width="10"
              :stroke-dasharray="circumference + ' ' + circumference"
              :stroke-dashoffset="elem.count >= elem.requireCount ? 0 : getProgressOffset(elem.count, elem.requireCount)"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
          </svg>
          <div class="circular-badge" :class="{ unlocked: elem.count >= elem.requireCount }">
            <img :alt="elem.message" :src="getRoundBadgeImageSrc(elem)" @error="handleImageError($event, elem)" />
          </div>
        </div>
        <span class="badge-title">{{ elem.title }}</span>
        <span class="badge-progress" :class="{ 'completed': elem.count >= elem.requireCount }">{{ elem.count >= elem.requireCount ? elem.requireCount + "/" + elem.requireCount : elem.count + "/" + elem.requireCount }}</span>
      </div>
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
        <img :src="selectedBadge?.src" alt="Badge" class="badge-image" @error="handleImageError($event, selectedBadge)" />
        <h2>{{ getBadgeTitle(selectedBadge) }}</h2>
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
                :style="{ '--progress-percentage': (selectedBadge.count / selectedBadge.requireCount) * 100 }"
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
      showCountBadges: true,
      showCategories: true,
      showNeighborhoods: true,
      isBadgeModalOpen: false,
      selectedBadge: null,
      circumference: 2 * Math.PI * 52, // 2πr where r=52
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
    
    getProgressOffset(count, requireCount) {
      if (!requireCount || requireCount === 0) return this.circumference;
      const progress = count / requireCount;
      return this.circumference - (progress * this.circumference);
    },
    
    getCountBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      
      // Use the dedicated gridSrc property for grid display
      return badge.gridSrc;
    },
    
    getRoundBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      
      // Use the dedicated gridSrc property for grid display of round badges
      return badge.gridSrc;
    },
    
    toggleCategories() {
      this.showCategories = !this.showCategories;
    },
    toggleNeighborhoods() {
      this.showNeighborhoods = !this.showNeighborhoods;
    },
    toggleCountBadges() {
      this.showCountBadges = !this.showCountBadges;
    },
    openBadgeDetails(badge) {
      this.selectedBadge = badge;
      this.isBadgeModalOpen = true;
    },
    closeBadgeModal() {
      this.isBadgeModalOpen = false;
    },
    handleImageError(event, badge) {
      // When an image fails to load, replace it with the fallback badge image
      console.warn(`Badge image failed to load: ${badge?.src || 'unknown'}, using fallback`);
      event.target.src = badgesCollectionsStore.getFallbackBadgePath;
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

.main-container {
  padding: 0 5vw;
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

/* Count badges grid */
.count-badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3vw;
  margin: 3vw 0;
}

.count-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.count-badge-container {
  width: 25vw;
  height: 25vw;
  border-radius: 2vw;
  background-color: #FFFFFF;
  border: 0.3vw solid #E0E0E0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 2vw;
  padding: 2vw;
}

.count-badge-container.unlocked {
  background-color: var(--mona-yellow);
  border-color: var(--mona-yellow);
}

.count-badge-container img {
  width: 12vw;
  height: 12vw;
  object-fit: contain;
  margin-bottom: 1vw;
}

.count-badge-title {
  font-size: 2.7vw;
  text-align: center;
  color: #333;
  max-width: 20vw;
  word-wrap: break-word;
  line-height: 1.2;
}

/* Circular badge styles for categories */
.circular-badge {
  width: 28vw;
  height: 28vw;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.circular-badge.unlocked {
  background-color: var(--mona-yellow);
  border-color: var(--mona-yellow);
}

.circular-badge img {
  width: 15vw;
  height: 15vw;
  object-fit: contain;
}

/* Badge grid for categories and neighborhoods */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2vw 1vw; /* row gap, column gap */
  margin: 3vw 0;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0vw;
}

.circular-badge-container {
  position: relative;
  width: 35vw;
  height: 35vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  position: absolute;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-ring__circle-bg {
  stroke: #E0E0E0;
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform-origin: 50% 50%;
}

.badge-item .circular-badge {
  position: relative;
  z-index: 1;
}

.badge-item .circular-badge img {
  width: 19vw;
  height: 19vw;
}

.badge-item .badge-progress {
  margin-top: 1vw;
  font-size: 3vw;
  font-weight: 500;
  color: #666;
}

/* Make completed round badge progress counter bolder and darker */
/* .badge-item .badge-progress.completed {
  font-weight: bold;
  color: #333;
} */

.badge-item .badge-title {
  margin-top: 0.5vw;
  font-size: 3.5vw;
  text-align: center;
  color: #333;
  max-width: 30vw;
  word-wrap: break-word;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.section-header ion-icon {
  font-size: 6vw;
}

/* Make rows clickable */
.badge-row {
  cursor: pointer;
}

/* Hover effects for round badges */
.badge-item:hover .circular-badge {
  transform: scale(1.05);
}

.count-badge-item:hover .count-badge-container {
  transform: scale(1.05);
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

.section-header h1 {
  font-size: 6vw;
  margin-top: 10px!important;
  text-align: left;
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

.badge-description .badge-progress {
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
  height: 3vw;
  margin: 3vw 0 2vw 0;
  background-color: #f0f0f0;
  border-radius: 2vw;
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
  width: 0.8vw;
  background-color: white;
}

/* Yellow bubble indicator */
.bubble-indicator {
  position: absolute;
  top: -0.6vh;
  left: calc(var(--progress-percentage, 0) * 1% - 15px);
}

.bubble {
  width: 5vw;
  height: 5vw;
  background-color: var(--mona-yellow);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3vw;
  font-weight: bold;
  color: black;
  box-shadow: 0 0.5vw 1vw rgba(0,0,0,0.2);
}

/* Different bubble style when progress is zero  */
.bubble-indicator.zero-progress .bubble {
  background-color: #e1e1e1; /* Grey color */
  /* visibility: hidden; */
}

.bubble ion-icon {
  color: black;
  font-size: 4vw;
  width: 4vw;
  height: 4vw;
  --ionicon-stroke-width: 50px; /* Makes the icon bolder */
}

/* Smartphone specific styling - adjust bubble position to avoid hiding progress */
@media (max-width: 767px) {
  .bubble-indicator {
    /* Offset bubble slightly to the right so it doesn't hide the latest progress segment */
    transform: translateX(5px);
  }
}

.count-span {
  margin-bottom: 0.85vh;
  font-size: 4vw;
}

</style>

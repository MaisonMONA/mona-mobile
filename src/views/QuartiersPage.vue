<template>
  <ion-page class="quartiers-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/collection" text="" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Les quartiers</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <p class="description">Prends en photo les oeuvres autour de toi pour compléter ta collection de badges!</p>
      
      <div class="badge-grid">
        <div
          v-for="elem in neighborhoodBadges"
          :key="elem.id"
          class="badge-item"
          @click="openBadgeDetails(elem)"
        >
          <div class="circular-badge-container">
            <svg class="progress-ring" viewBox="0 0 120 120" v-if="elem.count > 0 && elem.count < elem.requireCount">
              <circle
                class="progress-ring__circle-bg"
                stroke-width="5"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
              />
              <circle
                class="progress-ring__circle"
                stroke="#D37F66"
                stroke-width="5"
                :stroke-dasharray="circumference + ' ' + circumference"
                :stroke-dashoffset="getProgressOffset(elem.count, elem.requireCount)"
                fill="transparent"
                r="52"
                cx="60"
                cy="60"
              />
            </svg>
            <div class="circular-badge" :class="getBadgeClass(elem)">
              <img :alt="elem.message" :src="getRoundBadgeImageSrc(elem)" @error="handleImageError($event, elem)" />
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Badge Details Modal -->
    <ion-modal :is-open="isBadgeModalOpen" @didDismiss="closeBadgeModal" class="badge-details-modal">
      <div class="badge-modal-content">
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
              <p>Progression: {{ selectedBadge.count }}/{{ selectedBadge.requireCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonModal,
} from "@ionic/vue";
import { chevronBackOutline } from 'ionicons/icons';
import { useBadgesCollections } from "@/stores/BadgesCollections";

const badgesCollectionsStore = useBadgesCollections();

export default {
  name: "QuartiersPage",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonModal,
  },
  setup() {
    return {
      badgesCollectionsStore,
      chevronBackOutline,
    };
  },
  data() {
    return {
      isBadgeModalOpen: false,
      selectedBadge: null,
      circumference: 2 * Math.PI * 52,
    };
  },
  computed: {
    neighborhoodBadges() {
      return [
        ...badgesCollectionsStore.boroughCollection,
        ...badgesCollectionsStore.ownerCollection,
        ...badgesCollectionsStore.territoryCollection,
      ];
    },
  },
  beforeMount() {
    badgesCollectionsStore.instantiateBadgesToShow();
  },
  methods: {
    getRoundBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      return badge.gridSrc;
    },
    getProgressOffset(count, requireCount) {
      if (!requireCount || requireCount === 0) return this.circumference;
      const progress = count / requireCount;
      return this.circumference - (progress * this.circumference);
    },
    getBadgeClass(elem) {
      if (elem.count >= elem.requireCount) return 'unlocked';
      if (elem.count > 0) return 'in-progress';
      return 'locked';
    },
    openBadgeDetails(badge) {
      this.selectedBadge = badge;
      this.isBadgeModalOpen = true;
    },
    closeBadgeModal() {
      this.isBadgeModalOpen = false;
    },
    handleImageError(event, badge) {
      console.warn(`Badge image failed to load: ${badge?.src || 'unknown'}, using fallback`);
      event.target.src = badgesCollectionsStore.getFallbackBadgePath;
    },
    getBadgeTitle(badge) {
      if (!badge) return '';
      if (badge.title && typeof badge.title === 'object' && badge.title.fr) {
        return badge.title.fr;
      }
      return badge.title;
    },
    getBadgeDescription(badge) {
      if (!badge) return '';
      const isUnlocked = badge.count && badge.requireCount && (badge.count >= badge.requireCount);
      if (isUnlocked && badge.notification) {
        if (typeof badge.notification === 'object' && badge.notification.fr) {
          return badge.notification.fr;
        }
        return badge.notification;
      } else {
        if (badge.description && typeof badge.description === 'object' && badge.description.fr) {
          return badge.description.fr;
        }
        return badge.description;
      }
    },
  },
};
</script>

<style scoped>
.quartiers-page {
  --background: #F2F2F2;
}

ion-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

ion-header::after {
  display: none;
}

ion-content {
  --background: #F2F2F2;
}

ion-toolbar {
  --background: white;
  --color: black;
  --border-width: 0;
  --min-height: 10vh;
  position: relative;
}

ion-title {
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 5.6vw;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  pointer-events: none;
}

ion-back-button {
  --color: black;
}

.description {
  text-align: center;
  color: black;
  font-size: 4vw;
  margin: 9vw 4vw 5vw 4vw;
  padding: 0 2vw;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 2vw 3vw;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.circular-badge-container {
  position: relative;
  width: 30vw;
  height: 30vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  position: absolute;
  transform: rotate(-90deg);
  width: 95%;
  height: 95%;
}

.progress-ring__circle-bg {
  stroke: #E0E0E0;
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform-origin: 50% 50%;
}

.circular-badge {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: #F6F6F6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.circular-badge.unlocked,
.circular-badge.in-progress {
  background-color: #FFFFFF;
}

.circular-badge img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.badge-item:hover .circular-badge {
  transform: scale(1.05);
}

/* Modal Styles */
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
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.badge-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge-image {
  width: 30vw;
  height: auto;
  margin-bottom: 2vh;
}

.badge-header h2 {
  font-size: 5vw;
  margin: 0;
}

.badge-description {
  text-align: center;
  width: 90%;
}

.badge-description p {
  font-size: 3.8vw;
  line-height: 1.4;
  color: #444;
}

.completed-badge {
  color: var(--mona-yellow);
  font-weight: bold;
}
</style>

<template>
  <ion-page class="categories-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/collection" text="" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Les catégories</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <p class="description">Plus tu prends des oeuvres en photo et plus tu obtiens des trophées.</p>
      
      <div class="badge-grid">
        <div
          v-for="elem in badgesCollectionsStore.categoryCollection"
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
    <BadgeDetailsModal
      :is-open="isBadgeModalOpen"
      :badge="selectedBadge"
      @close="closeBadgeModal"
    />
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
} from "@ionic/vue";
import { chevronBackOutline } from 'ionicons/icons';
import { useBadgesCollections } from "@/stores/BadgesCollections";
import BadgeDetailsModal from "@/components/BadgeDetailsModal.vue";

const badgesCollectionsStore = useBadgesCollections();

export default {
  name: "CategoriesPage",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    BadgeDetailsModal,
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
  },
};
</script>

<style scoped>
.categories-page {
  --background: #F2F2F2;
}

ion-header {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
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
  width: 97%;
  height: 97%;
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
</style>

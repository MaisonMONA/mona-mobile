<template>
  <ion-page class="trophees-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/collection" text="" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Mes trophées</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <p class="description">Plus tu prends des oeuvres en photo et plus tu obtiens des trophées.</p>
      
      <div class="count-badges-grid">
        <div
          v-for="elem in badgesCollectionsStore.countCollection"
          :key="elem.id"
          class="count-badge-item"
          @click="openBadgeDetails(elem)"
        >
          <div class="count-badge-container">
            <img
              :alt="elem.message"
              :src="getCountBadgeImageSrc(elem)"
              @error="handleImageError($event, elem)"
            />
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
  name: "TropheesPage",
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
    };
  },
  beforeMount() {
    badgesCollectionsStore.instantiateBadgesToShow();
  },
  methods: {
    getCountBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      return badge.gridSrc;
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
.trophees-page {
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

.count-badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap:4vw;
  padding: 2vw 4vw;
}

.count-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.count-badge-container {
  width: 28vw;
  height: 28vw;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.count-badge-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.count-badge-item:hover .count-badge-container {
  transform: scale(1.05);
}
</style>

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
  name: "TropheesPage",
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
  position: relative;
}

ion-title {
  font-family: "Open Sans", sans-serif;
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
  color: #666;
  font-size: 3.8vw;
  margin: 4vw 4vw 5vw 4vw;
  padding: 0 2vw;
}

.count-badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4vw;
  padding: 2vw 4vw;
}

.count-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.count-badge-container {
  width: 24vw;
  height: 24vw;
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
</style>

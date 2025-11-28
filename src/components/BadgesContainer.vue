<template v-if="badgesCollectionsStore.countCollection.length">
  <div class="badges-main-container">
    <!-- Trophées Section -->
    <div class="section-card" @click="goToTrophees">
      <div class="section-header">
        <h1>Trophées</h1>
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </div>
      <div class="preview-grid count-preview">
        <div
          v-for="elem in previewCountBadges"
          :key="elem.id"
          class="preview-badge-item"
        >
          <img
            :alt="elem.message"
            :src="getCountBadgeImageSrc(elem)"
            @error="handleImageError($event, elem)"
          />
        </div>
      </div>
    </div>

    <!-- Catégories Section -->
    <div class="section-card" @click="goToCategories">
      <div class="section-header">
        <h1>Catégories</h1>
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </div>
      <div class="preview-grid round-preview">
        <div
          v-for="elem in previewCategoryBadges"
          :key="elem.id"
          class="preview-badge-item round"
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
            <div class="circular-badge" :class="{ unlocked: elem.count >= elem.requireCount, 'in-progress': elem.count > 0 && elem.count < elem.requireCount }">
              <img :alt="elem.message" :src="getRoundBadgeImageSrc(elem)" @error="handleImageError($event, elem)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quartiers Section -->
    <div class="section-card" @click="goToQuartiers">
      <div class="section-header">
        <h1>Quartiers</h1>
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </div>
      <div class="preview-grid round-preview">
        <div
          v-for="elem in previewNeighborhoodBadges"
          :key="elem.id"
          class="preview-badge-item round"
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
            <div class="circular-badge" :class="{ unlocked: elem.count >= elem.requireCount, 'in-progress': elem.count > 0 && elem.count < elem.requireCount }">
              <img :alt="elem.message" :src="getRoundBadgeImageSrc(elem)" @error="handleImageError($event, elem)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { IonIcon } from "@ionic/vue";
import { useBadgesCollections } from "@/stores/BadgesCollections";
import { chevronForwardOutline } from 'ionicons/icons';
import router from '@/router';

const badgesCollectionsStore = useBadgesCollections();

export default {
  name: "BadgesContainer",
  components: {
    IonIcon,
  },
  setup() {
    return { 
      badgesCollectionsStore, 
      chevronForwardOutline,
    };
  },
  beforeMount() {
    badgesCollectionsStore.instantiateBadgesToShow();
  },
  data() {
    return {
      circumference: 2 * Math.PI * 52,
    };
  },
  computed: {
    previewCountBadges() {
      // Show first 4 count badges for preview
      return badgesCollectionsStore.countCollection.slice(0, 4);
    },
    previewCategoryBadges() {
      // Show first 3 category badges for preview
      return badgesCollectionsStore.categoryCollection.slice(0, 3);
    },
    neighborhoodBadges() {
      return [
        ...badgesCollectionsStore.boroughCollection,
        ...badgesCollectionsStore.ownerCollection,
        ...badgesCollectionsStore.territoryCollection,
      ];
    },
    previewNeighborhoodBadges() {
      // Show first 3 neighborhood badges for preview
      return this.neighborhoodBadges.slice(0, 3);
    },
  },
  methods: {
    getProgressOffset(count, requireCount) {
      if (!requireCount || requireCount === 0) return this.circumference;
      const progress = count / requireCount;
      return this.circumference - (progress * this.circumference);
    },
    
    getCountBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      return badge.gridSrc;
    },
    
    getRoundBadgeImageSrc(badge) {
      if (!badge || !badge.gridSrc) return badge?.src || '';
      return badge.gridSrc;
    },
    
    handleImageError(event, badge) {
      console.warn(`Badge image failed to load: ${badge?.src || 'unknown'}, using fallback`);
      event.target.src = badgesCollectionsStore.getFallbackBadgePath;
    },

    goToTrophees() {
      router.push('/trophees');
    },
    goToCategories() {
      router.push('/categories');
    },
    goToQuartiers() {
      router.push('/quartiers');
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.badges-main-container {
  padding: 0 4vw;
  display: flex;
  flex-direction: column;
  gap: 3vw;
}

.section-card {
  background: white;
  border-radius: 4vw;
  padding: 4vw;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.section-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3vw;
}

.section-header h1 {
  font-family: "Open Sans", sans-serif;
  font-size: 5.5vw;
  font-weight: 600;
  margin: 0;
  color: black;
}

.section-header ion-icon {
  font-size: 5vw;
  color: #333;
}

/* Preview grid for count badges */
.preview-grid.count-preview {
  display: flex;
  gap: 2vw;
  justify-content: flex-start;
}

.preview-badge-item {
  width: 18vw;
  height: 18vw;
}

.preview-badge-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Preview grid for round badges */
.preview-grid.round-preview {
  display: flex;
  gap: 3vw;
  justify-content: flex-start;
}

.preview-badge-item.round {
  width: 22vw;
  height: 22vw;
}

.circular-badge-container {
  position: relative;
  width: 100%;
  height: 100%;
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

.circular-badge {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  background-color: #FBFBFB;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.circular-badge.unlocked,
.circular-badge.in-progress {
  background-color: white;
}

.circular-badge img {
  width: 65%;
  height: 65%;
  object-fit: contain;
}

* {
  font-family: "Open Sans", sans-serif;
}
</style>

<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="$emit('close')"
    class="badge-details-modal"
    :initial-breakpoint="1"
    :breakpoints="[0, 1]"
  >
    <div class="badge-modal-content">
      <div class="close-button-container" @click="$emit('close')">
        <button class="close-icon">✕</button>
      </div>
      
      <div class="badge-header">
        <img :src="badge?.src" alt="Badge" class="badge-image" @error="handleImageError" />
        <h2>{{ badgeTitle }}</h2>
      </div>
      
      <div class="badge-description">
        <p>{{ badgeDescription }}</p>
        
        <div class="badge-progress" v-if="showProgress">
          <div v-if="isCompleted" class="completed-badge">
            <p>Badge complété!</p>
          </div>
          <div v-else>
            <p>Progression: {{ badge.count }}/{{ badge.requireCount }}</p>
            <div class="custom-progress-bar">
              <div
                v-for="i in badge.requireCount"
                :key="i"
                class="progress-segment"
              >
                <div class="segment-fill" :class="{ filled: i <= badge.count }"></div>
                <div v-if="i < badge.requireCount" class="ridge"></div>
              </div>
              <div
                class="bubble-indicator"
                :style="{ left: ((badge.count / badge.requireCount) * 100) + '%' }"
              >
                <ion-icon :icon="checkmarkOutline"></ion-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { IonModal, IonIcon } from "@ionic/vue";
import { checkmarkOutline } from 'ionicons/icons';
import { useBadgesCollections } from "@/stores/BadgesCollections";

export default {
  name: "BadgeDetailsModal",
  components: {
    IonModal,
    IonIcon,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    badge: {
      type: Object,
      default: null,
    },
  },
  emits: ['close'],
  setup() {
    const badgesCollectionsStore = useBadgesCollections();
    return {
      badgesCollectionsStore,
      checkmarkOutline,
    };
  },
  computed: {
    badgeTitle() {
      if (!this.badge) return '';
      if (this.badge.title && typeof this.badge.title === 'object' && this.badge.title.fr) {
        return this.badge.title.fr;
      }
      return this.badge.title;
    },
    badgeDescription() {
      if (!this.badge) return '';
      const isUnlocked = this.badge.count && this.badge.requireCount && (this.badge.count >= this.badge.requireCount);
      if (isUnlocked && this.badge.notification) {
        if (typeof this.badge.notification === 'object' && this.badge.notification.fr) {
          return this.badge.notification.fr;
        }
        return this.badge.notification;
      } else {
        if (this.badge.description && typeof this.badge.description === 'object' && this.badge.description.fr) {
          return this.badge.description.fr;
        }
        return this.badge.description;
      }
    },
    showProgress() {
      return this.badge?.requireCount;
    },
    isCompleted() {
      return this.badge && this.badge.count >= this.badge.requireCount;
    },
  },
  methods: {
    handleImageError(event) {
      console.warn(`Badge image failed to load: ${this.badge?.src || 'unknown'}, using fallback`);
      event.target.src = this.badgesCollectionsStore.getFallbackBadgePath;
    },
  },
};
</script>

<style scoped>
/* Modal Styles */
.badge-details-modal {
  --height: auto;
  --width: 100%;
  --border-radius: 4vw 4vw 0 0;
  --box-shadow: 0 -2vh 3vh rgba(0, 0, 0, 0.2);
  align-items: flex-end;
}

.badge-modal-content {
  position: relative;
  padding: 3vh 2vw 5vh 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 4vw 4vw 0 0;
  padding-top: 5vh;
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
  width: 60vw;
  height: auto;
}

.badge-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 7vw;
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

.badge-progress {
  margin-top: 2vh;
}

/* Progress Bar Styles */
.custom-progress-bar {
  position: relative;
  display: flex;
  width: 100%;
  height: 3vw;
  margin-top: 2vw;
  border-radius: 1.5vw;
  overflow: visible;
}

.progress-segment {
  flex: 1;
  position: relative;
  display: flex;
  align-items: stretch;
}

.segment-fill {
  flex: 1;
  background-color: #E0E0E0;
  transition: background-color 0.3s ease;
}

.segment-fill.filled {
  background-color: #D37F66;
}

.progress-segment:first-child .segment-fill {
  border-radius: 1.5vw 0 0 1.5vw;
}

.progress-segment:last-child .segment-fill {
  border-radius: 0 1.5vw 1.5vw 0;
}

.ridge {
  width: 1vw;
  background-color: white;
}

.bubble-indicator {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 7vw;
  height: 7vw;
  background-color: #D37F66;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.bubble-indicator ion-icon {
  color: white;
  font-size: 4vw;
}
</style>

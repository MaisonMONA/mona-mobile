<template>
  <!-- Badge Unlock Modal -->
  <ion-modal 
    :is-open="isBadgeUnlockModalOpen" 
    @didDismiss="closeBadgeUnlockModal"
    class="badge-unlock-modal"
    :backdrop-dismiss="true"
  >
    <div class="badge-unlock-content">
      <!-- Close button at top right -->
      <div class="close-button-container" @click="closeBadgeUnlockModal">
        <button class="close-icon">✕</button>
      </div>
      
      <div class="unlock-animation">
        <img 
          :src="unlockedBadge?.src || '/assets/drawable/badges/fallback-badge.svg'" 
          alt="Badge" 
          class="badge-image animated"
          @error="handleImageError"
        />
        <div class="sparkle-effect"></div>
      </div>
      
      <h2 class="unlock-title">Nouveau badge débloqué!</h2>
      <h1>{{ getBadgeTitle(unlockedBadge) }}</h1>
      
      <div class="unlock-description">
        <p>{{ getBadgeNotification(unlockedBadge) }}</p>
      </div>
      
      <div class="unlock-buttons">
        <!-- Show single button when there are multiple badges in queue -->
        <ion-button 
          v-if="hasMoreBadges" 
          @click="closeBadgeUnlockModal" 
          class="unlock-close-button single-button"
        >
          Fermer
        </ion-button>
        
        <!-- Show both buttons when it's the last/only badge -->
        <ion-button 
          v-if="!hasMoreBadges"
          @click="closeBadgeUnlockModal" 
          class="unlock-close-button"
        >
          Fermer
        </ion-button>
        <ion-button 
          v-if="!hasMoreBadges"
          @click="goToBadgesPage" 
          class="unlock-badges-page-button"
        >
          Vos badges
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { IonModal, IonButton } from '@ionic/vue';
import { eventBus } from '@/internal/eventBus';

export default {
  name: 'BadgeUnlockModal',
  components: {
    IonModal,
    IonButton,
  },
  data() {
    return {
      isBadgeUnlockModalOpen: false,
      unlockedBadge: null,
      badgeQueue: [],
      currentBadgeIndex: 0,
    };
  },
  computed: {
    // Computed property to check if there are more badges in queue
    hasMoreBadges() {
      return this.badgeQueue.length > 1 && this.currentBadgeIndex < this.badgeQueue.length - 1;
    },
  },
  methods: {
    getBadgeTitle(badge) {
      if (!badge) return '';
      
      // Handle title structure
      if (badge.title && typeof badge.title === 'object' && badge.title.fr) {
        return badge.title.fr;
      }
      return badge.title || '';
    },
    
    getBadgeNotification(badge) {
      if (!badge) return 'Félicitations!';
      
      // Handle notification structure  
      if (badge.notification && typeof badge.notification === 'object' && badge.notification.fr) {
        return badge.notification.fr;
      }
      if (badge.notification) {
        return badge.notification;
      }
      
      // Fallback for count badges - use description if available
      if (badge.description && typeof badge.description === 'object' && badge.description.fr) {
        return badge.description.fr;
      }
      if (badge.description) {
        return badge.description;
      }
      
      // Final fallback
      return 'Félicitations! Vous avez débloqué ce badge!';
    },
    
    showNextBadge() {
      if (this.currentBadgeIndex < this.badgeQueue.length) {
        this.unlockedBadge = this.badgeQueue[this.currentBadgeIndex];
        this.isBadgeUnlockModalOpen = true;
      }
    },
    
    closeBadgeUnlockModal() {
      // Close modal first
      this.isBadgeUnlockModalOpen = false;
      
      this.currentBadgeIndex++;
      
      // Check if there are more badges to show
      if (this.currentBadgeIndex < this.badgeQueue.length) {
        // Show next badge after modal closes
        setTimeout(() => {
          this.showNextBadge();
        }, 300);
      } else {
        // No more badges, reset after modal closes
        setTimeout(() => {
          this.unlockedBadge = null;
          this.badgeQueue = [];
          this.currentBadgeIndex = 0;
        }, 300);
      }
    },
    
    goToBadgesPage() {
      // Close modal first
      this.isBadgeUnlockModalOpen = false;
      
      // Reset after modal closes
      setTimeout(() => {
        this.unlockedBadge = null;
        this.badgeQueue = [];
        this.currentBadgeIndex = 0;
      }, 300);
      
      // Navigate to collection page with badges tab selected
      this.$router.push('/tabs/collection?tab=badge');
    },
    
    handleImageError(event) {
      // Fallback to a default badge image if the image fails to load
      console.warn(`Badge image failed to load: ${event.target.src}, using fallback`);
      const img = event.target;
      img.src = '/assets/drawable/badges/fallback-badge.svg';
    },
  },
  
  mounted() {
    // Listen for badge unlock events
    eventBus.on('badge-unlocked', (badge) => {
      console.log('Badge unlock modal received badge:', badge);
      console.log('Badge notification field:', badge.notification);
      console.log('Badge description field:', badge.description);
      
      // Add badge to queue
      this.badgeQueue.push(badge);
      
      // If modal is not open, show the first badge
      if (!this.isBadgeUnlockModalOpen) {
        this.showNextBadge();
      }
    });
  },
  
  beforeUnmount() {
    // Clean up event listeners
    eventBus.off('badge-unlocked');
  },
};
</script>

<style scoped>
/* Badge Unlock Modal Styles */
.badge-unlock-modal {
  --height: auto;
  --width: 90%;
  --border-radius: 4vw;
  --box-shadow: 0 2vh 3vh rgba(0, 0, 0, 0.2);
}

.badge-unlock-content {
  position: relative;
  padding: 3vh 2vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 4vw;
  text-align: center;
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

.unlock-animation {
  position: relative;
  margin-bottom: 3vh;
}

.unlock-animation .badge-image {
  width: 30vw;
  height: auto;
}

.unlock-animation .badge-image.animated {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.sparkle-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45vw;
  height: 45vw;
  background: radial-gradient(circle, rgba(250, 218, 0, 0.3) 0%, transparent 70%);
  animation: sparkle 1.5s ease-out;
  pointer-events: none;
}

@keyframes sparkle {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.unlock-title {
  font-size: 5.5vw;
  font-weight: bold;
  color: #4D58CB;
  margin: 0 0 1vh 0;
}

.badge-unlock-content h1 {
  font-size: 6.5vw;
  font-weight: bold;
  margin: 2vh 0 0 0;
  text-align: center;
}

.unlock-description {
  margin-bottom: 4vh;
  width: 90%;
}

.unlock-description p {
  font-size: 3.8vw;
  line-height: 1.4;
  color: #444;
}

.unlock-buttons {
  display: flex !important;
  flex-direction: row !important;
  gap: 3vw;
  width: 80%;
  margin: 3vh auto 0 auto;
  justify-content: center;
  align-items: center;
}

.unlock-buttons ion-button {
  margin: 0 !important;
}

.unlock-close-button {
  --background: var(--mona-yellow);
  --color: black;
  --border-radius: 2vw;
  font-weight: 500;
  height: 5vh;
  font-size: 0.8rem;
  flex: none;
  width: 35vw;
  max-width: 120px;
}

.unlock-badges-page-button {
  --background: #4D58CB;
  --color: white;
  --border-radius: 2vw;
  font-weight: 500;
  height: 5vh;
  font-size: 0.8rem;
  flex: none;
  width: 35vw;
  max-width: 120px;
}

/* Single button when multiple badges (smaller width) */
.unlock-buttons .single-button {
  width: 35vw !important;
  max-width: 140px !important;
}

/* Responsive design for smaller screens */
@media (max-width: 480px) {
  .unlock-buttons {
    flex-direction: column;
    gap: 2vh;
  }
  
  .unlock-close-button,
  .unlock-badges-page-button {
    max-width: 100%;
  }
}
</style>

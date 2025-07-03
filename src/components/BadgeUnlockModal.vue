<template>
  <!-- Badge Unlock Modal -->
  <ion-modal 
    :is-open="isBadgeUnlockModalOpen" 
    @didDismiss="closeBadgeUnlockModal"
    class="badge-unlock-modal"
    :backdrop-dismiss="true"
  >
    <div class="badge-unlock-content">
      <div class="unlock-animation">
        <img 
          :src="unlockedBadge?.src || '/assets/drawable/badges/count/unlocked/1.svg'" 
          alt="Badge" 
          class="badge-image animated"
          @error="handleImageError"
        />
        <div class="sparkle-effect"></div>
      </div>
      
      <h2 class="unlock-title">Nouveau badge débloqué!</h2>
      <h3>{{ getBadgeTitle(unlockedBadge) }}</h3>
      
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
      return badge.notification || 'Félicitations!';
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
      const img = event.target;
      img.src = '/assets/drawable/badges/count/unlocked/1.svg';
    },
  },
  
  mounted() {
    // Listen for badge unlock events
    eventBus.on('badge-unlocked', (badge) => {
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
  --width: 85%;
  --border-radius: 5vw;
  --box-shadow: 0 3vh 4vh rgba(0, 0, 0, 0.3);
}

.badge-unlock-content {
  padding: 6vh 5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 5vw;
  text-align: center;
}

.unlock-animation {
  position: relative;
  margin-bottom: 3vh;
}

.unlock-animation .badge-image {
  width: 35vw;
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

.badge-unlock-content h3 {
  font-size: 5vw;
  font-weight: 600;
  margin: 2vh 0 2vh 0;
  color: #333;
}

.unlock-description {
  margin-bottom: 3vh;
  width: 90%;
}

.unlock-description p {
  font-size: 4vw;
  line-height: 1.5;
  color: #555;
}

.unlock-buttons {
  display: flex !important;
  flex-direction: row !important;
  gap: 3vw;
  width: 100%;
  margin-top: 3vh;
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
  flex: 1;
  max-width: 40vw;
}

.unlock-badges-page-button {
  --background: #4D58CB;
  --color: white;
  --border-radius: 2vw;
  font-weight: 500;
  height: 5vh;
  font-size: 0.8rem;
  flex: 1;
  max-width: 40vw;
}

/* Single button when multiple badges (smaller width) */
.unlock-buttons .single-button {
  max-width: 50vw !important;
  width: 40vw;
  flex: none;
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

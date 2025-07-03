<template>
  <ion-app>
    <ion-router-outlet />
    
    <!-- Global Badge Unlock Modal -->
    <BadgeUnlockModal />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import BadgeUnlockModal from '@/components/BadgeUnlockModal.vue';
</script>

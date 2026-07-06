<template>
    <ion-page>
        <ion-nav :root="MorePageContainer" :key="navKey"></ion-nav>
    </ion-page>
</template>

<script lang="ts">
import { IonNav, IonPage } from '@ionic/vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { eventBus } from '@/internal/eventBus';
import MorePageContainer from "@/components/MorePageContainer.vue";

export default {
    components: {
        IonNav, IonPage
    },

    setup() {
        const navKey = ref(0);

        const resetNav = async () => {
            // Force a re-mount by changing the key
            navKey.value++;
            
            // Also try to directly call popToRoot on the nav element
            setTimeout(async () => {
                const navElement = document.querySelector('ion-nav');
                if (navElement && navElement.popToRoot) {
                    try {
                        await navElement.popToRoot();
                    } catch (e) {
                        console.log('Error calling popToRoot:', e);
                    }
                }
            }, 100);
        };

        onMounted(() => {
            // Listen for the more-tab-selected event
            eventBus.on("more-tab-selected", resetNav);
        });

        onUnmounted(() => {
            // Clean up the listener
            eventBus.off("more-tab-selected", resetNav);
        });

        return {
            MorePageContainer,
            navKey
        }
    }
}
</script>

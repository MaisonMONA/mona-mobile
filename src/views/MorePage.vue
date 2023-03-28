<template>
    <ion-page>
        <ion-nav :root="MorePageContainer"></ion-nav>
    </ion-page>
</template>

<script lang="ts">
import { IonNav, IonPage } from '@ionic/vue';
import MorePageContainer from "@/components/MorePageContainer.vue";

export default {
    components: {
        IonNav, IonPage
    },

    setup() {
        return {
            MorePageContainer
        }
    }
}
</script>

<template>
    <ion-nav :root="comp"></ion-nav>
</template>

<script lang="ts">
import { IonNav } from '@ionic/vue';
import MorePageContainer from "@/components/MorePageContainer.vue";

export default {
    components: {
        IonNav
    },

    data() {
        return {
            comp: MorePageContainer
        }
    }
}
</script>

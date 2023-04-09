<template>
    <ion-page>
        <ion-nav :root="CollectionContainer"></ion-nav>
    </ion-page>
</template>

<script>
import { IonNav, IonPage } from '@ionic/vue';
import CollectionContainer from "@/components/CollectionContainer.vue";

export default {
    components: {
        IonPage, IonNav
    },

    setup() {
        return {
            CollectionContainer
        }
    }
}
</script>

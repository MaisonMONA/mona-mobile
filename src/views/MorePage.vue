<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
          <ExploreContainer name="Tab 5 page"/>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import ExploreContainer from '@/components/(USE_AS_REFERENCE)_ExploreContainer.vue';

export default {
    // name: "more-page",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
        ExploreContainer
    }
}
</script>

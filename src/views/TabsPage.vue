<template>
    <ion-page>
        <ion-tabs> <!-- @ionTabsWillChange="checkRoute"> -->
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="discovery-of-the-day" href="/tabs/discovery-of-the-day">
                    <ion-icon :icon="customCalendar"/>
                </ion-tab-button>

                <ion-tab-button tab="artworks-list" href="/tabs/list">
                    <ion-icon :icon="customList"/>
                </ion-tab-button>

                <ion-tab-button tab="map" href="/tabs/map">
                    <ion-icon :icon="customMap"/>
                </ion-tab-button>

                <ion-tab-button tab="collection" href="/tabs/collection">
                    <ion-icon :icon="customCollection"/>
                </ion-tab-button>

                <ion-tab-button tab="more" href="/tabs/more">
                    <ion-icon :icon="customDotsMore"/>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="js">
import { IonTabBar, IonTabButton, IonTabs, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import customMap from "@/assets/drawable/icons/map_colored.svg"
import customCalendar from "@/assets/drawable/icons/calendar_black.svg"
import customList from "@/assets/drawable/icons/list.svg"
import customCollection from "@/assets/drawable/icons/collection.svg"
import customDotsMore from "@/assets/drawable/icons/dots_more.svg"

export default {
    components: {
        IonTabBar, IonTabButton, IonTabs, IonIcon, IonPage, IonRouterOutlet
    },

    data() {
        return {
            customMap, customList, customCalendar, customCollection, customDotsMore
        }
    },

    methods: {
        checkRoute(event) {
            if (event.tab == "map") {
                this.$router.replace("/tabs/map");
            }
        }
    }
}
</script>

<style scoped>
@import url("@/theme/TopToolbar.css");

ion-tab-bar {
    height: 10%;
    --border: 0;
    border: 0;
    margin-top: -1px;
    --background: var(--toolbar-purple);
}

ion-icon {
    font-size: 40px;
}
</style>

<template>
    <ion-page>
        <ion-tabs @ionTabsWillChange="checkRoute">

            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">

                <ion-tab-button id="map" tab="map" href="/tabs/map" :class="{ 'active-tab': activeTab === 'map' }">
                    <ion-icon :icon="activeTab === 'map' ? activeMap : inactiveMap"/>
                    <ion-label v-show="activeTab === 'map'">Carte</ion-label>
                </ion-tab-button>

                <ion-tab-button id="artworks-list" tab="artworks-list" href="/tabs/list" :class="{ 'active-tab': activeTab === 'artworks-list' }">
                    <ion-icon :icon="activeTab === 'artworks-list' ? activeList : inactiveList"/>
                    <ion-label v-show="activeTab === 'artworks-list'">Annuaire</ion-label>
                </ion-tab-button>

                <ion-tab-button id="collection" tab="collection" href="/tabs/collection" :class="{ 'active-tab': activeTab === 'collection' }">
                    <ion-icon :icon="activeTab === 'collection' ? activeCollection : inactiveCollection"/>
                    <ion-label v-show="activeTab === 'collection'">Collection</ion-label>
                </ion-tab-button>

                <ion-tab-button id="more" tab="more" href="/tabs/more" :class="{ 'active-tab': activeTab === 'more' }">
                    <ion-icon :icon="activeTab === 'more' ? activeMore : inactiveMore"/>
                    <ion-label v-show="activeTab === 'more'">Compte</ion-label>
                </ion-tab-button>

            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script lang="js">
import { IonTabBar, IonTabButton, IonTabs, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import inactiveMap from "@/assets/drawable/icons/inactive_map_tab_icon.svg"
import inactiveList from "@/assets/drawable/icons/inactive_list_tab_icon.svg"
import inactiveCollection from "@/assets/drawable/icons/inactive_collection_tab_icon.svg"
import inactiveMore from "@/assets/drawable/icons/inactive_more_tab_icon.svg"
import activeMap from "@/assets/drawable/icons/active_map_tab_icon.svg"
import activeList from "@/assets/drawable/icons/active_list_tab_icon.svg"
import activeCollection from "@/assets/drawable/icons/active_collection_tab_icon.svg"
import activeMore from "@/assets/drawable/icons/active_more_tab_icon.svg"


export default {
    components: {
        IonTabBar, IonTabButton, IonTabs, IonIcon, IonPage, IonRouterOutlet
    },

    data() {
        return {
            inactiveMap, inactiveList, inactiveCollection, inactiveMore,
            activeMap, activeList, activeCollection, activeMore,
            activeTab: "map",
            console
        }
    },

    methods: {
        checkRoute(event) {
          this.activeTab = event.tab;
        }
    }
}
</script>

<style scoped>
@import url("@/theme/TopToolbar.css");

ion-tab-bar {
    padding: 0 3% 0 5%;
    border-top: 1px solid #D9D9D9;
    height: 10%;
    margin-top: -1px;
    --background: #FFFFFF;
}

ion-tab-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 50%;
  border-radius: 90px;
  justify-content: left;
}

ion-icon {
    font-size: 6vw;
}

ion-label {
  color: black;
  font-size: 3.7vw;
  margin-left: 10%;
}

ion-tab-button.active-tab {
  --background: #FADA00;
}

ion-tab-button:not(.active-tab) {
  flex-grow: 0.6;
}

</style>

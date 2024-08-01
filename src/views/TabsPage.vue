<template>
  <ion-page>
    <ion-tabs @ionTabsWillChange="checkRoute">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button
          id="map"
          tab="map"
          href="/tabs/map"
          :class="{ 'active-tab': activeTab === 'map' }"
        >
          <ion-icon :icon="activeTab === 'map' ? activeMap : inactiveMap" />
          <ion-label v-show="activeTab === 'map'">Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button
          id="artworks-list"
          tab="artworks-list"
          href="/tabs/list"
          :class="{ 'active-tab': activeTab === 'artworks-list' }"
        >
          <ion-icon
            :icon="activeTab === 'artworks-list' ? activeList : inactiveList"
          />
          <ion-label v-show="activeTab === 'artworks-list'">Annuaire</ion-label>
        </ion-tab-button>

        <ion-tab-button
          id="collection"
          tab="collection"
          href="/tabs/collection"
          :class="{ 'active-tab': activeTab === 'collection' }"
        >
          <ion-icon
            :icon="
              activeTab === 'collection' ? activeCollection : inactiveCollection
            "
          />
          <ion-label v-show="activeTab === 'collection'">Collection</ion-label>
        </ion-tab-button>

        <ion-tab-button
          id="more"
          tab="more"
          href="/tabs/more"
          :class="{ 'active-tab': activeTab === 'more' }"
        >
          <ion-icon :icon="activeTab === 'more' ? activeMore : inactiveMore" />
          <ion-label v-show="activeTab === 'more'">Compte</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="js">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonLabel,
} from "@ionic/vue";
import inactiveMap from "/assets/drawable/icons/inactive_map_tab_icon.svg";
import inactiveList from "/assets/drawable/icons/inactive_list_tab_icon.svg";
import inactiveCollection from "/assets/drawable/icons/inactive_collection_tab_icon.svg";
import inactiveMore from "/assets/drawable/icons/inactive_more_tab_icon.svg";
import activeMap from "/assets/drawable/icons/active_map_tab_icon.svg";
import activeList from "/assets/drawable/icons/active_list_tab_icon.svg";
import activeCollection from "/assets/drawable/icons/active_collection_tab_icon.svg";
import activeMore from "/assets/drawable/icons/active_more_tab_icon.svg";

export default {
  components: {
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonIcon,
    IonPage,
    IonRouterOutlet,
    IonLabel,
  },
  data() {
    return {
      inactiveMap,
      inactiveList,
      inactiveCollection,
      inactiveMore,
      activeMap,
      activeList,
      activeCollection,
      activeMore,
      activeTab: "map",
      console,
    };
  },

  methods: {
    checkRoute(event) {
      this.activeTab = event.tab;
    },
  },
};
</script>

<style scoped>
@import url("@/theme/TopToolbar.css");

ion-tab-bar {
  padding: 0 4% 0 5%;
  border-top: 0.1vh solid #d9d9d9;
  border-bottom: 0.7vh solid #ffffff;
  height: 10vh;
  margin: -1px 0 0 0;
  --background: #ffffff;
}
.ios ion-tab-bar {
  padding: 0 4% 4vh 5%;
}

ion-tab-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  height: 50%;
  border-radius: 90px;
  padding: 0 1.5vw;
}
.ios ion-tab-button {
  padding: 0 3.8vw;
}

ion-tab-button ion-icon {
  font-size: 6vw;
}

ion-tab-button ion-label {
  color: black;
  font-size: 3.7vw;
  padding-left: 2.5vw;
  font-weight: 410;
}
.ios ion-tab-button ion-label {
  font-weight: 500;
}

ion-tab-button.active-tab {
  --background: #fada00;
}
</style>

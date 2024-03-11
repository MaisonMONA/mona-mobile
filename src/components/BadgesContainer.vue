<template v-if="badgesCollectionsStore.countCollection.length">
  <div class="main-container">
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <h1 style="margin-top: 0">Badges</h1>
      <span>{{
        nbrCountUnlocked + "/" + badgesCollectionsStore.countCollection.length
      }}</span>
    </div>

    <swiper :slides-per-view="3" :spaceBetween="10">
      <swiper-slide
        v-for="elem in badgesCollectionsStore.countCollection"
        :key="elem"
        class="badgeContainer ion-margin-end border ion-padding"
        style="height: 100%"
      >
        <img
          :alt="elem.message"
          :src="elem.src"
          style="max-width: none"
          @click="toDelete"
        />
        <span style="margin-top: 2%; font-size: small"> {{ elem.title }} </span>
      </swiper-slide>
    </swiper>

    <h1>Catégories</h1>
    <ion-row
      v-for="elem in badgesCollectionsStore.categoryCollection"
      :key="elem"
      class="ion-margin-bottom ion-margin-top border"
    >
      <ion-col size="auto">
        <img :alt="elem.message" :src="elem.src" />
      </ion-col>
      <ion-col>
        <div class="container_progression">
          <ion-label>{{ elem.title.fr }}</ion-label>
          <div class="progressBar ion-margin-top">
            <span class="ion-margin-end">{{
              elem.count + "/" + elem.requireCount
            }}</span>
            <ion-progress-bar
              :value="(elem.count / elem.requireCount).toFixed(2)"
            ></ion-progress-bar>
          </div>
        </div>
      </ion-col>
    </ion-row>

    <h1>Quartier</h1>
    <ion-row
      v-for="elem in badgesCollectionsStore.boroughCollection"
      :key="elem"
      class="ion-margin-bottom ion-margin-top border"
    >
      <ion-col size="auto">
        <img :alt="elem.message" :src="elem.src" />
      </ion-col>
      <ion-col>
        <div class="container_progression">
          <ion-label>{{ elem.title }}</ion-label>
          <div class="progressBar ion-margin-top">
            <span class="ion-margin-end">{{
              elem.count + "/" + elem.requireCount
            }}</span>
            <ion-progress-bar
              :value="(elem.count / elem.requireCount).toFixed(2)"
            ></ion-progress-bar>
          </div>
        </div>
      </ion-col>
    </ion-row>
    <ion-row
      v-for="elem in badgesCollectionsStore.ownerCollection"
      :key="elem"
      class="ion-margin-bottom ion-margin-top border"
    >
      <ion-col size="auto">
        <img :alt="elem.message" :src="elem.src" />
      </ion-col>
      <ion-col>
        <div class="container_progression">
          <ion-label>{{ elem.title }}</ion-label>
          <div class="progressBar ion-margin-top">
            <span class="ion-margin-end">{{
              elem.count + "/" + elem.requireCount
            }}</span>
            <ion-progress-bar
              :value="(elem.count / elem.requireCount).toFixed(2)"
            ></ion-progress-bar>
          </div>
        </div>
      </ion-col>
    </ion-row>
  </div>
</template>

<script>
import { IonLabel, IonProgressBar, IonRow, IonCol } from "@ionic/vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "@ionic/vue/css/ionic-swiper.css";
import { useBadgesCollections } from "@/stores/BadgesCollections";

const badgesCollectionsStore = useBadgesCollections();
export default {
  name: "BadgesContainer",
  components: {
    IonLabel,
    IonProgressBar,
    IonRow,
    IonCol,
    Swiper,
    SwiperSlide,
  },
  setup() {
    return { badgesCollectionsStore };
  },
  beforeMount() {
    badgesCollectionsStore.badgeCollection();
    this.borough = badgesCollectionsStore.boroughCollection.concat(
      badgesCollectionsStore.ownerCollection,
    );
  },
  computed: {
    nbrCountUnlocked() {
      return badgesCollectionsStore.userCount.length;
    },
  },
  methods: {
    toDelete() {
      console.log(badgesCollectionsStore.userCollectedDiscovery);
      console.log(badgesCollectionsStore.userCollectedBadges);
      console.log(badgesCollectionsStore.countCollection);
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

.main-container {
  padding: 5vw;
}

ion-title {
  font-family: "Gotham Rounded Light", sans-serif;
}

* {
  font-family: "Open Sans", sans-serif;
}

p {
  margin-top: 2vw;
  margin-bottom: 2vw;
}

a {
  color: steelblue;
  text-decoration: none;
  font-weight: normal;
}

.border {
  border-style: solid;
  border-color: #d9d9d9;
  border-radius: 11px;
  border-width: 1.4px;
}

.container_progression {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 95%;
}
.progressBar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.badgeContainer {
  display: flex;
  flex-direction: column;
  min-width: 25%;
  justify-content: center;
  align-items: center;
  padding: 1%;
}
.swiper .swiper-slide {
  height: auto !important;
}
</style>

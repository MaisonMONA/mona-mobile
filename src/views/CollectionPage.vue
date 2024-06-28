<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>MONA</ion-title>
      </ion-toolbar>
      <div
        class="ion-margin-end ion-margin-start"
        style="margin-top: 5%; margin-bottom: 5%"
      >
        <ion-segment :value="getSegment()" v-model="choixSegment" mode="ios">
          <ion-segment-button value="collection">
            <ion-label><b>Ma collection</b></ion-label>
          </ion-segment-button>
          <ion-segment-button value="badge">
            <ion-label><b>Mes badges</b></ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
    </ion-header>

    <ion-content>
      <keep-alive>
        <component :is="component" />
      </keep-alive>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  IonContent,
  IonPage,
  IonLabel,
} from "@ionic/vue";
import CollectionContainer from "@/components/CollectionContainer.vue";
import BadgesContainer from "@/components/BadgesContainer.vue";
import { markRaw } from "vue";
import badgesContainer from "@/components/BadgesContainer.vue";
export default {
  name: "CollectionBadge",
  computed: {
    badgesContainer() {
      return badgesContainer;
    },
  },
  components: {
    BadgesContainer,
    CollectionContainer,
    IonHeader,
    IonBackButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonSegmentButton,
    IonSegment,
    IonContent,
    IonPage,
    IonLabel,
  },
  setup() {
    return {
      CollectionContainer,
      BadgesContainer,
    };
  },
  methods: {
    getSegment() {
      if (this.choixSegment === "collection") {
        this.component = markRaw(CollectionContainer);
      } else {
        this.component = markRaw(BadgesContainer);
      }
      return this.choixSegment;
    },
  },
  data() {
    return {
      choixSegment: "collection",
      component: markRaw(CollectionContainer),
    };
  },
};
</script>

<style>
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

ion-segment-button {
  --indicator-color: var(--mona-yellow);
  --border-radius: 20px;
}
</style>

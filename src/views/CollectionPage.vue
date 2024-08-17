<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
      </ion-toolbar>
      <div class="ion-segment-container">
        <ion-segment :value="getSegment()" v-model="choixSegment" mode="ios">
          <ion-segment-button value="collection">
            <ion-label>Ma collection</ion-label>
          </ion-segment-button>
          <ion-segment-button value="badge" id="badge">
            <ion-label>Mes badges</ion-label>
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



.ion-segment-container {
  background: white;
  padding: 5vw 3.8vw;
}

ion-segment {
  /* Override dark mode */
  --background: white;
  border: 1px solid black;
  border-radius: 90px;
  padding: 1px;
}

ion-segment-button {
  /* Override dark mode */
  --color: black;

  height: 5vh;
  font-size: 1.9vh;
  font-weight: 500;
  letter-spacing: 0.1vw;
  width: 39vw;
  padding: 0 3vw;
  margin-left: 0.5%; /* for "Ma collection" button*/

  --indicator-color: var(--mona-yellow);
  --indicator-box-shadow: none;
  --border-radius: 20vw;
}

#badge {
  margin-left: 14%;

}
</style>

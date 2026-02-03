<template>
  <ion-page id="collectionPage" :class="{ 'badges-view': choixSegment === 'badge' }">
    <div id="userInfo">
      <ion-icon id="defaultUserAvatar" :icon="defaultUserAvatar"></ion-icon>
      <div id="userInfoText">
        <h1 :style="{paddingTop: memberSince? '0' : '1.1vh'}">{{ username }}</h1>
        <h6 v-if="memberSince">Membre depuis {{ memberSince }}</h6>
      </div>
    </div>

      <div class="ion-segment-container collectionPageSegment">
        <ion-segment :value="getSegment()" v-model="choixSegment" mode="ios">
          <ion-segment-button value="collection">
            <ion-label>Ma collection ({{ collected.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="badge" id="badge">
            <ion-label>Mes badges ({{ completedBadges }})</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

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
  IonIcon,
} from "@ionic/vue";
import CollectionContainer from "@/components/CollectionContainer.vue";
import BadgesContainer from "@/components/BadgesContainer.vue";
import { markRaw } from "vue";
import badgesContainer from "@/components/BadgesContainer.vue";
import {UserData} from "@/internal/databases/UserData";
import defaultUserAvatar from "/assets/drawable/icons/defaultUserAvatar.svg";
import Utils from "@/internal/Utils";
import Globals from "@/internal/Globals";
import {useCollection} from "@/stores/Collection.ts";
import { useBadgesCollections } from "@/stores/BadgesCollections";

const useCollectionStore = useCollection();
const badgesCollectionsStore = useBadgesCollections();
export default {
  name: "CollectionBadge",
  computed: {
    badgesContainer() {
      return badgesContainer;
    },
    collected() {
      return useCollectionStore.collected;
    },
    completedBadges() {
      return badgesCollectionsStore.getCompletedBadges;
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
    IonIcon,
  },
  setup() {
    return {
      CollectionContainer,
      BadgesContainer,
      badgesCollectionsStore,
    };
  },
  ionViewWillEnter() {
    // Reset to collection view whenever entering this page
    this.choixSegment = "collection";
    this.component = markRaw(CollectionContainer);
  },
  beforeMount() {
    const created_at = UserData.getWhenAccountCreated();
    if (created_at) {
      const yearDayArray = /^(\d{4})-(\d{2})-/.exec(created_at);
      const year = yearDayArray[1];
      const month = parseInt(yearDayArray[2]);
      const monthsArray = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ];
      this.memberSince = monthsArray[month - 1] + " " + year;
    }
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
    switchToCollection() {
      this.choixSegment = "collection";
      this.component = markRaw(CollectionContainer);
    },
    switchToBadges() {
      this.choixSegment = "badge";
      this.component = markRaw(BadgesContainer);
    },
  },
  data() {
    return {
      memberSince: "",
      choixSegment: "collection",
      component: markRaw(CollectionContainer),
      username: UserData.getUsername(),
      defaultUserAvatar,
    };
  },
};
</script>

<style>
@import url("@/theme/GlobalStyle.css");

#collection-and-badges-number-container {
  display: flex;
  justify-content: space-between;
  margin: 3vh 5vw 1vh 5vw;
  max-width: 90vw;
}

.collection-header {
  display: flex;
  align-items: center;
  height: 7vh;
  background: #FDF4B4;
  text-align: center;
  border-radius: 2vw;
}

.collection-header * {
  color: black;
}

.collection-header p {
  text-align: left;
  font-size: 4vw;
  margin-left: 2vw;
}

.collection-header p.collected-count {
  font-size: 10vw;
  font-weight: 600;
  margin-left: 4vw;
}

.collection-header ion-icon {
  /*font-size: 80px;*/
  --ionicon-stroke-width: 20px;
}

#badges-obtained {
  background: #DADCF1;
}
#badges-obtained:last-child {
  padding-right: 4vw;
}

* {
  font-family: 'Open Sans', sans-serif;
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

#collectionPage {
  /* Override dark mode */
  background: white;
}

#collectionPage.badges-view {
  background: #F2F2F2;
}

#collectionPage.badges-view ion-content {
  --background: #F2F2F2;
}

#userInfo {
  color: black;
  display: flex;
  padding: 8vw 5vw 0 5vw;
}
.ios #userInfo {
  margin: 9vw 0 0 0;
}

#userInfoText {
  margin-left: 5vw;
  display: flex;
  flex-direction: column;
}

#defaultUserAvatar {
  font-size: 11vw;
  margin-top: 1%;
}

#userInfoText h1 {
  font-size: 7.2vw;
  margin: 0;
}
#userInfoText h6 {
  font-size: 3.3vw;
  margin: 0;
}

.ion-segment-container.collectionPageSegment {
  padding: 5vw 3.8vw;
}

.collectionPageSegment ion-segment {
  --background: white;
  border: 1px solid black;
  border-radius: 90px;
  padding: 1px;
  /* background-image: url('/assets/drawable/icons/collection_toggle_background.svg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center; */
}

.collectionPageSegment ion-segment-button {
  /* Override dark mode */
  --color: #595959; /* Inactive button color */
  height: 5vh;
  font-size: 3.5vw;
  font-weight: 500;
  letter-spacing: 0.05vw;
  width: 43vw;
  padding: 0 1vw;
  margin-left: 0.5%; /* for "Ma collection" button*/
  margin-top: 0;
  margin-bottom: 0;
  --indicator-color: transparent; /* make indictator invisible. Replaced with SVG below. */
  --indicator-box-shadow: none;
  --border-radius: 20vw;
}

/* Active segment button - black text */
.collectionPageSegment ion-segment-button.segment-button-checked {
  --color: black;
}

/* Irregular SVG background for toggle indicator */
.collectionPageSegment ion-segment-button::part(indicator) {
  background-image: url('/assets/drawable/icons/collection_toggle_background.svg');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

/* Regular yellow background for small screens */
@media (max-width: 280px) {
  .collectionPageSegment ion-segment-button {
    --indicator-color: var(--mona-yellow);
  }
  
  .collectionPageSegment ion-segment-button::part(indicator) {
    background-image: none;
  }
}

/* Use regular yellow background for tablets/large screens */
@media (min-width: 500px) {
  .collectionPageSegment ion-segment-button {
    --indicator-color: var(--mona-yellow);
  }
  
  .collectionPageSegment ion-segment-button::part(indicator) {
    background-image: none;
  }
}

.collectionPageSegment ion-segment-button ion-label {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  font-size: inherit;
}

#badge {
  margin-left: 8%;
  margin-right: 4vw;
}
</style>

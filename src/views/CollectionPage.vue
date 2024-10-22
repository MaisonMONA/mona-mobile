<template>
  <ion-page id="collectionPage">
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
            <ion-label>Ma collection</ion-label>
          </ion-segment-button>
          <ion-segment-button value="badge" id="badge">
            <ion-label>Mes badges</ion-label>
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
    IonIcon,
  },
  setup() {
    return {
      CollectionContainer,
      BadgesContainer,
    };
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

#collectionPage {
  /* Override dark mode */
  background: white;
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
  font-size: 13vw;
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
}

.collectionPageSegment ion-segment-button {
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

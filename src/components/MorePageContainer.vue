<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>MONA</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <ion-grid>
        <ion-row>
          <ion-col size="1.7">
            <div><ion-icon id="image" :icon="avatar"></ion-icon></div> <!--TODO Finish image that can be modified-->
          </ion-col>
          <ion-col size="0.5"></ion-col>
          <ion-col size="9">
            <ion-row id="username"><div>{{username}}</div></ion-row>
            <ion-row id="memberSince"><div>Membre depuis</div></ion-row> <!--TODO Finish memberSince-->
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-list lines="none">
        <ion-nav-link @click="playTutorial">
          <ion-item>
            <ion-button shape="round">
              <ion-icon :icon="tutorialIcon" slot="start"></ion-icon>
              <ion-label>Tutoriel</ion-label>
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-nav-link>
        <ion-nav-link router-direction="forward" :component="whoweare">
          <ion-item>
            <ion-button shape="round">
              <ion-label>Qui sommes-nous ?</ion-label>
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-nav-link>
        <ion-nav-link router-direction="forward" :component="about">
          <ion-item>
            <ion-button shape="round">
              <ion-icon :icon="aboutIcon" slot="start"></ion-icon>
              <ion-label>À propos</ion-label>
              <ion-icon :icon="arrowForward" slot="end"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-nav-link>
      </ion-list>

      <!--Moved it out of ion-list to make it stick at the bottom-->
      <ion-nav-link id="disconnect" router-direction="forward" :component="logout">
        <ion-item lines="none">
          <ion-button shape="round">
            <ion-label>SE DÉCONNECTER</ion-label>
          </ion-button>
        </ion-item>
      </ion-nav-link>

    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonNavLink,
  IonLabel,
  IonIcon,
} from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import AboutContainer from "@/components/AboutContainer.vue";
import { arrowForward } from "ionicons/icons";
import WhoWeAreContainer from "@/components/WhoWeAreContainer.vue";
import LogoutContainer from "@/components/LogoutContainer.vue";
import tutorialCustomIcon from "@/assets/drawable/icons/tutorial_icon.svg";
import aboutCustomIcon from "@/assets/drawable/icons/about_icon.svg";
import avatarCustom from "@/assets/drawable/icons/avatar.svg";

export default {
  name: "MorePageContainer",
  components: {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonNavLink,
    IonLabel,
    IonIcon,
    IonPage,
  },

  setup() {
    return {
      about: AboutContainer,
      whoweare: WhoWeAreContainer,
      logout: LogoutContainer,
    };
  },

  data() {
    return {
      username: UserData.getUsername(),
      arrowForward,
      tutorialIcon: tutorialCustomIcon,
      aboutIcon: aboutCustomIcon,
      avatar: avatarCustom,
    };
  },

  methods: {
    playTutorial() {
      this.$router.push({
        path: "/tutorial",
        query: { callbackurl: "/tabs/more" },
      });
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.more-page-header {
  height: 25%;
  background: var(--blue-powder);
  display: flex;
}

.more-page-header p {
  color: white;
  font-family: "Open Sans", sans-serif;
  font-size: 8vw;
  font-weight: 500;
  align-self: flex-end;
  padding: 8vw;
}

ion-grid {
  margin-top: 8vw;
  margin-bottom: 6vw;
  padding: 0;
  width: 93vw;
  height: 15vw;
}
ion-col, ion-row {
  padding: 0;
  /*background-color: #135d54;
  border: solid 1px blue;
  color: #fff;*/
}
#image {
  font-size: 13vw;
}
#username {
  font-size: 6vw;
  font-weight: 500;
  letter-spacing: 0.7px;
  padding-bottom: 2vw; /* To make memberSince block lower*/
}
#memberSince {
  font-size: 3.5vw;
  letter-spacing: 0.1px;
}

ion-list {
  margin-top: 10vw;
}

ion-item {
  margin: 1vw 0;
}

ion-button {
  width: 92vw;
  height: 12vw;
  --background: #dadcf1;
  text-transform: none;
  font-size: 4vw;
  font-weight: 500;
  --box-shadow: none;
  text-align: left;
}

/* TODO Make disconnect button _stay_ under the other buttons... with ionic serve */
#disconnect {
  position: absolute;
  bottom: 12vw;
}
#disconnect ion-button {
  --background: #d9d9d9;
  font-size: 4.2vw;
  text-align: center;
}

ion-icon[slot="start"] {
  padding: 0 2.1vw 0 4vw;
}
ion-icon[slot="end"] {
  padding: 0 2vw;
}

ion-icon {
  color: black;
}
</style>

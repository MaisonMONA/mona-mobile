<template>
    <ion-page>
        <ion-content>
          <div id="userInfoMorePage">
            <ion-icon id="defaultUserAvatarMorePage" :icon="defaultUserAvatar"></ion-icon>
            <div id="userInfoTextMorePage">
              <h1 :style="{paddingTop: memberSince? '0' : '1.1vh'}">{{ username }}</h1>
              <h6 v-if="memberSince">Membre depuis {{ memberSince }}</h6>
            </div>
          </div>
            <ion-list lines="full" class="ion-padding">
                <ion-nav-link router-direction="forward" :component="about">
                    <ion-item>
                        <ion-icon id="aProposIcon" :icon="aPropos" slot="start"></ion-icon>
                        <ion-label>À propos</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
                <ion-nav-link router-direction="forward" :component="confidentialityPolicy">
                    <ion-item>
                        <ion-icon id="confidentialityPolicyIcon" :icon="confidentialityPolicyIcon" slot="start"></ion-icon>
                        <ion-label>Politique de confidentialité</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
                <ion-nav-link @click="playTutorial">
                    <ion-item>
                        <ion-icon :icon="activeList" slot="start"></ion-icon>

                        <ion-label>Tutoriel</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
            </ion-list>

          <ion-nav-link router-direction="forward" :component="logout">
            <ion-button id="disconnectButton" fill="outline">
                  DÉCONNEXION
            </ion-button>
          </ion-nav-link>

        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonList, IonItem, IonNavLink, IonLabel, IonIcon } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";
import AboutContainer from "@/components/AboutContainer.vue";
import { arrowForward } from "ionicons/icons";
import ConfidentialityPolicyContainer from "@/components/ConfidentialityPolicyContainer.vue";
import LogoutContainer from "@/components/LogoutContainer.vue";
import defaultUserAvatar from "/assets/drawable/icons/defaultUserAvatar.svg";
import activeList from "/assets/drawable/icons/active_list_tab_icon.svg";
import aPropos from "/assets/drawable/icons/a_propos_icon.svg";
import confidentialityPolicyIcon from "/assets/drawable/icons/confidentiality_policy_icon.svg";

export default {
    name: "MorePageContainer",
    components: {
        IonContent, IonList, IonItem, IonNavLink, IonLabel, IonIcon, IonPage
    },

    setup() {
        return {
            about: AboutContainer,
            confidentialityPolicy: ConfidentialityPolicyContainer,
            logout: LogoutContainer,
        }
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
    data() {
        return {
            memberSince: "",
            username: UserData.getUsername(),
            arrowForward,
            defaultUserAvatar,
            activeList,
            aPropos,
            confidentialityPolicyIcon,
        }
    },

    methods: {
        playTutorial() {
            this.$router.push({ path: "/tutorial", query: { callbackurl: "/tabs/more" }})
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

#userInfoMorePage {
  color: black;
  display: flex;
  padding: 8vw 5vw 0 5vw;
}
.ios #userInfoMorePage {
  margin: 9vw 0 0 0;
}

#userInfoTextMorePage {
  margin-left: 5vw;
  display: flex;
  flex-direction: column;
}

#defaultUserAvatarMorePage {
  font-size: 13vw;
}

#userInfoTextMorePage h1 {
  font-size: 7.2vw;
  margin: 0;
}
#userInfoTextMorePage h6 {
  font-size: 3.3vw;
  margin: 0;
}

ion-icon, ion-label {
    color: black;
    font-size: 4.5vw;
}

ion-icon[slot="start"] {
    font-size: 5vw;
}

#aProposIcon {
    font-size: 6vw;
}

#confidentialityPolicyIcon {
    font-size: 5.5vw;
}

ion-list {
  margin-top: 4vh;
}

ion-item {
    --border-color: #B5BAE3;
}

ion-label {
    margin: 2vh 0;
}

#disconnectButton {
  --color: #D82727;
  --border-color: #D82727;
  --border-radius: 1vw;
  width: 88vw;
  height: 5vh;
  position: absolute;
  bottom: 3.7vh;
  left: 5.7vw;
  --background-activated : #D82727;
  --color-activated : white;
}

</style>

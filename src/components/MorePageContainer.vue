<template>
    <ion-page>
        <ion-content class="ion-padding ion-text-left">
          <img src="/assets/drawable/mona_logo_med.png" alt="MONA logo">
          <p id="mona_description">L'application MONA est un projet libre et open source pour découvrir l'art public,
            les lieux culturels et le patrimoine du Québec. Elle est produite par la Maison MONA,
            un organisme à but non lucratif basé à Montréal (Québec, Canada).</p>
            <ion-list lines="full">
              <ion-nav-link @click="playTutorial">
                <ion-item>
                  <ion-icon :icon="activeList" slot="start"></ion-icon>
                  <ion-label class="params_item_label">Tutoriel</ion-label>
                  <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                </ion-item>
              </ion-nav-link>

                <ion-nav-link router-direction="forward" :component="confidentialityPolicy">
                    <ion-item>
                        <ion-icon id="confidentialityPolicyIcon" :icon="confidentialityPolicyIcon" slot="start"></ion-icon>
                        <ion-label class="params_item_label">Politique de confidentialité</ion-label>
                        <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                    </ion-item>
                </ion-nav-link>
              <ion-nav-link router-direction="forward" :component="about">
                <ion-item lines="none">
                  <ion-icon id="aProposIcon" :icon="aPropos" slot="start"></ion-icon>
                  <ion-label class="params_item_label">À propos de la maison MONA</ion-label>
                  <ion-icon :icon="arrowForward" slot="end"></ion-icon>
                </ion-item>
              </ion-nav-link>
            </ion-list>

          <div id="followUsAndMediaLinks" class="ion-text-center">
            <span>Suivez-nous!</span>
            <div id="mediaLinks">
            <a href="https://monamontreal.org">
              <ion-icon :icon="`/assets/drawable/icons/website_icon.svg`"></ion-icon>
            </a>
            <a href='mailto: data@monamontreal.org'>
              <ion-icon :icon="`/assets/drawable/icons/mail.svg`"></ion-icon>
            </a>
            <a href="https://m.facebook.com/MONA.ArtPublic/">
              <ion-icon :icon="`/assets/drawable/icons/facebook_icon.svg`"></ion-icon>
            </a>
            <a href="https://www.instagram.com/mona.artpublic/">
              <ion-icon :icon="`/assets/drawable/icons/instagram_icon.svg`"></ion-icon>
            </a>
          </div>
          </div>

          <ion-nav-link router-direction="forward" :component="logout">
            <ion-button id="disconnectButton" fill="outline">
                  DÉCONNEXION
            </ion-button>
          </ion-nav-link>

        </ion-content>
    </ion-page>
</template>

<script>
import {IonPage, IonContent, IonList, IonItem, IonNavLink, IonLabel, IonIcon, IonButton} from "@ionic/vue";
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
        IonContent, IonList, IonItem, IonNavLink, IonLabel, IonIcon, IonPage, IonButton,
    },

    setup() {
        return {
            about: AboutContainer,
            confidentialityPolicy: ConfidentialityPolicyContainer,
            logout: LogoutContainer,
        }
    },
    data() {
        return {
            arrowForward,
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

#mona_description {
  margin: 0 4.6vw;
  font-size: 3.9vw;
  line-height: 5.8vw;
}

#followUsAndMediaLinks {
  background: #FDF4B4;
  border-radius: 3vw;
  width: 92vw;
  height: 15vh;
  font-size: 4vw;
  margin-top: 3.5vh;
  padding-top: 2.67vh;
}

#mediaLinks {
  margin-top: 1.2vh;
}

#mediaLinks ion-icon {
  font-size: 12vw;
}

#mediaLinks a {
  margin-left: 7.7vw;
}

#mediaLinks a:first-child {
  margin-left: 0;
}

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

img[alt="MONA logo"] {
  max-width: 30vw;
  margin-top: 5vh;
  margin-left: 32vw;
  margin-bottom: 2vh;
}

#userInfoTextMorePage h1 {
  font-size: 7.2vw;
  margin: 0;
}
#userInfoTextMorePage h6 {
  font-size: 3.3vw;
  margin: 0;
}

ion-icon {
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
  margin-top: 2.7vh;
}

ion-item {
    --border-color: #B5BAE3;
}

ion-label {
    margin: 2vh 0;
}

.params_item_label {
  font-size: 3.8vw;
  font-weight: bold;
}

#disconnectButton {
  --color: #D82727;
  --border-color: #D82727;
  --border-radius: 2vw;
  width: 92vw;
  height: 5vh;
  position: absolute;
  bottom: 1vh;
  margin: 4vw 0;
  --background-activated : #D82727;
  --color-activated : white;
  font-size: 4vw;
}

</style>

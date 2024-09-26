<template>
  <ion-page>
    <ion-content>
      <div class="discoveryDetailsContainer">
        <div class="discoverydetails">
          <div class="chipsContainer">
            <!-- Type -->
            <ion-chip
              id="typeChip"
              :style="{
                backgroundColor:
                  dType === 'artwork'
                    ? '#FFDE7B'
                    : dType === 'heritage'
                      ? '#F9B09E'
                      : '#B965ED',
                color: dType === 'place' ? 'white' : 'black',
              }"
              >{{
                dType === "artwork"
                  ? "Oeuvre d'art"
                  : dType === "heritage"
                    ? "Patrimoine"
                    : "Lieux Culturels"
              }}
            </ion-chip>
            <!-- Categories -->
            <ion-chip
              id="categoryChip"
              :outline="true"
              v-if="dType === 'artwork' ? details2 : details1"
              >{{ dType === "artwork" ? details2 : details1 }}
            </ion-chip>
            <!-- DiscoveryState -->
            <ion-chip
              id="discoveryStateChip"
              :style="{
                backgroundColor: isCollected
                  ? '#FDF4B4'
                  : isTargeted
                    ? '#ECEDF8'
                    : '#4D58CB',
                color: isCollected
                  ? '#000000'
                  : isTargeted
                    ? '#2E389E'
                    : '#FFFFFF',
              }"
            >
              {{
                isCollected
                  ? "Dans la collection"
                  : isTargeted
                    ? "Sauvegardée"
                    : "À collectionner"
              }}
              <ion-icon
                :icon="
                  isCollected
                    ? './assets/drawable/icons/collectedIcon.svg'
                    : isTargeted
                      ? customTargetIcon
                      : './assets/drawable/icons/yetToCollectIcon.svg'
                "
              ></ion-icon>
            </ion-chip>
          </div>

          <div id="titleAndTargetIcon">
            <!-- TARGET BUTTON -->
            <ion-icon
              v-if="!isCollected"
              id="targetIcon"
              @click="toggleTargetDiscovery"
              :icon="customTargetIcon"
            ></ion-icon>
            <!-- Title -->
            <span class="details title">{{ discovery.getTitle() }}</span>
          </div>

          <hr class="separating-bar" />

          <div id="artistsAndDate">
            <!-- Artists or usages -->
            <span v-if="dType === 'artwork'" class="details one">{{
              details1
            }}</span>
            <span
              v-if="dType === 'artwork'"
              id="bigDotBetweenArtistsAndDate"
            >
              •
            </span>
            <!-- Production date -->
            <span class="details production-date">{{ productionDate }}</span>
          </div>
        </div>

        <div class="photoContainer">
          <ion-img
            id="defaultPhoto"
            :src="'./assets/drawable/discoveryDetailsPhotoPlaceholder.svg'"
          ></ion-img>
          <ion-img id="userPhoto"></ion-img>
        </div>

        <div class="addressContainer">
          <!-- Discovery pin icon-->
          <ion-icon
            :icon="`./assets/drawable/pins/${discovery.dType}/default.svg`"
          ></ion-icon>
          <span>{{ details7 }}</span>
        </div>

        <!-- FICHE COMPLETE BUTTON -->
        <ion-button
          class="discovery-button"
          id="ficheCompleteButton"
          fill="outline"
          @click="openDiscoveryDetailsPage"
          :style="{ width: isCollected ? '92vw' : '44vw' }"
        >
          {{ isCollected ? "VOIR LA FICHE COMPLÈTE" : "FICHE COMPLÈTE" }}
        </ion-button>

        <!-- PHOTO BUTTON -->
        <ion-button
          class="discovery-button"
          id="photoButton"
          fill="solid"
          @click="activateCamera"
        >
          <ion-icon
            id="cameraIcon"
            :icon="'./assets/drawable/icons/camera_photo_icon.svg'"
          ></ion-icon>
          PHOTOGRAPHIER
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonImg,
  toastController,
  IonChip,
} from "@ionic/vue";

import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import targetIconUnactivated from "/assets/drawable/icons/target_unactivated.svg";
import targetIconActivated from "/assets/drawable/icons/target_activated.svg";
import customMapIcon from "/assets/drawable/icons/map.svg";

export default {
  name: "discovery-details",

  props: {
    selectedDiscovery: Object,
  },

  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonButton,
    IonImg,
    IonChip,
  },

  data() {
    let isArtwork,
      productionDate,
      details1,
      details2,
      details3,
      details4,
      details5,
      details6,
      details7;
    if (this.discovery.dType === "artwork") {
      isArtwork = true;

      details1 = this.discovery.getArtists();
      details2 = this.discovery.getCategories();
      details3 = this.discovery.getDirections();
      details4 = this.discovery.getDimensions();
      details5 = this.discovery.getMaterials();
      details6 = this.discovery.getTechniques();
      details7 = "(" + this.discovery.getLocation().lat + ", " + this.discovery.getLocation().lng + ")";

      productionDate = this.discovery.produced_at;
    } else {
      isArtwork = false;

      details1 = this.discovery.getUsages();
      details2 = this.discovery.getAddress();
      details3 = this.discovery.description;
      details4 = "";
      details5 = "";
      details6 = "";
      details7 = this.discovery.getAddress();

      if (this.discovery.dType === "heritage")
        productionDate = this.discovery.produced_at;
      else productionDate = "";
    }

    return {
      customMapIcon,

      isCollected: UserData.isCollected(
          this.discovery.id,
          this.discovery.dType,
      ),

      isTargeted: UserData.isTargeted(this.discovery.id, this.discovery.dType),

      customTargetIcon: UserData.isTargeted(this.discovery.id, this.discovery.dType) ?
          targetIconActivated : targetIconUnactivated, // May be overridden during mount

      isArtwork,
      productionDate,
      details1,
      details2,
      details3,
      details4,
      details5,
      details6,
      details7,
    };
  },

  setup(props) {
    const id = parseInt(props.selectedDiscovery.id.toString() || "-1");
    const type = props.selectedDiscovery.dType || "-1";
    //former: const type = parseInt(props.selectedDiscoveryType.toString() || "-1");

    const discovery = Utils.getDiscovery(id, type);

    return {
      dType: type,
      discovery,
      DiscoveryEnum,
    };
  },

  mounted() {
    const userData = UserData.getCollected(
      this.discovery.id,
      this.discovery.dType,
    );

    if (userData) {
      if (userData.filename) {
        Filesystem.readFile({
          path: "img/" + userData.filename,
          directory: Directory.Data,
        }).then(async (image) => {
          const base64Result = await fetch(
            `data:image/${userData.filename.split(".").at(-1)};base64,${image.data}`,
          );
          const url = await base64Result
            .blob()
            .then((blob) => URL.createObjectURL(blob));
          const userImg = document.getElementById("userPhoto");
          const defaultImg = document.getElementById("defaultPhoto");

          defaultImg.style.display = "none";
          userImg.style.display = "block";
          userImg.src = url;

          // Enable image opening
          // TODO uncomment line below after implementing showImg
          // userImg.onclick = this.showImg;
        });
      }

      // Hiding buttons
      document.getElementById("photoButton").style.display = "none";
    }

    // Handling target icon color
    if (UserData.isTargeted(this.discovery.id, this.discovery.dType))
      this.customTargetIcon = targetIconActivated;
    else this.customTargetIcon = targetIconUnactivated;
  },

  methods: {
    openDiscoveryDetailsPage() {
      this.$emit('view-full-details', UserData.getCollected(this.discovery.id, this.discovery.dType));
    },

    async activateCamera() {
      const img = await Utils.takePicture();
      if (img == null) return; // User cancelled

      // Displaying photo in container
      const userImg = document.getElementById("userPhoto");
      const defaultImg = document.getElementById("defaultPhoto");
      defaultImg.style.display = "none";
      userImg.style.display = "block";
      userImg.src = img.webPath || "";

      // Hiding buttons
      const photoButton = document.getElementById("photoButton");
      if (photoButton) {
        // Same here
        photoButton.style.display = "none";
      }

      // Enable image opening
      userImg.onclick = this.showImg;

      const filename = await Utils.savePicture(img);
      UserData.addCollected(this.discovery, filename, null, null);
      UserData.addPendingUpload(this.discovery.id, this.discovery.dType);

      const redirection = {
        path: "/discovery-review/",
        query: {
          id: this.discovery.id,
          type: this.discovery.dType,
        },
      };

      this.$router.push(redirection);
    },

    async toggleTargetDiscovery() {
      let toastMessage;

      if (UserData.isTargeted(this.discovery.id, this.discovery.dType)) {
        UserData.removeTargeted(this.discovery);
        this.customTargetIcon = targetIconUnactivated;
        this.isTargeted = false;

        toastMessage = "La découverte n'est plus ciblée";
      } else {
        UserData.addTargeted(this.discovery);
        this.customTargetIcon = targetIconActivated;
        this.isTargeted = true;

        toastMessage = "La découverte est maintenant ciblée";
      }

      toastController
        .create({
          message: toastMessage,
          duration: 2000,
          position: "bottom",
        })
        .then((toast) => toast.present());
    },

    showImg() {
      // TODO
    },
  },
};
</script>

<style scoped>
.chipsContainer {
  position: relative;
  right: 2vw;
}
.chipsContainer ion-chip {
  padding: 0 1.9vw;
  font-family: "Roboto Light", sans-serif;
  font-size: 2.9vw;
  font-weight: 400;
  min-height: 2.67vh;
}
#categoryChip {
  color: #2E389E;
  border-color: #2E389E;
}
#discoveryStateChip ion-icon {
  font-size: 2.8vw;
  padding-right: 1.4vw;
}

#ficheCompleteButton {
  height: 5.4vh;
  margin-left: 3.9vw;
  margin-right: 3.8vw;
  --color: #2e389e;
  --border-color: #757dd7;
  --border-width: 2px;
  --border-radius: 8px;
  font-size: 3.8vw;
}

#photoButton {
  height: 5.4vh;
  width: 44vw;
  position: absolute;
  --background: #4d58cb;
  --color: white;
  --border-radius: 8px;
  --padding-start: 2.9vw;
  --padding-end: 2.9vw;
  font-size: 3.8vw;
  font-weight: 600;
}
#photoButton ion-icon {
  font-size: 3.7vw;
  margin-right: 1.8vw;
}

ion-button ion-icon {
  font-weight: 100;
  font-size: 45px;
  --ionicon-stroke-width: 20;
  color: black;
}

ion-button {
  --border-radius: 15px;
  --background: white;
}

.discoverydetails {
  margin: 5% 5% 1.8vh 5%;
  font-family: "OpenSans", sans-serif;
}

#titleAndTargetIcon {
  margin: 1.7vh 0;
}
.details.title {
  font-size: 32px;
  font-weight: 500;
  line-height: 9.6vw;
}
#targetIcon {
  float: right;
  --background: white;
  font-size: 30px;
}

#bigDotBetweenArtistsAndDate {
  font-size: 20px;
  color: #fada00;
}

#artistsAndDate {
  margin: 1.7vh 0;
}
/* TODO Make text cut and add ellipsis when it's bigger than 2 lines just before date */
.details.one {
  font-size: 4.8vw;
  font-weight: 300;
  margin: 20px 0 0 0;
}
.details.production-date {
  font-size: 3.8vw;
  font-weight: 300;
}

.details{
  font-size: 14px;
  margin: 5px 0;
  line-height: 20px;
}

.separating-bar {
  border-top: 1px solid #e6e6e6;
}

.photoContainer {
  position: relative;
  height: 100%;
  width: 92vw;
  margin: 0 0 1.8vh 3.9vw;
}
.photoContainer ion-img::part(image) {
  border-radius: 1.9vw;
}
.photoContainer ion-img#defaultPhoto {
  position: relative;
  height: 17vh;
}
.photoContainer ion-img#userPhoto {
  display: none;
  object-fit: cover;
  height: 28vh;
}

.addressContainer {
  display: flex;
  align-items: center;
  margin: 0 1.8vh 2.7vh 1.8vh;
  font-size: 3.4vw;
}
.addressContainer ion-icon {
  font-size: 6vw;
  margin-right: 1.8vw;
}
.addressContainer span {
  text-decoration: underline;
}

</style>

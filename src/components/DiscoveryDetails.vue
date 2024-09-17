<template>
  <ion-page>

    <ion-content>

      <div class="discoveryDetailsContainer">
        <div class="discoverydetails">

          <!-- TODO Modify how it takes up space -->
          <div class="chipsContainer">
            <!-- Type -->
            <ion-chip id="typeChip" :style="{ backgroundColor: dType === 'artwork' ? '#FFDE7B' : dType === 'heritage' ? '#F9B09E' : '#B965ED', color: dType === 'place' ? 'white' : 'black'}">{{ dType === 'artwork' ? "Oeuvre d'art" : dType === 'heritage' ? "Patrimoine" : "Lieux Culturels" }}</ion-chip>
            <!-- Categories -->
            <ion-chip id="categoryChip" :outline="true" v-if="dType === 'artwork' ? details2 : details1">{{ dType === 'artwork' ? details2 : details1 }}</ion-chip>
            <!-- DiscoveryState -->
            <ion-chip id="discoveryStateChip" > {{ isCollected ? "Dans la collection" : isTargeted ? "Sauvegardée" : "À collectionner"}} </ion-chip>
          </div>

          <!-- Title -->
          <p>
            <span class="details title">{{ discovery.getTitle() }}</span>
            <!-- TARGET BUTTON TODO Fix how it positions -->
              <ion-icon id="targetIcon" @click="toggleTargetDiscovery" :icon="customTargetIcon"></ion-icon>
          </p>


          <hr class="separating-bar">

          <p>
            <!-- Artists or usages -->
            <span v-if="dType === 'artwork'" class="details one">{{ details1 }}</span>
            <span v-if="dType === 'artwork'" class="bigDotBetweenArtistsAndDate">  •  </span>
            <!-- Production date -->
            <span class="details production-date">{{ productionDate }}</span>
          </p>
        </div>

        <div class="photoContainer">
          <ion-img
              id="defaultPhoto"
              :src="'./assets/drawable/discoveryDetailsPhotoPlaceholder.svg'"
          ></ion-img>
          <ion-img id="userPhoto"></ion-img>
        </div>

        <!-- TODO What to do about artwork location? -->
        <div v-if="dType !== 'artwork'" class="addressContainer">
          <!-- Discovery pin icon-->
          <ion-icon
              :icon="`./assets/drawable/pins/${discovery.dType}/default.svg`"
          ></ion-icon>
          <span>{{ details2 }}</span>
        </div>

        <!-- FICHE COMPLETE BUTTON -->
        <ion-button
            class="discovery-button"
            id="ficheCompleteButton"
            fill="outline"
            @click="openDiscoveryDetailsPage"
        >
          FICHE COMPLÈTE
        </ion-button>

        <!-- PHOTO BUTTON -->
        <ion-button
            class="discovery-button"
            id="photoButton"
            fill="solid"
            @click="activateCamera"
        >
          <ion-icon id="cameraIcon" :icon="'./assets/drawable/icons/camera_photo_icon.svg'"></ion-icon>
          PHOTOGRAPHIER
        </ion-button>
      </div>





    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  IonImg,
  toastController,
  IonChip,
} from "@ionic/vue";
import {star, starOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import targetIconWhite from "/assets/drawable/icons/target_unactivated.svg";
import targetIconBlack from "/assets/drawable/icons/target_activated.svg";
import customMapIcon from "/assets/drawable/icons/map.svg";

export default {
  name: "discovery-details",

  props: {
    selectedDiscovery: Object,
  },

  components: {
    IonFabButton,
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
      details6;
    if (this.discovery.dType === "artwork") {
      isArtwork = true;

      details1 = this.discovery.getArtists();
      details2 = this.discovery.getCategories();
      details3 = this.discovery.getDirections();
      details4 = this.discovery.getDimensions();
      details5 = this.discovery.getMaterials();
      details6 = this.discovery.getTechniques();

      productionDate = this.discovery.produced_at;
    } else {
      isArtwork = false;

      details1 = this.discovery.getUsages();
      details2 = this.discovery.getAddress();
      details3 = this.discovery.description;
      details4 = "";
      details5 = "";
      details6 = "";

      if (this.discovery.dType === "heritage")
        productionDate = this.discovery.produced_at;
      else productionDate = "";
    }

    return {
      customMapIcon,
      star,
      starOutline,
      customTargetIcon: targetIconWhite, // May be overridden during mount

      isCollected: UserData.isCollected(
        this.discovery.id,
        this.discovery.dType,
      ),

      isTargeted: UserData.isTargeted(this.discovery.id, this.discovery.dType),

      isArtwork,
      productionDate,
      details1,
      details2,
      details3,
      details4,
      details5,
      details6,
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
      this.customTargetIcon = targetIconBlack;
    else this.customTargetIcon = targetIconWhite;
  },

  methods: {

    openDiscoveryDetailsPage() {
      const type =
          this.discovery.dType === "artwork" ? 0
              : this.discovery.dType === "place" ? 1
                  : /* (discovery.dType == "heritage") */ 2;

      this.$router.push(`/discovery-details/${type}/${this.discovery.id}`);
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
        this.customTargetIcon = targetIconWhite;
        this.isTargeted = false;

        toastMessage = "La découverte n'est plus ciblée";
      } else {
        UserData.addTargeted(this.discovery);
        this.customTargetIcon = targetIconBlack;
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

    activateMap() {
      const mapInstructions = {
        path: "/tabs/map/",
        query: {
          type: this.discovery.dType,
          id: this.discovery.id,
        },
      };

      this.$router.push(mapInstructions);
    },

    getComment() {
      const userData = UserData.getCollected(
        this.discovery.id,
        this.discovery.dType,
      );
      return userData.comment;
    },

    getRating() {
      const userData = UserData.getCollected(
        this.discovery.id,
        this.discovery.dType,
      );
      return userData.rating;
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
  font-size: 3.5vw;
  font-weight: 500;
  height: 2vh;
}

#ficheCompleteButton {
  --color: #2E389E;
  --border-color: #757DD7;
  --border-width: 2px;
}

#photoButton {
  position: absolute;
  --background: #4D58CB;
  --color: white;
  font-size: 4vw;
  font-weight: 600;
}

#photoButton ion-icon {
  font-size: 5vw;
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
#targetIcon {
  float:right;
  transform-origin: center;
  position: relative;
  --background: white;
  font-size: 30px;
}

.discoverydetails {
  margin: 5% 5% 1.8vh 5%;
  font-family: "OpenSans", sans-serif;
}

p.details {
  margin-top: 5px;
  margin-bottom: 5px;
}

.details.title {
  font-size: 32px;
  font-weight: 500;
  margin: 1.7vh 0 1.8vh 0;
}

.bigDotBetweenArtistsAndDate {
  font-size: 20px;
  color: #FADA00;
}

/* TODO Make text cut and add ellipsis when it's bigger than 2 lines just before date */
.details.one {
  font-size: 20px;
  font-weight: 300;
  margin: 20px 0 0 0;
}

.details.three,
.four,
.five,
.six {
  font-size: 14px;
  color: gray;
  margin: 5px 0;
  line-height: 20px;
}

.details.production-date {
  font-size: 16px;
  font-weight: 300;
}

.separating-bar {
  border-top: 1px solid #E6E6E6;
}

.user-review p {
  margin: 0;
  font-size: 14px;
}

.addressContainer {
  display: flex;
  align-items: center;
  margin: 0 1.8vh 2vh 1.8vh;
  font-size: 3.7vw;
}

.addressContainer ion-icon {
  font-size: 5vw;
  margin-right: 1.8vw;
}

.addressContainer span {
  text-decoration: underline;
}

.photoContainer {
  position: relative;
  height: 100%;
  width: 92%;
  margin: 0 0 1.8vh 3.9vw;
}

.photoContainer ion-img#defaultPhoto {
  position: relative;
}

.photoContainer ion-img#userPhoto {
  display: none;
  object-fit: cover;
  height: 100%;
  width: 100%;
}

#dRating ion-icon {
  color: var(--mona-yellow);
}

ul {
  margin: 0;
  padding: 0;
}

li {
  display: inline-block;
}
</style>

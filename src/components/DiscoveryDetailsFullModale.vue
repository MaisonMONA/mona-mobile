<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="discoveryPhotoContainer">
        <div class="photoContainer">
          <ion-img
              id="defaultPhoto"
              :src="'./assets/drawable/mona_logo_med.png'"
          ></ion-img>
          <ion-img id="userPhoto"></ion-img>
        </div>

        <!-- PHOTO BUTTON -->
        <ion-button
            class="discovery-button"
            id="photoButton"
            fill="solid"
            @click="activateCamera"
        >
          <ion-icon id="cameraIcon" :icon="cameraOutline"></ion-icon>
        </ion-button>

        <!-- "SEE ON MAP" BUTTON -->
        <ion-button
            class="discovery-button"
            id="seeOnMapButton"
            fill="solid"
            @click="activateMap([discovery.lng, discovery.lat])"
        >
          <ion-icon id="mapIcon" :icon="customMapIcon"></ion-icon>
        </ion-button>

        <!-- TARGET BUTTON -->
        <ion-fab-button id="targetButton" @click="toggleTargetDiscovery">
          <ion-icon id="targetIcon" :icon="customTargetIcon"></ion-icon>
        </ion-fab-button>
      </div>

      <div class="discoveryDetailsContainer">
        <div class="discoverydetails">
          <p class="details title">{{ discovery.getTitle() }}</p>

          <div v-if="isCollected" class="user-review">
            <!-- A rating of 0 means the user didn't rate the discovery (min val is 1) -->
            <ul v-if="this.getRating() > 0" id="dRating">
              <li :key="st" v-for="st in this.getRating()">
                <ion-icon size="large" :icon="star"></ion-icon>
              </li>
              <li :key="nostar" v-for="nostar in 5 - this.getRating()">
                <ion-icon size="large" :icon="starOutline"></ion-icon>
              </li>
            </ul>

            <p v-if="this.getComment()">
              Commentaire : {{ this.getComment() }}
            </p>
          </div>

          <span class="separating-bar"></span>

          <!-- Artists or usages -->
          <p class="details one">{{ details1 }}</p>

          <!-- Categories or borough -->
          <p class="details two">{{ details2 }}</p>

          <!-- Production date -->
          <p class="details production-date">{{ productionDate }}</p>

          <!-- Directions or description -->
          <p class="details three">{{ details3 }}</p>

          <template v-if="isArtwork">
            <p class="details four">{{ details4 }}</p>
            <!-- Artwork dimensions -->
            <p class="details five">{{ details5 }}</p>
            <!-- Artwork materials -->
            <p class="details six">{{ details6 }}</p>
            <!-- Artwork techniques -->
          </template>
        </div>
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
} from "@ionic/vue";
import { cameraOutline, star, starOutline } from "ionicons/icons";
import { useRoute } from "vue-router";

import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import targetIconWhite from "/assets/drawable/icons/target.svg";
import targetIconBlack from "/assets/drawable/icons/target_black.svg";
import customMapIcon from "/assets/drawable/icons/map.svg";

export default {
  name: "discovery-details-full-modale",

  props: {
    selectedDiscovery: Object,
  },

  components: {
    IonFabButton,
    IonPage,
    IonToolbar,
    IonHeader,
    IonContent,
    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonImg,
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
      details2 = [this.discovery.getBorough(), this.discovery.getAddress()]
          .filter((elm) => elm)
          .join(" • ");
      details3 = this.discovery.description;
      details4 = "";
      details5 = "";
      details6 = "";

      if (this.discovery.dType === "heritage")
        productionDate = this.discovery.produced_at;
      else productionDate = "";
    }

    return {
      cameraOutline,
      customMapIcon,
      star,
      starOutline,
      customTargetIcon: targetIconWhite, // May be overridden during mount

      isCollected: UserData.isCollected(
          this.discovery.id,
          this.discovery.dType,
      ),

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
      document.getElementById("seeOnMapButton").style.display = "none";
    }

    // Handling target icon color
    if (UserData.isTargeted(this.discovery.id, this.discovery.dType))
      this.customTargetIcon = targetIconBlack;
    else this.customTargetIcon = targetIconWhite;

    // Change the bar color based on its type
    let barColor;
    if (this.discovery.dType === "artwork") barColor = "#FFDE7C";
    else if (this.discovery.dType === "place") barColor = "#D0B9EB";
    else if (this.discovery.dType === "heritage") barColor = "#FFAB96";
    else barColor = "#C0C4E4"; // Blue powder

    const separatingBar = document.querySelector("span.separating-bar");
    if (separatingBar) separatingBar.style.borderColor = barColor;
  },

  methods: {
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
      const seeOnMapButton = document.getElementById("seeOnMapButton");
      if (photoButton && seeOnMapButton) {
        // Same here
        photoButton.style.display = "none";
        seeOnMapButton.style.display = "none";
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

        toastMessage = "La découverte n'est plus ciblée";
      } else {
        UserData.addTargeted(this.discovery);
        this.customTargetIcon = targetIconBlack;

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
.discoveryPhotoContainer {
  width: 100%;
  height: 50%;
  background: var(--blue-powder);
}

#photoButton,
#seeOnMapButton {
  position: absolute;
  width: 35%;
  top: 35%;
  height: 80px;
  outline-color: white;
  --border-color: white;
  color: white;
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

#photoButton {
  left: 10%;
}

#seeOnMapButton {
  right: 10%;
}

#targetButton {
  transform-origin: center;
  position: absolute;
  right: 5%;
  top: 50%;
}

#targetIcon {
  font-size: 30px;
}

.discoverydetails {
  margin: 5% 5% 30px 5%;
  font-family: "OpenSans", sans-serif;
}

.details.title {
  font-size: 25px;
  font-style: italic;
  font-weight: 600;
}

p.details {
  margin-top: 5px;
  margin-bottom: 5px;
}

.details.one {
  font-size: 20px;
  font-weight: 300;
  margin: 20px 0 0 0;
}

.details.two {
  font-size: 16px;
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
  font-size: 15px;
}

span.separating-bar {
  padding: 0 25vw 0 0;
  border-bottom: 5px solid var(--blue-powder);
}

.user-review p {
  margin: 0;
  font-size: 14px;
}

ion-back-button {
  color: black;
}

.photoContainer {
  position: relative;
  height: 100%;
}

.photoContainer ion-img#defaultPhoto {
  position: relative;
  top: 50px;
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

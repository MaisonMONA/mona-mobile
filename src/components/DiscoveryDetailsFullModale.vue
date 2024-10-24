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
                  ? "Œuvre d'art"
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

          <div id="artistsAndDate">
            <!-- Artists or usages -->
            <span v-if="dType === 'artwork'" class="details one">{{
              details1
            }}</span>
            <span v-if="dType === 'artwork'" id="bigDotBetweenArtistsAndDate">
              •
            </span>
            <!-- Production date -->
            <span class="details production-date">{{ productionDate }}</span>
          </div>
        </div>

        <div class="photoContainer">
          <ion-img
            id="defaultPhotoFullModale"
            :src="'./assets/drawable/discoveryDetailsPhotoPlaceholder.svg'"
          ></ion-img>
          <ion-img id="userPhotoFullModale"></ion-img>
        </div>

        <div class="segments">
          <ion-segment value="details" v-model="activeTab">
            <ion-segment-button value="details">
              <ion-label>DÉTAILS</ion-label>
            </ion-segment-button>
            <ion-segment-button value="aPropos">
              <ion-label>À PROPOS</ion-label>
            </ion-segment-button>
            <ion-segment-button value="commentaire">
              <ion-label>COMMENTAIRE</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div v-if="activeTab === 'details'" class="descriptionTab detailsTab">
            <div>
              <div v-if="details4" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Dimensions</span> <br />
                  {{ details4 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details12" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Mediums</span> <br />
                  {{ details12 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details5" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Matériaux</span> <br />
                  {{ details5 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details6" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Techniques</span> <br />
                  {{ details6 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details11" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Support</span> <br />
                  {{ details11 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details8" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Propriétaire</span> <br />
                  {{ details8 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details14" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Fonction</span> <br />
                  {{ details14 }}
                </p>
                <hr class="separating-bar" />
              </div>
              <div v-if="details10" class="detailsTabElement">
                <p>
                  <span class="detailsSubTitle">Statut</span> <br />
                  {{ details10 }}
                </p>
                <hr class="separating-bar" />
              </div>
            </div>

            <p class="detailsTabBoroughElement">
              {{ details9 }}
            </p>

            <div class="addressContainer">
              <!-- Discovery pin icon-->
              <ion-icon
                :icon="`./assets/drawable/pins/${discovery.dType}/default.svg`"
              ></ion-icon>
              <span>{{ details7 }}</span>
            </div>
          </div>

          <div v-if="activeTab === 'aPropos'" class="descriptionTab aProposTab">
            <p id="aProposText" v-if="details3">{{ details3 }}</p>
            <p v-if="!details3" style="color: grey; font-style: italic;">Pas d’information complémentaire disponible en ce moment.</p>
          </div>

          <div
            v-if="activeTab === 'commentaire'"
            class="descriptionTab commentTab"
          >
            <div v-if="!isCollected">
              <ul class="dRating">
                <ion-label class="commentSubTitle"
                  >Pas de commentaire</ion-label
                >
                <li :key="st" v-for="st in 5">
                  <ion-icon
                    size="small"
                    :icon="`/assets/drawable/icons/greyStar.svg`"
                  ></ion-icon>
                </li>
              </ul>
              <p id="notCommentYetText">
                Collectionnez cette œuvre pour ajouter un commentaire et une note.
              </p>
            </div>

            <div v-if="isCollected" class="user-review">
              <ul class="dRating">
                <ion-label class="commentSubTitle">Commentaire</ion-label>
                <li :key="st" v-for="st in this.getRating()">
                  <ion-icon
                    size="small"
                    :icon="`/assets/drawable/icons/yellowStar.svg`"
                  ></ion-icon>
                </li>
                <li>
                  <ion-icon
                    :key="nostar"
                    v-for="nostar in 5 - this.getRating()"
                    size="small"
                    :icon="`/assets/drawable/icons/greyStar.svg`"
                  ></ion-icon>
                </li>
              </ul>

              <p v-if="this.getComment()">
                {{ this.getComment() }}
              </p>
            </div>
          </div>
        </div>

        <!-- PHOTO BUTTON -->
        <ion-button
          class="discovery-button"
          id="photoButtonFullModale"
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
  IonLabel,
  IonImg,
  toastController,
  IonChip,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";

import { DiscoveryEnum } from "@/internal/Types";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import targetIconUnactivated from "/assets/drawable/icons/target_unactivated.svg";
import targetIconActivated from "/assets/drawable/icons/target_activated.svg";
import customMapIcon from "/assets/drawable/icons/map.svg";

export default {
  name: "discovery-details-full-modale",

  props: {
    selectedDiscovery: Object,
  },

  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonLabel,
    IonButton,
    IonImg,
    IonChip,
    IonSegment,
    IonSegmentButton,
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
      details7,
      details8,
      details9,
      details10,
      details11,
      details12,
      details13,
      details14;
    if (this.discovery.dType === "artwork") {
      isArtwork = true;

      details1 = this.discovery.getArtists();
      details2 = this.discovery.getCategories();
      details3 = this.discovery.getDirections();
      details4 = this.discovery.getDimensions();
      details5 = this.discovery.getMaterials();
      details6 = this.discovery.getTechniques();
      details7 =
        "(" +
        this.discovery.getLocation().lat +
        ", " +
        this.discovery.getLocation().lng +
        ")";
      details8 = this.discovery.getOwner();
      details9 = this.discovery.getBorough();
      details10 = "";
      details11 = this.discovery.getSupports();
      details12 = this.discovery.getMediums();
      details13 = this.discovery.getUrl();
      details14 = "";

      productionDate = this.discovery.produced_at;
    } else {
      isArtwork = false;

      details1 = this.discovery.getUsages();
      details2 = this.discovery.getAddress();
      details3 = this.discovery.description;
      details4 = "";
      details5 = "";
      details6 = "";
      details7 =
        this.discovery.getAddress() ||
        "(" +
          this.discovery.getLocation().lat +
          ", " +
          this.discovery.getLocation().lng +
          ")";
      details8 = "";
      details9 = this.discovery.getBorough();
      details10 = "";
      details11 = "";
      details12 = "";
      details13 = this.discovery.getUrl();
      details14 = "";

      if (this.discovery.dType === "heritage") {
        productionDate = this.discovery.produced_at;
        details10 = this.discovery.getStatus();
        details14 = this.discovery.getFunction();
      } else productionDate = "";
    }

    return {
      activeTab: "details",
      customMapIcon,

      isCollected: UserData.isCollected(
        this.discovery.id,
        this.discovery.dType,
      ),

      isTargeted: UserData.isTargeted(this.discovery.id, this.discovery.dType),

      customTargetIcon: UserData.isTargeted(
        this.discovery.id,
        this.discovery.dType,
      )
        ? targetIconActivated
        : targetIconUnactivated, // May be overridden during mount

      isArtwork,
      productionDate,
      details1,
      details2,
      details3,
      details4,
      details5,
      details6,
      details7,
      details8,
      details9,
      details10,
      details11,
      details12,
      details13,
      details14,
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
          const userImg = document.getElementById("userPhotoFullModale");
          const defaultImg = document.getElementById("defaultPhotoFullModale");

          defaultImg.style.display = "none";
          userImg.style.display = "block";
          userImg.src = url;

          // Enable image opening
          // TODO uncomment line below after implementing showImg
          // userImg.onclick = this.showImg;
        });
      }

      // Hiding buttons
      document.getElementById("photoButtonFullModale").style.display = "none";
    }

    // Handling target icon color
    if (UserData.isTargeted(this.discovery.id, this.discovery.dType))
      this.customTargetIcon = targetIconActivated;
    else this.customTargetIcon = targetIconUnactivated;
  },

  methods: {
    async activateCamera() {
      const img = await Utils.takePicture();
      if (img == null) return; // User cancelled

      // Displaying photo in container
      const userImg = document.getElementById("userPhotoFullModale");
      const defaultImg = document.getElementById("defaultPhotoFullModale");
      defaultImg.style.display = "none";
      userImg.style.display = "block";
      userImg.src = img.webPath || "";

      // Hiding buttons
      const photoButtonFullModale = document.getElementById("photoButtonFullModale");
      if (photoButtonFullModale) {
        // Same here
        photoButtonFullModale.style.display = "none";
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

      this.$emit("close-discovery-details-full-modale");
      this.$router.push(redirection);
    },

    async toggleTargetDiscovery() {
      let toastMessage;

      if (UserData.isTargeted(this.discovery.id, this.discovery.dType)) {
        UserData.removeTargeted(this.discovery);
        this.customTargetIcon = targetIconUnactivated;
        this.isTargeted = false;

        toastMessage = "La découverte n'est plus sauvegardée";
      } else {
        UserData.addTargeted(this.discovery);
        this.customTargetIcon = targetIconActivated;
        this.isTargeted = true;

        toastMessage = "La découverte est maintenant sauvegardée";
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
  padding: 0 1.9vw;
  font-family: "Roboto Light", sans-serif;
  font-size: 2.9vw;
  font-weight: 400;
  min-height: 2.67vh;
}
#categoryChip {
  color: #2e389e;
  border-color: #2e389e;
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

#photoButtonFullModale {
  height: 5.4vh;
  width: 92vw;
  margin-left: 3.9vw;
  bottom: 4vh;
  position: fixed;
  --background: #4d58cb;
  --color: white;
  --border-radius: 8px;
  --padding-start: 2.9vw;
  --padding-end: 2.9vw;
  font-size: 3.8vw;
  font-weight: 600;
  --background-activated: black;
}
#photoButtonFullModale ion-icon {
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

.details {
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
.photoContainer ion-img#defaultPhotoFullModale {
  position: relative;
  height: 17vh;
}
.photoContainer ion-img#userPhotoFullModale {
  display: none;
  object-fit: cover;
  height: 42.6vh;
}

.segments {
  margin: 3.67vh 3.9vw 0 3.9vw;
  padding-bottom: 10vh;
}
.segments ion-segment {
  --background: white;
  border: none;
  border-bottom: 1px solid #757dd7;
  border-radius: 0;
}
.segments ion-segment ion-segment-button {
  font-size: 3.38vw;
  font-weight: 500;
  --color-checked: #2e389e;
  --indicator-box-shadow: none;
  --border-radius: 0;
}
.segments ion-segment-button::part(indicator-background) {
  border-bottom: 0.44vh solid #757dd7;
}
.segments ion-segment-button::part(native) {
  padding: 0;
}

.descriptionTab {
  font-size: 3.86vw;
  font-weight: 400;
}

.aProposTab,
.commentTab {
  margin: 3.5vh 0;
}
.detailsTab {
  margin: 1.8vh 0;
}
.detailsTabElement p {
  margin: 1.78vh 0;
  line-height: 2.67vh;
}
.detailsTabBoroughElement {
  margin: 1.78vh 0;
  font-size: 3.8vw;
  line-height: 2.67vh;
}

#aProposText {
  overflow-y: scroll;
  line-height: 22px;
  height: 38.4vh;
}

.detailsSubTitle {
  font-size: 3.8vw;
  font-weight: 700;
}
.commentSubTitle {
  margin: 0 2.9vw 0 0;
  font-size: 4.3vw;
  font-weight: 600;
}

#notCommentYetText,
.user-review p {
  font-style: italic;
}

.addressContainer {
  display: flex;
  align-items: center;
  margin: 0 0 2.7vh 0;
  font-size: 3.4vw;
}
.addressContainer ion-icon {
  font-size: 6vw;
  margin-right: 1.8vw;
}
.addressContainer span {
  text-decoration: underline;
}

.commentTab ul {
  margin: 0;
  padding: 0;
}
.commentTab li {
  display: inline-block;
}

.commentTab li ion-icon {
  position: relative;
  top: 0.3vw;
  height: 4vw;
  width: 4vw;
  margin: 0 0.61vw 0 0;
}
</style>

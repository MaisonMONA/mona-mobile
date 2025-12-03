<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="collection-content">
        <!-- Empty collection state -->
        <div v-if="collected.length === 0" class="empty-collection">
          <img src="/assets/drawable/mascots/mascot_13.png" alt="Mascotte" class="empty-mascot" />
          <p class="empty-text">Explorez la carte et photographiez votre première découverte pour l'ajouter à votre collection!</p>
          <ion-button class="explore-button" @click="goToMap">
            <ion-icon src="/assets/drawable/icons/white_map_tab_icon_filled.svg" slot="start"></ion-icon>
            EXPLOREZ LA CARTE
          </ion-button>
        </div>
        
        <ion-grid v-else class="square-grid">
          <ion-row class="square-row">
            <ion-col
              v-for="item in collected"
              :key="item"
              size="4"
              class="square-item"
              @click="openDetails(item)"
            >
              <div class="square-container">
                <img
                  :id="`user-photo-${item.id}-${item.dType}`"
                  :src="getPhotoThumbnail(item.id, item.dType)"
                  class="square-img"
                />
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Selected discovery full details modal -->
      <ion-modal
        id="discoveryDetailsFullModal"
        :is-open="discoveryDetailsFullModalOpen"
        @didDismiss="discoveryDetailsFullModalOpen = false"
        :breakpoints="[0, 1]"
        :initial-breakpoint="1"
        :show-backdrop="true"
      >
          <discovery-details-full-modale
            :selected-discovery="listSelectedDiscovery"
          />
      </ion-modal>
      <!-- Selected discovery full details modal -->

    </ion-content>
  </ion-page>
</template>

<script>
import { UserData } from "@/internal/databases/UserData";
import {
  IonPage,
  IonContent, //IonNavLink,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonModal,
  IonButton,
} from "@ionic/vue";
import Utils from "@/internal/Utils";
import customCollectionIcon from "/assets/drawable/icons/collection_white.svg";
import { Directory, Filesystem } from "@capacitor/filesystem";
import BadgesContainer from "@/components/BadgesContainer.vue";
import DiscoveryDetailsFullModale from "@/components/DiscoveryDetailsFullModale.vue";
import {useCollection} from "@/stores/Collection.ts";

const useCollectionStore = useCollection();
export default {
  name: "CollectionContainer",
  components: {
    DiscoveryDetailsFullModale,
    IonModal,
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  },

  setup() {
    return {
      BadgesContainer,
      useCollectionStore,
    };
  },

  data() {
    return {
      listSelectedDiscovery: null,
      discoveryDetailsFullModalOpen: false,
      getDiscovery: Utils.getDiscovery,
      customCollectionIcon,
    };
  },

  computed: {
    collected() {
      return useCollectionStore.collected;
    },
  },

  methods: {
    goToMap() {
      this.$router.push('/tabs/map');
    },

    openDetails(item) {
      this.listSelectedDiscovery = item;
      this.discoveryDetailsFullModalOpen = true;
    },

    formatTitle(discovery) {
      const title = discovery.getTitle();
      if (title.length > 40) return title.slice(0, 37) + "...";

      return title;
    },

    getPhotoThumbnail(id, dType) {
      const { filename } = UserData.getCollected(id, dType);
      if (filename == null) {
        // Use default thumbnail
        return require("./assets/drawable/photo_placeholder.jpg");
      } else {
        Filesystem.readFile({
          path: "thumbnail/" + filename,
          directory: Directory.Data,
        })
          .then(async (image) => {
            const base64Res = await fetch(
              `data:image/${filename.split(".").at(-1)};base64,${image.data}`,
            );
            const blob = await base64Res.blob();

            const url = URL.createObjectURL(blob);
            document.getElementById(`user-photo-${id}-${dType}`).src = url;
          })
          .catch((err) => {
            console.log(err);
            document.getElementById(
              `user-photo-${id}-${dType}`,
            ).src = require("./assets/drawable/photo_placeholder.jpg");
          });
      }
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

/* Empty collection state */
.empty-collection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6vh 8vw 5vh 8vw;
  text-align: center;
}

.empty-mascot {
  width: 40vw;
  height: auto;
  margin-bottom: 5vh;
  margin-right: 9vw;
}

.empty-text {
  font-size: 4.2vw;
  line-height: 1.4;
  color: #333;
  margin-bottom: 3vh;
  padding: 0 0vw;
}

.explore-button {
  --background: #4D58CB;
  --color: white;
  --border-radius: 10px;
  --padding-start: 8vw;
  --padding-end: 8vw;
  height: 6.5vh;
  width: 78vw;
  font-size: 4vw;
  font-weight: 600;
  text-transform: uppercase;
}

.explore-button ion-icon {
  font-size: 5.5vw;
  margin-right: 2.5vw;
}

.noneCollected {
  font-size: 5vw;
  margin: 5vw;
  margin-top: 15vw;
}

img {
  object-fit: cover;
  height: 45vw;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  width: 100%;
}

.collection-header {
  height: 7vh;
  background: #FDF4B4;
  text-align: center;
}

.collection-header * {
  position: relative;
  top: 50%;
  transform: translateY(-75%);
  display: inline-block;
  color: black;
  margin-top: 5%;
  vertical-align: middle;
  margin-left: 2vw;
  margin-right: 2vw;
}

.collection-header p {
  text-align: left;
  font-size: 24px;
}

.collection-header p#collected-count {
  font-size: 52px;
  font-weight: 600;
}

.collection-header ion-icon {
  /*font-size: 80px;*/
  --ionicon-stroke-width: 20px;
}

.collection-item {
  margin-right: 3.6vw;
  margin-bottom: 2.1vh;
}

.padded-row {
  padding-left: 4vw;
}

ion-grid {
  --ion-grid-column-padding: 0;
}

ion-col {
  border: 1px solid var(--button-outline-grey);
  border-radius: 15px;
  text-align: center;
  margin-right: 3vw;
}

p {
  font-family: 'Open Sans', sans-serif;
}

.title-holder {
  min-height: 32px;
}

.title-holder p {
  top: 50%;
  font-size: 16px;
  padding-bottom: 5px;
}

#your-collection {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  margin: 0 0 10px 15px;
}

#collection-icon {
  font-size: 60px;
}

/* Square grid layout */
.square-grid {
  --ion-grid-padding: 0;
  --ion-grid-column-padding: 2px;
  padding: 0 3.8vw; /* Align with collection toggle border */
}

.square-row {
  margin: 0;
}

.square-item {
  padding: 2px;
  margin: 0;
  border: none;
  border-radius: 0;
}

.square-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Creates 1:1 aspect ratio */
  overflow: hidden;
}

.square-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

</style>

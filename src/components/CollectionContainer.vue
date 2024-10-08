<template>
  <ion-page>
    <ion-content :fullscreen="true">

      <div class="collection-header">
        <ion-icon id="collection-icon" :icon="customCollectionIcon"></ion-icon>
        <p id="collected-count">
          {{ collected.length > 0 ? collected.length : "" }}
        </p>
        <p>
          {{ collected.length > 0 ? "D" : "Aucune d" }}écouverte{{
            collected.length > 0 ? "s" : ""
          }}
          <br />
          collectionnée{{ collected.length > 0 ? "s" : "" }}
        </p>
      </div>
      <div class="collection-content">
        <p id="your-collection">Votre collection</p>
        <ion-grid>
          <ion-row class="ion-justify-content-around">
            <ion-col
              v-for="item in collected"
              :key="item"
              size="5.5"
              @click="openDetails(item)"
            >
              <div class="img-card">
                <img
                  :id="`user-photo-${item.id}-${item.dType}`"
                  :src="getPhotoThumbnail(item.id, item.dType)"
                />
                <div class="title-holder">
                  <p>{{ formatTitle(getDiscovery(item.id, item.dType)) }}</p>
                </div>
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
        :breakpoints="[0.5, 0.976]"
        :initial-breakpoint="0.976"
        :show-backdrop="true"
      >
        <ion-content>
          <discovery-details-full-modale
            :selected-discovery="listSelectedDiscovery"
          />
        </ion-content>
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

img {
  object-fit: cover;
  height: 45vw;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  width: 100%;
}

.collection-header {
  height: 25%;
  background: var(--blue-powder);
  text-align: center;
}

.collection-header * {
  position: relative;
  top: 50%;
  transform: translateY(-75%);
  display: inline-block;
  color: white;
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

ion-grid {
  --ion-grid-column-padding: 0;
}

ion-col {
  border: 1px solid var(--button-outline-grey);
  border-radius: 15px;
  text-align: center;
  margin-bottom: 16px;
}

p {
  font-family: "Open Sans", sans-serif;
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
  margin: 5vw 0 10px 15px;
  padding-top: 25px;
}

#collection-icon {
  font-size: 60px;
}

</style>

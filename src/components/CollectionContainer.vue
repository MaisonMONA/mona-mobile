<template>
      <ion-refresher slot="fixed" @ion-refresh="refreshPage">
          <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-button @click="refreshPage" id="refresh-button">
          <ion-icon :icon="syncCircleIcon"></ion-icon>
      </ion-button>

      <div class="collection-content" >
          <ion-grid >
              <ion-row class="ion-justify-content-around">
                  <ion-col v-for="item in collected" :key="item" size="5.5" @click="openDetails(item)">
                      <div class="img-card">
                          <img :id="`user-photo-${item.id}-${item.dType}`" :src="getPhotoThumbnail(item.id, item.dType)"/>
                          <div class="title-holder">
                              <p>{{ formatTitle(getDiscovery(item.id, item.dType)) }}</p>
                          </div>
                      </div>
                  </ion-col>
              </ion-row>
          </ion-grid>
      </div>

</template>

<script>
import { reload } from "ionicons/icons";
import { UserData } from '@/internal/databases/UserData';
import {
         IonGrid, IonRow, IonCol, IonIcon, IonButton, IonRefresher, IonRefresherContent } from '@ionic/vue';
import Utils from "@/internal/Utils";
import customCollectionIcon from "@/assets/drawable/icons/collection_white.svg"
import { Directory, Filesystem } from "@capacitor/filesystem";
import BadgesContainer from "@/components/BadgesContainer.vue";

export default {
    name: "CollectionContainer",
    components: {
         IonGrid, IonRow, IonCol, IonIcon, IonButton,
        IonRefresher, IonRefresherContent,
    },

    setup() {
        return {
            BadgesContainer
        }
    },

    data() {
        return {
            collected: UserData.getCollectedChronologically(),
            getDiscovery: Utils.getDiscovery,
            customCollectionIcon,
            syncCircleIcon: reload,
        }
    },

    methods: {
        openDetails(item) {
            let type;
            if (item.dType === "artwork") type = 0;
            else if (item.dType === "place") type = 1;
            else /* (discovery.dType == "heritage") */ type = 2;

            this.$router.push(`/discovery-details/${type}/${item.id}`);
        },

        formatTitle(discovery) {
            const title = discovery.getTitle();
            if (title.length > 40)
                return title.slice(0, 37) + '...'

            return title;
        },

        getPhotoThumbnail(id, dType) {
            const { filename } = UserData.getCollected(id, dType);
            if (filename == null) {
                // Use default thumbnail
                return require("@/assets/drawable/photo_placeholder.jpg");
            } else {
                Filesystem.readFile({
                    path: "thumbnail/" + filename,
                    directory: Directory.Data
                })
                .then(async (image) => {
                    const base64Res = await fetch(`data:image/${ filename.split('.').at(-1) };base64,${ image.data }`);
                    const blob = await base64Res.blob();

                    const url = URL.createObjectURL(blob);
                    document.getElementById(`user-photo-${id}-${dType}`).src = url;
                })
                .catch((err) => {
                    console.log(err)
                    document.getElementById(`user-photo-${id}-${dType}`).src = require("@/assets/drawable/photo_placeholder.jpg")
                })
            }
        },

        refreshPage(event) {
            this.collected = UserData.getCollectedChronologically();
            this.$forceUpdate();

            if (event && event.target && event.target.complete)  // Signal
                event.target.complete();
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

img {
    object-fit: cover;
    height: 45vw;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
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
    margin: 5vw 0 10px 15px;
    padding-top: 25px;
}

#collection-icon {
    font-size: 60px;
}

#refresh-button {
    position: fixed;
    z-index: 2;
    right: 10px;
    color: #7F7F7F;
    bottom: 10px;
    --background: var(--toolbar-purple);
    --background-activated: lightgrey;
    width: 14vw;
    height: 14vw;
    font-size: 12px;
    font-weight: normal;
    --border-radius: 15px;
}

#refresh-button ion-icon {
    font-size: 32px;
    color: grey;
}

#show-badges-button {
    position: absolute;
    transform: translateX(-50%);
    left: 50%;
    top: 25%;
    --background: var(--toolbar-purple);
    --color: grey;
    text-transform: none;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    --padding-end: 25px;
    --padding-start: 25px;
}

img {
    width: 100%;
}
</style>

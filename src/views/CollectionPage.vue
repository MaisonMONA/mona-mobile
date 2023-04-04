<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-button @click="refreshPage()" id="refresh-button">
                <ion-icon :icon="syncCircleIcon"></ion-icon>
            </ion-button>

            <div class="collection-header">
                <ion-icon id="collection-icon" :icon="customCollectionIcon"></ion-icon>
                <p id="collected-count">{{ collected.length ? collected.length : '' }}</p>
                <p>
                    {{ collected.length ? '' : "Aucune" }} Découverte{{ collected.length ? 's' : ''}}<br>collectionnée{{ collected.length ? 's' : ''}}
                </p>
                <ion-icon id="headerIcon" :icon="bookOutline"></ion-icon>
            </div>
            <div class="collection-content">
                <p id="your-collection">Votre collection</p>
                <ion-grid>
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
        </ion-content>
    </ion-page>
</template>

<script>
import { bookOutline, syncCircleOutline } from "ionicons/icons";
import { UserData } from '@/internal/databases/UserData';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonButton } from '@ionic/vue';
import Utils from "@/internal/Utils";
import customCollectionIcon from "@/assets/drawable/icons/collection_white.svg"
import { Directory, Filesystem } from "@capacitor/filesystem";

export default {
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonButton
    },

    setup() {
        return {
            bookOutline
        }
    },

    data() {
        return {
            collected: UserData.getCollectedChronologically(),
            getDiscovery: Utils.getDiscovery,
            customCollectionIcon,
            syncCircleIcon: syncCircleOutline
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
            const { imagepath } = UserData.getCollected(id, dType);
            if (imagepath == null) {
                // Use default thumbnail
                return require("@/assets/drawable/photo_placeholder.jpg");
            } else {
                // Load the thumbnail
                // const thumbnail_path = "thumbnails/" + imagepath.split('/').at(-1);

                Filesystem.readFile({
                    path: imagepath,
                    directory: Directory.Data
                })
                .then(async (image) => {
                    const base64Res = await fetch(`data:image/${imagepath.split('.')[1]};base64,${image.data}`);
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

        refreshPage() {
            this.collected = UserData.getCollectedChronologically();
            this.$forceUpdate();
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
    /*font-weight: 600;*/
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
}

#collection-icon {
    font-size: 60px;
}

#refresh-button {
    position: fixed;
    z-index: 2;
    right: 10px;
    bottom: 10px;
    --background: var(--toolbar-purple);
    --background-activated: lightgrey;
    color: grey;
    width: 50px;
    height: 50px;
    font-size: 8px;
    --border-radius: 15px;
}
</style>

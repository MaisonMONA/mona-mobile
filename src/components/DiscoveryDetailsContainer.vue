<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="discoveryPhotoContainer">
                <ion-fab-button id="targetButton">
                    <ion-icon id="targetIcon" :icon="star"></ion-icon>
                </ion-fab-button>
            </div>

            <div class="discoveryDetailsContainer">
                <div class="discoveryDetailsContent">
                    <!-- IF THE DISCOVERY IS AN ARTWORK -->
                    <div v-if="discovery instanceof Artwork" id="dDetails">
                        <p id="dTitle">{{ discovery.title.fr || discovery.title.en || '(sans titre)' }}</p>
                        <p id="dArtist">{{ discovery.artists.join(', ') }}</p>
                        <p id="dCategory" v-if="discovery.categories">{{ discovery.categories.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE IF IT'S A PLACE -->
                    <div v-else-if="discovery instanceof Place" id="dDetails">
                        <p id="dTitle">{{ discovery.title }}</p>
                        <p id="dBorough">{{ discovery.borough }}</p>
                        <p id="dUsages">{{ discovery.usages.fr.join(', ') }}</p>
                    </div>

                    <!-- ELSE (IT'S A HERITAGE) -->
                    <div v-else id="dDetails">
                        <p id="dTitle">{{ discovery.title }}</p>
                        <p id="dBorough">{{ discovery.borough }}</p>
                        <p id="dUsages">{{ discovery.functions.fr.join(', ') }}</p>
                    </div>
                </div>
            </div>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import { IonPage, IonHeader, IonContent, IonToolbar, IonTitle, IonFabButton, IonIcon } from '@ionic/vue';
import { star } from "ionicons/icons";
import { useRoute } from "vue-router";

import { Artwork, Place, Heritage, DiscoveryEnum } from "@/internal/Types";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";

export default {
    name: "discovery-details",

    components: {
        IonFabButton, IonPage, IonToolbar, IonHeader, IonTitle, IonContent, IonIcon
    },

    data() {
        return {
            star
        }
    },

    setup() {
        const route = useRoute();
        let { type, id } = route.params;
        type = type.toString();
        id = id.toString();

        let discovery: any;

        switch (parseInt(type)) {
            case DiscoveryEnum.ARTWORK: {
                discovery = ArtworkDatabase.getFromId(parseInt(id))
                break;
            }
            case DiscoveryEnum.HERITAGE: {
                discovery = HeritageDatabase.getFromId(parseInt(id))
                break;
            }
            case DiscoveryEnum.PLACE: {
                discovery = PlaceDatabase.getFromId(parseInt(id))
                break;
            }
        }

        return {
            dId: id, dType: type,
            Artwork, Heritage, Place,
            discovery
        }
    }
}
</script>

<style scoped>
.discoveryPhotoContainer {
    width: 100%;
    height: 40%;
    background-image: url("@/assets/drawable/mona_logo_med.png");
}

#targetButton {
    transform-origin: center;
    position: absolute;
    right: 5%;
    top: 40%;
}

.discoveryDetailsContent {
    margin: 10% 5% 5%;
    font-family: 'OpenSans', sans-serif;
}

#dTitle {
    font-size: 1em;
    font-style: italic;
    font-weight: bold;
}

#dArtist {
    font-size: 1em;
}
</style>
<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="main-content">
                <p id="tab-title">Liste des découvertes à faire</p>
                <ion-searchbar show-clear-button="always" placeholder="Chercher" :debounce="500" @ionChange="triggerTextFilter"></ion-searchbar>
                <ion-button id="open-modal" class="filters-button" shape="round" fill="outline">
                    <ion-icon :icon="filterOutline"></ion-icon>
                    Filtrer
                </ion-button>
                <ion-list :inset="true" lines="none" :key="componentKey">
                    <ion-item id="list" v-for="discovery of getDiscoveries()" :key="discovery" @click="openDetails(discovery)">
                        <ion-avatar slot="start">
                            <img :src="getDiscoveryMedalIcon(discovery)" alt="">
                        </ion-avatar>
                        <ion-label id="distance" position="fixed" >{{Distance.distance2string(Distance.calculateDistance(discovery, lat2, lng2))}}</ion-label>
                        <ion-label id="title">{{ discovery.getTitle() }}</ion-label>
                    </ion-item>
                </ion-list>
                <ion-infinite-scroll @ionInfinite="pullDiscoveries" :key="componentKey">
                    <ion-infinite-scroll-content></ion-infinite-scroll-content>
                </ion-infinite-scroll>
                <p class="bottom-text">{{ getDiscoveries().length }} résultats</p>
            </div>

            <ion-modal ref="modal" trigger="open-modal" :initial-breakpoint="0.50" :breakpoints="[0, 0.25, 0.50]">
                    <ion-content>
                        <ion-toolbar id="modal-header">
                                <ion-icon class="modal-icon" size="medium" slot="start" :src="optionsOutline"></ion-icon>
                                <ion-text id="modal-heading"> <p>Filtres</p></ion-text>
                                <ion-icon class="modal-icon" size="medium" slot="end" :src="close" @click="dismiss()"></ion-icon>
                        </ion-toolbar>
                        <ion-list lines="none">
                            <ion-item>
                                <ion-text color="black">Trier par</ion-text>
                            </ion-item>
                            <ion-row>
                                <ion-radio-group id="modal-trier" value="custom-checked">
                                    <ion-col size="4">
                                        <ion-text>Distance</ion-text>
                                    </ion-col >
                                    <ion-col size="4">
                                        <ion-radio @click="this.isDiscoveriesAZ(false)" value="custom-checked"></ion-radio>
                                    </ion-col>
                                    <ion-col size="4">
                                        <ion-text>A-Z</ion-text>
                                    </ion-col>
                                    <ion-col size="4">
                                        <ion-radio @click="this.isDiscoveriesAZ(true)" value="custom"></ion-radio>
                                    </ion-col>
                                </ion-radio-group>
                            </ion-row>
                            <ion-item>
                                <ion-text color="black">Filtrer par</ion-text>
                            </ion-item>
                            <ion-row class="ion-justify-content-between">
                                <ion-col class="place" size="3" >
                                    <div class="filter-category">
                                        <ion-avatar>
                                            <img :src="require('@/assets/drawable/medals/artwork/default.svg')">
                                        </ion-avatar>
                                        <ion-text>Œuvres</ion-text>
                                    </div>
                                </ion-col>
                                <ion-col class="place" size="4">
                                    <div class="filter-category">
                                        <ion-avatar>
                                            <img :src="require('@/assets/drawable/medals/place/default.svg')">
                                        </ion-avatar>
                                        <ion-text>Patrimoines</ion-text>
                                    </div>
                                </ion-col>
                                <ion-col class="place" size="3">
                                    <div class="filter-category">
                                        <ion-avatar>
                                            <img :src="require('@/assets/drawable/medals/heritage/default.svg')">
                                        </ion-avatar>
                                        <ion-text>Lieux</ion-text>
                                    </div>
                                </ion-col>
                            </ion-row>
                        </ion-list>
                    </ion-content>
            </ion-modal>
            <ion-refresher slot="fixed" @ion-refresh="refreshPage">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-button @click="refreshPage" id="refresh-button">
                <ion-icon :icon="syncCircleIcon"></ion-icon>
            </ion-button>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
    IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton, IonRefresherContent, IonRefresher, IonModal,  IonRadio, IonRadioGroup,
} from "@ionic/vue";
import { filterOutline, close, optionsOutline, reload} from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";
import {Distance} from "../internal/Distance";

export default {
    name: "ListPage",
    computed: {
        Distance() {
            return Distance
        }
    },
    components: {
        IonRefresher, IonRefresherContent,
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
         IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonIcon, IonButton, IonModal,  IonRadio, IonRadioGroup,

    },
    setup(){
        return {
            close, optionsOutline
        }
    },

    data() {
        return {
            filterOutline,  // Icon
            discoveriesAZ: [],
            offset: 0,
            currentFilter: '',
            discoveriesSortByDistance: [],
            lat2 : UserData.getLocation()[1],
            lng2 : UserData.getLocation()[0],
            syncCircleIcon: reload,
            componentKey: 0,
            decouverteDistance: true,
            decouverteAZ: false,
            decouverteArtwork: false,
            decouverteHeritage: false,
            decouvertePlace: false,

        }
    },

    beforeMount() {
        this.pullDiscoveriesAZ(null);
        this.offset = 0;
        this.pullDiscoveriesSortByDistance(null)

    },

    methods: {
        pullDiscoveries(event) {
            if (this.decouverteDistance)
                this.pullDiscoveriesSortByDistance(event)
            else if (this.decouverteAZ)
                this.pullDiscoveriesAZ(event)
        },
        isDiscoveriesAZ(trierAZ){
            if (trierAZ){
                this.decouverteAZ = true
                this.decouverteDistance = false
            }
            else {
                this.decouverteAZ = false
                this.decouverteDistance = true
            }
            this.forceRerender()
        },

        getDiscoveries(){
            if (this.decouverteDistance)
                return this.discoveriesSortByDistance
            else if (this.decouverteAZ)
                return this.discoveriesAZ
        },
        pullDiscoveriesAZ(event) {
            const subset = UserData.getSortedDiscoveries().filter((elm) => {
                return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
            }).slice(this.offset, this.offset + 50);

            this.discoveriesAZ = this.discoveriesAZ.concat(subset)

            if (event)  // Send a signal when the user reaches the bottom
                event.target.complete();

            this.offset += 50;
        },
        pullDiscoveriesSortByDistance(event) {
            const subset = UserData.getSortedDiscoveriesDistance().filter((elm) => {
                return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
            }).slice(this.offset, this.offset + 50);

            this.discoveriesSortByDistance = this.discoveriesSortByDistance.concat(subset)

            if (event)  // Send a signal when the user reaches the bottom
                event.target.complete();

            this.offset += 50;
        },

        openDetails(discovery) {
            let type;
            if (discovery.dType === "artwork")         type = 0;
            else if (discovery.dType === "place")      type = 1;
            else /* (discovery.dType == "heritage") */ type = 2;

            this.$router.push(`/discovery-details/${type}/${discovery.id}`);
        },

        triggerTextFilter(event) {
            if (event.detail && event.detail.value === this.currentFilter) return;

            this.currentFilter = event.detail.value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
            this.offset = 0;

            if (this.decouverteAZ){
                this.discoveriesAZ = [];
                this.pullDiscoveriesAZ(null);
            }
            else {
                this.discoveriesSortByDistance = [];
                this.pullDiscoveriesSortByDistance(null);
            }

        },

        getDiscoveryMedalIcon(discovery) {
            if (UserData.isCollected(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/collected.svg`);

            else if (UserData.isTargeted(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/targeted.svg`);

            else
                return require(`@/assets/drawable/medals/${ discovery.dType }/default.svg`);
        },

        dismiss() {
            this.$refs.modal.$el.dismiss();
        },
        forceRerender() {
            this.componentKey += 1;
        },
        refreshPage(event) {

            this.lat2 = UserData.getLocation()[1];
            this.lng2 = UserData.getLocation()[0];
            this.offset = 0;

            if(this.decouverteDistance) {
                this.discoveriesSortByDistance = [];
                UserData.sortByDistance();
                this.pullDiscoveriesSortByDistance(null);
            }

            this.forceRerender();

            if (event && event.target && event.target.complete)  // Signal
                event.target.complete();
        },
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.ion-content {
    background: #F3F2F7;
}

#tab-title {
    margin-top: 0;
    padding-top: 24px;
    margin-left: 21px;
    font-family: 'Gotham Rounded Light', sans-serif;
    font-size: 5.5vw;
}

div.main-content {
    min-height: 100%;
    background: #F3F2F7;
}

ion-list {
    background: #F3F2F7;
}

#list {
    border: 5px solid #F3F2F7;
    border-radius: 15px;
    --min-height: 15vw;
}


ion-label {
    padding-left: 15px;
}

ion-avatar img {
    margin-top: 5px;
    max-width: 8vw;
    max-height: 8vw;
}

ion-avatar {
    margin-right: 0;
}
ion-row{
    margin: 5%;
}
ion-searchbar {
    padding-left: 21px;
    padding-right: 21px;
    --border-radius: 10px;
}

p.bottom-text {
    font-size: 32px;
    text-align: center;
    font-family: 'Gotham Rounded Light', sans-serif;
}

.filters-button {
    text-transform: none;
    color: black;
    position: relative;
    left: 49%;
    transform: translateX(-50%);
    --border-width: 0;
    --background: transparent;
}

.filters-button ion-icon {
    margin-right: 6px;
    font-size: 20px;
}

#title {
    font-weight: bold;
}
#distance {
    font-size: small;

}
ion-col img {
    width: 5vw;
    height: 5vw;
    margin: auto;
}

.place{
    border: 1px solid black;
    border-radius: 10px;
    height: 15vw;
    width: auto;
}

.filter-category ion-avatar {
    margin: auto;
    height: 5vw;
}

.filter-category {
    text-align: center;
    margin: 0;
    padding: 0;
    width: auto;
}

ion-radio {
    --border-radius: 100%;
    --inner-border-radius: 100%;

    --color: black;
    --color-checked: black;
}


#modal-header {
    font-weight: bold;
    font-family: 'Gotham Roundedight', sans-serif;
}
ion-modal ion-toolbar {
    --background: grey;
    --color: black;
}
ion-modal {
    --border-radius: 16px;
    --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

#modal-heading p {
    text-align: center;
    font-size: large;
}

.modal-icon {
    margin: 2%;
    padding: 2%;
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
    font-size: 10px;
    --border-radius: 15px;
}
#refresh-button ion-icon {
    font-size: 32px;
    color: grey;
}

/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>

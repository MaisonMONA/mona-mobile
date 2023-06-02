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
                <ion-button class="filters-button" shape="round" fill="outline" @click="showFiltersPanel">
                    <ion-icon :icon="filterOutline"></ion-icon>
                    Filtrer
                </ion-button>
                <ion-list :inset="true" lines="none">
                    <ion-item id="list" v-for="discovery of discoveries" :key="discovery" @click="openDetails(discovery)">
                        <ion-avatar slot="start">
                            <img :src="getDiscoveryMedalIcon(discovery)" alt="">
                        </ion-avatar>
                        <ion-label id="distance" position="fixed">{{showDistance(discovery)}} km</ion-label>
                        <ion-label id="title">{{ discovery.getTitle() }}</ion-label>
                    </ion-item>
                </ion-list>
                <ion-infinite-scroll @ionInfinite="pullDiscoveries">
                    <ion-infinite-scroll-content></ion-infinite-scroll-content>
                </ion-infinite-scroll>
                <p class="bottom-text">{{ discoveries.length }} résultats</p>
            </div>

            <div class="filters-panel">
                <div id="panel-heading">
                    <div class="panel-header">
                        <p>Filtres</p>
                    </div>
                    <ion-button fill="clear" color="dark" @click="closeFilter()">
                        <ion-icon id="icon-header" :src="close" color="black" ></ion-icon>
                    </ion-button>
                </div>
                <div class="panel-content">
                    <ion-grid>
                        <ion-row class="directive">Trier par</ion-row>
                        <ion-row id="trier-par">
                            <ion-col size="4">Distance
                                <ion-button class="trier" fill="clear" @click="trierDistance()">
                                    <ion-icon :src="radioButtonOffOutline"></ion-icon>
                                </ion-button>
                            </ion-col>
                            <ion-col size="4">A-Z
                                <ion-button class="trier" fill="clear" @click="trierAlphabetique">
                                    <ion-icon :src="radioButtonOnOutline" color="dark"></ion-icon>
                                </ion-button>
                            </ion-col>
                        </ion-row>
                        <ion-row class="directive">Filter par</ion-row>
                        <ion-row class="ion-justify-content-around">
                            <ion-col class="place" size="3">
                                <div class="filter-category">

                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/artwork/default.svg')">
                                    </ion-avatar>
                                    <p>Œuvres</p>
                                </div>
                            </ion-col>
                            <ion-col class="place" size="3">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/place/default.svg')">
                                    </ion-avatar>
                                    <p>Patrimoines</p>
                                </div>
                            </ion-col>
                            <ion-col class="place" size="3">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/heritage/default.svg')">
                                    </ion-avatar>
                                    <p>Lieux</p>
                                </div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
         IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton, IonGrid,
         IonRow, IonCol } from "@ionic/vue";
import { filterOutline, close, radioButtonOffOutline, radioButtonOnOutline} from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "ListPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
        IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton, IonGrid, IonRow, IonCol
    },
    setup(){
        return {
            close, radioButtonOffOutline, radioButtonOnOutline
        }
    },

    data() {
        return {
            filterOutline,  // Icon
            discoveries: [],
            offset: 0,
            currentFilter: ''
        }
    },

    beforeMount() {
        this.pullDiscoveries(null);
    },

    methods: {
        pullDiscoveries(event) {
            const subset = UserData.getSortedDiscoveries().filter((elm) => {
                return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
            }).slice(this.offset, this.offset + 50);

            this.discoveries = this.discoveries.concat(subset)

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
            this.discoveries = [];
            this.pullDiscoveries(null);
        },

        showFiltersPanel() {
            // TODO: finish panel and uncomment these lines
            const panel = document.querySelector("div.filters-panel");
            panel.hidden = false;
            if (panel) panel.classList.add("shown");
        },

        getDiscoveryMedalIcon(discovery) {
            if (UserData.isCollected(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/collected.svg`);

            else if (UserData.isTargeted(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/targeted.svg`);

            else
                return require(`@/assets/drawable/medals/${ discovery.dType }/default.svg`);
        },
        //Haversine Formula
        //inspire du code python https://community.esri.com/t5/coordinate-reference-systems-blog/distance-on-a-sphere-the-haversine-formula/ba-p/902128#:~:text=For%20example%2C%20haversine(%CE%B8),longitude%20of%20the%20two%20points.
        showDistance(discovery){ //lng , lt
            const lat1 = discovery.location.lat
            const lat2 = UserData.getLocation()[1]
            const lng1 = discovery.location.lng
            const lng2 = UserData.getLocation()[0]
            const R = 6371000 //radius of Earth in m
            const phi1 = this.degrees2radians(lat1)
            const phi2 = this.degrees2radians(lat2)
            const delta_phi = this.degrees2radians(lat2 - lat1)
            const delta_lambda = this.degrees2radians(lng2 - lng1)
            const a = Math.sin(delta_phi/2.0)** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda/2.0)**2
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt((1-a)))
            const meters = R * c
            const km = meters / 1000.0
            return this.roundDown(km)
        },
        //source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-33.php
        degrees2radians(degrees){
            const pi = Math.PI;
            return degrees * (pi/180);
        },
        //inspire de https://stackoverflow.com/questions/33429136/round-to-3-decimal-points-in-javascript-jquery
        roundDown(number){ //up to 3 decimal
            return Math.round(number * 1000) / 1000
        },
        closeFilter() {
            const panel = document.querySelector("div.filters-panel");
            if (panel) panel.hidden = true
        },
        trierAlphabetique(){
            return
        },
        trierDistance(){
            return
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

.ion-content {
    background: #F3F2F7;
}

#tab-title {
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

.filters-panel {
    position: fixed;
    width: 100%;
    height: 30%;
    bottom: -60%;
    background: #E0DFE4;
    transition: all 0.4s cubic-bezier(0, .8, .2, 1)
}

.filters-panel.shown {
    bottom: 0;
}

.filters-panel, .panel-header {
    padding: 0;
    margin: 0;
}

.filters-panel .panel-header {

    font-weight: bold;
    font-family: 'Gotham Rounded Light', sans-serif;
    width: 100%;
    height: 20%;
}

.panel-header p {
    text-align: center;
    font-size: larger;
}

.filter-category p {
    font-size: medium;
}
#icon-header ion-icon{
    align-content: center;
    position: relative;
    top: 50%;
    transform: translateY(-50%);

}
#panel-heading {
    display: flex;
}

.trier {
    border-radius: 100%;
    color: black;
    padding: 0;
    margin: 0;
}

.panel-content {
    height: 90%;
    width: 100%;
    /*position: relative;*/
    background: white;
}

.place{
    border: 1px solid var(--button-outline-grey);
    border-radius: 10px;
    height: 15vw;
}

.filter-category ion-avatar {
    margin: auto;
    padding: 0;

}

.filter-category {
    text-align: center;
    margin: 0;
    padding: 0;
    font-size: 4vw;
}

ion-col img {
    width: 5vw;
    height: 5vw;
    margin: auto;
}
.directive {
    color: grey;
    margin: auto;
    padding-left: 1%;
}
#trier-par {
    padding-left: 1%;
    margin: auto;
}

#trier-par ion-col {
    padding: 0;
}
#title {
    font-weight: bold;
}
#distance {
    font-size: small;

}

/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>

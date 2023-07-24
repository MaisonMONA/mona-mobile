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

            <ion-modal ref="modal" trigger="open-modal" :initial-breakpoint="0.40" :breakpoints="[0, 0.20, 0.40]">
                    <ion-content>
                        <ion-toolbar id="modal-header">
                                <ion-icon class="modal-icon" size="medium" slot="start" :src="optionsOutline"></ion-icon>
                                <ion-text id="modal-heading"> <p>Filtres</p></ion-text>
                                <ion-icon class="modal-icon" size="medium" slot="end" :src="close" @click="dismiss()"></ion-icon>
                        </ion-toolbar>

                        <div class="titreTrier">
                            <ion-label>Trier par</ion-label>
                        </div>

                        <div id="trierParRadioGroup">
                            <ion-radio-group :value=this.getTrierPar() v-model="choixTrie">
                                <ion-label class="trierDistance">Distance</ion-label>
                                <ion-radio  mode="md" slot="end" value="Distance" ></ion-radio>

                                <ion-label class="trierAZ">AZ</ion-label>
                                <ion-radio  mode="md" slot="end" value="AZ"></ion-radio>
                            </ion-radio-group>
                        </div>

                        <div class="titreTrier">
                            <ion-label>Filtrer par</ion-label>
                        </div>

                        <ion-row class="ion-justify-content-between">
                            <ion-col class="filtre" size="3"
                                     @click="this.selectedDiscovery('decouverteArtwork', 'filtreArtworkBackgroundColor', 'filtreArtworkColor')"
                                     :style="{color: filtreArtworkColor, backgroundColor: filtreArtworkBackgroundColor}" >
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/artwork/default.svg')">
                                    </ion-avatar>
                                    <ion-text>Œuvres</ion-text>

                                </div>
                            </ion-col>
                            <ion-col class="filtre" size="4"
                                     @click="this.selectedDiscovery('decouverteHeritage', 'filtreHeritageBackgroundColor', 'filtreHeritageColor')"
                                     :style="{color: filtreHeritageColor, backgroundColor: filtreHeritageBackgroundColor}">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/heritage/default.svg')">
                                    </ion-avatar>
                                    <ion-text>Patrimoines</ion-text>
                                </div>
                            </ion-col>
                            <ion-col class="filtre" size="3"
                                     @click="this.selectedDiscovery('decouvertePlace', 'filtrePlaceBackgroundColor', 'filtrePlaceColor')"
                                     :style="{color: filtrePlaceColor, backgroundColor: filtrePlaceBackgroundColor}">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/place/default.svg')">
                                    </ion-avatar>
                                    <ion-text>Lieux</ion-text>
                                </div>
                            </ion-col>
                        </ion-row>
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
            offset: 0,
            currentFilter: '',
            lat2 : UserData.getLocation()[1],
            lng2 : UserData.getLocation()[0],
            componentKey: 0,

            // Icon
            filterOutline,
            syncCircleIcon: reload,

            //Discoveries
            completeDiscoveriesAZ: [],
            completeDiscoveriesDistance: [],
            discoveriesSortByAZ: [],
            discoveriesSortByDistance: [],
            discoveriesSortByPlaceAZ: [],
            discoveriesSortByPlaceDistance: [],
            discoveriesSortByHeritageAZ: [],
            discoveriesSortByHeritageDistance: [],
            discoveriesSortByArtworkAZ: [],
            discoveriesSortByArtworkDistance: [],


            //Certains variables sont des objets afin de passer par référence à previouslySelected
            //https://javascript.info/object-copy#:~:text=When%20an%20object%20variable%20is,object%20itself%20is%20not%20duplicated.&text=Now%20we%20have%20two%20variables,two%20variables%20that%20reference%20it.
            //Filtrer
            decouverteArtwork: false,
            decouverteHeritage:  false,
            decouvertePlace: false,

            //Trier
            choixTrie: "Distance",

            //CSS
            filtreArtworkColor:'black',
            filtreArtworkBackgroundColor: 'transparent',
            filtreHeritageColor: 'black',
            filtreHeritageBackgroundColor: 'transparent',
            filtrePlaceColor: 'black',
            filtrePlaceBackgroundColor: 'transparent',
        }
    },

    beforeMount() {
        this.completeDiscoveriesDistance = UserData.getSortedDiscoveriesDistance()
        this.completeDiscoveriesAZ = UserData.getSortedDiscoveriesAZ()
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesDistance', 'discoveriesSortByDistance', '')
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesAZ', 'discoveriesSortByAZ', '')
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesDistance', 'discoveriesSortByPlaceDistance', 'place' )
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesAZ', 'discoveriesSortByPlaceAZ', 'place' )
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesDistance', 'discoveriesSortByArtworkDistance', 'artwork')
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesAZ', 'discoveriesSortByArtworkAZ', 'artwork')
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesDistance', 'discoveriesSortByHeritageDistance', 'heritage')
        this.offset = 0
        this.pullDiscoveriesTrier(null, 'completeDiscoveriesAZ', 'discoveriesSortByHeritageAZ', 'heritage')

    },

    methods: {
        pullDiscoveries(event) {
            if (this.choixTrie === "Distance")
                if (this.decouvertePlace){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByPlaceDistance', 'place')
                }else if (this.decouverteArtwork){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByArtworkDistance', 'artwork')
                }else if (this.decouverteHeritage){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByHeritageDistance', 'heritage')
                }
                else
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByDistance', '')
            else if (this.choixTrie === "AZ")
                if (this.decouvertePlace){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByPlaceAZ', 'place')
                }else if (this.decouverteArtwork){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByArtworkAZ', 'artwork')
                }else if (this.decouverteHeritage){
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByHeritageAZ', 'heritage')
                }else
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByAZ', '')

        },
        getTrierPar() {
            return this.choixTrie
        },
        getDiscoveries(){
            let now = []
            if (this.choixTrie === "Distance"){
                now =  this.discoveriesSortByDistance
            }
            else if (this.choixTrie === "AZ"){
                now = this.discoveriesSortByAZ
            }

            if (this.decouverteArtwork){
                if (this.choixTrie === "Distance")
                    now = this.discoveriesSortByArtworkDistance
                else if (this.choixTrie === "AZ")
                    now = this.discoveriesSortByArtworkAZ
                //now = now.filter(discovery => discovery.dType === "artwork")
            }
            if (this.decouvertePlace){
                if (this.choixTrie === "Distance") {
                    now = this.discoveriesSortByPlaceDistance
                }else if (this.choixTrie === "AZ"){
                    now = this.discoveriesSortByPlaceAZ
                }
            }
            if (this.decouverteHeritage){
                if (this.choixTrie === "Distance")
                    now = this.discoveriesSortByHeritageDistance
                else if (this.choixTrie === "AZ")
                    now = this.discoveriesSortByHeritageAZ
                //now = now.filter(discovery => discovery.dType === "heritage")
            }

            return now
        },

        pullDiscoveriesTrier(event, completeDiscoveries, subsetDiscoveries, filterBy) {
            let subset
            if (filterBy){
                subset = this[completeDiscoveries].filter((elm) => {
                    return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
                }).filter(discovery => discovery.dType === filterBy).slice(this.offset, this.offset + 50)
            }
            else
                subset = this[completeDiscoveries].filter((elm) => {
                    return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
                }).slice(this.offset, this.offset + 50);

            this[subsetDiscoveries] = this[subsetDiscoveries].concat(subset)

            if (event && event.target && event.target.complete) // Send a signal when the user reaches the bottom
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

            if (this.choixTrie === "AZ"){
                if (this.decouvertePlace){
                    this.discoveriesSortByPlaceAZ = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByPlaceAZ', 'place')
                }else if (this.decouverteArtwork){
                    this.discoveriesSortByArtworkAZ =[]
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByArtworkAZ', 'artwork')
                }else if (this.decouverteHeritage){
                    this.discoveriesSortByHeritageAZ = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByHeritageAZ', 'heritage')
                }else
                    this.discoveriesSortByAZ = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesAZ', 'discoveriesSortByAZ', '')
            }
            else if (this.choixTrie === "Distance"){
                if (this.decouvertePlace){
                    this.discoveriesSortByPlaceDistance = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByPlaceDistance', 'place')
                }else if (this.decouverteArtwork){
                    this.discoveriesSortByArtworkDistance = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByArtworkDistance', 'artwork')
                }else if (this.decouverteHeritage){
                    this.discoveriesSortByHeritageDistance = []
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByHeritageDistance', 'heritage')
                }
                else
                    this.discoveriesSortByDistance = [];
                    this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByDistance', '')
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

            if(this.choixTrie === "Distance") {
                this.discoveriesSortByDistance = [];
                UserData.sortByDistance();
                this.completeDiscoveriesDistance = UserData.getSortedDiscoveriesDistance().filter((elm) => {
                    return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
                })
                this.pullDiscoveriesTrier(event, 'completeDiscoveriesDistance', 'discoveriesSortByDistance', '');
            }

            this.forceRerender();

            if (event && event.target && event.target.complete)  // Signal
                event.target.complete();
        },
        selectedDiscovery(typeDiscovery, backgroundColorID, colorID) {
            const decouverte = ['decouverteHeritage', 'decouverteArtwork', 'decouvertePlace']
            const backgroundColor = ['filtreHeritageBackgroundColor', 'filtreArtworkBackgroundColor', 'filtrePlaceBackgroundColor']
            const color = ['filtreHeritageColor', 'filtreArtworkColor' , 'filtrePlaceColor']

            if (!this[typeDiscovery]){
                this[backgroundColorID] = "#E0DFE4"
                this[colorID] = "black"
            }
            else if(this[typeDiscovery]){
                this[backgroundColorID] = "transparent"
                this[colorID] = "black"
            }

            for (let i = 0; i < 4; i ++){
                if ((decouverte[i] !== typeDiscovery) ){
                    if (this[decouverte[i]] === true){
                        this[backgroundColor[i]] = "transparent"
                        this[color[i]] = "black"
                        this[decouverte[i]] = !this[decouverte[i]]
                    }
                }
            }

            this[typeDiscovery] = !this[typeDiscovery]
            this.forceRerender()

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
    margin-top: 0;
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
ion-col{
    margin-top: 2%;
    margin-bottom: 2%;
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

.filtre{
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

.titreTrier {
    margin-top: 5%; margin-bottom: 2%; color: #48474B
}

.trierDistance {
    padding-right: 5%;
    padding-left: 0;
}

.trierAZ {
    padding-right: 5%;
}

#trierParRadioGroup {
    margin: 5%;
}

ion-radio-group {
    padding-top: 2%;
    padding-bottom: 2%;
}

ion-radio {
    --border-radius: 100%;
    --inner-border-radius: 100%;

    --color: #ddd;
    --color-checked: black;
}

#modal-header {
    font-weight: bold;
    font-family: 'Gotham Roundedight', sans-serif;
}
ion-modal ion-toolbar {
    --background: #E0DFE4;
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
    font-size: 12px;
    font-weight: normal;
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

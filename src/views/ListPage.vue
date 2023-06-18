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
                <ion-button id="open-modal" class="filters-button" shape="round" fill="outline" @click="showFiltersPanel">
                    <ion-icon :icon="filterOutline"></ion-icon>
                    Filtrer
                </ion-button>
                <ion-list :inset="true" lines="none">
                    <ion-item id="list" v-for="discovery of discoveriesSortByDistance" :key="discovery" @click="openDetails(discovery)">
                        <ion-avatar slot="start">
                            <img :src="getDiscoveryMedalIcon(discovery)" alt="">
                        </ion-avatar>
                        <ion-label id="distance" position="fixed">{{showDistance(discovery)}}</ion-label>
                        <ion-label id="title">{{ discovery.getTitle() }}</ion-label>
                    </ion-item>
                </ion-list>
                <ion-infinite-scroll @ionInfinite="pullDiscoveries">
                    <ion-infinite-scroll-content></ion-infinite-scroll-content>
                </ion-infinite-scroll>
                <p class="bottom-text">{{ discoveries.length }} résultats</p>
            </div>
<!-- Décommenter une fois l'implémentation du filtre soit finie
            <ion-modal ref="modal" trigger="open-modal" :initial-breakpoint="0.25" :breakpoints="[0, 0.25]">
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
                                        <ion-radio @click="trierDistance()" value="custom"></ion-radio>
                                    </ion-col>
                                    <ion-col size="4">
                                        <ion-text>A-Z</ion-text>
                                    </ion-col>
                                    <ion-col size="4">
                                        <ion-radio @click="trierAlphabetique()" value="custom-checked"></ion-radio>
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
            -->
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
         IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton,// IonModal,  IonRadio, IonRadioGroup,
        } from "@ionic/vue";
import { filterOutline, close, optionsOutline} from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "ListPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
        IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton, //IonModal,  IonRadio, IonRadioGroup,

    },
    setup(){
        return {
            close, optionsOutline
        }
    },

    data() {
        return {
            filterOutline,  // Icon
            discoveries: [],
            offset: 0,
            currentFilter: '',
            discoveriesSortByDistance: [],


        }
    },

    beforeMount() {
        //this.pullDiscoveries(null);
        this.trierListeParDistance(null);

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
            //this.discoveries = [];
           // this.pullDiscoveries(null);
            this.discoveriesSortByDistance = [];
            this.trierListeParDistance(null);
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
            const km = meters / 1000
            if (km > 1) {
                return Math.round(km) + " km"
            }
            return Math.round(meters) + " m"
        },
        //source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-33.php
        degrees2radians(degrees){
            const pi = Math.PI;
            return degrees * (pi/180);
        },
        trierListeParDistance(event){

            const subset = UserData.getSortedDiscoveriesDistance().filter((elm) => {
                return elm.getTitle().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(this.currentFilter.toLowerCase())
            }).slice(this.offset, this.offset + 50);

            console.log("in listPage")
            console.log(subset)
            this.discoveriesSortByDistance = this.discoveriesSortByDistance.concat(subset)

            if (event)  // Send a signal when the user reaches the bottom
                event.target.complete();

            this.offset += 50;
        },
        dismiss() {
            this.$refs.modal.$el.dismiss();
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



/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>

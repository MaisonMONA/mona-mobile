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
                    <ion-item v-for="discovery of discoveries" :key="discovery" @click="openDetails(discovery)">
                        <ion-avatar slot="start">
                            <img :src="getDiscoveryMedalIcon(discovery)" alt="">
                        </ion-avatar>
                        <ion-label>{{ discovery.getTitle() }}</ion-label>
                    </ion-item>
                </ion-list>
                <ion-infinite-scroll @ionInfinite="pullDiscoveries">
                    <ion-infinite-scroll-content></ion-infinite-scroll-content>
                </ion-infinite-scroll>
                <p class="bottom-text">{{ discoveries.length }} résultats</p>
            </div>

            <div class="filters-panel">
                <div class="panel-header">
                    <p>Filtres</p>
                </div>
                <div class="panel-content">
                    <ion-grid>
                        <ion-row class="ion-justify-content-around">
                            <ion-col size="3">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/artwork/default.svg')">
                                    </ion-avatar>
                                    <p>Œuvres</p>
                                </div>
                            </ion-col>
                            <ion-col size="3">
                                <div class="filter-category">
                                    <ion-avatar>
                                        <img :src="require('@/assets/drawable/medals/place/default.svg')">
                                    </ion-avatar>
                                    <p>Patrimoines</p>
                                </div>
                            </ion-col>
                            <ion-col size="3">
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
import { filterOutline } from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "ListPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
        IonInfiniteScroll, IonInfiniteScrollContent, IonSearchbar, IonIcon, IonButton, IonGrid, IonRow, IonCol
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
            // const panel = document.querySelector("div.filters-panel");
            // if (panel) panel.classList.add("shown");
        },

        getDiscoveryMedalIcon(discovery) {
            if (UserData.isCollected(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/collected.svg`);

            else if (UserData.isTargeted(discovery.id, discovery.dType))
                return require(`@/assets/drawable/medals/${ discovery.dType }/targeted.svg`);

            else
                return require(`@/assets/drawable/medals/${ discovery.dType }/default.svg`);
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

ion-item {
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
    height: 60%;
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
    text-align: center;
    font-weight: bold;
    font-family: 'Gotham Rounded Light', sans-serif;
    width: 100%;
    height: 10%;
}

.panel-header p {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
}

.panel-content {
    height: 90%;
    width: 100%;
    /*position: relative;*/
    background: white;
}

ion-col {
    border: 1px solid var(--button-outline-grey);
    border-radius: 10px;
    height: 15vw;
}

.filter-category ion-avatar {
    margin: 0;
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

/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>

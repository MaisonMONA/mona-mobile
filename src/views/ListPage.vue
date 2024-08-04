<template>
  <ion-page>

    <ion-content :fullscreen="true">
      <div class="main-content">
        <p id="tab-title">Liste des découvertes à faire</p>
        <!-- triggerTextFilter function triggered each 500 ms when search bar value changes-->
        <ion-searchbar
          show-clear-button="always"
          placeholder="Chercher"
          :debounce="500"
          @ion-clear="triggerTextFilter('')"
          @change="triggerTextFilter($event.target.value)"
          @keydown.enter="triggerTextFilter($event.target.value)"
        ></ion-searchbar>
        <ion-button
          id="open-modal"
          class="filters-button"
          shape="round"
          fill="outline"
        >
          <ion-icon :icon="filterOutline"></ion-icon>
          Filtrer
        </ion-button>

        <!-- Results list -->
        <ion-list :inset="true" lines="none" :key="componentKey">
          <ion-item
            id="list"
            v-for="discovery of getDiscoveries()"
            :key="discovery"
            @click="openDetails(discovery)"
          >
            <!-- Discovery icon -->
            <ion-avatar slot="start">
              <img :src="getDiscoveryMedalIcon(discovery)" alt="" />
            </ion-avatar>
            <!-- Discovery to user distance  -->
            <ion-label id="distance" position="fixed" class="ion-text-wrap"
              >{{
                Distance.distance2string(
                  Distance.calculateDistance(discovery, lat2, lng2),
                )
              }}
            </ion-label>
            <!-- Discovery title -->
            <ion-label id="title">{{ discovery.getTitle() }}</ion-label>
          </ion-item>
        </ion-list>
        <ion-infinite-scroll @ionInfinite="pullDiscoveries" :key="componentKey">
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <p class="bottom-text">{{ getDiscoveries().length }} résultats</p>
      </div>

      <!-- Filtres modal window opened when clicking Filtrer button -->
      <ion-modal
        ref="modal"
        trigger="open-modal"
        :initial-breakpoint="0.4"
        :breakpoints="[0, 0.2, 0.4]"
      >
        <!-- Filtres modal window content -->
        <ion-content>
          <ion-toolbar id="modal-header">
            <ion-icon
              class="modal-icon"
              size="medium"
              slot="start"
              :src="optionsOutline"
            ></ion-icon>
            <ion-text id="modal-heading"><p>Filtres</p></ion-text>
            <ion-icon
              class="modal-icon"
              size="medium"
              slot="end"
              :src="close"
              @click="dismiss()"
            ></ion-icon>
          </ion-toolbar>

          <!-- Choose how to order the results -->
          <div class="titreTrier">
            <ion-label>Trier par</ion-label>
          </div>

          <div id="trierParRadioGroup">
            <ion-radio-group :value="this.getTrierPar()" v-model="choixTrie">
              <ion-label class="trierDistance">Distance</ion-label>
              <ion-radio mode="md" slot="end" value="Distance"></ion-radio>

              <ion-label class="trierAZ">AZ</ion-label>
              <ion-radio mode="md" slot="end" value="AZ"></ion-radio>
            </ion-radio-group>
          </div>

          <!-- Choose how to filter the results -->
          <div class="titreTrier">
            <ion-label>Filtrer par</ion-label>
          </div>

          <ion-row class="ion-justify-content-between">
            <!-- Oeuvres select button -->
            <ion-col
              class="filtre"
              size="3"
              @click="selectedDiscovery(artwork)"
              :style="{
                color: artwork.color,
                backgroundColor: artwork.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img :src="'./assets/drawable/medals/artwork/default.svg'" />
                </ion-avatar>
                <ion-text>Œuvres</ion-text>
              </div>
            </ion-col>
            <!-- Patrimoines select button -->
            <ion-col
              class="filtre"
              size="4"
              @click="selectedDiscovery(heritage)"
              :style="{
                color: heritage.color,
                backgroundColor: heritage.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img :src="'./assets/drawable/medals/heritage/default.svg'" />
                </ion-avatar>
                <ion-text>Patrimoines</ion-text>
              </div>
            </ion-col>
            <!-- Lieux select button -->
            <ion-col
              class="filtre"
              size="3"
              @click="selectedDiscovery(place)"
              :style="{
                color: place.color,
                backgroundColor: place.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img :src="'./assets/drawable/medals/place/default.svg'" />
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
  IonPage,
  IonToolbar,
  IonContent,
  IonList,
  IonLabel,
  IonItem,
  IonAvatar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSearchbar,
  IonIcon,
  IonButton,
  IonRefresherContent,
  IonRefresher,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonCol,
  IonRow,
} from "@ionic/vue";
import { filterOutline, close, optionsOutline, reload } from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";
import { Distance } from "../internal/Distance";
//TODO: find out why images are not displayed
export default {
  name: "ListPage",
  computed: {
    Distance() {
      return Distance;
    },
  },
  components: {
    IonRefresher,
    IonRefresherContent,
    IonPage,
    IonToolbar,
    IonContent,
    IonList,
    IonLabel,
    IonItem,
    IonAvatar,
    IonSearchbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    IonButton,
    IonModal,
    IonRadio,
    IonRadioGroup,
    IonText,
    IonCol,
    IonRow
  },
  setup() {
    return {
      close,
      optionsOutline,
    };
  },

  data() {
    return {
      offset: 0,
      currentFilter: "",
      lat2: UserData.getLocation()[1],
      lng2: UserData.getLocation()[0],
      componentKey: 0,

      // Icon
      filterOutline,
      syncCircleIcon: reload,

      //Discoveries
      completeDiscoveriesAZ: [],
      completeDiscoveriesDistance: [],
      discoveriesSortByAZ: [],
      discoveriesSortByDistance: [],
      artwork: {
        selected: false,
        color: "black",
        backgroundColor: "transparent",
        sortByAZ: [],
        sortByDistance: [],
        type: "artwork",
      },
      heritage: {
        selected: false,
        color: "black",
        backgroundColor: "transparent",
        sortByAZ: [],
        sortByDistance: [],
        type: "heritage",
      },
      place: {
        selected: false,
        color: "black",
        backgroundColor: "transparent",
        sortByAZ: [],
        sortByDistance: [],
        type: "place",
      },
      //Trier
      choixTrie: "Distance",
    };
  },

  beforeMount() {
    this.completeDiscoveriesDistance = UserData.getSortedDiscoveriesDistance();
    this.completeDiscoveriesAZ = UserData.getSortedDiscoveriesAZ();
    const discoveries = [null, this.place, this.artwork, this.heritage];

    for (const discovery of discoveries) {
      for (let i = 0; i < 2; i++) {
        this.pullDiscoveriesTrier(null, i, discovery);
        this.offset = 0;
      }
    }
  },

  methods: {
    pullDiscoveries(event) {
      if (this.choixTrie === "Distance")
        if (this.place.selected) {
          this.pullDiscoveriesTrier(event, false, this.place);
        } else if (this.artwork.selected) {
          this.pullDiscoveriesTrier(event, false, this.artwork);
        } else if (this.heritage.selected) {
          this.pullDiscoveriesTrier(event, false, this.heritage);
        } else this.pullDiscoveriesTrier(event, false, null);
      else if (this.choixTrie === "AZ")
        if (this.place.selected) {
          this.pullDiscoveriesTrier(event, true, this.place);
        } else if (this.artwork.selected) {
          this.pullDiscoveriesTrier(event, true, this.artwork);
        } else if (this.heritage.selected) {
          this.pullDiscoveriesTrier(event, true, this.heritage);
        } else this.pullDiscoveriesTrier(event, true, null);
    },
    getTrierPar() {
      return this.choixTrie;
    },
    getDiscoveries() {
      let now = [];
      const discoveries = [this.place, this.artwork, this.heritage];

      if (this.choixTrie === "Distance") {
        now = this.discoveriesSortByDistance;
      } else if (this.choixTrie === "AZ") {
        now = this.discoveriesSortByAZ;
      }
      for (const discovery of discoveries) {
        if (discovery.selected) {
          if (this.choixTrie === "Distance") now = discovery.sortByDistance;
          else if (this.choixTrie === "AZ") now = discovery.sortByAZ;

          break;
        }
      }

      return now;
    },

    pullDiscoveriesTrier(event, sortByAZ, typeDiscovery) {
      let subset;
      const type = typeDiscovery ? typeDiscovery.type : "";
      const completeDiscoveries = sortByAZ
        ? "completeDiscoveriesAZ"
        : "completeDiscoveriesDistance";
      const sortBy = sortByAZ ? "sortByAZ" : "sortByDistance";
      const discoverySort = sortByAZ
        ? "discoveriesSortByAZ"
        : "discoveriesSortByDistance";
      if (typeDiscovery) {
        subset = this[completeDiscoveries]
          .filter((elm) => {
            return elm
              .getTitle()
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .includes(this.currentFilter.toLowerCase());
          })
          .filter((discovery) => discovery.dType === type)
          .slice(this.offset, this.offset + 50);
        typeDiscovery[sortBy] = typeDiscovery[sortBy].concat(subset);
      } else {
        subset = this[completeDiscoveries]
          .filter((elm) => {
            return elm
              .getTitle()
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .includes(this.currentFilter.toLowerCase());
          })
          .slice(this.offset, this.offset + 50);
        this[discoverySort] = this[discoverySort].concat(subset);
      }

      if (event && event.target && event.target.complete)
        // Send a signal when the user reaches the bottom
        event.target.complete();

      this.offset += 50;
    },
    openDetails(discovery) {
      let type;
      if (discovery.dType === "artwork") type = 0;
      else if (discovery.dType === "place") type = 1;
      /* (discovery.dType == "heritage") */ else type = 2;

      this.$router.push(`/discovery-details/${type}/${discovery.id}`);
    },

    triggerTextFilter(searchText) {
      // Removing whitespace and "diacritical" marks from the search input
      this.currentFilter = searchText
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      this.offset = 0;

      // Choice "Trier par" in "Filtres"
      if (this.choixTrie === "AZ") {
        // Choice "Filtrer par" in "Filtres"
        if (this.place.selected) {
          this.place.sortByAZ = [];
          this.pullDiscoveriesTrier(searchText, true, this.place);
        } else if (this.artwork.selected) {
          this.artwork.sortByAZ = [];
          this.pullDiscoveriesTrier(searchText, true, this.artwork);
        } else if (this.heritage.selected) {
          this.heritage.sortByAZ = [];
          this.pullDiscoveriesTrier(searchText, true, this.heritage);
        } else this.discoveriesSortByAZ = [];
        this.pullDiscoveriesTrier(searchText, true, null);
      } else if (this.choixTrie === "Distance") {
        // Choice "Filtrer par" in "Filtres"
        if (this.place.selected) {
          this.place.sortByDistance = [];
          this.pullDiscoveriesTrier(searchText, false, this.place);
        } else if (this.artwork.selected) {
          this.artwork.sortByDistance = [];
          this.pullDiscoveriesTrier(searchText, false, this.artwork);
        } else if (this.heritage.selected) {
          this.heritage.sortByDistance = [];
          this.pullDiscoveriesTrier(searchText, false, this.heritage);
        } else this.discoveriesSortByDistance = [];
        this.pullDiscoveriesTrier(searchText, false, null);
      }
    },

    getDiscoveryMedalIcon(discovery) {
      if (UserData.isCollected(discovery.id, discovery.dType))
        return `./assets/drawable/medals/${discovery.dType}/collected.svg`;
      else if (UserData.isTargeted(discovery.id, discovery.dType))
        return `./assets/drawable/medals/${discovery.dType}/targeted.svg`;
      else return `./assets/drawable/medals/${discovery.dType}/default.svg`;
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

      if (this.choixTrie === "Distance") {
        this.discoveriesSortByDistance = [];
        UserData.sortByDistance();
        this.completeDiscoveriesDistance =
          UserData.getSortedDiscoveriesDistance().filter((elm) => {
            return elm
              .getTitle()
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{Diacritic}/gu, "")
              .includes(this.currentFilter.toLowerCase());
          });
        this.pullDiscoveriesTrier(event, false, null);
      }

      this.forceRerender();

      if (event && event.target && event.target.complete)
        // Signal
        event.target.complete();
    },
    selectedDiscovery(discovery) {
      const typeDiscoveries = [this.artwork, this.heritage, this.place];
      // Toggle selected appearance of clicked selected discovery filter
      if (!discovery.selected) {
        discovery.backgroundColor = "#E0DFE4";
        discovery.color = "black";
      } else if (discovery.selected) {
        discovery.backgroundColor = "transparent";
        discovery.color = "black";
      }

      // Make so that only one discovery filter is selected
      for (const typeDiscovery of typeDiscoveries) {
        if (typeDiscovery !== discovery) {
          if (typeDiscovery.selected === true) {
            typeDiscovery.backgroundColor = "transparent";
            typeDiscovery.color = "black";
            typeDiscovery.selected = !typeDiscovery.selected;
          }
        }
      }
      // Toggle on/off clicked selected discovery filter
      discovery.selected = !discovery.selected;
    },
  },
};
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

ion-content {
  background: #f3f2f7;
}

#tab-title {
  margin-top: 0;
  padding-top: 15%;
  margin-top: 0;
  margin-left: 21px;
  font-family: "Gotham Rounded Light", sans-serif;
  font-size: 5.5vw;
}

div.main-content {
  min-height: 100%;
  background: #f3f2f7;
}

ion-list {
  background: #f3f2f7;
}

#list {
  border: 5px solid #f3f2f7;
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

ion-row {
  margin: 5%;
}

ion-col {
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
  font-family: "Gotham Rounded Light", sans-serif;
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
  /* To do so that the title stays on one line and finishes with "..." if it's too long */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

#distance {
  font-size: small;
  max-width: 30%; /* To correct #title sticking to the right bug caused by #distance taking too much space
   (max-width: 200px in Inspect element)*/
}

ion-col img {
  width: 5vw;
  height: 5vw;
  margin: auto;
}

.filtre {
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
  margin-top: 5%;
  margin-bottom: 2%;
  color: #48474b;
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
  font-family: "Gotham Roundedight", sans-serif;
}

ion-modal ion-toolbar {
  --background: #e0dfe4;
  --color: black;
}

ion-modal {
  --border-radius: 16px;
  --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
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
  color: #7f7f7f;
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

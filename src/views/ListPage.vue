<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="main-content">
        <p id="tab-title"></p>
        <!-- triggerTextFilter function triggered each 500 ms when search bar value changes -->
        <ion-searchbar
          show-clear-button="always"
          placeholder="Chercher"
          @ion-clear="triggerTextFilter('')"
          @ionInput="triggerTextFilter($event.target.value)"
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
            v-for="discovery of getDiscoveriesToShow()"
            :key="discovery"
            @click="openDiscoveryDetailsFullModale(discovery)"
          >
            <!-- Discovery icon -->
            <ion-avatar slot="start">
              <img :src="getDiscoveryMedalIcon(discovery)" alt="discoveryMedalIcon" />
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
        <ion-infinite-scroll
          @ionInfinite="pullMoreDiscoveries"
          :key="componentKey"
        >
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <p class="bottom-text">{{ getDiscoveriesToShow().length }} résultats</p>
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
              @click="dismissModal()"
            ></ion-icon>
          </ion-toolbar>

          <!-- Choose how to order the results -->
          <div class="titreTrier">
            <ion-label>Trier par</ion-label>
          </div>

          <div id="trierParRadioGroup">
            <ion-radio-group :value="this.getTrierPar()" v-model="choixTrie">
              <ion-radio mode="md" label-placement="end" value="Distance">Distance</ion-radio>

              <ion-label class="trierAZ"></ion-label>
              <ion-radio mode="md" label-placement="end" value="AZ">Ordre alphabétique</ion-radio>
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
              size="4"
              @click="selectedDiscovery(artwork)"
              :style="{
                color: artwork.color,
                backgroundColor: artwork.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img :src="'./assets/drawable/medals/artwork/default.svg'" alt="artwork discovery medal icon"/>
                </ion-avatar>
                <ion-text>Œuvres d'art</ion-text>
              </div>
            </ion-col>

            <!-- Patrimoine select button -->
            <ion-col
              class="filtre"
              size="3.3"
              @click="selectedDiscovery(heritage)"
              :style="{
                color: heritage.color,
                backgroundColor: heritage.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img :src="'./assets/drawable/medals/heritage/default.svg'" alt="heritage discovery medal icon"/>
                </ion-avatar>
                <ion-text>Patrimoine</ion-text>
              </div>
            </ion-col>
            <!-- Lieux culturels select button -->
            <ion-col
                class="filtre"
                size="4.3"
                @click="selectedDiscovery(place)"
                :style="{
                color: place.color,
                backgroundColor: place.backgroundColor,
              }"
            >
              <div class="filter-category">
                <ion-avatar>
                  <img
                      :src="'./assets/drawable/medals/place/default.svg'"
                      alt="place discovery medal icon"
                  />
                </ion-avatar>
                <ion-text>Lieux culturels</ion-text>
              </div>
            </ion-col>
          </ion-row>
        </ion-content>
      </ion-modal>

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
              @close-discovery-details-full-modale="discoveryDetailsFullModalOpen = false"
          />
        </ion-content>
      </ion-modal>
      <!-- Selected discovery full details modal -->

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
import DiscoveryDetailsFullModale from "@/components/DiscoveryDetailsFullModale.vue";

export default {
  name: "ListPage",
  computed: {
    Distance() {
      return Distance;
    },
  },
  components: {
    DiscoveryDetailsFullModale,
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
    IonRow,
  },
  setup() {
    return {
      close,
      optionsOutline,
    };
  },

  data() {
    return {

      discoveryDetailsFullModalOpen: false,
      listSelectedDiscovery: null,

      arrayOffset: 0,
      currentTextFilter: "",
      lat2: UserData.getLocation()[1],
      lng2: UserData.getLocation()[0],
      componentKey: 0,

      // Icon
      filterOutline,
      syncCircleIcon: reload,

      // Discoveries arrays
      completeDiscoveriesListByAZ: [],
      completeDiscoveriesListByDistance: [],
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
      // Tri choisi par distance ou AZ (alphabetique)
      choixTrie: "Distance",
    };
  },

  beforeMount() {
    // Setting initial values for the discoveries arrays
    this.completeDiscoveriesListByDistance = UserData.getSortedDiscoveriesDistance();
    this.completeDiscoveriesListByAZ = UserData.getSortedDiscoveriesAZ();

    const discoveries = [null, this.place, this.artwork, this.heritage];
    for (const discovery of discoveries) {
      for (let i = 0; i < 2; i++) {
        this.pullSortedDiscoveries(null, i, discovery);
        this.arrayOffset = 0;
      }
    }
  },

  methods: {
    pullMoreDiscoveries(event) {
      if (this.choixTrie === "Distance")
        if (this.place.selected) {
          this.pullSortedDiscoveries(event, false, this.place);
        } else if (this.artwork.selected) {
          this.pullSortedDiscoveries(event, false, this.artwork);
        } else if (this.heritage.selected) {
          this.pullSortedDiscoveries(event, false, this.heritage);
        } else this.pullSortedDiscoveries(event, false, null);
      else if (this.choixTrie === "AZ")
        if (this.place.selected) {
          this.pullSortedDiscoveries(event, true, this.place);
        } else if (this.artwork.selected) {
          this.pullSortedDiscoveries(event, true, this.artwork);
        } else if (this.heritage.selected) {
          this.pullSortedDiscoveries(event, true, this.heritage);
        } else this.pullSortedDiscoveries(event, true, null);
    },

    getTrierPar() {
      return this.choixTrie;
    },

    getDiscoveriesToShow() {
      let currentArray = [];
      const discoveries = [this.place, this.artwork, this.heritage];

      // If no discovery type is selected
      if (this.choixTrie === "Distance") {
        currentArray = this.discoveriesSortByDistance;
      } else if (this.choixTrie === "AZ") {
        currentArray = this.discoveriesSortByAZ;
      }

      // If a discovery type is selected, by distance or by AZ
      for (const discovery of discoveries) {
        if (discovery.selected) {
          if (this.choixTrie === "Distance")
            currentArray = discovery.sortByDistance;
          else if (this.choixTrie === "AZ") currentArray = discovery.sortByAZ;

          break;
        }
      }

      return currentArray;
    },

    pullSortedDiscoveries(event, sortByAZ, discoveryTypeObject) {
      let arraySubset;

      const discoveryType = discoveryTypeObject ? discoveryTypeObject.type : "";
      const discoverySortByArray = sortByAZ ? "sortByAZ" : "sortByDistance";

      const completeDiscoveries = sortByAZ
        ? "completeDiscoveriesListByAZ"
        : "completeDiscoveriesListByDistance";
      const discoverySort = sortByAZ
        ? "discoveriesSortByAZ"
        : "discoveriesSortByDistance";

      if (discoveryTypeObject) {
        arraySubset = this[completeDiscoveries]
          // Filter discoveries by search bar value
          .filter((arrayElement) => {
            return this.handleText(arrayElement.getTitle()).includes(
              this.currentTextFilter.toLowerCase(),
            );
          })
          // Filter discoveries by discovery type
          .filter((discovery) => discovery.dType === discoveryType)
          // Get the next 50 discoveries in array after arrayOffset
          .slice(this.arrayOffset, this.arrayOffset + 50);
        // Add the arraySubset to the corresponding discovery type object array
        discoveryTypeObject[discoverySortByArray] =
          discoveryTypeObject[discoverySortByArray].concat(arraySubset);
      } else {
        arraySubset = this[completeDiscoveries]
          // Filter discoveries by search bar value
          .filter((arrayElement) => {
            return this.handleText(arrayElement.getTitle()).includes(
              this.currentTextFilter.toLowerCase(),
            );
          })
          // Get the next 50 discoveries in array after arrayOffset
          .slice(this.arrayOffset, this.arrayOffset + 50);
        // Add the arraySubset to the corresponding array
        this[discoverySort] = this[discoverySort].concat(arraySubset);
      }

      if (event && event.target && event.target.complete)
        // Send a signal when the user reaches the bottom,
        // when finished to load more discoveries
        event.target.complete();

      this.arrayOffset += 50;
    },

    openDiscoveryDetailsFullModale(discovery) {
      this.discoveryDetailsFullModalOpen = true;
      this.listSelectedDiscovery = discovery;
    },

    openDiscoveryDetailsPage(discovery) {
      const type =
        discovery.dType === "artwork"
          ? 0
          : discovery.dType === "place"
            ? 1
            : /* (discovery.dType == "heritage") */ 2;

      this.$router.push(`/discovery-details/${type}/${discovery.id}`);
    },

    handleText(text) {
      return (
        text
          // Removing whitespaces at the start and the end
          .trim()
          // Removing "diacritical"(accents) marks from the search input
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          // Replace abbreviations with full words
          .toLowerCase()
          .replace(/\bst\b/gi, "saint")
          .replace(/\bste\b/gi, "sainte")
          .replace(/\bblvd\b/gi, "boulevard")
          // Replace special characters with spaces
          // TODO does it cause any problems in searching discovery titles?
          .replace(/[-,'.]/gi, " ")
          // If there are multiple consecutive spaces, replace them with one space
          .replace(/\s+/g, " ")
      );
    },

    triggerTextFilter(searchText) {
      this.currentTextFilter = this.handleText(searchText);
      this.arrayOffset = 0;

      // Choice "Trier par" in "Filtres"
      if (this.choixTrie === "AZ") {
        // Choice "Filtrer par" in "Filtres"
        if (this.place.selected) {
          this.place.sortByAZ = [];
          this.pullSortedDiscoveries(searchText, true, this.place);
        } else if (this.artwork.selected) {
          this.artwork.sortByAZ = [];
          this.pullSortedDiscoveries(searchText, true, this.artwork);
        } else if (this.heritage.selected) {
          this.heritage.sortByAZ = [];
          this.pullSortedDiscoveries(searchText, true, this.heritage);
        } else this.discoveriesSortByAZ = [];
        this.pullSortedDiscoveries(searchText, true, null);
      } else if (this.choixTrie === "Distance") {
        // Choice "Filtrer par" in "Filtres"
        if (this.place.selected) {
          this.place.sortByDistance = [];
          this.pullSortedDiscoveries(searchText, false, this.place);
        } else if (this.artwork.selected) {
          this.artwork.sortByDistance = [];
          this.pullSortedDiscoveries(searchText, false, this.artwork);
        } else if (this.heritage.selected) {
          this.heritage.sortByDistance = [];
          this.pullSortedDiscoveries(searchText, false, this.heritage);
        } else this.discoveriesSortByDistance = [];
        this.pullSortedDiscoveries(searchText, false, null);
      }
    },

    getDiscoveryMedalIcon(discovery) {
      if (UserData.isCollected(discovery.id, discovery.dType))
        return `./assets/drawable/medals/${discovery.dType}/collected.svg`;
      else if (UserData.isTargeted(discovery.id, discovery.dType))
        return `./assets/drawable/medals/${discovery.dType}/targeted.svg`;
      else return `./assets/drawable/medals/${discovery.dType}/default.svg`;
    },

    dismissModal() {
      this.$refs.modal.$el.dismiss();
    },

    forceRerender() {
      this.componentKey += 1;
    },

    refreshPage(event) {
      this.lat2 = UserData.getLocation()[1];
      this.lng2 = UserData.getLocation()[0];
      this.arrayOffset = 0;

      // Refresh the list of discoveries according to distance
      if (this.choixTrie === "Distance") {
        this.discoveriesSortByDistance = [];
        UserData.sortByDistance();
        this.completeDiscoveriesListByDistance =
          UserData.getSortedDiscoveriesDistance();
        this.pullSortedDiscoveries(event, false, null);
      }

      this.forceRerender();

      if (event && event.target && event.target.complete)
        // Signal that discovery list has been refreshed
        event.target.complete();
    },

    selectedDiscovery(discovery) {
      // Toggle selected appearance of clicked selected discovery filter
      if (!discovery.selected) {
        discovery.backgroundColor = "#E0DFE4";
        discovery.color = "black";
      } else if (discovery.selected) {
        discovery.backgroundColor = "transparent";
        discovery.color = "black";
      }

      const discoveryTypeObjects = [this.artwork, this.heritage, this.place];
      // Make so that only one discovery filter is selected
      for (const discoveryTypeObject of discoveryTypeObjects) {
        if (discoveryTypeObject !== discovery) {
          if (discoveryTypeObject.selected === true) {
            discoveryTypeObject.backgroundColor = "transparent";
            discoveryTypeObject.color = "black";
            discoveryTypeObject.selected = !discoveryTypeObject.selected;
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
  border-bottom: 5px solid #f3f2f7;
  border-top: 5px solid #f3f2f7;
  border-radius: 3vw;
  --min-height: 15vw;
}

.titreTrier ion-label, .trierDistance, .trierAZ {
  padding-left: 4%;
}

ion-avatar img {
  margin-top: 10%;
  max-width: 7.6vw;
  max-height: 7.6vw;
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
  padding-left: 0.2vw;
  font-weight: bold;
  /* To do so that the title stays on one line and finishes with "..." if it's too long */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.ios #title {
  padding-left: 0;
  font-size: 4vw;
}

#distance {
  padding-left: 2vw;
  font-size: small;
  max-width: 20%;
  /* To correct #title sticking to the right bug caused by #distance taking too much space
    (max-width: 200px in Inspect element)*/
  min-width: 0;
  /* To override ionic probably shadow DOM setting min-width to 100px*/
}
.ios #distance {
  max-width: 18%;
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
  margin: 0vw;
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

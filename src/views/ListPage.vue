<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="main-content">

        <div id="searchbarAndFilterButton">
          <!-- triggerTextFilter function triggered each 500 ms when search bar value changes -->
          <ion-searchbar
            id="listIonSearchBar"
            show-clear-button="always"
            placeholder="Rechercher par titre de découverte"
            @ion-clear="triggerTextFilter('')"
            @ionInput="triggerTextFilter($event.target.value)"
            @keydown.enter="triggerTextFilter($event.target.value)"
          ></ion-searchbar>
          
          <!-- Filter options button -->
          <ion-button
            id="open-modal"
            class="filters-button"
            shape="round"
            fill="outline"
          >
            <ion-icon slot="icon-only" :icon="`/assets/drawable/icons/list_filters_icon_white.svg`"></ion-icon>
          </ion-button>
          
          <!-- Refresh button -->
          <ion-button
            @click="refreshPage"
            id="refresh-button"
            class="filters-button"
          >
            <ion-icon :icon="syncCircleIcon"></ion-icon>
          </ion-button>
        </div>

        <!-- Results list -->
        <ion-list :inset="true" lines="none">
          <ion-item
            id="list"
            v-for="discovery of getDiscoveriesToShow()"
            :key="`${discovery.dType}:${discovery.id}`"
            @click="openDiscoveryDetailsFullModale(discovery)"
          >
            <!-- Discovery pin icon (canvas-rendered) -->
            <img
              v-if="collectedPhotoPinDataUrls[`${discovery.dType}:${discovery.id}`]"
              :src="collectedPhotoPinDataUrls[`${discovery.dType}:${discovery.id}`]"
              :key="`${componentKey}-${discovery.dType}:${discovery.id}-collected`"
              class="list-pin-icon collected-pin-icon"
              slot="start"
            />
            <img
              v-else
              :src="getDefaultPinDataUrl(discovery)"
              :key="`${componentKey}-${discovery.dType}:${discovery.id}-default`"
              class="list-pin-icon"
              slot="start"
            />
            <!-- Discovery title -->
            <ion-label id="title">{{ discovery.getTitle() }}</ion-label>
            <!-- Discovery to user distance  -->
            <ion-label id="distance" slot="end" class="ion-text-nowrap"
              >{{
                Distance.distance2string(
                  Distance.calculateDistance(discovery, lat2, lng2),
                )
              }}
            </ion-label>
          </ion-item>
        </ion-list>
        <ion-infinite-scroll @ionInfinite="pullMoreDiscoveries">
          <ion-infinite-scroll-content></ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <p class="bottom-text">{{ getDiscoveriesToShow().length }} résultats</p>
      </div>

      <!-- Filtres modal window opened when clicking Filtrer button -->
      <ion-modal
        ref="modal"
        trigger="open-modal"
        :initial-breakpoint="0.5"
        :breakpoints="[0, 0.2, 0.5, 0.7]"
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
              size-xs="3.8"
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
              size-xs="3.2"
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
                size-xs="4"
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
        :breakpoints="[0, 1]"
        :initial-breakpoint="1"
        :show-backdrop="true"
      >
          <discovery-details-full-modale
              :selected-discovery="listSelectedDiscovery"
              @close-discovery-details-full-modale="discoveryDetailsFullModalOpen = false"
          />
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
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Distance } from "../internal/Distance";
import { eventBus } from "@/internal/eventBus";
import DiscoveryDetailsFullModale from "@/components/DiscoveryDetailsFullModale.vue";
import { 
  createAnnuairePinCanvas, 
  createAnnuaireCollectedPhotoCanvas, 
  getCategoryIconName,
  preloadAllPinIcons,
  iconLoadPromises
} from "@/internal/PinUtils";

// --- Pin colors per discovery type ---
preloadAllPinIcons();

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
      lat2: UserData.getLocation(false)[1],
      lng2: UserData.getLocation(false)[0],
      componentKey: 0,
      collectedPhotoUrls: {}, // { "artwork:123": "blob:..." }
      collectedPhotoPinDataUrls: {}, // { "artwork:123": "data:image/png;base64,..." }
      defaultPinDataUrls: {}, // { "artwork:art_public": "data:image/png;base64,..." }
      iconsReady: false,

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
      this.arrayOffset = 0;
      this.pullSortedDiscoveries(null, false, discovery);
      this.pullSortedDiscoveries(null, false, discovery);

      this.arrayOffset = 0;
      this.pullSortedDiscoveries(null, true, discovery);
      this.pullSortedDiscoveries(null, true, discovery);
    }
  },

  async mounted() {
    this._onTargetedChanged = () => this.forceRerender();
    eventBus.on("targeted-changed", this._onTargetedChanged);

    this._onCollectedChanged = async () => {
      this.collectedPhotoUrls = {};
      this.collectedPhotoPinDataUrls = {};
      await this.loadCollectedPhotos();
      await this.renderCollectedPhotoPins();
    };
    eventBus.on("collected-changed", this._onCollectedChanged);

    // Wait for pin icons to load, then generate default pin data URLs
    await Promise.all(Object.values(iconLoadPromises));
    this.generateDefaultPinDataUrls();
    // Load collected photos and render as circular canvas pins
    await this.loadCollectedPhotos();
    await this.renderCollectedPhotoPins();
  },

  unmounted() {
    if (this._onTargetedChanged) {
      eventBus.off("targeted-changed", this._onTargetedChanged);
    }

    if (this._onCollectedChanged) {
      eventBus.off("collected-changed", this._onCollectedChanged);
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

    generateDefaultPinDataUrls() {
      const combos = [
        ['artwork', 'art_public', false],
        ['artwork', 'murales', false],
        ['artwork', 'sculptures', false],
        ['heritage', 'patrimoine', false],
        ['place', 'lieux_culturels', false],
        ['place', 'bibliotheques', false],
        ['artwork', 'targeted', true],
        ['heritage', 'targeted', true],
        ['place', 'targeted', true],
      ];
      const urls = {};
      for (const [type, icon, isTargeted] of combos) {
        const titleKey = isTargeted ? "targeted" : icon;
        const cacheKey = `${type}:${titleKey}:${isTargeted}`;
        const canvas = createAnnuairePinCanvas(type, titleKey, isTargeted);
        urls[cacheKey] = canvas.toDataURL();
      }
      this.defaultPinDataUrls = urls;
      this.iconsReady = true;
      this.forceRerender();
    },

    getDefaultPinDataUrl(discovery) {
      const isTargeted = UserData.isTargeted(discovery.id, discovery.dType);
      const categoryIcon = getCategoryIconName(discovery);
      const titleKey = isTargeted ? "targeted" : categoryIcon;
      const cacheKey = `${discovery.dType}:${titleKey}:${isTargeted}`;
      
      if (this.defaultPinDataUrls[cacheKey]) {
        return this.defaultPinDataUrls[cacheKey];
      }
      // Fallback: generate on demand and store reactively
      const canvas = createAnnuairePinCanvas(discovery.dType, categoryIcon, isTargeted);
      const url = canvas.toDataURL();
      this.defaultPinDataUrls[cacheKey] = url;
      return url;
    },

    async renderCollectedPhotoPins() {
      for (const [key, blobUrl] of Object.entries(this.collectedPhotoUrls)) {
        if (this.collectedPhotoPinDataUrls[key]) continue;
        const [type] = key.split(':');
        try {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = blobUrl;
          });
          if (img.width === 0) continue;
          const canvas = createAnnuaireCollectedPhotoCanvas(img, type, 30);
          this.collectedPhotoPinDataUrls[key] = canvas.toDataURL();
        } catch (err) {
          console.warn(`[ListPage] Failed to render collected pin for ${key}:`, err);
        }
      }
      this.forceRerender();
    },

    async loadCollectedPhotos() {
      const allDiscoveries = this.completeDiscoveriesListByDistance.length
        ? this.completeDiscoveriesListByDistance
        : this.completeDiscoveriesListByAZ;

      for (const discovery of allDiscoveries) {
        if (!UserData.isCollected(discovery.id, discovery.dType)) continue;

        const key = `${discovery.dType}:${discovery.id}`;
        if (this.collectedPhotoUrls[key]) continue;

        try {
          const review = UserData.getCollected(discovery.id, discovery.dType);
          if (!review || !review.filename) continue;

          let file;
          try {
            file = await Filesystem.readFile({
              path: "thumbnail/" + review.filename,
              directory: Directory.Data,
            });
          } catch {
            file = await Filesystem.readFile({
              path: "img/" + review.filename,
              directory: Directory.Data,
            });
          }

          let url;
          if (file.data instanceof Blob) {
            url = URL.createObjectURL(file.data);
          } else {
            const ext = review.filename.split(".").at(-1) || "jpeg";
            const res = await fetch(`data:image/${ext};base64,${file.data}`);
            const blob = await res.blob();
            url = URL.createObjectURL(blob);
          }

          this.collectedPhotoUrls[key] = url;
        } catch (err) {
          console.warn(`[ListPage] Failed to load photo for ${key}:`, err);
        }
      }
    },

    dismissModal() {
      this.$refs.modal.$el.dismiss();
    },

    forceRerender() {
      this.componentKey += 1;
    },

    refreshPage(event) {
      this.lat2 = UserData.getLocation(true)[1];
      this.lng2 = UserData.getLocation(true)[0];
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
  font-family: 'Gotham Rounded Light', sans-serif;
  font-size: 5.5vw;
}

div.main-content {
  min-height: 100%;
  background: #f3f2f7;
}

ion-list {
  background: #f3f2f7;
  /* To override ionic setting margin-top to 16px, since padding-bottom was added to the search bar */
  margin-top: 3%!important;
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

.list-pin-icon {
  width: 8.6vw;
  height: auto;
  object-fit: contain;
  margin-inline-end: 10px;
  flex-shrink: 0;
}

.collected-pin-icon {
  width: 8.6vw;
  height: auto;
  object-fit: contain;
}

ion-row {
  margin: 5%;
}

ion-col {
  margin-top: 2%;
  margin-bottom: 2%;
}

#searchbarAndFilterButton {
  background: #f3f2f7;
  padding-top: 6%;
  display: flex;
  align-items: center;
  padding-left: 4vw;
  position: sticky;
  top: 0;
  z-index: 2;
  padding-bottom: 1%;
  /* To prevent thin white line from appearing in-between the search bar and the list
    due to fractional pixel gap. */
  border-bottom: 1px solid #f3f2f7;
}
.ios #searchbarAndFilterButton {
  padding-top: 15%;
}

/* Also modified in global.css*/
ion-searchbar#listIonSearchBar {
  --background: white;
  --placeholder-color: black;
  --icon-color: black;
  --placeholder-font-style: italic;
  --border-radius: 2vw;
  --box-shadow: none;
  padding: 0;
  width: 63vw;
  border-radius: 4px;
}

p.bottom-text {
  font-size: 32px;
  text-align: center;
  font-family: 'Gotham Rounded Light', sans-serif;
}

.filters-button {
  --border-width: 0;
  --background: #4D58CB;
  margin: 0 1vw;
  --border-radius: 10px;
  --background-activated: black;
  width: 12vw;
  height: 12vw;
}

.filters-button ion-icon {
  font-size: 3vw;
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
  font-size: small;
  flex: 0 0 auto;
  margin-inline-start: 8px;
  text-align: end;
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

.filter-category ion-text {
  font-size: clamp(10px, 3.5vw, 14px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
}

/* Make filter columns more flexible */
ion-col.filtre {
  min-width: 70px;
  height: auto !important;
  min-height: 15vw;
  padding: 5px 2px;
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

/* Adjust modal height on smaller screens */
@media (max-height: 700px) {
  ion-modal::part(content) {
    --height: 90vh !important;
  }
}
@media (max-height: 560px) {
  ion-modal::part(content) {
    --height: 110vh !important;
  }
}

/* Ensure content is scrollable if needed */
ion-modal ion-content {
  --overflow: auto;
}

/* Further adjustments for tiny screens */
@media (max-width: 320px) {
  .filter-category ion-avatar {
    height: 6vw;
  }
  
  .filter-category ion-text {
    font-size: 10px;
  }
  
  ion-col.filtre {
    padding: 6px 1px;
  }
}

/* Small adjustment to modal initial sizing */
ion-modal[trigger="open-modal"] {
  --height: auto;
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
  --background: var(--toolbar-purple);
  --background-activated: lightgrey;
  width: 12vw; /* Match the filters-button width */
  height: 12vw; /* Match the filters-button height */
  --border-radius: 10px;
  margin: 0 1vw;
}

#refresh-button ion-icon {
  transform: scale(1.3);
  color: grey;
}

/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>
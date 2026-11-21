<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="main-content">
        <h1>Explorer</h1>

        <div id="searchbarAndFilterButton">
          <!-- triggerTextFilter function triggered each 500 ms when search bar value changes -->
          <ion-searchbar
            id="listIonSearchBar"
            show-clear-button="always"
            placeholder="Rechercher un.e artiste ou découverte"
            @ion-clear="triggerTextFilter('')"
            @ionInput="triggerTextFilter($event.target.value)"
            @keydown.enter="triggerTextFilter($event.target.value)"
          ></ion-searchbar>
                  
        </div>


        <!-- Affiche seulement si barre de recherche vide -->
        <div v-if="currentTextFilter.trim() === ''" class="explorer-home">

        <!-- Catégories -->
         <h2 class="explorer-title">Catégories</h2>
         <div class="categories-scroll">

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'art_public' }})">
            <img src="/assets/drawable/icons/pins/art_public.svg" alt="Art public" />
            <span>Art Public</span>
          </div>

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'lieux_culturels' }})">
            <img src="/assets/drawable/icons/pins/lieux_culturels.svg" alt="Lieux culturels" />
            <span>Lieux culturels</span>
          </div>

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'murales' }})">
            <img src="/assets/drawable/icons/pins/murales.svg" alt="Murales" />
            <span>Murales</span>
          </div>

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'patrimoine' }})">
            <img src="/assets/drawable/icons/pins/patrimoine.svg" alt="Patrimoine" />
            <span>Patrimoine</span>
          </div>

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'sculptures' }})">
            <img src="/assets/drawable/icons/pins/sculptures.svg" alt="Sculptures" />
            <span>Sculptures</span>
          </div>

          <div class="category-card" @click="$router.push({path: '/discoveries',query: { category: 'bibliotheques' }})">
            <img src="/assets/drawable/icons/pins/bibliotheques.svg" alt="Bibliothèques" />
            <span>Bibliothèque</span>
          </div>
          </div>

        <!--Artistes-->
        <h2 class="explorer-title">Artistes</h2>

        <div class="artists-promo">
          <div class="artists-promo-txt">
            <p> Plus de {{ artistsList.length }} artistes à découvrir dans l’application!</p>
            <button @click="goToAllArtists">VOIR TOUT</button>
          </div>
          <img src="/assets/drawable/tutorial/page 1.svg">
        </div>

        <!-- Par quartier -->
        <h2 class="explorer-title">Par quartier</h2>

        <div class="boroughs-grid" >
          <div v-for="(badge, index) in boroughBadges" v-show="index < boroughsToShow" :key="badge.id" class="borough-card" @click="$router.push({path: '/discoveries', query: { borough: badge.title }})">
            <img :src="getBoroughImage(badge)" :alt="badge.title" />
            <span>{{ badge.title }}</span>
          </div>
        </div>

        <!-- Charger plus -->
        <button v-if="boroughsToShow < boroughBadges.length" class="load-more-boroughs" @click="boroughsToShow += 9">
          CHARGER PLUS DE QUARTIERS
          <ion-icon :icon="chevronDownOutline"></ion-icon>
        </button>

        <!-- Charger moins -->
        <button v-if="boroughsToShow > 9" class="load-more-boroughs" @click="boroughsToShow = 9">
          CHARGER MOINS DE QUARTIERS
          <ion-icon :icon="chevronUpOutline"></ion-icon>
        </button>
      </div>



      <!-- Recherche -->
      <div v-else>
        <!-- Artist search results -->

          <!-- Only if user inserted text and at least 1 artist is found  -->
        <div v-if="currentTextFilter.trim() !== '' && searchArtists().length > 0" :inset="true" lines="none">
            <div class="search-section">
              <h2>Artistes</h2>

              <span @click="goToAllArtists">
                Voir tout 
                ({{ searchArtists().length }})
              </span>
            </div>
            <ion-list lines="none" >
            <!-- Affiche seulement 4 artistes -->
            <ion-item id="listArtiste" v-for="artist in (showAllArtists ? searchArtists(): searchArtists().slice(0, 4))" :key="`artist:${artist.id}`" @click="openArtistDetails(artist)" >
              <ion-label id="title"> {{ artist.name }}</ion-label>
            </ion-item>
            </ion-list>
        </div>

        <div style="height: 1px; background: #d0d0d0; margin: 10px 14px 0px;"></div>


        <!-- Discovery list -->
        <div v-if="currentTextFilter.trim() !== ''">
          <div class="search-section">
            <h2>Découvertes</h2>
          
            <span @click="gotoAllDiscoveries">
              Voir tout ({{ getTotalDiscoveries()}})
            </span>
          </div>
          <ion-list lines="none"> 
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
        </div>
      </div>

          

      </div>

      <!-- Filtres modal window opened when clicking Filtrer button -->
      <ion-modal
        ref="modal"
        trigger="open-modal"
        :initial-breakpoint="1"
        :breakpoints="[0, 1]"
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
            <h3>Trier</h3>
            <ion-radio-group v-model="draftFilters.sortBy">
              <ion-item lines="none">
                <ion-radio value="Distance">Distance</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="AZ">A-Z</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="Date">Date</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>


          <!--Par quartier-->
          <div class="filter-section">
            <h3>Par badge</h3>
            <div v-for="badge in badgesCollectionsStore.boroughCollection"
              :key="badge.id" class="filter-option"
              :class="{ selected: draftFilters.badges.includes(badge.title) }"
              @click="toggleDraftBadge(badge.title)">
              {{ badge.title }}
              <ion-icon v-if="draftFilters.badges.includes(badge.title)" :icon="checkmarkOutline"/>
            </div>
          </div>

          <!-- Types de découvertes -->
          <div class="filter-section">
            <h3>Types de découvertes</h3>

            <div v-for="type in discoveryFilterTypes"
              :key="type.value" class="filter-option"
              :class="{ selected: draftFilters.types.includes(type.value) }" @click="toggleDraftType(type.value)">
        {{ type.label }}
            <ion-icon v-if="draftFilters.types.includes(type.value)" :icon="checkmarkOutline"/>
            </div>
          </div>

          <div class="filter-actions">
            <ion-button fill="clear" @click="resetDraftFilters">
              Réinitialiser
            </ion-button>
            <ion-button @click="applyFilters">
              Appliquer
            </ion-button>
          </div>
            
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
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonButton,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonCol,
  IonRow,
} from "@ionic/vue";
import { filterOutline, close, optionsOutline, checkmarkOutline, chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import { UserData } from "@/internal/databases/UserData";
import { ArtistDatabase } from "@/internal/databases/ArtistDatabase";
import ArtistDetails from "@/components/ArtistDetails.vue";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Distance } from "../internal/Distance";
import { eventBus } from "@/internal/eventBus";
import { useBadgesCollections } from "@/stores/BadgesCollections";
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

    boroughBadges() {
      return this.badgesCollectionsStore.boroughCollection;
    },
  },
  components: {
    DiscoveryDetailsFullModale,
    ArtistDetails,
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
    const badgesCollectionsStore = useBadgesCollections();
    return {
      close,
      optionsOutline,
      badgesCollectionsStore,
      checkmarkOutline,
      chevronDownOutline,
      chevronUpOutline
    };
  },

  data() {
    return {

      discoveryDetailsFullModalOpen: false,
      listSelectedDiscovery: null,
      artistDetailsModalOpen: false,
      listSelectedArtist: null,
      showAllArtists: false,
      boroughsToShow: 9,

      arrayOffset: 0,
      currentTextFilter: "",
      artistsList:[],
      showingArtists: false, // indicateur pour recherche artiste vs art
      lat2: UserData.getLocation(false)[1],
      lng2: UserData.getLocation(false)[0],
      componentKey: 0,
      collectedPhotoUrls: {}, // { "artwork:123": "blob:..." }
      collectedPhotoPinDataUrls: {}, // { "artwork:123": "data:image/png;base64,..." }
      defaultPinDataUrls: {}, // { "artwork:art_public": "data:image/png;base64,..." }
      iconsReady: false,

      
      

      // Icon
      filterOutline,

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

      // Filtres sélectionnés mais pas encore appliqué
      draftFilters: {
        sortBy: "Distance",
        displayBy: "title",
        badges: [],
        types: [],
      },

      // Filtres appliqués
      appliedFilters: {
        sortBy: "Distance",
        isplayBy: "title",
        badges: [],
        types: [],
      },

      discoveryFilterTypes: [
        { label: "Œuvres d'art", value: "artwork" },
        { label: "Lieux culturels", value: "place" },
        { label: "Patrimoine", value: "heritage" },
      ],
    };
  },

  beforeMount() {
    // Setting initial values for the discoveries arrays
    this.completeDiscoveriesListByDistance = UserData.getSortedDiscoveriesDistance();
    this.completeDiscoveriesListByAZ = UserData.getSortedDiscoveriesAZ();
    this.badgesCollectionsStore.instantiateBadgesToShow();

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

    //load artists
    this.artistsList = ArtistDatabase.getAll();

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

    getBoroughImage(badge) {
      return `/assets/drawable/badges/borough/progress/${badge.id}.png`;
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

      return currentArray.slice(0,5);
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
            return this.isSimilar(arrayElement.getTitle(), this.currentTextFilter,);
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
            return this.isSimilar(arrayElement.getTitle(), this.currentTextFilter,);
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
    openArtistDetails(artist) {
      this.$router.push({
        name: "ArtistDetails",
        params: { id: artist.id },
      });
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

    searchArtists(){
      return ArtistDatabase.getAll().filter((artist) => 
        this.isSimilar(artist.name, this.currentTextFilter)
      );
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


isSimilar(text, search) {
  text= this.handleText(text);
  search= this.handleText(search);

  if (!search || text.includes(search)) {
    return true;
  }
  // Pas de fuzzy search pour les mots < 3
  if (search.length < 3) {
    return false;
  }

  //distance de Levenshtein
  const editDistance = (a, b) => {
    const scores = Array.from(
      {length: a.length + 1},
      (_, i)=> i,
    );

    for (let i = 1; i <= b.length; i++) {
      let previous= scores[0];
      scores[0]= i;

      for (let j= 1; j<= a.length; j++) {
        const oldScore = scores[j];

        scores[j] = Math.min(
          scores[j]+ 1,
          scores[j-1] + 1,
          previous+ (a[j-1] === b[i-1] ? 0: 1),
        );

        previous= oldScore;
      }
    }
    return scores[a.length];
  };

  // Recherche portion du titre avec MAX 2 fautes
  for (let start= 0; start< text.length; start++) {
    for (
      let length= Math.max(1, search.length- 1);
      length<= search.length+ 1;
      length++
    ) {
      const part= text.substring(start, start + length);

      if (part.length=== length && editDistance(search, part)<= 2) {
        return true;
      }
    }
  }

  return false;
},

    triggerTextFilter(searchText) {
      this.currentTextFilter = this.handleText(searchText);
      this.showingArtists = this.currentTextFilter.length > 0;
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

    goToAllArtists() {
      this.$router.push({
        path: "/artists",
        //Sends text in searchbar to Artist Search Page
        query: {
          search: this.currentTextFilter
        }
      });
    },

    gotoAllDiscoveries(){
      this.$router.push({
        path: "/discoveries",
        //Sends text in searchbar to Discovery Search Page
        query:{
          search: this.currentTextFilter,
          from: "/tabs/list"
        }
      })
    },

    getTotalDiscoveries() {
      let currentArray = [];

      if (this.choixTrie === "Distance") {
        currentArray = this.discoveriesSortByDistance;
        } else {
        currentArray = this.discoveriesSortByAZ;
      }

      const discoveries = [this.place, this.artwork, this.heritage];

      for (const discovery of discoveries) {
        if (discovery.selected) {
        currentArray =
          this.choixTrie === "Distance"
            ? discovery.sortByDistance
            : discovery.sortByAZ;
        break;
      }
    }

    return currentArray.length;
    },

    
      toggleDraftbadge(title){
        const badges = this.draftFilters.badges;
        this.draftFilters.badges = badges.includes(title)
          ? badges. filter(badge => badge !=title)
          : [...badges, title];
      },

      toggleDraftType(type){
        const types = this.draftFilters.types;
        this.draftFilters.types = types.includes(type)
          ? types.filter(item => item !== type)
          : [...types, type];
      },
      resetDraftFilters(){
        this.draftFilters = {
          sortBy: "Distance",
          displayBy: "title",
          badges: [],
          types: [],
        };
      },

      applyFilters(){
        this.appliedFilters = {
          sortBy: this.draftFilters.sortBy,
          displayBy: this.draftFilters.displayBy,
          badges: [...this.draftFilters.badges],
          types: [...this.draftFilters.types],
        };
        this.dismissModal();
      },
  },

  watch: {
  // Clears search bar
    "$route.query.resetSearch"(value) {
    if (value === "true") {
      this.currentTextFilter = "";
      this.$router.replace("/tabs/list");
    }
    }
  },
};


</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

ion-content {
  background: #FFFFFF;
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
  background: #FFFFFF;
}

ion-list {
  background: #FFFFFF;
  /* To override ionic setting margin-top to 16px, since padding-bottom was added to the search bar */
  margin-top: 3%!important;
}

#listArtist{
  --min-height: 45px;
  --padding-top: 0;
  --padding-bottom: 0;
  --inner-padding-top: 0;
  --inner-padding-bottom: 0;
  --border-width: 0; 
}

#list{
  border-bottom: 5px solid #FFFFFF;
  border-top: 5px solid #FFFFFF;
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


#searchbarAndFilterButton {
  background: #FFFFFF;
  padding-top: 2%;
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

/* Also modified in global.css*/
ion-searchbar#listIonSearchBar {
  --background: white;
  --placeholder-color: black;
  --icon-color: black;
  --placeholder-font-style: italic;
  --border-radius: 2vw;
  --box-shadow: none;
  padding: 0;
  width: 92vw;
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

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 15px;
  padding-top:25px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 15px;
}

.search-section h2 {
  font-size: 24px;
  font-weight: bold;  
}

.search-section span {
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
}

.search-section ion-list {
  background: white;
  margin: 0 !important;
}

.explorer-title {
  font-size: 22px;
  font-weight: bold;
  margin: 18px 12px;
}

/*Catégories */

.categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  margin: 18px 0px 18px 12px;
}

.category-card {
  min-width: 78px;
  height: 82px;
  border-radius: 7px;
  background: #F3F2F7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  flex-shrink: 0;
}

.category-card img {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

.category-card span {
  font-size: 10px;
  text-align: center;
}

/* Pressed */
.category-card:active {
  background: #B5B8E5;
}

.artists-promo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #FFFFFF;
  border: 2px solid #7779E8;
  border-radius: 14px;
  padding: 20px;
  margin: 20px;
  min-height: 190px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.artists-promo p {
  font-size: 18px;
  line-height: 1.35;
  margin: 0 0 18px;
  color: #000000;
}

.artists-promo button {
  background: #4D58CB;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 18px;
  font-weight: 500;
}

.artists-promo img {
  width: 52%;
  max-width: 180px;
  height: auto;
  object-fit: contain;
}

.artists-promo-txt{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}


/* Borough filter cards */
.boroughs-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-width: 90px;
  min-height: 105px;
  padding: 10px;

  background: #F3F2F7;
  border: 2px solid transparent;
  border-radius: 10px;

  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.boroughs-card.selected {
  background: #EEF0FF;
  border-color: #4D58CB;
  color: #4D58CB;
  font-weight: bold;
}

/* Grille des quartiers */
.boroughs-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 5px 20px;
}

.borough-card {
  background: #F3F2F7;
  border-radius: 16px;
  min-height: 180px;
  padding: 18px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  cursor: pointer;
  text-align: center;
}

.borough-card img {
  width: 100%;
  height: 105px;
  object-fit: contain;
}

.borough-card span {
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
  color: #000;
}

/* Pressed */
.borough-card:active {
  background: #B5B8E5;
}

/* Bouton charger plus */
.load-more-boroughs {
  width: calc(100% - 40px);
  margin: 12px 20px 25px;
  min-height: 58px;
  border: none;
  border-radius: 14px;
  background: #DCDDF3;
  color: #000;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.load-more-boroughs ion-icon {
  font-size: 23px;
}

/** {*/
/*    border: 1px solid rgba(0, 0, 0, 0.3);*/
/*}*/
</style>
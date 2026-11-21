<template>
  <ion-page>
    <ion-content>
    <div class="category-page">
      <div class="category-header">
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="goBack">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
        </ion-buttons>
        <h1>{{ borough ? borough : (category ? categoryName : "Toutes les découvertes") }}</h1>
      </div>

      <div id="searchbarAndFilterButton">
          <ion-searchbar id="listIonSearchBar" placeholder="Rechercher une découverte"
            show-clear-button="always"
            v-model="searchText"
          ></ion-searchbar>

          <ion-button class="filters-button" @click="openFilters">
            <ion-icon slot=icon-only :icon="`/assets/drawable/icons/list_filters_icon_white.svg`"></ion-icon>
          </ion-button>
          
        </div>

        <!--Liste de découvertes-->
        <ion-list lines="none">
          <ion-item id="list" v-for="discovery in visibleDiscoveries" 
          :key="`${discovery.dType}:${discovery.id}`"
          @click="openDiscoveryDetails(discovery)">

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
            <ion-label> {{ discovery.getTitle() }} </ion-label>
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

        <!-- Chargement progressif -->
        <ion-infinite-scroll
          v-if="visibleCount < filteredDiscoveries.length"
          @ionInfinite="loadMore"
        >
          <ion-infinite-scroll-content
            loading-text="Chargement..."
          />
        </ion-infinite-scroll>

    </div>

    <ion-modal :is-open="filtersModalOpen" class="fullscreen-filter-modal"
      :breakpoints="[0, 1]" :initial-breakpoint="1" @didDismiss="filtersModalOpen = false">
      <ion-content>
        <div class="filter-modal-content">
        
          
          <div class="filter-header">
            <h2>Filtrer la recherche</h2>
            <ion-button fill="clear" @click="filtersModalOpen = false">
              Fermer
            </ion-button>
          </div>

          <div class="filter-section">
            <div class="filter-section-header" @click="showSortSection = !showSortSection">
          <!-- Trier -->
          <h3>Trier par</h3> <ion-icon :icon="showSortSection ? chevronUpOutline : chevronDownOutline"></ion-icon>
            </div>

          <div v-if="showSortSection">
            <ion-radio-group v-model="draftFilters.sortBy">
              <ion-item>
                <ion-radio value="Distance">Distance</ion-radio>
              </ion-item>
              <ion-item>
                <ion-radio value="AZ">Ordre alphabétique</ion-radio>
              </ion-item>
              <ion-item lines="none">
                <ion-radio value="Date">Date</ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
        </div>

        <div v-if="showBoroughFilter" class="filter-section">
          <!-- Quartiers -->
          <div class="filter-section-header" @click="showBoroughSection = !showBoroughSection">
            <h3>Quartiers
              <span class="filter-count">{{ draftFilters.boroughs.length }}</span>
            </h3>
            <ion-icon :icon="showBoroughSection ? chevronUpOutline : chevronDownOutline" />
          </div>
          

          <div v-if="showBoroughSection" class="filter-section-content">
            <button v-for="badge in badgesCollectionsStore.boroughCollection"
            :key="badge.id" class="filter-option"
            :class="{ selected: draftFilters.boroughs.includes(badge.title) }" @click="toggleDraftValue('boroughs', badge.title)">
              {{ badge.title }}
              <ion-icon v-if="draftFilters.boroughs.includes(badge.title)" :icon="checkmarkOutline"/>
            </button>
          </div>
        </div>

        <!-- Catégories -->
        <div v-if="showCategoryFilter" class="filter-section">
          <div class="filter-section-header" @click="showCategorySection = !showCategorySection">
          <h3> Catégories
          <span class="filter-count">
            {{ draftFilters.categories.length }}
          </span>
          </h3>

          <ion-icon :icon="showCategorySection ? chevronUpOutline : chevronDownOutline"/>
          </div>

        <div v-if="showCategorySection" class="filter-section-content">
          <button v-for="option in categoryOptions" :key="option.value"
          class="filter-option" :class="{ selected: draftFilters.categories.includes(option.value) }"
          @click="toggleDraftValue('categories', option.value)">
            {{ option.label }}
          <ion-icon v-if="draftFilters.categories.includes(option.value)" :icon="checkmarkOutline"/>
          </button>
        </div>
        </div>


      <div class="filter-actions">
        <ion-button fill="clear" @click="resetFilters">
          SUPPRIMER LES FILTRES
        </ion-button>

        <ion-button class="show-results" @click="applyFilters">
          VOIR {{draftResultCount}} RÉSULTATS
        </ion-button>
      </div>
    </div>

      </ion-content>
    </ion-modal>

    <!-- Selected discovery full details modal -->
    <ion-modal
        :is-open="discoveryDetailsModalOpen"
        :breakpoints="[0, 1]"
        :initial-breakpoint="1"
        :show-backdrop="true"
        @didDismiss="discoveryDetailsModalOpen = false"
      >
          <DiscoveryDetailsFullModale
          :selected-discovery="selectedDiscovery"
          @close-discovery-details-full-modale="discoveryDetailsModalOpen = false"
        />
    </ion-modal>

        
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonButtons,
  IonButton,
  IonRadio,
  IonRadioGroup,
  IonCheckbox,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonModal,
} from "@ionic/vue";
import { chevronBackOutline, chevronDownOutline, chevronUpOutline, checkmarkOutline, filterOutline,} from "ionicons/icons";
import { useBadgesCollections } from "@/stores/BadgesCollections";
import { UserData } from "@/internal/databases/UserData";
import { Distance } from "@/internal/Distance";
import DiscoveryDetailsFullModale from "@/components/DiscoveryDetailsFullModale.vue";

import {
  getCategoryIconName,
  createAnnuairePinCanvas,
  createAnnuaireCollectedPhotoCanvas,
  iconLoadPromises,
  preloadAllPinIcons,
} from "@/internal/PinUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";

preloadAllPinIcons();

export default {
  name: "CategoryPage",

  components: {
    IonPage,
    IonContent,
    IonButtons,
    IonButton,
    IonCheckbox,
    IonModal,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRadio,
    IonRadioGroup,
    DiscoveryDetailsFullModale,
  },

  setup() {
    const badgesCollectionsStore = useBadgesCollections();

    return {
      badgesCollectionsStore,
      filterOutline,
    };
  },

  data() {
    return {
      Distance,
      chevronBackOutline,
      chevronDownOutline,
      chevronUpOutline,
      checkmarkOutline,
      showSortSection: true,
      showBoroughSection: true,
      showCategorySection: true,

      searchText: this.$route.query.search || "",
      sortBy: "Distance",

      allDiscoveries: [],
      visibleCount: 50,

      lat2: UserData.getLocation(false)[1],
      lng2: UserData.getLocation(false)[0],

      defaultPinDataUrls: {},
      collectedPhotoPinDataUrls: {},
      collectedPhotoUrls: {},

      discoveryDetailsModalOpen: false,
      selectedDiscovery: null,

      draftFilters: {
        sortBy: "Distance",
        boroughs: [],
        categories: [],
      },

      appliedFilters: {
        sortBy: "Distance",
        boroughs: [],
        categories: [],
      },
      filtersModalOpen: false,
      categoryOptions: [
        {label: "Lieux culturels", value: "lieux_culturels", icon: "🟣" },
        {label: "Œuvres d'art", value: "oeuvres_art", icon: "🟡" },
        {label: "Patrimoine", value: "patrimoine", icon: "🟠" },
      ],
    };
  },

  computed: {
    category() {
      return this.$route.query.category || this.$route.params.category || null;
    },

    borough() {
      return this.$route.query.borough || null;
    },

    showBoroughFilter() {
      return !this.borough;
    },

    showCategoryFilter() {
      return !this.category;
    },
    
  categoryName() {
    const names = {
      art_public: "Art public",
      murales: "Murales",
      sculptures: "Sculptures",
      patrimoine: "Patrimoine",
      lieux_culturels: "Lieux culturels",
      bibliotheques: "Bibliothèques",
    };

    return names[this.category] || "Toutes les découvertes";
  },

  filteredDiscoveries() {
      let source;

      if (this.appliedFilters.sortBy === "AZ") {
        source = UserData.getSortedDiscoveriesAZ();
      } else {
        source = [...UserData.getSortedDiscoveriesDistance()];
      }

      // Tri par date: les plus récentes en premier
      if (this.appliedFilters.sortBy === "Date") {
        source.sort((a, b) => {
        const dateA = new Date(a.produced_at || 0).getTime();
        const dateB = new Date(b.produced_at || 0).getTime();
        return dateB - dateA;
        });
      }

      return source.filter((discovery) => {
      const matchesRouteCategory =
        !this.category || getCategoryIconName(discovery) === this.category;
      
      const matchesRouteBorough =
        !this.borough || discovery.getBorough() === this.borough;

      // Selected Filters
      const matchesSelectedBorough =
        this.appliedFilters.boroughs.length === 0 || this.appliedFilters.boroughs.includes(discovery.getBorough());

      const matchesSelectedCategory =
        this.matchesSelectedCategory( discovery, this.appliedFilters.categories);

      // Text Search
      const matchesSearch = this.isSimilar(
        discovery.getTitle(),
        this.searchText
      );

      return matchesRouteCategory && matchesRouteBorough &&
            matchesSelectedBorough && matchesSelectedCategory &&matchesSearch
      });
    },

    
    // Number of results based on filters
    draftResultCount() {
      const source = UserData.getSortedDiscoveriesDistance();

      return source.filter((discovery) => {
        const matchesRouteCategory =
        !this.category || getCategoryIconName(discovery) === this.category;

        const matchesRouteBorough =
          !this.borough || discovery.getBorough() === this.borough;

        const matchesSelectedBorough =
          this.draftFilters.boroughs.length === 0 || this.draftFilters.boroughs.includes(discovery.getBorough());
        
        const matchesSelectedCategory =
          this.matchesSelectedCategory(discovery, this.draftFilters.categories);
          
        const matchesSearch = this.isSimilar(
          discovery.getTitle(),
          this.searchText
      );

    return (
      matchesRouteCategory && matchesRouteBorough &&
      matchesSelectedBorough && matchesSelectedCategory &&matchesSearch); }).length;
    },


  visibleDiscoveries() {
      return this.filteredDiscoveries.slice(0, this.visibleCount);
    },
  },

  async mounted() {
    await Promise.all(Object.values(iconLoadPromises));

    this.allDiscoveries = UserData.getSortedDiscoveriesDistance();

    await this.loadCollectedPhotos();
  },

  beforeUnmount() {
    Object.values(this.collectedPhotoUrls).forEach((url) => {
      URL.revokeObjectURL(url);
    });
  },
  watch: {
    category() {
      this.visibleCount = 50;
      this.searchText = "";
    },

    borough() {
      this.visibleCount = 50;
      this.searchText = "";
    },

    sortBy() {
      this.visibleCount = 50;
    },
  },


  methods: {
    onSearch() {
      this.visibleCount = 50;
    },


    loadMore(event) {
      this.visibleCount += 50;

      if (event && event.target) {
        event.target.complete();
      }
    },

    // more fiable return
    goBack() {
      this.$router.replace({
        path: "/tabs/list",
        // Reset search bar
        query: { resetSearch: "true" }
      });
    },

    getDefaultPinDataUrl(discovery) {
      const isTargeted = UserData.isTargeted(
        discovery.id,
        discovery.dType
      );

      const categoryIcon = getCategoryIconName(discovery);
      const titleKey = isTargeted ? "targeted" : categoryIcon;

      const cacheKey =
        `${discovery.dType}:${titleKey}:${isTargeted}`;

      if (this.defaultPinDataUrls[cacheKey]) {
        return this.defaultPinDataUrls[cacheKey];
      }

      const canvas = createAnnuairePinCanvas(
        discovery.dType,
        categoryIcon,
        isTargeted
      );

      const url = canvas.toDataURL();
      this.defaultPinDataUrls[cacheKey] = url;

      return url;
    },

    async loadCollectedPhotos() {
      for (const discovery of this.allDiscoveries) {
        if (!UserData.isCollected(discovery.id, discovery.dType)) {
          continue;
        }

        const key = `${discovery.dType}:${discovery.id}`;

        if (this.collectedPhotoPinDataUrls[key]) {
          continue;
        }

        try {
          const review = UserData.getCollected(
            discovery.id,
            discovery.dType
          );

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
            const ext =
              review.filename.split(".").at(-1) || "jpeg";

            const response = await fetch(
              `data:image/${ext};base64,${file.data}`
            );

            const blob = await response.blob();
            url = URL.createObjectURL(blob);
          }

          this.collectedPhotoUrls[key] = url;

          const img = new Image();

          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = url;
          });

          if (img.width === 0) continue;

          const canvas = createAnnuaireCollectedPhotoCanvas(
            img,
            discovery.dType,
            30
          );

          this.collectedPhotoPinDataUrls[key] =
            canvas.toDataURL();

        } catch (error) {
          console.warn(
            `[CategoryPage] Failed to load photo for ${key}:`,
            error
          );
        }
      }
    },

    

    openDiscoveryDetails(discovery) {
      this.selectedDiscovery = discovery;
      this.discoveryDetailsModalOpen = true;
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

    openFilters() {
      this.draftFilters = {
        sortBy: this.appliedFilters.sortBy,
        boroughs: [...this.appliedFilters.boroughs],
        categories: [...this.appliedFilters.categories],
      };

      this.filtersModalOpen = true;
    },

    toggleDraftValue(key, value) {
      const values = this.draftFilters[key];

      this.draftFilters[key] = values.includes(value)
        ? values.filter(item => item !== value)
        : [...values, value];
    },

    resetFilters() {
      this.draftFilters = {
        sortBy: "Distance",
        boroughs: [],
        categories: [],
      };
    },

    applyFilters() {
      this.appliedFilters = {
        sortBy: this.draftFilters.sortBy,
        boroughs: [...this.draftFilters.boroughs],
        categories: [...this.draftFilters.categories],
      };

      this.sortBy = this.appliedFilters.sortBy;
      this.visibleCount = 50;
      this.filtersModalOpen = false;
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


        // distance de Levenshtein
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


matchesSelectedCategory(discovery, selectedCategories) {
  if (selectedCategories.length === 0) {
    return true;
  }

  const category = getCategoryIconName(discovery);

  const categoryGroups = {
    oeuvres_art: ["art_public", "murales", "sculptures"],
    lieux_culturels: ["lieux_culturels", "bibliotheques"],
    patrimoine: ["patrimoine"],
  };

  return selectedCategories.some(selectedCategory =>
    categoryGroups[selectedCategory]?.includes(category)
  );
},


},
};
</script>

<style>
.category-header{
    display: flex;
    padding-top: 15px ;
}

.category-header ion-buttons {
  margin-left: 15px;
}
.category-header ion-button {
  margin-right: 0px !important;
}

.category-header h1 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 10px !important;
}

ion-searchbar#listIonSearchBar {
  --background: white;
  --placeholder-color: black;
  --icon-color: black;
  --placeholder-font-style: italic;
  --border-radius: 2vw;
  --box-shadow: none;
  padding: 10px 0;
  width: 82vw;
  border-radius: 4px;
}

.filters-button {
  --border-width: 0;
  --background: #4D58CB;
  --border-radius: 10px;
  --background-activated: black;
  width: 12vw;
  height: 12vw;
}

.filters-button ion-icon {
  font-size: 3vw;
  
}

#searchbarAndFilterButton {
  background: #FFFFFF;
  padding-top: 0;
  display: flex;
  align-items: center;
  padding-left: 2vw;
  padding-right:2vw;
  position: sticky;
  top: 0;
  z-index: 2;
  padding-bottom: 4%;
  /* To prevent thin white line from appearing in-between the search bar and the list
    due to fractional pixel gap. */
  border-bottom: 1px solid #f3f2f7;
}

#list {
  border-bottom: 5px solid #FFFFFF;
  border-top: 5px solid #FFFFFF;
  border-radius: 3vw;
  --min-height: 15vw;
  padding-right:10px;
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

#distance {
  font-size: small;
  flex: 0 0 auto;
  margin-inline-start: 8px;
  text-align: end;
}

.filter-modal-content {
  min-height: 100%;
  padding: 5vh 5vw calc(22vh + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-sizing: border-box;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 3vw;
  margin-bottom: 3vh;
  padding-left:10px;
}

.filter-header h2 {
  font-size: 6vw;
  font-weight: 700;
  margin: 0;
  color: #222222;
}

.filter-header ion-button {
  --color: #222222;
  margin: 0;
  padding-left:30px;
  font-size: 3vw;
}

.filter-section {
  padding: 2.5vh 0;
  border-bottom: 1px solid #EAEAEA;
}

.filter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.filter-section-header h3, .filter-modal-content > h3 {
  font-size: 4.5vw;
  font-weight: 600;
  margin: 0;
  color: #222222;
}





.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6vw;
  height: 6vw;
  margin-left: 2vw;
  padding: 0 1vw;
  border-radius: 50%;
  background: #2E389E;
  color: #FFFFFF;
  font-size: 3.2vw;
}

.filter-section-content {
  display: grid;
  gap: 2vw;
  margin-top: 2.5vh;
}

/* Cases de sélection */
.filter-option {
  min-height: 11vw;
  padding: 2vw 3vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1vw;
  border: 1px solid #DADADA;
  border-radius: 10px;
  background: #FFFFFF;
  color: #333333;
  font-size: 3.5vw;
  text-align: left;
}

.filter-option.selected {
  border: 1.5px solid #4D58CB;
  background: #F0F0FC;
  color: #303A9F;
  font-weight: 600;
}

.filter-option ion-icon {
  flex-shrink: 0;
  color: #4D58CB;
  font-size: 4.5vw;
}

/* Tri */
.filter-modal-content ion-radio-group {
  display: flex;
  flex-direction: column;
  margin-top: 1.5vh;
}

.filter-modal-content ion-radio-group ion-item {
  --background: transparent;
  --min-height: 6vh;
  font-size: 3.8vw;
}

.filter-modal-content ion-radio {
  --color-checked: #2E389E;
  margin-right: 3vw;
}

/* Boutons du bas */
.filter-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  padding: 1.5vh 3.9vw calc(1.5vh + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 1vh;
  z-index: 100;
  box-sizing: border-box;
}

.filter-actions ion-button {
  flex: 1;
  height: 6vh;
  --border-radius: 10px;
  font-size: 3.7vw;
  font-weight: 400;
  background: #FFFFFF;
}

.filter-actions ion-button:first-child {
  width: 100%;
  height: 5.4vh;
  margin: 0;
  --border-radius: 8px;
  font-size: 3.8vw;
  font-weight: 400;
  --color: #000000;
  --background: transparent;
}

.filter-actions .show-results {
  width: 100%;
  height: 5.4vh;
  margin: 0;
  --border-radius: 8px;
  font-size: 3.8vw;
  font-weight: 600;
  --background: #4D58CB;
  --color: #FFFFFF;
  --border-radius: 12px;

}

</style>
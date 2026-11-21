<template>
    <ion-page>
        <ion-content>
            <div>
                <div class="category-header">
                    <ion-buttons slot="start">
                      <ion-button fill="clear" @click="$router.back()">
                        <ion-icon :icon="chevronBackOutline" />
                      </ion-button>
                    </ion-buttons>

                    <h1>Tous les artistes</h1>
                </div>
                
                <!-- Search bar and filters -->
                <div id="searchbarAndFilterButton">
                    <ion-searchbar id="listIonSearchBar" placeholder="Rechercher un.e artiste"
                    show-clear-button="always" v-model="searchText">
                    </ion-searchbar>
                    <ion-button class="filters-button" @click="openFilters">
                      <ion-icon slot="icon-only" :icon="`/assets/drawable/icons/list_filters_icon_white.svg`"> </ion-icon>
                    </ion-button>
                </div>

                 <!-- Artists list -->
                <ion-list lines="none">
                    <ion-item id="artist-result" v-for="artist in sortedArtists" :key="artist.id" 
                    @click="openArtistDetails(artist)"> 
                      <img slot="start" :src="getArtistPin()" class="artist-icon" alt="Art public"/>
                      <ion-label>
                        <h2>{{ artist.name }}</h2>
                        <p>{{ getArtworkCount(artist) }} œuvres répertoriées</p>
                      </ion-label>
                    </ion-item>
                </ion-list>

                <!-- If no artsits found  -->
                <ion-item v-if="filteredArtists.length === 0" class="empty-message">
                    Aucun artiste trouvé.
                </ion-item>
            </div>

            <!-- Filters  -->
            <ion-modal :is-open="filtersModalOpen" class="fullscreen-filter-modal"
            :breakpoints="[0, 1]" :initial-breakpoint="1" @didDismiss="filtersModalOpen = false">
              <ion-content>
                <div class="filter-modal-content">
        
          
                  <div class="filter-header">
                    <h2>Filtrer la recherche</h2>
                    <ion-button fill="clear" @click="filtersModalOpen = false">
                      Fermer </ion-button>
                  </div>
                  
                  <!-- Trier -->
                  <div class="filter-section">
                    <div class="filter-section-header" @click="showSortSection = !showSortSection">
                      <h3>Trier par</h3> 
                      <ion-icon :icon="showSortSection ? chevronUpOutline : chevronDownOutline"></ion-icon>
                    </div>

                    <div v-if="showSortSection">
                      <ion-radio-group v-model="draftFilters.sortBy">
                        <ion-item>
                          <ion-radio value="AZ">Ordre alphabétique</ion-radio>
                        </ion-item>
                        <ion-item>
                          <ion-radio value="count-dec">Nombre d'œuvres décroissant</ion-radio>
                        </ion-item>
                        <ion-item>
                          <ion-radio value="count-croi">Nombre d'œuvres croissant</ion-radio>
                        </ion-item>
                      </ion-radio-group>
                    </div>
                  </div>


                  <div class="filter-actions">
                    <ion-button fill="clear" @click="resetFilters">
                      SUPPRIMER LES FILTRES
                    </ion-button>

                    <ion-button class="show-results" @click="applyFilters">
                      VOIR {{filteredArtists.length}} RÉSULTATS
                    </ion-button>
                  </div>
                </div>
              </ion-content>
            </ion-modal>
        </ion-content>
    </ion-page>
</template>

<script>
import {
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonIcon,
  IonModal,
  IonButton,
  IonButtons,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/vue";
import { chevronBackOutline, chevronDownOutline, chevronUpOutline } from "ionicons/icons";
import { ArtistDatabase } from "@/internal/databases/ArtistDatabase";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import {createDefaultPinCanvas, iconLoadPromises, preloadAllPinIcons,} from "@/internal/PinUtils";

preloadAllPinIcons();

export default {
  name: "ArtistsPage",

  components: {
    IonPage,
    IonRadio,
    IonModal,
    IonRadioGroup,
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
  },
  data() {
    
    return {
        chevronBackOutline,
        chevronDownOutline,
        chevronUpOutline,

        showSortSection: true,
        filtersModalOpen: false,  
        artistPinDataUrl: null,
        searchText: this.$route.query.search || "",
        artistsList: [],
        artworksList: [],

        draftFilters: {
          sortBy: "AZ",
        },

        appliedFilters: {
          sortBy: "AZ",
        },
    };
  },

  computed: {
     // Filters artists according to the search
    filteredArtists() {
      return this.artistsList.filter((artist) =>
        this.isSimilar(artist.name, this.searchText)
      );
    },


    // Sorts the filtered artists according to the selected filters
    sortedArtists(){
      const artists = [...this.filteredArtists];

      if (this.appliedFilters.sortBy === "AZ") {
        return artists.sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
        );
      }

      if (this.appliedFilters.sortBy === "count-dec") {
        return artists.sort((a, b) => this.getArtworkCount(b) - this.getArtworkCount(a)
        );
      }

      if (this.appliedFilters.sortBy === "count-croi") {
        return artists.sort((a, b) => this.getArtworkCount(a) - this.getArtworkCount(b)
        );
      }

      return artists;
    }
  },

  async mounted() {
    // Waits until icons are loaded
    await Promise.all(Object.values(iconLoadPromises));

    this.artistsList = ArtistDatabase.getAll();
    this.artworksList = ArtworkDatabase.getAll();

    this.artistPinDataUrl = createDefaultPinCanvas("artwork", "art_public", false).toDataURL();
  },

  methods: {
    openArtistDetails(artist) {
      this.$router.push({
        name: "ArtistDetails",
        params: { id: artist.id },
      });
    },

    //Phonetic search
    soundex(word){
      // inspo: https://gist.github.com/shawndumas/1262659
      const normalized = this.handleText(word);
      if (!normalized) return "";

      const codes = {
        b: "1", f: "1", p: "1", v: "1",
        c: "2", g: "2", j: "2", k: "2",
        q: "2", s: "2", x: "2", z: "2",
        d: "3", t: "3",
        l: "4",
        m: "5", n: "5",
        r: "6",
      };
      const firstLetter = normalized[0].toUpperCase();

      let result = firstLetter;
      let previousCode = codes[normalized[0]] || "";

      for (let i = 1; i < normalized.length; i++) {
        const code = codes[normalized[i]] || "";

        if (code && code !== previousCode) {
          result += code;
        }

        previousCode = code;
      }

      return (result + "000").slice(0, 4);
      
    },

    openFilters() {
      this.draftFilters = {
      sortBy: this.appliedFilters.sortBy,
      };

      this.filtersModalOpen = true;
    },

    resetFilters() {
      this.draftFilters = {
        sortBy: "AZ",
      };

      this.appliedFilters = {
        sortBy: "AZ",
      };
    },

    applyFilters() {
      this.appliedFilters = {
        sortBy: this.draftFilters.sortBy,
      };

      this.filtersModalOpen = false;
    },

    getArtistPin() {
      return this.artistPinDataUrl || "";
    },

    // Number of artworks for an artist
    getArtworkCount(artist) {
      return ArtworkDatabase.getAll().filter((artwork) =>
        artwork.artists?.some((artworkArtist) => String(artworkArtist.id) === String(artist.id))
        ).length;
    },

    handleText(text) {
      return text
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/\bst\b/gi, "saint")
        .replace(/\bste\b/gi, "sainte")
        .replace(/\bblvd\b/gi, "boulevard")
        .replace(/[-,'.]/gi, " ")
        .replace(/\s+/g, " ");
    },
    
    isSimilar(text, search) {
      text= this.handleText(text);
      search= this.handleText(search);

        if (!search || text.includes(search)) {
          return true;
        }
        // No de fuzzy search for les words shorter than 3 char
        if (search.length < 3) {
          return false;
        }

        // 1. Soundex
        const searchWords = search.split(" ").filter(word => word.length >= 3);
        const textWords = text.split(" ").filter(word => word.length >= 3);

        if (
          searchWords.length > 0 &&
          searchWords.every(searchWord =>
            textWords.some(textWord =>
              this.soundex(searchWord) === this.soundex(textWord)
            )
          )
        ) {
          return true;
        }

        // 2. distance de Levenshtein
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

        //Maximum one typo
        for (let start= 0; start< text.length; start++) {
          for (
            let length= Math.max(1, search.length- 1);
            length<= search.length+ 1;
            length++
          ) {
            const part= text.substring(start, start + length);

            if (part.length=== length && editDistance(search, part)<= 1) {
              return true;
            }
          }
        }

        return false;
    },
  },
};

</script>
<style>

.category-header{
    display: flex;
    margin-bottom: 10px;
}
.category-header ion-button {
  --color: black;
  margin-right: 20px;
}
.category-header h1 {
  font-size: 27px;
  font-weight: 600;
  margin-left:20px;
  
}
ion-searchbar#listIonSearchBar {
  --background: white;
  --placeholder-color: black;
  --icon-color: black;
  --placeholder-font-style: italic;
  --border-radius: 2vw;
  --box-shadow: none;
  padding: 0;
  width: 80vw;
  border-radius: 4px;
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

#searchbarAndFilterButton {
  background: #FFFFFF;
  padding-top: 2%;
  display: flex;
  align-items: center;
  padding: 4vw;
  position: sticky;
  top: 0;
  z-index: 2;
  padding-bottom: 1%;
  /* To prevent thin white line from appearing in-between the search bar and the list
    due to fractional pixel gap. */
  border-bottom: 1px solid #f3f2f7;
}

ion-list {
  border-bottom: 5px solid #FFFFFF;
  border-top: 5px solid #FFFFFF;
  border-radius: 3vw;
  --min-height: 15vw;
}

ion-item{
  padding-left:10px;
}

ion-label{
  padding-left:10px;
}

#artist-result{
    --min-height: 45px;
    --padding-top: 0;
    --padding-bottom: 0;
    --inner-padding-top: 0;
    --inner-padding-bottom: 0;
    --border-width: 0;
    --inner-border-width: 0;
    --border-style: none;
}

.artist-icon {
  width: 40px;
  height: 50px;
  object-fit: contain;
  flex-shrink: 0;
  margin-inline-end: 10px;
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
  padding-left: 10px;
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
  padding-left: 30px;
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

.filter-section-header h3,
.filter-modal-content > h3 {
  font-size: 4.5vw;
  font-weight: 600;
  margin: 0;
  color: #222222;
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
  font-size: 3.8vw;
  font-weight: 600;
  --background: #4D58CB;
  --color: #FFFFFF;
  --border-radius: 12px;
}
</style>
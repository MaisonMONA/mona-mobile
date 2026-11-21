<template>
  <ion-page>
    <ion-content>
    <div v-if="artist" class="artist-container">


      <div class="header" >
        <ion-button fill="clear" @click="$router.back()">
          <ion-icon :icon="chevronBackOutline" />
        </ion-button>
    

        <div class="artist-heading">
          <h1 class="artist-title">{{ artist.name }}</h1>
          <p>{{ artworksDetails.length }} œuvres répertoriées</p>
        </div>
        
        <div class="artist-avatar">
          <img src="/assets/drawable/icons/defaultUserAvatar.svg" alt="Default avatar"/>
        </div>

      </div>

    <!--Biography links-->
      <div v-if="artist.links?.bio?.fr || artist.links?.bio?.en" class="artist-bio">
        <p v-if="artist.is === 'collective'">Collectif</p>
        <p v-else>Artiste individuel</p>

        <a v-if="artist.links?.bio?.fr" :href="artist.links.bio.fr" target="_blank" rel="noopener noreferrer">
            Consulter la biographie (FR)
        </a>

        <a v-if="artist.links?.bio?.en" :href="artist.links.bio.en" target="_blank" rel="noopener noreferrer">
            Read biography (EN)
        </a>
      </div>

      <div v-else class="artist-bio">
        <p v-if="artist.is === 'collective'">Collectif</p>
        <p v-else>Artiste individuel</p>
        <p>Aucune biographie disponible pour cet artiste.</p>
      </div>


      <!-- Artist artworks -->
      <h2>Œuvres</h2>

      <ion-list lines="none">
        <ion-item id="artwork-list"
        v-for="artwork in artworksDetails"
        :key="artwork.id">

        <!-- Discovery pin icon (canvas-rendered) -->
          <img
            v-if="collectedPhotoPinDataUrls[`${artwork.dType}:${artwork.id}`]"
            :src="collectedPhotoPinDataUrls[`${artwork.dType}:${artwork.id}`]"
            :key="`${componentKey}-${artwork.dType}:${artwork.id}-collected`"
            class="list-pin-icon collected-pin-icon"
            slot="start"
          />
          <img
            v-else
            :src="getDefaultPinDataUrl(artwork)"
            :key="`${componentKey}-${artwork.dType}:${artwork.id}-default`"
            class="list-pin-icon"
            slot="start"
          />

          <ion-label>
            <div class="titre">
              {{ artwork.getTitle() }}
            </div>

            <div class="categorie">
              {{ getCategoryLabel(artwork) }}
            </div>
          </ion-label>

          <ion-label id="distance" slot="end" class="ion-text-nowrap">
            {{ Distance.distance2string(
                  Distance.calculateDistance(artwork, lat2, lng2),
                ) }}
          </ion-label>
        </ion-item>
      </ion-list>
    </div>
    <div v-else class="empty">
      Artiste introuvable.
    </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/vue";

import { chevronBackOutline } from "ionicons/icons";

import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { ArtistDatabase } from "@/internal/databases/ArtistDatabase";
import { UserData } from "@/internal/databases/UserData";
import { Distance } from "@/internal/Distance";
import { Directory, Filesystem } from "@capacitor/filesystem";


import {
  getCategoryIconName,
  createAnnuairePinCanvas,
  createAnnuaireCollectedPhotoCanvas,
  iconLoadPromises,
  preloadAllPinIcons,
} from "@/internal/PinUtils";

preloadAllPinIcons();

export default {
  name: "ArtistDetails",

  components: {
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
  },

  props: {
    id: {
    type: String,
    required: true,
    },
  },


  data(){
    return{
      Distance,
      chevronBackOutline,

      lat2: UserData.getLocation(false)[1],
      lng2: UserData.getLocation(false)[0],

      componentKey: 0,

      defaultPinDataUrls: {},
      collectedPhotoPinDataUrls: {},
      collectedPhotoUrls: {},

    }
  },

  

  computed: {
    artist() {
      return ArtistDatabase.getAll().find(
        (artist) => String(artist.id) === String(this.id)
      );
    },

    artworksDetails() {
      if (!this.artist) return [];

      return ArtworkDatabase.getAll().filter((artwork) =>
        artwork.artists?.some(
          (artist) => String(artist.id) === String(this.artist.id)
        )
      );
    },
  },

  async mounted(){
    
    //Wait for icons to finish loading
    await Promise.all(Object.values(iconLoadPromises));

    await this.loadCollectedPhotos();
    await this.renderCollectedPhotoPins();
  },
  
  beforeUnmount(){
    //Release temporary image URLs
    Object.values(this.collectedPhotoUrls).forEach((url) => {
      URL.revokeObjectURL(url);
    });
  },

  methods: {

    getDefaultPinDataUrl(discovery) {
      const isTargeted = UserData.isTargeted(discovery.id, discovery.dType);
      const categoryIcon = getCategoryIconName(discovery);
      const titleKey = isTargeted ? "targeted" : categoryIcon;
      const cacheKey = `${discovery.dType}:${titleKey}:${isTargeted}`;

      // Reuse an already generated pin.
      if (this.defaultPinDataUrls[cacheKey]) {
        return this.defaultPinDataUrls[cacheKey];
      }
      // Fallback: generate the pin and cache it
      const canvas = createAnnuairePinCanvas(discovery.dType, categoryIcon, isTargeted);
      const url = canvas.toDataURL();
      this.defaultPinDataUrls[cacheKey] = url;
      return url;
    },

    async loadCollectedPhotos() {
      const allDiscoveries = UserData.getSortedDiscoveriesDistance();

      for (const discovery of allDiscoveries) {
        const belongsToArtist = discovery.artists?.some(
          (artist) => String(artist.id) === String(this.artist?.id)
        );

      if (!belongsToArtist) continue;
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
    } catch (error) {
      console.warn(`[ArtistDetails] Failed to load photo for ${key}:`, error);
    }
  }
},

    async renderCollectedPhotoPins() {
      for (const [key, blobUrl] of Object.entries(this.collectedPhotoUrls)) {
        if (this.collectedPhotoPinDataUrls[key]) continue;

        const [type] = key.split(":");

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
          console.warn(`[ArtistDetails] Failed to render collected pin for ${key}:`, err);
        }
      }

      this.componentKey += 1;
    },

    getCategoryLabel(artwork) {
      const category = getCategoryIconName(artwork);

      const labels = {
        art_public: "Art public",
        sculptures: "Sculpture",
        murales: "Murale",
        patrimoine: "Patrimoine",
        lieux_culturels: "Lieu culturel",
        bibliotheques: "Bibliothèque",
      };

      return labels[category] || "Découverte";
    },
  },
};


</script>


<style scoped>


.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 55px;
  padding: 0px 20px;

}


.header ion-button {
  --color: black;
  margin: 0;
  flex-shrink: 0;
}

.artist-heading {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.artist-title {
  margin: 0;
  font-family: "Open Sans", sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.artist-heading p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #222222;
}


.artist-container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  padding: 40px 0px;
  background: #ffffff;
  color: #222222;
  font-family: "Open Sans", sans-serif;
  overflow-y: auto;
}

.artist-bio{
  margin: 20px;
  padding:15px;
  background:#FFE59980;
  border-radius: 25px;
}

.artist-bio p{
  margin:0px;
  margin-bottom:10px;
}

.artist-bio a {
  display: block;
  color:#222222;
}

h2 {
  margin: 40px 0 18px;
  font-family: "Open Sans", sans-serif;
  font-size: 23px;
  font-weight: 500;
  padding: 0px 15px;
}

ion-list {
  padding: 0px 5px;
  margin: 0;
  background: white;
}

#artwork-list{
  --background: #ffffff;
  --padding-end: 28px;
  --inner-padding-end: 0px;
  --min-height: 15vw;
  --border-color: #aaaaaa;
  --border-width: 0 0 1.5px 0;
  --inner-border-width: 0;
  align-items: center;
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

.titre {
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

.categorie {
  padding-left: 0.6vw;
}

#distance {
  font-size: small;
  flex: 0 0 auto;
  margin-inline-start: 8px;
  text-align: end;
}


@media (max-width: 360px) {
  .artist-title {
    font-size: 27px;
  }
  .artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  }

  .artist-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    padding:10px;
  }

}
</style>


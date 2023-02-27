import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

/* Custom imports */

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/(DEFAULT_FILE)_variables.css';

import 'leaflet/dist/leaflet.css';
import { Icon } from "leaflet";

/* ~~~~ Custom imports ~~~~ */
import {ArtworkDatabase} from "@/internal/databases/ArtworkDatabase";
import {PlaceDatabase} from "@/internal/databases/PlaceDatabase";
import {HeritageDatabase} from "@/internal/databases/HeritageDatabase";
import {BadgeDatabase} from "@/internal/databases/BadgeDatabase";
/* ~~~~~~~~~~~~~~~~~~~~~~~~ */

const app = createApp(App)
    .use(IonicVue)
    .use(router);

Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});


router.isReady().then(() => {
    /* Init databases and THEN open Discovery of the day */
    /*   ^--- (not implemented yet) */
    console.log("Initializing databases...");
    Promise.allSettled([
        ArtworkDatabase.populate(),
        PlaceDatabase.populate(),
        HeritageDatabase.populate(),
        BadgeDatabase.populate(),
    ]).then(() => {
        console.log("All done.");
        app.mount('#app');
        defineCustomElements(window).catch(() => console.error("Error in defineCustomElements (`main.ts`)."));
    });
});

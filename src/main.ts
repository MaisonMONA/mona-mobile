import { createApp } from 'vue';
import App from './App.vue';
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

/* ~~~~ Custom imports ~~~~ */
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { UserData } from "@/internal/databases/UserData";
import { Directory, Filesystem } from "@capacitor/filesystem";
/* ~~~~~~~~~~~~~~~~~~~~~~~~ */




/* Init databases and THEN run main app */
console.log("Initializing databases...");
UserData.populate();
Promise.allSettled([
    // Filesystem.deleteFile({
    //     path: "appdata/preferences.json",
    //     directory: Directory.Data
    // }),
    ArtworkDatabase.populate(),
    PlaceDatabase.populate(),
    HeritageDatabase.populate(),
    BadgeDatabase.populate(),
]).then(() => {
    console.log("All done.");

    const app = createApp(App)
        .use(IonicVue)
        .use(router);

    router.isReady().then( async () => {
        app.mount('#app');
        defineCustomElements(window).catch(() => console.error("Error in defineCustomElements (`main.ts`)."));
    });
})

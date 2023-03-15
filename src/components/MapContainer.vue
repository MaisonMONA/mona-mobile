<template>
    <div id="map" class="map">
        <div id="popup">
            <div id="popupDetails" hidden>
                <p id="popupTitle" class="details"></p>  <!-- Set to max 13 char (including '...' if necesssary) -->
                <p id="popupSubtext" class="details"></p>  <!-- Set to max 18 char (same) -->
                <ion-button fill="outline" id="seeMore" router-direction="forward">
                    <ion-icon slot="icon-only" :icon="arrowRightIcon"></ion-icon>
                </ion-button>
            </div>
        </div>
    </div>

    <ion-button id="settingsButton">
        <ion-icon :icon="funnelIcon"></ion-icon>
    </ion-button>

    <ion-button @click="changeTileLayer()" id="changeStyleButton">
        <ion-icon :icon="layersIcon"></ion-icon>
    </ion-button>
</template>


<script>
import "ol/ol.css"

import { arrowForward as arrowRightIcon, layers as layersIcon, funnel as funnelIcon } from "ionicons/icons";
import { IonButton, IonIcon } from "@ionic/vue";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { Group as layerGroup } from "ol/layer";
import { useGeographic } from "ol/proj";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { OSM, Stamen } from "ol/source";
import { defaults as defaultControls } from "ol/control";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { easeOut } from "ol/easing";

import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import {useRoute} from "vue-router";


// This variable is here to know if the user focuses a discovery or not
let hasFocus = false;


function insertAllPins(destination, listsOfDiscoveries) {
    for (const list of listsOfDiscoveries) {
        for (const discovery of list) {
            const feature = new Feature({
                geometry: new Point([discovery.location.lng, discovery.location.lat]),
                id: discovery.id,
                dType: discovery.dType
            });
            destination.getSource().addFeature(feature);
        }
    }
}


function getDiscovery(id, type) {
    switch (type) {
        case "artwork": case "artworks": case 0: {
            return ArtworkDatabase.getFromId(id);
        }
        case "place": case "places": case 1: {
            return PlaceDatabase.getFromId(id);
        }
        case "heritage": case "heritages": case 2: {
            return HeritageDatabase.getFromId(id);
        }
    }
}


export default {
    name: "MapContainer",

    components: {
        IonButton, IonIcon
    },

    data() {
        const layer = new layerGroup({
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ]
        });

        let discovery = null;
        if (this.$route.query.type && this.$route.query.id) {
            discovery = getDiscovery(parseInt(this.$route.query.id), this.$route.query.type)
            setTimeout(() => this.focusDiscovery(discovery), 250);
        }

        return {
            mainMap: null,
            INITAL_COORD: discovery ? [discovery.location.lng, discovery.location.lat] : [-73.6, 45.5], // Defaults coordinates are on Montreal
            DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14,  // If the map was opened by the DOD page we want to zoom more
            TILE_LAYER: layer,
            layersIcon, funnelIcon, arrowRightIcon
        }
    },

    mounted() {
        this.myMap();

        const route = useRoute();
        const dType = route.params.dType.toString;
        const id = route.params.id.toString();
        if (dType && id) {
            const discovery = getDiscovery(parseInt(id), dType);
            this.focusDiscovery(discovery);
        }
    },

    methods: {
        myMap() {
            useGeographic();
            this.mainMap = new Map({
                // Hiding attribution (quite immoral)
                controls: defaultControls({ attribution: false }),

                target: "map",
                view: new View({
                    center: this.INITAL_COORD,
                    zoom: this.DEFAULT_ZOOM_LEVEL,

                    // Disable rotation on map
                    enableRotation: false
                }),

                layers: [this.TILE_LAYER]
            });

            this.mainMap.on("singleclick", this.handleMapClick)
            this.mainMap.on("movestart", this.unfocusDiscovery)

            this.showPins();
        },

        showPins(discoveries=[]) {
            const pinsLayer = new VectorLayer({
                source: new VectorSource(),
                style: Utils.styleFunction
            });

            if (discoveries.length > 0) {
                insertAllPins(pinsLayer, [discoveries]);
            } else {
                insertAllPins(pinsLayer, [ArtworkDatabase.data, PlaceDatabase.data, HeritageDatabase.data]);
            }

            this.mainMap.addLayer(pinsLayer);
        },

        changeTileLayer() {
            // Removing the previously drawn
            const prevLayers = this.mainMap.getLayers();
            while (prevLayers.getLength() > 0) {
                this.mainMap.removeLayer(prevLayers.pop());
            }

            if (UserData.getMapStyle() === "osm") {
                const stamenLayer = new layerGroup({
                    layers: [
                        new TileLayer({
                            source: new Stamen({ layer: "toner-lite" }),
                        }),
                    ]
                });

                this.mainMap.setLayerGroup(stamenLayer);
                this.showPins();

                UserData.setMapStyle("stamen");
            } else /* if (UserData.getMapStyle() === "stamen") */ {
                const osmLayer = new layerGroup({
                    layers: [
                        new TileLayer({
                            source: new OSM()
                        })
                    ]
                });

                this.mainMap.setLayerGroup(osmLayer);
                this.showPins();

                UserData.setMapStyle("osm");
            }
        },

        handleMapClick(event) {
            const features = this.mainMap.getFeaturesAtPixel(event.pixel, { hitTolerance: 10 });
            if (features.length > 0) {
                const dType = features[0].get("dType");
                const id = features[0].get("id");

                const discovery = getDiscovery(id, dType);

                if (hasFocus) {
                    this.unfocusDiscovery();
                }
                this.focusDiscovery(discovery);
                hasFocus = true;
            } else {
                if (hasFocus) {
                    this.unfocusDiscovery();
                    hasFocus = false;
                }
            }
        },

        focusDiscovery(discovery, map=this.mainMap) {
            const transitionDuration = 350;  // Unit is milliseconds

            // Animate centering map on the pin
            map.getView().animate({
                center: [discovery.location.lng, discovery.location.lat],
                duration: transitionDuration,
                // zoom: 14.25,
                easing: easeOut
            });

            const details = document.getElementById("popupDetails");

            // Show popup AFTER the view has been centered
            setTimeout(() => {
                const elem = document.getElementById("popup");
                elem.classList.add("activated");
            }, transitionDuration);

            // Show content of popup AFTER the popup was shown
            setTimeout(() => {
                let title = discovery.getTitle()
                let subtext = discovery.dType === "artwork" ? discovery.getArtists() : discovery.getUsages();

                if (title.length > 13) {
                    title = title.slice(0, 10) + "..."
                }
                if (subtext.length > 18) {
                    subtext = subtext.slice(0, 15) + "..."
                } else if (subtext.length === 0) {
                    subtext = "Inconnu";
                }

                let type;
                if (discovery.dType === "artwork") type = 0;
                else if (discovery.dType === "place") type = 1;
                else /* if (discovery.dType === "heritage") */ type = 2;

                // Changing the button redirection
                const button = document.getElementById("seeMore");
                button.onclick = () => this.$router.push({ path: `/discovery-details/${type}/${discovery.id}` });

                document.getElementById("popupTitle").innerHTML = title
                document.getElementById("popupSubtext").innerHTML = subtext;
                details.hidden = false;
            }, transitionDuration + 200);
        },

        unfocusDiscovery() {
            const details = document.getElementById("popupDetails");
            const elem = document.getElementById("popup");

            details.hidden = true;
            elem.classList.remove("activated");
        }
    },
};
</script>

<style scoped>
@import url("@/theme/Map.css");
</style>

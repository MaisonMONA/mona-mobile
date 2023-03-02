<template>
    <div id="map" class="map"></div>

    <ion-button id="settingsButton">
        <ion-icon :icon="funnelIcon"></ion-icon>
    </ion-button>

    <ion-button @click="changeTileLayer(this)" id="changeStyleButton">
        <ion-icon :icon="brushIcon"></ion-icon>
    </ion-button>
</template>

<script>
import "ol/ol.css"

import { brush as brushIcon, funnel as funnelIcon } from "ionicons/icons";
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

import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import vLayers from "@/internal/PinsVectorLayer";

export default {
    name: "MapContainer",
    props: ['discoveries'],

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
        if (this.$route.query.artwork !== undefined) {
            const id = this.$route.query.artwork;
            discovery = ArtworkDatabase.getFromId(id);
        }
        if (this.$route.query.place !== undefined) {
            const id = this.$route.query.place;
            discovery = PlaceDatabase.getFromId(id);
        }
        if (this.$route.query.heritage !== undefined) {
            const id = this.$route.query.heritage;
            discovery = HeritageDatabase.getFromId(id);
        }

        return {
            mainMap: null,
            INITAL_COORD: discovery ? [discovery.location.lng, discovery.location.lat] : [-73.6, 45.5], // Defaults coordinates are on Montreal
            DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14,  // If the map was opened by the DOD page we want to zoom more
            TILE_LAYER: layer,
            brushIcon, funnelIcon
        }
    },

    mounted() {
        this.myMap();
    },

    methods: {
        myMap() {
            useGeographic();
            this.mainMap = new Map({
                // Hiding attribution (quite immoral isn't it?)
                controls: defaultControls({ attribution: false }),

                target: "map",
                view: new View({
                    center: this.INITAL_COORD,
                    zoom: this.DEFAULT_ZOOM_LEVEL,
                
                    // Disable rotation on map
                    enableRotation: false
                }),
            });

            this.mainMap.setLayerGroup(this.TILE_LAYER);

            this.showPins();
        },

        showPins(discoveries=[]) {
            this.mainMap.addLayer(vLayers.artworkDefault);
            this.mainMap.addLayer(vLayers.artworkCollected);
            this.mainMap.addLayer(vLayers.artworkTargeted);
            this.mainMap.addLayer(vLayers.placeDefault);
            this.mainMap.addLayer(vLayers.placeCollected);
            this.mainMap.addLayer(vLayers.placeTargeted);
            this.mainMap.addLayer(vLayers.heritageDefault);
            this.mainMap.addLayer(vLayers.heritageCollected);
            this.mainMap.addLayer(vLayers.heritageTargeted);

            const artworkPins = { default: [], collected: [], targeted: [] };
            const placePins = { default: [], collected: [], targeted: [] };
            const heritagePins = { default: [], collected: [], targeted: [] };

            // If no specific discovery was passed as argument, must show all pins
            if (discoveries.length === 0) {
                for (const artwork of ArtworkDatabase.data) {
                    this.insertPin(artwork, artworkPins);
                }

                for (const place of PlaceDatabase.data) {
                    this.insertPin(place, placePins);
                }

                for (const heritage of HeritageDatabase.data) {
                    this.insertPin(heritage, heritagePins);
                }
            } else {  // If we only want to show specific discoveries
                for (const disc of discoveries) {
                    switch (disc.type) {
                        case "artwork": {
                            this.insertPin(disc, artworkPins);
                            break;
                        }

                        case "place": {
                            this.insertPin(disc, placePins);
                            break;
                        }

                        case "heritage": {
                            this.insertPin(disc, heritagePins);
                            break;
                        }
                    }
                }
            }

            vLayers.artworkDefault.getSource().addFeatures(artworkPins.default);
            vLayers.artworkCollected.getSource().addFeatures(artworkPins.collected);
            vLayers.placeTargeted.getSource().addFeatures(artworkPins.targeted);
            vLayers.placeDefault.getSource().addFeatures(placePins.default);
            vLayers.placeCollected.getSource().addFeatures(placePins.collected);
            vLayers.placeTargeted.getSource().addFeatures(placePins.targeted);
            vLayers.heritageDefault.getSource().addFeatures(heritagePins.default);
            vLayers.heritageCollected.getSource().addFeatures(heritagePins.collected);
            vLayers.heritageTargeted.getSource().addFeatures(heritagePins.targeted);
        },

        insertPin(disc, pins) {
            if (disc.isCollected) {
                pins.collected.push(
                    new Feature(new Point([disc.location.lng, disc.location.lat]))
                );
            } else if (disc.isTargeted) {
                pins.targeted.push(
                    new Feature(new Point([disc.location.lng, disc.location.lat]))
                );
            } else {
                pins.default.push(
                    new Feature(new Point([disc.location.lng, disc.location.lat]))
                );
            }
        },

        changeTileLayer(elm) {
            // Removing the previously drawn
            const prevLayers = this.mainMap.getLayers();
            while (prevLayers.getLength() > 0) {
                this.mainMap.removeLayer(prevLayers.pop());
                console.log("one layer removed!");
            }

            if (elm.value === "osm") {
                const osmLayer = new layerGroup({
                    layers: [
                        new TileLayer({
                            source: new OSM()
                        })
                    ]
                });

                this.mainMap.setLayerGroup(osmLayer);
                elm.value = "stamen";
                this.showPins();
            } else /* (elm.value === "stamen") */ {
                const stamenLayer = new layerGroup({
                    layers: [
                        new TileLayer({
                            source: new Stamen({ layer: "toner-lite" }),
                        }),
                    ]
                });

                this.mainMap.setLayerGroup(stamenLayer);
                elm.value = "osm";
                this.showPins();
            }
        }
    },
};
</script>

<style scoped>
#changeStyleButton, #settingsButton {
    position: absolute;
    right: 10px;
    --background: var(--toolbar-purple);
    --background-activated: lightgrey;
    color: grey;
    width: 50px;
    height: 50px;
    font-size: 12px;
    --border-radius: 15px;
}

#changeStyleButton {
    bottom: 12%;
}

#settingsButton {
    bottom: 20%;
}
</style>

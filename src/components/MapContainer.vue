<template>
    <div id="map" class="map"></div>

    <ion-button id="settingsButton">
        <ion-icon :icon="funnelIcon"></ion-icon>
    </ion-button>

    <ion-button @click="changeTileLayer()" id="changeStyleButton">
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
import { UserData } from "@/internal/databases/UserData";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Utils from "@/internal/Utils";


function insertAllPins(destination, listsOfDiscoveries) {
    for (const list of listsOfDiscoveries) {
        for (const discovery of list) {
            const feature = new Feature({
                geometry: new Point([discovery.location.lng, discovery.location.lat]),
                dType: discovery.dType
            });
            destination.getSource().addFeature(feature);
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
            brushIcon, funnelIcon,
        }
    },

    mounted() {
        this.myMap();
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

        // showPins(discoveries=[]) {
        //     this.mainMap.addLayer(vLayers.artworkDefault);
        //     this.mainMap.addLayer(vLayers.artworkCollected);
        //     this.mainMap.addLayer(vLayers.artworkTargeted);
        //     this.mainMap.addLayer(vLayers.placeDefault);
        //     this.mainMap.addLayer(vLayers.placeCollected);
        //     this.mainMap.addLayer(vLayers.placeTargeted);
        //     this.mainMap.addLayer(vLayers.heritageDefault);
        //     this.mainMap.addLayer(vLayers.heritageCollected);
        //     this.mainMap.addLayer(vLayers.heritageTargeted);
        //
        //     const artworkPins = { default: [], collected: [], targeted: [] };
        //     const placePins = { default: [], collected: [], targeted: [] };
        //     const heritagePins = { default: [], collected: [], targeted: [] };
        //
        //     // If no specific discovery was passed as argument, must show all pins
        //     if (discoveries.length === 0) {
        //         for (const artwork of ArtworkDatabase.data) {
        //             this.insertPin(artwork, artworkPins);
        //         }
        //
        //         for (const place of PlaceDatabase.data) {
        //             this.insertPin(place, placePins);
        //         }
        //
        //         for (const heritage of HeritageDatabase.data) {
        //             this.insertPin(heritage, heritagePins);
        //         }
        //     } else {  // If we only want to show specific discoveries
        //         for (const disc of discoveries) {
        //             switch (disc.type) {
        //                 case "artwork": {
        //                     this.insertPin(disc, artworkPins);
        //                     break;
        //                 }
        //
        //                 case "place": {
        //                     this.insertPin(disc, placePins);
        //                     break;
        //                 }
        //
        //                 case "heritage": {
        //                     this.insertPin(disc, heritagePins);
        //                     break;
        //                 }
        //             }
        //         }
        //     }
        //
        //     vLayers.artworkDefault.getSource().addFeatures(artworkPins.default);
        //     vLayers.artworkCollected.getSource().addFeatures(artworkPins.collected);
        //     vLayers.placeTargeted.getSource().addFeatures(artworkPins.targeted);
        //     vLayers.placeDefault.getSource().addFeatures(placePins.default);
        //     vLayers.placeCollected.getSource().addFeatures(placePins.collected);
        //     vLayers.placeTargeted.getSource().addFeatures(placePins.targeted);
        //     vLayers.heritageDefault.getSource().addFeatures(heritagePins.default);
        //     vLayers.heritageCollected.getSource().addFeatures(heritagePins.collected);
        //     vLayers.heritageTargeted.getSource().addFeatures(heritagePins.targeted);
        // },

        // insertPin(discovery, pins) {
        //     const feature = new Feature({
        //         geometry: new Point([discovery.location.lng, discovery.location.lat]),
        //         dType: discovery.dType
        //     })
        //
        //     if (discovery.isCollected) {
        //         pins.collected.push(feature);
        //     } else if (discovery.isTargeted) {
        //         pins.targeted.push(feature);
        //     } else {
        //         pins.default.push(feature);
        //     }
        // },

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

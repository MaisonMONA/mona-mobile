<template>
    <div id="map" class="map"></div>
</template>

<script>
import "ol/ol.css"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile";
import { useGeographic } from "ol/proj";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Stamen } from "ol/source";


export default {
    name: "MapContainer",
    data() {
        return {
            mainMap: null,
            INITAL_COORD: [-73.6, 45.5],  // Defaults coordinates are on Montreal
            DEFAULT_ZOOM_LEVEL: 14,
        };
    },
    mounted() {
        this.myMap();
    },
    methods: {
        myMap() {
            useGeographic();
            this.mainMap = new Map({
                // Select tile styles in `layers`
                layers: [
                    // Tile style (purely decorative)
                    new TileLayer({
                        source: new Stamen({ layer: "toner-lite" }),
                    }),
                    
                    // Add more here as needed
                ],

                target: "map",
                view: new View({
                    center: this.INITAL_COORD,
                    zoom: this.DEFAULT_ZOOM_LEVEL,
                
                    // Disabling rotation on the map
                    enableRotation: false
                }),
            });
        
            const source = new VectorSource();
            const features = [new Feature(new Point(this.INITAL_COORD))];
            source.addFeatures(features);
            const layer = new VectorLayer({ source: source });
            this.mainMap.addLayer(layer);
        },
    },
};
</script>

<style scoped>
</style>
<template>
    <div id="map" class="map">
        <div id="popup">
            <div id="popup-content" hidden>
                <div id="popup-details">
                    <p id="popupTitle" class="details"></p>
                    <p id="popupSubtext" class="details"></p>
                </div>
                <ion-button fill="clear" id="seeMore" router-direction="forward">
                    <ion-icon slot="icon-only" :icon="arrowRightIcon"></ion-icon>
                </ion-button>
            </div>
        </div>
    </div>

    <ion-button @click="changeTileLayer" id="settings-button" class="map-button">
        <ion-icon :icon="settingsIcon"></ion-icon>
    </ion-button>

    <ion-button @click="recenterView" id="recenter-button" class="map-button">
        <ion-icon :icon="locationIcon"></ion-icon>
    </ion-button>
</template>


<script>
import "ol/ol.css"

import { arrowForward as arrowRightIcon, cogOutline } from "ionicons/icons";
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

import { UserData } from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";
import { useRoute } from "vue-router";
import { Icon, Style } from "ol/style";
import customLocationIcon from "@/assets/drawable/icons/location.svg"

// This variable is here to know if the user focuses a discovery or not
let hasFocus = false;


function insertAllPins(destination, list) {
    for (const discovery of list) {
        const feature = new Feature({
            geometry: new Point([discovery.location.lng, discovery.location.lat]),
            id: discovery.id,
            dType: discovery.dType
        });
        destination.getSource().addFeature(feature);
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
            discovery = Utils.getDiscovery(parseInt(this.$route.query.id), this.$route.query.type)
            setTimeout(() => this.focusDiscovery(discovery), 250);
        }


        return {
            mainMap: null,
            INITAL_COORD: discovery ? [discovery.location.lng, discovery.location.lat] : UserData.getLocation(),
            DEFAULT_ZOOM_LEVEL: discovery ? 17 : 14,  // If the map was opened by the DOD page we want to zoom more
            TILE_LAYER: layer,
            arrowRightIcon,
            settingsIcon: cogOutline,
            locationIcon: customLocationIcon,
        }
    },

    created() {
        this.$watch(
            () => this.$route.params,
            () => {
                if (this.$route.query.type && this.$route.query.id) {
                    const discovery = Utils.getDiscovery(parseInt(this.$route.query.id), this.$route.query.type);
                    this.focusDiscovery(discovery);
                }
            },
        )
        this.renderMap();
    },

    mounted() {
        this.myMap();
    },

    methods: {
        myMap() {
            //useGeographic();
            this.mainMap = new Map({
                // Hiding attribution (yes it's immoral)
                controls: defaultControls({ attribution: false }),

                target: "map",
                view: new View({
                    center: this.INITAL_COORD,
                    zoom: this.DEFAULT_ZOOM_LEVEL,

                    // Disable rotation on map
                    enableRotation: false,
                }),

                layers: [ this.TILE_LAYER ],
            });

            this.mainMap.on("singleclick", this.handleMapClick)
            this.mainMap.on("movestart", this.unfocusDiscovery)

            this.showPins();
            this.showLocation();
        },
        renderMap(){
            this.myMap();
            const route = useRoute();
            const dType = route.params.dType;
            const id = route.params.id;
            if (dType && id) {
                const discovery = Utils.getDiscovery(parseInt(id.toString()), dType.toString());
                this.focusDiscovery(discovery);
            }

        },
        showPins(discoveries=[]) {
            const pinsLayer = new VectorLayer({
                source: new VectorSource(),
                style: Utils.pinStyleFunction
            });

            if (discoveries.length > 0) {
                insertAllPins(pinsLayer, discoveries);
            } else {
                insertAllPins(pinsLayer, UserData.getSortedDiscoveries());
            }

            this.mainMap.addLayer(pinsLayer);
        },

        showLocation() {
            const locationLayer = new VectorLayer({
                source: new VectorSource(),
                style: new Style({
                    image: new Icon({
                        anchor: [0.5, 0.5],
                        src: require(`@/assets/drawable/pins/location.png`),
                    })
                }),
            });

            const feature = new Feature({
                geometry: new Point(UserData.getLocation()),
            });
            locationLayer.getSource().addFeature(feature);

            this.mainMap.addLayer(locationLayer);

            // Update location every 5 seconds
            setInterval(() => feature.getGeometry().setCoordinates(UserData.getLocation()), 5000);
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
                UserData.setMapStyle("osm");
            }

            this.showPins();
            this.showLocation();
        },

        handleMapClick(event) {
            const features = this.mainMap.getFeaturesAtPixel(event.pixel, { hitTolerance: 10 });
            if (features.length > 0) {
                const dType = features[0].get("dType");
                const id = features[0].get("id");

                const discovery = Utils.getDiscovery(id, dType);

                if (hasFocus)
                    this.unfocusDiscovery();

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
            if (!discovery) return;

            const transitionDuration = 200;  // Unit is milliseconds

            // Center map on the pin with animation if it isn't already centered
            const mapCenter = map.getView().getCenter();
            if (mapCenter[0] !== discovery.location.lng || mapCenter[1] !== discovery.location.lat) {
                const currentZoom = map.getView().getZoom();

                map.getView().animate({
                    center: [ discovery.location.lng, discovery.location.lat ],
                    duration: transitionDuration,
                    zoom: Math.max(currentZoom, 14.25),
                    easing: easeOut
                });
            }

            const details = document.getElementById("popup-content");

            // Show popup AFTER the view was centered
            setTimeout(() => {
                const elem = document.getElementById("popup");
                elem.classList.add("activated");
            }, transitionDuration);

            // Show content of popup AFTER the popup was shown
            setTimeout(() => {
                const title = discovery.getTitle()
                const subtext = discovery.dType === "artwork" ? discovery.getArtists() : discovery.getUsages();

                let type;
                if (discovery.dType === "artwork") type = 0;
                else if (discovery.dType === "place") type = 1;
                else /* if (discovery.dType === "heritage") */ type = 2;

                // Setting the button's redirection
                const button = document.getElementById("seeMore");
                button.onclick = () => this.$router.push({ path: `/discovery-details/${type}/${discovery.id}` });

                document.getElementById("popupTitle").innerHTML = title
                document.getElementById("popupSubtext").innerHTML = subtext.length > 0 ? subtext : "Inconnu";
                details.hidden = false;
            }, transitionDuration + 100);
        },

        unfocusDiscovery() {
            const details = document.getElementById("popup-content");
            const elem = document.getElementById("popup");

            details.hidden = true;
            elem.classList.remove("activated");
        },

        recenterView() {
            const mapView = this.mainMap.getView();

            mapView.animate({
                center: UserData.getLocation(),
                duration: 200,
                zoom: Math.max(mapView.getZoom(), 14.25),
                easing: easeOut
            });
        }
    },
};
</script>

<style scoped>
@import url("@/theme/Map.css");
</style>

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Icon, Style } from "ol/style";

const artworkDoD = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/artwork/default.png"),
            scale: 0.5
        })
    })
});

const placeDoD = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/place/default.png"),
            scale: 0.5
        })
    })
});

const heritageDoD = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/heritage/default.png"),
            scale: 0.5
        })
    })
});


const artworkDefault = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/artwork/default.png"),
            scale: 0.5
        })
    })
});

const placeDefault = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/place/default.png"),
            scale: 0.5
        })
    })
});

const heritageDefault = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/heritage/default.png"),
            scale: 0.5
        })
    })
});

const artworkCollected = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/artwork/collected.png"),
            scale: 0.5
        })
    })
});

const placeCollected = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/place/collected.png"),
            scale: 0.5
        })
    })
});

const heritageCollected = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/heritage/collected.png"),
            scale: 0.5
        })
    })
});

const artworkTargeted = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/artwork/targeted.png"),
            scale: 0.5
        })
    })
});

const placeTargeted = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/place/targeted.png"),
            scale: 0.5
        })
    })
});

const heritageTargeted = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require("@/assets/drawable/pins/heritage/targeted.png"),
            scale: 0.5
        })
    })
});

export default {
    artworkDefault, artworkCollected, artworkTargeted,
    placeDefault, placeCollected, placeTargeted,
    heritageDefault, heritageCollected, heritageTargeted,

    artworkDoD, placeDoD, heritageDoD,
}

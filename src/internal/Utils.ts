import { Camera, CameraResultType, Photo } from "@capacitor/camera";
import { Directory, Filesystem } from "@capacitor/filesystem";
import Feature from "ol/Feature";
import { Icon, Style } from "ol/style";

import { Discovery, DiscoveryEnum } from "@/internal/Types";
import { RNG } from "@/internal/RNG";
import { UserData } from "@/internal/databases/UserData";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import Globals from "@/internal/Globals";
//TODO: find out why images are not displayed

const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
});

const resizeImage = (base64Str: string, MAX_WIDTH: number, MAX_HEIGHT: number): Promise<string> => {
    /**
     * Scales down a base64 image and returns a promise with the new base64 thumbnail.
     * Source: https://gist.github.com/ORESoftware/ba5d03f3e1826dc15d5ad2bcec37f7bf#gistcomment-3014639
     *
     * @param base64Str - input full size image
     * @param MAX_WIDTH - the max output width
     * @param MAX_HEIGHT - the max output height
     *
     * @return a promise that resolves to the output base64
     */

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL());
            } else {
                reject("Could not make ");
            }
        }
    })
}

const downloadImage = async (id: number | string, type: string, filename: string) => {
    /**
     * Download the image posted by the current user (identification with their token).
     *
     * @param id - ID of the discovery
     * @param type - type of the discovery (singular, ie: 'artwork')
     * @param filename - name to give to the downloaded image
     * @return path of the image in Directory.Data
     */

    const blob = await fetch(Globals.apiRoutes.getPhotos + `?discovery_id=${id}&type=${type}`, {
        headers: {
            "Authorization": "Bearer " + UserData.getToken()
        }
    })
    .then(response => response.blob());

    const base64Data = await convertBlobToBase64(blob) as string;

    await Filesystem.writeFile({
        path: "img/" + filename,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
    }).catch((err) => {
        throw new Error(`Could not write downloaded image (${err})`);
    });

    // Generating thumbnail
    await Filesystem.writeFile({
        path: "thumbnail/" + filename,
        data: await resizeImage(base64Data, 250, 250),
        directory: Directory.Data,
        recursive: true
    }).catch((err) => {
        throw new Error(`Could not make a thumbnail out of image (${err})`);
    });

    return filename;
}


export default {
    async takePicture(): Promise<Photo | null> {
        /**
         * Takes a pucture from the phone camera using its default
         * interface.
         *
         * @return a Photo object, or null if no photo were taken
         */

        try {
            return await Camera.getPhoto({
                quality: 30,  // TODO: increase this number when the server will accept bigger files
                correctOrientation: true,
                allowEditing: false,
                resultType: CameraResultType.Uri
            });
        } catch (err) {
            return null;  // Skip if the user cancelled
        }
    },

    async savePicture(img: Photo): Promise<string> {
        /**
         * Attempts to store the image in storage
         *
         *  @param img - Photo file (probably from `takePicture`)
         *  @return the name of the created file's name
         */

        if (!img.webPath)
            throw new Error("Invalid webpath");

        const blob = await fetch(img.webPath).then(res => res.blob());
        const base64Data = await convertBlobToBase64(blob) as string;

        // Generating unique file name
        const random = new RNG();
        const filename = random.randomString(32) + '.' + img.format;

        await Filesystem.writeFile({
            path: "img/" + filename,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
        });

        // Generating thumbnail
        await Filesystem.writeFile({
            path: "thumbnail/" + filename,
            data: await resizeImage(base64Data, 250, 250),
            directory: Directory.Data,
            recursive: true
        }).catch((err) => {
            throw new Error(`Could not make a thumbnail out of image (${err})`);
        });

        return filename;
    },

    async sendPictureAndDetails(id: number, type: number | string) {
        /**
         * Attempts to upload the collected discovery to the server. If the
         * upload is successful, removes the item from the user's pending uploads.
         *
         * @param id - ID of the discovery to be uploaded
         * @param type - type of the discovery to be uploaded
         */
        const { filename, rating, comment } = UserData.getCollected(id, type);

        const image = await Filesystem.readFile({
            path: "img/" + filename,
            directory: Directory.Data,
        });

        const base64Res = await fetch(`data:image/${filename.split('.')[1]};base64,${image.data}`);
        const blob = await base64Res.blob();

        // Creating form for the POST request
        const formData = new FormData();
        formData.append("id", id.toString());
        formData.append("comment", comment);
        formData.append("rating", rating.toString());
        formData.append("photo", blob);

        let url;
        if (type === "artwork" || type === "artworks" || type === DiscoveryEnum.ARTWORK)
            url = Globals.apiRoutes.artworks.upload;
        else if (type === "place" || type === "places" || type === DiscoveryEnum.PLACE)
            url = Globals.apiRoutes.places.upload;
        else if (type === "heritage" || type === "heritages" || type === DiscoveryEnum.HERITAGE)
            url = Globals.apiRoutes.heritages.upload;
        else throw new Error("Invalid type");

        fetch(url, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${UserData.getToken()}`,
            }
        })
        .then((response) => {
            if (response.ok) {
                console.log(`Successfully uploaded image (code ${response.status})`);
                UserData.removePendingUpload(id, type);
            } else {
                response.json().then((json) => {
                    console.log(`UPLOAD ERR: code ${response.status}, content: ${JSON.stringify(json)}`);
                })
            }
        })

        .catch((err) => {
            console.log(`Could not make POST request (${err})`)
        });
    },

    getDiscovery(id: number, type: number | string): Discovery | null {
        /**
         * Simple utility function that returns the discovery associated
         * with ID with type being flexible.
         *
         * @param id - the ID of the discovery
         * @param type - the type of the discovery
         * @return a Discovery object (Artwork, Place, Heritage)
         */

        switch (type) {
            case "artwork": case "artworks": case DiscoveryEnum.ARTWORK: {
                return ArtworkDatabase.getFromId(id);
            }
            case "place": case "places": case DiscoveryEnum.PLACE: {
                return PlaceDatabase.getFromId(id);
            }
            case "heritage": case "heritages": case DiscoveryEnum.HERITAGE: {
                return HeritageDatabase.getFromId(id);
            }
            default:
                throw new Error(`Invalid type "${type}"`);
        }
    },

    pinStyleFunction(feature: Feature) {
        /**
         * Style function for OSM Features (used for pins on the map).
         * Not supposed to be called manually, but rather assigned or referenced.
         *
         * @param feature - the pin feature
         * @return a new style
         */

        const id = feature.get("id");
        const type = feature.get("dType");

        let status;
        if (UserData.isCollected(id, type))
            status = "collected";
        else if (UserData.isTargeted(id, type))
            status = "targeted"
        else
            status = "default";

        const style = new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: `@/assets/drawable/pins/${type}/${status}.png`,
                scale: 0.5,
            })
        });

        return [style];
    },

    async fetchUserDataOnEndpoint(url: string, type: string) {
        /**
         * Download the user's collection on the given endpoint, including the
         * photos they've taken.
         *
         * @param url - endpoint (ie: url for the heritage endpoint)
         * @param type - the endpoint type (ie: 'heritage'), used to interact with DBs.
         */

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + UserData.getToken()
            }
        });

        const parsed = await response.json();

        // Add each discovery as collected
        for (const element of parsed) {
            const id = parseInt(element.artwork_id || element.place_id || element.heritage_id);
            const discovery = this.getDiscovery(id, type);
            if (!discovery)
                throw new Error(`Discovery (${type} ${id}) does not exist in DB.`);

            const rating = element.rating ? element.rating : null;
            const comment = element.comment ? element.comment : null;

            let filename = null;
            if (element.photo) {
                filename = element.photo.split('/').at(-1);

                // Only download the file if the name is valid (i.e. the file isn't a PHP temp file)
                if (filename.includes('.'))
                    await downloadImage(element.artwork_id || element.place_id || element.heritage_id, type, filename);
                else
                    filename = null;  // Reset if the file is invalid
            }

            UserData.addCollected(discovery, filename, rating, comment);
        }
    }
}

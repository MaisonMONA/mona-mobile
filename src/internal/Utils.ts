import { Camera, CameraResultType, Photo } from "@capacitor/camera";
import { Directory, Filesystem } from "@capacitor/filesystem";
import Feature from "ol/Feature";
import { Icon, Style } from "ol/style";

import { DiscoveryEnum } from "@/internal/Types";
import { RNG } from "@/internal/RNG";
import { UserData } from "@/internal/databases/UserData";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import Globals from "@/internal/Globals";


const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
});


const downloadImage = async (id: number | string, type: string, filename: string) => {
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
    });

    // TODO: create a thumbnail with lower resolution (maybe npmjs.com/package/sharp?)

    return "img/" + filename
}


export default {
    async takePicture(): Promise<Photo | null> {
        try {
            return await Camera.getPhoto({
                quality: 100,
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
         * Attempts to store the image in storage.
         *
         * Resources used:
         *  - https://devdactic.com/ionic-image-upload-capacitor
         *
         *  @param img - Photo file
         *  @return the name of the file, if created
         */
        if (!img.webPath) throw new Error("Invalid webpath");

        const blob = await fetch(img.webPath).then(res => res.blob());
        const base64Data = await convertBlobToBase64(blob) as string;

        const random = new RNG(Date.now())
        const filename = `${random.randomString(32)}.${img.format}`;

        await Filesystem.writeFile({
            path: "img/" + filename,
            data: base64Data,
            directory: Directory.Data,
            recursive: true
        });

        return filename;
    },

    async sendPictureAndDetails(id: number, type: number | string) {
        /**
         * Attempts to upload the collected discovery to the server. If
         * the upload is successful, removes the item from pending uploads.
         *
         * Resources used:
         *  - https://devdactic.com/ionic-image-upload-capacitor
         *  - https://github.com/ionic-team/capacitor/issues/833
         *
         * @param id - ID of the discovery to be uploaded
         * @param type - type of the discovery to be uploaded
         */
        const { imagepath, rating, comment } = UserData.getCollected(id, type);

        const image = await Filesystem.readFile({
            path: imagepath,
            directory: Directory.Data,
        });

        const base64Res = await fetch(`data:image/${imagepath.split('.')[1]};base64,${image.data}`);
        const blob = await base64Res.blob();

        const formData = new FormData();
        formData.append("id", id.toString());
        formData.append("comment", comment);
        formData.append("rating", rating.toString());
        formData.append("photo", blob);

        let url;
        switch (type) {
            case DiscoveryEnum.ARTWORK: case "artworks": case "artwork": {
                url = Globals.apiRoutes.artworks.upload;
                break;
            }
            case DiscoveryEnum.PLACE: case "places": case "place": {
                url = Globals.apiRoutes.places.upload;
                break;
            }
            case DiscoveryEnum.HERITAGE: case "heritages": case "heritage": {
                url = Globals.apiRoutes.heritages.upload;
                break;
            }
            default: throw new Error("Invalid type");
        }

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
                console.log("ERR: " + response.status)
            }
        })

        .catch((err) => {
            console.log(`Could not make POST request (${err})`)
        });
    },

    getDiscovery(id: number, type: number | string) {
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
            default:
                throw new Error("Invalid type");
        }
    },

    styleFunction(feature: Feature) {
        const id = feature.get("id");
        const type = feature.get("dType");

        let status;
        if (UserData.isCollected(id, type)) {
            status = "collected";
        } else if (UserData.isTargeted(id, type)) {
            status = "targeted"
        } else {
            status = "default";
        }

        const style = new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: require(`@/assets/drawable/pins/${type}/${status}.png`),
                scale: 0.5
            })
        });

        return [style];
    },

    async fetchUserDataOnEndpoint(url: string, type: string) {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + UserData.getToken()
            }
        });

        const parsed = await response.json();

        // Add each discovery to collected
        for (const element of parsed) {
            const discovery = this.getDiscovery(parseInt(element.artwork_id || element.place_id || element.heritage_id), type);
            if (!discovery) throw new Error("This discovery does not exist.");

            const rating = element.rating ? element.rating : null;
            const comment = element.comment ? element.comment : null;

            let imagepath = null;
            if (element.photo) {
                const filename = element.photo.split('/').at(-1);

                imagepath = await downloadImage(element.artwork_id || element.place_id || element.heritage_id, type, filename);
            }

            UserData.addCollected(discovery, imagepath, rating, comment);
        }
    }
}

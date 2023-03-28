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


const downloadImage = async (link: string, filename: string) => {
    const blob = await fetch(link, { headers: { "Content-Type": "multipart/form-data" } })
        .then(response => response.blob());
    const base64Data = await convertBlobToBase64(blob) as string;

    await Filesystem.writeFile({
        path: "img/" + filename,
        data: base64Data,
        directory: Directory.Data,
        recursive: true
    });

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

    async sendPictureAndDetails(id: number, type: number) {
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
        if (type === DiscoveryEnum.ARTWORK)            url = Globals.apiRoutes.artworks.upload;
        else if (type === DiscoveryEnum.PLACE)         url = Globals.apiRoutes.places.upload;
        else /* if (type == DiscoveryEnum.HERITAGE) */ url = Globals.apiRoutes.heritages.upload;

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
        // return;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + UserData.getToken()
            }
        });

        const parsed = await response.json();

        // Add each discovery to collected
        for (const element of parsed) {
            let discovery;
            if (type === "artworks") discovery = this.getDiscovery(element.artwork_id, type);
            else if (type === "places") discovery = this.getDiscovery(element.place_id, type);
            else /* (type === "heritages") */ discovery = this.getDiscovery(element.heritage_id, type);
            const rating = element.rating ? element.rating : null;
            const comment = element.comment ? element.comment : null;

            const imagepath = null;
            // TODO below: the server needs to open a new API endpoint serving each photo (see "CORS" on Google)
            // if (element.photo) {
            //     const path = element.photo.split('/');
            //     const imageurl = Globals.apiRoutes.photos + '/' + path.slice(1).join('/')
            //     const filename = path.at(-1);
            //
            //     imagepath = await downloadImage(imageurl, filename);
            // }

            UserData.addCollected(discovery, imagepath, rating, comment);
        }
    }
}

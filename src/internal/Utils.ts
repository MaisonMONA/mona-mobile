import { Camera, CameraResultType, Photo } from "@capacitor/camera";
import { Directory, Filesystem } from "@capacitor/filesystem";
import Feature from "ol/Feature";
import { Icon, Style } from "ol/style";

import { DiscoveryEnum } from "@/internal/Types";
import { RNG } from "@/internal/RNG";
import { UserData } from "@/internal/databases/UserData";


const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
});


export default {
    apiRoutes: {
        "base": "https://picasso.iro.umontreal.ca/~mona/api/v3/",
        "artworks": {
            download: "https://picasso.iro.umontreal.ca/~mona/api/v3/artworks",
            upload: "https://picasso.iro.umontreal.ca/~mona/api/v3/user/artworks",
        },
        "places": {
            download: "https://picasso.iro.umontreal.ca/~mona/api/v3/places",
            upload: "https://picasso.iro.umontreal.ca/~mona/api/v3/user/places",
        },
        "heritages": {
            download: "https://picasso.iro.umontreal.ca/~mona/api/v3/heritages",
            upload: "https://picasso.iro.umontreal.ca/~mona/api/v3/user/heritages",
        },
        "badges": {
            download: "https://picasso.iro.umontreal.ca/~mona/api/v3/badges",
            upload: "https://picasso.iro.umontreal.ca/~mona/api/v3/user/badges",
        }
    },

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
        if (type === DiscoveryEnum.ARTWORK) {
            url = this.apiRoutes.artworks.upload
        } else if (type === DiscoveryEnum.PLACE) {
            url = this.apiRoutes.places.upload
        } else /* if (type == DiscoveryEnum.HERITAGE) */ {
            url = this.apiRoutes.heritages.upload
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
}

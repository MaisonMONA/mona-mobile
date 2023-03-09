import { Camera, CameraResultType, Photo } from "@capacitor/camera";
import { RNG } from "@/internal/RNG";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { UserData } from "@/internal/databases/UserData";
import { DiscoveryEnum } from "@/internal/Types";

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
                allowEditing: true,
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

        const data = await fetch(img.webPath).then(response => response.text());
        const random = new RNG(Date.now())
        const filename = random.randomString(32) + ".jpg";

        await Filesystem.writeFile({
            path: "img/" + filename,
            data: data,
            directory: Directory.Data,
            encoding: Encoding.ASCII,
            recursive: true
        });

        return filename;
    },

    async sendPictureAndDetails(id: number, type: number) {
        /**
         * NOT WORKING
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
            // encoding: Encoding.UTF8
        });

        const formData = new FormData();
        formData.append("id", id.toString());
        formData.append("comment", comment);
        formData.append("rating", rating.toString());
        formData.append("photo", image.data);

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
                "Authorization": "Bearer F5ZC5vtiJ0EOnpMiZtwPODc1Y35VmY2h6iGk4W7fQraxmlcmUo4BBnTLD8wn",
                "content-type": "multipart/form-data"
            }
        })
        .then((response) => {
            if (response.ok) {
                UserData.removePendingUpload(id, type);
            } else {
                console.log("ERR: " + response.status)
            }
        })

        .catch((err) => {
            console.log(`Could not make POST request (${err})`)
        })
    }
}

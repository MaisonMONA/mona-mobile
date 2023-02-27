import Globals from "@/internal/Globals";

import { Artwork } from "@/internal/Types"
import { Directory, Encoding, Filesystem, WriteFileResult } from "@capacitor/filesystem";
import { ArtworkFactory } from "@/internal/Factories";
import { Database } from "@/internal/databases/Database";

export class ArtworkDatabase extends Database {
    protected static data: Array<Artwork> = [];
    private static path = "appdata/artworks.json";
    private static type = Artwork;

    public static async populate(): Promise<void> {
        // Do not reload all data if it exists already
        if (ArtworkDatabase.data.length > 0) return;

        console.log("ARTWORKDB: populating...");

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: ArtworkDatabase.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            const parsed = JSON.parse(content.data);
            for (const artwork of parsed.data) {
                ArtworkDatabase.data.push(ArtworkFactory.createArtwork(artwork));
            }

            console.log("ARTWORKDB: successfully populated database.");
        } catch (e) {
            console.log(`ARTWORKDB: error when parsing data from ${ArtworkDatabase.path} (${e}).`);
            await ArtworkDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
        try {
            response = await fetch(Globals.apiRoutes.artworks);
        } catch (e) {
            // Request was not made successfully (ex: no internet)
            console.log(`ARTWORKDB: could not make request to the server (${e})`);
            return;
        }

        // Request request was made successfully
        if (response.ok) {
            console.log("ARTWORKDB: data successfully fetched from the server.");

            content = await response.text();
            for (const artwork of JSON.parse(content).data) {
                ArtworkDatabase.data.push(ArtworkFactory.createArtwork(artwork));
            }

            // Sorting the data by element ID
            ArtworkDatabase.data.sort((element1, element2) => element1.id - element2.id);
        } else {
            console.log("ARTWORKSDB: Invalid status code.");
            return;
        }

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: ArtworkDatabase.path,
            data: content,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .then((result: WriteFileResult) => {
            console.log(`ARTWOKDB: downloaded file saved in storage at path ${result.uri}.`);
        })

        .catch((reason) => {
            console.log(`ARTWORKDB: failed to write file (${reason}).`);
        })
    }

    public static getFromId(id: number): Artwork {
        try {
            return super.getFromId(id) as Artwork;
        } catch (e) {
            throw new Error(`ARTWORKDB ${e}`)
        }
    }
}

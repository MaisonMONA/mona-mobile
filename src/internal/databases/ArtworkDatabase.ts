import Globals from "@/internal/Globals";

import { Artwork } from "@/internal/Types"
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { ArtworkFactory } from "@/internal/Factories";

export class ArtworkDatabase {
    private static data: Array<Artwork> = [];
    private static path = "appdata/artworks.json";

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

            this.data = JSON.parse(content.toString());

            console.log("ARTWORKDB: successfully populated database.");
        } catch (e) {
            console.log(`ARTWORKDB: ${ArtworkDatabase.path} does not exist (${e}).`);
            await ArtworkDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response;
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

            const content = await response.json();
            for (const artwork of content.data) {
                // Casting each of them including the artists
                ArtworkDatabase.data.push(ArtworkFactory.createArtwork(artwork));
            }
        }

        // Write the newly downloaded file
        await Filesystem.writeFile({
            path: ArtworkDatabase.path,
            data: this.data.toString(),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        });
    }

    public static getFromId(id: number): Artwork {
        if (id >= ArtworkDatabase.data.length) {
            throw new Error("ARTWORKDB: id out of range");
        }

        return ArtworkDatabase.data[id - 1];
    }

    public static getSize(): number {
        return ArtworkDatabase.data.length
    }
}

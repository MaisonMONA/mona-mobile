import Globals from "@/internal/Globals";

import { Place } from "@/internal/Types"
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export class PlaceDatabase {
    private static data: Array<Place> = [];
    private static path = "appdata/places.json";

    static async populate(): Promise<void> {
        // Do not reload all data if it exists already
        if (PlaceDatabase.data.length > 0) return;

        console.log("PLACEDB: populating...");

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: PlaceDatabase.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            this.data = JSON.parse(content.toString());

            console.log("PLACEDB: successfully populated databse.");
        } catch (e) {
            console.log(`PLACEDB: ${PlaceDatabase.path} does not exist (${e}).`);
            await PlaceDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response;
        try {
            response = await fetch(Globals.apiRoutes.places);
        } catch (e) {
            // Request was not made successfully (ex: no internet)
            console.log(`PLACEDB: could not make request to the server (${e})`);
            return;
        }

        // Request request was made successfully
        if (response.ok) {
            console.log("PLACEDB: data successfully fetched from the server.");

            const content = await response.json();
            for (const place of content.data) {
                PlaceDatabase.data.push(place as Place);
            }
        }

        // Write the newly downloaded file
        await Filesystem.writeFile({
            path: PlaceDatabase.path,
            data: this.data.toString(),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        });
    }

    public static getFromId(id: number): Place {
        if (id >= PlaceDatabase.data.length) {
            throw new Error("PLACEDB: id out of range");
        }

        return PlaceDatabase.data[id - 1];
    }

    public static getSize(): number {
        return PlaceDatabase.data.length
    }
}

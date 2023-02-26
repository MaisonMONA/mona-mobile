import Globals from "@/internal/Globals";

import { Place } from "@/internal/Types"
import {Directory, Encoding, Filesystem, WriteFileResult} from "@capacitor/filesystem";
import {PlaceFactory} from "@/internal/Factories";

export class PlaceDatabase {
    private static data: Array<Place> = [];
    private static path = "appdata/places.json";

    public static async populate(): Promise<void> {
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

            const parsed = JSON.parse(content.data);
            for (const place of parsed.data) {
                PlaceDatabase.data.push(PlaceFactory.createPlace(place));
            }

            console.log("PLACEDB: successfully populated databse.");
        } catch (e) {
            console.log(`PLACEDB: ${PlaceDatabase.path} does not exist (${e}).`);
            await PlaceDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
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

            content = await response.text();
            for (const place of JSON.parse(content).data) {
                PlaceDatabase.data.push(PlaceFactory.createPlace(place));
            }

            // Sorting the data by element ID
            PlaceDatabase.data.sort((element1, element2) => element1.id - element2.id);
        } else {
            console.log("PLACEDB: Invalid status code.");
            return;
        }

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: PlaceDatabase.path,
            data: content,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .then((result: WriteFileResult) => {
            console.log(`PLACEDB: downloaded file saved in storage at path ${result.uri}.`);
        })

        .catch((reason) => {
            console.log(`PLACEDB: failed to write file (${reason}).`);
        })
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

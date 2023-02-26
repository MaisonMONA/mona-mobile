import Globals from "@/internal/Globals";

import { Heritage } from "@/internal/Types"
import {Directory, Encoding, Filesystem, WriteFileResult} from "@capacitor/filesystem";

export class HeritageDatabase {
    private static data: Array<Heritage> = [];
    private static path = "appdata/heritages.json";

    public static async populate(): Promise<void> {
        // Do not reload all data if it exists already
        if (HeritageDatabase.data.length > 0) return;

        console.log("HERITAGEDB: populating...");

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: HeritageDatabase.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            const parsed = JSON.parse(content.data);
            for (const heritage of parsed.data) {
                HeritageDatabase.data.push(heritage as Heritage);
            }

            console.log("HERITAGEDB: successfully populated database.");
        } catch (e) {
            console.log(`HERITAGEDB: ${HeritageDatabase.path} does not exist (${e}).`);
            await HeritageDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
        try {
            response = await fetch(Globals.apiRoutes.heritages);
        } catch (e) {
            // Request was not made successfully (ex: no internet)
            console.log(`HERITAGEDB: could not make request to the server (${e})`);
            return;
        }

        // Request request was made successfully
        if (response.ok) {
            console.log("HERITAGEDB: data successfully fetched from the server.");

            content = await response.text();
            for (const heritage of JSON.parse(content).data) {
                HeritageDatabase.data.push(heritage as Heritage);
            }

            // Sorting the data by element ID
            HeritageDatabase.data.sort((element1, element2) => element1.id - element2.id);
        } else {
            console.log("HERTITAGEDB: Invalid status code.");
            return;
        }

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: HeritageDatabase.path,
            data: content,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .then((result: WriteFileResult) => {
            console.log(`HERITAGEDB: downloaded file saved in storage at path ${result.uri}.`);
        })

        .catch((reason) => {
            console.log(`HERITAGEDB: failed to write file (${reason}).`);
        })
    }


    public static getFromId(id: number): Heritage {
        if (id >= HeritageDatabase.data.length) {
            throw new Error("HERITAGEDB: id out of range");
        }

        return HeritageDatabase.data[id - 1];
    }

    public static getSize(): number {
        return HeritageDatabase.data.length
    }
}

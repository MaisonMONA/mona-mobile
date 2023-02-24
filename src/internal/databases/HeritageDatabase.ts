import Globals from "@/internal/Globals";

import { Heritage } from "@/internal/Types"
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export class HeritageDatabase {
    private static data: Array<Heritage> = [];
    private static path = "appdata/heritages.json";

    static async populate(): Promise<void> {
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

            this.data = JSON.parse(content.toString());

            console.log("HERITAGEDB: successfully populated database.");
        } catch (e) {
            console.log(`HERITAGEDB: ${HeritageDatabase.path} does not exist (${e}).`);
            await HeritageDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response;
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

            const content = await response.json();
            for (const heritage of content.data) {
                HeritageDatabase.data.push(heritage as Heritage);
            }
        }

        // Write the newly downloaded file
        await Filesystem.writeFile({
            path: HeritageDatabase.path,
            data: this.data.toString(),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        });
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

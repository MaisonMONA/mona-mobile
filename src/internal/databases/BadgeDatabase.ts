import Globals from "@/internal/Globals";

import { Badge } from "@/internal/Types"
import { Directory, Encoding, Filesystem, WriteFileResult } from "@capacitor/filesystem";
import { Database } from "@/internal/databases/Database";

export class BadgeDatabase extends Database {
    protected static data: Array<Badge> = [];
    private static path = "appdata/badges.json";

    public static async populate(): Promise<void> {
        // Do not reload all data if it exists already
        if (BadgeDatabase.data.length > 0) return;

        console.log("BADGEDB: populating...");

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: BadgeDatabase.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            const parsed = JSON.parse(content.data);
            for (const badge of parsed.data) {
                BadgeDatabase.data.push(badge as Badge);
            }

            console.log("BADGEDB: successfully populated database.");
        } catch (e) {
            console.log(`BADGEDB: ${BadgeDatabase.path} does not exist (${e}).`);
            await BadgeDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
        try {
            response = await fetch(Globals.apiRoutes.badges);
        } catch (e) {
            // Request was not made successfully (ex: no internet)
            console.log(`BADGEDB: could not make request to the server (${e})`);
            return;
        }

        // Request request was made successfully
        if (response.ok) {
            console.log("BADGEDB: data successfully fetched from the server.");

            content = await response.text();
            for (const badge of JSON.parse(content).data) {
                BadgeDatabase.data.push(badge as Badge);
            }

            // Sorting the data by element ID
            BadgeDatabase.data.sort((element1, element2) => element1.id - element2.id);
        } else {
            console.log("BADGEDB: Invalid status code.");
            return;
        }

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: BadgeDatabase.path,
            data: content,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .then((result: WriteFileResult) => {
            console.log(`BADGEDB: downloaded file saved in storage at path ${result.uri}.`);
        })

        .catch((reason) => {
            console.log(`BADGEDB: failed to write file (${reason}).`);
        })
    }


    public static getFromId(id: number): Badge {
        try {
            return super.getFromId(id) as Badge;
        } catch (e) {
            throw new Error(`BADGEDB ${e}`)
        }
    }
}

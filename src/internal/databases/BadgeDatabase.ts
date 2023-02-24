import Globals from "@/internal/Globals";

import { Badge } from "@/internal/Types"
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export class BadgeDatabase {
    private static data: Array<Badge> = [];
    private static path = "appdata/badges.json";

    static async populate(): Promise<void> {
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

            this.data = JSON.parse(content.toString());

            console.log("BADGEDB: successfully populated database.");
        } catch (e) {
            console.log(`BADGEDB: ${BadgeDatabase.path} does not exist (${e}).`);
            await BadgeDatabase.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response;
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

            const content = await response.json();
            for (const badge of content.data) {
                BadgeDatabase.data.push(badge as Badge);
            }
        }

        // Write the newly downloaded file
        await Filesystem.writeFile({
            path: BadgeDatabase.path,
            data: this.data.toString(),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        });
    }


    public static getFromId(id: number): Badge {
        if (id >= BadgeDatabase.data.length) {
            throw new Error("BADGEDB: id out of range");
        }

        return BadgeDatabase.data[id - 1];
    }

    public static getSize(): number {
        return BadgeDatabase.data.length
    }
}

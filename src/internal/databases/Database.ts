import { RNG } from "@/internal/RNG";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import Globals from "@/internal/Globals";
import { Discovery } from "@/internal/Types";

export abstract class Database {
    protected static data: Array<Discovery>;
    protected static path: string;
    protected static type: string;

    protected static createSingleElement(element: any) {
        return element;
    }

    public static async populate(): Promise<void> {
        // Do not reload all data if it exists already
        if (this.data.length > 0) return;

        console.log(this.type + " db: populating...");

        // Parse data from file; if it fails, try to download from the server
        Filesystem.readFile({
            path: this.path,
            directory: Directory.Data,
            encoding: Encoding.UTF8
        })

        .then((content) => {
            const parsed = JSON.parse(content.data);
            for (const element of parsed.data) {
                this.data.push(this.createSingleElement(element));
            }

            console.log(this.type + " db: successfully populated database.");
        })

        .catch( async (err) => {
            console.log(`${this.type} db: error when parsing data from ${this.path} (${err}).`);
            await this.populateFromServer()
        })
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
        try {
            response = await fetch(Globals.apiRoutes[this.type as keyof (typeof Globals.apiRoutes)]);
        } catch (e) {
            return;
        }

        // Request request was made successfully
        if (response.ok) {
            content = await response.text();
            for (const element of JSON.parse(content).data) {
                this.data.push(this.createSingleElement(element));
            }

            // Sorting the data by element ID
            this.data.sort((element1, element2) => element1.id - element2.id);
        } else {
            return;
        }

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: this.path,
            data: content,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .catch((reason) => {
            console.log(`${this.type} db: error when writing file (${reason}).`)
        })
    }



    public static getFromId(id: number): Discovery {
        for (let i = Math.min(id, this.data.length) - 1; i >= 0; i--) {
            if (this.data[i].id == id) {
                return this.data[i];
            }
        }

        throw new Error(`No element associated with ID=${id}.`);
    }

    public static getSize() {
        return this.data.length;
    }

    public static containsId(id: number): boolean {
        let i = Math.min(id, this.data.length) - 1;

        for (; i >= 0; i--) {
            if (this.data[i].id == id) {
                return true;
            }
        }

        return false;
    }

    public static getRandomItem(seed=Date.now()): Discovery {
        const rand = new RNG(seed);
        const id = rand.nextInRange(0, this.data.length - 1);
        return this.data[id];
    }
}

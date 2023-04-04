import { RNG } from "@/internal/RNG";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Discovery } from "@/internal/Types";
import Globals from "@/internal/Globals";
import { UserData } from "@/internal/databases/UserData";

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
        try {
            const content = await Filesystem.readFile({
                path: this.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            const parsed = JSON.parse(content.data);
            for (const element of parsed) {
            // for (const element of parsed.data) {
                this.data.push(this.createSingleElement(element));
            }

            console.log(`${this.type} db: successfully populated (locally).`);
        } catch (err) {
            await this.populateFromServer();
        }
    }

    private static async populateFromServer(): Promise<void> {
        let response, content;
        try {
            if (this.type == "artworks") response = await fetch(Globals.apiRoutes.artworks.download);
            else if (this.type == "places") response = await fetch(Globals.apiRoutes.places.download);
            else if (this.type == "heritages") response = await fetch(Globals.apiRoutes.heritages.download);
            else /* (this.type == "badges") */ response = await fetch(Globals.apiRoutes.artworks.download);
        } catch (e) {
            console.log("Could not fetch data from server.");
            return Promise.reject();
        }

        // Request request was made successfully
        if (response.ok) {
            content = await response.text();
            this.insertNewElements(JSON.parse(content).data)
        } else {
            return Promise.reject();
        }
    }

    public static insertNewElements(elements: any) {
        for (const element of elements) {
            const newDiscovery = this.createSingleElement(element)

            if (this.getFromId(newDiscovery.id) == null) {
                // If it exists we remove the old one before
                this.data = this.data.filter((elm: Discovery) => elm.id != newDiscovery.id)
            }

            this.data.push(newDiscovery);
        }

        // Sorting data by element ID
        this.data.sort((element1, element2) => element1.id - element2.id);

        // Write the newly downloaded file
        Filesystem.writeFile({
            path: this.path,
            data: JSON.stringify(this.data),
            directory: Directory.Data,
            encoding: Encoding.UTF8,
            recursive: true
        })

        .then(() => console.log(`${this.type} db: successfully populated (from server).`))

        UserData.setDBLastUpdate(this.type, new Date());
    }

    public static getFromId(id: number): Discovery | null {
        for (let i = Math.min(id, this.data.length) - 1; i >= 0; i--) {
            if (this.data[i].id == id) {
                return this.data[i];
            }
        }

        return null;
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

    public static getSubset(a: number, b?: number): Array<Discovery> {
        if (b == undefined)
            return this.data.slice(0, a);

        return this.data.slice(a, b);
    }
}

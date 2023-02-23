import {Directory, Encoding, Filesystem} from "@capacitor/filesystem"
import Globals from "@/internal/Globals";

export default class Database {
    // TODO: change types to their respective after creating them in Types.ts
    private static data: Array<any> = [];

    static async populate(path: string) {
        await Filesystem.mkdir({
            path: "appdata",
            directory: Directory.Data,
            recursive: true
        }).catch();  // Ignore exception for existing dir

        // Do not reload all data if it exists
        if (this.data.length > 0) return;

        try {
            const content = await Filesystem.readFile({
                path: "appdata/" + path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            });

            this.data = JSON.parse(content.toString());
        } catch (e) {
            console.log(`Provided path for database does not exist (${e}), trying to fetch from the internet...`);

            // Slicing to remove the `.json` extension
            this.data = this.populateFromInternet(path.slice(0, -5));

            // Write the newly downloaded file
            await Filesystem.writeFile({
                path: "appdata/" + path,
                data: this.data.toString(),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });
        }
    }

    static getFromId(id: number): object {
        if (id >= this.data.length) {
            return {};
        }

        return this.data[id - 1];
    }

    static getFromTitle(title: string): object {
        /*
         * Probably not very efficient, but could be useful.
         * Still, try to avoid.
         */
        for (const element of Database.data) {
            if (element.title.fr === title || element.title.en === title) {
                return element;
            }
        }

        return {};
    }

    private static populateFromInternet(endpoint: string): Array<any> {
        let data: Array<any> = [];

        fetch(Globals.apiRoutes.base + endpoint)

            // Request was made successfully
            .then(async (response) => {
                if (response.ok) {
                    console.log("Data successfully retrieved from the server");

                    const jsonContent = await response.json();
                    data = jsonContent.data as Array<any>;
                }
            })

            // Request was not made successfully (ex: no internet)
            .catch(() => {
                console.log("Could not make request to the server");
            });

        return data;
    }
}

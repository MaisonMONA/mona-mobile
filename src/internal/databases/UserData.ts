import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Discovery, Heritage } from "@/internal/Types";
import Utils from "@/internal/Utils";
import Globals from "@/internal/Globals";
import { Geolocation } from "@capacitor/geolocation";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { ArtworkFactory, PlaceFactory } from "@/internal/Factories";

type Review = {id: number, dType: string, imagepath: string, rating: number, comment: string};

export class UserData {
    private static data: any = null;
    private static path = "appdata/preferences.json";
    private static cachePath = "discoveries_sorted.json"
    private static type = "preferences";

    // The point of the attribute below is to have a full, sorted list of all
    // discoveries no matter their type. It makes some things easier, for
    // example the List tab, in order to have a alphabetically pre-sorted list
    // of discoveries. It's also useful for drawing pins on the map, to avoid
    // doing it type by type and have some pin colors completely hidden because
    // they were added first. It also gives an feeling of random.
    private static sortedDiscoveries: Array<Discovery> = [];


    public static async populate() {
        if (this.data) return;  // Do not populate twice

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: this.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            })

            this.data = JSON.parse(content.data);

            console.log(this.type + " db: successfully populated database.");
        } catch (err) {
            console.log(`${this.type} db: error when parsing data from ${this.path} (${err}).`);

            // Default user data
            this.resetPreferences();
        }
    }

    private static updateFile() {
        Filesystem.writeFile({
            path: this.path,
            data: JSON.stringify(this.data),
            directory: Directory.Data,
            encoding: Encoding.UTF8
        })
        .then(() => {
            console.log("User preferences updated successfully");
        })
        .catch((err) => {
            console.error(`Failed to update user preferences (${err})`);
        })
    }

    public static resetPreferences() {
        this.data = {
            username: '',
            token: '',
            collectedWereFetched: false,
            firstTime: true,  // TODO tutorial
            mapFocus: { id: -1, dType: 'empty', active: false },
            location: {  // Default on Montreal
                lng: -73.561668,
                lat: 45.508888
            },
            collected: {
                // To be filled with { id:, imagepath:, rating:, comment: }
                artworks: [],
                places: [],
                heritages: [],
                badges: [],

                // Holds collected discoveries no matter the type (no badge though)
                // it makes /tabs/collection easier with no performance overhead
                chronological: [],
            },
            targeted: {
                // To be filled with IDs
                artworks: [],
                places: [],
                heritages: [],
            },
            pendingUpload: {
                // To be filled with IDs, and must exist in `this.collected` for the rest of the info
                artworks: [],
                places: [],
                heritages: [],
            },
            mapStyle: "osm",
        };

        this.updateFile();
    }

    public static async getFromServer() {
        // Skip fetching the user's photos if it was done already
        if (this.data.collectedWereFetched) return;

        Promise.all([
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.artworks.upload, "artworks"),
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.places.upload, "places"),
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.heritages.upload, "heritages"),
        ])
        .then(() => {
            this.data.collectedWereFetched = true;
            this.updateFile();
        })
        .catch((err) => {
            console.log("err", err);
        });
    }

    public static async loadCache() {
        if (this.sortedDiscoveries.length !== 0) return;

        try {
            console.log("Loading cache...");
            const content = await Filesystem.readFile({
                path: this.cachePath,
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });

            const parsed = JSON.parse(content.data);
            this.sortedDiscoveries = parsed.map((discovery: any) => {
                // console.log(discovery);
                if (discovery.dType === "artwork")
                    return ArtworkFactory.createArtwork(discovery);
                else if (discovery.dType === "place")
                    return PlaceFactory.createPlace(discovery);
                else
                    return new Heritage(discovery);
            });
        } catch (err) {
            console.log("Failed to load cache, building it.");
            this.sortedDiscoveries = ArtworkDatabase.getSubset(0, ArtworkDatabase.getSize());
            this.sortedDiscoveries = this.sortedDiscoveries.concat(PlaceDatabase.getSubset(0, PlaceDatabase.getSize()));
            this.sortedDiscoveries = this.sortedDiscoveries.concat(HeritageDatabase.getSubset(0, HeritageDatabase.getSize()));

            // Sorting alphabetically
            const collator = new Intl.Collator("fr", { sensitivity: "base" });
            this.sortedDiscoveries.sort((a: Discovery, b: Discovery) => collator.compare(a.getTitle(), b.getTitle()));

            await Filesystem.writeFile({
                path: this.cachePath,
                data: JSON.stringify(this.sortedDiscoveries),
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });
        }
    }

    public static getSortedDiscoveries() {
        return this.sortedDiscoveries
    }

    public static setUsername(username: string) {
        this.data.username = username;
        this.updateFile();
    }

    public static getUsername(): string {
        return this.data.username;
    }

    public static setToken(token: string) {
        this.data.token = token;
        this.updateFile();
    }

    public static getToken(): string {
        return this.data.token;
    }

    public static async setLocation() {
        const geoloc = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true
        });

        this.data.location.lng = geoloc.coords.longitude;
        this.data.location.lat = geoloc.coords.latitude;

        console.log(geoloc.coords.longitude, geoloc.coords.latitude)

        this.updateFile()
    }

    public static getLocation() {
        this.setLocation().catch(() => { /* Ignore */ });

        return [ this.data.location.lng, this.data.location.lat ];
    }

    public static getMapFocus() {
        return this.data.mapFocus;
    }

    public static setMapFocus(params: { id?: number, dType?: string | number, active: boolean }) {
        if (params.id) this.data.mapFocus.id = params.id;
        if (params.dType) this.data.mapFocus.dType = params.dType;
        this.data.mapFocus.active = params.active;
    }

    public static addCollected(collectable: Discovery, path: string | null, rating: number | null, comment: string | null) {
        const item = {
            id: collectable.id,
            dType: collectable.dType,
            imagepath: path,
            rating: rating,
            comment: comment,
        };

        const insertFirst = (element: any, list: Array<any>) => {
            /* Only inserts if the element is not in `list` */
            if (list.find((it: any) => it.id === item.id) !== -1)
                return [ element, ...list];
            return list;
        }

        switch (collectable.dType) {
            case "artwork": {
                this.data.collected.artworks = insertFirst(item, this.data.collected.artworks);
                break
            }
            case "place": {
                this.data.collected.places = insertFirst(item, this.data.collected.places);
                break
            }
            case "heritage": {
                this.data.collected.heritages = insertFirst(item, this.data.collected.heritages);
                break
            }
            case "badge": {
                this.data.collected.badges = insertFirst(item, this.data.collected.badges);
                break;
            }
            default:
                throw new Error("Invalid type");
        }

        // Now that `dType` has been checked, add to the general list for `tabs/collection`
        this.data.collected.chronological = [ item, ...this.data.collected.chronological ]

        this.updateFile();
    }

    public static editCollected(type: number | string, newData: Review) {
        const replace = (arr: Array<Review>) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == newData.id) {
                    arr[i] = newData;
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
                    console.log(arr[i]);
                    return;
                }
            }

            throw new Error("Invalid (id, type) pair (object does not exist)");
        }

        switch (type) {
            case "artwork": case 0: {
                replace(this.data.collected.artworks);
                break;
            }
            case "place": case 1: {
                replace(this.data.collected.places);
                break;
            }
            case "heritage": case 2: {
                replace(this.data.collected.heritages);
                break;
            }
            case "badge": case 3: {
                replace(this.data.collected.badges);
                break;
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }

        this.updateFile();
    }

    public static getCollected(id: number, type: number | string): Review {
        switch (type) {
            case "artwork": case 0: {
                return this.data.collected.artworks.find((awk: any) => awk.id == id);
            }
            case "place": case 1: {
                return this.data.collected.places.find((pl: any) => pl.id == id);
            }
            case "heritage": case 2: {
                return this.data.collected.heritages.find((hrtg: any) => hrtg.id == id);
            }
            case "badge": case 3: {
                return this.data.collected.badges.find((bg: any) => bg.id == id);
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }
    }

    public static isCollected(id: number, type: number | string): boolean {
        return this.getCollected(id, type) !== undefined
    }

    public static getCollectedChronologically() {
        return this.data.collected.chronological;
    }

    public static addTargeted(collectable: Discovery) {
        switch (collectable.dType) {
            case "artwork": {
                this.data.targeted.artworks.push(collectable.id);
                break;
            }
            case "place": {
                this.data.targeted.places.push(collectable.id);
                break;
            }
            case "heritage": {
                this.data.targeted.heritages.push(collectable.id);
                break;
            }
            default: {
                throw new Error("Invalid discovery type");
            }
        }

        this.updateFile();
    }

    public static removeTargeted(collectable: Discovery) {
        const findAndRemove = (iterable: Array<any>) => {
            const index = iterable.indexOf(collectable.id);
            iterable.splice(index, 1);
        }

        switch (collectable.dType) {
            case "artwork": {
                findAndRemove(this.data.targeted.artworks);
                break
            }
            case "place": {
                findAndRemove(this.data.targeted.places);
                break
            }
            case "heritage": {
                findAndRemove(this.data.targeted.heritages);
                break
            }
            default: {
                throw new Error("Invalid discovery type");
            }
        }

        this.updateFile();
    }

    public static isTargeted(id: number, type: number | string): boolean {
        switch (type) {
            case "artwork": case 0: {
                return this.data.targeted.artworks.find((awkId: any) => awkId === id) !== undefined;
            }
            case "place": case 1: {
                return this.data.targeted.places.find((plId: any) => plId === id) !== undefined;
            }
            case "heritage": case 2: {
                return this.data.targeted.heritages.find((hrtgId: any) => hrtgId === id) !== undefined;
            }
            case "badge": case 3: {
                return false;
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }
    }

    public static setMapStyle(style: string) {
        this.data.mapStyle = style;
        this.updateFile();
    }

    public static getMapStyle(): string {
        return this.data.mapStyle;
    }

    public static addPendingUpload(id: number, type: number | string) {
        switch (type) {
            case "artwork": case 0: {
                if (this.isCollected(id, type)) {
                    this.data.pendingUpload.artworks.push(id);
                    break;
                } else {
                    throw new Error(`Cannot add discovery ${type} id=${id}: not collected.`);
                }
            }
            case "place": case 1: {
                if (this.isCollected(id, type)) {
                    this.data.pendingUpload.places.push(id);
                    break;
                } else {
                    throw new Error(`Cannot add discovery ${type} id=${id}: not collected.`);
                }
            }
            case "heritage": case 2: {
                if (this.isCollected(id, type)) {
                    this.data.pendingUpload.heritages.push(id);
                    break;
                } else {
                    throw new Error(`Cannot add discovery ${type} id=${id}: not collected.`);
                }
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }
    }

    public static getPendingUploads() {
        return this.data.pendingUpload;
    }

    public static removePendingUpload(id: number, type: number | string) {
        switch (type) {
            case "artwork": case 0: {
                const index = this.data.pendingUpload.artworks.indexOf(id);
                if (index > -1) {
                    this.data.pendingUpload.artworks.splice(index, 1);
                }
                break;
            }
            case "place": case 1: {
                const index = this.data.pendingUpload.places.indexOf(id);
                if (index > -1) {
                    this.data.pendingUpload.places.splice(index, 1);
                }
                break;
            }
            case "heritage": case 2: {
                const index = this.data.pendingUpload.heritages.indexOf(id);
                if (index > -1) {
                    this.data.pendingUpload.heritages.splice(index, 1);
                }
                break;
            }
            case "badge": case 3: {
                break;
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }

    }
}

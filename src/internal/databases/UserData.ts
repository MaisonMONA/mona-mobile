import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import {Discovery, DiscoveryEnum, Heritage} from "@/internal/Types";
import Utils from "@/internal/Utils";
import Globals from "@/internal/Globals";
import { Geolocation } from "@capacitor/geolocation";
import { ArtworkDatabase } from "@/internal/databases/ArtworkDatabase";
import { PlaceDatabase } from "@/internal/databases/PlaceDatabase";
import { HeritageDatabase } from "@/internal/databases/HeritageDatabase";
import { ArtworkFactory, PlaceFactory } from "@/internal/Factories";
import {Distance} from "@/internal/Distance";
//import {BadgeDatabase} from "@/internal/databases/BadgeDatabase";

type Review = {id: number, dType: string, filename: string, rating: number, comment: string};

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
    private static sortedDiscoveries: Discovery[] = [];
    private static sortedDiscoveriesDistance:  Discovery[] = [];

    public static async populate() {
        if (this.data) return;  // Do not populate twice

        // Parse data from file; if it fails, try to download from the server
        try {
            const content = await Filesystem.readFile({
                path: this.path,
                directory: Directory.Data,
                encoding: Encoding.UTF8
            })

            if (typeof content.data === "string") {
                this.data = JSON.parse(content.data);
            }

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
            encoding: Encoding.UTF8,
            recursive: true,
        })
        .catch((err) => {
            console.error(`Failed to update user preferences (${err})`);
        })
    }

    public static resetPreferences(resetTutorial=true) {
        this.data = {
            username: '',
            token: '',
            collectedWereFetched: false,
            hasSeenTutorial: resetTutorial ? false : this.data.hasSeenTutorial,
            mapFocus: { id: -1, dType: 'empty', active: false },
            lastServerCheck: {
                artworks: "1970-01-01",
                places: "1970-01-01",
                heritages: "1970-01-01",
            },
            location: {  // Default on Montreal
                lng: -73.561668,
                lat: 45.508888,
                accuracy: 5
            },
            collected: {
                // To be filled with { id:, filename:, rating:, comment: }
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
                // To be filled with IDs, **and must exist in `this.collected`** (to get the rest of the info)
                artworks: [],
                places: [],
                heritages: [],
            },
            mapStyle: "osm",  // Preferred map style (not in use @ the moment)
        };

        this.updateFile();
    }
    public static async getFromServer() {
        if (this.data.collectedWereFetched)
            return;  // Skip fetching the user's photos if it was done already

        await Promise.all([
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.artworks.upload, "artwork"),
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.places.upload, "place"),
            Utils.fetchUserDataOnEndpoint(Globals.apiRoutes.heritages.upload, "heritage"),
        ]);

        this.data.collectedWereFetched = true;
        this.updateFile();
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

            if (typeof content.data === "string") {
                const parsed = JSON.parse(content.data);
                this.sortedDiscoveries = parsed.map((discovery: any) => {
                    if (discovery.dType === "artwork")
                        return ArtworkFactory.createArtwork(discovery);
                    else if (discovery.dType === "place")
                        return PlaceFactory.createPlace(discovery);
                    else
                        return new Heritage(discovery);
                });
            }

        } catch (err) {
            console.log("Failed to load cache, building it.");
            await this.buildCache();
            this.sortByDistance();

        }
    }

    public static sortByDistance() {
        this.sortedDiscoveriesDistance = ArtworkDatabase.getSubset(0, ArtworkDatabase.getSize());
        this.sortedDiscoveriesDistance = this.sortedDiscoveriesDistance.concat(PlaceDatabase.getSubset(0, PlaceDatabase.getSize()));
        this.sortedDiscoveriesDistance = this.sortedDiscoveriesDistance.concat(HeritageDatabase.getSubset(0, HeritageDatabase.getSize()));
        const lat2 = UserData.getLocation()[1];
        const lng2 = UserData.getLocation()[0]
        this.sortedDiscoveriesDistance.sort((a, b) => {
            return Distance.calculateDistance(a, lat2, lng2) - Distance.calculateDistance(b, lat2, lng2);
        });

    }
    public static getSortedDiscoveriesDistance(sliceA?: number, sliceB?: number) {
        return this.sortedDiscoveriesDistance.slice(sliceA || 0, sliceB || Infinity)
    }
    private static async buildCache() {
        this.sortedDiscoveries = ArtworkDatabase.getSubset(0, ArtworkDatabase.getSize());
        this.sortedDiscoveries = this.sortedDiscoveries.concat(PlaceDatabase.getSubset(0, PlaceDatabase.getSize()));
        this.sortedDiscoveries = this.sortedDiscoveries.concat(HeritageDatabase.getSubset(0, HeritageDatabase.getSize()));

        // Sorting alphabetically
        const collator = new Intl.Collator("fr", { sensitivity: "base" });
        this.sortedDiscoveries.sort((a: Discovery, b: Discovery) => {
            const aFirstChar = a.getTitle().charCodeAt(0);
            const bFirstChar = b.getTitle().charCodeAt(0);

            // If a's title start with a non alphanumeric char, send it to the end
            if ((aFirstChar < 48 || aFirstChar > 57) && (aFirstChar < 65 || aFirstChar > 90) && (aFirstChar < 192 || aFirstChar > 383))
                //       ^--- capital letter                    ^--- small letter                           ^--- accented
                return 1;

            // If b's title start with a non alphanumeric char, send it to the end
            if ((bFirstChar < 48 || bFirstChar > 57) && (bFirstChar < 65 || bFirstChar > 90) && (bFirstChar < 192 || bFirstChar > 383))
                return -1;

            // Both discoveries start with an alphanumeric character, sort them normally
            return collator.compare(a.getTitle(), b.getTitle())
        });

        await Filesystem.writeFile({
            path: this.cachePath,
            data: JSON.stringify(this.sortedDiscoveries),
            directory: Directory.Cache,
            encoding: Encoding.UTF8
        });
    }

    public static getSortedDiscoveriesAZ(sliceA?: number, sliceB?: number) {
        return this.sortedDiscoveries.slice(sliceA || 0, sliceB || Infinity)
    }

    public static async checkForDBUpdate() {
        const targets = [
            { url: Globals.apiRoutes.artworks.getUpdate + `?date=${this.data.lastServerCheck.artworks}`, type: "artworks" },
            { url: Globals.apiRoutes.places.getUpdate + `?date=${this.data.lastServerCheck.places}`, type: "places" },
            { url: Globals.apiRoutes.heritages.getUpdate + `?date=${this.data.lastServerCheck.heritages}`, type: "heritages" }
        ];

        let hasFoundUpdate = false;

        for (const target of targets) {
            try {
                const response = await fetch(target.url);
                if (response.ok) {
                    const content = await response.text();

                    if (target.type == "artworks")
                        ArtworkDatabase.insertNewElements(JSON.parse(content).data)
                    else if (target.type == "places")
                        PlaceDatabase.insertNewElements(JSON.parse(content).data)
                    else /* if (target.type == "heritages") */
                        HeritageDatabase.insertNewElements(JSON.parse(content).data);

                    hasFoundUpdate = true;
                } else {
                    console.log(`Server error when updating ${target.type} DB: code ${response.status}`);
                }
            } catch (err) {
                console.log(`Failed to update ${target.type} DB (err: ${err})`)
            }
        }

        if (hasFoundUpdate) {  // Rebuild cache when any DB is updated
            console.log("Sorting discoveries alphabetically")
            await this.buildCache();
            console.log("Done sorting discoveries alphabetically")
            console.log("Sorting discoveries by distance")
            this.sortByDistance();
            console.log("Done sorting discoveries by distance")
        }
    }

    public static setDBLastUpdate(type: string, date: Date) {
        const dateUpdate = date.toISOString().slice(0, 10);

        if (type == "artworks" || type == "artwork")
            this.data.lastServerCheck.artworks = dateUpdate;
        else if (type == "places" || type == "place")
            this.data.lastServerCheck.places = dateUpdate;
        else if (type == "heritages" || type == "heritage")
            this.data.lastServerCheck.heritages = dateUpdate
    }

    public static tryUploadingPendingDiscoveries() {
        for (const type of Object.keys(this.data.pendingUpload)) {  // Checking each category
            for (const id of this.data.pendingUpload[type]) {       // For each element of the category's list
                Utils.sendPictureAndDetails(id, type)               // (Pending upload removed inside sendPictureAndDetails)
                    .catch(() => { /* Do nothing */ })
            }
        }
    }
    // public static setEmail(email: string) {
        //TODO: créer un champ email dans data
        //this.data.email = email;
    //     console.log("email assigned")
    //     return "email assigned"
    // }
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

    public static hasSeenTutorial() {
        return this.data.hasSeenTutorial;
    }

    public static setSeenTutorial(val: boolean) {
        this.data.hasSeenTutorial = val;

        this.updateFile();
    }

    public static async setLocation() {
        const geoloc = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
        });

        // TODO: use `accuracy` to be displayed as a feature on the map (choose the layer with the location icon)

        this.data.location.lng = geoloc.coords.longitude;
        this.data.location.lat = geoloc.coords.latitude;
        this.data.location.accuracy = geoloc.coords.accuracy;

        this.updateFile()
    }

    public static getLocation(update=true) {
        if (update)
            this.setLocation().catch(() => { /* Ignore fail */ });

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

    public static addCollected(collectable: Discovery, filename: string | null, rating: number | null, comment: string | null) {
        const insertFirst = (element: any, list: any[]) => {
            /* Only inserts if the element is not in `list` */
            if (list.find((it: any) => it.id === item.id) !== -1)
                return [ element, ...list ];
            return list;
        }

        const item = {
            id: collectable.id,
            dType: collectable.dType,
            filename: filename,
            rating: rating,
            comment: comment,
        };

        const key = collectable.dType + 's';
        this.data.collected[key] = insertFirst(item, this.data.collected[key]);

        // Add to the general list for `/tabs/collection`
        this.data.collected.chronological = [ item, ...this.data.collected.chronological ];

        this.updateFile();
    }

    public static editCollected(type: number | string, newData: Review) {
        let list: Review[];
        if (type == "artwork" || type == "artworks" || type == DiscoveryEnum.ARTWORK)
            list = this.data.collected.artworks;
        else if (type == "place" || type == "places" || type == DiscoveryEnum.PLACE)
            list = this.data.collected.places;
        else if (type == "heritage" || type == "heritages" || type == DiscoveryEnum.HERITAGE)
            list = this.data.collected.heritages;
        else if (type == "badge" || type == "badges"|| type == DiscoveryEnum.BADGE)
            list = this.data.collected.badges;
        else throw new Error("Invalid collectable type " + type);  // Not a valid type

        // Replace the old collectable with the new one
        for (const [index, collected] of list.entries()) {
            if (collected.id == newData.id) {
                list[index] = newData;

                this.updateFile();
                return;
            }
        }

        // Collected not found, throw error
        throw new Error("Invalid (id, type) pair : object does not exist.");
    }

    public static getCollected(id: number, type: number | string): Review {
        switch (type) {
            case "artwork": case "artworks": case DiscoveryEnum.ARTWORK: {
                return this.data.collected.artworks.find((awk: any) => awk.id == id);
            }
            case "place": case "places": case DiscoveryEnum.PLACE: {
                return this.data.collected.places.find((pl: any) => pl.id == id);
            }
            case "heritage": case "heritages": case DiscoveryEnum.HERITAGE: {
                return this.data.collected.heritages.find((hrtg: any) => hrtg.id == id);
            }
            case "badge": case "badges": case DiscoveryEnum.BADGE: {
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
        const type = collectable.dType + 's';
        this.data.targeted[type].push(collectable.id);

        this.updateFile();
    }

    public static removeTargeted(collectable: Discovery) {
        const type = collectable.dType + 's';
        this.data.targeted[type] = this.data.targeted[type].filter((targetId: number) => targetId != collectable.id);

        this.updateFile();
    }

    public static isTargeted(id: number, type: number | string): boolean {
        switch (type) {
            case "artwork": case "artworks": case DiscoveryEnum.ARTWORK: {
                return this.data.targeted.artworks.find((awkId: any) => awkId === id) !== undefined;
            }
            case "place": case "places": case DiscoveryEnum.PLACE: {
                return this.data.targeted.places.find((plId: any) => plId === id) !== undefined;
            }
            case "heritage": case "heritages": case DiscoveryEnum.HERITAGE: {
                return this.data.targeted.heritages.find((hrtgId: any) => hrtgId === id) !== undefined;
            }
            case "badge": case "badges": case DiscoveryEnum.BADGE: {
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
        let key;
        if (type == "artwork" || type == "artworks" || type == DiscoveryEnum.ARTWORK)
            key = "artworks"
        else if (type == "place" || type == "places" || type == DiscoveryEnum.PLACE)
            key = "places"
        else if (type == "heritage" || type == "heritage" || type == DiscoveryEnum.HERITAGE)
            key = "heritages"
        else throw new Error("Invalid collectable type.");

        if (this.isCollected(id, type))
            this.data.pendingUpload[key].push(id)
        else
            throw new Error(`Cannot add discovery ${type} id=${id}: discovery not collected.`);
    }

    public static getPendingUploads() {
        return this.data.pendingUpload;
    }

    public static removePendingUpload(id: number, type: number | string) {
        let key;
        if (type == "artwork" || type == "artworks" || type == DiscoveryEnum.ARTWORK)
            key = "artworks"
        else if (type == "place" || type == "places" || type == DiscoveryEnum.PLACE)
            key = "places"
        else if (type == "heritage" || type == "heritage" || type == DiscoveryEnum.HERITAGE)
            key = "heritages"
        else return;  // Not a valid type

        // Removing all pending uploads
        this.data.pendingUpload[key] = this.data.pendingUpload[key].filter((pendingId: number) => pendingId != id);
        this.updateFile();
    }
}

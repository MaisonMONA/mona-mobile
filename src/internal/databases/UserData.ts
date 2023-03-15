import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Discovery } from "@/internal/Types";

type Review = {id: number | null, imagepath: string, rating: number, comment: string};

export class UserData {
    private static data: any = null;
    private static path = "appdata/preferences.json";
    private static type = "preferences";

    public static populate() {
        if (this.data) return;  // Do not populate twice

        // Parse data from file; if it fails, try to download from the server
        Filesystem.readFile({
            path: this.path,
            directory: Directory.Data,
            encoding: Encoding.UTF8
        })

        .then((content) => {
            this.data = JSON.parse(content.data);

            console.log(this.type + " db: successfully populated database.");
        })

        .catch(async (err) => {
            console.log(`${this.type} db: error when parsing data from ${this.path} (${err}).`);

            // Default user data
            this.data = {
                username: '',
                token: '',
                collected: {
                    // To be filled with { id:, imagepath:, rating:, comment: }
                    artworks: [],
                    places: [],
                    heritages: [],
                    badges: [],
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
        });
    }

    private static updateFile(source='') {
        Filesystem.writeFile({
            path: this.path,
            data: JSON.stringify(this.data),
            directory: Directory.Data,
            encoding: Encoding.UTF8
        })
        .then(() => {
            console.log("User preferences updated successfully" + (source ? ` (${source})` : ''));
        })
        .catch((err) => {
            console.error(`Failed to update user preferences (${err})`);
        })
    }

    public static resetPreferences() {
        this.data = {
            username: '',
            token: '',
            collected: {
                // To be filled with { id:, imagepath:, rating:, comment: }
                artworks: [],
                places: [],
                heritages: [],
                badges: [],
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

    public static addCollected(collectable: Discovery, path: string, rating: number | null, comment: string | null) {
        const item = {
            id: collectable.id,
            imagepath: path,
            rating: rating ? rating : 0,
            comment: comment ? comment : '',
        };

        switch (collectable.dType) {
            case "artwork": {
                this.data.collected.artworks.push(item);
                break
            }
            case "place": {
                this.data.collected.places.push(item);
                break
            }
            case "heritage": {
                this.data.collected.heritages.push(item);
                break
            }
            case "badge": {
                this.data.collected.badges.push(item);
            }
        }

        this.updateFile();
    }

    public static editCollected(type: number | string, newData: Review) {
        const replace = (arr: Array<Review>) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == newData.id) {
                    arr[i] = newData;
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
                return this.data.collected.artworks.find((awk: any) => awk.id === id);
            }
            case "place": case 1: {
                return this.data.collected.places.find((pl: any) => pl.id === id);
            }
            case "heritage": case 2: {
                return this.data.collected.heritages.find((hrtg: any) => hrtg.id === id);
            }
            case "badge": case 3: {
                return this.data.collected.badges.find((bg: any) => bg.id === id);
            }
            default: {
                throw new Error("Invalid collectable type " + type);
            }
        }
    }

    public static isCollected(id: number, type: number | string): boolean {
        return this.getCollected(id, type) !== undefined
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

        this.updateFile("addTargeted");
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

        this.updateFile("removeTargeted");
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

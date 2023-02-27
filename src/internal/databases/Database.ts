/**
 * Parent database class to avoid repeating some methods
 */
export abstract class Database {
    protected static data: Array<any>;

    public static getFromId(id: number) {
        if (id > this.data.length) {
            throw new Error(`ID out of range (${id} > ${this.data.length}).`);
        }

        for (let i = id - 1; i >= 0; i--) {
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
        for (let i = id; i >= 0; i--) {
            if (this.data[i].id == id) {
                return true;
            }
        }

        return false;
    }
}

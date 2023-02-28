import { Heritage } from "@/internal/Types"
import { Database } from "@/internal/databases/Database";


export class HeritageDatabase extends Database {
    protected static data: Array<Heritage> = [];
    protected static path = "appdata/heritages.json";
    protected static type = "heritages";
    
    protected static createSingleElement(heritage: any) {
        return new Heritage(heritage);
    }

    public static getFromId(id: number): Heritage {
        return super.getFromId(id) as Heritage;
    }
}

import { Place } from "@/internal/Types"
import { PlaceFactory } from "@/internal/Factories";
import { Database } from "@/internal/databases/Database";

export class PlaceDatabase extends Database {
    protected static data: Place[] = [];
    protected static path = "appdata/places.json";
    protected static type = "places";

    protected static createSingleElement(place: any) {
        return PlaceFactory.createPlace(place);
    }

    public static getFromId(id: number): Place | null {
            return super.getFromId(id) as Place | null;
    }
}

import { Artwork } from "@/internal/Types"
import { Database } from "@/internal/databases/Database";
import { ArtworkFactory } from "@/internal/Factories";

export class ArtworkDatabase extends Database {
    protected static data: Array<Artwork> = [];
    protected static path = "appdata/artworks.json";
    protected static type = "artworks";

    protected static createSingleElement(artwork: any) {
        return ArtworkFactory.createArtwork(artwork);
    }

    public static getFromId(id: number): Artwork {
        return super.getFromId(id) as Artwork;
    }
}

import {Database} from "@/internal/databases/Database";
import { ArtistFactory } from "@/internal/Factories";

export class ArtistDatabase extends Database{
    protected static data: any[] = [];
    protected static path = "appdata/artists.json";
    protected static type = "artists";

    protected static createSingleElement(artist: any) {
        return ArtistFactory.createArtist(artist);
    }

    public static getAll(): any[] {
        return this.data;
    }
    }
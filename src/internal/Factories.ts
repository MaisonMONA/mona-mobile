import {Artist, Artwork, Place} from "@/internal/Types";

export class ArtworkFactory {
    static createArtwork(artwork: any) {
        // Creating Artist list
        const artists: Artist[] = [];
        if (artwork.artists) {
            for (const artist of artwork.artists) {
                // Handle both v2 API (artist.alias) and v3 API (artist.artist?.alias)
                const alias = artist.alias || artist.artist?.alias;
                artists.push(new Artist(artist.id, artist.name, alias))
            }
        }

        artwork.artists = artists;

        return new Artwork(artwork);
    }
}

export class PlaceFactory {
    static createPlace(place: any) {
        // The server sends a list of objects but we store an object of lists (for coherence with the rest)
        if (place.usages instanceof Array) {
            // Creating usages list
            const usagesFr: string[] = [];
            const usagesEn: string[] = [];

            for (const usage of place.usages) {
                usagesFr.push(usage.fr);
                usagesEn.push(usage.en);
            }

            place.usages = { fr: usagesFr, en: usagesEn };
        }

        return new Place(place);
    }
}

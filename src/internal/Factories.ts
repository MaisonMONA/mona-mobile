import {Artist, Artwork, Place} from "@/internal/Types";

export class ArtworkFactory {
    static createArtwork(artwork: any) {
        // Creating Artist list
        const artists: Array<Artist> = [];
        if (artwork.artists) {
            for (const artist of artwork.artists) {
                artists.push(new Artist(artist.id, artist.name))
            }
        }

        artwork.artists = artists;

        return new Artwork(artwork);
    }
}

export class PlaceFactory {
    static createPlace(place: any) {
        // Creating usages list
        const usagesFr: Array<string> = [];
        const usagesEn: Array<string> = [];

        for (const usage of place.usages) {
            usagesFr.push(usage.fr);
            usagesEn.push(usage.en);
        }

        place.usages = {fr: usagesFr, en: usagesEn};

        return new Place(place);
    }
}

import {Artist, Artwork} from "@/internal/Types";

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

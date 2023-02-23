import Database from "@/internal/databases/Database";

export class ArtworkDatabase extends Database {
    static async populate(path="artworks.json") {
        await super.populate(path);
    }
}

export enum DiscoveryEnum {
    ARTWORK,
    PLACE,
    HERITAGE,
    BADGE
}

export abstract class Discovery {
    public abstract id: number;
    public abstract dType: string;
    public isTargeted  = false;
    public isCollected = false;

    public abstract getTitle(): string;

    // All code below for inheritance
    public getArtists(): string {
        return '';
    }

    public getCategories(): string {
        return '';
    }

    public getUsages(): string {
        return '';
    }

    public getBorough(): string {
        return '';
    }
}

export class Artist {
    constructor(id: number, name: string) {
        this.id= id;
        this.name = name;
    }

    id: number;
    name: string;

    public toString() {
        return this.name;
    }
}

export class Artwork extends Discovery {
    constructor(artwork: {
        id: number, artists: Array<Artist> | null,
        produced_at: string | null, territory: string,
        location: { lat: number, lng: number },
        title: { fr: string | null, en: string | null },
        materials:  { fr: Array<string>, en: Array<string> } | null,
        dimensions: { fr: Array<string>, en: Array<string> } | null,
        categories: { fr: Array<string>, en: Array<string> } | null,
        techniques: { fr: Array<string>, en: Array<string> } | null,
    }) {
        super();
        this.dType        = "artwork";
        this.id          = artwork.id;
        this.title       = artwork.title;
        this.artists     = artwork.artists;
        this.location    = artwork.location;
        this.produced_at = artwork.produced_at;
        this.territory   = artwork.territory;
        this.materials   = artwork.materials;
        this.dimensions  = artwork.dimensions;
        this.categories  = artwork.categories;
        this.techniques  = artwork.techniques;
    }
    dType: string;
    id: number;
    title: { fr: string | null, en: string | null };
    artists: Array<Artist> | null;
    location: { lat: number, lng: number };
    produced_at: string | null;
    territory: string;
    materials: { fr: Array<string>, en: Array<string> } | null;
    dimensions: { fr: Array<string>, en: Array<string> } | null;
    categories: { fr: Array<string>, en: Array<string> } | null;
    techniques: { fr: Array<string>, en: Array<string> } | null;

    public getTitle(): string {
        const title = this.title.fr || this.title.en;
        if (!title || ["sans titre", "non titré", "untitled"].includes(title.toLowerCase())) {
            return "(non titré)";
        }

        return title;
    }

    public getArtists(): string {
        let artistsStr = '';
        if (this.artists != undefined) {
            for (let i = 0; i < this.artists.length; i++) {
                artistsStr = this.artists[i].name;

                if (i != this.artists.length - 1)
                    artistsStr += ', ';
            }
        }

        return artistsStr;
    }

    public getCategories(lang='fr'): string {
        if (!this.categories) return '';

        if (lang == 'fr') {
            return this.categories.fr.join(', ');
        } else {
            return this.categories.en.join(', ');
        }
    }
}

export class Place extends Discovery {
    constructor(place: {
        id: number, title: string, usages: { fr: Array<string>, en: Array<string> },
        borough: string, territory: string, description: string | null,
        location: { lat: number, lng: number }
    }) {
        super();
        this.dType        = "place";
        this.id          = place.id;
        this.title       = place.title;
        this.location    = place.location;
        this.usages      = place.usages;
        this.borough     = place.borough;
        this.description = place.description;
        this.territory   = place.territory;
    }

    dType: string;
    id: number;
    title: string;
    location: { lat: number, lng: number };
    usages: { fr: Array<string>; en: Array<string>; };
    borough: string;
    description: string | null;
    territory: string;

    public getTitle(): string {
        return this.title;
    }

    public getUsages(lang='fr'): string {
        if (lang == 'fr') {
            return this.usages.fr.join(', ');
        } else {
            return this.usages.en.join(', ');
        }
    }

    public getBorough(): string {
        return this.borough
    }
}

export class Heritage extends Discovery {
    constructor(heritage: {
        id: number, title: string, territory: string,
        produced_at: string | null, description: string | null,
        location: { lat: number, lng: number }, status: string,
        borough: string, synthesis: null, "sous-usages": Array<string>,
        functions: { fr: Array<string>, en: Array<string> }
    }) {
        super();
        this.dType        = "heritage";
        this.id          = heritage.id;
        this.title       = heritage.title;
        this.location    = heritage.location;
        this.produced_at = heritage.produced_at;
        this.functions   = heritage.functions;
        this.subUses     = heritage["sous-usages"];
        this.synthesis   = heritage.synthesis
        this.description = heritage.description;
        this.status      = heritage.status;
        this.borough     = heritage.borough;
        this.territory   = heritage.territory;
    }

    dType: string;
    id: number;
    title: string;
    borough: string;
    territory: string;
    produced_at: string | null;
    description: string | null;
    location: { lat: number, lng: number };
    functions: { fr: Array<string>, en: Array<string> };
    status: string;
    synthesis: null;
    subUses: Array<string>;

    public getTitle(): string {
        return this.title;
    }

    public getBorough(): string {
        return this.borough || "Quartier inconnu";
    }

    public getUsages(): string {
        return this.subUses.join(', ') || "Utilisations inconnues";
    }
}

export class Badge extends Discovery {
    constructor(badge: {
        id: number, title: string, requiredCount: number,
        description: { fr: string, en: string },
        notification: { fr: string, en: string },
        badgeable: { type: string, name: string },
        type: string | null
    }) {
        super();
        this.dType         = "badge";
        this.id            = badge.id;
        this.title         = badge.title;
        this.requiredCount = badge.requiredCount;
        this.description   = badge.description;
        this.notification  = badge.notification;
        this.badgeable     = badge.badgeable;
        this.type          = badge.type;
    }

    dType: string;
    id: number;
    title: string;
    requiredCount: number;
    description: {
        fr: string,
        en: string
    };
    notification: {
        fr: string,
        en: string
    };
    badgeable: {
        type: string,
        name: string
    };
    type: string | null;

    public getTitle(): string {
        return this.title;
    }
}

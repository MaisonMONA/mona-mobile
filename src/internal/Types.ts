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
        directions: { fr: string | null, en: string | null } | null
    }) {
        super();
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
        this.directions  = artwork.directions
    }
    dType = "artwork";
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
    directions: { fr: string | null, en: string | null } | null;

    public getTitle(): string {
        /* Uncomment this part to enable title normalization (untitled discoveries are all named "(non titré)") */
        // const title = this.title.fr || this.title.en;
        // if (!title || ["sans titre", "non titré", "untitled"].includes(title.toLowerCase())) {
        //     return "(non titré)";
        // }
        //
        // return title;
        return this.title.fr || this.title.en || "(non titré)";
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

    public getDirections(): string | null {
        if (this.directions)  // `direction` can be null
            return this.directions.fr || this.directions.en || 'Emplacement inconnu';  // In case both `fr` and `en` are null

        return 'Emplacement inconnu';
    }
}

export class Place extends Discovery {
    constructor(place: {
        id: number, title: string, usages: { fr: Array<string>, en: Array<string> },
        borough: string, territory: string, description: string | null,
        location: { lat: number, lng: number }, address: string
    }) {
        super();
        this.id          = place.id;
        this.title       = place.title;
        this.location    = place.location;
        this.usages      = place.usages;
        this.borough     = place.borough;
        this.description = place.description;
        this.territory   = place.territory;
        this.address     = place.address;
    }

    dType = "place";
    id: number;
    title: string;
    location: { lat: number, lng: number };
    usages: { fr: Array<string>; en: Array<string>; };
    borough: string;
    description: string | null;
    territory: string;
    address: string;

    public getTitle(): string {
        return this.title;
    }

    public getUsages(lang='fr'): string {
        if (lang == 'fr')
            return this.usages.fr.join(', ');
        else
            return this.usages.en.join(', ');
    }

    public getBorough(): string {
        return this.borough;
    }

    public getAddress(): string {
        return this.address;
    }
}

export class Heritage extends Discovery {
    constructor(heritage: {
        id: number, title: string, territory: string,
        produced_at: string | null, description: string | null,
        location: { lat: number, lng: number }, status: string,
        borough: string, synthesis: null, "sous-usages": Array<string>,
        subUses: Array<string>, functions: { fr: Array<string>, en: Array<string> },
        addresses: Array<string>
    }) {
        super();
        this.id          = heritage.id;
        this.title       = heritage.title;
        this.location    = heritage.location;
        this.produced_at = heritage.produced_at;
        this.functions   = heritage.functions;
        this.subUses     = heritage["sous-usages"] || heritage.subUses;  // "sous-usages" is the original key
        this.synthesis   = heritage.synthesis
        this.description = heritage.description;
        this.status      = heritage.status;
        this.borough     = heritage.borough;
        this.territory   = heritage.territory;
        this.addresses   = heritage.addresses;
    }

    dType = "heritage";
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
    addresses: Array<string>;

    public getTitle(): string {
        return this.title;
    }

    public getBorough(): string {
        return this.borough || "Quartier inconnu";
    }

    public getUsages(): string {
        return this.subUses.join(', ') || "Utilisations inconnues";
    }

    public getAddress(): string {
        if (this.addresses.length > 0)
            return this.addresses[0];
        else
            return 'Adresse inconnue'
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
        this.id            = badge.id;
        this.title         = badge.title;
        this.requiredCount = badge.requiredCount;
        this.description   = badge.description;
        this.notification  = badge.notification;
        this.badgeable     = badge.badgeable;
        this.type          = badge.type;
    }

    dType = "badge";
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

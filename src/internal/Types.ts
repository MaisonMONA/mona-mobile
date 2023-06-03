export enum DiscoveryEnum {
    ARTWORK,
    PLACE,
    HERITAGE,
    BADGE
}

export abstract class Discovery {
    public abstract id: number;
    public abstract dType: string;
    public isTargeted  = false;  // TODO delete attribute after checking safety
    public isCollected = false;  // TODO delete attribute after checking safety

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
        id: number, artists: Artist[] | null,
        produced_at: string | null, territory: string,
        location: { lat: number, lng: number },
        title: { fr: string | null, en: string | null },
        materials:  { fr: string[], en: string[] } | null,
        dimensions: { fr: string[], en: string[] } | null,
        categories: { fr: string[], en: string[] } | null,
        techniques: { fr: string[], en: string[] } | null,
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
    artists: Artist[] | null;
    location: { lat: number, lng: number };
    produced_at: string | null;
    territory: string;
    materials: { fr: string[], en: string[] } | null;
    dimensions: { fr: string[], en: string[] } | null;
    categories: { fr: string[], en: string[] } | null;
    techniques: { fr: string[], en: string[] } | null;
    directions: { fr: string | null, en: string | null } | null;

    public getTitle(): string {
        return this.title.fr || this.title.en || "(non titré)";
    }

    public getArtists(): string {
        if (this.artists != undefined)
            return this.artists.map((artist) => artist.name).join(", ");

        return '';
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
        if (this.directions)  // `direction` can also be null
            return this.directions.fr || this.directions.en ;  // In case both `fr` and `en` are null

        return null;
    }
}

export class Place extends Discovery {
    constructor(place: {
        id: number, title: string, usages: { fr: string[], en: string[] },
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
    usages: { fr: string[]; en: string[]; };
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

    public getAddress(): string | null {
        return this.address || null;
    }
}

export class Heritage extends Discovery {
    constructor(heritage: {
        id: number, title: string, territory: string,
        produced_at: string | null, description: string | null,
        location: { lat: number, lng: number }, status: string,
        borough: string, synthesis: null, "sous-usages": string[],
        subUses: string[], functions: { fr: string[], en: string[] },
        addresses: string[]
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
    functions: { fr: string[], en: string[] };
    status: string;
    synthesis: null;
    subUses: string[];
    addresses: string[];

    public getTitle(): string {
        return this.title;
    }

    public getBorough(): string{
        return this.borough;
    }

    public getUsages(): string {
        return this.subUses.join(', ') ;
    }

    public getAddress(): string | null {
        if (this.addresses.length > 0)
            return this.addresses[0];
        else
            return null
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

export enum DiscoveryTypes {
    ARTWORK,
    PLACE,
    HERITAGE,
    BADGE
}

export class Artist {
    constructor(id: number, name: string) {
        this.id= id;
        this.name = name;
    }

    public toString() {
        return this.name;
    }

    id: number;
    name: string;
}

export class Artwork {
    constructor(artwork: {
        id: number, artists: Array<Artist>,
        produced_at: string | null, territory: string,
        location: { lat: string, lng: string },
        title: { fr: string | null, en: string | null },
        materials:  { fr: Array<string>, en: Array<string> } | null,
        dimensions: { fr: Array<string>, en: Array<string> } | null,
        categories: { fr: Array<string>, en: Array<string> } | null,
        techniques: { fr: Array<string>, en: Array<string> } | null,
    }) {
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

    id: number;
    title: {
        fr: string | null,
        en: string | null
    };
    artists: Array<Artist>;
    location: {
        lat: string,
        lng: string
    };
    produced_at: string | null;
    territory: string;
    materials: {
        fr: Array<string>,
        en: Array<string>
    } | null;
    dimensions: {
        fr: Array<string>,
        en: Array<string>
    } | null;
    categories: {
        fr: Array<string>,
        en: Array<string>
    } | null;
    techniques: {
        fr: Array<string>,
        en: Array<string>
    } | null
}

export class Place {
    constructor(place: {
        id: number, title: string, usages: { fr: Array<string>, en: Array<string> },
        borough: string, territory: string, description: string | null,
        location: { lat: string, lng: string }
    }) {
        this.id          = place.id;
        this.title       = place.title;
        this.location    = place.location;
        this.usages      = place.usages;
        this.borough     = place.borough;
        this.description = place.description;
        this.territory   = place.territory;
    }

    id: number;
    title: string;
    location: {
        lat: string;
        lng: string;
    };
    usages: {
        fr: Array<string>;
        en: Array<string>;
    };
    borough: string;
    description: string | null;
    territory: string;
}

export class Heritage {
    constructor(heritage: {
        id: number, title: string, territory: string,
        produced_at: string | null, description: string | null,
        location: { lat: string, lng: string }, status: string,
        borough: string, synthesis: null, "sous-usages": Array<string>,
        functions: { fr: Array<string>, en: Array<string> }
    }) {
        this.id          = heritage.id;
        this.title       = heritage.title;
        this.location    = heritage.location;
        this.produced_at = heritage.produced_at;
        this.functions   = heritage.functions;
        this.subUses     = [...heritage["sous-usages"]];
        this.synthesis   = heritage.synthesis
        this.description = heritage.description;
        this.status      = heritage.status;
        this.borough     = heritage.borough;
        this.territory   = heritage.territory;
    }

    id: number;
    title: string;
    borough: string;
    territory: string;
    produced_at: string | null;
    description: string | null;
    location: { lat: string, lng: string };
    functions: {
        fr: Array<string>,
        en: Array<string>
    };
    status: string;
    synthesis: null;
    subUses: Array<string>;
}

export class Badge {
    constructor(badge: {
        id: number, title: string, requiredCount: number,
        description: { fr: string, en: string },
        notification: { fr: string, en: string },
        badgeable: { type: string, name: string },
        type: string | null
    }) {
        this.id            = badge.id;
        this.title         = badge.title;
        this.requiredCount = badge.requiredCount;
        this.description   = badge.description;
        this.notification  = badge.notification;
        this.badgeable     = badge.badgeable;
        this.type          = badge.type;
    }

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
    type: string | null
}

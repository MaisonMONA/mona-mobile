export enum DiscoveryEnum {
  ARTWORK,
  PLACE,
  HERITAGE,
  BADGE,
}

export abstract class Discovery {
  public abstract id: number;
  public abstract dType: string;
  public isTargeted = false; // TODO delete attribute after safety check
  public isCollected = false; // TODO delete attribute after safety check

  public abstract getTitle(): string;

  // All code below for inheritance
  public getLocation(): { lat: number; lng: number } {
    return { lat: 0, lng: 0 };
  }
  public getArtists(): string {
    return "";
  }

  public getCategories(): string {
    return "";
  }

  public getUsages(): string {
    return "";
  }

  public getBorough(): string {
    return "";
  }
}

export class Artist {
  constructor(id: number, name: string) {
    this.id = id;
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
    id: number;
    artists: Artist[] | null;
    produced_at: string | null;
    territory: string;
    location: { lat: number; lng: number };
    owner: string | null;
    borough: string;
    title: { fr: string | null; en: string | null };
    url: { fr: string; en: string } | null;
    materials: { fr: string[]; en: string[] } | null;
    dimensions: { fr: string[]; en: string[] } | null;
    categories: { fr: string[]; en: string[] } | null;
    techniques: { fr: string[]; en: string[] } | null;
    mediums: { fr: string[]; en: string[] } | null;
    directions: { fr: string | null; en: string | null } | null;
    supports: { fr: string[]; en: string[] } | null;
    accessibilities: { fr: string[]; en: string[] } | null;
  }) {
    super();
    this.id = artwork.id;
    this.title = artwork.title;
    this.url = artwork.url;
    this.artists = artwork.artists;
    this.location = artwork.location;
    this.produced_at = artwork.produced_at;
    this.territory = artwork.territory;
    this.materials = artwork.materials;
    this.dimensions = artwork.dimensions;
    this.categories = artwork.categories;
    this.techniques = artwork.techniques;
    this.directions = artwork.directions;
    this.mediums = artwork.mediums;
    this.owner = artwork.owner;
    this.borough = artwork.borough;
    this.supports = artwork.supports;
    this.accessibilities = artwork.accessibilities;
  }

  dType = "artwork";
  id: number;
  title: { fr: string | null; en: string | null };
  url: { fr: string; en: string } | null;
  artists: Artist[] | null;
  location: { lat: number; lng: number };
  produced_at: string | null;
  territory: string;
  materials: { fr: string[]; en: string[] } | null;
  dimensions: { fr: string[]; en: string[] } | null;
  categories: { fr: string[]; en: string[] } | null;
  techniques: { fr: string[]; en: string[] } | null;
  directions: { fr: string | null; en: string | null } | null;
  mediums: { fr: string[]; en: string[] } | null;
  owner: string | null;
  borough: string;
  supports: { fr: string[]; en: string[] } | null;
  accessibilities: { fr: string[]; en: string[] } | null;

  public getLocation(): { lat: number; lng: number } {
    return this.location;
  }
  public getAccessibilities(lang: "fr"): string {
    if (this.accessibilities) {
      if (lang == "fr") return this.accessibilities.fr.join(", ");
      else return this.accessibilities.en.join(", ");
    }
    return "";
  }
  public getTitle(): string {
    return this.title.fr || this.title.en || "(non titré)";
  }
  public getUrl(lang = "fr"): string {
    if (this.url == null) return "";

    if (lang == "fr") return this.url.fr;
    else return this.url.en;
  }

  public getArtists(): string {
    if (this.artists != undefined)
      return this.artists.map((artist) => artist.name).join(", ");

    return "";
  }

  public getCategories(lang = "fr"): string {
    if (this.categories == null) return "";

    if (lang == "fr") return this.categories.fr.join(", ");
    else return this.categories.en.join(", ");
  }

  public getDirections(): string {
    if (this.directions)
      // `direction` can also be null
      return this.directions.fr || this.directions.en || ""; // In case both `fr` and `en` are null

    return "";
  }

  public getDimensions(lang = "fr"): string {
    if (this.dimensions == null) return "";

    if (lang == "fr") return this.dimensions.fr[0].replaceAll("x", "×");
    else return this.dimensions.en[0].replaceAll("x", "×");
  }

  public getMaterials(lang = "fr"): string {
    if (this.materials == null) return "";

    if (lang == "fr") return this.materials.fr.join(", ");
    else return this.materials.en.join(", ");
  }

  public getTechniques(lang = "fr"): string {
    if (this.techniques == null) return "";

    if (lang == "fr") return this.techniques.fr.join(", ");
    else return this.techniques.en.join(", ");
  }
  public getMediums(lang = "fr"): string {
    if (this.mediums == null) return "";

    if (lang == "fr") return this.mediums.fr.join(", ");
    else return this.mediums.en.join(", ");
  }
  public getSupports(lang = "fr"): string {
    if (this.supports == null) return "";

    if (lang == "fr") return this.supports.fr.join(", ");
    else return this.supports.en.join(", ");
  }
  public getBorough(): string {
    return this.borough;
  }
  public getOwner(): string | null {
    return this.owner;
  }
}

export class Place extends Discovery {
  constructor(place: {
    id: number;
    title: string;
    website: string | null;
    usages: { fr: string[]; en: string[] };
    borough: string;
    territory: string;
    description: string | null;
    location: { lat: number; lng: number };
    address: string;
  }) {
    super();
    this.id = place.id;
    this.title = place.title;
    this.website = place.website;
    this.location = place.location;
    this.usages = place.usages;
    this.borough = place.borough;
    this.description = place.description;
    this.territory = place.territory;
    this.address = place.address;
  }

  dType = "place";
  id: number;
  title: string;
  website: string | null;
  location: { lat: number; lng: number };
  usages: { fr: string[]; en: string[] };
  borough: string;
  description: string | null;
  territory: string;
  address: string;

  public getLocation(): { lat: number; lng: number } {
    return this.location;
  }

  public getTitle(): string {
    return this.title;
  }
  public getUrl(): string {
    return this.website || "";
  }

  public getUsages(lang = "fr"): string {
    if (lang == "fr") return this.usages.fr.join(", ");
    else return this.usages.en.join(", ");
  }

  public getBorough(): string {
    return this.borough;
  }

  public getAddress(): string | null {
    return this.address || null;
  }
  public getOwner(): null {
    return null;
  }
}

export class Heritage extends Discovery {
  constructor(heritage: {
    id: number;
    title: string;
    url: string | null;
    territory: string;
    produced_at: string | null;
    description: string | null;
    location: { lat: number; lng: number };
    status: string;
    borough: string;
    synthesis: null;
    "sous-usages": string[];
    subUses: string[];
    functions: { fr: string[]; en: string[] };
    addresses: string[];
  }) {
    super();
    this.id = heritage.id;
    this.title = heritage.title;
    this.url = heritage.url;
    this.location = heritage.location;
    this.produced_at = heritage.produced_at;
    this.functions = heritage.functions;
    this.subUses = heritage["sous-usages"] || heritage.subUses; // "sous-usages" is the original key
    this.synthesis = heritage.synthesis;
    this.description = heritage.description;
    this.status = heritage.status;
    this.borough = heritage.borough;
    this.territory = heritage.territory;
    this.addresses = heritage.addresses;
  }

  dType = "heritage";
  id: number;
  title: string;
  url: string | null;
  borough: string;
  territory: string;
  produced_at: string | null;
  description: string | null;
  location: { lat: number; lng: number };
  functions: { fr: string[]; en: string[] };
  status: string;
  synthesis: null;
  subUses: string[];
  addresses: string[];

  public getLocation(): { lat: number; lng: number } {
    return this.location;
  }
  public getTitle(): string {
    return this.title;
  }
  public getUrl(): string {
      return this.url || "";
  }

  public getBorough(): string {
    return this.borough;
  }

  public getUsages(): string {
    return this.subUses.join(", ");
  }

  public getAddress(): string | null {
    if (this.addresses.length > 0) return this.addresses[0];
    else return null;
  }
  public getOwner(): null {
    return null;
  }

  public getStatus(): string {
    return this.status;
  }
  public getFunction(): string {
    return this.functions.fr.join(", ");
  }
}

export class Badge extends Discovery {
  constructor(badge: {
    id: number;
    title: { fr: string; en: string };
    required_count: number;
    description: { fr: string; en: string };
    notification: { fr: string; en: string };
    badgeable: { type: string; name: string };
    type: string | null;
  }) {
    super();
    this.id = badge.id;
    this.title = badge.title;
    this.required_count = badge.required_count;
    this.description = badge.description;
    this.notification = badge.notification;
    this.badgeable = badge.badgeable;
    this.type = badge.type;
  }

  dType = "badge";
  id: number;
  title: { fr: string; en: string };
  required_count: number;
  description: {
    fr: string;
    en: string;
  };
  notification: {
    fr: string;
    en: string;
  };
  badgeable: {
    type: string;
    name: string;
  };
  type: string | null;

  public getTitle(): string {
    return this.title.fr;
  }
}

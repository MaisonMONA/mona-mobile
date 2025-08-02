import { UserData } from "@/internal/databases/UserData";
import { useBadgesDB } from "@/stores/BadgesDB";
import { Artwork, Heritage, Place } from "@/internal/Types";
import Utils from "@/internal/Utils";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { useBadgesCollections } from "@/stores/BadgesCollections";

export class CollectedBadge {
  private static badgesDB = useBadgesDB();
  private static userCollection = UserData.getCollectedChronologically();
  private static obtainedBadges = [] as any;
  private static countCollection = [] as any;
  private static boroughCollection = [] as any;
  private static categoryCollection = [] as any;
  private static ownerCollection = [] as any;
  private static countPathLocked = "/assets/drawable/badges/count/locked/";
  private static countPathUnlocked = "/assets/drawable/badges/count/unlocked/";
  private static countPathUnlockedGrid = "/assets/drawable/badges/count/unlocked-grid/";

  private static boroughPathUnlocked =
    "/assets/drawable/badges/borough/unlocked/";
  private static boroughPathLocked = "/assets/drawable/badges/borough/locked/";
  private static boroughPathBlack = "/assets/drawable/badges/borough/black/";

  private static ownerPathUnlocked = "/assets/drawable/badges/owner/unlocked/";
  private static ownerPathLocked = "/assets/drawable/badges/owner/locked/";
  private static ownerPathBlack = "/assets/drawable/badges/owner/black/";

  private static categoryPathUnlocked =
    "/assets/drawable/badges/category/unlocked/";
  private static categoryPathLocked =
    "/assets/drawable/badges/category/locked/";
  private static categoryPathBlack =
    "/assets/drawable/badges/category/black/";

  public static determineCollectedBadges() {
    const tmpBoroughContainer = new Map<string, number>();
    const tmpOwnerContainer = new Map<string, number>();
    const tmpCategoryContainer = new Map<string, number>();
    const badgesCollectionsStore = useBadgesCollections();

    this.badgesDB = useBadgesDB();
    this.userCollection = UserData.getCollectedChronologically();

    for (const collectedElement of this.userCollection) {
      const element: Artwork | Place | Heritage | null = Utils.getDiscovery(
        collectedElement.id,
        collectedElement.dType,
      );
      const tmpBorough = element?.getBorough();
      const tmpOwner = element?.getOwner();
      const tmpCategory = element?.dType;

      if (tmpOwner) {
        const tmpCount = tmpOwnerContainer.get(tmpOwner);
        tmpCount
          ? tmpOwnerContainer.set(tmpOwner, tmpCount + 1)
          : tmpOwnerContainer.set(tmpOwner, 1);
      }
      if (tmpCategory) {
        const tmpCount = tmpCategoryContainer.get(tmpCategory);
        tmpCount
          ? tmpCategoryContainer.set(tmpCategory, tmpCount + 1)
          : tmpCategoryContainer.set(tmpCategory, 1);
      }
      if (tmpBorough) {
        const tmpCount = tmpBoroughContainer.get(tmpBorough);
        tmpCount
          ? tmpBoroughContainer.set(tmpBorough, tmpCount + 1)
          : tmpBoroughContainer.set(tmpBorough, 1);
      }
    }

    this.countCollection = this.countBadge();
    this.boroughCollection = this.boroughBadge(tmpBoroughContainer);
    this.categoryCollection = this.categoryBadge(tmpCategoryContainer);
    this.ownerCollection = this.ownerBadge(tmpOwnerContainer);

    this.obtainedBadges = [
      ...this.countCollection,
      ...this.boroughCollection,
      ...this.categoryCollection,
      ...this.ownerCollection,
    ];
    this.obtainedBadges.map((badge: any) => {
      UserData.addCollectedBadge(badge);
    });
    console.log("Collected badges fetched and set in UserData.data.collected.badges");
  }

  static countBadge() {
    const countCollected = [];
    for (const element of this.badgesDB.getCount()) {
      if (element?.required_count <= this.userCollection.length) {
        countCollected.push({
          id: element.id,
          src: this.countPathUnlocked + element.id + ".svg",
          gridSrc: this.countPathUnlockedGrid + element.id + ".svg",
          notification: element?.notification.fr,
          description: element?.description.fr,
          message: element?.notification.fr,
          requireCount: element?.required_count,
          title: element?.title.fr,
          dType: null,
          type: "count",
        });
      }
    }
    return countCollected;
  }

  static boroughBadge(elements: Map<string, number>) {
    const boroughCollected = [];

    for (const boroughElementID of this.badgesDB.borough) {
      const boroughElement = BadgeDatabase.getFromId(boroughElementID);
      const title = boroughElement?.getTitle();
      if (title) {
        if (elements.has(title)) {
          const count = elements.get(title);
          const requireCount = boroughElement?.required_count;
          boroughCollected.push({
            id: boroughElementID,
            notification: boroughElement?.notification.fr,
            description: boroughElement?.description.fr,
            requireCount: requireCount,
            count: count,
            src: this.findPath(
              requireCount,
              count,
              boroughElementID,
              "borough",
            ),
            gridSrc: this.findGridPath(
              requireCount,
              count,
              boroughElementID,
              "borough",
            ),
            message: boroughElement?.description.fr,
            title: title,
            dType: null,
            type: "borough",
          });
        }
      }
    }
    return boroughCollected;
  }

  static categoryBadge(elements: Map<string, number>) {
    const categoryCollected = [];
    for (const e of this.badgesDB.category) {
      const categoryElementID = e[0];
      const categoryName = e[1];
      const categoryElement = BadgeDatabase.getFromId(categoryElementID);
      if (elements.has(categoryName)) {
        const count = elements.get(categoryName);
        const requireCount = categoryElement?.required_count;
        categoryCollected.push({
          id: categoryElementID,
          notification: categoryElement?.notification.fr,
          description: categoryElement?.description.fr,
          requireCount: requireCount,
          count: count,
          src: this.findPath(
            requireCount,
            count,
            categoryElementID,
            "category",
          ),
          gridSrc: this.findGridPath(
            requireCount,
            count,
            categoryElementID,
            "category",
          ),
          message: categoryElement?.description.fr,
          title: categoryElement?.title,
          dType: this.badgesDB.category.get(categoryElementID),
          type: "category",
        });
      }
    }
    return categoryCollected;
  }

  static ownerBadge(elements: Map<string, number>) {
    const ownerCollected = [];
    for (const e of this.badgesDB.owner) {
      const ownerElementID = e[0];
      const ownerName = e[1];
      const ownerElement = BadgeDatabase.getFromId(ownerElementID);
      if (elements.has(ownerName)) {
        const count = elements.get(ownerName);
        const requireCount = ownerElement?.required_count;
        ownerCollected.push({
          id: ownerElementID,
          notification: ownerElement?.notification.fr,
          description: ownerElement?.description.fr,
          requireCount: requireCount,
          count: count,
          src: this.findPath(
            requireCount,
            count,
            ownerElementID,
            "owner",
          ),
          gridSrc: this.findGridPath(
            requireCount,
            count,
            ownerElementID,
            "owner",
          ),
          message: ownerElement?.description.fr,
          title: this.badgesDB.owner.get(ownerElementID),
          dType: null,
          type: "owner",
        });
      }
    }
    return ownerCollected;
  }

  static findPath(
    requireCount: number | undefined,
    count: number | undefined,
    id: number,
    type: string,
  ) {
    let pathLocked = "";
    let pathUnlocked = "";
    switch (type) {
      case "borough":
        pathLocked = this.boroughPathLocked;
        pathUnlocked = this.boroughPathUnlocked;
        break;
      case "owner":
        pathLocked = this.ownerPathLocked;
        pathUnlocked = this.ownerPathUnlocked;
        break;
      case "category":
        pathLocked = this.categoryPathLocked;
        pathUnlocked = this.categoryPathUnlocked;
        break;
    }

    if (requireCount && count) {
      if (count >= requireCount) {
        this.obtainedBadges.push(BadgeDatabase.getFromId(id));
        return pathUnlocked + id + ".svg";
      } else {
        return pathLocked + id + ".svg";
      }
    }
    return pathLocked + id + ".svg";
  }

  static findGridPath(
    requireCount: number | undefined,
    count: number | undefined,
    id: number,
    type: string,
  ) {
    let pathLocked = "";
    let pathUnlocked = "";
    let pathBlack = "";
    switch (type) {
      case "borough":
        pathLocked = this.boroughPathLocked;
        pathUnlocked = this.boroughPathUnlocked;
        pathBlack = this.boroughPathBlack;
        break;
      case "owner":
        pathLocked = this.ownerPathLocked;
        pathUnlocked = this.ownerPathUnlocked;
        pathBlack = this.ownerPathBlack;
        break;
      case "category":
        pathLocked = this.categoryPathLocked;
        pathUnlocked = this.categoryPathUnlocked;
        pathBlack = this.categoryPathBlack;
        break;
    }

    if (requireCount && count) {
      if (count >= requireCount) {
        // Badge is UNLOCKED - use black for grid
        return pathBlack + id + ".svg";
      } else if (count > 0) {
        // Badge is IN PROGRESS - use unlocked for grid
        return pathUnlocked + id + ".svg";
      } else {
        // Badge is LOCKED - use locked for grid
        return pathLocked + id + ".svg";
      }
    }
    return pathLocked + id + ".svg";
  }
}

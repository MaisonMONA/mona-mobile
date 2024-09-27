import { UserData } from "@/internal/databases/UserData";
import { useBadgesDB } from "@/stores/BadgesDB";
import { Artwork, Heritage, Place } from "@/internal/Types";
import Utils from "@/internal/Utils";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";

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

  private static boroughPathUnlocked =
    "/assets/drawable/badges/borough/unlocked/";
  private static boroughPathLocked = "/assets/drawable/badges/borough/locked/";

  private static ownerPathUnlocked = "/assets/drawable/badges/owner/unlocked/";
  private static ownerPathLocked = "/assets/drawable/badges/owner/locked/";

  private static categoryPathUnlocked =
    "/assets/drawable/badges/category/unlocked/";
  private static categoryPathLocked =
    "/assets/drawable/badges/category/locked/";

  public static determineCollectedBadges() {
    const tmpBoroughContainer = new Map<string, number>();
    const tmpOwnerContainer = new Map<string, number>();
    const tmpCategoryContainer = new Map<string, number>();

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
          boroughCollected.push({
            id: boroughElementID,
            notification: boroughElement?.notification.fr,
            description: boroughElement?.description.fr,
            requireCount: boroughElement?.required_count,
            count: elements.get(title),
            src: this.findPath(
              boroughElement?.required_count,
              elements.get(title),
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
        categoryCollected.push({
          id: categoryElementID,
          notification: categoryElement?.notification.fr,
          description: categoryElement?.description.fr,
          requireCount: categoryElement?.required_count,
          count: elements.get(categoryName),
          src: this.findPath(
            categoryElement?.required_count,
            elements.get(categoryName),
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
        ownerCollected.push({
          id: ownerElementID,
          notification: ownerElement?.notification.fr,
          description: ownerElement?.description.fr,
          requireCount: ownerElement?.required_count,
          count: elements.get(ownerName),
          src: this.findPath(
            ownerElement?.required_count,
            elements.get(ownerName),
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
}

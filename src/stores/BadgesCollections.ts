import { defineStore } from "pinia";
import Utils from "@/internal/Utils";
import { useBadgesDB } from "@/stores/BadgesDB";
import { UserData } from "@/internal/databases/UserData";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Artwork, Heritage, Place } from "@/internal/Types";
import { UserBadges } from "@/internal/UserBadges";

const countPathLocked = "drawable/badges/count/locked/";
const countPathUnlocked = "drawable/badges/count/unlocked/";

const boroughPathUnlocked = "drawable/badges/borough/unlocked/";
const boroughPathLocked = "drawable/badges/borough/locked/";

const ownerPathUnlocked = "drawable/badges/owner/unlocked/";
const ownerPathLocked = "drawable/badges/owner/locked/";

const categoryPathUnlocked = "drawable/badges/category/unlocked/";
const categoryPathLocked = "drawable/badges/category/locked/";

export const useBadgesCollections = defineStore("badgesCollectionStore", {
  state: () => {
    return {
      newBadgeAnimation: false as boolean,
      badgesDB: useBadgesDB(),
      userCollectedDiscovery: UserData.getCollectedChronologically(),
      userCollectedBadges: UserData.getCollectedBadges(),
      userCount: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "count";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      userBorough: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "borough";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      userCategory: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "category";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      userOwner: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "owner";
        })
        .map((badge: any) => {
          return badge.id;
        }),

      countCollection: [] as any,
      boroughCollection: [] as any,
      categoryCollection: [] as any,
      ownerCollection: [] as any,
    };
  },

  actions: {
    //TODO: écrire la fonction pour récupérer les badges dans le local storage
    //TODO: écrire la fonction qui modifie le state des badges -> NewCollection.newBadge()

    badgeCollection() {
      const tmpBoroughContainer = new Map<string, number>();
      const tmpOwnerContainer = new Map<string, number>();
      const tmpCategoryContainer = new Map<string, number>();
      for (const collectedElement of this.userCollectedDiscovery) {
        const element: Artwork | Place | Heritage | null = Utils.getDiscovery(
          collectedElement.id,
          collectedElement.dType
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
      this.countBadge();
      this.boroughBadge();
      this.categoryBadge();
      this.ownerBadge();
    },
    countBadge() {
      const countCollected = [];

      for (const element of this.badgesDB.getCount()) {
        if (this.userCount.includes(element.id)) {
          countCollected.push(UserData.getCollectedBadge(element.id));
        } else {
          countCollected.push({
            id: element.id,
            src: countPathLocked + element.id + ".svg",
            notification: element?.notification.fr,
            description: element?.description.fr,
            message: element?.notification.fr,
            requireCount: element?.required_count,
            title: element?.title.fr,
            dType: "badge",
            type: "count",
          });
        }
      }
      this.countCollection = countCollected;
    },
    boroughBadge() {
      const boroughCollected = [];

      for (const boroughElementID of this.badgesDB.borough) {
        const boroughElement = BadgeDatabase.getFromId(boroughElementID);
        const title = boroughElement?.getTitle();
        if (this.userBorough.includes(boroughElementID)) {
          boroughCollected.push(UserData.getCollectedBadge(boroughElementID));
        } else {
          boroughCollected.push({
            id: boroughElementID,
            notification: boroughElement?.notification.fr,
            description: boroughElement?.description.fr,
            requireCount: boroughElement?.required_count,
            count: 0,
            src: boroughPathLocked + boroughElementID + ".svg",
            message: boroughElement?.description.fr,
            title: title,
            dType: "badge",
            type: "borough",
          });
        }
      }
      this.boroughCollection = boroughCollected;
    },
    categoryBadge() {
      const categoryCollected = [];
      for (const e of this.badgesDB.category) {
        const categoryElementID = e[0];
        const categoryElement = BadgeDatabase.getFromId(categoryElementID);

        if (this.userCategory.includes(categoryElementID)) {
          categoryCollected.push(UserData.getCollectedBadge(categoryElementID));
        } else {
          categoryCollected.push({
            id: categoryElementID,
            notification: categoryElement?.notification.fr,
            description: categoryElement?.description.fr,
            requireCount: categoryElement?.required_count,
            count: 0,
            src: categoryPathLocked + categoryElementID + ".svg",
            message: categoryElement?.description.fr,
            title: categoryElement?.title,
            dType: "badge",
            type: "category",
          });
        }
      }
      this.categoryCollection = categoryCollected;
    },
    ownerBadge() {
      const ownerCollected = [];
      for (const e of this.badgesDB.owner) {
        const ownerElementID = e[0];
        const ownerElement = BadgeDatabase.getFromId(ownerElementID);
        if (this.userOwner.includes(ownerElementID)) {
          ownerCollected.push(UserData.getCollectedBadge(ownerElementID));
        } else {
          ownerCollected.push({
            id: ownerElementID,
            notification: ownerElement?.notification.fr,
            description: ownerElement?.description.fr,
            requireCount: ownerElement?.required_count,
            count: 0,
            src: ownerPathLocked + ownerElementID + ".svg",
            message: ownerElement?.description.fr,
            title: ownerElement?.title,
            dType: "badge",
            type: "owner",
          });
        }
      }
      this.ownerCollection = ownerCollected;
    },

    // newBadgeCompleted() {
    //   return (this.newBadgeAnimation = true);
    // },
  },
});

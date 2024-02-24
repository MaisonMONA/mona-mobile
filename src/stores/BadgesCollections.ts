import { defineStore } from "pinia";
import Utils from "@/internal/Utils";
import { useBadgesDB } from "@/stores/BadgesDB";
import { UserData } from "@/internal/databases/UserData";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Artwork, Heritage, Place } from "@/internal/Types";

const countPathLocked = "src/assets/drawable/badges/count/locked/";
const countPathUnlocked = "src/assets/drawable/badges/count/unlocked/";

const boroughPathUnlocked = "src/assets/drawable/badges/borough/unlocked/";
const boroughPathLocked = "src/assets/drawable/badges/borough/locked/";

const ownerPathUnlocked = "src/assets/drawable/badges/owner/unlocked/";
const ownerPathLocked = "src/assets/drawable/badges/owner/locked/";

const categoryPathUnlocked = "src/assets/drawable/badges/category/unlocked/";
const categoryPathLocked = "src/assets/drawable/badges/category/locked/";

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
  getters: {
    getBoroughOwnerCollection(): any[] {
      return this.boroughCollection.concat(this.ownerCollection);
    },
  },

  actions: {
    badgeCollection() {
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
            dType: null,
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
            dType: null,
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
            dType: this.badgesDB.category.get(categoryElementID),
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
            title: this.badgesDB.owner.get(ownerElementID),
            dType: null,
            type: "owner",
          });
        }
      }
      this.ownerCollection = ownerCollected;
    },
    newBadge(id: number, dType: string) {
      this.badgeCollection();
      const element: Artwork | Place | Heritage | null = Utils.getDiscovery(
        id,
        dType,
      );
      const tmpBorough = element?.getBorough();
      const tmpOwner = element?.getOwner();
      const tmpCategory = element?.dType;
      this.newBoroughBadge(tmpBorough);
      this.newCategoryBadge(tmpCategory);
      this.newOwnerBadge(tmpOwner);
      this.newCountBadge();
    },
    newBoroughBadge(borough: string | undefined) {
      if (borough) {
        for (const elem of this.boroughCollection) {
          if (elem.title === borough) {
            elem.count++;
            if (elem.count === elem.requireCount) {
              elem.src = boroughPathUnlocked + elem.id + ".svg";
              console.log("borough unlocked");
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newCategoryBadge(category: string | undefined) {
      if (category) {
        for (const elem of this.categoryCollection) {
          if (elem.dType === category) {
            elem.count++;
            if (elem.count === elem.requireCount) {
              elem.src = categoryPathUnlocked + elem.id + ".svg";
              console.log("category unlocked");
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newOwnerBadge(owner: string | null | undefined) {
      if (owner) {
        for (const elem of this.ownerCollection) {
          console.log(elem.title === owner);
          if (elem.title === owner) {
            console.log("in if");
            elem.count++;
            if (elem.count === elem.requireCount) {
              elem.src = ownerPathUnlocked + elem.id + ".svg";
              console.log("owner unlocked");
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newCountBadge() {
      for (const elem of this.countCollection) {
        if (elem.src.includes(countPathLocked)) {
          if (elem.requireCount === this.userCollectedBadges.length + 1) {
            elem.src = countPathUnlocked + elem.id + ".svg";
            console.log("count unlocked");
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    // newBadgeCompleted() {
    //   return (this.newBadgeAnimation = true);
    // },
  },
});

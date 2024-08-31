import { defineStore } from "pinia";
import Utils from "@/internal/Utils";
import { useBadgesDB } from "@/stores/BadgesDB";
import { UserData } from "@/internal/databases/UserData";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Artwork, Heritage, Place } from "@/internal/Types";

const countPathLocked = "/assets/drawable/badges/count/locked/";
const countPathUnlocked = "/assets/drawable/badges/count/unlocked/";

const boroughPathUnlocked = "/assets/drawable/badges/borough/unlocked/";
const boroughPathLocked = "/assets/drawable/badges/borough/locked/";

const ownerPathUnlocked = "/assets/drawable/badges/owner/unlocked/";
const ownerPathLocked = "/assets/drawable/badges/owner/locked/";

const categoryPathUnlocked = "/assets/drawable/badges/category/unlocked/";
const categoryPathLocked = "/assets/drawable/badges/category/locked/";

export const useBadgesCollections = defineStore("badgesCollectionStore", {
  state: () => {
    return {
      newBadgeAnimation: false as boolean,
      badgesDB: useBadgesDB(),
      userCollectedDiscovery: UserData.getCollectedChronologically(),
      userCollectedBadges: UserData.getCollectedBadges(),

      // Make arrays with ids of the corresponding collected badges
      collectedCountBadgesId: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "count";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      collectedBoroughBadgesId: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "borough";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      collectedCategoryBadgesId: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "category";
        })
        .map((badge: any) => {
          return badge.id;
        }),
      ownerCategoryBadgesId: UserData.getCollectedBadges()
        .filter((badge: any) => {
          return badge.type === "owner";
        })
        .map((badge: any) => {
          return badge.id;
        }),

      // Badges collections ?
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

    // Instantiate the badges to show for each type of badges
    instantiateBadgesToShow() {
      this.instantiateCountBadges();
      this.instantiateBoroughBadges();
      this.instantiateCategoryBadges();
      this.instantiateOwnerBadges();
    },

    instantiateCountBadges() {
      const countBadgesArray = [];

      for (const countBadge of this.badgesDB.getCount()) {
        if (this.collectedCountBadgesId.includes(countBadge.id)) {
          // Collected badge
          countBadgesArray.push(UserData.getCollectedBadge(countBadge.id));
        } else {
          // Uncollected badge
          countBadgesArray.push({
            id: countBadge.id,
            src: countPathLocked + countBadge.id + ".svg",
            notification: countBadge?.notification.fr,
            description: countBadge?.description.fr,
            message: countBadge?.notification.fr,
            requireCount: countBadge?.required_count,
            title: countBadge?.title.fr,
            dType: null,
            type: "count",
          });
        }
      }
      this.countCollection = countBadgesArray;
    },

    instantiateBoroughBadges() {
      const boroughBadgesArray = [];

      for (const boroughElementID of this.badgesDB.borough) {
        const boroughElement = BadgeDatabase.getFromId(boroughElementID);
        const title = boroughElement?.getTitle();
        if (this.collectedBoroughBadgesId.includes(boroughElementID)) {
          // Collected or in progress badge
          boroughBadgesArray.push(UserData.getCollectedBadge(boroughElementID));
        } else {
          // Uncollected badge
          boroughBadgesArray.push({
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
      this.boroughCollection = boroughBadgesArray;
    },

    instantiateCategoryBadges() {
      const categoryBadgesArray = [];
      for (const e of this.badgesDB.category) {
        const categoryElementID = e[0];
        const categoryElement = BadgeDatabase.getFromId(categoryElementID);

        if (this.collectedCategoryBadgesId.includes(categoryElementID)) {
          // Collected or in progress badge
          categoryBadgesArray.push(UserData.getCollectedBadge(categoryElementID));
        } else {
          // Uncollected badge
          categoryBadgesArray.push({
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
      this.categoryCollection = categoryBadgesArray;
    },

    instantiateOwnerBadges() {
      const ownerBadgesArray = [];
      for (const e of this.badgesDB.owner) {
        const ownerElementID = e[0];
        const ownerElement = BadgeDatabase.getFromId(ownerElementID);
        if (this.ownerCategoryBadgesId.includes(ownerElementID)) {
          // Collected or in progress badge
          ownerBadgesArray.push(UserData.getCollectedBadge(ownerElementID));
        } else {
          // Uncollected badge
          ownerBadgesArray.push({
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
      this.ownerCollection = ownerBadgesArray;
    },

    // Updates badges (augment count and/or change picture) with new discovery passed in
    newBadge(id: number, dType: string) {
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

      // Update badges to show
      this.instantiateBadgesToShow();
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

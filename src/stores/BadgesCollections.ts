import { defineStore } from "pinia";
import Utils from "@/internal/Utils";
import { eventBus } from "@/internal/eventBus";
import { useBadgesDB } from "@/stores/BadgesDB";
import { UserData } from "@/internal/databases/UserData";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Artwork, Heritage, Place } from "@/internal/Types";
import { toastController } from "@ionic/vue";

const countPathLocked = "/assets/drawable/badges/count/locked/";
const countPathUnlocked = "/assets/drawable/badges/count/unlocked/";

const boroughPathUnlocked = "/assets/drawable/badges/borough/unlocked/";
const boroughPathLocked = "/assets/drawable/badges/borough/locked/";

const ownerPathUnlocked = "/assets/drawable/badges/owner/unlocked/";
const ownerPathLocked = "/assets/drawable/badges/owner/locked/";

const categoryPathUnlocked = "/assets/drawable/badges/category/unlocked/";
const categoryPathLocked = "/assets/drawable/badges/category/locked/";

const territoryPathUnlocked = "/assets/drawable/badges/territory/unlocked/";
const territoryPathLocked = "/assets/drawable/badges/territory/locked/";

const fallbackBadgePath = "/assets/drawable/badges/fallback-badge.svg";

export const useBadgesCollections = defineStore("badgesCollectionStore", {
  state: () => {
    return {
      newBadgeAnimation: false as boolean,
      badgesDB: useBadgesDB(),
      userCollectedDiscovery: UserData.getCollectedChronologically(),
      userCollectedBadges: UserData.getCollectedBadges(),

      // Badges collections
      countCollection: [] as any,
      boroughCollection: [] as any,
      categoryCollection: [] as any,
      ownerCollection: [] as any,
      territoryCollection: [] as any,
    };
  },
  getters: {
    getFallbackBadgePath(): string {
      return fallbackBadgePath;
    },

    getCompletedBadges(): number {
      return this.userCollectedBadges.filter((badge: any) => {
        // Check if the badge is collected and its src contains 'unlocked'
        return badge.src.includes('unlocked');
      }).length;
    },

    getBoroughOwnerCollection(): any[] {
      return this.boroughCollection.concat(this.ownerCollection, this.territoryCollection);
    },

    // Make arrays with ids of the corresponding collected badges
    collectedCountBadgesId(): number[] {
      return this.userCollectedBadges
          .filter((badge: any) => badge.type === "count")
          .map((badge: any) => badge.id);
    },
    collectedBoroughBadgesId(): number[] {
      return this.userCollectedBadges
          .filter((badge: any) => badge.type === "borough")
          .map((badge: any) => badge.id);
    },
    collectedCategoryBadgesId(): number[] {
      return this.userCollectedBadges
          .filter((badge: any) => badge.type === "category")
          .map((badge: any) => badge.id);
    },
    ownerCategoryBadgesId(): number[] {
      return this.userCollectedBadges
          .filter((badge: any) => badge.type === "owner")
          .map((badge: any) => badge.id);
    },
    collectedTerritoryBadgesId(): number[] {
      return this.userCollectedBadges
          .filter((badge: any) => badge.type === "territory")
          .map((badge: any) => badge.id);
    },
  },

  actions: {
    // Show a toast notification when a badge is unlocked
    async showBadgeNotification(badgeId: number) {
      const badge = BadgeDatabase.getFromId(badgeId);
      if (!badge) {
        return;
      }
      
      // Find the full badge data with the unlocked image
      const allBadges = [
        ...this.countCollection,
        ...this.boroughCollection,
        ...this.categoryCollection,
        ...this.ownerCollection,
        ...this.territoryCollection,
      ];
      
      const fullBadgeData = allBadges.find(b => b.id === badgeId);
      
      if (fullBadgeData) {
        const eventData = {
          ...fullBadgeData,
          notification: badge.notification,
          title: badge.title
        };
        
        // Emit event to show modal globally
        eventBus.emit('badge-unlocked', eventData);
      }
    },

    // Instantiate the badges to show for each type of badges
    instantiateBadgesToShow() {
      this.userCollectedBadges = UserData.getCollectedBadges(); // Update userCollectedBadges
      this.instantiateCountBadges();
      this.instantiateBoroughBadges();
      this.instantiateCategoryBadges();
      this.instantiateOwnerBadges();
      this.instantiateTerritoryBadges();
    },

    instantiateCountBadges() {
      const countBadgesArray = [];
      const discoveryCount = this.userCollectedDiscovery.length;
    
      for (const countBadge of this.badgesDB.getCount()) {
        if (this.collectedCountBadgesId.includes(countBadge.id)) {
          // Get badge from UserData but ensure it has count property
          const collectedBadge = UserData.getCollectedBadge(countBadge.id);
          collectedBadge.count = discoveryCount; // Set proper count
          collectedBadge.gridSrc = countPathUnlocked + countBadge.id + ".svg"; // Add grid source
          countBadgesArray.push(collectedBadge);
        } else {
          // Uncollected badge
          countBadgesArray.push({
            id: countBadge.id,
            src: countPathLocked + countBadge.id + ".svg",
            gridSrc: countPathLocked + countBadge.id + ".svg", // Locked badges use same image for grid
            notification: countBadge?.notification.fr,
            description: countBadge?.description.fr,
            message: countBadge?.notification.fr,
            requireCount: countBadge?.required_count,
            title: countBadge?.title.fr,
            dType: null,
            type: "count",
            count: discoveryCount // Add count property
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
          const collectedBadge = UserData.getCollectedBadge(boroughElementID);
          // Add gridSrc for round grid badges
          if (collectedBadge.count >= collectedBadge.requireCount) {
            // Badge is UNLOCKED - use unlocked for grid
            collectedBadge.gridSrc = boroughPathUnlocked + boroughElementID + ".svg";
          } else {
            // Badge is IN PROGRESS - use unlocked for grid
            collectedBadge.gridSrc = boroughPathUnlocked + boroughElementID + ".svg";
          }
          boroughBadgesArray.push(collectedBadge);
        } else {
          // Uncollected badge
          boroughBadgesArray.push({
            id: boroughElementID,
            notification: boroughElement?.notification.fr,
            description: boroughElement?.description.fr,
            requireCount: boroughElement?.required_count,
            count: 0,
            src: boroughPathLocked + boroughElementID + ".svg",
            gridSrc: boroughPathLocked + boroughElementID + ".svg", // Locked badges use same for grid
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
          const collectedBadge = UserData.getCollectedBadge(categoryElementID);
          // Add gridSrc for round grid badges
          if (collectedBadge.count >= collectedBadge.requireCount) {
            // Badge is UNLOCKED - use unlocked for grid
            collectedBadge.gridSrc = categoryPathUnlocked + categoryElementID + ".svg";
          } else {
            // Badge is IN PROGRESS - use unlocked for grid
            collectedBadge.gridSrc = categoryPathUnlocked + categoryElementID + ".svg";
          }
          categoryBadgesArray.push(collectedBadge);
        } else {
          // Uncollected badge
          categoryBadgesArray.push({
            id: categoryElementID,
            notification: categoryElement?.notification.fr,
            description: categoryElement?.description.fr,
            requireCount: categoryElement?.required_count,
            count: 0,
            src: categoryPathLocked + categoryElementID + ".svg",
            gridSrc: categoryPathLocked + categoryElementID + ".svg", // Locked badges use same for grid
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
          const collectedBadge = UserData.getCollectedBadge(ownerElementID);
          // Add gridSrc for round grid badges
          if (collectedBadge.count >= collectedBadge.requireCount) {
            // Badge is UNLOCKED - use unlocked for grid
            collectedBadge.gridSrc = ownerPathUnlocked + ownerElementID + ".svg";
          } else {
            // Badge is IN PROGRESS - use unlocked for grid
            collectedBadge.gridSrc = ownerPathUnlocked + ownerElementID + ".svg";
          }
          ownerBadgesArray.push(collectedBadge);
        } else {
          // Uncollected badge
          ownerBadgesArray.push({
            id: ownerElementID,
            notification: ownerElement?.notification.fr,
            description: ownerElement?.description.fr,
            requireCount: ownerElement?.required_count,
            count: 0,
            src: ownerPathLocked + ownerElementID + ".svg",
            gridSrc: ownerPathLocked + ownerElementID + ".svg", // Locked badges use same for grid
            message: ownerElement?.description.fr,
            title: this.badgesDB.owner.get(ownerElementID),
            dType: null,
            type: "owner",
          });
        }
      }
      this.ownerCollection = ownerBadgesArray;
    },

    instantiateTerritoryBadges() {
      const territoryBadgesArray = [];
      for (const e of this.badgesDB.territory) {
        const territoryElementID = e[0];
        const territoryElement = BadgeDatabase.getFromId(territoryElementID);
        if (this.collectedTerritoryBadgesId.includes(territoryElementID)) {
          const collectedBadge = UserData.getCollectedBadge(territoryElementID);
          if (collectedBadge.count >= collectedBadge.requireCount) {
            collectedBadge.gridSrc = territoryPathUnlocked + territoryElementID + ".svg";
          } else {
            collectedBadge.gridSrc = territoryPathUnlocked + territoryElementID + ".svg";
          }
          territoryBadgesArray.push(collectedBadge);
        } else {
          territoryBadgesArray.push({
            id: territoryElementID,
            notification: territoryElement?.notification.fr,
            description: territoryElement?.description.fr,
            requireCount: territoryElement?.required_count,
            count: 0,
            src: territoryPathLocked + territoryElementID + ".svg",
            gridSrc: territoryPathLocked + territoryElementID + ".svg",
            message: territoryElement?.description.fr,
            title: this.badgesDB.territory.get(territoryElementID),
            dType: null,
            type: "territory",
          });
        }
      }
      this.territoryCollection = territoryBadgesArray;
    },

    // Updates badges (augment count and/or change picture) with new discovery passed in
    newBadge(id: number, dType: string) {
      const element: Artwork | Place | Heritage | null = Utils.getDiscovery(
        id,
        dType,
      );
      this.userCollectedDiscovery = UserData.getCollectedChronologically(); // Update userCollectedDiscovery
      const tmpBorough = element?.getBorough();
  const tmpOwner = element?.getOwner();
  const tmpTerritory = element?.getTerritory();
      const tmpCategory = element?.dType;
      this.newBoroughBadge(tmpBorough);
      this.newCategoryBadge(tmpCategory);
      this.newOwnerBadge(tmpOwner);
  this.newTerritoryBadge(tmpTerritory);
      this.newCountBadge();

      // Update badges to show
      this.instantiateBadgesToShow();
    },
    newBoroughBadge(borough: string | undefined) {
      if (borough) {
        for (const elem of this.boroughCollection) {
          if (elem.title === borough) {
            elem.count++;
            // Check if the badge is newly completed
            if (elem.count === elem.requireCount) {
              elem.src = boroughPathUnlocked + elem.id + ".svg";
              elem.gridSrc = boroughPathUnlocked + elem.id + ".svg";
              // Show notification for newly unlocked badge
              this.showBadgeNotification(elem.id);
            } else {
              // Badge is in progress - grid uses unlocked, modal keeps locked
              elem.gridSrc = boroughPathUnlocked + elem.id + ".svg";
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newCategoryBadge(category: string | undefined) {
      if (category) {
        for (const elem of this.categoryCollection) {
          if (elem.dType === category || 
              (elem.dType === "places" && category === "place")) {
            elem.count++;
            // Check if the badge is newly completed
            if (elem.count === elem.requireCount) {
              elem.src = categoryPathUnlocked + elem.id + ".svg"; // Modal uses unlocked
              elem.gridSrc = categoryPathUnlocked + elem.id + ".svg";
              // Show notification for newly unlocked badge
              this.showBadgeNotification(elem.id);
            } else {
              // Badge is in progress - grid uses unlocked, modal keeps locked
              elem.gridSrc = categoryPathUnlocked + elem.id + ".svg";
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newOwnerBadge(owner: string | null | undefined) {
      if (owner) {
        for (const elem of this.ownerCollection) {
          if (elem.title === owner) {
            elem.count++;
            // Check if the badge is newly completed
            if (elem.count === elem.requireCount) {
              elem.src = ownerPathUnlocked + elem.id + ".svg"; // Modal uses unlocked
              elem.gridSrc = ownerPathUnlocked + elem.id + ".svg";
              // Show notification for newly unlocked badge
              this.showBadgeNotification(elem.id);
            } else {
              // Badge is in progress - grid uses unlocked, modal keeps locked
              elem.gridSrc = ownerPathUnlocked + elem.id + ".svg";
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newTerritoryBadge(territory: string | undefined) {
      if (territory) {
        for (const elem of this.territoryCollection) {
          if (elem.title === territory) {
            elem.count++;
            if (elem.count === elem.requireCount) {
              elem.src = territoryPathUnlocked + elem.id + ".svg";
              elem.gridSrc = territoryPathUnlocked + elem.id + ".svg";
              this.showBadgeNotification(elem.id);
            } else {
              elem.gridSrc = territoryPathUnlocked + elem.id + ".svg";
            }
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
    newCountBadge() {
      for (const elem of this.countCollection) {
        // Check if a locked badge has to be unlocked
        if (elem.src.includes(countPathLocked)) {
          if (elem.requireCount === this.userCollectedDiscovery.length) {
            elem.src = countPathUnlocked + elem.id + ".svg";
            elem.gridSrc = countPathUnlocked + elem.id + ".svg"; // Update grid source too
            // Ensure the badge has its description and notification for the modal
            const badgeFromDB = BadgeDatabase.getFromId(elem.id);
            if (badgeFromDB) {
              if (badgeFromDB.description?.fr) {
                elem.description = badgeFromDB.description.fr;
              }
              if (badgeFromDB.notification?.fr) {
                elem.notification = badgeFromDB.notification.fr;
              }
            }
            // Show notification for newly unlocked badge
            this.showBadgeNotification(elem.id);
            UserData.addCollectedBadge(elem);
          }
        }
      }
    },
  },
});
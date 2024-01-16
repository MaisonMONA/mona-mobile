import { defineStore } from "pinia";
import Utils from "@/internal/Utils";
import { useBadgesDB } from "@/stores/BadgesDB";
import { UserData } from "@/internal/databases/UserData";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Artwork, Heritage, Place } from "@/internal/Types";

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
      fakeUserBadgesCollection: [
        {
          id: 1041,
          dType: "artwork",
          filename: "QGtKkoYram7EmcnrFzw1ezfUGHZ07VJxT2ufKfDy.jpg",
          rating: 4,
          comment: "un peu petit",
        },
        {
          id: 726,
          dType: "artwork",
          filename: "g2EpM6Xy8kE9vyJL4ELblxaUyfm3tWeQL7CtT0I8.jpg",
          rating: 3,
          comment: "test",
        },
        {
          id: 585,
          dType: "artwork",
          filename: "gLYTVNm4zCxVdgahaJ6Fg8t7xShNLD4vUXuTzxHI.jpg",
          rating: 5,
          comment: "test api 33 capacitor 5",
        },
        {
          id: 423,
          dType: "artwork",
          filename: "jHIk3jtlZ3vLiJlpXfpMPjxoSdNbRcAFIjorP50G.jpg",
          rating: 5,
          comment: "tres métallique",
        },
        {
          id: 374,
          dType: "artwork",
          filename: "ErrorPhoto.jpg",
          rating: 5,
          comment: "représente bien l'automne",
        },
        {
          id: 290,
          dType: "artwork",
          filename: "p3aZ0L3djLW089FtODpKueT7lsVfsgwZelc2ZLON.jpg",
          rating: 3,
          comment: "test take pictures",
        },
        {
          id: 289,
          dType: "artwork",
          filename: "ErrorPhoto.jpg",
          rating: 5,
          comment: "vibrant",
        },
        {
          id: 837,
          dType: "place",
          filename: "oifOWw6xEBxEILGhZqNRNs8YCEqeeWHuuP83Q2JF.jpg",
          rating: 3,
          comment: "#test",
        },
        {
          id: 214,
          dType: "artwork",
          filename: "ErrorPhoto.jpg",
          rating: 4,
          comment: "le feu a l'air plus realiste le soir",
        },
        {
          id: 161,
          dType: "heritage",
          filename: "rh4TAZmL7touyQQdG1k09oVdYGxb237RbwHONvK0.jpg",
          rating: 5,
          comment: "#test",
        },
      ],
      newBadgeAnimation: false as boolean,
      badgesDB: useBadgesDB(),
      userCollection: UserData.getCollectedChronologically(),
      obtainedBadges: [] as any,
      countCollection: [] as any,
      boroughCollection: [] as any,
      categoryCollection: [] as any,
      ownerCollection: [] as any,
    };
  },

  actions: {
    badgeCollected() {
      const tmpBoroughContainer = new Map<string, number>();
      const tmpOwnerContainer = new Map<string, number>();
      const tmpCategoryContainer = new Map<string, number>();
      for (const collectedElement of this.userCollection) {
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
    },
    countBadge() {
      const countCollected = [];
      for (const element of this.badgesDB.count) {
        if (element?.required_count <= this.userCollection.length) {
          countCollected.push({
            id: element.id,
            src: countPathUnlocked + element.id + ".svg",
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
      return countCollected;
    },
    boroughBadge(elements: Map<string, number>) {
      const boroughCollected = [];

      for (const boroughElementID of this.badgesDB.borough) {
        const boroughElement = BadgeDatabase.getFromId(boroughElementID);
        const title = boroughElement?.getTitle();
        if (title) {
          if (elements.has(title)) {
            const path = boroughCollected.push({
              id: boroughElementID,
              notification: boroughElement?.notification.fr,
              description: boroughElement?.description.fr,
              requireCount: boroughElement?.required_count,
              count: elements.get(title),
              src: this.path(
                boroughElement?.required_count,
                elements.get(title),
                boroughElementID,
                "borough"
              ),
              message: boroughElement?.description.fr,
              title: title,
              dType: "badge",
              type: "borough",
            });
          }
        }
      }
      return boroughCollected;
    },
    categoryBadge(elements: Map<string, number>) {
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
            src: this.path(
              categoryElement?.required_count,
              elements.get(categoryName),
              categoryElementID,
              "category"
            ),
            message: categoryElement?.description.fr,
            title: categoryElement?.title,
            dType: "badge",
            type: "category",
          });
        }
      }
      return categoryCollected;
    },
    ownerBadge(elements: Map<string, number>) {
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
            src: this.path(
              ownerElement?.required_count,
              elements.get(ownerName),
              ownerElementID,
              "owner"
            ),
            message: ownerElement?.description.fr,
            title: ownerElement?.title,
            dType: "badge",
            type: "owner",
          });
        }
      }
      return ownerCollected;
    },
    getImgUrl(badgeURL: string) {
      return require("../assets/" + badgeURL);
    },

    // addCollection(){
    //     this.fakeUserBadgesCollection.push("test")
    // },
    // obtainNewBadge(){
    //     const badges = ["test", "test2", "test3"]
    //     for (let i = 0; i < this.fakeUserBadgesCollection.length; i++) {
    //         if (this.fakeUserBadgesCollection[i] == badges[i]) {
    //             console.log("Badge already obtained")
    //         } else {
    //             this.fakeUserBadgesCollection.push(badges[i])
    //             console.log("New badge obtained")
    //             this.newBadgeCompleted()
    //         }
    //     }
    //
    // },
    path(
      requireCount: number | undefined,
      count: number | undefined,
      id: number,
      type: string
    ) {
      let pathLocked = "";
      let pathUnlocked = "";
      switch (type) {
        case "borough":
          pathLocked = boroughPathLocked;
          pathUnlocked = boroughPathUnlocked;
          break;
        case "owner":
          pathLocked = ownerPathLocked;
          pathUnlocked = ownerPathUnlocked;
          break;
        case "category":
          pathLocked = categoryPathLocked;
          pathUnlocked = categoryPathUnlocked;
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
    },
    newBadgeCompleted() {
      return (this.newBadgeAnimation = true);
    },
  },
});

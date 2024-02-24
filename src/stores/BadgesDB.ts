import { defineStore } from "pinia";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
export const useBadgesDB = defineStore("badgesDB", {
  state: () => {
    return {
      badges: BadgeDatabase.getSubset(0, BadgeDatabase.getSize()),
      count: BadgeDatabase.getSubset(0, 9),
      borough: [20, 22, 14, 21, 16, 13, 19, 17, 18, 12, 15, 11],
      category: new Map<number, string>([
        [26, "places"],
        [28, "heritage"],
        [24, "artwork"],
        [25, "artwork"],
      ]),
      owner: new Map<number, string>([
        [27, "Ville de Laval"],
        [10, "Université de Montreal"],
      ]),
    };
  },
  actions: {
    getBadges() {
      return BadgeDatabase.getSubset(0, BadgeDatabase.getSize());
    },
    getCount() {
      return BadgeDatabase.getSubset(0, 9);
    },
  },
});

import { defineStore } from "pinia";
import { BadgeDatabase } from "@/internal/databases/BadgeDatabase";
import { Badge } from "@/internal/Types";
export const useBadgesDB = defineStore("badgesDB", {
  state: () => {
    return {
      badges: BadgeDatabase.getSubset(0, BadgeDatabase.getSize()),
      count: [1, 2, 3, 4, 6, 7, 8, 9, 110, 111, 112, 113, 114, 115, 116],
      borough: [20, 22, 14, 21, 16, 13, 19, 17, 18, 12, 15, 11, 30],
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
      territory: new Map<number, string>([
        [29, "Rimouski (Bas-Saint-Laurent)"],
      ]),
    };
  },
  actions: {
    getBadges() {
      return BadgeDatabase.getSubset(0, BadgeDatabase.getSize());
    },
    getCount(): Badge[] {
      // Convert array of trophy/count badge IDs to array of Badge objects from the database
      return this.count.map(id => BadgeDatabase.getFromId(id)).filter(badge => badge !== null) as Badge[];
    },
  },
});

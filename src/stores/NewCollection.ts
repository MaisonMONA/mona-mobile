import { defineStore } from "pinia";
import { Artwork, Heritage, Place } from "@/internal/Types";
import Utils from "@/internal/Utils";

export const useNewCollection = defineStore("newCollectionStore", {
  state: () => {
    return {
      badges: [],
      count: [],
      borough: [],
      category: new Map(),
      owner: new Map(),
    };
  },
  actions: {
    //TODO: pass new collected discovery as parameter
    newBadge(discovery: any) {
      const element: Artwork | Place | Heritage | null = Utils.getDiscovery(
        discovery.id,
        discovery.dType
      );
      element?.getBorough();
      element?.getOwner();
      element?.dType;
      //TODO
    },
  },
});

import { defineStore } from "pinia";
import {UserData} from "../internal/databases/UserData";

export const useCollection = defineStore("collectionStore", {
    state: () => {
        return {
            collected: UserData.getCollectedChronologically(),
        };
    },
    actions: {
        updateCollected(): any[] {
            this.collected = UserData.getCollectedChronologically(); // Update userCollectedDiscovery
        }
    },
});

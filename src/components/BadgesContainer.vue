<template>
        <div class="main-container">
            <div style="display: flex; justify-content: space-between; align-items: center">
                <h1 style="margin-top: 0">Badges</h1>
                <span>1/22</span>
            </div>

            <ion-segment :scrollable="true" >
                <div v-for="elem in countCollected" :key="elem" id="badgeContainer" class="ion-margin-end border ion-padding">
                        <img :alt="elem.message" :src="getImgUrl(elem.src)" style="width: 70%"/>
                        <span style="white-space: normal; margin-top: 2%"> {{elem.requireCount}} </span>
                </div>
            </ion-segment>

            <h1>Catégories</h1>
            <ion-row v-for="elem in category" :key="elem" class="ion-margin-bottom ion-margin-top border">
                <ion-col size="auto">
                    <img :alt="elem.message" :src="getImgUrl(elem.src)" />
                </ion-col>
                <ion-col>
                    <div id="container_progression">
                        <ion-label>{{elem.requireCount}}</ion-label>
                        <div id="progressBar" class="ion-margin-top">
                            <span class="ion-margin-end">{{ elem.count + '/' + elem.requireCount }}</span>
                            <ion-progress-bar :value="(elem.count / elem.requireCount).toFixed(2)"></ion-progress-bar>
                        </div>
                    </div>
                </ion-col>
            </ion-row>

            <h1>Quartier</h1>
            <ion-row v-for="elem in borough" :key="elem" class="ion-margin-bottom ion-margin-top border">
                <ion-col size="auto">
                    <img :alt="elem.message" :src="getImgUrl(elem.src)" />
                </ion-col>
                <ion-col>
                    <div id="container_progression">
                        <ion-label>{{elem.requireCount}}</ion-label>
                        <div id="progressBar" class="ion-margin-top">
                            <span class="ion-margin-end">{{ elem.count + '/' + elem.requireCount }}</span>
                            <ion-progress-bar :value="(elem.count / elem.requireCount).toFixed(2)"></ion-progress-bar>
                        </div>
                    </div>
                </ion-col>
            </ion-row>
        </div>

</template>

<script>

import {IonSegment, IonLabel, IonProgressBar, IonRow, IonCol} from "@ionic/vue";
import {BadgeDatabase} from "@/internal/databases/BadgeDatabase";
import {UserData} from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";

export default {
    name: "BadgesContainer",
    components: {
        IonSegment, IonLabel, IonProgressBar, IonRow, IonCol
    },
    beforeMount() {
        this.userCollection = UserData.getCollectedChronologically()
        this.badgeTotal = BadgeDatabase.getSubset(0, BadgeDatabase.getSize())
        this.count = BadgeDatabase.getSubset(0,9)
        console.log("userCollection:")
        console.log((this.userCollection))
        console.log("badgeCollection:")
        console.log(this.badgeTotal)
        this.countBadge()
        this.boroughBadge()
        console.log("borough:")
        console.log(this.borough)
    },
    data() { //TODO: manque 11, 12, 15, 17,18,19,23
        return {
            userCollection: [],
            badgeTotal: [],
            borough:
                {
                    20 : {
                        notification: BadgeDatabase.getFromId(20).notification.fr,
                        description: BadgeDatabase.getFromId(20).description.fr,
                        requireCount: BadgeDatabase.getFromId(20).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/20.svg",
                        message: BadgeDatabase.getFromId(20).description.fr
                    },
                    22 : {
                        notification: BadgeDatabase.getFromId(22).notification.fr,
                        description: BadgeDatabase.getFromId(22).description.fr,
                        requireCount: BadgeDatabase.getFromId(22).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/22.svg",
                        message: BadgeDatabase.getFromId(22).description.fr
                    },
                    14 : {
                        notification: BadgeDatabase.getFromId(14).notification.fr,
                        description: BadgeDatabase.getFromId(14).description.fr,
                        requireCount: BadgeDatabase.getFromId(14).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/14.svg",
                        message: BadgeDatabase.getFromId(14).description.fr
                    },
                    21 : {
                        notification: BadgeDatabase.getFromId(21).notification.fr,
                        description: BadgeDatabase.getFromId(21).description.fr,
                        requireCount: BadgeDatabase.getFromId(21).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/21.svg",
                        message: BadgeDatabase.getFromId(21).description.fr
                    },
                    16 : {
                        notification: BadgeDatabase.getFromId(16).notification.fr,
                        description: BadgeDatabase.getFromId(16).description.fr,
                        requireCount: BadgeDatabase.getFromId(16).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/16.svg",
                        message: BadgeDatabase.getFromId(16).description.fr
                    },
                    13 : {
                        notification: BadgeDatabase.getFromId(13).notification.fr,
                        description: BadgeDatabase.getFromId(13).description.fr,
                        requireCount: BadgeDatabase.getFromId(13).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/13.svg",
                        message: BadgeDatabase.getFromId(13).description.fr
                    },
                    /*
                    27 : {
                        notification: BadgeDatabase.getFromId(27).notification.fr,
                        description: BadgeDatabase.getFromId(27).description.fr,
                        requireCount: BadgeDatabase.getFromId(27).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/27.svg",
                        message: BadgeDatabase.getFromId(27).description.fr
                    },
                    19 : {
                        notification: BadgeDatabase.getFromId(19).notification.fr,
                        description: BadgeDatabase.getFromId(19).description.fr,
                        requireCount: BadgeDatabase.getFromId(19).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/19.svg",
                        message: BadgeDatabase.getFromId(19).description.fr
                    },
                    10 : {
                        notification: BadgeDatabase.getFromId(10).notification.fr,
                        description: BadgeDatabase.getFromId(10).description.fr,
                        requireCount: BadgeDatabase.getFromId(10).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/10.svg",
                        message: BadgeDatabase.getFromId(10).description.fr
                    },
                    17 : {
                        notification: BadgeDatabase.getFromId(17).notification.fr,
                        description: BadgeDatabase.getFromId(17).description.fr,
                        requireCount: BadgeDatabase.getFromId(17).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/17.svg",
                        message: BadgeDatabase.getFromId(17).description.fr
                    },
                    18 : {
                        notification: BadgeDatabase.getFromId(18).notification.fr,
                        description: BadgeDatabase.getFromId(18).description.fr,
                        requireCount: BadgeDatabase.getFromId(18).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/18.svg",
                        message: BadgeDatabase.getFromId(18).description.fr
                    },
                    12 : {
                        notification: BadgeDatabase.getFromId(12).notification.fr,
                        description: BadgeDatabase.getFromId(12).description.fr,
                        requireCount: BadgeDatabase.getFromId(12).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/12.svg",
                        message: BadgeDatabase.getFromId(12).description.fr
                    },
                    15 : {
                        notification: BadgeDatabase.getFromId(15).notification.fr,
                        description: BadgeDatabase.getFromId(15).description.fr,
                        requireCount: BadgeDatabase.getFromId(15).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/15.svg",
                        message: BadgeDatabase.getFromId(15).description.fr
                    },
                    11 : {
                        notification: BadgeDatabase.getFromId(11).notification.fr,
                        description: BadgeDatabase.getFromId(11).description.fr,
                        requireCount: BadgeDatabase.getFromId(11).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/11.svg",
                        message: BadgeDatabase.getFromId(11).description.fr
                    },*/
                },
            category: {
                26: {
                    notification: BadgeDatabase.getFromId(26).notification.fr,
                    description: BadgeDatabase.getFromId(26).description.fr,
                    requireCount: BadgeDatabase.getFromId(26).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/26.svg",
                    message: BadgeDatabase.getFromId(26).description.fr
                },
                28: {
                    notification: BadgeDatabase.getFromId(28).notification.fr,
                    description: BadgeDatabase.getFromId(28).description.fr,
                    requireCount: BadgeDatabase.getFromId(28).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/28.svg",
                    message: BadgeDatabase.getFromId(28).description.fr
                },
                24: {
                    notification: BadgeDatabase.getFromId(24).notification.fr,
                    description: BadgeDatabase.getFromId(24).description.fr,
                    requireCount: BadgeDatabase.getFromId(24).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/24.svg",
                    message: BadgeDatabase.getFromId(24).description.fr
                },
                25: {
                    notification: BadgeDatabase.getFromId(25).notification.fr,
                    description: BadgeDatabase.getFromId(25).description.fr,
                    requireCount: BadgeDatabase.getFromId(25).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/25.svg",
                    message: BadgeDatabase.getFromId(25).description.fr
                },
            },
            count: [],
            countCollected: []
        }
    },
    methods: {
        countBadge() {
            const pathLocked = "drawable/badges/count/locked/"
            const pathUnlocked = "drawable/badges/count/unlocked/"

            for (const element of this.count) {
                if (element.required_count <= this.userCollection.length) {
                    this.countCollected.push({
                        src: pathUnlocked + element.id + '.svg',
                        message: element.notification.fr,
                        requireCount: element.required_count
                    })
                } else {
                    this.countCollected.push({
                        src: pathLocked + element.id + '.svg',
                        message: element.description.fr,
                        requireCount: element.required_count})
                }
            }
        },
        boroughBadge() {
            const pathLocked = "drawable/badges/borough/locked/"
            const pathUnlocked = "drawable/badges/borough/unlocked/"

            for (const element of this.userCollection) {
                for(const e of this.badgeTotal){
                    if (e.title.fr === Utils.getDiscovery(element.id, element.dType).getBorough()){
                        if (e.id in this.borough){
                            if (this.borough[e.id].count === 0)
                                this.borough[e.id].count = 1
                            else if (this.borough[e.id].count < this.borough[e.id].requireCount)
                                this.borough[e.id].count ++

                            if (this.borough[e.id].count === this.borough[e.id].requireCount){
                                this.borough[e.id].src = pathUnlocked + e.id + '.svg'
                                this.borough[e.id].message = this.borough[e.id].notification
                            }
                        }

                    }
                }
            }

        },
        categoryBadge() {
            const pathLocked = "drawable/badges/category/locked/"
            const pathUnlocked = "drawable/badges/category/unlocked/"
        },
        owernerBadge() {
            const pathLocked = "drawable/badges/owner/locked/"
            const pathUnlocked = "drawable/badges/owner/unlocked/"
        },
        getImgUrl(badgeURL) {
            return require('../assets/'+badgeURL)
        }
    }

}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

.main-container {
    padding: 5vw;
}

ion-title {
    font-family: 'Gotham Rounded Light', sans-serif;
}

* {
    font-family: 'Open Sans', sans-serif;
}

p {
    margin-top: 2vw;
    margin-bottom: 2vw;
}

a {
    color: steelblue;
    text-decoration: none;
    font-weight: normal;
}

.border {
    border-style: solid;
    border-color: #D9D9D9;
    border-radius: 11px;
    border-width: 1.4px
}

#container_progression{
    position:absolute; top: 50%;
    transform: translateY(-50%);
    width: 95%;
}

#progressBar {
    display: flex;
    flex-direction: row;
    justify-content:space-between;
    align-items: center
}
#badgeContainer {
    display: flex;
    flex-direction: column;
    width: 25%;
    justify-content: center;
    align-items: center;

}
</style>

<template>
        <div class="main-container">
            <div style="display: flex; justify-content: space-between; align-items: center">
                <h1 style="margin-top: 0">Badges</h1>
                <span>{{  nbrCountUnlocked + '/'+countCollected.length }}</span>
            </div>

          <swiper :slides-per-view="3" :spaceBetween="10">
            <swiper-slide
                v-for="elem in countCollected"
                :key="elem"
                class="badgeContainer ion-margin-end border ion-padding"
                @click="openDetails(elem.id, elem.message,'1','count')"
                style=" height: 100%"
            >
              <img :alt="elem.message" :src="getImgUrl(elem.src)" style="max-width: none"/>
              <span style="margin-top: 2%; font-size: small"> {{elem.title}} </span>
            </swiper-slide>
          </swiper>

            <h1>Catégories</h1>
            <ion-row v-for="elem in category" :key="elem" class="ion-margin-bottom ion-margin-top border">
                <ion-col size="auto">
                    <img :alt="elem.message" :src="getImgUrl(elem.src)" />
                </ion-col>
                <ion-col>
                    <div class="container_progression">
                        <ion-label>{{elem.title}}</ion-label>
                        <div class="progressBar ion-margin-top">
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
                    <div class="container_progression">
                        <ion-label >{{elem.title}}</ion-label>
                        <div class="progressBar ion-margin-top">
                            <span class="ion-margin-end">{{ elem.count + '/' + elem.requireCount }}</span>
                            <ion-progress-bar :value="(elem.count / elem.requireCount).toFixed(2)"></ion-progress-bar>
                        </div>
                    </div>
                </ion-col>
            </ion-row>
        </div>

</template>

<script>
import {IonLabel, IonProgressBar, IonRow, IonCol} from "@ionic/vue";
import {BadgeDatabase} from "@/internal/databases/BadgeDatabase";
import {UserData} from "@/internal/databases/UserData";
import Utils from "@/internal/Utils";

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import '@ionic/vue/css/ionic-swiper.css';

export default {
    name: "BadgesContainer",
    components: {
         IonLabel, IonProgressBar, IonRow, IonCol,  Swiper,
      SwiperSlide,
    },
    beforeMount() {
        this.userCollection = UserData.getCollectedChronologically()
        this.badgeTotal = BadgeDatabase.getSubset(0, BadgeDatabase.getSize())
        this.count = BadgeDatabase.getSubset(0,9)
        this.countBadge()
        this.boroughBadge()
    },
    data() {
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
                        message: BadgeDatabase.getFromId(20).description.fr,
                        title: BadgeDatabase.getFromId(20).title.fr,
                    },
                    22 : {
                        notification: BadgeDatabase.getFromId(22).notification.fr,
                        description: BadgeDatabase.getFromId(22).description.fr,
                        requireCount: BadgeDatabase.getFromId(22).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/22.svg",
                        message: BadgeDatabase.getFromId(22).description.fr,
                        title: BadgeDatabase.getFromId(22).title.fr,
                    },
                    14 : {
                        notification: BadgeDatabase.getFromId(14).notification.fr,
                        description: BadgeDatabase.getFromId(14).description.fr,
                        requireCount: BadgeDatabase.getFromId(14).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/14.svg",
                        message: BadgeDatabase.getFromId(14).description.fr,
                        title: BadgeDatabase.getFromId(14).title.fr,
                    },
                    21 : {
                        notification: BadgeDatabase.getFromId(21).notification.fr,
                        description: BadgeDatabase.getFromId(21).description.fr,
                        requireCount: BadgeDatabase.getFromId(21).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/21.svg",
                        message: BadgeDatabase.getFromId(21).description.fr,
                        title: "LaSalle"
                    },
                    16 : {
                        notification: BadgeDatabase.getFromId(16).notification.fr,
                        description: BadgeDatabase.getFromId(16).description.fr,
                        requireCount: BadgeDatabase.getFromId(16).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/16.svg",
                        message: BadgeDatabase.getFromId(16).description.fr,
                        title: BadgeDatabase.getFromId(16).title.fr,
                    },
                    13 : {
                        notification: BadgeDatabase.getFromId(13).notification.fr,
                        description: BadgeDatabase.getFromId(13).description.fr,
                        requireCount: BadgeDatabase.getFromId(13).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/13.svg",
                        message: BadgeDatabase.getFromId(13).description.fr,
                        title: BadgeDatabase.getFromId(13).title.fr,
                    },
                    19 : {
                        notification: BadgeDatabase.getFromId(19).notification.fr,
                        description: BadgeDatabase.getFromId(19).description.fr,
                        requireCount: BadgeDatabase.getFromId(19).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/19.svg",
                        message: BadgeDatabase.getFromId(19).description.fr,
                        title: BadgeDatabase.getFromId(19).title.fr,
                    },

                    17 : {
                        notification: BadgeDatabase.getFromId(17).notification.fr,
                        description: BadgeDatabase.getFromId(17).description.fr,
                        requireCount: BadgeDatabase.getFromId(17).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/17.svg",
                        message: BadgeDatabase.getFromId(17).description.fr,
                        title: BadgeDatabase.getFromId(1).title.fr,
                    },
                    18 : {
                        notification: BadgeDatabase.getFromId(18).notification.fr,
                        description: BadgeDatabase.getFromId(18).description.fr,
                        requireCount: BadgeDatabase.getFromId(18).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/18.svg",
                        message: BadgeDatabase.getFromId(18).description.fr,
                        title: BadgeDatabase.getFromId(18).title.fr,
                    },
                    12 : {
                        notification: BadgeDatabase.getFromId(12).notification.fr,
                        description: BadgeDatabase.getFromId(12).description.fr,
                        requireCount: BadgeDatabase.getFromId(12).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/12.svg",
                        message: BadgeDatabase.getFromId(12).description.fr,
                        title: BadgeDatabase.getFromId(12).title.fr,
                    },
                    15 : {
                        notification: BadgeDatabase.getFromId(15).notification.fr,
                        description: BadgeDatabase.getFromId(15).description.fr,
                        requireCount: BadgeDatabase.getFromId(15).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/15.svg",
                        message: BadgeDatabase.getFromId(15).description.fr,
                        title: BadgeDatabase.getFromId(15).title.fr,
                    },
                    11 : {
                        notification: BadgeDatabase.getFromId(11).notification.fr,
                        description: BadgeDatabase.getFromId(11).description.fr,
                        requireCount: BadgeDatabase.getFromId(11).required_count,
                        count: 0,
                        src: "drawable/badges/borough/locked/11.svg",
                        message: BadgeDatabase.getFromId(11).description.fr,
                        title: BadgeDatabase.getFromId(11).title.fr,
                    },
                },
            category: {
                26: {
                    notification: BadgeDatabase.getFromId(26).notification.fr,
                    description: BadgeDatabase.getFromId(26).description.fr,
                    requireCount: BadgeDatabase.getFromId(26).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/26.svg",
                    message: BadgeDatabase.getFromId(26).description.fr,
                    dType: 'places',
                    title: BadgeDatabase.getFromId(26).title.fr,
                },
                28: {
                    notification: BadgeDatabase.getFromId(28).notification.fr,
                    description: BadgeDatabase.getFromId(28).description.fr,
                    requireCount: BadgeDatabase.getFromId(28).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/28.svg",
                    message: BadgeDatabase.getFromId(28).description.fr,
                    dType: 'heritage',
                    title: BadgeDatabase.getFromId(28).title.fr,
                },
                24: {
                    notification: BadgeDatabase.getFromId(24).notification.fr,
                    description: BadgeDatabase.getFromId(24).description.fr,
                    requireCount: BadgeDatabase.getFromId(24).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/24.svg",
                    message: BadgeDatabase.getFromId(24).description.fr,
                    dType: 'artwork',
                    title: BadgeDatabase.getFromId(24).title.fr,
                },
                25: {
                    notification: BadgeDatabase.getFromId(25).notification.fr,
                    description: BadgeDatabase.getFromId(25).description.fr,
                    requireCount: BadgeDatabase.getFromId(25).required_count,
                    count: 0,
                    src: "drawable/badges/category/locked/25.svg",
                    message: BadgeDatabase.getFromId(25).description.fr,
                    dType: 'artwork',
                    title: BadgeDatabase.getFromId(25).title.fr,
                },
            },
            owner: {
                27 : {
                    notification: BadgeDatabase.getFromId(27).notification.fr,
                    description: BadgeDatabase.getFromId(27).description.fr,
                    requireCount: BadgeDatabase.getFromId(27).required_count,
                    count: 0,
                    src: "drawable/badges/owner/locked/27.svg",
                    message: BadgeDatabase.getFromId(27).description.fr,
                    title: BadgeDatabase.getFromId(27).title.fr
                },
                10 : {
                    notification: BadgeDatabase.getFromId(10).notification.fr,
                    description: BadgeDatabase.getFromId(10).description.fr,
                    requireCount: BadgeDatabase.getFromId(10).required_count,
                    count: 0,
                    src: "drawable/badges/owner/locked/10.svg",
                    message: BadgeDatabase.getFromId(10).description.fr,
                    title: "Université de Montreal"
                }
            },
            nbrCountUnlocked : 0,
            count: [],
            countCollected: [],
        }
    },
    methods: {
        countBadge() {
            const pathLocked = "drawable/badges/count/locked/"
            const pathUnlocked = "drawable/badges/count/unlocked/"

            for (const element of this.count) {
                if (element.required_count <= this.userCollection.length) {
                    this.nbrCountUnlocked += 1
                    this.countCollected.push({
                        id: element.id,
                        src: pathUnlocked + element.id + '.svg',
                        message: element.notification.fr,
                        requireCount: element.required_count,
                        title: element.title.fr
                    })
                } else {
                    this.countCollected.push({
                        id: element.id,
                        src: pathLocked + element.id + '.svg',
                        message: element.description.fr,
                        requireCount: element.required_count,
                        title: element.title.fr
                    })
                }
            }
        },
        boroughBadge() {
            const boroughUnlocked = "drawable/badges/borough/unlocked/"
            const ownerUnlocked = "drawable/badges/owner/unlocked/"
            let countHeritage = 0;
            let countPlaces = 0;
            let countArtwork = 0;
            for(const element of this.userCollection) {
                for (const e of this.badgeTotal) {
                    if (e.title.fr === Utils.getDiscovery(element.id, element.dType).getBorough()) {
                        if (e.id in this.borough) {
                            if (this.borough[e.id].count < this.borough[e.id].requireCount)
                                this.borough[e.id].count += 1
                            else if (this.borough[e.id].count === this.borough[e.id].requireCount) {
                                this.borough[e.id].src = boroughUnlocked + e.id + '.svg'
                                this.borough[e.id].message = this.borough[e.id].notification
                            }
                        }
                    }
                }
                if (element.dType === 'places')
                    countPlaces += 1
                else if (element.dType === 'heritage')
                    countHeritage += 1
                else if (element.dType === 'artwork'){
                    countArtwork +=1
                    for (const o in this.owner){
                        if(this.owner[o].title == Utils.getDiscovery(element.id, element.dType).getOwner()){
                            console.log("dans if")
                            if (this.owner[o].count < this.owner[o].requireCount){
                                this.owner[o].count += 1
                            }
                            else if (this.owner[o].count === this.owner[o].requireCount) {
                                this.owner[o].src = ownerUnlocked + o + '.svg'
                                this.owner[o].message = this.owner[o].notification
                            }
                        }

                    }
                }


            }
            this.categoryBadge(countPlaces, countHeritage, countArtwork)
            console.log(this.owner)
            Object.assign(this.borough, this.owner)

        },
        categoryBadge(countPlaces, countHeritage, countArtwork) {

            this.category['26'].count = countPlaces
            this.category['28'].count = countHeritage
            this.category['24'].count = countArtwork
            this.category['25'].count = countArtwork
            this.verifyCategoryBadge('26')
            this.verifyCategoryBadge('28')
            this.verifyCategoryBadge('24')
            this.verifyCategoryBadge('25')

        },
        verifyCategoryBadge(id){
            const pathUnlocked = "drawable/badges/category/unlocked/"
            if (this.category[id].count >= this.category[id].requireCount) {
                this.category[id].src = pathUnlocked + id + '.svg'
                this.category[id].message = this.category[id].notification
            }
        },
        owernerBadge() {
            const pathLocked = "drawable/badges/owner/locked/"
            const pathUnlocked = "drawable/badges/owner/unlocked/"
        },
        getImgUrl(badgeURL) {
            return require('../assets/'+badgeURL)
        },
        openDetails(badgeID, badgeMessage, badgeCount, badgeType) {
            this.$router.push(`/badge-details/${badgeID}/${badgeMessage}/${badgeCount}/${badgeType}`);
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

.container_progression{
    position:absolute; top: 50%;
    transform: translateY(-50%);
    width: 95%;
}
.progressBar {
    display: flex;
    flex-direction: row;
    justify-content:space-between;
    align-items: center
}
.badgeContainer {
    display: flex;
    flex-direction: column;
    min-width: 25%;
    justify-content: center;
    align-items: center;
    padding: 1%
}
.swiper .swiper-slide {
  height: auto !important;
}
</style>

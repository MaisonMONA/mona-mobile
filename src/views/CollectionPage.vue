<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="collection-header">
                <p id="collected-count">{{ collected.length ? collected.length : '' }}</p>
                <p>
                    {{ collected.length ? '' : "Aucune" }} Œuvre{{ collected.length ? 's' : ''}}<br>collectionnée{{ collected.length ? 's' : ''}}
                </p>
                <ion-icon id="headerIcon" :icon="bookOutline"></ion-icon>
            </div>
            <div class="collection-content">
                <p id="your-collection">Votre collection</p>
                <ion-grid>
                    <ion-row>
                        <ion-col v-for="item in collected" :key="item" size="6" @click="openDetails(item)">
                            <div class="img-card">
                                <img :src="require('@/assets/drawable/perfs.jpg')"/>
                                <div class="title-holder">
                                    <p>{{ getDiscovery(item.id, item.dType).getTitle() }}</p>
                                </div>
                            </div>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>

    </ion-page>
</template>

<script>
import { bookOutline } from "ionicons/icons";
import { UserData } from '@/internal/databases/UserData';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/vue';
import Utils from "../internal/Utils";
import { useRouter } from "vue-router";

export default {
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon
    },

    setup() {
        return {
            bookOutline
        }
    },

    data() {
        return {
            collected: UserData.getCollectedChronologically(),
            getDiscovery: Utils.getDiscovery,
        }
    },

    methods: {
        openDetails(item) {
            let type;
            if (item.dType === "artwork") type = 0;
            else if (item.dType === "place") type = 1;
            else /* (discovery.dType == "heritage") */ type = 2;

            this.$router.push(`/discovery-details/${type}/${item.id}`);
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

img {
    object-fit: cover;
    height: 45vw;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.collection-header {
    height: 25%;
    background: var(--blue-powder);
    text-align: center;
}

.collection-header * {
    position: relative;
    top: 50%;
    transform: translateY(-75%);
    display: inline-block;
    color: white;
    margin-top: 5%;
    vertical-align: middle;
    margin-left: 2vw;
    margin-right: 2vw;
}

.collection-header p {
    text-align: left;
    font-size: 28px;
    /*font-weight: 600;*/
}

.collection-header p#collected-count {
    font-size: 52px;
    font-weight: 600;
}

.collection-header ion-icon {
    /*font-size: 80px;*/
    --ionicon-stroke-width: 20px;
}

/*.collection-header {*/
/*    position: relative;*/
/*    width: 100%;*/
/*    height: 25%;*/
/*    background: var(--blue-powder);*/
/*}*/

/*.collection-header p {*/
/*    margin: 0;*/
/*    position: absolute;*/
/*    transform: translate(-50%, -50%);*/
/*    left: 65%;*/
/*    top: 50%;*/
/*    color: white;*/
/*    font-size: 24px;*/
/*    font-weight: 500;*/
/*}*/

/*.collection-header p#collected-count {*/
/*    font-size: 32px;*/
/*    font-weight: 600;*/
/*    left: 40%;*/
/*}*/

ion-grid {
    --ion-grid-column-padding: 0;
}

ion-col {
    border: 1px solid var(--button-outline-grey);
    border-radius: 15px;
    text-align: center;
    margin-bottom: 16px;
}

p {
    font-family: 'Open Sans', sans-serif;
}

.title-holder {
    min-height: 32px;
}

.title-holder p {
    top: 50%;
    font-size: 16px;
}

#your-collection {
    margin: 15px 0 10px 15px;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
}
</style>

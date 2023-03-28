<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="main-content">
                <p id="tab-title">Liste des découvertes à faire</p>
                <ion-list :inset="true" lines="none">
                    <ion-item v-for="discovery of discoveries" :key="discovery" @click="openDetails(discovery)">
                        <ion-avatar slot="start">
                            <img :src="require(`@/assets/drawable/medal/${ discovery.dType }.png`)" alt="">
                        </ion-avatar>
                        <ion-label>{{ discovery.getTitle() }}</ion-label>
                    </ion-item>
                </ion-list>
                <ion-infinite-scroll @ionInfinite="getMoreDiscoveries">
                    <ion-infinite-scroll-content></ion-infinite-scroll-content>
                </ion-infinite-scroll>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
         IonInfiniteScroll, IonInfiniteScrollContent } from "@ionic/vue";
import { UserData } from "@/internal/databases/UserData";

export default {
    name: "ListPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonLabel, IonItem, IonAvatar,
        IonInfiniteScroll, IonInfiniteScrollContent
    },

    data() {
        const discoveries = []
        const offset = 0;

        return {
            discoveries, offset, console
        }
    },

    beforeMount() {
        this.getMoreDiscoveries();
    },

    methods: {
        getMoreDiscoveries(event) {
            this.discoveries = this.discoveries.concat(UserData.getSortedDiscoveries().slice(this.offset, this.offset + 50))

            if (event)  // Signaling the user scroll to the bottom
                event.target.complete();

            this.offset += 50;
        },

        openDetails(discovery) {
            let type;
            if (discovery.dType === "artwork") type = 0;
            else if (discovery.dType === "place") type = 1;
            else /* (discovery.dType == "heritage") */ type = 2;

            this.$router.push(`/discovery-details/${type}/${discovery.id}`);
        }
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

#tab-title {
    padding-top: 24px;
    margin-left: 21px;
    font-family: 'Gotham Rounded Light', sans-serif;
    font-size: 5.5vw;
}

div.main-content {
    background: #F3F2F7;
}

ion-list {
    background: #F3F2F7;
}

ion-item {
    border: 5px solid #F3F2F7;
    border-radius: 15px;
}

ion-avatar img {
    margin-top: 5px;
    max-width: 8vw;
    max-height: 8vw;
}
</style>

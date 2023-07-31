<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-title>MONA</ion-title>
        </ion-toolbar>
    </ion-header>

    <ion-content>

        <div class="ion-margin">

                <ion-input
                    fill="outline" color="dark" @ionFocus="show = true" label="Nom d'utilisateur"
                    label-placement="floating" :placeholder="UserData.getUsername()" >
                </ion-input>
                <!--<ion-icon :name="pencil" color="black" style="background-color: red; color: black" size="large"></ion-icon>-->

            <ion-input fill="outline" color="dark" @ionFocus="show = true" :clear-input="true"  label="Courriel"
                       label-placement="floating" placeholder="" type="email">

            </ion-input>

            <ion-input fill="outline" color="dark" @ionFocus="show = true" :clear-input="true"  label="Mot de passe"
                       label-placement="floating" placeholder="" :readonly="true" type="password"
                       @click="setOpenPassword(true)">
            </ion-input>

            <ion-alert
                :is-open="isOpenPassword"
                trigger="present-alert"
                header="Modifier votre mot de passe"
                :buttons="alertButtons"
                :inputs="alertInputs"
            ></ion-alert>


        <div v-if="show">
            <ion-button expand="block" @clik="show = false" color="tertiary">Confirmer</ion-button>
            <ion-button expand="block" color="danger" @clik="show = false">Annuler</ion-button>
        </div>

        <ion-toast
            :is-open="isOpen"
            message="Votre mot de passe a été modifié avec succès"
            position="bottom"
            :duration="5000"
            @didDismiss="setOpen(false)"
            :icon="pencil"
        ></ion-toast>
        </div>
    </ion-content>
</template>



<script>
import {IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonToast, IonInput, IonAlert,

} from "@ionic/vue";
import {UserData} from "@/internal/databases/UserData";
import {ref} from "vue";
import { checkmarkDoneOutline, pencil} from 'ionicons/icons';
export default {
    name: "AboutContainer",
    computed: {
        UserData() {
            return UserData
        }
    },
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle, IonToast, IonInput, IonAlert
    },
    data() {
        return {
            show: false,

        }
    },
    setup() {
        const isOpen = ref(false);
        const isOpenPassword = ref(false);
        const setOpenPassword = (state) =>  {
            isOpenPassword.value = state;
        }
        const setOpen = (state) =>  {
            isOpen.value = state;
        }
        const alertButtons = [
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'alert-button-cancel',
                handler: () => {
                    setOpenPassword(false)
                    console.log('Alert canceled');
                },
            },
            {
                text: 'OK',
                role: 'confirm',
                cssClass: 'alert-button-cancel',
                handler: () => {
                    setOpenPassword(false)
                    setOpen(true)
                   console.log(alertInputs[0].name);
                    console.log('Alert confirmed');
                },
            },
        ];
        const alertInputs = [
            {
                name: 'ancien',
                placeholder: 'Votre ancien mot de passe',
                type: 'password',
            },
            {
                name: 'nouveau,',
                placeholder: 'Votre nouveau mot de passe',
                type: 'password',
            },
            {
                name: 'confirmation',
                placeholder: 'Entrer à nouveau le mot de passe',
                type: 'password',
            }
        ];

        return {
            alertButtons, alertInputs, isOpen , setOpen, checkmarkDoneOutline, setOpenPassword, isOpenPassword,
            pencil
        };
    },
    methods: {

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
span.ion-text-left {
    margin-right: auto;
}
ion-input {
    --placeholder-color: black;
    --placeholder-font-weight: normal;
    --placeholder-font-style: normal;
    margin-bottom: 5%;
}
</style>

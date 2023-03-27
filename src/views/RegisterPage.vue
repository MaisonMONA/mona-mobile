<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div class="main-content">
                <p id="welcome">Bienvenue !</p>
                <p id="ask-for-registration">Commençons par créer un compte.</p>

                <div class="form-section">
                    <div class="input-element username">
                        <label for="username-input">Nom d'utilisateur</label>
                        <ion-item id="username-input">
                            <ion-input type="email"></ion-input>
                        </ion-item>
                    </div>

                    <div class="input-element email">
                        <label for="email">Adresse courriel (optionnel)</label>
                        <ion-item id="email-input">
                            <ion-input></ion-input>
                        </ion-item>
                    </div>

                    <div class="input-element password">
                        <label for="password-input">Mot de passe</label>
                        <ion-item id="password-input">
                            <ion-input type="password"></ion-input>
                        </ion-item>
                    </div>

                    <div class="input-element password-confirmation">
                        <label for="password-confirmation-input">Vérifiez le mot de passe</label>
                        <ion-item id="password-confirmation-input">
                            <ion-input type="password-confirmation"></ion-input>
                        </ion-item>
                    </div>

                    <ion-button @click="register">S'inscrire</ion-button>

                    <p class="redirect-to-login" @click="goToLogin">Déjà un compte ? <span>Se connecter</span></p>
                </div>
            </div>
        </ion-content>

    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton } from "@ionic/vue";
import Utils from "@/internal/Utils";
import { UserData } from "@/internal/databases/UserData";
import {useRouter} from "vue-router";

if (UserData.getToken() != '') {  // User is logged in, redirect
    const router = useRouter();
    router.push("/tabs/discovery-of-the-day");
}

export default {
    name: "LoginPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton
    },

    methods: {
        goToLogin() {
            this.$router.push("/login");
        },

        register() {
            const username = document.querySelector("ion-item#username-input ion-input").value;
            const email = document.querySelector("ion-item#email-input ion-input").value;
            const password = document.querySelector("ion-item#password-input ion-input").value;
            const passwordConfirm = document.querySelector("ion-item#password-confirmation-input ion-input").value;

            if (username && password && passwordConfirm) {
                if (password === passwordConfirm) {
                    const formData = new FormData();
                    formData.append("username", username);
                    formData.append("password", passwordConfirm);
                    formData.append("password_confirmation", password);

                    if (email)
                        formData.append("email", email);

                    fetch(Utils.apiRoutes.register, {
                        method: "POST",
                        body: formData
                    })

                    .then((response) => {
                        if (response.ok) {
                            this.$router.replace("/tabs/discovery-of-the-day");
                        } else {
                            const parsed = response.json();
                            if (parsed.errors && parsed.errors.username) {
                                this.showAlert("Le nom d'utilisateur est déjà pris.");
                            }
                        }
                    })

                    .catch((err) => {
                        console
                    })
                }
            }
        },

        showAlert(alertMessage) {
            console
        }
    }
}
</script>

<style scoped>
@import url("@/theme/TopToolbar.css");

.ion-page {
    background: white;
}

p, label {
    font-family: 'Gotham Rounded Light', sans-serif;
}

#welcome {
    font-size: 20px;
    font-weight: bold;
}

.main-content {
    font-size: 14px;
    text-align: center;
    position: relative;
    top: 5%;
    width: 100%;
    height: 85%;
}

div.form-section {
    position: relative;
    width: 100%;
    height: 80%;
}

.input-element {
    width: 70%;
    margin: 5% auto;
}

.input-element * {
    text-align: center;
}

ion-input {
    font-size: 14px;
}

label {
    display: block;
    text-align: center;
}

.redirect-to-login span {
    font-weight: bolder;
    border-bottom: 1px solid black;
}
</style>

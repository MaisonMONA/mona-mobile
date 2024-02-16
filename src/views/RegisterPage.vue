<template>
    <ion-page>

        <ion-header>
            <ion-toolbar>
                <ion-title>MONA</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <p id="register-alert-holder"></p>
            <div class="main-content">
                <p id="welcome">Inscription</p>
                <p id="ask-for-registration">Bienvenue !<br>Commençons par créer un compte.</p>

                <div class="form-section">
                    <div class="input-element username">
                        <label for="username-input">Nom d'utilisateur</label>
                        <ion-item id="username-input">
                            <ion-input></ion-input>
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
                            <ion-input type="password"></ion-input>
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
import { UserData } from "@/internal/databases/UserData";
import Globals from "@/internal/Globals";
import { Filesystem } from "@capacitor/filesystem";
import { Camera } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import router from "@/router/index.ts";
//TODO: find out why images are not displayed

export default {
    name: "RegisterPage",
    components: {
        IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton
    },

    async beforeMount() {
        await UserData.populate();

        if (!UserData.hasSeenTutorial()) {
            // Show tutorial on first time
            this.$router.replace("/tutorial");
        } else if (UserData.getToken() !== '') {
            // If user is logged in, redirect immediately
            this.$router.replace("/loading");
        } else {
            await this.checkPermissions();
        }
    },

    methods: {
        goToLogin() {
          console.log("in goToLogin")
            router.push("/login");
        },

        register() {
            const username = document.querySelector("ion-item#username-input ion-input").value;
            const email = document.querySelector("ion-item#email-input ion-input").value;
            const password = document.querySelector("ion-item#password-input ion-input").value;
            const passwordConfirm = document.querySelector("ion-item#password-confirmation-input ion-input").value;

            if (username && password && passwordConfirm) {
                if (password === passwordConfirm) {
                    const formData = new FormData();
                    formData.append("username", username.trim());
                    formData.append("password", passwordConfirm);
                    formData.append("password_confirmation", password);

                    if (email) {
                        formData.append("email", email);
                    }

                    fetch(Globals.apiRoutes.register, {
                        method: "POST",
                        body: formData
                    })

                    .then(async (response) => {
                        const parsed = await response.json();

                        if (response.ok) {
                            if (!parsed.token) {
                                this.showAlert("Server error");
                            }

                            UserData.setToken(parsed.token);
                            UserData.setUsername(username.trim());
                            this.$router.replace("/loading");
                        } else {
                            // Show appropriate error
                            this.handleError(parsed);
                        }
                    })

                    .catch(() => {
                        this.showAlert("Impossible de se connecter à internet !");
                    });
                } else {
                    // Password mismatch
                    this.showAlert("Les mots de passe ne concordent pas.")
                }
            }
        },

        handleError(parsed) {
            if (parsed.errors) {
                if (parsed.errors.username) this.showAlert(parsed.errors.username[0]);
                else if (parsed.errors.password) this.showAlert(parsed.errors.password[0])
                else if (parsed.errors.email) this.showAlert(parsed.errors.email[0]);
            }
        },

        showAlert(alertMessage) {
            const alertElem = document.getElementById("register-alert-holder");

            alertElem.innerHTML = alertMessage;
            alertElem.classList.add("show");
        },

        async checkPermissions() {
            const cameraPermStatus   = await Camera.checkPermissions();
            const filePermStatus     = await Filesystem.checkPermissions();
            const locationPermStatus = await  Geolocation.checkPermissions();

            if (cameraPermStatus.camera !== "granted" ||
                filePermStatus.publicStorage !== "granted" ||
                locationPermStatus.location !== "granted") {

                this.$router.replace("/permission-denied");
            }
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

#register-alert-holder {
    position: absolute;
    text-align: center;
    transform: translateX(-50%);
    left: 50%;

    margin: 5% 0 0;
    padding: 0.2em 0.4em;
    border-radius: 4px;

    font-weight: bolder;
    color: white;
    background: white;
    font-size: 12px;

    transition: all 0.3s linear;
}

#register-alert-holder.show {
    color: darkred;
    background: #E6B1B1;
}
</style>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="Retour"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content>
        <div class="main-container">
            <h1>À propos</h1>
            <p>L'application mobile MONA est un projet libre et open source pour la découverte et la mise en valeur de l'art public et des lieux culturels au Québec.</p>
            <p>MONA est produit par la Maison MONA, un organisme à but non lucratif basé à Montréal (Québec, Canada). Le projet est bâti en collaboration avec le groupe de recherche art+site à l'université de Montréal. Comme nous le détaillons dans notre politique de confidentialité, les données que nous recueillons servent uniquement à la recherche académique. Ce projet entièrement non-commercial n'implique aucun tiers.</p>
            <h2>Politique de confidentialité</h2>
            <p>En utilisant cette application, vous acceptez la collecte et l'utilisation de vos données personnelles tel que décrit dans cette politique de confidentialité. Il est possible que nous modifions notre politique de confidentialité de temps à autre, et nous vous recommandons de la consulter régulièrement.</p>
            <h3>Quelles données recueillons-nous ?</h3>
            <p>Nous attachons de l'importance à la protection de votre vie privée. Nous recueillons uniquement les données pertinentes pour notre recherche, c'est-à-dire vos photographies, notes et commentaires des œuvres d'art et lieux culturels que vous collectionnez. Ces données sont enregistrées dans nos serveurs universitaires et leur accès est limité à une version anonymisée pour notre groupe de recherche.</p>
            <h4>Pourquoi recueillons-nous des données ?</h4>
            <p>Notre recherche porte sur l'intérêt de la population pour l'art public. Les données recueillies nous permettent de comprendre comment vous percevez ces œuvres d'art.</p>
            <h4>Vos droits</h4>
            <p>Vous pouvez nous envoyer des questions concernant vos données ou demander de les supprimer de notre serveur en nous contactant à <a href="mailto:data@monamontreal.org">data@monamontreal.org</a>.</p>
            <h2>Licences</h2>
            <h3>Code Informatique</h3>
            <p>iOS: MONA est une application publiée sur l'AppStore sous la licence <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache Version 2.0</a>: Copyright 2020 Maison MONA</p>
            <p>Android: MONA est une application publiée sur Google Play sous la licence <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL v3.0</a>.</p>
            <h3>Design</h3>
            <p>Le design de l'application est sous la licence internationale <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0</a></p>
            <h2>Données</h2>
            <h3>Art</h3>
            <p>Les métadonnées des œuvres d'art diffusées dans l'application sont issues:</p>
            <ul>
                <li>portails de données ouvertes des villes de Montréal - <a href="https://www.donneesquebec.ca/recherche/dataset/vmtl-art-public-information-sur-les-oeuvres-de-la-collection-municipale">collection municipale</a> et <a href="https://www.donneesquebec.ca/recherche/dataset/murales">murales subventionnées</a> - et de <a href="https://www.donneesquebec.ca/recherche/dataset/art-public">Rimouski</a>, sous licence Creative Commons Attribution 4.0</li>
                <li>informations disponibles sur le site <a href="https://artpublicmontreal.ca/">ArtPublicMontréal</a></li>
                <li>partenariats avec les diffuseurs culturels Dose Culture, Mu, MURAL</li>
            </ul>
            <h3>Lieux culturels</h3>
            <p>Les métadonnées des lieux culturels diffusés dans l'applications proviennent de:</p>
            <ul>
                <li>portail de données ouverte du Québec - <a href="https://www.donneesquebec.ca/recherche/fr/dataset/bibliotheques-du-quebec/resource/b5119897-c901-4a0d-87c4-4bd1c84dd282">bottin des bibliothèques publiques</a> - et de la <a href="https://donnees.ville.montreal.qc.ca/dataset/lieux-culturels">ville de Montréal</a>, sous licence Creative Commons Attribution 4.0</li>
            </ul>
        </div>
    </ion-content>
</template>

<script>
import { IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle } from "@ionic/vue";

export default {
    name: "AboutContainer",
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");
@import url("@/theme/TopToolbar.css");

ion-back-button {
  color: #2E389E;
}

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
</style>

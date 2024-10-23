<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button></ion-back-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div class="ion-padding">
      <h2>Politique de confidentialité</h2>

      <p>MONA est un projet de recherche universitaire basé à l’Université de Montréal (Qc, CA). Comme nous le détaillons dans notre politique de confidentialité, les données que nous recueillons servent uniquement à la recherche académique. Ce projet entièrement non-commercial n&#39;implique aucun tiers.</p>

      <h5>Quelles données recueillons-nous?</h5>
      <p>Nous attachons de l&#39;importance à la protection votre vie privée. Nous recueillons uniquement les données pertinentes pour notre recherche, c&#39;est-à-dire vos photographies, notes et commentaires des découvertes collectionnées. Ces données sont enregistrées dans nos serveurs universitaires et leur accès est limité à une version anonymisée pour le groupe de recherche <em>Art et site</em>.</p>

      <h5>Pourquoi recueillons-nous des données?</h5>
      <p>Notre recherche porte sur l&#39;intérêt de la population pour l&#39;art public. Les données recueillies nous permettent de comprendre comment vous percevez l’art et la culture qui vous entourent.</p>
      <h5>Vos droits</h5>
      <p>Vous pouvez nous envoyer des questions concernant vos données ou demander de les supprimer de notre serveur en nous contactant à <a href='mailto: data@monamontreal.org'>data@monamontreal.org</a>.</p>
    </div>
  </ion-content>
</template>

<script>
import { IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle } from "@ionic/vue";

export default {
  name: "WhoWeAreContainer",
  components: {
    IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonTitle
  }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

ion-back-button {
  color: black;
}

* {
  font-family: 'Open Sans', sans-serif;
  line-height: 1.5;
}

span.bold, h1, h2, h3, h4, h5 {
  font-weight: bold;
}
</style>

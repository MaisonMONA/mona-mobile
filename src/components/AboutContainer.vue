<template>
    <ion-header class="ion-no-border">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button text="RETOUR"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
        <div class="main-container">

          <div class="encadre quiSommesNous">
          <img src="/assets/drawable/mona_logo_med.png" alt="MONA logo">
          <h2>Qui sommes-nous?</h2>
          <p>MONA est produit par la Maison MONA, un organisme à but non lucratif basé à Montréal (QC). Le projet est bâti en collaboration avec le groupe de recherche art+site à l’université de Montréal.</p>
          <p>Pour en savoir plus, visitez le site web:</p>
          <a href="https://monamontreal.org">monamontreal.org <ion-icon :icon="`/assets/drawable/icons/url_icon.svg`"></ion-icon> </a>
          </div>

          <div class="encadre">
          <h2>Notre mission</h2>
          <p>La Maison MONA a pour objectif de faire rayonner les artistes, les œuvres  d’art, le patrimoine et la richesse artistique et culturelle qui façonnent l’espace  public montréalais. Menant une réflexion de fonds sur l’accessibilité de l’art, nous  développons une expertise numérique à des fins de découvrabilité, de  médiation, de recherche, de critique et de création artistique. Nous  faisons ainsi appel aux nouvelles habitudes d’appropriation numérique de la culture et aux formes hybrides de cocréation et de coapprentissage  pour favoriser un esprit de découverte, de partage et d’attachement  local. Conscients de la richesse artistique et culturelle de Montréal, et des enjeux liés à sa visibilité, nous sommes engagés dans une réflexion potentiellement transformatrice sur les questions liées à la représentativité de la  diversité dans l’art public, par la mise en place de projets soutenant  la recherche-création et les collaborations avec des artistes. Bien qu’initialement basés à Montréal, nous nous sommes aussi donnés comme  mission d’élargir l’ampleur de notre application à l’ensemble du  territoire québécois.</p>
          </div>

          <div class="encadre">
          <h2>Mandat</h2>
          <p>Suivant une mission de démocratisation de l’art, la Maison MONA valorise la diversité des formes d’art et culture qui forment la richesse de l’espace urbain à Montréal et au Québec. Son mandat est d’inviter à des rencontres avec l’art, de créer un espace commun pour les échanges et de faire résonner les sens et les sensibilités de chacun·e dans une perspective d’accessibilité, de diversité et de partage. Les initiatives de l’organisme combinent culture et technologie, en impliquant le·a citoyen·ne dans son environnement. Le projet principal de l’organisme est une application mobile gratuite, MONA, qui promeut la découverte de l’art, du patrimoine et des espaces culturels montréalais. Cette forme de diffusion numérique permet de rejoindre un large éventail de citoyen·ne·s, à toute heure et en tous lieux, poussant autant que possible l’idée d’une programmation accessible. La Maison MONA travaille aussi à la rencontre entre œuvres, artistes, et publics, par le biais d’une programmation en médiation culturelle, en recherche-création et de soutien à la création actuelle, en collaboration avec des partenaires culturels, pédagogiques et communautaires.</p>
          </div>

          <div class="encadre">
          <h2>L'équipe</h2>
          <ul>
            <li><strong>Camila De Oliveira Savoi</strong> Direction de la recherche</li>
            <li><strong>Camille Delattre</strong> Direction des opérations et coordinatrice à la structuration des données</li>
            <li><strong>Julie Graff</strong> Direction artistique</li>
            <li><strong>Lena Krause</strong> Direction technique et fondatrice</li>
            <li><strong>Alexia Pinto Ferretti</strong> Direction des publics</li>
            <li><strong>Marguerite Chiarello</strong> Responsable des communications et consultante en médiation</li>
            <li><strong>Sarah Heng</strong> Développeuse mobile</li>
            <li><strong>Simon Janssen</strong> Responsable de la base de données</li>
            <li><strong>Christian Lungescu</strong> Développeur mobile</li>
            <li><strong>Barbara Marche</strong> Designer UI/UX</li>
            <li><strong>David Valentine</strong> Consultant en sciences de l'information</li>
          </ul>
          
          <h3 id="ancien-ne-s-contributeur-rice-s">Ancien·ne·s contributeur·rice·s</h3>
          <ul>
            <li>Miliya Ai, développeuse serveur</li>
            <li>Philippe Auclair, développeur Android</li>
            <li>Vincent Beauregard, développeur serveur et Android</li>
            <li>Dina Benkirane, développeuse Android</li>
            <li>Thomas Bui, développeur serveur</li>
            <li>Gaspard Damoiseau-Malraux, développeur Android</li>
            <li>Ming-Xia Delvas, développeuse Android</li>
            <li>Paul Chaffanet, développeur iOS</li>
            <li>Matija Dabić, développeur Android</li>
            <li>Corélie Godefroid, développeuse serveur</li>
            <li>Théodore Jordan, développeur Android</li>
            <li>Emma June Huebner, consultante en éducation</li>
            <li>Isabel Leon Arriz, développeuse iOS</li>
            <li>Émile Labbé, développeur Android</li>
            <li>Manping Li, développeuse serveur</li>
            <li>Tiffany Maynard, responsable de l'alignement avec Wikidata</li>
            <li>Mohammed Naim, développeur Android</li>
            <li>Bojan Odobasic, développeur iOS</li>
            <li>Vi Phung, développeur serveur</li>
            <li>Jean-Marc Prud'homme, développeur iOS</li>
            <li>Abdelhakim Qbaich, développeur serveur</li>
            <li>Nemanja Mitrovic, développeur Android</li>
            <li>Mathieu Perron, développeur serveur</li>
            <li>Natacha Rivière, développeuse serveur</li>
            <li>Yuning Sun, développeuse serveur</li>
            <li>Kim Trinh, développeuse mobile</li>
            <li>Xiaoqian Wang, développeuse iOS</li>
            <li>Quentin Wolak, développeur iOS</li>
            <li>Jianxin You, développeur serveur</li>
            <li>Yan Zhuang, développeur iOS</li>

            <br>

            <li>Kim Gobeil, présidente du C.A. 2020-2021</li>
            <li>Sébastien Provencher, secrétaire du C.A. 2020-2022</li>
            <li>Cathyane Dufort, trésorière du C.A. 2020-2022</li>
            
            <br>

            <li>Shadi Abdoli, responsable à la structuration des données</li>
            <li>Marie Achille, consultante en accessibilité</li>
            <li>Émy Charron-Milot, stagiaire en recherche et communication</li>
            <li>Sarah Dumaresq, responsable des partenariats pédagogiques et des réseaux sociaux</li>
            <li>Valeria Guadalupe Márquez Reynoso, co-responsable des activités de médiation</li>
            <li>Aurélie Guye-Perrault, recherche en histoire de l'art</li>
            <li>Anna Papakostidis, co-responsable des activités de médiation</li>
            <li>Tristan Quiniou, stagiaire en recherche et développement</li>
            <li>Aurélie Bezacier, communications</li>
            <li>Roberto Martinez, graphiste</li>
            <li>Gilbert Fortin, graphiste</li>
            <li>Sandrine Rodrigue, graphiste</li>
            <li>Zuzanna Rokita, graphiste</li>
            <li>Laurent Tousignant, stagiaire en muséologie</li>
          </ul>

          <h3 id="artistes-en-residence">Artistes en résidence</h3>
          <ul>
            <li>Kijâtai-Alexandra Veillette-Cheezo</li>
            <li>VahMiré</li>
            <li>Craig Commanda</li>
          </ul>
          </div>
        </div>
    </ion-content>
</template>

<script>
import {IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonIcon} from "@ionic/vue";

export default {
    name: "AboutContainer",
    components: {
        IonHeader, IonContent, IonToolbar, IonButtons, IonBackButton, IonIcon
    }
}
</script>

<style scoped>
@import url("@/theme/GlobalStyle.css");

ion-header {
  --background: transparent; /* Make the background transparent */
  height: 9vh;
}

ion-header::after { background-image: none; }

ion-toolbar {
  --background: transparent; /* Also make the toolbar transparent */
}

h3 {
  font-size: 4vw;
}

h2 {
  margin: 0;
  margin-bottom: 2.6vh;
  font-size: 5.8vw;
  font-weight: bold;
}

ul {
  font-size: 3.9vw;
}

.encadre {
  background: white;
  padding: 2.7vh 3.8vw 2.7vh 3.8vw ;
  margin: 4vh 0;
  border-radius: 2vw;
}

.encadre:first-child {
  margin-top: 1vh;
}

ion-content {
    --background: url("/assets/drawable/blurred_colors_background.png") 100% 100%;
  background-size: 100% 902px;
  background-attachment: scroll;
}

img[alt="MONA logo"] {
  margin-left: 20vw;
  width: 42vw;
  height: 7vh;
}

.encadre a[href="https://monamontreal.org"] {
  color: black;
  text-decoration: underline;
  text-underline-offset: 0.1em;
  font-weight: bold;
}

.encadre a[href="https://monamontreal.org"] ion-icon {
  font-size: 3.4vw;
}

ion-back-button {
  color: black;
  --background: white;
  margin-left: 3.9vw;
}

ion-back-button::part(native) {
  border-radius: 1vw;
  padding: 0 2vw;
  font-size: 3.5vw;
}

.main-container {
    padding: 5vw;
}

* {
    font-family: 'Open Sans', sans-serif;
  line-height: 5.8vw;
}

p {
    margin-top: 2vw;
    margin-bottom: 0;
    font-size: 3.9vw;
}

.quiSommesNous p {
  margin-bottom: 5vw;
}

a {
    color: steelblue;
    text-decoration: none;
    font-weight: normal;
}
</style>

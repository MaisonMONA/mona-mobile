# MONA Ionic/Vue.js
## Setup
### Environnement à installer/télécharger
*Ceci ne sont que des recommandations, mais elles sont fortement suggérées*
* Utiliser l'environnement de code Webstorm (IDE puissant, gratuit avec un compte étudiant)
  * Y associer le plugin Sonarlint pour garantir une meilleure qualité de code
* Android studio
* `npm i -g @ionic/cli` pour installer Ionic, puis `npm install` dans le répertoire pour installer les plugins

De manière générale, essayer de suivre un style de code cohérent et consistant (espace entre les opérateurs, sauts de
lignes pour aérer et regrouper des lignes entre elles ; en cas de doute, aller voir les styleguides
[d'Airbnb](https://github.com/airbnb/javascript) ou de [Google](https://github.com/google/styleguide)). La lisibilité du code est importante, n'hésitez pas non plus à corriger ce que vous trouvez.
**Tant que possible, préférez le Typescript au Javascript, y compris dans les pages Vue.**


## Pour tester
### Sur desktop
Exécuter `ionic serve` à la racine pour lancer la version test dans le navigateur. Par défaut, l'application est servie
sur [localhost au port 8100](http://localhost:8100/). Ne pas oublier [d'activer l'affichage en mode téléphone dans les dev
tools](https://developer.chrome.com/docs/devtools/device-mode/) ! Je conseille de choisir le cadre du Samsung Galaxy S8+
pour travailler, parce qu'il est le juste milieu entre le ratio 9/20 (nouveaux appareils) et le 9/16 (anciens).

Actuellement, le navigateur ne prend pas en charge les demandes de permissions Android (GPS, caméra, stockage). Pour
pouvoir passer l'étape du tutoriel, il faut donc commenter les lignes qui gèrent cela quand on teste en live :

Fichier : [`src/views/TutorialPage.vue`](blob/main/src/views/TutorialPage.vue), lignes 44 à 64. 
```ts
// Ask for permissions
const cameraPermStatus = await Camera.requestPermissions();
const filePermStatus   = await Filesystem.requestPermissions();

let locationPermStatus;
try {
    locationPermStatus = await Geolocation.requestPermissions();
} catch (err) {
    locationPermStatus = "disabled"
}

if (cameraPermStatus.camera === "granted" && filePermStatus.publicStorage === "granted" &&
      (locationPermStatus === "disabled"         ||
       locationPermStatus.location === "granted" ||
       locationPermStatus.coarseLocation === "granted")
) {
    UserData.setSeenTutorial(true);        // NE PAS COMMENTER CETTE LIGNE
    this.$router.replace("/register");     // NE PAS COMMENTER CETTE LIGNE
} else {
    this.$router.replace("/permission-denied")
}
```

### Déployer dans le Google Play Store
1. (réactiver les lignes demandant les permissions dans `TutorialPage.vue`) 
2. Exécuter `ionic cap build android` à la racine, ce qui va lancer Android Studio (sinon, le lancer manuellement)
3. Récupérer les clefs  JKS dans le Google Docs dédié.
4. Aller dans `build.gradle (Module :app)` et augmenter `versionCode` de 1, augmenter aussi `versionName` si besoin
5. Build > Generate Signed Bundle / APK > Android App Bundle > Utiliser les clefs et mots de passe du Google Docs.
6. Déposer le fichier AAB sur le Google Play Store (en test interne ou en produciton selon le type de MàJ).

⚠️ Si l'on veut juste tester la version actuelle sur son propre téléphone (et pas faire de release), ne pas augmenter le
`versionCode` et générer un APK (pas un bundle). N'importe quel Android peut alors installer depuis cet APK.

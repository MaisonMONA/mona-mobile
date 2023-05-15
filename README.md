# Pour les sucesseur de developpement android
## Pour commencer
### Environnement à installer/télécharger
*Ceci ne sont que des recommandatations, mais ils sont fortement suggérer*
1. Webstorm (IDE puisssant gratuit avec un compte étudiant)
   2. Sonarlint (plugin de webstorm qui assure un code de qualité)
3. ```npm i -g @ionic/cli``` pour installer Ionic
4. Node.js
5. Android studio

## Pour tester
### Sur desktop
Pour tester l'application sur votre ordinateur, il est **important** de commenter
les lignes demandant les permission de caméra et de localisation. 

Ensuite, sur la ligne de commande, taper ```ionic serve``` (plus d'instruction dans la section *Instruction* qui suive)
#### Codes à commenter obligatoirement
Pour ce faire, dans "src/views/TutorialPage.vue", ces extraits de lignes sont à commenter. 

```vue
// Ask for permissions
/*
const cameraPermStatus = await Camera.requestPermissions();
const filePermStatus   = await Filesystem.requestPermissions();

let locationPermStatus;
try {
locationPermStatus = await Geolocation.requestPermissions();
} catch (err) {
locationPermStatus = "disabled"
}

if (cameraPermStatus.camera === "granted" && filePermStatus.publicStorage === "granted" &&
( locationPermStatus === "disabled"         ||
locationPermStatus.location === "granted" ||
locationPermStatus.coarseLocation === "granted" )
) {
*/

UserData.setSeenTutorial(true);
this.$router.replace("/register");

/*
} else {
this.$router.replace("/permission-denied")
}*/
```
De l'extrait ci-haut, seule cette partie ci-dessous sont à décommenter.
```vue
UserData.setSeenTutorial(true);
this.$router.replace("/register");
```

Dans "src/views/RegisterPage.vue", cet ligne doit également être commenté.
```vue
/*await this.checkPermissions();*/
```
#### Instructions 
1. Commenter le code (section "Codes à commenter obligatoirement" ci-haut)
2. Écrire la commande ```ionic serve``` sur une ligne de commande
3. Cliquer sur le lien ressemblant à "http://localhost" apparaissant après la compilation de l'app
3. *(pas obligatoire)* Toggle l'application sous forme "android" en faisant 
un right click -> inspect -> toogle device toolbar
   4. "toogle device toolbar" est un icône en haut, à côté de "element"

### Google play store: intern testing
#### Instructions
1. ```ionic cap build android``` sur la ligne de commande
   2. Cela va lancer l'application Android studio
3. Chercher "mona keys"
4. Version app ++
5. Dans google play store, drag and drop le file APK généré
"use strict";(self["webpackChunkmona"]=self["webpackChunkmona"]||[]).push([[13],{8013:(e,o,n)=>{n.r(o),n.d(o,{default:()=>I});n(3948);var t=n(6252);const r=e=>((0,t.dD)("data-v-6fbcbf17"),e=e(),(0,t.Cn)(),e),s=r((()=>(0,t._)("p",{id:"login-alert-holder"},null,-1))),l={class:"main-content"},i=r((()=>(0,t._)("p",{id:"welcome"},"Connexion",-1))),a=r((()=>(0,t._)("p",{id:"ask-for-login"},"Connectez-vous à votre compte.",-1))),u={class:"form-section"},d={class:"input-element username"},c=r((()=>(0,t._)("label",{for:"login-username"},"Nom d'utilisateur",-1))),m={class:"input-element password"},p=r((()=>(0,t._)("label",{for:"login-password"},"Mot de passe",-1))),g=r((()=>(0,t._)("span",null,"En créer un",-1)));function w(e,o,n,r,w,h){const f=(0,t.up)("ion-title"),_=(0,t.up)("ion-toolbar"),k=(0,t.up)("ion-header"),v=(0,t.up)("ion-input"),b=(0,t.up)("ion-item"),I=(0,t.up)("ion-button"),W=(0,t.up)("ion-content"),C=(0,t.up)("ion-page");return(0,t.wg)(),(0,t.j4)(C,null,{default:(0,t.w5)((()=>[(0,t.Wm)(k,null,{default:(0,t.w5)((()=>[(0,t.Wm)(_,null,{default:(0,t.w5)((()=>[(0,t.Wm)(f,null,{default:(0,t.w5)((()=>[(0,t.Uk)("MONA")])),_:1})])),_:1})])),_:1}),(0,t.Wm)(W,{fullscreen:!0},{default:(0,t.w5)((()=>[s,(0,t._)("div",l,[i,a,(0,t._)("div",u,[(0,t._)("div",d,[c,(0,t.Wm)(b,{id:"login-username"},{default:(0,t.w5)((()=>[(0,t.Wm)(v)])),_:1})]),(0,t._)("div",m,[p,(0,t.Wm)(b,{id:"login-password"},{default:(0,t.w5)((()=>[(0,t.Wm)(v,{type:"password"})])),_:1})]),(0,t.Wm)(I,{onClick:h.login},{default:(0,t.w5)((()=>[(0,t.Uk)("Se connecter")])),_:1},8,["onClick"]),(0,t._)("p",{class:"redirect-to-register",onClick:o[0]||(o[0]=(...e)=>h.goToRegister&&h.goToRegister(...e))},[(0,t.Uk)("Pas de compte ? "),g])])])])),_:1})])),_:1})}n(4916),n(5306),n(7658);var h=n(7285),f=n(2033),_=n(5951);const k={name:"LoginPage",components:{IonPage:h._i,IonHeader:h.Gu,IonToolbar:h.sr,IonTitle:h.wd,IonContent:h.W2,IonItem:h.Ie,IonInput:h.pK,IonButton:h.YG},beforeMount(){f.m.populate().then((()=>{""!==f.m.getToken()&&this.$router.replace("/loading")}))},methods:{goToRegister(){this.$router.push("/register")},login(){const e=document.querySelector("ion-item#login-username ion-input").value,o=document.querySelector("ion-item#login-password ion-input").value;if(e&&o){const n=new FormData;n.append("username",e.trim()),n.append("password",o),fetch(_.Z.apiRoutes.login,{method:"POST",body:n}).then((async o=>{const n=await o.json();o.ok?(n.token||this.showAlert("Server error"),f.m.setToken(n.token),f.m.setUsername(e.trim()),this.$router.replace("/loading")):n.errors&&n.errors.username?(console.log(n),this.showAlert(n.errors.username[0])):this.showAlert(`Erreur serveur (code ${o.status})`)})).catch((()=>{this.showAlert("Impossible de se connecter à internet.")}))}},showAlert(e){const o=document.getElementById("login-alert-holder");o.innerHTML=e,o.classList.add("show")}}};var v=n(3744);const b=(0,v.Z)(k,[["render",w],["__scopeId","data-v-6fbcbf17"]]),I=b}}]);
//# sourceMappingURL=13-legacy.5d56ba06.js.map
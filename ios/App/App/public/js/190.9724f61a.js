"use strict";(self["webpackChunkmona"]=self["webpackChunkmona"]||[]).push([[190],{8412:(e,t,n)=>{n.r(t),n.d(t,{default:()=>I});var a=n(6252);const o=e=>((0,a.dD)("data-v-16253808"),e=e(),(0,a.Cn)(),e),r=o((()=>(0,a._)("p",{id:"alertHolder"},null,-1))),l=o((()=>(0,a._)("p",null,[(0,a.Uk)("Chargement des données"),(0,a._)("br"),(0,a.Uk)("utilisateur...")],-1)));function s(e,t,n,o,s,d){const u=(0,a.up)("ion-title"),p=(0,a.up)("ion-toolbar"),c=(0,a.up)("ion-header"),i=(0,a.up)("ion-content"),m=(0,a.up)("ion-page");return(0,a.wg)(),(0,a.j4)(m,null,{default:(0,a.w5)((()=>[(0,a.Wm)(c,null,{default:(0,a.w5)((()=>[(0,a.Wm)(p,null,{default:(0,a.w5)((()=>[(0,a.Wm)(u,null,{default:(0,a.w5)((()=>[(0,a.Uk)("MONA")])),_:1})])),_:1})])),_:1}),(0,a.Wm)(i,{fullscreen:!0},{default:(0,a.w5)((()=>[r,l])),_:1})])),_:1})}n(3948),n(4916),n(5306),n(1703);var d=n(7285),u=n(5368),p=n(6850),c=n(5315),i=n(7327),m=n(6881),h=n(2043);class g extends h.v{static createSingleElement(e){return new m.Ct(e)}static getFromId(e){return super.getFromId(e)}}(0,i.Z)(g,"data",[]),(0,i.Z)(g,"path","appdata/badges.json"),(0,i.Z)(g,"type","badges");var w=n(2033);const _={name:"DataLoadingPage",components:{IonPage:d._i,IonHeader:d.Gu,IonToolbar:d.sr,IonTitle:d.wd,IonContent:d.W2},mounted(){Promise.all([u.M.populate(),p.F.populate(),c.L.populate(),g.populate()]).catch((()=>{this.showAlert("Impossible de se connecter à internet !")})).then((()=>Promise.all([w.m.getFromServer(),w.m.loadCache()]))).then((()=>{w.m.checkForDBUpdate(),w.m.tryUploadingPendingDiscoveries()})).then((()=>this.$router.replace("/tabs/map"))).catch((e=>{throw new Error(`Could not retrieve user data (${e})`)}))},methods:{showAlert(e){const t=document.getElementById("alertHolder");t.innerHTML=e,t.classList.add("show")}}};var f=n(3744);const v=(0,f.Z)(_,[["render",s],["__scopeId","data-v-16253808"]]),I=v}}]);
//# sourceMappingURL=190.9724f61a.js.map
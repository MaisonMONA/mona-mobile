"use strict";(self["webpackChunkmona"]=self["webpackChunkmona"]||[]).push([[642],{6642:(e,n,o)=>{o.r(n),o.d(n,{Geolocation:()=>i,GeolocationWeb:()=>t});var a=o(9895);class t extends a.Uw{async getCurrentPosition(e){return new Promise(((n,o)=>{navigator.geolocation.getCurrentPosition((e=>{n(e)}),(e=>{o(e)}),Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0},e))}))}async watchPosition(e,n){const o=navigator.geolocation.watchPosition((e=>{n(e)}),(e=>{n(null,e)}),Object.assign({enableHighAccuracy:!1,timeout:1e4,maximumAge:0},e));return`${o}`}async clearWatch(e){window.navigator.geolocation.clearWatch(parseInt(e.id,10))}async checkPermissions(){if("undefined"===typeof navigator||!navigator.permissions)throw this.unavailable("Permissions API not available in this browser");const e=await window.navigator.permissions.query({name:"geolocation"});return{location:e.state,coarseLocation:e.state}}async requestPermissions(){throw this.unimplemented("Not implemented on web.")}}const i=new t}}]);
//# sourceMappingURL=642.7975263f.js.map
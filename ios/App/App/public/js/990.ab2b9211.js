"use strict";(self["webpackChunkmona"]=self["webpackChunkmona"]||[]).push([[990],{8990:(e,t,n)=>{n.r(t),n.d(t,{createSwipeBackGesture:()=>s});var r=n(6587),a=n(545),o=n(6515);
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */
const s=(e,t,n,s,c)=>{const i=e.ownerDocument.defaultView;let u=(0,a.i)(e);const h=e=>{const t=50,{startX:n}=e;return u?n>=i.innerWidth-t:n<=t},l=e=>u?-e.deltaX:e.deltaX,d=e=>u?-e.velocityX:e.velocityX,k=n=>(u=(0,a.i)(e),h(n)&&t()),w=e=>{const t=l(e),n=t/i.innerWidth;s(n)},m=e=>{const t=l(e),n=i.innerWidth,a=t/n,o=d(e),s=n/2,u=o>=0&&(o>.2||t>s),h=u?1-a:a,k=h*n;let w=0;if(k>5){const e=k/Math.abs(o);w=Math.min(e,540)}c(u,a<=0?.01:(0,r.h)(0,a,.9999),w)};return(0,o.createGesture)({el:e,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:k,onStart:n,onMove:w,onEnd:m})}}}]);
//# sourceMappingURL=990.ab2b9211.js.map
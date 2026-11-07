// 1101A：後台每個分頁 render() 本身的同步時間（node rend28.js [html]）
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(10000);
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
const tabs=['status','flightdata','groundops','flightadjust','airspace27','bookings','groups23','cases0831B','auctions','members','notify','price','fareana','staff','sched','groundroster12','fleetsched','leave','salary','chat','approve'];
const out=[];for(const t of tabs){const r=await p.evaluate(t=>{S.adminTab=t;const a=performance.now();render();const m=performance.now()-a;const a2=performance.now();render();return [t,Math.round(m),Math.round(performance.now()-a2)]},t);out.push(r);await p.waitForTimeout(600)}
console.log(out.map(x=>x.join(':')).join('  '));await b.close()})();

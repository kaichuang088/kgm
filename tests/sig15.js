// which component of the rebuild input signature changes between prep and finish
const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>typeof window.kgmSig72R1006A==='function',null,{timeout:120000});
await p.evaluate(()=>{const h=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return (x>>>0).toString(36)};
 const o=window.kgmSig72R1006A;window.__SIG=[];window.__SUBS=[];
 window.kgmSig72R1006A=function(st,dy){const r=o.apply(this,arguments);try{const sub=S.acftSub||{};const ks=Object.keys(sub).sort();
  window.__SUBS.push(JSON.parse(JSON.stringify(sub)));
  let parts=[];try{parts=JSON.parse(r).map(x=>h(JSON.stringify(x)))}catch(_){}window.__SIG.push({t:Math.round(performance.now()/1000),parts:parts.join(','),all:h(r),sub:h(JSON.stringify(sub)),subN:ks.length,ts:h(JSON.stringify(S.tailStatus||{})),cf:h(JSON.stringify(S.customFlights||[])),fl:h(JSON.stringify(FLIGHTS)),mx:h(JSON.stringify(S.fleetMaintenanceR830||null))})}catch(_){}return r}});
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:1000});
const r=await p.evaluate(()=>{const S2=window.__SUBS;let diff=[];if(S2.length>=2){const a=S2[0],b=S2[1];const ks=new Set([...Object.keys(a),...Object.keys(b)]);ks.forEach(k=>{const x=JSON.stringify(a[k]),y=JSON.stringify(b[k]);if(x!==y)diff.push([k,x&&x.slice(0,160),y&&y.slice(0,160)])})}
 return {sig:window.__SIG,retry:window.KGM_FINALRETRY_1008A||0,final:window.KGM_ROT_FINAL_MS_R913,diffN:diff.length,diff:diff.slice(0,8)}});
console.log(JSON.stringify(r,null,1));await b.close()})();

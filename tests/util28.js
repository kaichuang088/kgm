// 1101A：組員利用率（依基地、職類）——node util28.js [days] [html]
const {chromium}=require('playwright');const N=+(process.argv[2]||14),F=process.argv[3]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(5000);
const r=await p.evaluate(async(N)=>{const P=kgmCrewPoolR121(),info={};(P.pilots||[]).forEach(c=>info['P|'+c.empId]=c);(P.cabin||[]).forEach(c=>info['C|'+c.empId]=c);
 const days={},dh={};const td=todayISO();
 for(let i=1;i<=N;i++){const d=new Date(Date.parse(td+'T12:00:00Z')+i*864e5).toISOString().slice(0,10);let pl=null;try{pl=kgmCrewPlanR121(d)}catch(e){}
   if(!pl)continue;(pl.flights||[]).forEach(f=>{[['P',f.pilots],['C',f.cabin]].forEach(([k,L])=>(L||[]).forEach(m=>{const id=k+'|'+(m.empId||m.id);if(m.dh||m.isDH||m.deadhead){dh[id]=(dh[id]||0)+1;return}(days[id]=days[id]||new Set()).add(d)}))});
   await new Promise(r=>setTimeout(r,0))}
 const g={};Object.keys(info).forEach(id=>{const c=info[id];const k=id[0]+'|'+(c.base||'TPE')+'|'+(c.virtualR121?'V':'R')+(c.reserve?'r':'');g[k]=g[k]||{n:0,used:0,days:0,dh:0};g[k].n++;const s=days[id];if(s){g[k].used++;g[k].days+=s.size}g[k].dh+=dh[id]||0});
 Object.keys(g).forEach(k=>{const x=g[k];x.avgDays=+(x.days/x.n).toFixed(2);x.pctUsed=Math.round(x.used/x.n*100)});
 const fl={};return {N,groups:g}},N);
console.log(JSON.stringify(r,null,1));await b.close()})();

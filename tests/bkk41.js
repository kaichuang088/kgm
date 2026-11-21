// 1112B C14：曼谷長程段誰飛、缺不缺人、台北組員在曼谷等多久、違規數
const {chromium}=require('playwright');const DAYS=+(process.env.DAYS||30);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file://'+(process.argv[2]||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 const r=await p.evaluate(({DAYS})=>{const T=todayISO();const P=kgmCrewPoolR121();const info={};P.pilots.concat(P.cabin).forEach(x=>info[x.empId]=x);
  let lh=0,lhTH=0,lhNon=0,short=0,viol=0,vs=[];const legs={};
  for(let i=0;i<DAYS;i++){const d=addDays(T,i);const pl=kgmCrewPlanR121(d);viol+=(pl.violations||[]).length;if(vs.length<5)vs.push(...(pl.violations||[]).slice(0,5-vs.length).map(v=>JSON.stringify(v).slice(0,140)));
   (pl.flights||[]).forEach(f=>{const isLh=kgmBkkLhR1112B(f);const need=(window.kgmPilotComplementR121(f.block,f.type).n||2);
    if(isLh){lh++;(f.pilots||[]).concat(f.cabin||[]).forEach(q=>{if((info[q.empId]||{}).nat22==='TH')lhTH++;else lhNon++});if((f.pilots||[]).length<need)short++}
    (f.pilots||[]).concat(f.cabin||[]).forEach(q=>{(legs[q.empId]=legs[q.empId]||[]).push({fr:f.fr,to:f.to,dep:+f.depUTC,arr:+f.arrUTC})})})}
  let waits=[],ex=[];Object.keys(legs).forEach(id=>{if((info[id]||{}).nat22==='TH')return;const L=legs[id].sort((a,b)=>a.dep-b.dep);for(let i=0;i+1<L.length;i++){if(L[i].to==='BKK'&&L[i+1].fr==='BKK'){const w=(L[i+1].dep-L[i].arr)/60;waits.push(w);if(w>72&&ex.length<4)ex.push(id+' '+L.slice(Math.max(0,i-1),i+3).map(x=>x.fr+'-'+x.to+'@'+new Date(x.dep*60000).toISOString().slice(5,16)).join(' | '))}}});
  waits.sort((a,b)=>a-b);const n=waits.length;
  return {days:DAYS,lhFlights:lh,lhCrewTH:lhTH,lhCrewNonTH:lhNon,lhPilotShort:short,viol,vs,ex,tpeAtBkk:{n,p50:n?waits[n>>1].toFixed(1):0,p90:n?waits[Math.floor(n*.9)].toFixed(1):0,max:n?waits[n-1].toFixed(1):0}}},{DAYS});
 console.log(JSON.stringify(r,null,1));await b.close()})();

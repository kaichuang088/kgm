const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';const D=(process.argv[3]||'2027-07-15,2027-01-15').split(',');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
const r=await p.evaluate(D=>{const out=[];let n=0;
 FLIGHTS.forEach(f=>{if(!f||f.via||f.partner||f.codeshare||!/^KX\d+$/.test(f.code))return;D.forEach(d=>{let x=null;try{x=kgmSeasonFlightR48(f,d)}catch(e){}if(!x||!x.dep)return;n++;
   const win=d>'2026-10-24'&&d<'2027-03-28';const t=kgmBlockTargetR1026B(f.fr,f.to,x.acft||f.acft,win,x.dep,d);
   if(x.dur<t-15){let lg='';try{lg=JSON.stringify(kgmBtDebugR1026B(f.code,f.fr,f.to,d).log)}catch(e){}out.push([f.code,f.fr+'-'+f.to,d,x.dep,x.arr,'+'+x.dd,x.dur,'target',t,'short',t-x.dur,lg].join(' '))}})});
 return {n,out}},D);
console.log('legs',r.n,'short>=15',r.out.length);r.out.forEach(x=>console.log(x));await b.close()})();

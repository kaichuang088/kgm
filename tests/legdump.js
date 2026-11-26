const {chromium}=require('playwright');const F=process.argv[2],O=process.argv[3];const D=(process.argv[4]||'2026-10-28,2026-11-15,2027-01-15,2027-03-20,2027-04-01,2027-07-15,2027-10-10').split(',');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
const r=await p.evaluate(D=>{const out=[];FLIGHTS.forEach(f=>{if(!f||f.via||!/^KX\d+$/.test(f.code))return;D.forEach(d=>{if(!flyOn(f,new Date(d+'T00:00:00')))return;let x=null;try{x=kgmSeasonFlightR48(f,d)}catch(e){}if(!x||!x.dep)return;
  out.push([f.code,f.fr,f.to,d,x.dep,x.arr,+x.dd||0,x.dur,!!(f.partner||f.codeshare)])})});return out},D);
require('fs').writeFileSync(O,JSON.stringify(r));console.log(r.length);await b.close()})();

const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{const out=[];const D=['2027-07-15','2027-01-15','2026-10-28','2027-03-20','2027-04-01','2027-10-10'];
 const want=/^(KX96|KX95|KX8|KX7|KX14|KX13|KX54|KX53|KX56|KX55|KX66|KX65|KX87|KX88|KX181)$/;
 FLIGHTS.filter(f=>f&&!f.via&&want.test(f.code)).forEach(f=>{D.forEach(d=>{let x=null;try{x=kgmSeasonFlightR48(f,d)}catch(e){}if(!x)return;
   out.push([f.code,f.fr+'-'+f.to,d,x.dep,x.arr,x.dd,x.dur,x.durStr,blockMin(f.fr,f.to,x.dep,x.arr,+x.dd||0)])})});
 return {rows:out,tz:{VIE:[kgmTzAtR1026C('VIE','2027-07-15'),kgmTzAtR1026C('VIE','2027-01-15')],SYD:[kgmTzAtR1026C('SYD','2027-07-15'),kgmTzAtR1026C('SYD','2027-01-15'),kgmTzAtR1026C('SYD','2027-10-10')],LAX:[kgmTzAtR1026C('LAX','2026-10-28'),kgmTzAtR1026C('LAX','2026-11-05'),kgmTzAtR1026C('LAX','2027-03-20')]},log:KGM_BT_LOG_R1026B}});
r.rows.forEach(x=>console.log(x.join(' ')));console.log(JSON.stringify(r.tz));console.log(JSON.stringify(r.log).slice(0,400));console.log('ERR',errs.slice(0,3));await b.close()})();

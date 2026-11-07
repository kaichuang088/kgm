const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<150&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);
 console.log(JSON.stringify(await p.evaluate(()=>{const rows=FLIGHTS.filter(f=>f&&!f.via&&!f.partner&&window.kgmMultiRowR143(f));const miss=[],sm=[];let need=0;
  const D=n=>{const t=new Date(todayISO()+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
  for(let i=0;i<365;i++){const d=D(i),dt=new Date(d+'T12:00:00');const day=window.kgmDayOf72R1006A(d);
    rows.forEach(f=>{if(!flyOn(f,dt))return;need++;const s=window.kgmSeasonFlightR48(f,d);if(!day.some(r=>r.f.code===f.code&&r.f.fr===f.fr&&r.f.to===f.to&&r.f.dep===s.dep))miss.push(d+' '+f.code+' '+f.fr+'-'+f.to+' '+f.dep);
      if(i<120&&i%7===0){const L=sortedFlights(f.fr,f.to,d)||[];if(!L.some(x=>x.code===f.code&&x.dep===s.dep))sm.push(d+' '+f.code+' '+s.dep)}})}
  return {rows:rows.map(f=>f.code+' '+f.fr+f.to+' '+f.dep).join(', '),need,miss:miss.length,ms:miss.slice(0,8),searchMiss:sm.length,ss:sm.slice(0,8)}})));await b.close()})();

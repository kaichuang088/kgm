const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
console.log(await p.evaluate(()=>{var rows=FLIGHTS.filter(x=>/^KX5[234]$/.test(x.code)||/^KX5[234]$/.test(String(x.code)));var out=rows.map(r=>r.code+' '+r.fr+'-'+r.to+(r.via?' via '+r.via:'')+' '+r.dep+'-'+r.arr+' dur='+r.dur+' days='+r.days);
  ['2026-10-03','2026-10-05','2026-10-12','2026-10-24','2026-10-25','2027-03-27','2027-03-29','2027-04-03','2027-04-05'].forEach(D=>{rows.forEach(r=>{var s=kgmSeasonFlightR48(r,D)||{};var leg='';try{var f=Object.assign({},r,s,{date:D});var L=segs7?null:null}catch(_){}
    out.push(D+' '+r.code+' '+r.fr+'-'+r.to+' '+s.dep+'-'+s.arr+(s.dd?'+'+s.dd:'')+' dur='+s.dur+' durStr='+s.durStr)})});
  try{out.push('TZ PER '+JSON.stringify([typeof tzOf==='function'&&tzOf('PER'),typeof tzOf==='function'&&tzOf('MEL')]))}catch(e){}
  return out.join('\n')}));await b.close()})();

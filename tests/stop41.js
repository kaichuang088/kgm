const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const m=t=>{const a=String(t).split(':');return +a[0]*60+(+a[1])};const out=[];
  const vias=FLIGHTS.filter(f=>f&&f.via&&!f.partner);
  vias.forEach(v=>{const l1=FLIGHTS.find(x=>x.code===v.code&&!x.via&&x.fr===v.fr&&x.to===v.via),l2=FLIGHTS.find(x=>x.code===v.code&&!x.via&&x.fr===v.via&&x.to===v.to);if(!l1||!l2){out.push('noleg '+v.code);return}
   ['2027-06-16','2027-10-23','2026-12-16'].forEach(d=>{const a=kgmSeasonFlightR48(l1,d),c=kgmSeasonFlightR48(l2,d);let st=m(c.dep)-m(a.arr);if(st<0)st+=1440;if(st<75)out.push(d+' '+v.code+' '+v.fr+'-'+v.via+'-'+v.to+' arr '+a.arr+' dep '+c.dep+' stop '+st)})});
  return out});
 console.log(r.join('\n'));await b.close()})();

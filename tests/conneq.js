const {chromium}=require('playwright');
(async()=>{const out=[];for(const f of process.argv.slice(2)){const b=await chromium.launch();const A=await (await b.newContext()).newPage();
 await A.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});await A.waitForTimeout(40000);
 out.push(await A.evaluate(()=>{const h=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return (x>>>0).toString(36)};const R=[['TPE','NRT'],['NRT','LAX'],['BKK','LHR'],['HKG','SFO'],['KIX','SYD'],['MNL','FRA']];const o=[];let ms=0;
  R.forEach(([a,c])=>{for(let i=20;i<27;i++){const d=addDays(todayISO(),i);const t0=performance.now();const r=findConnectionsFull(a,c,d);ms+=performance.now()-t0;o.push(a+c+d.slice(5)+':'+r.length+':'+h(JSON.stringify(r.map(x=>[x.hub,x.f1.code,x.f1.date,x.f1.dep,x.f2.code,x.f2.date,x.f2.dep,x.layover,x.total]))))}});
  return {ms:Math.round(ms),sig:h(o.join(' ')),sample:o.slice(0,3).join(' ')}}));await b.close()}
 out.forEach(x=>console.log(JSON.stringify(x)))})();

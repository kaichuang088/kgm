const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const o=[];['2026-10-25','2026-11-08'].forEach(d=>{const P=kgmGroundPlanR1008A('TPE',d);P.tasks.filter(t=>t.who.length<t.min).forEach(t=>{const h=m=>String(Math.floor(((m%1440)+1440)%1440/60)).padStart(2,'0')+':'+String(((m%60)+60)%60).padStart(2,'0');
   const avail=Object.values(P.people).filter(q=>!q.off);const fr=avail.filter(q=>q.reserve).length;o.push(d+' '+t.key+' '+h(t.a)+'-'+h(t.b)+' who '+t.who.length+'/'+t.min+' flights '+(t.flights||[]).map(f=>f.code).join(',')+' reserve '+fr)})});return o.join('\n')}));await b.close()})();

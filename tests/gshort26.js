const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};const o=[];
  for(let i=0;i<28;i++){const d=D(T,i);const P=kgmGroundPlanR1008A('TPE',d);if(P&&P.short.length)o.push(d+' '+JSON.stringify(P.short).slice(0,600))}return o.join('\n')}));await b.close()})();

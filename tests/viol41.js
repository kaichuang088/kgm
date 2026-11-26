const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const T=todayISO();const v=[];for(let i=0;i<30;i++){const pl=kgmCrewPlanR121(addDays(T,i));(pl.violations||[]).forEach(x=>v.push(x))}return {n:v.length,v:v.slice(0,12)}});
 console.log(F,JSON.stringify(r));await b.close()})();

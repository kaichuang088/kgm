const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>console.log('no fulldone'));
 await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const a=kgmAuditR184();return JSON.stringify({ok:a.ok,bad:a.bad,per:a.b78xPerMonth,roster:a.rosterTypes})}));
 await b.close()})();

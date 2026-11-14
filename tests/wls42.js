const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Asia/Taipei'});const p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(20000);
 await p.evaluate(()=>{S.crewWishR1115A={K80000:{'2026-12':['NRT','KIX','CDG','LHR','SYD']}};save()});await p.waitForTimeout(3000);
 const ls=await p.evaluate(()=>localStorage.getItem('kgm40_crewwish'));await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
 const back=await p.evaluate(()=>JSON.stringify(S.crewWishR1115A));console.log('LS',ls,'AFTER RELOAD',back);await b.close()})();

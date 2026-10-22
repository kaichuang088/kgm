const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>console.log('no fulldone'));
 await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const ex=S.tsaExchangeR830||[];const W=S.tsaWindowsR913||{};
  return 'B78X tails '+(tailsFor('B78X')||[]).length+'\nexchanges '+ex.length+'\n'+ex.map(x=>x.date+' '+x.kind+' out '+x.outgoing+' in '+x.incoming+' cool '+x.cooldownOk).join('\n')+'\nwindows '+JSON.stringify(W).slice(0,800)+'\nmonths '+['2026-10','2026-11','2026-12','2027-01'].map(m=>JSON.stringify(kgmTsaMonthPlanR913(m))).join('\n')}));
 await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
await p.evaluate(()=>{S.charterReqsR1026C=[{id:'CHRTEST-1',status:'pending',kind:'custom',pax:20}];save()});await p.waitForTimeout(3000);
await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
console.log('after reload',await p.evaluate(()=>JSON.stringify(S.charterReqsR1026C)));
const p2=await ctx.newPage();await p2.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p2.waitForTimeout(12000);
console.log('second tab',await p2.evaluate(()=>JSON.stringify(S.charterReqsR1026C)));
await b.close()})();

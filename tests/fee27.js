const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(10000);
console.log(await p.evaluate(()=>['E-C','E-T','E-Q','E-U','B-Q'].map(c=>c+' chgZH='+FARES[c].chgZH+' chg='+changeFeeOf(c)+' refZH='+FARES[c].refZH+' ref='+JSON.stringify(refundPolicyOf(c))).join('\n')));await b.close()})();

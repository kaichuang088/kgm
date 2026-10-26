const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
const r=await p.evaluate(()=>{const m=typeof kgmMailMapR110==='function'?kgmMailMapR110():window.kgmMailMapR110;return JSON.stringify(m)});
require('fs').writeFileSync('/tmp/j/mailmap27.json',r);console.log(r.slice(0,600));await b.close()})();

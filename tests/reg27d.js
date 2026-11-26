const {chromium}=require('playwright');
const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(70000);
const r=await p.evaluate(()=>{const o={};['kgmAuditR1008A','kgmAuditR163','kgmAuditR194','kgmAuditR205'].forEach(n=>{try{const v=window[n]();o[n]=JSON.stringify(v,(k,x)=>typeof x==='function'?undefined:x).slice(0,1500)}catch(e){o[n]='THREW '+e.message}});return o});
for(const k in r)console.log(k,r[k]);await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(20000);
const r=await p.evaluate((L)=>L.map(([c,f,t,d])=>{const x=kgmBtDebugR1026B(c,f,t,d);return c+' '+f+t+' '+d+' raw '+JSON.stringify(x&&x.x)+' pred '+JSON.stringify(x&&x.pred)+' out '+JSON.stringify(x&&x.out)+' log '+JSON.stringify(x&&x.log)}),JSON.parse(process.argv[2]));
console.log(r.join('\n'));await b.close()})();

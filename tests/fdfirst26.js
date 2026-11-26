const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
await p.waitForTimeout(20000);
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();});
await p.waitForTimeout(3000);
const cdp=await p.context().newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');
const r=await p.evaluate(async()=>{const t0=performance.now();S.adminTab='flightdata';render();const sync=performance.now()-t0;await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return {sync:Math.round(sync),paint:Math.round(performance.now()-t0)}});
const {profile}=await cdp.send('Profiler.stop');
const idx={};profile.nodes.forEach(n=>idx[n.id]=n);const par={};profile.nodes.forEach(n=>(n.children||[]).forEach(c=>par[c]=n.id));const dt=profile.timeDeltas;const incl={},self={};
for(let i=0;i<profile.samples.length;i++){let id=profile.samples[i];const n0=idx[id];const k0=n0.callFrame.functionName+'@'+n0.callFrame.lineNumber;self[k0]=(self[k0]||0)+(dt[i]||0)/1000;const seen=new Set();while(id){const n=idx[id];const k=n.callFrame.functionName+'@'+n.callFrame.lineNumber;if(!seen.has(k)){seen.add(k);incl[k]=(incl[k]||0)+(dt[i]||0)/1000}id=par[id]}}
console.log(JSON.stringify(r));console.log('INCL');console.log(Object.entries(incl).sort((a,b)=>b[1]-a[1]).slice(0,30).map(x=>x[0]+' '+Math.round(x[1])).join('\n'));
console.log('SELF');console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]+' '+Math.round(x[1])).join('\n'));await b.close()})();

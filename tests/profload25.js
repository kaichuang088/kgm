const {chromium}=require('playwright');
const SKIP=/^\(|render@|fullPage@|^wrapped@|^fp\d*@|^R@|^evaluate@|^@|^w\d*@|^fn@|^wrap\w*@|^call@|^apply@/;
function agg(profile){const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const parent={};profile.nodes.forEach(n=>(n.children||[]).forEach(ch=>parent[ch]=n.id));const dt=profile.timeDeltas;const inc={},self={};
 profile.samples.forEach((id,i)=>{let n=id,seen={};const f0=byId[id].callFrame;const sk=f0.functionName+'@'+f0.lineNumber;self[sk]=(self[sk]||0)+(dt[i]||0);while(n){const f=byId[n].callFrame;const k=f.functionName+'@'+f.lineNumber;if(!seen[k]&&!SKIP.test(k)){seen[k]=1;inc[k]=(inc[k]||0)+(dt[i]||0)}n=parent[n]}});return {inc,self}}
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
 const c=await ctx.newCDPSession(p);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:300});await c.send('Profiler.start');const t0=Date.now();
 await p.goto('file:///tmp/j/'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById('app');return a&&a.innerHTML.length>3000},null,{timeout:300000});const tp=Date.now()-t0;
 let {profile}=await c.send('Profiler.stop');const r=agg(profile);require('fs').writeFileSync('/tmp/j/pl_'+process.argv[2]+'.json',JSON.stringify(r));console.log(process.argv[2],'first paint',tp);
 await b.close()})();

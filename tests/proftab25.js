const {chromium}=require('playwright');
const SKIP=/^\(|render@|fullPage@|^wrapped@|^fp\d*@|^R@|^evaluate@|^@|^w\d*@|^fn@|adminView|^wrap\w*@|^call@|^apply@/;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<400;i++){const ok=await p.evaluate(()=>!!window.KGM_CREW_SAVE_R1025B&&window.kgmRosterReadyR196&&window.kgmRosterReadyR196()>=60);if(ok)break;await p.waitForTimeout(1000)}
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 await p.waitForTimeout(30000);
 const c=await ctx.newCDPSession(p);await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:200});
 for(const tab of (process.argv[2]||'auctions,stxstatus,sched,groundops').split(',')){
   for(let rep=0;rep<2;rep++){
   await c.send('Profiler.start');const ms=await p.evaluate(t=>{const t0=performance.now();S.adminTab=t;render();return Math.round(performance.now()-t0)},tab);const {profile}=await c.send('Profiler.stop');
   const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const parent={};profile.nodes.forEach(n=>(n.children||[]).forEach(ch=>parent[ch]=n.id));const dt=profile.timeDeltas;const inc={};
   profile.samples.forEach((id,i)=>{let n=id,seen={};while(n){const f=byId[n].callFrame;const k=f.functionName+'@'+f.lineNumber;if(!seen[k]&&!SKIP.test(k)){seen[k]=1;inc[k]=(inc[k]||0)+(dt[i]||0)}n=parent[n]}});
   console.log('=== '+tab+' rep'+rep+' sync '+ms+'ms');console.log(Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>'  '+k+' '+Math.round(v/1000)).join('\n'));
   await p.evaluate(()=>{S.adminTab='status';render()});await p.waitForTimeout(500);}}
 await b.close()})();

// long tasks (>700ms) with attribution: align CDP profile to performance.now via a marker busy-loop
const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);
await p.addInitScript(()=>{window.__LT=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>{if(e.duration>700)window.__LT.push([e.startTime,e.duration])})}).observe({entryTypes:['longtask']})}catch(_){}});
await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:3000});
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
await c.send('Profiler.start');
const mark=await p.evaluate(()=>{function MARK15(){const t=performance.now();while(performance.now()-t<300){}}const t0=performance.now();MARK15();return t0});
if(process.env.ADMIN){await p.waitForTimeout(12000);await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()})}
if(process.env.TABS){const tabs=['status','flightdata','groundops','flightadjust','bookings','cases0831B','cases0831C','auctions','members','milesverify','feedback_r48','news_r49','notify','coupons','finance','price','fareana','staff','sched','groundroster12','mgr12','fleetsched','leave','stafftix','stxstatus','salary','approve','history','syscfg','chat','simdata'];for(const t of tabs){await p.evaluate(t=>{S.adminTab=t;try{render()}catch(_){}},t);await p.waitForTimeout(3500)}}
await p.waitForTimeout(+(process.env.DUR||170000));const {profile}=await c.send('Profiler.stop');const LT=await p.evaluate(()=>window.__LT);
const N=new Map(profile.nodes.map(n=>[n.id,n]));const par={};profile.nodes.forEach(n=>(n.children||[]).forEach(ch=>par[ch]=n.id));
const nm=n=>(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);
let t=profile.startTime;const S=[];profile.samples.forEach((s,i)=>{t+=profile.timeDeltas[i]||0;S.push([t,s])});
const has=(id,f)=>{while(id!=null){if(N.get(id).callFrame.functionName===f)return true;id=par[id]}return false};
const m=S.find(x=>has(x[1],'MARK15'));const off=m[0]/1000-mark;   // profile ms = perf ms + off
console.log('longtasks',LT.length);
LT.forEach(([st,du])=>{const a=(st+off)*1000,z=(st+du+off)*1000,f={};S.forEach(([tt,s])=>{if(tt<a||tt>z)return;let id=s;const seen=new Set();while(id!=null){const n=N.get(id);if(n.callFrame.url&&n.callFrame.functionName){const k=nm(n);if(!seen.has(k)){seen.add(k);f[k]=(f[k]||0)+3}}id=par[id]}});
 const top=Object.entries(f).sort((x,y)=>y[1]-x[1]).slice(0,7).map(([k,v])=>k+' '+v);console.log(Math.round(st/1000)+'s '+Math.round(du)+'ms :: '+top.join(' | '))});
await b.close()})();

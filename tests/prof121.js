// 1121A：t_admlag 那種情境（新瀏覽器、CEO、逐頁切後台分頁）下，≥2 秒的長任務各是什麼函式
const {chromium}=require('playwright');const F='/tmp/j/kgm.html';const SEC=+(process.env.SEC||300);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.route(/workers\.dev/,r=>r.abort());const p=await ctx.newPage();
 const cdp=await ctx.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});
 await cdp.send('Profiler.start');const w0=Date.now();
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(3000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 const tabs=['status','flightdata','groundops','flightadjust','airspace27','bookings','groups23','pets30','cases0831B','cases0831C','auctions','members','milesverify','cardverify','feedback_r48','news_r49','notify','coupons','finance','price','fareana','fareadj','staff','sched','groundroster12','mgr12','fleetsched','leave','stafftix','stxstatus','salary','approve','history','syscfg','chat','simdata'];
 const marks=[];let i=0;
 while(Date.now()-w0<SEC*1000){const t=tabs[i++%tabs.length];marks.push([Date.now()-w0,t]);await p.evaluate(t=>{S.adminTab=t;render()},t).catch(()=>{});await p.waitForTimeout(6000)}
 const {profile}=await cdp.send('Profiler.stop');
 const nodes={},parent={};profile.nodes.forEach(n=>{nodes[n.id]=n;(n.children||[]).forEach(c=>parent[c]=n.id)});
 const nm=n=>(n.callFrame.functionName||'(anon)')+'@'+(n.callFrame.lineNumber+1);
 let t=profile.startTime/1000;const t0=t;let run=null;const runs=[];
 profile.samples.forEach((id,k)=>{t+=profile.timeDeltas[k]/1000;const n=nodes[id];const s=nm(n);const idle=/^\((idle|program)\)/.test(s);
   if(idle){if(run&&t-run.last>30){if(run.last-run.start>=2000)runs.push(run);run=null}return}
   if(!run)run={start:t,last:t,st:{}};run.last=t;
   const c=[];let y=id;while(y){c.push(nm(nodes[y]));y=parent[y]}c.reverse();
   const key=c.filter(q=>!/^\((root)\)/.test(q)).slice(0,6).join(' > ');run.st[key]=(run.st[key]||0)+1;
   const self=s;run.self=run.self||{};run.self[self]=(run.self[self]||0)+1});
 if(run&&run.last-run.start>=2000)runs.push(run);
 const wallOff=(profile.startTime/1000)-t0;
 runs.forEach(r=>{const at=Math.round(r.start-t0);const tab=(marks.filter(m=>m[0]<=at).pop()||[])[1];
   console.log('\nLONG',Math.round(r.last-r.start),'ms at',at,'ms tab',tab);
   Object.entries(r.st).sort((a,b)=>b[1]-a[1]).slice(0,6).forEach(q=>console.log('  ',q[1],q[0]));
   console.log('  SELF',Object.entries(r.self).sort((a,b)=>b[1]-a[1]).slice(0,6).map(q=>q[1]+' '+q[0]).join(' | '))});
 await b.close()})();

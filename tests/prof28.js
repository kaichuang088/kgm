// 1101A：後台點分頁時 CPU 花在哪（自身時間前 25 名）——node prof28.js [html]
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(10000);
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
await c.send('Profiler.enable');await c.send('Profiler.setSamplingInterval',{interval:500});await c.send('Profiler.start');
const tabs=['status','bookings','members','notify','cases0831B','price','staff','leave','chat','flightadjust','auctions','salary','groundroster12','flightdata','fleetsched','sched'];
const lat=[];for(const t of tabs){const a=Date.now();await p.evaluate(t=>{S.adminTab=t;render()},t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0))));lat.push([t,Date.now()-a]);await p.waitForTimeout(800)}
const {profile}=await c.send('Profiler.stop');
const self={},tot={};const N=new Map(profile.nodes.map(n=>[n.id,n]));const par={};profile.nodes.forEach(n=>(n.children||[]).forEach(ch=>par[ch]=n.id));
const nm=n=>(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1);
const dt={};profile.samples.forEach((s,i)=>{dt[s]=(dt[s]||0)+(profile.timeDeltas[i]||0)});
Object.keys(dt).forEach(id=>{const n=N.get(+id);const k=nm(n);self[k]=(self[k]||0)+dt[id];let x=+id;const seen=new Set();while(x!=null){const q=N.get(x);const kk=nm(q);if(!seen.has(kk)){tot[kk]=(tot[kk]||0)+dt[id];seen.add(kk)}x=par[x]}});
const top=(o,n)=>Object.entries(o).filter(([k])=>!/^\((program|idle|garbage collector|root)\)/.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>k+' '+Math.round(v/1000)+'ms');
const paths={};Object.keys(dt).forEach(id=>{let x=+id,chain=[],hit=false;while(x!=null){const q=N.get(x);const k=nm(q);if(/^buildDay121/.test(k))hit=true;chain.push(k);x=par[x]}if(!hit)return;const i=chain.findIndex(k=>/^window\.render:/.test(k));const key=(i>=0?'RENDER ':'BG ')+chain.slice(chain.findIndex(k=>/kgmCrewStepR121|kgmCrewPlanR121/.test(k)),chain.findIndex(k=>/kgmCrewStepR121|kgmCrewPlanR121/.test(k))+7).join(' < ');paths[key]=(paths[key]||0)+dt[id]});
console.log('PATHS',Object.entries(paths).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>Math.round(v/1000)+'ms '+k).join('\n '));
console.log('LAT',JSON.stringify(lat));console.log('SELF',top(self,25).join('\n '));console.log('TOTAL',top(tot,40).join('\n '));await b.close()})();

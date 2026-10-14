// sched922 + long-task timeline: what blocks the main thread and when
const {chromium}=require('playwright');const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1100}})).newPage();
 await p.addInitScript(()=>{window.__LT=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>{if(e.duration>800)window.__LT.push([Math.round(e.startTime/1000),Math.round(e.duration)])})}).observe({entryTypes:['longtask']})}catch(_){}});
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(42000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 await p.waitForTimeout(2500);
 const t0=Date.now();await p.evaluate(()=>{S.adminTab='sched';render()});const blocking=Date.now()-t0;
 const lat=[];let ready=0;
 for(let i=0;i<60;i++){const a=Date.now();ready=await p.evaluate(()=>{try{return window.kgmRosterReadyR196?window.kgmRosterReadyR196():-1}catch(e){return -2}});lat.push([Math.round(performance.now?0:0),Date.now()-a,ready]);if(ready>=60&&i>30)break;await new Promise(r=>setTimeout(r,1000))}
 const info=await p.evaluate(()=>({lt:window.__LT,full:window.KGM_FULLDONE_1006A?Math.round((window.KGM_FULLDONE_1006A-performance.timeOrigin)/1000):null,finalMs:window.KGM_ROT_FINAL_MS_R913||null}));
 console.log(JSON.stringify({blocking,ready,max:Math.max(...lat.map(x=>x[1])),lat:lat.map(x=>x[1]+'/'+x[2]).join(' '),info}));
 await b.close();})();

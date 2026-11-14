const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1100}})).newPage();
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(42000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 await p.waitForTimeout(2500);
 const t0=Date.now();
 await p.evaluate(()=>{S.adminTab='sched';render()});
 const blocking=Date.now()-t0;
 // responsiveness probe: how long does a trivial round trip take while it builds?
 const lat=[];const raw=[];let ready=0;
 for(let i=0;i<40;i++){
   const a=Date.now();
   ready=await p.evaluate(()=>{try{return window.kgmRosterReadyR196?window.kgmRosterReadyR196():-1}catch(e){return -2}});
   lat.push(Date.now()-a);raw.push([i,Date.now()-a,ready]);
   if(ready>=60)break;
   await new Promise(r=>setTimeout(r,1000));
 }
 lat.sort((x,y)=>x-y);
 console.log(JSON.stringify({blocking,ready,maxLatency:lat[lat.length-1],p50:lat[Math.floor(lat.length/2)],samples:lat.length,series:raw}));
 await b.close();})();

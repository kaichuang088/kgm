const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()});
 const early=process.env.EARLY==='1';
 if(!early){await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(5000);}else await p.waitForTimeout(15000);
 const t0=Date.now();
 await p.evaluate(()=>{const td=todayISO();const f=FLIGHTS.find(f=>f.code==='KX180');kgmFdOpenR1025B('KX180',td,f.fr,f.to)});
 let t=0;for(;t<60000;t+=250){const r=await p.evaluate(()=>!!document.querySelector('[data-k23fd="route"] .k25map.ready'));if(r)break;await p.waitForTimeout(250)}
 console.log('first map ready after',Date.now()-t0,'ms early=',early);
 const t1=Date.now();await p.evaluate(()=>{const td=todayISO();const f=FLIGHTS.find(f=>f.code==='KX186');kgmFdOpenR1025B('KX186',td,f.fr,f.to)});
 for(t=0;t<60000;t+=250){const r=await p.evaluate(()=>{const c=document.querySelector('[data-k23fd="route"] .k25map');return c&&c.classList.contains('ready')&&/NRT/.test(c.getAttribute('data-sig')||'')||(c&&c.classList.contains('ready')&&/KX186/.test(c.getAttribute('data-sig')||''))});if(r)break;await p.waitForTimeout(250)}
 console.log('second map',Date.now()-t1);
 await b.close()})();

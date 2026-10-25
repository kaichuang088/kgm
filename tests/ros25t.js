const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<400;i++){if(await p.evaluate(()=>!!window.KGM_CREW_SAVE_R1025B))break;await p.waitForTimeout(1000)}console.log('warm done');const tw=Date.now();for(let i=0;i<120;i++){const r=await p.evaluate(()=>window.kgmRosterReadyR196());if(r>=60){console.log('r196 ready 60 after',Math.round((Date.now()-tw)/1000),'s');break}await p.waitForTimeout(1000)}
 await p.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(Math.round(e.duration)))).observe({type:'longtask',buffered:false})});
 await p.evaluate(()=>{S.leave=S.leave||[];S.leave.unshift({caseNo:'LVX',empId:'K60002',empName:'x',type:'annual',start:addDays(todayISO(),7),end:addDays(todayISO(),8),status:'approved'});window.KGM_CREW_OFF_VER_R928=(window.KGM_CREW_OFF_VER_R928||0)+1;
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='sched';S.crewSelR196='K60002';render()});
 for(let i=0;i<20;i++){await p.waitForTimeout(1000);const r=await p.evaluate(()=>({k196:!!document.querySelector('.k196'),ros:!!document.querySelector('.k196-ros')}));if(r.ros){console.log('mounted after',i+1,'s');break}if(i==19)console.log('not mounted',r)}
 {const bb=await p.evaluate(()=>{const e=document.querySelector('.k196-ros');const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:Math.min(r.height,1400)}});await p.screenshot({path:'/tmp/j/lv25c_ros.png',fullPage:true,clip:{x:bb.x,y:bb.y+400,width:bb.w,height:bb.h-400}})}console.log(await p.evaluate(()=>({ready:window.kgmAuditR196?0:0,fly:document.querySelectorAll('.k196-ros .fly').length,prog:(document.querySelector('.k196 header')||{}).innerText})));
 console.log(await p.evaluate(()=>[...document.querySelectorAll('.k196-ros .rest')].map(e=>e.textContent).join(',').slice(0,300)));
 console.log('longtasks after open',await p.evaluate(()=>window.__lt.sort((a,b)=>b-a).slice(0,5)));console.log(errs.slice(0,10));await b.close()})();

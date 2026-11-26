const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<400;i++){const ok=await p.evaluate(()=>!!window.KGM_CREW_SAVE_R1025B&&window.kgmRosterReadyR196&&window.kgmRosterReadyR196()>=60);if(ok)break;await p.waitForTimeout(1000)}
 await p.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({entryTypes:['longtask']});
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();
   const st=window.kgmCrewStepR121;window.__steps=0;window.kgmCrewStepR121=function(){window.__steps++;return st.apply(this,arguments)};
   const ta=S.tailAssign;window.__ta=ta;});
 for(let i=0;i<40;i++){await p.waitForTimeout(3000);
   console.log(JSON.stringify(await p.evaluate(()=>{const lt=window.__lt;window.__lt=[];return {t:Math.round(performance.now()/1000),lt:Math.round(lt.reduce((a,x)=>a+x,0)),n:lt.length,cur:window.kgmCrewWarmProgressR923(),r196:window.kgmRosterReadyR196(),steps:window.__steps,taSame:window.__ta===S.tailAssign,sig:(window.kgmCrewSigR1025B()||'').slice(0,60),busy:!!S._crBusy928}})));
   if(i===5)await p.evaluate(()=>{S.adminTab='feedback_r48';render()});}
 await b.close()})();

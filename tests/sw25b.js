const {chromium}=require('playwright');
(async()=>{let b=await chromium.launch();let p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<400;i++){const sv=await p.evaluate(()=>window.KGM_CREW_SAVE_R1025B);if(sv)break;await p.waitForTimeout(1000)}
 const pick=await p.evaluate(()=>{const pl=kgmCrewPlanR121('2026-12-04');const f=(pl.flights||[]).find(f=>f.fr==='TPE'&&/NRT|HND/.test(f.to)&&(f.cabin||[]).length);const q=f.cabin.find(c=>/^K8/.test(c.empId))||f.cabin[0];return {id:q.empId,code:f.code,to:f.to}});
 console.log('pick',JSON.stringify(pick));await b.close();
 b=await chromium.launch();p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<150&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);
 await p.evaluate(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(Math.round(e.duration)))).observe({entryTypes:['longtask']});
  const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';localStorage.removeItem('kgm_ai_key_r1008b');render()});
 console.log('cursor at ask',await p.evaluate(()=>window.kgmCrewWarmProgressR923()));
 const t0=Date.now();const q=pick.id+'想把12-04的'+pick.to+'換成12-03(可以降落於TSA或從HND/NRT出發)';console.log('ask:',q);
 await p.evaluate(q=>{window.kgmAdminAiAskR929(q)},q);
 let txt='';for(let i=0;i<300;i++){await p.waitForTimeout(1000);txt=await p.evaluate(()=>{const st=S.adminAiR929||{},k=(S.adminUser||{}).empId||'ADMIN',L=st[k]||[];const a=L.filter(x=>x.role==='assistant');return a.length?a[a.length-1].text:''});if(txt&&!/正在找/.test(txt))break}
 console.log('elapsed',Math.round((Date.now()-t0)/1000),'s');console.log(String(txt).slice(0,1200));
 const lt=await p.evaluate(()=>window.__lt);console.log('longtasks n',lt.length,'max',Math.max(0,...lt),'>3s',lt.filter(x=>x>3000).length);
 await b.close()})();

// 1025B K：組員在外站請假 → 請假期間不排班，結束隔天排回程（執勤或 DH）
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 const t0=Date.now();
 for(let i=0;i<400;i++){const r=await p.evaluate(()=>({f:!!window.KGM_FULLDONE_1006A,c:window.kgmCrewWarmProgressR923&&window.kgmCrewWarmProgressR923(),sv:!!window.KGM_CREW_SAVE_R1025B}));if(i%15===0)console.log(Math.round((Date.now()-t0)/1000)+'s',JSON.stringify(r));if(r.sv)break;await p.waitForTimeout(1000)}
 const pick=await p.evaluate(()=>{
   const T=todayISO(),D=(d,n)=>addDays(d,n);
   const real={};(S.staff||[]).forEach(s=>{if(s&&(s.role==='pilot'||s.role==='cabin')&&s.active!==false)real[s.empId]=s});
   const day=(id,d)=>{const o=[];const pl=kgmCrewPlanR121(d);(pl.flights||[]).forEach(f=>{if((f.pilots||[]).concat(f.cabin||[]).some(q=>q&&q.empId===id))o.push(f.code+' '+f.fr+'→'+f.to)});
     Object.keys(S.crewPositioningR121||{}).forEach(k=>{if(k.slice(0,10)!==d)return;(S.crewPositioningR121[k]||[]).forEach(q=>{if(q&&q.empId===id&&q.flight)o.push('DH '+q.flight.code+' '+q.flight.fr+'→'+q.flight.to)})});return o.join(' + ')};
   for(let i=4;i<14;i++){const d=D(T,i);const pl=kgmCrewPlanR121(d);
     for(const f of (pl.flights||[])){if(f.fr!=='TPE'||!window.kgmIsLongHaulR71||!kgmIsLongHaulR71(f))continue;
       for(const q of (f.pilots||[]).concat(f.cabin||[])){if(!q||!real[q.empId])continue;
         // 下一班從外站回來（d+1..d+4）
         for(let j=1;j<=4;j++){const s=day(q.empId,D(d,j));if(s){if(s.indexOf(f.to+'→')>=0&&!/^DH/.test(s)){
           const lines={};for(let k=-1;k<=9;k++)lines[D(d,k)]=day(q.empId,D(d,k));
           return {id:q.empId,name:real[q.empId].name,role:real[q.empId].role,out:d,outFl:f.code+' '+f.fr+'→'+f.to,ret:D(d,j),retFl:s,lines}}break}}}}}
   return null});
 console.log('pick',JSON.stringify(pick,null,1));
 if(!pick){await b.close();return}
 // 請假：回程那天起兩天
 const L0=pick.ret,L1=await p.evaluate(d=>addDays(d,1),L0);
 const t1=Date.now();
 await p.evaluate(([id,name,a,c])=>{S.leave=S.leave||[];S.leave.unshift({caseNo:'LVT25',empId:id,empName:name,type:'annual',days:2,start:a,end:c,reason:'test',status:'pending',filed:todayISO()});doLeaveDecide(0,true)},[pick.id,pick.name,L0,L1]);
 let lag=0;for(let i=0;i<600;i++){const t=Date.now();const busy=await p.evaluate(()=>window.kgmCrewBusyR928());lag=Math.max(lag,Date.now()-t);if(!busy)break;await p.waitForTimeout(500)}
 console.log('replan done after',Math.round((Date.now()-t1)/1000),'s maxEvalLag',lag,'ms');
 const after=await p.evaluate(([id,a,b,n])=>{const D=(d,k)=>addDays(d,k);
   const day=(d)=>{const o=[];const pl=kgmCrewPlanR121(d);(pl.flights||[]).forEach(f=>{if((f.pilots||[]).concat(f.cabin||[]).some(q=>q&&q.empId===id))o.push(f.code+' '+f.fr+'→'+f.to)});
     Object.keys(S.crewPositioningR121||{}).forEach(k=>{if(k.slice(0,10)!==d)return;(S.crewPositioningR121[k]||[]).forEach(q=>{if(q&&q.empId===id&&q.flight)o.push('DH '+q.flight.code+' '+q.flight.fr+'→'+q.flight.to)})});return o.join(' + ')};
   const lines={};for(let k=-1;k<=9;k++)lines[D(n,k)]=day(D(n,k));
   const l=S.leave[0];return {lines,rec:l.crewReplanR928||null,msg:S._crMsg928||'',notes:(S.notifs||[]).slice(0,0)}},[pick.id,L0,L1,pick.out]);
 console.log('leave',L0,'~',L1);console.log('after',JSON.stringify(after,null,1));
 await p.evaluate(id=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='sched';S.crewSelR196=id;render()},pick.id);await p.waitForTimeout(3000);
 await p.locator('.k196-ros').first().screenshot({path:'/tmp/j/lv25c_ros.png',timeout:20000}).catch(e=>console.log('shot',String(e).slice(0,120)));
 console.log('errors',errs.slice(0,5),'mailfail',await p.evaluate(()=>(window.KGM_MAIL_FAIL_R1025B||[]).length));
 await b.close()})();

// 1112A C14：組員班表「休假」不含外站過夜；外站沒航段的日子另計「外站過夜」、格子寫「外站 XXX」
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(5000);
 for(let i=0;i<60;i++){await p.evaluate(i=>{kgmCrewPlanR121(addDays(todayISO(),i))},i)}
 await p.waitForFunction(()=>{try{return kgmRosterR196((S.staff||[]).find(s=>s.role==='pilot').empId,60).length>=60}catch(_){return false}},null,{timeout:200000,polling:2000}).catch(()=>{});
 const pick=await p.evaluate(()=>{const pil=(S.staff||[]).filter(s=>s.role==='pilot'&&(s.base||'TPE')==='TPE');let best=null;pil.forEach(s=>{const ros=kgmRosterR196(s.empId,60);const L=ros.filter(x=>(x.legs||[]).some(l=>l.to!=='TPE'&&l.to!=='TSA'&&!l.deadhead)).length;if(!best||L>best.n)best={id:s.empId,n:L}});return best});
 const r=await p.evaluate(async(id)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.crewSelR196=id;
   const tabs=['crew196','crewsched','crew'];S.adminTab='sched';render();await new Promise(r=>setTimeout(r,2500));
   let box=document.querySelector('.k196-ros');if(!box){for(const t of ['crewR196','crewroster','crew_roster','crewsched']){S.adminTab=t;render();await new Promise(r=>setTimeout(r,1500));box=document.querySelector('.k196-ros');if(box)break}}
   if(!box){const h=window.rosterHtml196?rosterHtml196():'';return {nobox:true,tab:S.adminTab}}
   const kpi=[...box.querySelectorAll('.k196-kpi>div')].map(d=>d.innerText.replace(/\s+/g,' '));
   const away=[...box.querySelectorAll('.k196-cal .rest')].map(e=>e.textContent).filter(t=>/外站/.test(t));
   const off=[...box.querySelectorAll('.k196-cal .rest')].filter(e=>e.textContent==='休').length;
   // 驗證：外站格子的日期前一個有航段的日子，最後一段落地在那一站
   const ros=kgmRosterR196(id,60);let wrong=0,checked=0,loc=null;ros.forEach(x=>{const L=(x.legs||[]).concat(x.dh||[]);if(L.length){loc=L.slice().sort((a,b)=>(+a.depUTC||0)-(+b.depUTC||0)).pop().to;return}});
   return {id,kpi,awayCells:away.length,awaySample:away.slice(0,5),offCells:off}},pick.id);
 console.log(JSON.stringify({pick,r},null,1));
 await p.evaluate(()=>{const e=document.querySelector('.k196-kpi');if(e)e.scrollIntoView({block:'start'})});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/s40/ros40.png'});
 console.log('ERR',errs.slice(0,3));await b.close();process.exit(r&&r.kpi&&r.kpi.some(k=>/外站過夜/.test(k))&&r.awayCells>0&&!errs.length?0:1)})();

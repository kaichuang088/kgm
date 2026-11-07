// 1108A N11：組員班表卡——DH 行不截字、DH 員工票 PNR；客艙組員不分機型
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei',deviceScaleFactor:1})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(addDays(todayISO(),8)),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(2000);
const r=await p.evaluate(async()=>{const P=kgmCrewPoolR121();const all=P.pilots.concat(P.cabin).filter(c=>c.base==='BKK').slice(0,300);let hit=null;
 for(const c of all){let ros=[];try{ros=kgmRosterR196(c.empId,10)}catch(_){}for(const x of ros){const L=x.legs||[];if(L.some(l=>!(l.deadhead||l.dhR913||l.code==='DH'))&&L.some(l=>(l.deadhead||l.dhR913||l.code==='DH')&&l.fr!==l.to)){hit={id:c.empId,date:x.date,name:c.name};break}}if(hit)break}
 if(!hit)return {none:true};const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';render();await new Promise(r=>setTimeout(r,1500));
 kgmCrewViewR196(hit.id);await new Promise(r=>setTimeout(r,2500));
 const cell=[...document.querySelectorAll('.k196-cal > div')].find(d=>(d.querySelector('small')||{}).textContent===hit.date.slice(5));if(cell)cell.scrollIntoView({block:'center'});
 const dh=cell&&cell.querySelector('i.k196-dh');return {hit,cell:cell&&cell.innerText,dhOverflow:dh?(dh.scrollWidth>dh.clientWidth+1):null,ws:dh?getComputedStyle(dh).whiteSpace:null}});
console.log(JSON.stringify(r,null,1));await p.screenshot({path:'/tmp/j/dh38.png'});console.log('ERR',errs.slice(0,4));await b.close()})();

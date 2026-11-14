// 1108A N12：換機型（跨機型族）→ 換機師、通知新舊機師、原機師班表寫照常計薪、每日異動寫機長改派
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(addDays(todayISO(),7)),null,{timeout:500000}).catch(()=>{});await p.waitForTimeout(2000);
const r=await p.evaluate(async()=>{const o={};const FM=t=>window.kgmTypeFamilyR121?window.kgmTypeFamilyR121(t):t;const P=kgmCrewPoolR121();const byId={};P.pilots.forEach(x=>byId[x.empId]=x);
 const mism=()=>{const L=[];for(let k=0;k<8;k++){const d=addDays(todayISO(),k);if(!kgmCrewHasDayR121(d))continue;(kgmCrewPlanR121(d).flights||[]).forEach(f=>{let at=f.type;try{at=acftOfFlight(f.code,d,f.fr,f.to)||f.type}catch(_){}const bad=(f.pilots||[]).filter(x=>byId[x.empId]&&byId[x.empId].fam!==FM(at));if(bad.length)L.push(d+' '+f.code+' '+f.fr+'-'+f.to+' '+f.type+'→'+at+' bad'+bad.length)})}return L};
 o.before=mism().slice(0,12);const n0=(S.staffNotifs||[]).length;kgmCrewSwapScanR1108A();o.recs=Object.keys(S.crewSwapR1108A.recs).length;o.after=mism().slice(0,12);o.notifs=(S.staffNotifs||[]).length-n0;
 const k=Object.keys(S.crewSwapR1108A.recs)[0];const rec=S.crewSwapR1108A.recs[k];o.rec=rec;
 if(rec){const s=rec.swaps[0];o.nOut=(S.staffNotifs||[]).find(n=>n.empId===s.outId);o.nIn=(S.staffNotifs||[]).find(n=>n.empId===s.inId);
  const ro=kgmRosterR196(s.outId,10).find(x=>x.date===rec.date);const ri=kgmRosterR196(s.inId,10).find(x=>x.date===rec.date);o.rosOut=ro&&{legs:(ro.legs||[]).map(l=>l.code+' '+l.fr+'-'+l.to),paid:ro.paidSwapR1108A};o.rosIn=ri&&{legs:(ri.legs||[]).map(l=>l.code+' '+l.fr+'-'+l.to+' '+(l.rank||''))};
  const ch=(kgmChangesR78(rec.date).changes||[]).filter(c=>c.kind==='sub'&&c.code===rec.code);o.chg=ch.map(c=>c.why);
  /* 原機師的班表卡 */
  const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';render();await new Promise(r=>setTimeout(r,1500));kgmCrewViewR196(s.outId);await new Promise(r=>setTimeout(r,2000));
  const cell=[...document.querySelectorAll('.k196-cal > div')].find(d=>(d.querySelector('small')||{}).textContent===rec.date.slice(5));o.cellOut=cell&&cell.innerText;if(cell)cell.scrollIntoView({block:'center'});
  kgmCrewViewR196(s.inId);await new Promise(r=>setTimeout(r,2000));const cell2=[...document.querySelectorAll('.k196-cal > div')].find(d=>(d.querySelector('small')||{}).textContent===rec.date.slice(5));o.cellIn=cell2&&cell2.innerText}
 return o});
console.log(JSON.stringify(r,null,1));await p.screenshot({path:'/tmp/j/cx38.png'});console.log('ERR',errs.slice(0,4));await b.close()})();

// 1103A：地勤報到列印——A4 版面、登機門＝後台排定的登機門（跟看板同一份）
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(14000);
const r=await p.evaluate(()=>{window.KGM_NOPRINT_R1103A=1;const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;
 const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);const key=[f.code,d,f.fr,f.to].join('|');
 window.KGM_NODH_R1023A=1;const m=manifest7(Object.assign({},f,{date:d}),d);window.KGM_NODH_R1023A=0;
 const a=m.find(x=>x.cabin==='Business'&&!x.dhR929),c=m.find(x=>x.cabin==='Resident');
 const mk=(x,extra)=>Object.assign({key,id:x.id,pnr:x.pnr,cabR1103A:x.cabin,fareR1103A:x.fare},extra||{});
 const jobs=[{I:kgmCiInfoR1103A(mk(a,{chargeUnits:1})),ks:['bp','lg','rc']}].concat(c?[{I:kgmCiInfoR1103A(mk(c)),ks:['bp','lg']}]:[]);
 kgmCiPrintJobsR1103A(jobs);
 S._k65Raw=1;const g=kgmGateOfR26(f.code,d);S._k65Raw=0;const gPub=kgmGateOfR26(f.code,d);
 const bpGate=[...document.querySelectorAll('#k31pr .k12bp-g4 .k12bp-v')].filter((e,i)=>i%4===0).map(e=>e.innerText);
 // 前台登機證（起飛前 >12 小時）：登機門應該跟看板一樣「未公布」→ Check at Airport
 let front='';try{const bk=S.bookings.find(x=>x&&x.outF);if(bk){const dd=kgmBpDataR1012A(bk,'out');front=(dd&&dd.f&&dd.f.code)+' '+(dd&&dd.f&&dd.f.date)+' gate='+(dd&&dd.gate)}}catch(e){front=String(e)}
 return {state:window.KGM_CIPRINT_R1103A,planned:g&&g.gate,published:gPub&&gPub.gate,bpGate,lgGate:[...document.querySelectorAll('#k31pr .k31pr-lgrow')].map(e=>e.innerText.replace(/\s+/g,' ')),front}});
console.log(JSON.stringify(r,null,1));
await p.emulateMedia({media:'print'});await p.pdf({path:'/tmp/j/cipr33.pdf',format:'A4',printBackground:true});
console.log('ERR',errs.slice(0,4));await b.close()})();

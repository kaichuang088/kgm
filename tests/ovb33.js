// 1103A：座位圖「超賣／撞位處理」——撞位偵測（Residence 雙人不算）、搜尋被蓋住的旅客、換座位＋里程、改搭航班＋抵用券、案件、通知
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const out={};
out.kit=await p.evaluate(()=>Object.keys(window.kgmFdKitR1103A||{}).map(k=>k+':'+typeof window.kgmFdKitR1103A[k]).join(','));
// A388 班：Residence 雙人不算撞位
out.a388=await p.evaluate(async()=>{const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX181'&&x.fr==='NRT');const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');S.fdTabR1025B='seat';render();await new Promise(r=>setTimeout(r,2500));
 const t=document.getElementById('k31ovb');return t?t.querySelector('.k31o-sum').innerText:'NO PANEL'});
// KX4：做出超賣——把經濟艙旅客一個個改成商務艙（不給座位），商務艙配完後多出來的人就沒有座位
const setup=await p.evaluate(async()=>{window.alert=m=>{window.__al=m};window.confirm=()=>true;const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');S.fdTabR1025B='seat';render();await new Promise(r=>setTimeout(r,2500));
 const key=S.opsSelectedR7,F=Object.assign({},f,{date:d}),mf=()=>{window.KGM_NODH_R1023A=1;try{return manifest7(F,d)}finally{window.KGM_NODH_R1023A=0}};let m=mf();
 const kit=kgmFdKitR1103A,bzSeats=kit.seatsFlat(kit.type(f,d)).filter(s=>s.cabin==='Business'&&!s.resident).length,bzNow=m.filter(q=>q.cabin==='Business'&&!q.offloadR929).length;
 const need=bzSeats-bzNow+2;const eco=m.filter(q=>q.cabin==='Economy'&&!q.real&&!q.dhR929).slice(-need);
 eco.forEach(x=>kit.applyRow(key,x,{cabin:'Business',seat:''},f,d));save();m=mf();
 const nos=m.filter(q=>!q.offloadR929&&!q.seat);render();await new Promise(r=>setTimeout(r,800));
 const t=document.getElementById('k31ovb');return {key,bzSeats,bzNow,moved:eco.length,nos:nos.map(q=>({id:q.id,name:q.name,last:q.last,cabin:q.cabin})),sum:t&&t.querySelector('.k31o-sum').innerText}});
const tgt=setup.nos[0]||{};setup.c=tgt;
out.setup=setup;console.log(JSON.stringify(out));out.dbg=await p.evaluate(()=>({sec:!!document.querySelector('#app [data-k23fd="seat"]'),secs:[...document.querySelectorAll('#app [data-k23fd]')].map(e=>e.getAttribute('data-k23fd')),panel:!!document.getElementById('k31ovb'),tab:S.fdTabR1025B,view:S.view,at:S.adminTab}));console.log(JSON.stringify(out.dbg));
// 用打字搜尋被蓋住的那位
await p.click('#k31oQ');await p.keyboard.type(setup.c.last,{delay:40});await p.waitForTimeout(600);
out.search=await p.evaluate(()=>[...document.querySelectorAll('.k31o-res button')].map(b=>b.innerText.replace(/\s+/g,' ')).slice(0,4));
out.focusKept=await p.evaluate(()=>document.activeElement&&document.activeElement.id);
// 點那位 → 卡片
await p.evaluate(id=>kgmOvbSetR1103A('id',id,1),setup.c.id);await p.waitForTimeout(400);
out.card=await p.evaluate(()=>{const c=document.querySelector('.k31o-card');return c?c.innerText.replace(/\s+/g,' ').slice(0,500):'NO CARD'});
// 換座位 1000 哩
const before=await p.evaluate(()=>(S.staffCasesR1007A||[]).length);
await p.evaluate(()=>kgmOvbSetR1103A('miles',1000,1));
const pickSeat=await p.evaluate(()=>S.ovbR1103A.seat);
await p.evaluate(()=>kgmOvbSeatR1103A());await p.waitForTimeout(800);
out.seatMove=await p.evaluate(([id,before,pick])=>{const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);window.KGM_NODH_R1023A=1;const m=manifest7(Object.assign({},f,{date:d}),d);window.KGM_NODH_R1023A=0;const x=m.find(q=>q.id===id);const c=(S.staffCasesR1007A||[])[0];
 return {pick,seat:x.seat,cabin:x.cabin,act:x.opsActR929&&x.opsActR929.act,miles:x.opsActR929&&x.opsActR929.miles,cases:(S.staffCasesR1007A||[]).length-before,caseNo:c&&c.caseNo,caseType:c&&c.type,caseDetail:c&&c.detail,sum:document.getElementById('k31ovb').querySelector('.k31o-sum').innerText,toast:(document.querySelector('.k31-toast')||{}).textContent}},[setup.c.id,before,pickSeat]);
// 復原（作業動作 restore）→ 回到原座位（撞位又出現）
out.undo=await p.evaluate(async id=>{S.fdActR929='restore';kgmFdActR929(S.opsSelectedR7,id);await new Promise(r=>setTimeout(r,500));const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);window.KGM_NODH_R1023A=1;const m=manifest7(Object.assign({},f,{date:d}),d);window.KGM_NODH_R1023A=0;return {seat:m.find(q=>q.id===id).seat,sum:document.getElementById('k31ovb').querySelector('.k31o-sum').innerText}},setup.c.id);
// 改搭航班（模擬旅客）
await p.evaluate(id=>{kgmOvbSetR1103A('id',id,1);kgmOvbSetR1103A('open','flight',1)},setup.c.id);await p.waitForTimeout(800);
out.flights=await p.evaluate(()=>[...document.querySelectorAll('.k31o-fl button')].map(b=>b.innerText.replace(/\s+/g,' ')+(b.disabled?' [x]':'')+(b.classList.contains('on')?' [on]':'')));
await p.evaluate(()=>{kgmOvbSetR1103A('usd',100,1);kgmOvbSetR1103A('fmiles',5000,1);kgmOvbSetR1103A('meal',true,1)});
const n1=await p.evaluate(()=>(S.staffCasesR1007A||[]).length);
await p.evaluate(()=>kgmOvbFlightR1103A());await p.waitForTimeout(800);
out.flightMove=await p.evaluate(([id,n1])=>{const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);window.KGM_NODH_R1023A=1;const m=manifest7(Object.assign({},f,{date:d}),d);window.KGM_NODH_R1023A=0;const x=m.find(q=>q.id===id);const c=(S.staffCasesR1007A||[])[0];return {off:x.offloadR929,act:x.opsActR929,cases:(S.staffCasesR1007A||[]).length-n1,detail:c&&c.detail,sum:document.getElementById('k31ovb').querySelector('.k31o-sum').innerText}},[setup.c.id,n1]);
out.alert=await p.evaluate(()=>window.__al||'');
await p.evaluate(id=>{kgmOvbSetR1103A('id',id,1)},(setup.nos[1]||{}).id);await p.waitForTimeout(600);
await p.evaluate(()=>{const e=document.getElementById('k31ovb');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-90)});await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/j/ovb33.png',fullPage:false});
await p.evaluate(()=>kgmOvbSetR1103A('open','seat',1));await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/ovb33b.png',fullPage:false});
console.log(JSON.stringify(out,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

// 1101A：通知管理「航班旅客」分航段（KX87 10-31 TPE-BKK／11-01 BKK-FRA）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(12000);
const D=await p.evaluate(()=>{var T=todayISO(),D=addDays(T,3),f=FLIGHTS.find(x=>x.code==='KX87'&&x.via),u=S.users[0];
 S.bookings.push({pnr:'NT28A',status:'confirmed',userId:u.id,outF:Object.assign({},f,kgmSeasonFlightR48(f,D),{date:D}),outC:'E-T',paxList:[{firstName:'A',lastName:'ONE'},{firstName:'B',lastName:'ONE'}],seats:{}});
 var f1=FLIGHTS.find(x=>x.code==='KX87'&&x.fr==='BKK'&&!x.via);S.bookings.push({pnr:'NT28B',status:'confirmed',userId:S.users[1]?S.users[1].id:u.id,outF:Object.assign({},f1,kgmSeasonFlightR48(f1,addDays(D,1)),{date:addDays(D,1)}),outC:'E-T',paxList:[{firstName:'C',lastName:'TWO'}],seats:{}});
 S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='notify';S.ntCh27='flt';render();return D});
await p.waitForTimeout(800);
// 切到「航班旅客」（nt27 左側選單）再輸入

await p.fill('#anFltCode','KX87');await p.dispatchEvent('#anFltCode','change');await p.fill('#anFltDate',D);await p.dispatchEvent('#anFltDate','change');await p.waitForTimeout(800);
const r1=await p.evaluate(()=>({legs:[...document.querySelectorAll('.k28nt-leg')].map(e=>e.innerText.replace(/\s+/g,' ')),cnt:[...document.querySelectorAll('#app div')].map(e=>e.innerText).find(t=>/^符合的旅客/.test(t||''))}));
await p.screenshot({path:'/tmp/j/nt1.png'});
await p.click('.k28nt-leg >> nth=0');await p.waitForTimeout(600);
const r2=await p.evaluate(()=>({cnt:[...document.querySelectorAll('#app div')].map(e=>e.innerText).find(t=>/^符合的旅客/.test(t||''))}));
await p.evaluate(()=>{var t=document.getElementById('anFltMsg');t.value='BKK 轉機櫃檯異動通知';});
const n0=await p.evaluate(()=>S.notifs.length);await p.evaluate(()=>doSendFlightNotif());await p.waitForTimeout(500);
const r3=await p.evaluate(n0=>({sent:S.notifs.slice(0,S.notifs.length-n0).map(n=>n.title),msg:S.adminSaved}),n0);
console.log(JSON.stringify({D,r1,r2,r3,errs:errs.slice(0,3)},null,1));await b.close()})();

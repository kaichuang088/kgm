// 1101A：Payload 座位平衡端到端——node plbal28.js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:1000}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
p.on('dialog',d=>d.accept());
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(20000);
const D=await p.evaluate(()=>{const f0=FLIGHTS.filter(x=>x.code==='KX98'&&!x.via)[0];for(let i=40;i<120;i++){const d=new Date(Date.parse(todayISO()+'T12:00:00Z')+i*864e5);if(flyOn(f0,d))return d.toISOString().slice(0,10)}return '2026-12-10'});console.log('date',D);
const r1=await p.evaluate((D)=>{const u0=(S.users||[]).filter(x=>x&&x.id&&typeof x.miles==='number')[0];const f0=FLIGHTS.filter(x=>x.code==='KX98'&&!x.via)[0];const sf=kgmSeasonFlightR48(f0,D);
 const bk={pnr:'TST28A',status:'confirmed',userId:u0.id,outF:Object.assign({},f0,sf,{date:D}),outC:'L',inbF:null,paxList:[{first:'YICHUN',last:'CHEN'},{first:'TEST',last:'PAX'}],contactEmail:'',seats:{},total:30000,curr:'TWD',bookedAt:new Date().toISOString(),addons:{seatFeePaid:1800}};S.bookings.push(bk);
 const R0=kgmPlBalanceR1101A('KX98',D,f0.fr,f0.to);const bl=R0.blockedSeats.slice(-4);bk.seats={out:{}};bk.seats.out[bl[0]]=true;bk.seats.out[bl[1]]=true;
 const uid=bk.userId||bk.uid||bk.memberId;const u=(S.users||[]).filter(x=>x.id===uid)[0];window.__m0=u?u.miles:null;window.__pnr=bk.pnr;
 const R=kgmPlBalanceR1101A('KX98',D,f0.fr,f0.to);S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';S.opsSelectedR7='KX98|'+D+'|'+f0.fr+'|'+f0.to;S.opsQueryR7='KX98';S.opsDateR7=D;S.fdTabR1025B='lb';render();
 return {pnr:bk.pnr,uid:uid,miles0:window.__m0,block:R.block,who:R.who,free:R.free.length}},D);
console.log('before',JSON.stringify(r1));
await p.waitForFunction(()=>{const e=document.querySelector('.k28bal');return e&&/建議調整|沒有/.test(e.innerText)},null,{timeout:20000}).catch(()=>{});
const hasPanel=await p.evaluate(()=>{const e=document.querySelector('.k28bal');return e?e.innerText.slice(0,400):null});console.log('panel',hasPanel);
await p.evaluate(()=>{const e=document.querySelector('.k28bal');if(e)e.scrollIntoView()});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/pb1.png'});console.log('sel',await p.evaluate(()=>S.opsSelectedR7));
await p.click('.k28bal-act button').catch(e=>console.log('click fail',e.message));await p.waitForTimeout(1500);
const r2=await p.evaluate((D)=>{const bk=S.bookings.filter(x=>x.pnr===window.__pnr)[0];const R=kgmPlBalanceR1101A('KX98',D,bk.outF.fr,bk.outF.to);return {seats:bk.seats.out,moves:bk.plMoveR1101A,left:R.who.length,refunds:bk.refundsR1101A}},D);
console.log('after',JSON.stringify(r2));
await p.evaluate(()=>{S.adminAuthed=false;S.view='manage';S.mgResult=S.bookings.filter(x=>x.pnr===window.__pnr)[0];render()});await p.waitForTimeout(1500);
const c=await p.$('.k28pc-host');console.log('frontCard',!!c);if(c){await p.evaluate(()=>{const e=document.querySelector('.k28pc-host');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(300);await p.screenshot({path:'/tmp/j/pb2.png'})}
await p.click('.k28pc-b button').catch(e=>console.log('choose fail',e.message));await p.waitForTimeout(800);
const r3=await p.evaluate(()=>{const bk=S.bookings.filter(x=>x.pnr===window.__pnr)[0];const uid=bk.userId||bk.uid||bk.memberId;const u=(S.users||[]).filter(x=>x.id===uid)[0];return {comp:bk.plMoveR1101A.map(m=>m.comp),miles:u?u.miles:null,m0:window.__m0,card:(document.querySelector('.k28pc-host')||{}).innerText}});
console.log('chosen',JSON.stringify(r3));console.log('ERR',errs.slice(0,3));await b.close()})();

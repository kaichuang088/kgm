// 1101A：DH 改日期（後台 AI dh_change，站內引擎）＋前台 DH 行程卡（座位機場劃位、線上報到灰色）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const r0=await p.evaluate(()=>{try{localStorage.removeItem('kgm_ai_key_r1008b')}catch(_){}
 var T=todayISO(),D=null,f0=FLIGHTS.filter(x=>x.code==='KX65'&&!x.via)[0];for(var i=3;i<20;i++){var d=addDays(T,i);if(flyOn(f0,new Date(d+'T12:00:00'))&&flyOn(f0,new Date(addDays(d,1)+'T12:00:00'))){D=d;break}}
 var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});
 S.bookings.push({pnr:'Q8DH',status:'confirmed',userId:null,staffTix:true,dhR929:{empId:'K80123',role:'cabin',flight:'KX65',date:D},search:{type:'OW',fr:f.fr,to:f.to,dep:D,pax:1},outF:f,outC:'B-T',inbF:null,
  paxList:[{firstName:'TAYLOR',lastName:'SHU-HAN',kgmId:'K80123'}],seats:{out:{'1A':'TAYLOR SHU-HAN'}},total:0,curr:'TWD',bookedAt:new Date().toISOString()});
 return {D,fr:f.fr,to:f.to,dep:f.dep}});
const r1=await p.evaluate(async()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();
 await kgmAdminAiAskR929('Q8DH 的 DH 改晚一天回來');await new Promise(r=>setTimeout(r,1500));
 var b=S.bookings.find(x=>x.pnr==='Q8DH');var ch=(S.adminAiChatR929||S.adminAiR929||[]);
 var txt=[...document.querySelectorAll('[class*=k929ai] *,#k929ai *')].map(e=>e.children.length?'':e.textContent).filter(x=>/DH/.test(x)).slice(-3);
 return {pnr:b.pnr,flight:b.dhR929.flight,date:b.dhR929.date,outDate:b.outF.date,seats:JSON.stringify(b.seats.out),moves:(S.dhMoveR1101A||[]).length,notif:(S.staffNotifs||[]).filter(n=>n.empId==='K80123').map(n=>n.msg||n.text).slice(-1),txt,list:kgmDhMoveListR1101A([],Object.assign({},b.outF),b.dhR929.date).map(x=>x.empId)}});
const r2=await p.evaluate(async()=>{var r=await kgmDhChangeR1101A({text:'Q8DH 改到 1/1'});return r.msg.slice(0,120)});
await p.evaluate(()=>{S.view='mytrip';S.adminAuthed=false;kgmOpenTripR60('Q8DH')});await p.waitForTimeout(2000);
const r3=await p.evaluate(()=>{var app=document.getElementById('app').innerText;return {seatAirport:/機場櫃檯劃位/.test(app),ciOff:!!document.querySelector('.k28-ci-off'),why:(document.querySelector('.k28-ci-why')||{}).textContent,noSeatBtn:!!document.querySelector('.k7-noseat')}});
await p.screenshot({path:'/tmp/j/dh1.png'});
console.log(JSON.stringify({r0,r1,r2,r3,errs:errs.slice(0,3)},null,1));await b.close()})();

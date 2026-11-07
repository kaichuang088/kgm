const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
await p.evaluate(()=>{var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];S.user=u;
function mk(pnr,code,D,code2,D2,st){var f0=FLIGHTS.filter(x=>x.code===code&&!x.via)[0];var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});var g=null;if(code2){var g0=FLIGHTS.filter(x=>x.code===code2&&!x.via)[0];g=Object.assign({},g0,kgmSeasonFlightR48(g0,D2),{date:D2})}
 S.bookings.push({pnr:pnr,status:st||'confirmed',userId:u.id,email:u.email,outF:f,outC:'E-T',inbF:g,inbC:g?'E-T':null,paxList:[{firstName:'DEMO',lastName:'EXPLORER',title:'MR'}],seats:{},total:30000,curr:'TWD',bookedAt:'2026-09-01T00:00:00Z'})}
var T=todayISO(),A=n=>addDays(T,n);mk('PST28A','KX178',A(-40),'KX159',A(-35));mk('UPC28B','KX22',A(1),'KX21',A(4));mk('UPC28C','KX180',A(20),'KX181',A(25));kgmAllTripsR60()});
await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/j/pk1.png'});
const dis0=await p.$eval('.k28-pickgo',e=>e.disabled);
await p.click('.k28-pick[data-pnr28="UPC28B"]');await p.waitForTimeout(400);
const st1=await p.evaluate(()=>({view:S.view,list:S.tripsListR60,sel:[...document.querySelectorAll('.k28-pick.sel')].map(e=>e.dataset.pnr28),dis:document.querySelector('.k28-pickgo').disabled,info:document.querySelector('.k28-pickinfo').innerText}));
await p.screenshot({path:'/tmp/j/pk2.png'});
await p.click('.k28-pick[data-pnr28="UPC28C"]');await p.waitForTimeout(300);
const st2=await p.evaluate(()=>[...document.querySelectorAll('.k28-pick.sel')].map(e=>e.dataset.pnr28));
await p.click('.k28-pickgo');await p.waitForTimeout(1500);
const st3=await p.evaluate(()=>({view:S.view,list:S.tripsListR60,only:S.mtOnly,hero:/UPC28C/.test(document.getElementById('app').innerText)}));
await p.evaluate(()=>{S.tripsTabR1101A='done';kgmAllTripsR60()});await p.waitForTimeout(800);
const st4=await p.evaluate(()=>({cards:document.querySelectorAll('.k28-pick').length,dis:document.querySelector('.k28-pickgo')&&document.querySelector('.k28-pickgo').disabled}));
console.log(JSON.stringify({dis0,st1,st2,st3,st4,errs:errs.slice(0,3)}));await b.close()})();

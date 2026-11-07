// node front28.js <out-prefix> [js]  — 登入 demo 會員、開我的行程清單、截圖；第二個參數在截圖前執行
const {chromium}=require('playwright');
(async()=>{const [out,js,wd]=process.argv.slice(2);const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:+(wd||1440),height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const info=await p.evaluate(()=>{var u=(S.users||[]).find(x=>x.email==='demo@kgm.com')||S.users[0];S.user=u;
function mk(pnr,code,D,code2,D2,st){var f0=FLIGHTS.filter(x=>x.code===code&&!x.via)[0];if(!f0)return;var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});var g=null;if(code2){var g0=FLIGHTS.filter(x=>x.code===code2&&!x.via)[0];g=Object.assign({},g0,kgmSeasonFlightR48(g0,D2),{date:D2})}
 S.bookings.push({pnr:pnr,status:st||'confirmed',userId:u.id,email:u.email,outF:f,outC:'E-T',inbF:g,inbC:g?'E-T':null,paxList:[{firstName:'DEMO',lastName:'EXPLORER',title:'MR'}],seats:{},total:30000,curr:'TWD',bookedAt:'2026-09-01T00:00:00Z'})}
var T=todayISO(),A=(n)=>addDays(T,n);
mk('PST28A','KX178',A(-40),'KX159',A(-35));mk('UPC28B','KX22',A(1),'KX21',A(4));mk('UPC28C','KX180',A(20),'KX19',A(25));mk('CXL28D','KX172',A(10),null,null,'cancelled');
var bk=(S.bookings||[]).filter(b=>b.userId===u.id);return {u:u.id,n:bk.length,pnrs:bk.slice(0,8).map(b=>b.pnr+':'+(b.status||''))}});
console.log(JSON.stringify(info));
await p.evaluate(()=>{kgmAllTripsR60()});await p.waitForTimeout(1500);
if(js){const r=await p.evaluate(js);if(r!==undefined)console.log('js',JSON.stringify(r));await p.waitForTimeout(2000)}
await p.screenshot({path:out+'.png',fullPage:false});console.log('errs',errs.slice(0,3));await b.close()})();

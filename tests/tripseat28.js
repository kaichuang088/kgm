// 自動劃位存的座位號 vs 行程卡顯示的座位號——node tripseat28.js [html]
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(18000);
const r=await p.evaluate(()=>{const D='2027-07-14';const f0=FLIGHTS.filter(x=>x.code==='KX98'&&!x.via)[0];const f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});const u0=S.users[0];
 const bk={pnr:'TST28B',status:'confirmed',userId:u0.id,outF:f,outC:'E-T',inbF:null,paxList:[{firstName:'A',lastName:'B'}],seats:{},total:1,curr:'TWD',bookedAt:new Date().toISOString()};S.bookings.push(bk);
 const s=autoAssignSeat(bk,'out');S.view='manage';S.mgResult=bk;render();
 const chip=[...document.querySelectorAll('#app *')].filter(e=>e.children.length===0&&/^座位$|^Seat$/.test((e.textContent||'').trim()))[0];
 const val=chip?(chip.parentElement.innerText||''):'';return {stored:JSON.stringify(bk.seats.out),card:val.replace(/\s+/g,' ')}});
console.log(F.split('/').pop(),JSON.stringify(r));await b.close()})();

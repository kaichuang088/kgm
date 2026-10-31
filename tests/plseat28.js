// 1101A：Payload 鎖後排實測——node plseat28.js [code] [date]
const {chromium}=require('playwright');const CODE=process.argv[2]||'KX98',D=process.argv[3]||'2027-01-15';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(20000);
const r=await p.evaluate(([CODE,D])=>{const f0=FLIGHTS.filter(x=>x.code===CODE&&!x.via)[0];const sf=kgmSeasonFlightR48(f0,D);const f=Object.assign({},f0,sf,{date:D});
 const ec=Object.keys(FARES).filter(k=>FARES[k].cabin==='Economy')[0];
 S.search=Object.assign({},S.search,{type:'OW',dep:D,fr:f.fr,to:f.to,adt:1,chd:0,inf:0});S.outF=f;S.outC=ec;S.inbF=null;S.view='booking';S.phase='seat';S.seatPhase='out';S.seats={};
 render();const B=kgmPlBlockRowsR1101A(f,D);const sim=simSeatMap(f.code,D)||{};const ids=Object.keys(sim);
 const econIds=(window.cabinSeatIds0814?cabinSeatIds0814(f,ec):[]);const bl=kgmPlBlockedIdsR1101A(f,D,econIds);
 return {fare:ec,block:B,blockedSeats:Object.keys(bl).length,simTotal:ids.length,simInBlocked:ids.filter(s=>bl[s]).length,plDivs:document.querySelectorAll('.k28-pl-div').length,plSeats:document.querySelectorAll('.seat.k28-plblk').length}},[CODE,D]);
console.log(JSON.stringify(r),errs.slice(0,3));
const el=await p.$('.k28-pl-div');if(el){await el.scrollIntoViewIfNeeded();await p.evaluate(()=>window.scrollBy(0,-250));}
await p.screenshot({path:'/tmp/j/pl1.png'});await b.close()})();

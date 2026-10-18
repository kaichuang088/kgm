const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:240000,polling:1000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o=[];['2026-10-23','2026-10-24','2026-10-25','2026-10-26','2027-03-26','2027-03-27','2027-03-28','2027-03-29'].forEach(d=>{FLIGHTS.filter(x=>x&&x.code==='KX31').forEach(x=>{let y=x;try{y=window.kgmSeasonFlightR48(x,d)}catch(_){}let on=null;try{on=flyOn(x,new Date(d+'T12:00:00'))}catch(_){}o.push(d+' '+x.fr+'-'+x.to+' '+y.dep+'-'+y.arr+'+'+(y.dd||0)+(on?' 飛':' ×'))})});
 const A=S.tailAssign||{},t=[];Object.keys(A).forEach(tl=>(A[tl]||[]).forEach(x=>{if(x&&x.code==='KX31'&&((x.date>='2026-10-23'&&x.date<='2026-10-27')||(x.date>='2027-03-26'&&x.date<='2027-03-30')))t.push(x.date+' '+x.route+' '+x.dep+' '+tl+(x.noPax?' FERRY':''))}));t.sort();
 let sp=null;try{sp=window.kgmLiveSplitR929()}catch(_){}return {o,t,sp:sp&&{n:sp.n,s:JSON.stringify(sp).slice(0,400)}}});
console.log(r.o.join('\n'));console.log('--');console.log(r.t.join('\n'));console.log(JSON.stringify(r.sp));await b.close()})();

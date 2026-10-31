const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:240000,polling:1000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const out={h3:[],h0to2:[]};const seen={};
 ['2026-10-21','2026-12-15'].forEach(d=>{FLIGHTS.forEach(x=>{if(!x||x.partner||x.codeshare)return;let y=x;try{y=window.kgmSeasonFlightR48(x,d)}catch(_){}const h=+String(y.arr).slice(0,2);const k=x.code+' '+x.fr+'-'+x.to+(x.via?'(via '+x.via+')':'')+' '+(d<'2026-10-25'?'S':'W')+' '+y.dep+'-'+y.arr;if(seen[k])return;seen[k]=1;if(h===3)out.h3.push(k);else if(h<3)out.h0to2.push(k)})});
 out.kx31=FLIGHTS.filter(x=>x&&x.code==='KX31').map(x=>x.fr+'-'+x.to+' days='+JSON.stringify(x.days)+' sd='+JSON.stringify(x.seasonDaysR66||null));return out});
console.log(JSON.stringify(r,null,1));await b.close()})();

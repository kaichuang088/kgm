const {chromium}=require('playwright');const F=process.argv[2];const Q=JSON.parse(process.argv[3]);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
for(const q of Q){const r=await p.evaluate(q=>{const t=kgmBlockTargetR1026B(q[1],q[2],null,q[3]>'2026-10-24'&&q[3]<'2027-03-28',null,q[3]);const d=kgmBtDebugR1026B(q[0],q[1],q[2],q[3]);return {t,d}},q);
 console.log(q.join(' '),'target',r.t,'raw',r.d.x.dep,r.d.x.arr,'p',JSON.stringify(r.d.p),'out',r.d.out.dep,r.d.out.arr,r.d.out.dur,'log',JSON.stringify(r.d.log),'pred',r.d.pred?r.d.pred.slice(0,4).join(','):null,r.d.pred?JSON.parse(r.d.pred[5]).arr:'')}
await b.close()})();

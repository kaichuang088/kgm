const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
await p.goto('file:///tmp/j/kgm1020B_w3.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{const o={};const ds=['2026-10-21','2026-10-22','2026-10-23','2027-05-05','2027-05-06','2027-06-01'];
 const was=window.KGM_PLAN_R1010A;window.KGM_PLAN_R1010A=true;try{window.kgmClearAcMemo&&kgmClearAcMemo()}catch(_){}
 o.plan=ds.map(d=>d+' '+acftOfFlight('KX304',d,'TPE','PVG')+'/'+acftOfFlight('KX303',d,'PVG','TPE')).join(' | ');
 window.KGM_PLAN_R1010A=was;
 o.noplan=ds.map(d=>d+' '+acftOfFlight('KX304',d,'TPE','PVG')).join(' | ');
 o.tail=ds.map(d=>{const t=[];Object.keys(S.tailAssign||{}).forEach(tl=>(S.tailAssign[tl]||[]).forEach(x=>{if(x.date===d&&x.code==='KX304')t.push(tl+':'+_typeOfTail(tl))}));return d+' '+t.join(',')}).join(' | ');
 o.done=window.KGM_FULLDONE_1006A;
 return o});
console.log(JSON.stringify(r,null,1));
await p.waitForTimeout(110000);
const r2=await p.evaluate(()=>{const ds=['2026-10-21','2026-10-22','2026-11-20','2027-05-05','2027-05-06','2027-06-01'];
 return {done:window.KGM_FULLDONE_1006A,tail:ds.map(d=>{const t=[];Object.keys(S.tailAssign||{}).forEach(tl=>(S.tailAssign[tl]||[]).forEach(x=>{if(x.date===d&&(x.code==='KX304'||x.code==='KX303'))t.push(x.code+'@'+tl+':'+_typeOfTail(tl))}));return d+' '+t.join(',')}).join(' | '),
 shown:ds.map(d=>d+' '+acftOfFlight('KX304',d)).join(' | ')}});
console.log(JSON.stringify(r2,null,1));
await b.close()})();

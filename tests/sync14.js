// 1014A sync checks: delete propagates (not resurrected), edit propagates, crewfrz sync, simultaneous adds
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html',FB=process.argv[3]||F;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});
const A=await ctx.newPage(),B=await ctx.newPage();const errs=[];[A,B].forEach((p,i)=>p.on('pageerror',e=>errs.push((i?'B ':'A ')+String(e.message).slice(0,150))));
await A.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await B.goto('file://'+FB,{waitUntil:'domcontentloaded',timeout:300000});
await A.waitForTimeout(120000);
const st=(P,id)=>P.evaluate((id)=>{const v=kgmLsUnpackR1012A('kgmbd4',JSON.parse(localStorage.getItem('kgmbd4')||'[]'));const m=(S.bigDeals||[]).find(x=>x.id===id),s=v.find(x=>x.id===id);return {mem:m?m.amount:null,st:s?s.amount:null}},id);
const add=(P,id,amt)=>P.evaluate(([id,amt])=>{S.bigDeals.push({id:id,code:'KX20',date:'2026-10-30',fr:'TPE',to:'NRT',pnr:'P'+id.slice(-5),userId:'U',who:'T',cabin:'Economy',toCabin:'Premium',amount:amt,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});save()},[id,amt]);
// 1 add in A -> B
await add(A,'S14X',100);await A.waitForTimeout(4000);console.log('1 add A->B', JSON.stringify(await st(B,'S14X')));
// 2 edit in B -> A
await B.evaluate(()=>{const x=S.bigDeals.find(y=>y.id==='S14X');x.amount=200;save()});await A.waitForTimeout(4000);console.log('2 edit B->A', JSON.stringify(await st(A,'S14X')),JSON.stringify(await st(B,'S14X')));
// 3 delete in A -> B (must not come back)
await A.evaluate(()=>{S.bigDeals=S.bigDeals.filter(y=>y.id!=='S14X');save()});await A.waitForTimeout(4000);
console.log('3 delete A->B', 'A',JSON.stringify(await st(A,'S14X')),'B',JSON.stringify(await st(B,'S14X')));
await A.waitForTimeout(6000);console.log('3b +6s', 'A',JSON.stringify(await st(A,'S14X')),'B',JSON.stringify(await st(B,'S14X')));
// 4 two pnr-sharing bids (same pnr, different id) both survive merge
await A.evaluate(()=>{S.bigDeals.push({id:'S14P1',code:'KX20',date:'2026-10-30',fr:'TPE',to:'NRT',pnr:'SAMEPN',userId:'U',who:'T',cabin:'Economy',toCabin:'Premium',amount:1,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});save()});
await B.evaluate(()=>{S.bigDeals.push({id:'S14P2',code:'KX20',date:'2026-10-31',fr:'NRT',to:'TPE',pnr:'SAMEPN',userId:'U',who:'T',cabin:'Economy',toCabin:'Premium',amount:2,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});save()});
await A.waitForTimeout(5000);console.log('4 same-pnr', 'A',JSON.stringify([await st(A,'S14P1'),await st(A,'S14P2')]),'B',JSON.stringify([await st(B,'S14P1'),await st(B,'S14P2')]));
// 5 crew freeze sync
await A.evaluate(()=>{var d=Object.keys(S.crewFreezeR928||{})[0]||'2026-10-20';S.crewFreezeR928=S.crewFreezeR928||{};S.crewFreezeR928[d]=S.crewFreezeR928[d]||{};S.crewFreezeR928[d]['ZZS14']='KX20';save()});
await A.waitForTimeout(4000);console.log('5 crewfrz', JSON.stringify(await B.evaluate(()=>({packed:!!(S.crewFreezeR928&&S.crewFreezeR928.__fz1012A),has:Object.keys(S.crewFreezeR928||{}).some(d=>S.crewFreezeR928[d]&&S.crewFreezeR928[d].ZZS14==='KX20')}))));
// 6 booking added in B (front) -> A
await B.evaluate(()=>{S.bookings.push({pnr:'S14BKG',status:'confirmed',paxList:[],outF:{code:'KX20',date:'2026-10-30',fr:'TPE',to:'NRT'},outC:'E-C'});save()});await A.waitForTimeout(4000);
console.log('6 booking B->A', await A.evaluate(()=>(S.bookings||[]).some(b=>b.pnr==='S14BKG')));
console.log('ERR',JSON.stringify(errs.filter(e=>!/ERR_TUNNEL|寄信/.test(e)).slice(0,5)));await b.close()})();

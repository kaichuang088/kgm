// 1112A C12：赫爾辛基 KX100（一二四六）、蘇黎世 KX98（二四五日）回程營運日＝去程落地那天；飛機外站停 ≥20 小時 0 次；舊訂位搬到隔天
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(5000);
const r=await p.evaluate(()=>{const td=todayISO();let wed=td;while((new Date(wed+'T12:00:00').getDay())!==3)wed=addDays(wed,1);wed=addDays(wed,14);
 const f=FLIGHTS.find(x=>x.code==='KX100'&&x.fr==='HEL');const u=(S.users||[])[0];
 S.bookings.push({pnr:'HEL40A',userId:u.id,status:'confirmed',outF:Object.assign({},FLIGHTS.find(x=>x.code==='KX99'),{date:addDays(wed,-3)}),inbF:Object.assign({},f,{date:wed}),outC:'E-E',inbC:'E-E',paxList:[{firstName:'A',lastName:'B',passengerType:'ADT'}],total:30000,seats:{['KX100|'+wed]:['40A']}});
 const n=kgmDaysFixR1112A();const bk=S.bookings.find(x=>x.pnr==='HEL40A');
 // 飛機：KX99 落地後下一段就是 KX100、過站 < 6 小時
 const TA=S.tailAssign||{},span=x=>kgmRotSpanR1103A(x);let turns=[],bad=[];Object.keys(TA).forEach(t=>{const L=(TA[t]||[]).filter(x=>x&&x.date>=td&&x.date<=addDays(td,60)).sort((a,b)=>span(a)[0]-span(b)[0]);for(let i=0;i+1<L.length;i++){if(/^KX(99|97)$/.test(L[i].code)&&/→(HEL|ZRH)$/.test(L[i].route)){const g=(span(L[i+1])[0]-span(L[i])[1])/60;turns.push(g);if(g>=20||!/^KX(100|98)$/.test(L[i+1].code))bad.push(t+' '+L[i].date+' '+L[i].code+'→'+L[i+1].code+' '+g.toFixed(1)+'h')}}});
 const notif=(S.notifs||[]).find(x=>x.pnr==='HEL40A');
 return {wed,moved:n,inb:bk.inbF.date,seat:bk.seats,shift:bk.dayShiftR1112A,notif:notif&&notif.message,turns:turns.length,maxTurn:Math.max(...turns).toFixed(1),bad:bad.slice(0,5)}});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,3));await b.close();process.exit(r.inb===((d=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+1);return x.toISOString().slice(0,10)})(r.wed))&&!r.bad.length&&r.turns>0&&!errs.length?0:1)})();

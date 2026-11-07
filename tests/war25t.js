const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 // 先放一筆真的訂位在受影響的班上，看通知有沒有寫進去
 await p.waitForTimeout(8000);
 const pre=await p.evaluate(()=>{const d=addDays(todayISO(),1);const f=FLIGHTS.find(f=>f.code==='KX94'&&!f.via);
   S.bookings=S.bookings||[];S.bookings.push({pnr:'WAR25T',status:'confirmed',outF:{code:'KX94',date:d,fr:'TPE',to:'VIE',dep:f.dep,arr:f.arr},paxList:[{first:'TEST',last:'WAR',email:'war25@example.invalid'}],notifs:[]});save();return d});
 for(let i=0;i<20;i++){await p.waitForTimeout(3000);if(await p.evaluate(()=>!!window.KGM_WAR_LAST_R1025B))break}
 const r=await p.evaluate(()=>({made:(window.KGM_WAR_LAST_R1025B||[]).map(x=>x.code+' '+x.date+' '+x.route+' +'+x.min+' pax'+x.pax+' cas'+x.cascade),
   ov:JSON.stringify(S.flightOverrides['KX94_'+addDays(todayISO(),1)]),bk:JSON.stringify((S.bookings.find(b=>b.pnr==='WAR25T')||{}).notifs)}));
 console.log('made',r.made.length);console.log(r.made.join('\n'));console.log('ov',r.ov);console.log('bk notifs',r.bk);
 // 前台航班動態
 await p.evaluate(()=>{S.view='status';S.statusQ='KX94';render()});await p.waitForTimeout(2500);
 console.log('front status text:',await p.evaluate(()=>{const t=document.body.innerText;const i=t.indexOf('KX94');return t.slice(Math.max(0,i-50),i+400).replace(/\n+/g,' | ')}));
 console.log('errors',errs);await b.close()})();

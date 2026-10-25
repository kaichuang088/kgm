const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const o=[];['2026-10-25','2026-11-08'].forEach(d=>{const P=kgmGroundPlanR1008A('TPE',d);const prev=addDays(d,-1);
   Object.values(P.people).filter(q=>q.reserve).forEach(q=>{const pb=kgmGroundBandR1008A(q.id,prev);o.push(d+' '+q.id+' band '+q.band+' win '+q.win0+'-'+q.win1+' prevBand '+(pb&&pb.k)+' earliest '+((pb.w[1]-1440+660)))});
   const early=Object.values(P.people).filter(q=>!q.off&&q.earlyR1026B).length;o.push(d+' earlyR1026B '+early+' offTotal '+Object.values(P.people).filter(q=>q.off).length+' bandsOff '+JSON.stringify(Object.values(P.people).filter(q=>q.off).reduce((a,q)=>{a[q.band||'?']=(a[q.band||'?']||0)+1;return a},{})))});return o.join('\n')}));await b.close()})();

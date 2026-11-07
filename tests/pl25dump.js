const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(25000);
 const r=await p.evaluate(()=>{
   const own=[].concat(FLIGHTS,S.customFlights||[]).filter(f=>f&&!f.via&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(f.code));
   const seen={},rows=[];
   function fly(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return false}}
   function pick(f,from,to){for(let d=from;d<=to;d=addDays(d,1))if(fly(f,d))return d;return null}
   own.forEach(f=>{const key=f.code+'|'+f.fr+'|'+f.to+'|'+f.dep;if(seen[key])return;seen[key]=1;
     const out={code:f.code,fr:f.fr,to:f.to};
     [['s','2027-06-01','2027-08-31'],['w','2026-12-01','2027-02-28']].forEach(([s,a,z])=>{const d=pick(f,a,z);if(!d){out[s]=null;return}
       const x=(window.kgmSeasonFlightR48&&kgmSeasonFlightR48(f,d))||f;const c=kgmPaxCapR1025B(f,d)||{};const wd=kgmWarDelayR1025B(f,d);
       out[s]={date:d,dep:x.dep,arr:x.arr,dd:x.dd||0,type:c.type,seats:c.seats,y:c.ySeats,blk:c.blockMin,limit:c.limitMin,pl:c.payloadKg,mx:c.maxPax,basis:c.basis,blocked:c.blocked,war:c.war,km:c.km,wd:wd?wd.min:0}});
     rows.push(out)});
   /* 華航校正航線用同一支函式：A359、冬季 */
   const AP2={LHR:[51.47,-0.45],AMS:[52.31,4.76],FRA:[50.03,8.57],VIE:[48.11,16.57],PRG:[50.10,14.26],FCO:[41.80,12.25]};
   const cal=Object.keys(AP2).map(k=>{const c=kgmPaxCapR1025B({code:'CAL',fr:'TPE',to:k},'2027-01-15',{type:'A359',win:true,seats:306});return {to:k,c}});
   /* sell54 有沒有真的少賣：找一班冬季有限座的，比較經濟艙可賣總數（有／沒有限座） */
   let chk=null;const wf=rows.find(r=>r.w&&r.w.blocked>20);if(wf){const f=own.find(x=>x.code===wf.code&&x.fr===wf.fr&&x.to===wf.to);const d=wf.w.date;
     const codes=Object.keys(FARES).filter(c=>(FARES[c].cabin||'Economy')==='Economy');const sum=()=>codes.reduce((n,c)=>n+(window.kgmInventory49(c,d,f)||0),0);
     const inv=kgmCabinInventory54(f,d,'Economy');const a=sum();const keep=window.kgmPaxCapR1025B;window.kgmPaxCapR1025B=null;const b0=sum();window.kgmPaxCapR1025B=keep;
     chk={code:wf.code,date:d,blocked:wf.w.blocked,cap:inv.capacity,left:inv.left,sellWith:a,sellWithout:b0}}
   return {rows,cal,chk}});
 fs.writeFileSync('/tmp/j/pl25.json',JSON.stringify(r));
 console.log('rows',r.rows.length,'errors',errs.length);console.log('check',JSON.stringify(r.chk));
 r.cal.forEach(x=>console.log('CAL',x.to,JSON.stringify(x.c)));
 const bl=r.rows.filter(x=>(x.w&&x.w.blocked)||(x.s&&x.s.blocked)).map(x=>x.code+' '+x.fr+'-'+x.to+' S:'+(x.s?x.s.type+' '+x.s.blocked:'-')+' W:'+(x.w?x.w.type+' '+x.w.blocked:'-'));console.log(bl.length,'with blocks');console.log(bl.join('\n'));
 await b.close()})();

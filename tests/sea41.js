const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{const out=[];const F=FLIGHTS.filter(f=>f.code==='KX73'&&!f.via);
  for(const d of ['2027-10-23','2027-10-24','2027-10-25','2027-10-29','2027-10-30','2027-10-31','2027-11-01']){
   let s57='',s48='';try{s57=kgmSeasonR57(d)}catch(e){}try{s48=season48(d)}catch(e){s48='na'}
   const legs=F.map(f=>{const s=kgmSeasonFlightR48(f,d);return f.fr+'-'+f.to+' '+s.dep+'-'+s.arr}).join(' / ');
   const ta=[];Object.keys(S.tailAssign).forEach(t=>(S.tailAssign[t]||[]).forEach(x=>{if(x&&x.code==='KX73'&&x.date===d)ta.push(t.slice(-3)+' '+x.route+' '+x.dep+'-'+x.arr+(x.coverageR830?' cov':''))}));
   out.push(d+' r57:'+s57+' s48:'+s48+' | '+legs+' || '+ta.join(' ; '))}
  return out});
 console.log(r.join('\n'));await b.close()})();

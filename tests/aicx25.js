const {chromium}=require('playwright');const fs=require('fs');
const MSGS=(process.env.MSGS||'取消所有10/27 03:00以後出發的航班|長程不取消|天氣|1|確認').split('|');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<150&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);
 await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='status';localStorage.removeItem('kgm_ai_key_r1008b');render()});
 for(const m of MSGS){const t0=Date.now();await p.evaluate(async m=>{await window.kgmAdminAiAskR929(m)},m);
   const last=await p.evaluate(()=>{const st=S.adminAiR929||{},k=(S.adminUser||{}).empId||'ADMIN',L=st[k]||[];return L[L.length-1]});
   const ms25=await p.evaluate(()=>JSON.stringify(window.KGM_CX_MS_R1025B||{}));console.log('\n>>> '+m+'  ('+(Date.now()-t0)+' ms '+ms25+')\n'+(last&&last.text||'').slice(0,2600))}
 const chk=await p.evaluate(()=>{const o=S.flightOverrides||{},cx=Object.keys(o).filter(k=>o[k].status==='Cancelled'&&o[k].aiR1023A);
   const all=[].concat(FLIGHTS);const longs=[],ret=[];
   cx.forEach(k=>{const [code,d]=k.split('_');const fs=all.filter(f=>f.code===code&&!f.via&&!f.partner);fs.forEach(f=>{const x=Object.assign({},window.kgmSeasonFlightR48(f,d),{date:d});if(flyOn(x,new Date(d+'T12:00:00'))&&window.kgmIsLongHaulR71(x))longs.push(k+' '+f.fr+f.to)})});
   return {n:cx.length,dates:[...new Set(cx.map(k=>k.split('_')[1]))],longs:longs.slice(0,10),nLong:longs.length,sample:cx.slice(0,12)}});
 console.log('\nCHECK',JSON.stringify(chk));console.log('errs',errs.slice(0,3));await b.close()})();

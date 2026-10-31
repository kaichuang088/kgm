const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
for(const [fr,to,d] of [['TPE','DOH','2026-12-02'],['DOH','TPE','2026-12-03'],['TPE','DOH','2026-11-20'],['TPE','MAD','2026-12-02'],['TPE','FCO','2026-12-03'],['MAD','TPE','2026-12-05'],['TPE','LHR','2026-12-02']]){
 const r=await p.evaluate(([fr,to,d])=>{S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr,to,dep:d,type:'OW',pax:1,cabin:'Economy',useMiles:false});render();
  const rows=[...document.querySelectorAll('#app tr.fl-row, #app tr.k12c-row')].filter(r=>getComputedStyle(r).display!=='none').map(r=>r.innerText.replace(/\s+/g,' ').slice(0,110));return rows},[fr,to,d]);
 console.log(fr,to,d,r.length);r.slice(0,8).forEach(x=>console.log('   ',x))}
console.log('errs',JSON.stringify(errs));await b.close()})();

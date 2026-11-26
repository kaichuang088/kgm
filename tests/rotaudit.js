const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file://'+(process.argv[2]||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='dashboard';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});
 for(const w of [20,60,150]){await p.waitForTimeout(w===20?20000:(w===60?40000:90000));
  console.log('t+'+w,await p.evaluate(()=>{const s=window.kgmRotSeamR922?window.kgmRotSeamR922():null;const a=window.kgmAuditRotAllR922?window.kgmAuditRotAllR922():null;
   return JSON.stringify({seam:s&&{n:s.n,lock:s.lock,breaks:(s.breaks||[]).slice(0,5)},all:a&&Object.fromEntries(Object.entries(a).filter(([k,v])=>typeof v!=='object'||Array.isArray(v)).map(([k,v])=>[k,Array.isArray(v)?v.slice(0,6):v]))}).slice(0,1800)}))}
 await b.close()})();

const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(10000);
 const r=await p.evaluate(()=>{const o={};['A388','B779','A359','B789','B78X','A339','A339L','A339R','A21N','A35K'].forEach(t=>{try{const c={};(seatSections7(t)||[]).forEach(s=>{let n=0;(s.rows||[]).forEach(r=>(r.cells||[]).forEach(x=>{if(x&&!x.aisle&&x.id)n++}));c[s.name]=n});o[t]=c}catch(e){o[t]=String(e)}});return o});
 console.log(JSON.stringify(r,null,1));fs.writeFileSync('/home/user/kgm/patches/1025B/geo/seats25.json',JSON.stringify(r));await b.close()})();

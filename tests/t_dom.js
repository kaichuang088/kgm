const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(20000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
 await p.waitForTimeout(2000);
 for(const t of (process.argv[2]||'auctions,fleetsched,syscfg,status,bookings').split(',')){
  const r=await p.evaluate(async(t)=>{S.adminTab=t;const t0=performance.now();render();const s=performance.now()-t0;const t1=performance.now();document.body.offsetHeight;const lay=performance.now()-t1;
   const n=document.querySelectorAll('#app *').length,all=document.querySelectorAll('*').length,len=document.getElementById('app').innerHTML.length;
   const styles=document.querySelectorAll('style').length;
   await new Promise(r=>setTimeout(r,2500));
   return {t,render:Math.round(s),layout:Math.round(lay),appNodes:n,allNodes:all,htmlKB:Math.round(len/1024),styles,after:document.querySelectorAll('#app *').length}},t);
  console.log(JSON.stringify(r));
 }
 await b.close();})();

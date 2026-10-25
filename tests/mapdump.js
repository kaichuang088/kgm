const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 const routes=(process.argv[2]||'TPE-VIE').split(',');
 for(const r of routes){const [fr,to]=r.split('-');
  const u=await p.evaluate(([fr,to])=>new Promise(res=>{const el=document.createElement('div');el.style.width='1072px';document.body.appendChild(el);const f=[].concat(FLIGHTS).find(f=>f.fr===fr&&f.to===to&&!f.via)||{code:'X',fr,to};
    const t0=performance.now();kgmRouteMapR1025B(el,f,todayISO(),null);const iv=setInterval(()=>{const im=el.querySelector('img');if(im&&im.src){clearInterval(iv);res([im.src,performance.now()-t0])}},50)}),[fr,to]);
  fs.writeFileSync('/tmp/j/map_'+r+'.jpg',Buffer.from(u[0].split(',')[1],'base64'));console.log(r,'ms',Math.round(u[1]))}
 await b.close()})();

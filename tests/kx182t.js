const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
for(const D of ['2026-12-02','2026-12-03','2026-12-04','2026-12-05','2026-12-06','2026-12-07','2026-12-08']){
const t=await p.evaluate(async(D)=>{Object.assign(S.search,{type:'OW',fr:'TPE',to:'NRT',dep:D,adults:1,children:0,infants:0,cabin:'Business',useMiles:false});S.outF=null;S.phase='sel_out';passengerCounts();nav('booking');await new Promise(r=>setTimeout(r,2500));
  return [...document.querySelectorAll('tr.fl-row')].map(r=>r.innerText.replace(/\s+/g,' ')).filter(t=>/KX183/.test(t)).map(t=>t.slice(70,200)).join('')+' | B-M='+kgmInventory49('B-M',D,Object.assign({},FLIGHTS.find(x=>x.code==='KX183'),{date:D}))},D);console.log(D,t)}
await b.close()})();

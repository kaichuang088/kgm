const {chromium}=require('playwright');
const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(25000);
const r=await p.evaluate(()=>{const o=[];const L=[['KX52','TPE','SYD','CHC'],['KX52','TPE','SYD','AKL'],['KX51','CHC','SYD','TPE'],['KX51','AKL','SYD','TPE'],['KX60','TPE','KUL','MEL']];
 for(const d of ['2026-07-15','2027-02-05','2026-11-20']) for(const [c,a,v,z] of L){
  const f=(FLIGHTS||[]).filter(x=>x.code===c&&x.fr===a&&x.to===z)[0];
  let t=null;try{t=f&&kgmViaTimesR205(f,d)}catch(e){t='ERR '+e.message}
  const s1=kgmSeasonLegR205(c,a,v,d),s2=kgmSeasonLegR205(c,v,z,d),w=kgmSeasonLegR205(c,a,z,d);
  o.push([d,c,a+'-'+v+'-'+z,JSON.stringify(t&&{dep:t.dep,arrVia:t.arrVia,depVia:t.depVia,arr:t.arr,lay:t.lay,dd:t.dd}),'L1',s1&&s1.dep+'-'+s1.arr+'/'+(s1.dd||0),'L2',s2&&s2.dep+'-'+s2.arr+'/'+(s2.dd||0),'W',w&&w.dep+'-'+w.arr+'/'+(w.dd||0)].join(' '))}
 return o});
console.log(r.join('\n'));await b.close()})();

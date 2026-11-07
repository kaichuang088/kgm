// fleet plan fingerprint after the full-year rebuild (same day, fresh browser): tailAssign + acftSub tails + variety stats
const {chromium}=require('playwright');
(async()=>{for(const f of process.argv.slice(2)){const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:240000,polling:1000});await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{const h=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return (x>>>0).toString(36)};
 const A=S.tailAssign||{},ks=Object.keys(A).sort(),legs=ks.reduce((a,k)=>a+(A[k]||[]).length,0);
 const ta=h(ks.map(k=>k+':'+(A[k]||[]).map(x=>x.date+x.code+(x.route||'')+(x.noPax?'n':'')).join(',')).join('|'));
 const sub=h(Object.keys(S.acftSub||{}).sort().map(k=>k+'='+((S.acftSub[k]||{}).tail||'')).join('|'));
 return {legs,ta,sub,var:window.KGM_VARIETY_R1012A,final:window.KGM_ROT_FINAL_MS_R913}});
console.log(f.split('/').pop(),JSON.stringify(r));await b.close()}})();

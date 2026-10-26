const {chromium}=require('playwright');
const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(70000);
const r=await p.evaluate(async(D0)=>{const out=[];const base=new Date(D0+'T12:00:00Z');
 for(let i=0;i<14;i++){const d=new Date(base.getTime()+i*864e5).toISOString().slice(0,10);let P=null;
   for(let k=0;k<20&&!P;k++){P=kgmGroundPlanR1008A('TPE',d);if(!P)await new Promise(r=>setTimeout(r,300))}
   if(!P){out.push(d+' noplan');continue}
   const sh=P.tasks.filter(t=>t.kind==='ctr'&&t.who.length<t.min);
   out.push(d+' short '+sh.length+' '+sh.map(t=>t.a+'-'+t.b+' '+(t.flights||[]).map(f=>f.code+'@'+f.dep).join('+')+' '+t.who.length+'/'+t.min).join(' | '))}
 return out},process.env.D0||'2026-10-26');
console.log(r.join('\n'));await b.close()})();

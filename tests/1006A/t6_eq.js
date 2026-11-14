// 1006A #14：收尾重排前後版本等價＋長任務
const {chromium}=require('playwright');
async function run(F){const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 await p.addInitScript(()=>{window.__lt=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>window.__lt.push({t:Math.round(e.startTime),d:Math.round(e.duration)}))}).observe({type:'longtask',buffered:true})}catch(e){}});
 const t0=Date.now();
 await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>typeof S!=='undefined'&&window.KGM_ROT_FINAL_MS_R913>0,null,{timeout:400000,polling:500});
 await p.waitForTimeout(8000);
 const r=await p.evaluate(()=>{
   var A=S.tailAssign||{},ks=Object.keys(A).sort(),h=0,n=0,parts=[];
   ks.forEach(function(t){(A[t]||[]).map(function(x){return [x.date,x.code,x.route||(x.fr+'→'+x.to),x.dep,x.positioningR830?'P':'',x.manualR69?'M':''].join('|')}).sort().forEach(function(s){s=t+'#'+s;n++;for(var i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0})});
   window.__dump=[];ks.forEach(function(t){(A[t]||[]).forEach(function(x){window.__dump.push(t+'#'+[x.date,x.code,x.route||(x.fr+'→'+x.to),x.dep,x.positioningR830?'P':'',x.manualR69?'M':'',x.auto?'A':'',x.tsaFixedR830?'T':''].join('|'))})});
   var cov=null;try{cov=window.kgmLiveCoverR135();cov={missing:cov.missing}}catch(_){}
   var sp=null;try{sp=window.kgmLiveSplitR929().n}catch(_){}
   return {hash:h,rows:n,tails:ks.length,sum:JSON.stringify(window.KGM_ROT_SUM_R72&&{a:KGM_ROT_SUM_R72.assigned,t:KGM_ROT_SUM_R72.total,o:KGM_ROT_SUM_R72.orphan,s:KGM_ROT_SUM_R72.split}),
     finalMs:window.KGM_ROT_FINAL_MS_R913,prepMs:window.KGM_FINALPREP_MS_1006A||null,kept:window.KGM_KEPT72_1006A||0,cover:cov,split:sp,
     subs:Object.keys(S.acftSub||{}).length,lt:window.__lt.filter(x=>x.d>=500)}});
 const dump=await p.evaluate(()=>window.__dump.sort().join('\n'));require('fs').writeFileSync(process.env.DUMP+'_'+(++global.__n||(global.__n=1))+'.txt',dump);
 r.wall=Date.now()-t0;r.errs=errs.slice(0,3);await b.close();return r}
(async()=>{for(const F of process.argv.slice(2)){const r=await run(F);console.log(F,JSON.stringify(r))}})();

const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(+(process.env.W||70000));
 console.log(JSON.stringify(await p.evaluate(()=>{
   const T=todayISO();
   const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const W=60,end=D(T,W-1),TA=S.tailAssign||{},acc={};
   const res=new Set();try{Object.keys(RESERVE_TYPE72||{})}catch(_){}
   Object.keys(TA).forEach(tl=>{
     const tp=window._typeOfTail(tl)||'?';
     const a=acc[tp]||(acc[tp]={tails:0,used:0,idle7:0,legs:0,block:0,tsa:0,maxGap:0});
     a.tails++;if((S.tsaFleet||{})[tl])a.tsa++;
     const has={};let n=0;
     (TA[tl]||[]).forEach(x=>{ if(!x||!x.date||x.date<T||x.date>end)return; has[x.date]=1;n++;
       if(isFinite(+x.depAbs)&&isFinite(+x.arrAbs)){a.legs++;a.block+=Math.max(0,(+x.arrAbs)-(+x.depAbs))}});
     if(n)a.used++;
     let run=0,gap=0;for(let i=0;i<W;i++){if(has[D(T,i)])run=0;else{run++;gap=Math.max(gap,run)}}
     if(gap>=7)a.idle7++;a.maxGap=Math.max(a.maxGap,gap);
   });
   const out={};Object.keys(acc).sort().forEach(k=>{const a=acc[k];const bh=a.block/60/W;
     out[k]={tails:a.tails,used:a.used,idle7:a.idle7,tsa:a.tsa,bhDay:+bh.toFixed(1),hPerTail:+(bh/a.tails).toFixed(2),hPerUsed:+(bh/Math.max(1,a.used)).toFixed(2)}});
   const cnt={};Object.keys(FLEET_CNT).forEach(k=>cnt[k]=FLEET_CNT[k]);
   const res72={};try{['B779','A388','B78X','B789','A21N','A21X','A35K','A359','A339L','A339R'].forEach(t=>res72[t]=(tailsFor(t)||[]).length)}catch(e){}
   return {cnt,tailsFor:res72,byType:out,idle:window.kgmFleetIdleR922(60),rot:(function(){try{const r=window.kgmAuditRotAllR922();return {ok:r.ok,tails:r.tails,legs:r.legs,gap:r.gap,overlap:r.overlap,type:r.type}}catch(e){return e.message}})(),cover:window.kgmLiveCoverR135&&window.kgmLiveCoverR135(),sum:window.KGM_ROT_SUM_R72&&{start:KGM_ROT_SUM_R72.start,days:KGM_ROT_SUM_R72.days,assigned:KGM_ROT_SUM_R72.assigned,total:KGM_ROT_SUM_R72.total,orphan:KGM_ROT_SUM_R72.orphan}};
 }),null,1));
 await b.close();})();

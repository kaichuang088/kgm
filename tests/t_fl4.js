const {chromium}=require('playwright');
const file=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 const out=[];
 for(const w of [70000,50000,60000]){await p.waitForTimeout(w);
  out.push(await p.evaluate(()=>{
   const TA=S.tailAssign,res=[];let ov=0;
   Object.keys(TA).forEach(tl=>{const L=(TA[tl]||[]).filter(x=>x&&isFinite(+x.depAbs)).slice().sort((a,b)=>a.depAbs-b.depAbs);
     for(let i=1;i<L.length;i++){if(+L[i].depAbs<+L[i-1].arrAbs){ov++;if(res.length<4)res.push(tl+' '+JSON.stringify(L[i-1]).slice(0,230)+' || '+JSON.stringify(L[i]).slice(0,230))}}});
   const cov=kgmLiveCoverR135();
   return {ov,missing:cov.missing,res,ready:!!window.KGM_ROT_FINAL_R913};
  }));}
 console.log(JSON.stringify(out,null,1));
 await b.close();})();

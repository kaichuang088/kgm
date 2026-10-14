const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(70000);
 console.log(JSON.stringify(await p.evaluate(()=>{
   const T=todayISO();
   const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const end=D(T,27),TA=S.tailAssign||{},acc={};
   Object.keys(TA).forEach(tl=>{
     const tp=window._typeOfTail(tl)||'?';
     const a=acc[tp]||(acc[tp]={tails:0,legs:0,block:0});
     a.tails++;
     (TA[tl]||[]).forEach(x=>{
       if(!x||!x.date||x.date<T||x.date>end)return;
       if(!isFinite(+x.depAbs)||!isFinite(+x.arrAbs))return;
       a.legs++;a.block+=Math.max(0,(+x.arrAbs)-(+x.depAbs));
     });
   });
   const out={};
   Object.keys(acc).forEach(k=>{const a=acc[k];
     const bhDay=a.block/60/28;
     out[k]={tails:a.tails,legsPerDay:+(a.legs/28).toFixed(1),blockHPerDay:+bhDay.toFixed(1),
       hPerTailDay:+(bhDay/Math.max(1,a.tails)).toFixed(2),
       needAt10h:Math.ceil(bhDay/10)};
   });
   return out;
 }),null,1));
 await b.close();})();

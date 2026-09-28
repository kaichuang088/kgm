const {chromium}=require('playwright');
const file=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(+(process.env.W||70000));
 console.log(JSON.stringify(await p.evaluate((types)=>{
   const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const TA=S.tailAssign,out={};
   Object.keys(TA).forEach(tl=>{const tp=_typeOfTail(tl);if(types.indexOf(tp)<0&&!(tp==null&&types.indexOf('?')>=0))return;
     const has={};(TA[tl]||[]).forEach(x=>{if(x&&x.date)has[x.date]=(has[x.date]||0)+1});
     let s='';for(let i=0;i<60;i++)s+=has[D(T,i)]?'#':'.';
     (out[tp||'?']=out[tp||'?']||[]).push(tl+' '+s+' n='+(TA[tl]||[]).length+(S.tsaFleet&&S.tsaFleet[tl]?' TSA':''));
   });
   let rot=null;try{const r=kgmAuditRotAllR922();rot={gap:r.gap,overlap:r.overlap,sample:(r.sample||r.samples||r.bad||[]).slice(0,8)}}catch(e){rot=e.message}
   return {out,rot};
 },JSON.parse(process.argv[3]||'["B789","A359","?"]')),null,1));
 await b.close();})();

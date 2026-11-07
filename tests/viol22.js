const {chromium}=require('playwright');const DAYS=+(process.env.DAYS||30);
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>console.log('no fulldone'));
 await p.waitForTimeout(5000);
 console.log(await p.evaluate(({DAYS})=>{const T=todayISO();const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
  const byDay=[],bySt={},byFl={};let tot=0;
  for(let i=-5;i<DAYS;i++){const d=D(T,i);const pl=kgmCrewPlanR121(d);const v=pl.violations||[];byDay.push(d.slice(5)+':'+v.length);tot+=i>=0?v.length:0;
   const m={};(pl.flights||[]).forEach(f=>m[f.code+' '+d]=f);
   v.forEach(s=>{const c=s.split('：')[0];const f=m[c];if(f){bySt[f.fr]=(bySt[f.fr]||0)+1;byFl[f.code+' '+f.fr+'-'+f.to]=(byFl[f.code+' '+f.fr+'-'+f.to]||0)+1}})}
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,15).map(x=>x.join(':')).join(' ');
  return 'tot '+tot+'\n'+byDay.join(' ')+'\nST '+top(bySt)+'\nFL '+top(byFl)},{DAYS}));
 await b.close()})();

const {chromium}=require('playwright');const crypto=require('crypto');const DAYS=+(process.env.DAYS||10);
async function one(tag){const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 const t0=Date.now();for(let i=0;i<170&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);const tf=Date.now()-t0;
 const r=await p.evaluate(async(DAYS)=>{const T=todayISO();const D=n=>{const t=new Date(T+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const out=[],ready=[];for(let i=0;i<DAYS;i++)ready.push(window.kgmCrewHasDayR121?window.kgmCrewHasDayR121(D(i)):null);
   const t1=performance.now();
   for(let i=0;i<DAYS;i++){const pl=kgmCrewPlanR121(D(i));(pl.flights||[]).forEach(f=>{out.push(D(i)+'|'+f.code+'|'+f.fr+'|'+(f.pilots||[]).map(q=>q.empId+':'+(q.posCode||'')).join(',')+'|'+(f.cabin||[]).map(q=>q.empId).join(','))})}
   return {lines:out,ms:Math.round(performance.now()-t1),ready}},DAYS);
 const h=crypto.createHash('md5').update(r.lines.join('\n')).digest('hex');
 console.log(tag,'fulldone',tf,'ms; compute',r.ms,'ms; readyBefore',r.ready.filter(Boolean).length+'/'+DAYS,'lines',r.lines.length,'hash',h);
 require('fs').writeFileSync('/tmp/j/det_'+tag+'.txt',r.lines.join('\n'));await b.close()}
(async()=>{await one('A');await one('B')})();

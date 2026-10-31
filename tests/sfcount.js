const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const A=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 await A.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:300000});await A.waitForTimeout(40000);
 console.log(await A.evaluate(()=>{const o=window.sortedFlights;const st={};let n=0,ms=0;
  const w=function(fr,to,date){const t0=performance.now();const r=o.apply(this,arguments);const d=performance.now()-t0;n++;ms+=d;const k=fr+'-'+to;st[k]=st[k]||[0,0,new Set()];st[k][0]++;st[k][1]+=d;st[k][2].add(date);return r};
  window.sortedFlights=w;try{sortedFlights=w}catch(_){}
  S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),30);S.search.ret=addDays(todayISO(),35);S.search.adults=1;S.phase='sel_out';
  const t0=performance.now();nav('booking');const tot=performance.now()-t0;
  window.sortedFlights=o;try{sortedFlights=o}catch(_){}
  return 'render '+Math.round(tot)+' calls '+n+' ms '+Math.round(ms)+' | '+Object.entries(st).sort((a,b)=>b[1][1]-a[1][1]).slice(0,12).map(([k,v])=>k+' x'+v[0]+' '+Math.round(v[1])+'ms dates'+v[2].size).join(' ; ')}));
 await b.close()})();

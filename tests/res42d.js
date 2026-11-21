const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(25000);
 const r=await p.evaluate(async()=>{const T=todayISO();
  for(let d=1;d<=30;d++){const dd=addDays(T,d);for(const f of FLIGHTS){if(f&&!f.via&&!f.partner&&/^KX\d{1,3}$/.test(f.code)){try{kgmEnsureAuctionsR922(f.code,dd,f)}catch(e){}}}}
  const K=b=>b.code+'|'+b.date+'|'+b.fr+'|'+b.to;const mile={},cash={};
  (S.resMileBidsR161||[]).filter(b=>b.date>T&&b.status==='open').forEach(b=>mile[K(b)]=1);
  (S.residenceBidsR83||[]).filter(b=>b.date>T).forEach(b=>{const k=K(b);(cash[k]=cash[k]||{})[b.status]=((cash[k]||{})[b.status]||0)+1});
  const st={};Object.keys(mile).forEach(k=>{const c=cash[k];const s=c?Object.keys(c).sort().join('+'):'none';st[s]=(st[s]||0)+1});
  const ex=Object.keys(mile).filter(k=>cash[k]&&!cash[k].open).slice(0,3).map(k=>{const c=(S.residenceBidsR83||[]).filter(b=>K(b)===k);return k+' '+JSON.stringify(c.slice(0,2).map(b=>({st:b.status,id:b.id,demo:b.demoR922,amt:b.amount,why:b.closeWhyR1006A||b.reason||b.settledWhy||''})))});
  const none=Object.keys(mile).filter(k=>!cash[k]);const ids={};(S.resMileBidsR161||[]).filter(b=>b.status==='open'&&none.includes(K(b))).forEach(b=>{const p=String(b.id).replace(/[0-9_]+$/,'');ids[p]=(ids[p]||0)+1});const sd={};none.forEach(k=>{const [c,d,fr,to]=k.split('|');let s=null;try{s=null}catch(e){}});return {ids,mileGroups:Object.keys(mile).length,byCashStatus:st,ex}});
 console.log(JSON.stringify(r,null,1));await b.close()})();

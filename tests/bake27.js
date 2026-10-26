const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
const r=await p.evaluate(()=>{try{localStorage.removeItem('kgm26_wroute')}catch(_){}const seen={},pairs=[];FLIGHTS.forEach(f=>{if(!f||f.via||f.partner||!/^KX\d+$/.test(f.code))return;const k=[f.fr,f.to].sort().join('-');if(!seen[k]){seen[k]=1;pairs.push([f.fr,f.to])}});
 ['LHR','AMS','FRA','VIE','PRG','FCO'].forEach(x=>pairs.push(['TPE',x]));const t0=performance.now();const o=kgmWarBakeR1026B(pairs);const ms=performance.now()-t0;
 const war=Object.entries(o.r).filter(([k,v])=>v);return {ms:Math.round(ms),n:pairs.length,war:war.length,sig:o.sig,list:war.map(([k,v])=>k+' +'+(v.d1-v.d0)+'km '+v.z.join('/')+' '+(v.ms||0)+'ms'+(v.fail?' FAIL':'')),bake:o}});
require('fs').writeFileSync('/home/user/kgm/patches/1026C/geo/baked27.json',JSON.stringify(r.bake));
console.log('ms',r.ms,'pairs',r.n,'war',r.war,r.sig);r.list.forEach(x=>console.log(' ',x));console.log(errs.slice(0,3));await b.close()})();

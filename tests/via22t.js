const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
console.log(await p.evaluate(()=>{const o=[];let bad=0,tot=0,badc=0,totc=0,skip=0,mono=0;const T=todayISO();const t0=Date.now();
 const vias=[...FLIGHTS].filter(f=>f.via&&!f.partner&&!f.codeshare);
 const low=(row,d,cab)=>{const r={};CAB_CODES(cab).forEach(c=>{if(!(kgmInventory49(c,d,row)>0))return;const fm=FARES[c].familyR48||'*';const v=owPrice(row,c,1);if(r[fm]==null||v<r[fm])r[fm]=v;if(r['*']==null||v<r['*'])r['*']=v});return r};
 for(const v of vias){for(const k of [3,12,30,60,150]){const d=addDays(T,k);if(!flyOn(v,new Date(d+'T12:00:00')))continue;
   let ns=FLIGHTS.filter(x=>!x.via&&!x.partner&&!x.codeshare&&x.fr===v.fr&&x.to===v.to);if(!ns.length){skip++;continue}
   const on=ns.filter(x=>flyOn(x,new Date(d+'T12:00:00')));if(on.length)ns=on;
   const vr=Object.assign({},v,{date:d});
   for(const cab of ['Economy','Premium','Business','First']){const V=low(vr,d,cab);const N={};ns.forEach(x=>{const q=low(Object.assign({},x,{date:d}),d,cab);for(const kk in q)if(N[kk]==null||q[kk]<N[kk])N[kk]=q[kk]});
     for(const kk in V){if(N[kk]==null)continue;tot++;if(V[kk]>=N[kk]){bad++;if(bad<6)o.push('BADFAM '+v.code+' '+v.fr+'-'+v.via+'-'+v.to+' '+d+' '+cab+' '+kk+' via '+V[kk]+' ns '+N[kk])}}
     const cc=CAB_CODES(cab);let prev=0;cc.forEach(c=>{const vp=owPrice(vr,c,1);const np=Math.min(...ns.map(x=>owPrice(Object.assign({},x,{date:d}),c,1)));if(vp>0&&np>0){totc++;if(vp>=np)badc++}if(vp<prev)mono++;prev=vp})}}}
 o.push('via rows '+vias.length+' family/cabin compared '+tot+' bad '+bad+' | per-code compared '+totc+' bad '+badc+' | ladder non-monotonic '+mono+' | skipped(no nonstop) '+skip+' | ms '+(Date.now()-t0));
 const d='2026-11-04';S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr:'TPE',to:'MEL',dep:d,type:'OW',adults:1,pax:1,cabin:'Economy',useMiles:false});const t1=Date.now();render();o.push('render ms '+(Date.now()-t1));
 o.push([...document.querySelectorAll('#app tr.fl-row')].map(r=>r.innerText.replace(/\s+/g,' ').slice(0,150)).join('\n'));
 return o.join('\n')}));console.log('pageerrors',errs.length,errs.slice(0,3));await b.close()})();

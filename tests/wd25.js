// 1025B D：冬季飛行時間每班差異
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
 await p.goto('file:///tmp/j/'+(process.argv[2]||'kgm.html'),{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(25000);
 const r=await p.evaluate(()=>{const td=todayISO(),y=+td.slice(0,4),sd=(td<=y+'-07-15'?y:y+1)+'-07-15',wd=(td<=y+'-01-15'?y:y+1)+'-01-15';
   const L=[].concat(FLIGHTS,S.customFlights||[]).filter(f=>f&&!f.via&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(f.code));const out=[];const seen={};
   L.forEach(f=>{const k=f.code+f.fr+f.to+f.dep;if(seen[k])return;seen[k]=1;let su,wi;try{su=kgmSeasonFlightR48(f,sd);wi=kgmSeasonFlightR48(f,wd)}catch(e){return}
     if(!su||!wi||!su.dep||!wi.dep)return;let bs=0,bw=0;try{bs=blockMin(f.fr,f.to,su.dep,su.arr,su.dd||0);bw=blockMin(f.fr,f.to,wi.dep,wi.arr,wi.dd||0)}catch(_){}
     out.push({c:f.code,r:f.fr+'-'+f.to,ty:wi.acft||f.acft,sd:su.dep,sa:su.arr,wdp:wi.dep,wa:wi.arr,wdd:wi.dd||0,bs,bw,dl:bw-bs,air:wi.windAirR1025B,gnd:wi.windGndR1025B})});
   return out});
 fs.writeFileSync('/tmp/j/wd25_'+(process.argv[3]||'new')+'.json',JSON.stringify(r));
 const by={};r.forEach(x=>{(by[x.r]=by[x.r]||[]).push(x)});
 let multi=0,multiDistinct=0;Object.keys(by).forEach(k=>{const L=by[k];if(L.length>1){multi++;if(new Set(L.map(x=>x.dl)).size>1)multiDistinct++}});
 console.log('flights',r.length,'routes',Object.keys(by).length,'routes with >1 flight',multi,'of which deltas differ',multiDistinct);
 ['TPE-NRT','NRT-TPE','TPE-LAX','LAX-TPE','TPE-HKG','HKG-TPE','TPE-ICN','ICN-TPE','TPE-BKK','TPE-SYD','TPE-LHR','LHR-TPE','TPE-KIX','KIX-TPE','TPE-MEL','MEL-TPE'].forEach(k=>{(by[k]||[]).forEach(x=>console.log(k,x.c,x.ty,'S',x.sd+'-'+x.sa,'W',x.wdp+'-'+x.wa,'dl',x.dl,'air',x.air,'gnd',x.gnd))});
 const a3=r.filter(x=>/^03:/.test(x.wa));console.log('03xx arrivals',a3.length,a3.map(x=>x.c+' '+x.wa).join(','));
 const d0=r.filter(x=>x.wdp==='00:00'||x.sd==='00:00');console.log('00:00 deps',d0.length);
 console.log('errors',errs.slice(0,5));await b.close()})();

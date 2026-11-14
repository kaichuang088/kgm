// 1023A：時刻表 PDF 用資料 —— 每個 KGM 自營航段（非經停整段）夏季（2026-07-15）／冬季（2027-01-15）的網站時刻（冬季含風向修正）
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(16000);
const r=await p.evaluate(()=>{const out=[];const seen={};
 [].concat(FLIGHTS,S.customFlights||[]).forEach(f=>{if(!f||f.partner||!/^KX\d+$/.test(f.code))return;const k=f.code+'|'+f.fr+'|'+f.to+'|'+f.dep;if(seen[k])return;seen[k]=1;
  const one=d=>{let x=f;try{x=kgmSeasonFlightR48(f,d)||f}catch(_){}let dur=0;try{dur=blockMin(f.fr,f.to,x.dep,x.arr,+x.dd||0)}catch(_){dur=+x.dur||0}return {dep:x.dep,arr:x.arr,dd:+x.dd||0,dur:dur,days:Array.isArray(x.days)?x.days:String(x.days==null?'':x.days)}};
  const v={};['2026-09-15','2026-10-10','2026-10-20','2026-11-15','2027-01-15','2027-02-01'].forEach(d=>v[d]=one(d));out.push({code:f.code,fr:f.fr,to:f.to,via:f.via||'',dep0:f.dep,v:v,s:v['2026-09-15'],w:v['2027-01-15']})});
 return out});
require('fs').writeFileSync(process.argv[3]||'/tmp/j/dumptt23.json',JSON.stringify(r));console.log(r.length,'legs');console.log(JSON.stringify(r.filter(x=>/^KX(180|4|51|12)$/.test(x.code))).slice(0,800));await b.close()})();

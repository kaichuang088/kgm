// 1020B：時刻表 PDF 用資料（夥伴營運航班＋杜哈線＋城市名＋距離）
const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:900}})).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(16000);
const r=await p.evaluate(()=>{const o={cs:[],city:{},dist:{},pdur:window.KGM_PDUR_R1020B||[],peq:window.KGM_PEQ_R1020B};
 FLIGHTS.filter(f=>f&&f.partner&&!f.via).forEach(f=>{o.cs.push({code:f.code,op:f.operator,opf:f.operatorFlight,fr:f.fr,to:f.to,dep:f.dep,arr:f.arr,dd:+f.dd||0,dur:+f.dur||0,days:Array.isArray(f.days)?f.days:String(f.days),eq:f.partnerEquipment||'',ef:f.effFrom||f.effFromR190||'',et:f.effTo||f.effToR190||''});
  [f.fr,f.to].forEach(a=>{try{o.city[a]=CITY(a)}catch(_){};try{o.dist[a]=distOf('TPE',a)}catch(_){}})});
 o.doh=['KX2|TPE|DOH','KX1|DOH|TPE','KX100|TPE|DOH','KX99|DOH|TPE'].map(k=>{const p=k.split('|');const f=FLIGHTS.find(x=>x.code===p[0]&&x.fr===p[1]&&x.to===p[2]);const w=kgmSeasonFlightR48(f,'2026-12-10');return {code:p[0],fr:p[1],to:p[2],dep:w.dep,arr:w.arr,dd:+w.dd||0,days:String(w.days||f.days),acft:w.acft,dur:+w.dur||0,durStr:w.durStr}});
 return o});
require('fs').writeFileSync('/tmp/j/dumptt20.json',JSON.stringify(r,null,0));console.log(r.cs.length,'pdur',r.pdur.length,'peq',r.peq);console.log(r.pdur.join('\n'));console.log(JSON.stringify(r.doh));await b.close()})();

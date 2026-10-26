const {chromium}=require('playwright');const F=process.argv[2];const LATEOK=JSON.parse(require('fs').readFileSync('/tmp/j/lateok.json','utf8'));
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForTimeout(15000);
const r=await p.evaluate((LATEOK)=>{
 const mn=t=>{const q=String(t).split(':');return +q[0]*60+ +q[1]};const hm=n=>{n=((n%1440)+1440)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
 const typ=t=>String(t||'').replace(/[LR]$/,'');const minTurn=t=>{t=typ(t);if(t==='A388')return 90;if(/^A2|^A32|^B73|^B38/.test(t))return 60;return 75};
 const SEA={s:'2027-07-15',w:'2027-01-15'};const MOVE={};const LOGS=[];
 function leg(code,fr,to){return FLIGHTS.find(f=>f&&!f.via&&f.code===code&&f.fr===fr&&f.to===to)}
 function opd(f,sea){const b0=SEA[sea];for(let i=0;i<7;i++){const d=new Date(b0+'T00:00:00');d.setDate(d.getDate()+i);const q=d.toISOString().slice(0,10);if(flyOn(f,new Date(q+'T00:00:00')))return q}return b0}
 function info(code,fr,to,sea){const f=leg(code,fr,to),d=opd(f,sea);const x=kgmSeasonFlightR48(f,d);const dbg=kgmBtDebugR1026B(code,fr,to,d);
   const off=Math.round((kgmTzAtR1026C(to,d)-kgmTzAtR1026C(fr,d))*60);const t=Math.ceil(kgmBlockTargetR1026B(fr,to,x.acft||f.acft,sea==='w',x.dep,d)/5)*5;
   let pr=null;if(dbg&&dbg.pred){const pw=JSON.parse(dbg.pred[5]||'null');if(pw)pr={code:dbg.pred[0],fr:dbg.pred[1],to:dbg.pred[2],k:dbg.pred[3],arr:pw.arr,acft:pw.acft}}
   if(!pr&&fr!=='TPE'&&fr!=='TSA'){const n=+code.slice(2);const rv=FLIGHTS.find(y=>y&&!y.via&&y.code==='KX'+(n+1)&&y.fr===to&&y.to===fr&&flyOn(y,new Date(d+'T00:00:00')));
     if(rv){const q=kgmSeasonFlightR48(rv,d);if(q)pr={code:rv.code,fr:rv.fr,to:rv.to,k:'turn',arr:q.arr,acft:q.acft}}}
   return {f,x,off,t,pr}}
 // 把某一段的出發提前 need 分鐘（不早於 06:00）；被前一班卡住就把前一班一起提前；回傳實際提前了多少
 function pull(code,fr,to,sea,need,depth){if(need<=0||depth>6)return 0;const I=info(code,fr,to,sea);const key=code+'|'+fr+'|'+to+'|'+sea;
   const cur=mn(I.x.dep)-(MOVE[key]||0);let can=Math.min(need,cur-360);if(can<=0)return 0;
   if(I.pr){const gap=((cur-can-mn(I.pr.arr))%1440+1440)%1440;const nd=I.pr.k==='fifth'?75:minTurn(I.x.acft||I.f.acft);
     const prKey=I.pr.code+'|'+I.pr.fr+'|'+I.pr.to+'|'+sea;const prMoved=MOVE[prKey]||0;
     const g2=gap+0; // gap already relative to pred's current projected arrival (before extra moves)
     let gg=(((cur-can-(mn(I.pr.arr)-prMoved))%1440)+1440)%1440;if(gg>720)gg-=1440;const lack=nd-gg;
     if(lack>0&&lack<720){const got=pull(I.pr.code,I.pr.fr,I.pr.to,sea,lack,depth+1);if(got<lack)can-=(lack-got)}}
   if(can<=0)return 0;MOVE[key]=(MOVE[key]||0)+can;LOGS.push([key,'-'+can,'need '+need]);return can}
 const SHORT=[];FLIGHTS.forEach(f=>{if(!f||f.via||f.partner||f.codeshare||!/^KX\d+$/.test(f.code))return;['s','w'].forEach(sea=>{const d=opd(f,sea);if(!flyOn(f,new Date(d+'T00:00:00')))return;let x=null;try{x=kgmSeasonFlightR48(f,d)}catch(e){}if(!x||!x.dep)return;
   const t=Math.ceil(kgmBlockTargetR1026B(f.fr,f.to,x.acft||f.acft,sea==='w',x.dep,d)/5)*5;let need=x.dur<t-15?t-x.dur:0;
   const la=mn(x.arr),key=f.code+'|'+f.fr+'|'+f.to+'|'+sea;if(la<180&&!LATEOK[key]&&f.code+'|'+f.fr+'|'+f.to+'|'+sea!=='KX8|TPE|DTW|w')need=Math.max(need,la+5);
   if(need>0)SHORT.push([f.code,f.fr,f.to,sea,need])})});
 SHORT.sort((a,b)=>b[4]-a[4]);
 SHORT.forEach(s=>pull(s[0],s[1],s[2],s[3],s[4],0));
 const out={};Object.keys(MOVE).forEach(k=>{const q=k.split('|');const I=info(q[0],q[1],q[2],q[3]);out[k]=hm(mn(I.x.dep)-MOVE[k])});
 return {SHORT,MOVE,out,LOGS}},LATEOK);
console.log(JSON.stringify(r.SHORT));console.log(JSON.stringify(r.out,null,0));r.LOGS.forEach(l=>console.log(l.join(' ')));
require('fs').writeFileSync('/tmp/j/early27.json',JSON.stringify(r.out));await b.close()})();

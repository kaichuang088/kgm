// 1101A：整年逐日檢查「非曼谷航線 03:00–05:59 出發／01:30–03:59 抵達」——node win28.js [html]
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(20000);
const r=await p.evaluate(async()=>{const m=t=>{const a=String(t).split(':');return +a[0]*60+ +a[1]};const bad={};let n=0;const t0=Date.now();
 const rows=(FLIGHTS||[]).concat(S.customFlights||[]).filter(f=>f&&!f.via&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(f.code)&&f.fr!=='BKK'&&f.to!=='BKK');
 const base=new Date(todayISO()+'T12:00:00');
 for(let i=0;i<365;i++){const dt=new Date(base.getTime()+i*864e5),d=dt.toISOString().slice(0,10);
   for(const f of rows){try{if(!flyOn(f,dt))continue}catch(_){continue}let x;try{x=kgmSeasonFlightR48(f,d)}catch(_){continue}if(!x||!x.dep)continue;n++;
     const dp=m(x.dep),ar=m(x.arr),w=[];if(dp>=180&&dp<360)w.push('dep');if(ar>=90&&ar<240)w.push('arr');
     if(w.length){const k=f.code+' '+f.fr+'-'+f.to+' '+x.dep+'-'+x.arr+' '+w.join('/');bad[k]=bad[k]||[d,d,0];bad[k][1]=d;bad[k][2]++}}
   if(i%30==29)await new Promise(r=>setTimeout(r,0))}
 return {checked:n,ms:Date.now()-t0,bad}});
console.log(JSON.stringify(r,null,1));await b.close()})();

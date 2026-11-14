const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);
if(process.argv[2]==='inject'){await p.addScriptTag({path:'/home/user/kgm/patches/1026B/js/bt26.js'});await p.waitForTimeout(5000);}
const r=await p.evaluate(()=>{const out=[];FLIGHTS.filter(f=>f&&!f.partner&&/^KX\d+$/.test(f.code)).forEach(f=>{const one=d=>{const x=kgmSeasonFlightR48(f,d);return {dep:x.dep,arr:x.arr,dd:+x.dd||0,dur:blockMin(f.fr,f.to,x.dep,x.arr,+x.dd||0)}};
  out.push({code:f.code,fr:f.fr,to:f.to,via:f.via||'',base:[f.dep,f.arr,f.dd,f.dur],s:one('2027-07-15'),w:one('2027-01-15')})});return {out,log:window.KGM_BT_LOG_R1026B||null}});
require('fs').writeFileSync(process.argv[3]||'/tmp/j/btA.json',JSON.stringify(r));console.log(r.out.length,JSON.stringify(r.log),errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei'})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(12000);
const out=[];
for(const off of [1,2,3,5,8]){
 const r=await p.evaluate(async off=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='stxstatus';S.stxStatusQR1004B={date:addDays(todayISO(),off),fr:'TPE'};render();await new Promise(r=>setTimeout(r,1500));
  return [...document.querySelectorAll('.k6ss tbody tr, table tr')].filter(tr=>tr.querySelector('.k6ss-f')).map(tr=>{const wl=tr.querySelector('.k25-wl');const m=wl&&wl.innerText.match(/只能上 (\d+) 人|還能上 (\d+) 人/);const lim=m?+(m[1]||m[2]):null;const chips=[...tr.querySelectorAll('.k6ss-c')].map(td=>{const b=td.querySelector('b');return b?+b.innerText:null}).filter(x=>x!=null);return {code:tr.querySelector('.k6ss-f b').innerText,lim,chips,cap:[...tr.querySelectorAll('.k31-plcap')].map(x=>x.innerText)}})},off);
 const bad=r.filter(x=>x.lim!=null&&x.chips.some(c=>c>x.lim));const capped=r.filter(x=>x.cap.length);
 out.push({off,rows:r.length,bad:bad.length,badEx:bad.slice(0,2),capped:capped.length,capEx:capped.slice(0,2)});}
console.log(JSON.stringify(out,null,0));console.log('ERR',errs);await b.close()})();

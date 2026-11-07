// 1018B：舊版產生模擬資料 → 新版開頁：kgm_staff 大小、重新整理後每位員工的眷屬名單跟存檔前一模一樣、人工改過的照存、第二個分頁同步也有
const {chromium}=require('playwright');const OLD=process.argv[2],NEW=process.argv[3];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,120)));
await p.goto('file://'+OLD,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
await p.evaluate(()=>{S._simStaff=3000;S._simCust=6000;S._simBk=100;doGenSimPax()});await p.waitForTimeout(25000);
await p.goto('file://'+NEW,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(40000);
const fp=()=>p.evaluate(()=>{const m={};(S.staff||[]).forEach(s=>{m[s.empId]=JSON.stringify(s.famOnFile||null)});const st=localStorage.getItem('kgm_staff')||'';
  return {n:S.staff.length,h:kgmHashR1018A(JSON.stringify(m)),stored:st.length,flagged:(S.staff||[]).filter(s=>s.famSeed18B).length,noFam:(S.staff||[]).filter(s=>!(s.famOnFile&&s.famOnFile.length)).length,seedFlagInStore:(st.match(/famSeed18B/g)||[]).length}});
// 人工改一位眷屬（第一位員工加一位朋友）
const man=await p.evaluate(()=>{const s=S.staff.find(x=>x.famOnFile&&x.famOnFile.length);s.famOnFile=s.famOnFile.concat([{last:'TEST',first:'MANUAL',relation:'friend',dob:'1990-01-01',passport:'Z12345678'}]);save();return s.empId});
await p.waitForTimeout(3000);
const a=await fp();console.log('before reload',JSON.stringify(a));
const p2=await ctx.newPage();await p2.goto('file://'+NEW,{waitUntil:'domcontentloaded',timeout:300000});await p2.waitForTimeout(40000);
// 第二分頁改別的東西 → 第一分頁同步讀回 kgm_staff
await p2.evaluate(()=>{const s=S.staff.find(x=>x.role==='cabin');s.station=s.station;s.syncProbe18B=Date.now();save()});await p.waitForTimeout(8000);
const sy=await p.evaluate((man)=>({probe:(S.staff||[]).some(s=>s.syncProbe18B),noFam:(S.staff||[]).filter(s=>!(s.famOnFile&&s.famOnFile.length)).length,flagged:(S.staff||[]).filter(s=>s.famSeed18B).length,
  manual:JSON.stringify(((S.staff||[]).find(s=>s.empId===man)||{}).famOnFile||[]).indexOf('MANUAL')>=0}),man);console.log('tab1 after sync',JSON.stringify(sy));
await p2.close();
await p.reload({waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(40000);
const c=await fp();console.log('after reload',JSON.stringify(c),'same=',c.h===a.h);
console.log('manual kept',await p.evaluate((man)=>JSON.stringify(((S.staff||[]).find(s=>s.empId===man)||{}).famOnFile||[]).indexOf('MANUAL')>=0,man));
console.log('sizes',JSON.stringify(await p.evaluate(()=>{const a=[];let t=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';t+=k.length+v.length;a.push([k,v.length])}a.sort((x,y)=>y[1]-x[1]);return {t,top:a.slice(0,6),fail:window.KGM_LS_FAIL_R1012A?Object.keys(window.KGM_LS_FAIL_R1012A.keys||{}):null}})));
await b.close()})();

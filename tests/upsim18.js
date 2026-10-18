// 1018B：舊版（沒有產生前估算）產生大量模擬資料 → 同一個瀏覽器開新版：量各鍵大小、有沒有存不進去、提示有沒有出現
const {chromium}=require('playwright');const OLD=process.argv[2],NEW=process.argv[3];const [NS,NC,NB]=(process.env.SIM||'3000,6000,100').split(',').map(Number);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>{});
const m=async(tag)=>console.log(tag,JSON.stringify(await p.evaluate(()=>{const a=[];let t=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';t+=k.length+v.length;a.push([k,v.length,v.slice(0,5)])}a.sort((x,y)=>y[1]-x[1]);
 const F=window.KGM_LS_FAIL_R1012A;return {t,top:a.slice(0,7),staff:(S.staff||[]).length,users:(S.users||[]).length,fail:F?Object.keys(F.keys||{}):null,banner:!!document.querySelector('#k12-lsbar,.k12-lsbar,[id*="lsbar"]')||document.body.innerText.indexOf('瀏覽器儲存空間已滿')>=0,ev:window.KGM_LS_EVICT_R1015A||null}})));
await p.goto('file://'+OLD,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
console.log('gen',await p.evaluate(([a,c,k])=>{S._simStaff=a;S._simCust=c;S._simBk=k;doGenSimPax();return S._simMsg},[NS,NC,NB]));
await p.waitForTimeout(25000);await m('old');
await p.goto('file://'+NEW,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:240000,polling:1000}).catch(()=>{});await p.waitForTimeout(10000);await m('new');
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='members';render()});await p.waitForTimeout(20000);await m('new-admin');
await p.reload({waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(60000);await m('new-reload');
await b.close()})();

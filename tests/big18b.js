// 使用者的狀態（kgm_staff 5.5 MB、kgmus4 3.0 MB）：用 1018A 關掉產生前估算，產生 NS 員工＋NC 會員 → 同一個瀏覽器開新版
const {chromium}=require('playwright');const OLD=process.argv[2],NEW=process.argv[3];const [NS,NC,NB]=(process.env.SIM||'6000,6000,100').split(',').map(Number);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>{});
const m=async(tag)=>console.log(tag,JSON.stringify(await p.evaluate(()=>{const a=[];let t=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||'';t+=k.length+v.length;a.push([k,v.length])}a.sort((x,y)=>y[1]-x[1]);
 const F=window.KGM_LS_FAIL_R1012A;return {t,top:a.slice(0,6),staff:(S.staff||[]).length,users:(S.users||[]).length,fail:F?Object.keys(F.keys||{}):null,banner:document.body.innerText.indexOf('瀏覽器儲存空間已滿')>=0,ev:window.KGM_LS_EVICT_R1015A?window.KGM_LS_EVICT_R1015A.keys:null}})));
await p.goto('file://'+OLD,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
console.log('gen',await p.evaluate(([a,c,k])=>{window.kgmSimFitR1018A=function(){return {ok:true}};S._simStaff=a;S._simCust=c;S._simBk=k;doGenSimPax();return S._simMsg},[NS,NC,NB]));
await p.waitForTimeout(30000);await m('old');
await p.reload({waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(30000);await m('old-reload');
await p.goto('file://'+NEW,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(60000);await m('new');
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='members';render()});await p.waitForTimeout(30000);
await p.evaluate(()=>{S.adminTab='crew';render()});await p.waitForTimeout(30000);await m('new-admin');
await p.reload({waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(60000);await m('new-reload');
await b.close()})();

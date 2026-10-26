const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const go=async()=>{await p.waitForTimeout(2500);await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='fleetsched';render()})};
 const strip=()=>p.evaluate(()=>{const e=document.querySelector('.k72-strip');return e?e.innerText.replace(/\s+/g,' ').slice(0,400):'(none)'});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await go();
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(60000);
 await p.reload({waitUntil:'domcontentloaded'});await go();
 for(const t of [15,40,80,140,200]){await p.waitForTimeout((t-(t>15?[15,40,80,140][[40,80,140,200].indexOf(t)]:0))*1000);console.log('t'+t,'settled',await p.evaluate(()=>!!window.KGM_ROT_SETTLED_R1012A),'final',await p.evaluate(()=>!!window.KGM_ROT_FINAL_R913),'|',await strip())}
 await p.screenshot({path:'/tmp/j/strip_after.png'});await b.close()})();

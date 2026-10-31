const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
 for(const vw of [1440,820]){const p=await (await b.newContext({viewport:{width:vw,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 await p.evaluate(()=>{const d=todayISO();S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';S.opsQueryR7='KX50';S.opsDateR7=d;S.opsSelectedR7=null;S.fdTabR1025B='ov';render()});
 await p.waitForTimeout(4000);await p.screenshot({path:'/tmp/j/fd4_'+vw+'_ov.png'});
 for(const t of ['seat','lb','sb']){await p.click('.k25fd-tabs button[data-t="'+t+'"]');await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/j/fd4_'+vw+'_'+t+'.png'})}
 await p.evaluate(()=>{S.opsQueryR7='';S.opsSelectedR7=null;render()});await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/j/fd4_'+vw+'_land.png'});
 console.log(vw,'html class on landing:',await p.evaluate(()=>document.documentElement.className),'band:',await p.evaluate(()=>!!document.querySelector('.k25fd-band')));
 await p.evaluate(()=>{S.adminTab='status';render()});await p.waitForTimeout(1500);console.log('after leaving:',await p.evaluate(()=>document.documentElement.classList.contains('k25fd-on')));
 console.log('errors',errs);await p.close()}
 await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(20000);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';S.opsSelectedR7=null;S.opsQueryR7='';render()});
 await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/j/fd2_empty.png'});
 await p.evaluate(()=>{var d=addDays(todayISO(),1),dow=new Date(d+'T00:00:00').getDay(),f=FLIGHTS.find(f=>!f.via&&/^KX\d+$/.test(f.code)&&!flyOn(f,new Date(d+'T12:00:00')));window.__nf=f&&f.code;S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7='';render()});await p.waitForTimeout(2000);await p.screenshot({path:'/tmp/j/fd2_nofly.png'});
 // 按今日出發第一班
 await p.evaluate(()=>{S.opsQueryR7='';S.opsSelectedR7=null;S.opsDateR7=todayISO();render()});await p.waitForTimeout(1500);console.log('nofly',await p.evaluate(()=>window.__nf));
 await p.locator('.k25fd-row').first().click();await p.waitForTimeout(4000);
 console.log('opened',await p.evaluate(()=>S.opsSelectedR7),'tabs',await p.evaluate(()=>[...document.querySelectorAll('.k25fd-tabs button')].map(b=>b.textContent).join(' | ')));
 await p.screenshot({path:'/tmp/j/fd2_ov.png'});
 for(const t of ['man','seat','sb','all']){await p.locator('.k25fd-tabs button[data-t="'+t+'"]').click();await p.waitForTimeout(1200);
   const vis=await p.evaluate(()=>[...document.querySelectorAll('[data-k23fd]')].filter(e=>e.offsetHeight>0).map(e=>e.getAttribute('data-k23fd')).join(','));console.log(t,'visible:',vis,'height',await p.evaluate(()=>document.body.scrollHeight));
   if(t!=='all')await p.screenshot({path:'/tmp/j/fd2_'+t+'.png'})}
 console.log('errors',errs);await b.close()})();

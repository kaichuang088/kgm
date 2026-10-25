const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='warning'&&/fd25|map25|war25/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(20000);
 const code=process.argv[2]||'KX94';
 const sel=await p.evaluate((code)=>{const f=FLIGHTS.find(f=>f.code===code&&!f.via);let d=todayISO();for(let i=0;i<10&&!flyOn(f,new Date(d+'T12:00:00'));i++)d=addDays(d,1);
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';S.opsQueryR7=code;S.opsDateR7=d;S.opsSelectedR7=[code,d,f.fr,f.to].join('|');S.fdTabR1025B='ov';render();return S.opsSelectedR7},code);
 console.log('sel',sel);
 await p.waitForTimeout(5000);
 await p.screenshot({path:'/tmp/j/fd3_ov.png',fullPage:true});
 console.log(await p.evaluate(()=>({map:!!document.querySelector('.k25map.ready'),info:(document.querySelector('.k25map-info')||{}).textContent,kpi:document.querySelectorAll('.k25fd-kpi').length,war:JSON.stringify(window.kgmWarDelayR1025B&&kgmWarDelayR1025B(FLIGHTS.find(f=>f.code===S.opsSelectedR7.split('|')[0]&&!f.via),S.opsSelectedR7.split('|')[1]))})));
 for(const t of ['man','all']){await p.click('.k25fd-tabs button[data-t="'+t+'"]');await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/j/fd3_'+t+'.png'})}
 await p.click('.k25fd-tabs button[data-t="man"]');await p.waitForTimeout(1500);await p.evaluate(()=>window.scrollTo(0,1600));await p.waitForTimeout(500);await p.screenshot({path:'/tmp/j/fd3_scroll.png'});
 console.log('rail top after scroll',await p.evaluate(()=>Math.round(document.querySelector('.k25fd-band').getBoundingClientRect().top)));
 console.log('errors',errs);await b.close()})();

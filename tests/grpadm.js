const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{console.log('DIALOG',d.message().slice(0,160));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 await p.evaluate(()=>{const us=S.users;us[0].groupAccountR1025B={status:'pending',type:'agency',company:'雄獅測試旅行社',taxId:'22099131',license:'交觀甲 5678',contact:{name:'李小華',phone:'0922333444',email:us[0].email},caseNo:'KG2610260001M',boundAt:new Date().toISOString()};
   us[1].groupAccountR1025B={status:'active',type:'corp',company:'台積測試企業',taxId:'22099131',contact:{name:'張經理',phone:'0933',email:us[1].email},caseNo:'KG2610260002M',from:'2026-10-01',to:'2027-09-30',approvedAt:new Date().toISOString()};
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groups23';S.k27gdTab='';render()});
 await p.waitForTimeout(1500);await p.screenshot({path:'/tmp/j/gadm1.png'});
 await p.evaluate(()=>{S.k27gdTab='acct';render()});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/j/gadm2.png'});
 console.log(await p.evaluate(()=>document.querySelector('.k25gd')&&document.querySelector('.k25gd').innerText.replace(/\n+/g,' / ').slice(0,1200)));
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/j/gadm_m.png'});
 console.log('admin m scrollW',await p.evaluate(()=>document.documentElement.scrollWidth));
 // 前台規章視窗（手機）
 await p.evaluate(()=>{S.view='home';render();kgmPolicyOpenR914('KGM-GRP-021')});await p.waitForTimeout(1000);await p.screenshot({path:'/tmp/j/pol_m1.png'});
 console.log('modal box',await p.evaluate(()=>{const ds=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e);return s.position==='fixed'&&e.offsetHeight>300&&/團體訂位規章/.test(e.innerText||'')});return ds.slice(0,3).map(e=>e.className+' '+JSON.stringify(e.getBoundingClientRect())).join(' | ')}));
 await p.evaluate(()=>{const t=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+200&&/第 6 條/.test(e.innerText||'')&&getComputedStyle(e).overflowY!='visible');const x=t[t.length-1];if(x)x.scrollTop=x.scrollHeight*0.35});await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/pol_m2.png'});
 console.log('errors',errs);await b.close()})();

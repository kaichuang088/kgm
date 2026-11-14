const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(6000);
 const shot=async(n,fn,w,a)=>{await p.evaluate(fn,a);await p.waitForTimeout(w||1500);const sw=await p.evaluate(()=>document.documentElement.scrollWidth);console.log(n,'scrollWidth',sw);await p.screenshot({path:'/tmp/j/m27_'+n+'.png',fullPage:false})};
 await shot('home',()=>{S.view='home';render()});
 await shot('ai',()=>{const u=S.users.find(u=>/demo/i.test(u.email))||S.users[0];S.user=u;render();kgmToggleAi0819I()});
 await shot('aiScroll',()=>{const m=document.getElementById('aiMessages');if(m)m.scrollTop=400});
 await shot('group',()=>{S.aiOpen0819H=false;S.view='group23';render()});
 await shot('notif',()=>{S.view='notif';render()});
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin'});
 for(const t of ['airspace27','notify','feedback_r48','groups23','cases0831C','chat','flightdata']){await shot('adm_'+t,(t)=>{S.adminTab=t;if(t==='groups23')S.k27gdTab='acct';render();const m=document.querySelector('#app main');if(m)m.scrollIntoView()},2000,t)}
 console.log('errors',errs);await b.close()})();

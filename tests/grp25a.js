const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 const uid=await p.evaluate(()=>{const u=(S.users||[]).find(u=>u&&u.email&&!u.groupAccountR1025B);S.user=u;S.view='home';render();return u&&(u.id+' '+u.email)});console.log('user',uid);
 console.log('bound before',await p.evaluate(()=>kgmGrpBoundR1025B()),'tab visible',await p.evaluate(()=>/團體訂位/.test(document.querySelector('#app').innerText)));
 await p.evaluate(()=>{window.kgmToggleAi0819I()});await p.waitForTimeout(800);
 const say=async t=>{await p.evaluate(t=>{const i=document.getElementById('aiInput');i.value=t;window.kgmSendAi0819I()},t);await p.waitForTimeout(500);return p.evaluate(()=>{const m=S.aiConversation0819I.messages;return m[m.length-1].text})};
 for(const t of ['我想綁定團體帳號','1','KGM 測試旅行社股份有限公司','12345678','22099131','交觀甲 1234','王小明','0912345678','確認']){const r=await say(t);console.log('> '+t+'\n'+r.split('\n').slice(0,3).join(' / '))}
 await p.screenshot({path:'/tmp/j/grp_ai.png'});
 console.log('bound',await p.evaluate(()=>JSON.stringify(kgmGrpAccountR1025B())),'case',await p.evaluate(()=>{const c=(S.staffCasesR1007A||[])[0];return c&&c.caseNo+' '+c.type+' '+c.status}));
 await p.evaluate(()=>{window.kgmToggleAi0819I&&window.kgmToggleAi0819I();S.view='home';render()});await p.waitForTimeout(600);
 await p.evaluate(()=>kgmGrpModeR1025B(1));await p.waitForTimeout(500);
 await p.evaluate(()=>{S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),40);S.search.ret=addDays(todayISO(),45);S.search.adults=20;S.search.children=2;S.search.cabin='Economy';S.paxPickerOpen=true;render()});await p.waitForTimeout(600);
 await p.screenshot({path:'/tmp/j/grp_home.png'});
 await p.evaluate(()=>{S.paxPickerOpen=false;passengerCounts();S.outF=null;S.inbF=null;S.seats={};S.paxList=[];S.phase='sel_out';S.openFare=null;nav('booking')});await p.waitForTimeout(2500);
 await p.screenshot({path:'/tmp/j/grp_sel.png'});
 console.log('view',await p.evaluate(()=>S.view+' '+S.phase+' pax '+S.search.pax));
 console.log('errors',errs);await b.close()})();

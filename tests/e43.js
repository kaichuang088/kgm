// 1115B E3／E4：空服員許願截止日（截止前可送、截止後鎖住、沒送＝隨機、截止後才送的不算）＋地勤／空服員側欄「＋ 提出案件」
// 用法：node e43.js <html>；CLK=2026-11-16T03:00:00Z 模擬截止後
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:950},timezoneId:'Asia/Taipei'});await ctx.route(/workers\.dev/,r=>r.abort());const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));let lastAlert='';p.on('dialog',d=>{lastAlert=d.message();d.accept().catch(()=>{})});
 if(process.env.CLK)await p.clock.install({time:new Date(process.env.CLK)});
 await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:250000}).catch(()=>{});await p.waitForTimeout(4000);
 const tag=process.env.CLK?'after':'now';
 const U=await p.evaluate(()=>{const c=(S.staff||[]).filter(x=>x&&x.role==='cabin')[0],g=(S.staff||[]).filter(x=>x&&x.role==='ground')[0];return {c:{empId:c.empId,name:c.name,role:'cabin'},g:{empId:g.empId,name:g.name,role:'ground'}}});
 // ── E3：空服員自己的班表頁 ──
 await p.evaluate(u=>{S.adminAuthed=true;S.adminUser=u;S.view='admin';S.adminTab='flightdata';render()},U.c);await p.waitForTimeout(2500);
 console.log('E3 '+tag+' 側欄許願提醒：',await p.evaluate(()=>{const w=document.querySelector('#k115cnav .k115c-wish');return w?w.innerText.replace(/\s+/g,' '):null}));
 {const bb=await p.evaluate(()=>{const el=document.querySelector('#k115cnav .k115c-wish button');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(bb[0],bb[1]);}await p.waitForTimeout(2500);
 for(let i=0;i<20;i++){if(await p.evaluate(()=>!!document.querySelector('.k115w')))break;await p.waitForTimeout(3000);await p.evaluate(()=>{try{render()}catch(_){}})}
 const w0=await p.evaluate(()=>{const w=document.querySelector('.k115w');return w?{txt:w.innerText.replace(/\s+/g,' ').slice(0,420),sel:w.querySelectorAll('select').length,dis:[...w.querySelectorAll('select')].filter(s=>s.disabled).length,btn:!!w.querySelector('button')}:null});
 console.log('E3 '+tag+' 面板：',JSON.stringify(w0));
 const mo=await p.evaluate(()=>kgmCrewWishMonthR1115A());const dl=await p.evaluate(m=>new Date(kgmCrewWishDeadlineR1115B(m)).toISOString(),mo);console.log('E3 開放月份',mo,'截止(UTC)',dl);
 if(w0){await p.evaluate(()=>{const w=document.querySelector('.k115w');if(w)w.scrollIntoView({block:'center'})});await p.waitForTimeout(300);await p.screenshot({path:'/tmp/j/e43_wish_'+tag+'.png'});
  // 送出 5 個
  await p.evaluate(()=>{const s=[...document.querySelectorAll('.k115w select')];const v=[...s[0].options].map(o=>o.value).filter(Boolean);s.forEach((x,i)=>{x.value=v[i*3]||'';x.dispatchEvent(new Event('change',{bubbles:true}))})});
  {const bb=await p.evaluate(()=>{const el=document.querySelector('.k115w button.btn-g');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(bb[0],bb[1]);}await p.waitForTimeout(800);
  console.log('E3 '+tag+' 送出後：',JSON.stringify(await p.evaluate(([id,m])=>({rec:JSON.stringify((S.crewWishR1115A||{})[id]||{}).slice(0,200),of:kgmCrewWishOfR1115A(id,'TPE',m),msg:S.k115wMsg,ls:(localStorage.getItem('kgm40_crewwish')||'').slice(0,160)}),[U.c.empId,mo])),'alert:',lastAlert);}
 // 截止後才送的不算；截止後不能送
 const r3=await p.evaluate(([id])=>{const m='2026-12',dl=kgmCrewWishDeadlineR1115B(m);const W=S.crewWishR1115A=S.crewWishR1115A||{};const keep=JSON.stringify(W['K_TEST']||null);
   W['K_TEST']={'2026-12':['NRT','KIX','ICN','HKG','BKK'],'@2026-12':dl+60000};const late=kgmCrewWishOfR1115A('K_TEST','TPE',m);
   W['K_TEST']['@2026-12']=dl-60000;const ontime=kgmCrewWishOfR1115A('K_TEST','TPE',m);delete W['K_TEST'];
   const none=kgmCrewWishOfR1115A('K_NOBODY','TPE',m),none2=kgmCrewWishOfR1115A('K_NOBODY','TPE',m);
   return {late:late.mine,ontime:ontime.mine,randomSame:JSON.stringify(none.list)===JSON.stringify(none2.list),random:none.list,dl:new Date(dl).toISOString()}},[U.c.empId]);
 console.log('E3 截止後才送：算不算',r3.late,'| 截止前送：算不算',r3.ontime,'| 沒送＝隨機（每次一樣）',r3.randomSame,r3.random.join(','),'| 12 月截止',r3.dl);
 lastAlert='';await p.evaluate(id=>kgmCrewWishSaveR1115A(id,'2026-12'),U.c.empId);await p.waitForTimeout(300);console.log('E3 '+tag+' 直接送 2026-12：',lastAlert||'（沒有擋，表示還沒截止）');
 // ── E4：空服員側欄 ──
 await p.evaluate(u=>{S.case7New=null;S.case115Msg='';S.adminUser=u;S.adminTab='sched';render()},U.c);await p.waitForTimeout(1500);
 const nav=await p.evaluate(()=>{const n=document.getElementById('k115cnav');if(!n)return null;const r=n.getBoundingClientRect(),side=document.querySelector('.p-admin-side').getBoundingClientRect();return {txt:n.innerText.replace(/\s+/g,' '),top:Math.round(r.top-side.top),first:n.parentElement.firstElementChild===n}});
 console.log('E4 空服員側欄：',JSON.stringify(nav));await p.screenshot({path:'/tmp/j/e43_nav_cabin.png',clip:{x:0,y:0,width:520,height:700}});
 {const bb=await p.evaluate(()=>{const el=document.querySelector('#k115cnav button');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(bb[0],bb[1]);}
 for(let i=0;i<30;i++){await p.waitForTimeout(2000);if(await p.evaluate(()=>!!document.querySelector('#k115cm .k115c-pick')||!!(S.case115Msg&&!/正在找/.test(S.case115Msg))))break}
 const m1=await p.evaluate(()=>({tab:S.adminTab,sel:S.opsSelectedR7,modal:!!document.querySelector('#k115cm .k115c-pick'),head:(document.querySelector('.k115c-h')||{}).innerText,tip:(document.querySelector('.k115c-tip')||{}).innerText,msg:S.case115Msg,n:document.querySelectorAll('.k115c-list button').length}));
 console.log('E4 空服員按了之後：',JSON.stringify(m1));await p.screenshot({path:'/tmp/j/e43_case_cabin.png'});
 // 地勤
 await p.evaluate(u=>{S.case7New=null;S.case115Msg='';S.adminUser=u;S.adminTab='groundroster12';render()},U.g);await p.waitForTimeout(1500);
 console.log('E4 地勤側欄：',JSON.stringify(await p.evaluate(()=>{const n=document.getElementById('k115cnav');return n?n.innerText.replace(/\s+/g,' '):null})));
 {const bb=await p.evaluate(()=>{const el=document.querySelector('#k115cnav button');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.mouse.click(bb[0],bb[1]);}for(let i=0;i<30;i++){await p.waitForTimeout(2000);if(await p.evaluate(()=>!!document.querySelector('#k115cm .k115c-pick')||!!(S.case115Msg&&!/正在找/.test(S.case115Msg))))break}
 console.log('E4 地勤按了之後：',JSON.stringify(await p.evaluate(()=>({tab:S.adminTab,modal:!!document.querySelector('#k115cm .k115c-pick'),head:(document.querySelector('.k115c-h')||{}).innerText,tip:(document.querySelector('.k115c-tip')||{}).innerText,msg:S.case115Msg}))));
 await p.screenshot({path:'/tmp/j/e43_case_ground.png'});
 // CEO 不出現
 await p.evaluate(()=>{S.case7New=null;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.adminTab='status';render()});await p.waitForTimeout(800);
 console.log('E4 CEO 側欄有沒有：',await p.evaluate(()=>!!document.getElementById('k115cnav')));
 console.log('ERR',JSON.stringify(errs.filter(e=>!/寄信服務|Worker/.test(e)).slice(0,5)));await b.close()})();

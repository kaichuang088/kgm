const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{console.log('DLG',d.message().slice(0,80));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(6000);
 // AI
 await p.evaluate(()=>{const u=S.users.find(u=>/demo/i.test(u.email))||S.users[0];S.user=u;S.view='home';render();kgmToggleAi0819I()});await p.waitForTimeout(1500);
 console.log('AI cardsets',await p.evaluate(()=>({k63:document.querySelectorAll('#aiMessages .k63-cards').length,i:document.querySelectorAll('#aiMessages .kgm-i-menu').length,btn:[...document.querySelectorAll('#aiMessages .kgm-i-menu button')].map(b=>b.innerText.trim()).filter(t=>/旅行團/.test(t))})));
 await p.screenshot({path:'/tmp/j/t27_ai.png'});
 await p.evaluate(()=>{[...document.querySelectorAll('#aiMessages .kgm-i-menu button')].find(b=>/旅行團/.test(b.innerText)).click()});await p.waitForTimeout(2500);
 console.log('AI after group click',await p.evaluate(()=>[...document.querySelectorAll('#aiMessages *')].filter(e=>e.children.length===0).map(e=>e.innerText).filter(t=>t&&t.length>8).slice(-4).join(' | ').slice(0,400)));
 await p.screenshot({path:'/tmp/j/t27_ai2.png'});
 // mobile AI
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{kgmRestartAi0819I&&kgmRestartAi0819I()});await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/j/t27_ai_m.png'});console.log('m sw',await p.evaluate(()=>document.documentElement.scrollWidth));
 await p.setViewportSize({width:1360,height:950});
 // rich announcement
 await p.evaluate(()=>{S.aiOpen0819H=false;S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='notify';S.ntCh27='ann';render()});await p.waitForTimeout(1500);
 await p.fill('#anAnnMsg','冬季班表公告');await p.evaluate(()=>{const t=document.getElementById('anAnnMsg');t.setSelectionRange(0,4)});await p.click('.k27nt-card.k27nt-on .k27rt-bar button[data-a="b"]');
 await p.evaluate(()=>{const t=document.getElementById('anAnnMsg');t.value+='\n北美出發時間調整\n巴基斯坦空域繞行';t.setSelectionRange(t.value.indexOf('北美'),t.value.length);t.dispatchEvent(new Event('input',{bubbles:true}))});await p.click('.k27nt-card.k27nt-on .k27rt-bar button[data-a="ul"]');
 console.log('value',JSON.stringify(await p.evaluate(()=>document.getElementById('anAnnMsg').value)),'prev',await p.evaluate(()=>document.querySelector('.k27nt-card.k27nt-on .k27rt-prev').innerHTML.slice(0,200)));
 await p.screenshot({path:'/tmp/j/t27_rich.png'});
 await p.click('.k27nt-card.k27nt-on > button');await p.waitForTimeout(800);
 // front notif view
 await p.evaluate(()=>{S.view='notif';render()});await p.waitForTimeout(1500);
 console.log('front rich',await p.evaluate(()=>{const e=[...document.querySelectorAll('.k27rt')].find(x=>/冬季班表公告/.test(x.innerText));return e?e.innerHTML.slice(0,200):'none'}));
 await p.screenshot({path:'/tmp/j/t27_notif.png'});
 // team
 const r=await p.evaluate(()=>{const g=S.staff.find(s=>s.role==='cabin'&&s.active!==false);S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};const ok=kgmMgrSetR1012A(g.empId,'cabin',2);return {id:g.empId,name:g.name,ok,team:kgmTeamOfR1026C(g.empId).length}});console.log('mgr',JSON.stringify(r));
 await p.evaluate(r=>{S.adminUser={name:r.name,empId:r.id,role:'cabin'};S.view='admin';S.adminTab='notify';S.ntCh27='staff';S._scDept='team';render()},r);await p.waitForTimeout(1500);
 console.log('team option',await p.evaluate(()=>[...document.querySelectorAll('.k27nt-card.k27nt-on select option')].map(o=>o.textContent+(o.selected?'*':'')).join(',')));
 await p.evaluate(()=>{S._scMsg2='**明天** 07:00 簡報\n- 帶護照\n- 換新制服';doStaffCast()});await p.waitForTimeout(800);
 console.log('team sent',await p.evaluate(r=>{const tm=kgmTeamOfR1026C(r.id);const n=(S.staffNotifs||[]).filter(x=>tm.indexOf(x.empId)>=0&&/團隊公告/.test(x.msg)).length;return n+'/'+tm.length+' chat:'+(S.staffChat||[]).filter(c=>c.to==='dept_team_'+r.id).length},r));
 await p.evaluate(()=>{S.adminTab='chat';S._chThread='dept_team_'+S.adminUser.empId;render()});await p.waitForTimeout(1200);
 console.log('chat groups',await p.evaluate(()=>document.querySelector('#app main').innerText.replace(/\s+/g,' ').slice(0,300)));
 await p.screenshot({path:'/tmp/j/t27_chat.png'});
 console.log('errors',errs);await b.close()})();

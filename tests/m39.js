// 1108B B10／B11：上排「信用卡綁定」、前台 AI 回答在哪裡綁卡（不再重複貼規章）；地勤個人行事曆／全員週班表切換
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(20000);
const b10=await p.evaluate(async()=>{const u=S.users.find(x=>x&&/^KGM\d/.test(x.id));S.user=u;S.view='home';render();await new Promise(r=>setTimeout(r,500));
 const li=[...document.querySelectorAll('#mega_miles li')].map(x=>x.textContent);const it=[...document.querySelectorAll('#mega_miles li')].find(x=>x.textContent==='信用卡綁定');it&&it.click();
 await new Promise(r=>setTimeout(r,2500));const cb=document.querySelector('.k22-cardb');const vis=cb?Math.round(cb.getBoundingClientRect().top):null;
 const o={menu:li,view:S.view,tab:S.profileTab,cardSec:!!cb,cardTop:vis};
 S.view='home';render();const tog=document.querySelector('[onclick*="kgmToggleAi0819I"]');if(tog)tog.click();await new Promise(r=>setTimeout(r,800));
 const ask=async q=>{const inp=document.getElementById('aiInput');if(!inp)return 'NOINPUT';inp.value=q;kgmSendAi0819I();await new Promise(r=>setTimeout(r,3200));const c=S.aiConversation0819I;const m=c.messages[c.messages.length-1];return {html:!!m.html,guide:m.guideR1108B||null,txt:String(m.text).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,220)}};
 o.q1=await ask('信用卡綁定');o.q2=await ask('信用卡綁定在哪裡');o.q3=await ask('我的徽章在哪裡看');o.q4=await ask('寵物要怎麼申請');
 const btn=[...document.querySelectorAll('#aiMessages .k39-guide button')].pop();o.btns=document.querySelectorAll('#aiMessages .k39-guide button').length;if(btn){btn.click();await new Promise(r=>setTimeout(r,800));o.afterBtnView=S.view}
 return o});
console.log('B10',JSON.stringify(b10,null,1));await p.screenshot({path:'/tmp/j/s39/b10.png'});
const b11=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='groundroster12';S.gr39View=null;render();await new Promise(r=>setTimeout(r,4000));
 const sec=document.querySelector('.k74-person');const o={};o.me={h:sec&&Math.round(sec.getBoundingClientRect().height),table:!!document.querySelector('.k28gr-tbl'),seg:[...document.querySelectorAll('.k39gr-seg button')].map(b=>b.innerText.replace(/\s+/g,' ')),profile:!!document.querySelector('.k74-person-profile')};
 S.gr39View='all';render();await new Promise(r=>setTimeout(r,1500));const prof=document.querySelector('.k74-person-profile');o.all={h:Math.round(sec&&document.querySelector('.k74-person').getBoundingClientRect().height),rows:document.querySelectorAll('.k28gr-row:not(.k28gr-th)').length,profileHidden:prof?getComputedStyle(prof).display==='none':true};
 const row=document.querySelectorAll('.k28gr-row:not(.k28gr-th)')[3];const nm=row&&row.querySelector('.who small').textContent;row&&row.click();await new Promise(r=>setTimeout(r,1500));
 o.back={view:S.gr39View,table:!!document.querySelector('.k28gr-tbl'),who:(document.querySelector('.k74-person-profile')||{innerText:''}).innerText.slice(0,40),picked:nm};return o});
console.log('B11',JSON.stringify(b11,null,1));await p.screenshot({path:'/tmp/j/s39/b11.png'});
console.log('ERR',errs.slice(0,5));await b.close()})();

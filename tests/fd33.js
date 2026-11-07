// 1103A：航班資料——作業動作自動成立案件／復原結案；重畫後捲動位置不跳；行李改運只列已報到、有小數
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>'1';const out={};
 const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');render();
 await new Promise(r=>setTimeout(r,2500));const key=S.opsSelectedR7;
 // 捲動：把視窗捲到名單中間，按一個會重畫的東西（作業動作下拉）
 window.scrollTo(0,2600);await new Promise(r=>setTimeout(r,200));const y0=window.scrollY;
 S.fdActR929='invdown';render();await new Promise(r=>setTimeout(r,300));out.scroll={before:y0,after:window.scrollY};
 const boxes=[...document.querySelectorAll('#app *')].filter(e=>e.scrollHeight>e.clientHeight+50&&/auto|scroll/.test(getComputedStyle(e).overflowY));out.scrollers=boxes.map(e=>e.tagName+'.'+e.className+' '+e.scrollHeight+'/'+e.clientHeight);const box=boxes.sort((a,b)=>b.scrollHeight-a.scrollHeight)[0];if(box){box.scrollTop=1500;box.dispatchEvent(new Event('scroll'));await new Promise(r=>setTimeout(r,50));render();await new Promise(r=>setTimeout(r,200));const b2=[...document.querySelectorAll('#app *')].find(e=>e.className===box.className);out.inner={cls:box.className,after:b2&&b2.scrollTop}}
 // 作業動作：非自願降等一位商務艙旅客
 window.KGM_NODH_R1023A=1;const m=manifest7(Object.assign({},f,{date:d}),d);window.KGM_NODH_R1023A=0;const x=m.find(q=>q.cabin==='Business'&&!q.dhR929);const n0=(S.staffCasesR1007A||[]).length;
 kgmFdActR929(key,x.id);await new Promise(r=>setTimeout(r,400));const c=(S.staffCasesR1007A||[])[0];
 out.case={added:(S.staffCasesR1007A||[]).length-n0,no:c&&c.caseNo,type:c&&c.type,status:c&&c.status,label:c&&c.typeLabelR1101A,detail:c&&c.detail,pnr:c&&c.pnr,toast:(document.querySelector('.k31-toast')||{}).textContent};
 S.fdActR929='restore';kgmFdActR929(key,x.id);await new Promise(r=>setTimeout(r,400));const c2=(S.staffCasesR1007A||[]).find(q=>q.caseNo===out.case.no);out.afterUndo=c2&&c2.status;
 // 行李改運：先讓一位報到（重量有小數）
 S.r49=S.r49||{};S.r49.checkins=S.r49.checkins||{};S.r49.checkins[key+'|'+x.id]={bags:'2',weights:'23.4, 21.7',completedAt:new Date().toISOString()};
 const html=window.kgmBagMoveHtmlR1023A(Object.assign({},f,{date:d}),d,m);const tmp=document.createElement('div');tmp.innerHTML=html;out.bag={top:(tmp.querySelector('.k23bm-top')||{}).innerText,rows:tmp.querySelectorAll('tbody tr:not(.k23bm-g)').length,sample:[...tmp.querySelectorAll('tbody tr:not(.k23bm-g)')].slice(0,3).map(t=>t.innerText.replace(/\s+/g,' '))};
 return out});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

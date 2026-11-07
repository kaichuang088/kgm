// 1103A：KGM Cards——後台消費頁、前台上排選單（只給綁卡者）、帳單哩程計算、入帳只做一次（重新整理後也不重複）、機場接送
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,40)+' @'+(e.stack||'').split('\n').slice(0,6).join(' | ').slice(0,600)));
const open=async()=>{await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(16000)};
await open();const out={};
// 後台：開信用卡驗證頁 → 模擬卡片
out.admin=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='cardverify';render();await new Promise(r=>setTimeout(r,13000));
 const tabs=[...document.querySelectorAll('.k31c-atabs button')].map(b=>b.innerText);S.k31atab='spend';render();await new Promise(r=>setTimeout(r,500));
 const rows=[...document.querySelectorAll('.k31c-adm tbody tr')].map(t=>t.innerText.replace(/\s+/g,' ')).slice(0,5);
 return {tab:S.adminTab,tabs,cards:(S.cardBindR1022A||[]).map(c=>c.net+':'+c.status).join(','),rows,kpi:(document.querySelector('.k31c-ak')||{}).innerText}});
// 前台：demo 會員綁一張 Star G（已通過），另一位沒有卡
const setup=await p.evaluate(async()=>{S.view='home';S.adminAuthed=false;const u=S.users.find(x=>x.id==='KGM100000');const other=S.users.find(x=>x.id!=='KGM100000');
 S.cardBindR1022A=S.cardBindR1022A||[];S.cardBindR1022A=S.cardBindR1022A.filter(c=>c.id!=='CBTEST31');S.cardBindR1022A.push({id:'CBTEST31',userId:u.id,memberName:'CHUANG TEST',holder:'CHUANG TEST',net:'starg',tier:'Mastercard World Elite',bin6:'552816',last4:'4321',exp:'08/29',luhn:true,at:'2026-07-10T03:00:00.000Z',status:'verified',decidedAt:'2026-07-10T04:00:00.000Z'});
 const d=addDays(todayISO(),5);S.bookings=S.bookings.filter(b=>b.pnr!=='TST31A');S.bookings.push({pnr:'TST31A',userId:u.id,status:'confirmed',outF:{code:'KX4',fr:'TPE',to:'LAX',date:d,dep:'23:25',arr:'19:40'},outC:'Y-V',paxList:[{firstName:'TEST',lastName:'CHUANG'}],total:42000,curr:'TWD',bookedAt:'2026-10-03T02:00:00.000Z',paymentMethod:'Mastercard •••• 4321'});
 S.user=other;render();await new Promise(r=>setTimeout(r,300));const navOther=[...document.querySelectorAll('.mega')].map(m=>m.id);
 S.user=u;render();await new Promise(r=>setTimeout(r,300));const navMe=[...document.querySelectorAll('.mega')].map(m=>m.id);const top=[...document.querySelectorAll('header button')].map(b=>b.innerText.trim()).filter(t=>/KGM Cards/.test(t));
 return {navOther,navMe,top,miles0:u.miles}});
out.setup=setup;
// 前台 KGM Cards 頁：本月帳單＋10 月帳單（含官網購票）
out.front=await p.evaluate(async()=>{S.view='card31';S.k31tab='bill';S.k31ym='2026-10';render();await new Promise(r=>setTimeout(r,500));
 const rows=[...document.querySelectorAll('.k31c-t tbody tr')].map(t=>[...t.children].map(td=>td.innerText.trim()));
 // 驗算：每列哩程＝floor(新臺幣/比率)
 let bad=0;rows.forEach(r=>{if(r.length<8)return;const twd=+r[4].replace(/,/g,'');const per=(r[6].match(/NT\$(\d+)/)||[])[1];const mi=+r[7].replace(/,/g,'');if(per&&Math.floor(twd/+per)!==mi)bad++;if(!per&&mi!==0)bad++});
 return {kpi:document.querySelector('.k31c-kpi').innerText.replace(/\s+/g,' '),sum:document.querySelector('.k31c-sum').innerText.replace(/\s+/g,' '),n:rows.length,cats:[...new Set(rows.map(r=>r[2]))],kgmRow:rows.filter(r=>/TST31A/.test(r[1])).map(r=>r.join(' | ')),bad,foot:document.querySelector('.k31c-t tfoot').innerText.replace(/\s+/g,' ')}});
// 入帳
out.post=await p.evaluate(()=>{const u=S.users.find(x=>x.id==='KGM100000');const m0=u.miles;const n1=kgmCardPostR1103A();const m1=u.miles;const n2=kgmCardPostR1103A();const m2=u.miles;
 const c=S.cardBindR1022A.find(c=>c.id==='CBTEST31');let exp=0;(S.cardPostR1103A['CBTEST31']||[]).forEach(ym=>{exp+=kgmCardStmtR1103A(c,ym).mi});
 return {m0,n1,m1,n2,m2,posted:S.cardPostR1103A['CBTEST31'],exp,log:u.milesLog.filter(l=>l.cardR1103A).slice(0,3).map(l=>l.date+' '+l.miles+' '+l.desc),tp:kgmCardTpR1103A(u.id).tp}});
// 機場接送
out.xfer=await p.evaluate(async()=>{S.view='card31x';render();await new Promise(r=>setTimeout(r,300));const opts=[...document.querySelectorAll('.k31c-xf select')][0];const o=opts?[...opts.options].map(x=>x.text):[];
 kgmXferSetR1103A('seg','0');kgmXferSetR1103A('addr','台北市信義區松仁路 100 號');kgmXferSetR1103A('pax','2');window.alert=m=>{window.__al=m};kgmXferBookR1103A();await new Promise(r=>setTimeout(r,300));
 const q=document.querySelector('.k31c-xq').innerText;const L=(S.cardXferR1103A||[]).map(x=>x.id+' '+x.kind+' '+x.port+' '+x.date+' '+x.status);
 kgmXferBookR1103A();const al2=window.__al;kgmXferBookR1103A();const al3=window.__al;
 return {opts:o,q,L,al2,al3,count:(S.cardXferR1103A||[]).length}});
await p.screenshot({path:'/tmp/j/kc33a.png',fullPage:false});
await p.evaluate(async()=>{S.view='card31';S.k31tab='bill';S.k31ym='2026-10';render();await new Promise(r=>setTimeout(r,300));window.scrollTo(0,0)});await p.screenshot({path:'/tmp/j/kc33b.png',fullPage:false});
// 重新整理：入帳不能重複
await p.evaluate(()=>{try{save()}catch(_){}});await open();
out.reload=await p.evaluate(()=>{const u=S.users.find(x=>x.id==='KGM100000');const m0=u.miles;const n=kgmCardPostR1103A();return {m0,n,m1:u.miles,posted:(S.cardPostR1103A||{})['CBTEST31'],xfer:(S.cardXferR1103A||[]).length,cardStill:(S.cardBindR1022A||[]).some(c=>c.id==='CBTEST31')}});
// 後台接送派車
out.adminX=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='cardverify';S.k31atab='xfer';render();await new Promise(r=>setTimeout(r,400));const x=S.cardXferR1103A[0];kgmXferAdminR1103A(x.id,'confirmed');await new Promise(r=>setTimeout(r,300));return {rows:[...document.querySelectorAll('.k31c-adm tbody tr')].map(t=>t.innerText.replace(/\s+/g,' ')),st:S.cardXferR1103A[0].status}});
console.log(JSON.stringify(out,null,1));console.log('ERR',errs.slice(0,6));await b.close()})();

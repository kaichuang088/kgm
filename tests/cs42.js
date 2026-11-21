// 1115A D9：地勤／空服員在航班資料頁為旅客建立案件（模擬旅客＋真的訂位）；CEO 在案件處理中心看得到、申請者寫單位
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:950}});const p=await ctx.newPage();await ctx.route(/workers\.dev/,r=>r.abort());
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,200)));
 await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
 // 有真的訂位、還沒飛的一班
 const pick=await p.evaluate(()=>{var T=todayISO(),out=null;(S.bookings||[]).some(b=>{if(!b||b.status==='cancelled'||!b.outF||!(b.paxList||[]).length)return false;var f=b.outF,d=f.date||(b.search||{}).dep;if(!d||d<T)return false;out={pnr:b.pnr,code:f.code,fr:f.fr,to:f.to,date:d,name:(b.paxList[0].lastName||'')};return true});return out});
 console.log('真的訂位：',JSON.stringify(pick));
 const go=async(user,fl)=>{await p.evaluate(([u,fl])=>{S.adminAuthed=true;S.adminUser=u;S.view='admin';S.adminTab='flightdata';if(fl){S.opsQueryR7=fl.code;S.opsDateR7=fl.date;S.opsSelectedR7=[fl.code,fl.date,fl.fr,fl.to].join('|')}else S.opsSelectedR7='';S.case7New=null;S.case115Msg='';render()},[user,fl]);
   for(let i=0;i<60;i++){await p.waitForTimeout(3000);const ok=await p.evaluate(()=>{try{render()}catch(_){}return !!S.opsSelectedR7});if(ok)break}await p.waitForTimeout(1200);
   return p.evaluate(()=>S.opsSelectedR7)};
 const g=await p.evaluate(()=>{var s=(S.staff||[]).filter(x=>x&&x.role==='ground')[0];var c=(S.staff||[]).filter(x=>x&&x.role==='cabin')[0];return {g:s&&{empId:s.empId,name:s.name,role:'ground'},c:c&&{empId:c.empId,name:c.name,role:'cabin'}}});
 console.log('帳號：',JSON.stringify(g));
 // ① 地勤：模擬旅客、行李沒送達
 const fl1=pick;
 console.log('① 地勤自己的班：',await go(g.g,null));
 console.log('① 入口：',await p.evaluate(()=>{var x=document.getElementById('k115cbar');return x?x.innerText.slice(0,80):'沒有'}));
 await p.click('#k115cbar .k115c-btn');await p.waitForTimeout(800);
 console.log('① 按鈕位置：',await p.evaluate(()=>{var b=document.querySelector('#k115cbar .k115c-btn');var r=b.getBoundingClientRect();var e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return JSON.stringify({r:[r.x|0,r.y|0,r.width|0,r.height|0],hit:e&&(e.id||e.className||e.tagName),same:e===b,count:document.querySelectorAll('#k115cbar').length})}));await p.screenshot({path:'/tmp/j/cs42_bar.png'});
 console.log('① 點了之後：',await p.evaluate(()=>JSON.stringify({nw:S.case7New&&S.case7New.flR1115A,host:!!document.getElementById('k115cm'),modals:document.querySelectorAll('.k7c-modal').length,body:document.querySelectorAll('.k7c-dlg-body').length,pick:!!document.querySelector('.k115c-pick'),tab:S.adminTab})));
 const n1=await p.evaluate(()=>document.querySelectorAll('.k115c-list button').length);console.log('① 名單按鈕：',n1,await p.evaluate(()=>(document.querySelector('.k115c-h')||{}).innerText));
 const simIdx=await p.evaluate(()=>{var L=[].slice.call(document.querySelectorAll('.k115c-list button'));var i=L.findIndex(x=>/模擬/.test(x.innerText));return i});
 const seat=await p.evaluate(i=>document.querySelectorAll('.k115c-list button')[i].querySelector('b').innerText,simIdx);
 await p.fill('.k115c-pick input',seat);await p.waitForTimeout(300);
 console.log('① 搜座位 '+seat+'：',await p.evaluate(()=>[].map.call(document.querySelectorAll('.k115c-list button'),x=>x.innerText.replace(/\n/g,' ')).join(' | ')));
 await p.click('.k115c-list button');await p.waitForTimeout(800);
 console.log('① 選了：',await p.evaluate(()=>({sim:!!(S.case7New||{}).simR1115A,pnr:(S.case7New||{}).pnr,bk:(document.querySelector('.k7c-bk')||{}).innerText,warn:(document.querySelector('.k115c-sim')||{}).innerText,who:(document.querySelector('.k115c-who')||{}).innerText})));
 await p.selectOption('.k7c-dlg select.inp >> nth=0','bag_delayed');await p.waitForTimeout(500);
 await p.fill('input[placeholder="KX 123456"]','KX 551234');await p.fill('.k7c-dlg textarea >> nth=0','旅客抵達後行李沒有送達轉盤，已完成 PIR。');
 await p.click('.k7c-dlg .btn-g');await p.waitForTimeout(800);
 const c1=await p.evaluate(()=>{var c=(S.staffCasesR1007A||[])[0];return {msg:S.case115Msg,no:c.caseNo,type:c.type,label:c.typeLabelR1101A,by:c.by,sim:c.simR1103A,email:c.email,seat:c.seatR1115A,seg:c.segment,prog:c.progress[0].label,bag:c.bag}});
 console.log('① 建立：',JSON.stringify(c1));
 await p.screenshot({path:'/tmp/j/cs42_ground.png'});
 // ② 空服員：真的訂位、座位重複／超賣（機上）
 console.log('② 空服員自己的班：',await go(g.c,null));
 console.log('② 入口：',await p.evaluate(()=>{var x=document.getElementById('k115cbar');return x?x.innerText.slice(0,60):'沒有'}),'權限 flightdata=',await p.evaluate(()=>kgmPermR123('flightdata')),'cases0831B=',await p.evaluate(()=>kgmPermR123('cases0831B')));
 await p.click('#k115cbar .k115c-btn');await p.waitForTimeout(800);
 // 空服員：模擬旅客，座位重複／超賣
 await p.evaluate(()=>document.querySelector('.k115c-list button').click());await p.waitForTimeout(600);
 await p.selectOption('.k7c-dlg select.inp >> nth=0','seat_dup');await p.waitForTimeout(400);
 await p.fill('.k7c-dlg textarea >> nth=0','登機後發現與另一位旅客座位重複，已安排改坐同艙。');
 await p.click('.k7c-dlg .btn-g');await p.waitForTimeout(800);
 console.log('② 空服員建立：',JSON.stringify(await p.evaluate(()=>{var c=(S.staffCasesR1007A||[])[0];return {msg:S.case115Msg,type:c.type,label:c.typeLabelR1101A,by:c.by,sim:!!c.simR1103A,seat:c.seatR1115A,seg:c.segment,prog:c.progress[0].label}})));
 await p.screenshot({path:'/tmp/j/cs42_cabin.png'});
 // 真的訂位（CEO 看得到所有航班）
 console.log('②b CEO 打開有真的訂位的班：',await go({name:'CEO',empId:'MASTER',role:'ceo'},fl1));
 await p.evaluate(()=>kgmCaseFlightOpenR1115A());await p.waitForTimeout(800);
 const realIdx=await p.evaluate(nm=>{var L=[].slice.call(document.querySelectorAll('.k115c-list button'));return L.findIndex(x=>!/模擬/.test(x.innerText))},pick&&pick.name);
 console.log('② 真的旅客按鈕 index：',realIdx,'預設類型',await p.evaluate(()=>S.case7New.type));
 if(realIdx>=0){await p.evaluate(i=>document.querySelectorAll('.k115c-list button')[i].click(),realIdx);await p.waitForTimeout(800);
  console.log('② 選了：',await p.evaluate(()=>({pnr:S.case7New.pnr,sim:!!S.case7New.simR1115A,pax:S.case7New.pax,seg:S.case7New.seg,bk:(document.querySelector('.k7c-bk')||{}).innerText})));
  const n0=await p.evaluate(()=>(S.notifs||[]).length);
  await p.selectOption('.k7c-dlg select.inp >> nth=0','seat_dup');await p.waitForTimeout(400);
  await p.fill('.k7c-dlg textarea >> nth=0','登機後發現與另一位旅客座位重複，已安排改坐同艙 41C。');
  await p.click('.k7c-dlg .btn-g');await p.waitForTimeout(800);
  console.log('②b 建立：',JSON.stringify(await p.evaluate(n0=>{var c=(S.staffCasesR1007A||[])[0];return {msg:S.case115Msg,no:c.caseNo,type:c.type,label:c.typeLabelR1101A,by:c.by,sim:!!c.simR1103A,email:c.email?'有':'無',pnr:c.pnr,seg:c.segment,prog:c.progress[0].label,notifs:(S.notifs||[]).length-n0}},n0)));
  await p.screenshot({path:'/tmp/j/cs42_real.png'});}
 // ③ CEO 案件處理中心
 await p.evaluate(()=>{S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.adminTab='cases0831B';S.case28Cat='other';S.caseTabR913='open';render()});await p.waitForTimeout(1500);
 console.log('③ 案件處理中心：',await p.evaluate(()=>{var t=document.body.innerText;var c=(S.staffCasesR1007A||[]).slice(0,3).map(x=>x.caseNo);return c.map(no=>no+':'+(t.indexOf(no)>=0?'有':'沒有')).join(' ')+' · 座位重複字樣:'+(t.indexOf('座位重複')>=0)+' · 行李延誤／未送達:'+(t.indexOf('行李延誤／未送達')>=0)}));
 await p.screenshot({path:'/tmp/j/cs42_ceo.png'});
 // ④ 重新整理後還在
 await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
 console.log('④ 重新整理：',JSON.stringify(await p.evaluate(()=>(S.staffCasesR1007A||[]).slice(0,3).map(c=>c.caseNo+' '+c.type+' '+(c.by||{}).role))));
 console.log('ERR',JSON.stringify(errs.filter(e=>!/寄信服務/.test(e)).slice(0,6)));await b.close()})();

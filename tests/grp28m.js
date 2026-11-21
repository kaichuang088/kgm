// 1101A ⑨⑩⑪：混艙人數（搜尋人數選單）＋類酬賓矩陣＋付款後自動拆艙＋拆出旅客填名單
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(14000);
 await p.evaluate(()=>{const u=S.users.find(u=>u&&u.email==='demo@kgm.com')||S.users.find(u=>u&&u.email);S.user=u;u.groupAccountR1025B={status:'active',type:'agency',company:'KK TRIP',taxId:'22099131',license:'交觀甲 1234',contact:{name:'王小明',phone:'0912345678',email:u.email},caseNo:'KGTEST'};S.view='home';render();kgmGrpModeR1025B(1)});
 await p.waitForTimeout(700);await p.evaluate(()=>kgmGrpPickR1101A('Q'));await p.waitForTimeout(600);
 // 搜尋人數選單：艙等分配
 const r1=await p.evaluate(async()=>{Object.assign(S.search,{type:'RT',fr:'TPE',to:'NRT',dep:addDays(todayISO(),40),ret:addDays(todayISO(),45),adults:14,children:0,infants:0});passengerCounts();S.paxPickerOpen=true;render();await new Promise(r=>setTimeout(r,500));
   var has=!!document.querySelector('.k28m-mix');kgmGrpMixR1101A('Business',4);await new Promise(r=>setTimeout(r,400));
   return {has,mix:kgmGrpMixOfR1101A(),cabin:S.search.cabin,txt:(document.querySelector('.k28m-mix')||{}).innerText}});
 await p.screenshot({path:'/tmp/j/m1.png'});
 // 矩陣頁
 const r2=await p.evaluate(async()=>{S.paxPickerOpen=false;S.outF=null;S.inbF=null;S.seats={};S.paxList=[];S.phase='sel_out';nav('booking');await new Promise(r=>setTimeout(r,2500));
   var rows=[...document.querySelectorAll('.k28m-shop .award-shop-row')].map(a=>a.innerText.replace(/\s+/g,' ').slice(0,260));
   return {shop:!!document.querySelector('.k28m-shop'),n:rows.length,rows:rows.slice(0,4),ok:document.querySelectorAll('.k28m-conf button:not([disabled])').length}});
 await p.screenshot({path:'/tmp/j/m2.png'});
 // 選去程（第一個可按的）
 await p.evaluate(()=>{const x=document.querySelector('.k28m-conf button:not([disabled])');x&&x.click()});await p.waitForTimeout(2500);
 const r3=await p.evaluate(()=>({phase:S.phase,out:S.outF&&S.outF.code,c:S.outC,warn:S.grp28RetWarn&&S.grp28RetWarn.rows.map(r=>r.code+' '+(r.mix||r.n))}));
 await p.screenshot({path:'/tmp/j/m3.png'});
 await p.evaluate(()=>{S.grp28RetWarn=null;render()});await p.waitForTimeout(1200);
 for(let k=0;k<6;k++){const en=await p.evaluate(()=>document.querySelectorAll('.k28m-conf button:not([disabled])').length);if(en)break;await p.evaluate(()=>{kgmSelectTravelDay0911('inb',addDays(S.search.ret,1))});await p.waitForTimeout(1500);await p.evaluate(()=>{S.grp28RetWarn=null;render()});await p.waitForTimeout(800)}
 await p.screenshot({path:'/tmp/j/m3b.png'});
 await p.evaluate(()=>{const x=document.querySelector('.k28m-conf button:not([disabled])');x&&x.click()});await p.waitForTimeout(2500);
 const r4=await p.evaluate(()=>({phase:S.phase,inb:S.inbF&&S.inbF.code,c:S.inbC}));
 await p.evaluate(()=>{S.grpDraftR1025B=S.grpDraftR1025B||{};S.grpDraftR1025B.name='KK 東京 混艙團';S.grpDraftR1025B.leader='林領隊'});
 console.log(JSON.stringify({r1,r2,r3,r4}));await p.screenshot({path:"/tmp/j/m4.png"});await p.locator(`button:has-text("下一步：確認訂位")`).click({timeout:5000});await p.waitForTimeout(2000);
 for(let k=0;k<4;k++){const ph=await p.evaluate(()=>S.phase);if(ph==='pay')break;
   await p.evaluate(()=>{[...document.querySelectorAll('#app input[type=checkbox]')].forEach(c=>{if(!c.checked){c.click()}})});await p.waitForTimeout(600);
   await p.evaluate(()=>{const bs=[...document.querySelectorAll('#app button')].filter(b=>b.offsetHeight&&!b.disabled&&/下一步|繼續|確認|同意|前往付款|Continue/.test(b.textContent)&&!/返回|上一步/.test(b.textContent));const x=bs[bs.length-1];if(x)x.click()});await p.waitForTimeout(2200)}
 await p.evaluate(()=>{['KGM-GC-001','KGM-CON-006','KGM-GRP-021'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});try{kgmPolicyCloseR914()}catch(e){};render()});await p.waitForTimeout(800);
 await p.evaluate(()=>{[...document.querySelectorAll('#app input[type=checkbox]')].forEach(c=>{if(!c.checked){c.click()}})});
 await p.fill('#cnum','4111111111111111').catch(()=>{});await p.fill('#ccvv','123').catch(()=>{});await p.fill('#cname','WANG XIAOMING').catch(()=>{});
 const sels=await p.$$('#app select:visible');for(const sl of sels){const opts=await sl.evaluate(e=>[...e.options].map(o=>o.value).filter(Boolean));if(opts.length>3){await sl.selectOption(opts[Math.min(5,opts.length-1)]).catch(()=>{})}}
 await p.evaluate(()=>{const b=document.getElementById('payBtn');if(b)b.click()});await p.waitForTimeout(15000);await p.screenshot({path:'/tmp/j/m5.png'});console.log('PAYMSG',await p.evaluate(()=>[...document.querySelectorAll('#app .err,#app [class*=error],#app .alert,#app .k45-msg')].filter(e=>e.offsetHeight).map(e=>e.innerText.slice(0,200)).join(' | ')));
 const r5=await p.evaluate(()=>{var g=(S.groupsR1023A||[])[0];if(!g||g.kind!=='v25')return {none:true,view:S.view,phase:S.phase};var b=S.bookings.find(x=>x.pnr===g.pnr);
   return {id:g.id,status:g.status,pax:g.pax,cabin:g.cabin,mix:g.mixDoneR1101A,moved:(g.moved||[]).map(m=>m.pnr+' '+m.cab+' '+m.code+' '+m.name),total:g.total,bal:g.balance&&g.balance.amount,fees:g.fees,msg:S.grpMsgR1025B,
     movedBk:(g.moved||[]).map(m=>{var c=S.bookings.find(x=>x.pnr===m.pnr);return c&&(c.outC+'/'+c.inbC+' seats '+JSON.stringify(c.seats))}).slice(0,2)}});
 await p.evaluate(()=>{var g=(S.groupsR1023A||[])[0];if(g){S.view='group23';S.grpViewR1023A={id:g.id};S.grp25Tab='names';render()}});await p.waitForTimeout(1500);
 const r6=await p.evaluate(()=>({ed:!!document.querySelector('.k28m-moved'),rows:document.querySelectorAll('.k28m-moved tbody tr').length,tabs:[...document.querySelectorAll('#app button')].filter(b=>/名單/.test(b.textContent)&&b.offsetHeight).map(b=>b.textContent.trim().slice(0,20)).slice(0,4)}));
 await p.screenshot({path:'/tmp/j/m6.png',fullPage:true});
 // 填拆出旅客姓名
 const r7=await p.evaluate(async()=>{var g=(S.groupsR1023A||[])[0];if(!document.getElementById('k28mvL0'))return {noEd:true};var tba0=kgmGrpMovedTbaR1101A(g);
   (g.moved||[]).forEach((m,j)=>{var L=document.getElementById('k28mvL'+j),F=document.getElementById('k28mvF'+j);if(L){L.value='LIN';F.value='BIZ'+String.fromCharCode(65+j)}});
   var mm=document.getElementById('k28mvM0');if(mm)mm.value=S.user.id;kgmGrpNamesR1025B(g.id);await new Promise(r=>setTimeout(r,800));
   var c=S.bookings.find(x=>x.pnr===g.moved[0].pnr);return {tba0,tba1:kgmGrpMovedTbaR1101A(g),p0:c.paxList[0].lastName+'/'+c.paxList[0].firstName+' '+c.paxList[0].kgmMemberR1101A,m0:g.moved[0].name,msg:S.grpMsgR1025B}});
 console.log(JSON.stringify({r1,r2,r3,r4,r5,r6,r7,errs:errs.slice(0,4)},null,1));await b.close()})();

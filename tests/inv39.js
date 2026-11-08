// 1108B 調查：付款後畫面（B1）、回程選擇畫面（B2）、行程管理頁提示（B3）；改自 names34。原 1104A：團體訂位——訂位頁名單表（性別、生日、護照、會員卡號）帶進團體名單；付款流程跟 tests/grp28m.js 一樣
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(17000);
const r1=await p.evaluate(async()=>{const u={id:'KGMN34',name:'N TEST',email:'n34@example.com',password:'x',miles:0,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMN34');S.users.push(u);S.user=u;const T=todayISO();
 u.groupAccountR1025B={status:'active',type:'agency',company:'測試旅行社',taxId:'04595257',license:'交觀甲 1234',contact:{name:'N',phone:'0912345678',email:'n34@example.com'},caseNo:'GA1',from:T,to:addDays(T,365),approvedAt:new Date().toISOString(),approvedBy:'K1',reviewR1103A:{done:true}};
 S.view='home';render();kgmGrpModeR1025B(true);const d=addDays(T,60);Object.assign(S.search,{fr:'TPE',to:'NRT',date:d,dep:d,ret:addDays(d,5),type:'RT',grpPax25:12,adults:12,children:0,grpPlanR1101A:'G',cabin:'Economy',grpMixR1101A:null});
 window.__grp28go=1;nav('booking');await new Promise(r=>setTimeout(r,1500));
 /* 1108A N2：去程改成逐艙加位 → 第一個經濟艙放得下整團的班「整團都放這艙」＋選擇此航班 */const allBtn=document.querySelector('.k38al-all');if(!allBtn)return {noSeat:true};allBtn.click();await new Promise(r=>setTimeout(r,500));const cf=[...document.querySelectorAll('.k38al-conf .btn')].find(x=>!x.disabled);if(!cf)return {noAlloc:true};cf.click();await new Promise(r=>setTimeout(r,1200));
 window.__inbTxt=(document.querySelector('#app')||{}).innerText.slice(0,3000);window.__inbPhase=S.phase;window.__modal=[...document.querySelectorAll('.modal,.k28-modal,[role=dialog]')].filter(x=>x.offsetHeight).map(x=>x.innerText.slice(0,600));
 const c2=[...document.querySelectorAll('.award-plan-btn')].find(x=>!x.disabled);if(c2)c2.click();await new Promise(r=>setTimeout(r,1200));
 const mem=S.users.find(x=>x&&/^KGM\d/.test(x.id)&&x.id!=='KGMN34');
 kgmGrpNmR1101A(0,'last','chen');kgmGrpNmR1101A(0,'first','ya-ting');kgmGrpNmR1101A(0,'gender','F');kgmGrpNmR1101A(0,'dob','1988-04-02');kgmGrpNmR1101A(0,'passport','a1234567');kgmGrpNmR1101A(0,'member',mem.id);
 kgmGrpNmR1101A(1,'last','lin');kgmGrpNmR1101A(1,'first','wei');kgmGrpNmR1101A(1,'dob','1990-12-04');
 S.grpDraftR1025B.name='北海道 7 日';render();return {phase:S.phase,out:S.outF&&S.outF.code,c:S.outC,inb:S.inbF&&S.inbF.code,mem:mem.id,table:!!document.querySelector('.k32-names')}});
console.log(JSON.stringify(r1));
await p.locator('button:has-text("下一步：確認訂位")').click({timeout:5000});await p.waitForTimeout(2000);
for(let k=0;k<4;k++){const ph=await p.evaluate(()=>S.phase);if(ph==='pay')break;
  await p.evaluate(()=>{[...document.querySelectorAll('#app input[type=checkbox]')].forEach(c=>{if(!c.checked){c.click()}})});await p.waitForTimeout(600);
  await p.evaluate(()=>{const bs=[...document.querySelectorAll('#app button')].filter(b=>b.offsetHeight&&!b.disabled&&/下一步|繼續|確認|同意|前往付款|Continue/.test(b.textContent)&&!/返回|上一步/.test(b.textContent));const x=bs[bs.length-1];if(x)x.click()});await p.waitForTimeout(2200)}
await p.evaluate(()=>{['KGM-GC-001','KGM-CON-006','KGM-GRP-021'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});try{kgmPolicyCloseR914()}catch(e){};render()});await p.waitForTimeout(800);
await p.evaluate(()=>{[...document.querySelectorAll('#app input[type=checkbox]')].forEach(c=>{if(!c.checked){c.click()}})});
await p.fill('#cnum','4111111111111111').catch(()=>{});await p.fill('#ccvv','123').catch(()=>{});await p.fill('#cname','WANG XIAOMING').catch(()=>{});
const sels=await p.$$('#app select:visible');for(const sl of sels){const opts=await sl.evaluate(e=>[...e.options].map(o=>o.value).filter(Boolean));if(opts.length>3){await sl.selectOption(opts[Math.min(5,opts.length-1)]).catch(()=>{})}}
await p.evaluate(()=>{const b=document.getElementById('payBtn');if(b)b.click()});await p.waitForTimeout(15000);
const sc=await p.evaluate(()=>({phase:S.phase,view:S.view,txt:document.querySelector('#app').innerText.slice(0,1500)}));console.log('AFTERPAY',JSON.stringify(sc));await p.screenshot({path:'/tmp/j/s39/afterpay.png'});
const inb=await p.evaluate(()=>({ph:window.__inbPhase,modal:window.__modal,txt:(window.__inbTxt||'').slice(0,1800)}));console.log('INB',JSON.stringify(inb));
await p.evaluate(()=>{nav('manage')});await p.waitForTimeout(1500);console.log('MANAGE notes',await p.evaluate(()=>document.querySelectorAll('.k38gh').length));await p.screenshot({path:'/tmp/j/s39/manage.png'});
await p.evaluate(()=>{nav('mytrip')});await p.waitForTimeout(1500);console.log('MYTRIP notes',await p.evaluate(()=>document.querySelectorAll('.k38gh').length));
const r2=await p.evaluate(async()=>{const g=(S.groupsR1023A||[]).find(x=>x&&x.userId==='KGMN34');if(!g)return {none:true,phase:S.phase,view:S.view};const bk=S.bookings.find(x=>x.pnr===g.pnr);
 S.view='group23';S.grpViewR1023A={id:g.id};S.grp25Tab='names';render();await new Promise(r=>setTimeout(r,600));
 const vals=[0,1,2].map(i=>['L','F','G','D','P','M'].map(k=>(document.getElementById('k25gN'+k+i)||{}).value));
 const rules=(document.querySelector('.k25box.rules')||{}).innerText;
 return {id:g.id,plan:g.plan,pax:g.pax,namesN:(g.names||[]).filter(x=>x&&x.last).length,n0:g.names&&g.names[0],pax0:bk&&bk.paxList.slice(0,3).map(x=>[x.lastName,x.firstName,x.gender,x.dob,x.passport,x.kgmMemberR1101A,x.groupNameTbaR1023A].join('/')),editor:vals,rules:rules&&rules.slice(0,300),menu:(()=>{S.view='home';render();return document.body.innerHTML.indexOf('我的團體訂位')>=0})()}});
console.log(JSON.stringify(r2,null,1));await p.screenshot({path:'/tmp/j/names34.png'});console.log('ERR',errs.slice(0,4));await b.close()})();

// 1108B B1：混艙團體一路付款，付款後應到團體案件頁
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(17000);
const r1=await p.evaluate(async()=>{const u={id:'KGMN38',name:'N TEST',email:'n38@example.com',password:'x',miles:0,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMN38');S.users.push(u);S.user=u;const T=todayISO();
 u.groupAccountR1025B={status:'active',type:'agency',company:'測試旅行社',taxId:'04595257',license:'交觀甲 1234',contact:{name:'N',phone:'0912345678',email:'n38@example.com'},caseNo:'GA1',from:T,to:addDays(T,365),approvedAt:new Date().toISOString(),approvedBy:'K1',reviewR1103A:{done:true}};
 S.view='home';render();kgmGrpModeR1025B(true);const d=addDays(T,60);Object.assign(S.search,{fr:'TPE',to:'NRT',date:d,dep:d,ret:addDays(d,5),type:'RT',grpPlanR1101A:'G'});
 S.paxPickerOpen=true;render();await new Promise(r=>setTimeout(r,300));const pop=(document.querySelector('.k28m-pop')||{}).innerText;kgmGrpTotR1108A(15);S.paxPickerOpen=false;render();await new Promise(r=>setTimeout(r,300));const cap=(document.querySelector('.k28m-cab')||{}).innerText;
 window.__grp28go=1;nav('booking');window.__grp28go=0;await new Promise(r=>setTimeout(r,1500));
 const rows=[...document.querySelectorAll('.award-shop-row')];const r0=rows[0];const cells=r0?[...r0.querySelectorAll('.k38al')].map(c=>c.innerText.replace(/\s+/g,' ')):[];
 /* 找一班：經濟加 10、商務加到上限 */
 const fl=sortedFlights('TPE','NRT',d);const i=fl.findIndex(f=>!f.partner);const fc=fl[i].code;
 kgmGrpAllocR1108A(i,fc,'Economy',1);for(let k=0;k<9;k++)kgmGrpAllocR1108A(i,fc,'Economy',1);
 let guard=0;while(guard++<40){const a=S.grpAllocR1108A;const before=a.m.Business;kgmGrpAllocR1108A(i,fc,'Business',1);if(S.grpAllocR1108A.m.Business===before)break}
 await new Promise(r=>setTimeout(r,300));const row=document.querySelectorAll('.award-shop-row')[i];const bizCell=[...row.querySelectorAll('.k38al')].find(c=>/商務/.test(c.innerText));
 const st1={m:Object.assign({},S.grpAllocR1108A.m),biz:bizCell&&bizCell.innerText.replace(/\s+/g,' '),conf:row.querySelector('.k38al-conf').innerText.replace(/\s+/g,' '),btnDis:row.querySelector('.k38al-conf .btn').disabled};
 /* 另一班按一下 → 分配換到那一班 */
 const j=fl.findIndex((f,k)=>k!==i&&!f.partner);let st2=null;if(j>=0){kgmGrpAllocR1108A(j,fl[j].code,'Premium',1);st2={code:S.grpAllocR1108A.code,m:Object.assign({},S.grpAllocR1108A.m)};}
 /* 回到第一班：用 set 分滿 */
 kgmGrpAllocR1108A(i,fc,'Economy','set',12);kgmGrpAllocR1108A(i,fc,'Business','set',3);
 const m3=Object.assign({},S.grpAllocR1108A.m);await new Promise(r=>setTimeout(r,200));
 const ok=!document.querySelectorAll('.award-shop-row')[i].querySelector('.k38al-conf .btn').disabled;
 kgmGrpAllocPickR1108A(i,fc);await new Promise(r=>setTimeout(r,1500));
 window.__inb=[...document.querySelectorAll('.k28m-need')].map(x=>x.innerText).slice(0,4);
 /* 1108B B2：回程跟去程同一套逐艙加位（經濟 13＋商務 2，跟去程不同） */
 const rf=sortedFlights('NRT','TPE',S.search.ret);const ri=rf.findIndex(f=>!f.partner);const rc=rf[ri].code;
 kgmGrpAllocR1108A(ri,rc,'Economy','set',13,'inb');kgmGrpAllocR1108A(ri,rc,'Business','set',2,'inb');window.__inbAlloc=JSON.stringify(S.search.grpInbR1108B||S.grpAllocInbR1108B||null);
 kgmGrpAllocPickR1108A(ri,rc,'inb');await new Promise(r=>setTimeout(r,1500));
 window.__btns=[...document.querySelectorAll('.award-plan-btn')].slice(0,8).map(x=>x.innerText.replace(/\s+/g,' ')+(x.disabled?'(dis)':''));if(S.grpDraftR1025B){S.grpDraftR1025B.name='混艙測試';render()}return {btns:window.__btns,phase:S.phase,out:S.outF&&S.outF.code,c:S.outC,inb:S.inbF&&S.inbF.code,inbC:S.inbC,mix:S.search.grpMixR1101A,need:window.__inb,inbAlloc:window.__inbAlloc}});
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
const sc=await p.evaluate(()=>({phase:S.phase,view:S.view,pnrBox:!!document.querySelector('#app')&&/Booking ref|PNR/.test(document.querySelector('#app').innerText),g:(S.groupsR1023A||[]).filter(x=>x&&x.userId==='KGMN38').map(g=>({id:g.id,st:g.status,pnr:g.pnr,mix:g.mixDoneR1101A,tot:g.total})),last:(S.bookings||[]).slice(-3).map(b=>({pnr:b.pnr,c:b.outC,grp:!!b.groupR1025B,tot:b.total})),txt:document.querySelector('#app').innerText.slice(0,500)}));
console.log('AFTERPAY',JSON.stringify(sc,null,1));await p.screenshot({path:'/tmp/j/s39/mixpay.png'});console.log('ERR',errs.slice(0,6));await b.close()})();
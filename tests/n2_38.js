// 1108A N2：團體先填總人數再搜尋；去程每班各艙「− n ＋」加位（同一班）、加到剩餘座位寫「已達上限」；分滿才可選；回程沿用艙等人數；一路付款
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
 return {pop:pop&&pop.slice(0,200),cap,cells,st1,st2,m3,ok,phase:S.phase,outF:S.outF&&S.outF.code,outC:S.outC,mix:S.search.grpMixR1101A,inbRows:document.querySelectorAll('.award-shop-row').length,inbNeed:[...document.querySelectorAll('.k28m-need')].slice(0,3).map(x=>x.innerText)}});
console.log(JSON.stringify(r1,null,1));await p.screenshot({path:'/tmp/j/n2_inb.png'});
await p.evaluate(()=>{S.phase='sel_out';render()});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/j/n2_out.png'});
console.log('ERR',errs.slice(0,4));await b.close()})();

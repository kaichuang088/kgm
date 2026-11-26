// 1108B B1–B4：去程經濟 12＋商務 3、回程逐艙加位（經濟 13＋豪經 2）一路付款 → 團體案件頁；完成頁不出 PNR；補建；行程管理不跳提示；切換團體
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
 const inb={phase:S.phase,modal:!!document.querySelector('.k28g-mask'),alCells:document.querySelectorAll('.k38al').length,txt:(document.querySelector('.k38al-conf')||{}).innerText};
 const fi=sortedFlights(S.search.to,S.search.fr,S.search.ret);let ii=-1,ic=null;
 for(let k=0;k<fi.length&&ii<0;k++){if(fi[k].partner)continue;for(const c2 of ['Premium','Business']){S.grpAllocInbR1108B=null;kgmGrpAllocR1108A(k,fi[k].code,'Economy','set',13,'inb');kgmGrpAllocR1108A(k,fi[k].code,c2,'set',2,'inb');const a=S.grpAllocInbR1108B;if(a&&a.m.Economy===13&&a.m[c2]===2){ii=k;ic=fi[k].code;break}}}
 const im=S.grpAllocInbR1108B&&Object.assign({},S.grpAllocInbR1108B.m);await new Promise(r=>setTimeout(r,200));
 kgmGrpAllocPickR1108A(ii,ic,'inb');await new Promise(r=>setTimeout(r,1500));
 if(S.grpDraftR1025B){S.grpDraftR1025B.name='混艙測試';render()}return {inb,im,inbSel:S.search.grpInbR1108B,phase:S.phase,out:S.outF&&S.outF.code,c:S.outC,inbF:S.inbF&&S.inbF.code,inbC:S.inbC,mix:S.search.grpMixR1101A}});
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
await p.waitForTimeout(4000);
const sc=await p.evaluate(()=>{const g=(S.groupsR1023A||[]).filter(x=>x&&x.userId==='KGMN38')[0];const bk=p=>(S.bookings||[]).find(b=>b.pnr===p);
 const mv=(g&&g.moved||[]).map(m=>{const c=bk(m.pnr);return [m.cab,m.cabInR1108B,c&&c.outC,c&&c.inbC,c&&c.total].join('/')});const mb=g&&bk(g.pnr);
 return {phase:S.phase,view:S.view,gv:S.grpViewR1023A,pnrOnPage:/Booking ref|訂購完成/.test(document.querySelector('#app').innerText),gid:g&&g.id,st:g&&g.status,mix:g&&g.mixDoneR1101A,moved:mv,main:mb&&[mb.outC,mb.inbC,mb.paxList.length,mb.total].join('/'),gtot:g&&g.total,bal:g&&g.balance&&g.balance.amount,msg:S.grpMsgR1025B}});
console.log('AFTERPAY',JSON.stringify(sc,null,1));await p.screenshot({path:'/tmp/j/s39/g39_after.png'});
/* B3：行程管理、我的行程不跳提示；自己查團體代號只一條 */
const b3=await p.evaluate(async()=>{const g=(S.groupsR1023A||[]).filter(x=>x&&x.userId==='KGMN38')[0];const o={};nav('manage');await new Promise(r=>setTimeout(r,900));o.manage=document.querySelectorAll('.k38gh').length;nav('mytrip');await new Promise(r=>setTimeout(r,900));o.mytrip=document.querySelectorAll('.k38gh').length;
 S.mtOnly=g.pnr;S.view='mytrip';render();await new Promise(r=>setTimeout(r,900));o.lookupMytrip=document.querySelectorAll('.k38gh').length;S.mgResult=(S.bookings||[]).find(b=>b.pnr===g.pnr);S.view='manage';render();await new Promise(r=>setTimeout(r,900));o.lookupManage=document.querySelectorAll('.k38gh').length;S.grpHideR1108A=null;return o});
console.log('B3',JSON.stringify(b3));
/* B1 補建：把團體紀錄拿掉、回到一般完成頁 → 不出 PNR、補建後到團體頁 */
const b1=await p.evaluate(async()=>{const g=(S.groupsR1023A||[]).filter(x=>x&&x.userId==='KGMN38')[0];const b=(S.bookings||[]).find(x=>x.pnr===g.pnr);
 const copy=JSON.parse(JSON.stringify(b));copy.pnr='ZZ39RC';delete copy.groupR1025B;delete copy.group;S.bookings.push(copy);S.pnr='ZZ39RC';S.view='booking';S.phase='success';render();const txt0=document.querySelector('#app').innerText.slice(0,400);
 await new Promise(r=>setTimeout(r,1800));const g2=(S.groupsR1023A||[]).find(x=>x&&x.pnr==='ZZ39RC');return {txt0,pnrShown:/ZZ39RC/.test(txt0),view:S.view,gv:S.grpViewR1023A,newG:g2&&g2.id,hist:g2&&g2.history.slice(-1)[0].act}});
console.log('B1',JSON.stringify(b1,null,1));
/* B4：切換團體 */
const b4=await p.evaluate(async()=>{const L=(S.groupsR1023A||[]).filter(x=>x&&x.userId==='KGMN38');S.view='group23';S.grpViewR1023A={id:L[0].id};render();await new Promise(r=>setTimeout(r,700));
 const sel=document.querySelector('.k39sw select');const opts=sel?[...sel.options].map(o=>o.textContent):[];const nb=[...document.querySelectorAll('.k39sw .btn')].map(b=>b.textContent+(b.disabled?'(dis)':''));
 const nx=[...document.querySelectorAll('.k39sw .btn')].find(b=>!b.disabled);if(nx)nx.click();await new Promise(r=>setTimeout(r,500));const after=S.grpViewR1023A&&S.grpViewR1023A.id;
 kgmGrpSwitchR1108B('__list');await new Promise(r=>setTimeout(r,300));return {n:L.length,opts,nb,before:L[0].id,after,list:S.grpViewR1023A}});
console.log('B4',JSON.stringify(b4,null,1));await p.screenshot({path:'/tmp/j/s39/g39_list.png'});
console.log('ERR',errs.slice(0,6));await b.close()})();
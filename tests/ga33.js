// 1103A：團體帳號申請／審核、團體票 G 規則、試用期
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(17000);
const out={};
out.fares=await p.evaluate(()=>{try{kgmGrpCodeR1025B('Economy','G')}catch(_){}return {EG:!!FARES['E-G'],plan:FARES['E-G']&&FARES['E-G'].groupPlanR1026C,cfG:changeFeeOf('E-G'),rpG:refundPolicyOf('E-G'),cfQ:changeFeeOf('E-Q'),rpQ:refundPolicyOf('E-Q'),code:kgmGrpCodeR1025B('Business','G'),plans:Object.keys(KGM_GRP_PLANS_R1026C)}});
// 前台申請
out.front=await p.evaluate(async()=>{const u={id:'KGMGA31',name:'GA TEST',email:'ga31@example.com',password:'x',miles:0,level:'Bronze',milesLog:[],nationality:'TW'};S.users=S.users.filter(x=>x.id!=='KGMGA31');S.users.push(u);S.user=u;S.view='group23';render();await new Promise(r=>setTimeout(r,500));
 const has=!!document.querySelector('.k31ga');const f=S.ga31={type:'agency',company:'環宇旅行社股份有限公司',taxId:'12345678',license:'交觀甲 1234',country:'TW',addr:'台北市中山區南京東路一段 1 號',owner:'王大明',ownerNat:'TW',contact:'GA TEST',contactNat:'TW',phone:'02-2500-0000',email:'ops@huanyu.com.tw',volume:'6-20',agree:true};
 kgmGaSubmitR1103A();const e1=S.ga31.err;
 // 正確統編（04595257 符合檢查碼）
 Object.assign(S.ga31,{type:'agency',company:'環宇旅行社股份有限公司',taxId:'04595257',license:'交觀甲 1234',country:'TW',addr:'台北市中山區南京東路一段 1 號',owner:'王大明',ownerNat:'TW',contact:'GA TEST',contactNat:'TW',phone:'02-2500-0000',email:'ops@huanyu.com.tw',volume:'6-20',agree:true,err:''});
 kgmGaSubmitR1103A();await new Promise(r=>setTimeout(r,400));
 return {formShown:has,badTax:e1,state:kgmGrpAcctStateR1026C(),acct:u.groupAccountR1025B&&{status:u.groupAccountR1025B.status,case:u.groupAccountR1025B.caseNo},page:(document.querySelector('.k31ga')||{}).innerText&&document.querySelector('.k31ga').innerText.slice(0,80)}});
await p.screenshot({path:'/tmp/j/ga33_front.png',fullPage:false});
// 審核中頁：只有一張「審核中」卡、申請摘要接在卡裡、文字是人工審核
out.pending=await p.evaluate(async()=>{S.view='group23';render();await new Promise(r=>setTimeout(r,500));const h=document.getElementById('app');const t=h.innerText;
 return {cards:(t.match(/審核中/g)||[]).length,sections:document.querySelectorAll('section.k31ga').length,dlIn:!!document.querySelector('.k25bind-c .k31ga-dl'),oldAiTxt:/AI 客服已核對/.test(t),txt:(document.querySelector('.k25bind-c')||{}).innerText}});
await p.screenshot({path:'/tmp/j/ga33_pending.png',fullPage:false});
// 前台 AI：不再自己收資料開通；舊對話停在確認步驟也只建立審核中
out.ai=await p.evaluate(async()=>{const u={id:'KGMGA34',name:'AI TEST',email:'ai34@example.com',password:'x',miles:0,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMGA34');S.users.push(u);S.user=u;S.view='home';render();
 try{kgmRestartAi0819I()}catch(_){}const inp=document.getElementById('aiInput');let reply='',c=S.aiConversation0819I;
 if(inp){inp.value='我要綁定團體帳號';kgmSendAi0819I();await new Promise(r=>setTimeout(r,400));c=S.aiConversation0819I;reply=(c.messages.filter(m=>m.role==='assistant').pop()||{}).text||''}
 const noAcct=!u.groupAccountR1025B,flow=!!(c&&c.grp25);
 // 舊對話：停在確認
 c.grp25={step:'confirm',data:{type:'agency',company:'舊流程旅行社',taxId:'04595257',license:'交觀乙 1234',contact:'AI TEST',phone:'0912345678'}};c.done=false;inp.value='確認';kgmSendAi0819I();await new Promise(r=>setTimeout(r,400));
 const r2=(S.aiConversation0819I.messages.filter(m=>m.role==='assistant').pop()||{}).text||'';const a=u.groupAccountR1025B||{};const cs=(S.staffCasesR1007A||[]).find(x=>x.caseNo===a.caseNo)||{};
 return {hasInput:!!inp,reply:reply.slice(0,120),noAcct,flow,confirmReply:r2.slice(0,90),status:a.status,to:a.to||null,approvedBy:a.approvedBy||null,state:kgmGrpAcctStateR1026C(),caseStatus:cs.status,prog:(cs.progress||[]).map(x=>x.label).join(' / ')}});
// 後台審核
out.admin=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');const gnd=S.staff.find(x=>x.role!=='ceo'&&x.role)||st;S.adminAuthed=true;S.adminUser=gnd;S.view='admin';render();
 const r1=kgmGrpApproveR1026C('KGMGA31',todayISO(),'');await new Promise(r=>setTimeout(r,300));const m=document.getElementById('k31ga-rev');
 const flags=m?[...m.querySelectorAll('.k31ga-fl span')].map(x=>x.innerText):[];const disabled0=m&&m.querySelector('.k31ga-acts .btn-g').disabled;
 ['co','lic','id','ct','tm'].forEach(k=>S.ga31Rev.ck[k]=true);render();await new Promise(r=>setTimeout(r,200));const disabled1=document.querySelector('#k31ga-rev .k31ga-acts .btn-g').disabled;
 kgmGaApproveR1103A();await new Promise(r=>setTimeout(r,300));const u=S.users.find(x=>x.id==='KGMGA31');
 return {first:r1,flags,disabled0,disabled1,status:u.groupAccountR1025B.status,trial:u.groupAccountR1025B.trialR1103A,review:u.groupAccountR1025B.reviewR1103A&&u.groupAccountR1025B.reviewR1103A.by,role:gnd.role}});
// 高風險國籍：非 CEO 不能核准
out.high=await p.evaluate(async()=>{const u2={id:'KGMGA32',name:'HR TEST',email:'hr@gmail.com',password:'x',miles:0,level:'Bronze',nationality:'TW'};S.users=S.users.filter(x=>x.id!=='KGMGA32');S.users.push(u2);
 u2.groupAccountR1025B={status:'pending',type:'agency',company:'X Travel',taxId:'04595257',license:'交觀乙 222',contact:{name:'HR',phone:'1',email:'hr@gmail.com'},caseNo:'GA1',appR1103A:{country:'TW',ownerNat:'IR',contactNat:'RU',owner:'A',addr:'x',volume:'51+'}};
 const gnd=S.staff.find(x=>x.role!=='ceo'&&x.role);S.adminUser=gnd;kgmGrpApproveR1026C('KGMGA32');['co','lic','id','ct','tm'].forEach(k=>S.ga31Rev.ck[k]=true);render();await new Promise(r=>setTimeout(r,200));
 const m=document.getElementById('k31ga-rev');const flags=[...m.querySelectorAll('.k31ga-fl span')].map(x=>x.className+':'+x.innerText);const dis=m.querySelector('.k31ga-acts .btn-g').disabled;
 S.adminUser=S.staff.find(x=>x.role==='ceo');render();await new Promise(r=>setTimeout(r,200));const dis2=document.querySelector('#k31ga-rev .k31ga-acts .btn-g').disabled;
 document.getElementById('k31ga-rr').value='登記國家與負責人國籍需補件';kgmGaRejectR1103A();return {flags,disabledNonCeo:dis,disabledCeo:dis2,afterReject:u2.groupAccountR1025B.status,why:u2.groupAccountR1025B.rejectReasonR1103A}});
await p.screenshot({path:'/tmp/j/ga33_admin.png',fullPage:false});
// 前置視窗＋試用期
out.pre=await p.evaluate(async()=>{S.adminAuthed=false;S.view='home';const u=S.users.find(x=>x.id==='KGMGA31');S.user=u;try{kgmGrpModeR1025B(true)}catch(_){}S.search.grp25=S.search.grp25||true;S.search.fr='TPE';S.search.to='NRT';S.search.date=addDays(todayISO(),60);
 S.grp28Pre=true;render();await new Promise(r=>setTimeout(r,400));const d=document.querySelector('.k28g-dlg');const txt=d?d.innerText.replace(/\s+/g,' ').slice(0,300):'NO MODAL';const btns=d?[...d.querySelectorAll('button')].map(b=>b.getAttribute('onclick')).filter(Boolean):[];
 S.search.grpPax25=55;window.alert=m=>{window.__al=m};window.__al='';kgmGrpPickR1101A('G');const al=window.__al;
 return {txt,btns,trialAlert:al}});
await p.screenshot({path:'/tmp/j/ga33_pre.png',fullPage:false});
console.log(JSON.stringify(out,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

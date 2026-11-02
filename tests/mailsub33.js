// 1103A：團體帳號 AI 受理／退回的信要有自己的主旨（不是「團體帳號已綁定」）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(16000);
console.log(JSON.stringify(await p.evaluate(async()=>{const got=[];window.kgmNotify=function(t,pl){got.push({t,subject:pl.subject,msg:String(pl.message||'').slice(0,40),built:window.kgmMailHtmlR1023A?window.kgmMailHtmlR1023A(t,pl).subject:''});return Promise.resolve({ok:true})};
 const u={id:'KGMMS33',name:'MS',email:'ms33@example.com',password:'x',miles:0,level:'Bronze'};S.users.push(u);S.user=u;S.view='home';render();try{kgmRestartAi0819I()}catch(_){}
 const c=S.aiConversation0819I;c.grp25={step:'confirm',data:{type:'agency',company:'測試旅行社',taxId:'04595257',license:'交觀乙 1234',contact:'MS',phone:'0912345678'}};c.done=false;document.getElementById('aiInput').value='確認';kgmSendAi0819I();await new Promise(r=>setTimeout(r,300));
 S.adminAuthed=true;S.adminUser=S.staff.find(x=>x.role==='ceo');S.view='admin';render();kgmGrpApproveR1026C('KGMMS33');await new Promise(r=>setTimeout(r,300));document.getElementById('k31ga-rr').value='統編與公司名稱不符';kgmGaRejectR1103A();
 const cat=(typeof KGM_MAIL_EVENTS!=='undefined'?KGM_MAIL_EVENTS:null);return {got,status:u.groupAccountR1025B.status,cat:document.documentElement.innerHTML.indexOf('團體帳號審核結果／開放期間')>=0||null}}),null,1));console.log('ERR',errs);await b.close()})();

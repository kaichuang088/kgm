// 1104A：團體搜尋——各艙 G 是否可賣（sell54）、畫面上的方案卡／售完、按鈕
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(17000);
const r=await p.evaluate(async()=>{const u={id:'KGMG34',name:'G TEST',email:'g34@example.com',password:'x',miles:0,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMG34');S.users.push(u);S.user=u;
 const T=todayISO();u.groupAccountR1025B={status:'active',type:'agency',company:'測試旅行社',taxId:'04595257',license:'交觀甲 1234',contact:{name:'G',phone:'0912345678',email:'g34@example.com'},caseNo:'GA1',from:T,to:addDays(T,365),approvedAt:new Date().toISOString(),approvedBy:'K1',reviewR1103A:{done:true}};
 S.view='home';render();try{kgmGrpModeR1025B(true)}catch(e){}
 const d=addDays(T,60);Object.assign(S.search,{fr:'TPE',to:'NRT',date:d,dep:d,ret:addDays(d,5),type:'RT',trip:'rt',grpPax25:20,adults:20,children:0,grpPlanR1101A:'G'});
 window.__grp28go=1;try{nav('booking')}catch(e){S.view='booking';render()}await new Promise(r=>setTimeout(r,1500));
 const app=document.getElementById('app');const out={view:S.view,txt:app.innerText.replace(/\s+/g,' ').slice(0,1500)};
 out.buttons=[...app.querySelectorAll('button')].map(x=>x.innerText.trim()).filter(t=>/轉機|完整|清單|售完|選擇/.test(t)).slice(0,10);
 out.sold=(app.innerText.match(/售完|Sold out/g)||[]).length;
 const fl=(typeof sortedFlights==='function'?sortedFlights('TPE','NRT',d):[]).slice(0,4);
 out.sell=fl.map(f=>{const o={code:f.code};['Economy','Premium','Business'].forEach(c=>{const g=kgmGrpCodeR1025B(c,'G');try{const r=sell54(f,d,g);o[c]=JSON.stringify(r).slice(0,120)}catch(e){o[c]='ERR '+e.message}});return o});
 out.left=[...app.querySelectorAll('.award-low')].map(x=>x.innerText).slice(0,8);out.btnTxt=[...app.querySelectorAll('.award-select')].map(x=>x.innerText).slice(0,6);
 try{kgmGrpShopPickR1101A('out',0,'Economy')}catch(e){out.pickErr=String(e)}await new Promise(r=>setTimeout(r,800));out.phase1=S.phase;
 try{kgmGrpShopPickR1101A('inb',0,'Economy')}catch(e){out.pickErr2=String(e)}await new Promise(r=>setTimeout(r,800));out.phase2=S.phase;out.view2=S.view;
 for(let k=0;k<3&&S.phase!=='pax';k++){const bt=[...document.querySelectorAll('#app button')].find(x=>/繼續|下一步|旅客資料/.test(x.innerText));if(bt){bt.click();await new Promise(r=>setTimeout(r,800))}}
 out.phase3=S.phase;out.namesTbl=!!document.querySelector('.k32-names');out.rulesTxt=(document.querySelector('.k25g-pay > div:nth-child(2)')||{}).innerText;
 const mem=S.users.find(x=>x&&x.id&&x.id!=='KGMG34'&&/^KGM\d/.test(x.id));out.mem=mem&&mem.id;
 kgmGrpNmR1101A(0,'last','chen');kgmGrpNmR1101A(0,'first','ya-ting');kgmGrpNmR1101A(0,'gender','F');kgmGrpNmR1101A(0,'dob','1988-04-02');kgmGrpNmR1101A(0,'passport','a1234567');kgmGrpNmR1101A(0,'member',mem?mem.id:'');
 kgmGrpNmR1101A(1,'last','lin');window.alert=m=>{window.__al=m};window.__al='';kgmGrpPaxNextR1025B();out.alertPartial=window.__al;
 kgmGrpNmR1101A(1,'first','wei');kgmGrpNmR1101A(1,'dob','1990-13-40');window.__al='';kgmGrpPaxNextR1025B();out.alertDob=window.__al;kgmGrpNmR1101A(1,'dob','1990-12-04');
 S.grpDraftR1025B.name='北海道 7 日';window.__al='';render();await new Promise(r=>setTimeout(r,500));out.prefill=[...document.querySelectorAll('.k32-names input')].slice(0,6).map(x=>x.value);await (async()=>{})();window.__al='';kgmGrpPaxNextR1025B();await new Promise(r=>setTimeout(r,700));out.afterNext=S.phase+' al='+window.__al;
 const g0=(S.groupsR1023A||[]).length;out.steps=[];for(let k=0;k<6&&(S.groupsR1023A||[]).length===g0;k++){out.steps.push(S.phase);const bt=[...document.querySelectorAll('#app button')].filter(x=>!x.disabled&&x.offsetParent).find(x=>/付款|確認訂位|下一步|前往付款|Pay/.test(x.innerText)&&!/返回/.test(x.innerText));if(!bt)break;out.steps.push(bt.innerText.trim().slice(0,20));bt.click();await new Promise(r=>setTimeout(r,1200))}
 if((S.groupsR1023A||[]).length===g0&&typeof doPay==='function'){try{out.steps.push('doPay');doPay()}catch(e){out.payErr=String(e).slice(0,100)}await new Promise(r=>setTimeout(r,2500))}
 const g=(S.groupsR1023A||[])[0];out.group=g&&{id:g.id,plan:g.plan,pax:g.pax,names:(g.names||[]).slice(0,2),namesN:(g.names||[]).filter(x=>x&&x.last).length};const bb=g&&S.bookings.find(x=>x.pnr===g.pnr);out.pax0=bb&&bb.paxList&&bb.paxList.slice(0,2).map(p=>[p.lastName,p.firstName,p.gender,p.dob,p.passport,p.kgmMemberR1101A].join('/'));
 S.view='home';render();await new Promise(r=>setTimeout(r,300));out.menu=document.body.innerHTML.indexOf('我的團體訂位')>=0;
 out.paxTxt=document.getElementById('app').innerText.replace(/\s+/g,' ').slice(0,1500);
 return out});
console.log(JSON.stringify(r,null,1));await p.screenshot({path:'/tmp/j/gso34.png',fullPage:true});console.log('ERR',errs.slice(0,4));await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1300}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const out=[];
 const push=(id,name,ok,info)=>{out.push({id,name,ok:!!ok,info});console.log((ok?'PASS ':'FAIL ')+id+' '+name+' :: '+info)};

 // C1b TPE-CHC 酬賓找得到（第五航權 via SYD）
 const c1=await p.evaluate(()=>{
   const D=n=>new Date(Date.now()+86400000*n).toISOString().slice(0,10);
   for(let i=70;i<180;i++){const d=D(i);
     const fs=sortedFlights('TPE','CHC',d)||[];
     if(!fs.length)continue;
     const f=fs[0],ff=Object.assign({},f,{date:d});
     const r={};['Economy','Business'].forEach(c=>{r[c]=awardStatus(f.code,d,c,1,ff).ok});
     return {d,code:f.code,via:f.via||null,r};
   }
   return null;
 });
 push('C1','TPE-CHC 第五航權酬賓找得到',c1&&(c1.r.Economy||c1.r.Business),JSON.stringify(c1));

 // M1 員工票不得線上報到（行為測試）
 const m1=await p.evaluate(()=>{
   const D=n=>new Date(Date.now()+86400000*n).toISOString().slice(0,10);
   const d=D(1);
   S.bookings=[{pnr:'STF001',userId:(S.user||{}).id,status:'confirmed',stx:{empId:'K1',plan:'ID90'},
     outF:{code:'KX180',fr:'TPE',to:'NRT',date:d,dep:new Date(Date.now()+3600000*20).toISOString().slice(11,16),arr:'11:05'},
     outC:'E-R',paxList:[{lastName:'A',firstName:'B'}]}];
   let alerted='';const _a=window.alert;window.alert=function(m){alerted=String(m)};
   try{window.kgmCheckinSegR60('STF001','out')}catch(e){alerted='THREW '+e.message}
   window.alert=_a;
   return {alerted,mode:S.pnrModeR7||''};
 });
 push('M1','員工票不得線上報到',/櫃檯|counter/i.test(m1.alerted)&&m1.mode!=='checkin',JSON.stringify(m1));

 // N1 接駁車只在行程總覽
 const n1=await p.evaluate(()=>{
   const D=n=>new Date(Date.now()+86400000*n).toISOString().slice(0,10);
   let d1='',d2='';
   for(let i=176;i<230&&!d1;i++){const x=D(i);if((sortedFlights('TPE','UKB',x)||[]).some(f=>f.code==='KX160'))d1=x}
   for(let i=185;i<240&&!d2;i++){const x=D(i);if((sortedFlights('UKB','TPE',x)||[]).some(f=>f.code==='KX159'))d2=x}
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   S.bookings=[];
   S.search={fr:'TPE',to:'UKB',dep:d1,ret:d2,type:'RT',pax:1,cabin:'Economy'};S.view='booking';
   const fo=sortedFlights('TPE','UKB',d1)||[],fi=sortedFlights('UKB','TPE',d2)||[];
   const o=fo.find(f=>f.code==='KX160'),i2=fi.find(f=>f.code==='KX159');
   pickFare('out',fo.indexOf(o),(validCodes(Object.assign({},o,{date:d1}))||[])[0],true);
   pickFare('inb',fi.indexOf(i2),(validCodes(Object.assign({},i2,{date:d2}))||[])[0],true);
   S.paxList=[{title:'MR',lastName:'K',firstName:'C',dob:'1990-01-01',nat:'TW',passport:'X1',email:'t@g',countryCode:'+886',phone:'900'}];
   S.contact={email:'t@g',phone:'900',countryCode:'+886'};S.phase='pay';render();
   ['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});
   try{kgmPolicyCloseR914()}catch(e){}
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
   set('cname','T');set('cnum','4111111111111111');set('cexp','12/30');set('ccvv','123');
   try{doPay(0,'TWD')}catch(e){}
   return {d1,d2};
 });
 await p.waitForTimeout(6000);
 const pnr=await p.evaluate(()=>((S.bookings||[])[0]||{}).pnr);
 const n1b=await p.evaluate((pnr)=>{S.mtOnly=pnr;S.mgResult=(S.bookings||[])[0];S.pnrBooking0812A=pnr;
   S.pnrModeR7='';S.view='mytrip';render();return 1},pnr);
 await p.waitForTimeout(4500);
 const ov=await p.evaluate(()=>document.querySelectorAll('.k67-panel').length);
 await p.evaluate(()=>{S.pnrModeR7='checkin';S.pnrSegR7='out';render()});
 await p.waitForTimeout(3000);
 const ci=await p.evaluate(()=>({panels:document.querySelectorAll('.k67-panel').length,
   shut:document.querySelectorAll('.ci915-shut').length,form:document.querySelectorAll('#r7Danger').length}));
 push('N1','接駁車只在行程總覽（報到頁 0）',ov>0&&ci.panels===0,'overview='+ov+' checkin='+JSON.stringify(ci));
 push('F2','報到頁在 48h 外顯示未開放',ci.shut===1&&ci.form===0,JSON.stringify(ci));

 // O1 近期旅程 → 新版行程管理
 await p.evaluate(()=>{S.profileTab='recent49';nav('profile')});
 await p.waitForTimeout(4000);
 const o1=await p.evaluate(()=>{const b2=[...document.querySelectorAll('#app button')].find(x=>/查看完整定位資料/.test(x.textContent));
   if(!b2)return {err:'no button'};b2.click();return {clicked:b2.getAttribute('onclick')}});
 await p.waitForTimeout(4500);
 const o1b=await p.evaluate(()=>({view:S.view,old:document.body.innerText.indexOf('ALL PHYSICAL SECTORS')>=0,
   neo:document.body.innerText.indexOf('MANAGE MY BOOKING')>=0}));
 push('O1','近期旅程進去是新版行程管理',!o1b.old&&o1b.neo,JSON.stringify(o1b));

 // P1 AI 選單三張一排 + 分別輸入航點 + 空位表格式
 await p.evaluate(()=>{S.view='home';render()});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>{const t=document.querySelector('#aiChat>button');if(t)t.click()});
 await p.waitForTimeout(3000);
 const p1=await p.evaluate(()=>{const w=document.getElementById('aiWindow');
   const m=w.querySelector('.kgm-i-menu');if(!m)return null;
   const cs=[...m.querySelectorAll('.kgm-i-card')].map(c=>Math.round(c.getBoundingClientRect().top));
   return {n:cs.length,sameRow:new Set(cs).size===1,tops:cs};});
 push('P1','AI 三張卡同一排',p1&&p1.n===3&&p1.sameRow,JSON.stringify(p1));

 await p.evaluate(()=>{kgmStartAi0819I('award')});
 await p.waitForTimeout(2000);
 const d30=await p.evaluate(()=>new Date(Date.now()+86400000*30).toISOString().slice(0,10));
 await p.evaluate((d)=>kgmAiChoose0819I('date',d),d30);
 await p.waitForTimeout(2000);
 const p2=await p.evaluate(()=>{const w=document.getElementById('aiWindow');
   return {ids:[...w.querySelectorAll('input')].map(i=>i.id),
     txt:(w.querySelector('.kgm-i-prompt')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,60)}});
 push('P2','AI 分別輸入航點（先出發地）',p2.ids.includes('k920fFrom'),JSON.stringify(p2));

 await p.evaluate(()=>{kgmAiRoutePickR920F('fr','TPE')});
 await p.waitForTimeout(1200);
 await p.evaluate(()=>{kgmAiRoutePickR920F('to','KIX')});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>kgmAiChoose0819I('seats',1));
 await p.waitForTimeout(1200);
 await p.evaluate(()=>kgmAiChoose0819I('cabin','Business'));
 await p.waitForTimeout(4500);
 const p3=await p.evaluate(()=>{const w=document.getElementById('aiWindow');
   const bs=[...w.querySelectorAll('.kgm-i-bubble')];
   return {bubbles:bs.length,wd:w.querySelectorAll('.k63-wd').length,sym:w.querySelectorAll('[data-k63s]').length,
     foot:w.querySelectorAll('.k63-foot').length,list:w.querySelectorAll('.k920f-list').length,
     city:(w.querySelector('.k920f-city b')||{innerText:''}).innerText};});
 push('P3','空位表＝參考圖格式＋清單另一個泡泡',p3.wd===7&&p3.foot===2&&p3.list===1&&/台北|TPE/.test(p3.city),JSON.stringify(p3));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',errs.filter(e=>!/寄信/.test(e)).slice(0,5));
 await b.close();})();

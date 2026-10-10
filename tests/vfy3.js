const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1300}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const out=[];const push=(id,n,ok,i)=>{out.push({id,ok:!!ok});console.log((ok?'PASS ':'FAIL ')+id+' '+n+' :: '+i)};

 // 先建一筆一般訂位
 await p.evaluate(()=>{
   const d=new Date(Date.now()+86400000*25).toISOString().slice(0,10);
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   S.bookings=[];S.stx=null;
   S.search={fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1,cabin:'Economy'};S.view='booking';
   const fs=sortedFlights('TPE','NRT',d)||[];
   pickFare('out',0,(validCodes(Object.assign({},fs[0],{date:d}))||[])[0],true);
   S.paxList=[{title:'MR',lastName:'T',firstName:'B',dob:'1990-01-01',nat:'TW',passport:'X1',email:'t@g',countryCode:'+886',phone:'900'}];
   S.contact={email:'t@g',phone:'900',countryCode:'+886'};S.phase='pay';render();
   ['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});
   try{kgmPolicyCloseR914()}catch(e){}
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
   set('cname','T');set('cnum','4111111111111111');set('cexp','12/30');set('ccvv','123');
   try{doPay(0,'TWD')}catch(e){}
 });
 await p.waitForTimeout(6000);
 const pnr=await p.evaluate(()=>((S.bookings||[])[0]||{}).pnr);
 console.log('PNR',pnr);

 // Q1 定位管理：不寫改票費、只有客服/地勤兩顆鈕
 await p.evaluate((pnr)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};
   S.view='admin';S.adminTab='bookings';S.bookingSearch0819J=pnr;render();
   ['identity','contact','itinerary'].forEach(k=>kgmVerify0819J(k,true));kgmCabIdentR82('agent')},pnr);
 await p.waitForTimeout(4000);
 const q1=await p.evaluate(()=>{const s=document.querySelector('.k82-ident'),m=document.querySelector('.p-admin-main')||document.body;
   return {strip:s?s.innerText.replace(/\s+/g,' '):null,fee:(m.innerText.match(/改票手續費/g)||[]).length}});
 push('Q1','定位管理不顯示改票費',q1.fee===0&&/客服/.test(q1.strip||'')&&/地勤/.test(q1.strip||''),JSON.stringify(q1));

 // Q2 改票確認頁
 await p.evaluate((pnr)=>{kgmOpenCabin0819J(pnr)},pnr);
 await p.waitForTimeout(3000);
 await p.evaluate(()=>{kgmCabSegR82('out');
   kgmCabDateR82(new Date(Date.now()+86400000*40).toISOString().slice(0,10))});
 await p.waitForTimeout(2200);
 await p.evaluate(()=>{const sels=[...document.querySelectorAll('.k82-bar select')];
   const f=sels.find(s=>[...s.options].some(o=>/^KX/.test(o.value)));
   if(f)kgmCabFlightR82(f.options[1]?f.options[1].value:f.options[0].value)});
 await p.waitForTimeout(1800);
 await p.evaluate(()=>{const sels=[...document.querySelectorAll('.k82-bar select')];
   const c=sels[sels.length-1];const ok=[...c.options].filter(o=>o.value&&!o.disabled);
   if(ok.length)kgmCabFareR82(ok[0].value)});
 await p.waitForTimeout(1800);
 await p.evaluate(()=>{try{kgmPolicySetAgreedR914('KGM-CHG-003',true)}catch(e){}
   const bt=[...document.querySelectorAll('.k82-acts .k82-go')][0];if(bt)bt.click()});
 await p.waitForTimeout(4500);
 const q2=await p.evaluate(()=>{const d=document.querySelector('.k82-done');
   return {exists:!!d,txt:d?d.innerText.replace(/\s+/g,' ').slice(0,200):null}});
 push('Q2','改票完成有漂亮確認頁',q2.exists&&/改票完成/.test(q2.txt||''),JSON.stringify(q2).slice(0,220));

 // R1 後台分頁切換速度
 const r1=await p.evaluate(async()=>{
   const tabs=['status','flightdata','groundops','bookings','members','sched','fleetsched','auctions','cases0831C'];
   const ms=[];
   for(const t of tabs){const t0=performance.now();S.adminTab=t;render();ms.push({t,ms:Math.round(performance.now()-t0)});
     await new Promise(r=>setTimeout(r,120));}
   return ms;
 });
 push('R1','後台分頁切換 < 3s',r1.every(x=>x.ms<3000),JSON.stringify(r1));

 // R2 groundops 不閃兩下
 await p.evaluate(()=>{S.adminTab='status';render()});
 await p.waitForTimeout(3000);
 await p.evaluate(()=>{window.__n=0;const _r=window.render;window.render=function(){window.__n++;return _r.apply(this,arguments)};try{render=window.render}catch(e){}});
 await p.evaluate(()=>{S.adminTab='groundops';render()});
 await p.waitForTimeout(6000);
 const r2=await p.evaluate(()=>window.__n);
 push('R2','groundops 進去只 render 一次',r2===1,'renders='+r2);

 // S1 航班資料：mock 報到 + 配重
 /* 0921B：改成挑「今天已經起飛」的那一班來驗。模擬報到本來就只在
    起飛前 2.5 小時才開始長，固定挑 KX20 會隨測試當下的時鐘時好時壞。 */
 const s1=await p.evaluate(()=>{
   const d=new Date().toISOString().slice(0,10);
   const cand=[].concat(FLIGHTS,S.customFlights||[])
     .filter(f=>f&&!f.via&&!f.partner&&f.fr==='TPE')
     .map(f=>({code:f.code,h:window.kgmHoursToDepR920B(f,d)}))
     .filter(x=>isFinite(x.h)&&x.h<-0.6&&x.h>-14)
     .sort((a,b)=>b.h-a.h)[0];
   S.adminTab='flightdata';S.opsQueryR7=(cand?cand.code:'KX20');
   S.opsDateR7=d;S.opsSelectedR7='';render();
   return cand?cand.code+' h='+Math.round(cand.h*10)/10:'none';});
 await p.waitForTimeout(6000);
 const s1b=await p.evaluate(()=>{
   const rows=[...document.querySelectorAll('.r7-manifest tbody tr')].filter(tr=>tr.querySelector('input[type=checkbox]'));
   const ci=rows.filter(tr=>{const c=tr.querySelectorAll('input[type=checkbox]');return c[0]&&c[0].checked}).length;
   const lb=document.querySelector('.r7-loadbal');
   return {pax:rows.length,ci,lb:!!lb,idx:(lb?lb.innerText.match(/建議裝載指數\s*([\d.]+)%/):null)};});
 push('S1','航班資料有 mock 報到資料',s1b.pax>0&&s1b.ci>s1b.pax*0.8,'flight='+s1+' pax='+s1b.pax+' ci='+s1b.ci);
 push('S2','航班資料有行李配重與建議指數',s1b.lb&&!!s1b.idx,JSON.stringify(s1b.idx));

 // T1 競標管理分頁 + BigDeal 已搬走
 await p.evaluate(()=>{S.adminTab='auctions';render()});
 await p.waitForTimeout(3500);
 const t1=await p.evaluate(()=>{const m=document.querySelector('.p-admin-main')||document.body;
   return {txt:m.innerText.replace(/\s+/g,' ').slice(0,200)}});
 await p.evaluate(()=>{S.adminTab='members';render()});
 await p.waitForTimeout(3000);
 const t1b=await p.evaluate(()=>{const m=document.querySelector('.p-admin-main')||document.body;
   return (m.innerText.match(/Big\s*Deal/gi)||[]).length});
 push('T1','競標管理分頁在，BigDeal 已從會員管理移走',/競標/.test(t1.txt)&&t1b===0,t1.txt.slice(0,80)+' | membersBigDeal='+t1b);

 // T2 AI 對話查詢獨立分頁
 await p.evaluate(()=>{S.adminTab='cases0831C';render()});
 await p.waitForTimeout(3000);
 const t2=await p.evaluate(()=>{const m=document.querySelector('.p-admin-main')||document.body;
   const navHas=[...document.querySelectorAll('aside button,[class*=admin-nav] button')].some(b=>/AI 對話查詢/.test(b.textContent||''));
   return {navHas,txt:m.innerText.replace(/\s+/g,' ').slice(0,90)}});
 push('T2','AI 對話查詢是獨立分頁',t2.navHas,JSON.stringify(t2));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',errs.filter(e=>!/寄信/.test(e)).slice(0,5));
 console.log('DLG',JSON.stringify(dlg.slice(0,4)));
 await b.close();})();

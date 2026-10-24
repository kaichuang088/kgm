const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1300}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const out=[];const push=(id,n,ok,i)=>{out.push({id,ok:!!ok});console.log((ok?'PASS ':'FAIL ')+id+' '+n+' :: '+String(i).slice(0,220))};

 // Z1 員工票完成頁不變白
 await p.evaluate(()=>{
   const d=new Date(Date.now()+86400000*25).toISOString().slice(0,10);
   const emp=(S.staff||[]).find(x=>x&&x.active!==false&&x.empId);
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   S.bookings=[];S.staffTix=[];
   S.search={fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1,cabin:'Economy'};S.view='booking';
   const fs=sortedFlights('TPE','NRT',d)||[];
   pickFare('out',0,(validCodes(Object.assign({},fs[0],{date:d}))||[])[0],true);
   S.paxList=[{title:'MR',lastName:'S',firstName:'T',dob:'1990-01-01',nat:'TW',passport:'X1',email:'t@g',countryCode:'+886',phone:'900'}];
   S.contact={email:'t@g',phone:'900',countryCode:'+886'};
   S.stx={empId:emp.empId,name:emp.name,plan:'ID90',fam:[],withFam:false,staffGateCompleteK5:true,who:'self'};
   try{const cabs=staffCabins0911(Object.assign({},S.outF,{date:d}))||[];
     S.outF.staffPreferences=[cabs[0],cabs[1]||cabs[0]];
     S.stx.selections={out:{flightKey:staffFlightKey0911(Object.assign({},S.outF,{date:d})),preferredCabins:S.outF.staffPreferences}};
   }catch(e){}
   S.stxConfirmVerified=true;S.staffVerifiedR10=true;S.promoCode=emp.empId;
   S.phase='pay';render();
   ['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});
   try{kgmPolicyCloseR914()}catch(e){}
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
   set('cname','T');set('cnum','4111111111111111');set('cexp','12/30');set('ccvv','123');
   try{doPay(0,'TWD')}catch(e){}
 });
 await p.waitForTimeout(6500);
 const z1=await p.evaluate(()=>{const a=document.getElementById('app');
   return {phase:S.phase,pnr:S.pnr,len:a.innerText.trim().length,
     gate:document.querySelectorAll('.k55-staffgate').length,
     hidden:document.querySelectorAll('[data-k55hidden]').length,
     hasPnr:a.innerText.indexOf(String(S.pnr||'zzz'))>=0}});
 push('Z1','員工票完成頁看得到 PNR（不變白）',z1.len>800&&z1.gate===0&&z1.hidden===0&&z1.hasPnr,JSON.stringify(z1));

 // Z2 員工票身分驗證頁仍然在該擋的階段擋
 const z2=await p.evaluate(()=>{
   const emp=(S.staff||[]).find(x=>x&&x.active!==false&&x.empId);
   S.bookings=[];S.stx=null;S.pnr='';S.promoCode=emp.empId;
   const r={};
   ['sel_out','pax','confirm','pay','success'].forEach(ph=>{S.phase=ph;S.view='booking';render();
     r[ph]={gate:document.querySelectorAll('.k55-staffgate').length,hidden:document.querySelectorAll('[data-k55hidden]').length}});
   return r;});
 push('Z2','驗證頁：訂位階段擋、付款與完成不擋',
   z2.sel_out.gate===1&&z2.confirm.gate===1&&z2.pay.gate===0&&z2.success.gate===0,JSON.stringify(z2));

 // Z3 後台員工票只看得到自己的（CEO 可查別人）
 const z3=await p.evaluate(()=>{
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};
   S.view='admin';S.adminTab='stafftix';render();
   const ceo=(document.querySelector('.p-admin-main')||document.body).innerText.length;
   return {ceo,fn:typeof window.kgmStaffSubmitGuardR920C};});
 push('Z3','後台員工票分頁可用',z3.ceo>200,JSON.stringify(z3));

 // AA1 里程促銷到萬聖節
 const aa1=await p.evaluate(()=>{
   const t=[];
   try{S.view='miles_page';S.milesTab='buymiles';render()}catch(e){}
   const a=document.getElementById('app').innerText||'';
   const m=a.match(/萬聖節|10-31|2026-10-31|Halloween/g)||[];
   return {hits:m.length,near:(a.match(/[^\n]{0,40}(萬聖節|Halloween)[^\n]{0,40}/)||[''])[0]};
 });
 push('AA1','里程促銷寫到萬聖節',aa1.hits>0,JSON.stringify(aa1));

 // AB1 酬賓「已兌換 N 哩」標籤機制
 const ab1=await p.evaluate(()=>({fn:typeof window.kgmAwardRedeemedR920B}));
 push('AB1','酬賓已兌換哩程標籤函式在',ab1.fn==='function',JSON.stringify(ab1));

 // AC1 行程管理：辦理登機在 48h 內可用
 const ac1=await p.evaluate(()=>{
   const d=new Date(Date.now()+3600000*44).toISOString().slice(0,10);
   const hh=new Date(Date.now()+3600000*44).toISOString().slice(11,16);
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;
   S.bookings=[{pnr:'NEAR01',userId:u.id,status:'confirmed',
     outF:{code:'KX180',fr:'TPE',to:'NRT',date:d,dep:hh,arr:'11:05'},outC:'E-R',
     paxList:[{lastName:'A',firstName:'B',nat:'TW',passport:'X1',dob:'1990-01-01'}]}];
   let alerted='';const _a=window.alert;window.alert=function(m){alerted=String(m)};
   try{window.kgmCheckinSegR60('NEAR01','out')}catch(e){alerted='THREW '+e.message}
   window.alert=_a;
   return {alerted,mode:S.pnrModeR7||''};
 });
 await p.waitForTimeout(2500);
 const ac1b=await p.evaluate(()=>({shut:document.querySelectorAll('.ci915-shut').length,
   form:document.querySelectorAll('#r7Danger').length}));
 push('AC1','48 小時內報到打得開',ac1.mode==='checkin'&&ac1b.form===1&&ac1b.shut===0,JSON.stringify(ac1)+JSON.stringify(ac1b));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',errs.filter(e=>!/寄信/.test(e)).slice(0,5));
 console.log('DLG',JSON.stringify(dlg.slice(0,4)));
 await b.close();})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await (await b.newContext({viewport:{width:1440,height:1100}})).newPage();
 const dlg=[];p.on('dialog',async d=>{dlg.push(d.type()+':'+d.message().slice(0,260));await d.accept()});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(15000);
 const st=(tag)=>p.evaluate((tag)=>{
   const m=document.querySelector('[class*="k161"]');
   return {tag,phase:S.phase,view:S.view,outF:S.outF&&S.outF.code,outC:S.outC,inbF:S.inbF&&S.inbF.code,inbC:S.inbC,cab:S.search.cabin,notice:S.cabinResetNoticeR41||'',
   modal:S.resModalR161?JSON.stringify(S.resModalR161).slice(0,200):null,
   modalBtns:m?[...m.querySelectorAll('[onclick]')].map(e=>(e.textContent||'').trim().slice(0,22)+'::'+e.getAttribute('onclick').slice(0,70)).slice(0,14):[],
   modalTxt:m?m.innerText.slice(0,600):'',
   appHead:(document.querySelector('#app h1,#app h2')||{}).textContent||'',
   price:((document.getElementById('app').innerText.match(/票價\s*(NT\$|TWD)\s?[\d,]{4,}/g))||[]).slice(0,3),
   bids:(S.residenceBidsR83||[]).filter(x=>x.userId===(S.user||{}).id).map(x=>x.code+' '+x.date+' '+x.amount+' '+x.alt+' '+x.status)}},tag);
 await p.evaluate(()=>{
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911')||(S.users||[])[0];S.user=u;
   S.search=Object.assign(S.search||{},{fr:'TPE',to:'LAX',dep:'2026-10-25',ret:'2026-11-01',type:'RT',cabin:'First',adults:1,children:0,infants:0,pax:1,useMiles:false});
   S.phase='sel_out';S.view='booking';S.outF=null;S.inbF=null;S.outC=null;S.inbC=null;render();
 });
 await p.waitForTimeout(800);
 await p.evaluate(()=>{const e=[...document.querySelectorAll('#app [onclick]')].find(x=>/openResidentFromRowR39/.test(x.getAttribute('onclick')));e&&e.click()});
 await p.waitForTimeout(900);
 await p.evaluate(()=>kgmResModalStepR161(2));await p.waitForTimeout(900);
 console.log('OPTS',JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#k161alt option')].map(o=>o.value+'='+o.textContent))));
 await p.evaluate(()=>{document.getElementById('k161amt').value='480000';const s=document.getElementById('k161alt');s.value=[...s.options].find(o=>/商務/.test(o.textContent)).value;s.dispatchEvent(new Event('change',{bubbles:true}))});
 await p.waitForTimeout(700);
 console.log('ALTBOX',JSON.stringify(await p.evaluate(()=>(document.querySelector('.k182-alt')||{}).innerText||'')));
 await p.evaluate(()=>kgmResCashSubmitR161());await p.waitForTimeout(1200);
 console.log(JSON.stringify(await st('afterSubmit'),null,1));
 await p.screenshot({path:'/tmp/j/res_m3.png'});
 // step3 buttons: click the primary action
 const s3=await p.evaluate(()=>{const m=document.querySelector('[class*="k161"]');return m?[...m.querySelectorAll('button')].map(b=>b.textContent.trim()+'::'+(b.getAttribute('onclick')||'')):[]});
 console.log('S3BTNS',JSON.stringify(s3));
 await p.screenshot({path:'/tmp/j/res8_step2.png'});
 // go to inbound segment
 await p.evaluate(()=>{const m=document.querySelector('[class*="k161"]');const b=[...m.querySelectorAll('button')].find(x=>/kgmResNextSegR161/.test(x.getAttribute('onclick')||''));b&&b.click()});
 await p.waitForTimeout(900);
 console.log(JSON.stringify(await st('afterNextSeg'),null,1));
 await p.evaluate(()=>kgmResModalStepR161(2));await p.waitForTimeout(800);
 await p.evaluate(()=>{document.getElementById('k161amt').value='450000';const s=document.getElementById('k161alt');s.value='refund';s.dispatchEvent(new Event('change',{bubbles:true}))});
 await p.waitForTimeout(500);
 await p.evaluate(()=>kgmResCashSubmitR161());await p.waitForTimeout(1200);
 console.log(JSON.stringify(await st('afterInbSubmit'),null,1));
 console.log('ALTBOX_IN',JSON.stringify(await p.evaluate(()=>(document.querySelector('.k161-none')||{}).innerText||'')));
 await p.evaluate(()=>{let v=S.inbF;window.__trap=[];Object.defineProperty(S,'inbF',{configurable:true,get(){return v},set(x){if(!x)window.__trap.push(new Error().stack.split('\n').slice(1,7).join(' | '));v=x}})});
 await p.evaluate(()=>{const m=document.querySelector('[class*="k161"]');const b=[...m.querySelectorAll('button')].find(x=>/kgmResFinishR161/.test(x.getAttribute('onclick')||''));b&&b.click()});
 await p.waitForTimeout(1500);
 console.log(JSON.stringify(await st('afterFinish'),null,1));
 console.log('TRAP',JSON.stringify(await p.evaluate(()=>window.__trap),null,1));
 console.log('JP',JSON.stringify(await p.evaluate(()=>{try{const q=journeyPrice();return {q:JSON.stringify(q).slice(0,400),bk:owPrice(S.outF,S.outC,1),rr:owPrice(S.inbF,S.inbC,1)}}catch(e){return String(e)}})));
 await p.evaluate(()=>{
   S.paxList=[{title:'MR',lastName:'TEST',firstName:'RES',dob:'1990-01-01',nat:'TW',passport:'X1234567',email:'t@g',countryCode:'+886',phone:'900000000'}];
   S.contact={email:'t@g',phone:'900000000',countryCode:'+886'};S.phase='pay';render();
   ['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});try{kgmPolicyCloseR914()}catch(e){}
 });
 await p.waitForTimeout(1200);
 await p.screenshot({path:'/tmp/j/res9_pay.png',fullPage:true});
 console.log('PAYTXT',JSON.stringify(await p.evaluate(()=>document.getElementById('app').innerText.slice(0,2500))));
 const nb0=await p.evaluate(()=>(S.bookings||[]).length);
 await p.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
   set('cname','T');set('cnum','4111111111114242');set('cexp','12/30');set('ccvv','123');
   const b=document.getElementById('payBtn');if(b)b.click();else doPay(0,'TWD')});
 await p.waitForTimeout(9000);
 console.log('AFTERPAY',JSON.stringify(await p.evaluate((nb0)=>{const bk=S.bookings[S.bookings.length-1];return {nb0,nb:S.bookings.length,pnr:bk&&bk.pnr,segs:bk&&[bk.outF&&bk.outF.code,bk.outC,bk.inbF&&bk.inbF.code,bk.inbC],total:bk&&(bk.total||bk.amount),resBids:bk&&bk.resBidsR923,seg:S.resBidSegR923,bids:(S.residenceBidsR83||[]).slice(0,2).map(x=>({id:x.id,alt:x.alt,amt:x.amount,c4:x.cardLast4R923,pnr:x.pnr,paid:x.paidWithBookingR923}))}},nb0)));
 console.log('SETTLE',JSON.stringify(await p.evaluate(()=>{const a=kgmResSettleR161('KX4','2026-10-25'),b2=kgmResSettleR161('KX3','2026-11-01');const bk=S.bookings[S.bookings.length-1];
  return {a:a.by+' '+(a.winner&&a.winner.id),b:b2.by+' '+(b2.winner&&b2.winner.id),total:bk.total,outC:bk.outC,inbC:bk.inbC,cx:bk.cancelledSegsR60,ch:bk.resChargesR923,bids:(S.residenceBidsR83||[]).filter(x=>x.pnr===bk.pnr).map(x=>x.id+' '+x.status+' '+x.chargedDiffR923+' '+x.refundedR923)}})));
 console.log('APPTXT',JSON.stringify(await p.evaluate(()=>document.getElementById('app').innerText.slice(0,1500))));
 console.log('TOTAL',JSON.stringify(await p.evaluate(()=>{try{return {tot:typeof total==='function'?total():null,ob:S.outC,ib:S.inbC}}catch(e){return String(e)}})));
 await p.screenshot({path:'/tmp/j/res8_final.png',fullPage:false});
 console.log('ERR',JSON.stringify(errs.slice(0,3)),'\nDLG',JSON.stringify(dlg,null,1));
 await b.close();})();

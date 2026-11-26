// 1121A：vfy5d Z2 的綁定版（R5 起只有連動的會員帳號能訂員工票；沒連動的人輸入員工編號會被清掉）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1300}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const run=async(linked)=>p.evaluate((linked)=>{
   const emp=(S.staff||[]).find(x=>x&&x.active!==false&&x.empId);
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911')||(S.users||[])[0];S.user=u;
   S.staffLinkR1010A=S.staffLinkR1010A||{};Object.keys(S.staffLinkR1010A).forEach(k=>{if(S.staffLinkR1010A[k]&&S.staffLinkR1010A[k].userId===u.id)delete S.staffLinkR1010A[k]});
   if(linked)S.staffLinkR1010A[emp.empId]={userId:u.id,at:new Date().toISOString(),by:'test'};
   S.bookings=[];S.stx=null;S.pnr='';S.promoCode=emp.empId;
   const r={};
   ['sel_out','pax','confirm','pay','success'].forEach(ph=>{S.phase=ph;S.view='booking';render();
     r[ph]={gate:document.querySelectorAll('.k55-staffgate').length,promo:S.promoCode}});
   return r;},linked);
 const a=await run(true);
 const okA=a.sel_out.gate===1&&a.confirm.gate===1&&a.pay.gate===0&&a.success.gate===0;
 console.log((okA?'PASS':'FAIL')+' Z2L 連動帳號：訂位階段擋、付款與完成不擋 :: '+JSON.stringify(a));
 await p.waitForTimeout(500);
 const n=await run(false);await p.waitForTimeout(800);
 const okN=n.pax.gate===0&&n.confirm.gate===0&&!n.success.promo&&dlg.some(x=>/不再用優惠碼|no longer use promo/.test(x));
 console.log((okN?'PASS':'FAIL')+' Z2N 沒連動：員工編號被清掉＋提示 :: '+JSON.stringify(n)+' dlg='+JSON.stringify(dlg.slice(-1)));
 /* reg2 kgmAuditR130：舊規則「首頁貼員編當優惠碼 → render 後還在」；R5 起只有連動帳號才保留 */
 const r130=await p.evaluate(()=>{const o={};
   const id=((S.staff||[]).filter(x=>x&&x.role==='ground')[0]||{}).empId;
   const u=S.user;S.staffLinkR1010A=S.staffLinkR1010A||{};
   Object.keys(S.staffLinkR1010A).forEach(k=>{if(S.staffLinkR1010A[k]&&S.staffLinkR1010A[k].userId===u.id)delete S.staffLinkR1010A[k]});
   o.unlinked=window.kgmAuditR130();
   S.staffLinkR1010A[id]={userId:u.id,at:new Date().toISOString(),by:'test'};
   o.linked=window.kgmAuditR130();delete S.staffLinkR1010A[id];return o});
 console.log('R130 unlinked ok='+r130.unlinked.ok+' after='+r130.unlinked.afterRender+' | linked ok='+r130.linked.ok+' after='+r130.linked.afterRender);
 console.log('ERR',JSON.stringify(errs));await b.close();})();

// 1101A F：後台開著時案件持續模擬（客服往下處理一步、約每 3 次進一件新案件；退款類送 CEO 不自己結案）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='cases0831B';render();await new Promise(r=>setTimeout(r,1500));
  var L=S.staffCasesR1007A||[];var n0=L.length;var sims=L.filter(c=>c&&(c.simR1022A||c.simR1101A)&&c.status!=='closed'&&c.status!=='ceo_review');
  sims.forEach(c=>{c.updatedAt=new Date(Date.now()-3600e3).toISOString()});window.KGM_LAST_INPUT_R1025B=0;try{document.activeElement&&document.activeElement.blur()}catch(_){}
  var KEYS=Object.keys(L[0]||{}).join(',');var K=c=>c.caseNo||c.caseId||c.no||c.id;var before=sims.slice(0,6).map(c=>K(c)+' '+c.type+' '+c.status);var log=[];
  for(var i=0;i<6;i++){var o=(S.staffCasesR1007A||[]).filter(c=>c&&(c.simR1022A||c.simR1101A)&&c.status!=='closed'&&c.status!=='ceo_review').sort((x,y)=>String(x.updatedAt).localeCompare(String(y.updatedAt)))[0];var id=o&&K(o),st=o&&o.status;
    kgmCaseSimTickR1101A();var c=(S.staffCasesR1007A||[]).find(x=>K(x)===id);log.push(id+' '+(c&&c.type)+' '+st+'→'+(c&&c.status)+' | '+((c&&c.progress||[]).slice(-1)[0]||{}).label);
    (S.staffCasesR1007A||[]).forEach(c=>{if(c&&c.simR1101A&&c.status==='received')c.updatedAt=new Date(Date.now()-3600e3).toISOString()})}
  var n1=(S.staffCasesR1007A||[]).length,nw=(S.staffCasesR1007A||[]).filter(c=>c&&c.simR1101A).slice(0,3).map(c=>K(c)+' '+c.type+' '+c.status+' '+c.createdAt);
  var refundClosedBySim=(S.staffCasesR1007A||[]).filter(c=>c&&/refund/.test(c.type||'')&&c.status==='closed'&&(c.progress||[]).some(p=>/模擬/.test(p.by||''))).length;
  return {KEYS,n0,n1,before,log,nw,refundClosedBySim,shown:document.querySelectorAll('#app [class*=case]').length}});
console.log(JSON.stringify({r,errs:errs.slice(0,3)},null,1));await b.close()})();

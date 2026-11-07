// 1108A G3：前置視窗按「申請包機」「申請自創航班」→ 要直接出現申請表（不能只是跳到我的團體訂位）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file://'+(process.argv[2]||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const out=[];
for(const how of ['charter','custom']){for(const prevOpen of [false,true]){
 const r=await p.evaluate(async([how,prevOpen])=>{const u={id:'KGMN38',name:'N TEST',email:'n38@example.com',password:'x',miles:0,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMN38');S.users.push(u);S.user=u;const T=todayISO();
  u.groupAccountR1025B={status:'active',type:'agency',company:'測試旅行社',taxId:'04595257',license:'交觀甲 1234',contact:{name:'N',phone:'0912345678',email:'n38@example.com'},caseNo:'GA1',from:T,to:addDays(T,365),approvedAt:new Date().toISOString(),approvedBy:'K1',reviewR1103A:{done:true}};
  S.k27cr=null;S.grpViewR1023A=prevOpen?{id:'GRPX'}:null;   /* 之前在看某一團 */
  S.view='home';render();kgmGrpModeR1025B(true);nav('booking');await new Promise(r=>setTimeout(r,800));
  const pre=!!document.querySelector('.k28g-dlg');const btn=[...document.querySelectorAll('.k28g-how button')].find(x=>new RegExp(how==='charter'?'申請包機':'申請自創').test(x.textContent));if(btn)btn.click();await new Promise(r=>setTimeout(r,900));
  const f=document.getElementById('k27cr-form');const rc=f?f.getBoundingClientRect():null;
  return {how,prevOpen,pre,btn:!!btn,view:S.view,grpView:S.grpViewR1023A,form:!!f,title:f?(f.querySelector('h2')||{}).textContent:null,top:rc?Math.round(rc.top):null,kind:S.k27cr&&S.k27cr.kind}},[how,prevOpen]);
 out.push(r);await p.screenshot({path:'/tmp/j/g3_'+how+(prevOpen?'_p':'')+'.png'})}}
console.log(JSON.stringify(out,null,1));console.log('ERR',errs.slice(0,4));await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/'+process.argv[2],{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
for(const g of [0,1]){
 const r=await p.evaluate(async(g)=>{const u=S.users[0];S.user=u;u.groupAccountR1025B={type:'agency',company:'測試旅行社',taxId:'12345675',contact:{name:'王',phone:'0912',email:'a@b.c'},caseNo:'X',status:'active'};
  const d=addDays(todayISO(),40);S.view='booking';S.search={fr:'NRT',to:'FRA',dep:d,type:'OW',adults:g?20:1,children:0,infants:0,pax:g?20:1,cabin:'Economy',grp25:g};S.phase='sel_out';S.outF=S.inbF=null;render();await new Promise(r=>setTimeout(r,2500));
  const t=document.getElementById('app').innerText;const i=t.indexOf('KX9811');return {has:i>=0,snip:i>=0?t.slice(i-200,i+300).replace(/\s+/g,' '):t.slice(0,600).replace(/\s+/g,' ')}},g);
 console.log('grp',g,JSON.stringify(r));}
console.log(errs.slice(0,3));await b.close()})();

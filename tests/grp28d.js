// 1101A：團體訂位——前置視窗、只賣選好的方案、整團坐得下才賣、回程提示、團名可輸入＋自動帶入、尾款期限內名單表
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
await p.evaluate(()=>{var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];u.groupAccountR1025B={status:'active',company:'KK TRIP',type:'agency',taxId:'22099131',license:'乙1235',contact:{name:'Admin',phone:'0912345765',email:'t@g.com'},caseNo:'KGTEST'};S.user=u;S.view='home';render();kgmGrpModeR1025B(1)});
await p.waitForTimeout(800);const m1=await p.evaluate(()=>({modal:!!document.querySelector('#k28g-host .k28g-dlg'),rows:document.querySelectorAll('#k28g-host .k28g-cmp tbody tr').length}));
await p.screenshot({path:'/tmp/j/g3.png'});
await p.click('#k28g-host button:has-text("選團體優惠")');await p.waitForTimeout(500);
const r1=await p.evaluate(async()=>{var D=addDays(todayISO(),14),R=addDays(D,5);Object.assign(S.search,{type:'RT',fr:'TPE',to:'NRT',dep:D,ret:R,adults:12,children:2,infants:0});passengerCounts();nav('booking');await new Promise(r=>setTimeout(r,2500));
  var f=Object.assign({},FLIGHTS.find(x=>x.code==='KX181'),{date:D});var vc=validCodes(f);
  return {plan:S.search.grpPlanR1101A,modal:!!document.querySelector('#k28g-host .k28g-dlg'),vc:vc,cab:CAB_CODES('Economy').slice(0,3),kx180:[...document.querySelectorAll('.award-shop-row,tr.fl-row')].map(r=>r.innerText.replace(/\s+/g,' ')).filter(t=>/KX181/.test(t)).map(t=>t.slice(0,140)),sellEQ:kgmGrpSellR1025B('E-Q',D,f),inv:kgmCabinInventory54(f,D,'Economy').left}});
// 1101A ⑩：沒分艙時點矩陣格子就選那一艙
const r1b=await p.evaluate(async()=>{var btn=document.querySelector('.k28m-shop .award-plan-btn:not([disabled])');if(!btn)return {none:true};var t=btn.innerText.replace(/\s+/g,' ');btn.click();await new Promise(r=>setTimeout(r,2000));var out={cell:t,phase:S.phase,outF:S.outF&&S.outF.code,outC:S.outC};S.phase='sel_out';S.outF=null;S.outC=null;S.grp28RetWarn=null;render();await new Promise(r=>setTimeout(r,1200));return out});
// 去程選一班坐得下的 → 回程
const r2=await p.evaluate(async()=>{var D=S.search.dep,cands=FLIGHTS.filter(x=>x.fr==='TPE'&&x.to==='NRT'&&!x.via&&flyOn(x,new Date(D+'T12:00:00')));var pick=null;for(var x of cands){var f=Object.assign({},x,kgmSeasonFlightR48(x,D)||{},{date:D});if(kgmGrpSellR1025B('E-Q',D,f)>0){pick=f;break}}
  if(!pick)return {none:true};S.outF=pick;S.outC='E-Q';S.phase='sel_inb';render();await new Promise(r=>setTimeout(r,1800));
  return {out:pick.code,warn:S.grp28RetWarn&&S.grp28RetWarn.rows.map(r=>r.code+' '+r.dep+' '+r.n),modal:!!document.querySelector('#k28g-host .k28g-dlg')}});
await p.screenshot({path:'/tmp/j/g4.png'});
await p.evaluate(()=>{S.grp28RetWarn=null;S.phase='pax';S.inbF=null;render()});await p.waitForTimeout(1200);
const ins=await p.$$('.k25g-grid input.inp');const before=await p.evaluate(()=>({name:(S.grpDraftR1025B||{}).name,ro:[...document.querySelectorAll('.k25g-grid input.inp')].map(i=>i.readOnly),names:!!document.querySelector('.k28g-names'),rows:document.querySelectorAll('.k28g-names tbody tr').length}));
await ins[1].click();await p.keyboard.type('王領隊',{delay:60});await p.waitForTimeout(800);
const after=await p.evaluate(()=>({leader:(S.grpDraftR1025B||{}).leader}));
await p.screenshot({path:'/tmp/j/g5.png',fullPage:true});
console.log(JSON.stringify({m1,r1,r1b,r2,before,after,errs:errs.slice(0,3)},null,1));await b.close()})();

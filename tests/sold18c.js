const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:1000}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,150)));
await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
const found=await p.evaluate(()=>{const out=[];const T0=todayISO();const R=[['NRT','BKK'],['KIX','SIN'],['ICN','BKK'],['HKG','NRT'],['NRT','SIN'],['NRT','HKG'],['KIX','BKK'],['ICN','SIN'],['NRT','MNL'],['KIX','HKG'],['NGO','BKK'],['FUK','BKK'],['ICN','HKG'],['NRT','SGN']];
 for(let i=1;i<30&&out.length<3;i++){const d=addDays(T0,i);for(const [fr,to] of R){if(out.length>=3)break;let cs=[];try{cs=findConnections(fr,to,d)||[]}catch(_){}
   cs.forEach((cn,ci)=>{if(out.length>=3||!cn||!cn.f1||!cn.f2)return;let v1=[],v2=[];try{v1=validCodes(cn.f1);v2=validCodes(cn.f2)}catch(_){}let vc=v1.filter(k=>k!=="R"&&v2.includes(k));if(!vc.length)vc=v1.filter(k=>k!=="R");
     const eco=CAB_CODES('Economy').filter(c=>vc.includes(c));if(!eco.length)return;const so=kgmSoldFamR1018B('Economy',eco);if(so.length)out.push({fr,to,date:d,f1:cn.f1.code,f2:cn.f2.code,eco,so})})}}return out});
console.log(JSON.stringify(found));
const t=found[+(process.env.I||0)];if(!t){console.log('none');await b.close();return}
await p.evaluate(()=>{window.__log18=[];const g=window.connFareGrid;window.connFareGrid=function(cn){try{window.__log18.push({f1:cn.f1.code,d1:cn.f1.date,f2:cn.f2.code,v1:validCodes(cn.f1),v2:validCodes(cn.f2),cab:S.search.cabin,ph:S.phase,stx:!!(S.stx&&S.stx.plan),um:S.search.useMiles})}catch(e){window.__log18.push(String(e))}return g.apply(this,arguments)};try{connFareGrid=window.connFareGrid}catch(_){}});
await p.evaluate((t)=>{S.view='booking';S.phase='sel_out';S.openConnR1012A=null;S.connCache={};S.search=Object.assign(S.search||{},{fr:t.fr,to:t.to,dep:t.date,type:'OW',pax:1,cabin:'Economy',useMiles:false});render()},t);
await p.waitForTimeout(2500);
const op=await p.evaluate((t)=>{const bs=[...document.querySelectorAll('button')].filter(x=>/openConnR1012A/.test(x.getAttribute('onclick')||''));const hit=bs.find(x=>{const o=x.getAttribute('onclick')||'';return o.includes('-'+t.f1+'-')&&o.includes('-'+t.f2+'-')});if(hit){hit.click();return {n:bs.length,ok:1}}return {n:bs.length,ok:0}},t);
await p.waitForTimeout(1500);console.log('opened',JSON.stringify(op));
const cards=await p.evaluate(()=>[...document.querySelectorAll('.k929-cbtn')].filter(e=>e.getBoundingClientRect().width>0).map(a=>a.tagName+' '+(a.classList.contains('sold')?'[SOLD] ':'')+a.querySelector('.k929-nm')?.textContent+' | '+a.querySelector('.k929-pr')?.textContent+' | '+a.querySelector('.k929-sub')?.textContent+' | '+a.querySelector('.k929-selb')?.textContent+' onclick='+!!a.getAttribute('onclick')));
console.log(JSON.stringify(cards,null,1));
// click a sold card: phase/outF must not change
const before=await p.evaluate(()=>JSON.stringify([S.phase,S.outF&&S.outF.code,S.outC]));
await p.evaluate(()=>{const a=[...document.querySelectorAll('.k929-cbtn.sold')].find(e=>e.getBoundingClientRect().width>0);if(a)a.click()});await p.waitForTimeout(800);
const after=await p.evaluate(()=>JSON.stringify([S.phase,S.outF&&S.outF.code,S.outC]));console.log('click sold',before,'->',after);
const rc=await p.evaluate(()=>{const a=[...document.querySelectorAll('.k929-cbtn.sold')].filter(e=>e.getBoundingClientRect().width>0);if(!a.length)return null;a[0].scrollIntoView({block:'center'});const r=a[0].getBoundingClientRect();return {y:r.y,h:r.height}});
await p.waitForTimeout(500);if(rc)await p.screenshot({path:'/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/sold18c.png',clip:{x:0,y:Math.max(0,rc.y-200),width:1400,height:Math.min(800,1000-Math.max(0,rc.y-200))}});
console.log('LOG',JSON.stringify(await p.evaluate(()=>window.__log18)));console.log('ERR',JSON.stringify(errs));await b.close()})();

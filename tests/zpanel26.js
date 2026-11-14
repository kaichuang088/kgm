const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1100}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm1026B_w14.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(12000);
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightadjust';S.k26zOpen=true;render()});
await p.waitForTimeout(6000);
await p.screenshot({path:'/tmp/j/zp1.png',fullPage:false});
const a=await p.evaluate(()=>({aff:document.querySelectorAll('.k26z-aff tbody tr').length,txt:(document.querySelector('.k26z-aff summary')||{}).innerText}));
// toggle Russia off (open) and add custom
await p.evaluate(()=>kgmZoneToggleR1026B('Russia'));await p.waitForTimeout(500);
await p.fill('#k26zn','測試空域');await p.fill('#k26zla','30');await p.fill('#k26zlo','120');await p.fill('#k26zr','150');await p.evaluate(()=>kgmZoneAddR1026B());
await p.waitForTimeout(15000);
const c=await p.evaluate(()=>({st:S.warZonesR1026B,aff:document.querySelectorAll('.k26z-aff tbody tr').length,txt:(document.querySelector('.k26z-aff summary')||{}).innerText,lhr:kgmWarRouteR1025B('TPE','LHR'),pvg:kgmWarRouteR1025B('TPE','PVG'),N:KGM_WROUTE_N_R1026B,saved:localStorage.getItem('kgm26_zones')}));
await p.screenshot({path:'/tmp/j/zp2.png',fullPage:false});
await p.evaluate(()=>{window.confirm=()=>true;kgmZoneResetR1026B()});await p.waitForTimeout(2000);
const d=await p.evaluate(()=>({st:S.warZonesR1026B,lhr:kgmWarRouteR1025B('LHR','TPE')&&kgmWarRouteR1025B('LHR','TPE').extra}));
console.log(JSON.stringify(a),'\n',JSON.stringify(c).slice(0,1500),'\n',JSON.stringify(d),errs.slice(0,3));await b.close()})();

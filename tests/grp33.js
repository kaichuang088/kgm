// 1103A：團體航點——一般模式選單不變；團體模式多「團體專屬航點」；沒有定期航班的航線轉自創航班並帶入資料
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(12000);
const r=await p.evaluate(async()=>{const o={};const u=S.users.find(x=>x.id==='KGM100000');S.user=u;S.view='home';S.search=S.search||{};S.search.grp25=false;render();await new Promise(r=>setTimeout(r,300));
 const cnt=()=>{kgmApOpenR158('to');const rg=[...document.querySelectorAll('.k158-rg')].map(e=>e.innerText);const n=document.querySelectorAll('.k158-op').length;const hasAKJ=!!document.querySelector('.k158-op[onclick*="AKJ"]');kgmApOpenR158('to');return {rg,n,hasAKJ}};
 o.normal=cnt();
 try{kgmGrpModeR1025B(true)}catch(e){o.modeErr=String(e)}S.search.grp25=S.search.grp25||true;render();await new Promise(r=>setTimeout(r,300));
 o.group=cnt();
 o.dist={AKJ:Math.round(distOf('TPE','AKJ')),PEK:Math.round(distOf('TPE','PEK')),CXR:Math.round(distOf('TPE','CXR')),URC:Math.round(distOf('TPE','URC'))};
 o.names=['AKJ','SHI','TFU','URC','CXR','HKT'].map(a=>a+':'+CITY_ZH[a]+'/'+CITY_EN[a]+'/TZ'+TZ[a]);
 // 選台北→旭川，按方案「現有航班」→ 轉自創航班
 S.search.fr='TPE';S.search.to='AKJ';S.search.date=addDays(todayISO(),120);S.search.grpPax25=40;window.alert=m=>{window.__al=m};
 kgmGrpPickR1101A('U');await new Promise(r=>setTimeout(r,800));
 o.alert=window.__al;o.view=S.view;o.kind=S.k27cr&&S.k27cr.kind;o.v=S.k27cr&&S.k27cr.v;
 o.form={fr:(document.getElementById('k27c-fr')||{}).value,to:(document.getElementById('k27c-to')||{}).value,date:(document.getElementById('k27c-date')||{}).value,pax:(document.getElementById('k27c-pax')||{}).value,types:[...((document.getElementById('k27c-type')||{}).options||[])].map(x=>x.value)};
 o.served=kgmGrpServedR1103A('TPE','NRT');
 return o});
await p.screenshot({path:'/tmp/j/grp33.png',fullPage:false});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

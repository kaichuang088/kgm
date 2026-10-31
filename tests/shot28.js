// node shot28.js <out.png> <view:admin|front> <tab or view> [wait ms] [js before shot] [width]
const {chromium}=require('playwright');
(async()=>{const [out,side,tab,wait,js,wd]=process.argv.slice(2);const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:+(wd||1440),height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(+(wait||25000));
await p.evaluate(([side,tab])=>{if(side==='admin'){S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab=tab}else{S.view=tab}render()},[side,tab]);
await p.waitForTimeout(3000);
if(js){await p.evaluate(js);await p.waitForTimeout(2500)}
await p.screenshot({path:out,fullPage:false});console.log('ok',errs.slice(0,3));await b.close()})();

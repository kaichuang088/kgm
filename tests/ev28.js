// node ev28.js "<js expression returning JSON-able>" [wait ms] [html]
const {chromium}=require('playwright');
(async()=>{const [js,wait,F]=process.argv.slice(2);const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+(F||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(+(wait||20000));
const r=await p.evaluate(new Function('return ('+js+')'));
console.log(JSON.stringify(r,null,1).slice(0,6000));if(errs.length)console.log('ERR',errs.slice(0,3));await b.close()})();

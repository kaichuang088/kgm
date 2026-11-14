// 1103A：前台航班動態——搜尋框打字時分頁不重畫（同一個 DOM 節點）；預估抵達差 5 分以上寫狀態
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(12000);
await p.evaluate(()=>{const d1=addDays(todayISO(),1);S.stBoardR1019A=false;S.stByNo=false;S.stFr='TPE';S.stTo='NRT';S.stBase=d1;S.stOff=0;nav('status');});
await p.waitForTimeout(600);
await p.evaluate(()=>{kgmStApOpenR929('to')});await p.waitForTimeout(400);await p.evaluate(()=>{window.__tab=document.querySelector('.fb19-st2 button');window.__rc=0;const R0=window.render;window.render=function(){window.__rc++;return R0.apply(this,arguments)};try{render=window.render}catch(_){}});
await p.keyboard.type('JFK',{delay:150});await p.waitForTimeout(500);
const r=await p.evaluate(()=>({renders:window.__rc,sameTab:window.__tab===document.querySelector('.fb19-st2 button'),focus:document.activeElement&&document.activeElement.id,val:(document.querySelector('#k158q')||{}).value,items:[...document.querySelectorAll('.k929-stpick button')].map(b=>b.innerText.replace(/\s+/g,' ')).filter(t=>/JFK|紐約/.test(t)).slice(0,3)}));
console.log(JSON.stringify(r));
await p.evaluate(()=>kgmStApPickR929('to','JFK'));await p.waitForTimeout(600);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.fs20')].map(c=>c.innerText.replace(/\s+/g,' ').slice(0,200)).join('\n')));
console.log('ERR',errs);await b.close()})();

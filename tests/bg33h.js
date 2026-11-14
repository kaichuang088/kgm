// 1103A：模擬「分頁看不見」——頁面計時器被壓到 10 秒一次、requestIdleCallback 不跑；看組員引擎還會不會往前算
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1600,height:1100}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});
await p.evaluate((hide)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render();
  if(!hide)return;Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true});
  const st=window.setTimeout.bind(window);window.setTimeout=function(f,ms){return st(f,Math.max(+ms||0,10000))};window.requestIdleCallback=function(){return 0};
  document.dispatchEvent(new Event('visibilitychange'))},!!process.env.HIDE);
const out=[];for(let i=0;i<8;i++){await p.waitForTimeout(15000);out.push(await p.evaluate(()=>{let n=0;const T=todayISO();for(let k=0;k<60;k++){try{if(window.kgmCrewHasDayR121(addDays(T,k)))n++}catch(_){}}return n}))}
console.log(process.env.HIDE?'hidden':'visible',JSON.stringify(out),'ERR',errs.slice(0,3));await b.close()})();

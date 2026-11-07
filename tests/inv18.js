const {chromium}=require('playwright');const F=process.argv[2];(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1100}})).newPage();p.on('pageerror',e=>{});
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
const res=[];
for(let i=2;i<=14;i++){await p.evaluate((i)=>{const d=addDays(todayISO(),i);S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr:'TPE',to:'HND',dep:d,ret:addDays(d,4),type:'RT',pax:1,adults:1,cabin:'Economy',useMiles:false});render()},i);await p.waitForTimeout(1200);
 const r=await p.evaluate((i)=>{const d=addDays(todayISO(),i);
 const bt=[...document.querySelectorAll('button[id^="fb"]')].find(b=>{let e=b;for(let k=0;k<10&&e;k++){if(e.tagName==='TR'&&e.textContent.indexOf('KX168')>=0)return true;e=e.parentElement}return false});if(!bt)return d+' no KX168';bt.click();return null},i);await p.waitForTimeout(900);const r2=await p.evaluate((i)=>{const d=addDays(todayISO(),i);
 const cards=[...document.querySelectorAll('.k929-fare')].filter(e=>e.getBoundingClientRect().width>0).map(a=>(a.className.indexOf('sold')>=0?'S':'')+((a.querySelector('.k929-nm')||{}).textContent||'').replace(/[^A-Z()]/g,'')+':'+((a.querySelector('.k929-pr')||{}).textContent||'')+(a.querySelector('.k929-sold')?'[售完行]':'')+(a.querySelector('.k929-sel button[disabled]')?'[disabled]':''));
 const inv=Object.keys(S.seatInventory||{}).filter(k=>k.indexOf('KX168_'+d+'_')===0).map(k=>k.slice(-3)+'='+S.seatInventory[k]+((S.fareThirds0810P||{})[k]?'a':'m'));
 return d+' '+cards.join(' ')+' || '+inv.join(',')},i);res.push(r||r2)}
console.log(res.join('\n'));await b.close()})();

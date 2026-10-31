const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1100}})).newPage();p.on('pageerror',e=>console.log('ERR',e.message.slice(0,100)));
await p.goto('file:///tmp/j/kgm1018B_w13.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
for(const d of ['2026-10-24','2026-10-29']){
await p.evaluate((d)=>{S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr:'TPE',to:'HND',dep:d,ret:'2026-11-03',type:'RT',pax:1,adults:1,cabin:'Economy',useMiles:false});render()},d);await p.waitForTimeout(2000);
const row=await p.evaluate(()=>{const tr=[...document.querySelectorAll('tr')].find(t=>t.textContent.indexOf('KX168')>=0&&t.querySelector('button[id^="fb"]'));if(!tr)return null;const bt=tr.querySelector('button[id^="fb"]');const txt=tr.innerText.replace(/\s+/g,' ').slice(-140);bt.click();return txt});
await p.waitForTimeout(1500);
const cards=await p.evaluate(()=>[...document.querySelectorAll('.k929-fare')].filter(e=>e.getBoundingClientRect().width>0).map(a=>((a.querySelector('.k929-nm')||{}).textContent||'')+'|'+((a.querySelector('.k929-pr')||{}).textContent||'')+'|'+((a.querySelector('.k929-sub')||{}).textContent||'')));
console.log(d,'ROW:',row,'\n  CARDS:',JSON.stringify(cards));
if(d==='2026-10-24'){const y=await p.evaluate(()=>{const tr=[...document.querySelectorAll('tr')].find(t=>t.textContent.indexOf('KX168')>=0&&t.querySelector('button[id^="fb"]'));tr.scrollIntoView({block:'start'});return 0});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/eco18.png'})}}
await b.close()})();

// 1112A C6：航班資料頁按「PDF REPORT」（跟使用者一樣用按鈕）→ CEO 完整版 1～15 節＋附錄
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(todayISO()),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(3000);
const keys=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';render();await new Promise(r=>setTimeout(r,1500));
 return [...document.querySelectorAll('#app [onclick*="kgmFdOpenR1025B"]')].slice(0,40).map(x=>x.getAttribute('onclick'))});
console.log('keys',keys.length,keys.slice(0,3));
const pick=keys[0];
const pop=p.waitForEvent('popup',{timeout:60000});
await p.evaluate(async(k)=>{eval(k);await new Promise(r=>setTimeout(r,2500))},pick);
await p.locator('#app button:has-text("PDF REPORT")').first().click();
const info0=await p.evaluate(()=>({isW:!!(window.printOpsR7&&window.printOpsR7.__pdf38),same:window.printOpsR7===window.kgmOpsReportR1018A,g:typeof printOpsR7==='function'&&!!printOpsR7.__pdf38}));console.log('fn',JSON.stringify(info0));const w=await pop;await w.waitForTimeout(40000);
const r=await w.evaluate(()=>({body:document.body.innerText.slice(0,300),heads:[...document.querySelectorAll('h2')].map(h=>h.textContent.replace(/\s+/g,' ').slice(0,40)),secs:[...document.querySelectorAll('.k39fd')].map(e=>e.innerText.replace(/\s+/g,' ').length)}));
console.log(pick,JSON.stringify(r,null,1));console.log(JSON.stringify(await p.evaluate(()=>window.KGM_OPSREPORT_R1108A)));await b.close()})();

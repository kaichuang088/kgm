const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000}})).newPage();
await p.goto('file:///tmp/j/kgm1018B_w11.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
for(const code of ['KX182','']){await p.evaluate((c)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='fareana';S.fareAnaQR1004B={date:'2026-11-01',code:c};render()},code);await p.waitForTimeout(2500);
console.log(code||'none',JSON.stringify(await p.evaluate(()=>{const bar=document.querySelector('.k4b-ss-bar');const ys=[...bar.children].map(e=>Math.round(e.getBoundingClientRect().top));return {rows:[...new Set(ys)].length,ys}})));}
const r=await p.evaluate(()=>{const e=document.querySelector('.k4b-ss-bar').getBoundingClientRect();return {y:e.y,h:e.height}});
await p.screenshot({path:'/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fa18b_3.png',clip:{x:280,y:r.y-10,width:1180,height:r.h+20}});await b.close()})();

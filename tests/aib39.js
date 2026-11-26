const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{const u=S.users.find(x=>x&&/^KGM\d/.test(x.id));S.user=u;S.view='home';render();
 const tog=document.querySelector('[onclick*="kgmToggleAi0819I"]');if(tog)tog.click();await new Promise(r=>setTimeout(r,800));
 const inp=document.getElementById('aiInput');inp.value='信用卡綁定在哪裡';kgmSendAi0819I();await new Promise(r=>setTimeout(r,1500));
 const btns=[...document.querySelectorAll('.k39-guide button')];const box=btns[0]&&btns[0].closest('[id]');const o={n:btns.length,box:box&&box.id,open:S.aiOpen0819I};
 if(btns[0]){btns[0].click();await new Promise(r=>setTimeout(r,2500));o.view=S.view;o.tab=S.profileTab;const cb=document.querySelector('.k22-cardb');o.card=!!cb;o.cardTop=cb&&Math.round(cb.getBoundingClientRect().top)}
 return o});
console.log(JSON.stringify(r));await p.screenshot({path:'/tmp/j/s39/aib.png'});await b.close()})();

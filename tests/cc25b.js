const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 await p.evaluate(()=>{S.cardBindR1022A=[{id:'CBOLD1',userId:'KGM1',memberName:'OLD',holder:'OLD USER',net:'visa',tier:'Platinum',bin6:'411111',last4:'1111',exp:'12/29',luhn:true,at:'2026-10-20T00:00:00Z',status:'verified',simR1022A:1}];save();const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='status';render()});await p.waitForTimeout(2500);
 const items=await p.evaluate(()=>[...document.querySelectorAll('aside *')].filter(e=>/信用卡/.test(e.textContent)&&e.children.length===0).map(e=>e.tagName+'.'+e.className+' '+(e.getAttribute('onclick')||'')+' | '+(e.closest('[onclick]')||{getAttribute:()=>''}).getAttribute('onclick')));
 console.log(items);
 const el=1;
 await p.locator('aside button:has-text("信用卡驗證")').first().click({timeout:20000});await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>({view:S.view,tab:S.adminTab,authed:S.adminAuthed,url:location.href.slice(-60)})));
 for(let i=0;i<4;i++){await p.waitForTimeout(1500);console.log(await p.evaluate(()=>S.view+'/'+S.adminTab))}
 console.log(errs);await b.close()})();

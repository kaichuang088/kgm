const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000}})).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<25;i++){await p.waitForTimeout(3000);if(await p.evaluate(()=>!!window.KGM_WAR_LAST_R1025B))break}
 const d=await p.evaluate(()=>{const x=(window.KGM_WAR_LAST_R1025B||[]).find(x=>x.code==='KX94')||window.KGM_WAR_LAST_R1025B[0];return x.code+'|'+x.date});console.log('target',d);
 await p.evaluate(()=>{S.view='status';render()});await p.waitForTimeout(1500);
 await p.getByText('依航班號',{exact:true}).first().click();await p.waitForTimeout(1200);
 const inp=p.locator('input').filter({hasNot:p.locator('[type=date]')});
 await p.evaluate(()=>{});
 const ins=await p.$$('input');for(const i of ins){const ph=await i.getAttribute('placeholder');if(ph&&/KX|航班/.test(ph)){await i.fill(d.split('|')[0]);break}}
 const dates=await p.$$('input[type=date]');if(dates[0])await dates[0].fill(d.split('|')[1]);
 await p.getByText('搜尋',{exact:true}).first().click().catch(()=>{});await p.waitForTimeout(2500);
 await p.screenshot({path:'/tmp/j/war_front.png'});
 await b.close()})();

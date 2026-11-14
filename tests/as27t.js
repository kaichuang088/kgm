const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1360,height:950}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='airspace27';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(8000);
 console.log('nav',await p.evaluate(()=>[...document.querySelectorAll('#app aside *')].filter(e=>/關閉空域/.test(e.textContent)&&e.children.length===0).map(e=>e.textContent.trim()).slice(0,3)));
 console.log('page',await p.evaluate(()=>({zones:!!document.querySelector('#k26zones .k26z'),pc:!!document.querySelector('#k27pcw .k27pc'),rows:document.querySelectorAll('#k27pcw tbody tr').length,txt:(document.querySelector('#k27pcw')||{}).innerText.slice(0,200)})));
 await p.screenshot({path:'/tmp/j/as27_1.png',fullPage:false});
 // pick a winter-limited flight
 const pick=await p.evaluate(()=>{const tr=[...document.querySelectorAll('#k27pcw tbody tr')][0];return tr?tr.innerText.replace(/\s+/g,' '):''});console.log('top row',pick);
 const code=pick.split(' ')[0];
 const before=await p.evaluate(code=>{const f=FLIGHTS.find(f=>f.code===code&&!f.via);const d='2027-01-15';const c=kgmPaxCapR1025B(f,d);const inv=kgmCabinInventory54?kgmCabinInventory54(f,d,'Economy'):null;return {fr:f.fr,to:f.to,blocked:c&&c.blocked,inv:inv&&inv.left}},code);console.log('before',JSON.stringify(before));
 await p.evaluate(code=>kgmPaxCapPickR1026C(code),code);await p.waitForTimeout(400);
 await p.selectOption('#k27pcS','winter');await p.fill('#k27pcN','5');await p.fill('#k27pcT','測試');await p.click('#k27pcw button.k27pc-b:has-text("套用")');await p.waitForTimeout(6500);
 const after=await p.evaluate(([code,b])=>{const f=FLIGHTS.find(f=>f.code===code&&f.fr===b.fr);const c=kgmPaxCapR1025B(f,'2027-01-15');const cs=kgmPaxCapR1025B(f,'2027-07-15');const inv=kgmCabinInventory54?kgmCabinInventory54(f,'2027-01-15','Economy'):null;return {blocked:c&&c.blocked,auto:c&&c.autoBlockedR1026C,summer:cs&&cs.blocked,inv:inv&&inv.left,saved:JSON.parse(localStorage.getItem('kgm27_paxcap')||'[]').length,chips:document.querySelectorAll('#k27pcw .k27pc-chip').length}},[code,before]);console.log('after',JSON.stringify(after));
 await p.screenshot({path:'/tmp/j/as27_2.png'});
 // reload persistence
 await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(6000);
 console.log('reload',await p.evaluate(([code,b])=>{const f=FLIGHTS.find(f=>f.code===code&&f.fr===b.fr);const c=kgmPaxCapR1025B(f,'2027-01-15');return {rules:(S.paxCapAdjR1026C||[]).length,blocked:c&&c.blocked}},[code,before]));
 // flightadjust no zones
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightadjust';render()});await p.waitForTimeout(2000);
 console.log('flightadjust zones',await p.evaluate(()=>!!document.querySelector('#k26zones')));
 // remove
 await p.evaluate(()=>{S.adminTab='airspace27';render()});await p.waitForTimeout(1500);
 await p.evaluate(()=>{const r=(S.paxCapAdjR1026C||[]).filter(x=>!x.off)[0];kgmPaxCapDelR1026C(r.id)});await p.waitForTimeout(800);
 console.log('removed',await p.evaluate(([code,b])=>{const f=FLIGHTS.find(f=>f.code===code&&f.fr===b.fr);const c=kgmPaxCapR1025B(f,'2027-01-15');return c&&c.blocked},[code,before]));
 // mobile
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(800);console.log('mobile sw',await p.evaluate(()=>document.documentElement.scrollWidth));await p.screenshot({path:'/tmp/j/as27_m.png'});
 console.log('errors',errs);await b.close()})();

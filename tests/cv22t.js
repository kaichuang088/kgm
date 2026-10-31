const {chromium}=require('playwright');const SH='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>{if(!/寄信/.test(e.message))errs.push(e.message)});p.on('dialog',d=>{console.log('DIALOG',d.message());d.accept()});
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
console.log('user0',await p.evaluate(()=>{const u=S.users[0];return JSON.stringify({id:u.id,fn:u.firstName,ln:u.lastName,name:u.name,keys:Object.keys(u).slice(0,30)})}));
await p.evaluate(()=>{S.user=S.users[0];S.view='profile';S.profileTab='account';render()});await p.waitForTimeout(1500);
console.log('front form',await p.evaluate(()=>!!document.querySelector('.k22-cardb #k22cNum')));
// valid visa 4111111111111111 holder = member name
const nm=await p.evaluate(()=>{const u=S.user;return ((u.lastName||'')+' '+(u.firstName||'')).trim().toUpperCase()});
await p.fill('#k22cNum','4111 1111 1111 1111');
const tier=await p.evaluate(()=>{return [...document.querySelectorAll('#k22cType option')].map(o=>o.value).filter(v=>/^visa/.test(v))});
await p.selectOption('#k22cType',tier[0]);await p.fill('#k22cName',nm);await p.fill('#k22cExp','0829');
await p.locator('.k22-cardb button.btn-g').click();await p.waitForTimeout(1200);
console.log('after submit',await p.evaluate(()=>JSON.stringify(S.cardBindR1022A.slice(0,1))));
console.log('stored raw has full number?',await p.evaluate(()=>/4111111111111111/.test(localStorage.getItem('kgm22_cards')||'')+' '+(localStorage.getItem('kgm22_cards')||'').length));
await p.locator('.k22-cardb').scrollIntoViewIfNeeded();await p.locator('.k22-cardb').screenshot({path:SH+'cv_front1.png'});
// luhn fail
await p.fill('#k22cNum','4111 1111 1111 1112');await p.selectOption('#k22cType',tier[2]);await p.fill('#k22cName','SOMEONE ELSE');await p.fill('#k22cExp','0129');
await p.locator('.k22-cardb button.btn-g').click();await p.waitForTimeout(1000);
// admin
await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo')||S.staff[0];S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='cardverify';render()});
await p.waitForTimeout(16000);
console.log('admin',await p.evaluate(()=>{const L=S.cardBindR1022A;const c={};L.forEach(x=>c[x.status]=(c[x.status]||0)+1);return JSON.stringify({n:L.length,c,sim:L.filter(x=>x.simR1022A).length,tab:!!document.querySelector('.cv22'),side:[...document.querySelectorAll('*')].some(e=>e.children.length===0&&/信用卡驗證/.test(e.textContent)&&e.closest('aside,nav,.side,.sidebar'))})}));
await p.screenshot({path:SH+'cv_admin1.png',fullPage:false});
await p.evaluate(()=>kgmCardAiAllR1022A());await p.waitForTimeout(800);
console.log('after AI all',await p.evaluate(()=>S.cardBindR1022A.map(x=>x.id.slice(-4)+':'+x.status+':'+(x.simR1022A?'s':'u')+':'+(x.ai?x.ai.checks.filter(k=>!k.ok).map(k=>k.t.slice(0,18)).join('/'):'')).join('\n')));
const mine=await p.evaluate(()=>S.cardBindR1022A.filter(x=>!x.simR1022A).map(x=>x.id));
await p.evaluate(id=>{S._cardOpenR1022A=id;render()},mine[mine.length-1]);await p.waitForTimeout(600);
await p.screenshot({path:SH+'cv_admin2.png',fullPage:true});
const rv=await p.evaluate(()=>{const c=S.cardBindR1022A.find(x=>x.status==='review');if(!c)return 'no review';kgmCardDecideR1022A(c.id,true);return c.id+' '+c.status+' '+c.decidedBy});console.log('decide',rv);
console.log('notifs',await p.evaluate(()=>JSON.stringify((S.notifs||[]).filter(n=>/卡|Card/.test(n.title)).slice(0,3))));
console.log('LS saved',await p.evaluate(()=>{try{return JSON.parse(localStorage.getItem('kgm22_cards')).length}catch(e){return 'x '+e}}));
// reload persistence
await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(8000);
console.log('after reload',await p.evaluate(()=>S.cardBindR1022A.length+' '+S.cardBindR1022A.filter(x=>!x.simR1022A).map(x=>x.status).join(',')));
await p.evaluate(()=>{S.user=S.users[0];S.view='profile';S.profileTab='account';render()});await p.waitForTimeout(1500);
await p.locator('.k22-cardb').scrollIntoViewIfNeeded();await p.locator('.k22-cardb').screenshot({path:SH+'cv_front2.png'});
// mobile
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>render());await p.waitForTimeout(1200);
await p.locator('.k22-cardb').scrollIntoViewIfNeeded();await p.locator('.k22-cardb').screenshot({path:SH+'cv_front_m.png'});
console.log('mob overflow',await p.evaluate(()=>{const e=document.querySelector('.k22-cardb');return e.scrollWidth+'/'+e.clientWidth+' doc '+document.documentElement.scrollWidth}));
console.log('errs',errs.slice(0,5));await b.close()})();

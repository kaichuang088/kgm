const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
const SHOT='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/';
(async()=>{const srv=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{cwd:'/tmp/j/nf123',stdio:'ignore'});
 const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true,viewport:{width:1280,height:900}});await ctx.route(/workers\.dev/,r=>r.abort());
 await ctx.addInitScript(()=>{window.KGM_MOVE_URL_R1123A='http://127.0.0.1:8765/'});
 const errs=[];const dlg=[];ctx.on('page',pg=>{pg.on('pageerror',e=>errs.push(pg.url().slice(0,40)+' '+String(e.message).slice(0,120)));pg.on('dialog',d=>{dlg.push(d.message().slice(0,80));d.accept()})});
 // 1) 舊版本機檔案（1121A）建立舊資料：員工帳號、會員、訂位
 const o=await ctx.newPage();await o.goto('file:///tmp/j/d1121A/KGM_1121A_front.html',{waitUntil:'domcontentloaded',timeout:300000});await o.waitForTimeout(20000);
 await o.evaluate(()=>{S.staff.push({empId:'K99001',name:'CHANG SHISHI',email:'changshishi@kgm.com.tw',password:'123456789',role:'ground',active:true});
   S.users.push({id:'KGM777001',email:'mig@test.kgm',lastName:'MIGRATE',firstName:'TEST',dob:'1990-02-03',password:'x'});save()});
 await o.evaluate(()=>{const d=new Date(Date.now()+86400000*25).toISOString().slice(0,10);S.user=S.users.find(u=>u.id==='KGM777001');S.promoCode='';
   S.search={fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1,cabin:'Economy'};S.view='booking';const fs=sortedFlights('TPE','NRT',d)||[];pickFare('out',0,(validCodes(Object.assign({},fs[0],{date:d}))||[])[0],true);
   S.paxList=[{title:'MR',lastName:'MIGRATE',firstName:'TEST',dob:'1990-02-03',nat:'TW',passport:'X1',email:'mig@test.kgm',countryCode:'+886',phone:'900'}];S.contact={email:'mig@test.kgm',phone:'900',countryCode:'+886'};S.phase='pay';render();
   ['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});try{kgmPolicyCloseR914()}catch(e){}
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};set('cname','T');set('cnum','4111111111111111');set('cexp','12/30');set('ccvv','123');try{doPay(0,'TWD')}catch(e){}});
 await o.waitForTimeout(8000);const PNR=await o.evaluate(()=>S.pnr);console.log('old data pnr',PNR);await o.close();
 // 2) 新版本機檔案（不同檔名、不同資料夾）→ 頁尾「資料搬家」
 const n=await ctx.newPage();await n.goto('file:///tmp/j/loc123/KGM_new_front.html',{waitUntil:'domcontentloaded',timeout:300000});await n.waitForTimeout(20000);
 const seen=await n.evaluate((P)=>({staff:!!S.staff.find(x=>x.email==='changshishi@kgm.com.tw'),bk:!!S.bookings.find(x=>x.pnr===P),link:!!document.querySelector('footer .mv123-l')}),PNR);console.log('new local file sees old data',JSON.stringify(seen));
 await n.locator('footer .mv123-l').scrollIntoViewIfNeeded();await n.locator('footer .mv123-l').click();await n.waitForTimeout(600);
 await n.screenshot({path:SHOT+'mv123_local.png'});console.log('local modal',(await n.locator('#mv123m').innerText()).replace(/\n+/g,' | ').slice(0,300));
 const [pop]=await Promise.all([ctx.waitForEvent('page'),n.click('#mv123m [data-a=push]')]);
 await pop.waitForLoadState('domcontentloaded');await pop.waitForSelector('#mv123m [data-a=yes]',{timeout:120000});
 console.log('local status',await n.locator('#mv123st').innerText());
 await pop.screenshot({path:SHOT+'mv123_online_confirm.png'});console.log('online confirm',(await pop.locator('#mv123m').innerText()).replace(/\n+/g,' | ').slice(0,400));
 await Promise.all([pop.waitForNavigation({timeout:60000}),pop.click('#mv123m [data-a=yes]')]);await pop.waitForTimeout(15000);
 const post=await pop.evaluate((P)=>({url:location.href,staff:!!S.staff.find(x=>x.email==='changshishi@kgm.com.tw'),user:!!S.users.find(u=>u.id==='KGM777001'),bk:!!S.bookings.find(x=>x.pnr===P)}),PNR);console.log('online after import',JSON.stringify(post));
 // 3) 後台用那個員工帳號登入（真的按登入）
 const a=await ctx.newPage();await a.goto('http://127.0.0.1:8765/admin/',{waitUntil:'domcontentloaded',timeout:300000});await a.waitForTimeout(12000);
 await a.evaluate(()=>{S.adminAuthed=false;render()});await a.waitForTimeout(500);
 const code=await a.evaluate(()=>(S.rolePass||{}).ground);
 const ins=a.locator('.k7a-card input');await ins.nth(0).fill('changshishi@kgm.com.tw');await ins.nth(1).fill('123456789');await ins.nth(2).fill(String(code));
 await a.screenshot({path:SHOT+'mv123_admin_login.png'});
 await a.click('.k7a-go');await a.waitForTimeout(2500);console.log('admin login',JSON.stringify(await a.evaluate(()=>({authed:S.adminAuthed,who:S.adminUser&&S.adminUser.email,err:S.adminErr}))));
 console.log('admin footer link',await a.evaluate(()=>{S.adminAuthed=false;render();return !!document.querySelector('.k7a-foot .mv123-l')}));
 console.log('DLG',JSON.stringify(dlg));console.log('ERR',JSON.stringify(errs));await b.close();srv.kill()})();

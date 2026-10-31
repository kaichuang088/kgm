const {chromium}=require('playwright');const F=process.argv[2];const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>{if(!/Worker/.test(e.message))errs.push(e.message.slice(0,150))});
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(20000);
const D='2026-11-01';
await p.evaluate((D)=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='fareana';S.fareAnaQR1004B={date:D};render()},D);await p.waitForTimeout(3000);
const st=()=>p.evaluate(()=>{const q=S.fareAnaQR1004B;const sels=[...document.querySelectorAll('.k4b-ss-bar select')].map(s=>s.options[s.selectedIndex]&&s.options[s.selectedIndex].text);
 return {q:JSON.stringify(q),sels,ov:document.body.innerText.indexOf('航線總覽')>=0,cards:[...document.querySelectorAll('.k4b-fa-card header b.r40-mono')].map(x=>x.textContent),miss:(document.querySelector('.k4b-fa-empty')||{}).textContent||''}});
console.log('init',JSON.stringify(await st()));
await p.fill('#fa18bCode','182');await p.press('#fa18bCode','Enter');await p.waitForTimeout(2500);console.log('code182',JSON.stringify(await st()));
await p.screenshot({path:SP+'fa18b_1.png',clip:{x:0,y:0,width:1500,height:1000}});
// 出發地改 KHH? 改成 TPE→KIX
await p.evaluate(()=>kgmFareAnaSetR1004B('to','KIX'));await p.waitForTimeout(2500);console.log('to KIX',JSON.stringify(await st()));
await p.evaluate(()=>kgmFareAnaSetR1004B('route','KIX-TPE'));await p.waitForTimeout(2500);console.log('swap',JSON.stringify(await st()));
await p.evaluate(()=>kgmFareAnaSetR1004B('code','KX9999'));await p.waitForTimeout(2500);console.log('bad code',JSON.stringify(await st()));
// 編輯 KX182 E-N
await p.evaluate(()=>kgmFareAnaSetR1004B('code','KX182'));await p.waitForTimeout(3000);
const before=await p.evaluate((D)=>{const f=Object.assign({},FLIGHTS.find(x=>x.code==='KX182'),{date:D});S.search=Object.assign(S.search||{},{type:'RT',pax:1,adults:1,children:0,infants:0});return {price:owPrice(f,'E-N',1),left:kgmInventory49('E-N',D,f),priceD:owPrice(f,'E-D',1)}},D);console.log('before',JSON.stringify(before));
await p.evaluate(()=>{const el=[...document.querySelectorAll('.k4b-fa-b.fa18b-ed')].find(e=>e.textContent.indexOf('E-N')===0||e.querySelector('i')&&e.querySelector('i').textContent.indexOf('E-N')===0);el.click()});await p.waitForTimeout(1500);
console.log('editor',await p.evaluate(()=>(document.querySelector('.fa18b-box')||{}).innerText));
await p.fill('#fa18bPrice',String(before.price+1000));await p.fill('#fa18bSeats','2');
await p.evaluate(()=>kgmFaEditApplyR1018B());await p.waitForTimeout(2500);
const after=await p.evaluate((D)=>{const f=Object.assign({},FLIGHTS.find(x=>x.code==='KX182'),{date:D});S.search=Object.assign(S.search||{},{type:'RT',pax:1,adults:1,children:0,infants:0});
 const chip=[...document.querySelectorAll('.k4b-fa-b')].find(e=>e.querySelector('i')&&e.querySelector('i').textContent.indexOf('E-N')===0);
 return {price:owPrice(f,'E-N',1),left:kgmInventory49('E-N',D,f),priceD:owPrice(f,'E-D',1),priceN_KX181:owPrice(Object.assign({},FLIGHTS.find(x=>x.code==='KX184')||{},{date:D}),'E-N',1),chip:chip&&chip.innerText.replace(/\n/g,' '),man:chip&&chip.className,rules:(S.fareRulesR929||[]).filter(r=>r.bucket).map(r=>r.code+' '+r.bucket+' '+r.mul+' '+r.from),inv:S.seatInventory['KX182_'+D+'_E-N'],audit:(S.auditLog||S.actLog||[]).slice(0,1)}},D);
console.log('after',JSON.stringify(after));
await p.evaluate(()=>{const e=document.querySelector('.fa18b-box');e&&e.scrollIntoView({block:'center'})});await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const e=document.querySelector('.fa18b-box');if(!e)return null;const c=e.closest('article').getBoundingClientRect();return {y:c.y,h:c.height}});
if(r)await p.screenshot({path:SP+'fa18b_2.png',clip:{x:0,y:Math.max(0,r.y),width:1500,height:Math.min(900,r.h)}});
// 訂票頁看得到新價格
const bk=await p.evaluate((D)=>{S.view='booking';S.phase='sel_out';S.openFare=null;S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:D,ret:'2026-11-05',type:'RT',pax:1,adults:1,cabin:'Economy',useMiles:false});render();return 1},D);await p.waitForTimeout(2500);
const bp=await p.evaluate(()=>{const bt=[...document.querySelectorAll('button[id^="fb"]')].find(b=>{let e=b;for(let k=0;k<8&&e;k++){if(e.textContent&&e.textContent.indexOf('KX182')>=0&&e.tagName==='TR')return true;e=e.parentElement}return false});if(bt)bt.click();return !!bt});await p.waitForTimeout(1500);
console.log('booking opened',bp,JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.k929-fare')].filter(e=>e.getBoundingClientRect().width>0).map(a=>(a.querySelector('.k929-nm')||{}).textContent+'|'+(a.querySelector('.k929-pr')||{}).textContent+'|'+((a.querySelector('.k929-left')||{}).textContent||'')))));
// 恢復
await p.evaluate((D)=>{S.view='admin';S.adminTab='fareana';S.fa18bEdR1018B={code:'KX182',d:D,c:'E-N'};render();kgmFaEditResetR1018B()},D);await p.waitForTimeout(2000);
console.log('reset',JSON.stringify(await p.evaluate((D)=>{const f=Object.assign({},FLIGHTS.find(x=>x.code==='KX182'),{date:D});S.search=Object.assign(S.search||{},{type:'RT',pax:1});return {price:owPrice(f,'E-N',1),left:kgmInventory49('E-N',D,f),rules:(S.fareRulesR929||[]).filter(r=>r.bucket).length,inv:S.seatInventory['KX182_'+D+'_E-N']}},D)));
console.log('ERR',JSON.stringify(errs));await b.close()})();

const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1400,height:1000}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,150)));
await p.goto('file://'+f,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
// find a RT pair with sold families on the return leg
const t=await p.evaluate(()=>{const T0=todayISO();const R=[['TPE','NRT'],['TPE','KIX'],['TPE','ICN'],['TPE','HKG'],['TPE','BKK'],['TPE','OKA'],['TPE','FUK'],['TPE','CTS'],['TPE','SIN']];
 for(let i=2;i<30;i++){const d=addDays(T0,i),r=addDays(T0,i+3);for(const [fr,to] of R){const ok=(a,b,dd)=>FLIGHTS.filter(x=>x&&!x.partner&&!x.via&&x.fr===a&&x.to===b).some(x=>{let on=false;try{on=flyOn(x,new Date(dd+'T12:00:00'))}catch(_){}if(!on)return false;const g=Object.assign({},x,{date:dd});const vc=validCodes(g);const e=CAB_CODES('Economy').filter(c=>vc.includes(c));return e.length&&kgmSoldFamR1018B('Economy',e).length});
   if(ok(to,fr,r))return {fr,to,d,r}}}return null});
console.log('pair',JSON.stringify(t));if(!t){await b.close();return}
await p.evaluate((t)=>{S.view='booking';S.phase='sel_out';S.openFare=null;S.outF=null;S.outC=null;S.search=Object.assign(S.search||{},{fr:t.fr,to:t.to,dep:t.d,ret:t.r,type:'RT',pax:1,cabin:'Economy',useMiles:false});render()},t);
await p.waitForTimeout(2500);
// open first direct row and pick first selectable fare
const pk=await p.evaluate(()=>{const bt=document.querySelector('button[id^="fb"]');if(!bt)return 'nofb';bt.click();return bt.id});await p.waitForTimeout(1200);
const pk2=await p.evaluate(()=>{const s=[...document.querySelectorAll('.k929-sel button:not([disabled])')].find(e=>e.getBoundingClientRect().width>0);if(!s)return 'nosel';s.click();return 'ok'});await p.waitForTimeout(2500);
console.log('out',pk,pk2,await p.evaluate(()=>S.phase+' '+(S.outF&&S.outF.code)+' '+S.outC));
// on inbound: open each row until one with sold cards
const res=await p.evaluate(async()=>{const fbs=[...document.querySelectorAll('button[id^="fb"]')].map(b=>b.id);for(const id of fbs){const bt=document.getElementById(id);if(!bt)continue;bt.click();await new Promise(r=>setTimeout(r,700));const sold=[...document.querySelectorAll('.k929-fare.sold')].filter(e=>e.getBoundingClientRect().width>0);if(sold.length){const btn=sold[0].querySelector('button');return {id,phase:S.phase,n:sold.length,txt:sold.map(a=>a.querySelector('.k929-nm').textContent+'|'+a.querySelector('.k929-pr').textContent+'|'+(a.querySelector('button')||{}).textContent+'|dis='+!!a.querySelector('button[disabled]')),cursor:btn?getComputedStyle(btn).cursor:null}}}return {phase:S.phase,none:fbs.length}});
console.log('in',JSON.stringify(res));
// click sold button forcibly → nothing changes
const bef=await p.evaluate(()=>JSON.stringify([S.phase,S.inbF&&S.inbF.code,S.inbC]));
await p.evaluate(()=>{const a=[...document.querySelectorAll('.k929-fare.sold button')].find(e=>e.getBoundingClientRect().width>0);if(a)a.click()});await p.waitForTimeout(600);
console.log('click',bef,'->',await p.evaluate(()=>JSON.stringify([S.phase,S.inbF&&S.inbF.code,S.inbC])));
// English
await p.evaluate(()=>{LANG='en';render()});await p.waitForTimeout(1500);
await p.evaluate(async()=>{const fbs=[...document.querySelectorAll('button[id^="fb"]')].map(b=>b.id);for(const id of fbs){const bt=document.getElementById(id);bt&&bt.click();await new Promise(r=>setTimeout(r,600));if([...document.querySelectorAll('.k929-fare.sold')].some(e=>e.getBoundingClientRect().width>0))return}});
console.log('en',JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.k929-fare.sold')].filter(e=>e.getBoundingClientRect().width>0).map(a=>a.querySelector('.k929-pr').textContent+'|'+a.querySelector('.k929-sub').textContent+'|'+(a.querySelector('button')||{}).textContent))));
const rc=await p.evaluate(()=>{const a=[...document.querySelectorAll('.k929-fare.sold')].find(e=>e.getBoundingClientRect().width>0);if(!a)return null;a.scrollIntoView({block:'center'});return a.getBoundingClientRect().y});
await p.waitForTimeout(400);if(rc!=null)await p.screenshot({path:'/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/sold18en.png',clip:{x:0,y:Math.max(0,rc-150),width:1400,height:520}});
console.log('ERR',JSON.stringify(errs));await b.close()})();

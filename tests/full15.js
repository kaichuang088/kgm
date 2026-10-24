// user scenario: a browser whose storage is already full, then the page is (re)opened
// phase 1: open FILE1 (admin tabs) so the site's own data is stored; fill the remaining space with "other data";
// phase 2: open FILE2 in the same browser profile -> banner? which keys failed? are real edits saved?
const {chromium}=require('playwright');const [F1,F2]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();
const tot=()=>p.evaluate(()=>{let t=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);t+=k.length+(localStorage.getItem(k)||'').length}
  return {t,bd:(localStorage.getItem('kgmbd4')||'').length,cs:(localStorage.getItem('kgm_crewsched')||'').length,f3:(localStorage.getItem('kgm7_fare3')||'').length,fail:window.KGM_LS_FAIL_R1012A?Object.keys(window.KGM_LS_FAIL_R1012A.keys||{}):null,banner:!!document.getElementById('k12-lsfail'),ev:window.KGM_LS_EVICT_R1015A||null}});
await p.goto('file://'+F1,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(120000);
await p.evaluate(async()=>{S.adminAuthed=true;S.adminRole='ceo';S.view='admin';for(const t of ['auctions','sched']){S.adminTab=t;try{render()}catch(_){}await new Promise(r=>setTimeout(r,4000))}
  // a user who searched many routes (fare inventory records)
  for(const [a,c] of [['TPE','NRT'],['TPE','HKG'],['TPE','ICN'],['TPE','BKK'],['TPE','KIX'],['TPE','SIN'],['TPE','LAX'],['TPE','SFO']]){S.search=Object.assign(S.search||{},{fr:a,to:c,dep:addDays(todayISO(),9),ret:'',type:'OW',pax:1,adults:1,cabin:'Economy'});S.view='booking';S.phase='sel_out';try{render()}catch(_){}}
  S.view='admin';try{save()}catch(_){}});
await p.waitForTimeout(6000);console.log('phase1',JSON.stringify(await tot()));
const fill=await p.evaluate(()=>{let n=0;const chunk='x'.repeat(50000);try{for(;n<400;n++)localStorage.setItem('zz_other_'+n,chunk)}catch(e){}return n});
console.log('filled chunks',fill,JSON.stringify(await tot()));
await p.goto('file://'+F2,{waitUntil:'domcontentloaded',timeout:300000});
for(const s of [10,30,90]){await p.waitForTimeout(s===10?10000:s===30?20000:60000);console.log('phase2 '+s+'s',JSON.stringify(await tot()))}
// a real edit after opening: price override + date override must be saved
const chk=await p.evaluate(async()=>{S.priceOverrides=S.priceOverrides||{};S.priceOverrides['TPENRTEconomy']=1.07;S.flightDateOverride=S.flightDateOverride||{};S.flightDateOverride['KX20_2026-11-20']={note:'FULL15'};save();await new Promise(r=>setTimeout(r,2500));
  const po=JSON.parse(localStorage.getItem('kgm_priceov6')||'{}'),dv=localStorage.getItem('kgmdov4')||'';return {po:po['TPENRTEconomy'],dov:dv.indexOf('FULL15')>=0}});
console.log('edit saved',JSON.stringify(chk),JSON.stringify(await tot()));await b.close()})();

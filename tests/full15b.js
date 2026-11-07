// storage completely full while the page is open (stand-in for the user's browser): edits + auctions tab
const {chromium}=require('playwright');const F=process.argv[2];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,120)));
const st=()=>p.evaluate(()=>{let t=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);t+=k.length+(localStorage.getItem(k)||'').length}
  return {t,bd:(localStorage.getItem('kgmbd4')||'').length,cs:(localStorage.getItem('kgm_crewsched')||'').length,f3:(localStorage.getItem('kgm7_fare3')||'').length,fail:window.KGM_LS_FAIL_R1012A?Object.keys(window.KGM_LS_FAIL_R1012A.keys||{}):null,banner:!!document.getElementById('k12-lsfail'),ev:window.KGM_LS_EVICT_R1015A||null}});
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(90000);
await p.evaluate(async()=>{S.adminAuthed=true;S.adminRole='ceo';S.view='admin';S.adminTab='auctions';try{render()}catch(_){}await new Promise(r=>setTimeout(r,4000));try{save()}catch(_){}});
await p.waitForTimeout(3000);console.log('before fill',JSON.stringify(await st()));
// fill to the brim: big chunks, then smaller, until nothing fits
await p.evaluate(()=>{let n=0;for(const sz of [100000,10000,1000,100]){const c='x'.repeat(sz);try{for(;;n++)localStorage.setItem('zz_other_'+n,c)}catch(e){n++}}});
console.log('full',JSON.stringify(await st()));
// edits a user makes: single-day override, price override, seat inventory (manual), new bid; plus booking searches
const r=await p.evaluate(async()=>{S.flightDateOverride=S.flightDateOverride||{};S.flightDateOverride['KX20_2026-11-21']={note:'FULL15B'};
  S.priceOverrides=S.priceOverrides||{};S.priceOverrides['TPENRTEconomy']=1.09;S.seatInventory=S.seatInventory||{};S.seatInventory['KX20_2026-11-21_E-C']=5;
  S.bigDeals.push({id:'BDFULL15',code:'KX20',date:'2026-10-20',fr:'TPE',to:'NRT',pnr:'FUL15A',userId:'KGMDEMO0911',who:'FULL',cabin:'Economy',toCabin:'Premium',amount:3333,miles:0,pax:1,status:'open',at:new Date().toISOString(),kindR929:1});
  save();await new Promise(r=>setTimeout(r,3000));
  const g=k=>{try{return kgmLsUnpackR1012A(k,JSON.parse(localStorage.getItem(k)||'null'))}catch(_){return null}};
  const bd=g('kgmbd4')||[];return {dov:(localStorage.getItem('kgmdov4')||'').indexOf('FULL15B')>=0,po:(g('kgm_priceov6')||{})['TPENRTEconomy'],si:(g('kgm_seatinv6')||{})['KX20_2026-11-21_E-C'],bid:bd.some(x=>x.id==='BDFULL15')}});
await p.waitForTimeout(2000);console.log('edits saved',JSON.stringify(r),JSON.stringify(await st()));
await p.evaluate(async()=>{S.adminTab='auctions';try{render()}catch(_){}await new Promise(r=>setTimeout(r,5000));S.adminTab='sched';try{render()}catch(_){}await new Promise(r=>setTimeout(r,5000));try{save()}catch(_){}});
await p.waitForTimeout(4000);console.log('after more use',JSON.stringify(await st()),'ERR',JSON.stringify(errs.slice(0,3)));
await b.close()})();

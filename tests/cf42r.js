// 1115A：customFlights 重新整理後要還在、而且不會越開越多（S 初始值重複 customFlights:[] 修正）
const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();await ctx.route(/workers\.dev/,r=>r.abort());
const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,160)));
const snap=()=>p.evaluate(()=>{var L=(S.customFlights||[]),k={},dup=0;L.forEach(f=>{var x=f.code+'|'+f.fr+'|'+f.to+'|'+(f.effFrom||'');if(k[x])dup++;k[x]=1});return {n:L.length,dup:dup,codes:L.map(f=>f.code).slice(0,40).join(' ')}});
await p.goto('file://'+F,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
console.log('load1',JSON.stringify(await snap()));
await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='status';render()});
await p.evaluate(async()=>{await kgmAdminAiAskR929('加開 TPE-NRT 11/20')});await p.evaluate(async()=>{await kgmAdminAiAskR929('1')});
console.log('created',JSON.stringify(await snap()));await p.waitForTimeout(4000);
for(let i=2;i<=4;i++){await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(3000);
  console.log('reload'+i,JSON.stringify(await snap()),'tail',await p.evaluate(()=>{var n=0;Object.keys(S.tailAssign||{}).forEach(t=>(S.tailAssign[t]||[]).forEach(x=>{if(x&&/^KX200[12]$/.test(x.code))n++}));return n}),
   'search',await p.evaluate(()=>{try{return [].concat(FLIGHTS,S.customFlights).filter(f=>f.code==='KX2001'&&flyOn(f,new Date('2026-11-20T12:00:00'))).length}catch(e){return String(e)}}))}
console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();

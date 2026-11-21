const {chromium}=require('playwright');
const HASH=async(p)=>p.evaluate(()=>{const h=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return (x>>>0).toString(36)};const out=[];
  for(let i=0;i<60;i+=3){const d=addDays(todayISO(),i);let pl=null;try{if(window.kgmCrewHasDayR121&&!window.kgmCrewHasDayR121(d)){out.push(d+':nd');continue}pl=kgmCrewPlanR121(d)}catch(e){out.push(d+':err');continue}
   const s=(pl&&pl.flights||[]).map(f=>(f.code||'')+'|'+(f.pilots||[]).map(x=>x.empId+x.posCode).join(',')+'|'+(f.cabin||f.cabinCrew||[]).map(x=>x.empId||x).join(',')).join(';');out.push(d.slice(5)+':'+h(s))}return out.join(' ')});
const admin=p=>p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='dashboard';render()});
(async()=>{const mode=process.argv[2];const b=await chromium.launch();const ctx=await b.newContext();const p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);await admin(p);
 if(mode==='mid'){await p.waitForFunction(()=>window.KGM_CREW_PART_R1026C&&window.KGM_CREW_PART_R1026C.cur>=addDays(todayISO(),20),null,{timeout:600000,polling:2000});
   console.log('part',JSON.stringify(await p.evaluate(()=>window.KGM_CREW_PART_R1026C)));await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(2500);await admin(p);
   await p.waitForFunction(()=>window.KGM_CREW_RESTORE_R1025B,null,{timeout:300000,polling:2000}).catch(()=>{});console.log('restore',JSON.stringify(await p.evaluate(()=>window.KGM_CREW_RESTORE_R1025B)))}
 const t0=Date.now();await p.waitForFunction(()=>window.KGM_CREW_SAVE_R1025B,null,{timeout:900000,polling:2000});console.log(mode,'done after',Math.round((Date.now()-t0)/1000),'s',JSON.stringify(await p.evaluate(()=>window.KGM_CREW_SAVE_R1025B)));
 console.log(mode,'HASH',await HASH(p));await b.close()})();

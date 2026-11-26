const {chromium}=require('playwright');const crypto=require('crypto');const fs=require('fs');
(async()=>{const dir='/tmp/j/prof25m';fs.rmSync(dir,{recursive:true,force:true});
 let ctx=await chromium.launchPersistentContext(dir,{});let p=await ctx.newPage();
 await p.goto('file:///tmp/j/kgm1025A_w43.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(8000);
 await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';render()});
 for(let i=0;i<200&&!(await p.evaluate(()=>!!window.KGM_FULLDONE_1006A));i++)await p.waitForTimeout(1000);await p.waitForTimeout(30000);
 console.log('1025A ran; cursor',await p.evaluate(()=>window.kgmCrewWarmProgressR923&&window.kgmCrewWarmProgressR923()));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 for(let i=0;i<400;i++){const sv=await p.evaluate(()=>window.KGM_CREW_SAVE_R1025B);if(sv)break;await p.waitForTimeout(1000)}
 const r=await p.evaluate(()=>{const T=todayISO();const D=n=>{const t=new Date(T+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};const out=[];
  for(let i=-5;i<=60;i++){const pl=kgmCrewPlanR121(D(i));(pl.flights||[]).forEach(f=>out.push(D(i)+'|'+f.code+'|'+f.fr+'|'+(f.pilots||[]).map(q=>q.empId+':'+(q.posCode||'')).join(',')+'|'+(f.cabin||[]).map(q=>q.empId).join(',')+'|'+((S.crewPositioningR121||{})[D(i)+'|'+f.code+'|'+f.fr+'|'+f.to]||[]).map(q=>q.empId).join(',')))}return out});
 fs.writeFileSync('/tmp/j/cwe_M.txt',r.join('\n'));console.log('upgraded lines',r.length,'hash',crypto.createHash('md5').update(r.join('\n')).digest('hex'));await ctx.close()})();

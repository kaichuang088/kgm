const {chromium}=require('playwright');const crypto=require('crypto');
(async()=>{const EARLY=process.env.EARLY==='1';const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(6000);
 if(EARLY)await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';render()});
 for(let i=0;i<300;i++){const sv=await p.evaluate(()=>window.KGM_CREW_SAVE_R1025B);if(sv)break;await p.waitForTimeout(1000)}
 const r=await p.evaluate(()=>{const T=todayISO();const D=n=>{const t=new Date(T+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};const out=[];
  for(let i=-5;i<=60;i++){const pl=kgmCrewPlanR121(D(i));(pl.flights||[]).forEach(f=>out.push(D(i)+'|'+f.code+'|'+f.fr+'|'+(f.pilots||[]).map(q=>q.empId+':'+(q.posCode||'')).join(',')+'|'+(f.cabin||[]).map(q=>q.empId).join(',')+'|'+((S.crewPositioningR121||{})[D(i)+'|'+f.code+'|'+f.fr+'|'+f.to]||[]).map(q=>q.empId).join(',')))}return out});
 require('fs').writeFileSync('/tmp/j/cwe_'+(EARLY?'E':'N')+'.txt',r.join('\n'));console.log('early-tab',EARLY,'lines',r.length,'hash',crypto.createHash('md5').update(r.join('\n')).digest('hex'));await b.close()})();

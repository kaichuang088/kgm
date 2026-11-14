const {chromium}=require('playwright');const crypto=require('crypto');const fs=require('fs');
async function plan(p){return p.evaluate(()=>{const T=todayISO();const D=n=>{const t=new Date(T+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};const out=[];
  for(let i=0;i<=60;i++){if(!kgmCrewHasDayR121(D(i)))return {miss:D(i)};const pl=kgmCrewPlanR121(D(i));(pl.flights||[]).forEach(f=>out.push(D(i)+'|'+f.code+'|'+f.fr+'|'+(f.pilots||[]).map(q=>q.empId+':'+(q.posCode||'')).join(',')+'|'+(f.cabin||[]).map(q=>q.empId).join(',')))}return {lines:out}})}
const H=a=>crypto.createHash('md5').update(a.join('\n')).digest('hex');
async function waitFull(p,tag,maxS){const t0=Date.now();let last='';for(let i=0;i<maxS;i++){const r=await p.evaluate(()=>({c:window.kgmCrewWarmProgressR923&&window.kgmCrewWarmProgressR923(),full:!!window.KGM_FULLDONE_1006A,sv:window.KGM_CREW_SAVE_R1025B||null,rs:window.KGM_CREW_RESTORE_R1025B||null}));
   if(i%10===0||r.sv)console.log(tag,Math.round((Date.now()-t0)/1000)+'s','cursor',r.c,'full',r.full,'restore',JSON.stringify(r.rs),'save',r.sv?r.sv.cur+' '+r.sv.ms+'ms':'');if(r.sv)return Date.now()-t0;await p.waitForTimeout(1000)}return -1}
(async()=>{
 const dir='/tmp/j/prof25';fs.rmSync(dir,{recursive:true,force:true});
 let ctx=await chromium.launchPersistentContext(dir,{});let p=await ctx.newPage();const T0=Date.now();
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 const tA=await waitFull(p,'A1',400);const a=await plan(p);console.log('A1 full after',Math.round((Date.now()-T0)/1000),'s lines',a.lines&&a.lines.length,'miss',a.miss,'hash',a.lines&&H(a.lines));
 await p.reload({waitUntil:'domcontentloaded',timeout:300000});const t1=Date.now();
 let ready=-1;for(let i=0;i<120;i++){const ok=await p.evaluate(()=>{const T=todayISO();const t=new Date(T+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+59);return !!(window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(t.toISOString().slice(0,10)))});if(ok){ready=Date.now()-t1;break}await p.waitForTimeout(500)}
 const rs=await p.evaluate(()=>[window.KGM_CREW_RESTORE_R1025B,window.KGM_FULLDONE_1006A?1:0,window.kgmCrewWarmProgressR923()]);console.log('A2 reload: 60 days ready after',ready,'ms restore',JSON.stringify(rs));
 await p.waitForTimeout(40000);const a2=await plan(p);console.log('A2 after fulldone lines',a2.lines&&a2.lines.length,'miss',a2.miss,'hash',a2.lines&&H(a2.lines),'restore',JSON.stringify(await p.evaluate(()=>window.KGM_CREW_RESTORE_R1025B)));
 await ctx.close();
 const b=await chromium.launch();const pb=await (await b.newContext()).newPage();await pb.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await waitFull(pb,'B',400);const bb=await plan(pb);console.log('B lines',bb.lines&&bb.lines.length,'hash',bb.lines&&H(bb.lines));
 if(a.lines&&bb.lines){let d=0;for(let i=0;i<Math.max(a.lines.length,bb.lines.length);i++)if(a.lines[i]!==bb.lines[i])d++;console.log('A vs B diff lines',d)}
 await b.close()})();

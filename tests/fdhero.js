const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(8000);
 const off=+(process.argv[2]||0);
 const L=await p.evaluate(off=>{const td=addDays(todayISO(),off);return [].concat(FLIGHTS,S.customFlights||[]).filter(f=>f&&!f.partner&&!f.via&&/^KX\d+$/.test(f.code)&&flyOn(f,new Date(td+'T12:00:00'))).map(f=>[f.code,td,f.fr,f.to])},off);
 const out=[];
 for(const x of L.slice(0,+(process.argv[3]||400))){
   await p.evaluate(x=>kgmFdOpenR1025B(...x),x);await p.waitForTimeout(250);
   const r=await p.evaluate(()=>{const h=document.querySelector('.r7-ops-hero');if(!h)return null;const m={};h.querySelectorAll('.r7-metric').forEach(e=>{m[e.querySelector('small').innerText.trim()]=e.querySelector('b').innerText.trim()});const st=document.querySelector('.k25fd-id .k25fd-st');return {m,st:st?st.innerText:''}},);
   if(!r)continue;const s=(r.m['SCHEDULED']||'').split('/')[0].trim(),e=(r.m['EST DEP / ARR']||'').split('/')[0].trim();
   const mm=t=>{const q=t.split(':');return +q[0]*60+(+q[1])};let d=mm(e)-mm(s);if(d>720)d-=1440;if(d<-720)d+=1440;
   const sea=await p.evaluate(x=>{const f=[].concat(FLIGHTS,S.customFlights||[]).find(f=>f.code===x[0]&&f.fr===x[2]&&f.to===x[3]);const s=kgmSeasonFlightR48(f,x[1])||f;return f.dep+'>'+s.dep},x);
   out.push([x.join(' '),s,e,d,r.st,sea].join(' | '));
 }
 out.sort((a,b)=>Math.abs(+b.split(' | ')[3])-Math.abs(+a.split(' | ')[3]));console.log(out.slice(0,25).join('\n'));console.log('n',out.length,'errors',errs);await b.close()})();

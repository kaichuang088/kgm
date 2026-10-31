const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(8000);
 const hero=async()=>p.evaluate(()=>{const h=document.querySelector('.r7-ops-hero');const m={};if(h)h.querySelectorAll('.r7-metric').forEach(e=>{m[e.querySelector('small').innerText.trim()]=e.querySelector('b').innerText.trim()});const st=document.querySelector('.k25fd-id dd .k25fd-st');const w=document.querySelector('.k25fd-id .k27fd-why');return {m,st:st?st.innerText:'',why:w?w.innerText:''}});
 // 1. season times for KX331 / KX19 tomorrow
 const tm=await p.evaluate(()=>addDays(todayISO(),1));
 for(const x of [['KX331',tm,'SZX','TPE'],['KX19',tm,'NRT','TPE']]){await p.evaluate(x=>kgmFdOpenR1025B(...x),x);await p.waitForTimeout(1200);
   const sea=await p.evaluate(x=>{const f=FLIGHTS.find(f=>f.code===x[0]&&f.fr===x[2]);const s=kgmSeasonFlightR48(f,x[1]);return s.dep+'/'+s.arr},x);console.log('T1',x[0],'season',sea,JSON.stringify(await hero()))}
 // 2. force a delay via prediction: pick a flight and set override Delayed w/ reason
 const d2=await p.evaluate(tm=>{const f=FLIGHTS.find(f=>f.code==='KX260');const s=kgmSeasonFlightR48(f,tm);const nd=(()=>{const q=s.dep.split(':');const n=+q[0]*60+(+q[1])+120;return String(Math.floor(n/60)%24).padStart(2,'0')+':'+String(n%60).padStart(2,'0')})();S.flightOverrides['KX260_'+tm]={status:'Delayed',dep:nd,arr:s.arr,reason:'同飛機前段延誤（KX259）'};kgmFdOpenR1025B('KX260',tm,f.fr,f.to);return s.dep+'>'+nd},tm);
 await p.waitForTimeout(1200);console.log('T2 override',d2,JSON.stringify(await hero()));
 const rowst=await p.evaluate(()=>{const o=kgmOpsPredR1026C(FLIGHTS.find(f=>f.code==='KX260'),addDays(todayISO(),1));return o&&[o.status,o.depDelta,o.reasonR1026C,o.estDep].join('|')});console.log('T2 pred',rowst);
 await p.evaluate(tm=>{delete S.flightOverrides['KX260_'+tm]},tm);
 // count predicted delays (no override) over tomorrow
 const dl=await p.evaluate(tm=>{const r=[];FLIGHTS.filter(f=>!f.via&&!f.partner&&/^KX\d+$/.test(f.code)&&flyOn(f,new Date(tm+'T12:00:00'))).forEach(f=>{const o=kgmOpsPredR1026C(f,tm);if(o&&o.status==='Delayed')r.push(f.code+' +'+o.depDelta+' '+o.reasonR1026C)});return r},tm);console.log('T3 delayed tomorrow',dl.length,dl.slice(0,6));
 // 4. search KX12
 await p.evaluate(()=>{S.opsSelectedR7='';S.opsQueryR7='';render()});await p.waitForTimeout(800);
 await p.evaluate(tm=>{const q=document.getElementById('r7OpsQ');q.value='KX12';document.getElementById('r7OpsDate').value=tm;searchOpsR7()},tm);await p.waitForTimeout(1500);
 console.log('T4 search',await p.evaluate(()=>({sel:S.opsSelectedR7,pills:[...document.querySelectorAll('.r7-ops-tabs button')].map(b=>b.innerText.replace(/\s+/g,' ')).slice(0,6),id:(document.querySelector('.k25fd-id .cd b')||{}).innerText})));
 // 5. manifest web CI and blank rows
 await p.evaluate(()=>{const b=document.querySelector('.k25fd-tabs button[data-t="man"]');b&&b.click()});await p.waitForTimeout(1500);
 console.log('T5 man',JSON.stringify(await p.evaluate(()=>{const sec=document.querySelector('[data-k23fd="man"]');const H=[...sec.querySelectorAll('thead th')].map(h=>h.innerText.trim());const ci=H.indexOf('網路報到');const vals={};let dash=0,blank=[];sec.querySelectorAll('tbody tr').forEach((r,i)=>{const c=[...r.children];if(c.length>=5){const t=c[ci]&&c[ci].innerText.trim();vals[t]=(vals[t]||0)+1;c.forEach((x,j)=>{const t2=x.innerText.trim();if(/^[—–-]$/.test(t2))dash++;if(!t2&&!x.querySelector('input,select,button'))blank.push(i+':'+H[j])})}else{const t=r.innerText.replace(/\s+/g,' ').trim();if(!t||c.length<2&&t.length<3)blank.push(i+':row:'+c.length+':'+t)}});return {vals,dash,blank:blank.slice(0,12),nb:blank.length,rows:sec.querySelectorAll('tbody tr').length}})));
 await p.screenshot({path:'/tmp/j/fd27_man.png'});
 // 6. pax card close on switch
 await p.evaluate(()=>{const b=document.querySelector('[data-k23fd="man"] .r7-name-td button');b&&b.click()});await p.waitForTimeout(1500);
 const c1=await p.evaluate(()=>!!document.querySelector('.r7-pax-panel'));
 await p.evaluate(()=>{const b=document.querySelector('.k25fd-tabs button[data-t="bm"]');b&&b.click()});await p.waitForTimeout(1500);
 const c2=await p.evaluate(()=>{const e=document.querySelector('.r7-pax-panel');return e?e.offsetHeight:0});console.log('T6 card open',c1,'after switch height',c2);
 // 7. bm order
 console.log('T7 bm',JSON.stringify(await p.evaluate(()=>{const T={'':0,Bronze:1,Silver:2,Gold:3,Platinum:4,Diamond:5};const rows=[...document.querySelectorAll('.k23bm tbody tr')];let g='',bad=0,seq=[];let prev=null;rows.forEach(r=>{if(r.classList.contains('k23bm-g')){g=r.innerText.trim();prev=null;seq.push('#'+g);return}const c=[...r.children].map(x=>x.innerText.trim());const fare=c[3].split('\n')[0],tier=c[4];const pct=(FARES[fare]||{}).pct||9;const k=[pct,T[tier]||0];if(prev&&(k[0]<prev[0]||(k[0]===prev[0]&&k[1]<prev[1])))bad++;prev=k;if(seq.length<40)seq.push(fare+':'+(tier||'-'))});return {bad,seq:seq.slice(0,40).join(' ')}})));
 await p.screenshot({path:'/tmp/j/fd27_bm.png'});
 console.log('errors',errs);await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='warning'&&/fd25|map25/.test(m.text()))errs.push('W:'+m.text().slice(0,200))});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(5000);
 const L=await p.evaluate(()=>{const td=todayISO();const now=new Date();const nm=now.getHours()*60+now.getMinutes();const m=t=>{const q=String(t).split(':');return +q[0]*60+(+q[1])};
   const fs=FLIGHTS.filter(f=>!f.via&&!f.partner&&/^KX\d+$/.test(f.code)&&flyOn(f,new Date(td+'T12:00:00')));
   const pick=[];const add=f=>{if(f&&!pick.find(x=>x[0]===f.code&&x[2]===f.fr))pick.push([f.code,td,f.fr,f.to,(kgmSeasonFlightR48(f,td)||f).dep])};
   add(fs.find(f=>f.fr==='TPE'&&m(kgmSeasonFlightR48(f,td).dep)>nm+30));add(fs.find(f=>f.fr==='TSA'));add(fs.find(f=>f.fr==='TPE'&&m(kgmSeasonFlightR48(f,td).dep)<nm-60));add(fs.find(f=>f.fr!=='TPE'&&f.to==='TPE'));add(fs.find(f=>f.code==='KX12'));
   const d3=addDays(td,3);const f3=FLIGHTS.find(f=>f.code==='KX12'&&flyOn(f,new Date(d3+'T12:00:00')));if(f3)pick.push([f3.code,d3,f3.fr,f3.to,'']);
   const d1=addDays(td,1);const f1=FLIGHTS.find(f=>f.code==='KX7'&&flyOn(f,new Date(d1+'T12:00:00')));if(f1)pick.push([f1.code,d1,f1.fr,f1.to,'']);return pick});
 for(const x of L){await p.evaluate(x=>{kgmFdOpenR1025B(x[0],x[1],x[2],x[3])},x);await p.waitForTimeout(+(process.env.WT||3500));
   const r=await p.evaluate(()=>{const c=document.querySelector('[data-k23fd="route"]');if(!c)return 'NO ROUTE CARD';const img=c.querySelector('.k25map img.k25map-img');const lk=c.querySelector('.k27map-lock');return JSON.stringify({vis:c.offsetHeight>0,locked:c.classList.contains('k27locked'),lock:lk?lk.innerText.replace(/\s+/g,' ').slice(0,120):'',img:!!(img&&img.complete&&img.naturalWidth),ready:!!c.querySelector('.k25map.ready'),fly:(c.querySelector('.k27fly')||{}).innerText||''})});
   console.log(x.join(' '),r);
   if(x[0]==='KX7'||x[0]==='KX12')await p.screenshot({path:'/tmp/j/fdmap_'+x[0]+'_'+x[1]+'.png'});}
 console.log('errors',errs);await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(2500);
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='flightdata';S.fdTabR1025B='man';render()});
 await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:300000,polling:2000});await p.waitForTimeout(5000);
 const L=await p.evaluate(()=>{const out=[];[0,1].forEach(o=>{const td=addDays(todayISO(),o);[].concat(FLIGHTS).filter(f=>f&&!f.partner&&!f.via&&/^KX\d+$/.test(f.code)&&flyOn(f,new Date(td+'T12:00:00'))).forEach((f,i)=>{if(i%4===0)out.push([f.code,td,f.fr,f.to])})});return out});
 let tot=0;
 for(const x of L.slice(0,+(process.argv[2]||60))){
   await p.evaluate(x=>{kgmFdOpenR1025B(...x);S.fdTabR1025B='man'},x);await p.waitForTimeout(400);
   const r=await p.evaluate(()=>{const sec=document.querySelector('[data-k23fd="man"]');if(!sec)return null;const H=[...sec.querySelectorAll('thead th')].map(h=>h.innerText.trim());const bad=[];
     sec.querySelectorAll('tbody tr').forEach((r,i)=>{const c=[...r.children];const span=c.reduce((n,x)=>n+(+x.colSpan||1),0);const t=r.innerText.replace(/\s+/g,' ').trim();
       if(c.length===1&&span>=H.length-1){if(!t)bad.push(i+':emptyband');return}
       if(span!==H.length)bad.push(i+':span'+span+'/'+H.length+':'+t.slice(0,50));
       c.forEach((x,j)=>{const tt=x.innerText.trim();if(!tt&&!x.querySelector('input,select,button,img,svg'))bad.push(i+':'+H[j]+':'+t.slice(0,40))});
       if(r.offsetHeight<8)bad.push(i+':h'+r.offsetHeight+':'+t.slice(0,40))});return {n:sec.querySelectorAll('tbody tr').length,bad:bad.slice(0,6),nb:bad.length}});
   if(r&&r.nb){tot++;console.log(x.join(' '),JSON.stringify(r))}
 }
 console.log('flights',L.length,'with issues',tot,'errors',errs);await b.close()})();

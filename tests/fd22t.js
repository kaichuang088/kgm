const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});await p.waitForTimeout(5000);
for(const role of ['pilot','cabin','ground']){
 const who=await p.evaluate((role)=>{const T=todayISO();let pick=null;
   const cand=(S.staff||[]).filter(x=>x.role===role&&x.active!==false&&(role!=='ground'||x.station==='TPE'));
   for(const s of cand.slice(0,400)){let n=0;
     if(role==='ground'){for(let i=0;i<3;i++){const P=kgmGroundPlanR1008A('TPE',addDays(T,i));const q=P.people[s.empId];if(q&&!q.off&&(q.tasks||[]).some(t=>(t.flights||[]).length))n++}}
     else{const r=kgmRosterR196(s.empId,7)||[];n=r.filter(x=>(x.legs||[]).length).length}
     if(n>=2){pick=s;break}}
   pick=pick||cand[0];S.view='admin';S.adminAuthed=true;S.adminUser={empId:pick.empId,name:pick.name,role:role};S.adminTab='flightdata';S.opsSelectedR7='';S.opsQueryR7='';render();return pick.empId},role);
 let ready=false;for(let i=0;i<40&&!ready;i++){await p.waitForTimeout(1500);ready=await p.evaluate(()=>{const m=kgmFdMineR1022A();return !!(m&&m.ready)})}
 await p.waitForTimeout(1500);await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:SP+role+'_top.png'});
 const r=await p.evaluate(()=>{const m=kgmFdMineR1022A(),o={};o.ready=m&&m.ready;o.keys=m?m.keys:[];
   o.search=!!document.querySelector('.r7-ops-search')&&getComputedStyle(document.querySelector('.r7-ops-search')).display!=='none';
   const vis=s=>s&&s.offsetParent!==null&&getComputedStyle(s).display!=='none';
   o.sections=[...document.querySelectorAll('[data-k22]')].map(s=>s.getAttribute('data-k22')+(vis(s)?'':'(hidden)')).join(',');
   o.toggles=document.querySelectorAll('.k22-tg').length;o.bar=!!document.querySelector('.k22-bar');
   const pdf=[...document.querySelectorAll('.r7-admin button')].find(b=>/PDF/.test(b.textContent));o.pdf=pdf?vis(pdf):'none';
   o.tabs=[...document.querySelectorAll('.r7-ops-tabs button')].filter(vis).map(b=>b.textContent.trim()).join(' / ');
   o.selected=S.opsSelectedR7;o.hero=(document.querySelector('.r7-ops-hero h2')||{}).textContent;
   o.days=(m&&m.days||[]).map(d=>d.date.slice(5)+':'+(d.legs.map(l=>l.code+' '+l.fr+'-'+l.to).join('+')||(d.dh.length?'DH':'-'))).join(' ');
   return o});
 // open each own key, confirm the page shows that flight
 const chk=await p.evaluate(async()=>{const m=kgmFdMineR1022A();const out=[];for(const k of m.keys){kgmFdOpenR1022A(k);await new Promise(r=>setTimeout(r,120));const h=(document.querySelector('.r7-ops-hero h2')||{}).textContent||'NONE';const pk=k.split('|');out.push(h.indexOf(pk[0])>=0&&h.indexOf(pk[2])>=0&&h.indexOf(pk[3])>=0?'ok':('FAIL '+k+' → '+h))}
   /* try selecting a foreign key */ const before=S.opsSelectedR7;selectOpsR7('KX1|2026-12-01|DOH|TPE');const blocked=S.opsSelectedR7===before;return out.filter(x=>x!=='ok').concat(['opened '+out.filter(x=>x==='ok').length+'/'+out.length,'foreign blocked '+blocked]).join('; ')});
 console.log(role,who,JSON.stringify(r),'\n  open-check:',chk);
 await p.screenshot({path:SP+role+'.png',fullPage:false});
}
// collapse test with ceo
await p.evaluate(()=>{S.adminUser={empId:'MASTER',name:'主控管理員',role:'ceo'};S.opsQueryR7='KX54';S.opsDateR7=addDays(todayISO(),2);S.opsSelectedR7='';render()});await p.waitForTimeout(1500);
const c=await p.evaluate(async()=>{const o={};o.search=!!document.querySelector('.r7-ops-search');o.secs=[...document.querySelectorAll('[data-k22]')].map(s=>s.getAttribute('data-k22')).join(',');
 const h0=document.querySelector('.r7-manifest').getBoundingClientRect().height;kgmFdColR1022A('man');await new Promise(r=>setTimeout(r,100));const h1=document.querySelector('.r7-manifest').getBoundingClientRect().height;
 kgmFdColR1022A('-');await new Promise(r=>setTimeout(r,100));o.allCol=[...document.querySelectorAll('[data-k22]')].every(s=>s.classList.contains('k22-col'));
 render();await new Promise(r=>setTimeout(r,500));o.persistAfterRender=[...document.querySelectorAll('[data-k22]')].every(s=>s.classList.contains('k22-col'));o.pageH=document.body.scrollHeight;
 kgmFdColR1022A('*');await new Promise(r=>setTimeout(r,100));o.pageHExpanded=document.body.scrollHeight;o.manH=[Math.round(h0),Math.round(h1)];return JSON.stringify(o)});
console.log('ceo collapse',c);
await p.evaluate(()=>{kgmFdColR1022A('-')});await p.waitForTimeout(300);await p.screenshot({path:SP+'ceo_collapsed.png',fullPage:true});
await p.evaluate(()=>{kgmFdColR1022A('*')});
console.log('pageerrors',errs.length,errs.slice(0,3));await b.close()})();

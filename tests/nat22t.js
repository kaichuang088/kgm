const {chromium}=require('playwright');const SH='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
 const errs=[];p.on('pageerror',e=>{if(!/寄信/.test(e.message))errs.push(e.message)});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(15000);
 await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='sched';render()});await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const cols=[...document.querySelectorAll('.k196-col')];return cols.map(c=>{const sel=c.querySelector('select.k22-nat');const rows=[...c.querySelectorAll('tbody tr[data-emp]')];
   const cnt={};rows.forEach(r=>cnt[r.getAttribute('data-nat')]=(cnt[r.getAttribute('data-nat')]||0)+1);return (c.querySelector('.k196-ch b')||{}).textContent+' rows '+rows.length+' nat '+JSON.stringify(cnt)+' opts '+(sel?[...sel.options].map(o=>o.text).join('/'):'NO SELECT')}).join('\n')}));
 // filter TH in cabin col
 await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];const s=c.querySelector('select.k22-nat');s.value='TH';s.dispatchEvent(new Event('change'))});await p.waitForTimeout(400);
 console.log('TH filter',await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];const v=[...c.querySelectorAll('tbody tr[data-emp]')].filter(r=>!r.hidden);return v.length+' '+v.slice(0,3).map(r=>r.innerText.replace(/\s+/g,' ')).join(' | ')+' head:'+c.querySelector('.k196-ch em').textContent}));
 // combine with search
 await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];const i=c.querySelector('input[type=search]');i.value='Srisuk';i.dispatchEvent(new Event('input'))});await p.waitForTimeout(300);
 console.log('TH+search',await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];return [...c.querySelectorAll('tbody tr[data-emp]')].filter(r=>!r.hidden).map(r=>r.innerText.replace(/\s+/g,' ')).join(' | ')}));
 // rerender persists
 await p.evaluate(()=>render());await p.waitForTimeout(800);
 console.log('after render',await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];return c.querySelector('select.k22-nat').value+' visible '+[...c.querySelectorAll('tbody tr[data-emp]')].filter(r=>!r.hidden).length}));
 await p.evaluate(()=>{const c=[...document.querySelectorAll('.k196-col')][1];const i=c.querySelector('input[type=search]');i.value='';i.dispatchEvent(new Event('input'))});await p.waitForTimeout(300);
 await p.evaluate(()=>{document.querySelector('.k196-col').scrollIntoView({block:'start'})});await p.waitForTimeout(300);
 await p.screenshot({path:SH+'nat_roster.png'});
 // open a Thai crew roster
 const th=await p.evaluate(()=>{const s=S.staff.find(x=>x.nationality==='TH'&&x.role==='cabin');kgmCrewViewR196(s.empId);return s.empId+' '+s.name});console.log('view',th);await p.waitForTimeout(4000);
 console.log('thai roster text',await p.evaluate(()=>{const t=document.getElementById('app').innerText;const i=t.indexOf('班表');return t.slice(i,i+600).replace(/\s+/g,' ')}));
 await p.screenshot({path:SH+'nat_thai_roster.png'});
 console.log('errs',errs.slice(0,4));await b.close()})();

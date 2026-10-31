const {chromium}=require('playwright');const SH='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
const errs=[];p.on('pageerror',e=>{if(!/寄信/.test(e.message))errs.push(e.message)});const dl=[];p.on('dialog',d=>{dl.push(d.message());d.accept()});
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);
// J leave
await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='cabin'&&x.active!==false);S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='leave';render()});await p.waitForTimeout(1500);
console.log('J form selects',await p.evaluate(()=>[...document.querySelectorAll('#app select')].map(s=>[...s.options].map(o=>o.text).join('/')).filter(t=>/全天/.test(t)).join(' | ')));
await p.evaluate(()=>{S._lvPart='part';render()});await p.waitForTimeout(600);
console.log('J part inputs',await p.evaluate(()=>document.querySelectorAll('#app input[type=time]').length));
await p.evaluate(()=>{S._lvStart=addDays(todayISO(),20);S._lvEnd=S._lvStart;S._lvT1='09:00';S._lvT2='13:00';render()});await p.waitForTimeout(500);
console.log('J hours field',await p.evaluate(()=>[...document.querySelectorAll('#app input[disabled]')].map(i=>i.value).join(' | ')));
await p.screenshot({path:SH+'lv_form.png',fullPage:true});
await p.evaluate(()=>{S._lvReason='看診（測試）';S._lvType='personal';doFileLeave2()});await p.waitForTimeout(800);
console.log('J rec',await p.evaluate(()=>{const l=S.leave[0];return JSON.stringify({empId:l.empId,start:l.start,end:l.end,days:l.days,part:l.part,status:l.status})}),'dialogs',dl.slice(-2));
// bad time
await p.evaluate(()=>{S._lvT1='14:00';S._lvT2='10:00';S._lvReason='x';doFileLeave2()});console.log('J bad',dl.slice(-1));
await p.evaluate(()=>{S._lvT1='';S._lvT2='';doFileLeave2()});console.log('J empty',dl.slice(-1));
// CEO list shows hours
await p.evaluate(()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminUser=st;S.adminTab='leave';render()});await p.waitForTimeout(1200);
console.log('J list',await p.evaluate(()=>{const t=document.getElementById('app').innerText;const i=t.indexOf('請假時段');return i>=0?t.slice(i,i+40).replace(/\s+/g,' '):'NONE'}));
// M action history
await p.evaluate(()=>{S.adminTab='history';render()});await p.waitForTimeout(1200);
console.log('M tab',await p.evaluate(()=>{const h=[...document.querySelectorAll('.adm-sec')].map(x=>x.textContent).filter(t=>/動作歷史/.test(t));return JSON.stringify(h)+' audit '+(S.audit||[]).length+' whoSample '+JSON.stringify((S.audit||[]).slice(0,3).map(a=>a.who))}));
await p.evaluate(()=>{for(let i=0;i<6;i++)S.audit.unshift({who:(i%2?'王小明(K60012)':'林雅婷(K10732)'),act:'測試動作',detail:'t'+i,at:new Date().toISOString()});render()});
const emp=await p.evaluate(()=>{const w=(S.audit||[]).map(a=>a.who).filter(Boolean);return 'K10732'});
await p.evaluate(e=>kgmHistEmpR1022A(e),emp);await p.waitForTimeout(800);
console.log('M filter',emp,await p.evaluate(e=>{const all=(S.audit||[]).filter(a=>String(a.who||'').toUpperCase().includes(e.toUpperCase())).length;const t=document.getElementById('app').innerText;const m=/全部（(\d+)）/.exec(t);return 'expect '+all+' shown-opt '+(m&&m[1])+' rows '+document.querySelectorAll('#app table tbody tr').length+' clear '+(/清除（/.test(t))},emp));
try{await p.locator('.adm-sec').first().scrollIntoViewIfNeeded();await p.screenshot({path:SH+'hist_f.png'})}catch(e){console.log('shot fail')}
await p.evaluate(()=>kgmHistEmpR1022A('ZZZ999'));await p.waitForTimeout(500);console.log('M none',await p.evaluate(()=>{const m=/全部（(\d+)）/.exec(document.getElementById('app').innerText);return m&&m[1]}));
await p.evaluate(()=>kgmHistEmpR1022A(''));
// auction order
await p.evaluate(()=>{S.adminTab='auctions';render()});await p.waitForTimeout(4000);
console.log('B auc',await p.evaluate(()=>{const g=[...document.querySelectorAll('#app .k920-grp')];const bd=g.filter(x=>x.querySelector('.k929-bdh'));let bad=0;for(let i=1;i<bd.length;i++){const a=bd[i-1].innerText,b=bd[i].innerText;const fa=a.split('\n')[0].replace(/^.*?(KX\d+)/,'$1').slice(0,30),fb=b.split('\n')[0].replace(/^.*?(KX\d+)/,'$1').slice(0,30);if(fa===fb&&/豪華經濟艙/.test(a.split('\n').slice(0,3).join(' '))&&/商務艙/.test(b.split('\n').slice(0,3).join(' ')))bad++}
 return 'bigdeal groups '+bd.length+' premium-before-business '+bad+' | '+bd.slice(0,10).map(x=>(x.querySelector('h3')||{}).innerText.replace(/\s+/g,' ').slice(0,70)).join(' || ')}));
console.log('errs',errs.slice(0,5));await b.close()})();

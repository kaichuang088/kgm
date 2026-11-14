// 1103A：地勤實體報到——Residence 旅客行李額度（名單同一份艙等）；報到完成列印（收據／登機證／貴賓室邀請卡）、稍後列印、下一位一起印
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:1100},timezoneId:'Asia/Taipei'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{window.KGM_NOPRINT_R1103A=1;window.alert=()=>{};window.confirm=()=>true;
 const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX5'&&x.fr==='TPE'&&!x.via);const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');render();
 await new Promise(r=>setTimeout(r,2500));
 const rows=[...document.querySelectorAll('tr')].filter(tr=>tr.querySelector('input[type=checkbox][onchange*="physical"]'));
 const pick=(re)=>rows.find(tr=>re.test(tr.innerText)&&!tr.querySelector('input[onchange*="physical"]').checked);
 const out={rows:rows.length};
 async function doCI(tr,bags,weights){const cb=tr.querySelector('input[onchange*="physical"]');cb.checked=true;cb.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,300));
   const s1=(document.querySelector('.r49-checkin')||{}).innerText||'';kgmCheckinNext49();await new Promise(r=>setTimeout(r,200));
   const allow=((document.querySelector('.r49-bag-allow')||{}).innerText||'').replace(/\s+/g,' ');
   kgmCheckinField49('bags',bags);kgmCheckinField49('weights',weights);const ok=document.querySelector('.r49-checkin input[type=checkbox]');if(ok){ok.checked=true;ok.dispatchEvent(new Event('change'))}
   try{kgmCheckinNext49()}catch(e){}await new Promise(r=>setTimeout(r,200));const s3=((document.querySelector('.r49-checkin')||{}).innerText||'').replace(/\s+/g,' ').slice(0,400);
   kgmCheckinFinish49();await new Promise(r=>setTimeout(r,500));if(!document.querySelector('.k31ci-pr')){window.__noPanel=(window.__noPanel||0)+1;render();await new Promise(r=>setTimeout(r,400))}const pr=document.querySelector('.k31ci-pr');return {allow,s3,panel:pr?pr.innerText.replace(/\s+/g,' '):'(none)'}}
 const res=rows.find(tr=>/Resident/.test(tr.innerText));out.resRow=res?res.innerText.replace(/\s+/g,' ').slice(0,120):'(no resident row)';
 if(res){out.res=await doCI(res,'3','30.5, 28.2, 31');out.resState=JSON.stringify(S.checkin49||null).slice(0,120);out.dbg={n:document.querySelectorAll('.r49-modal').length,parents:[...document.querySelectorAll('.r49-modal')].map(m=>m.parentElement.id||m.parentElement.tagName),fn:typeof checkinWizard49,html:(typeof checkinWizard49==='function'?checkinWizard49().slice(0,160):''),active:document.activeElement&&document.activeElement.tagName,view:S.view,tab:S.adminTab,rs:window.__noPanel};out.after=[...document.querySelectorAll('.r49-modal,.r49-checkin,[class*=k28bp],[class*=fr28]')].map(e=>e.className+': '+e.innerText.replace(/\s+/g,' ').slice(0,200));const c0=[...document.querySelectorAll('.k31ci-cb')][0];if(c0){kgmCiLaterR1103A(c0.getAttribute('data-me'));await new Promise(r=>setTimeout(r,1000))}else return out}
 const bz=pick(/Business|商務/)||pick(/Economy|經濟/);out.next=await doCI(bz,'3','23, 22.5, 24');
 out.queue=(window.KGM_CIQ_R1103A||[]).length;
 // 勾選稍後列印的那位一起印
 [...document.querySelectorAll('.k31ci-qb')].forEach(x=>x.checked=true);const me=[...document.querySelectorAll('.k31ci-cb')][0].getAttribute('data-me');kgmCiDoPrintR1103A(me);
 out.printed=window.KGM_CIPRINT_R1103A;out.docs=[...document.querySelectorAll('#k31pr .k31pr-page')].map(x=>x.querySelector('.k12bp-card')?'BP':(x.querySelector('.k31pr-rc')?'RECEIPT':(x.querySelector('.k31pr-lgcard')?'LOUNGE':'?')));
 const ec=rows.find(tr=>/Economy \/ E-|經濟/.test(tr.innerText)&&/Bronze/.test(tr.innerText)&&!tr.querySelector('input[onchange*="physical"]').checked);if(ec){out.eco=await doCI(ec,'3','23, 21, 22.4');const me2=[...document.querySelectorAll('.k31ci-cb')][0];if(me2){[...document.querySelectorAll('.k31ci-qb')].forEach(x=>x.checked=false);kgmCiDoPrintR1103A(me2.getAttribute('data-me'));out.ecoDocs=[...document.querySelectorAll('#k31pr .k31pr-page')].map(x=>x.querySelector('.k12bp-card')?'BP':(x.querySelector('.k31pr-rc')?'RECEIPT:'+x.innerText.replace(/\s+/g,' ').slice(0,160):'LOUNGE'))}}
 return out});
console.log(JSON.stringify(r,null,1));
await p.emulateMedia({media:'print'});await p.screenshot({path:'/tmp/j/ci33_print.png',fullPage:true});await p.emulateMedia({media:'screen'});
console.log('ERR',errs.slice(0,5));await b.close()})();

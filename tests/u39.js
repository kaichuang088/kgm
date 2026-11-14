// 1108B B12／B13／B14：員工票狀態候補前後、CEO 航班作業報告全部區塊、航班證明時刻＝前台航班動態
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(addDays(todayISO(),1)),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(2000);
/* B14 */
const b14=await p.evaluate(async()=>{const out=[];for(const off of [0,-1]){const d=addDays(todayISO(),off);S.view='status';S.fsQ20B=null;
  let buf='';const wo=window.open;window.open=function(){return {document:{open(){},write(h){buf+=h},close(){}},focus(){},print(){},close(){}}};
  try{openCertificate('KX181',d,'TPE','NRT')}catch(e){buf='ERR '+e.message}window.open=wo;
  const t=buf.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');const g=re=>{const m=re.exec(t);return m?m[1]:''};
  const ct=window.kgmCertTimesR1108B(FLIGHTS.find(x=>x.code==='KX181'&&x.fr==='TPE'),'KX181',d);
  out.push({d,schDep:g(/Scheduled Time of Departure \S+ (\d\d:\d\d)/),schArr:g(/Scheduled Time of Arrival \S+ (\d\d:\d\d)/),actDep:g(/Actual Time of Departure \S+ (\d\d:\d\d)/),actArr:g(/Actual Time of Arrival \S+ (\d\d:\d\d)/),pred:ct.predR1108B,boxes:(t.match(/[☑☐] 航班\S+/g)||[]).join(' ')})}
 return out});
console.log('B14',JSON.stringify(b14));
/* 前台航班動態卡片同一班同一天 */
const card=await p.evaluate(async()=>{const r=[];for(const off of [0,-1]){const d=addDays(todayISO(),off);S.view='status';S.fs20=Object.assign({},S.fs20||{},{mode:'no',q:'KX181',date:d});
  try{if(window.kgmFs20SetR1020B){}}catch(_){}render();await new Promise(r=>setTimeout(r,700));const el=[...document.querySelectorAll('.fs20-card,.fs20')].find(x=>/KX181/.test(x.innerText)&&/東京成田|NRT/.test(x.innerText));r.push({d,txt:el?el.innerText.replace(/\s+/g,' ').slice(0,260):(document.querySelector('#app').innerText.match(/KX180[\s\S]{0,200}/)||[''])[0].replace(/\s+/g,' ')})}return r});
console.log('CARD',JSON.stringify(card,null,1));
/* B12 */
const b12=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo')||S.staff[0];S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='stxstatus';S.stxStatusQR1004B={date:todayISO(),fr:'TPE'};render();await new Promise(r=>setTimeout(r,2500));render();await new Promise(r=>setTimeout(r,800));
 const rows=[...document.querySelectorAll('.k6ss tbody tr, table tr')].filter(r=>/員工票候補 [1-9]/.test(r.innerText)&&/候補前/.test(r.innerText));const r0=rows[0];if(!r0)return {none:true,n:document.querySelectorAll('.k6ss-p').length,sample:(document.querySelector('.k6ss')||{innerText:''}).innerText.slice(0,500)};
 const code=(r0.querySelector('.k6ss-f b')||{}).textContent;const txt=r0.innerText.replace(/\s+/g,' ');const btn=r0.querySelector('.k6ss-go button');btn&&btn.click();await new Promise(r=>setTimeout(r,800));
 const sp=document.querySelector('.k10sp');const st2=sp?sp.querySelector('.k10sp-seats').innerText.replace(/\s+/g,' '):'';const pred=sp?[...sp.querySelectorAll('.k10sp-v')].map(x=>x.innerText).join(' | '):'';try{kgmStxPrevCloseR1010A()}catch(_){}
 return {rows:rows.length,code,txt:txt.slice(0,400),seats:st2,pred}});
console.log('B12',JSON.stringify(b12,null,1));await p.screenshot({path:'/tmp/j/s39/b12.png'});
/* B13 */
const b13=await p.evaluate(async()=>{const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX5'&&x.fr==='TPE'&&!x.via);const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');S.fdTabR1025B='man';render();await new Promise(r=>setTimeout(r,1000));
 window.KGM_OPSREPORT_R1108A=null;window.__k38LastReport=null;kgmOpsReportR1018A('none');const t0=Date.now();while(!window.KGM_OPSREPORT_R1108A&&Date.now()-t0<20000)await new Promise(r=>setTimeout(r,200));
 const h=window.__k38LastReport||'';const heads=(h.match(/<h2><span>[^<]+<\/span>[^<]*/g)||[]).map(x=>x.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
 return {info:window.KGM_OPSREPORT_R1108A,heads,len:h.length,tabAfter:S.fdTabR1025B,adminTab:S.adminTab,hasBtn:/<button/.test(h.slice(h.indexOf('k39fd'))),hasStyle:/k39fd\{/.test(h)}});
console.log('B13',JSON.stringify(b13,null,1));require('fs').writeFileSync('/tmp/j/s39/ceo39.html',await p.evaluate(()=>window.__k38LastReport||''));
/* pilot 不能有那些區塊 */
const pil=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='pilot');S.adminUser=st;render();await new Promise(r=>setTimeout(r,600));window.KGM_OPSREPORT_R1108A=null;window.__k38LastReport=null;kgmOpsReportR1018A('none');const t0=Date.now();while(!window.KGM_OPSREPORT_R1108A&&Date.now()-t0<20000)await new Promise(r=>setTimeout(r,200));return window.KGM_OPSREPORT_R1108A});
console.log('PILOT',JSON.stringify(pil));
console.log('ERR',errs.slice(0,6));await b.close()})();

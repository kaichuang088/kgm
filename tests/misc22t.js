const {chromium}=require('playwright');const F=process.argv[2]||'/tmp/j/kgm.html';const SP='/tmp/claude-0/-home-user-kgm/1b8a8568-8f05-5001-a981-2589b9539787/scratchpad/fd22/';const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>{if(!/寄信服務/.test(e.message))errs.push(e.message)});p.on('dialog',d=>d.accept());
await p.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(16000);
// 1 stand lookup
console.log('STAND',await p.evaluate(()=>{const d=addDays(todayISO(),3);const G=[];['A','B','C','D'].forEach(L=>{for(let i=1;i<=18;i++){G.push(L+i);G.push(L+i+'R')}});let rows=[];G.forEach(g=>{try{rows=rows.concat((kgmStandLookupR74('TPE',d,g)||{}).rows||[])}catch(_){}});
 const viaCodes=new Set(FLIGHTS.filter(f=>f.via&&f.fr==='TPE'&&flyOn(f,new Date(d+'T12:00:00'))).map(f=>f.code));
 const hit=rows.filter(x=>viaCodes.has(x.code));const bad=hit.filter(x=>!/via/.test(x.routeLabel));
 return 'date '+d+' rows '+rows.length+' through-flight rows '+hit.length+' missing via '+bad.length+' | '+hit.slice(0,8).map(x=>x.code+':'+x.routeLabel).join(', ')+(bad.length?' BAD '+bad.map(x=>x.code+':'+x.routeLabel).join(','):'')}));
// 2 kill switch (front)
console.log('KILL',await p.evaluate(async()=>{const o=[];const T=todayISO();
 const b=(S.bookings||[]).filter(x=>x&&x.pnr&&x.search&&x.search.dep>addDays(T,5)&&!x.staffPricing&&!x.stx).pop();if(!b)return 'no booking';o.push('pnr '+b.pnr);
 S.view='mytrip';S.adminAuthed=false;render();
 S.selfChgR1022A={off:true,by:'T',at:new Date().toISOString()};
 const v0=S.view;tripSvcR25(b.pnr,'out','change');await new Promise(r=>setTimeout(r,100));o.push('off: tripSvc view '+S.view+' msg '+!!document.querySelector('.k929-pnr-msg'));
 openTicketService(b.pnr,'out','change');o.push('off: openTicketService view '+S.view);
 S.rxR59={pnr:b.pnr,mode:'change',picks:{},dates:{},msg:''};S.view='reissue_r59';render();await new Promise(r=>setTimeout(r,100));o.push('off: open reissue → '+S.view);
 S.rxR59={pnr:b.pnr,mode:'refund',picks:{},dates:{},msg:''};S.view='reissue_r59';render();o.push('off: refund page stays '+S.view);
 S.view='mytrip';render();
 S.selfChgR1022A={off:false};tripSvcR25(b.pnr,'out','change');await new Promise(r=>setTimeout(r,100));o.push('on: tripSvc view '+S.view);
 S.view='mytrip';render();return o.join(' | ')}));
// admin card
console.log('CARD',await p.evaluate(async()=>{S.view='admin';S.adminAuthed=true;S.adminUser={empId:'MASTER',name:'主控管理員',role:'ceo'};S.adminTab='bookings';render();await new Promise(r=>setTimeout(r,500));
 const c=document.querySelector('.k22-chg');const t1=c&&c.innerText.replace(/\s+/g,' ').slice(0,80);kgmSelfChgToggleR1022A();await new Promise(r=>setTimeout(r,500));
 const c2=document.querySelector('.k22-chg');const st=JSON.stringify(S.selfChgR1022A);const ls=localStorage.getItem('kgm22_selfchg');
 return 'before: '+t1+' || after: '+(c2&&c2.innerText.replace(/\s+/g,' ').slice(0,60))+' || S '+st+' || LS '+(ls||'').slice(0,80)}));
await p.waitForTimeout(300);await p.screenshot({path:SP+'chg_card.png',clip:{x:240,y:120,width:1200,height:260}});
// service role (can) / ground (cannot)
console.log('CARD ground',await p.evaluate(async()=>{const g=S.staff.find(x=>x.role==='ground');S.adminUser={empId:g.empId,name:g.name,role:'ground'};render();await new Promise(r=>setTimeout(r,400));const c=document.querySelector('.k22-chg');return c?c.innerText.replace(/\s+/g,' ').slice(-40):'none'}));
await p.evaluate(()=>{S.selfChgR1022A={off:false};save()});
// 4 PDF
await p.evaluate(()=>{const s=S.staff.find(x=>x.role==='pilot');S.adminUser={empId:'MASTER',name:'主控管理員',role:'ceo'};S.adminTab='flightdata';S.opsQueryR7='KX5';S.opsDateR7=addDays(todayISO(),1);S.opsSelectedR7='';render()});
await p.waitForTimeout(800);
const pdf=await p.evaluate(async()=>{const d=S.opsDateR7;console.log('sel',S.opsSelectedR7);try{kgmCrewPlanR121(d)}catch(_){}let H='';const fake={document:{open(){},write(h){H+=h},close(){}},focus(){},print(){}};kgmOpsReportR1018A(fake);await new Promise(r=>setTimeout(r,300));return {rep:window.KGM_OPSREPORT_R1018A,html:H}});
fs.writeFileSync(SP+'ops_pdf.html',pdf.html);const R=pdf.rep||{};console.log('PDF',JSON.stringify({doc:R.doc,special:R.special,neg:R.neg,lb:R.lb,fuel:R.fuel,capt:R.capt,ceo:R.ceo,byCab:R.byCab,len:pdf.html.length}),'sections:',(pdf.html.match(/<h2[^>]*>[^<]*/g)||[]).map(x=>x.replace(/<h2[^>]*>/,'')).join(' / '));
// 3 mobile footer
const m=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await m.goto('file://'+F,{waitUntil:'domcontentloaded',timeout:300000});await m.waitForTimeout(12000);
for(const v of ['home','mytrip','flights']){
console.log('MOBILE',v,await m.evaluate(async(v)=>{S.view=v;render();await new Promise(r=>setTimeout(r,500));window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,300));
 const f=document.querySelector('#app>footer');const H=document.documentElement.scrollHeight;const fb=f?f.getBoundingClientRect().bottom+window.scrollY:null;const app=document.getElementById('app');
 const tab=document.getElementById('kgmTabR1019A');return 'docH '+H+' footerBottom '+Math.round(fb)+' gapBelowFooter '+(fb==null?'n/a':Math.round(H-fb))+' appPadB '+getComputedStyle(app).paddingBottom+' tabH '+(tab?tab.offsetHeight:0)},v));}
await m.evaluate(()=>{S.view='home';render()});await m.waitForTimeout(500);await m.screenshot({path:SP+'mobile_full.png',fullPage:true});
console.log('pageerrors',errs.length,errs.slice(0,3));await b.close()})();

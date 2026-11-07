// 1108A N7：航班作業報告——CEO 完整版、機師版、客艙版（地勤／客服同）、其他職位不能匯出；航線圖、高階會員基本資料
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:1000},timezoneId:'Asia/Taipei'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.kgmCrewHasDayR121&&window.kgmCrewHasDayR121(addDays(todayISO(),1)),null,{timeout:400000}).catch(()=>{});await p.waitForTimeout(2000);
const out={};
for(const role of ['ceo','pilot','cabin','ground','backend']){
 const r=await p.evaluate(async(role)=>{const msgs=[];window.alert=m=>msgs.push(m);const d=addDays(todayISO(),1);const f=FLIGHTS.find(x=>x.code==='KX4'&&x.fr==='TPE'&&!x.via);
  const st=S.staff.find(x=>x.role===role);S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='flightdata';S.opsQueryR7=f.code;S.opsDateR7=d;S.opsSelectedR7=[f.code,d,f.fr,f.to].join('|');render();await new Promise(r=>setTimeout(r,800));
  window.KGM_OPSREPORT_R1108A=null;window.__k38LastReport=null;kgmOpsReportR1018A('none');const t0=Date.now();while(!window.KGM_OPSREPORT_R1108A&&Date.now()-t0<15000&&!msgs.length)await new Promise(r=>setTimeout(r,200));
  const h=window.__k38LastReport||'';return {msgs,info:window.KGM_OPSREPORT_R1108A,hasCEO:/給 CEO/.test(h),hasCapt:/給機長 Captain/.test(h),hasFuel:/燃油/.test(h),hasManifest:/APPENDIX/.test(h),elite:(h.match(/PREMIUM &amp; ELITE/g)||[]).length,map:/<img src="data:image/.test(h),badge:(h.match(/class="conf" style="background:#0f3d33;color:#fff">([^<]*)/)||[])[1]}},role);
 out[role]=r;if(role==='ceo'){const h=await p.evaluate(()=>window.__k38LastReport);require('fs').writeFileSync('/tmp/j/pdf38_ceo.html',h||'')}}
console.log(JSON.stringify(out,null,1));
const q=await ctx.newPage();await q.goto('file:///tmp/j/pdf38_ceo.html');await q.waitForTimeout(800);await q.evaluate(()=>{const e=[...document.querySelectorAll('h2')].find(x=>/2A/.test(x.textContent));if(e)e.scrollIntoView()});await q.screenshot({path:'/tmp/j/pdf38_map.png'});
await q.evaluate(()=>{const e=[...document.querySelectorAll('h2')].find(x=>/6A/.test(x.textContent));if(e)e.scrollIntoView()});await q.screenshot({path:'/tmp/j/pdf38_elite.png'});
console.log('ERR',errs.slice(0,4));await b.close()})();

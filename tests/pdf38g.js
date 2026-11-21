// 1108A N7：地勤（只看自己 7 天的航班）等班表排好後開自己的一班 → 匯出客艙服務版（不含燃油／機長／CEO）
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1300,height:1000},timezoneId:'Asia/Taipei'})).newPage();
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>window.KGM_FULLDONE_1006A,null,{timeout:200000}).catch(()=>{});
const r=await p.evaluate(async()=>{const msgs=[];window.alert=m=>msgs.push(m);const gs=S.staff.filter(x=>x.role==='ground');S.adminAuthed=true;S.view='admin';S.adminTab='flightdata';
 let st=null,clk=null,tries=0;const t0=Date.now();
 while(Date.now()-t0<300000){for(const g of gs.slice(0,40)){S.adminUser=g;render();await new Promise(r=>setTimeout(r,150));const c=[...document.querySelectorAll('#app [onclick]')].find(x=>/opsSelectedR7|openOps|k7open|R7\(/.test(x.getAttribute('onclick')||'')&&!/searchOpsR7\(\)/.test(x.getAttribute('onclick')));tries++;if(c){st=g;clk=c.getAttribute('onclick');break}}if(st)break;await new Promise(r=>setTimeout(r,15000))}
 if(!st)return {none:true,tries,txt:document.querySelector('#app').innerText.match(/MY ASSIGNMENTS[\s\S]{0,200}/)?.[0]};
 eval(clk);await new Promise(r=>setTimeout(r,1500));const sel=S.opsSelectedR7;
 window.KGM_OPSREPORT_R1108A=null;window.__k38LastReport=null;kgmOpsReportR1018A('none');const t1=Date.now();while(!window.KGM_OPSREPORT_R1108A&&Date.now()-t1<15000&&!msgs.length)await new Promise(r=>setTimeout(r,200));
 const h=(window.__k38LastReport||'');const badge=(h.match(/class="conf" style="background:#0f3d33;color:#fff">([^<]*)/)||[])[1];const body=h.replace(badge||'@@','');
 return {user:st.id,clk:clk.slice(0,120),sel,msgs,info:window.KGM_OPSREPORT_R1108A,badge,fuel:/燃油/.test(body),capt:/給機長 Captain/.test(h),ceo:/給 CEO/.test(h),elite:/PREMIUM &amp; ELITE/.test(h)}});
console.log(JSON.stringify(r,null,1));await b.close()})();

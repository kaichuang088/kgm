const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{console.log('DIALOG',d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 await p.evaluate(()=>{const u=S.users.find(u=>u&&u.email);S.user=u;u.groupAccountR1025B={status:'active',type:'agency',company:'KGM 測試旅行社',taxId:'22099131',license:'交觀甲 1234',contact:{name:'王小明',phone:'0912345678',email:u.email},caseNo:'KG2490102526M'};S.view='home';render();
   kgmGrpModeR1025B(1);S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),40);S.search.ret=addDays(todayISO(),45);S.search.adults=20;S.search.children=2;S.search.cabin='Economy';passengerCounts();S.outF=null;S.inbF=null;S.seats={};S.paxList=[];S.phase='sel_out';S.openFare=null;nav('booking')});
 await p.waitForTimeout(2500);
 await p.locator('button:has-text("選擇票價")').nth(1).click();await p.waitForTimeout(1500);
 await p.screenshot({path:'/tmp/j/grp_fare2.png'});
 await p.locator('button[onclick^="pickFare(\'out\'"]:not([disabled]):visible').first().click();await p.waitForTimeout(2500);
 console.log('after out:',await p.evaluate(()=>S.phase+' outF '+(S.outF&&S.outF.code)+' '+S.outC));
 await p.locator('button:has-text("選擇票價")').nth(0).click();await p.waitForTimeout(1500);
 await p.locator('button[onclick^="pickFare(\'inb\'"]:not([disabled]):visible').first().click();await p.waitForTimeout(2500);
 console.log('after inb:',await p.evaluate(()=>S.phase+' inbF '+(S.inbF&&S.inbF.code)+' '+S.inbC));
 await p.screenshot({path:'/tmp/j/grp_pax.png'});
 await p.evaluate(()=>{S.grpDraftR1025B=S.grpDraftR1025B||{};S.grpDraftR1025B.name='北海道賞雪 5 日';S.grpDraftR1025B.leader='林領隊'});
 await p.locator('button:has-text("下一步：確認訂位")').click();await p.waitForTimeout(2000);
 console.log('phase',await p.evaluate(()=>S.phase+' paxList '+S.paxList.length));
 await p.screenshot({path:'/tmp/j/grp_confirm.png',fullPage:false});
 // 往下走：確認 → 同意 → 付款
 for(let k=0;k<4;k++){const ph=await p.evaluate(()=>S.phase);if(ph==='pay')break;
   const btn=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#app button')].filter(b=>b.offsetHeight&&/下一步|繼續|確認|同意|前往付款|Continue/.test(b.textContent)&&!/返回|上一步/.test(b.textContent));const x=bs[bs.length-1];if(x){x.setAttribute('data-go25','1');return x.textContent.trim().slice(0,30)}return ''});
   console.log('click',btn);if(!btn)break;
   await p.evaluate(()=>{[...document.querySelectorAll('#app input[type=checkbox]')].forEach(c=>{if(!c.checked){c.click()}})});await p.waitForTimeout(600);
   await p.evaluate(()=>{const bs=[...document.querySelectorAll('#app button')].filter(b=>b.offsetHeight&&!b.disabled&&/下一步|繼續|確認|同意|前往付款|Continue/.test(b.textContent)&&!/返回|上一步/.test(b.textContent));const x=bs[bs.length-1];if(x)x.click()});await p.waitForTimeout(2200);console.log(' ->',await p.evaluate(()=>S.phase))}
 await p.screenshot({path:'/tmp/j/grp_pay.png'});
 await p.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v};set('cname','WANG XIAOMING');set('cnum','4111111111111111');set('cexp','12/29');set('ccvv','123')});
 await p.waitForTimeout(800);
 await p.evaluate(()=>{['KGM-GC-001','KGM-CON-006'].forEach(k=>{try{kgmPolicySetAgreedR914(k,true)}catch(e){}});render()});await p.waitForTimeout(800);const cbs=[];for(const c of cbs){try{await c.check({timeout:3000})}catch(e){}}
 console.log('checked',await p.evaluate(()=>[...document.querySelectorAll('#app input[type=checkbox]')].map(c=>c.checked?1:0).join('')));
 const inputs=await p.evaluate(()=>[...document.querySelectorAll('#app input,#app select')].filter(e=>e.offsetHeight).map(e=>e.tagName+'#'+e.id+'.'+e.name+'['+(e.placeholder||'')+']').join(' | '));console.log(inputs);
 await p.fill('#cnum','4111111111111111').catch(()=>{});await p.fill('#ccvv','123').catch(()=>{});await p.fill('#cname','WANG XIAOMING').catch(()=>{});
 const sels=await p.$$('#app select:visible');for(const sl of sels){const opts=await sl.evaluate(e=>[...e.options].map(o=>o.value).filter(Boolean));if(opts.length>3){await sl.selectOption(opts[Math.min(5,opts.length-1)]).catch(()=>{})}}
 await p.evaluate(()=>{const b=document.getElementById('payBtn');if(b)b.click()});await p.waitForTimeout(7000);
 console.log('after pay',await p.evaluate(()=>S.view+' '+(S.grpViewR1023A&&S.grpViewR1023A.id)+' tab '+S.grp25Tab));
 console.log(await p.evaluate(()=>{const g=(S.groupsR1023A||[]).find(g=>g.kind==='v25');if(!g)return 'no group';const b=S.bookings.find(x=>x.pnr===g.pnr);return JSON.stringify({id:g.id,status:g.status,pax:g.pax,total:g.total,dep:g.deposit.amount,bal:g.balance.amount,due:g.due,segs:g.segs.map(s=>s.key+':'+s.code),bkTotal:b&&b.total,charge:!!g.balance.chargeId})}));
 await p.screenshot({path:'/tmp/j/grp_after.png'});
 await p.screenshot({path:'/tmp/j/grpui_1.png',fullPage:true});
 // ── 整團劃位
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');kgmGrpAutoSeatR1025B(g.id)});await p.waitForTimeout(1200);
 console.log('seats',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25'),b=S.bookings.find(x=>x.pnr===g.pnr);return Object.keys(b.seats).map(k=>k+':'+Object.keys(b.seats[k]).length+' '+Object.keys(b.seats[k]).slice(0,6).join(',')).join(' | ')+' msg '+S.grpMsgR1025B}));
 await p.screenshot({path:'/tmp/j/grp_seats.png'});
 await p.screenshot({path:'/tmp/j/grpui_2.png',fullPage:true});
 // ── 減少 1 位
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');S.grp25Tab='names';render();kgmGrpReduceR1025B(g.id)});await p.waitForTimeout(800);
 console.log('after reduce',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25'),b=S.bookings.find(x=>x.pnr===g.pnr);return 'pax '+g.pax+' reduced '+g.reduced+' total '+g.total+' bal '+g.balance.amount+' paxList '+b.paxList.length+' seats '+Object.keys(b.seats).map(k=>Object.keys(b.seats[k]).length).join('/')}));
 // ── 名單（貼上）
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');S.grp25Tab='names';render();const L=[];for(let i=0;i<g.pax;i++)L.push('CHEN/PAX'+String.fromCharCode(65+i)+', '+(i%2?'F':'M')+', 1980-0'+(1+i%9)+'-1'+(i%9)+', 3'+String(10000000+i));document.getElementById('k25gPaste').value=L.join('\n');kgmGrpPasteR1025B(g.id);kgmGrpNamesR1025B(g.id)});await p.waitForTimeout(800);
 await p.screenshot({path:'/tmp/j/grp_names.png'});
 console.log('names',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');return g.names.filter(n=>n.last).length+'/'+g.pax+' status '+g.status+' msg '+S.grpMsgR1025B}));
 // ── 尾款付清（模擬票務中心付款）→ tick → 開票
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');const c=(S.chargesR45||[]).find(c=>c.id===g.balance.chargeId);if(c){c.status='paid';c.paidAt=new Date().toISOString()}kgmGrpTickR1025B();render()});await p.waitForTimeout(1000);
 console.log('after tick',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25'),b=S.bookings.find(x=>x.pnr===g.pnr);return g.status+' split '+(g.split||[]).length+' master '+b.status+' '+JSON.stringify(b.splitR1025B&&b.splitR1025B.into.slice(0,3))}));
 console.log('one split',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');const x=g.split[0],b=S.bookings.find(y=>y.pnr===x.pnr);return JSON.stringify({pnr:b.pnr,pax:b.paxList.map(p=>p.lastName+'/'+p.firstName+' '+p.ticketR1023A),seats:b.seats,total:b.total,grp:b.groupR1025B})}));
 await p.evaluate(()=>{S.grp25Tab='tickets';render()});await p.waitForTimeout(500);await p.screenshot({path:'/tmp/j/grp_tickets.png'});
 await p.screenshot({path:'/tmp/j/grpui_3.png',fullPage:true});
 await p.evaluate(()=>{S.grpViewR1023A=null;render()});await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/grpui_list.png'});
 await p.setViewportSize({width:420,height:900});await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');S.grpViewR1023A={id:g.id};S.grp25Tab=null;render()});await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/grpui_m.png',fullPage:true});await p.setViewportSize({width:1360,height:950});
 // ── 改票手續費 ×0.75（開一個分出來的 PNR）
 console.log('fee',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25'),b=S.bookings.find(y=>y.pnr===g.split[0].pnr);S.mgResult=null;const a=changeFeeOf('E-T'),r0=refundPolicyOf('E-T').fee;S.mgResult=b;const c=changeFeeOf('E-T'),r1=refundPolicyOf('E-T').fee;S.mgResult=null;return 'normal chg '+a+' ref '+r0+' | group chg '+c+' ref '+r1}));
 // ── 後台團體頁
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groups23';S.grp25AdmF='all';render()});await p.waitForTimeout(1500);
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kind==='v25');kgmGrpAdmR1025B('open',g.id)});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/j/grp_admin.png',fullPage:true});
 console.log('errors',errs);await b.close()})();

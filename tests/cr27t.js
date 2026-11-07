const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{console.log('DIALOG',d.message().slice(0,200).replace(/\n/g,' / '));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(14000);
 await p.evaluate(()=>{const u=S.users[0];S.user=u;u.groupAccountR1025B={status:'active',type:'agency',company:'KGM 測試旅行社',taxId:'22099131',license:'交觀甲 1234',contact:{name:'王小明',phone:'0912345678',email:u.email},caseNo:'KG2610260001M',from:'2026-10-01',to:'2027-12-31'};S.user.groupAccountR1025B=u.groupAccountR1025B;S.view='group23';S.grpViewR1023A=null;render()});
 await p.waitForTimeout(1200);await p.screenshot({path:'/tmp/j/cr_list.png'});
 const D1=await p.evaluate(()=>addDays(todayISO(),200)),D2=await p.evaluate(()=>addDays(todayISO(),100)),D3=await p.evaluate(()=>addDays(todayISO(),104));
 // ① 包下現有航班（太早→擋；再填正確）
 await p.evaluate(()=>kgmCharterOpenR1026C('charter'));await p.waitForTimeout(600);
 await p.fill('#k27c-name','2027 員工旅遊 東京');await p.fill('#k27c-code','KX180');await p.fill('#k27c-date',await p.evaluate(()=>addDays(todayISO(),120)));await p.fill('#k27c-pax','150');
 await p.evaluate(()=>kgmCharterSubmitR1026C());await p.waitForTimeout(500);console.log('too early msg:',await p.evaluate(()=>S.k27cr&&S.k27cr.msg));
 await p.fill('#k27c-date',D1);await p.evaluate(()=>kgmCharterSubmitR1026C());await p.waitForTimeout(500);console.log('msg1',await p.evaluate(()=>S.k27crMsg+' | err '+(S.k27cr&&S.k27cr.msg)));
 // ② 自創航班
 await p.evaluate(()=>kgmCharterOpenR1026C('custom'));await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/cr_form.png'});
 await p.fill('#k27c-name','獎勵旅遊 大阪');await p.fill('#k27c-fr','TPE');await p.fill('#k27c-to','KIX');await p.fill('#k27c-date',D2);await p.fill('#k27c-time','09:00');await p.fill('#k27c-ret',D3);await p.fill('#k27c-rtime','14:00');await p.fill('#k27c-pax','120');await p.selectOption('#k27c-type','B789');
 await p.evaluate(()=>kgmCharterSubmitR1026C());await p.waitForTimeout(500);console.log('msg2',await p.evaluate(()=>S.k27crMsg+' | err '+(S.k27cr&&S.k27cr.msg)));
 await p.screenshot({path:'/tmp/j/cr_list2.png',fullPage:true});
 console.log('reqs',await p.evaluate(()=>JSON.stringify(S.charterReqsR1026C.map(r=>({id:r.id,k:r.kind,st:r.status,fr:r.fr,to:r.to,d:r.date,r:r.retDate,pax:r.pax,code:r.code})))));
 // ③ 後台
 await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groups23';S.k27gdTab='charter';render()});await p.waitForTimeout(2500);
 await p.screenshot({path:'/tmp/j/cr_desk.png',fullPage:true});
 console.log('desk',await p.evaluate(()=>(document.querySelector('.k25gd')||{}).innerText.replace(/\n+/g,' / ').slice(0,1500)));
 const ids=await p.evaluate(()=>S.charterReqsR1026C.map(r=>r.id));
 for(const id of ids){await p.evaluate((id)=>kgmCharterApproveR1026C(id),id);await p.waitForTimeout(1500);console.log('approve',id,await p.evaluate(()=>S.k27cdMsg))}
 console.log('after',await p.evaluate(()=>JSON.stringify(S.charterReqsR1026C.map(r=>({id:r.id,st:r.status,q:r.quote,fl:r.flights,g:r.groupId})))));
 console.log('custom',await p.evaluate(()=>JSON.stringify((S.customFlights||[]).filter(f=>f.charterR1026C).map(f=>({code:f.code,fr:f.fr,to:f.to,d:f.effFrom,dep:f.dep,arr:f.arr,ac:f.acft,ns:f.noSaleR913})))));
 console.log('tails',await p.evaluate(()=>{const o=[];Object.keys(S.tailAssign||{}).forEach(t=>(S.tailAssign[t]||[]).forEach(x=>{if(x&&/^KX2\d\d\d$/.test(x.code))o.push(t+' '+x.code+' '+x.date+' '+x.dep)}));return o.join(' | ')}));
 console.log('rules',await p.evaluate(()=>JSON.stringify((S.salesModeR1026C||{}).rules)));
 console.log('groups',await p.evaluate(()=>JSON.stringify((S.groupsR1023A||[]).filter(g=>g.charterR1026C).map(g=>({id:g.id,st:g.status,pax:g.pax,tot:g.total,dep:g.deposit,bal:g.balance.amount,due:g.due,segs:g.segs.map(s=>s.code+' '+s.date+' '+s.cls)})))));
 // 販售：別人不能訂、本人可以
 console.log('sell',await p.evaluate(()=>{const r=S.charterReqsR1026C[0],f=r.flights[0];const fl=FLIGHTS.concat(S.customFlights||[]).find(x=>x.code===f.code);const own=S.user;S.search.grp25=1;const v0=S.view;S.view='booking';const a=kgmChannelSellR1026C('E-T',f.date,fl);S.user=S.users[1]||null;const bb=kgmChannelSellR1026C('E-T',f.date,fl);S.user=null;S.search.grp25=0;const c=kgmChannelSellR1026C('E-T',f.date,fl);S.user=own;S.view=v0;return 'owner '+a+' other '+bb+' anon '+c}));
 await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.kindR1026C==='custom');S.view='group23';S.grpViewR1023A={id:g.id};S.grp25Tab=null;render()});await p.waitForTimeout(1000);await p.screenshot({path:'/tmp/j/cr_detail.png'});
 console.log('detail',await p.evaluate(()=>document.querySelector('#app').innerText.replace(/\n+/g,' / ').slice(0,900)));
 // ④ 付訂金
 console.log('pay',await p.evaluate(()=>{const g=S.groupsR1023A.find(g=>g.charterR1026C);const c=S.chargesR45.find(c=>c.id===g.deposit.chargeId);if(!c)return 'no charge';c.status='paid';c.paidAt=new Date().toISOString();kgmCharterTickR1026C();return g.status+' dep '+JSON.stringify(g.deposit)}));
 await p.evaluate(()=>{S.view='group23';S.grpViewR1023A=null;render()});await p.waitForTimeout(900);await p.screenshot({path:'/tmp/j/cr_front_after.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{kgmCharterOpenR1026C('charter')});await p.waitForTimeout(800);await p.screenshot({path:'/tmp/j/cr_form_m.png',fullPage:true});
 console.log('scrollW',await p.evaluate(()=>document.documentElement.scrollWidth));
 console.log('errors',errs);await b.close()})();

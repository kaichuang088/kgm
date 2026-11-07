// 1103A：徽章 16 枚、+500 哩、驚喜包（固定內容、重新整理不重抽）、大禮包、升等券、貴賓室券→報到列印、BigDeal 前台頁、後台競標頁
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
const open=async()=>{await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000)};
await open();const out={};
out.step1=await p.evaluate(async()=>{const u={id:'KGMBD31',name:'BD TEST',email:'bd31@example.com',password:'x',miles:10000,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMBD31');S.users.push(u);S.user=u;
 const T=todayISO(),y=T.slice(0,4),bk=(pnr,code,fr,to,d,dep,fare)=>({pnr,userId:u.id,status:'confirmed',outF:{code,fr,to,date:d,dep,arr:'12:00'},outC:fare,paxList:[{firstName:'BD',lastName:'TEST'}],total:20000,curr:'TWD'});
 S.bookings=S.bookings.filter(x=>!/^BD31/.test(x.pnr));
 // 5 段經濟（首航、5 個不同城市）→ 先 4 枚？
 [['NRT','E-E'],['ICN','E-E'],['HKG','E-E'],['BKK','E-E'],['SIN','E-E']].forEach((a,i)=>S.bookings.push(bk('BD31A'+i,'KX'+(100+i),'TPE',a[0],y+'-0'+(i+1)+'-05','10:00',a[1])));
 const n0=u.miles;const got1=kgmBadgeSyncR1103A(u).map(b=>b[0]);const m1=u.miles;
 return {got1,miles:[n0,m1],badges:Object.keys(S.badgeR1103A[u.id]||{}).length}});
out.step2=await p.evaluate(async()=>{const u=S.users.find(x=>x.id==='KGMBD31');const T=todayISO(),y=T.slice(0,4);const bk=(pnr,code,fr,to,d,dep,fare)=>({pnr,userId:u.id,status:'confirmed',outF:{code,fr,to,date:d,dep,arr:'12:00'},outC:fare,paxList:[{firstName:'BD',lastName:'TEST'}],total:20000,curr:'TWD'});
 // 補齊其他條件
 [['LAX','B-K','23:25'],['JFK','B-K','10:00'],['LHR','B-K','23:00'],['SYD','B-K','09:00'],['FRA','B-K','09:00'],['CDG','F-X','09:00'],['YVR','P-A','09:00'],['DXB','R-R','09:00']].forEach((a,i)=>S.bookings.push(bk('BD31B'+i,'KX'+(200+i),'TPE',a[0],y+'-0'+(i+1)+'-15',a[2],a[1])));
 u.miles=Math.max(u.miles,200000);u.level='Gold';
 S.cardBindR1022A=(S.cardBindR1022A||[]).filter(c=>c.id!=='CBBD31');S.cardBindR1022A.push({id:'CBBD31',userId:u.id,net:'stark',status:'verified',last4:'1111',holder:'BD TEST',at:'2026-10-01T00:00:00Z'});
 S.staffCasesR1007A=S.staffCasesR1007A||[];S.staffCasesR1007A.unshift({caseNo:'KGPETBD31',type:'pet',userId:u.id,status:'received'});
 S.bigDeals=S.bigDeals||[];for(let i=0;i<3;i++)S.bigDeals.push({id:'BDW31'+i,pnr:'BD31B'+i,userId:u.id,code:'KX20'+i,date:y+'-0'+(i+1)+'-15',status:'won',toCabin:'Business',amount:5000});
 const m0=u.miles;const got=kgmBadgeSyncR1103A(u).map(b=>b[0]);const ev=kgmBadgeEvalR1103A(u).filter(r=>!r.ok).map(r=>r.b[0]+':'+r.cur+'/'+r.need);
 const inv=(S.invR1103A[u.id]||[]).map(x=>x.type+(x.n?':'+x.n:''));
 return {got,missing:ev,count:Object.keys(S.badgeR1103A[u.id]).length,milesAdded:u.miles-m0,inv}});
out.packs=await p.evaluate(async()=>{const u=S.users.find(x=>x.id==='KGMBD31');const I=S.invR1103A[u.id];const m0=u.miles,tp0=(u.tpBonusR1103A||[]).length;
 I.filter(x=>x.type==='pack'||x.type==='grand').forEach(x=>kgmPackOpenR1103A(x.id));
 return {opened:I.filter(x=>x.type==='pack'||x.type==='grand').map(x=>x.n+':'+x.got.map(g=>g.type+(g.v?'='+g.v:'')+(g.route?'@'+g.route:'')).join(',')),milesAdded:u.miles-m0,level:u.level,tpBonus:(u.tpBonusR1103A||[]).map(x=>x.tp),vouchers:I.filter(x=>x.type==='upg'||x.type==='lounge').map(x=>x.type+(x.route?'@'+x.route:'')+(x.guest?'+1':''))}});
// 重新整理：內容不變、不重複入帳
await p.evaluate(()=>{try{save()}catch(_){}});await open();
out.reload=await p.evaluate(()=>{const u=S.users.find(x=>x.id==='KGMBD31');S.user=u;const m0=u.miles;kgmBadgeSyncR1103A(u);return {same:(S.invR1103A[u.id]||[]).filter(x=>x.opened).map(x=>x.n+':'+x.got.map(g=>g.type+(g.v?'='+g.v:'')).join(',')),milesChange:u.miles-m0,badges:Object.keys(S.badgeR1103A[u.id]).length}});
// 升等券：放一筆即將出發、冷門航線（升等券的航線）的訂位
out.upg=await p.evaluate(async()=>{const u=S.users.find(x=>x.id==='KGMBD31');S.user=u;const I=S.invR1103A[u.id];let v=I.find(x=>x.type==='upg'&&!x.used&&x.route)||I.find(x=>x.type==='upg'&&!x.used);
 const rt=(v.route||'TPE-NRT').split('-');const fr=rt.includes('TPE')?'TPE':rt[0],to=rt.find(x=>x!==fr);const f=FLIGHTS.find(x=>x.fr===fr&&x.to===to&&/^KX/.test(x.code)&&!x.via&&!x.partner);
 const d=addDays(todayISO(),10);S.bookings=S.bookings.filter(x=>x.pnr!=='BD31UP');S.bookings.push({pnr:'BD31UP',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'E-E',paxList:[{firstName:'BD',lastName:'TEST'}],total:9000,curr:'TWD'});
 S.view='inv31';render();await new Promise(r=>setTimeout(r,500));const btns=[...document.querySelectorAll('.k31w-use button')].map(b=>b.innerText+(b.disabled?' [x]':''));
 window.confirm=()=>true;kgmUpgUseR1103A(v.id,'BD31UP','out');const bb=S.bookings.find(x=>x.pnr==='BD31UP');return {route:v.route,flight:f&&f.code,btns,after:bb.outC,used:v.used,usedOn:v.usedOn}});
// 貴賓室券 → 地勤報到列印自動帶出
out.lounge=await p.evaluate(async()=>{const u=S.users.find(x=>x.id==='KGMBD31');const v=(S.invR1103A[u.id]||[]).find(x=>x.type==='lounge'&&!x.used);const bb=S.bookings.find(x=>x.pnr==='BD31UP');const f=Object.assign({},bb.outF);
 const found=kgmLoungeVoucherForR1103A('BD31UP',f);return {voucher:!!found,id:found&&found.id,same:found===v}});
// 頁面
for(const [k,v] of [['badge','badge31'],['inv','inv31'],['bd','bigdeal31']]){out['page_'+k]=await p.evaluate(async v=>{S.view=v;render();await new Promise(r=>setTimeout(r,500));window.scrollTo(0,0);const h=document.querySelector('.k31b,.k31d');return h?h.innerText.replace(/\s+/g,' ').slice(0,300):'NO PAGE'},v);await p.screenshot({path:'/tmp/j/bd33_'+k+'.png',fullPage:true})}
out.btnBD=await p.evaluate(async()=>{S.view='home';render();await new Promise(r=>setTimeout(r,300));const b=[...document.querySelectorAll('button')].find(x=>/BigDeal/.test(x.innerText));if(b)b.click();await new Promise(r=>setTimeout(r,500));return !!document.querySelector('.k31d')});
out.menu=await p.evaluate(()=>[...document.querySelectorAll('#mega_miles li')].map(l=>l.innerText));
out.profile=await p.evaluate(async()=>{S.view='profile';S.profileTab='profile';render();await new Promise(r=>setTimeout(r,500));const s=document.querySelector('.k31b-strip');return s?s.innerText.replace(/\s+/g,' ').slice(0,120):'NO STRIP'});
// 後台競標頁
out.admin=await p.evaluate(async()=>{const st=S.staff.find(x=>x.role==='ceo');S.adminAuthed=true;S.adminUser=st;S.view='admin';S.adminTab='auctions';S.auctionQR920='';S.auctionCodeR923='';render();await new Promise(r=>setTimeout(r,2500));window.scrollTo(0,0);
 const g=[...document.querySelectorAll('.k920-grp')];const k=document.querySelector('.k31a-k');const H=document.scrollingElement.scrollHeight;
 const first=g[0]&&g[0].getAttribute('data-k22');if(first)kgmAucToggleR1103A(first);await new Promise(r=>setTimeout(r,800));const g2=document.querySelector('.k920-grp[data-k22="'+first+'"]');
 S.aucViewR1103A='bd';render();await new Promise(r=>setTimeout(r,800));const visCols=[...document.querySelectorAll('.k923-col')].map(c=>getComputedStyle(c).display);S.aucViewR1103A='all';render();
 return {kpi:k&&k.innerText.replace(/\s+/g,' '),groups:g.length,collapsed:g.filter(x=>x.classList.contains('k22c')).length,height:H,expandedAfterClick:g2&&!g2.classList.contains('k22c'),visColsBD:visCols}});
await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:'/tmp/j/bd33_admin2.png',fullPage:false});
console.log(JSON.stringify(out,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

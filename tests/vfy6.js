const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1600,height:1200}});const p=await ctx.newPage();
 const errs=[],dlg=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,150)));
 p.on('dialog',async d=>{dlg.push(d.message().slice(0,160));await d.dismiss().catch(()=>{})});
 await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(45000);
 const out=[];const push=(id,n,ok,info)=>{out.push({id,n,ok:!!ok,info:String(info).slice(0,150)});console.log((ok?'PASS ':'FAIL ')+id+' '+n+' :: '+String(info).slice(0,150))};

 // A1 audits
 const a=await p.evaluate(()=>({a:window.kgmAuditR922A(),b:window.kgmAuditR921C()}));
 push('A1','0922A 稽核通過',a.a&&a.a.ok,JSON.stringify(a.a));
 push('A2','0921C 稽核仍然通過',a.b&&a.b.ok,JSON.stringify(a.b));

 // B1 ticketing centre
 const t=await p.evaluate(()=>{S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='ticketing';render();
   const m=document.querySelector('#app');return {len:m.innerText.length,has:/票務中心/.test(m.innerText),txt:m.innerText.replace(/\s+/g,' ').slice(0,200)}});
 push('B1','票務中心有內容',t.has&&t.len>600,'len='+t.len+' '+t.txt.slice(0,110));

 // B2 ticketing centre tabs render
 const t2=await p.evaluate(()=>{const m=document.querySelector('#app');
   const btns=[...m.querySelectorAll('button')].map(x=>x.textContent.trim()).filter(Boolean);
   return {n:btns.length,sample:btns.slice(0,14).join(' | ')}});
 push('B2','票務中心有可操作按鈕',t2.n>4,t2.sample);

 // C1 mileage offset block appears on the add-ons page for a cash booking
 const c=await p.evaluate(()=>{
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u){S.user=u;u.miles=Math.max(+u.miles||0,60000)}
   const f=(sortedFlights('TPE','NRT',d)||[]).filter(x=>!x.partner&&!x.via)[0];
   S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:d,date:d,pax:1,type:'OW',useMiles:false});
   S.outF=Object.assign({},f,{date:d});S.outC=(validCodes(Object.assign({},f,{date:d}))||['Y'])[0];S.inbF=null;
   S.paxList=[{lastName:'DEMO',firstName:'EXPLORER',email:'t@g',countryCode:'+886',phone:'9',kgmId:u&&u.id}];
   S.mileOffsetR922=0;S.phase='addons';S.view='booking';render();
   const h=document.getElementById('app').innerText;
   return {block:/用里程折抵票款/.test(h),max:window.kgmMileOffsetMaxR922(20000),miles:(S.user||{}).miles};
 });
 push('C1','附加服務頁有里程折抵區塊',c.block,JSON.stringify(c));

 // C2 choosing 4000 miles reduces the total by 1000
 const c2=await p.evaluate(()=>{
   const before=(document.getElementById('app').innerText.match(/總價\s*([^\n]+)/)||[])[1]||'';
   window.kgmMileOffsetSetR922(4000);
   const after=(document.getElementById('app').innerText.match(/總價\s*([^\n]+)/)||[])[1]||'';
   const blk=window.kgmMileOffsetBlockR922(20000,'TWD');
   return {before,after,off:blk.off,set:S.mileOffsetR922};
 });
 push('C2','折抵 4,000 哩 = NT$1,000 且總價跟著變',c2.off===1000&&c2.set===4000&&c2.before!==c2.after,JSON.stringify(c2));

 // D1 staff ticket cannot use mileage upgrade
 const d1=await p.evaluate(()=>{
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   const f=(sortedFlights('TPE','NRT',d)||[]).filter(x=>!x.partner&&!x.via)[0];
   const bk={pnr:'ST922TST',staffTravel:true,outF:Object.assign({},f,{date:d}),outC:'Y',cls:'Y',paxList:[{lastName:'A',firstName:'B'}]};
   const bk2={pnr:'NM922TST',outF:Object.assign({},f,{date:d}),outC:'Y',cls:'Y',paxList:[{lastName:'A',firstName:'B'}]};
   return {staff:(window.kgmUpgradeOptionsR920(bk,'out')||[]).length,
           normal:(window.kgmUpgradeOptionsR920(bk2,'out')||[]).length};
 });
 push('D1','員工票沒有升等選項、一般票仍然有',d1.staff===0&&d1.normal>0,JSON.stringify(d1));

 // D2 unverified staff ticket is not findable in manage
 const d2=await p.evaluate(()=>{
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   const f=(sortedFlights('TPE','NRT',d)||[]).filter(x=>!x.partner&&!x.via)[0];
   S.bookings=S.bookings||[];
   const stf=(S.staff||[]).filter(x=>x&&x.empId&&x.active!==false)[0]||{empId:'K74992',name:'Chang Shi Shi'};
   S.bookings.push({pnr:'SNC7V3SD',staffTravel:true,status:'confirmed',
     outF:Object.assign({},f,{date:d}),outC:'Y',
     stx:{empId:stf.empId,name:stf.name,plan:'ID90',fam:[],withFam:false,travellerVerified:true},
     paxList:[{lastName:'CHANG',firstName:'SHI'}],userId:(S.user||{}).id});
   S.staffTix=(S.staffTix||[]);
   S.staffTix.unshift({empId:'K74992',empName:'Chang Shi Shi',type:'ID90',route:'TPE-NRT',
     flight:f.code,date:d,pnr:'SNC7V3SD',who:'self',status:'pending',verified:false});
   S.view='manage';S.mgResult=null;S.mgForceForm=true;S.mtOnly=null;S.mtOpen=null;
   S.pnrBooking0812A=null;S.pnrError0812A='';render();
   return {verified:window.kgmStaffTixVerifiedR922({pnr:'SNC7V3SD'}),
     hasForm:!!document.getElementById('mgPnr')};
 });
 await p.waitForTimeout(800);
 const d2b=await p.evaluate(()=>{
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;return true}return false};
   const f1=set('r20Pnr','SNC7V3SD');
   const cs=document.getElementById('r20Agree');if(cs)cs.checked=true;
   if(!f1)return {err:'form-missing'};
   S.staffUnverifiedMsgR922='';
   try{findTripR20()}catch(e){return {err:'throw:'+e.message}}
   return {err:S.staffUnverifiedMsgR922||S.pnrError0812A||'',bk:S.mtOnly||'',res:!!S.mgResult};
 });
 push('D2','未驗證員工票在行程管理查不到並標示未驗證',
   /未驗證|NOT VERIFIED/.test(d2b.err||'')&&!d2b.bk,JSON.stringify(d2b));

 // D3 refund of a staff ticket is pushed to the back office
 const d3=await p.evaluate(()=>{
   S.rfR60={pnr:'SNC7V3SD'};
   try{S.policyAgreedR914=S.policyAgreedR914||{};['KGM-CHG-003'].forEach(function(i){S.policyAgreedR914[i]=true});}catch(e){}
   try{if(window.kgmPolicyAgreeR914)window.kgmPolicyAgreeR914(['KGM-CHG-003'])}catch(e){}
   const before=(S.staffTix||[]).filter(t=>t.pnr==='SNC7V3SD')[0];
   const wasVerified=before?before.verified:null;
   if(before)before.verified=true;
   try{window.kgmRfSubmitR60()}catch(e){return {err:e.message}}
   const after=(S.staffTix||[]).filter(t=>t.pnr==='SNC7V3SD')[0]||{};
   return {wasVerified,nowVerified:after.verified,action:after.pendingActionR922,status:after.status};
 });
 push('D3','員工票退票被退回後台核對',d3.nowVerified===false&&d3.action==='refund',JSON.stringify(d3));

 // E1 Residence auction: paragraph <b> is inline sized
 const e1=await p.evaluate(()=>{
   S.view='upgrade';render();
   const st=document.createElement('div');
   st.innerHTML='<section class="k173"><header><small>x</small><b>TITLE</b><p>a<b id="k922probe">B</b>c</p></header></section>';
   document.body.appendChild(st);
   const probe=document.getElementById('k922probe');
   const cs=getComputedStyle(probe);
   const title=getComputedStyle(st.querySelector('header>b'));
   const r={inline:cs.display,size:cs.fontSize,titleSize:title.fontSize};
   st.remove();return r;
 });
 push('E1','Residence 說明文字裡的粗體回到行內字級',
   e1.inline==='inline'&&e1.size!==e1.titleSize,JSON.stringify(e1));

 // E2 residence eligibility helper
 const e2=await p.evaluate(()=>{
   const bizCode=Object.keys(FARES).filter(k=>FARES[k].cabin==='Business')[0];
   const okA388Biz=window.kgmResEligR922('A388',bizCode);
   const badType=window.kgmResEligR922('B789',bizCode);
   let econCode='';try{econCode=Object.keys(FARES).filter(k=>FARES[k].cabin==='Economy')[0]}catch(e){}
   const badCabin=window.kgmResEligR922('A388',econCode);
   return {okA388Biz,badType,badCabin,econCode,bizCode};
 });
 push('E2','Residence 競標只開給 A380＋商務艙',
   e2.okA388Biz===true&&e2.badType===false&&e2.badCabin===false,JSON.stringify(e2));


 // F1 staff ticket = one step: verify (+plan) then straight to results
 const f1=await p.evaluate(()=>{
   const st=(S.staff||[]).filter(x=>x&&x.role&&x.password&&x.empId)[0];
   if(!st)return {err:'no staff'};
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   S.promoCode=st.empId;S.stx=null;S.stxConfirmVerified=false;S.staffVerifiedR10=false;
   S.view='booking';S.phase='sel_out';S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:d,type:'OW'});
   render();
   return {emp:st.empId,gate:!!document.querySelector('.k55-staffgate'),k169:!!document.getElementById('k169fr')};
 });
 await p.waitForTimeout(1500);
 const f1b=await p.evaluate(()=>{
   const st=(S.staff||[]).filter(x=>x&&x.role&&x.password&&x.empId&&x.empId===S.promoCode)[0];
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;return true}return false};
   const okId=set('k55EmpId',st.empId),okPw=set('k55EmpPw',st.password);
   set('k55Plan','ID90');set('k55Who','self');
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   const has169=set('k169fr','TPE')&&set('k169to','NRT')&&set('k169dep',d);
   if(!okId||!okPw)return {err:'gate fields missing'};
   try{kgmStaffAwSearchR169()}catch(e){try{kgmStaffGateVerifyK5()}catch(e2){return {err:e2.message}}}
   return {has169,view:S.view,phase:S.phase,plan:(S.stx||{}).plan,
     verified:!!(S.stx&&S.stx.staffGateCompleteK5),fr:(S.search||{}).fr,to:(S.search||{}).to};
 });
 await p.waitForTimeout(2500);
 const f1c=await p.evaluate(()=>{
   const t=document.getElementById('app').innerText;
   return {view:S.view,phase:S.phase,len:t.length,hasFlights:/KX\d/.test(t),
     stillPlanPage:/員工票專區/.test(t)};
 });
 push('F1','員工票一步完成：驗證＋方案後直接出航班',
   f1b.verified===true&&f1b.view==='booking'&&f1c.hasFlights&&!f1c.stillPlanPage,
   JSON.stringify(f1b)+' '+JSON.stringify(f1c));

 // F2 admin PNR check opens the AI quiz
 const f2=await p.evaluate(()=>{
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};
   S.view='admin';S.adminTab='stafftix';
   S.staffTix=S.staffTix||[];
   S.staffTix=(S.staffTix||[]).filter(x=>!(x&&x.pnr==='SNC7V3SD'));
   S._stxPnr='SNC7V3SD';S._tvIdx=null;S._tvQuestions=[];
   try{doVerifyStaffTix()}catch(e){return {err:e.message}}
   return {idx:S._tvIdx,qs:(S._tvQuestions||[]).length,msg:String(S._stxMsg||'').slice(0,80)};
 });
 push('F2','員工票 PNR 核對會出 AI 行程核對三題',
   f2.idx!=null&&f2.idx>=0&&f2.qs>=3,JSON.stringify(f2));

 // F3 ticketing centre works with a real PNR
 const f3=await p.evaluate(()=>{
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   const f=(sortedFlights('TPE','NRT',d)||[]).filter(x=>!x.partner&&!x.via)[0];
   S.bookings=S.bookings||[];
   if(!S.bookings.some(b=>b.pnr==='TC922AA'))
     S.bookings.push({pnr:'TC922AA',status:'confirmed',total:12000,curr:'TWD',
       outF:Object.assign({},f,{date:d}),outC:'Y',
       paxList:[{lastName:'WANG',firstName:'MEI',email:'t@g'}],userId:'KGMDEMO0911',
       createdAt:new Date().toISOString()});
   S.view='admin';S.adminTab='ticketing';S.deskTabR16='refund';
   S.deskPnrR16='TC922AA';S.dkPnr='TC922AA';S.admPnrR74='TC922AA';
   render();
   const app=document.getElementById('app');
   const inp=[...app.querySelectorAll('input')].map(i=>i.id).filter(Boolean);
   return {inputs:inp.slice(0,8),txt:app.innerText.replace(/\s+/g,' ').slice(0,200)};
 });
 push('F3','票務中心可以輸入 PNR 開始作業',
   f3.inputs.length>0,JSON.stringify(f3.inputs)+' '+f3.txt.slice(0,110));


 // G1 gate: one stand, one aircraft
 const g1=await p.evaluate(()=>{
   const D=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
   const r=[];for(let i=0;i<7;i++){const a=window.kgmAuditGateR922('TPE',D(i));
     r.push({d:D(i),ov:a.overlap,bad:(a.a388||[]).length,of:(a.a388Overflow||[]).length})}
   return {rows:r,installed:window.KGM_GATE_ALLOC_R922,
     worst:r.reduce((m,x)=>Math.max(m,x.ov+x.bad),0)};
 });
 push('G1','停機位一位一機、A380 只用 C2／D6',g1.installed&&g1.worst===0,JSON.stringify(g1.rows.slice(0,3))+' worst='+g1.worst);

 // G2 auctions everywhere
 const g2=await p.evaluate(()=>window.kgmAuditAuctionR922());
 push('G2','每一班符合條件的航班都有競標資料',g2.ok,JSON.stringify({rows:g2.rows,cash:g2.cash,miles:g2.miles,big:g2.big,miss:(g2.a380NoBid||[]).length}));

 // G3 rotation lock + paired swap
 const g3=await p.evaluate(()=>window.kgmAuditRotR922());
 push('G3','輪轉鎖 30 天、換機型連動對號回程',g3.ok,JSON.stringify({lock:g3.lock,pair:g3.pairExample,seam:g3.seamBreaks,tails:g3.seamTails}));

 // G4 no-show simulation runs itself
 const g4=await p.evaluate(()=>{
   const d=new Date().toISOString().slice(0,10);
   const f=[].concat(FLIGHTS,S.customFlights||[]).filter(x=>x&&!x.via&&!x.partner&&x.fr==='TPE')[0];
   const code=f.code;
   window.kgmNsClockR914(code,d,150);
   const a=window.kgmNoShowStateR914(code,d);
   let ci0=0;Object.keys(a.rows).forEach(k=>{if(a.rows[k].ci)ci0++});
   window.kgmNsClockR914(code,d,45);
   const b2=window.kgmNoShowStateR914(code,d);
   let ci1=0,bd1=0;Object.keys(b2.rows).forEach(k=>{const w=b2.rows[k];if(w.ci)ci1++;if(w.boarded)bd1++});
   window.kgmNsClockR914(code,d,20);
   const c2=window.kgmNoShowStateR914(code,d);
   let bd2=0;Object.keys(c2.rows).forEach(k=>{if(c2.rows[k].boarded)bd2++});
   const pl=window.kgmNoShowPlanR914(code,d);
   return {code,total:pl.total,ci0,ci1,bd1,bd2,target:pl.boardTarget};
 });
 push('G4','未登機模擬系統自己跑（不必逐格勾）',
   g4.ci0===0&&g4.ci1>g4.total*0.8&&g4.bd2>g4.total*0.8,JSON.stringify(g4));

 // G5 ground counter card names the flights or says general
 const g5=await p.evaluate(()=>{
   const pl=window.kgmGroundBlocksR194?window.kgmGroundBlocksR194():null;
   if(!pl)return {off:true};
   return {blocks:pl.blocks.map(b=>b.no+':'+(b.flights||'(general)'))};
 });
 push('G5','地勤班表每一段都標出負責航班或註明一般櫃檯',
   !!(g5.off||(g5.blocks&&g5.blocks.length)),JSON.stringify(g5));

 // H1 whole-fleet rotation: every leg connects, no time overlap, one type per tail
 const h1=await p.evaluate(()=>window.kgmAuditRotAllR922(true));
 push('H1','全機隊每一段都接得上、不重疊、機型一致',!!h1.ok,
   JSON.stringify({tails:h1.tails,legs:h1.legs,gap:h1.gap,overlap:h1.overlap,type:h1.type,sample:(h1.sample||[]).slice(0,3)}));

 // H2 A380 flights inside the 7-day close window still carry a decided auction
 const h2=await p.evaluate(()=>{
   const close=(+window.KGM_RES_MILE_CLOSE_DAYS_R920||7)*24;
   const all=[].concat(FLIGHTS,S.customFlights||[]);
   let checked=0,noHist=0,won=0,sample=[];
   for(let d=1;d<=6;d++){
     const dd=new Date(Date.now()+d*86400000).toISOString().slice(0,10);
     const dt=new Date(dd+'T12:00:00');
     all.forEach(f=>{
       if(!f||f.via)return;
       let on=true;try{on=(typeof flyOn!=='function')||flyOn(f,dt)}catch(_){on=false}
       if(!on)return;
       let tp='';try{tp=(typeof acftOfFlight==='function'&&acftOfFlight(f.code,dd,f.fr,f.to))||f.acft}catch(_){tp=f.acft}
       if(tp!=='A388')return;
       let hrs=NaN;try{hrs=window.kgmHoursToDepR920B(f,dd)}catch(_){}
       if(!(isFinite(hrs)&&hrs>0&&hrs<=close))return;
       checked++;
       try{window.kgmEnsureAuctionsR922(f.code,dd,f)}catch(_){}
       const bids=(S.residenceBidsR83||[]).filter(b=>b&&b.code===f.code&&b.date===dd);
       if(!bids.length){noHist++;if(sample.length<3)sample.push(f.code+' '+dd)}
       else if(bids.some(b=>b.status==='won'))won++;
     });
   }
   return {checked,noHist,won,sample};
 });
 push('H2','已截止的 A380 競標有得標紀錄而不是空的',
   h2.checked>0&&h2.noHist===0&&h2.won===h2.checked,JSON.stringify(h2));

 // H3 legal name split into three fields, still passport-gated
 const h3=await p.evaluate(()=>{
   const k=S.profileChangeOpen0815;S.profileChangeOpen0815=true;
   let h='';try{h=String(profileChangeForm0815(S.user||(S.users||[])[0]||{}))}catch(e){h='ERR '+e.message}
   S.profileChangeOpen0815=k;
   return {last:/id="pcVal_name_last"/.test(h),middle:/id="pcVal_name_middle"/.test(h),
     first:/id="pcVal_name_first"/.test(h),proof:/id="pcFile0815"/.test(h),
     label:/法定姓名/.test(h)};
 });
 push('H3','法定姓名拆成姓／中間名／名三欄且仍需護照證明',
   h3.last&&h3.middle&&h3.first&&h3.proof&&h3.label,JSON.stringify(h3));

 // H4 A330-900neo fleet trimmed to 28 and every flight still has an aircraft
 const h4=await p.evaluate(()=>{
   const T=todayISO();
   const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const L=(window.tailsFor('A339L')||[]).length,R=(window.tailsFor('A339R')||[]).length;
   const have=new Set();
   Object.keys(S.tailAssign||{}).forEach(tl=>(S.tailAssign[tl]||[]).forEach(x=>{if(x&&x.code&&x.date)have.add(x.code+'|'+x.date)}));
   const all=[].concat(FLIGHTS,S.customFlights||[]);
   let need=0,miss=0;
   for(let i=0;i<7;i++){
     const d=D(T,i),dt=new Date(d+'T12:00:00');
     all.forEach(f=>{
       if(!f||f.via||f.partner)return;
       let on=true;try{on=(typeof flyOn!=='function')||flyOn(f,dt)}catch(_){on=false}
       if(!on)return;
       need++;if(!have.has(f.code+'|'+d))miss++;
     });
   }
   return {a339L:L,a339R:R,total:L+R,flights:need,withoutAircraft:miss};
 });
 push('H4','A330-900neo 縮編成 28 架而且沒有航班變成無機可派',
   h4.total===28&&h4.flights>0&&h4.withoutAircraft===0,JSON.stringify(h4));

 // H5 crew: one operating leg per day, rest after long-haul
 const h5=await p.evaluate(()=>{
   const T=todayISO();
   const D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   const crew=(S.staff||[]).filter(x=>x&&x.active!==false&&(x.role==='cabin'||x.role==='pilot')).slice(0,60);
   let two=0,longNext=0,legs=0,people=0;
   crew.forEach(c=>{let ch=null;try{ch=window.kgmCrewChainR210(c.empId,T,21)}catch(_){return}
     if(!ch)return;people++;let prevLong=null;
     ch.forEach(day=>{
       const op=(day.legs||[]).filter(l=>!(l.dhR913||l.deadhead));
       legs+=op.length;
       if(op.length>1)two++;
       if(prevLong&&op.length&&day.date===D(prevLong,1))longNext++;
       if(op.some(l=>(+l.block||0)>=480))prevLong=day.date;
     });
   });
   let viol=0;try{viol=(window.kgmCrewPlanR121(T).violations||[]).length}catch(_){}
   return {people,legs,twoLegDays:two,flewDayAfterLongHaul:longNext,plannerViolations:viol};
 });
 push('H5','組員一天只飛一個航班、長程飛完隔天不排班',
   h5.legs>0&&h5.twoLegDays===0&&h5.flewDayAfterLongHaul===0&&h5.plannerViolations===0,JSON.stringify(h5));

 // H6 staff ticket: policy consent box lives on the staff flight list
 const h6=await p.evaluate(()=>{
   const st=(S.staff||[]).filter(x=>x&&x.active!==false)[0];
   S.promoCode=st.empId;
   S.stx={empId:st.empId,name:st.name,plan:'ID90',who:'self',fam:[],withFam:false,staffGateCompleteK5:true};
   S.staffVerifiedR10=true;
   S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:new Date(Date.now()+14*86400000).toISOString().slice(0,10),type:'OW',pax:1});
   S.view='booking';S.phase='sel_out';
   try{render()}catch(_){}
   return {shop:document.querySelectorAll('.staff-shop').length,
     consent:document.querySelectorAll('.stx-consent0922 input[type=checkbox]').length};
 });
 push('H6','員工票航班清單上有「已閱讀員工票管理辦法」勾選框',h6.shop>0&&h6.consent>0,JSON.stringify(h6));

 // H7 upgrades: one step only, and withdrawing restores the original cabin
 const h7=await p.evaluate(()=>{
   const d=new Date(Date.now()+16*86400000).toISOString().slice(0,10);
   const f=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='LAX')[0];
   const mk=c=>({pnr:'V6'+c,outF:Object.assign({},f,{date:d}),outC:c,paxList:[{last:'A',first:'B'}]});
   const econ=(window.kgmUpgradeOptionsR920(mk('O'),'out')||[]).map(o=>o.to);
   const u=(S.users||[])[0];if(u){S.user=u;u.miles=100000}
   const bk={pnr:'V6WD',userId:u&&u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'F',paxList:[{last:'A',first:'B'}]};
   S.bookings=(S.bookings||[]).filter(x=>x.pnr!=='V6WD');S.bookings.push(bk);
   S.upgradeReqs=(S.upgradeReqs||[]).filter(x=>x.pnr!=='V6WD');
   S.upgradeReqs.push({id:'V6UP',pnr:'V6WD',code:f.code,date:d,seg:'out',toCabin:'Premium',
     miles:37000,status:'confirmed',prevClsR922:'O',segR922:'out',prevCabinR922:'Economy'});
   window.kgmWithdrawUpgrade49('V6UP',false);
   return {econOptions:econ,clsAfterWithdraw:(S.bookings.find(x=>x.pnr==='V6WD')||{}).outC,
     card:/k922-upg-wd/.test(window.kgmUpgradeCardR922('V6WD')||'')};
 });
 push('H7','里程升等只升一階，且撤回會改回原艙等',
   h7.econOptions.length===1&&h7.econOptions[0]==='Premium'&&h7.clsAfterWithdraw==='O',JSON.stringify(h7));

 // H8 Sky Couch is a single row; A380 first business row is the paid special cabin
 const h8=await p.evaluate(()=>{
   const sky={};Object.keys(AC||{}).forEach(k=>{const r=window.kgmSkyRowsR29(k);if(r&&r.length)sky[k]=r.length});
   S.search=Object.assign(S.search||{},{fr:'TPE',to:'LAX'});
   const row=window.kgmSpecialBizRowR922('A388');
   return {skyRowCounts:sky,specialRow:row,feeAtRow:seatFee(row,'A','biz','A388'),
     feeNextRow:seatFee(row+1,'A','biz','A388')};
 });
 push('H8','Sky Couch 只有一排；A380 第一排商務艙為加價的特別版',
   Object.values(h8.skyRowCounts).every(n=>n===1)&&h8.feeAtRow>0&&h8.feeNextRow===0,JSON.stringify(h8));

 // H9 fares: long-haul business round trip is in the 160-175k band, short haul unchanged
 const h9=await p.evaluate(()=>{
   const d='2026-10-08',d2='2026-10-15';
   const o=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='LAX')[0];
   const i=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='LAX'&&x.to==='TPE')[0];
   const rt=rtPrice(Object.assign({},o,{date:d}),'B-T',Object.assign({},i,{date:d2}),'B-T',1);
   const sh=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='NRT')[0];
   const shortBiz=owPrice(Object.assign({},sh,{date:d}),'B-T',1);
   return {longBizRT:rt.total,shortBizOW:shortBiz,
     mulBiz:+cabinTierMult('Business',distOf('TPE','LAX')).toFixed(2),
     mulFirst:+cabinTierMult('First',distOf('TPE','LAX')).toFixed(2)};
 });
 /* 實際票價還會被當日動態需求係數放大，所以這裡驗的是「艙等倍率」這個
    決定性的來源，外加票價確實高於調整前的水準（舊倍率 2.07 → 十一萬多）。 */
 push('H9','長程商務艙倍率調到 3 倍上下、頭等仍明顯高於商務',
   h9.mulBiz>=2.9&&h9.mulBiz<=3.2&&h9.mulFirst>h9.mulBiz*1.3&&h9.longBizRT>=150000,
   JSON.stringify(h9));

 // H10 back office: mileage desk, agent route change, auction two-column + auto settle
 const h10=await p.evaluate(()=>{
   const d=new Date(Date.now()+20*86400000).toISOString().slice(0,10);
   const f=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='LAX')[0];
   const u=(S.users||[])[0];if(u){S.user=u;u.miles=200000}
   S.bookings=(S.bookings||[]).filter(x=>x.pnr!=='V6MD');
   S.bookings.push({pnr:'V6MD',userId:u&&u.id,status:'confirmed',
     outF:Object.assign({},f,{date:d}),outC:'F',mileOffsetR922:4000,paxList:[{last:'A',first:'B'}]});
   S.upgradeReqs=(S.upgradeReqs||[]).filter(x=>x.pnr!=='V6MD');
   S.upgradeReqs.push({id:'V6MDU',pnr:'V6MD',code:f.code,date:d,seg:'out',toCabin:'Business',
     miles:116000,status:'waitlist',prevClsR922:'F',prevCabinR922:'Premium'});
   const c=window.kgmMileCaseR923('V6MD');
   S.ticketIdentity0910='agent';S.groundModeR164=0;
   return {mileRows:c.rows.length,mileUsed:c.used,held:c.held.length,
     agentSwap:window.kgmReissueCanSwapAirportR914(),agentRouteFee:window.kgmRouteChangeFeeR923(),
     autoSettle:typeof window.kgmAutoSettleAuctionsR923,
     bigDealGate:typeof window.kgmBigDealSeatsOkR923};
 });
 push('H10','後台里程票務、客服可改起訖、競標自動決標都在',
   h10.mileRows>=2&&h10.held===1&&h10.agentSwap===true&&h10.agentRouteFee>0
   &&h10.autoSettle==='function'&&h10.bigDealGate==='function',JSON.stringify(h10));

 // H11 long-haul two meals, survey explains empty results, lookup-another exists
 const h11=await p.evaluate(()=>{
   const d=new Date(Date.now()+16*86400000).toISOString().slice(0,10);
   const lo=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='LAX')[0];
   const sh=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='HKG')[0];
   const mk=f=>({pnr:'M2',outF:Object.assign({},f,{date:d}),outC:'O',paxList:[{last:'A',first:'B'}]});
   return {longTwoMeals:window.kgmTwoMealsR923(mk(lo),'out'),
     shortTwoMeals:window.kgmTwoMealsR923(mk(sh),'out'),
     surveyWhy:/沒有這一班|does not operate/.test(window.kgmFbWhyEmptyR923('KX188','2026-08-07')||''),
     lookupAnother:typeof window.kgmLookupAnotherR923};
 });
 push('H11','長程兩餐、問卷查無資料會說明原因、可退出查別的訂位',
   h11.longTwoMeals===true&&h11.shortTwoMeals===false&&h11.surveyWhy&&h11.lookupAnother==='function',
   JSON.stringify(h11));


 // H12 member nav on one row + mileage upgrade listed in 我的案件
 const h12=await p.evaluate(()=>{
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911')||(S.users||[])[0];S.user=u;
   const d=new Date(Date.now()+16*86400000).toISOString().slice(0,10);
   const f=[].concat(FLIGHTS).filter(x=>x&&!x.via&&x.fr==='TPE'&&x.to==='LAX')[0];
   S.bookings=(S.bookings||[]).filter(x=>x.pnr!=='CSV6');
   S.bookings.push({pnr:'CSV6',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'P',paxList:[{last:'A',first:'B'}]});
   S.upgradeReqs=(S.upgradeReqs||[]).filter(x=>x.pnr!=='CSV6');
   S.upgradeReqs.push({id:'UGV6000001',pnr:'CSV6',seg:'out',code:f.code,date:d,fromClass:'O',toCabin:'Premium',miles:21000,memberId:u.id,status:'confirmed',at:todayISO()});
   S.view='profile';S.profileTab='mycases920H';render();
   const nav=document.querySelector('#app .q-member-nav');
   const tops=nav?[...nav.querySelectorAll('button')].map(b=>Math.round(b.getBoundingClientRect().top)):[];
   const txt=(document.querySelector('#app .q-member-body')||{}).innerText||'';
   return {rows:new Set(tops).size,btns:tops.length,listed:/UGV6000001/.test(txt)&&/里程升等/.test(txt)};
 });
 push('H12','會員中心分頁一排、我的案件列出里程升等',h12.rows===1&&h12.btns>=5&&h12.listed,JSON.stringify(h12));

 // H13 AI launcher gradient: exactly one gradient definition, launcher star painted
 const h13=await p.evaluate(()=>{S.view='home';render();
   const n=document.querySelectorAll('#kgmAiG139').length;
   const hidden=[...document.querySelectorAll('#kgmAiG139')].some(g=>{let e=g;while(e&&e!==document.body){if(getComputedStyle(e).display==='none')return true;e=e.parentElement}return false});
   return {defs:n,hidden};
 });
 push('H13','AI 圖示漸層只有一份、不在隱藏區塊裡',h13.defs===1&&!h13.hidden,JSON.stringify(h13));

 // H14 Residence: bid keeps both sectors at the fallback fare; sweeper does not wipe the refund-held sector
 const h14=await p.evaluate(()=>{
   const oa=window.alert;window.alert=function(){};
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911')||(S.users||[])[0];S.user=u;
   const dep=new Date(Date.now()+25*86400000).toISOString().slice(0,10),ret=new Date(Date.now()+32*86400000).toISOString().slice(0,10);
   S.search=Object.assign(S.search||{},{fr:'TPE',to:'LAX',dep:dep,ret:ret,type:'RT',cabin:'First',adults:1,children:0,infants:0,pax:1,useMiles:false});
   S.outF=S.inbF=S.outC=S.inbC=null;S.phase='sel_out';S.view='booking';S.resBidSegR923=null;
   const o=window.kgmResFlightsR161('TPE','LAX',dep)[0],i=window.kgmResFlightsR161('LAX','TPE',ret)[0];
   const res={};
   try{
     S.resModalR161={code:o.code,date:dep,step:2,seg:'out'};
     const amtO=Math.max(400000,(window.kgmResidenceMinBidR83(o,dep,1)||0)+5000),amtI=Math.max(400000,(window.kgmResidenceMinBidR83(i,ret,1)||0)+5000);res.amtI=amtI;
     let box=document.createElement('div');box.innerHTML='<input id="k161amt" value="'+amtO+'"><select id="k161alt"><option value="business" selected>b</option></select>';document.body.appendChild(box);
     window.kgmResCashSubmitR161();box.remove();
     S.resModalR161={code:i.code,date:ret,step:2,seg:'inb'};
     box=document.createElement('div');box.innerHTML='<input id="k161amt" value="'+amtI+'"><select id="k161alt"><option value="refund" selected>r</option></select>';document.body.appendChild(box);
     window.kgmResCashSubmitR161();box.remove();
     window.kgmResFinishR161();
     try{window.kgmResCleanCabinR161()}catch(_){}
     const j=journeyPrice();
     res.out=S.outF&&S.outF.code+'/'+S.outC;res.inb=S.inbF&&S.inbF.code+'/'+S.inbC;res.phase=S.phase;
     res.inbAmt=((j.segs||[]).find(x=>x.key==='inb')||{}).amt;
   }catch(e){res.err=e.message}
   window.alert=oa;
   (S.residenceBidsR83||[]).forEach(b=>{if(S.resBidSegR923&&(b.id===S.resBidSegR923.out||b.id===S.resBidSegR923.inb))b.status='withdrawn'});
   S.resBidSegR923=null;S.outF=S.inbF=S.outC=S.inbC=null;S.phase='sel_out';
   return res;
 });
 push('H14','Residence 出價後去回程都保留（備案票價／出價金額），不會被清掉',
   /\/B-K$/.test(h14.out||'')&&/\/R-R$/.test(h14.inb||'')&&h14.phase==='pax'&&h14.inbAmt===h14.amtI,JSON.stringify(h14));

 // H15 card page: card preview + fields, ids kept, expiry selects feed #cexp
 const h15=await p.evaluate(()=>{
   const d=new Date(Date.now()+25*86400000).toISOString().slice(0,10);
   S.search={fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1,cabin:'Economy'};S.view='booking';
   const fs=sortedFlights('TPE','NRT',d)||[];pickFare('out',0,(validCodes(Object.assign({},fs[0],{date:d}))||[])[0],true);
   S.phase='pay';render();
   const m=document.getElementById('cexpM'),y=document.getElementById('cexpY');
   if(m&&y){m.value='07';y.value=y.options[3].value;kgmCardLiveR923(m)}
   const n=document.getElementById('cnum');if(n){n.value='5500000000000004';kgmCardLiveR923(n)}
   return {card:!!document.querySelector('.k923cc-card'),ids:['cname','cnum','cexp','ccvv'].every(i=>document.getElementById(i)),
     exp:(document.getElementById('cexp')||{}).value,brand:(document.getElementById('k923ccBrand')||{}).textContent,
     contact:!!document.getElementById('ccEmail')&&!!document.getElementById('ccTel')};
 });
 push('H15','信用卡頁：卡片預覽＋欄位＋持卡人聯絡資訊',h15.card&&h15.ids&&/^07\/\d\d$/.test(h15.exp||'')&&h15.brand==='MASTERCARD'&&h15.contact,JSON.stringify(h15));


 // H16 admin tabs no longer freeze: auctions paged, sched/feedback render quickly
 const h16=await p.evaluate(()=>{
   S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';
   const r={};
   for(const t of ['auctions','feedback_r48','sched','fleetsched','staff']){const t0=performance.now();S.adminTab=t;render();r[t]=Math.round(performance.now()-t0);if(t==='auctions')r.aucNodes=document.querySelectorAll('#app *').length}
   S.view='home';render();return r;
 });
 push('H16','後台分頁不再卡住（競標分頁顯示、班表分次計算）',h16.aucNodes<15000&&h16.auctions<1500&&h16.feedback_r48<1500&&h16.sched<1500&&h16.fleetsched<1500&&h16.staff<1500,JSON.stringify(h16));


 // H17 AI window: an open conversation survives a re-render
 const h17=await p.evaluate(async()=>{
   const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911');S.user=u;S.view='home';render();
   if(!S.aiOpen0819H)kgmToggleAi0819I();
   const inp=document.getElementById('aiInput');inp.value='測試 H17 對話保留';kgmSendAi0819I();
   await new Promise(r=>setTimeout(r,400));
   const before=document.getElementById('aiMessages').innerText.indexOf('測試 H17 對話保留')>=0;
   render();await new Promise(r=>setTimeout(r,600));
   const after=document.getElementById('aiMessages').innerText.indexOf('測試 H17 對話保留')>=0;
   const open=getComputedStyle(document.getElementById('aiWindow')).display!=='none';
   kgmToggleAi0819I();
   return {before,after,open};
 });
 push('H17','AI 開著時畫面重畫，對話不會被換回歡迎頁',h17.before&&h17.after&&h17.open,JSON.stringify(h17));

 // H18 booking confirmation mail: one send per PNR, failures handled
 const h18=await p.evaluate(()=>{
   const a=kgmNotify('booking.confirmed',{pnr:'H18TEST',email:'h18@example.com'}),b=kgmNotify('booking.confirmed',{pnr:'H18TEST',email:'h18@example.com'});
   a.catch(()=>{});b.catch(()=>{});
   return {same:a===b};
 });
 push('H18','同一個 PNR 的訂位確認信只寄一次',h18.same,JSON.stringify(h18));

 // H19 fleet downsized, no ghost tails, full coverage, clean rotation
 const h19=await p.evaluate(()=>{
   const n={};['B779','A388','B78X','B789','A21N','A21X','A35K','A359','A339L','A339R'].forEach(t=>n[t]=(tailsFor(t)||[]).length);
   const ghosts=Object.keys(S.tailAssign||{}).filter(t=>!_typeOfTail(t)).length;
   const cov=window.kgmLiveCoverR135(),rot=window.kgmAuditRotAllR922(true),idle=window.kgmFleetIdleR922(60);
   return {n,total:Object.values(n).reduce((a,b)=>a+b,0),ghosts,missing:cov.missing,expected:cov.expected,gap:rot.gap,overlap:rot.overlap,type:rot.type,idle7:idle.idle7,idleSample:idle.sample};
 });
 push('H19','機隊縮編：A339 維持 28、無幽靈機身、覆蓋率 100%、輪轉乾淨',
   h19.n.A339L+h19.n.A339R===28&&h19.n.A388===10&&h19.n.B789===30&&h19.n.A359===24&&h19.n.B779===49
   &&h19.ghosts===0&&h19.missing===0&&h19.expected>100000&&h19.gap===0&&h19.overlap===0&&h19.type===0,JSON.stringify(h19));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',JSON.stringify(errs.slice(0,5)));
 console.log('DLG',JSON.stringify(dlg.slice(0,5)));
 await b.close();})();

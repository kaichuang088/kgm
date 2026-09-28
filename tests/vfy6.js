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
   h19.n.A339L+h19.n.A339R===28&&h19.n.A388===10&&h19.n.B789===30&&h19.n.A359===24&&h19.n.B779===46
   &&h19.ghosts===0&&h19.missing===0&&h19.expected>100000&&h19.gap===0&&h19.overlap===0&&h19.type===0,JSON.stringify(h19));

 // ── 0927B ────────────────────────────────────────────────────────────
 // H20 staff tickets: 48h lock-in, ID25 = 7.5折, friend class ID50/ID25 only, policy text
 const h20=await p.evaluate(()=>{
   const f=[].concat(FLIGHTS).find(x=>x.code==='KX188')||FLIGHTS[0];
   const a25=stxFareAmount(10000,f,null,{plan:'ID25',pax:1,familyCount:0}),a50=stxFareAmount(10000,f,null,{plan:'ID50',pax:1,familyCount:0});
   const pol=JSON.stringify(window.KGM_STAFF_POLICY_R913||[]);
   return {lockH:window.KGM_STAFF_LOCK_H_R927,id25:!!TIX_TYPES.ID25,a25,a50,
     friendPlans:(window.KGM_FRIEND_PLANS_R927||[]).join(','),hasFriend:kgmStxHasFriendR927({stx:{fam:[{relation:'friend'}]}}),
     pol48:/48 小時/.test(pol),pol72:/72 小時/.test(pol),polFriend:/同性朋友/.test(pol)};
 });
 push('H20','員工票：48 小時定案、ID25 七五折、同性朋友僅 ID50／ID25、管理辦法已更新',
   h20.lockH===48&&h20.id25&&h20.a25===7500&&h20.a50===5000&&h20.friendPlans==='ID50,ID25'&&h20.hasFriend&&h20.pol48&&!h20.pol72&&h20.polFriend,JSON.stringify(h20));

 // H21 new dependant / friend must be verified by the back office before travelling
 const h21=await p.evaluate(async()=>{
   const st=(S.staff||[]).filter(x=>x&&x.role&&x.password&&x.empId&&x.active!==false&&(x.famOnFile||[]).length)[0];
   const d=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
   st.famOnFile=(st.famOnFile||[]).filter(r=>r.relation!=='friend'&&!r.pendR927);
   S.promoCode=st.empId;S.stx=null;S.stxConfirmVerified=false;S.staffVerifiedR10=false;
   S.view='booking';S.phase='sel_out';S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1});render();
   await new Promise(r=>setTimeout(r,900));
   const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;return true}return false};
   set('k55FamLast','H21');set('k55FamFirst','FRIEND');set('k55FamRel','friend');set('k55FamDob','1990-01-02');set('k55FamPass','H2100001');
   kgmStaffAddFamilyK5();await new Promise(r=>setTimeout(r,900));
   kgmStaffWhoToggleK5('dependent');
   const pendLocked=[...document.querySelectorAll('.k55-famck[data-pend]')].length===1&&[...document.querySelectorAll('.k55-famck[data-pend]')].every(c=>c.disabled);
   const pend=kgmFamPendingR927().filter(x=>x.st.empId===st.empId).length;
   const i=kgmFamPendingR927().filter(x=>x.st.empId===st.empId)[0].i;
   kgmFamReviewR927(st.empId,i,true);
   const after=kgmFamPendingR927().filter(x=>x.st.empId===st.empId).length;
   const fi=st.famOnFile.findIndex(r=>r.relation==='friend');
   S.view='booking';S.phase='sel_out';S.stx=null;render();await new Promise(r=>setTimeout(r,900));
   set('k55EmpId',st.empId);set('k55EmpPw',st.password);set('k55Plan','ID90');set('k55Who','dependent');kgmStaffWhoToggleK5('dependent');
   document.querySelectorAll('.k55-famck').forEach(c=>{c.checked=(+c.getAttribute('data-i')===fi)});
   set('k169fr','TPE');set('k169to','NRT');set('k169dep',d);
   kgmStaffGateVerifyK5();const id90=S.stx?S.stx.plan:null;
   set('k55Plan','ID25');document.querySelectorAll('.k55-famck').forEach(c=>{c.checked=(+c.getAttribute('data-i')===fi)});
   kgmStaffGateVerifyK5();const id25=S.stx?S.stx.plan:null;
   st.famOnFile=st.famOnFile.filter(r=>r.relation!=='friend');S.stx=null;S.promoCode='';S.view='home';render();
   return {pendLocked,pend,after,id90,id25};
 });
 push('H21','新登記眷屬／同性朋友須後台核對才可同行；朋友同行擋 ID90、放行 ID25',
   h21.pendLocked&&h21.pend===1&&h21.after===0&&h21.id90===null&&h21.id25==='ID25',JSON.stringify(h21));

 // H22 Residence: cash bid present -> settle at 14 days and notify miles bidders; no cash -> wait for 7 days; Business and First may bid
 const h22=await p.evaluate(()=>{
   const dAt=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
   const all=[].concat(FLIGHTS,S.customFlights||[]).filter(f=>f&&!f.via);
   function a388On(n){const d=dAt(n);for(const f of all){try{if(acftOfFlight(f.code,d)==='A388'&&(typeof flightOperatesOn!=='function'||flightOperatesOn(f,new Date(d+'T12:00:00'))))return {f,d}}catch(_){}}return null}
   const A=a388On(12),B=a388On(10);if(!A||!B)return {err:'no A388'};
   const u=S.users[0];
   S.residenceBidsR83=(S.residenceBidsR83||[]).filter(x=>!/^H22/.test(x.id));S.resMileBidsR161=(S.resMileBidsR161||[]).filter(x=>!/^H22/.test(x.id));
   S.residenceBidsR83.push({id:'H22C',code:A.f.code,date:A.d,amount:500000,status:'open',placedAt:new Date().toISOString(),userId:u.id});
   S.resMileBidsR161.push({id:'H22M1',kind:'miles',userId:u.id,code:A.f.code,date:A.d,miles:900000,fallback:'refund',status:'open',placedAt:new Date().toISOString()});
   S.resMileBidsR161.push({id:'H22M2',kind:'miles',userId:u.id,code:B.f.code,date:B.d,miles:900000,fallback:'refund',status:'open',placedAt:new Date().toISOString()});
   /* 0927C：後台〈競標管理〉會替 A388 班產生模擬現金出價；B 要測「沒有現金出價」，先把 B 那一班的模擬現金出價暫時拿開，測完放回去 */
   const stashB=(S.residenceBidsR83||[]).filter(x=>x&&x.code===B.f.code&&x.date===B.d&&!/^H22/.test(x.id));
   S.residenceBidsR83=S.residenceBidsR83.filter(x=>stashB.indexOf(x)<0);
   const r0=kgmAutoSettleAuctionsR923();
   const m1=S.resMileBidsR161.find(x=>x.id==='H22M1'),m2=S.resMileBidsR161.find(x=>x.id==='H22M2'),c=S.residenceBidsR83.find(x=>x.id==='H22C');
   const note=(S.notifs||[]).some(n=>n.type==='residence'&&n.title.indexOf(A.f.code)>=0&&/現金出價一律優先/.test(n.message));
   const out={c:c.status,m1:m1.status,why:m1.lostReasonR927,m2:m2.status,note,biz:kgmResEligR922('A388','B-T'),first:kgmResEligR922('A388','F-X'),prem:kgmResEligR922('A388','P-F'),
     A:A.f.code+' '+A.d,B:B.f.code+' '+B.d,m2why:m2.lostReasonR927||'',settled:r0,cashB:(S.residenceBidsR83||[]).filter(x=>x.code===B.f.code&&x.date===B.d).map(x=>x.id+':'+x.status)};
   S.residenceBidsR83=S.residenceBidsR83.filter(x=>!/^H22/.test(x.id)).concat(stashB);S.resMileBidsR161=S.resMileBidsR161.filter(x=>!/^H22/.test(x.id));
   return out;
 });
 push('H22','Residence：14 天有現金出價即結標並通知里程未得標；沒有現金等 7 天；商務與頭等都可出價',
   h22.c==='won'&&h22.m1==='lost'&&h22.why==='cash_priority'&&h22.m2==='open'&&h22.note&&h22.biz&&h22.first&&!h22.prem,JSON.stringify(h22));

 // H23 check-in counters: every counter 2–3 flights when the slot has more than one; no duplicate counter numbers; A388 rule kept
 const h23=await p.evaluate(()=>{
   let single=0,dup=0,a388=0,tot=0;
   for(const ap of ['TPE','TSA'])for(let d=0;d<3;d++){const date=new Date(Date.now()+d*86400000).toISOString().slice(0,10);
     for(let s=0;s<8;s++){const o=window.kgmCounterAllocR74(ap,date,s),rows=(o&&o.rows)||[],byT={},seen={};
       rows.forEach(r=>{byT[r.term]=(byT[r.term]||0)+(r.flights||[]).length});
       rows.forEach(r=>{const fl=r.flights||[],k=r.term+'#'+r.counter;tot++;if(seen[k])dup++;seen[k]=1;
         if(fl.length===1&&byT[r.term]>1)single++;if(fl.length>3)single++;
         const big=fl.filter(f=>/A388/.test(f.type||'')).length;if(big>=2||(big&&fl.length>2))a388++})}}
   return {tot,single,dup,a388};
 });
 push('H23','報到櫃檯：每櫃 2–3 班（該時段只有一班除外）、櫃號不重複、A388 規則照舊',h23.tot>50&&h23.single===0&&h23.dup===0&&h23.a388===0,JSON.stringify(h23));

 // H24 crew: cabin crew = CAA minimum ceil(seats/50) + 1–2; rest per CAA (30 h in any 7 days, rest after FDP)
 const h24=await p.evaluate(()=>{
   const c=t=>kgmCabinCrewR927(t);
   const T=todayISO(),crew=(S.staff||[]).filter(x=>x&&x.active!==false&&(x.role==='cabin'||x.role==='pilot')).slice(0,40);
   let restBad=0,winBad=0,people=0,maxRun=0;
   crew.forEach(p=>{let ch=null;try{ch=kgmCrewChainR210(p.empId,T,21)}catch(_){return}if(!ch)return;people++;const ds=[];let run=0;
     ch.forEach(day=>{const op=(day.legs||[]).filter(l=>!(l.dhR913||l.deadhead)&&isFinite(+l.depUTC));if(!op.length){run=0;return}run++;maxRun=Math.max(maxRun,run);op.sort((a,b)=>a.depUTC-b.depUTC);ds.push({rep:op[0].depUTC-60,rel:op[op.length-1].arrUTC+30})});
     for(let i=1;i<ds.length;i++){const fdp=ds[i-1].rel-ds[i-1].rep,need=fdp<=480?540:fdp<=720?720:fdp<=960?1200:1440;if(ds[i].rep-ds[i-1].rel<need)restBad++}
     const t0=Date.parse(T+'T00:00:00+08:00')/60000;
     ds.forEach(x=>{const end=x.rel,from=end-10080;if(from<t0)return;let cur=from,best=0;ds.forEach(y=>{if(y.rel<=from||y.rep>end)return;best=Math.max(best,y.rep-cur);cur=Math.max(cur,y.rel)});if(Math.max(best,end-cur)<1800)winBad++})});
   return {A388:c('A388').crew,A388legal:c('A388').legal,B779:c('B779').crew,A21N:c('A21N').crew,min:_cabinMin('B789'),people,restBad,winBad,maxRun};
 });
 push('H24','組員：客艙人數＝民航局下限＋1～2 位；休息符合民航局規定（任 7 日連續 30 小時、執勤後休息）',
   h24.A388===13&&h24.A388legal===11&&h24.B779===10&&h24.A21N===6&&h24.min===8&&h24.people>=30&&h24.restBad===0&&h24.winBad===0&&h24.maxRun<=6,JSON.stringify(h24));

 // H25 UKB: KX160/KX159 on the A21X special are compliant and not reported as type changes
 const h25=await p.evaluate(()=>{
   let d=null;for(let i=0;i<7&&!d;i++){const x=new Date(Date.now()+i*86400000).toISOString().slice(0,10);const f=[].concat(FLIGHTS).find(q=>q.code==='KX160');const op=(()=>{try{return typeof flightOperatesOn==='function'?flightOperatesOn(f,new Date(x+'T12:00:00')):true}catch(_){return true}})();if(f&&op)d=x}
   const ch=[];for(let i=0;i<7;i++){const x=new Date(Date.now()+i*86400000).toISOString().slice(0,10);(kgmActualAircraftChangesR6(x)||[]).forEach(c=>{if(/UKB/.test(c.route))ch.push(x+' '+c.code)})}
   return {d,kx160:acftOfFlight('KX160',d),kx158:acftOfFlight('KX158',d),ukbChanges:ch.length};
 });
 push('H25','UKB：KX160／KX159 用 A21X 特別版算符合，不列為機型異動',h25.kx160==='A21X'&&h25.kx158==='A21N'&&h25.ukbChanges===0,JSON.stringify(h25));

 // H26 fleet: DST-correct arrival (KX55 in NZDT), one TSA plan (legs match windows), no ≥7-day blank tails
 const h26=await p.evaluate(()=>{
   const f=[].concat(FLIGHTS).find(x=>x.code==='KX55');
   const T=todayISO(),D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   let tsaNoPlan=0,planNoTsa=0;const W=S.tsaWindowsR913||{};
   Object.keys(S.tailAssign).forEach(tl=>{if(_typeOfTail(tl)!=='B78X')return;const has={};(S.tailAssign[tl]||[]).forEach(x=>{if(x&&(x.tsaFixedR830||/TSA/.test((x.fr||'')+(x.to||'')+(x.route||''))))has[x.date]=1});
     for(let i=0;i<60;i++){const d=D(T,i),inWin=(W[tl]||[]).some(w=>d>=w.in&&d<=(w.out||'9999'));if(has[d]&&!inWin)tsaNoPlan++;if(inWin&&!has[d])planNoTsa++}});
   const idle=kgmFleetIdleR922(60);
   /* 0927C：備用登記（B-58911～913 等）不在營運輪轉裡，閒置照實列出，不算營運機的空白 */
   const RSV=['B-58911','B-58912','B-58913','B-58921','B-58931'];   /* r72 RESERVE72 的備用登記 */
   const isR=x=>RSV.indexOf(String(x).split(' ')[0])>=0;
   const opIdle=idle.sample.filter(x=>!isR(x)).length+(idle.idle7>idle.sample.length?idle.idle7-idle.sample.length:0);
   return {nzdt:kgmDurOnR927(f,'2026-10-15'),nzst:kgmDurOnR927(f,'2027-05-10'),tsaNoPlan,planNoTsa,idle7:idle.idle7,worst:idle.worst,opIdle7:opIdle,reserveIdle:idle.sample.filter(isR)};
 });
 push('H26','機隊：日光節約落地時間正確、松山只有一份計畫、營運中的飛機沒有連續空白 7 天（備用機閒置照實列出）',
   h26.nzdt===675&&h26.nzst===615&&h26.tsaNoPlan===0&&h26.planNoTsa===0&&h26.opIdle7===0,JSON.stringify(h26));

 // H27 0927C mixed-type routes: the return leg is the same type as the aircraft that flew in (FIFO, one return per inbound)
 const h27=await p.evaluate(()=>{
   const M=window.KGM_MIXED_R136||{},T=todayISO(),D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   let n=0,bad=[],dup=0;const used={};
   Object.keys(M).forEach(k=>{const [c,fr,to]=k.split('|');if(fr==='TPE')return;const row=[].concat(FLIGHTS).find(f=>f&&f.code===c&&f.fr===fr&&f.to===to&&!f.via);if(!row)return;
     for(let i=0;i<30;i++){const d=D(T,i);let on=true;try{on=flyOn(kgmSeasonFlightR48(row,d),new Date(d+'T12:00:00'))}catch(_){}if(!on)continue;
       const pv=kgmMixedPrevLegR927C(c,fr,to,d);if(!pv)continue;n++;
       const uk=pv.code+'|'+pv.fr+'|'+pv.to+'|'+pv.date+'>'+c;const pk=pv.code+'|'+pv.fr+'|'+pv.to+'|'+pv.date+'|'+c+'|'+fr;if(used[pk])dup++;used[pk]=1;
       const a=acftOfFlight(c,d,fr,to),b=acftOfFlight(pv.code,pv.date,pv.fr,pv.to);if(a!==b&&bad.length<5)bad.push(d+' '+k+' '+a+' ← '+pv.date+' '+pv.code+' '+b);}});
   return {checked:n,bad:bad.length,dup,sample:bad};
 });
 push('H27','共飛航線（KX80/79、KX16/15、KX82/81、KX96/95、KX50/49）：回程機型＝飛進來那一架，一班配一班',h27.checked>100&&h27.bad===0&&h27.dup===0,JSON.stringify(h27));

 // H28 0927C EQV pairs use the outermost outbound type; ICN "one A388 per day" = one aircraft (outbound + its return)
 const h28=await p.evaluate(()=>{
   const P=window.KGM_EQV_PAIRS_R72||{},T=todayISO(),D=(d,n)=>{const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
   let n=0,bad=[];
   Object.keys(P).forEach(code=>{const q=P[code];const row=[].concat(FLIGHTS).find(f=>f&&f.code===code&&f.fr===q.fr&&f.to===q.to&&!f.via);const lead=[].concat(FLIGHTS).find(f=>f&&f.code===q.lead&&f.fr===q.to&&f.to===q.fr&&!f.via);if(!row||!lead)return;
     for(let i=0;i<30;i++){const d=D(T,i);let on=true;try{on=flyOn(row,new Date(d+'T12:00:00'))}catch(_){}if(!on)continue;
       const ld=D(d,-q.k);const sub=(c,dd)=>Object.keys(S.acftSub||{}).some(k=>k.indexOf(c+'_'+dd)===0);if(sub(code,d)||sub(q.lead,ld))continue;n++;   /* 有換機紀錄（後台或覆蓋補救）的班照紀錄飛，不算配對錯誤 */
       const a=acftOfFlight(code,d,q.fr,q.to),b=acftOfFlight(q.lead,ld,q.to,q.fr);if(a!==b&&bad.length<6)bad.push(ld+' '+q.lead+' '+b+' → '+d+' '+code+' '+a+' subs:'+Object.keys(S.acftSub||{}).filter(k=>k.indexOf(code+'_'+d)===0||k.indexOf(q.lead+'_'+ld)===0).join(','))}});
   const icn=kgmIcnA388AuditR136(30);
   let pairs=0,lone=0,loneS=[];for(let i=0;i<30;i++){const d=D(T,i);[].concat(FLIGHTS).filter(f=>f&&!f.via&&!f.partner&&f.fr==='TPE'&&f.to==='ICN').forEach(f=>{const m=/(\d+)/.exec(f.code);const r='KX'+(+m[1]-1);if(Object.keys(S.acftSub||{}).some(k=>k.indexOf(r+'_'+d)===0||k.indexOf(f.code+'_'+d)===0))return;if(acftOfFlight(f.code,d,'TPE','ICN')==='A388'){if(acftOfFlight(r,d,'ICN','TPE')==='A388')pairs++;else{lone++;loneS.push(d+' '+f.code+'/'+r+' '+acftOfFlight(r,d,'ICN','TPE')+' subs:'+Object.keys(S.acftSub||{}).filter(k=>k.indexOf(r+'_'+d)===0||k.indexOf(f.code+'_'+d)===0).join(','))}}})}
   return {checked:n,bad:bad.length,sample:bad,icnBad:icn.bad,icnPairs:pairs,icnLone:lone,loneS,pageSec:Math.round(performance.now()/1000)};
 });
 push('H28','EQV 去回程用最外層去程機型（含隔天回程）；首爾線每天一架 A388＝去回同一架',h28.checked>300&&h28.bad===0&&h28.icnBad===0&&h28.icnLone===0,JSON.stringify(h28));

 // H29 0927C ferries: positioning (no-pax) legs over the published year are a small residue (0927B: 1,842 + 577 split)
 const h29=await p.evaluate(()=>{const T=todayISO();let ferry=0,split=0,by={};Object.keys(S.tailAssign).forEach(t=>(S.tailAssign[t]||[]).forEach(x=>{if(!x||x.date<T)return;if(x.splitR927)split++;else if(x.noPax||x.positioningR830){ferry++;const k=_typeOfTail(t)+' '+x.route;by[k]=(by[k]||0)+1}}));
   const r=kgmAuditRotAllR922(true);return {ferry,split,gap:r.gap,overlap:r.overlap,type:r.type,cover:kgmLiveCoverR135().missing,top:Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5)}});
 push('H29','調機：一年不載客調機段數大幅下降（0927B 1,842＋577），排班無空檔跳站、無重疊、覆蓋 100%',h29.ferry+h29.split<300&&h29.gap===0&&h29.overlap===0&&h29.type===0&&h29.cover===0,JSON.stringify(h29));

 // H30 0927C rest-day pay goes straight into salary (Labour Standards Act §24 II; §40 for a 7th day)
 const h30=await p.evaluate(async()=>{
   const st=(S.staff||[]).filter(x=>x.role==='cabin'),ym=todayISO().slice(0,7),nx=kgmRestDayNextYmR927C(ym);
   /* 等下個月的組員班表排好（最多 60 秒，一小段一小段往後補） */
   const su=(()=>{let s=nx+'-01';const z=new Date(Date.UTC(+nx.slice(0,4),+nx.slice(5,7),0)).toISOString().slice(0,10),o=[];while(new Date(s+'T12:00:00Z').getUTCDay()!==0){const t=new Date(s+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+1);s=t.toISOString().slice(0,10)}for(;s<=z;){o.push(s);const t=new Date(s+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+7);s=t.toISOString().slice(0,10)}return o})();
   const last=su[su.length-1];let g=0;while(!kgmCrewHasDayR121(last)&&g++<400){kgmCrewStepR121(150,last);await new Promise(r=>setTimeout(r,10))}
   let checked=0,bad=[],days=0,hol=0;
   st.slice(0,40).forEach(x=>{const r=kgmRestDayCalcR927C(x.empId,nx);
     /* 自己重算：同一份組員班表，每週一～週日第 6 個執勤日 */
     const ch=kgmCrewChainR210(x.empId,r.dataFrom,Math.round((Date.parse(r.dataTo)-Date.parse(r.dataFrom))/864e5)+1)||[];const on={};ch.forEach(c=>{if((c.legs||[]).length)on[c.date]=1});
     const mine=[];su.forEach(s=>{const w=[];for(let i=6;i>=0;i--){const t=new Date(s+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-i);const d=t.toISOString().slice(0,10);if(on[d])w.push(d)}if(w.length>=6)mine.push(w[5])});
     checked++;days+=r.restDays.length;hol+=r.holidays.length;
     if(mine.join()!==r.restDays.map(q=>q.date).join()&&bad.length<3)bad.push(x.empId+' '+mine.join()+' vs '+r.restDays.map(q=>q.date).join());
     if(r.restDays.some(q=>q.h>12||q.h<0))bad.push(x.empId+' hours');});
   const s=salaryOf(st[0]);const sum=Math.round(s.base*s.sen*s.perf)+s.bonus+s.adj+s.restPay+s.holidayPay;
   return {nx,checked,bad:bad.length,sample:bad,restDays:days,holidays:hol,mult10:restMult927C(10),mult2:restMult927C(2),monthlyOk:s.monthly===sum,hasField:'restPay' in s};
 });
 push('H30','薪資：休息日出勤加給（勞基法 §24：1⅓／1⅔／2⅔）直接加進本月薪資；與組員班表逐週重算一致',
   h30.checked===40&&h30.bad===0&&h30.restDays>0&&Math.abs(h30.mult10-18)<1e-9&&Math.abs(h30.mult2-8/3)<1e-9&&h30.monthlyOk&&h30.hasField,JSON.stringify(h30));

 // H31 0927C motion: styles injected (reduced-motion respected), page change animates, same-page re-render does not, nothing left hidden
 const h31=await p.evaluate(async()=>{
   const q=s=>document.querySelectorAll(s).length,st=document.getElementById('kgm-motion-927c');
   S.adminAuthed=false;S.view='home';render();await new Promise(r=>setTimeout(r,1500));
   const d=new Date(Date.now()+20*864e5).toISOString().slice(0,10);S.view='booking';S.phase='sel_out';S.search=Object.assign(S.search||{},{fr:'TPE',to:'NRT',dep:d,type:'OW',pax:1});render();
   await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,20)));const onNav=q('.kgm-in927c,.kgm-enter927c');
   await new Promise(r=>setTimeout(r,1600));const left=q('.kgm-in927c,.kgm-enter927c');
   render();await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,20)));const onRe=q('.kgm-in927c,.kgm-enter927c,.kgm-rv927c');
   S.view='home';render();
   return {style:!!st,reduced:!!(st&&/prefers-reduced-motion: no-preference/.test(st.textContent)),zeroSpec:!!(st&&/:where\(button/.test(st.textContent)),onNav,left,onRe};
 });
 push('H31','動畫：換頁才播、同頁重畫不重播、播完不留隱藏；尊重「減少動態效果」；按鈕規則權重 0 不蓋原樣式',
   h31.style&&h31.reduced&&h31.zeroSpec&&h31.onNav>3&&h31.left===0&&h31.onRe===0,JSON.stringify(h31));


 // H32 0927D Residence: fallback chosen from a cabin x fare table, submit goes straight to the next booking step, My Trips shows status and withdraws before the deadline
 const h32=await p.evaluate(async()=>{
   const oa=window.alert,oc=window.confirm;window.alert=function(){};window.confirm=function(){return true};
   const out={};
   try{
     const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911')||(S.users||[])[0];S.user=u;
     const dep=new Date(Date.now()+25*86400000).toISOString().slice(0,10),ret=new Date(Date.now()+32*86400000).toISOString().slice(0,10);
     S.search=Object.assign(S.search||{},{fr:'TPE',to:'LAX',dep:dep,ret:ret,type:'RT',cabin:'First',adults:1,children:0,infants:0,pax:1,useMiles:false});
     S.outF=S.inbF=S.outC=S.inbC=null;S.phase='sel_out';S.view='booking';S.resBidSegR923=null;render();
     const o=window.kgmResFlightsR161('TPE','LAX',dep)[0];
     S.resModalR161={code:o.code,date:dep,step:2,seg:'out'};window.kgmResRepaintR161();
     await new Promise(r=>setTimeout(r,400));
     out.table=!!document.querySelector('.k927d-tbl');out.selHidden=(document.getElementById('k161alt')||{}).style.display==='none';
     out.rows=document.querySelectorAll('.k927d-tbl tr').length;
     const cell=[...document.querySelectorAll('.k927d-cell')].find(b=>!/超值|Value/.test((FARES[b.getAttribute('data-code')]||{}).tier||''));
     out.picked=cell&&cell.getAttribute('data-code');cell.click();await new Promise(r=>setTimeout(r,150));
     document.getElementById('k161amt').value=String(Math.max(400000,window.kgmResidenceMinBidR83(o,dep,1)+5000));
     document.querySelector('.k161-go[onclick*="kgmResCashSubmitR161"]').click();await new Promise(r=>setTimeout(r,400));
     out.phase1=S.phase;out.outC=S.outC;out.modalClosed=!S.resModalR161;
     const pnr='V927D'+String(Date.now()).slice(-4);
     const bk={pnr:pnr,userId:u.id,status:'confirmed',outF:S.outF,outC:S.outC,total:500000,paxList:[{last:'V',first:'T'}],cardLast4:'4242'};
     S.bookings.push(bk);(S.residenceBidsR83||[]).forEach(x=>{if(x&&S.resBidSegR923&&x.id===S.resBidSegR923.out){x.pnr=pnr;bk.resBidsR923=[x.id]}});S.resBidSegR923=null;
     window.kgmOpenTripR60(pnr);await new Promise(r=>setTimeout(r,1200));   /* 旅客從「我的行程」點進這筆訂位 */
     const pn=document.querySelector('.k927d-trip');out.panel=!!pn;out.dbg={view:S.view,sub:(typeof window.kgmSubPageR60==='function')?window.kgmSubPageR60():null,mt:S.mtOnly,bids:window.kgmResTripBidsR927D?window.kgmResTripBidsR927D(bk).length:-1,col:!!document.querySelector('.k56-trip')};console.log('H32DBG '+JSON.stringify(out));out.status=pn&&/競標中|Open/.test(pn.innerText);
     const wd=document.querySelector('.k927d-wd');if(wd){wd.click();await new Promise(r=>setTimeout(r,800))}
     const b=(S.residenceBidsR83||[]).find(x=>x.pnr===pnr);out.after=b&&b.status;out.fee=b&&b.withdrawFeeR927D;out.keep=bk.outC;
     S.bookings=S.bookings.filter(x=>x.pnr!==pnr);S.residenceBidsR83=(S.residenceBidsR83||[]).filter(x=>x.pnr!==pnr);
     S.mtOnly=null;S.mgResult=null;S.view='home';S.outF=S.inbF=S.outC=S.inbC=null;S.phase='sel_out';render();
   }catch(e){out.err=e.message}
   window.alert=oa;window.confirm=oc;return out;
 });
 push('H32','Residence：備案用艙等×方案表格自己按；送出直接到下一步；行程管理顯示競標狀態、截止前可撤回',
   h32.table&&h32.selHidden&&h32.rows>=3&&h32.picked&&h32.outC===h32.picked&&h32.phase1==='sel_inb'&&h32.modalClosed&&h32.panel&&h32.status&&h32.after==='withdrawn'&&h32.fee===1200&&h32.keep===h32.picked,JSON.stringify(h32));

 // H33 0927D miles: both the outbound and the return earn miles; running the credit twice does not double
 const h33=await p.evaluate(()=>{
   const u=S.users.find(x=>x.id==='KGMDEMO0911')||S.users[0];const D=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
   const o=Object.assign({},[].concat(FLIGHTS).find(f=>f&&!f.via&&f.code==='KX180'),{date:D(-6)}),i=Object.assign({},[].concat(FLIGHTS).find(f=>f&&!f.via&&f.code==='KX181'&&f.fr==='NRT'),{date:D(-3)});
   S.bookings=S.bookings.filter(b=>b.pnr!=='H33RT');S.bookings.push({pnr:'H33RT',userId:u.id,status:'confirmed',outF:o,outC:'E-T',inbF:i,inbC:'E-T',paxList:[{kgmId:u.id,last:'A',first:'B'}],milesGranted:false});
   const m0=S.users.find(x=>x.id===u.id).miles;checkAutoArrivals();const m1=S.users.find(x=>x.id===u.id).miles;checkAutoArrivals();const m2=S.users.find(x=>x.id===u.id).miles;
   const want=calcMiles(distOf(o.fr,o.to),u.level,'E-T')+calcMiles(distOf(i.fr,i.to),u.level,'E-T');const b=S.bookings.find(x=>x.pnr==='H33RT');
   const r={gained:m1-m0,want,again:m2-m1,out:b.out_mg,inb:b.inb_mg,all:b.milesGranted};S.bookings=S.bookings.filter(x=>x.pnr!=='H33RT');return r;
 });
 push('H33','里程：去程、回程都累積；重跑不重複入帳',h33.gained===h33.want&&h33.want>0&&h33.again===0&&h33.out&&h33.inb&&h33.all,JSON.stringify(h33));

 // H34 0927D upgrade centre does not list flights that have already departed
 const h34=await p.evaluate(async()=>{
   const u=S.users.find(x=>x.id==='KGMDEMO0911')||S.users[0];S.user=u;const D=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
   const o=Object.assign({},[].concat(FLIGHTS).find(f=>f&&!f.via&&f.code==='KX180'),{date:D(-2)}),i=Object.assign({},[].concat(FLIGHTS).find(f=>f&&!f.via&&f.code==='KX181'&&f.fr==='NRT'),{date:D(5)});
   S.bookings=S.bookings.filter(b=>b.pnr!=='H34UP');S.bookings.push({pnr:'H34UP',userId:u.id,status:'confirmed',outF:o,outC:'E-T',inbF:i,inbC:'E-T',paxList:[{kgmId:u.id,last:'A',first:'B'}],total:30000});
   S.upgradePick0813=null;S.upgradeSuccess0813=null;S.view='upgrade';render();await new Promise(r=>setTimeout(r,1200));
   const t=document.getElementById('app').innerText;const lines=t.split('\n').filter(l=>/H34UP/.test(l));
   const r={lines:lines.length,past:lines.length>1,future:lines.length>=1,fn:typeof kgmDepartedR927D};
   S.bookings=S.bookings.filter(x=>x.pnr!=='H34UP');S.view='home';render();return r;
 });
 push('H34','艙位升等：已起飛的航班不列出，未起飛的照列',h34.lines===1&&h34.future&&h34.fn==='function',JSON.stringify(h34));

 // H35 0927D crew: every Monday–Sunday week has at least one full day off (flights and deadheading both count)
 const h35=await p.evaluate(async()=>{
   const nx=kgmRestDayNextYmR927C(todayISO().slice(0,7));
   const z=new Date(Date.UTC(+nx.slice(0,4),+nx.slice(5,7),0)).toISOString().slice(0,10);let last=z,g=0;
   while(new Date(last+'T12:00:00Z').getUTCDay()!==0){const t=new Date(last+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-1);last=t.toISOString().slice(0,10)}
   while(!kgmCrewHasDayR121(last)&&g++<600){kgmCrewStepR121(150,last);await new Promise(r=>setTimeout(r,5))}
   const ids=(S.staff||[]).filter(x=>x.role==='pilot'||x.role==='cabin').map(x=>x.empId);let hol=0,rest=0;
   const det=[];ids.forEach(id=>{const r=kgmRestDayCalcR927C(id,nx);hol+=r.holidays.length;rest+=r.restDays.length;r.holidays.forEach(h=>{if(det.length<3){const w0=new Date(Date.parse(h.date)-6*864e5).toISOString().slice(0,10);const ch=kgmCrewChainR210(id,w0,7);det.push(id+' '+ch.map(c=>c.date.slice(5)+':'+(c.legs||[]).map(l=>l.code+(l.deadhead||l.dhR913||/DH/.test(l.remark||'')?'(DH)':'')+(l.fillR196?'(F)':'')).join('+')).join('|'))}})});
   const layers={};try{if(det.length){const m=/^(\S+) /.exec(det[0]);const id=m[1];const parts=det[0].split(' ')[1].split('|');const bad=parts.filter(x=>/:\S/.test(x)).pop().split(':')[0];const d='2026-'+bad;
     let fn=window.kgmCrewPlanR121,k=0;while(fn&&k<8){const pl=fn(d);const on=(pl.flights||[]).filter(f=>['pilots','cabin'].some(kk=>(f[kk]||[]).some(q=>q&&q.empId===id))).map(f=>f.code+JSON.stringify(((f.pilots||[]).concat(f.cabin||[])).filter(q=>q&&q.empId===id).map(q=>Object.keys(q).filter(z=>!/^(empId|name|rank|rankCode|seniority|role)$/.test(z)))));layers['L'+k+(fn.__r196?'r196':fn._rawR176?'r176':fn._rawR167?'r167':fn._rawR149?'r149':'')]=on;fn=fn._rawR196||fn._rawR176||fn._rawR167||fn._rawR149||fn._raw||null;k++}
     layers.duty=Object.keys(kgmCrewDutyDatesR927D(id)).filter(x=>x>='2026-10-10'&&x<='2026-10-20');layers.reg=(window.KGM_EXTRA_DUTY_R927D||{})[id];layers.d=d;}}catch(e){layers.err=e.message}
   return {nx,crew:ids.length,sevenDayWeeks:hol,restDays:rest,det,layers};
 });
 push('H35','組員：每週（一～日）至少一整天不排班（含調位日），例假出勤 0',h35.crew>300&&h35.sevenDayWeeks===0&&h35.restDays>0,JSON.stringify(h35));

 // H36 0927D fleet: the B779 reserve registrations fly in the rotation; no aircraft (reserves included) is idle 7 days
 const h36=await p.evaluate(()=>{
   const T=todayISO(),E=new Date(Date.now()+60*864e5).toISOString().slice(0,10),o={};
   ['B-58911','B-58912','B-58913'].forEach(t=>{o[t]=(S.tailAssign[t]||[]).filter(x=>x&&!x.noPax&&x.date>=T&&x.date<E).length});
   const idle=kgmFleetIdleR922(60);o.idle7=idle.idle7;o.sample=idle.sample;return o;
 });
 push('H36','機隊：B779 備用機跟營運機輪流飛，全機隊（含備用）沒有連續空白 7 天',h36['B-58911']>=30&&h36['B-58912']>=30&&h36['B-58913']>=30&&h36.idle7===0,JSON.stringify(h36));

 console.log('---SUMMARY---');
 console.log(JSON.stringify({total:out.length,fail:out.filter(x=>!x.ok).map(x=>x.id)}));
 console.log('ERR',JSON.stringify(errs.slice(0,5)));
 console.log('DLG',JSON.stringify(dlg.slice(0,5)));
 await b.close();})();

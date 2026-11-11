// 1112A C5：BigDeal 拉桿最左＝起標價（總價值）、現金＋里程合計達起標可出價、團體不能 BigDeal、沒有座位的艙不列
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(18000);
const r=await p.evaluate(async()=>{const u={id:'KGMBD40',name:'BD TEST',email:'bd40@example.com',password:'x',miles:200000,level:'Gold',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMBD40');S.users.push(u);S.user=u;
 let d=null,f=null;for(let k=3;k<=6&&!f;k++){const dd=addDays(todayISO(),k);const L=sortedFlights('TPE','LAX',dd)||[];const x=L.find(y=>!y.partner&&window.kgmBigDealWindowR929(y,dd).open&&kgmBigDealTargetsR929(y,dd,'Economy').length);if(x){f=x;d=dd}}
 if(!f)return {nof:true};S.bookings=S.bookings.filter(x=>!/^BD40/.test(x.pnr));S.bookings.push({pnr:'BD40AA',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'E-E',paxList:[{firstName:'BD',lastName:'TEST',passengerType:'ADT'}],total:30000,curr:'TWD'});
 S.bookings.push({pnr:'BD40GG',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'E-G',groupR1025B:{id:'GTEST'},paxList:[{firstName:'G',lastName:'ONE',passengerType:'ADT'}],total:20000,curr:'TWD'});
 S.view='bigdeal31';render();await new Promise(r=>setTimeout(r,1500));
 const trips=[...document.querySelectorAll('.k31d-trip .k31d-tt b')].map(x=>x.textContent);const soon=[...document.querySelectorAll('.k31d-soon div')].map(x=>x.innerText.replace(/\s+/g,' ')).filter(t=>/團體/.test(t));
 const row=document.querySelector('.k39g').closest('.k929bd-row');const box=row.querySelector('.k929bd-in');const wc=row.querySelector('.k39g[data-u="c"]'),wm=row.querySelector('.k39g[data-u="m"]');const rc=wc.querySelector('input[type=range]'),rm=wm.querySelector('input[type=range]');
 const st=()=>({c:[rc.min,rc.value,wc.getAttribute('data-v'),wc.querySelector('.k39g-sc span').textContent,wc.querySelector('.k39g-lv').textContent],m:[rm.min,rm.value,wm.getAttribute('data-v'),wm.querySelector('.k39g-sc span').textContent],tot:row.querySelector('.k39g-tot').innerText.replace(/\s+/g,' '),hid:[row.querySelector('input[type=number][id$="_c"]').value,row.querySelector('input[type=number][id$="_m"]').value]});
 const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};
 const S0=st(),open=+box.getAttribute('data-open');
 set(rc,1000);const S1=st();               // 低於起標 → 停在起標
 set(rm,Math.round(open/2/0.3));const S2=st();  // 里程一半 → 現金最低變一半
 set(rc,0);const S3=st();                   // 現金拉到最左
 set(rc,+rc.min);const S4=st();
 let al='';window.alert=m=>{al=m};row.querySelector('.k39g-act .btn-g').click();await new Promise(r=>setTimeout(r,800));const bd=(S.bigDeals||[]).filter(x=>x.pnr==='BD40AA').slice(-1)[0];
 // 低於起標的直接呼叫引擎
 S.bookings.push({pnr:'BD40AB',userId:u.id,status:'confirmed',outF:Object.assign({},f,{date:d}),outC:'E-E',paxList:[{firstName:'BD',lastName:'TWO',passengerType:'ADT'}],total:30000,curr:'TWD'});
 const low=kgmBigDealPlaceR929('BD40AB','out',bd?bd.toCabin:'Premium',open-100,0),mixOk=kgmBigDealPlaceR929('BD40AB','out',bd?bd.toCabin:'Premium',open/2,Math.ceil(open/2/0.3));S.bigDeals=S.bigDeals.filter(x=>x.pnr!=='BD40AB');
 const g1=kgmBigDealPlaceR929('BD40GG','out','Premium',open*2,0);const gh=kgmBigDealTripHtmlR929(S.bookings.find(x=>x.pnr==='BD40GG'),kgmTripSegmentsH(S.bookings.find(x=>x.pnr==='BD40GG')));
 // 全網：沒有座位卻列出的艙
 let z0=0,zb=0,n=0;const seen={};for(let k=2;k<=7;k++){const dd=addDays(todayISO(),k);for(const ff of FLIGHTS){if(!ff||ff.partner||!/^KX\d{1,3}$/.test(ff.code))continue;const key=ff.code+ff.fr+ff.to+dd;if(seen[key])continue;seen[key]=1;let w;try{w=kgmBigDealWindowR929(ff,dd)}catch(_){continue}if(!w.open)continue;try{if(!flyOn(ff,new Date(dd+'T12:00:00')))continue}catch(_){}try{kgmEnsureAuctionsR922(ff.code,dd,Object.assign({},ff,{date:dd}))}catch(_){}
   for(const t of kgmBigDealTargetsR929(ff,dd,'Economy')){const rk=kgmBigDealRankR929(ff.code,dd,ff.fr,ff.to,t.cab,false);n++;if(!rk.seats)z0++;if(!rk.bidders)zb++}}}
 return {flight:f.code+' '+d,open,trips,soon,S0,S1,S2,S3,S4,alert:al,bid:bd&&{amount:bd.amount,miles:bd.miles,status:bd.status,to:bd.toCabin},low,g1,grpHtml:gh.length,rows:n,zeroRows:z0,zeroBidders:zb,mixOk}});
console.log(JSON.stringify(r,null,1));
await p.evaluate(async()=>{S.bigDeals=S.bigDeals.filter(x=>x.pnr!=='BD40AA');render();await new Promise(r=>setTimeout(r,900));const e=document.querySelector('.k39g');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(600);await p.screenshot({path:'/tmp/j/s40/bd40_new.png'});
await p.evaluate(async()=>{const row=document.querySelector('.k39g').closest('.k929bd-row');const rm=row.querySelector('.k39g[data-u="m"] input[type=range]'),rc=row.querySelector('.k39g[data-u="c"] input[type=range]');const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};set(rc,+rc.min);set(rm,11000);set(rc,0)});await p.waitForTimeout(400);await p.screenshot({path:'/tmp/j/s40/bd40_mix.png'});
console.log('ERR',errs.slice(0,5));await b.close();process.exit(r&&r.bid&&!r.low.ok&&!r.g1.ok&&!r.grpHtml&&!r.zeroRows&&r.mixOk&&r.mixOk.ok&&!errs.length?0:1)})();

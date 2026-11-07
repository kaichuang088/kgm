// 1101A：地勤實體報到 → 直接開登機證；Residence 出價不帶備選座位
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{var T=todayISO(),D=addDays(T,1),f0=FLIGHTS.filter(x=>x.code==='KX180'&&!x.via)[0];
 for(var i=1;i<8;i++){var d=addDays(T,i);if(flyOn(f0,new Date(d+'T12:00:00'))){D=d;break}}
 var f=Object.assign({},f0,kgmSeasonFlightR48(f0,D),{date:D});
 S.bookings.push({pnr:'GCI28A',status:'confirmed',userId:S.users[0].id,outF:f,outC:'E-T',inbF:null,paxList:[{firstName:'MEI',lastName:'LIN',title:'MS',passport:'P1234567',dob:'1990-01-01',nat:'TW'}],seats:{},total:9000,curr:'TWD',bookedAt:new Date().toISOString()});
 S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='seatmap';render();
 window.confirm=()=>true;var al=[];window.alert=m=>al.push(m);
 kgmSeatCheckinR914('GCI28A','KX180',D);await new Promise(r=>setTimeout(r,1200));
 var bk=S.bookings.find(x=>x.pnr==='GCI28A');var st=window.ciState7?ciState7(bk,'out'):{};
 var res={D,modal:S.modal&&S.modal.type,checked:!!(st&&st.checkedIn),seat:JSON.stringify(bk.seats.out||{}),bpCard:!!document.querySelector('.k12bp-one,.k12bp'),bpText:/BOARDING PASS|登機證/.test((document.querySelector('.modal,.modal-bg,[class*=modal]')||document.body).innerText),alerts:al,tab:S.adminTab};
 // Residence
 var fr=FLIGHTS.filter(x=>x.code==='KX12'&&!x.via)[0]||FLIGHTS.find(x=>x.acft==='A388');var DR=addDays(T,40);
 var rb=null;try{rb=window.kgmResidenceBidR83({f:Object.assign({},fr,{date:DR}),date:DR,amount:9999999,alt:'business',pax:1,confirmed:true,atPurchaseR182:true})}catch(e){rb={err:e.message}}
 res.res={ok:rb&&rb.ok,why:rb&&rb.why,seat:rb&&rb.bid&&rb.bid.backupSeat,fix:window.kgmResSeatFixR1006A()};return res});
await p.screenshot({path:'/tmp/j/gci1.png'});
console.log(JSON.stringify(r,null,1),errs.slice(0,3));await b.close()})();

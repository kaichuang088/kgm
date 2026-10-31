const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1360,height:950}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('dialog',d=>{console.log('DIALOG',d.message().slice(0,120));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForTimeout(12000);
 await p.evaluate(()=>{const u=S.users.find(u=>u&&u.email);S.user=u;u.groupAccountR1025B={status:'active',type:'agency',company:'KGM 測試旅行社',taxId:'22099131',license:'交觀甲 1234',contact:{name:'王小明',phone:'0912345678',email:u.email},caseNo:'KG2490102526M'};S.view='home';render();
   kgmGrpModeR1025B(1);S.search.type='RT';S.search.fr='TPE';S.search.to='NRT';S.search.dep=addDays(todayISO(),40);S.search.ret=addDays(todayISO(),45);S.search.adults=20;S.search.children=2;S.search.cabin='Economy';passengerCounts();S.outF=null;S.inbF=null;S.seats={};S.paxList=[];S.phase='sel_out';S.openFare=null;nav('booking')});
 const cnt=async(t)=>{await p.locator('button:has-text("選擇票價")').nth(1).click();await p.waitForTimeout(5000);const r=await p.evaluate(()=>({txt:[...document.querySelectorAll('#app *')].filter(e=>e.children.length<3&&/可參與 Residence/.test(e.textContent)&&e.offsetHeight).map(e=>e.className).slice(0,3).join('|'),badge:[...document.querySelectorAll('.k920-resbid')].filter(e=>e.offsetHeight).length,res89:[...document.querySelectorAll('.k89-res')].filter(e=>e.offsetHeight).length}));console.log(t,JSON.stringify(r));};
 await cnt('group');await p.screenshot({path:'/tmp/j/grpres_g.png'});
 console.log('elig',await p.evaluate(()=>[kgmResEligR922('A388','B-Q'),kgmResEligR922('A388','B-T'),kgmResEligR922('A388','E-U')].join(',')));
 console.log('cashbid',await p.evaluate(()=>{try{return JSON.stringify(kgmResidenceBidR83({f:S.outF||{code:'KX182'},date:S.search.dep,amount:999999}))}catch(e){return 'err '+e.message}}));
 // 一般模式
 await p.evaluate(()=>{kgmGrpModeR1025B(0);S.search.adults=1;S.search.children=0;S.search.cabin='Business';passengerCounts();S.outF=null;S.openFare=null;S.phase='sel_out';nav('booking')});await p.waitForTimeout(2500);
 await cnt('normal');
 console.log('normal dbg2',await p.evaluate(()=>{const h=document.querySelector('tr[id^="fp"].k221-panel');let pr=h.previousElementSibling;while(pr&&!pr.classList.contains('fl-row'))pr=pr.previousElementSibling;const m=pr?pr.innerText.match(/KX\s?\d+/):null;const c=m&&m[0];return c+' acft '+acftOfFlight(c,S.search.dep)+' cash '+(S.residenceBidsR83||[]).filter(b=>b.code===c&&b.date===S.search.dep&&b.status==='open').length}));
 console.log('normal dbg',await p.evaluate(()=>{const r=kgmResFareBadgeR920();return 'cls '+document.documentElement.className+' grp25 '+S.search.grp25+' ret '+r+' badges '+document.querySelectorAll('.k920-resbid').length+' dep '+S.search.dep+' openFare '+JSON.stringify(S.openFare)+' panel '+!!document.querySelector('tr[id^="fp"].k221-panel')}));await p.screenshot({path:'/tmp/j/grpres_n.png'});
 // 里程出價：會員只有團體票
 console.log('milebid',await p.evaluate(()=>{const d=addDays(todayISO(),40);S.bookings.push({pnr:'GRPX01',userId:S.user.id,status:'confirmed',outF:{code:'KX182',fr:'TPE',to:'NRT',date:d},outC:'B-Q',groupR1025B:{id:'x'}});const f=FLIGHTS.find(x=>x.code==='KX182');const r=kgmResMileBidR161({f:f,date:d,miles:300000,fallback:'business'});S.bookings.pop();return JSON.stringify(r)}));
 console.log('errors',errs);await b.close()})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:240000});
await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});
await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{var u=S.users.find(x=>x.email==='demo@kgm.com')||S.users[0];u.groupAccountR1025B={status:'active',company:'KK TRIP',type:'agency',taxId:'22099131',contact:{name:'Admin',phone:'0912',email:'t@g.com'}};S.user=u;S.view='home';render();kgmGrpModeR1025B(1);kgmGrpPickR1101A('U');
 var D=addDays(todayISO(),40),R=addDays(D,5);Object.assign(S.search,{type:'RT',fr:'TPE',to:'NRT',dep:D,ret:R,adults:60,children:0,infants:0});passengerCounts();nav('booking');await new Promise(r=>setTimeout(r,1500));
 var cands=FLIGHTS.filter(x=>x.fr==='TPE'&&x.to==='NRT'&&!x.via&&!x.partner&&flyOn(x,new Date(D+'T12:00:00')));var pick=null;for(var x of cands){var f=Object.assign({},x,kgmSeasonFlightR48(x,D)||{},{date:D});if(kgmGrpSellR1025B('E-U',D,f)>0){pick=f;break}}
 if(!pick)return {none:true};S.outF=pick;S.outC='E-U';S.phase='sel_inb';render();await new Promise(r=>setTimeout(r,1800));
 return {out:pick.code,warn:S.grp28RetWarn&&S.grp28RetWarn.rows.map(r=>r.code+' '+r.dep+' '+r.n),modal:!!document.querySelector('#k28g-host .k28g-dlg')}});
await p.screenshot({path:'/tmp/j/g4.png'});console.log(JSON.stringify({r,errs:errs.slice(0,3)}));await b.close()})();

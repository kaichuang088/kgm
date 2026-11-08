// 1108A N4/N5：登機門前一天 23:00 才公布、前台航班動態預估只到隔天、證明實際抵達後才可下載；訂票頁航班詳情沒有準點膠囊與預估時刻
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto('file://'+(process.argv[2]||'/tmp/j/kgm.html'),{waitUntil:'domcontentloaded',timeout:240000});await p.waitForTimeout(20000);
const r=await p.evaluate(async()=>{const T=todayISO(),o={now:new Date().toString(),T};
 o.gate={};['KX181','KX183','KX49'].forEach(c=>{o.gate[c]=[0,1,2].map(k=>{const d=addDays(T,k);const g=kgmGateOfR26(c,d)||{};return d+' '+g.gate+' pub='+g.published+' planned='+g.plannedGate})});
 S._k65Raw=1;o.rawAdmin=(kgmGateOfR26('KX181',addDays(T,1))||{}).gate;S._k65Raw=0;
 S.view='status';S.stBoardR1019A=false;S.stByNo=true;S.stFlightNo='KX181';S.stBase=T;o.cards=[];
 for(const k of [-1,0,1,2]){S.stOff=k;render();await new Promise(r=>setTimeout(r,500));const c=document.getElementById('app');const tx=c.innerText.replace(/\s+/g,' ');const ix=tx.indexOf('KX181');o.cards.push({off:k,txt:tx.slice(Math.max(0,ix-60),ix+520),cert:!!(c&&[...c.querySelectorAll('button,a')].some(x=>/證明|Certificate/.test(x.textContent)&&!x.disabled))})}
 S.view='home';render();S.modal={type:'flightDetail',data:{fr:'TPE',to:'NRT',date:addDays(T,1),idx:0}};render();await new Promise(r=>setTimeout(r,500));const mm=document.querySelector('.r31-strip');const mo=mm&&mm.closest('.modal,[class*=modal]');const h=mo?mo.innerHTML:(mm?mm.parentNode.innerHTML:'');o.detailTxt=mo?mo.innerText.replace(/\s+/g,' ').slice(0,400):'';o.detail={len:h.length,strip:!!mm,chip:/r31-chip/.test(h),est:/預估時刻|Estimated/.test(h),onTime:/準點|On time/.test(h)};
 return o});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,4));await b.close()})();

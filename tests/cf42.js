// 1115A D2／D3：自創航班機型只列排得出飛機的；後台提議改用機型 → 報價寫給客戶
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));p.on('dialog',d=>d.accept().catch(()=>{}));
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});await p.waitForFunction(()=>!!window.KGM_FULLDONE_1006A,null,{timeout:200000,polling:1000}).catch(()=>{});await p.waitForTimeout(3000);
 const r=await p.evaluate(async()=>{const T=todayISO(),d=addDays(T,95),rd=addDays(T,100);const o={};
  o.routeOk=kgmCharterTypesR1103A('TPE','AKJ',126).types;
  let t0=performance.now(),first=kgmCharterAvailR1115A('TPE','AKJ',d,rd,o.routeOk);o.firstCallMs=Math.round(performance.now()-t0);o.firstNull=first===null;
  let av=null;const s0=Date.now();while(!(av=kgmCharterAvailR1115A('TPE','AKJ',d,rd,o.routeOk))&&Date.now()-s0<120000)await new Promise(r=>setTimeout(r,500));
  o.waitMs=Date.now()-s0;o.avail=av&&Object.keys(av).filter(k=>k!=='__why').map(k=>k+':'+av[k]);o.why=av&&av.__why;
  // admin desk with a pending request
  const id='CHR42T';S.charterReqsR1026C=(S.charterReqsR1026C||[]).filter(x=>x.id!==id);
  const u=S.users.find(x=>/^KGM\d/.test(x.id));
  S.charterReqsR1026C.unshift({id,kind:'custom',status:'pending',name:'測試自創航班',company:'TEST',caseNo:'KG42',userId:u.id,fr:'TPE',to:'AKJ',date:d,retDate:rd,pax:126,paxRet:114,type:'A359',plan:'G',createdAt:new Date().toISOString(),history:[]});
  S.adminAuthed=true;S.adminUser={name:'CEO',empId:'MASTER',role:'ceo'};S.view='admin';S.adminTab='groups23';S.k27gdTab='charter';render();await new Promise(r=>setTimeout(r,1500));o.pendingTxt=(document.querySelector('.k115p small')||{}).innerText;await new Promise(r=>setTimeout(r,20000));render();await new Promise(r=>setTimeout(r,800));
  const card=[...document.querySelectorAll('article.k27cd')].find(a=>a.textContent.includes(id));if(!card)return Object.assign(o,{nocard:1});
  const sel=card.querySelector('.k115p select');o.selOpts=sel?[...sel.options].map(x=>x.text):null;o.note=card.querySelector('.k115p small')&&card.querySelector('.k115p small').innerText;
  o.sugBefore=[...card.querySelectorAll('.k27cd-opt')].map(x=>x.innerText.replace(/\s+/g,' ').slice(0,40)).slice(0,2);
  const alt=sel&&[...sel.options].map(x=>x.value).find(v=>v&&v!=='A359');o.alt=alt;
  if(alt){kgmCharterProposeR1115A(id,alt);await new Promise(r=>setTimeout(r,800));render();await new Promise(r=>setTimeout(r,1200));
    const c2=[...document.querySelectorAll('article.k27cd')].find(a=>a.textContent.includes(id));o.head2=c2.querySelector('.k27cd-m').innerText.replace(/\s+/g,' ').slice(0,160);o.sugAfter=[...c2.querySelectorAll('.k27cd-opt')].map(x=>x.innerText.replace(/\s+/g,' ').slice(0,40)).slice(0,2);
    const btn=c2.querySelector('button[onclick^="kgmCharterApproveR1026C("]');o.btn=btn&&btn.textContent;btn&&btn.click();await new Promise(r=>setTimeout(r,800));
    const R=S.charterReqsR1026C.find(x=>x.id===id);o.status=R.status;o.quote=R.quoteR1101A&&{amt:R.quoteR1101A.amount,t:R.quoteR1101A.typeR1115A,was:R.quoteR1101A.typeWasR1115A};o.hist=(R.history||[]).slice(-1)[0];o.notif=(S.notifs||[])[0]&&S.notifs[0].title;
    // front side
    S.user=u;S.view='groupmine';try{nav&&nav('groupmine')}catch(_){}render();await new Promise(r=>setTimeout(r,1500));
  }
  return o});
 console.log(JSON.stringify(r,null,1),errs.slice(0,3));await b.close()})();

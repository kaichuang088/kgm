// 1103A：會籍積分——每段計算、卡等判定（兩個門檻都要到）、會員頁面板、AI 回答、FFP Rev. D／CRD Rev. B 內文
const {chromium}=require('playwright');
const file=process.argv[2]||'/tmp/j/kgm.html';
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Taipei'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('file://'+file,{waitUntil:'domcontentloaded',timeout:240000});await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:240000});await p.waitForTimeout(15000);
const r=await p.evaluate(async()=>{const o={};
 o.seg={TPE_NRT_value:kgmTpSegR1103A('TPE','NRT','E-E'),TPE_NRT_basic:kgmTpSegR1103A('TPE','NRT','E-C'),TPE_LAX_bizV:kgmTpSegR1103A('TPE','LAX','B-K'),TPE_HKG_group:kgmTpSegR1103A('TPE','HKG','E-U'),staff:kgmTpSegR1103A('TPE','NRT','SE'),TPE_SIN_first:kgmTpSegR1103A('TPE','SIN','F-X')};
 // 造一位新會員＋飛過的訂位：12 段台北—成田經濟超值＝240 分（全部自營）→ Silver
 const u={id:'KGMTP31',name:'TP TEST',email:'tp31@example.com',password:'x',miles:5000,level:'Bronze',milesLog:[]};S.users=S.users.filter(x=>x.id!=='KGMTP31');S.users.push(u);
 S.bookings=S.bookings.filter(x=>x.pnr.indexOf('TP31')!==0);const y=todayISO().slice(0,4);
 for(let i=0;i<6;i++){const d=y+'-0'+(i+1)+'-1'+i;S.bookings.push({pnr:'TP31'+i,userId:u.id,status:'confirmed',outF:{code:'KX100',fr:'TPE',to:'NRT',date:d,dep:'08:00',arr:'12:00'},outC:'E-E',inbF:{code:'KX101',fr:'NRT',to:'TPE',date:d,dep:'14:00',arr:'17:00'},inbC:'E-E',paxList:[{firstName:'TP',lastName:'TEST'}],total:12000,curr:'TWD'})}
 const t1=kgmTpOfR1103A(u);o.u1={tp:t1.tp,own:t1.own,n:t1.fl.n,segs:t1.segs.slice(0,2)};o.eval1=kgmTierEvalR1006A(u);
 // 舊規則下 12 段也是 Silver；改成 11 段＋夥伴航班：不該升
 recomputeTier(u);o.level1=u.level;
 // 面板
 S.user=u;S.view='profile';S.profileTab='profile';render();await new Promise(r=>setTimeout(r,600));
 const pn=document.querySelector('.k31t');o.panel=pn?pn.innerText.replace(/\s+/g,' ').slice(0,600):'NO PANEL';
 o.hero=[...document.querySelectorAll('.q-member-hero span, .q-member-hero div')].map(e=>e.innerText).filter(t=>/效期|會籍積分/.test(t)).slice(0,3);
 o.stats=(document.querySelector('.q-stats,section[class*=stat]')||{}).innerText;
 // AI
 try{o.ai=(typeof kgmAiLocalReplyR1103Aprobe==='function')?'':''}catch(_){}
 // 規章
 const F=KGM_POLICY_DOCS_R914['KGM-FFP-011'],C=KGM_POLICY_DOCS_R914['KGM-CRD-020'];o.ffp={ver:F.ver,eff:F.eff,has41:/第 4 條之一/.test(F.h),tbl:/240 分（120 分）/.test(F.h),trans:/二〇二七年十二月三十一日/.test(F.h),oldGone:!/12 航段/.test(F.h)};
 o.crd={ver:C.ver,arts:C.arts,xfer:/機場接送/.test(C.h),tp:/表四/.test(C.h)};
 // Diamond 示範會員（只升不降）
 const dmo=S.users.find(x=>x.id==='KGM100000');if(dmo){const l0=dmo.level;recomputeTier(dmo);o.demo={before:l0,after:dmo.level,tp:kgmTpOfR1103A(dmo).tp}}
 return o});
await p.screenshot({path:'/tmp/j/tp33.png',fullPage:true});
console.log(JSON.stringify(r,null,1));console.log('ERR',errs.slice(0,5));await b.close()})();

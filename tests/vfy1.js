const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1500,height:1300}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
 const dlg=[];p.on('dialog',d=>{dlg.push(d.message().slice(0,110));d.accept()});
 await p.goto('file:///tmp/j/kgm.html',{waitUntil:'domcontentloaded',timeout:300000});
 await p.waitForFunction(()=>{const a=document.getElementById("app");return a&&a.innerHTML.length>5000},null,{timeout:300000});
 await p.waitForTimeout(50000);
 const R=await p.evaluate(()=>{
  const out=[];
  const T=(id,name,fn)=>{try{const r=fn();out.push({id,name,ok:!!(r&&r.ok),info:r&&r.info})}catch(e){out.push({id,name,ok:false,info:'THREW '+e.message})}};
  const D=n=>new Date(Date.now()+86400000*n).toISOString().slice(0,10);
  const u=(S.users||[]).find(x=>x.id==='KGMDEMO0911'); if(u)S.user=u;

  /* ── 版本與結構 ─────────────────────────── */
  T('A1','版號一致',()=>{const t=document.title;return {ok:/0928B/.test(t),info:t}});
  T('A2','所有稽核函式不 throw',()=>{
    const ns=Object.keys(window).filter(k=>/^kgmAudit/i.test(k)&&typeof window[k]==='function');
    let th=[];ns.forEach(n=>{try{window[n]()}catch(e){th.push(n)}});
    return {ok:th.length===0,info:ns.length+' 支，throw '+th.length+' '+th.slice(0,3)};
  });

  /* ── 首頁文案 ─────────────────────────── */
  T('B1','首頁機隊文案 A21X 馬爾地夫/神戶',()=>{
    S.view='home';render();
    const t=document.getElementById('app').innerText;
    return {ok:/A21X/.test(t)&&/馬爾地夫|神戶/.test(t),info:(t.match(/全新[^\n]{0,40}/)||[''])[0]};
  });

  /* ── 第五航權／酬賓 ─────────────────────── */
  T('C1','TPE-CHC 第五航權航線在（KX52 via SYD）',()=>{
    let hit=null;
    for(let i=60;i<200&&!hit;i++){const d=D(i);
      const fs=sortedFlights('TPE','CHC',d)||[];
      const k=fs.find(f=>f.code==='KX52');
      if(k)hit={d,code:k.code,via:k.via||null,
        award:awardStatus(k.code,d,'Economy',1,Object.assign({},k,{date:d})).ok};
    }
    return {ok:!!(hit&&hit.via==='SYD'&&hit.award),info:hit?JSON.stringify(hit):'找不到'};
  });
  /* 0921B：原本只挑「第一個有班的日子」一天來判定。酬賓名額本來就每天不同
     （C4 就是在驗這件事），挑到剛好 0 席的那一天就會誤判成壞掉。改成掃 50 天，
     要求每一班在多數可飛日都訂得到豪經酬賓。 */
  T('C2','KX160/KX159 酬賓可訂豪經',()=>{
    const r={},bad=[];
    [['TPE','UKB','KX160'],['UKB','TPE','KX159'],['TPE','MLE','KX210'],['MLE','TPE','KX209']].forEach(([a,c,code])=>{
      let days=0,okDays=0;
      for(let i=20;i<70;i++){
        const d=D(i),f=(sortedFlights(a,c,d)||[]).find(x=>x.code===code);
        if(!f)continue;days++;
        let st=null;try{st=awardStatus(code,d,'Premium',1,Object.assign({},f,{date:d}))}catch(e){}
        if(st&&st.ok)okDays++;
      }
      r[code]=okDays+'/'+days;
      if(!(days>0&&okDays>0&&okDays>=Math.ceil(days*0.6)))bad.push(code);
    });
    return {ok:bad.length===0,info:JSON.stringify(r)+(bad.length?' bad='+bad.join(','):'')};
  });
  T('C3','TPE-NRT/TPE-HKG 仍然沒有豪經酬賓',()=>{
    const d=D(30);const r={};
    [['TPE','NRT'],['TPE','HKG']].forEach(([a,c])=>{
      const fs=(sortedFlights(a,c,d)||[]).filter(f=>!f.via&&!f.partner);
      r[a+'-'+c]=fs.map(f=>awardSeatsLeft(f.code,d,'Premium',Object.assign({},f,{date:d}))).filter(n=>n>0).length;
    });
    return {ok:Object.values(r).every(v=>v===0),info:JSON.stringify(r)};
  });
  T('C4','酬賓名額每班/每日/每艙不同',()=>{
    const d=D(30);const fs=(sortedFlights('TPE','NRT',d)||[]).filter(f=>!f.via&&!f.partner).slice(0,4);
    const vals=[];fs.forEach(f=>['Economy','Business'].forEach(c=>vals.push(awardSeatsLeft(f.code,d,c,Object.assign({},f,{date:d})))));
    const same=new Set(vals).size;
    const stable=fs.length?awardSeatsLeft(fs[0].code,d,'Economy',Object.assign({},fs[0],{date:d}))===awardSeatsLeft(fs[0].code,d,'Economy',Object.assign({},fs[0],{date:d})):false;
    return {ok:same>1&&stable,info:'distinct='+same+' of '+vals.length+' stable='+stable};
  });
  T('C5','第五航權里程升等逐航段計價',()=>{
    const d=D(30);
    let f=null;try{f=([].concat(FLIGHTS)).find(x=>x.code==='KX76'&&x.via)}catch(e){}
    if(!f)return {ok:false,info:'找不到 KX76 via'};
    if(typeof window.kgmUpgradeOptionsR920!=='function')return {ok:false,info:'kgmUpgradeOptionsR920 不存在'};
    return {ok:true,info:'KX76 via='+f.via};
  });

  /* ── 聯營 ─────────────────────────── */
  T('D1','聯營沒有酬賓名額',()=>{
    const all=[].concat(FLIGHTS||[],S.customFlights||[]);
    const cs=all.filter(f=>f&&(f.partner||f.codeshare));const d=D(25);let leak=0;
    cs.slice(0,40).forEach(f=>['Economy','Premium','Business'].forEach(c=>{
      if(awardSeatsLeft(f.code,d,c,Object.assign({},f,{date:d}))>0)leak++}));
    return {ok:leak===0,info:'codeshare='+cs.length+' leak='+leak};
  });
  T('D2','聯營價格高於同航段自營',()=>{
    const all=[].concat(FLIGHTS||[],S.customFlights||[]);
    const cs=all.filter(f=>f&&(f.partner||f.codeshare));
    const own=all.filter(f=>f&&!(f.partner||f.codeshare)&&!f.via);
    const d=D(25);const cab=c=>((FARES[c]||{}).cabin)||'';
    let bad=0,chk=0;
    cs.forEach(f=>{const ff=Object.assign({},f,{date:d});let codes=[];try{codes=validCodes(ff)||[]}catch(e){}
      if(!codes.length)return;const rivals=own.filter(x=>x.fr===f.fr&&x.to===f.to);if(!rivals.length)return;
      const m={};codes.forEach(c=>{const k=cab(c);if(!k)return;let v=0;try{v=owPrice(ff,c,1)}catch(e){}
        if(isFinite(v)&&v>0)m[k]=Math.min(m[k]||1e12,v)});
      Object.keys(m).forEach(k=>{let om=0;rivals.forEach(x=>{const xf=Object.assign({},x,{date:d});
        let cc=[];try{cc=validCodes(xf)||[]}catch(e){}
        cc.forEach(c=>{if(cab(c)!==k)return;let v=0;try{v=owPrice(xf,c,1)}catch(e){}if(isFinite(v)&&v>om)om=v})});
        if(!om)return;chk++;if(m[k]<=om)bad++});
    });
    return {ok:bad===0&&chk>0,info:'checked='+chk+' cheaper='+bad};
  });
  T('D3','聯營不進組員班表／機隊',()=>{
    const all=[].concat(FLIGHTS||[],S.customFlights||[]);
    const cs=new Set(all.filter(f=>f&&(f.partner||f.codeshare)).map(f=>f.code));
    const d=D(3);let hit=0;
    try{const pl=window.kgmCrewPlanR121?window.kgmCrewPlanR121(d):null;
      if(pl&&pl.flights)pl.flights.forEach(f=>{if(cs.has(f.code))hit++})}catch(e){}
    return {ok:hit===0,info:'crewOnCodeshare='+hit};
  });

  /* ── Sky Couch ─────────────────────────── */
  T('E1','Sky Couch 三條規則函式在',()=>{
    const f=['kgmSkyCouchOpenR920B','kgmFreeSeatNowR920B','kgmSkyCouchWhyR920B'].filter(n=>typeof window[n]==='function');
    return {ok:f.length===3,info:f.join(',')};
  });

  /* ── 報到 48 小時 ─────────────────────── */
  T('F1','報到 48 小時閘',()=>{
    if(typeof window.kgmCiWindowR7!=='function')return {ok:false,info:'閘不存在'};
    const far=window.kgmCiWindowR7({date:'2099-01-01',f:{dep:'10:00'}});
    const past=window.kgmCiWindowR7({date:'1999-01-01',f:{dep:'10:00'}});
    const now=window.kgmCiWindowR7({date:new Date(Date.now()+3600000*20).toISOString().slice(0,10),f:{dep:new Date(Date.now()+3600000*20).toISOString().slice(11,16)}});
    return {ok:!far.open&&!past.open&&now.open,info:'far='+far.open+' past='+past.open+' 20h='+now.open};
  });

  /* ── 定位管理身分 ─────────────────────── */
  T('G1','沒有 role 的帳號不被鎖成地勤',()=>{
    const keep=S.adminUser;
    S.adminAuthed=true;S.adminUser={name:'X',empId:'X1'};S.ticketIdentity0910='';S.groundModeR164=0;
    const ch=window.kgmReissueChannelsR201();
    kgmCabIdentR82('agent');
    const id=window.kgmReissueIdentR914(),fee=window.kgmReissueFeeR914();
    S.adminUser=keep;
    return {ok:ch.length===2&&id==='agent'&&fee===1200,info:'ch='+ch+' ident='+id+' fee='+fee};
  });
  T('G2','地勤帳號仍然鎖地勤',()=>{
    const keep=S.adminUser;
    S.adminUser={name:'G',empId:'G1',role:'ground'};S.ticketIdentity0910='';S.groundModeR164=0;
    const ch=window.kgmReissueChannelsR201(),id=window.kgmReissueIdentR914();
    S.adminUser=keep;
    return {ok:ch.length===1&&ch[0]==='ground'&&id==='ground',info:'ch='+ch+' ident='+id};
  });

  /* ── 組員班表 ─────────────────────── */
  T('H1','組員班表：一天一個執勤期、DH 不算航班',()=>{
    const ids=(S.staff||[]).filter(s=>s&&(s.role==='pilot'||s.role==='cabin')&&s.active!==false).slice(0,25).map(s=>s.empId);
    const isDh=l=>!!(l&&(l.deadhead||l.dhR913||String(l.code||'')==='DH'));
    let breach=0,turn=0,dh=0,fly=0;
    ids.forEach(id=>{let ros=[];try{ros=window.kgmRosterR196(id,45)||[]}catch(e){}
      ros.forEach(x=>{const op=(x.legs||[]).filter(l=>!isDh(l)),dl=(x.legs||[]).filter(isDh);
        if(dl.length)dh++;if(!op.length)return;fly++;
        const cs={};op.forEach(l=>cs[l.code]=1);
        if(Object.keys(cs).length>1){if(op[op.length-1].to===op[0].fr)turn++;else breach++}})});
    return {ok:breach===0&&fly>0,info:'crew='+ids.length+' fly='+fly+' turn='+turn+' dh='+dh+' breach='+breach};
  });

  /* ── 旅客資料變更 ─────────────────────── */
  T('I1','加急／特急檔次存在且有價',()=>{
    const T2=window.KGM_PROFILE_TIERS_R913||{};
    return {ok:!!(T2.normal&&T2.exp&&T2.rush&&T2.exp.fee===20&&T2.rush.fee===30&&T2.rush.rush),
      info:JSON.stringify(Object.keys(T2).map(k=>k+':'+T2[k].fee))};
  });
  T('I2','AI 審核抓得到「換人」的姓名變更',()=>{
    const c={id:'X1',userId:S.user.id,changes:[{field:'lastName',oldValue:'DEMO',newValue:'WANG'}],
      attachment:{name:'p.pdf',type:'application/pdf',size:200*1024,dataUrl:'data:application/pdf;base64,AAAA'},
      status:'pending_customer_service',createdAt:new Date().toISOString(),progress:[]};
    const r=window.kgmProfileAiReviewR913(c);
    const f=(r.checks||[]).filter(x=>!x.ok).map(x=>x.name);
    return {ok:!r.pass&&f.some(n=>/拼字更正/.test(n)),info:r.passed+'/'+r.total+' fails='+f.join('|')};
  });
  T('I3','附件暫存機制存在',()=>{
    return {ok:typeof window.kgmProofPickR920G==='function'&&typeof window.kgmProofChipR920G==='function',
      info:typeof window.kgmProofPickR920G};
  });

  /* ── 案件 ─────────────────────────── */
  T('J1','案件狀態表有中文（不印英文鍵名）',()=>{
    const f=window.kgmCaseStatusLabelJ;
    if(typeof f!=='function')return {ok:false,info:'沒有 kgmCaseStatusLabelJ'};
    const ks=['human_review','pending_customer_service','bank_processing','completed','refunded'];
    const bad=ks.filter(k=>f(k)===k);
    return {ok:bad.length===0,info:ks.map(k=>k+'→'+f(k)).join(' ')};
  });
  T('J2','我的案件／案件版型都掛上了',()=>{
    const o=window.kgmAuditR920H();
    return {ok:o.ok,info:JSON.stringify({p:o.profileWrapped,c:o.caseWrapped,css:o.css,leak:o.awardLeak})};
  });

  /* ── 接駁車 ─────────────────────── */
  T('K1','接駁車設定（26 席 / 14 天）',()=>{
    return {ok:window.KGM_SHUTTLE_CAP_R67===26&&window.KGM_SHUTTLE_CUTOFF_R67===14,
      info:window.KGM_SHUTTLE_CAP_R67+'/'+window.KGM_SHUTTLE_CUTOFF_R67};
  });

  /* ── 競標 ─────────────────────── */
  T('L1','Residence 競標期限 14/7 天',()=>{
    return {ok:window.KGM_RES_CASH_CLOSE_DAYS_R920===14&&window.KGM_RES_MILE_CLOSE_DAYS_R920===7,
      info:window.KGM_RES_CASH_CLOSE_DAYS_R920+'/'+window.KGM_RES_MILE_CLOSE_DAYS_R920};
  });

  /* ── 員工票 ─────────────────────── */
  T('M1','員工票不得線上報到',()=>{
    const d=D(1),hh=new Date(Date.now()+3600000*20).toISOString().slice(11,16);
    S.bookings=[{pnr:'STF9',userId:(S.user||{}).id,status:'confirmed',stx:{empId:'K1',plan:'ID90'},
      outF:{code:'KX180',fr:'TPE',to:'NRT',date:d,dep:hh,arr:'11:05'},outC:'E-R',paxList:[{lastName:'A',firstName:'B'}]}];
    let al='';const _a=window.alert;window.alert=m=>{al=String(m)};
    try{window.kgmCheckinSegR60('STF9','out')}catch(e){al='THREW '+e.message}
    window.alert=_a;
    return {ok:/櫃檯/.test(al)&&S.pnrModeR7!=='checkin',info:al};
  });
  return out;
 });
 console.log(JSON.stringify(R,null,1));
 console.log('ERR',errs.filter(e=>!/寄信/.test(e)).slice(0,5));
 console.log('DLG',JSON.stringify(dlg.slice(0,5)));
 await b.close();})();

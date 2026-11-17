
/* 1118A G5：整年機隊排班沿用（IndexedDB kgm118_fleet）
   原本每次開頁都在背景重算整年機隊排班（開頁頭 20 秒初排＋20 秒後整年重排分段準備＋收尾），
   而且第一次開頁跟重新整理（有存檔）算出來的不一樣（59 架不同）→ 組員班表存檔指紋對不上 → 每次重算 60 天組員班表。
   改：整年重排完成、A35K 輪替跑完、機隊穩定（閒置 7 天以上 0 架）之後，把整份 S.tailAssign 存進 IndexedDB；
   下次開頁同一天、同版本、整年重排的輸入指紋（kgmSig72R1006A）相同 → 直接沿用，不重算。
   ‧ 開頁 2.6 秒（原本的 60 天初排）：開頁時的輸入指紋對得上就先放上存好的排班、跳過初排。
   ‧ 20 秒（原本的整年重排）：照原本準備（時刻修補、TSA）後算指紋，對得上就再放一次存好的排班（蓋掉舊層在這之間寫的）、
     設定「整年完成」；對不上 → 照原本整年重排（結果跟以前一樣）。
   ‧ 前台不跑（前台本來就不做整年重排）。 */
(function(){
  if(window.KGM_SIDE==='front')return;
  var DBN='kgm118_fleet',STN='s',META=null,PLAN=null,HIT=false,SAVED=false;
  window.KGM_FC_R1118A={loaded:false};
  function idb(cb){try{if(!window.indexedDB)return cb(null);var r=indexedDB.open(DBN,1);r.onupgradeneeded=function(){try{r.result.createObjectStore(STN)}catch(_){}};r.onsuccess=function(){cb(r.result)};r.onerror=function(){cb(null)}}catch(_){cb(null)}}
  function today(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function st3(){var t=new Date(today()+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-3);return t.toISOString().slice(0,10)}
  function sigNow(){try{return window.kgmSig72R1006A(st3(),369)}catch(_){return ''}}
  function build(){return String(window.BUILD||'')}
  function hs(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+'.'+s.length}
  /* 開頁就先讀（約 0.2 秒，在 2.6 秒的初排之前就讀完） */
  idb(function(db){if(!db){window.KGM_FC_R1118A.loaded=true;return}
    try{var tx=db.transaction(STN),os=tx.objectStore(STN),q1=os.get('meta'),q2=os.get('plan');
      q1.onsuccess=function(){META=q1.result||null};q2.onsuccess=function(){PLAN=q2.result||null};
      tx.oncomplete=function(){window.KGM_FC_R1118A.loaded=true;window.KGM_FC_R1118A.has=!!(META&&PLAN);if(META)window.KGM_FC_R1118A.day=META.day};
      tx.onerror=function(){window.KGM_FC_R1118A.loaded=true}}catch(_){window.KGM_FC_R1118A.loaded=true}});
  function usable(){return !!(META&&PLAN&&META.day===today()&&META.build===build()&&PLAN.n===(PLAN.tails||[]).length)}
  function parsePlan(){var o={};for(var i=0;i<PLAN.tails.length;i++){o[PLAN.tails[i]]=JSON.parse(PLAN.json[i])}return o}
  /* 開頁 2.6 秒（r72 初排計時器最前面呼叫）：回傳 true＝已放上存好的排班、不做初排 */
  window.kgmFleetCacheBootR1118A=function(){
    var t0=Date.now(),bs=sigNow();window.KGM_FC_BOOTSIG_R1118A=bs;
    var R=window.KGM_FC_R1118A;R.bootSigMs=Date.now()-t0;
    if(!usable()||!bs||(META.bootSigs||[]).indexOf(hs(bs))<0){R.boot=usable()?'sig':(R.loaded?'none':'notLoaded');return false}
    try{S.tailAssign=parsePlan();window.KGM_ROT_SUM_R72=META.sum||window.KGM_ROT_SUM_R72;window.KGM_FC_BOOT_R1118A=Date.now();R.boot='hit';R.bootMs=Date.now()-t0;return true}
    catch(e){R.boot='err '+e.message;return false}
  };
  /* 20 秒整年重排準備好之後（r72 prep6 算完指紋那一行呼叫）：回傳 true＝沿用、不再分段整年重排 */
  window.kgmFleetCacheFinalR1118A=function(sig6){
    var R=window.KGM_FC_R1118A,t0=Date.now();window.KGM_FC_FINALSIG_R1118A=sig6;
    if(!usable()||META.sig!==hs(sig6)){R.final=usable()?'sig':(R.loaded?'none':'notLoaded');return false}
    try{
      S.tailAssign=parsePlan();
      window.KGM_ROT_SUM_R72=META.sum||window.KGM_ROT_SUM_R72;
      try{window.kgmClearRotationCacheR72()}catch(_){}
      window.KGM_ROT_FINAL_R913=true;window.KGM_FINALRUN_1006A=false;
      window.KGM_FULLDONE_1006A=Date.now();window.KGM_A35_FD_R1115B=window.KGM_FULLDONE_1006A;   /* A35K 輪替已經在存好的排班裡 */
      window.KGM_SPLIT_CACHE_R929=null;
      try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}
      try{if(window.kgmPlanCacheClearR196)window.kgmPlanCacheClearR196()}catch(_){}
      HIT=true;R.final='hit';R.finalMs=Date.now()-t0;R.legs=0;Object.keys(S.tailAssign).forEach(function(k){R.legs+=(S.tailAssign[k]||[]).length});
      /* 這次開頁的初排指紋沒記過 → 記下來（下次開頁 2.6 秒就能沿用） */
      var bs=window.KGM_FC_BOOTSIG_R1118A;if(bs&&(META.bootSigs||[]).indexOf(hs(bs))<0){META.bootSigs=(META.bootSigs||[]).concat([hs(bs)]).slice(-4);idb(function(db){if(!db)return;try{db.transaction(STN,'readwrite').objectStore(STN).put(META,'meta')}catch(_){}})}
      setTimeout(function(){try{render()}catch(_){}},0);
      return true;
    }catch(e){R.final='err '+e.message;return false}
  };
  /* 存：整年重排（不是沿用的）完成、A35K 跑完、機隊 60 秒沒變、輸入指紋跟整年重排那時相同、閒置 7 天以上 0 架 → 分段序列化後存 */
  var lastSt='',stSince=0;
  function stamp(){var TA=S.tailAssign||{},k=Object.keys(TA).sort(),h=k.length;for(var i=0;i<k.length;i++)h=(h*31+((TA[k[i]]||[]).length))|0;return String(h)}
  /* 組員班表存檔（kgm25_crew）的指紋含機隊排班 → 組員一存檔，機隊排班也跟著存一份（兩份描述同一個排班，下次開頁組員才讀得回來） */
  var CS0=null,CSN=0;
  function crewSaved(){var c=window.KGM_CREW_SAVE_R1025B;if(!c)return false;var k=c.sig+'|'+c.cur+'|'+c.ms;if(CS0===null){CS0=k;return !HIT}if(k===CS0)return false;CS0=k;return true}
  function trySave(){
    if(crewSaved()&&CSN<6&&window.KGM_FC_FINALSIG_R1118A&&!window.KGM_FINALRUN_1006A){CSN++;SAVED=false;HIT=false;lastSt='';stSince=0;window.KGM_FC_R1118A.resaveR=CSN;doSave(true);return}
    if(SAVED||HIT)return;
    var fd=window.KGM_FULLDONE_1006A,R=window.KGM_FC_R1118A;
    if(!fd||window.KGM_FINALRUN_1006A||!window.KGM_ROT_FINAL_R913||window.KGM_A35_FD_R1115B!==fd||!window.KGM_FC_FINALSIG_R1118A)return;
    var st=stamp();if(st!==lastSt){lastSt=st;stSince=Date.now();return}
    if(Date.now()-stSince<60000||Date.now()-fd<90000)return;
    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<3000)return;
    doSave(false)}
  function doSave(fromCrew){var R=window.KGM_FC_R1118A,st=stamp();
    var sg=sigNow();if(sg!==window.KGM_FC_FINALSIG_R1118A){R.save='sigChanged';SAVED=true;return}
    var idl=window.kgmFleetIdleR922?window.kgmFleetIdleR922(60):{idle7:0};if(idl.idle7>0){R.save='idle7 '+idl.idle7;SAVED=true;return}
    SAVED=true;var TA=S.tailAssign,tails=Object.keys(TA).sort(),json=[],i=0,t0=Date.now(),busy=0;
    (function step(){var t=Date.now();while(i<tails.length&&Date.now()-t<40){json.push(JSON.stringify(TA[tails[i]]||[]));i++}busy+=Date.now()-t;
      if(stamp()!==st){R.save='changedWhileSaving';return}
      if(i<tails.length){setTimeout(step,30);return}
      var meta={day:today(),build:build(),sig:hs(sg),bootSigs:window.KGM_FC_BOOTSIG_R1118A?[hs(window.KGM_FC_BOOTSIG_R1118A)]:[],sum:window.KGM_ROT_SUM_R72||null,at:Date.now()};
      try{meta.sum=JSON.parse(JSON.stringify(meta.sum))}catch(_){meta.sum=null}
      idb(function(db){if(!db){R.save='noDb';return}
        try{var tx=db.transaction(STN,'readwrite'),os=tx.objectStore(STN);os.put({tails:tails,json:json,n:tails.length},'plan');os.put(meta,'meta');
          tx.oncomplete=function(){R.save='ok'+(fromCrew?' (crew)':'');R.saveBusyMs=busy;R.saveMs=Date.now()-t0;R.savedAt=Date.now()};tx.onerror=function(){R.save='err'}}catch(e){R.save='err '+e.message}});
    })();
  }
  setInterval(function(){try{trySave()}catch(_){}},5000);
})();

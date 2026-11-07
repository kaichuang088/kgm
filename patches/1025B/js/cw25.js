
/* 1025B：組員班表「進去就排好」（使用者：「我進去就應該是排好的了而非我進去還要等 這樣代表每個人進去都會長得不一樣嗎？」）
   · 開頁後機隊整年重排做完（KGM_FULLDONE_1006A）就在瀏覽器空檔往後算到今天＋60 天，不再只有打開「組員班表」分頁才算。
   · 算好的整份引擎狀態存在 IndexedDB（kgm25_crew；localStorage 放不下），同一天、輸入沒變（日期、機隊、組員名冊、職級、晉升、
     請假、凍結、指定、換班）就直接讀回，不用重算；輸入一變就照原本的規則重算。
   · 起算日是飛機排班的第一天（今天往前 5 天），所以只在同一天讀回 —— 跨日讀回昨天的狀態會跟今天全新開頁算的不一樣。 */
(function(){
  var DBN='kgm25_crew',STN='plan',KEY='v1',RES25=false,SAVED25='',BUSY25=false,TAK25='',TAH25='',TAO25=null;
  function hs(str){var h=2166136261;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
  function sig25(){
    try{if(window.KGM_FULLDONE_1006A)try{pool121()}catch(_){}   /* 虛擬組員名單是第一次用到才建，先建好指紋才會一致（機隊排完才建，見 demand121） */
      var TA=S.tailAssign||{},st0='';try{st0=String(stamp121())}catch(_){}
      if(!(st0&&st0===TAK25&&TA===TAO25)){var a=[];Object.keys(TA).sort().forEach(function(tl){var L=TA[tl]||[],s=tl+':';for(var i=0;i<L.length;i++){var x=L[i];if(x)s+=x.date+x.code+(x.dep||'')+(x.fr||'')+(x.cancelledR1023A?'X':'')+','}a.push(hs(s))});
        TAH25=hs(a.join(''));TAK25=st0;TAO25=TA}   /* 1025B：十幾萬段的雜湊只在機隊有變（跟組員引擎同一個指紋）時重算，不要每 3 秒算一次 */
      var st=(S.staff||[]).filter(function(s){return s&&(s.role==='pilot'||s.role==='cabin')}).map(function(s){return [s.empId,s.name,s.base||'',s.station||'',s.rank||'',s.active===false?0:1,s.hireDate||'',s.nationality||'',s.employmentStatus||'',s.status||''].join('|')}).sort().join(';');
      var ex=S.crewExtraR121||{};
      var oth=[ex.pilot,ex.cabin,S.crewRankR1009B||{},S.crewLevelR1009B||{},S.crewFreezeR928||{},S.crewPinR928||{},S.crewSwapR167||null,S.leave||[]].map(function(v){var j=JSON.stringify(v==null?'':v);return (j==='{}'||j==='[]'||j==='""')?'0':hs(j)}).join('.');   /* 空值、空物件、空陣列視為相同（讀回時 null 會變 []） */
      return [T(),TAH25,hs(st),oth,(window.BUILD||'')].join('~');
    }catch(e){return 'x'+Date.now()}
  }
  function idb(cb){try{if(!window.indexedDB)return cb(null);var r=indexedDB.open(DBN,1);r.onupgradeneeded=function(){try{r.result.createObjectStore(STN)}catch(_){}};r.onsuccess=function(){cb(r.result)};r.onerror=function(){cb(null)}}catch(_){cb(null)}}
  function snap(){return {MEM:MEM121,ROLL:ROLL121,DUTY:DUTY121,LOAD:LOAD121,CUR:CURSOR121,MOVE:MOVE121,pos:S.crewPositioningR121||{},load:S.crewLoadR121||{},credit:S.crewCreditR1006A||{},extra:window.KGM_EXTRA_DUTY_R927D||{}}}
  function save25(){var sg=sig25();if(sg===SAVED25||!CURSOR121)return;var o=snap(),t0=Date.now();
    idb(function(db){if(!db)return;try{var tx=db.transaction(STN,'readwrite');tx.objectStore(STN).put({sig:sg,at:new Date().toISOString(),cur:CURSOR121,data:o},KEY);tx.oncomplete=function(){SAVED25=sg;window.KGM_CREW_SAVE_R1025B={sig:sg,cur:CURSOR121,ms:Date.now()-t0}}}catch(_){}})}
  function restore25(done){var sg=sig25();   /* 存的算得比現在遠、指紋相同就換成存的（同一套輸入算出來本來就一樣） */
    idb(function(db){if(!db)return done&&done(false);try{var g=db.transaction(STN,'readonly').objectStore(STN).get(KEY);g.onsuccess=function(){var r=g.result;
        if(!r||r.sig!==sg||!r.data||(CURSOR121&&!(r.cur>CURSOR121))){window.KGM_CREW_RESTORE_R1025B={ok:false,why:!r?'none':(r.sig!==sg?'sig':'ahead'),cur:CURSOR121};return done&&done(false)}
        var o=r.data;MEM121=o.MEM||{};ROLL121=o.ROLL||{};DUTY121=o.DUTY||{};LOAD121=o.LOAD||{};CURSOR121=o.CUR||null;MOVE121=o.MOVE||null;
        S.crewPositioningR121=o.pos||{};S.crewLoadR121=o.load||{};S.crewCreditR1006A=o.credit||{};window.KGM_EXTRA_DUTY_R927D=o.extra||{};
        SOURCE121=S.tailAssign;STAMP121=stamp121();PRESTAMP121=stampUpTo121(CURSOR121);RES25=true;SAVED25=sg;
        window.KGM_CREW_RESTORE_R1025B={ok:true,cur:CURSOR121,at:r.at};
        try{if(S.view==='admin'&&S.adminTab==='sched')render()}catch(_){}
        done&&done(true)};g.onerror=function(){done&&done(false)}}catch(_){done&&done(false)}})}
  window.kgmCrewSaveR1025B=save25;window.kgmCrewRestoreR1025B=restore25;window.kgmCrewSigR1025B=sig25;
  /* 背景往後算：機隊做完才開始（機隊還在重排時算了也會被倒掉）；一次一天（引擎一天約 1 秒），只在瀏覽器空檔 */
  function target(){return D(T(),60)}
  function idle(f){if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(f,{timeout:2500});else setTimeout(f,60)}
  function tick(){
    if(BUSY25)return;
    if(!window.KGM_FULLDONE_1006A)return;
    if(Date.now()-(window.KGM_LAST_INPUT_R1025B||0)<2000)return;   /* 使用者正在操作就先讓開（算一天要 1～2.6 秒，算到一半點東西會卡住） */
    if((tick.tried|0)<4&&!(window.KGM_CREW_RESTORE_R1025B&&window.KGM_CREW_RESTORE_R1025B.ok)){tick.tried=(tick.tried|0)+1;BUSY25=true;restore25(function(){BUSY25=false});return}   /* 開頁時讀回的若被機隊重排倒掉，機隊做完再讀一次 */
    try{inval121(null)}catch(_){}
    if(CURSOR121&&CURSOR121>=target()){save25();
      /* 1025B：再把組員班表畫面那一層的索引（r196，一天約 0.1～0.2 秒）在空檔補滿 */
      if(window.kgmRosterStepR196&&window.kgmRosterReadyR196&&window.kgmRosterReadyR196()<60){BUSY25=true;
        idle(function(){var t0=Date.now(),r0=-1;try{while(Date.now()-t0<120){var r=window.kgmRosterStepR196();if(r===r0||r>=60)break;r0=r}}catch(_){}BUSY25=false;setTimeout(tick,30)})}
      return}
    BUSY25=true;
    idle(function(){try{window.kgmCrewStepR121(1,target())}catch(_){}BUSY25=false;
      if(CURSOR121&&CURSOR121>=target())save25();
      try{if(S.view==='admin'&&S.adminTab==='sched'&&!window.kgmCrewWarmingR923())render()}catch(_){}
      setTimeout(tick,30)});
  }
  setInterval(tick,3000);
})();

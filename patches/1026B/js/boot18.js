setTimeout(function(){
  if(window.KGM_FULLDONE_1006A||window.KGM_FINALRUN_1006A)return;   /* 1006A：主執行緒被別的工作卡住、這個計時器晚到時，整年重排已經做完（或正在分段準備）就不再蓋掉前 60 天 */
  /* 1018A：開頁前 60 天機隊初排原本一次獨佔主執行緒 2.3～3 秒（每天解析機型 1.3 秒＋各機型輪轉）。
     改成跟整年重排同一套：先分段準備（每段 0.15 秒、段與段之間讓出主執行緒），最後組合那一次沿用快取；
     準備期間輸入有變（kgmSig72R1006A 不同）就照原本清掉重算，排出來的結果跟原本一模一樣。
     整年重排一開始準備就停下（它自己會清快取重來）。 */
  var st8=D(T(),-3),dy8=63,rg8=window.kgmRange72R1006A(st8,dy8),view8=null,sig8=null,ty8=[],di8=0,ti8=0,tp8=Date.now();
  function stop8(){return window.KGM_FULLDONE_1006A||window.KGM_FINALRUN_1006A}
  function hide8(fn){var real=S.tailAssign;S.tailAssign=view8;try{return fn()}finally{S.tailAssign=real}}
  function next8(f){setTimeout(function(){if(stop8())return;try{f()}catch(e){try{console.warn('r72 boot prep',e)}catch(_){}fin8()}},0)}
  function prep8(){
    try{if(window.kgmRepairTimetableR77)window.kgmRepairTimetableR77()}catch(_){}
    Object.keys(S.acftSub||{}).forEach(function(k){var x=S.acftSub[k];if(x&&x.coverageR830&&x.auto)delete S.acftSub[k]});
    window.kgmClearRotationCacheR72();
    view8={};Object.keys(S.tailAssign||{}).forEach(function(tl){view8[tl]=(S.tailAssign[tl]||[]).filter(function(x){return x&&x.manualR69&&(x.date<st8||x.date>=rg8.end)})});
    var pool=[];try{pool=(tailsFor('B78X')||[]).slice(0,4)}catch(_){}
    S.tsaFleet={};pool.forEach(function(t){S.tsaFleet[t]=1});
    hide8(function(){window.kgmSeedTsa72R1006A(st8,dy8,true)});
    sig8=window.kgmSig72R1006A(st8,dy8);ty8=window.kgmTypes72R1006A();
    next8(days8);
  }
  function days8(){var t=Date.now();hide8(function(){while(di8<rg8.n&&Date.now()-t<150){var dd=D(rg8.w0,di8);window.kgmDayOf72R1006A(dd);if(window.kgmWarmF72R1008A)window.kgmWarmF72R1008A(dd);di8++}});
    if(di8<rg8.n)next8(days8);else next8(types8)}
  function types8(){if(ti8<ty8.length){var tp=ty8[ti8++];hide8(function(){window.kgmBuildRotationsR72(tp,st8,dy8)});next8(types8)}else next8(fin8)}
  function fin8(){
    if(stop8())return;
    window.KGM_KEEP72_1006A=sig8;try{if(window.kgmRepairTimetableR77)window.kgmRepairTimetableR77()}catch(_){}window.KGM_KEEP72_1006A=null;
    var keep8=!!sig8&&window.kgmSig72R1006A(st8,dy8)===sig8,t0=Date.now();
    if(keep8)window.KGM_KEEP72_1006A=sig8;
    try{window.kgmRebuildFleetR72(T(),60,true)}catch(e){try{console.warn('r72 boot',e)}catch(_){}}
    window.KGM_KEEP72_1006A=null;
    window.KGM_BOOT60_R1018A={kept:keep8,prepMs:t0-tp8,finalMs:Date.now()-t0};
  }
  try{prep8()}catch(e){try{console.warn('r72 boot prep',e)}catch(_){}fin8()}
},2600);

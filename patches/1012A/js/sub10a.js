    /* 1010A #6：換機紀錄（S.acftSub）跟實際派機對不上
       實測（w9）：未來的自動換機紀錄 2,860 筆，其中 373 筆記的機身／機型已經不是現在實際在飛的那架，15 筆根本找不到那一班的機身 ——
       頁面剛載入、機隊計畫還沒排好時就寫下的紀錄，之後重排了也沒清，前台「執飛機型」與每日異動就照舊紀錄顯示。
       這裡照目前的實際派機（S.tailAssign）重新對一次：
       · 找不到機身 → 刪除；
       · 實際機型就是時刻表機型 → 刪除（沒有換機）；
       · 實際機型不同 → 機型／機身改成實際的那架。
       只處理系統自動產生的紀錄（auto／auto0810J／coverageR830），管理端人工換機不動。 */
    window.kgmSubCleanR1010A=function(){
      var o={del:0,fix:0,keep:0};
      try{
        var SUB=S.acftSub||{},T0=todayISO(),idx={};
        Object.keys(S.tailAssign||{}).forEach(function(t){(S.tailAssign[t]||[]).forEach(function(x){if(x&&!x.noPax&&x.date>=T0)idx[x.code+'|'+x.date+'|'+String(x.route||'').replace(/[^A-Z]/g,'')]=t})});
        var planned=function(r,fr,to){try{var f=FLIGHTS.filter(function(z){return z&&z.code===r.code&&z.fr===fr&&z.to===to&&!z.via})[0];if(!f)return '';f=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,r.date):f;return (f&&f.acft)||''}catch(_){return ''}};
        Object.keys(SUB).forEach(function(k){
          var r=SUB[k];if(!r||!r.date||r.date<T0)return;
          if(r.manual||!(r.auto||r.auto0810J||r.coverageR830))return;
          var rt=String(r.route||'').split('→'),fr=rt[0],to=rt[1];if(!fr||!to)return;
          var tl=idx[r.code+'|'+r.date+'|'+fr+to];
          if(!tl){delete SUB[k];o.del++;return}
          var tp='';try{tp=window._typeOfTail(tl)||''}catch(_){}
          var pl=planned(r,fr,to);
          if(!tp||(pl&&pl!=='EQV'&&tp===pl)){delete SUB[k];o.del++;return}
          if(r.sub!==tp||r.tail!==tl){r.sub=tp;r.tail=tl;if(pl&&pl!=='EQV')r.orig=pl;o.fix++}else o.keep++;
        });
        if(o.del||o.fix){try{save()}catch(_){}}
      }catch(e){try{console.warn('1010A sub clean',e)}catch(_){}}
      window.KGM_SUBCLEAN_R1010A=o;return o;
    };
    (function(){try{var p=window.kgmRebuildFleetR72;if(typeof p==='function'&&!p.__r1010A){var w=function(){var r=p.apply(this,arguments);try{window.kgmSubCleanR1010A()}catch(_){}return r};w.__r1010A=1;window.kgmRebuildFleetR72=w}}catch(_){}})();
    setTimeout(function(){try{window.kgmSubCleanR1010A()}catch(_){}},20000);
    setInterval(function(){try{window.kgmSubCleanR1010A()}catch(_){}},60000);
    /* 1010A #6：每日異動 —— KX168/167、KX136/135 每月一次跟松山機隊交換飛機（使用者 0907B 指定，時刻表本來就印 A21N/B78X），
       是計畫內的交換，不是臨時換機；原本被寫成「當日調度自動換機」，這裡改成照實際原因標示。 */
    (function(){try{var p=window.kgmChangesR78;if(typeof p!=='function'||p.__r1010A)return;
      var w=function(date){var R=p.apply(this,arguments);try{var d=(R&&R.date)||date;(R&&R.changes||[]).forEach(function(x){
        if(x&&x.planned==='A21N'&&x.actual==='B78X'&&window.kgmTsaExchangeR830&&window.kgmTsaExchangeR830(x.code,d)){x.why=(LANG==='en')?'Planned TSA fleet exchange (published A21N/B78X)':'松山機隊交換（每月一次，時刻表公告 A21N/B78X）';x.plannedR1010A=1}})}catch(_){}return R};
      Object.keys(p).forEach(function(k){try{w[k]=p[k]}catch(_){}});w.__r1010A=1;window.kgmChangesR78=w}catch(_){}})();
    /* 1010A #8：競標頁搜尋已起飛的航班顯示「這一班已經起飛，沒有競標紀錄」——
       模擬出價只在打開競標頁時補「未來」的航班，沒打開過的那幾天起飛後就永遠是空的。
       已起飛 60 天內的航班：搜尋「班號＋日期」時照同一套規則補上當時的出價並結標（跟起飛前看到的同一組種子）。 */
    window.kgmAucPastR1010A=function(){
      try{var c=String(S.auctionCodeR923||'').trim().toUpperCase().replace(/\s+/g,''),d=String(S.auctionDateR923||'').trim();
        if(!c||!/^\d{4}-\d\d-\d\d$/.test(d))return 0;var T0=todayISO();if(d>=T0||d<addDays(T0,-60))return 0;
        var n=0,seen={};[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.via||f.partner||f.code!==c)return;var k=f.fr+f.to;if(seen[k])return;seen[k]=1;try{n+=window.kgmEnsureAuctionsR922(c,d,f)||0}catch(_){}});
        if(n){try{window.kgmAutoSettleAuctionsR923&&window.kgmAutoSettleAuctionsR923()}catch(_){}try{window.kgmBigDealTickR929&&window.kgmBigDealTickR929()}catch(_){}try{save()}catch(_){}}
        return n}catch(_){return 0}};
    (function(){try{var p=window.kgmAuctionRowsR920;if(typeof p!=='function'||p.__r1010A)return;
      var w=function(){try{window.kgmAucPastR1010A()}catch(_){}return p.apply(this,arguments)};
      Object.keys(p).forEach(function(k){try{w[k]=p[k]}catch(_){}});w.__r1010A=1;window.kgmAuctionRowsR920=w}catch(_){}})();
    /* 1010A #8：瀏覽器儲存空間 —— 模擬 BigDeal 出價每天約 1,200 筆，存檔佔掉 localStorage 上限（約 520 萬字元）的六成以上；
       滿了以後 setItem 失敗是靜默的（訂位、薪資等其他資料也會一起存不進去）。
       起飛超過 3 天的「模擬」BigDeal 出價不再存檔（搜尋那一班時由上面的 kgmAucPastR1010A 依同一組種子重新補出）；旅客真的出價永遠保留。 */
    window.kgmBdTrimR1010A=function(){try{var cut=addDays(todayISO(),-3),a=S.bigDeals||[],keep=a.filter(function(b){return !(b&&b.demoR922&&b.date&&b.date<cut)});
      if(keep.length!==a.length){S.bigDeals=keep;try{save()}catch(_){}}return a.length-keep.length}catch(_){return 0}};
    setTimeout(function(){try{window.kgmBdTrimR1010A()}catch(_){}},30000);
    setInterval(function(){try{window.kgmBdTrimR1010A()}catch(_){}},600000);

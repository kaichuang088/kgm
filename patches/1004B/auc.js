  /* 1004B：使用者：「In-Progress 的 Residence 和 BigDeal 都要寫在裡面」（KX304 2026-10-28 PVG→DOH 看到的是 0）。
     BigDeal 起飛前 7 天才開放、Residence 不是 A380 就不會有 —— 以前一律只寫「沒有紀錄」，看起來像系統壞掉。
     改成：每一組標出競標進度；搜尋某班某日、那一欄沒有出價時，寫清楚它是「進行中但還沒人出價」「尚未開放（哪天開放）」還是「這段沒有 Residence」。 */
  function aucWin1004B(code,date,fr,to){
    var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code&&!x.via&&(!fr||x.fr===fr)&&(!to||x.to===to)})[0];if(!f||!date)return null;
    var hrs=NaN;try{hrs=window.kgmHoursToDepR920B(f,date)}catch(_){}
    var tp='';try{tp=acftOfFlight(f.code,date,f.fr,f.to)||f.acft||''}catch(_){tp=f.acft||''}
    var cd=+window.KGM_RES_CASH_CLOSE_DAYS_R920||14,md=+window.KGM_RES_MILE_CLOSE_DAYS_R920||7;
    return {f:f,hrs:hrs,type:tp,a380:tp==='A388',cash:addDays(date,-cd),mile:addDays(date,-md),bdOpen:addDays(date,-7),bdPub:addDays(date,-2),cd:cd,md:md};
  }
  function aucStat1004B(list){
    var f=list[0],w=aucWin1004B(f.code,f.date,f.fr,f.to),z=z920a();if(!w||!isFinite(w.hrs))return '';
    var won=list.some(function(r){return r.status==='won'}),t,c;
    if(f.kind==='bigdeal'){if(w.hrs>48){t=(z?'開放中 · ':'Open · ')+w.bdPub.slice(5)+(z?' 公布':' publish');c='on'}else{t=z?'已公布':'Published';c='done'}}
    else if(won){t=z?'已結標':'Settled';c='done'}
    else if(w.hrs>w.cd*24){t=(z?'進行中 · 現金 ':'Open · cash ')+w.cash.slice(5)+(z?'、里程 ':', miles ')+w.mile.slice(5)+(z?' 截標':' close');c='on'}
    else if(w.hrs>w.md*24){t=(z?'進行中 · 僅里程，':'Miles only · ')+w.mile.slice(5)+(z?' 截標':' close');c='on'}
    else{t=z?'已截標 · 待結標':'Closed · to settle';c='due'}
    return '<i class="k4b-auc-st '+c+'">'+e920(t)+'</i>';
  }
  function aucEmpty1004B(key){
    var z=z920a(),code=String(S.auctionCodeR923||''),date=String(S.auctionDateR923||''),sg=String(S.auctionSegR928||'').split('-');
    var none=z?'沒有紀錄。':'No records.';if(!code||!date)return none;
    var w=aucWin1004B(code,date,sg[0]||'',sg[1]||'');if(!w||!isFinite(w.hrs))return none;
    if(w.hrs<=0)return z?'這一班已經起飛，沒有競標紀錄。':'Departed; no records.';
    if(key==='res'){
      if(!w.a380)return (z?'這一段是 '+w.type+'，不是 A380，沒有 Residence 競標。':'Not an A380 sector — no Residence.');
      if(w.hrs>w.cd*24)return (z?'進行中（現金 '+w.cash+' 截標、里程 '+w.mile+' 截標），目前還沒有人出價。':'Open — no bids yet.');
      if(w.hrs>w.md*24)return (z?'現金已截標；里程競標進行中（'+w.mile+' 截標），目前沒有出價。':'Miles only — no bids.');
      return z?'已截標，沒有出價紀錄。':'Closed, no bids.';
    }
    if(w.hrs>168)return (z?'BigDeal 尚未開放：'+w.bdOpen+' 開放、'+w.bdPub+' 公布（起飛前 7 天開放、48 小時公布）。':'BigDeal opens '+w.bdOpen+'.');
    if(w.hrs>48)return (z?'BigDeal 開放中（'+w.bdPub+' 公布），目前還沒有人出價。':'BigDeal open — no bids yet.');
    return z?'BigDeal 已公布，沒有得標紀錄。':'Published; no records.';
  }

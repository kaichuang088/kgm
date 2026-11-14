/* 1004B：外站「對號回程」配對。使用者：「為什麼飛機不是飛 10/05 KX131 而是還要等到隔天？你不能只檢查我說的，要全部檢查一遍」。
   全機隊實測：一年 46,966 次「去程落地、對號回程 8 小時內就有一班」裡，有十幾次飛機沒飛自己的對號回程、在外站等 16～49 小時
   （例：KX308 台北→浦東 10/05 落地 60 分後就有 KX307，飛機卻等 29 小時飛隔天的 KX309）—— 都是補覆蓋時把「還沒有機身的去程」
   跟「還沒有機身的回程」串在同一架，沒有看同一天的對號回程已經被別架飛走。
   這裡依落地時間逐一檢查：去程落地後，同一天的對號回程（班號減一，落地後 8 小時內）如果是別架在飛、而且那一架不是「它自己的
   去程接自己的對號回程」，兩架從這一站之後的勤務整串互換（同機型、營收航段一段不增減、兩架都不跳站）。
   第五航權續飛段、松山固定班（tsaFixedR830）、手動排班（manualR69）、機身不可用的日子都不動。 */
window.kgmPairReturnR1004B=function(){
  var A=S.tailAssign||{},stat={swapped:0,candidates:0,why:{}},TY={},BASE={TPE:1,TSA:1};
  function typeOf(t){if(TY[t]===undefined){try{TY[t]=_typeOfTail(t)||''}catch(_){TY[t]=''}}return TY[t]}
  function frOf(x){return x.fr||String(x.route||'').split('→')[0]}
  function toOf(x){return x.to||String(x.route||'').split('→')[1]}
  function arrOf(x){if(x._a1004==null){try{x._a1004=_fUTC(x,x.date,'arr')}catch(_){x._a1004=x._e1004+180}}return x._a1004}
  function num(c){var m=/^KX(\d+)$/.exec(String(c||''));return m?+m[1]:-1}
  function frozen(q){return q.tsaFixedR830||q.manualR69||q.manual}
  var seq={},idx={},all=[];
  Object.keys(A).forEach(function(tl){
    var L=(A[tl]||[]).filter(function(x){return x&&x.date});
    L.forEach(function(x){x._e1004=rowEpoch72(x);all.push(x)});
    L.sort(function(a,b){return a._e1004-b._e1004});seq[tl]=L;
    L.forEach(function(x){if(x.positioningR830)return;var k=x.code+'|'+frOf(x);(idx[k]=idx[k]||[]).push(x)});
  });
  Object.keys(idx).forEach(function(k){idx[k].sort(function(p,q){return p._e1004-q._e1004})});   /* 依起飛時間排好，下面用二分搜尋 */
  function firstFrom(list,t){var lo=0,hi=list.length;while(lo<hi){var m=(lo+hi)>>1;if(list[m]._e1004<t)lo=m+1;else hi=m}return lo}
  var pos=new Map();
  function where(){pos=new Map();Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x,i){pos.set(x,[tl,i])})})}
  /* 這一架「去程接自己的對號回程」：前一段是去程、班號是回程加一、落地後 8 小時內 → 不搶它的 */
  function ownPair(pb,d){var n=num(pb.code);return !pb.positioningR830&&BASE[frOf(pb)]&&n>0&&n%2===0&&num(d.code)===n-1&&d._e1004-arrOf(pb)<=480}
  for(var pass=0;pass<4;pass++){
    var changed=0;where();
    var arrs=[];Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x){var n=num(x.code);if(!x.positioningR830&&n>0&&n%2===0&&BASE[frOf(x)]&&!BASE[toOf(x)])arrs.push(x)})});
    arrs.sort(function(a,b){return arrOf(a)-arrOf(b)});
    arrs.forEach(function(a){
      var w=pos.get(a);if(!w)return;var ta=w[0],i=w[1],L=seq[ta],nx=L[i+1];if(!nx)return;
      if(nx.code===a.code)return;                                   /* 第五航權續飛 */
      var X=toOf(a),arr=arrOf(a),pair='KX'+(num(a.code)-1);
      var IL=idx[pair+'|'+X]||[],ci=firstFrom(IL,arr+TURN72),cand=(IL[ci]&&IL[ci]._e1004<=arr+480)?IL[ci]:null;
      if(!cand||cand===nx)return;
      if(nx._e1004<=cand._e1004)return;                              /* 本來就比較早走 */
      stat.candidates++;
      function no(k){stat.why[k]=(stat.why[k]||0)+1}
      var wb=pos.get(cand);if(!wb||wb[0]===ta){no('same');return}if(typeOf(wb[0])!==typeOf(ta)){no('type');return}
      var tb=wb[0],j=wb[1],B=seq[tb],pb=B[j-1];
      if(!pb||toOf(pb)!==X){no('pos');return}
      if(!pb.positioningR830&&pb.code===cand.code){no('thru');return}           /* 回程是續飛後段 */
      if(ownPair(pb,cand)){no('own');return}                                    /* 那一架飛的是自己的對號回程 */
      if(arrOf(pb)+TURN72>nx._e1004){no('late');return}                          /* 那一架接不上這一架原本的下一段 */
      var toA=B.slice(j),toB=L.slice(i+1);
      if(toA.some(frozen)||toB.some(frozen)){no('frozen');return}
      if(toA.some(function(q){return unavailable72(ta,q.date)})||toB.some(function(q){return unavailable72(tb,q.date)})){no('unavail');return}
      seq[ta]=L.slice(0,i+1).concat(toA);seq[tb]=B.slice(0,j).concat(toB);
      /* 機型替換表記著機身 → 跟著航段換 */
      try{var SUB=S.acftSub||{};toA.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===tb)SUB[k].tail=ta});
        toB.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===ta)SUB[k].tail=tb})}catch(_){}
      changed++;stat.swapped++;where();
    });
    if(!changed)break;
  }
  all.forEach(function(x){delete x._e1004;delete x._a1004});
  if(stat.swapped){
    Object.keys(seq).forEach(function(tl){A[tl]=seq[tl].concat((A[tl]||[]).filter(function(x){return !(x&&x.date)}))});
    try{save()}catch(_){}
    try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}
    try{if(window.kgmPlanCacheClearR196)window.kgmPlanCacheClearR196()}catch(_){}
    try{window.KGM_COVER_CACHE_R914=null}catch(_){}
  }
  window.KGM_PAIRRET_R1004B=stat;
  return stat;
};
(function(){var _fs=window.kgmFixSplitR929;window.kgmFixSplitR929=function(){var r=_fs.apply(this,arguments);try{window.kgmPairReturnR1004B()}catch(_){}return r}})();

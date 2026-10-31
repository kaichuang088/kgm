/* 1012A #18：飛機排班多飛不同地方。使用者：「飛機排班很多都是連續兩天飛同樣的地方，像是飛完 JFK 隔天又飛 JFK，
   我希望飛機能飛越多地方越好、不要一直是重複航線，但重點是排班上不能有任何問題」。
   作法（只在台北基地地面換手，跟 kgmPairReturnR1004B 同一種安全的整串互換）：
   · 一架飛機回到台北、下一趟還沒出發之間，是一個「接點」。同機型的另一架飛機如果同一段時間也在台北地面
     （兩架都來得及接對方的下一趟：落地＋最短過站 ≤ 對方下一趟起飛），兩架從這個接點之後的勤務整串互換。
   · 整串互換不增減任何一段營收航班，兩架都不跳站、不重疊、機型一樣；第五航權、外站對號回程都在接點之前或之後整段跟著走。
   · 只在「互換後兩個接點重複目的地的次數變少」時才換；有松山固定班、手動排班或維修／停用日的飛機不參與。
   · 明天起才換（今天已經在飛的不動）。
   · 接點（上一趟最後一段、下一趟第一段）在整串互換之後仍是同一對，只有被換的那兩個接點變成新的兩對 → 依落地時間掃一遍就好。 */
window.kgmVarietyR1012A=function(){
  var A=S.tailAssign||{},stat={swapped:0,before:0,after:0,junctions:0,skipTails:0},TY={};
  function typeOf(t){if(TY[t]===undefined){try{TY[t]=_typeOfTail(t)||''}catch(_){TY[t]=''}}return TY[t]}
  function frOf(x){return x.fr||String(x.route||'').split('→')[0]}
  function toOf(x){return x.to||String(x.route||'').split('→')[1]}
  function arrOf(x){if(x._a12==null){try{x._a12=_fUTC(x,x.date,'arr')}catch(_){x._a12=x._e12+180}}return x._a12}
  function frozen(q){return q.tsaFixedR830||q.manualR69||q.manual}
  function dayNo(d){return Math.round(Date.parse(d+'T00:00:00Z')/86400000)}
  /* 重複＝下一趟的目的地跟上一趟一樣，而且上一趟回到台北的隔天以內就出發（月曆上看起來就是連著兩天飛同一個地方） */
  function rep(p,n){return !!(p&&n&&p.dest===n.dest&&n.day-p.endDay<=1)}
  var from=D(T(),1),seq={},owner=new Map(),skip={};
  Object.keys(A).forEach(function(tl){var L=(A[tl]||[]).filter(function(x){return x&&x.date});L.forEach(function(x){x._e12=rowEpoch72(x);owner.set(x,tl)});L.sort(function(a,b){return a._e12-b._e12});seq[tl]=L;
    if(L.some(function(x){return x.date>=from&&(frozen(x)||unavailable72(tl,x.date))}))skip[tl]=1});
  stat.skipTails=Object.keys(skip).length;
  /* 每一架的趟次與接點 */
  var J=[];
  Object.keys(seq).forEach(function(tl){if(skip[tl]||!typeOf(tl))return;var L=seq[tl],trips=[],cur=null;
    for(var i=0;i<L.length;i++){var x=L[i];
      if(frOf(x)==='TPE'&&(!cur||cur.closed)){cur={first:x,fi:i,dest:toOf(x),day:dayNo(x.date),closed:false};trips.push(cur)}
      if(cur&&toOf(x)==='TPE'){cur.closed=true;cur.last=x;cur.li=i;cur.endDay=dayNo(x.date)}}
    for(var k=0;k+1<trips.length;k++){var a=trips[k],b=trips[k+1];if(!a.closed)continue;
      if(a.li+1!==b.fi)continue;if(b.first.date<from)continue;
      J.push({type:typeOf(tl),last:a.last,next:b.first,arr:arrOf(a.last),dep:b.first._e12,prev:a,nxt:b,used:false})}});
  stat.junctions=J.length;J.forEach(function(j){if(rep(j.prev,j.nxt))stat.before++});
  var byType={};J.forEach(function(j){(byType[j.type]=byType[j.type]||[]).push(j)});
  Object.keys(byType).forEach(function(tp){
    var JJ=byType[tp].sort(function(a,b){return a.arr-b.arr});
    for(var ai=0;ai<JJ.length;ai++){
      var ja=JJ[ai];if(ja.used||!rep(ja.prev,ja.nxt))continue;
      var ta=owner.get(ja.last),best=null,bestGain=0,lo=0,hi=JJ.length,lim=ja.arr-4320;
      while(lo<hi){var m=(lo+hi)>>1;if(JJ[m].arr<lim)lo=m+1;else hi=m}   /* 三天內落地的接點（依落地時間二分搜尋） */
      for(var bi=lo;bi<JJ.length&&JJ[bi].arr<=ja.dep;bi++){
        var jb=JJ[bi];if(jb===ja||jb.used)continue;var tb=owner.get(jb.last);if(tb===ta||skip[tb])continue;
        if(ja.arr+TURN72>jb.dep||jb.arr+TURN72>ja.dep)continue;   /* 兩架同時在台北地面、都接得上對方的下一趟 */
        var g=(rep(ja.prev,ja.nxt)?1:0)+(rep(jb.prev,jb.nxt)?1:0)-(rep(ja.prev,jb.nxt)?1:0)-(rep(jb.prev,ja.nxt)?1:0);
        if(g>bestGain){bestGain=g;best=jb}
      }
      if(!best)continue;
      var tb2=owner.get(best.last),La=seq[ta],Lb=seq[tb2],ia2=La.indexOf(ja.next),ib2=Lb.indexOf(best.next);
      if(ia2<0||ib2<0)continue;
      var toA=Lb.slice(ib2),toB=La.slice(ia2);
      seq[ta]=La.slice(0,ia2).concat(toA);seq[tb2]=Lb.slice(0,ib2).concat(toB);
      toA.forEach(function(q){owner.set(q,ta)});toB.forEach(function(q){owner.set(q,tb2)});
      try{var SUB=S.acftSub||{};toA.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===tb2)SUB[k].tail=ta});
        toB.forEach(function(q){var k=q.code+'_'+q.date+'_'+frOf(q)+toOf(q);if(SUB[k]&&SUB[k].tail===ta)SUB[k].tail=tb2})}catch(_){}
      /* 兩個接點換成新的兩對 */
      var na=ja.nxt,nb=best.nxt;ja.next=best.next;ja.nxt=nb;ja.dep=best.dep;best.next=na.first;best.nxt=na;best.dep=na.first._e12;
      ja.used=best.used=true;stat.swapped++;
    }
  });
  J.forEach(function(j){if(rep(j.prev,j.nxt))stat.after++});
  Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x){delete x._e12;delete x._a12})});
  if(stat.swapped){
    Object.keys(seq).forEach(function(tl){A[tl]=seq[tl].concat((A[tl]||[]).filter(function(x){return !(x&&x.date)}))});
    try{save()}catch(_){}
    try{if(window.kgmCrewResetR121)window.kgmCrewResetR121()}catch(_){}
    try{if(window.kgmPlanCacheClearR196)window.kgmPlanCacheClearR196()}catch(_){}
    try{window.KGM_COVER_CACHE_R914=null;window.KGM_SPLIT_CACHE_R929=null}catch(_){}
  }
  window.KGM_VARIETY_R1012A=stat;
  return stat;
};
/* 1012A #19：「圖三你不是說沒有問題了嗎」—— 開站後機隊輪轉會在背景整年重排（約兩分鐘），重排做到一半時輪轉檢查條量到的是半成品，
   會出現第五航權拆機、無機可派、接縫需調機的紅字，重排完就消失（實測同一份存檔重排完三項都是 0）。
   改成：重排與收尾（對號回程、多飛不同地方）全部做完後，先自動補一次（拆機收回、補位、接縫對調），才把檢查結果顯示出來；
   重排期間檢查條只寫「背景重排中」。 */
window.KGM_BOOT_R1012A=window.KGM_BOOT_R1012A||Date.now();
function heal12(){
  if(window.__heal12)return;window.__heal12=1;var h={at:new Date().toISOString()};
  try{var sp=window.kgmLiveSplitR929();h.split0=sp.n;if(sp.n&&window.kgmFixSplitR929){window.kgmFixSplitR929();h.split1=window.kgmLiveSplitR929().n}}catch(_){}
  try{var cv=window.kgmLiveCoverR135();h.miss0=cv.missing;if(cv.missing>0&&cv.missing<=300&&window.kgmCoverGapsR135){window.kgmCoverGapsR135(true);h.miss1=window.kgmLiveCoverR135().missing}}catch(_){}
  try{var sm=window.kgmRotSeamR922();h.seam0=sm.n;if(sm.n&&window.kgmFixRotSeamR922){window.kgmFixRotSeamR922();h.seam1=window.kgmRotSeamR922().n}}catch(_){}
  window.KGM_HEAL_R1012A=h;window.KGM_ROT_SETTLED_R1012A=Date.now();window.__heal12=0;
  try{window.KGM_COVER_CACHE_R914=null;window.KGM_SPLIT_CACHE_R929=null}catch(_){}
  try{if(S.view==='admin'&&/fleetsched/.test(String(S.adminTab||'')))render()}catch(_){}}
(function(){var _pr=window.kgmPairReturnR1004B;window.kgmPairReturnR1004B=function(){var r=_pr.apply(this,arguments);
  try{if(window.KGM_SIDE!=='front'&&!window.__heal12)window.kgmVarietyR1012A()}catch(e){try{console.warn('1012A variety',e)}catch(_){}}return r}})();
/* 整年重排做完以後，還有對號回程、第五航權收尾（開站 130 秒）、補位等背景步驟會再動輪轉：等輪轉指紋連續 30 秒不變、而且開站超過 140 秒，才做最後一次檢查補正 */
(function(){if(window.KGM_SIDE==='front')return;var last=null,stable=0,iv=setInterval(function(){try{if(window.KGM_ROT_SETTLED_R1012A){clearInterval(iv);return}
  if(!window.KGM_ROT_FINAL_R913||window.KGM_FINALRUN_1006A){stable=0;return}var st=window.kgmRosterStampR121?window.kgmRosterStampR121():'';
  if(st===last)stable+=10;else{stable=0;last=st}
  if(stable>=30&&Date.now()-window.KGM_BOOT_R1012A>=140000){clearInterval(iv);heal12()}}catch(_){}},10000)})();
window.kgmRotSettledR1012A=function(){return !!window.KGM_ROT_SETTLED_R1012A||window.KGM_SIDE==='front'||Date.now()-window.KGM_BOOT_R1012A>420000};

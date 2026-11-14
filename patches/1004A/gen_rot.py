import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 機隊輪轉（使用者圖二：「第五航權拆機 12、全機隊輪轉接不上 2 —— 一定要解決」）
   「重新排輪轉（30 天後）」：整年重排之後只把第 30 天以後放回去，但整年重排不是逐位元組重現的（實測 193 架裡 117 架前 30 天排法不同），
   原本直接把「舊的鎖定期」接上「新的第 30 天以後」，同一架飛機前後兩段根本不是同一條輪轉 → 接縫停在外站接不回來、時間重疊、第五航權被拆開。
   改成：新的第 30 天以後，按「舊鎖定期最後停在哪一站、幾點可以再飛」重新對到舊的機身（同機型、同一站、時間來得及），整條勤務一起搬，不拆段；
   整年重排後的步驟也補齊，跟開站時的整年重排一樣（時間軸對齊、松山輪值）。 */
'''
old="""    var r=window.kgmRebuildFleetR72(null,366,true);
    try{Object.keys(S.tailAssign||{}).forEach(function(tl){S.tailAssign[tl]=(S.tailAssign[tl]||[]).filter(function(x){return !(x&&x.date>=T927D&&x.date<start)})});
      Object.keys(keep927D).forEach(function(tl){if(!keep927D[tl].length)return;S.tailAssign[tl]=keep927D[tl].concat(S.tailAssign[tl]||[]).sort(function(a,b){return String(a.date).localeCompare(String(b.date))||String(a.dep||'').localeCompare(String(b.dep||''))})});
      if(typeof window.kgmClearRotationCacheR72==='function')window.kgmClearRotationCacheR72()}catch(_){}"""
new="""    /* 1004A：舊輪轉在鎖定期之前的紀錄（過去的航段）也留著 */
    var past929={};try{Object.keys(S.tailAssign||{}).forEach(function(tl){past929[tl]=(S.tailAssign[tl]||[]).filter(function(x){return x&&x.date<T927D}).map(function(x){return Object.assign({},x)})})}catch(_){}
    var r=window.kgmRebuildFleetR72(null,366,true);
    /* 1004A：跟開站時的整年重排同一套後續步驟（r179：時間軸對齊、松山輪值），少了這兩步松山線會整批沒有機身 */
    try{window.kgmAxisBaseR175(true);window.kgmUnifyAxisR175()}catch(_){}
    try{if(typeof window.kgmTsaRotateR148==='function')window.kgmTsaRotateR148(true)}catch(_){}
    try{window.KGM_ROT_RELABEL_R929=window.kgmRotRelabelR929(keep927D,past929,start)}catch(e929){try{console.warn('1004A relabel',e929)}catch(_){}}
    try{if(typeof window.kgmClearRotationCacheR72==='function')window.kgmClearRotationCacheR72()}catch(_){}"""
RL('rot lock relabel','kgm-0909E-r229',old,new)
anchor="window.kgmRebuildRotationFromLockR922=function(){"
fn="""/* 1004A：鎖定期之後的新輪轉對回舊機身 —— 以每架舊機身在鎖定期最後停的站與可再起飛時間為準，
   新輪轉第 30 天以後的整串勤務（含跨接縫的第五航權後半段）整條搬到接得上的那一架。 */
window.kgmRotRelabelR929=function(keep,past,start){
  var TURN=55,typeOf=function(t){try{return _typeOfTail(t)}catch(_){return ''}};
  /* depAbs/arrAbs 是「那一次重建」的相對分鐘，隔天重排基準就不同 → 一律換成絕對時間（UTC 分）再比 */
  function dA(x){try{return _fUTC(x,x.date,'dep')}catch(_){return x.depAbs||0}}
  function aA(x){try{return _fUTC(x,x.date,'arr')}catch(_){return x.arrAbs||0}}
  var A=S.tailAssign||{},post={},tails={};
  Object.keys(A).forEach(function(tl){tails[tl]=1;post[tl]=(A[tl]||[]).filter(function(x){return x&&x.date>=start}).sort(function(a,b){return dA(a)-dA(b)})});
  Object.keys(keep||{}).forEach(function(tl){tails[tl]=1});
  function lastOf(L){var b=null,ba=0;(L||[]).forEach(function(x){if(!x)return;var a=aA(x);if(!b||a>ba){b=x;ba=a}});return b}
  function endAp(x){return x?(x.to||String(x.route||'').split('→')[1]||'TPE'):'TPE'}
  var byT={};Object.keys(tails).forEach(function(tl){var t=typeOf(tl);(byT[t]=byT[t]||[]).push(tl)});
  var map={},stat={moved:0,same:0,loose:0,none:0};
  Object.keys(byT).forEach(function(t){
    var olds=byT[t],ends={},used={};
    olds.forEach(function(o){var l=lastOf(keep[o]);if(!l)l=lastOf(past[o]);ends[o]={ap:endAp(l),ready:l?aA(l)+TURN:-1e12}});
    var news=olds.filter(function(n){return post[n]&&post[n].length}).sort(function(a,b){return dA(post[a][0])-dA(post[b][0])});
    news.forEach(function(n){
      var f=post[n][0],ap=f.fr||String(f.route||'').split('→')[0];
      var ok=olds.filter(function(o){return !used[o]&&ends[o].ap===ap&&ends[o].ready<=dA(f)});
      var pick=null;
      if(ok.indexOf(n)>=0)pick=n;
      else if(ok.length){ok.sort(function(a,b){return ends[a].ready-ends[b].ready});pick=ok[0]}
      if(!pick){var loose=olds.filter(function(o){return !used[o]&&ends[o].ap===ap});if(loose.length){pick=loose[0];stat.loose++}}
      if(!pick){var any=olds.filter(function(o){return !used[o]});pick=any[0];stat.none++}
      if(!pick)return;
      used[pick]=1;map[pick]=n;if(pick===n)stat.same++;else stat.moved++;
    });
  });
  var NA={};
  Object.keys(tails).forEach(function(o){
    var L=(past[o]||[]).concat(keep[o]||[],map[o]?post[map[o]]:[]);
    L.sort(function(a,b){return dA(a)-dA(b)});
    NA[o]=L;
  });
  Object.keys(A).forEach(function(k){if(!NA[k])delete A[k]});Object.keys(NA).forEach(function(k){A[k]=NA[k]});   /* 同一個物件（別層可能留著參照） */
  try{save()}catch(_){}
  return stat;
};
"""
RL('rot relabel fn','kgm-0909E-r229',anchor,fn+anchor)
RL('rot live split','kgm-0823o-r72',
"    {k:zz()?'第五航權拆機':'5th-freedom splits',v:String(s.split),ok:s.split===0},",
"    (function(){var ls=null;try{var st929=window.kgmRosterStampR121?window.kgmRosterStampR121():'';var c929=window.KGM_SPLIT_CACHE_R929;if(!c929||c929.st!==st929)c929=window.KGM_SPLIT_CACHE_R929={st:st929,v:window.kgmLiveSplitR929()};ls=c929.v}catch(_){}\n      var n929=ls?ls.n:s.split;   /* 1004A：看現在的輪轉（不是上一次重建的快照），並列出是哪幾班 */\n      return {k:zz()?'第五航權拆機':'5th-freedom splits',v:String(n929)+(ls&&ls.n?'（'+ls.list.slice(0,3).join('、')+(ls.n>3?'…':'')+'）':''),ok:n929===0}})(),")
fn2="""/* 1004A：第五航權拆機要看「現在的輪轉」：前段（例 TPE→NRT）落地後，同一架下一段不是同班號從中停站出發的後段，就算拆開。
   上一次重建的快照數字不會跟著手動換機、30 天後重排、松山輪值而變，後台看到的紅字才會對不上。 */
window.kgmLiveSplitR929=function(){
  var A=S.tailAssign||{},n=0,list=[];
  Object.keys(A).forEach(function(tl){
    var L=(A[tl]||[]).filter(function(x){return x&&x.date&&!x.positioningR830}).map(function(x){return [rowEpoch72(x),x]}).sort(function(a,b){return a[0]-b[0]});
    L.forEach(function(p,i){
      var x=p[1],fr=x.fr||String(x.route||'').split('→')[0],to=x.to||String(x.route||'').split('→')[1];
      if(!isFirst72({code:x.code,fr:fr,to:to}))return;
      var nx=L[i+1]&&L[i+1][1];
      if(!nx)return;                       /* 排班期最後一天之後沒有資料，不算 */
      if(nx.code===x.code&&(nx.fr||String(nx.route||'').split('→')[0])===to)return;
      n++;if(list.length<30)list.push(String(x.date).slice(5)+' '+x.code+' '+fr+'→'+to+' '+tl);
    });
  });
  return {n:n,list:list};
};
"""
fn3="""/* 1004A：第五航權拆機修補。覆蓋補救與後面逐段補班時，前段（例 KX20 TPE→NRT）落地後被接上別的班，
   後段交給另一架從台北調機過去飛 → 同一班號兩架飛機。這裡逐一找出來：前段在 A 機、後段在 B 機，
   B 機飛後段之前人已經在中停站、而且 A 機原本的下一段起飛前 B 機來得及接手，就把兩架「從這裡以後」的勤務整串互換
   （A 續飛後段與 B 原本之後的全部航段；B 接 A 原本之後的航段）。同機型才換；營收航段一段都不增減，兩架都不會跳站。
   互換後剩下「台北調機出去、馬上又調機回台北」的空趟一併收掉。松山派駐（tsaFixedR830）與手動排班（manualR69）不動。 */
window.kgmFixSplitR929=function(){
  var A=S.tailAssign||{},stat={swapped:0,ferryPairs:0,left:0},TY={};
  function typeOf(t){if(TY[t]===undefined){try{TY[t]=_typeOfTail(t)||''}catch(_){TY[t]=''}}return TY[t]}
  function frOf(x){return x.fr||String(x.route||'').split('→')[0]}
  function toOf(x){return x.to||String(x.route||'').split('→')[1]}
  function arrOf(x){if(x._a929==null){try{x._a929=_fUTC(x,x.date,'arr')}catch(_){x._a929=x._e929+180}}return x._a929}
  var seq={},idx={},all=[];
  Object.keys(A).forEach(function(tl){
    var L=(A[tl]||[]).filter(function(x){return x&&x.date});
    L.forEach(function(x){x._e929=rowEpoch72(x);all.push(x)});
    L.sort(function(a,b){return a._e929-b._e929});seq[tl]=L;
    L.forEach(function(x){if(x.positioningR830)return;var k=x.code+'|'+frOf(x);(idx[k]=idx[k]||[]).push({tl:tl,x:x})});
  });
  var tl929=new Map();
  function where(){tl929=new Map();Object.keys(seq).forEach(function(tl){seq[tl].forEach(function(x,i){tl929.set(x,[tl,i])})})}
  function frozen(q){return q.tsaFixedR830||q.manualR69}
  for(var pass=0;pass<6;pass++){
    var changed=0;where();
    Object.keys(seq).forEach(function(ta){
      for(var i=0;i<seq[ta].length;i++){
        var L=seq[ta],x=L[i];if(x.positioningR830)continue;
        var fr=frOf(x),to=toOf(x);
        if(!isFirst72({code:x.code,fr:fr,to:to}))continue;
        var nx=L[i+1];if(!nx)continue;
        if(nx.code===x.code&&frOf(nx)===to)continue;
        if(frOf(nx)!==to)continue;
        var arr=arrOf(x),best=null;
        (idx[x.code+'|'+to]||[]).forEach(function(o){
          var w=tl929.get(o.x);if(!w||w[0]===ta||typeOf(w[0])!==typeOf(ta))return;
          if(o.x._e929<arr+TURN72||o.x._e929>arr+4320)return;
          if(!best||o.x._e929<best.x._e929)best={tl:w[0],j:w[1],x:o.x};
        });
        if(!best)continue;
        var B=seq[best.tl],j=best.j,pb=B[j-1];
        if(!pb||toOf(pb)!==to)continue;
        if(!pb.positioningR830&&pb.code===x.code)continue;                 /* 後段在 B 機本來就接在自己的前段後面 */
        if(arrOf(pb)+TURN72>nx._e929)continue;                              /* B 機來不及接 A 機原本的下一段 */
        var toA=B.slice(j),toB=L.slice(i+1);
        if(toA.some(frozen)||toB.some(frozen))continue;
        if(toA.some(function(q){return unavailable72(ta,q.date)})||toB.some(function(q){return unavailable72(best.tl,q.date)}))continue;
        seq[ta]=L.slice(0,i+1).concat(toA);seq[best.tl]=B.slice(0,j).concat(toB);
        changed++;stat.swapped++;where();
      }
    });
    if(!changed)break;
  }
  Object.keys(seq).forEach(function(tl){
    var L=seq[tl],out=[];
    for(var i=0;i<L.length;i++){
      var x=L[i],y=L[i+1];
      if(x.positioningR830&&y&&y.positioningR830&&frOf(x)==='TPE'&&toOf(y)==='TPE'&&toOf(x)===frOf(y)&&!frozen(x)&&!frozen(y)){i++;stat.ferryPairs++;continue}
      out.push(x);
    }
    seq[tl]=out;
  });
  all.forEach(function(x){delete x._e929;delete x._a929});
  if(stat.swapped||stat.ferryPairs){
    Object.keys(seq).forEach(function(tl){A[tl]=seq[tl].concat((A[tl]||[]).filter(function(x){return !(x&&x.date)}))});
    try{save()}catch(_){}
  }
  stat.left=window.kgmLiveSplitR929().n;
  window.KGM_SPLITFIX_R929=stat;
  return stat;
};
"""
RL('rot live split fn','kgm-0823o-r72',"var ROT72={};\n",fn2+fn3+"var ROT72={};\n")
RL('rot split fix in rebuild','kgm-0823o-r72',"  sum.continuity=repairRotationR913(start,days);\n","  sum.continuity=repairRotationR913(start,days);\n  try{sum.splitFix929=window.kgmFixSplitR929()}catch(e929){try{console.warn('1004A split fix',e929)}catch(_){}}   /* 1004A：第五航權拆機收尾 */\n")
RL('rot coverage via','kgm-0823o-r72',"var n1=numR72(y.f.code),s=(sta(y.f.to)==='TPE'?0:10000)","var n1=numR72(y.f.code),s=(y.f.code===raw[raw.length-1].f.code&&isFirst72(raw[raw.length-1].f)?-1e9:0)/* 1004A：第五航權前段之後一定先接同班號的後段 */+(sta(y.f.to)==='TPE'?0:10000)")
RL('rot split fix r179','kgm-0907B-r179',"    try{if(typeof window.kgmTsaRotateR148==='function')window.kgmTsaRotateR148(true)}catch(_){}\n    try{render()}catch(_){}","    try{if(typeof window.kgmTsaRotateR148==='function')window.kgmTsaRotateR148(true)}catch(_){}\n    try{if(typeof window.kgmFixSplitR929==='function')window.kgmFixSplitR929()}catch(_){}   /* 1004A */\n    try{render()}catch(_){}")
RL('rot split fix r229','kgm-0909E-r229',"    try{var g927D=window.kgmCoverGapsR135(false);if(g927D.missing&&g927D.missing<=300)window.kgmCoverGapsR135(true)}catch(_){}\n","    try{var g927D=window.kgmCoverGapsR135(false);if(g927D.missing&&g927D.missing<=300)window.kgmCoverGapsR135(true)}catch(_){}\n    try{window.kgmFixSplitR929()}catch(_){}   /* 1004A：補洞之後再收一次第五航權拆機 */\n")

helper="""/* 1004A：第五航權後段屬於哪一天出發的那一班。後段若在前段出發日的隔天才起飛（例 KX73 巴黎週六 15:05 起飛、曼谷週日 08:05 續飛台北），
   它的季節時刻與機型要跟著前段的出發日 —— 換季那一天才不會前段用夏季、後段用冬季（後段變成比前段落地還早起飛，飛機只好拆開）。
   回傳 null 表示不是隔天續飛的後段（同一天續飛的後段本來就同一天、同一季）。 */
var VIAO929=null,VIAN929='';
function kgmViaOriginR929(code,fr,to,date){
  if(!date)return null;
  var cf=(typeof S!=='undefined'&&S.customFlights)||[],sig=FLIGHTS.length+'|'+cf.length;
  if(!VIAO929||VIAN929!==sig){
    VIAO929={};VIAN929=sig;
    var all=[].concat(FLIGHTS,cf),legs={};
    function mn(t){var p=String(t||'0:0').split(':');return (+p[0]||0)*60+(+p[1]||0)}
    all.forEach(function(f){if(f&&!f.via&&!f.partner&&!f.codeshare)legs[f.code+'|'+f.fr+'|'+f.to]=f});
    all.forEach(function(th){
      if(!th||!th.via||th.fr===th.via)return;
      var a=legs[th.code+'|'+th.fr+'|'+th.via],b=legs[th.code+'|'+th.via+'|'+th.to],key=th.code+'|'+th.via+'|'+th.to;
      if(!a||!b||VIAO929[key]!==undefined)return;
      var k=(+a.dd||0)+(mn(b.dep)<mn(a.arr)?1:0);
      VIAO929[key]=k>0?{k:k,fr:th.fr,to:th.via}:null;
    });
  }
  var o=VIAO929[code+'|'+fr+'|'+to];if(!o)return null;
  var d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-o.k);
  return {date:d.toISOString().slice(0,10),fr:o.fr,to:o.to,k:o.k};
}
window.kgmViaOriginR929=kgmViaOriginR929;
"""
R('via origin helper',"function kgmPeakCoreR928(d){",helper+"function kgmPeakCoreR928(d){")
RL('via origin season','kgm-0902a-r106',"""  window.kgmSeasonFlightR48=function(f,date){
    var x=_sf?_sf.apply(this,arguments):f;
    try{
      if(!x||!f)return x;
      var sea=season106(date);""","""  window.kgmSeasonFlightR48=function(f,date){
    /* 1004A：隔天續飛的第五航權後段，季節看前段的出發日（換季當天才接得上） */
    var sd929=date;try{var o929=(f&&date&&window.kgmViaOriginR929)?window.kgmViaOriginR929(f.code,f.fr,f.to,date):null;if(o929&&season106(o929.date)!==season106(date))sd929=o929.date}catch(_){}
    var x=_sf?(sd929===date?_sf.apply(this,arguments):_sf.call(this,f,sd929)):f;
    try{
      if(!x||!f)return x;
      var sea=season106(sd929);""")

RL('kx52 chc/akl seam','kgm-0823l-r66',"""      if(f&&f.code==='KX51'&&(f.fr==='CHC'||f.fr==='AKL')){""","""      /* 1004A：去程 KX52 雪梨→奧克蘭／基督城也是前一天從台北出發的那一班（台北 21:15 起飛、隔天雪梨續飛），
         一樣看前一天：原本 11/1 去程已經改飛基督城、回程卻還是奧克蘭出發，飛機被丟在基督城、奧克蘭要另外調機過去。 */
      if(f&&((f.code==='KX51'&&(f.fr==='CHC'||f.fr==='AKL'))||(f.code==='KX52'&&f.fr==='SYD'&&(f.to==='CHC'||f.to==='AKL')))){""")

RL('rot split fix on load','kgm-0909E-r229',anchor,"""/* 1004A：瀏覽器裡存著舊版排出來的輪轉（有第五航權拆機）時，載入後背景重建都跑完再收一次 */
setTimeout(function(){try{if(window.kgmLiveSplitR929&&window.kgmLiveSplitR929().n)window.kgmFixSplitR929()}catch(_){}},130000);
"""+anchor)

RL('rot tpe no mate','kgm-0823o-r72',"""      if((sta(st.lastFr)===sta(x.f.to)&&sta(st.lastTo)===frS)""","""      /* 1004A：「對號優先」只用在外站（落地的那一架接自己的回程）。在台北也套用的話，剛飛 KX197 札幌回來的飛機
         一定優先接 KX198 再去札幌，同一架一年到頭都在飛同一個地方（實測連續兩個勤務同目的地 39.6%）。
         台北改成一律「等最久的先派」，每架飛機輪流飛不同航點。 */
      if(frS!=='TPE'&&(sta(st.lastFr)===sta(x.f.to)&&sta(st.lastTo)===frS)""")
RL('rot tpe no mate b','kgm-0823o-r72',"""        ||(Math.abs(num72(st.last)-nx0num)===1&&num72(st.last)>=0)){""","""        ||frS!=='TPE'&&(Math.abs(num72(st.last)-nx0num)===1&&num72(st.last)>=0)){""")
RL('pair return type outermost','kgm-0907B-r184',"""  var prev=window.acftOfFlight;
  var fn=function(code,date,fr,to){
    if(CODES[code])return window.kgmTsaSwapDayR184(code,date)?'B78X':'A21N';""","""  var prev=window.acftOfFlight,busy929=0;
  var fn=function(code,date,fr,to){
    if(CODES[code])return window.kgmTsaSwapDayR184(code,date)?'B78X':'A21N';
    /* 1004A：隔天續飛的第五航權後段，機型就是前段那一天派出去的那一架（KX19 檀香山→成田→台北不會前後兩段不同機型）；
       先換成前段再往下套對號回程規則 */
    try{var o929=(fr&&to&&date&&window.kgmViaOriginR929)?window.kgmViaOriginR929(code,fr,to,date):null;if(o929)return fn(code,o929.date,o929.fr,o929.to)}catch(_){}
    /* 1004A：對號回程（例 KX197 札幌→台北）＝前一班去程（KX198）那一天派出去的機型。原本這條規則只掛在 r72 那一層，
       後面各層又各自把回程改成別的機型（實測 3/13 KX198 是 A21N、3/14 KX197 是 A339L，再被補洞改成 B779），
       飛機在札幌、成田、沖繩等不到同機型的回程，一等就兩三天。管理端手動換機（非自動）照舊優先。 */
    try{
      var P929=window.KGM_EQV_PAIRS_R72||(window.kgmEqvPairsR72&&window.kgmEqvPairsR72()),p929=P929&&P929[code];
      if(p929&&date&&!busy929){
        var A929=S.acftSub||{},sb929=A929[code+'_'+date+'_'+p929.fr+p929.to]||A929[code+'_'+date];
        if(!(sb929&&sb929.sub&&!sb929.auto)){
          busy929=1;var lt929=null;
          try{lt929=fn(p929.lead,addDays(date,-p929.k),p929.to,p929.fr)}finally{busy929=0}
          if(lt929&&lt929!=='EQV')return lt929;
        }
      }
    }catch(_){busy929=0}""")

RL('rot pairs refresh','kgm-0823o-r72',"window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={};","window.kgmClearRotationCacheR72=function(){LEGC72={};DAYC72={};ROT72={};THRU72=null;SEC72=null;flight72.cache={};\n  /* 1004A：去回程同機型配對表（KX188→隔天 KX187）開站時在時刻表更新之前就算好、一直快取著，實測被算成隔 3 天 → 飛機在成田等 58 小時。重排前一律重算 */\n  try{if(window.kgmEqvPairsR72)window.kgmEqvPairsR72()}catch(_){}")

RL('rot via turn a','kgm-0823o-r72',"while(k0<3&&(dep0<x.arrAbs+75||","while(k0<3&&(dep0<x.arrAbs+TURN72||")
RL('rot via turn b','kgm-0823o-r72',"      if(dep0<x.arrAbs+75)continue;","      if(dep0<x.arrAbs+TURN72)continue;   /* 1004A：續飛中停只要過站時間（55 分）就接得上；原本要 75 分，KX29 溫哥華停 60 分會被順延一天、飛機在溫哥華多等 25 小時 */")
RL('rot diverse a','kgm-0823o-r72',"  var distOut={},freeOut={},monthOut={},assignedBlocks=[];","  var distOut={},freeOut={},monthOut={},assignedBlocks=[],last1R929={},last2R929={};")
RL('rot diverse b','kgm-0823o-r72',"      if(!pick||(monthOut[t][ym]||0)<(monthOut[pick][ym]||0)||((monthOut[t][ym]||0)===(monthOut[pick][ym]||0)&&distOut[t].length<distOut[pick].length))pick=t});","      if(!pick||sc929(t)<sc929(pick)||(sc929(t)===sc929(pick)&&distOut[t].length<distOut[pick].length))pick=t});")
RL('rot diverse c','kgm-0823o-r72',"    var first=b[0],last=b[b.length-1],ym=first.date.slice(0,7),pick=null;","    var first=b[0],last=b[b.length-1],ym=first.date.slice(0,7),pick=null;\n    /* 1004A：時刻表每天重複，只看每月航段數平均的話，同一架每天都會分到同一條線（實測某架 A21N 一年 67% 都飛廈門）。\n       使用者：「飛機班表盡量不要一直飛同樣的地方」→ 上一個勤務去同一個地方的加 40 段、上上一個加 20 段，再比每月航段數\n       （只飛一趟長勤務的飛機本月航段永遠最少，扣分太小的話每天還是它，實測 A21N 有整個月 31 趟都飛仙台）。 */\n    var dest929=sta(first.to||String(first.route||'').split('→')[1]);\n    function sc929(t){return (monthOut[t][ym]||0)+(last1R929[t]===dest929?40:0)+(last2R929[t]===dest929?20:0)}")
RL('rot diverse d','kgm-0823o-r72',"    b.forEach(function(x){distOut[pick].push(x)});freeOut[pick]=last.arrAbs;","    last2R929[pick]=last1R929[pick];last1R929[pick]=dest929;\n    b.forEach(function(x){distOut[pick].push(x)});freeOut[pick]=last.arrAbs;")

RL('rot same code a','kgm-0823o-r72',"    var frS=sta(x.f.fr),best=null,fresh=null,mate=null,nx0num=num72(x.f.code);","    var frS=sta(x.f.fr),best=null,fresh=null,mate=null,nx0num=num72(x.f.code),same929=null;")
RL('rot same code b','kgm-0823o-r72',"      if(frS!=='TPE'&&(sta(st.lastFr)===sta(x.f.to)","      /* 1004A：同班號續飛（KX29 多倫多→溫哥華→台北）最優先由剛飛前一段進來的那一架接；原本只認對號（KX29↔KX30），\n         溫哥華那一段被前一晚 KX30 進來的飛機接走，KX29 的飛機在溫哥華等兩天 */\n      if(frS!=='TPE'&&st.last===x.f.code&&sta(st.lastTo)===frS){if(!same929||pos[same929].since<st.since)same929=tl;continue}\n      if(frS!=='TPE'&&(sta(st.lastFr)===sta(x.f.to)")
RL('rot same code c','kgm-0823o-r72',"    if(frS!=='TPE')best=mate;","    if(frS!=='TPE')best=same929||mate;")

RL('rot pair928 turn a','kgm-0823o-r72',"            if(y.arrAbs+75>s.dep)continue;","            if(y.arrAbs+TURN72>s.dep)continue;   /* 1004A：續飛中停 55 分就接得上（KX29 溫哥華停 60 分） */")
RL('rot pair928 turn b','kgm-0823o-r72',"            if(s3.dep<y.arrAbs+75)continue;","            if(s3.dep<y.arrAbs+TURN72)continue;")

RL('rot pair run cap','kgm-0823o-r72',"      var LA=dist[A],LB=dist[B],ia=LA.indexOf(r),iy=LB.indexOf(y);if(ia<0||iy<0)return;","""      var LA=dist[A],LB=dist[B],ia=LA.indexOf(r),iy=LB.indexOf(y);if(ia<0||iy<0)return;
      /* 1004A：對號接續（KX205 檳城回來 → 隔天 KX206 再去檳城）套在全機隊，結果同一架整個月 31 趟都飛檳城。
         使用者：「飛機班表盡量不要一直飛同樣的地方」→ 同一架最多連續兩個勤務去同一個地方，第三趟不再對調。 */
      var d929=[],j929;for(j929=ia;j929>=0&&d929.length<2;j929--){var q929=LA[j929];if(q929&&!q929.noPax&&frOf(q929)==='TPE')d929.push(toOf(q929))}
      if(d929.length===2&&d929[0]===P&&d929[1]===P)return;""")

# ---- 1004A #80：松山換機日遇到台灣連假可以（而且優先）排在連假：換機當天 KX168/KX167 或 KX136/KX135 會由 A21N 改 B78X，連假載客率高 ----
R('#80 tsa exchange holiday',"    if(d<6)sc-=0.18;\n    if(d>last-3)sc-=0.18;",
"    /* 1004A：使用者「TSA 和 TPE 換班如果遇到連假就可以換飛機，因為載客率比較高」。\n       換機當天桃園—羽田那班會由 A21N 改成 B78X（座位多），所以台灣三天以上連假的日子加分，也不受月初／月底扣分；\n       仍然保留「離上次換機約 30 天」的扣分（偏離 12 天以內連假會勝出）與 A/B、C 至少差 6 天的規則。 */\n    var hol929=false;try{hol929=(window.KGM_HOLIDAYS_R929||[]).some(function(h){if(!h||h.c!=='TW'||!h.from||!h.to)return false;var n=Math.round((Date.parse(h.to)-Date.parse(h.from))/864e5)+1;return n>=3&&date>=h.from&&date<=h.to})}catch(_){}\n    if(hol929)sc+=0.36;\n    else{\n    if(d<6)sc-=0.18;\n    if(d>last-3)sc-=0.18;\n    }")
R('#80 cand base',"    cand.push({date:date,score:sc});\n  }","    cand.push({date:date,score:sc,base929:sc});\n  }")
R('#80 C spacing',"  for(var i=1;i<rank.length;i++){\n    if(Math.abs(tsaDayNoR913(rank[i].date)-tsaDayNoR913(ab.date))>=6){c=rank[i];break}\n  }",
"  /* 1004A：連假加分後，C 班那架會被拉去最近的連假，駐站只剩 15～20 天；C 也要照自己上次換機日＋30 天扣分（原本只有 A/B 有） */\n  var crank929=cand.map(function(x){var s=x.base929;if(prev&&prev.ym<ym&&prev.c)s-=Math.min(0.5,Math.abs(tsaDayNoR913(x.date)-(tsaDayNoR913(prev.c)+30))*0.03);return {date:x.date,score:s}}).sort(function(a,b){return b.score-a.score||a.date.localeCompare(b.date)});\n  for(var i=0;i<crank929.length;i++){\n    if(Math.abs(tsaDayNoR913(crank929[i].date)-tsaDayNoR913(ab.date))>=6){c=cand.filter(function(x){return x.date===crank929[i].date})[0];break}\n  }")
# ── 1004A：新增／退役飛機後的局部重排把兩套輪轉硬接在生效日，接縫處整個機隊跳站 ──
R('#1004 rebuildKeep928 no splice','''  window.kgmRebuildFleetR72(null,366,true);
  Object.keys(S.tailAssign||{}).forEach(function(tl){S.tailAssign[tl]=(S.tailAssign[tl]||[]).filter(function(x){return !(x&&x.date>=t0&&x.date<from)})});
  Object.keys(keep).forEach(function(tl){if(!keep[tl].length)return;S.tailAssign[tl]=keep[tl].concat(S.tailAssign[tl]||[]).sort(function(a,b){return String(a.date).localeCompare(String(b.date))||String(a.dep||'').localeCompare(String(b.dep||''))})});''','''  window.kgmRebuildFleetR72(null,366,true);
  /* 1004A：使用者截圖 B-58087 逐月排班整個跳站（10/02 降落 TPE、10/04 卻從 HEL 起飛……）。
     根因：這裡原本先整年重排，再把「今天～生效日前」換回舊輪轉；新舊兩套輪轉在生效日硬接，
     每一架在接縫那天的所在位置都對不上（實測新增 2 架 A21N 全機隊多 3 處斷點、再退役 1 架 A35K 又多 10 處）。
     而且網站每次重新載入本來就會從今天起整年重排，舊的那一段只撐到下一次重新整理。
     改成直接用整年重排的結果，畫面上看到的就是重新整理後的同一份，不再拼接。 */
  keep=null;''')
R('#1004 calendar pending note',"""+'<p class="k69-sub">'+(z()?('顯示 '+start+' 至 '+end+'；搜尋較早日期時才向前展開。內部調機航段不顯示。')""",
"""+(window.KGM_ROT_FINAL_R913?'':'<p class="k69-sub" style="color:#b45309;font-weight:700">'+(z()?'背景排班還在計算中（開啟網站後約 20 秒開始、需時 1～2 分鐘），完成後本頁會自動更新；在那之前看到的機身排班不是最終版本。':'Rotation is still being computed in the background; this page refreshes automatically when it finishes.')+'</p>')   /* 1004A */
    +'<p class="k69-sub">'+(z()?('顯示 '+start+' 至 '+end+'；搜尋較早日期時才向前展開。內部調機航段不顯示。')""")
R('#1004 calendar weekday offset',"var offset=(new Date(ym+'-01T12:00:00').getDay()+6)%7;",
"var offset=(new Date(((sets[0]&&sets[0].date)||(ym+'-01'))+'T12:00:00').getDay()+6)%7;   /* 1004A：第一個月從搜尋起始日開始畫，星期要用那一天算（原本用當月 1 號，10/03 星期六被排在星期四那一欄） */")
open('p_f_rot.js','w').write(hdr+'\n'.join(out)+'\n')

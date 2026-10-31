
/* ══ 1026B：全網航班輪擋時間（block time）加彈性
   使用者：「我個人也覺得現在多數航班飛行時間都是只有飛行時間沒有彈性 你可以幫我調整所有航班的飛行時間嗎 最早起飛06:00建議時間往後不要往前
   就是把時間可能原本TPE-NRT 2hr25mins變成2hr55mins之類的 都變得有彈性一點」
   ① 每一段的「應有輪擋時間」＝ 用 2026 年華航／長榮實際班表擬合的公式（patches/1026B/fit/fit26b.py，20 條航線、誤差約 15 分）：
        k0 ＋ k1·d ＋ k2·d·EJ ＋ k3·e^(−d/1.5) ＋ 冬季 k4·d·EJ
      d＝大圓距離（千公里）、EJ＝沿大圓往東分量 × 西風帶權重的平均（往東順風為正）；實際班表本來就含滑行、爬升下降與航空公司的緩衝。
      再依機型巡航速度（A21N 比 A359 慢）、起降時段的機場擁擠（早上與傍晚尖峰）與冬季清晨除冰，每一班各自不同。
   ② 新輪擋＝max（網站原本的輪擋，應有輪擋），5 分鐘取整 —— 只會變長、不會變短；出發時間不提前。
   ③ 抵達往後挪造成接不上時，只把「後面那一班」往後挪（不往前）：
      · 第五航權中停照使用者規定 75 分（前段晚到 → 後段晚走）；
      · 外站過站（去程 KXn 到外站、回程 KXn−1 從外站出發）至少 60／75／90 分（窄體／廣體／A388；固定值，原本比這短的也補到這個值）。
   ④ 全網不在 03:00–03:59 抵達（使用者規定）：落在 03 點時，退回 02:55（還保有一半以上的彈性才退）否則推到 04:00；
      有宵禁的機場（松山、金浦、成田、雪梨、福岡、伊丹、法蘭克福、蘇黎世等）原本不在宵禁內的，加了以後也不能落進宵禁 → 只加到宵禁前 5 分。
   ⑤ 原始時刻照舊存在原本的欄位（各層照舊寫原始值、航班表不動）；讀出來的一律是加過彈性的（最外層季節時刻包裝；搜尋結果、訂位航段也改讀它），
      計算全部是「至少要多少」的條件（重複套用結果不變），所以別層用加過的值再算、再寫回也不會一直往後跑。
   夥伴營運、聯營代碼、後台自建臨時航班不動。 ══ */
(function(){
  'use strict';
  var K=[69.7541265637146,65.68927453188984,-6.3512167912892155,-16.416174696983994,-5.732832779114334];
  var TAS={A388:905,B779:905,B77W:905,B773:900,A35K:905,A359:905,B789:900,B78X:900,B788:895,A339:870,A333:870,A332:870,A21N:830,A21X:830,A320:830,A321:830,B738:830,B38M:830};
  var BIG={TPE:1,NRT:1,HND:1,ICN:1,PEK:1,PKX:1,PVG:1,HKG:1,SIN:1,BKK:1,LHR:1,CDG:1,FRA:1,AMS:1,JFK:1,EWR:1,LAX:1,SFO:1,ORD:1,YYZ:1,SYD:1,DXB:1,DOH:1,IST:1,MNL:1,KUL:1,CGK:1,MUC:1,SEA:1};
  var HUB={TPE:1,TSA:1};
  /* 宵禁（當地時間 [開始, 結束)，分鐘）—— 只用來限制「加上去的彈性」不要把原本在開放時間內的抵達推進宵禁 */
  var CURFEW={TSA:[1380,360],GMP:[1380,360],NRT:[0,360],SYD:[1380,360],FUK:[1320,420],ITM:[1260,420],FRA:[1380,300],ZRH:[1410,360],ORY:[1410,360],ADL:[1380,360],OOL:[1380,360],BNE:[-1,-1]};
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(n){n=((Math.round(n)%1440)+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)}
  function tz(c){try{var v=TZ[c];return typeof v==='number'?v:8}catch(_){return 8}}
  function geo(c){try{var g=AIRPORT_GEO[c];if(g)return g}catch(_){}try{return window.kgmGeoR1025B?window.kgmGeoR1025B(c):null}catch(_){return null}}
  function rad(x){return x*Math.PI/180}
  function hav(a,b){var p1=rad(a[0]),p2=rad(b[0]),dl=rad(b[1]-a[1]);return 2*6371*Math.asin(Math.sqrt(Math.pow(Math.sin((p2-p1)/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin(dl/2),2)))}
  function g(x,c,s){return Math.exp(-Math.pow((x-c)/s,2))}
  var FE={};
  function feat(fr,to){var k=fr+'|'+to;if(FE[k])return FE[k];var a=geo(fr),b=geo(to);if(!a||!b)return FE[k]=null;
    var d=hav(a,b)/1000,p1=rad(a[0]),l1=rad(a[1]),p2=rad(b[0]),l2=rad(b[1]),dd=d/6.371,ej=0,n=24;
    if(dd>1e-6)for(var i=0;i<n;i++){var f=(i+0.5)/n,A=Math.sin((1-f)*dd)/Math.sin(dd),B=Math.sin(f*dd)/Math.sin(dd);
      var x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2),y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2),z=A*Math.sin(p1)+B*Math.sin(p2);
      var lat=Math.atan2(z,Math.sqrt(x*x+y*y)),lon=Math.atan2(y,x),brg=Math.atan2(Math.sin(l2-lon)*Math.cos(p2),Math.cos(lat)*Math.sin(p2)-Math.sin(lat)*Math.cos(p2)*Math.cos(l2-lon)),la=lat*180/Math.PI;
      ej+=Math.sin(brg)*Math.exp(-Math.pow((Math.abs(la)-35)/15,2))*(la>=0?1:0.4)}
    return FE[k]={d:d,ej:ej/n}}
  /* 起降時段擁擠（同 wind25 的尖峰曲線，扣掉全天平均 → 只決定同一航線各班的差異）與冬季除冰 */
  function curve(ap,m){var h=(((m%1440)+1440)%1440)/60,v=6*g(h,8,1.6)+5*g(h,18.5,1.8)+2*g(h,13,1.5)-3*g(h,2.5,2.5);return v*(BIG[ap]?1.4:0.8)}
  var CAVG=(function(){var s=0;for(var m=0;m<1440;m+=10)s+=curve('X',m);return s/144})();
  function deice(ap,m,win){if(!win)return 0;var G=geo(ap);if(!G||G[0]<36)return 0;var h=(((m%1440)+1440)%1440)/60;return (G[0]>=42?10:5)*Math.max(g(h,7,2.2),0.5*g(h,21,2.5))}
  function typeOf(t){t=String(t||'').replace(/[LR]$/,'');return TAS[t]?t:'B789'}
  /* 應有輪擋（分鐘，未取整） */
  function target(fr,to,type,win,depM,arrM){var F=feat(fr,to);if(!F||F.d<0.15)return 0;var d=F.d,ej=F.ej;
    var b=K[0]+K[1]*d+K[2]*d*ej+K[3]*Math.exp(-d/1.5)+(win?K[4]*d*ej:0);
    b+=K[1]*d*(900/TAS[typeOf(type)]-1);
    var big=BIG[fr]?1.4:0.8,bigT=BIG[to]?1.4:0.8;
    b+=(curve(fr,depM)-CAVG*big)+(arrM==null?0:0.7*(curve(to,arrM)-CAVG*bigT))+deice(fr,depM,win);
    return b}
  window.kgmBlockTargetR1026B=function(fr,to,type,win,dep){var d=mn(dep),o=Math.round((tz(to)-tz(fr))*60),t0=target(fr,to,type,win,d,null);return Math.ceil(target(fr,to,type,win,d,d+t0+o)/5)*5};
  function own(f){return f&&!f.partner&&!f.codeshare&&!f.customR1025B&&!f.customR1023A&&/^KX\d+$/.test(String(f.code||''))&&BUILTIN.has(f)}
  var BUILTIN=new WeakSet();
  function all(){try{return FLIGHTS}catch(_){return []}}
  var LX=null,LXN=-1,LXG=-1;function lx(){var L=all();if(!LX||LXN!==L.length||LXG!==GEN){LX=new Map();LXN=L.length;LXG=GEN;for(var i=0;i<L.length;i++){var y=L[i];if(!y||y.via)continue;var k=y.code+'|'+y.fr+'|'+y.to,a=LX.get(k);if(!a)LX.set(k,a=[]);a.push(y)}}return LX}
  function legOf(code,fr,to){var a=lx().get(code+'|'+fr+'|'+to);return a?a[0]:null}
  var PI=null,PN=-1;   /* 前一班索引：同班號抵達這一站的那一段（第五航權前段）、或成對班號（KXn 到外站 → KXn−1 從外站出發） */
  function pred(f){var L=all();if(!PI||PN!==L.length){PI={};PN=L.length;L.forEach(function(y){if(y&&!y.via&&own(y))(PI[y.code+'>'+y.to]=PI[y.code+'>'+y.to]||[]).push(y)})}
    var same=(PI[f.code+'>'+f.fr]||[]).filter(function(y){return y.fr!==f.to})[0];if(same)return {f:same,k:'fifth'};
    if(HUB[f.fr])return null;var n=+String(f.code).slice(2);if(!(n>0))return null;
    var o=(PI['KX'+(n+1)+'>'+f.fr]||[]).filter(function(y){return y.fr!==f.to||HUB[y.fr]})[0];return o?{f:o,k:'turn'}:null}
  /* 後一班：同班號從這一站出發的下一段（第五航權後段）、或外站成對回程（KXn 到 X → KXn−1 從 X 出發） */
  function succ(f){var L=all(),n=+String(f.code).slice(2),out=[];for(var i=0;i<L.length;i++){var y=L[i];if(!y||y.via||!BUILTIN.has(y)||y.fr!==f.to)continue;
      if(y.code===f.code&&y.to!==f.fr)out.push({f:y,k:'fifth'});else if(!HUB[f.to]&&n>0&&y.code==='KX'+(n-1))out.push({f:y,k:'turn'})}return out}
  var SU=new WeakMap();function succOf(f){var v=SU.get(f);if(!v||v.n!==all().length){v={n:all().length,s:succ(f)};SU.set(f,v)}return v.s}
  function roomOf(s,sd,sx,depth){var sdl=mn(sd.dep),sal=mn(sd.arr),sdd=+sd.dd||0,r=sdl<360?359-sdl:1435-sdl;
    if(sdd===0&&sal>=1080&&sal>sdl)r=Math.min(r,1435-sal);
    if(depth<3){var b0=0,o2=Math.round((tz(s.to)-tz(s.fr))*60);try{b0=blockMin(s.fr,s.to,sd.dep,sd.arr,sdd)}catch(_){b0=0}
      if(b0>0){var la=latest(s,sdl,b0,o2,sx,depth+1,sdl+b0+o2+240);if(la!=null)r=Math.min(r,la-(sdl+b0+o2))}}
    return Math.max(0,r)}
  function latest(f,dep0,blk0,off,sx,depth,want){var aRaw=dep0+blk0+off,locRaw=((aRaw%1440)+1440)%1440,day0=Math.floor(aRaw/1440),SS=succOf(f),lim=null;
    for(var i=0;i<SS.length;i++){var sd=null;try{sd=sx(SS[i].f)}catch(_){sd=null}if(!sd||!sd.dep)continue;var sdl=mn(sd.dep),gR=sdl-locRaw;if(gR<=0||gR>720)continue;
      var nd=SS[i].k==='fifth'?75:minTurn(SS[i].f.acft),base=day0*1440+sdl-nd;
      if(want!=null&&want<=base)continue;   /* 這一班加完還趕得上下一班原本的時刻 → 不用往下查 */
      var v=base+roomOf(SS[i].f,sd,sx,depth);if(lim==null||v<lim)lim=v}
    return lim}
  function minTurn(t){t=typeOf(t);if(t==='A388')return 90;if(/^A2|^A32|^B73|^B38/.test(t))return 60;return 75}   /* 外站最短過站：窄體 60、廣體 75、A388 90 分（再短機隊排班引擎會找不到輪轉、搜尋爆量：實測 45／60 分時開頁卡 400 秒） */
  var LOG={turn:0,fifth:0,cap03:0,push04:0,curfew:0,capMid:0,capSucc:0,midnight:[]};window.KGM_BT_LOG_R1026B=LOG;
  var MEMO=new Map(),MN=0,DEPTH=0;
  /* x＝原始時刻（dep／arr／dd／acft），sea＝'summer'|'winter'，px＝取前一班（加過彈性）時刻的函式 */
  function proj(f,x,win,px,sx){
    var dep0=mn(x.dep),dd0=+x.dd||0,off=Math.round((tz(f.to)-tz(f.fr))*60),blk0=0;
    try{blk0=blockMin(f.fr,f.to,x.dep,x.arr,dd0)}catch(_){blk0=mn(x.arr)+dd0*1440-dep0-off}
    if(!(blk0>0))return null;
    var shift=0,why='';
    var P=DEPTH<6?pred(f):null;
    if(P){DEPTH++;var pp=null;try{pp=px(P.f)}catch(_){pp=null}DEPTH--;
      if(pp&&pp.r&&pp.p){var g0=((dep0-mn(pp.r.arr))%1440+1440)%1440,gf=((dep0-mn(pp.p.arr))%1440+1440)%1440;if(gf>720)gf-=1440;   /* gf：最後的地面時間（負的＝前一班比這一班出發還晚到） */
        var need=P.k==='fifth'?75:minTurn(x.acft||f.acft);   /* 固定值（不看原本的過站），重複套用結果才不會變 */
        if(gf<need&&need-gf<=240){shift=need-gf;why=P.k}}}
    var dep1=dep0+shift,t0=target(f.fr,f.to,x.acft||f.acft,win,dep1,null),t=target(f.fr,f.to,x.acft||f.acft,win,dep1,dep1+t0+off),blk=Math.max(blk0,Math.ceil(t/5)*5);   /* 抵達時段用模型算的抵達（不看原本的輪擋）→ 重複套用結果不變 */
    var a1=dep1+blk+off,loc=((a1%1440)+1440)%1440,aRaw=dep0+blk0+off,locRaw=((aRaw%1440)+1440)%1440;
    if(blk>blk0){
      if(loc>=180&&loc<240){var back=a1-(loc-175);if(back>=aRaw+shift&&(loc-175)<=(240-loc)){a1=back;LOG.cap03++}else{a1=a1+(240-loc);LOG.push04++}}   /* 挪到較近的 02:55 或 04:00（02:55 不能比原本還早到） */
      var cf=CURFEW[f.to];if(cf&&cf[0]>=0){var inC=function(m){m=((m%1440)+1440)%1440;return cf[0]<cf[1]?(m>=cf[0]&&m<cf[1]):(m>=cf[0]||m<cf[1])};
        if(!inC(aRaw)&&inC(a1)){var s=((a1-cf[0])%1440+1440)%1440;if(s>720)s=0;var cap=a1-s-5;a1=Math.max(aRaw+shift,cap);LOG.curfew++}}
      /* 原本傍晚／晚上到的，加了以後不要變成午夜後（00:00–02:59）到 —— 使用者 1019A 逐列審過這個時段，彈性只加到 23:55 */
      var loc2=((a1%1440)+1440)%1440,day0=Math.floor(aRaw/1440),day1=Math.floor(a1/1440);
      if(locRaw>=1080&&day1>day0&&loc2<180){var c2=day0*1440+1435;if(c2>=aRaw+shift){a1=c2;LOG.capMid++}}
      /* 同一架飛機的下一班（第五航權後段、外站回程）只能往後挪到：出發不過午夜（原本 00:00–05:59 的紅眼班不過 06:00 —— 使用者「最早起飛06:00」）、
         原本傍晚／晚上到的抵達不過 23:55；下一班的下一班也一樣（遞迴）→ 這一班的彈性最多加到不會把後面推出界 */
      if(sx){var LA=latest(f,dep0,blk0,off,sx,0,a1);if(LA!=null&&a1>LA){if(LA>=aRaw+shift){a1=LA;LOG.capSucc++}else{a1=aRaw+shift;LOG.tight=(LOG.tight||0)+1}}}
      blk=a1-dep1-off}
    if(shift&&why)LOG[why]++;
    var dd1=Math.floor(a1/1440)-Math.floor(dep1/1440),depS=hm(dep1),depDay=Math.floor(dep1/1440);
    if(depDay>0&&LOG.midnight.length<50&&LOG.midnight.indexOf(f.code+' '+f.fr+f.to)<0)LOG.midnight.push(f.code+' '+f.fr+f.to);
    return {dep:depS,arr:hm(a1),dd:dd1,dur:blk,shift:shift,pad:blk-blk0,depDay:depDay}}
  /* ── 夏季（＝航班表的基本時刻）：航班表本身不改（各層照舊讀寫原始值），加過彈性的時刻一律從季節時刻（kgmSeasonFlightR48）讀 ──
     （1026B 第一版用 getter 讓航班表直接讀到加過的值：會有幾層定時把航班表抄進季節表，季節表變成「一半加過」的值 → 冬季的上限檢查失準，所以不這樣做） */
  function rkey(f){return f.dep+'|'+f.arr+'|'+(+f.dd||0)+'|'+(f.acft||'')}
  function baseProj(f){if(!f||f.via)return null;var c=f.__c26,k=rkey(f);
    if(c&&c.k===k&&(!c.pf||c.pk===(baseOut(c.pf)||{}).arr))return c.p;
    var pf=null,pk=null,p=proj(f,{dep:f.dep,arr:f.arr,dd:f.dd,acft:f.acft},false,function(y){var o=baseOut(y);pf=y;pk=o?o.arr:null;return o?{r:y,p:o}:null},function(y){return y});
    if(!p)p={dep:f.dep,arr:f.arr,dd:+f.dd||0,dur:f.dur,shift:0,pad:0};
    try{if(!c)Object.defineProperty(f,'__c26',{value:null,writable:true,enumerable:false,configurable:true});f.__c26={k:k,p:p,pf:pf,pk:pk}}catch(_){}
    return p}
  function baseOut(y){if(!y||!BUILTIN.has(y))return null;var p=baseProj(y);return p?{dep:p.dep,arr:p.arr,dd:p.dd}:null}
  var VER=1,RAW=0;
  var SNAP=false;window.KGM_BT_LATE_R1026B=0;
  function pinAll(){var L=all();for(var i=0;i<L.length;i++){var f=L[i];if(!f||f.partner||f.codeshare||!/^KX\d+$/.test(String(f.code||'')))continue;
      if(!SNAP)BUILTIN.add(f);else if(!BUILTIN.has(f)&&!f.__lt26){try{Object.defineProperty(f,'__lt26',{value:1})}catch(_){}window.KGM_BT_LATE_R1026B++}}   /* 開頁後才加進來的（後台自建臨時航班）不動 */
    SNAP=true}
  /* 原始時刻有沒有被改（後台航線管理、各層的定值）：每 2 秒比一次航班表＋季節表的指紋，有變就清快取 */
  var GEN=0,GSIG='';function gsig(){var L=all(),s=L.length+';';for(var i=0;i<L.length;i++){var y=L[i];if(y)s+=y.code+y.fr+y.to+y.dep+y.arr+(y.dd||0)+(y.acft||'')+(y.via||'')+','}
    var st='';try{st=JSON.stringify(S.seasonSchedulesR48||{})}catch(_){}var h=0;for(var j=0;j<st.length;j++)h=(h*31+st.charCodeAt(j))|0;return s+'|'+st.length+'|'+h}
  function regen(){var s=gsig();if(s!==GSIG){GSIG=s;GEN++;SMW=new WeakMap();IMW=new WeakMap();SMN=0}}
  pinAll();setInterval(function(){pinAll();regen()},2000);
  function builtinOf(f){if(BUILTIN.has(f))return f;var a=lx().get(f.code+'|'+f.fr+'|'+f.to),c=null;if(!a)return null;for(var i=0;i<a.length;i++){var y=a[i];if(!BUILTIN.has(y))continue;if(!c)c=y;if(y.dep===f.dep)return y}return c}
  /* ── 季節時刻（冬季、以及任何日期）：最外層包裝 —— 原本各層算出來的時刻再套同一套條件 ── */
  var SMW=new WeakMap(),IMW=new WeakMap(),SMN=0;   /* 每一班（航班表那一筆）→（日期＋原始時刻）→ 結果；GEN 變了整個清掉 */
  function cget(W,f,k){var m=W.get(f);return m?m.get(k):undefined}
  function cset(W,f,k,v){var m=W.get(f);if(!m){m=new Map();W.set(f,m)}m.set(k,v);if(++SMN>500000){SMW=new WeakMap();IMW=new WeakMap();SMN=0}}
  var SEAC=new Map();
  function seaProj(o,f,date,x){
    if(!x||!f||!x.dep||!x.arr||f.partner||f.codeshare||!/^KX\d+$/.test(String(f.code||'')))return x;
    var sea=x.seasonR57||x.seasonR48;if(!sea){sea=SEAC.get(date);if(sea===undefined){try{sea=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){sea=''}SEAC.set(date,sea)}}
    var win=sea==='winter';
    if(f.via){var L1=legOf(f.code,f.fr,f.via),L2=legOf(f.code,f.via,f.to);if(!L1||!L2)return x;
      var a=wrap(L1,date);if(!a||!a.dep)return x;var k2=(+a.dd||0),bq=wrap(L2,addDays(date,k2));if(bq&&mn(bq.dep)<mn(a.arr))k2++;var b=k2!==(+a.dd||0)?wrap(L2,addDays(date,k2)):bq;if(!b||!b.arr)return x;   /* 後段用它自己出發那天的時刻 */
      var d0=mn(a.dep),b0=mn(b.dep)+(+a.dd||0)*1440;if(b0<mn(a.arr)+(+a.dd||0)*1440-1)b0+=1440;var aAbs=b0+(+b.dd||0)*1440-mn(b.dep)+mn(b.arr),dd=Math.floor(aAbs/1440)-Math.floor(d0/1440);
      if(a.dep===x.dep&&b.arr===x.arr&&dd===(+x.dd||0))return x;
      var y=Object.assign({},x,{dep:a.dep,arr:b.arr,dd:dd});try{y.dur=blockMin(f.fr,f.to,y.dep,y.arr,dd);y.durStr=durStr(y.dur)}catch(_){}y.blockR1026B=1;return y}
    var B=builtinOf(f);if(!B)return x;f=B;
    /* 快取：同一班同一天通常只有一組原始時刻 → 用日期查，再比原始時刻（不組字串） */
    var m=SMW.get(f),e=m?m.get(date):undefined,dd0=+x.dd||0,ac=x.acft||'';
    if(e&&e.d===x.dep&&e.a===x.arr&&e.dd===dd0&&e.ac===ac&&e.w===win)return e.r?Object.assign({},x,e.r):x;
    var k={d:x.dep,a:x.arr,dd:dd0,ac:ac,w:win,r:null};
    /* 夏季用的就是航班表的基本時刻 → 直接用航班表那一份（同一個結果，不會因為季節表的機型欄位不同而差 5 分） */
    if(!win&&x.dep===f.dep&&x.arr===f.arr&&(+x.dd||0)===(+f.dd||0)){var bp=baseProj(f);if(bp){var add0=(bp.dep!==x.dep||bp.arr!==x.arr||bp.dd!==(+x.dd||0))?{dep:bp.dep,arr:bp.arr,dd:bp.dd,dur:bp.dur,blockR1026B:{pad:bp.pad,shift:bp.shift}}:null;if(add0){try{add0.durStr=durStr(bp.dur)}catch(_){}}
      k.r=add0;cset(SMW,f,date,k);return add0?Object.assign({},x,add0):x}}
    /* 前一班／後一班要用它自己出發的那一天去問（跨夜的前段、隔天走的回程；換季那幾天兩邊季節不同） */
    var dx=mn(x.dep),ax=mn(x.arr),ddx=+x.dd||0;
    var p=proj(f,x,win,function(y){var r0=rawCall(o,y,date);if(!r0)return null;var k=(+r0.dd||0)+(dx<mn(r0.arr)?1:0),dp=k?addDays(date,-k):date;
        var r=k?rawCall(o,y,dp):r0,q=wrap(y,dp);return r&&q?{r:r,p:q}:null},
      function(y){var s0=rawCall(o,y,date);if(!s0)return null;var k=ddx+(mn(s0.dep)<ax?1:0);return k?rawCall(o,y,addDays(date,k)):s0});
    var add=null;if(p&&(p.dep!==x.dep||p.arr!==x.arr||p.dd!==(+x.dd||0))){add={dep:p.dep,arr:p.arr,dd:p.dd,dur:p.dur,blockR1026B:{pad:p.pad,shift:p.shift}};try{add.durStr=durStr(p.dur)}catch(_){}}
    k.r=add;cset(SMW,f,date,k);
    return add?Object.assign({},x,add):x}
  var INNER=null,MINE=null,NW=0,ACT=0;
  function wrap(f,date){try{return window.kgmSeasonFlightR48(f,date)}catch(_){return null}}
  /* 原本那串的結果（整個物件存一份複本；給外面的一律再複製一次，呼叫端改了也不會污染快取）—— 外層包裝與前／後一班的查詢共用，同一班同一天只算一次 */
  function rawFull(o,f,date){var v=cget(IMW,f,date);if(v!==undefined)return v;var x=null;ACT++;try{x=o(f,date)}catch(_){x=null}finally{ACT--}
    v=x?Object.assign({},x):null;cset(IMW,f,date,v);return v}
  function rawCall(o,f,date){var v=rawFull(o,f,date);return v&&v.dep?v:null}
  /* 要在最外層：1023A 冬季風向那層開頁後 0／2／6／12 秒會「不是自己就再包一次」（gen_r26 讓它看到這一層就不包）；
     其他層後來包在外面也一樣再包回來（最多 8 次，避免互包） */
  function install(){var O=window.kgmSeasonFlightR48;if(typeof O!=='function'||O===MINE||NW>=8)return;NW++;INNER=O;
    var w=function(f,date){if(ACT)return O.apply(this,arguments);   /* 裡面那串（含之前裝的這一層）只給原始值，加彈性只做最外面這一次 */
      var x,c=false;if(date&&f&&BUILTIN.has(f)&&arguments.length===2){x=rawFull(O,f,String(date));c=true}else{ACT++;try{x=O.apply(this,arguments)}finally{ACT--}}
      try{if(x&&date){var y=seaProj(O,f,String(date),x);return (c&&y===x)?Object.assign({},x):y}}catch(e){}return c&&x?Object.assign({},x):x};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}
    w.__bt26=1;MINE=w;window.kgmSeasonFlightR48=w;try{kgmSeasonFlightR48=w}catch(_){}window.KGM_BT_WRAPS_R1026B=NW}
  install();setTimeout(install,0);setTimeout(install,3000);setInterval(install,2000);

  /* ── 搜尋結果（sortedFlights）跟季節時刻同一份 ──
     舊問題（1023A 起就有）：訂票頁的航班列另外一條路算時刻 —— 冬季起飛用季節表、抵達卻是起飛＋夏季飛行時間
     （實測 1026A：KX180 冬季搜尋頁 07:05–11:10，航班動態／時刻表 07:05–10:40；KX5 冬季搜尋頁抵達 05:50、航班動態 05:30）。
     最外層把自營航班的起飛／抵達／飛行時間換成 kgmSeasonFlightR48（＝航班動態、時刻表、機隊排班用的那一份）；
     後台對這一班這一天（或全部日期）手動改過時間的照舊用手動值。 */
  function hasOv(f,date){try{var c=typeof getBOV==='function'?getBOV(f.code,f.fr,f.to):null;if(c&&(c.dep||c.arr))return true}catch(_){}
    try{var d=(S.flightDateOverride||{})[f.code+'_'+f.fr+'_'+f.to+'_'+date];if(d&&(d.dep||d.arr))return true}catch(_){}
    try{var s=(S.flightOverrides||{})[f.code+'_'+date];if(s&&(s.dep||s.arr))return true}catch(_){}return false}
  function rowOf(it,date){var a=lx().get(it.code+'|'+it.fr+'|'+it.to);if(!a||!a.length){if(it.via){var L=all();for(var i=0;i<L.length;i++){var y=L[i];if(y&&y.via===it.via&&y.code===it.code&&y.fr===it.fr&&y.to===it.to)return y}}return null}
    if(a.length===1)return a[0];for(var j=0;j<a.length;j++){if(a[j].dep===it.dep)return a[j]}
    for(var k2=0;k2<a.length;k2++){var q=wrap(a[k2],date);if(q&&q.dep===it.dep)return a[k2]}
    for(var k3=0;k3<a.length;k3++){if(JSON.stringify(a[k3].days)===JSON.stringify(it.days))return a[k3]}return a[0]}
  var SFN=0;window.KGM_SF_FIX_R1026B=0;
  function sfInstall(){var O=window.sortedFlights;if(typeof O!=='function'||O.__bt26sf||SFN>=6)return;SFN++;
    var w=function(fr,to,date){var r=O.apply(this,arguments);if(!date||!Array.isArray(r))return r;
      return r.map(function(it){try{if(!it||it.partner||it.codeshare||!/^KX\d+$/.test(String(it.code||''))||it.__lt26||hasOv(it,date))return it;
        var b=it.via?null:rowOf(it,date);if(!it.via&&(!b||!BUILTIN.has(b)))return it;
        var src=b||(function(){var L=all();for(var i=0;i<L.length;i++){var y=L[i];if(y&&y.via&&y.code===it.code&&y.fr===it.fr&&y.to===it.to)return y}return null})();if(!src)return it;
        var q=wrap(src,date);if(!q||!q.dep||(q.dep===it.dep&&q.arr===it.arr&&(+q.dd||0)===(+it.dd||0)))return it;
        var c=Object.assign({},it,{dep:q.dep,arr:q.arr,dd:+q.dd||0});try{c.dur=blockMin(c.fr,c.to,c.dep,c.arr,c.dd);c.durStr=durStr(c.dur)}catch(_){}window.KGM_SF_FIX_R1026B++;return c}catch(_){return it}})};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__bt26sf=1;window.sortedFlights=w;try{sortedFlights=w}catch(_){}}
  sfInstall();setTimeout(sfInstall,0);setTimeout(sfInstall,3000);setInterval(function(){if(window.sortedFlights&&!window.sortedFlights.__bt26sf)sfInstall()},3000);

  /* ── 訂位行程（segs7：我的行程、報到、登機證、艙單）用 kgmApplySeasonR112／kgmSeasonLegR205 —— 這兩支直接讀季節表的原始值，
     沒有 1023A 起的冬季風向、也沒有這一輪的彈性（第三份來源）→ 一樣換成 kgmSeasonFlightR48 的結果 ── */
  function legFix(r,code,fr,to,date){try{if(!r||!r.dep||r.partner||r.codeshare||!/^KX\d+$/.test(String(code||'')))return r;var b=rowOf({code:code,fr:fr,to:to,dep:r.dep,days:r.days},date);if(!b||!BUILTIN.has(b))return r;
      var q=wrap(b,date);if(!q||!q.dep||(q.dep===r.dep&&q.arr===r.arr&&(+q.dd||0)===(+r.dd||0)))return r;
      var c=Object.assign({},r,{dep:q.dep,arr:q.arr,dd:+q.dd||0});try{c.dur=blockMin(fr,to,c.dep,c.arr,c.dd);c.durStr=durStr(c.dur)}catch(_){}return c}catch(_){return r}}
  function lgInstall(){var A=window.kgmApplySeasonR112;if(typeof A==='function'&&!A.__bt26){var wa=function(f,date){var r=A.apply(this,arguments);if(!f||f.via||!date||hasOv(f,date))return r;return legFix(r,f.code,f.fr,f.to,date)};
      try{Object.keys(A).forEach(function(k){if(!(k in wa))wa[k]=A[k]})}catch(_){}wa.__bt26=1;window.kgmApplySeasonR112=wa}
    var Lg=window.kgmSeasonLegR205;if(typeof Lg==='function'&&!Lg.__bt26){var wl=function(code,fr,to,date){var r=Lg.apply(this,arguments);if(!date||hasOv({code:code,fr:fr,to:to},date))return r;return legFix(r,code,fr,to,date)};
      try{Object.keys(Lg).forEach(function(k){if(!(k in wl))wl[k]=Lg[k]})}catch(_){}wl.__bt26=1;window.kgmSeasonLegR205=wl}}
  lgInstall();setTimeout(lgInstall,0);setTimeout(lgInstall,3000);setInterval(lgInstall,5000);
  /* 除錯：不用快取重算一次，回傳每一步 */
  window.kgmBtDebugR1026B=function(code,fr,to,date){var f=legOf(code,fr,to);if(!f||!INNER)return null;var o=INNER,x=rawCall(o,f,date);var tr={x:x};
    var sea=null;try{sea=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){}tr.sea=sea;var P=pred(f);tr.pred=P?[P.f.code,P.f.fr,P.f.to,P.k,JSON.stringify(rawCall(o,P.f,date)),JSON.stringify(wrap(P.f,date))]:null;
    tr.succ=succOf(f).map(function(s){return [s.f.code,s.f.fr,s.f.to,s.k,JSON.stringify(rawCall(o,s.f,date))]});
    var L0=JSON.stringify(LOG);tr.p=proj(f,x,sea==='winter',function(y){var r=rawCall(o,y,date),q=wrap(y,date);return r&&q?{r:r,p:q}:null},function(y){return rawCall(o,y,date)});
    var L1=JSON.parse(JSON.stringify(LOG)),L0p=JSON.parse(L0),d={};Object.keys(L1).forEach(function(k){if(typeof L1[k]==='number'&&L1[k]!==L0p[k])d[k]=L1[k]-(L0p[k]||0)});tr.log=d;tr.out=wrap(f,date);return tr};
  /* 報表：每一段夏／冬原本 → 新的輪擋、往後挪的出發 */
  window.kgmBlockReportR1026B=function(dS,dW){dS=dS||'2027-07-15';dW=dW||'2027-01-15';var out=[];
    all().forEach(function(f){if(!f||f.via||!BUILTIN.has(f))return;[['s',dS],['w',dW]].forEach(function(o){var x=null,r=null;try{x=window.kgmSeasonFlightR48(f,o[1]);r=INNER?INNER(f,o[1]):null}catch(_){}
      if(!x||!r)return;var b0=0,b1=0;try{b0=blockMin(f.fr,f.to,r.dep,r.arr,+r.dd||0);b1=blockMin(f.fr,f.to,x.dep,x.arr,+x.dd||0)}catch(_){}
      out.push({code:f.code,fr:f.fr,to:f.to,sea:o[0],dep0:r.dep,arr0:r.arr,dd0:+r.dd||0,blk0:b0,dep:x.dep,arr:x.arr,dd:+x.dd||0,blk:b1,shift:mn(x.dep)!==mn(r.dep)?(((mn(x.dep)-mn(r.dep))%1440+1440)%1440):0})})});
    return out};
})();

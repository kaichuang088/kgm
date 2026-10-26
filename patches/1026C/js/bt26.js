
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
  var CURFEW={TSA:[1380,360],GMP:[1380,360],NRT:[0,360],SYD:[1320,360],   /* 1026C：使用者「SYD既然有宵禁就要比宵禁提早一小時到」→ 雪梨 23:00 宵禁、加彈性後最晚 21:55 落地 */
    FUK:[1320,420],ITM:[1260,420],FRA:[1380,300],ZRH:[1410,360],ORY:[1410,360],ADL:[1380,360],OOL:[1380,360],BNE:[-1,-1]};
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(n){n=((Math.round(n)%1440)+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)}
  function tz(c){try{var v=TZ[c];return typeof v==='number'?v:8}catch(_){return 8}}
  /* 1026C：夏令時間（使用者：「網站時區表是固定值，歐洲夏令時間的航段顯示飛行時間少 1 小時…要調整」）
     網站的時區表 TZ 是固定值（歐洲、北美是標準時間；雪梨寫成夏令 +11、墨爾本／紐西蘭寫標準時間），
     機隊／組員排班用它算絕對時間（同一站的到、離用同一個值，過站時間不受影響）→ 那張表不動；
     飛行時間（輪擋）一律用這裡依日期算的當地時差：歐盟 3 月最後一個週日～10 月最後一個週日、美加 3 月第二個週日～11 月第一個週日、
     澳洲東南（雪梨、墨爾本、阿德雷德）10 月第一個週日～4 月第一個週日、紐西蘭 9 月最後一個週日～4 月第一個週日（布里斯本、凱恩斯、伯斯、鳳凰城、檀香山沒有夏令時間）。 */
  var DST_EU={LHR:1,LGW:1,MAN:1,EDI:1,DUB:1,AMS:1,BCN:1,BUD:1,CDG:1,ORY:1,NCE:1,FCO:1,MXP:1,LIN:1,VCE:1,FRA:1,MUC:1,BER:1,DUS:1,HAM:1,MAD:1,LIS:1,PRG:1,VIE:1,WAW:1,ZRH:1,GVA:1,BRU:1,CPH:1,ARN:1,OSL:1,ATH:1,HEL:1};
  var DST_US={LAX:1,ONT:1,SFO:1,SJC:1,OAK:1,SAN:1,SEA:1,PDX:1,LAS:1,YVR:1,YYC:1,DEN:1,SLC:1,DFW:1,IAH:1,ORD:1,MSP:1,ATL:1,BOS:1,DTW:1,EWR:1,JFK:1,IAD:1,DCA:1,PHL:1,CLT:1,MCO:1,MIA:1,YYZ:1,YUL:1,ANC:1};
  var DST_AU={SYD:1,MEL:1,ADL:1,CBR:1,HBA:1},DST_NZ={AKL:1,CHC:1,WLG:1,ZQN:1},STD_FIX={SYD:10};
  function sunN(y,m,n){var d=new Date(Date.UTC(y,m-1,1)),w=d.getUTCDay();return 1+((7-w)%7)+(n-1)*7}
  function sunL(y,m){var d=new Date(Date.UTC(y,m,0)),last=d.getUTCDate(),w=d.getUTCDay();return last-w}
  function ymd(y,m,d){return y+'-'+('0'+m).slice(-2)+'-'+('0'+d).slice(-2)}
  var DSTC=new Map();
  function dstOn(ap,date){if(!(DST_EU[ap]||DST_US[ap]||DST_AU[ap]||DST_NZ[ap]))return false;var k=ap+date,v=DSTC.get(k);if(v!==undefined)return v;
    var y=+String(date).slice(0,4),dt=String(date).slice(0,10);
    if(DST_EU[ap])v=dt>=ymd(y,3,sunL(y,3))&&dt<ymd(y,10,sunL(y,10));
    else if(DST_US[ap])v=dt>=ymd(y,3,sunN(y,3,2))&&dt<ymd(y,11,sunN(y,11,1));
    else if(DST_AU[ap])v=!(dt>=ymd(y,4,sunN(y,4,1))&&dt<ymd(y,10,sunN(y,10,1)));
    else v=!(dt>=ymd(y,4,sunN(y,4,1))&&dt<ymd(y,9,sunL(y,9)));
    if(DSTC.size>20000)DSTC.clear();DSTC.set(k,v);return v}
  function tzAt(ap,date){var b=STD_FIX[ap]!=null?STD_FIX[ap]:tz(ap);return date?b+(dstOn(ap,date)?1:0):b}
  window.kgmTzAtR1026C=tzAt;window.kgmDstOnR1026C=dstOn;
  /* 各季的「代表」時差（整季大部分日子的值）：夏季看 7 月中、冬季看 1 月中；跟代表值不同的日子（美加冬季頭一週與最後兩週、澳紐夏季頭尾幾週）逐日另算 */
  function seaDate(win){return win?'2027-01-15':'2027-07-15'}
  function offAt(fr,to,date,dd){return Math.round((tzAt(to,date?addDays(date,+dd||0):null)-tzAt(fr,date))*60)}
  function offSea(fr,to,win){var d=seaDate(win);return Math.round((tzAt(to,d)-tzAt(fr,d))*60)}
  /* 輪擋（分鐘）＝當地時刻相減再扣時差；跟 blockMin 一樣：日差不合理時取最小的正值 */
  function blkOff(dep,arr,dd,off){var d=mn(arr)+(+dd||0)*1440-mn(dep)-off;if(d<=0||d>2880){d=mn(arr)-mn(dep)-off;while(d<=0)d+=1440;while(d>1440*2)d-=1440}return d}
  function blkAt(fr,to,dep,arr,dd,date){return blkOff(dep,arr,dd,offAt(fr,to,date,dd))}
  window.kgmBlockAtR1026C=blkAt;
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
  window.kgmBlockTargetR1026B=function(fr,to,type,win,dep,date){var d=mn(dep),o=date?offAt(fr,to,date,0):offSea(fr,to,win),t0=target(fr,to,type,win,d,null);return Math.ceil(target(fr,to,type,win,d,d+t0+o)/5)*5};
  function own(f){return f&&!f.partner&&!f.codeshare&&!f.customR1025B&&!f.customR1023A&&/^KX\d+$/.test(String(f.code||''))&&BUILTIN.has(f)}
  var BUILTIN=new WeakSet();
  function all(){try{return FLIGHTS}catch(_){return []}}
  var LX=null,LXN=-1,LXG=-1;function lx(){var L=all();if(!LX||LXN!==L.length||LXG!==GEN){LX=new Map();LXN=L.length;LXG=GEN;for(var i=0;i<L.length;i++){var y=L[i];if(!y||y.via)continue;var k=y.code+'|'+y.fr+'|'+y.to,a=LX.get(k);if(!a)LX.set(k,a=[]);a.push(y)}}return LX}
  function legOf(code,fr,to){var a=lx().get(code+'|'+fr+'|'+to);return a?a[0]:null}
  var PI=null,PN=-1;   /* 前一班索引：同班號抵達這一站的那一段（第五航權前段）、或成對班號（KXn 到外站 → KXn−1 從外站出發） */
  /* 1026C：同一個班號有冬夏不同航點（例：KX51 冬季基督城、夏季奧克蘭）→ 挑這一天（或前一天）真的有飛的那一段 */
  var FLY=new Map();function flies(y,date){if(!date)return true;var k=date,m=FLY.get(y);if(!m){m=new Map();FLY.set(y,m)}var v=m.get(k);if(v!==undefined)return v;
    v=true;try{if(typeof flyOn==='function'){var d0=new Date(date+'T00:00:00');v=!!(flyOn(y,d0)||((+y.dd||0)>0&&flyOn(y,new Date(d0.getTime()-86400000))))}}catch(_){v=true}m.set(k,v);return v}   /* 前一天出發的只有跨夜班（dd>0）才算 */
  function pick(a,date){if(!a.length)return null;if(!date||a.length===1)return a[0];for(var i=0;i<a.length;i++)if(flies(a[i],date))return a[i];return a[0]}
  function pred(f,date){var L=all();if(!PI||PN!==L.length){PI={};PN=L.length;L.forEach(function(y){if(y&&!y.via&&own(y))(PI[y.code+'>'+y.to]=PI[y.code+'>'+y.to]||[]).push(y)})}
    var same=pick((PI[f.code+'>'+f.fr]||[]).filter(function(y){return y.fr!==f.to}),date);if(same)return {f:same,k:'fifth'};
    if(HUB[f.fr])return null;var n=+String(f.code).slice(2);if(!(n>0))return null;
    /* 1026C：外站來回（KXn+1 從 A 飛到這一站、KXn 飛回 A，例：雪梨→奧克蘭→雪梨、曼谷→法蘭克福→曼谷）也是同一架飛機，過站一樣要檢查（1026B 漏掉這種） */
    var o=pick((PI['KX'+(n+1)+'>'+f.fr]||[]),date);return o?{f:o,k:'turn'}:null}
  /* 後一班：同班號從這一站出發的下一段（第五航權後段）、或外站成對回程（KXn 到 X → KXn−1 從 X 出發） */
  function succ(f){var L=all(),n=+String(f.code).slice(2),out=[];for(var i=0;i<L.length;i++){var y=L[i];if(!y||y.via||!BUILTIN.has(y)||y.fr!==f.to)continue;
      if(y.code===f.code&&y.to!==f.fr)out.push({f:y,k:'fifth'});else if(!HUB[f.to]&&n>0&&y.code==='KX'+(n-1))out.push({f:y,k:'turn'})}return out}
  var SU=new WeakMap();function succOf(f){var v=SU.get(f);if(!v||v.n!==all().length){v={n:all().length,s:succ(f)};SU.set(f,v)}return v.s}
  function roomOf(s,sd,sx,depth,win,dt){var sdl=mn(sd.dep),sal=mn(sd.arr),sdd=+sd.dd||0,r=sdl<360?359-sdl:1435-sdl;
    if(sdd===0&&sal>=1080&&sal>sdl)r=Math.min(r,1435-sal);
    if(depth<3){var o2=offSea(s.fr,s.to,win),b0=blkOff(sd.dep,sd.arr,sdd,o2);
      if(b0>0){var la=latest(s,sdl,b0,o2,sx,depth+1,sdl+b0+o2+240,win,dt);if(la!=null)r=Math.min(r,la-(sdl+b0+o2))}}
    return Math.max(0,r)}
  function latest(f,dep0,blk0,off,sx,depth,want,win,dt){var aRaw=dep0+blk0+off,locRaw=((aRaw%1440)+1440)%1440,day0=Math.floor(aRaw/1440),SS=succOf(f),lim=null;
    for(var i=0;i<SS.length;i++){if(!flies(SS[i].f,dt))continue;var sd=null;try{sd=sx(SS[i].f)}catch(_){sd=null}if(!sd||!sd.dep)continue;var sdl=mn(sd.dep),gR=sdl-locRaw;if(gR<=0||gR>720)continue;
      var nd=SS[i].k==='fifth'?75:minTurn(SS[i].f.acft),base=day0*1440+sdl-nd;
      if(want!=null&&want<=base)continue;   /* 這一班加完還趕得上下一班原本的時刻 → 不用往下查 */
      var v=base+roomOf(SS[i].f,sd,sx,depth,win,dt);if(lim==null||v<lim)lim=v}
    return lim}
  function minTurn(t){t=typeOf(t);if(t==='A388')return 90;if(/^A2|^A32|^B73|^B38/.test(t))return 60;return 75}   /* 外站最短過站：窄體 60、廣體 75、A388 90 分（再短機隊排班引擎會找不到輪轉、搜尋爆量：實測 45／60 分時開頁卡 400 秒） */
  var LOG={turn:0,fifth:0,cap03:0,push04:0,curfew:0,capMid:0,capSucc:0,midnight:[]};window.KGM_BT_LOG_R1026B=LOG;
  var MEMO=new Map(),MN=0,DEPTH=0;
  /* x＝原始時刻（dep／arr／dd／acft），sea＝'summer'|'winter'，px＝取前一班（加過彈性）時刻的函式 */
  /* 1026C：照實際時差算完，有 32 段（航班×季）因為「出發不提前」＋「不新增 00:00–02:59 抵達」／後面接的班卡住，飛行時間比估算短 15 分以上
     （例：KX51 雪梨→台北夏季 19:25–23:55 只有 6h30）。使用者：「這幾班出發可以提前」→ 只有這幾班（含同一架飛機前面接著的班）出發提前，
     提前到抵達時間不變、飛行時間補到估算值；不早於 06:00。定值（/tmp/j/early27.js 在 EARLY27 清空的版本上算出來；前一班含外站來回那一段。KX52／KX51 大洋洲一圈（台北→雪梨→奧克蘭／基督城→雪梨→台北）手算：每站過站 75 分、雪梨宵禁 06:00 後才落地、台北 23:55 前到；換季那一週基督城／奧克蘭兩段跟另一季重疊（3 月底、10 月底），用另一季同一組值；季節時刻的修正一律寫定值） */
  /* KX8 台北→底特律冬季 00:15 起飛（紅眼班）不能再提前（會變成前一天起飛、營運日跟著變）→ 只有這一段改成可以過午夜抵達（底特律沒有宵禁） */
  var NOMID27={'KX8|TPE|DTW|w':1};
  var EARLY27={"KX52|TPE|SYD|s":"18:45","KX52|SYD|AKL|s":"07:15","KX51|AKL|SYD|s":"14:00","KX51|SYD|TPE|s":"16:50","KX8|TPE|DTW|s":"21:40","KX52|TPE|SYD|w":"18:35","KX52|SYD|CHC|w":"08:00","KX51|CHC|SYD|w":"14:45","KX51|SYD|TPE|w":"17:35","KX66|TPE|AUH|s":"18:40","KX60|TPE|KUL|w":"06:00","KX60|KUL|MEL|w":"11:55","KX53|PER|MEL|w":"16:20","KX290|TPE|SIN|w":"19:00","KX288|TPE|SGN|s":"21:20","KX334|TPE|SZX|w":"18:45","KX208|TPE|KTI|s":"15:20","KX207|KTI|TPE|s":"19:20","KX316|TPE|CKG|s":"17:05","KX315|CKG|TPE|s":"21:10","KX254|TPE|MNL|w":"17:55","KX253|MNL|TPE|w":"21:30","KX310|TPE|PVG|s":"19:15","KX309|PVG|TPE|s":"22:10","KX333|SZX|TPE|w":"22:05","KX282|TPE|SIN|s":"13:10","KX55|AKL|TPE|s":"16:55","KX170|TPE|FUK|w":"18:20","KX398|TPE|PEK|s":"16:40","KX397|PEK|TPE|s":"21:00","KX310|TPE|PVG|w":"19:05","KX309|PVG|TPE|w":"22:10","KX316|TPE|CKG|w":"17:00","KX315|CKG|TPE|w":"21:15","KX281|SIN|TPE|s":"19:15","KX266|TPE|CNX|s":"20:50","KX208|TPE|KTI|w":"15:20","KX207|KTI|TPE|w":"19:25","KX62|TPE|BKK|w":"20:55","KX98|TPE|HEL|s":"18:45","KX52|SYD|CHC|s":"08:00","KX51|CHC|SYD|s":"14:45","KX52|SYD|AKL|w":"07:15","KX51|AKL|SYD|w":"14:00"};
  function proj(f,x,win,px,sx,date){
    var dep0=mn(x.dep),dd0=+x.dd||0,off=date?offAt(f.fr,f.to,date,dd0):offSea(f.fr,f.to,win),blk0=blkOff(x.dep,x.arr,dd0,off);   /* 1026C：時差依日期（夏令時間） */
    if(!(blk0>0))return null;
    var ek=EARLY27[f.code+'|'+f.fr+'|'+f.to+'|'+(win?'w':'s')],depE=dep0;if(ek){var em=mn(ek);if(em>=360&&em<dep0&&dep0-em<=240)depE=em}
    var shift=0,why='';
    var dt=date||seaDate(win),P=DEPTH<6?pred(f,dt):null;
    if(P){DEPTH++;var pp=null;try{pp=px(P.f)}catch(_){pp=null}DEPTH--;
      if(pp&&pp.r&&pp.p){var g0=((depE-mn(pp.r.arr))%1440+1440)%1440,gf=((depE-mn(pp.p.arr))%1440+1440)%1440;if(gf>720)gf-=1440;   /* gf：最後的地面時間（負的＝前一班比這一班出發還晚到） */
        var need=P.k==='fifth'?75:minTurn(x.acft||f.acft);   /* 固定值（不看原本的過站），重複套用結果才不會變 */
        if(gf<need&&need-gf<=240){shift=need-gf;why=P.k}}}
    var dep1=depE+shift,t0=target(f.fr,f.to,x.acft||f.acft,win,dep1,null),t=target(f.fr,f.to,x.acft||f.acft,win,dep1,dep1+t0+off),blk=Math.max(blk0,Math.ceil(t/5)*5);   /* 抵達時段用模型算的抵達（不看原本的輪擋）→ 重複套用結果不變 */
    var a1=dep1+blk+off,loc=((a1%1440)+1440)%1440,aRaw=dep0+blk0+off,locRaw=((aRaw%1440)+1440)%1440,aMin=dep1+blk0+off;   /* aMin：照原本輪擋飛、最早的抵達（出發提前的班會比原本早到） */
    if(blk>blk0){
      if(loc>=180&&loc<240){var back=a1-(loc-175);if(back>=aMin&&(loc-175)<=(240-loc)){a1=back;LOG.cap03++}else{a1=a1+(240-loc);LOG.push04++}}   /* 挪到較近的 02:55 或 04:00（02:55 不能比原本還早到） */
      var cf=CURFEW[f.to];if(cf&&cf[0]>=0){var inC=function(m){m=((m%1440)+1440)%1440;return cf[0]<cf[1]?(m>=cf[0]&&m<cf[1]):(m>=cf[0]||m<cf[1])};
        if(!inC(aRaw)&&inC(a1)){var s=((a1-cf[0])%1440+1440)%1440;if(s>720)s=0;var cap=a1-s-5;a1=Math.max(aMin,cap);LOG.curfew++}}
      /* 原本傍晚／晚上到的，加了以後不要變成午夜後（00:00–02:59）到 —— 使用者 1019A 逐列審過這個時段，彈性只加到 23:55 */
      var loc2=((a1%1440)+1440)%1440,day0=Math.floor(aRaw/1440),day1=Math.floor(a1/1440);
      if(locRaw>=1080&&day1>day0&&loc2<180&&!NOMID27[f.code+'|'+f.fr+'|'+f.to+'|'+(win?'w':'s')]){var c2=day0*1440+1435;if(c2>=aMin){a1=c2;LOG.capMid++}}
      /* 同一架飛機的下一班（第五航權後段、外站回程）只能往後挪到：出發不過午夜（原本 00:00–05:59 的紅眼班不過 06:00 —— 使用者「最早起飛06:00」）、
         原本傍晚／晚上到的抵達不過 23:55；下一班的下一班也一樣（遞迴）→ 這一班的彈性最多加到不會把後面推出界 */
      if(sx){var LA=latest(f,dep0,blk0,off,sx,0,a1,win,dt);if(LA!=null&&a1>LA){if(LA>=aMin){a1=LA;LOG.capSucc++}else{a1=aMin;LOG.tight=(LOG.tight||0)+1}}}
      blk=a1-dep1-off}
    /* 夏令時間跟整季代表值不同的那幾週（美加冬季頭一週與最後兩週、澳紐夏季頭尾幾週）：照上面算完仍比估算短 10 分以上 → 同一個原則，
       抵達不變、出發提前（不早於 06:00、不早於前一班到站＋最短過站） */
    if(date&&off!==offSea(f.fr,f.to,win)){var tw=Math.ceil(t/5)*5;if(blk<tw-10){var room=dep1-360;
        if(P&&pp&&pp.p){var nd3=P.k==='fifth'?75:minTurn(x.acft||f.acft),g3=((dep1-mn(pp.p.arr))%1440+1440)%1440;if(g3>720)g3-=1440;room=Math.min(room,g3-nd3)}
        var mv=Math.min(tw-blk,room);if(mv>=5){mv=Math.floor(mv/5)*5;dep1-=mv;blk+=mv;LOG.dstEarly=(LOG.dstEarly||0)+1}}}
    if(shift&&why)LOG[why]++;if(depE<dep0)LOG.early27=(LOG.early27||0)+1;
    var dd1=Math.floor(a1/1440)-Math.floor(dep1/1440),depS=hm(dep1),depDay=Math.floor(dep1/1440);
    if(depDay>0&&LOG.midnight.length<50&&LOG.midnight.indexOf(f.code+' '+f.fr+f.to)<0)LOG.midnight.push(f.code+' '+f.fr+f.to);
    return {dep:depS,arr:hm(a1),dd:dd1,dur:blk,shift:shift,pad:blk-blk0,depDay:depDay}}
  /* ── 夏季（＝航班表的基本時刻）：航班表本身不改（各層照舊讀寫原始值），加過彈性的時刻一律從季節時刻（kgmSeasonFlightR48）讀 ──
     （1026B 第一版用 getter 讓航班表直接讀到加過的值：會有幾層定時把航班表抄進季節表，季節表變成「一半加過」的值 → 冬季的上限檢查失準，所以不這樣做） */
  function rkey(f){return f.dep+'|'+f.arr+'|'+(+f.dd||0)+'|'+(f.acft||'')}
  function baseProj(f){if(!f||f.via)return null;var c=f.__c26,k=rkey(f);
    if(c&&c.k===k&&(!c.pf||c.pk===(baseOut(c.pf)||{}).arr))return c.p;
    var pf=null,pk=null,p=proj(f,{dep:f.dep,arr:f.arr,dd:f.dd,acft:f.acft},false,function(y){var o=baseOut(y);pf=y;pk=o?o.arr:null;return o?{r:y,p:o}:null},function(y){return y});
    if(!p)p={dep:f.dep,arr:f.arr,dd:+f.dd||0,dur:blkOff(f.dep,f.arr,+f.dd||0,offSea(f.fr,f.to,false)),shift:0,pad:0};
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
  /* 1026C：飛行時間欄位（dur／durStr，畫面都讀這兩個）一律用依日期的時差重算；時刻本身不動 */
  function withDur(f,date,x){if(!x||!x.dep||!x.arr||!f)return x;var d=0;try{d=blkAt(f.fr,f.to,x.dep,x.arr,+x.dd||0,date)}catch(_){return x}
    if(!(d>0)||d===x.dur)return x;var y=Object.assign({},x,{dur:d});try{y.durStr=durStr(d)}catch(_){}return y}
  function seaProj(o,f,date,x){
    if(x&&f&&x.dep&&x.arr&&(f.partner||f.codeshare))return withDur(f,date,x);   /* 夥伴營運（例：澳航國內聯營）時刻不動、飛行時間照實際時差 */
    if(!x||!f||!x.dep||!x.arr||f.partner||f.codeshare||!/^KX\d+$/.test(String(f.code||'')))return x;
    var sea=x.seasonR57||x.seasonR48;if(!sea){sea=SEAC.get(date);if(sea===undefined){try{sea=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){sea=''}SEAC.set(date,sea)}}
    var win=sea==='winter';
    if(f.via){var L1=legOf(f.code,f.fr,f.via),L2=legOf(f.code,f.via,f.to);if(!L1||!L2)return x;
      var a=wrap(L1,date);if(!a||!a.dep)return x;var k2=(+a.dd||0),bq=wrap(L2,addDays(date,k2));if(bq&&mn(bq.dep)<mn(a.arr))k2++;var b=k2!==(+a.dd||0)?wrap(L2,addDays(date,k2)):bq;if(!b||!b.arr)return x;   /* 後段用它自己出發那天的時刻 */
      var d0=mn(a.dep),b0=mn(b.dep)+(+a.dd||0)*1440;if(b0<mn(a.arr)+(+a.dd||0)*1440-1)b0+=1440;var aAbs=b0+(+b.dd||0)*1440-mn(b.dep)+mn(b.arr),dd=Math.floor(aAbs/1440)-Math.floor(d0/1440);
      if(a.dep===x.dep&&b.arr===x.arr&&dd===(+x.dd||0))return withDur(f,date,x);
      var y=Object.assign({},x,{dep:a.dep,arr:b.arr,dd:dd});try{y.dur=blkAt(f.fr,f.to,y.dep,y.arr,dd,date);y.durStr=durStr(y.dur)}catch(_){}y.blockR1026B=1;return y}
    var B=builtinOf(f);if(!B)return withDur(f,date,x);f=B;
    /* 快取：同一班同一天通常只有一組原始時刻 → 用日期查，再比原始時刻（不組字串） */
    var m=SMW.get(f),e=m?m.get(date):undefined,dd0=+x.dd||0,ac=x.acft||'';
    if(e&&e.d===x.dep&&e.a===x.arr&&e.dd===dd0&&e.ac===ac&&e.w===win&&e.xd===x.dur)return e.r?Object.assign({},x,e.r):x;
    var k={d:x.dep,a:x.arr,dd:dd0,ac:ac,w:win,xd:x.dur,r:null};
    /* 這一天的時差跟整季代表值一樣才能用整季共用的結果（夏季：航班表那一份）；不一樣的日子逐日算 */
    var sameOff=offAt(f.fr,f.to,date,dd0)===offSea(f.fr,f.to,win);
    /* 前一班（同一架飛機）那幾天的時差跟代表值不同（例：台北→雪梨在澳洲夏令時間晚 1 小時到）→ 這一班也要逐日算，不能用整季共用的結果 */
    if(sameOff){var P0=pred(f,date);if(P0){var pq=P0.f,dm=addDays(date,-1);if(offAt(pq.fr,pq.to,date,0)!==offSea(pq.fr,pq.to,win)||offAt(pq.fr,pq.to,dm,0)!==offSea(pq.fr,pq.to,win))sameOff=false}}
    /* 夏季用的就是航班表的基本時刻 → 直接用航班表那一份（同一個結果，不會因為季節表的機型欄位不同而差 5 分） */
    if(sameOff&&!win&&x.dep===f.dep&&x.arr===f.arr&&(+x.dd||0)===(+f.dd||0)){var bp=baseProj(f);if(bp){var add0=(bp.dep!==x.dep||bp.arr!==x.arr||bp.dd!==(+x.dd||0)||bp.dur!==x.dur)?{dep:bp.dep,arr:bp.arr,dd:bp.dd,dur:bp.dur,blockR1026B:{pad:bp.pad,shift:bp.shift}}:null;if(add0){try{add0.durStr=durStr(bp.dur)}catch(_){}}
      k.r=add0;cset(SMW,f,date,k);return add0?Object.assign({},x,add0):x}}
    /* 前一班／後一班要用它自己出發的那一天去問（跨夜的前段、隔天走的回程；換季那幾天兩邊季節不同） */
    var dx=mn(x.dep),ax=mn(x.arr),ddx=+x.dd||0;
    var p=proj(f,x,win,function(y){var r0=rawCall(o,y,date);if(!r0)return null;var k=(+r0.dd||0)+(dx<mn(r0.arr)?1:0),dp=k?addDays(date,-k):date;
        var r=k?rawCall(o,y,dp):r0,q=wrap(y,dp);return r&&q?{r:r,p:q}:null},
      function(y){var s0=rawCall(o,y,date);if(!s0)return null;var k=ddx+(mn(s0.dep)<ax?1:0);return k?rawCall(o,y,addDays(date,k)):s0},date);
    var add=null;if(p&&(p.dep!==x.dep||p.arr!==x.arr||p.dd!==(+x.dd||0)||p.dur!==x.dur)){add={dep:p.dep,arr:p.arr,dd:p.dd,dur:p.dur,blockR1026B:{pad:p.pad,shift:p.shift}};try{add.durStr=durStr(p.dur)}catch(_){}}
    if(!add){var wd=withDur(f,date,x);if(wd!==x)add={dur:wd.dur,durStr:wd.durStr}}
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
    try{var d=(S.flightDateOverride||{})[f.code+'_'+f.fr+'_'+f.to+'_'+date];if(d&&(d.dep||d.arr)&&(!d.predictionUpdatedAt||d.manual))return true}catch(_){}   /* 1026C：天氣預測寫進來的預估時刻不是人工改的 */
    try{var s=(S.flightOverrides||{})[f.code+'_'+date];if(s&&(s.dep||s.arr))return true}catch(_){}return false}
  function rowOf(it,date){var a=lx().get(it.code+'|'+it.fr+'|'+it.to);if(!a||!a.length){if(it.via){var L=all();for(var i=0;i<L.length;i++){var y=L[i];if(y&&y.via===it.via&&y.code===it.code&&y.fr===it.fr&&y.to===it.to)return y}}return null}
    if(a.length===1)return a[0];for(var j=0;j<a.length;j++){if(a[j].dep===it.dep)return a[j]}
    for(var k2=0;k2<a.length;k2++){var q=wrap(a[k2],date);if(q&&q.dep===it.dep)return a[k2]}
    for(var k3=0;k3<a.length;k3++){if(JSON.stringify(a[k3].days)===JSON.stringify(it.days))return a[k3]}return a[0]}
  var SFN=0;window.KGM_SF_FIX_R1026B=0;
  function sfInstall(){var O=window.sortedFlights;if(typeof O!=='function'||O.__bt26sf||SFN>=6)return;SFN++;
    var w=function(fr,to,date){var r=O.apply(this,arguments);if(!date||!Array.isArray(r))return r;
      return r.map(function(it){try{if(it&&(it.partner||it.codeshare)&&!hasOv(it,date))return withDur(it,date,it);   /* 1026C：夥伴營運飛行時間照實際時差 */
        if(!it||it.partner||it.codeshare||!/^KX\d+$/.test(String(it.code||''))||it.__lt26||hasOv(it,date))return it;
        var b=it.via?null:rowOf(it,date);if(!it.via&&(!b||!BUILTIN.has(b)))return it;
        var src=b||(function(){var L=all();for(var i=0;i<L.length;i++){var y=L[i];if(y&&y.via&&y.code===it.code&&y.fr===it.fr&&y.to===it.to)return y}return null})();if(!src)return it;
        var q=wrap(src,date);if(!q||!q.dep||(q.dep===it.dep&&q.arr===it.arr&&(+q.dd||0)===(+it.dd||0)&&(!q.dur||q.dur===it.dur)))return it;
        var c=Object.assign({},it,{dep:q.dep,arr:q.arr,dd:+q.dd||0});try{c.dur=q.dur||blkAt(c.fr,c.to,c.dep,c.arr,c.dd,date);c.durStr=durStr(c.dur)}catch(_){}window.KGM_SF_FIX_R1026B++;return c}catch(_){return it}})};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__bt26sf=1;window.sortedFlights=w;try{sortedFlights=w}catch(_){}}
  sfInstall();setTimeout(sfInstall,0);setTimeout(sfInstall,3000);setInterval(function(){if(window.sortedFlights&&!window.sortedFlights.__bt26sf)sfInstall()},3000);

  /* ── 訂位行程（segs7：我的行程、報到、登機證、艙單）用 kgmApplySeasonR112／kgmSeasonLegR205 —— 這兩支直接讀季節表的原始值，
     沒有 1023A 起的冬季風向、也沒有這一輪的彈性（第三份來源）→ 一樣換成 kgmSeasonFlightR48 的結果 ── */
  function legFix(r,code,fr,to,date){try{if(!r||!r.dep||r.partner||r.codeshare||!/^KX\d+$/.test(String(code||'')))return r;var b=rowOf({code:code,fr:fr,to:to,dep:r.dep,days:r.days},date);if(!b||!BUILTIN.has(b))return r;
      var q=wrap(b,date);if(!q||!q.dep||(q.dep===r.dep&&q.arr===r.arr&&(+q.dd||0)===(+r.dd||0)&&(!q.dur||q.dur===r.dur)))return r;
      var c=Object.assign({},r,{dep:q.dep,arr:q.arr,dd:+q.dd||0});try{c.dur=q.dur||blkAt(fr,to,c.dep,c.arr,c.dd,date);c.durStr=durStr(c.dur)}catch(_){}return c}catch(_){return r}}
  function lgInstall(){var A=window.kgmApplySeasonR112;if(typeof A==='function'&&!A.__bt26){var wa=function(f,date){var r=A.apply(this,arguments);if(!f||f.via||!date||hasOv(f,date))return r;return legFix(r,f.code,f.fr,f.to,date)};
      try{Object.keys(A).forEach(function(k){if(!(k in wa))wa[k]=A[k]})}catch(_){}wa.__bt26=1;window.kgmApplySeasonR112=wa}
    var Lg=window.kgmSeasonLegR205;if(typeof Lg==='function'&&!Lg.__bt26){var wl=function(code,fr,to,date){var r=Lg.apply(this,arguments);if(!date||hasOv({code:code,fr:fr,to:to},date))return r;return legFix(r,code,fr,to,date)};
      try{Object.keys(Lg).forEach(function(k){if(!(k in wl))wl[k]=Lg[k]})}catch(_){}wl.__bt26=1;window.kgmSeasonLegR205=wl}}
  lgInstall();setTimeout(lgInstall,0);setTimeout(lgInstall,3000);setInterval(lgInstall,5000);
  /* 除錯：不用快取重算一次，回傳每一步 */
  window.kgmBtDebugR1026B=function(code,fr,to,date){var f=legOf(code,fr,to);if(!f||!INNER)return null;var o=INNER,x=rawCall(o,f,date);var tr={x:x};
    var sea=null;try{sea=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){}tr.sea=sea;var P=pred(f,date);tr.pred=P?[P.f.code,P.f.fr,P.f.to,P.k,JSON.stringify(rawCall(o,P.f,date)),JSON.stringify(wrap(P.f,date))]:null;
    tr.succ=succOf(f).filter(function(s){return flies(s.f,date)}).map(function(s){return [s.f.code,s.f.fr,s.f.to,s.k,JSON.stringify(rawCall(o,s.f,date))]});
    var L0=JSON.stringify(LOG);tr.p=proj(f,x,sea==='winter',function(y){var r=rawCall(o,y,date),q=wrap(y,date);return r&&q?{r:r,p:q}:null},function(y){return rawCall(o,y,date)},date);
    var L1=JSON.parse(JSON.stringify(LOG)),L0p=JSON.parse(L0),d={};Object.keys(L1).forEach(function(k){if(typeof L1[k]==='number'&&L1[k]!==L0p[k])d[k]=L1[k]-(L0p[k]||0)});tr.log=d;tr.out=wrap(f,date);return tr};
  /* 報表：每一段夏／冬原本 → 新的輪擋、往後挪的出發 */
  window.kgmBlockReportR1026B=function(dS,dW){dS=dS||'2027-07-15';dW=dW||'2027-01-15';var out=[];
    all().forEach(function(f){if(!f||f.via||!BUILTIN.has(f))return;[['s',dS],['w',dW]].forEach(function(o){var x=null,r=null;try{x=window.kgmSeasonFlightR48(f,o[1]);r=INNER?INNER(f,o[1]):null}catch(_){}
      if(!x||!r)return;var b0=0,b1=0;try{b0=blockMin(f.fr,f.to,r.dep,r.arr,+r.dd||0);b1=x.dur||blkAt(f.fr,f.to,x.dep,x.arr,+x.dd||0,o[1])}catch(_){}
      out.push({code:f.code,fr:f.fr,to:f.to,sea:o[0],dep0:r.dep,arr0:r.arr,dd0:+r.dd||0,blk0:b0,dep:x.dep,arr:x.arr,dd:+x.dd||0,blk:b1,shift:mn(x.dep)!==mn(r.dep)?(((mn(x.dep)-mn(r.dep))%1440+1440)%1440):0})})});
    return out};
})();

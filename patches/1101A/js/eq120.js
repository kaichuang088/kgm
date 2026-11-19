/* ══ 1120A L6（使用者：「我覺得很多機型分配不平均欸，這個這麼空A339這麼忙」）＋L4（圖三／四飛機排班 12 月大多「備勤／當日無勤務」）══
   實測（w5，整年機隊排班做完，2026-12／2027-05）：
     A339R 15 架 每架每天 3.74 段、在台北閒置 0%；A21N 1%、B78X 2%；
     B789 30 架 每天約 1.0 段、在台北整天沒班 30～33% 的日子；B779 46 架 26～33%；A359 24 架 28～30%；A388 33～41%（最差的一架一個月 15 天停在台北）。
   原因：香港／澳門／馬尼拉／沖繩這些 EQV 航線（L5 已全數改 EQV），r214 把「飛得到的全部機型」都勾進輪替池，
         實際幾乎都落到 A339R（同一週 7 班有 5～7 班是 A339R），停在台北的 B789／B779／A359 一班也拿不到。
   改：台北（松山）出發、3,500 公里以內、班號只有這一段的 EQV 航線，輪替池預設改成「目前最閒的廣體」B789／B779／A359
       （照 r198 的航程／機場限制過濾；跟航線管理 EQV 勾選同一份 S.eqvPoolR198，之後在航線管理改勾照樣有效）。
       只在第一次套用（store[key].bal120），使用者之後自己改的不會被蓋回來；1120A 起 EQV 勾選會存檔（kgm120_eqvpool）。
       在載入時同步套用：要趕在開頁機隊排班之前（r214 1.8 秒才補空的那幾條）。 */
(function(){
  if(window.__eq120)return;window.__eq120=1;
  var WANT=['B789','B779','A359'];   /* 三型都放（目前最閒的廣體）；只放 B779 實測 A35K 長程 KX55 整年沒飛機（120 班），不採用 */
  function apply(){try{
    var st=window.kgmEqvPoolStoreR198&&window.kgmEqvPoolStoreR198(),opt=window.kgmEqvOptionsR198,key=window.kgmEqvKeyR214;
    if(!st||typeof opt!=='function'||typeof key!=='function')return -1;
    var all=[].concat(typeof FLIGHTS!=='undefined'?FLIGHTS:[],S.customFlights||[]).filter(function(f){return f&&!f.partner});
    var rows={};all.forEach(function(f){(rows[f.code]=rows[f.code]||[]).push(f)});
    var n=0,list=[];
    all.forEach(function(f){
      if(String(f.acft||'')!=='EQV'||f.via||f.createdR1120A)return;
      if(f.code==='KX356'||f.code==='KX355')return;   /* cx38 A35K 短程輪流用的香港這一組（原始碼舊班號，建置時跟 cx38 一起換號）不動：放進來會讓 A35K 長程（KX55／KX36）有班沒飛機 */
      if(!(/^(TPE|TSA)$/.test(f.fr)||/^(TPE|TSA)$/.test(f.to)))return;
      var routes={};(rows[f.code]||[]).forEach(function(x){routes[[x.fr,x.to].sort().join('-')]=1});if(Object.keys(routes).length>1)return;   /* 同班號還有別段（例如 KX305 TPE→PVG→DOH）不動 */
      var km=0;try{km=+distOf(f.fr,f.to)||0}catch(_){}if(!km||km>3500)return;
      var k=key(f.code,f.fr,f.to),o=st[k]=st[k]||{};if(o.bal120)return;
      var ok=(opt(f.fr,f.to)||[]).filter(function(x){return x.ok}).map(function(x){return x.type}),pool=WANT.filter(function(t){return ok.indexOf(t)>=0});
      if(!pool.length)return;
      o.summer=pool.slice();o.winter=pool.slice();o.bal120=1;n++;list.push(f.code+' '+f.fr+'-'+f.to)});
    if(n||!window.KGM_EQ120)window.KGM_EQ120={applied:n,list:list};
    if(n){try{save()}catch(_){}}
    return n}catch(e){try{console.warn('eq120',e)}catch(_){}return -1}}
  apply();setTimeout(apply,1500);
  /* 只改池子不夠：EQV 航班實際機型是 r79 的 kgmEqvPlanR79（短程固定權重 A339R／A339L×5、B78X／A21N×2）決定，不看 r198 的池子
     （r198 只改了 _eqvTypeFor）。→ 最外層包 kgmEqvPlanR79：只有上面標了 bal120 的航線改讀 r198 的池子（去回同型、依日期雜湊，同一份 _eqvTypeFor），
     其他 EQV 航線完全照舊。 */
  var REC=null;function rec(code){if(!REC){REC={};[].concat(typeof FLIGHTS!=='undefined'?FLIGHTS:[],S.customFlights||[]).forEach(function(f){if(f&&!f.partner&&!f.via&&!REC[f.code])REC[f.code]=f})}return REC[code]||null}
  function wrap(){var O=window.kgmEqvPlanR79;if(typeof O!=='function'||O.__eq120)return;
    var w=function(code,date){try{var f=rec(code),st=window.kgmEqvPoolStoreR198&&window.kgmEqvPoolStoreR198(),k=f&&window.kgmEqvKeyR214?window.kgmEqvKeyR214(code,f.fr,f.to):null;
        if(f&&st&&k&&st[k]&&st[k].bal120&&date&&typeof window._eqvTypeFor==='function'){var t=window._eqvTypeFor(code,f.fr,f.to,date);if(t&&t!=='EQV')return t}}catch(_){}
      return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__eq120=1;window.kgmEqvPlanR79=w}
  wrap();[0,1000,3000,8000,20000].forEach(function(t){setTimeout(wrap,t)});
  /* ── 季節交界卡在外站的飛機（L4「整個月備勤」）──
     實測（3 次開頁 3 次都有）：冬季最後一天 KX289 22:20 從台北出發、00:55 到西貢；夏季第一天回程 KX290 01:25 就要從西貢起飛（過站只剩 30 分）
     → 排班引擎另外派一架同型機空機調派（KX8920）過去飛 KX290，原本那架 B779 就一直停在西貢到年底（西雅圖 KX25／KX28 同樣情形）。
     這種「多出來停在外站」的飛機，換班也解決不了（回程只有一班），要飛回台北。
     修：整年排班做完後（之後 5 分鐘內每 10 秒再檢查一次——卡住的情形是排完 20 秒左右才出現），某架停在外站、之後到排班範圍最後 10 天以前都沒有下一段→ 加一段空機調派回台北（跟引擎自己的空機調派同一種：positioningR830／noPax／auto，班號 KX89xx），
         落地 2 小時後起飛；到台北的時間落在 00:30–05:59 就延到 06:30 抵達。只加這一段，原有航班不動。 */
  function frOf(x){return x.fr||String(x.route||'').split('→')[0]}
  function toOf(x){return x.to||String(x.route||'').split('→')[1]}
  function dn(d){return Math.round(Date.parse(d+'T00:00:00Z')/86400000)}
  function mn(t){var q=/^(\d{1,2}):(\d{2})/.exec(String(t||''));return q?(+q[1])*60+(+q[2]):0}
  function tz(ap,d){try{if(window.kgmTzAtR1026C){var v=window.kgmTzAtR1026C(ap,d);if(v!=null)return +v}}catch(_){}try{return +TZ[ap]||8}catch(_){return 8}}
  function abs(d,t,ap){return dn(d)*1440+mn(t)-tz(ap,d)*60}
  function span(x){var a=abs(x.date,x.dep,frOf(x)),b=abs(x.date,x.arr,toOf(x))+(+x.dd||0)*1440;if(b<=a)b+=1440;return [a,b]}
  function legsOf(t){return ((S.tailAssign||{})[t]||[]).filter(function(x){return x&&x.date}).map(function(x){return {x:x,s:span(x)}}).sort(function(p,q){return p.s[0]-q.s[0]})}   /* 依絕對時間排（各站當地時刻字串不能直接比） */
  function loc(a,ap){var d0=new Date(a*60000).toISOString().slice(0,10),o=tz(ap,d0),x=new Date((a+o*60)*60000).toISOString();return {date:x.slice(0,10),time:x.slice(11,16),min:(+x.slice(11,13))*60+(+x.slice(14,16))}}
  function home(a){return a==='TPE'||a==='TSA'}
  function typeIdx(){var o={};Object.keys(typeof AC!=='undefined'?AC:{}).forEach(function(ty){try{(tailsFor(ty)||[]).forEach(function(t){o[t]=ty})}catch(_){}});return o}
  window.kgmStrandHealR1120A=function(){var out={fixed:0,list:[]};try{
    var TA=S.tailAssign||{},end='0000';Object.keys(TA).forEach(function(t){(TA[t]||[]).forEach(function(x){if(x&&x.date&&x.date>end)end=x.date})});var lim=dn(end)-10,seq=0,TY=null;
    Object.keys(TA).forEach(function(A){if((TA[A]||[]).some(function(q){return q&&q.strandR1120A}))return;   /* 已經修過的不再修（不然每 10 秒又加一次） */var LA=legsOf(A);
      for(var i=0;i<LA.length;i++){var x=LA[i].x,X=toOf(x);if(!X||home(X))continue;var arrA=LA[i].s[1];if(arrA/1440>lim)break;
        var nx=LA[i+1];if(nx&&nx.s[0]/1440<=lim)continue;   /* 排班範圍內之後還有下一段（例如多哈線一週後的回程）＝本來就排好在外站等，不動 */
        /* 卡住了。排班範圍最後幾天還掛在這架名下的航段，先交給「那時候人在出發站、之後沒有勤務」的同型機；交不出去就不動 */
        TY=TY||typeIdx();var rest=LA.slice(i+1),moves=[],keep=[];
        rest.forEach(function(r){var y=r.x,fr=frOf(y),hit=null;
          Object.keys(TA).some(function(C){if(C===A||TY[C]!==TY[A]||moves.some(function(m){return m[1]===C}))return false;var LC=legsOf(C),last=LC[LC.length-1];if(!last||toOf(last.x)!==fr||last.s[1]+75>r.s[0])return false;hit=C;return true});
          if(hit)moves.push([y,hit]);else keep.push(r)});
        if(keep.length)break;   /* 有交不出去的（那時候沒有同型機在那個機場）就不動這架：硬改會造成瞬移／重疊（實測 gap 14～43） */
        moves.forEach(function(m){TA[A]=TA[A].filter(function(q){return q!==m[0]});TA[m[1]].push(m[0])});
        var dur=0;try{dur=Math.max(55,Math.round((distOf(X,'TPE')||1200)/780*60+35))}catch(_){dur=180}
        var dep=arrA+120,ar=loc(dep+dur,'TPE');if(ar.min>=30&&ar.min<360)dep+=(390-ar.min);
        var a=loc(dep,X),b=loc(dep+dur,'TPE');
        var f={date:a.date,code:'KX89'+String(90+(seq++%10)),route:X+'→TPE',fr:X,to:'TPE',dep:a.time,arr:b.time,dd:dn(b.date)-dn(a.date),positioningR830:true,noPax:true,auto:true,r72:1,strandR1120A:1};if(x.acft)f.acft=x.acft;
        TA[A].push(f);
        out.fixed++;out.list.push(A+' '+X+' '+a.date+' '+a.time+'→TPE'+(moves.length?'（範圍末 '+moves.length+' 段交給 '+moves.map(function(m){return m[1]}).join('、')+'）':''));break}});
    }catch(e){out.err=String(e&&e.message||e)}if(out.fixed||!window.KGM_STRAND_R1120A)window.KGM_STRAND_R1120A=out;return out};
  (function watch(){var fd=null,t0=0,cov=null;setInterval(function(){var f=window.KGM_FULLDONE_1006A;if(!f)return;if(f!==fd){fd=f;t0=Date.now();cov=null}var age=Date.now()-t0;if(age<300000)window.kgmStrandHealR1120A();
    /* 排完約 2 分鐘（A35K 輪流等後續步驟做完）還有沒派到飛機的班 → 叫引擎自己的補位（kgmCoverGapsR135，同一套規則）補一次。實測補位約 0.5 秒 */
    if(age>=120000&&cov!==fd){cov=fd;try{var c=window.kgmLiveCoverR135&&window.kgmLiveCoverR135();if(c&&c.missing>0&&c.missing<=300&&window.kgmCoverGapsR135){var r=window.kgmCoverGapsR135(true);window.KGM_COVER120={before:c.missing,fixed:(r&&r.fixed||[]).length,left:r&&r.left}}else window.KGM_COVER120={before:c?c.missing:null}}catch(_){}}},10000)})();
  var cl=window.kgmClearEqvPlanR79;if(typeof cl==='function'&&!cl.__eq120){var c2=function(){REC=null;return cl.apply(this,arguments)};c2.__eq120=1;window.kgmClearEqvPlanR79=c2}
})();

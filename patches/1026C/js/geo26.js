
/* ══ 1025B 第二輪 S：避開戰區的實際航路＋航班資料「照片式」路線圖＋起飛前 2 天自動寄延遲抵達通知
   使用者：「航班資料也要有一個照片的路線圖喔 然後有的航線為了避開戰爭在前兩天系統要自動發送延遲抵達的通知」
   ① 關閉空域（GEO.zones）：俄羅斯、烏克蘭、白俄羅斯、伊朗、伊拉克、敘利亞、以色列、巴勒斯坦、黎巴嫩、葉門、阿富汗、北韓（國界外加約 50 公里緩衝；北韓約 15 公里）。
      每一條 KGM 直飛航段離線算好：大圓會不會經過關閉空域、會的話繞道的航點（0.5° 格網最短路徑再拉直），patches/1025B/geo/route.py。
   ② 多飛的時間＝沿繞道航點的空中時間 − 沿大圓的空中時間（同一套高空風 wind25、該班當天機型的巡航速度、冬夏季），取 5 分鐘。
      時刻表本身沒有改（使用者沒有要求）；起飛前 48 小時內、多 15 分鐘以上的班：航班動態寫「時間更改」（出發不變、抵達＝原抵達＋多飛的時間），
      通知訂位旅客（站內通知＋信件），同一架下一班過站不足照 1023A 的連鎖延誤處理。只做一次（S.flightOverrides 標記 warDelayR1025B）；人工改過的不蓋。
   ③ 路線圖：地表用 NASA Blue Marble 衛星照片（公有領域，取自 three-globe 2.31.0 範例圖，4096×2048），正射投影（從太空看地球）＋光照；
      海岸線與國界用 Natural Earth（world-atlas 2.0.2，公有領域）1:50m，
      畫出關閉空域（紅色斜線）、大圓直飛（虛線）與實際航路（金色），每班算一次記住。 ══ */
(function(){
  'use strict';
  var G=/*GEO26*/null;
  if(!G)return;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function rad(x){return x*Math.PI/180}
  function deg(x){return x*180/Math.PI}
  var B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',IX={};for(var i=0;i<64;i++)IX[B64[i]]=i;
  function dec(s){var q=G.q,out=[],x=0,y=0,v=0,m=1,k=0,t=0;
    for(var i=0;i<s.length;i++){var c=IX[s[i]];v+=(c&31)*m;if(c&32){m*=32;continue}var n=(v%2)?-(v+1)/2:v/2;v=0;m=1;if(k===0){t=n;k=1}else{x+=t;y+=n;out.push([y*q,x*q]);k=0}}
    return out}
  var LAND=null,BORD=null,ZON=null,ZSIG=null;
  /* ── 1026B：關閉空域可隨時事調整（後台「航線管理」→ 關閉空域）──
     S.warZonesR1026B＝{on:{區域:true/false}, custom:[{id,zh,lat,lon,r(公里)}], at, by}；沒設定的區域用 2026-10-25 查證的預設（G.zones[k].on）。
     航路改在瀏覽器裡算（0.5° 格網最短路徑再拉直，跟 1025B 離線算的方法相同），改了空域就重算；預設那一組空域的結果預先算好嵌在檔案裡（G.baked）。 */
  function zst(){try{return S.warZonesR1026B||{}}catch(_){return {}}}
  function isOn(k){var o=zst().on||{};return o[k]!=null?!!o[k]:!!(G.zones[k]||{}).on}
  function customs(){var c=zst().custom;return Array.isArray(c)?c.filter(function(x){return x&&isFinite(+x.lat)&&isFinite(+x.lon)&&+x.r>0}):[]}
  function sig(){return Object.keys(G.zones).filter(isOn).join(',')+'|'+customs().map(function(c){return [c.id,(+c.lat).toFixed(2),(+c.lon).toFixed(2),Math.round(+c.r)].join(':')}).join(',')}
  window.kgmWarSigR1026B=sig;
  function load(){if(!LAND){LAND=G.land.map(dec);BORD=G.bord.map(dec)}var s=sig();if(ZON&&ZSIG===s)return;ZSIG=s;ZGD=null;
    ZON=Object.keys(G.zones).filter(isOn).map(function(k){return {k:k,zh:G.zones[k].zh,r:G.zones[k].r.map(dec)}});
    customs().forEach(function(c){var r=[],n=48,la=+c.lat,lo=+c.lon,R=+c.r;for(var i=0;i<=n;i++){var a=i/n*2*Math.PI;r.push([la+R/111*Math.sin(a),lo+R/(111*Math.max(0.15,Math.cos(rad(la))))*Math.cos(a)])}ZON.push({k:'C:'+c.id,zh:c.zh||('自訂空域 '+c.id),r:[r],custom:1})})}
  function zh(k){if(String(k).indexOf('C:')===0){var c=customs().filter(function(x){return 'C:'+x.id===k})[0];return c?(c.zh||k):k}return z()?((G.zones[k]||{}).zh||k):((G.zones[k]||{}).en||k)}
  function geo(c){try{var g=AIRPORT_GEO[c];if(g)return g}catch(_){}try{return window.kgmGeoR1025B?window.kgmGeoR1025B(c):null}catch(_){return null}}
  /* ① 格網：每一區 0.25° 格（已含緩衝），合併成目前開著的那一組 */
  var ZR={};function zr(k){if(ZR[k])return ZR[k];var m=new Uint8Array(1440*720),s=(G.zones[k]||{}).g||'';if(s)s.split(';').forEach(function(row){var q=row.split(':'),y=+q[0];q[1].split(',').forEach(function(ab){var p=ab.split('-'),x0=+p[0],x1=+p[1];for(var x=x0;x<=x1;x++)m[y*1440+x]=1})});return ZR[k]=m}
  function hav(a,b){var p1=rad(a[0]),p2=rad(b[0]),dl=rad(b[1]-a[1]);return 2*6371*Math.asin(Math.min(1,Math.sqrt(Math.pow(Math.sin((p2-p1)/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin(dl/2),2))))}
  var UG=null,UGS=null,UK=null;   /* UG：0.25° 每格是哪幾區（陣列索引＋1，0＝不關）；UK：索引 → 區域代號 */
  function union(){var s=sig();if(UG&&UGS===s)return UG;UGS=s;UG=new Uint8Array(1440*720);UK=[null];
    Object.keys(G.zones).filter(isOn).forEach(function(k){UK.push(k);var m=zr(k),v=UK.length-1;for(var i=0;i<m.length;i++)if(m[i]&&!UG[i])UG[i]=v});
    customs().forEach(function(c){UK.push('C:'+c.id);var v=UK.length-1,la=+c.lat,lo=+c.lon,R=+c.r+30,dla=R/111,dlo=R/(111*Math.max(0.15,Math.cos(rad(la))));
      for(var y=Math.max(0,Math.floor((90-(la+dla))*4));y<=Math.min(719,Math.floor((90-(la-dla))*4));y++)for(var xx=Math.floor((lo-dlo+180)*4);xx<=Math.floor((lo+dlo+180)*4);xx++){var x=((xx%1440)+1440)%1440,cl=90-(y+0.5)/4,co=-180+(x+0.5)/4;if(hav([la,lo],[cl,co])<=R&&!UG[y*1440+x])UG[y*1440+x]=v}});
    return UG}
  function term(k){return (G.zones[k]||{}).kind==='sea'}   /* 波斯灣：起降機場 300 公里內照常 */
  function cellZone(lat,lon,A,B){var U=union(),y=Math.floor((90-lat)*4),x=Math.floor(((lon+180)%360+360)%360*4);if(y<0||y>719)return 0;var v=U[y*1440+(x%1440)];if(!v)return 0;
    var near=Math.min(hav([lat,lon],A),hav([lat,lon],B));if(near<60)return 0;if(term(UK[v])&&near<300)return 0;return v}
  function unit(p){var a=rad(p[0]),b=rad(p[1]);return [Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)]}
  function gcPts(a,b,step){var A=unit(a),B=unit(b),d=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]))),n=Math.max(2,Math.ceil(d*6371/(step||40))),out=[];
    for(var i=0;i<=n;i++){var f=i/n,s=Math.sin(d)||1,k1=d?Math.sin((1-f)*d)/s:1-f,k2=d?Math.sin(f*d)/s:f,x=k1*A[0]+k2*B[0],y=k1*A[1]+k2*B[1],q=k1*A[2]+k2*B[2];
      out.push([deg(Math.atan2(q,Math.sqrt(x*x+y*y))),deg(Math.atan2(y,x))])}return out}
  function segHit(p,q,A,B,set){var L=gcPts(p,q,25),h=false;for(var i=0;i<L.length;i++){var v=cellZone(L[i][0],L[i][1],A,B);if(v){h=true;if(set)set[UK[v]]=1;else return true}}return h}
  /* A*：0.25° 格（1440×720，跟關閉空域格網同一份），16 個方向（同 route.py）—— 0.5° 會把高加索走廊（俄羅斯與伊朗之間）整個封死 */
  var NB=[];[-2,-1,0,1,2].forEach(function(dy){[-2,-1,0,1,2].forEach(function(dx){if((dy||dx)&&(function g(a,b){return b?g(b,a%b):a})(Math.abs(dy),Math.abs(dx))===1)NB.push([dy,dx])})});
  var NX=1440,NY=720;
  function grid5(){return union()}
  function cll(i){var y=Math.floor(i/NX),x=i%NX;return [90-(y+0.5)*0.25,-180+(x+0.5)*0.25]}
  function route(A,B){var GBk=grid5();function bl(i){var v=GBk[i];if(!v)return false;var p=cll(i),near=Math.min(hav(p,A),hav(p,B));if(near<60)return false;if(term(UK[v])&&near<300)return false;return true}
    function cell(p){var y=Math.min(NY-1,Math.max(0,Math.floor((90-p[0])*4))),x=Math.floor((((p[1]+180)%360)+360)%360*4)%NX;return y*NX+x}
    var s=cell(A),t=cell(B),N=NX*NY,gs=new Float64Array(N).fill(1e18),pv=new Int32Array(N).fill(-1),cl=new Uint8Array(N),H=[];
    function push(f,i){H.push([f,i]);var k=H.length-1;while(k>0){var pr=(k-1)>>1;if(H[pr][0]<=H[k][0])break;var tmp=H[pr];H[pr]=H[k];H[k]=tmp;k=pr}}
    function pop(){var top=H[0],last=H.pop();if(H.length){H[0]=last;var k=0;for(;;){var l=2*k+1,r=l+1,m=k;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k)break;var tmp=H[m];H[m]=H[k];H[k]=tmp;k=m}}return top}
    gs[s]=0;push(hav(cll(s),B),s);var n=0;
    while(H.length&&n<2000000){var e=pop(),c=e[1];if(cl[c])continue;cl[c]=1;n++;if(c===t)break;var cy=Math.floor(c/NX),cx=c%NX,pc=cll(c);
      for(var j=0;j<NB.length;j++){var y=cy+NB[j][0];if(y<0||y>=NY)continue;var x=((cx+NB[j][1])%NX+NX)%NX,ni=y*NX+x;if(cl[ni]||bl(ni))continue;var g2=gs[c]+hav(pc,cll(ni));if(g2<gs[ni]){gs[ni]=g2;pv[ni]=c;push(g2+hav(cll(ni),B),ni)}}}
    if(pv[t]<0&&s!==t)return null;
    var path=[t],c2=t;while(c2!==s&&pv[c2]>=0){c2=pv[c2];path.push(c2)}path.reverse();
    var pts=[A].concat(path.slice(1,-1).map(cll),[B]),out=[pts[0]],i=0;
    while(i<pts.length-1){var j2=pts.length-1;while(j2>i+1&&segHit(pts[i],pts[j2],A,B))j2--;out.push(pts[j2]);i=j2}
    return out}
  /* ② 航路（快取：同一組空域、同一條航線只算一次；存在瀏覽器，下次開頁直接用） */
  var RC={},RCS=null;
  function rcLoad(){var s=sig();if(RCS===s)return;RCS=s;RC={};if(G.baked&&G.baked.sig===s)RC=Object.assign({},G.baked.r);
    try{var o=JSON.parse(localStorage.getItem('kgm26_wroute')||'null');if(o&&o.sig===s&&o.r)Object.keys(o.r).forEach(function(k){if(!(k in RC))RC[k]=o.r[k]})}catch(_){}}
  var RSV=0;function rcSave(){if(RSV)return;RSV=setTimeout(function(){RSV=0;try{if(G.baked&&G.baked.sig===RCS)return;localStorage.setItem('kgm26_wroute',JSON.stringify({sig:RCS,r:RC}))}catch(_){}},1500)}
  window.KGM_WROUTE_N_R1026B=0;
  function calc(fr,to){var A=geo(fr),B=geo(to);if(!A||!B)return null;var set={};if(!segHit(A,B,A,B,set))return 0;
    var t0=Date.now(),wp=route(A,B);window.KGM_WROUTE_N_R1026B++;if(!wp)return {d0:Math.round(hav(A,B)),d1:Math.round(hav(A,B)),z:Object.keys(set).sort(),wp:[],fail:1,ms:Date.now()-t0};
    var d1=0;for(var i=0;i<wp.length-1;i++)d1+=hav(wp[i],wp[i+1]);
    return {d0:Math.round(hav(A,B)),d1:Math.round(d1),z:Object.keys(set).sort(),wp:wp.slice(1,-1).map(function(p){return [Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]}),ms:Date.now()-t0}}
  window.kgmWarRouteR1025B=function(fr,to){if(!fr||!to||fr===to)return null;rcLoad();var k=fr<to?fr+'-'+to:to+'-'+fr,rev=fr>to,r=RC[k];
    if(r===undefined){r=calc(fr<to?fr:to,fr<to?to:fr);RC[k]=r;rcSave()}
    if(!r)return null;var wp=r.wp.slice();if(rev)wp.reverse();return {d0:r.d0,d1:r.d1,extra:r.d1-r.d0,zones:r.z.slice(),zonesTxt:r.z.map(zh),wp:wp,fail:!!r.fail}};
  window.kgmWarBakeR1026B=function(pairs){var s=sig(),o={};rcLoad();(pairs||[]).forEach(function(pq){var a=pq[0]<pq[1]?pq[0]:pq[1],b=pq[0]<pq[1]?pq[1]:pq[0],k=a+'-'+b;if(!(k in o)){var r=RC[k];if(r===undefined){r=calc(a,b);RC[k]=r}o[k]=r}});return {sig:s,r:o}};
  window.kgmWarZonesR1025B=function(){return Object.keys(G.zones).map(function(k){var Z=G.zones[k];return {k:k,zh:Z.zh,en:Z.en,on:isOn(k),def:!!Z.on,kind:Z.kind,basis:Z.basis}}).concat(customs().map(function(c){return {k:'C:'+c.id,zh:c.zh,on:true,custom:1,lat:c.lat,lon:c.lon,r:c.r}}))};
  window.KGM_WAR_ASOF_R1026B=G.asof||'';
  /* 改了空域：重算航路、清掉延誤／Payload／地圖快取 */
  var SIG0=null;setInterval(function(){try{var s=sig();if(SIG0!==null&&s!==SIG0){WM={};WN=0;PM={};PN=0;QM={};QN=0;CACHE={};CN=0;ZGD=null}SIG0=s}catch(_){}},1000);
  /* ③ 多飛的時間 → 預計晚到幾分：1026B 起時刻表本身含彈性（js/bt26.js），晚到＝繞道多飛的空中時間 − 這一班時刻表比應有輪擋多出來的彈性 */
  var WM={},WN=0;
  window.kgmWarDelayR1025B=function(f,date){
    if(!f||f.partner||f.codeshare||f.via||!/^KX\d+$/.test(String(f.code||'')))return null;
    var w=window.kgmWarRouteR1025B(f.fr,f.to);if(!w)return null;var a=geo(f.fr),b=geo(f.to);if(!a||!b||!window.kgmAirMinR1025B)return null;
    var t='';try{t=acftOfFlight(f.code,date,f.fr,f.to)}catch(_){t=f.acft||''}if(!t||t==='EQV')t=f.acft&&f.acft!=='EQV'?f.acft:'B789';
    var win=false;try{win=window.kgmSeasonAtR112(date)==='winter'}catch(_){win=/-(1[12]|0[1-3])-/.test(date)}
    var x=null;try{x=window.kgmSeasonFlightR48(f,date)}catch(_){}var sb=0,tg=0;try{if(x&&x.dep){sb=blockMin(f.fr,f.to,x.dep,x.arr,+x.dd||0);tg=window.kgmBlockTargetR1026B?window.kgmBlockTargetR1026B(f.fr,f.to,t,win,x.dep):sb}}catch(_){}
    var slack=Math.max(0,sb-tg);
    var k=f.fr+'|'+f.to+'|'+t+'|'+(win?'w':'s')+'|'+slack+'|'+ZSIG,r=WM[k];
    if(!r){var tas=window.kgmTasR1025B(t),m0=window.kgmAirMinR1025B([a,b],tas,win),m1=window.kgmAirMinR1025B([a].concat(w.wp,[b]),tas,win),raw=m1-m0;
      r={raw:raw,slack:slack,min:Math.max(0,Math.round((raw-slack)/5)*5),km:w.extra,d0:w.d0,d1:w.d1,zones:w.zones,zonesTxt:w.zonesTxt,type:t,win:win};if(++WN>4000){WM={};WN=0}WM[k]=r}
    return r};
  /* ②' Payload 限座（使用者：「冬季航班飛行就是我講到的Payload, like China Airlines（他們以下幾乎是A359並且是直飛）… LHR 80 AMS 107 FRA 59 VIE 25 PRG 40 FCO 31
        可能會扣這麼多是因為戰爭和航程那些的」）
        飛得越久要帶的油越多，最大起飛重量扣掉空重和油之後能載的人就越少 → 經濟艙要少賣幾位（可賣的數量，不是指定哪幾個座位）。
        飛行時間＝沿實際航路（避開關閉空域）＋當季高空風＋該機型巡航速度的空中時間＋滑行 30 分（跟時刻表無關的物理估算，同一套用在校正）。
        用華航 A359（306 席）六條冬季直飛校正（patches/1025B/geo/pl_fit.py，誤差 RMSE 約 15 席；AMS 比更遠的 LHR 還多，任何依距離／風的模型都對不上）：
          · 輪擋超過 T0 小時才開始少賣；A359 的 T0＝11.839 小時 → 換算成「滿載航程」＝型錄航程 × 0.684（含貨郵承諾、備用油）；
          · 每多飛 1 小時少賣全機座位的 14.8%。
        其他機型：T0＝0.5 小時滑行＋型錄航程 × 係數 ÷ 巡航速度；少賣比例相同；最多整個經濟艙。
        係數：亞洲—歐洲（一端在歐洲，走中亞／高加索走廊）用華航校正的 0.684（備降場少、要多帶應變油、貨郵承諾，華航自己的情況）；
        其他長程（越太平洋、澳紐、中東）沒有校正資料 → 用型錄航程（係數 1.0）當滿載航程。華航係數直接套到美國線會讓 B779 紐約回台北經濟艙全部不能賣，
        這不是實際航空公司的情況，所以分開。 */
  var PF={T0:11.839,frac:0.148,rf:0.684,rfOther:1.0},RNG={A359:15000,A35K:16100,B789:14140,B78X:11730,B779:13500,B77W:13650,A388:14800,A339:13300,A21N:7400,A21X:8700},PM={},PN=0,SC={};   /* 型錄航程 km */
  function seats(t){if(SC[t])return SC[t];var o={all:0,y:0};try{(seatSections7(t)||[]).forEach(function(s){var n=0;(s.rows||[]).forEach(function(r){(r.cells||[]).forEach(function(x){if(x&&!x.aisle&&x.id)n++})});o.all+=n;if(s.name==='Economy')o.y+=n})}catch(_){}if(o.all)SC[t]=o;return o}
  var QM={},QN=0;
  window.kgmPaxCapR1025B=function(f,date,opt){
    if(!f||f.partner||f.codeshare||f.via)return null;
    /* 訂票頁每畫一次會問上千次（sell54）：同一班同一天 5 秒內直接用（機型異動後最多 5 秒生效） */
    var qk=opt?null:f.code+'|'+date+'|'+f.fr+'|'+f.to,qv=qk&&QM[qk];if(qv&&Date.now()-qv.t<5000)return qv.v;
    if(qk){var rv=window.kgmPaxCapR1025B(f,date,{_q:1});if(++QN>5000){QM={};QN=0}QM[qk]={t:Date.now(),v:rv};return rv}var a=geo(f.fr),b=geo(f.to);if(!a||!b||!window.kgmAirMinR1025B)return null;
    if(opt&&opt._q)opt=null;
    var t=(opt&&opt.type)||'';if(!t){try{t=acftOfFlight(f.code,date,f.fr,f.to)}catch(_){t=f.acft||''}}if(!t||t==='EQV')t=f.acft&&f.acft!=='EQV'?f.acft:'B789';
    var win=false;if(opt&&opt.win!=null)win=!!opt.win;else{try{win=window.kgmSeasonAtR112(date)==='winter'}catch(_){win=/-(1[12]|0[1-3])-/.test(date)}}
    var st=(opt&&opt.seats)?{all:opt.seats,y:opt.seats}:seats(t),k=f.fr+'|'+f.to+'|'+t+'|'+(win?'w':'s')+'|'+st.all,r=PM[k];if(r)return r;
    var tb=t.replace(/[LR]$/,''),rg=RNG[t]||RNG[tb]||RNG.B789,tas=window.kgmTasR1025B(t),eu=function(g){return g[0]>34&&g[1]>-25&&g[1]<45},asEu=eu(a)!==eu(b),rf=asEu?PF.rf:PF.rfOther;
    var w=window.kgmWarRouteR1025B(f.fr,f.to),pts=w?[a].concat(w.wp,[b]):[a,b],air=window.kgmAirMinR1025B(pts,tas,win),T=(air+30)/60,T0=0.5+rf*rg/tas;
    var blk=st.all?Math.max(0,Math.min(st.y,Math.round(st.all*PF.frac*Math.max(0,T-T0)))):0,mx=st.all-blk;
    r={type:t,win:win,blockMin:Math.round(air+30),limitMin:Math.round(T0*60),seats:st.all,ySeats:st.y,blocked:blk,maxPax:mx,payloadKg:mx*100,km:w?w.d1:null,war:!!w,basis:asEu?'ci':'range'};
    if(++PN>3000){PM={};PN=0}PM[k]=r;return r};
  /* ③ 起飛前 48 小時自動通知延遲抵達 */
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(m){m=((m%1440)+1440)%1440;return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
  function tz(c){try{var v=TZ[c];return typeof v==='number'?v:8}catch(_){return 8}}
  function sea(f,d){try{return (window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,d))||f}catch(_){return f}}
  function own(){try{return [].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.via&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(String(f.code||''))})}catch(_){return []}}
  function flies(f,d){try{return flyOn(f,new Date(d+'T12:00:00'))}catch(_){return false}}
  var RUN=0;
  function job(){
    if(RUN)return;RUN=1;
    try{
      if(typeof S==='undefined'||!S||!S.flightOverrides&&!S.bookings)return;
      var now=Date.now(),td=todayISO(),made=[];
      [addDays(td,-1),td,addDays(td,1),addDays(td,2)].forEach(function(d){
        own().forEach(function(f){
          if(!window.kgmWarRouteR1025B(f.fr,f.to))return;
          if(!flies(f,d))return;
          var x=sea(f,d),dep=mn(x.dep||f.dep),depUTC=Date.parse(d+'T00:00:00Z')+(dep-tz(f.fr)*60)*60000;
          if(!(depUTC>now&&depUTC-now<=48*3600000))return;   /* 起飛前 48 小時內、還沒起飛 */
          var key=f.code+'_'+d,ov=(S.flightOverrides||{})[key]||null;
          if(ov&&(ov.warDelayR1025B||ov.status==='Cancelled'||ov.status==='Diverted'||ov.arr))return;   /* 做過，或人工已改時間／取消／轉降 → 不蓋 */
          var w=window.kgmWarDelayR1025B(f,d);if(!w||w.min<15)return;   /* 15 分鐘以上才通知（繞道只多十幾公里、差 10 分鐘的不發） */
          var a0=mn(x.arr||f.arr)+(+(x.dd!=null?x.dd:f.dd)||0)*1440,a1=a0+w.min,dd1=Math.floor(a1/1440);
          var why=(z()?('避開'+w.zonesTxt.join('、')+'空域，航路較直飛多 '+w.km.toLocaleString()+' 公里'):('Avoiding '+w.zones.join(', ')+' airspace (+'+w.km+' km)'));
          S.flightOverrides=S.flightOverrides||{};
          S.flightOverrides[key]=Object.assign({},ov||{},{status:'Time Change',dep:x.dep||f.dep,depDD:0,arr:hm(a1),arrDD:dd1,arrRemark:why,reason:why,
            warDelayR1025B:{min:w.min,km:w.km,zones:w.zones,schedArr:x.arr||f.arr,schedDD:(+(x.dd!=null?x.dd:f.dd)||0),at:new Date().toISOString(),type:w.type}});
          var msg=(z()?('航班 '+f.code+'（'+d+'）'+f.fr+'→'+f.to+' 照常 '+(x.dep||f.dep)+' 出發，因'+why+'，預計晚 '+w.min+' 分鐘抵達：新抵達 '+hm(a1)+(dd1>0?'⁺'+dd1:'')+'（原 '+(x.arr||f.arr)+'）。')
            :('Flight '+f.code+' ('+d+') '+f.fr+'→'+f.to+' departs as scheduled at '+(x.dep||f.dep)+'; '+why+', arriving about '+w.min+' min late at '+hm(a1)+(dd1>0?' (+'+dd1+')':'')+' (was '+(x.arr||f.arr)+').'));
          var n=0;try{n=window.kgmTellPaxR1023A?window.kgmTellPaxR1023A(f.code,d,msg,z()?'延遲抵達通知':'Late arrival notice','Time Change','flight.changed'):0}catch(_){}
          var cs=[];try{if(window.kgmDelayCascadeR1023A)cs=window.kgmDelayCascadeR1023A(f.code,d,f.fr,f.to,0)||[]}catch(_){}
          made.push({code:f.code,date:d,route:f.fr+'→'+f.to,min:w.min,km:w.km,pax:n,cascade:cs.length});
          try{logAct(z()?'避戰航路延遲抵達（自動）':'War-route late arrival (auto)',f.code+' '+d+' +'+w.min+(z()?' 分・通知 ':' min · notified ')+n)}catch(_){}
        })});
      if(made.length){window.KGM_WAR_LAST_R1025B=made;try{LS.set('kgmov4',S.flightOverrides)}catch(_){}try{save()}catch(_){}}
    }catch(e){try{console.warn('war25',e)}catch(_){}}finally{RUN=0}}
  window.kgmWarJobR1025B=job;
  setTimeout(function tick(){try{if(window.requestIdleCallback)window.requestIdleCallback(job,{timeout:5000});else job()}catch(_){}setTimeout(tick,10*60000)},25000);

  /* ④ 照片式路線圖 */
  function poly(pts,step){var out=[];for(var i=0;i<pts.length-1;i++){var s=gcPts(pts[i],pts[i+1],step);out=out.concat(i?s.slice(1):s)}return out}
  function mkProj(lat0,lon0,R,cx,cy){var s0=Math.sin(rad(lat0)),c0=Math.cos(rad(lat0)),l0=rad(lon0);
    return {R:R,cx:cx,cy:cy,s0:s0,c0:c0,l0:l0,f:function(lat,lon){var p=rad(lat),l=rad(lon)-l0,cp=Math.cos(p),x=cp*Math.sin(l),y=c0*Math.sin(p)-s0*cp*Math.cos(l),c=s0*Math.sin(p)+c0*cp*Math.cos(l);
      if(c<0){var h=Math.sqrt(x*x+y*y)||1;x/=h;y/=h}return [cx+R*x,cy-R*y,c]}}}
  function drawRings(ctx,P,rings,close){rings.forEach(function(r){var on=false;for(var i=0;i<r.length;i++){var p=P.f(r[i][0],r[i][1]);if(!on){ctx.moveTo(p[0],p[1]);on=true}else ctx.lineTo(p[0],p[1])}if(close)ctx.closePath()})}
  function lines(ctx,P,pts){var on=false;for(var i=0;i<pts.length;i++){var p=P.f(pts[i][0],pts[i][1]);if(p[2]<0.02){on=false;continue}if(!on){ctx.moveTo(p[0],p[1]);on=true}else ctx.lineTo(p[0],p[1])}}
  /* 衛星照片（只在第一次畫路線圖時解碼；前台不會用到） */
  var TEXSRC=/*TEX25*/'',TEX=null,TEXW=[];
  function tex(cb){if(TEX){cb();return}TEXW.push(cb);if(TEXW.length>1)return;var im=new Image();
    im.onload=function(){try{var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;var g=c.getContext('2d');g.drawImage(im,0,0);TEX={d:g.getImageData(0,0,c.width,c.height).data,w:c.width,h:c.height}}catch(e){try{console.warn('map25 tex',e)}catch(_){}}var L=TEXW;TEXW=[];L.forEach(function(f){try{f()}catch(_){}})};
    im.onerror=function(){var L=TEXW;TEXW=[];L.forEach(function(f){try{f()}catch(_){}})};im.src=TEXSRC}
  /* 關閉空域格網（0.25°，經緯度平面，各國已在換日線切開）—— 逐點查用 */
  var ZGD=null;function zgrid(){load();if(ZGD)return ZGD;var c=document.createElement('canvas');c.width=1440;c.height=720;var g=c.getContext('2d');g.imageSmoothingEnabled=false;
    ZON.forEach(function(Z,i){g.fillStyle='rgb('+(i+1)+',0,0)';g.beginPath();Z.r.forEach(function(r){r.forEach(function(p,k){var X=(p[1]+180)*4,Y=(90-p[0])*4;if(k)g.lineTo(X,Y);else g.moveTo(X,Y)});g.closePath()});g.fill('evenodd')});
    var d=g.getImageData(0,0,1440,720).data,o=new Uint8Array(1440*720);for(var i=0;i<o.length;i++)if(d[i*4+3]>127)o[i]=d[i*4];ZGD=o;return o}
  var CACHE={},CN=0;
  function render(o){
    load();
    var W=o.w,H=o.h,A=geo(o.fr),B=geo(o.to);if(!A||!B)return null;
    var war=window.kgmWarRouteR1025B(o.fr,o.to),direct=gcPts(A,B,30),act=war?poly([A].concat(war.wp,[B]),30):direct;
    /* 視角：路線中心、能整條看見 */
    var sx=0,sy=0,sz=0;act.concat(direct).forEach(function(p){var u=unit(p);sx+=u[0];sy+=u[1];sz+=u[2]});var h=Math.sqrt(sx*sx+sy*sy+sz*sz)||1,lat0=deg(Math.asin(sz/h)),lon0=deg(Math.atan2(sy,sx));
    var P1=mkProj(lat0,lon0,1,0,0),x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;act.concat(direct).forEach(function(p){var q=P1.f(p[0],p[1]);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])});
    var padX=W*0.12,padY=H*0.2,R=Math.min((W-2*padX)/Math.max(1e-3,x1-x0),(H-2*padY)/Math.max(1e-3,y1-y0));R=Math.min(R,W*2.6);
    var cx=W/2-R*(x0+x1)/2,cy=H/2-R*(y0+y1)/2,P=mkProj(lat0,lon0,R,cx,cy);
    /* 地表：NASA Blue Marble 衛星照片（等距圓柱 4096×2048）逐點取樣＋光照、大氣邊緣 */
    var cv=document.createElement('canvas');cv.width=W;cv.height=H;var ctx=cv.getContext('2d'),img=ctx.createImageData(W,H),D=img.data;
    var Lx=-0.42,Ly=0.5,Lz=0.76,s0=P.s0,c0=P.c0,l0=P.l0,T=TEX.d,TW=TEX.w,TH=TEX.h,ZG=zgrid(),ZP=new Uint8Array(W*H),HIT={},px=W/900,hs=Math.max(6,Math.round(9*px)),hw=Math.max(1,1.3*px);
    ((war&&war.zones)||[]).forEach(function(k){ZON.forEach(function(Z,i){if(Z.k===k)HIT[i+1]=1})});
    for(var y=0;y<H;y++){var dy=(cy-y)/R;for(var x=0;x<W;x++){var j=(y*W+x)*4,dx=(x-cx)/R,r2=dx*dx+dy*dy,c0r,c1r,c2r;
      if(r2>1){var dpx=(Math.sqrt(r2)-1)*R,gl=Math.exp(-dpx/(W/90)),t=y/H;c0r=8+6*t+70*gl;c1r=16+10*t+120*gl;c2r=30+12*t+190*gl}
      else{var zz=Math.sqrt(1-r2),lat=Math.asin(zz*s0+dy*c0),lon=l0+Math.atan2(dx,zz*c0-dy*s0),lam=dx*Lx+dy*Ly+zz*Lz,k=(0.8+0.3*Math.max(0,lam))*(0.82+0.18*zz);
        var u=((lon/Math.PI+1)/2)%1;if(u<0)u+=1;var v=(0.5-lat/Math.PI),fx=u*TW-0.5,fy=v*TH-0.5,ix=Math.floor(fx),iy=Math.floor(fy),ax=fx-ix,ay=fy-iy;
        if(iy<0){iy=0;ay=0}if(iy>TH-2){iy=TH-2;ay=1}var ix0=(ix+TW)%TW,ix1=(ix0+1)%TW,p00=(iy*TW+ix0)*4,p10=(iy*TW+ix1)*4,p01=((iy+1)*TW+ix0)*4,p11=((iy+1)*TW+ix1)*4;
        var w00=(1-ax)*(1-ay),w10=ax*(1-ay),w01=(1-ax)*ay,w11=ax*ay;
        c0r=(T[p00]*w00+T[p10]*w10+T[p01]*w01+T[p11]*w11)*k;c1r=(T[p00+1]*w00+T[p10+1]*w10+T[p01+1]*w01+T[p11+1]*w11)*k;c2r=(T[p00+2]*w00+T[p10+2]*w10+T[p01+2]*w01+T[p11+2]*w11)*k;
        /* 關閉空域：逐點查（多邊形跨到地球背面時用填色會畫錯） */
        var la4=Math.floor((90-lat*180/Math.PI)*4),lo4=Math.floor(((lon*180/Math.PI+540)%360)*4)%1440,zi=ZG[Math.max(0,Math.min(719,la4))*1440+lo4];
        if(zi){ZP[y*W+x]=zi;var on=HIT[zi],za=on?0.34:0.18;c0r+=(205-c0r)*za;c1r+=(40-c1r)*za;c2r+=(40-c2r)*za;if(on&&((x+y)%hs)<hw){c0r+=(255-c0r)*0.42;c1r+=(150-c1r)*0.42;c2r+=(140-c2r)*0.42}}
        if(r2>0.93){var e=(r2-0.93)/0.07*0.45;c0r+=(120-c0r)*e;c1r+=(175-c1r)*e;c2r+=(235-c2r)*e}}
      D[j]=c0r;D[j+1]=c1r;D[j+2]=c2r;D[j+3]=255}}
    /* 關閉空域外框 */
    for(var y2=1;y2<H-1;y2++)for(var x2=1;x2<W-1;x2++){var i2=y2*W+x2,zv=ZP[i2];if(!zv)continue;if(ZP[i2+1]!==zv||ZP[i2-1]!==zv||ZP[i2+W]!==zv||ZP[i2-W]!==zv){var j2=i2*4,on2=HIT[zv],a2=on2?0.9:0.45;D[j2]+=(255-D[j2])*a2;D[j2+1]+=(110-D[j2+1])*a2;D[j2+2]+=(100-D[j2+2])*a2}}
    ctx.putImageData(img,0,0);
    /* 經緯線 */
    ctx.save();ctx.beginPath();for(var la=-80;la<=80;la+=10){var L=[];for(var lo=-180;lo<=180;lo+=2)L.push([la,lo]);lines(ctx,P,L)}for(var lo2=-180;lo2<180;lo2+=10){var L2=[];for(var la2=-85;la2<=85;la2+=2)L2.push([la2,lo2]);lines(ctx,P,L2)}
    ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1*px;ctx.stroke();
    /* 海岸線 */
    ctx.beginPath();LAND.forEach(function(r){lines(ctx,P,r)});ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=0.7*px;ctx.stroke();
    /* 國界 */
    ctx.beginPath();BORD.forEach(function(r){lines(ctx,P,r)});ctx.strokeStyle='rgba(255,255,255,.26)';ctx.lineWidth=0.8*px;ctx.stroke();
    /* 關閉空域 */
    var hit=(war&&war.zones)||[];
    /* 航路 */
    if(war){ctx.beginPath();lines(ctx,P,direct);ctx.setLineDash([7*px,6*px]);ctx.strokeStyle='rgba(255,255,255,.62)';ctx.lineWidth=1.4*px;ctx.stroke();ctx.setLineDash([])}
    ctx.beginPath();lines(ctx,P,act);ctx.shadowColor='rgba(245,197,91,.85)';ctx.shadowBlur=12*px;ctx.strokeStyle='#F5C55B';ctx.lineWidth=2.8*px;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.shadowBlur=0;
    /* 飛行中 → 飛機位置 */
    if(o.prog!=null&&o.prog>0&&o.prog<1){var tot=0,seg=[];for(var q=0;q<act.length-1;q++){var a1=unit(act[q]),b1=unit(act[q+1]),dd=Math.acos(Math.max(-1,Math.min(1,a1[0]*b1[0]+a1[1]*b1[1]+a1[2]*b1[2])));seg.push(dd);tot+=dd}
      var goal=tot*o.prog,acc=0;for(var q2=0;q2<seg.length;q2++){if(acc+seg[q2]>=goal){var pa=P.f(act[q2][0],act[q2][1]),pb=P.f(act[q2+1][0],act[q2+1][1]),ff=(goal-acc)/(seg[q2]||1),X=pa[0]+(pb[0]-pa[0])*ff,Y=pa[1]+(pb[1]-pa[1])*ff,ang=Math.atan2(pb[1]-pa[1],pb[0]-pa[0]);
        ctx.save();ctx.translate(X,Y);ctx.rotate(ang);ctx.fillStyle='#fff';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=6*px;ctx.font=(22*px)+'px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✈',0,0);ctx.restore();break}acc+=seg[q2]}}
    /* 機場 */
    var BOX=[];   /* 1026B：機場標籤的位置 —— 空域名稱不要壓在上面（杜哈的「波斯灣水域」原本蓋住 DOH） */
    function pin(p,lab,sub,left){var q=P.f(p[0],p[1]);ctx.beginPath();ctx.arc(q[0],q[1],7*px,0,7);ctx.fillStyle='rgba(245,197,91,.28)';ctx.fill();ctx.beginPath();ctx.arc(q[0],q[1],4.2*px,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=2*px;ctx.strokeStyle='#F5C55B';ctx.stroke();
      ctx.font='700 '+(14*px)+'px ui-monospace,Menlo,monospace';var w1=ctx.measureText(lab).width;ctx.font='500 '+(11.5*px)+'px system-ui,sans-serif';var w2=ctx.measureText(sub).width;var bw=Math.max(w1,w2)+18*px,bh=40*px;
      var bx=left?q[0]-bw-12*px:q[0]+12*px,by=q[1]-bh/2;bx=Math.max(6*px,Math.min(W-bw-6*px,bx));by=Math.max(6*px,Math.min(H-bh-6*px,by));
      BOX.push([bx-6*px,by-6*px,bx+bw+6*px,by+bh+6*px]);ctx.fillStyle='rgba(6,18,30,.74)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(bx,by,bw,bh,8*px);else ctx.rect(bx,by,bw,bh);ctx.fill();
      ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';ctx.font='700 '+(14*px)+'px ui-monospace,Menlo,monospace';ctx.fillText(lab,bx+9*px,by+17*px);ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='500 '+(11.5*px)+'px system-ui,sans-serif';ctx.fillText(sub,bx+9*px,by+32*px)}
    var pa2=P.f(A[0],A[1]),pb2=P.f(B[0],B[1]);pin(A,o.fr,o.frName||'',pa2[0]<pb2[0]);pin(B,o.to,o.toName||'',pb2[0]<pa2[0]);
    /* 繞開的空域名稱 */
    hit.forEach(function(k){var Z=ZON.filter(function(x){return x.k===k})[0];if(!Z)return;var best=null,ba=0;Z.r.forEach(function(r){var a=0,sx2=0,sy2=0,n=0;r.forEach(function(p){var q=P.f(p[0],p[1]);if(q[2]>0.05&&q[0]>0&&q[0]<W&&q[1]>0&&q[1]<H){sx2+=q[0];sy2+=q[1];n++}});if(n>ba){ba=n;best=[sx2/n,sy2/n]}});
      if(!best||ba<4)return;var t=(z()?Z.zh+'・空域關閉':k+' · closed');ctx.font='700 '+(11*px)+'px system-ui,sans-serif';var tw=ctx.measureText(t).width+14*px;
      var ov=function(y){return BOX.some(function(b){return best[0]+tw/2>b[0]&&best[0]-tw/2<b[2]&&y+10*px>b[1]&&y-10*px<b[3]})},y0=best[1],ok=!ov(y0);
      for(var s9=1;!ok&&s9<=8;s9++){var yy=y0+(s9%2?-1:1)*Math.ceil(s9/2)*26*px;if(yy>12*px&&yy<H-12*px&&!ov(yy)){best=[best[0],yy];ok=true}}if(!ok)return;BOX.push([best[0]-tw/2,best[1]-10*px,best[0]+tw/2,best[1]+10*px]);ctx.fillStyle='rgba(120,16,16,.78)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(best[0]-tw/2,best[1]-10*px,tw,20*px,10*px);else ctx.rect(best[0]-tw/2,best[1]-10*px,tw,20*px);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,best[0],best[1]);ctx.textAlign='start'});
    return cv.toDataURL('image/jpeg',0.9)}
  /* 給航班資料頁：回傳 HTML（圖＋圖例），圖在空閒時畫好再換上 */
  function city(a){try{return (z()?CITY_ZH:(typeof CITY_EN!=='undefined'?CITY_EN:CITY_ZH))[a]||a}catch(_){return a}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  window.kgmRouteMapR1025B=function(el,f,date,prog){
    if(!el||!f)return;var W=Math.max(320,Math.round(el.clientWidth||860)),H=Math.round(Math.min(400,Math.max(240,W*0.42))),dpr=Math.min(1.5,window.devicePixelRatio||1);
    var key=[f.fr,f.to,W,H,dpr,z()?'z':'e',prog!=null?Math.round(prog*40):'-',sig()].join('|');
    el.style.height=H+'px';
    var put=function(u){if(!u)return;var im=el.querySelector('img.k25map-img');if(!im){im=document.createElement('img');im.className='k25map-img';im.alt='';el.insertBefore(im,el.firstChild)}if(im.getAttribute('src')!==u)im.src=u;el.classList.add('ready')};
    if(CACHE[key]){put(CACHE[key]);return}
    var go=function(){tex(function(){if(!TEX)return;try{var u=render({w:Math.round(W*dpr),h:Math.round(H*dpr),fr:f.fr,to:f.to,frName:city(f.fr),toName:city(f.to),prog:prog});if(++CN>24){CACHE={};CN=0}CACHE[key]=u;put(u)}catch(e){try{console.warn('map25',e)}catch(_){}}})};
    if(window.requestIdleCallback)window.requestIdleCallback(go,{timeout:600});else setTimeout(go,30)};
  window.kgmRouteMapLegendR1025B=function(f,date){var w=window.kgmWarRouteR1025B(f.fr,f.to),wd=null;try{wd=window.kgmWarDelayR1025B(f,date)}catch(_){}
    var h='<span class="lg act">'+(z()?'實際航路':'Planned track')+'</span>';
    if(w){h+='<span class="lg gc">'+(z()?'大圓直飛':'Great circle')+'</span><span class="lg zn">'+(z()?'關閉空域':'Closed airspace')+'</span>'}
    var info=w?((z()?'避開 ':'Avoiding ')+E(w.zonesTxt.join(z()?'、':', '))+(z()?'・航路 ':' · track ')+w.d1.toLocaleString()+' km（'+(z()?'直飛 ':'direct ')+w.d0.toLocaleString()+'，+'+w.extra.toLocaleString()+'）'+(wd?((z()?'・多飛約 ':' · about ')+'<b>'+Math.round(wd.raw)+(z()?' 分鐘':' min')+'</b>'):''))
      :(z()?'航路不經過關閉空域，照大圓航線飛行':'Track does not cross closed airspace');
    var pc=null;try{pc=window.kgmPaxCapR1025B(f,date)}catch(_){}
    if(pc&&pc.blocked>0)info+=(z()?'・Payload 限座：經濟艙少賣 ':' · Payload limit: economy capped by ')+'<b>'+pc.blocked+(z()?' 席':' seats')+'</b>';
    return {legend:h,info:info,war:w,delay:wd,cap:pc}};
})();

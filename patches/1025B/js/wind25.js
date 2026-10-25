
/* ══ D：冬季飛行時間每一班各自算（使用者：「每個航線應該時間調整的不會一樣吧 不可以為了方便而這樣喔 你要考慮到每個航班的風向那一些影響多久
   可能甚至每個航班都不一定會一樣在同條航線中」）
   1023A 的修正只看城市對（同一條航線每一班都 −5／+10）。現在冬季飛行時間＝夏季飛行時間＋（冬季空中時間 − 夏季空中時間）＋（冬季地面 − 夏季地面）：
   ① 空中：沿航路取點，每一點依緯度算當季西風（北半球冬季噴射氣流核心約 33°N、夏季北移變弱；南半球季節相反），
      取航向的東西分量當順／逆風；長程往東飛會往噴射氣流靠（順風），往西飛會避開（少吃逆風）—— 跟實際選航路一樣。
      空中時間＝距離×1.03 ÷（該機型巡航速度＋順風）：A21N 比 A388 慢，同一條航線換機型、受風影響的分鐘數就不同。
   ② 地面：網站班表裡這個機場在起飛／降落前後 30 分鐘有幾班（越擠滑行、等跑道越久），加上大機場整體尖峰曲線；冬季清晨與夜間在寒冷機場（北緯 36° 以上）除冰。
      冬季起飛時間本來就跟夏季不同（長程至少差 15 分），所以同一條航線每一班的地面時間差都不一樣。
   使用者逐列審過的時刻（KEEP23）照舊不動；結果取 5 分鐘整數，−60～+75 分。 ══ */
(function(){
  var TAS={A388:905,B779:905,B77W:905,B773:900,A35K:905,A359:905,B789:900,B78X:900,B788:895,A339:870,A333:870,A332:870,A21N:830,A21X:830,A320:830,A321:830,B738:830,B38M:830};
  var BIG={TPE:1,NRT:1,HND:1,ICN:1,PEK:1,PKX:1,PVG:1,HKG:1,SIN:1,BKK:1,LHR:1,CDG:1,FRA:1,AMS:1,JFK:1,EWR:1,LAX:1,SFO:1,ORD:1,YYZ:1,SYD:1,DXB:1,DOH:1,IST:1,MNL:1,KUL:1,CGK:1,MUC:1,SEA:1};
  /* AIRPORT_GEO 沒有的航點（後來新增的歐美航點等）補座標 */
  var GEO25={ATH:[37.94,23.94],AUH:[24.43,54.65],BCN:[41.30,2.08],BUD:[47.44,19.26],CAN:[23.39,113.30],CEB:[10.31,123.98],CGO:[34.52,113.84],CHC:[-43.49,172.53],CKG:[29.72,106.64],
    CNX:[18.77,98.96],CTU:[30.58,103.95],DAD:[16.04,108.20],DMK:[13.91,100.61],DTW:[42.21,-83.35],EWR:[40.69,-74.17],FCO:[41.80,12.25],HEL:[60.32,24.96],HGH:[30.23,120.43],IAH:[29.98,-95.34],
    KTI:[11.40,104.80],LAS:[36.08,-115.15],MAD:[40.47,-3.56],MLE:[4.19,73.53],ONT:[34.06,-117.60],PEN:[5.30,100.28],PER:[-31.94,115.97],PHX:[33.43,-112.01],PRG:[50.10,14.26],SHA:[31.20,121.34],
    SZX:[22.64,113.81],WAW:[52.17,20.97],XMN:[24.54,118.13]};
  function geo(c){try{var g=AIRPORT_GEO[c];if(g)return g}catch(_){}return GEO25[c]||null}
  function rad(x){return x*Math.PI/180}
  function deg(x){return x*180/Math.PI}
  function g(x,c,s){return Math.exp(-Math.pow((x-c)/s,2))}
  /* 西風（km/h，正＝往東吹）；win＝北半球冬季 */
  /* 噴射氣流強度隨經度：日本上空（東經 140° 附近）最強，中太平洋、中東、歐美較弱 */
  function amp(lon){lon=((lon+540)%360)-180;return 0.55+0.7*Math.exp(-Math.pow((lon-140)/25,2))}
  function u(lat,win,lon){var a=Math.abs(lat);if(a<15)return -10;var A=lon==null?1:amp(lon);
    if(lat>=0)return win?(A*180*g(lat,33,10)+90*g(lat,52,9)):(70*g(lat,43,9)+30*g(lat,55,9));
    return win?(60*g(a,47,9)):(120*g(a,35,10)+50*g(a,55,9))}
  function path(a,b,n){var p1=rad(a[0]),l1=rad(a[1]),p2=rad(b[0]),l2=rad(b[1]);
    var dd=2*Math.asin(Math.sqrt(Math.pow(Math.sin((p2-p1)/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin((l2-l1)/2),2)));if(!(dd>0))return [];
    var out=[];for(var i=0;i<n;i++){var f=(i+0.5)/n,A=Math.sin((1-f)*dd)/Math.sin(dd),B=Math.sin(f*dd)/Math.sin(dd);
      var x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2),y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2),zz=A*Math.sin(p1)+B*Math.sin(p2);
      var lat=Math.atan2(zz,Math.sqrt(x*x+y*y)),lon=Math.atan2(y,x);
      var brg=Math.atan2(Math.sin(l2-lon)*Math.cos(p2),Math.cos(lat)*Math.sin(p2)-Math.sin(lat)*Math.cos(p2)*Math.cos(l2-lon));
      out.push({lat:deg(lat),lon:deg(lon),east:Math.sin(brg)})}
    return out}
  function hav(a,b){var p1=rad(a[0]),p2=rad(b[0]),dl=rad(b[1]-a[1]);return 2*6371*Math.asin(Math.sqrt(Math.pow(Math.sin((p2-p1)/2),2)+Math.cos(p1)*Math.cos(p2)*Math.pow(Math.sin(dl/2),2)))}
  function midpt(a,b){var p1=rad(a[0]),l1=rad(a[1]),p2=rad(b[0]),l2=rad(b[1]),x=Math.cos(p1)*Math.cos(l1)+Math.cos(p2)*Math.cos(l2),y=Math.cos(p1)*Math.sin(l1)+Math.cos(p2)*Math.sin(l2),zz=Math.sin(p1)+Math.sin(p2);return [deg(Math.atan2(zz,Math.sqrt(x*x+y*y))),deg(Math.atan2(y,x))]}
  /* 航路選擇：直飛大圓，或經過中點往南／北偏 s 度的航點（多飛的距離照算），取最快 —— 長程冬季往東會靠向噴射氣流、往西會避開 */
  var SH={L:[-30,-25,-20,-15,-10,-5,0,5,10,15],M:[-6,-3,0,3,6],S:[-2,0,2]};
  function airH(A,B,d,tas,win){var S0=d>6000?SH.L:(d>2500?SH.M:SH.S),D0=hav(A,B)||1,best=1e9;
    S0.forEach(function(s){var segs;if(!s)segs=[[A,B]];else{var m=midpt(A,B),wp=[Math.max(-80,Math.min(80,m[0]+s)),m[1]];segs=[[A,wp],[wp,B]]}
      var tt=0;segs.forEach(function(pq){var L=hav(pq[0],pq[1]),pts=path(pq[0],pq[1],10),tail=0;pts.forEach(function(o){tail+=u(o.lat,win,o.lon)*o.east});tail/=Math.max(1,pts.length);tt+=(d*L/D0)*1.03/Math.max(400,tas+tail)});
      if(tt<best)best=tt});return best}
  /* 擁擠程度：網站自己的班表 —— 這個機場在這個時刻前後 30 分鐘有幾班起飛／降落（KGM＋聯營），再加上大機場整體的平滑尖峰曲線 */
  var DENS=null;
  function dens(){if(DENS)return DENS;var D={dep:{},arr:{}};
    try{[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.via)return;var a=mn(f.dep),b=mn(f.arr);(D.dep[f.fr]=D.dep[f.fr]||[]).push(a);(D.arr[f.to]=D.arr[f.to]||[]).push(b)})}catch(_){}
    DENS=D;return D}
  function near(L,m){var n=0;(L||[]).forEach(function(x){var d=Math.abs(((x-m)%1440+1440)%1440);if(d>720)d=1440-d;if(d<=30)n++});return n}
  function curve(ap,m){var h=(((m%1440)+1440)%1440)/60,v=6*g(h,8,1.6)+5*g(h,18.5,1.8)+2*g(h,13,1.5)-3*g(h,2.5,2.5);return v*(BIG[ap]?1.4:0.8)}
  function deice(ap,m,win){if(!win)return 0;var G=geo(ap);if(!G||G[0]<36)return 0;var h=(((m%1440)+1440)%1440)/60,full=G[0]>=42?10:5;
    return full*Math.max(g(h,7,2.2),0.5*g(h,21,2.5))}
  function tout(ap,m,win){return 14+Math.min(12,0.5*near(dens().dep[ap],m))+curve(ap,m)+deice(ap,m,win)}
  function tin(ap,m){return 7+Math.min(8,0.35*near(dens().arr[ap],m))+0.7*curve(ap,m)}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function typeOf(f,x){var t=String((x&&x.acft)||(f&&f.acft)||'');if(TAS[t])return t;return 'B789'}
  window.kgmWindFlightR1025B=function(f,x,su,bs,date){
    var a=geo(f.fr),b=geo(f.to);if(!a||!b)return null;
    var d=0;try{d=+distOf(f.fr,f.to)||0}catch(_){d=0}if(d<300)return null;
    var ty=typeOf(f,x),tas=TAS[ty];
    var air=(airH(a,b,d,tas,true)-airH(a,b,d,tas,false))*60;
    var off=0;try{off=Math.round((TZ[f.to]-TZ[f.fr])*60)||0}catch(_){}
    var ds=mn(su.dep),dw=mn(x.dep),as=ds+bs+off,aw=dw+bs+air+off;
    var gnd=(tout(f.fr,dw,true)-tout(f.fr,ds,false))+(tin(f.to,aw)-tin(f.to,as));
    var w=Math.round((air+gnd)/5)*5;w=Math.max(-60,Math.min(75,w));
    return {w:w,air:Math.round(air),gnd:Math.round(gnd),type:ty}};
})();

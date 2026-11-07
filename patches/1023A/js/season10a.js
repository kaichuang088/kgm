    /* 1010A #1：冬夏季時刻
       使用者：「冬季班表和夏季至少會有 10–15 分鐘差別（短程），長程可能差到超過一小時，很多現有航班時間需要調整，因為很多都是一樣的」
              「TPE-NRT／TSA-HND 統一 3hr05mins」「KX20 TPE-NRT 3hr30mins（第五航權，時間抓長一點比較安全）」
       原因：r68 自動產生冬季時刻的位移表裡有「−10 分」一格，另有幾班人工鎖定的時刻冬夏完全一樣（差 0–5 分）。
       · 台北桃園→成田、松山→羽田：夏冬兩季飛行時間一律 3 小時 05 分；KX20 台北→成田 3 小時 30 分（成田中停仍是 75 分，後段跟著順延）。
       · 冬夏季起飛時間差不足 15 分的才改（只改冬季，夏季不動）：短程改成差 15–25 分、長程（飛行 5 小時以上）改成差 40–70 分；
         同一個城市對去回程用同一個方向與幅度；冬季不往 00:00–06:00 推（原本就在這個時段的除外）、起飛不跨過午夜，不在 03:00–03:59 抵達。
       · 第五航權後段的時刻由前段＋中停 75 分決定（r179）：前段冬季移 x 分、後段也移 x 分，x 取同時讓兩段都符合的最小值。
       · 改過的季節紀錄標成人工排定（seededR57=0），r68 每次重畫不會再改回去。 */
    function m10(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
    function h10(v){v=((Math.round(v)%1440)+1440)%1440;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
    function tz10(a){try{return (TZ&&TZ[a]!=null)?TZ[a]:8}catch(_){return 8}}
    function hs10(s){var h=0;s=String(s);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
    function blk10(f,r){try{return blockMin(f.fr,f.to,r.dep,r.arr,+r.dd||0)}catch(_){return 0}}
    function setArr10(f,r,dur){var local=m10(r.dep)+dur+Math.round((tz10(f.to)-tz10(f.fr))*60);r.arr=h10(local);r.dd=Math.floor(local/1440)}
    function rowSync10(f,o){var s=o&&o.summer;if(!s||!s.dep)return;if(f.dep!==s.dep||f.arr!==s.arr||(+f.dd||0)!==(+s.dd||0)){f.dep=s.dep;f.arr=s.arr;f.dd=+s.dd||0;try{f.dur=blockMin(f.fr,f.to,f.dep,f.arr,f.dd);f.durStr=durStr(f.dur)}catch(_){}}}
    function night10(t){var x=((t%1440)+1440)%1440;return x<360}
    var SEALOG10=[];window.KGM_SEASON_LOG_R1010A=SEALOG10;
    window.kgmSeasonPassR1010A=function(){
      var n=0;
      try{
        var ST=S.seasonSchedulesR48=S.seasonSchedulesR48||{},ALL=[].concat(FLIGHTS,S.customFlights||[]).filter(Boolean);
        var legs=ALL.filter(function(f){return !f.via&&!f.partner&&!f.codeshare});
        var leg=function(c,a,b){return legs.filter(function(f){return f.code===c&&f.fr===a&&f.to===b})[0]||null};
        var L2={},L1of={};ALL.forEach(function(V){if(!V||!V.via||V.partner)return;var a=leg(V.code,V.fr,V.via),b=leg(V.code,V.via,V.to);if(a&&b){L2[[b.code,b.fr,b.to].join('|')]=1;L1of[[b.code,b.fr,b.to].join('|')]=a}});
        var K=function(f){return [f.code,f.fr,f.to].join('|')};
        var freeze=function(o){o.seededR57=0;o.pinnedR1010A=1};
        /* ① 成田／羽田 3h05、KX20 3h30；KX240 峇里島 5h00（冬季原本被 r131 拉開成 4h50） */
        legs.forEach(function(f){
          var want=(f.fr==='TPE'&&f.to==='NRT')?(f.code==='KX20'?210:185):((f.fr==='TSA'&&f.to==='HND')?185:((f.code==='KX240'&&f.fr==='TPE'&&f.to==='DPS')?300:0));if(!want)return;   /* KX240 台北→峇里島：使用者指定夏 18:45-23:45、冬 01:05-06:05，兩季都是 5 小時 */
          var o=ST[K(f)];if(!o)return;
          o.blockFixedR1010A=1;
          ['summer','winter'].forEach(function(sea){var r=o[sea];if(!r||!r.dep)return;if(blk10(f,r)!==want){var was=r.dep+'-'+r.arr;setArr10(f,r,want);freeze(o);n++;SEALOG10.push(K(f)+' '+sea+' 飛行時間 → '+want+' 分（'+was+' → '+r.dep+'-'+r.arr+'）')}});
          rowSync10(f,o);
        });
        /* ② 冬夏季起飛時間差（只改不足 15 分的；夏季不動，只移冬季）
           第五航權：後段冬季起飛＝前段冬季抵達＋75 分（r179），所以前段移 x 分、後段也移 x 分 ——
           前段一次找一個 x，同時讓前段、後段都滿足（回台北的後段不早於 07:00）。 */
        var dif=function(o){var c=m10(o.winter.dep)-m10(o.summer.dep);if(c>720)c-=1440;if(c<-720)c+=1440;return c};
        var runs=function(o){var s=o&&o.summer,w=o&&o.winter;if(!s||!w||!s.dep||!w.dep)return false;
          var no=function(d){return d==='none'||(Array.isArray(d)&&!d.length)};return !no(s.days)&&!no(w.days)};
        var okT=function(dep,arr,sdep,sarr){var nd=((dep%1440)+1440)%1440,na=((arr%1440)+1440)%1440;
          if(night10(nd)&&!night10(m10(sdep)))return false;if(night10(na)&&!night10(m10(sarr)))return false;if(na>=180&&na<240)return false;return true};
        var NEED=15;
        var head={};Object.keys(L1of).forEach(function(k2){var a=L1of[k2];(head[K(a)]=head[K(a)]||[]).push(k2)});
        legs.forEach(function(f){
          var k=K(f);if(L2[k])return;var o=ST[k];if(!runs(o))return;
          var tails=(head[k]||[]).map(function(k2){return {k:k2,o:ST[k2],f:leg.apply(null,k2.split('|'))}}).filter(function(t){return t.f&&runs(t.o)});
          /* 外站過站至少 60 分（r132 的規則）：回程（外站→台北）冬季起飛要在去程冬季抵達 60 分以後；去程改了抵達也要讓回程來得及 */
          var BASE=['TPE','TSA'],num=parseInt(String(f.code).replace(/\D/g,''),10),gapOk=function(arrT,depT){var g=depT-arrT;while(g<0)g+=1440;g%=1440;return g===0||g>=60};
          var turnOk=function(x){try{
            if(BASE.indexOf(f.to)>=0&&BASE.indexOf(f.fr)<0){var po=ST['KX'+(num+1)+'|'+f.to+'|'+f.fr];if(po&&po.winter&&po.winter.arr&&!gapOk(m10(po.winter.arr),m10(o.winter.dep)+x))return false}
            if(BASE.indexOf(f.fr)>=0&&BASE.indexOf(f.to)<0){var pi=ST['KX'+(num-1)+'|'+f.to+'|'+f.fr];if(pi&&pi.winter&&pi.winter.dep&&!gapOk(m10(o.winter.arr)+x,m10(pi.winter.dep)))return false}
          }catch(_){}return true};
          var d1=dif(o),need=function(x){if(Math.abs(d1+x)<NEED)return false;if(x&&!turnOk(x))return false;
              var w=o.winter,s0=o.summer,wd=m10(w.dep)+x;if(wd<0||wd>=1440)return false;   /* 不跨午夜：跨過去就變成同一營運日的另一天 */if(x&&!okT(m10(w.dep)+x,m10(w.arr)+x+(+w.dd||0)*1440,s0.dep,s0.arr))return false;
              return tails.every(function(t){var d2=dif(t.o);if(Math.abs(d2+x)<NEED)return false;var nd=m10(t.o.winter.dep)+x;if(nd<0||nd>=1440)return false;
                if((t.f.to==='TPE'||t.f.to==='TSA')&&((nd%1440)+1440)%1440<420)return false;
                return !x||okT(nd,m10(t.o.winter.arr)+x+(+t.o.winter.dd||0)*1440,t.o.summer.dep,t.o.summer.arr)})};
          if(need(0))return;
          var bs=blk10(f,o.summer)||(+f.dur||0),long=bs>300,hp=hs10([f.fr,f.to].sort().join('|'));
          var cand=[];
          if(!tails.length){var mag=long?[40,50,60,70][hp%4]:[15,20,25][hp%3],sg=d1?(d1>0?1:-1):((hp>>3)%2?1:-1);
            cand.push(sg*mag-d1,-sg*mag-d1);for(var t=15;t<=90;t+=5){cand.push(sg*t-d1,-sg*t-d1)}}
          else{for(var x=5;x<=120;x+=5){cand.push(x,-x)}}
          var x=null;for(var i=0;i<cand.length;i++){if(cand[i]&&need(cand[i])){x=cand[i];break}}
          if(x==null){var nm=k+' 找不到符合條件的冬季時刻，未改';if(SEALOG10.indexOf(nm)<0)SEALOG10.push(nm);return}
          var w=o.winter,was=w.dep+'-'+w.arr;w.dep=h10(m10(w.dep)+x);var la=m10(w.arr)+x+(+w.dd||0)*1440;w.arr=h10(la);w.dd=Math.floor(la/1440);
          /* 冬季飛行時間不短於夏季（自動產生的冬季時刻有些比夏季短 15–20 分，例：台北→曼谷冬季只剩 2h55） */
          var sb=blk10(f,o.summer),wb=blk10(f,w);if(sb&&wb&&wb<sb)setArr10(f,w,sb);
          freeze(o);
          tails.forEach(function(t){freeze(t.o)});n++;
          SEALOG10.push(k+' 冬季 '+was+' → '+w.dep+'-'+w.arr+'（夏季 '+o.summer.dep+'，冬夏差 '+(d1+x)+' 分'+(tails.length?'；第五航權後段 '+tails.map(function(t){return t.k.split('|').slice(1).join('→')+' 跟著移 '+x+' 分'}).join('、'):'')+'）');
        });
        if(n&&typeof window.kgmFixFifthGroundR179==='function'){try{window.kgmFixFifthGroundR179()}catch(_){}}
        if(n){try{save()}catch(_){}try{if(window.kgmClearRotationCacheR72)window.kgmClearRotationCacheR72()}catch(_){}}
      }catch(e){try{console.warn('1010A season',e)}catch(_){}}
      return n;
    };
    try{window.kgmSeasonPassR1010A()}catch(_){}
    (function(){try{var p=window.kgmRepairTimetableR77;if(typeof p==='function'&&!p.__r1010A){var w=function(){var r=p.apply(this,arguments);try{window.kgmSeasonPassR1010A()}catch(_){}return r};w.__r1010A=1;window.kgmRepairTimetableR77=w}}catch(_){}})();

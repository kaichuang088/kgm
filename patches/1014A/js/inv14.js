    /* ══ 1014A：票價庫存紀錄（S.fareThirds0810P＝kgm7_fare3、S.seatInventory＝kgm_seatinv6）不再無限長大 ══
       原因（實測）：訂票頁每畫一次，就把「查詢日前後 4 天 × 這條航線每一班 × 各艙等三階」的自動庫存各記一筆（syncFareInventoryP），
       查一次 TPE→NRT 就多 670 筆、約 5 萬字元，而且從來不清；使用者查過幾十次之後這兩份就會撐到上百萬字元，存不進瀏覽器。
       這些自動紀錄每次打開訂票頁都會依同一套公式重新算出來，刪掉不影響售票。
       規則：
       · 兩份一起刪（r54 用「fareThirds 有沒有這一筆」判斷座位庫存是不是人工設定的，只刪一份會把自動值誤認成人工值）。
       · 只刪自動紀錄（fareThirds 裡有的鍵）；後台人工設定的座位數、AI 設定的、BigDeal 扣的（fareThirds 裡沒有）一律不動。
       · 已起飛（日期早於今天）的自動紀錄一律刪；自動紀錄還是超過 3,000 筆，就只留目前查詢日前後 4 天的。
       · 開頁 20 秒後整理一次，之後每 10 分鐘一次；存檔寫這兩份之前也先整理（超過上限才動）。 */
    (function invTrim1014A(){
      var CAP=3000;
      function dOf(k){var m=/_(\d{4}-\d\d-\d\d)_/.exec(k);return m?m[1]:''}
      function keepWin(){var w={};try{var s=S.search||{};[s.dep,s.ret].forEach(function(d){if(!d)return;for(var i=-4;i<=4;i++)w[addDays(d,i)]=1})}catch(_){}return w}
      window.kgmInvTrimR1014A=function(force){
        try{
          var ft=S.fareThirds0810P,si=S.seatInventory;if(!ft||typeof ft!=='object')return 0;
          var ks=Object.keys(ft);if(!force&&ks.length<=CAP)return 0;
          var td=todayISO(),n=0,over=false,win=null;
          ks.forEach(function(k){var d=dOf(k);if(d&&d<td){delete ft[k];if(si&&(k in si))delete si[k];n++}});
          ks=Object.keys(ft);
          if(ks.length>CAP){win=keepWin();ks.forEach(function(k){if(!win[dOf(k)]){delete ft[k];if(si&&(k in si))delete si[k];n++}});over=true}
          if(n){window.KGM_INV_TRIM_R1014A={at:new Date().toISOString(),removed:n,left:Object.keys(ft).length,over:over}}
          return n;
        }catch(_){return 0}
      };
      setTimeout(function(){try{if(window.kgmInvTrimR1014A(true))save()}catch(_){}},20000);
      setInterval(function(){try{if(window.kgmInvTrimR1014A(true))save()}catch(_){}},600000);
    })();

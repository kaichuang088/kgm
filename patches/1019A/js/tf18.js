/* 1018A：機型定案（使用者：「把一些長程航班給A339L短程給B78X…太多EQV了，有些航班直接Finalize一個機型…HKG/MFM這種EQV可以保留，
   一個航線也可以有幾個EQV…A35K最好不要飛太多短程」）。
   · A339L 改飛中長程：布里斯本、阿布達比、檀香山（經成田）、峇里島、雅加達、新加坡、吉隆坡（原本 13 架幾乎全在飛 1～3 小時的短程）；
   · 原本 EQV 的短程依航線定案：大部分給 B78X，其餘 A21N／A339R；成田五組各定一型（KX187/188 保留 EQV）；
   · 香港、澳門與 KX187/188 保留 EQV，EQV 機型池一律拿掉 A35K（A35K 只飛長程）。
   · 冬夏同一型（使用者說可以不同，這版先不拆，排班較穩）。
   放在最後一層的最前面：所有層加完航班列之後、開頁的機隊排班計時器跑之前改好，排班與畫面讀到的是同一份。 */
(function(){
  var MAP18={
    /* A339L 中長程 */
    KX57:'A339L',KX58:'A339L',KX65:'A339L',KX66:'A339L',KX19:'A339L',KX20:'A339L',KX237:'A339L',KX238:'A339L',
    KX243:'A339L',KX244:'A339L',KX277:'A339L',KX278:'A339L',KX289:'A339L',KX290:'A339L',KX221:'A339L',KX222:'A339L',
    /* A339R 短中程 */
    KX261:'A339R',KX262:'A339R',KX263:'A339R',KX264:'A339R',KX175:'A339R',KX176:'A339R',
    KX331:'A339R',KX332:'A339R',KX333:'A339R',KX334:'A339R',KX117:'A339R',KX118:'A339R',KX314:'A339R',KX315:'A339R',
    KX195:'A339R',KX196:'A339R',KX245:'A339R',KX246:'A339R',KX251:'A339R',KX252:'A339R',KX133:'A339R',KX134:'A339R',
    /* B78X 短程 */
    KX139:'B78X',KX140:'B78X',KX141:'B78X',KX142:'B78X',KX145:'B78X',KX146:'B78X',
    KX125:'B78X',KX126:'B78X',KX127:'B78X',KX128:'B78X',KX129:'B78X',KX130:'B78X',
    KX327:'B78X',KX328:'B78X',KX329:'B78X',KX330:'B78X',KX151:'B78X',KX152:'B78X',
    KX193:'B78X',KX194:'B78X',KX197:'B78X',KX198:'B78X',KX309:'B78X',KX310:'B78X',
    KX247:'B78X',KX248:'B78X',KX249:'B78X',KX250:'B78X',KX105:'B78X',KX106:'B78X',KX107:'B78X',KX108:'B78X',KX109:'B78X',KX110:'B78X',
    KX179:'B78X',KX180:'B78X',
    /* A21N 短程 */
    KX143:'A21N',KX144:'A21N',KX147:'A21N',KX148:'A21N',KX131:'A21N',KX132:'A21N',KX307:'A21N',KX308:'A21N',
    KX253:'A21N',KX254:'A21N',KX103:'A21N',KX104:'A21N',
    /* 成田：各班定一型（KX187/188 原本 EQV 偶爾抽到 A35K → 定 A359） */
    KX181:'A388',KX182:'A388',KX183:'A359',KX184:'A359',KX185:'B779',KX186:'B779',KX187:'A359',KX188:'A359'
  };
  /* 量了才發現：舊層開頁後還會在計時器裡把沖繩、關西、新千歲、首爾、PUS 等線改回 EQV（共 47 列），
     定案的機型被蓋掉 → 每一列的 acft 改成「讀＝定案機型、寫＝不理」，誰晚寫都蓋不掉；季節班表那一份也一起寫成同一型。 */
  var n=0;
  function pin18(o,t){try{Object.defineProperty(o,'acft',{get:function(){return t},set:function(){},enumerable:true,configurable:true})}catch(_){o.acft=t}}
  var SKIP18={'KX315|CKG':1};   /* 同一個班號兩條線：KX315 杭州→台北（定案）跟重慶→台北（原本 A21N，不動） */
  function hit18(f){return !(SKIP18[f.code+'|'+f.fr]||SKIP18[f.code+'|'+f.fr+'|'+f.to])}
  function apply18(){var m=0;
    try{(FLIGHTS||[]).forEach(function(f){if(!f||f.partner||f.codeshare)return;var t=MAP18[f.code];if(!t||!hit18(f))return;
      var d=Object.getOwnPropertyDescriptor(f,'acft');
      if(!(d&&d.get)){if(f.acft!==t){f.acftWasR1018A=f.acft;m++}pin18(f,t)}})}catch(_){}
    try{var ST=(typeof S!=='undefined'&&S.seasonSchedulesR48)||{};Object.keys(ST).forEach(function(k){var kp=String(k).split('|'),t=MAP18[kp[0]],v=ST[k];if(!t||!v)return;
      if(!hit18({code:kp[0],fr:kp[1],to:kp[2]}))return;   /* 季節班表也要照 SKIP18（KX315 重慶→台北那一份原本被釘成 A339R，r160 抓到） */
      ['summer','winter'].forEach(function(se){var r=v[se];if(r&&typeof r==='object'){var d=Object.getOwnPropertyDescriptor(r,'acft');if(!(d&&d.get))pin18(r,t)}})})}catch(_){}
    return m}
  n=apply18();
  try{['EQV_POOL','EQV_NO_388','EQV_WITH_388','EQV_HNL'].forEach(function(k){var a=window[k];if(Array.isArray(a)){var i;while((i=a.indexOf('A35K'))>=0)a.splice(i,1)}})}catch(_){}
  window.KGM_TYPEFIX_R1018A={n:n,map:MAP18};
  /* A330-900neo 標準版／區域版：r92 依班號雜湊平均分給兩種（班表寫 A339L、A339R 都不管）→ 定案的班照定案；
     沒定案的（香港、澳門等 EQV 抽到 A330）短程一律區域版 A339R、長程（7 小時以上或經停）才是 A339L，A339L 專心飛中長程。 */
  function long18(code){var n=parseInt(String(code).replace(/\D/g,''),10),pr='KX'+(n%2===0?n-1:n+1),lg=false;
    try{(FLIGHTS||[]).forEach(function(f){if(!f||f.partner||f.codeshare||(f.code!==code&&f.code!==pr))return;var q=+f.dur||0;try{if(!q)q=blockMin(f.fr,f.to,f.dep,f.arr,f.dd||0)||0}catch(_){}if(f.via||q>=420)lg=true})}catch(_){}return lg}
  var P330=window.kgmPick330R92;
  window.kgmPick330R92=function(code){var t=MAP18[code];if(t==='A339L'||t==='A339R')return t;try{return long18(code)?'A339L':'A339R'}catch(_){return P330?P330(code):'A339R'}};
  /* A35K 只飛長程：EQV 抽到 A35K 而航程不到 5,000 km → 改同族 A359 */
  function eqv18(){var e0=window.kgmEqvPlanR79;if(typeof e0!=='function'||e0.__r1018A)return;
    var w=function(code,date){var t=e0.apply(this,arguments);if(t==='A35K'){try{var f=(FLIGHTS||[]).filter(function(x){return x&&x.code===code&&!x.partner})[0];if(f&&distOf(f.fr,f.to)<5000)return 'A359'}catch(_){}}return t};w.__r1018A=1;window.kgmEqvPlanR79=w}
  eqv18();try{document.addEventListener('DOMContentLoaded',eqv18)}catch(_){}
  /* EQV 機型池（航線管理勾選的那份）讀出來時一律不含 A35K；r198 稍後才定義的話，到 DOMContentLoaded 再包一次 */
  function wrap18(){var p0=window.kgmEqvPoolR198;if(typeof p0!=='function'||p0.__r1018A)return;var w=function(){var r=p0.apply(this,arguments);return Array.isArray(r)?r.filter(function(t){return t!=='A35K'}):r};w.__r1018A=1;window.kgmEqvPoolR198=w}
  wrap18();try{document.addEventListener('DOMContentLoaded',wrap18)}catch(_){}
  /* 之後有人把定案的班又改回 EQV（舊層的開頁修正）→ 改回定案的機型 */
  /* 檢查用：回傳目前跟定案不一致的列數（應該永遠是 0）；同時補上後來才出現的列／季節班表 */
  window.kgmTypeFixApplyR1018A=function(){var bad=0;try{(FLIGHTS||[]).forEach(function(f){if(!f||f.partner||f.codeshare)return;var t=MAP18[f.code];if(t&&hit18(f)&&f.acft!==t)bad++})}catch(_){}apply18();return bad};
  try{document.addEventListener('DOMContentLoaded',function(){apply18();setTimeout(apply18,4000)})}catch(_){}
})();

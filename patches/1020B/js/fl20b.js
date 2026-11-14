/* 1020B：航班與機型調整（使用者 1020A 交付後逐條指定）。
   · 單一機型的改動直接改在上面 1018A 的 MAP18（KX104/103 改 A359、成田 KX180/179・KX188/187 改 A21N、KX120/119 改 A21N、KX398/397 改 A359、
     吉隆坡 KX224/223 改 A21N・KX220/219 改 A339R、河內 KX216/215 改 A21N、KX228/227 改 A21N、清邁 KX264/263 改 A21N、馬尼拉四組改 EQV）。
   · 這裡處理 MAP18 做不到的：
     ① 冬夏不同機型：KX304/303（台北—上海浦東—杜哈）夏季 EQV（只在 A359／B779 之間輪流，使用者選「A359/B779 輪流」）、冬季維持 A388；
        KX306/305（台北—上海浦東）冬季 A21N（使用者：「既然KX304都是A388了」），夏季維持 B779。
     ② 新航線 台北—杜哈：KX2/KX1 B779 每週四班、KX100/KX99 A359 每週三班（使用者原本兩組都叫 KX2/KX1，A359 那組 KX1 是前一天 KX2 的回程，
        會跟 B779 的 KX1 同一天兩班 → 使用者選改用 KX100/KX99）。2026-12-01 起飛（機隊輪轉起飛前 30 天定案，生效日放在定案範圍之外）。
     ③ 卡達航空（oneworld）聯營：杜哈轉歐洲的卡達航班掛 KX 代碼（原本 6 班＋新增 16 班，對準 KX2／KX100／KX304 到站與 KX1／KX99／KX303 出發），
        KGM 杜哈線掛 QR 代碼（上面 MKT19 加一列）。阿提哈德照舊。
     ④ 夥伴營運航班的機型：原本很多寫「Partner aircraft」或「Aircraft varies by date」（時刻表聯營頁機型欄是「—」），依航空公司與航程補上實際機型。 */
(function(){
  if(window.__kgmFl20B)return;window.__kgmFl20B=1;
  var SEAS20={KX304:{summer:'EQV',winter:'A388'},KX303:{summer:'EQV',winter:'A388'},KX306:{summer:'B779',winter:'A21N'},KX305:{summer:'B779',winter:'A21N'}};
  var EFF20='2026-12-01',NEW20={KX2:1,KX1:1,KX100:1,KX99:1};
  function pin(o,t){try{Object.defineProperty(o,'acft',{get:function(){return t},set:function(){},enumerable:true,configurable:true})}catch(_){o.acft=t}}
  function seasonal(){
    try{(FLIGHTS||[]).forEach(function(f){if(!f||f.partner||f.codeshare)return;var m=SEAS20[f.code];if(!m)return;var d=Object.getOwnPropertyDescriptor(f,'acft');if(!(d&&d.get))pin(f,m.summer)})}catch(_){}
    try{var ST=(typeof S!=='undefined'&&S.seasonSchedulesR48)||{};Object.keys(ST).forEach(function(k){var m=SEAS20[String(k).split('|')[0]],v=ST[k];if(!m||!v)return;
      ['summer','winter'].forEach(function(se){var r=v[se];if(!r||typeof r!=='object')return;var d=Object.getOwnPropertyDescriptor(r,'acft');if(!(d&&d.get))pin(r,m[se]);r.acftUserR928=1})})}catch(_){}
    /* EQV 機型池（航線管理同一份；管理端自己改過就不動） */
    try{var P=S.eqvPoolR198=S.eqvPoolR198||{};['KX303|PVG-TPE','KX303|DOH-PVG','KX303|DOH-TPE'].forEach(function(k){if(!P[k])P[k]={summer:['A359','B779'],winter:['A388']}})}catch(_){}
  }
  function effNew(){try{(FLIGHTS||[]).forEach(function(f){if(f&&!f.partner&&NEW20[f.code]&&(f.fr==='DOH'||f.to==='DOH')&&!f.effFrom)f.effFrom=EFF20})}catch(_){}}
  /* ③ 卡達航空：杜哈轉歐洲（時刻為當地時間；去程對準 KX2 05:40／KX304 15:10／KX100 23:05 到杜哈，回程對準 KX1 09:05／KX303 17:25／KX99 01:55 杜哈出發） */
  var QR20=[
    ['KX9520','DOH','MAD','07:55','13:25','QR147','Airbus A350-1000',0],['KX9521','MAD','DOH','15:15','23:45','QR148','Airbus A350-1000',0],
    ['KX9522','DOH','FCO','08:05','12:25','QR131','Boeing 787-9',0],['KX9523','FCO','DOH','14:00','21:20','QR132','Boeing 787-9',0],
    ['KX9524','DOH','AMS','07:35','12:55','QR273','Boeing 777-300ER',0],['KX9525','AMS','DOH','15:05','23:15','QR274','Boeing 777-300ER',0],
    ['KX9526','DOH','MUC','08:15','13:00','QR057','Airbus A350-900',0],['KX9527','MUC','DOH','15:30','22:55','QR058','Airbus A350-900',0],
    ['KX9528','DOH','ZRH','08:00','12:50','QR093','Boeing 787-9',0],['KX9529','ZRH','DOH','15:10','22:35','QR094','Boeing 787-9',0],
    ['KX9530','DOH','BCN','07:50','13:05','QR145','Airbus A350-900',0],['KX9531','BCN','DOH','15:00','23:05','QR146','Airbus A350-900',0],
    ['KX9532','DOH','MAN','07:40','12:15','QR023','Airbus A350-1000',0],['KX9533','MAN','DOH','14:20','00:15','QR024','Airbus A350-1000',1],
    ['KX9534','DOH','LHR','02:20','07:10','QR003','Airbus A380-800',0],['KX9535','LHR','DOH','21:25','07:15','QR012','Boeing 777-300ER',1]
  ];
  var QRSET20={QR001:'Boeing 777-300ER',QR002:'Boeing 777-300ER',QR069:'Airbus A350-1000',QR070:'Airbus A350-1000',QR037:'Boeing 777-300ER',QR038:'Boeing 777-300ER'};
  function addQr(){
    try{
      QR20.forEach(function(a){
        if(FLIGHTS.some(function(f){return f&&f.code===a[0]}))return;
        var f={code:a[0],fr:a[1],to:a[2],dep:a[3],arr:a[4],dd:a[7]||0,days:'daily',via:null,partner:true,oneworld:true,partnerType:'codeshare',
          operatorFlight:a[5],operator:'Qatar Airways',partnerEquipment:a[6],partnerRevenueShare:.18,qrR1020B:1};
        try{f.dur=blockMin(f.fr,f.to,f.dep,f.arr,f.dd);f.durStr=durStr(f.dur)}catch(_){}
        var k='CS_'+f.code;try{AC[k]={nm:'Qatar Airways · '+a[5]+' · oneworld',seats:280,hasFirst:false,hasSuite:false,hasWifi:true,avgAge:'—',cabins:{econ:{rows:1,cfg:'',seats:0,lay:[]}}}}catch(_){}
        f.acft=k;FLIGHTS.push(f);
      });
      FLIGHTS.forEach(function(f){if(f&&f.partner&&f.operator==='Qatar Airways'){f.partnerType='codeshare';if(QRSET20[f.operatorFlight])f.partnerEquipment=QRSET20[f.operatorFlight]}});
    }catch(_){}
  }
  /* ④ 夥伴機型：依航空公司＋航程（km） */
  var EQ20={
    'American Airlines':[[1800,'Airbus A321'],[4500,'Boeing 737 MAX 8'],[1e9,'Boeing 787-9']],
    'Alaska Airlines':[[1e9,'Boeing 737-900ER']],
    'Japan Airlines':[[2500,'Boeing 737-800'],[1e9,'Boeing 787-9']],
    'Cathay Pacific':[[3000,'Airbus A321neo'],[1e9,'Airbus A350-900']],
    'Qantas':[[2500,'Boeing 737-800'],[1e9,'Airbus A330-300']],
    'Malaysia Airlines':[[3000,'Boeing 737-800'],[1e9,'Airbus A330-300']],
    'British Airways':[[2500,'Airbus A320neo'],[1e9,'Boeing 777-200ER']],
    'Iberia':[[2500,'Airbus A320neo'],[1e9,'Airbus A350-900']],
    'Finnair':[[2500,'Airbus A321'],[1e9,'Airbus A350-900']],
    'Etihad Airways':[[4000,'Airbus A321'],[1e9,'Boeing 787-9']],
    'Qatar Airways':[[3500,'Airbus A320'],[1e9,'Boeing 777-300ER']]
  };
  function km(a,b){try{return typeof distOf==='function'?(distOf(a,b)||0):0}catch(_){return 0}}
  function fillEq(){
    var n=0;
    try{FLIGHTS.forEach(function(f){
      if(!f||!f.partner)return;var e=String(f.partnerEquipment||'');
      if(e&&!/^(partner aircraft|aircraft varies by date)$/i.test(e))return;   /* 「Aircraft varies by date」也沒寫機型 → 一樣補 */
      var t=EQ20[f.operator];if(!t){return}
      var d=km(f.fr,f.to);if(!d){try{d=(+f.dur||0)*12}catch(_){d=0}}
      for(var i=0;i<t.length;i++)if(d<t[i][0]){f.partnerEquipment=t[i][1];n++;break}
    })}catch(_){}
    window.KGM_PEQ_R1020B=n;return n;
  }
  /* ①b EQV 實際挑機型：KX304 有上海中停（第五航權）會走長程的通用 EQV 池（r79，含 B789），不看航線池 →
     夏季 KX304／303 一律照航線池（A359／B779）挑；回程 KX303 跟同一天的去程同一型（同一架飛機）。 */
  function pick20(date){var t=null;try{t=window._eqvTypeFor?window._eqvTypeFor('KX304','TPE','PVG',date):null}catch(_){}
    if(t==='A359'||t==='B779')return t;var h=0,s=String(date);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h%2?'B779':'A359'}
  function sea20(date){try{return window.kgmSeasonR57?window.kgmSeasonR57(date):'summer'}catch(_){return 'summer'}}
  function eqvWrap(){var e0=window.kgmEqvPlanR79;if(typeof e0!=='function'||e0.__r1020B)return;
    var w=function(code,date){if((code==='KX304'||code==='KX303')&&date&&sea20(date)==='summer')return pick20(date);return e0.apply(this,arguments)};
    w.__r1020B=1;window.kgmEqvPlanR79=w;try{if(window.kgmClearEqvPlanR79)window.kgmClearEqvPlanR79()}catch(_){}}
  window.kgmKx304TypeR1020B=function(date){return sea20(date)==='summer'?pick20(date):'A388'};
  /* 但第五航權航班在 r71「長程一定要有豪經」那層就把 'EQV' 當成「沒有豪經的機型」直接換成 B789，根本輪不到 EQV 計畫 →
     最外層再包一次：KX304／303 夏季、沒有人工換機時，裡面回 A359／B779 以外的（＝r71 的 B789）一律改回輪流的那一型。
     日期一律換成整趟行程的出發日（KX303 上海→台北是隔天那一段），去程與回程、前後兩段同一型。 */
  function origin20(code,fr,to,date){try{if(fr&&to&&window.kgmViaOriginR929){var o=window.kgmViaOriginR929(code,fr,to,date);if(o&&o.date)return o.date}}catch(_){}
    if(code==='KX303'&&fr==='PVG'&&to==='TPE'){try{return addDays(date,-1)}catch(_){}}return date}
  function acWrap(){var a0=window.acftOfFlight;if(typeof a0!=='function'||a0.__r1020B)return;
    var w=function(code,date,fr,to){var t=a0.apply(this,arguments);
      try{if((code==='KX304'||code==='KX303')&&date&&t!=='A359'&&t!=='B779'){var od=origin20(code,fr,to,date);
        if(sea20(od)==='summer'){var sub=(S.acftSub||{})[code+'_'+date],ov=(S.flightOverrides||{})[code+'_'+date];
          if(!(sub&&(sub.sub||sub.to||sub.acft))&&!(ov&&ov.acft))return pick20(od)}}}catch(_){}
      return t};
    w.__r1020B=1;window.acftOfFlight=w;try{acftOfFlight=w}catch(_){}}
  function run(){seasonal();effNew();addQr();fillEq();eqvWrap();acWrap()}
  run();
  window.kgmFl20ApplyR1020B=run;
  try{document.addEventListener('DOMContentLoaded',function(){run();setTimeout(run,4000)})}catch(_){}
})();

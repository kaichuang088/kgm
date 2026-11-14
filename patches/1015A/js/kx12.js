    /* 1012A #13：KX6/KX5 與 KX4/KX3 班號互換（使用者：「KX6/KX5 和 KX4/KX3 航班號碼互換；KX4（新）我想改成週一、週三、週六，
       我給你夏季的時間你自己調整冬季的，其餘天數維持；KX6 10:55-07:25、KX5 09:50-14:50+1」；
       更正：「KX4 是有三天早上四天下午出發 A359，KX6 是半夜出發同時間 A388」）。
       · A380 那一組（原 KX4/KX3）改叫 KX6/KX5：每天飛、時刻不變（KX6 半夜 23:55 出發）。
       · A350-900 那一組（原 KX6/KX5）改叫 KX4/KX3：每天飛；一三六改早上（夏 KX4 10:55–07:25、KX3 09:50–14:50+1），
         其餘四天維持原本下午的時刻（夏 17:45–14:15／16:45–21:45+1）。
       · 冬季照系統裡美西線原本的推法（同一條線冬季起飛提早 30 分、飛行時間多 45 分）：早上那組 KX4 10:25–07:40、KX3 09:20–15:05+1。
       · 生效日 2026-11-29（週日）起 —— 機隊輪轉在起飛前 30 天定案，生效日放在定案範圍之外。飛機與時刻在交界日完全接得上
         （A380 只是改號；11-29 是週日，A350 走下午原時刻）。生效日以前（含過去的日子）一律照舊班號：過去的競標、名單、班表都不動。
       · 同一班號兩組時刻（像 KX24／KX23 西雅圖二四六、一三五日）：季節表一個班號只有一筆，原本第二組會被套成第一組的時刻
         （KX24 二四六 11:40 在搜尋頁、機隊排班都變成 19:05）。這裡依該列（或當天星期幾）挑對那一組，冬季套同樣位移（r132 kgmSeasonVariantsR132）。 */
    var EFF12='2026-11-29';
    var OLD12={KX4:{fr:'TPE',to:'LAX',acft:'A388',summer:['23:55','20:25',0],winter:['23:25','20:40',0]},
               KX3:{fr:'LAX',to:'TPE',acft:'A388',summer:['00:30','05:30',1],winter:['00:00','05:45',1]},
               KX6:{fr:'TPE',to:'LAX',acft:'A359',summer:['17:45','14:15',0],winter:['17:15','14:30',0]},
               KX5:{fr:'LAX',to:'TPE',acft:'A359',summer:['16:45','21:45',1],winter:['16:15','22:00',1]}};
    /* 新定義：季節表那一筆＝下午那組（跟 KX24 一樣，季節表對應第一列）；早上那組由底表＋位移推出 */
    var NEW12={KX6:{fr:'TPE',to:'LAX',acft:'A388',days:'daily',summer:['23:55','20:25',0],winter:['23:25','20:40',0]},
               KX5:{fr:'LAX',to:'TPE',acft:'A388',days:'daily',summer:['00:30','05:30',1],winter:['00:00','05:45',1]},
               KX4:{fr:'TPE',to:'LAX',acft:'A359',days:[2,4,5,7],summer:['17:45','14:15',0],winter:['17:15','14:30',0],am:['10:55','07:25',0]},
               KX3:{fr:'LAX',to:'TPE',acft:'A359',days:[2,4,5,7],summer:['16:45','21:45',1],winter:['16:15','22:00',1],am:['09:50','14:50',1]}};
    function old12(code,date){return !!OLD12[code]&&!!date&&String(date)<EFF12}
    function sea12(date){try{return window.kgmSeasonR57?window.kgmSeasonR57(date):(date>='2026-10-25'&&date<'2027-03-28'?'winter':'summer')}catch(_){return 'summer'}}
    function iso12(d){try{return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}catch(_){return ''}}
    function dow12(date){return new Date(String(date).slice(0,10)+'T12:00:00Z').getUTCDay()||7}
    function mws12(date){var g=dow12(date);return g===1||g===3||g===6}
    /* ── 同一班號兩組時刻：挑對那一組 ── */
    var VC12={};
    function variants12(code,fr,to){
      try{var s=(S.seasonSchedulesR48||{})[code+'|'+fr+'|'+to];if(!s||!s.summer||!s.winter||!window.kgmSeasonVariantsR132)return null;
        var k=code+'|'+fr+'|'+to,sig=[FLIGHTS.length,s.summer.dep,s.summer.arr,s.winter.dep,s.winter.arr].join('|'),c=VC12[k];
        if(c&&c.sig===sig)return c.v;var v=window.kgmSeasonVariantsR132(code,fr,to);VC12[k]={sig:sig,v:v};return v}catch(_){return null}}
    /* byDow：搜尋結果這種「當天有飛的那一班」，先看星期幾（傳進來的時刻可能已被前面的圖層套錯）；其他情況先看該列底表時刻 */
    function rowSeason12(f,date,sea,byDow){
      try{if(!f||f.via||f.partner||!date)return null;if(!window.kgmMultiRowR143||!window.kgmMultiRowR143(f))return null;
        var V=variants12(f.code,f.fr,f.to);if(!V||V.length<2)return null;sea=sea||sea12(date);
        var hit=null,g=dow12(date);
        function byDep(){V.forEach(function(v){if(!hit&&f.dep&&(v.summer.dep===f.dep||v.winter.dep===f.dep))hit=v})}   /* 底表那一列（或已套季節的那一列） */
        function byDay(){V.forEach(function(v){var d=v.days;if(!hit&&Array.isArray(d)&&d.indexOf(g)>=0)hit=v})}   /* 當天星期幾 */
        if(byDow){byDay();if(!hit)byDep()}else{byDep();if(!hit)byDay()}
        if(!hit)return null;var a=hit[sea]||hit.summer,pw=sea==='winter'&&PDFWIN12[f.code+'|'+f.fr+'|'+f.to+'|'+hit.summer.dep];
        if(pw)return {dep:pw[0],arr:pw[1],dd:pw[2]};
        return {dep:a.dep,arr:a.arr,dd:+a.dd||0}}catch(_){return null}}
    /* 時刻表 PDF 已公告的冬季時刻（KX24／KX23 二四六那組；網站以前把這組顯示成另一組的時刻，從來沒有對上過）——照 PDF */
    var PDFWIN12={'KX24|TPE|SEA|11:40':['11:30','07:50',0],'KX23|SEA|TPE|10:15':['10:05','14:05',1]};
    window.kgmKxSwapR1012A={eff:EFF12,isOld:old12,OLD:OLD12,NEW:NEW12,rowSeason:rowSeason12};
    /* 季節班表：四班改成新定義（使用者指定，鎖定不被自動推算蓋掉） */
    try{S.seasonSchedulesR48=S.seasonSchedulesR48||{};Object.keys(NEW12).forEach(function(c){var n=NEW12[c],k=c+'|'+n.fr+'|'+n.to,o=S.seasonSchedulesR48[k];
        if(o&&o.userR1012B)return;
        function rec(a){return {dep:a[0],arr:a[1],dd:a[2],acft:n.acft,days:n.days}}
        S.seasonSchedulesR48[k]={summer:rec(n.summer),winter:rec(n.winter),seededR57:0,winterBlockR68:0,pinnedR179:1,userR1012A:1,userR1012B:1,updatedAt:new Date().toISOString()};
        var f=[].concat(FLIGHTS).filter(function(x){return x&&!x.via&&x.code===c&&x.fr===n.fr&&x.to===n.to})[0];
        if(f&&window.kgmClearDerivedOverridesR57){try{window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}catch(_){}}})}catch(_){}
    function oldRow12(f){var o=OLD12[f.code];return !!(o&&!f.via&&f.fr===o.fr&&f.to===o.to)}
    function amRow12(f){var n=NEW12[f.code];return !!(n&&n.am&&f.dep===n.am[0])}
    /* 生效日以前：班表、飛行日、機型照舊；生效日起同一班號兩組時刻各自正確 */
    function wrapSwap12(){
      var g1=window.kgmSeasonFlightR48;if(typeof g1==='function'&&!g1.__r1012K){
        var w1=function(f,date){var x=g1.apply(this,arguments);try{if(f&&!f.partner&&!f.via&&x){
            if(old12(f.code,date)&&oldRow12(f)){var o=OLD12[f.code],a=o[sea12(date)];return Object.assign({},x,{dep:a[0],arr:a[1],dd:a[2],acft:o.acft,days:'daily',oldSchedR1012A:1})}
            var v=rowSeason12(f,date);if(v&&(v.dep!==x.dep||v.arr!==x.arr))return Object.assign({},x,v,{rowSeasonR1012A:1})}}catch(_){}return x};
        Object.keys(g1).forEach(function(k){try{w1[k]=g1[k]}catch(_){}});w1.__r1012K=1;window.kgmSeasonFlightR48=w1}
      var g2=window.flyOn;if(typeof g2==='function'&&!g2.__r1012K){
        var w2=function(f,d){try{if(f&&!f.partner&&!f.via&&OLD12[f.code]&&d&&d.getFullYear&&oldRow12(f)){var ds=iso12(d);
          if(old12(f.code,ds)){if(amRow12(f))return false;   /* 舊班表一天一班：早上那一列生效日前不飛 */
            return !(S.flightDisabled&&S.flightDisabled[f.code+'_'+f.fr+'_'+f.to])}}}catch(_){}return g2.apply(this,arguments)};
        Object.keys(g2).forEach(function(k){try{w2[k]=g2[k]}catch(_){}});w2.__r1012K=1;window.flyOn=w2;try{flyOn=w2}catch(_){}}
      var g3=window.acftOfFlight;if(typeof g3==='function'&&!g3.__r1012K){
        /* 生效日以前：時刻表給的機型（新定義）換回舊機型；人工換機、維修改派等其他結果照原本的 */
        var w3=function(code,date){var r=g3.apply(this,arguments);try{if(old12(code,date)&&r===NEW12[code].acft)return OLD12[code].acft}catch(_){}return r};
        Object.keys(g3).forEach(function(k){try{w3[k]=g3[k]}catch(_){}});w3.__r1012K=1;window.acftOfFlight=w3;try{acftOfFlight=w3}catch(_){}}
      /* 單一航段的季節時刻（r205，第五航權／航班動態用）也是直接讀季節表 */
      var g4=window.kgmSeasonLegR205;if(typeof g4==='function'&&!g4.__r1012K){
        var w4=function(code,fr,to,date){var r=g4.apply(this,arguments);try{if(!r)return r;var o=OLD12[code];
          if(o&&o.fr===fr&&o.to===to&&old12(code,date)){var a=o[sea12(date)];return Object.assign({},r,{dep:a[0],arr:a[1],dd:a[2],acft:o.acft})}
          var v=rowSeason12({code:code,fr:fr,to:to},date);if(v)r=Object.assign({},r,v)}catch(_){}return r};
        w4.__r1012K=1;window.kgmSeasonLegR205=w4}
    }
    wrapSwap12();[0,500,1500,4000].forEach(function(ms){setTimeout(wrapSwap12,ms)});
    /* 已訂位、競標、升等申請：生效日起的舊班號改到新班號（A380 KX4/KX3 → KX6/KX5 時刻不變；A350 KX6/KX5 → KX4/KX3，一三六改早上），
       通知旅客；生效日以前的不動。只搬「起飛時間是舊時刻」的航段（互換後才訂的不會再被搬），紀錄只搬一次。 */
    var NEWCODE12={KX4:'KX6',KX3:'KX5',KX6:'KX4',KX5:'KX3'};
    function newRow12(c,date){var x=NEW12[c],L=[].concat(FLIGHTS).filter(function(f){return f&&!f.via&&!f.partner&&f.code===c&&f.fr===x.fr&&f.to===x.to});
      if(L.length<2)return L[0];var am=mws12(date);return L.filter(function(f){return amRow12(f)===am})[0]||L[0]}
    function migrate12(){
      if(S.kxSwapR1012A&&S.kxSwapR1012A.v===2)return;var n=0,ntf=0;
      function segFix(b,key,seg){var f=b[key];if(!f||!OLD12[f.code]||!f.date||old12(f.code,f.date)||f.via||f.kxSwapR1012A)return null;var o=OLD12[f.code];if(f.fr!==o.fr||f.to!==o.to)return null;
        if(f.dep&&f.dep!==o.summer[0]&&f.dep!==o.winter[0])return null;
        var nc=NEWCODE12[f.code],br=newRow12(nc,f.date);if(!br)return null;var nf=Object.assign({},window.kgmSeasonFlightR48(br,f.date),{date:f.date,kxSwapR1012A:f.code});
        var was=f.code+' '+f.dep,acChg=OLD12[f.code].acft!==NEW12[nc].acft;b[key]=nf;n++;
        if(acChg&&seg){try{b.seats=b.seats||{};b.seats[seg]={};if(b.boardingPass)delete b.boardingPass[seg]}catch(_){}}
        return {from:was,to:nc+' '+nf.dep,date:f.date,acChg:acChg,timeChg:was.split(' ')[1]!==nf.dep}}
      (S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled')return;var ch=[];
        ['outF','inbF'].forEach(function(k){var r=segFix(b,k,k==='outF'?'out':'inb');if(r)ch.push(r)});
        (b.mcFlights||[]).forEach(function(m){if(m&&m.f){var r=segFix(m,'f');if(r)ch.push(r)}});
        if(ch.length){b.schedChgR1012A=ch;ntf++;try{_pushBkNotif(b,'【班號'+(ch.some(function(c){return c.timeChg})?'／時刻':'')+'異動】'+ch.map(function(c){return c.date+' '+c.from+' → '+c.to}).join('；')+'（KGM 洛杉磯航線班號調整，自 '+EFF12+' 起生效；機型不變）。如需改期或退票可免費辦理。')}catch(_){}}});
      [S.residenceBidsR83,S.resMileBidsR161,S.bigDeals,S.upgradeReqs].forEach(function(arr){(arr||[]).forEach(function(x){if(x&&OLD12[x.code]&&x.date&&!old12(x.code,x.date)&&!x.codeWasR1012A){x.codeWasR1012A=x.code;x.code=NEWCODE12[x.code];n++}})});
      S.kxSwapR1012A={v:2,at:new Date().toISOString(),records:n,bookings:ntf,eff:EFF12};try{save()}catch(_){}}
    window.kgmKxSwapR1012A.migrate=migrate12;
    setTimeout(function(){try{migrate12()}catch(e){try{console.warn('1012A kx swap',e)}catch(_){}}},1200);

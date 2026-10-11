    /* 1012A #13：KX6/KX5 與 KX4/KX3 班號互換＋新時刻。使用者：「KX6/KX5 和 KX4/KX3 航班號碼互換；KX4（新）我想改成週一、週三、週六，
       我給你夏季的時間你自己調整冬季的，其餘天數維持；KX6 10:55-07:25、KX5 09:50-14:50+1」。
       解讀：A380 那一組（原 KX4/KX3）改叫 KX6/KX5、每天飛、改成新時刻；A350-900 那一組（原 KX6/KX5）改叫 KX4/KX3、只飛一三六、時刻不變。
       生效日：2026-11-29（週日）起 —— 機隊輪轉在起飛前 30 天定案，生效日放在定案範圍之外；週日新 KX4/KX3 不飛，
       當天凌晨的舊 KX3（接前一晚的舊 KX4）照飛，兩組飛機都接得上，不必調機。
       生效日以前（含已經過去的日子）一律照舊班表：過去的競標、旅客名單、組員班表、機隊輪轉都保留原本的班號與機型。
       冬季（新 KX6/KX5）照系統裡美西線原本的冬季推法（同一條線的舊 KX4/KX3、KX6/KX5 都是：冬季起飛提早 30 分、飛行時間多 45 分）：
       KX6 10:25–07:40、KX5 09:20–15:05+1（洛杉磯地面 1 小時 40 分，過站足夠）。 */
    var EFF12='2026-11-29';
    var OLD12={KX4:{fr:'TPE',to:'LAX',acft:'A388',summer:['23:55','20:25',0],winter:['23:25','20:40',0]},
               KX3:{fr:'LAX',to:'TPE',acft:'A388',summer:['00:30','05:30',1],winter:['00:00','05:45',1]},
               KX6:{fr:'TPE',to:'LAX',acft:'A359',summer:['17:45','14:15',0],winter:['17:15','14:30',0]},
               KX5:{fr:'LAX',to:'TPE',acft:'A359',summer:['16:45','21:45',1],winter:['16:15','22:00',1]}};
    var NEW12={KX6:{fr:'TPE',to:'LAX',acft:'A388',days:'daily',summer:['10:55','07:25',0],winter:['10:25','07:40',0]},
               KX5:{fr:'LAX',to:'TPE',acft:'A388',days:'daily',summer:['09:50','14:50',1],winter:['09:20','15:05',1]},
               KX4:{fr:'TPE',to:'LAX',acft:'A359',days:[1,3,6],summer:['17:45','14:15',0],winter:['17:15','14:30',0]},
               KX3:{fr:'LAX',to:'TPE',acft:'A359',days:[1,3,6],summer:['16:45','21:45',1],winter:['16:15','22:00',1]}};
    function old12(code,date){return !!OLD12[code]&&!!date&&(code==='KX3'?date<=EFF12:date<EFF12)}
    function sea12(date){try{return window.kgmSeasonR57?window.kgmSeasonR57(date):(date>='2026-10-25'&&date<'2027-03-28'?'winter':'summer')}catch(_){return 'summer'}}
    function iso12(d){try{return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}catch(_){return ''}}
    function mws12(date){var g=new Date(date+'T12:00:00Z').getUTCDay();return g===1||g===3||g===6}
    window.kgmKxSwapR1012A={eff:EFF12,isOld:old12,OLD:OLD12,NEW:NEW12};
    /* 季節班表：四班改成新定義（使用者指定，鎖定不被自動推算蓋掉） */
    try{S.seasonSchedulesR48=S.seasonSchedulesR48||{};Object.keys(NEW12).forEach(function(c){var n=NEW12[c],k=c+'|'+n.fr+'|'+n.to,o=S.seasonSchedulesR48[k];
        if(o&&o.userR1012A)return;
        function rec(a){return {dep:a[0],arr:a[1],dd:a[2],acft:n.acft,days:n.days}}
        S.seasonSchedulesR48[k]={summer:rec(n.summer),winter:rec(n.winter),seededR57:0,winterBlockR68:0,pinnedR179:1,userR1012A:1,updatedAt:new Date().toISOString()};
        var f=[].concat(FLIGHTS).filter(function(x){return x&&!x.via&&x.code===c&&x.fr===n.fr&&x.to===n.to})[0];
        if(f&&window.kgmClearDerivedOverridesR57){try{window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}catch(_){}}})}catch(_){}
    /* 生效日以前：班表、飛行日、機型照舊 */
    function wrapSwap12(){
      var g1=window.kgmSeasonFlightR48;if(typeof g1==='function'&&!g1.__r1012K){
        var w1=function(f,date){var x=g1.apply(this,arguments);try{if(f&&!f.partner&&!f.via&&x&&old12(f.code,date)){var o=OLD12[f.code];if(f.fr===o.fr&&f.to===o.to){var a=o[sea12(date)];
          return Object.assign({},x,{dep:a[0],arr:a[1],dd:a[2],acft:o.acft,days:'daily',oldSchedR1012A:1})}}}catch(_){}return x};
        Object.keys(g1).forEach(function(k){try{w1[k]=g1[k]}catch(_){}});w1.__r1012K=1;window.kgmSeasonFlightR48=w1}
      var g2=window.flyOn;if(typeof g2==='function'&&!g2.__r1012K){
        var w2=function(f,d){try{if(f&&!f.partner&&OLD12[f.code]&&d&&d.getFullYear){var ds=iso12(d),o=OLD12[f.code];
          if(!f.via&&f.fr===o.fr&&f.to===o.to){if(old12(f.code,ds))return !(S.flightDisabled&&S.flightDisabled[f.code+'_'+f.fr+'_'+f.to]);
            var n=NEW12[f.code];if(n.days!=='daily'&&!mws12(ds))return false}}}catch(_){}return g2.apply(this,arguments)};
        Object.keys(g2).forEach(function(k){try{w2[k]=g2[k]}catch(_){}});w2.__r1012K=1;window.flyOn=w2;try{flyOn=w2}catch(_){}}
      var g3=window.acftOfFlight;if(typeof g3==='function'&&!g3.__r1012K){
        /* 生效日以前：時刻表給的機型（新定義）換回舊機型；人工換機、維修改派等其他結果照原本的 */
        var w3=function(code,date){var r=g3.apply(this,arguments);try{if(old12(code,date)&&r===NEW12[code].acft)return OLD12[code].acft}catch(_){}return r};
        Object.keys(g3).forEach(function(k){try{w3[k]=g3[k]}catch(_){}});w3.__r1012K=1;window.acftOfFlight=w3;try{acftOfFlight=w3}catch(_){}}
      /* 單一航段的季節時刻（r205，第五航權／航班動態用）也是直接讀季節表 */
      var g4=window.kgmSeasonLegR205;if(typeof g4==='function'&&!g4.__r1012K){
        var w4=function(code,fr,to,date){var r=g4.apply(this,arguments);try{var o=OLD12[code];if(r&&o&&o.fr===fr&&o.to===to&&old12(code,date)){var a=o[sea12(date)];r=Object.assign({},r,{dep:a[0],arr:a[1],dd:a[2],acft:o.acft})}}catch(_){}return r};
        w4.__r1012K=1;window.kgmSeasonLegR205=w4}
    }
    wrapSwap12();[0,500,1500,4000].forEach(function(ms){setTimeout(wrapSwap12,ms)});
    /* 已訂位、競標、升等申請：生效日起的 KX4/KX3/KX6/KX5 改到新班號（A380 → KX6/KX5；A350 一三六 → KX4/KX3、其他日子改搭 KX6/KX5），
       通知旅客；生效日以前的不動。只做一次（S.kxSwapR1012A）。 */
    function newCode12(code,date){if(code==='KX4')return 'KX6';if(code==='KX3')return 'KX5';if(code==='KX6')return mws12(date)?'KX4':'KX6';if(code==='KX5')return mws12(date)?'KX3':'KX5';return code}
    function migrate12(){
      if(S.kxSwapR1012A)return;var n=0,ntf=0;
      function baseRow(c){var x=NEW12[c];return [].concat(FLIGHTS).filter(function(f){return f&&!f.via&&!f.partner&&f.code===c&&f.fr===x.fr&&f.to===x.to})[0]}
      /* 只搬「照舊班表訂的」航段（起飛時間是舊時刻）：互換後才訂的新 KX4/KX6 不能再被搬一次 */
      function segFix(b,key,seg){var f=b[key];if(!f||!OLD12[f.code]||!f.date||old12(f.code,f.date)||f.via||f.kxSwapR1012A)return null;var o=OLD12[f.code];if(f.fr!==o.fr||f.to!==o.to)return null;
        if(f.dep&&f.dep!==o.summer[0]&&f.dep!==o.winter[0])return null;
        var nc=newCode12(f.code,f.date),br=baseRow(nc);if(!br)return null;var nf=Object.assign({},window.kgmSeasonFlightR48(br,f.date),{date:f.date,kxSwapR1012A:f.code});
        var was=f.code+' '+f.dep,acChg=OLD12[f.code].acft!==NEW12[nc].acft;b[key]=nf;n++;
        /* 機型不同（A350 → A380）：原本選的座位在新機型上不存在，清掉、登機證作廢，請旅客重新選位 */
        if(acChg&&seg){try{b.seats=b.seats||{};b.seats[seg]={};if(b.boardingPass)delete b.boardingPass[seg]}catch(_){}}
        return {from:was,to:nc+' '+nf.dep,date:f.date,acChg:acChg}}
      (S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled')return;var ch=[];
        ['outF','inbF'].forEach(function(k){var r=segFix(b,k,k==='outF'?'out':'inb');if(r)ch.push(r)});
        (b.mcFlights||[]).forEach(function(m,i){if(m&&m.f){var r=segFix(m,'f');if(r)ch.push(r)}});
        if(ch.length){b.schedChgR1012A=ch;ntf++;try{_pushBkNotif(b,'【班號／時刻異動】'+ch.map(function(c){return c.date+' '+c.from+' → '+c.to+(c.acChg?'（機型改為 A380，請重新選位）':'')}).join('；')+'（KGM 美西航線班表調整，自 '+EFF12+' 起生效）。如需改期或退票可免費辦理。')}catch(_){}}});
      [S.residenceBidsR83,S.resMileBidsR161,S.bigDeals,S.upgradeReqs].forEach(function(arr){(arr||[]).forEach(function(x){if(x&&OLD12[x.code]&&x.date&&!old12(x.code,x.date)&&!x.codeWasR1012A){x.codeWasR1012A=x.code;x.code=newCode12(x.code,x.date);n++}})});
      S.kxSwapR1012A={at:new Date().toISOString(),records:n,bookings:ntf,eff:EFF12};try{save()}catch(_){}}
    window.kgmKxSwapR1012A.migrate=migrate12;
    setTimeout(function(){try{migrate12()}catch(e){try{console.warn('1012A kx swap',e)}catch(_){}}},1200);

    /* 1012A：登機組別（使用者：「頭等艙寫PRIORITY，商務艙/金卡鑽石卡旅客寫ZONE 1，豪經艙訂購者和經濟艙「豪華方案」訂購者寫ZONE 2，
       剩餘「後區」經濟艙是ZONE 3，再來經濟艙前區是ZONE 4（若該機型為B779/A388可將經濟艙剩餘的分成ZONES 3-5可多加入ZONE 5）」）
       原本登機證呼叫的 boardingZoneOf 從來沒有定義過，每一張都掉進 catch 印「第 4 組」。這裡補上，四種登機證共用：
       · 頭等（含套房、Resident）→ PRIORITY；商務 → ZONE 1；金卡／鑽石卡（黑卡）會員搭豪經或經濟 → ZONE 1
       · 豪經 → ZONE 2；經濟艙「豪華」方案 → ZONE 2
       · 其餘經濟艙依座位排數（實際執飛機型的座位圖）：後半 ZONE 3、前半 ZONE 4；B779／A388 分三段：後 ZONE 3、中 ZONE 4、前 ZONE 5
       · 還沒有座位（報到時才分配）→ 經濟艙最後一組
       · 員工票 → 經濟艙最後一組（規章：員工票不適用優先登機）；規章 RES-002／CKI-005／FFP-011 同一套寫法（pol/bz_pol12.py） */
    (function(){
      var CAB12={E:'Economy',P:'Premium',B:'Business',F:'First',R:'First'};
      function fareInfo12(code){var x=null;try{x=(typeof FARES!=='undefined'&&FARES[code])||(typeof AWARD_FARES!=='undefined'&&AWARD_FARES[code])||null}catch(_){}return x||{}}
      function cabinOf12(code){var x=fareInfo12(code);if(x.cabin)return x.cabin==='Resident'?'First':x.cabin;var m=/^(?:AW-)?([EPBFR])-/.exec(String(code||''));return m?CAB12[m[1]]:'Economy'}
      function famOf12(code){var x=fareInfo12(code);return String(x.familyR48||x.tierEN||'')}
      function tierOf12(b){var t='';try{var p=(b.paxList||[])[0]||{};t=p.tier||p.level||'';
          if(!t&&b.userId!=null){var u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0];if(!u&&S.user&&S.user.id===b.userId)u=S.user;t=u?(u.level||u.tier||''):''}}catch(_){}return String(t)}
      function typeOf12(f){var t='';try{t=(f&&f.code&&f.date&&typeof acftOfFlight==='function')?acftOfFlight(f.code,f.date):''}catch(_){}return t||(f&&f.acft)||''}
      function econRows12(tp){try{var s=(window.kgmSeatSectionsR210(tp)||[]).filter(function(x){return x&&x.key==='econ'})[0];return s?s.rows.map(function(r){return +r.n}).filter(isFinite):[]}catch(_){return []}}
      /* o = {cabin, fam, tier, seat, type} → 0（PRIORITY）或 1–5 */
      function zoneOf12(o){
        if(o.cabin==='First')return 0;
        if(o.cabin==='Business')return 1;
        if(/gold|diamond|black/i.test(o.tier||''))return 1;
        if(o.cabin==='Premium')return 2;
        if(o.fam==='Deluxe')return 2;
        var three=o.type==='B779'||o.type==='A388',last=three?5:4,rows=econRows12(o.type),row=parseInt(o.seat,10);
        if(!rows.length||!isFinite(row))return last;
        var i=rows.indexOf(row);if(i<0)i=row<rows[0]?0:rows.length-1;
        var n=rows.length,back=(i+1)/n;   /* 越後面越先登機 */
        if(three)return back>2/3?3:(back>1/3?4:5);
        return back>1/2?3:4;
      }
      window.kgmZoneTextR1012A=function(z){return z===0?'PRIORITY':('ZONE '+(z||4))};
      /* 給已經知道艙等／座位／航班的地方用（舊版下載登機證、r6 登機證頁、單段升等的分段登機證） */
      window.kgmBpZoneR1012A=function(b,fare,seat,f){
        /* 員工票不適用優先登機（KGM-STX-015 第七條、KGM-CKI-005 第七條）：不論艙等都列經濟艙最後一組 */
        try{if(b&&window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b)){var tp=typeOf12(f);return (tp==='B779'||tp==='A388')?5:4}}catch(_){}
        return zoneOf12({cabin:cabinOf12(fare),fam:famOf12(fare),tier:b?tierOf12(b):'',seat:seat,type:typeOf12(f)});
      };
      window.kgmBpZoneTxtR1012A=function(b,seg,fare,seat,f){
        try{if(b&&seg&&(fare==null||!f)){var z=window.boardingZoneOf(b,seg);return window.kgmZoneTextR1012A(z)}
          return window.kgmZoneTextR1012A(window.kgmBpZoneR1012A(b,fare,seat,f))}catch(_){return 'ZONE 4'}
      };
      window.boardingZoneOf=function(b,seg){
        seg=seg||'out';var info=null;try{info=bookingSegInfo0813(b,seg)}catch(_){}
        if(!info||!info.f)return 4;
        var fare=((b.segmentFare0826A||{})[seg])||info.c;
        var seat=Object.keys((b.seats&&b.seats[seg])||{}).filter(function(k){return k!=='_auto'})[0]||'';
        return window.kgmBpZoneR1012A(b,fare,seat,info.f);
      };
      window.kgmZoneAuditR1012A=function(){
        var out={};['A388','B779','B789','A21N'].forEach(function(tp){var r=econRows12(tp);if(!r.length)return;
          out[tp]={rows:r[0]+'–'+r[r.length-1],front:zoneOf12({cabin:'Economy',seat:r[0]+'A',type:tp}),mid:zoneOf12({cabin:'Economy',seat:r[Math.floor(r.length/2)]+'A',type:tp}),back:zoneOf12({cabin:'Economy',seat:r[r.length-1]+'A',type:tp})}});
        out.first=zoneOf12({cabin:'First'});out.biz=zoneOf12({cabin:'Business'});out.gold=zoneOf12({cabin:'Economy',tier:'Gold',seat:'40A',type:'B789'});
        out.prem=zoneOf12({cabin:'Premium'});out.deluxe=zoneOf12({cabin:'Economy',fam:'Deluxe',seat:'40A',type:'B789'});
        return out;
      };
    })();

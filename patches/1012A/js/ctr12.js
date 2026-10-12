    /* 1012A：報到櫃檯一律寫號碼（使用者：「櫃檯都要寫好喔，不能寫現場公告」）
       查到的三件事：
       ① 行程卡讀 kgmCounterOfFlightR929（後台櫃檯分配），登機證／舊版行程列讀 checkinCounterForFlight（更舊的櫃檯表）——
          兩份資料：同一班 KX180 行程卡寫 7、登機證寫 3；成田行程卡 K、登機證 C。登機證改讀同一份（後台分配，含手動改的櫃檯）。
       ② 訂位日期那天該班沒飛（例：KX44 只飛一四六，訂到星期三）→ 分配表裡沒有這班 → 「櫃檯依機場公告」。
          改成取前後 14 天內最近一個有飛的日子的櫃檯。
       ③ 外站由聯營夥伴執飛的航段寫「日本航空報到櫃檯（依機場看板）」→ 改成夥伴航空在該機場的櫃檯號（各站櫃檯編號格式同 1004B）。 */
    (function(){
      function allF12(){try{return (FLIGHTS||[]).concat(S.customFlights||[])}catch(_){return []}}
      function addD12(iso,n){var d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
      function hash12(s){var h=0;s=String(s);for(var i=0;i<s.length;i++)h=((h*31)+s.charCodeAt(i))>>>0;return h}
      /* 夥伴航空的櫃檯：沿用 1004B 各站的櫃檯編號格式，號碼依「機場＋航空公司」固定 */
      function partnerCtr12(ap,name){
        var cfg=(typeof OUTCTR1004B!=='undefined'&&OUTCTR1004B[ap])||['NUM',[1,40]],h=hash12(ap+'|'+name),st=cfg[0];
        if(st==='ROWN'||st==='NUM'){var a=cfg[1][0],b=cfg[1][1],n=a+(h%(b-a+1));
          return {zh:st==='ROWN'?('第 '+n+' 排報到櫃檯'):('報到櫃檯 '+n),en:st==='ROWN'?('Row '+n):('Counter '+n)}}
        var L=cfg[1],ch=L.charAt(h%L.length);
        return {zh:st==='L'?('報到櫃檯 '+ch):st==='AISLE'?('報到行段 '+ch):st==='ZONE'?('報到 '+ch+' 區（Zone '+ch+'）'):('報到櫃檯 '+ch+' 排（Row '+ch+'）'),
                en:st==='L'?('Counter '+ch):st==='AISLE'?('Aisle '+ch):st==='ZONE'?('Zone '+ch):('Row '+ch)}
      }
      var g=window.kgmCounterOfFlightR929;
      if(typeof g==='function'&&!g.__r1012A){
        var w=function(code,date,fr){
          var r=g.apply(this,arguments);if(r&&r.counter)return r;
          try{
            var rows=allF12().filter(function(f){return f&&f.code===code&&f.fr===fr}),tries=0;
            if(rows.length&&date){
              for(var k=1;k<=14&&tries<2;k++){for(var sg=-1;sg<=1&&tries<2;sg+=2){var d=addD12(date,sg*k),on=false;
                try{on=rows.some(function(f){return flyOn(f,new Date(d+'T12:00:00'))})}catch(_){}
                if(!on)continue;tries++;var x=g.call(this,code,d,fr);if(x&&x.counter)return Object.assign({},x,{fromDateR1012A:d})}}
            }
            if(fr!=='TPE'&&fr!=='TSA'&&window.kgmOutCtrR1004B)return window.kgmOutCtrR1004B(fr,{term:'',counter:''},code);
          }catch(_){}
          return r;
        };
        w.__r1012A=1;window.kgmCounterOfFlightR929=w;
      }
      /* 登機證、舊版行程列：跟行程卡讀同一份 */
      if(typeof checkinCounterForFlight==='function'&&!checkinCounterForFlight.__r1012A){
        var cc=checkinCounterForFlight;
        checkinCounterForFlight=window.checkinCounterForFlight=function(f){
          try{if(f&&f.code&&f.date&&f.fr&&window.kgmCounterOfFlightR929){var c=window.kgmCounterOfFlightR929(f.code,f.date,f.fr);if(c&&c.counter&&c.counter!=='—')return String(c.counter)}}catch(_){}
          return cc.apply(this,arguments);
        };
        checkinCounterForFlight.__r1012A=1;
      }
      /* 經停航班的整段列（例：KX304 台北→杜哈經上海）原本照終點算航廈（T2），但同一架飛機從台北出發只有一個航廈，
         櫃檯分配與行程卡都是第一段（台北→上海，T1）—— 登機證會變成「T2 櫃檯 3」。整段列的出發航廈改成跟第一段相同。 */
      if(typeof terminalForFlight==='function'&&!terminalForFlight.__r1012A){
        var tf=terminalForFlight;
        terminalForFlight=window.terminalForFlight=function(f){
          try{if(f&&f.via&&f.fr&&f.code&&!(S.routeTerminal||{})[f.code]){var leg=allF12().filter(function(x){return x&&!x.via&&x.code===f.code&&x.fr===f.fr&&x.to===f.via})[0];
            if(leg)return tf.call(this,Object.assign({},f,{to:leg.to,via:null}))}}catch(_){}
          return tf.apply(this,arguments);
        };
        terminalForFlight.__r1012A=1;
      }
      /* 外站：KGM 自己的班沒有分配資料時照 1004B 的站別櫃檯；聯營夥伴執飛的段寫夥伴航空的櫃檯號 */
      var lb=window.kgmCheckinLabelR1004B;
      if(typeof lb==='function'&&!lb.__r1012A){
        var lw=function(ap,tl,c,zhOn,code){
          if(ap==='TPE'||ap==='TSA')return lb.apply(this,arguments);
          var op=null;try{op=code&&window.kgmPartnerOpR1004B?window.kgmPartnerOpR1004B(ap,code):null}catch(_){}
          if(op){
            var tm=(typeof AP_TERM_MAP!=='undefined'&&AP_TERM_MAP[ap])||tl||'',t=window.kgmTermLabelR1004B(ap,op.term||tm,zhOn),x=partnerCtr12(ap,op.en||op.zh||'');
            return t+(zhOn?('　'+op.zh+' · '+x.zh):(' · '+op.en+' · '+x.en));
          }
          if(!c||!c.counter)c=Object.assign({},c||{},{counter:'',counterZH:''});
          return lb.call(this,ap,tl,c,zhOn,code);
        };
        lw.__r1012A=1;window.kgmCheckinLabelR1004B=lw;
      }
    })();

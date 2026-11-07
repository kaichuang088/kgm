    /* ══ 1014A：經濟艙「營收管理售完」——需求真的太多時，有時候把經濟艙整艙關掉（畫面顯示售完），讓旅客往商務／豪經買 ══
       使用者：「票價如果真的是客流量太多可以有時候假裝經濟艙賣完了特別是只有A21N的 A388是盡量賣掉 當然旺季應該也賣得掉啦」
       · 判斷「客流量太多」用營收管理同一個需求壓力（kgmRmR929().pressure：未受限需求 ÷ 剩餘座位，跟票價開到哪一階是同一個數字），
         平常 ≥ 1.5、旺季（連假、寒暑假、春節等高峰）≥ 1.3 才算；起飛前 60 天內才會發生。
       · 「有時候」：每個航班日期每 3 天重新決定一次（同一時段內固定，不會一重整就開開關關），機率依機型：
           A21N 執飛、而且這條航線只有 A21N 飛 60%；A21N 但航線也有別的機型 45%；其他機型 15%；旺季再加 20%。
       · 關艙的前提是還有別的艙可以買（同一班的商務／豪經還有實體空位）；整班都滿的不需要假裝。
       · A388：盡量賣掉 —— 不做假售完；只有旺季而且需求壓力 ≥ 2.0（真的會賣光）才顯示經濟艙售完。
       · 只關「賣」：員工票候補、里程升等、酬賓、組員調位、座位圖都照實體座位，不受影響。
       sell54（各訂位代號剩幾位，訂票頁票價卡、改票、validCodes 都讀它）最後一步問這裡。 */
    (function rmEcoClose1014A(){
      var MEMO={},MN=0,ONLY=null;
      function onlyA21N(fr,to){
        if(!ONLY){ONLY={};var seen={};try{[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.via||f.partner||f.codeshare)return;var k=f.fr+'-'+f.to;
          if(!(k in seen))seen[k]=true;if(f.acft!=='A21N')seen[k]=false});Object.keys(seen).forEach(function(k){if(seen[k])ONLY[k]=1})}catch(_){}}
        return !!ONLY[fr+'-'+to];
      }
      function peak(f,date){
        try{if(window.kgmHolSeatR1006A&&window.kgmHolSeatR1006A(date,f))return true}catch(_){}
        try{if(typeof kgmPeakCoreR928==='function'&&kgmPeakCoreR928(date)>=1.2)return true}catch(_){}
        return false;
      }
      function otherCabinOpen(f,date,type){
        var ac=(AC[type]||{}).cabins||{},inv=window.kgmCabinInventory54;if(typeof inv!=='function')return false;
        return ['Premium','Business','First'].some(function(c){var key={Premium:'prem',Business:'biz',First:'suite'}[c];if(!ac[key]||!(+ac[key].seats>0))return false;
          if(c==='Premium'&&typeof window.kgmSellsPremiumR71==='function'){try{if(!window.kgmSellsPremiumR71(Object.assign({},f,{date:date})))return false}catch(_){}}
          try{return (inv(Object.assign({},f,{date:date}),date,c)||{}).left>0}catch(_){return false}});
      }
      /* 回傳 null（照常賣）或 {why:'rm'|'peak', type, pressure, prob} */
      window.kgmRmEcoCloseR1014A=function(f,date){
        try{
          if(!f||!date||f.partner||f.codeshare)return null;
          var today=todayISO(),dd=kgmDayDiffR929(today,date);if(dd<0||dd>60)return null;
          var block=Math.floor(Date.parse(today+'T00:00:00Z')/864e5/3);
          var key=[f.code,f.fr,f.to,date,block,(S.bookings||[]).length].join('|');
          if(key in MEMO)return MEMO[key];
          if(++MN>6000){MEMO={};MN=0}
          var res=null,type=(typeof acftOfFlight==='function'&&acftOfFlight(f.code,date,f.fr,f.to))||f.acft,r=kgmRmR929(Object.assign({},f,{date:date}),date),p=+r.pressure||0,pk=peak(f,date);
          if(type==='A388'){
            if(pk&&p>=2.0)res={why:'peak',type:type,pressure:p,prob:1};
          }else if(p>=(pk?1.3:1.5)){
            var prob=type==='A21N'?(onlyA21N(f.fr,f.to)?0.60:0.45):0.15;if(pk)prob=Math.min(0.85,prob+0.20);
            var u=(kgmRmHashR929('eco14|'+f.code+'|'+f.fr+f.to+'|'+date+'|'+block)%1000)/1000;
            if(u<prob&&otherCabinOpen(f,date,type))res={why:pk?'peak':'rm',type:type,pressure:p,prob:prob};
          }
          MEMO[key]=res;return res;
        }catch(_){return null}
      };
      /* 訂票頁日期列：有航班但所選艙等售完的那一天（so14）——跟一般日期一樣可以點，價格位置寫「售完」 */
      try{if(!document.getElementById('k14-so-css')){var st=document.createElement('style');st.id='k14-so-css';
        st.textContent='.daychip.so14 .dc-price{color:#9A5B4B;letter-spacing:.04em}.daychip.on.so14 .dc-price{color:var(--gold)}';(document.head||document.documentElement).appendChild(st)}}catch(_){}
      /* 後台／測試用：某一天哪些航班經濟艙被營收管理關掉 */
      window.kgmRmEcoClosedListR1014A=function(date){
        var out=[];try{[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.via||f.partner||f.codeshare)return;
          try{if(!flyOn(f,new Date(date+'T12:00:00')))return}catch(_){}var x=window.kgmRmEcoCloseR1014A(f,date);if(x)out.push({code:f.code,fr:f.fr,to:f.to,type:x.type,why:x.why,pressure:x.pressure})})}catch(_){}
        return out;
      };
    })();

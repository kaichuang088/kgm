/* ══ 1026C：時刻異動通知（已開票旅客）
   使用者：「依規章 KGM-IRR-013，起飛時間變動超過 30 分鐘算班表調整，要通知旅客 … 要通知」
          「就寄送有真實的就啊反正系統也知道哪些是mock的」；選「全部受影響訂位，分批寄」
   做法：訂位存的是開票當時的時刻（outF／inbF／mcFlights 的 dep／arr／dd）；跟現在的季節時刻（kgmSeasonFlightR48，含 1026B 輪擋彈性、
   1026C 夏令時間與提前出發）比，有不一樣的段就寄一封（一筆訂位所有改了的段合成一封），寄完把訂位上的時刻改成新的、記在
   b.schedChgR1026C（同一個變動只寄一次；之後又改才再寄）。
   · 只寄真實訂位：模擬資料（simulated、simR1010A、csSimR1012A、名稱含 sim／mock 的欄位）、組員 DH（dhR929）一律跳過（示範帳號 demoAccount 不算模擬，照寄）；
   · 人工改過時間（後台改時刻／航班動態延誤）的那一段不在這裡處理（那邊本來就有自己的通知）；
   · 已起飛、已取消的不寄；夥伴營運航段時刻不會變，不處理；
   · 分批：開頁 25 秒後開始，每 4 秒最多處理 3 筆訂位；同一個瀏覽器開很多分頁只有一個分頁在寄（localStorage 鎖 kgm27_sclock）。
   · 起飛變動逾 30 分＝IRR-013「班表調整」，信件標題寫班表調整；其餘寫時刻異動。 */
(function(){
  'use strict';
  function z(){try{return (typeof LANG==='undefined'||LANG!=='en')}catch(_){return true}}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function isMock(b){if(!b)return true;if(b.simulated||b.simR1010A||b.csSimR1012A||b.dhR929||b.mockR1026C)return true;
    for(var k in b){if(Object.prototype.hasOwnProperty.call(b,k)&&/sim|mock|seed/i.test(k)&&b[k]&&!/^schedChg/.test(k))return true}return false}
  function hasOv(code,fr,to,date){try{var c=typeof getBOV==='function'?getBOV(code,fr,to):null;if(c&&(c.dep||c.arr))return true}catch(_){}
    try{var d=(S.flightDateOverride||{})[code+'_'+fr+'_'+to+'_'+date];if(d&&(d.dep||d.arr)&&(!d.predictionUpdatedAt||d.manual))return true}catch(_){}   /* 1026C：天氣預測的預估時刻不算人工改 */
    try{var s=(S.flightOverrides||{})[code+'_'+date];if(s&&(s.dep||s.arr||/cancel/i.test(String(s.status||''))))return true}catch(_){}return false}
  function rowOf(L){var all=[];try{all=FLIGHTS}catch(_){}var c=all.filter(function(f){return f&&f.code===L.code&&f.fr===L.fr&&f.to===L.to&&(!!f.via)===(!!L.via)});
    if(!c.length)return null;if(c.length===1)return c[0];for(var i=0;i<c.length;i++){var q=null;try{q=window.kgmSeasonFlightR48(c[i],L.date)}catch(_){}if(q&&q.dep===L.dep)return c[i]}
    for(var j=0;j<c.length;j++){try{if(typeof flyOn==='function'&&flyOn(c[j],new Date(L.date+'T00:00:00')))return c[j]}catch(_){}}return c[0]}
  /* 一筆訂位的航段（存在訂位上的那個物件，改時刻要改它） */
  function legsOf(b){var out=[];function add(f,key){if(!f||!f.code||!f.date)return;out.push({o:f,key:key});if(f.isConn&&f.connF2)add(f.connF2,key+'2')}
    if(b.mcFlights&&b.mcFlights.length)b.mcFlights.forEach(function(x,i){if(x)add(x.f||x,'seg'+i)});else{add(b.outF,'out');add(b.inbF,'inb')}return out}
  function today(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function cityOf(c){try{return (z()?CITY_ZH[c]:CITY_EN[c])||c}catch(_){return c}}
  function sup(dd){dd=+dd||0;return dd>0?'⁺'+dd:dd<0?'⁻'+(-dd):''}
  /* 1026C（交付 1027A）：北美出發不過午夜 —— 原本午夜後起飛（00:00–04:59）的訂位：
     REL27＝-1：改成前一天 23:xx 起飛（同一架飛機、實際提早幾十分）→ 訂位日期改成前一天，通知寫「提前 N 分、改為前一天」；
     REL27＝0：同一天改成晚上起飛（KX8 冬季 00:15 → 當天 21:40）→ 實際是延後 21 小時多，不能用「±12 小時取近」算成提前。 */
  var REL27={'KX26|TPE|SEA':-1,'KX30|TPE|YVR':-1,'KX30|TPE|YYZ':-1,'KX8|TPE|DTW':0};
  function addD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function changesOf(b){var td=today(),ch=[];
    legsOf(b).forEach(function(L){var o=L.o;if(o.partner||o.codeshare||!/^KX\d+$/.test(String(o.code||'')))return;if(o.date<td)return;if(hasOv(o.code,o.fr,o.to,o.date))return;
      var rel=REL27[o.code+'|'+o.fr+'|'+o.to],nd=o.date;if(rel===-1&&mn(o.dep)<300)nd=addD(o.date,-1);
      var r=rowOf(Object.assign({},o,{date:nd}));if(!r)return;var x=null;try{x=window.kgmSeasonFlightR48(r,nd)}catch(_){x=null}if(!x||!x.dep||!x.arr)return;
      if(nd!==o.date&&mn(x.dep)<1200){nd=o.date;try{x=window.kgmSeasonFlightR48(rowOf(o)||r,o.date)}catch(_){}if(!x||!x.dep)return}   /* 還沒改成前一天晚上起飛 → 照原日期比 */
      if(nd===o.date&&x.dep===o.dep&&x.arr===o.arr&&(+x.dd||0)===(+o.dd||0))return;
      var dDep=mn(x.dep)-mn(o.dep);
      if(nd!==o.date)dDep-=1440;                                   /* 前一天 23:50 對原本 00:20 → −30 */
      else if(!(rel===0&&mn(o.dep)<300&&mn(x.dep)>=1200)){if(dDep>720)dDep-=1440;if(dDep<-720)dDep+=1440}
      ch.push({L:L,x:x,from:{dep:o.dep,arr:o.arr,dd:+o.dd||0,date:o.date},to:{dep:x.dep,arr:x.arr,dd:+x.dd||0,dur:x.dur,durStr:x.durStr,date:nd},dDep:dDep})});
    return ch}
  function msgOf(b,ch){var Z=z(),major=ch.some(function(c){return Math.abs(c.dDep)>30});
    var head=Z?(major?'班表調整通知':'航班時刻異動通知'):(major?'Schedule change':'Flight time change');
    var lines=ch.map(function(c){var o=c.L.o,dch=c.to.date&&c.from.date&&c.to.date!==c.from.date;return o.code+' '+cityOf(o.fr)+'→'+cityOf(o.to)+' '+(c.from.date||o.date)+(Z?'：原 ':': was ')+c.from.dep+'–'+c.from.arr+sup(c.from.dd)+(Z?' → 新 ':' → now ')+(dch?c.to.date+' ':'')+c.to.dep+'–'+c.to.arr+sup(c.to.dd)
      +(c.dDep?(Z?'（起飛'+(c.dDep>0?'延後 ':'提前 ')+(Math.abs(c.dDep)>=60?Math.floor(Math.abs(c.dDep)/60)+' 小時 '+(Math.abs(c.dDep)%60?Math.abs(c.dDep)%60+' 分':''):Math.abs(c.dDep)+' 分')+(dch?'，改為前一天晚上起飛':'')+'）':' (departure '+(c.dDep>0?'+':'−')+Math.abs(c.dDep)+' min'+(dch?', now the evening before':'')+')'):(Z?'（起飛不變，抵達時間調整）':' (departure unchanged; arrival adjusted)'))});
    var tail=Z?(major?'依《航班異常處理及旅客權益辦法》（KGM-IRR-013）第 2 條，起飛時間變動逾 30 分鐘屬班表調整；如新時刻不便，可免費改搭其他航班或申請全額退票。'
                    :'本公司依實際飛行條件調整表定時刻（加入滑行、天候與航路彈性）。您的訂位與座位不變，請依新時刻前往機場。')
               :(major?'Under KGM-IRR-013 Art. 2, a departure change of more than 30 minutes is a schedule change; you may rebook free of charge or request a full refund.'
                    :'We have adjusted the published times to include taxi, weather and routing allowances. Your booking and seats are unchanged.');
    return {title:head+(Z?'（訂位代號 ':' (PNR ')+b.pnr+(Z?'）':')'),text:lines.join('\n')+'\n'+tail,major:major}}
  function apply(b,ch){var m=msgOf(b,ch),now=new Date().toISOString();
    ch.forEach(function(c){var o=c.L.o;if(c.to.date&&c.to.date!==o.date){o.dateWasR1026C=o.date;o.date=c.to.date}o.dep=c.to.dep;o.arr=c.to.arr;o.dd=c.to.dd;if(c.to.dur){o.dur=c.to.dur;o.durStr=c.to.durStr||o.durStr}});
    b.schedChgR1026C=b.schedChgR1026C||[];ch.forEach(function(c){var o=c.L.o;b.schedChgR1026C.push({at:now,code:o.code,date:o.date,fr:o.fr,to:o.to,from:c.from,to2:{dep:c.to.dep,arr:c.to.arr,dd:c.to.dd},dDep:c.dDep})});
    b.statusNotifs=b.statusNotifs||[];b.statusNotifs.push({date:today(),status:'Time Change',msg:m.text});
    b.tripAlerts0809G=b.tripAlerts0809G||[];b.tripAlerts0809G.unshift({title:m.title,message:m.text,at:now});
    b.notifs=b.notifs||[];b.notifs.unshift({msg:m.title+'\n'+m.text,date:today(),read:false});
    if(b.userId){var u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0];if(u){u.notifs=u.notifs||[];u.notifs.unshift({title:m.title,message:m.text,date:today(),type:'flight_status'})}}
    var em=b.contactEmail||((b.paxList||[])[0]||{}).email,c0=ch[0].L.o;
    try{if(em&&typeof kgmNotify==='function')Promise.resolve(kgmNotify('flight.schedule_changed',{email:em,pnr:b.pnr,flight:c0.code,date:c0.date,subject:m.title,message:m.text,segments:ch.map(function(c){var o=c.L.o;return {flight:o.code,date:o.date,fr:o.fr,to:o.to,oldDep:c.from.dep,oldArr:c.from.arr,newDep:c.to.dep,newArr:c.to.arr,newDD:c.to.dd}})})).catch(function(){})}catch(_){}
    try{logAct(z()?'時刻異動通知（自動）':'Schedule change notice (auto)',b.pnr+' · '+ch.map(function(c){return c.L.o.code+' '+c.L.o.date}).join('、'))}catch(_){}
    ST.sent++;ST.legs+=ch.length;if(m.major)ST.major++}
  var ST={sent:0,legs:0,major:0,scanned:0,mock:0,last:null};window.KGM_SCHED_NOTICE_R1026C=ST;
  /* 只有一個分頁在寄 */
  var TAB=Math.random().toString(36).slice(2);
  function lead(){try{var v=JSON.parse(localStorage.getItem('kgm27_sclock')||'null'),n=Date.now();if(v&&v.t!==TAB&&n-v.ts<20000)return false;localStorage.setItem('kgm27_sclock',JSON.stringify({t:TAB,ts:n}));return true}catch(_){return true}}
  var Q=null,QI=0;
  function tick(){try{if(typeof S==='undefined'||!S.bookings||typeof window.kgmSeasonFlightR48!=='function')return;if(!lead())return;
      if(!Q||QI>=Q.length){Q=S.bookings.slice();QI=0}
      var done=0,changed=false,t0=Date.now();
      while(QI<Q.length&&done<3&&Date.now()-t0<25){var b=Q[QI++];if(!b||b.status==='cancelled')continue;if(isMock(b)){ST.mock++;continue}ST.scanned++;
        var ch=changesOf(b);if(ch.length){apply(b,ch);done++;changed=true}}
      if(changed){ST.last=new Date().toISOString();try{save()}catch(_){}}}catch(e){ST.err=String(e&&e.message||e)}}
  /* 模擬資料一律不真的寄出（使用者：「就寄送有真實的就啊反正系統也知道哪些是mock的」）：
     寄信事件照樣記在寄信紀錄（標「模擬・未寄出」），只是不送到 Worker。判斷：信裡的訂位代號是模擬訂位、或收件人是模擬會員。 */
  function mockPayload(p){if(!p||typeof p!=='object')return false;if(p.mockR1026C)return true;
    try{if(p.pnr){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===p.pnr})[0];if(b&&isMock(b))return true}}catch(_){}
    try{var em=String(p.email||'').toLowerCase();if(em){var u=(S.users||[]).filter(function(x){return x&&String(x.email||'').toLowerCase()===em})[0];if(u&&isMock(u))return true}}catch(_){}
    return false}
  ST.mockMail=0;
  function nWrap(){var o=window.kgmNotify;if(typeof o!=='function'||o.__mock27)return;
    var w=function(type,payload){try{if(mockPayload(payload)){ST.mockMail++;try{S.emailEventLog=S.emailEventLog||[];S.emailEventLog.unshift({type:type,at:new Date().toISOString(),payload:{pnr:payload.pnr||'',mockR1026C:true},mockSkippedR1026C:true});if(S.emailEventLog.length>60)S.emailEventLog.length=60}catch(_){}
        return Promise.resolve({ok:true,mock:true,skipped:true})}}catch(_){}return o.apply(this,arguments)};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__mock27=1;window.kgmNotify=w;try{kgmNotify=w}catch(_){}}
  nWrap();[0,1600,6500,21000,32000].forEach(function(ms){setTimeout(nWrap,ms)});
  window.kgmSchedNoticeScanR1026C=function(b){return b?changesOf(b):null};
  window.kgmIsMockBookingR1026C=isMock;
  setTimeout(function(){tick();setInterval(tick,4000)},25000);
})();

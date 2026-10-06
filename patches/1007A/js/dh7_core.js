  /* ══ 1007A：DH 的艙等、座位與自動騰位 ════════════════════════════════════════
     使用者：「機長DH要給商務艙（沒有位置就自動通知非自願降等購買基本方案的旅客並自動退差價）組員就是經濟或是豪經（座艙長豪經優先）」
            「如果商務艙或是豪經艙沒有位置 優先讓那些里程升等的退回里程 然後在來是酬賓機票 會自動往下一個倉等（如果沒有豪經的短程算經濟喔）
              然後退還里程差（這里程差截止日期要延長就是不是原本日期）真的還有要搭的機長或是組員 才會去優先處理購買基本方案的旅客（隨機處理）
              然後先非自願降倉等 然後真的沒位置就要可以「免費」換航班 不一定要沒有位置可以 旅客想換到下一班的商務艙也要可以免費改簽」
     · 坐哪一艙：機長（CAPT）商務艙；座艙長（CP）豪華經濟艙；其他組員經濟艙，經濟艙滿了改豪華經濟艙。不賣豪經的短程航線一律經濟艙。
       經濟艙、豪經都滿而商務艙還有空位時，一般組員改坐商務艙（不為了一般組員請旅客下飛機）。
       排班引擎「這一班還有沒有位子讓組員調位」的判斷不動（組員班表結果不變），只決定坐哪一艙、哪一個位子；同一班的 DH 不會分到同一個座位。
     · 要坐的艙等滿了 → 起飛前 72 小時內自動騰位，依序：
         ⓪ 已候補上的員工票（員工票本來就排在 DH 後面）→ 回到候補
         ① 里程升等：取消升等、全額退哩程（原效期）、回原艙等
         ② 酬賓機票：降一個艙等（不賣豪經的短程直接降經濟），退哩程差 —— 退回的哩程給新的三年效期，不沿用原本的到期日
         ③ 購買基本方案的旅客：隨機（以航班＋旅客固定排序，不會每次不同），非自願降一個艙等，退票價差額
         下一個艙等也沒有位子 → 移出本班，可免費改搭其他班次
     · 被降等或移出的旅客，在行程管理都可以「免費改搭下一班原艙等」；改搭後原艙等保留，已退的差額收回。
     · 騰位紀錄存在 S.dhBumpR1007A（依航班），模擬旅客也照紀錄顯示；真實訂位直接改訂位、退款、發通知。 */
  var CAB7=['Economy','Premium','Business','First'];
  function z7(){try{return typeof LANG==='undefined'||LANG!=='en'}catch(_){return true}}
  function cz7(c){return z7()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Residence'}[c]||c):c}
  function sellsP7(f){try{return window.kgmSellsPremiumR71?!!window.kgmSellsPremiumR71(f):true}catch(_){return true}}
  function capOf7(f,date,c){try{var n=0;seatsFlat7(type7(f,date)).forEach(function(s){if(s.cabin===c&&!s.resident)n++});return n}catch(_){return 0}}
  function staffOf7(id){return (S.staff||[]).filter(function(x){return x&&x.empId===id})[0]||{}}
  /* 職級以排班引擎的名單為準（組員班表顯示的就是這一份：正機師 CP／副機師 FO／巡航機師 CR；座艙長 PU／副座艙長 DPU／空服員 FA）。
     員工檔 S.staff 的 rank 是另一套代號，而且排班用的虛擬組員不在員工檔裡 —— 不能拿來判斷。 */
  var PM7=null,PS7=null;
  function poolRec7(id){try{var P=window.kgmCrewPoolR121&&window.kgmCrewPoolR121();if(P&&P!==PS7){PS7=P;PM7={};(P.pilots||[]).concat(P.cabin||[]).forEach(function(r){if(r&&r.empId)PM7[r.empId]=r})}return (PM7&&PM7[id])||null}catch(_){return null}}
  function rankOf7(p){var r=poolRec7(p.empId)||{};return {role:p.role||r.role||staffOf7(p.empId).role||'',rank:String(r.rank||'').toUpperCase(),zh:r.rankZH||'',name:r.name||'',base:r.base||''}}
  function wantCabs7(p,f,date){
    var r=rankOf7(p),hasP=sellsP7(f)&&capOf7(f,date,'Premium')>0,hasB=capOf7(f,date,'Business')>0;
    if(r.role==='pilot'&&r.rank==='CP'&&hasB)return {list:['Business'],must:'Business'};   /* 機長（正機師） */
    if(r.role==='cabin'&&r.rank==='PU'&&hasP)return {list:['Premium'],must:'Premium'};     /* 座艙長 */
    /* 其他組員：經濟艙 → 豪經；兩艙都滿但商務艙還有空位就坐商務（不為了一般組員把旅客請下飛機） */
    return {list:(hasP?['Economy','Premium']:['Economy']).concat(hasB?['Business']:[]),must:'Economy'};
  }
  function dhTitle7(p){var r=rankOf7(p);if(r.role==='pilot')return z7()?({CP:'機長（正機師）',FO:'副機師',CR:'巡航機師'}[r.rank]||'飛行員'):({CP:'Captain',FO:'First officer',CR:'Cruise relief'}[r.rank]||'Pilot');
    if(r.role==='cabin')return z7()?({PU:'座艙長',DPU:'副座艙長',FA:'空服員'}[r.rank]||'客艙組員'):({PU:'Purser',DPU:'Assistant purser',FA:'Flight attendant'}[r.rank]||'Cabin crew');return r.role||''}
  window.kgmDhTitleR1007A=dhTitle7;
  /* 排班引擎呼叫：slot0＝原本（經濟→豪經→商務）找到的座位；回傳這位組員實際要坐的艙等與座位 */
  window.kgmDhSlotR1007A=function(p,m,date,slot0){
    try{
      if(!p||!m||!m.code||m.code==='DH'||m.code==='GT'||m.code==='地面轉場')return slot0;
      var f={code:m.code,fr:m.fr,to:m.to,acft:m.type||m.acft},w=wantCabs7(p,f,date);
      var key=[date,m.code,m.fr,m.to].join('|'),lst=(S.crewPositioningR121||{})[key]||[],taken={},inC={};
      lst.forEach(function(q){if(!q||q.empId===p.empId)return;if(q.seat)taken[q.seat]=1;inC[q.cabin]=(inC[q.cabin]||0)+1});
      for(var i=0;i<w.list.length;i++){
        var c=w.list[i],inv=window.kgmCabinInventory54(Object.assign({},m,{date:date}),date,c);
        var free=(inv.seats||[]).filter(function(s){return !taken[s]});
        if((+inv.left||0)-(inC[c]||0)>0&&free.length)return {cabin:c,seat:free[0]};
      }
      /* 機長要商務、座艙長要豪經而該艙已滿 → 先記艙等，座位由起飛前 72 小時的騰位處理。
         一般組員連商務都沒有空位 → hardR1007A：排班引擎改找下一班（原本引擎不扣其他 DH，同一班會塞進超過座位數的組員） */
      return {cabin:w.must,seat:'',bump:true,hardR1007A:w.must==='Economy'};
    }catch(_){return slot0}
  };
  /* ── 4 碼英數混合的 DH 訂位代號（字母、數字至少各一；避開 I、O、0、1） ── */
  function pnr4R7(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h>>>=0;
    var L='ABCDEFGHJKLMNPQRSTUVWXYZ',D='23456789',A=L+D,o=[],x=h;
    for(var k=0;k<4;k++){o.push(A[x%A.length]);x=Math.floor(x/A.length)+(k+1)*7919}
    var pd=h%4,pl=(pd+1+((h>>>7)%3))%4;o[pd]=D[(h>>>11)%D.length];o[pl]=L[(h>>>17)%L.length];return o.join('')}
  function dhOwn7(b,empId,date,code){return !!(b&&b.dhR929&&b.dhR929.empId===empId&&b.dhR929.date===date&&b.dhR929.flight===code)}
  function dhPnr4(empId,date,code){
    for(var salt=0;salt<8;salt++){var p=pnr4R7(empId+'|'+date+'|'+code+(salt?'|'+salt:''));
      var hit=(S.bookings||[]).filter(function(b){return b&&b.pnr===p})[0];if(!hit||dhOwn7(hit,empId,date,code))return p}
    return pnr4R7(empId+'|'+date+'|'+code+'|x');
  }
  /* ── 騰位 ── */
  S.dhBumpR1007A=S.dhBumpR1007A||{};
  function hrsTo7(f,date){try{var tz=(typeof TZ!=='undefined'&&TZ[f.fr]!=null)?+TZ[f.fr]:8;return (Date.parse(date+'T'+(f.dep||'00:00')+':00Z')-tz*3600000-Date.now())/3600000}catch(_){return 999}}
  function lowerOf7(f,date,c){var cabs=cabinsOn929(f,date);
    if(c==='First')return cabs.indexOf('Business')>=0?'Business':null;
    if(c==='Business')return (cabs.indexOf('Premium')>=0&&sellsP7(f))?'Premium':(cabs.indexOf('Economy')>=0?'Economy':null);
    if(c==='Premium')return cabs.indexOf('Economy')>=0?'Economy':null;return null}
  function rnd7(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function plus3y7(){var d=new Date(todayISO()+'T12:00:00Z');d.setUTCFullYear(d.getUTCFullYear()+3);return d.toISOString().slice(0,10)}
  function awardCode7(fare,c){return /^AW-/.test(String(fare))?({Economy:'AW-E-L',Premium:'AW-P-G',Business:'AW-B-O',First:'AW-F-F'}[c]):({Economy:'Y',Premium:'AV',Business:'AR',First:'AF'}[c])}
  function upReq7(x,f,date){return (S.upgradeReqs||[]).filter(function(r){return r&&r.pnr===x.pnr&&r.status==='confirmed'&&r.code===f.code&&r.date===date&&r.toCabin===x.cabin&&(!r.seg||!x.segmentKey||r.seg===x.segmentKey)})[0]||null}
  function userOf7(b){return (S.users||[]).filter(function(u){return u&&b&&u.id===b.userId})[0]||null}
  function bkLog7(b,a){if(!b)return;b.dhBumpR1007A=b.dhBumpR1007A||[];b.dhBumpR1007A.push(a)}
  function msg7(a,f){
    var head=(z7()?('因組員調位（DH）需要座位，您的 '+f.code+'（'+a.date+'）'):('Crew positioning needs your seat on '+f.code+' ('+a.date+'): '));
    if(a.kind==='upgrade')return head+(z7()?('里程升等已取消，'+Number(a.miles||0).toLocaleString()+' 哩全額退回（原效期），改搭原艙等 '+cz7(a.to)+(a.seat?(' '+a.seat):'')+'。'):'your mileage upgrade was cancelled and the miles refunded.');
    if(a.kind==='offload')return head+(z7()?('已無其他艙等座位，請至行程管理免費改搭其他班次（不收任何費用）。'):'no seat is left in any cabin. Change to another flight free of charge in My Trips.');
    var r=a.kind==='award'?(z7()?('退還哩程差 '+Number(a.miles||0).toLocaleString()+' 哩（新效期至 '+a.expiry+'）'):('miles difference refunded: '+a.miles))
      :(z7()?('票價差額 NT$'+Number(a.refund||0).toLocaleString()+' 退回原付款方式'):('fare difference NT$'+a.refund+' refunded'));
    return head+(z7()?('改為 '+cz7(a.to)+' '+(a.seat||'')+'，'+r+'。如希望維持 '+cz7(a.from)+'，可至行程管理免費改搭下一班。'):('moved to '+a.to+'; '+r+'. You may change free to the next flight in '+a.from+'.'));
  }
  function tell7(x,a,f){if(!x.real||!x.booking)return;tell929(x,(z7()?'艙等異動通知 ':'Cabin change ')+f.code+' '+a.date,msg7(a,f))}
  function doUpg7(x,f,date,C,key,now){
    var r=upReq7(x,f,date);if(!r||typeof window.kgmDeskCancelUpgR1006A!=='function')return null;
    var to=(function(){try{return (FARES[r.fromClass||r.prevClsR922]||{}).cabin||r.prevCabinR922||'Economy'}catch(_){return 'Economy'}})();
    var a={kind:'upgrade',id:x.id,pnr:x.pnr,name:x.name,real:true,seg:x.segmentKey,code:f.code,fr:f.fr,to:to,dest:f.to,date:date,dep:f.dep,from:C,miles:+r.miles||0,at:now,status:'open',reqId:r.id};
    window.KGM_NOASK_R1007A=msg7(a,f);
    try{window.kgmDeskCancelUpgR1006A(r.id)}finally{window.KGM_NOASK_R1007A=null}
    if(r.status!=='cancelled')return null;
    a.miles=+r.refundedMiles||a.miles;a.seat='';bkLog7(x.booking,a);tell7(x,a,f);return a;
  }
  function doDown7(x,f,date,C,L,seat,kind,key,now){
    var ff=Object.assign({},f,{date:date}),dist=0;try{dist=distOf(f.fr,f.to)}catch(_){}
    var a={kind:kind,id:x.id,pnr:x.pnr,name:x.name,real:!!x.real,seg:x.segmentKey||'out',code:f.code,fr:f.fr,dest:f.to,date:date,dep:f.dep,from:C,to:L,seat:seat,prevSeat:x.seat,prevFare:x.fare,at:now,status:'open'};
    if(kind==='award'){a.fare=awardCode7(x.fare,L);a.expiry=plus3y7();
      /* 退哩程差：按旅客實際付的哩程、依兩個艙等的哩程比例退（即時哩程表的差額可能比當初付的還多） */
      try{var mc=+getAwardMi(C,dist,ff)||0,ml=+getAwardMi(L,dist,ff)||0,b0=x.booking||{},np=((b0.paxList||[]).filter(function(q){return q&&q.passengerType!=='INF'}).length)||1,paid=(+b0.milesDeducted||0)/np;
        a.miles=paid>0&&mc>0?Math.round(paid*Math.max(0,1-ml/mc)/500)*500:Math.max(0,Math.round(mc-ml))}catch(_){a.miles=0}}
    else if(kind==='staff'){a.fare=x.fare}
    else{a.fare=upgradeFare7(f,date,L);a.refund=Math.max(0,curFare929(f,date,x)-lowFare929(f,date,L))}
    var rec={act:'invdown',auto1007A:kind,at:now,by:'SYSTEM',to:L};if(a.refund)rec.amount=a.refund;if(a.miles)rec.miles=a.miles;
    applyRow929(key,x,{cabin:L,fare:a.fare,seat:seat,opsActR929:rec,prevR929:{cabin:C,fare:x.fare,seat:x.seat}},f,date);
    if(x.real&&x.booking){
      var b=x.booking;
      if(kind==='basic'&&a.refund)(b.refundsR60=b.refundsR60||[]).push({at:now,segs:[a.seg],fare:0,fee:0,noShow:0,net:a.refund,downgradeR929:'invdown',dhR1007A:true});
      if(kind==='award'&&a.miles){var u=userOf7(b);if(u){u.mileageLots0809G=Array.isArray(u.mileageLots0809G)?u.mileageLots0809G:[];
        u.mileageLots0809G.push({amount:a.miles,expiry:a.expiry,source:'dh_downgrade_1007A',pnr:b.pnr,ownership:'self',transferable:true});
        u.miles=(+u.miles||0)+a.miles;u.milesLog=[{date:todayISO(),type:'credit',amount:a.miles,reason:'DH downgrade refund '+b.pnr+' '+f.code+' (new expiry '+a.expiry+')',balance:u.miles}].concat(u.milesLog||[]);
        if(S.user&&S.user.id===u.id){S.user.miles=u.miles;S.user.milesLog=u.milesLog;S.user.mileageLots0809G=u.mileageLots0809G}}}
      if(kind==='staff'){try{var sp=b.staffPricing||{};(sp.segments||[]).forEach(function(sg){if(sg&&sg.key===a.seg)sg.assignedCabin=L})}catch(_){}}
      bkLog7(b,a);tell7(x,a,f);
    }
    return a;
  }
  function doOff7(x,f,date,C,kind,key,now){
    var a={kind:'offload',was:kind,id:x.id,pnr:x.pnr,name:x.name,real:!!x.real,seg:x.segmentKey||'out',code:f.code,fr:f.fr,dest:f.to,date:date,dep:f.dep,from:C,to:'',seat:'',prevSeat:x.seat,prevFare:x.fare,at:now,status:'open'};
    applyRow929(key,x,{offloadR929:true,seat:'',opsActR929:{act:'offload',auto1007A:kind,at:now,by:'SYSTEM',reason:'DH'},prevR929:{cabin:C,fare:x.fare,seat:x.seat}},f,date);
    if(x.real&&x.booking){bkLog7(x.booking,a);tell7(x,a,f)}
    return a;
  }
  /* 航班資料讀名單時套用騰位紀錄（模擬旅客沒有訂位檔可以改，靠這份紀錄；真實訂位已經直接改過） */
  function bumpMap7(k){
    var rec=(S.dhBumpR1007A||{})[k],o={};if(!rec)return o;
    (rec.actions||[]).forEach(function(a){if(!a||a.status!=='open')return;
      var r={opsActR929:{act:a.kind==='offload'?'offload':(a.kind==='upgrade'?'restore':'invdown'),auto1007A:a.kind==='offload'?(a.was||'basic'):a.kind,to:a.to,amount:a.refund||0,miles:a.miles||0,by:'SYSTEM',at:a.at},bumpR1007A:a.kind};
      if(a.kind==='offload'){r.offloadR929=true;r.seat=''}else if(a.kind!=='upgrade'){r.cabin=a.to;r.fare=a.fare;r.seat=a.seat}
      o[a.id]=r});
    Object.keys(rec.dhSeats||{}).forEach(function(id){var s=rec.dhSeats[id];o['DH|'+id]=Object.assign(o['DH|'+id]||{},{cabin:s.cabin,seat:s.seat})});
    return o;
  }
  /* 收回騰位時退的票價差額／哩程差（旅客改搭原艙等、或組員不搭這班了） */
  function undoMoney7(b,a,now,why){
    if(a.refund){(b.refundsR60||[]).forEach(function(r){if(r&&r.dhR1007A&&!r.voidR1007A&&(r.segs||[]).indexOf(a.seg)>=0&&+r.net===+a.refund){r.voidR1007A=now;r.voidNet=r.net;r.net=0}})}
    if(a.miles&&a.kind==='award'){var u=userOf7(b);if(u){var left=a.miles;(u.mileageLots0809G||[]).forEach(function(l){if(left>0&&l&&l.source==='dh_downgrade_1007A'&&l.pnr===b.pnr){var t=Math.min(left,+l.amount||0);l.amount-=t;left-=t}});
      u.mileageLots0809G=(u.mileageLots0809G||[]).filter(function(l){return !(l&&l.source==='dh_downgrade_1007A'&&!(+l.amount>0))});
      u.miles=Math.max(0,(+u.miles||0)-a.miles);u.milesLog=[{date:todayISO(),type:'debit',amount:a.miles,reason:'DH downgrade reversed '+b.pnr+' → '+why,balance:u.miles}].concat(u.milesLog||[]);
      if(S.user&&S.user.id===u.id){S.user.miles=u.miles;S.user.milesLog=u.milesLog;S.user.mileageLots0809G=u.mileageLots0809G}}}
  }
  /* 組員班表重算後這位 DH 不搭這班了 → 為他騰位的旅客恢復原艙等（里程升等已退哩，不自動重扣，旅客可再申請） */
  function revert7(a,f,date,key,now){
    a.status='reverted';a.revertedAt=now;
    try{var st=store7(key);delete st.rows[a.id]}catch(_){}
    if(!a.real)return;
    var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===a.pnr})[0];if(!b)return;
    (b.dhBumpR1007A||[]).forEach(function(x){if(x&&x.id===a.id&&x.at===a.at)x.status='reverted'});
    if(a.kind!=='upgrade'){
      if(b.segmentFare0826A)delete b.segmentFare0826A[a.seg];
      if(a.prevSeat){b.seats=b.seats||{};var o={};o[a.prevSeat]=a.name||'';b.seats[a.seg]=o}
      if(a.kind==='staff'){try{((b.staffPricing||{}).segments||[]).forEach(function(sg){if(sg&&sg.key===a.seg)sg.assignedCabin=a.from})}catch(_){}}
      undoMoney7(b,a,now,'crew change');
    }
    var msg=z7()?('組員調位異動：'+f.code+'（'+date+'）'+(a.kind==='upgrade'?'不再需要您的座位。里程升等先前已取消、哩程已全額退回，如需要可再申請升等。'
        :('已恢復 '+cz7(a.from)+(a.prevSeat?(' '+a.prevSeat):'')+(a.refund||a.miles?'，先前退回的差額收回。':'。'))))
      :('Crew change on '+f.code+': your original cabin is restored.');
    try{if(typeof _pushBkNotif==='function')_pushBkNotif(b,'【艙等恢復】'+msg)}catch(_){}
    try{tell929({real:true,booking:b},(z7()?'艙等恢復 ':'Cabin restored ')+f.code+' '+date,msg)}catch(_){}
  }
  window.kgmDhBumpR1007A=function(f,date,force){
    try{
      if(String(window.KGM_SIDE||'')==='front'||!f||!date||f.partner)return 0;
      var h=hrsTo7(f,date);if(!force&&(h>72||h<0))return 0;
      var key=opKey(f,date),m=manifest7(f,date),now=new Date().toISOString(),rev=0;
      var rec=S.dhBumpR1007A[key];
      if(rec){var cur={};m.forEach(function(x){if(x.dhR929)cur[x.member]=1});
        Object.keys(rec.dhSeats||{}).forEach(function(id){if(!cur[id])delete rec.dhSeats[id]});
        (rec.actions||[]).forEach(function(a){if(a&&a.status==='open'&&a.forDh&&!cur[a.forDh]){revert7(a,f,date,key,now);rev++}});
        if(rev)m=manifest7(f,date)}
      var need=m.filter(function(x){return x.dhR929&&!x.seat});
      if(!need.length){if(rev){try{save()}catch(_){}setTimeout(function(){try{render()}catch(_){}},40)}return 0}
      rec=S.dhBumpR1007A[key]=rec||{actions:[],dhSeats:{},code:f.code,date:date,fr:f.fr,to:f.to};
      var occ={},slots={};m.forEach(function(x){if(x.seat&&!x.offloadR929)occ[x.seat]=x.id});
      seatsFlat7(type7(f,date)).forEach(function(s){if(!s.resident)(slots[s.cabin]=slots[s.cabin]||[]).push(s.id)});
      function freeIn(c){return (slots[c]||[]).filter(function(s){return !occ[s]})[0]||''}
      var n=0;
      ['Business','Premium','Economy'].forEach(function(C){
        var want=need.filter(function(x){return x.cabin===C&&!x.seat});if(!want.length)return;
        /* 先看本艙等還有沒有空位（例如別人剛改搭別班） */
        want.slice().forEach(function(d){var s=freeIn(C);if(!s)return;occ[s]=d.id;d.seat=s;rec.dhSeats[d.member]={cabin:C,seat:s};want.splice(want.indexOf(d),1);n++});
        if(!want.length)return;
        var L=lowerOf7(f,date,C);
        var pool=m.filter(function(x){return x.cabin===C&&!x.dhR929&&!x.offloadR929&&!x.resR928&&!x.bumpR1007A&&x.seat});
        var stf=pool.filter(function(x){return x.staff});
        var ups=pool.filter(function(x){return !x.staff&&x.real&&x.booking&&upReq7(x,f,date)});
        var aws=pool.filter(function(x){return !x.staff&&AWARD_FARES[x.fare]&&ups.indexOf(x)<0});
        var bas=pool.filter(function(x){var fr=FARES[x.fare];return !x.staff&&fr&&fr.familyR48==='Basic'&&ups.indexOf(x)<0&&aws.indexOf(x)<0})
          .sort(function(a,b){return rnd7(key+'|'+a.id)-rnd7(key+'|'+b.id)});   /* 隨機，但同一班每次結果一樣 */
        var queue=[].concat(stf.map(function(x){return ['staff',x]}),ups.map(function(x){return ['upgrade',x]}),aws.map(function(x){return ['award',x]}),bas.map(function(x){return ['basic',x]}));
        while(want.length&&queue.length){
          var q=queue.shift(),kind=q[0],x=q[1],seatC=x.seat,a=null;
          if(kind==='upgrade')a=doUpg7(x,f,date,C,key,now);
          else{var Ls=L?freeIn(L):'';if(Ls){occ[Ls]=x.id;a=doDown7(x,f,date,C,L,Ls,kind,key,now)}else a=doOff7(x,f,date,C,kind,key,now)}
          if(!a)continue;
          var d=want.shift();delete occ[seatC];occ[seatC]=d.id;d.seat=seatC;rec.dhSeats[d.member]={cabin:C,seat:seatC};a.forDh=d.member;a.forDhName=d.name;
          rec.actions.push(a);n++;
        }
        if(want.length)rec.short=(rec.short||0)+want.length;   /* 連基本方案都沒有了：記下來，航班資料會標紅 */
      });
      if(n||rev){rec.at=now;try{logAct(z7()?'DH 自動騰位':'DH seat release',f.code+' '+date+'：'+rec.actions.length+(z7()?' 筆':' actions'))}catch(_){}
        try{save()}catch(_){}setTimeout(function(){try{render()}catch(_){}},40)}
      return n;
    }catch(e){try{console.warn('dh7',e)}catch(_){}return 0}
  };
  /* 航班資料打開某一班時排一次（不在重畫當中執行）；另外每 10 分鐘掃一次已排出 DH、72 小時內起飛的航班 */
  var Q7={};
  function dhQueue7(f,date,m){try{if(String(window.KGM_SIDE||'')==='front')return;var k=opKey(f,date),sig=(m||[]).filter(function(x){return x.dhR929&&!x.seat}).map(function(x){return x.id}).join(',');
    if(!sig||Q7[k]===sig)return;Q7[k]=sig;setTimeout(function(){window.kgmDhBumpR1007A(f,date)},60)}catch(_){}}
  function scan7(){
    try{if(String(window.KGM_SIDE||'')==='front')return;var o=S.crewPositioningR121||{},t=todayISO(),lim=addDays(t,3),list=[];
      Object.keys(o).forEach(function(k){var p=k.split('|');if(p[1]==='GT'||p[0]<t||p[0]>lim||!(o[k]||[]).length)return;
        var f=(matches7(p[1],p[0])||[]).filter(function(x){return x.fr===p[2]&&x.to===p[3]})[0];if(f)list.push([f,p[0]])});
      var i=0;(function step(){if(i>=list.length)return;try{window.kgmDhBumpR1007A(list[i][0],list[i][1])}catch(_){}i++;setTimeout(step,120)})();
    }catch(_){}
  }
  setTimeout(scan7,75000);setInterval(scan7,600000);
  window.kgmDhScanR1007A=scan7;
  /* ── 行程管理：被騰位的旅客可以免費改搭下一班原艙等 ── */
  function nextFlight7(b,a){
    var pax=((b.paxList||[]).filter(function(p){return p&&p.passengerType!=='INF'}).length)||1;
    for(var i=0;i<4;i++){var d=addDays(a.date,i),fl=[];try{fl=(sortedFlights(a.fr,a.dest,d)||[]).filter(function(x){return x&&!x.partner&&!x.isConn&&!x.via})}catch(_){}
      fl.sort(function(p,q){return String(p.dep).localeCompare(String(q.dep))});
      for(var j=0;j<fl.length;j++){var x=fl[j];if(i===0&&(x.code===a.code||String(x.dep)<=String(a.dep||'')))continue;
        var inv=null;try{inv=window.kgmCabinInventory54(Object.assign({},x,{date:d}),d,a.from,b.pnr)}catch(_){}
        if(inv&&(+inv.left||0)>=pax)return {f:x,date:d,left:+inv.left||0}}}
    return null;
  }
  window.kgmDhNextR1007A=function(pnr,i){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0],a=b&&(b.dhBumpR1007A||[])[i];return (a&&a.status==='open')?nextFlight7(b,a):null};
  window.kgmDhFreeChangeR1007A=function(pnr,i){
    var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0],a=b&&(b.dhBumpR1007A||[])[i];
    if(!a||a.status!=='open'){alert(z7()?'這筆異動已處理過。':'Already handled.');return}
    var nf=nextFlight7(b,a);if(!nf){alert(z7()?('接下來 4 天沒有 '+cz7(a.from)+' 空位的班次，請聯繫客服協助安排。'):'No flight with seats in the next 4 days. Please contact us.');return}
    if(!confirm(z7()?('免費改搭 '+nf.f.code+'（'+nf.date+' '+nf.f.dep+'）'+cz7(a.from)+'？'+((a.refund||a.miles)?('\n維持原艙等，先前退回的'+(a.miles?(Number(a.miles).toLocaleString()+' 哩'):('NT$'+Number(a.refund).toLocaleString()))+'將收回。'):'')):('Change free to '+nf.f.code+' '+nf.date+'?')))return;
    var seg=a.seg||'out',now=new Date().toISOString(),newF=Object.assign({},nf.f,{date:nf.date});
    if(/^seg\d+$/.test(seg)){var mc=(b.mcFlights||[])[+seg.slice(3)];if(mc)mc.f=newF}else b[seg+'F']=newF;
    if(b.segmentFare0826A)delete b.segmentFare0826A[seg];
    b.seats=b.seats||{};b.seats[seg]={};try{autoAssignSeat(b,seg)}catch(_){}
    undoMoney7(b,a,now,nf.f.code);
    a.status='changed';a.newCode=nf.f.code;a.newDate=nf.date;a.newDep=nf.f.dep;a.changedAt=now;
    /* 航班資料那一班的紀錄也標成已改搭（座位釋出） */
    try{var k=[a.code,a.date,a.fr,a.dest].join('|'),r=(S.dhBumpR1007A||{})[k];(r&&r.actions||[]).forEach(function(x){if(x&&x.id===a.id&&x.status==='open'){x.status='changed';x.newCode=a.newCode;x.newDate=a.newDate}})}catch(_){}
    try{if(typeof _pushBkNotif==='function')_pushBkNotif(b,(z7()?'【免費改搭完成】':'[Free change] ')+a.code+' '+a.date+' → '+nf.f.code+' '+nf.date+' '+nf.f.dep+'（'+cz7(a.from)+'）')}catch(_){}
    try{logAct(z7()?'DH 騰位旅客免費改搭':'DH bump free change',b.pnr+' '+a.code+' '+a.date+' → '+nf.f.code+' '+nf.date)}catch(_){}
    try{save()}catch(_){}try{render()}catch(_){}
  };
  window.kgmDhTripHtmlR1007A=function(b){
    try{
      var L=(b&&b.dhBumpR1007A)||[];if(!L.length)return '';
      var K={upgrade:z7()?'里程升等取消':'Upgrade cancelled',award:z7()?'酬賓機票降等':'Award downgraded',basic:z7()?'非自願降等':'Involuntary downgrade',staff:z7()?'員工票艙等調整':'Staff seat moved',offload:z7()?'本班無座位':'No seat on this flight'};
      return '<section class="k56-block k7-bump"><header><em>CABIN CHANGE</em>'+(z7()?'艙等異動（組員調位）':'Cabin change (crew positioning)')+'</header>'
        +L.map(function(a,i){
          var nf=a.status==='open'?nextFlight7(b,a):null;
          var what=a.kind==='offload'?(z7()?('原 '+cz7(a.from)+' 座位釋出給執勤組員，本班其他艙等也已客滿'):'Seat released; no other cabin available')
            :a.kind==='upgrade'?(z7()?(cz7(a.from)+' → '+cz7(a.to)+'（回原艙等）'):(a.from+' → '+a.to))
            :(cz7(a.from)+' → '+cz7(a.to)+(a.seat?('　'+a.seat):''));
          var money=a.kind==='award'?(z7()?('已退還哩程差 <b>'+Number(a.miles||0).toLocaleString()+'</b> 哩，新效期至 <b>'+E(a.expiry||'')+'</b>'):('Miles refunded: '+a.miles))
            :a.kind==='upgrade'?(z7()?('已全額退還 <b>'+Number(a.miles||0).toLocaleString()+'</b> 哩（原效期）'):('Miles refunded: '+a.miles))
            :a.refund?(z7()?('已退還票價差額 <b>NT$'+Number(a.refund).toLocaleString()+'</b>（原付款方式）'):('Refund NT$'+a.refund)):'';
          if(a.status!=='open'&&(a.refund||a.miles)&&a.kind!=='upgrade')money+=(z7()?'（'+(a.status==='changed'?'已改搭原艙等，':'')+'已收回）':' (reclaimed)');
          var act='';
          if(a.status==='reverted')act='<div class="k7-done">✓ '+(z7()?(a.kind==='upgrade'?'組員調位已取消，可再申請里程升等':('組員調位已取消，已恢復 '+cz7(a.from)+(a.prevSeat?(' '+E(a.prevSeat)):''))):'Original cabin restored')+'</div>';
          else if(a.status==='changed')act='<div class="k7-done">✓ '+(z7()?('已免費改搭 '+E(a.newCode)+'　'+E(a.newDate)+' '+E(a.newDep||'')+'（'+cz7(a.from)+'）'):('Changed to '+a.newCode+' '+a.newDate))+'</div>';
          else if(nf)act='<button type="button" class="k7-go" onclick="kgmDhFreeChangeR1007A(\''+A(b.pnr)+'\','+i+')">'+(z7()?('免費改搭 '+E(nf.f.code)+'　'+E(nf.date.slice(5).replace('-','/'))+' '+E(nf.f.dep)+'　'+cz7(a.from)):('Change free to '+nf.f.code+' '+nf.date))+'</button>'
            +'<small>'+(z7()?(a.kind==='offload'?'不收任何費用。':((a.refund||a.miles)?'改搭後維持原艙等，先前退回的差額收回。':'不收任何費用。')):'No charge.')+'</small>';
          else act='<small>'+(z7()?'接下來 4 天沒有同艙等空位的班次，請聯繫客服協助。':'No seats in the next 4 days; please contact us.')+'</small>';
          return '<div class="k7-row'+(a.status!=='open'?' done':'')+'"><div class="k7-l"><span class="k7-tag '+a.kind+'">'+E(K[a.kind]||a.kind)+'</span>'
            +'<b>'+E(a.code)+'　'+E(a.date)+'　'+E(a.fr)+' → '+E(a.dest)+'</b><span>'+what+'</span>'+(money?('<span>'+money+'</span>'):'')+'</div>'
            +'<div class="k7-r">'+act+'</div></div>';
        }).join('')
        +'<p class="k7-note">'+(z7()?'依《票務規則》：組員調位需要座位時，依序取消里程升等、酬賓機票降一個艙等、基本方案旅客隨機非自願降等；被調整的旅客都可以免費改搭下一班原艙等。':'Per our ticket rules, crew positioning may require cabin changes; affected guests can change free to the next flight in their original cabin.')+'</p></section>';
    }catch(e){return ''}
  };
  /* ── 行程管理：DH 訂位（組員本人資料、無法選位、可選餐、不可改退升等） ── */
  window.kgmDhActsHtmlR1007A=function(b){
    try{
      var d=b.dhR929||{},p={empId:d.empId,role:d.role},rk=rankOf7(p),st0=staffOf7(d.empId),st={name:st0.name||rk.name,base:st0.base||rk.base};
      return '<section class="k56-block k7-dhinfo"><header><em>CREW POSITIONING · DH</em>'+(z7()?'組員調位訂位':'Crew positioning booking')+'</header>'
        +'<div class="k7-dhgrid">'
        +'<div><small>'+(z7()?'組員':'CREW')+'</small><b>'+E(st.name||((b.paxList||[])[0]||{}).firstName||'')+'</b></div>'
        +'<div><small>'+(z7()?'員工編號':'STAFF NO.')+'</small><b>'+E(d.empId||'')+'</b></div>'
        +'<div><small>'+(z7()?'職位':'POSITION')+'</small><b>'+E(dhTitle7(p))+'</b></div>'
        +'<div><small>'+(z7()?'所屬基地':'BASE')+'</small><b>'+E(st.base||'TPE')+'</b></div>'
        +'<div><small>'+(z7()?'調位航班':'FLIGHT')+'</small><b>'+E(d.flight||'')+'　'+E(d.date||'')+'</b></div>'
        +'<div><small>'+(z7()?'艙等':'CABIN')+'</small><b>'+E(cz7(((FARES[b.outC]||{}).cabin)||'Economy'))+'</b></div>'
        +'</div>'
        +'<ul class="k7-dhrules"><li>'+(z7()?'座位由公司指派（機長商務艙、座艙長豪華經濟艙、其他組員經濟艙），<b>無法自行選位</b>。':'Seats are assigned by the company; seat selection is not available.')+'</li>'
        +'<li>'+(z7()?'可以在上方「餐點」選擇餐食。':'You can choose a meal above.')+'</li>'
        +'<li>'+(z7()?'調位屬於執勤安排，不能改票、退票或里程升等；班表異動時系統會自動更新。':'Positioning is part of duty: no changes, refunds or upgrades.')+'</li></ul></section>';
    }catch(e){return ''}
  };
  (function css7(){if(document.getElementById('k7-dh-css'))return;var s=document.createElement('style');s.id='k7-dh-css';
    s.textContent='.k7-bump .k7-row{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-top:1px solid #EEF1EF;padding:16px 22px}'
      +'.k7-bump .k7-row:first-of-type{border-top:0}.k7-bump .k7-row.done{opacity:.8}'
      +'.k7-l{display:flex;flex-direction:column;gap:4px;flex:1 1 320px;min-width:0}.k7-l b{font-size:14px;color:#0B3B31;letter-spacing:.02em}.k7-l span{font-size:12.5px;color:#4A5852;line-height:1.6}.k7-l span b{font-size:12.5px;color:#0B3B31}'
      +'.k7-tag{align-self:flex-start;font-size:10.5px!important;font-weight:800;letter-spacing:.06em;border-radius:999px;padding:2px 10px;background:#FDE8EC;color:#B3123A!important}'
      +'.k7-tag.upgrade{background:#FFF3DC;color:#8A5A00!important}.k7-tag.award{background:#EEF1FB;color:#33489C!important}.k7-tag.staff{background:#EEF1F4;color:#5B6670!important}'
      +'.k7-r{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:0 1 300px}.k7-r small{font-size:11px;color:#7A857F;text-align:right;line-height:1.5}'
      +'.k7-go{border:0;border-radius:10px;background:#0B493B;color:#fff;font-weight:800;font-size:12.5px;padding:10px 16px;cursor:pointer;white-space:nowrap;box-shadow:0 6px 16px rgba(11,73,59,.18)}.k7-go:hover{background:#0E5A49}'
      +'.k7-done{font-size:12.5px;font-weight:800;color:#0B6B48;background:#E7F4EE;border-radius:10px;padding:8px 12px}'
      +'.k7-note{margin:0;padding:12px 22px 16px;border-top:1px solid #EEF1EF;background:#FBFAF6;font-size:11px;color:#8A8578;line-height:1.7}'
      +'.k7-dhgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 18px;padding:16px 22px 12px}.k7-dhgrid small{display:block;font-size:10px;letter-spacing:.14em;color:#8A8578;font-weight:800}.k7-dhgrid b{font-size:14px;color:#0B3B31}'
      +'.k7-dhrules{margin:0;padding:12px 22px 16px 40px;border-top:1px solid #EEF1EF;background:#FBFAF6;font-size:12.5px;color:#4A5852;line-height:1.9}'
      +'.k56-ico button.k7-noseat{opacity:.5;cursor:not-allowed}.k56-ico button.k7-noseat span{white-space:nowrap}'
      +'.k4b-dhbar.k7-dhbar{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:8px}.k7-dhbar>b{font-size:13px;color:#0B3B31}.k7-dhbar>em{font-size:11px;color:#6B7A72;font-style:normal}.k7-dhbar .k7-dhlist{display:flex;flex-wrap:wrap;gap:8px}'
      +'.k7-dhbar .k7-dhp{display:inline-flex;flex-direction:column;gap:1px;border:1px solid #CFE0D8;background:#F3F8F5;border-radius:10px;padding:6px 10px;font-size:12px;color:#0B3B31;font-weight:800}'
      +'.k7-dhbar .k7-dhp small{font-size:10.5px;color:#4A6A5E;font-weight:700}.k7-dhbar .k7-dhp.need{border-color:#F0B9C3;background:#FDF1F3}'
      +'.k7-dhbar .k7-bumps{font-size:11.5px;color:#5B6670;line-height:1.7}.k7-dhbar .k7-bumps b{color:#B3123A}'
      +'.r7-manifest tr.k7-dhrow td{background:#F3F8F5}.r7-manifest tr.k7-dhrow td:first-child{box-shadow:inset 3px 0 0 #0B6B48}'
      +'@media(max-width:760px){.k7-dhgrid{grid-template-columns:1fr 1fr}.k7-r{align-items:flex-start}.k7-r small{text-align:left}}';
    (document.head||document.documentElement).appendChild(s)})();

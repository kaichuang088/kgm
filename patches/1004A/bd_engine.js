/* ══ 1004A：BigDeal —— 里程／現金／里程＋現金競標，依總價值排名 ══════════════
   使用者：
   「Big Deal也要加入里程競標和現金競標 要顯示有個Available Seat和幾個參與競標者，假如有5個Available Seats但是有7個人在競標，
     那最後兩個人要發EMAIL通知Out of Bid除非額外加入里程堵住或是現金（里程就是按照現金比例，也要可以里程＋現金）
     這就是依照總價值判斷而非是現金取勝。」
   「BigDeal是起飛前7天開始開放……中途那個人定了，所以BigDeal剩餘位置會變4個……目標都是要把高艙等做滿，也可以BigDeal到頭等艙（價錢要合理），
     甚至也可以BigDeal Residence，前提是都沒有任何人用錢競標，也沒有人用里程競標，才會到BigDeal……起飛48hr前會公布結果，所以行程管理也要有BigDeal，
     然後Residence如果真的到BigDeal是全機的人都可以參與競標，但是經濟艙所需的錢或里程一定遠大於豪經（起標價）」
   規則：
   · 開放：起飛前 168 小時（7 天）；結果：起飛前 48 小時公布（自動結標）。
   · 可競標的艙等：比自己高的艙等都可以（豪經、商務限長程；頭等看機型；Residence 限 A380，而且該航段完全沒有
     Residence 現金或里程出價時才會進 BigDeal）。
   · Available Seats ＝ 該艙等「此刻」真的剩下的座位（有人直接買走，這裡就跟著少）。
   · 出價：現金、里程、或兩者合計；總價值 ＝ 現金 ＋ 里程 × NT$0.30（全系統同一個里程價值）。每位旅客一個座位，
     依「每位總價值」由高到低排座位，排不進去的就是 Out of Bid，立即寄信通知，可以再加碼（加現金或加里程）。
   · 起標價 ＝ 目標艙等最低票價與目前艙等最低票價差額的 40%（至少 NT$3,000 × 跨越的艙等數）；
     所以經濟艙跳 Residence 的起標價一定遠大於豪經跳 Residence。 */
(function bigDealR929(){
  var OPEN_H=168,CLOSE_H=48,RATE=function(){try{return typeof KGM_MILE_VALUE==='number'?KGM_MILE_VALUE:0.30}catch(_){return 0.30}};
  var ORDER=['Economy','Premium','Business','First','Resident'];
  var CODE={Economy:'E-C',Premium:'P-F',Business:'B-T',First:'F-X',Resident:'R-R'};
  var WIN={Premium:'P-A',Business:'B-K',First:'F-X',Resident:'R-R'};
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function N(n){return Math.round(+n||0).toLocaleString('en-US')}
  function zh(c){return z()?({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Residence'}[c]||c)
                        :({Premium:'Premium Economy',Resident:'Residence'}[c]||c)}
  window.KGM_BIGDEAL_R929={openH:OPEN_H,closeH:CLOSE_H,openPct:0.40,minPerStep:3000};
  function allF(){try{return [].concat(FLIGHTS,(S.customFlights||[]))}catch(_){return FLIGHTS||[]}}
  function fOf(code,fr,to){var a=allF().filter(function(x){return x&&x.code===code&&!x.partner});
    return a.filter(function(x){return (!fr||x.fr===fr)&&(!to||x.to===to)})[0]||a.filter(function(x){return !x.via})[0]||a[0]||null}
  function hrs(f,date){try{if(window.kgmHoursToDepR920B){var h=window.kgmHoursToDepR920B(f,date);if(isFinite(h))return h}}catch(_){}
    try{return (Date.parse(date+'T'+(f.dep||'00:00')+':00+08:00')-Date.now())/3600000}catch(_){return NaN}}
  function typeOf(f,date){try{return (typeof acftOfFlight==='function'&&acftOfFlight(f.code,date,f.fr,f.to))||f.acft}catch(_){return f.acft}}
  /* 1004A：同一個執行片段裡，同一班同一艙等的庫存只算一次（產生 BigDeal 時「目標艙等／出價者原艙等／排名」原本各算一次）。
     片段結束就清空；出價、結標、撤回前也先清空，數字不會舊。 */
  var INV={},INVT=0;
  function invClear(){INV={};if(INVT){clearTimeout(INVT);INVT=0}}
  function inv(f,date,cab){
    var k=f.code+'|'+f.fr+'|'+f.to+'|'+date+'|'+cab;if(INV[k])return INV[k];
    var r;try{r=window.kgmCabinInventory54(Object.assign({},f,{date:date}),date,cab)||{capacity:0,left:0}}catch(_){r={capacity:0,left:0}}
    INV[k]=r;if(!INVT)INVT=setTimeout(function(){INV={};INVT=0},0);
    return r;
  }
  /* 1004A：機型客艙配置明確沒有這個艙等，就不用逐艙算庫存（後台競標第一次打開要為 7 天內三千多班產生 BigDeal，
     原本每班每個艙等都先算一次庫存才排除，短程窄體機全部白算，競標分頁因此卡 5～6 秒）。查不到配置時照舊算庫存。 */
  var CABKEY={Economy:'econ',Premium:'prem',Business:'biz',First:'suite',Resident:'res'};
  function noCab(tp,cab){try{var c=AC&&AC[tp]&&AC[tp].cabins;if(!c||!CABKEY[cab])return false;var x=c[CABKEY[cab]];return !x||!((+x.seats||0)>0)}catch(_){return false}}
  window.kgmBigDealHasCabR929=function(f,date,cab){if(noCab(typeOf(f,date),cab))return false;return inv(f,date,cab).capacity>0};
  function lowFare(f,date,cab){try{return Math.round(+owPrice(Object.assign({},f,{date:date}),CODE[cab],1)||0)}catch(_){return 0}}
  function resBids(f,date){
    var hit=function(b){return b&&b.code===f.code&&b.date===date&&(!b.fr||(b.fr===f.fr&&b.to===f.to))&&!/withdraw/.test(String(b.status||''))};
    return (S.residenceBidsR83||[]).filter(hit).length+(S.resMileBidsR161||[]).filter(hit).length;
  }
  function cabOfCode(c){try{return ((FARES[c]||AWARD_FARES[c]||{}).cabin)||'Economy'}catch(_){return 'Economy'}}
  window.kgmBigDealWindowR929=function(f,date){var h=hrs(f,date);return {h:h,open:isFinite(h)&&h>CLOSE_H&&h<=OPEN_H,closed:isFinite(h)&&h<=CLOSE_H&&h>-24,before:isFinite(h)&&h>OPEN_H}};
  /* 這一班、這個艙等目前可以拿出來 BigDeal 的艙等（fromCab 以上） */
  window.kgmBigDealTargetsR929=function(f,date,fromCab){
    var out=[],tp=typeOf(f,date),dist=0;try{dist=distOf(f.fr,f.to)}catch(_){}
    var i0=ORDER.indexOf(fromCab||'Economy');
    ORDER.slice(i0+1).forEach(function(cab){
      if((cab==='Premium'||cab==='Business')&&dist<4000)return;          /* 豪經／商務：長程 */
      if(cab==='Resident'&&(tp!=='A388'||resBids(f,date)>0))return;       /* Residence：A380，且沒有人用現金或里程競標過 */
      if(noCab(tp,cab))return;                                           /* 1004A：機型沒有這個艙等 */
      var iv=inv(f,date,cab);if(!iv.capacity)return;
      out.push({cab:cab,seats:Math.max(0,iv.left|0),capacity:iv.capacity});
    });
    return out;
  };
  window.kgmBigDealOpenPriceR929=function(f,date,fromCab,toCab){
    var cfg=window.KGM_BIGDEAL_R929,steps=Math.max(1,ORDER.indexOf(toCab)-ORDER.indexOf(fromCab));
    var diff=Math.max(0,lowFare(f,date,toCab)-lowFare(f,date,fromCab));
    var cash=Math.max(Math.round(diff*cfg.openPct/100)*100,cfg.minPerStep*steps);
    return {cash:cash,miles:Math.ceil(cash/RATE()/500)*500,diff:diff};
  };
  function val(b){return (+b.amount||0)+Math.round((+b.miles||0)*RATE())}
  window.kgmBigDealValueR929=val;
  function live(b){return b&&(b.status==='open'||b.status==='leading'||b.status==='outbid'||b.status==='pending')}
  function grpOf(code,date,fr,to,cab){return (S.bigDeals||[]).filter(function(b){return b&&b.code===code&&b.date===date
    &&(!fr||!b.fr||(b.fr===fr&&b.to===to))&&((b.toCabin||b.cabin)===cab)})}
  /* 排名：每位總價值高者先排；一筆訂位幾位旅客就佔幾個座位；排不下 → Out of Bid */
  window.kgmBigDealRankR929=function(code,date,fr,to,cab,notify){
    var f=fOf(code,fr,to);if(!f)return {seats:0,bidders:0,list:[]};
    var seats=Math.max(0,inv(f,date,cab).left|0),list=grpOf(code,date,fr,to,cab).filter(live);
    list.sort(function(a,b){return val(b)/Math.max(1,+b.pax||1)-val(a)/Math.max(1,+a.pax||1)||String(a.at||'').localeCompare(String(b.at||''))});
    var left=seats,changed=[];
    list.forEach(function(b,i){
      var p=Math.max(1,+b.pax||1),was=b.status,now=(p<=left)?'leading':'outbid';
      if(now==='leading')left-=p;
      b.rankR929=i+1;
      if(was!==now){b.status=now;changed.push(b)}
      if(now==='outbid'&&!b.outbidMailAt&&notify!==false){b.outbidMailAt=new Date().toISOString();mailOutbid(b,seats,list.length)}
      if(now==='leading')b.outbidMailAt='';
    });
    return {seats:seats,bidders:list.length,list:list,changed:changed};
  };
  function mailTo(b){try{var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0];var p=bk&&(bk.paxList||[])[0]||{};
    return p.email||(bk&&bk.contactEmail)||((S.users||[]).filter(function(u){return u.id===b.userId})[0]||{}).email||''}catch(_){return ''}}
  function note(b,title,msg,ev){
    if(b.demoR922){(b.mailLogR929=b.mailLogR929||[]).push({ev:ev,at:new Date().toISOString()});return}   /* 模擬出價只記寄信紀錄，不塞進任何人的通知 */
    try{S.notifs=S.notifs||[];S.notifs.unshift({title:title,message:msg,userId:b.userId,pnr:b.pnr,ts:new Date().toISOString(),type:ev});}catch(_){}
    try{var m=mailTo(b);if(m&&typeof kgmNotify==='function'&&!b.demoR922)Promise.resolve(kgmNotify(ev,{email:m,pnr:b.pnr,flight:b.code,date:b.date,
      cabin:b.toCabin,bid:val(b),subject:title,message:msg})).catch(function(){})}catch(_){}
    (b.mailLogR929=b.mailLogR929||[]).push({ev:ev,at:new Date().toISOString()});
  }
  function mailOutbid(b,seats,n){
    note(b,(z()?'BigDeal 出價已被超越（Out of Bid）':'BigDeal: you have been outbid')+' '+b.code+' '+b.date,
      z()?('您對 '+b.code+'（'+b.date+'）'+zh(b.toCabin)+' 的 BigDeal 出價，每位總價值 NT$'+N(val(b)/Math.max(1,+b.pax||1))
          +' 目前排在 '+seats+' 個座位之外（共 '+n+' 位競標者）。起飛前 48 小時公布結果前，可到「行程管理」加碼現金或里程。')
         :('Your BigDeal bid is currently outside the '+seats+' seats available ('+n+' bidders). Add cash or miles in Manage My Trip before results are published 48h before departure.'),
      'bigdeal.outbid');
  }
  /* 出價／加碼：同一個訂位同一航段同一艙等只有一筆，加碼只能往上加 */
  window.kgmBigDealPlaceR929=function(pnr,segKey,toCab,cash,miles){
    try{
      invClear();
      var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!bk)return {ok:false,why:z()?'查無訂位':'booking not found'};
      if(!S.user||bk.userId&&bk.userId!==S.user.id)return {ok:false,why:z()?'請先登入訂位本人的會員帳號':'Please sign in'};
      var s=((window.kgmTripSegmentsH&&window.kgmTripSegmentsH(bk))||[]).filter(function(x){return x.key===segKey})[0];if(!s)return {ok:false,why:'segment'};
      var f=fOf(s.code,s.fr,s.to);if(!f)return {ok:false,why:'flight'};
      var w=window.kgmBigDealWindowR929(f,s.date);
      try{window.kgmEnsureAuctionsR922&&window.kgmEnsureAuctionsR922(s.code,s.date,Object.assign({},f,{date:s.date}))}catch(_){}
      if(!w.open)return {ok:false,why:w.before?(z()?'BigDeal 於起飛前 7 天開放':'Opens 7 days before departure'):(z()?'已超過起飛前 48 小時，BigDeal 已截止':'Closed 48h before departure')};
      var fromCab=cabOfCode(s.c||s.cls||(segKey==='inb'?bk.inbC:bk.outC));
      var tg=window.kgmBigDealTargetsR929(f,s.date,fromCab).filter(function(t){return t.cab===toCab})[0];
      if(!tg)return {ok:false,why:z()?'這個艙等目前沒有開放 BigDeal':'Not open for BigDeal'};
      cash=Math.max(0,Math.round(+cash||0));miles=Math.max(0,Math.round(+miles||0));
      var pax=Math.max(1,(bk.paxList||[]).filter(function(p){return p.passengerType!=='INF'}).length||1);
      var op=window.kgmBigDealOpenPriceR929(f,s.date,fromCab,toCab);
      var mine=grpOf(s.code,s.date,s.fr,s.to,toCab).filter(function(b){return b.pnr===pnr&&live(b)})[0];
      var nc=(mine?(+mine.amount||0):0)+cash,nm=(mine?(+mine.miles||0):0)+miles;
      if(!mine&&(nc+Math.round(nm*RATE()))<op.cash*pax)return {ok:false,why:(z()?'總價值低於起標價 NT$':'Below opening value NT$')+N(op.cash*pax)};
      if(mine&&!cash&&!miles)return {ok:false,why:z()?'請輸入要加碼的現金或里程':'Enter cash or miles to add'};
      var bal=+((S.user&&S.user.miles)||0);if(nm>bal)return {ok:false,why:(z()?'里程餘額不足（目前 ':'Not enough miles (')+N(bal)+(z()?' 哩）':')')};
      var now=new Date().toISOString();
      if(mine){mine.amount=nc;mine.miles=nm;mine.at=now;mine.raisedR929=(mine.raisedR929||0)+1;mine.outbidMailAt=''}
      else{S.bigDeals=S.bigDeals||[];mine={id:'BD929'+Date.now().toString(36),pnr:pnr,segKey:segKey,userId:S.user.id,who:S.user.name||S.user.id,
        code:s.code,date:s.date,fr:s.fr,to:s.to,cabin:fromCab,toCabin:toCab,amount:nc,miles:nm,pax:pax,status:'open',at:now,kindR929:1};S.bigDeals.push(mine)}
      var r=window.kgmBigDealRankR929(s.code,s.date,s.fr,s.to,toCab,false);
      note(mine,(z()?'BigDeal 出價已收到 ':'BigDeal bid received ')+s.code+' '+s.date,
        z()?('您對 '+zh(toCab)+' 的出價：現金 NT$'+N(nc)+'＋'+N(nm)+' 哩（總價值 NT$'+N(val(mine))+'）。目前第 '+mine.rankR929+' 名，'
            +(mine.status==='leading'?'在 '+r.seats+' 個座位之內。':'在座位之外（Out of Bid）。')+'起飛前 48 小時公布結果；得標才扣款、扣哩程。')
           :('Bid received. Rank #'+mine.rankR929+'. Results 48h before departure; charged only if you win.'),'bigdeal.bid_received');
      /* 先寄「出價已收到」，再寄 Out of Bid；同時把被這筆擠出座位的其他人也通知 */
      window.kgmBigDealRankR929(s.code,s.date,s.fr,s.to,toCab);
      try{save()}catch(_){}
      return {ok:true,bid:mine,rank:mine.rankR929,status:mine.status,seats:r.seats,bidders:r.bidders};
    }catch(e){return {ok:false,why:e.message}}
  };
  window.kgmBigDealWithdrawR929=function(id){invClear();var b=(S.bigDeals||[]).filter(function(x){return x&&x.id===id})[0];
    if(!b||!live(b))return false;b.status='withdrawn';b.withdrawnAt=new Date().toISOString();
    try{window.kgmBigDealRankR929(b.code,b.date,b.fr,b.to,b.toCabin)}catch(_){}try{save()}catch(_){}return true};
  /* 起飛前 48 小時公布：排在座位內 → 得標（改艙等、扣款、扣哩程）；其餘 → 未得標 */
  window.kgmBigDealSettleR929=function(code,date,fr,to,cab){
    invClear();
    var r=window.kgmBigDealRankR929(code,date,fr,to,cab,false),won=0;
    r.list.forEach(function(b){
      var win=b.status==='leading';b.status=win?'won':'lost';b.settledAt=new Date().toISOString();
      if(win){won++;
        try{var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0];
          if(bk&&!b.demoR922){var nc=WIN[b.toCabin]||CODE[b.toCabin];
            if(b.segKey==='out')bk.outC=nc;else if(b.segKey==='inb')bk.inbC=nc;
            bk.segmentFare0826A=bk.segmentFare0826A||{};if(b.segKey)bk.segmentFare0826A[b.segKey]=nc;
            bk.total=(+bk.total||0)+(+b.amount||0);
            (bk.bigDealR929=bk.bigDealR929||[]).push({id:b.id,seg:b.segKey,to:b.toCabin,cash:+b.amount||0,miles:+b.miles||0,at:b.settledAt});
            var u=(S.users||[]).filter(function(x){return x.id===b.userId})[0];
            if(u&&+b.miles){u.miles=Math.max(0,(+u.miles||0)-(+b.miles));(u.milesLog=u.milesLog||[]).unshift({date:(typeof todayISO==='function'?todayISO():''),type:'debit',amount:+b.miles,reason:'BigDeal '+b.code+' '+zh(b.toCabin),balance:u.miles});
              if(S.user&&S.user.id===u.id)S.user.miles=u.miles}
          }}catch(_){}
      }
      note(b,(win?(z()?'BigDeal 得標 ':'BigDeal won '):(z()?'BigDeal 未得標 ':'BigDeal not successful '))+b.code+' '+b.date,
        win?(z()?('恭喜！'+b.code+'（'+b.date+'）已升等至 '+zh(b.toCabin)+'。已收取現金 NT$'+N(b.amount)+(+b.miles?('、扣除 '+N(b.miles)+' 哩'):'')+'。')
             :('Upgraded to '+zh(b.toCabin)+'.'))
           :(z()?('很抱歉，'+b.code+'（'+b.date+'）'+zh(b.toCabin)+' 的 BigDeal 未得標，不會收取任何費用或里程。'):'Not successful; nothing was charged.'),
        'bigdeal.result');
    });
    try{save()}catch(_){}
    return {won:won,total:r.list.length,seats:r.seats};
  };
  /* 自動：已進入 48 小時內、還有未結標出價的航段一律結標；窗口內的航段重新排名（座位被買走 → 名額跟著少） */
  window.kgmBigDealTickR929=function(){
    var g={},n=0;
    (S.bigDeals||[]).forEach(function(b){if(!live(b)||!b.code||!b.date)return;var k=[b.code,b.date,b.fr||'',b.to||'',b.toCabin||b.cabin].join('|');g[k]=1});
    Object.keys(g).forEach(function(k){
      var p=k.split('|'),f=fOf(p[0],p[2],p[3]);if(!f)return;var w=window.kgmBigDealWindowR929(f,p[1]);
      try{if(w.closed||(isFinite(w.h)&&w.h<=-24))window.kgmBigDealSettleR929(p[0],p[1],p[2],p[3],p[4]);else if(w.open)window.kgmBigDealRankR929(p[0],p[1],p[2],p[3],p[4]);n++}catch(_){}
    });
    return n;
  };
  /* 舊版模擬的 BigDeal（只有商務艙、只有現金、pending/approved）一次清掉，改由新規則重新產生；旅客自己出的價不動 */
  setTimeout(function(){try{var n0=(S.bigDeals||[]).length;S.bigDeals=(S.bigDeals||[]).filter(function(b){return !(b&&/^BD92[12]/.test(String(b.id||''))&&!b.kindR929)});
    if(S.bigDeals.length!==n0){try{save()}catch(_){}}}catch(_){}},2500);
  setTimeout(function(){try{window.kgmBigDealTickR929()}catch(_){}},25000);
  setInterval(function(){try{window.kgmBigDealTickR929()}catch(_){}},300000);

  /* ── 行程管理裡的 BigDeal 區塊 ─────────────────────────────── */
  function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  window.kgmBigDealKeyR929=function(b){try{return (S.bigDeals||[]).filter(function(x){return x&&x.pnr===b.pnr}).map(function(x){return x.id+x.status+val(x)+(x.rankR929||'')}).join(',')+'|'+(S.bdOpenR929||'')}catch(_){return ''}};
  window.kgmBigDealTripHtmlR929=function(b,segs){
    try{
      if(!b||String(b.status||'confirmed')!=='confirmed'||b.stx||b.staffTix)return '';
      var cards=[];
      (segs||[]).forEach(function(s){
        var f=fOf(s.code,s.fr,s.to);if(!f||f.partner)return;
        var w=window.kgmBigDealWindowR929(f,s.date);
        /* 其他旅客的出價（模擬資料）與 Residence 競標要先就位，Available Seats／競標人數才會跟後台一致 */
        if(w.open||w.closed){try{window.kgmEnsureAuctionsR922&&window.kgmEnsureAuctionsR922(s.code,s.date,Object.assign({},f,{date:s.date}))}catch(_){}}
        var mine=(S.bigDeals||[]).filter(function(x){return x&&x.pnr===b.pnr&&x.code===s.code&&x.date===s.date&&x.status!=='withdrawn'});
        if(!w.open&&!mine.length)return;
        var fromCab=cabOfCode(s.c||s.cls||(s.key==='inb'?b.inbC:b.outC));
        var tg=w.open?window.kgmBigDealTargetsR929(f,s.date,fromCab):[];
        var pax=Math.max(1,(b.paxList||[]).filter(function(p){return p.passengerType!=='INF'}).length||1);
        var rows=tg.map(function(t){
          var r=window.kgmBigDealRankR929(s.code,s.date,s.fr,s.to,t.cab),op=window.kgmBigDealOpenPriceR929(f,s.date,fromCab,t.cab);
          var my=r.list.filter(function(x){return x.pnr===b.pnr})[0];
          var id='bd929_'+E(s.key)+'_'+t.cab;
          var st=my?('<span class="k929bd-st '+my.status+'">'+(my.status==='leading'?(z()?'座位內 · 第 ':'In seats · #')+my.rankR929+(z()?' 名':''):(z()?'Out of Bid · 第 ':'Out of bid · #')+my.rankR929+(z()?' 名':''))+'</span>'):'';
          return '<div class="k929bd-row">'
            +'<div class="k929bd-cab"><b>'+E(zh(t.cab))+'</b>'+st
              +'<small>'+(z()?'起標 NT$':'From NT$')+N(op.cash*pax)+(z()?'（或 ':' (or ')+N(op.miles*pax)+(z()?' 哩）':' mi)')+(pax>1?(z()?' · '+pax+' 位':' · '+pax+' pax'):'')+'</small></div>'
            +'<div class="k929bd-kpi"><span><i>Available Seats</i><b>'+r.seats+'</b></span><span><i>'+(z()?'競標人數':'Bidders')+'</i><b>'+r.bidders+'</b></span>'
              +(function(){var ld=r.list.filter(function(x){return x.status==='leading'});if(!r.seats||ld.length<1||r.list.length<=ld.length)return '';
                var last=ld[ld.length-1];return '<span><i>'+(z()?'入選門檻／位':'Cut-off / pax')+'</i><b>NT$'+N(val(last)/Math.max(1,+last.pax||1))+'</b></span>'})()
              +(my?('<span><i>'+(z()?'我的總價值':'My value')+'</i><b>NT$'+N(val(my))+'</b></span>'):'')+'</div>'
            +'<div class="k929bd-in"><label>'+(z()?(my?'加碼現金':'現金'):'Cash')+'<input id="'+id+'_c" type="number" min="0" step="500" placeholder="NT$"></label>'
              +'<label>'+(z()?(my?'加碼里程':'里程'):'Miles')+'<input id="'+id+'_m" type="number" min="0" step="1000" placeholder="'+(z()?'哩':'mi')+'"></label>'
              +'<button class="btn btn-g" onclick="kgmBigDealBidUiR929(\''+E(b.pnr)+'\',\''+E(s.key)+'\',\''+t.cab+'\')">'+(my?(z()?'加碼':'Raise'):(z()?'出價':'Bid'))+'</button>'
              +(my?('<button class="btn" onclick="if(confirm(\''+(z()?'確定撤回這筆 BigDeal 出價？':'Withdraw this bid?')+'\')){kgmBigDealWithdrawR929(\''+E(my.id)+'\');render()}">'+(z()?'撤回':'Withdraw')+'</button>'):'')
            +'</div></div>';
        }).join('');
        var done=mine.filter(function(x){return x.status==='won'||x.status==='lost'}).map(function(x){
          return '<div class="k929bd-res '+x.status+'">'+(x.status==='won'?(z()?'✓ 已得標：升等至 ':'✓ Won: upgraded to ')+E(zh(x.toCabin)):(z()?'未得標：':'Not successful: ')+E(zh(x.toCabin)))
            +' · '+(z()?'現金 NT$':'cash NT$')+N(x.amount)+(+x.miles?(' ＋ '+N(x.miles)+(z()?' 哩':' mi')):'')+'</div>'}).join('');
        if(!rows&&!done)return;
        cards.push('<div class="k929bd-seg"><div class="k929bd-h"><b>'+E(s.code)+' '+E(s.fr)+' → '+E(s.to)+'</b><span>'+E(s.date)+' · '+E(zh(fromCab))
          +(w.open?(' · '+(z()?'距公布 ':'results in ')+Math.max(0,Math.round(w.h-CLOSE_H))+(z()?' 小時':'h')):'')+'</span></div>'+rows+done+'</div>');
      });
      if(!cards.length)return '';
      return '<section class="k56-block k929bd"><header><em>BIGDEAL · UPGRADE AUCTION</em>'+(z()?'BigDeal 競標升等':'BigDeal upgrade auction')+'</header>'
        +'<div class="k929bd-body"><p class="k929bd-note">'+(z()?'起飛前 7 天開放、起飛前 48 小時公布結果。可以用現金、里程或現金＋里程出價（1 哩 = NT$'+RATE().toFixed(2)+'），'
          +'依每位旅客的總價值由高到低分配 Available Seats；排在座位之外會立即收到 Out of Bid 通知，可隨時加碼。得標才扣款與扣哩程。'
          :'Opens 7 days before departure; results 48h before. Bid cash, miles, or both (1 mile = NT$'+RATE().toFixed(2)+'). Seats go to the highest value per passenger.')+'</p>'
        +cards.join('')+'</div></section>';
    }catch(e){return ''}
  };
  window.kgmBigDealBidUiR929=function(pnr,key,cab){
    var id='bd929_'+key+'_'+cab,c=+((document.getElementById(id+'_c')||{}).value||0),m=+((document.getElementById(id+'_m')||{}).value||0);
    var r=window.kgmBigDealPlaceR929(pnr,key,cab,c,m);
    if(!r.ok){alert(r.why||'—');return}
    alert(z()?('出價完成：目前第 '+r.rank+' 名（Available Seats '+r.seats+'、競標人數 '+r.bidders+'）'+(r.status==='outbid'?'，在座位之外，可再加碼。':'。'))
             :('Bid placed: rank #'+r.rank+'.'));
    try{render()}catch(_){}
  };
  (function css(){if(document.getElementById('k929bd-css'))return;var st=document.createElement('style');st.id='k929bd-css';
    st.textContent='.k929bd-body{padding:14px 22px 20px}.k929bd .k929bd-note{margin:0 0 12px;font-size:12px;color:#5f6b66;line-height:1.8}'
      +'.k929bd-seg{border:1px solid #e6dcc4;border-radius:14px;background:#fffdf7;padding:12px 14px;margin-bottom:12px}'
      +'.k929bd-h{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline;margin-bottom:8px}.k929bd-h b{font-size:14px;color:#0b493b}.k929bd-h span{font-size:11.5px;color:#8a7a55}'
      +'.k929bd-row{display:grid;grid-template-columns:minmax(150px,1.1fr) minmax(170px,1fr) minmax(260px,1.6fr);gap:12px;align-items:center;padding:10px 0;border-top:1px dashed #eadfca}'
      +'.k929bd-cab b{display:block;font-size:14px;color:#1c2b26}.k929bd-cab small{display:block;font-size:11px;color:#8a7a55;margin-top:3px}'
      +'.k929bd-st{display:inline-block;margin:4px 0 0;border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:900}.k929bd-st.leading{background:#e7f4ee;color:#0b6b48}.k929bd-st.outbid{background:#fde8ec;color:#b3123a}'
      +'.k929bd-kpi{display:flex;gap:14px}.k929bd-kpi span{display:flex;flex-direction:column}.k929bd-kpi i{font-style:normal;font-size:9.5px;letter-spacing:.06em;color:#8a94a0;text-transform:uppercase}.k929bd-kpi b{font-size:18px;color:#0b493b}'
      +'.k929bd-in{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}.k929bd-in label{display:flex;flex-direction:column;font-size:10.5px;color:#6b7a72;gap:3px}.k929bd-in input{width:110px;height:34px;border:1px solid #d6dee9;border-radius:8px;padding:0 8px}'
      +'.k929bd-in .btn{height:34px}'
      +'.k929bd-res{margin-top:8px;padding:8px 10px;border-radius:10px;font-size:12.5px;font-weight:800}.k929bd-res.won{background:#e7f4ee;color:#0b6b48}.k929bd-res.lost{background:#f4f4f2;color:#6b6b6b}'
      +'@media(max-width:760px){.k929bd-row{grid-template-columns:1fr}}';
    (document.head||document.documentElement).appendChild(st)})();
})();

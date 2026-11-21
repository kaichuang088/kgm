/* ══ 1103A：KGM Cards 聯名卡——消費、帳單、哩程回饋、會籍積分、機場接送（使用者：
   「後台也要可以看到每個信用卡的消費 然後透過消費累積多少里程等等 有那些卡所有消費會變成里程 每個等級有自己的境外境內轉換比例 我記得應該有…」
   「star m card must have 一定要有拿過 star k card reach a requirement 之前有寫過你去翻下」「包含一年兩次機場接送也要有這個系統喔在這種卡片使用者」
   「要有信用卡區域在上排給有綁定者 帳單也要從上面看」「所有消費境外包含線上的也算喔 然後要有個清楚的表格消費紀錄換成多少里程等等」
   「使用STAR G/M也要送會籍積分和自營會籍積分」）
   · 回饋比率、年費、申辦條件：網站已有《KGM Cards 聯名卡使用辦法》KGM-CRD-020（1023A 訂）→ 照它（使用者：「我記得應該有，如果沒有的話就是…」）：
       Star K 國內 NT$30／海外 NT$20（含國外網站）／KGM 官網 NT$15 一哩；Star G 20／15／10；Star M 15／10／8；每期上限 10 萬／20 萬／不設限。
       Star M 申辦＝持有 Star G 滿一年＋前 12 個月簽帳 300 萬＋銀卡以上；Star G＝持有 Star K 滿一年＋前 12 個月簽帳 75 萬（Star K → G → M）。
   · 會籍積分（CRD-020 Rev. B 新增）：Star G 每 NT$10,000 簽帳 2 分、Star M 3 分，同時計入「會籍積分」與「自營航班會籍積分」；每曆年上限 Star G 100 分、Star M 200 分。Star K 不送。
   · 機場接送（CRD-020 Rev. B 新增）：Star G／Star M 每曆年 2 次（桃園／松山，限搭乘 KGM 航班當天），起飛／抵達前 24 小時前可取消並退回次數。
   · 消費資料：發卡銀行是虛構的，消費明細依卡片編號固定產生（同一張卡每次開頁一樣）；會員自己用這張卡（付款方式末四碼相同）在官網買的 KGM 機票照實列入。
     結帳日每月最後一天，結帳後 9 天（約 7 個工作日）入帳到綁定的 Explorer 帳戶；綁定前一年內已結帳的帳單在綁定後補入（CRD-020 第 9 條）。
   · 入帳紀錄 S.cardPostR1103A（kgm31_cpost，卡片 → 已入帳月份）；接送預約 S.cardXferR1103A（kgm31_xfer）。 */
(function(){
  if(window.__kc31)return;window.__kc31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function N(n){return (Math.round(+n||0)).toLocaleString()}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function H(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
  var RATE={stark:{dom:30,ovs:20,kgm:15,cap:100000,fee:0,fx:1.5,tp:0,tpCap:0,xfer:0,name:'Star K',lounge:0},
            starg:{dom:20,ovs:15,kgm:10,cap:200000,fee:8800,fx:1.0,tp:2,tpCap:100,xfer:2,name:'Star G',lounge:6},
            starm:{dom:15,ovs:10,kgm:8,cap:Infinity,fee:36000,fx:0,tp:3,tpCap:200,xfer:2,name:'Star M',lounge:-1}};
  window.KGM_CARD_RATE_R1103A=RATE;
  /* 商店：[名稱, 類別 dom/ovs/ovsweb/none, 原幣, 金額範圍(原幣)]；none＝不回饋（CRD-020 第 10 條） */
  var SHOP=[['全聯福利中心','dom','TWD',[180,2600]],['誠品書店','dom','TWD',[320,2400]],['台灣高鐵','dom','TWD',[700,3000]],['台灣中油','dom','TWD',[900,2200]],['新光三越','dom','TWD',[1500,26000]],
    ['Uber Eats','dom','TWD',[220,1100]],['中華電信','dom','TWD',[499,1399]],['好市多 Costco','dom','TWD',[1800,12000]],['鼎泰豐','dom','TWD',[900,4200]],['台北 101 購物中心','dom','TWD',[2000,48000]],
    ['Amazon.com','ovsweb','USD',[18,420]],['Apple.com/us','ovsweb','USD',[1,1599]],['Booking.com','ovsweb','EUR',[120,980]],['Agoda','ovsweb','USD',[90,760]],['Netflix.com','ovsweb','USD',[15,23]],['Steam','ovsweb','USD',[9,70]],
    ['UNIQLO 銀座','ovs','JPY',[3000,42000]],['Marriott Bangkok','ovs','THB',[4200,26000]],['Changi Airport Shops','ovs','SGD',[30,600]],['Galeries Lafayette','ovs','EUR',[60,1800]],['Lotte Duty Free','ovs','KRW',[60000,900000]],
    ['預借現金','none','TWD',[3000,20000]],['繳納所得稅','none','TWD',[8000,60000]]];
  var FX={TWD:1,USD:31.8,EUR:34.6,JPY:0.212,THB:0.93,SGD:24.1,KRW:0.0232};
  function lastDay(ym){var y=+ym.slice(0,4),m=+ym.slice(5,7);return ym+'-'+String(new Date(Date.UTC(y,m,0)).getUTCDate()).padStart(2,'0')}
  function addM(ym,n){var y=+ym.slice(0,4),m=+ym.slice(5,7)-1+n;y+=Math.floor(m/12);m=((m%12)+12)%12;return y+'-'+String(m+1).padStart(2,'0')}
  function isKgm(c){return c&&RATE[c.net]}
  function bindDay(c){return String(c.decidedAt||(c.ai&&c.ai.at)||c.at||'').slice(0,10)||T()}
  function issueYm(c){if(c.issuedR1103A)return c.issuedR1103A;var b=bindDay(c).slice(0,7);return addM(b,-(6+H(c.id+'iss')%14))}
  window.kgmCardsOfR1103A=function(uid){return (S.cardBindR1022A||[]).filter(function(c){return c&&c.userId===uid&&c.status==='verified'&&isKgm(c)})};
  window.kgmHasCardR1103A=function(){try{return !!(S.user&&window.kgmCardsOfR1103A(S.user.id).length)}catch(_){return false}};
  function memberOf(uid){return (S.users||[]).filter(function(u){return u&&u.id===uid})[0]||null}
  /* 某張卡某個月的消費明細（固定產生）＋會員用這張卡在官網買的 KGM 機票 */
  var TC={};
  function txns(c,ym){var k=c.id+'|'+ym+'|'+(S.bookings||[]).length;if(TC[k])return TC[k];var out=[],R=RATE[c.net],end=lastDay(ym),cut=T()<end?T():end;
    /* 每張卡每月的一般消費約為卡別月平均（Star K 3.8 萬、G 8.5 萬、M 24 萬）的 55%～145%，當月只算到今天 */
    var n=8+H(c.id+ym)%14,raw=[],sum=0;
    for(var i=0;i<n;i++){var h=H(c.id+ym+'#'+i),sp=SHOP[h%SHOP.length];if(sp[1]==='none'&&h%5)sp=SHOP[(h>>>3)%21];
      var day=1+(h>>>7)%28,d=ym+'-'+String(day).padStart(2,'0');if(d>cut)continue;
      var lo=sp[3][0],hi=sp[3][1],a0=(lo+((h>>>11)%1000)/1000*(hi-lo))*FX[sp[2]];raw.push({d:d,sp:sp,t:a0});if(sp[1]!=='none')sum+=a0}
    var tgt={stark:38000,starg:85000,starm:240000}[c.net]*(0.55+(H(c.id+ym+'t')%90)/100)*(cut<end?Math.max(0.1,(+cut.slice(8,10))/(+end.slice(8,10))):1),k0=sum?tgt/sum:1;
    raw.forEach(function(r){var sp=r.sp,cur=sp[2],twd=Math.max(1,Math.round(sp[1]==='none'?r.t:r.t*k0)),amt0=twd/FX[cur];amt0=cur==='JPY'||cur==='KRW'||cur==='TWD'?Math.round(amt0):Math.round(amt0*100)/100;twd=Math.round(amt0*FX[cur]);
      var cat=sp[1],per=cat==='none'?0:(cat==='dom'?R.dom:R.ovs),fx=(cat==='ovs'||cat==='ovsweb')?Math.round(twd*R.fx/100):0;
      out.push({d:r.d,shop:sp[0],cat:cat,cur:cur,amt:amt0,twd:twd,fx:fx,per:per,mi:per?Math.floor(twd/per):0})});
    var l4=String(c.last4||'');(S.bookings||[]).forEach(function(b){if(!b||!b.userId||b.userId!==c.userId||b.status==='cancelled')return;var at=String(b.bookedAt||b.createdAt||'').slice(0,10);if(at.slice(0,7)!==ym||at>cut)return;
      if(!l4||String(b.paymentMethod||'').slice(-4)!==l4)return;var cur=b.curr||'TWD',twd=Math.round((+b.total||0)*(FX[cur]||1));if(!twd)return;
      out.push({d:at,shop:'KGM Airways '+(z()?'官網購票 ':'ticket ')+b.pnr,cat:'kgm',cur:'TWD',amt:twd,twd:twd,fx:0,per:R.kgm,mi:Math.floor(twd/R.kgm),pnr:b.pnr})});
    /* 年費：持卡週年月 */
    if(R.fee&&ym.slice(5)===issueYm(c).slice(5)&&ym>issueYm(c)){var fd=ym+'-05';if(fd<=cut){var waive=c.net==='starg'&&yearSpend(c,addM(ym,-12),addM(ym,-1))>=300000;out.push({d:fd,shop:(z()?'年費 ':'Annual fee ')+R.name+(waive?(z()?'（前一年簽帳滿 30 萬，免收）':' (waived)'):''),cat:'fee',cur:'TWD',amt:waive?0:R.fee,twd:waive?0:R.fee,fx:0,per:0,mi:0})}}
    out.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0});TC[k]=out;return out}
  function yearSpend(c,ym0,ym1){var s=0,ym=ym0,iss=issueYm(c);for(var i=0;i<13&&ym<=ym1;i++,ym=addM(ym,1)){if(ym<iss)continue;s+=stmtRaw(c,ym).spend}return s}
  function stmtRaw(c,ym){var L=txns(c,ym),sp=0,mi=0,fx=0;L.forEach(function(t){if(t.cat!=='fee'&&t.cat!=='none')sp+=t.twd;mi+=t.mi;fx+=t.fx});return {spend:sp,mi:mi,fx:fx,L:L}}
  /* 帳單：結帳日＝月底、繳款截止＝次月 15 日、入帳＝結帳後 9 天；綁定前一年內的帳單在綁定後補入 */
  function stmt(c,ym){var R=RATE[c.net],r=stmtRaw(c,ym),close=lastDay(ym),post=AD(close,9),bd=bindDay(c),closed=close<T();
    var mi=Math.min(r.mi,R.cap),postOn=post>bd?post:AD(bd,1),eligible=close>=AD(bd,-365),posted=closed&&eligible&&postOn<=T();
    var due=0;r.L.forEach(function(t){due+=t.twd+t.fx});
    return {ym:ym,close:close,due:addM(ym,1)+'-15',post:postOn,L:r.L,spend:r.spend,fx:r.fx,bill:due,miRaw:r.mi,mi:mi,capHit:r.mi>R.cap,closed:closed,eligible:eligible,posted:posted}}
  window.kgmCardStmtR1103A=stmt;
  function months(c){var out=[],ym=T().slice(0,7),iss=issueYm(c);for(var i=0;i<18&&ym>=iss;i++,ym=addM(ym,-1))out.push(ym);return out}
  /* 會籍積分（Star G／M）：某一曆年已入帳帳單的簽帳 */
  window.kgmCardTpR1103A=function(uid,year){year=String(year||T().slice(0,4));var tot=0,det=[];
    window.kgmCardsOfR1103A(uid).forEach(function(c){var R=RATE[c.net];if(!R.tp)return;var sp=0;months(c).forEach(function(ym){if(ym.slice(0,4)!==year)return;var s=stmt(c,ym);if(s.posted)sp+=s.spend});
      var tp=Math.min(R.tpCap,Math.floor(sp/10000)*R.tp);tot+=tp;det.push({card:c,spend:sp,tp:tp,cap:R.tpCap})});
    return {tp:tot,det:det}};
  /* 入帳到會員帳戶（只做一次，紀錄在 S.cardPostR1103A） */
  function postAll(){var n=0;try{(S.cardBindR1022A||[]).forEach(function(c){if(!c||c.status!=='verified'||!isKgm(c))return;var u=memberOf(c.userId);if(!u)return;
      var P=S.cardPostR1103A=S.cardPostR1103A||{},done=P[c.id]=P[c.id]||[];   /* 入帳紀錄獨立存（kgm31_cpost），不放在會員物件上（S.user／S.users 互相覆蓋時才不會重複入帳） */
      months(c).slice().reverse().forEach(function(ym){if(done.indexOf(ym)>=0)return;var s=stmt(c,ym);if(!s.posted)return;done.push(ym);if(!s.mi)return;
        u.miles=(+u.miles||0)+s.mi;(u.milesLog=u.milesLog||[]).unshift({date:s.post,miles:s.mi,desc:'KGM Cards '+RATE[c.net].name+' •••• '+c.last4+' '+ym+(z()?' 帳單回饋':' statement'),type:'credit',cardR1103A:c.id});n++});
      try{if(S.user&&S.user!==u&&S.user.id===u.id){S.user.miles=u.miles;S.user.milesLog=u.milesLog}}catch(_){}
      try{if(typeof recomputeTier==='function')recomputeTier(u)}catch(_){}});if(n)try{save()}catch(_){}}catch(e){try{console.warn('kc31 post',e)}catch(_){}}return n}
  window.kgmCardPostR1103A=postAll;
  setTimeout(postAll,15000);setInterval(postAll,300000);
  /* ── 機場接送 ── */
  function xfers(){return S.cardXferR1103A=S.cardXferR1103A||[]}
  function usedXfer(uid,year){return xfers().filter(function(x){return x&&x.userId===uid&&x.status!=='cancelled'&&String(x.date).slice(0,4)===String(year)}).length}
  function xferQuota(uid){var best=0;window.kgmCardsOfR1103A(uid).forEach(function(c){best=Math.max(best,RATE[c.net].xfer)});return best}
  function mySegs(uid){var out=[];(S.bookings||[]).forEach(function(b){if(!b||b.userId!==uid||b.status==='cancelled')return;var segs=[];try{segs=(typeof tripSegments==='function'&&tripSegments(b))||[]}catch(_){}
      segs.forEach(function(sg,i){if(!sg||!sg.date||sg.date<T())return;if(sg.fr==='TPE'||sg.fr==='TSA')out.push({pnr:b.pnr,i:i,code:sg.code||(sg.f&&sg.f.code)||'',date:sg.date,dep:sg.dep||'',port:sg.fr,kind:'drop'});
        if(sg.to==='TPE'||sg.to==='TSA')out.push({pnr:b.pnr,i:i,code:sg.code||(sg.f&&sg.f.code)||'',date:sg.arrDate||sg.date,dep:sg.arr||'',port:sg.to,kind:'pick'})})});
    return out.sort(function(a,b){return (a.date+a.dep).localeCompare(b.date+b.dep)})}
  window.kgmXferBookR1103A=function(){var u=S.user;if(!u)return;var f=S.k31x||{},segs=mySegs(u.id),sg=segs[+f.seg||0];
    if(!sg){alert(z()?'沒有可預約的 KGM 航班（桃園／松山出發或抵達）。':'No eligible flight.');return}
    var y=String(sg.date).slice(0,4),q=xferQuota(u.id);if(usedXfer(u.id,y)>=q){alert(z()?(y+' 年的 '+q+' 次機場接送已用完。'):'Yearly quota used.');return}
    var addr=String(f.addr||'').trim();if(addr.length<6){alert(z()?'請填寫完整的接送地址。':'Enter the address.');return}
    var pax=Math.max(1,Math.min(4,+f.pax||1)),id='KX'+String(Date.now()).slice(-7);
    xfers().push({id:id,userId:u.id,name:u.name||((u.lastName||'')+' '+(u.firstName||'')),pnr:sg.pnr,code:sg.code,date:sg.date,time:sg.dep,port:sg.port,kind:sg.kind,addr:addr,pax:pax,car:f.car||'sedan',note:String(f.note||'').slice(0,120),status:'booked',at:new Date().toISOString()});
    S.k31x={};try{save()}catch(_){}try{render()}catch(_){}alert((z()?'已預約機場接送 ':'Transfer booked ')+id)};
  window.kgmXferCancelR1103A=function(id){var x=xfers().filter(function(q){return q&&q.id===id})[0];if(!x)return;
    var t=new Date(x.date+'T'+(x.time||'00:00')+':00+08:00').getTime();if(t-Date.now()<24*3600e3){alert(z()?'出發前 24 小時內不能取消（次數不退回）。':'Within 24 h — cannot cancel.');return}
    if(!confirm(z()?'取消這筆接送？次數會退回。':'Cancel this transfer?'))return;x.status='cancelled';x.cancelledAt=new Date().toISOString();try{save()}catch(_){}try{render()}catch(_){}};
  window.kgmXferSetR1103A=function(k,v){S.k31x=S.k31x||{};S.k31x[k]=v};
  window.kgmXferAdminR1103A=function(id,st){var x=xfers().filter(function(q){return q&&q.id===id})[0];if(!x)return;x.status=st;x.by=(S.adminUser&&(S.adminUser.name||S.adminUser.empId))||'';x.byAt=new Date().toISOString();try{save()}catch(_){}try{render()}catch(_){}};
  var CATN={dom:['國內','Domestic'],ovs:['海外實體','Overseas'],ovsweb:['海外線上','Overseas online'],kgm:['KGM 官網','KGM'],fee:['年費','Annual fee'],none:['不回饋','No miles']};
  function catTag(c){return '<i class="k31c-cat '+c+'">'+(z()?CATN[c][0]:CATN[c][1])+'</i>'}
  function cardArt(c,on){var R=RATE[c.net];return '<button type="button" class="k31c-art '+c.net+(on?' on':'')+'" onclick="S.k31card=\''+A(c.id)+'\';render()"><small>STAR-Gen Bank × KGM</small><b>'+R.name+'</b><span>•••• '+E(c.last4)+'</span><em>'+E(c.holder||'')+'</em></button>'}
  function moneyO(t){return t.cur==='TWD'?'NT$'+N(t.amt):t.cur+' '+(t.cur==='JPY'||t.cur==='KRW'?N(t.amt):(+t.amt).toFixed(2))}
  function stmtTable(s){return '<table class="k31c-t"><thead><tr><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'商店':'Merchant')+'</th><th>'+(z()?'類別':'Type')+'</th><th class="r">'+(z()?'原幣金額':'Amount')+'</th><th class="r">'+(z()?'新臺幣':'NT$')+'</th><th class="r">'+(z()?'海外手續費':'FX fee')+'</th><th class="r">'+(z()?'回饋比率':'Rate')+'</th><th class="r">'+(z()?'回饋哩程':'Miles')+'</th></tr></thead><tbody>'
      +(s.L.length?s.L.map(function(t){return '<tr><td>'+E(t.d.slice(5).replace('-','/'))+'</td><td>'+E(t.shop)+'</td><td>'+catTag(t.cat)+'</td><td class="r">'+moneyO(t)+'</td><td class="r">'+N(t.twd)+'</td><td class="r">'+(t.fx?N(t.fx):'—')+'</td><td class="r">'+(t.per?'NT$'+t.per+(z()?'／哩':'/mi'):'—')+'</td><td class="r"><b>'+(t.mi?N(t.mi):'0')+'</b></td></tr>'}).join(''):'<tr><td colspan="8" class="k31c-none">'+(z()?'這個月沒有消費。':'No transactions.')+'</td></tr>')
      +'</tbody><tfoot><tr><td colspan="4">'+(z()?'合計':'Total')+'</td><td class="r">'+N(s.spend)+'</td><td class="r">'+N(s.fx)+'</td><td></td><td class="r"><b>'+N(s.mi)+'</b>'+(s.capHit?'<small>'+(z()?'（已達每期上限）':' (cap)')+'</small>':'')+'</td></tr></tfoot></table>'}
  function stState(s){return s.posted?'<i class="k31c-st ok">'+(z()?'已入帳 ':'Posted ')+E(s.post.slice(5).replace('-','/'))+'</i>':(s.closed?(s.eligible?'<i class="k31c-st">'+(z()?'待入帳 ':'Pending ')+E(s.post.slice(5).replace('-','/'))+'</i>':'<i class="k31c-st no">'+(z()?'綁定前超過一年，不補入':'Before binding')+'</i>'):'<i class="k31c-st">'+(z()?'本期未結帳':'Open')+'</i>')}
  /* ── 前台：KGM Cards 頁（上排「KGM Cards」，只有綁定 KGM Cards 的會員看得到） ── */
  function front(){var u=S.user;if(!u)return '<main class="k31c"><p>'+(z()?'請先登入。':'Please log in.')+'</p></main>';var cs=window.kgmCardsOfR1103A(u.id);
    if(!cs.length)return '<main class="k31c"><header class="k31c-h"><small>KGM CARDS</small><h1>'+(z()?'KGM Cards 聯名卡':'KGM Cards')+'</h1><p>'+(z()?'您還沒有綁定 KGM Cards。到「我的帳戶」綁定 Star K／G／M 後，這裡會顯示帳單、消費回饋與機場接送。':'Bind a KGM Card under My account.')+'</p></header>'+(window.kgmCardPerksHtmlR1023A?window.kgmCardPerksHtmlR1023A():'')+'</main>';
    var c=cs.filter(function(x){return x.id===S.k31card})[0]||cs[0],R=RATE[c.net],tab=S.view==='card31x'?'xfer':S.view==='card31p'?'perks':(S.k31tab||'bill'),ms=months(c),ym=ms.indexOf(S.k31ym)>=0?S.k31ym:ms[0],s=stmt(c,ym),y=T().slice(0,4);
    var tp=window.kgmCardTpR1103A(u.id,y),mine=tp.det.filter(function(d){return d.card.id===c.id})[0];
    var ytdMi=0,ytdSp=0;ms.forEach(function(m){if(m.slice(0,4)!==y)return;var q=stmt(c,m);ytdMi+=q.mi;ytdSp+=q.spend});
    var tabs=[['bill',z()?'帳單與消費':'Statement'],['miles',z()?'哩程回饋':'Miles earned'],['xfer',z()?'機場接送':'Airport transfer'],['perks',z()?'卡片權益':'Benefits']];
    var head='<header class="k31c-h"><div><small>KGM CARDS · STAR-Gen Bank</small><h1>'+(z()?'我的 KGM Cards':'My KGM Cards')+'</h1><p>'+(z()?'消費依 KGM-CRD-020 回饋哩程：國內 NT$'+R.dom+'、海外（含國外網站）NT$'+R.ovs+'、KGM 官網 NT$'+R.kgm+' 累積 1 哩。':'')+'</p></div><div class="k31c-arts">'+cs.map(function(x){return cardArt(x,x.id===c.id)}).join('')+'</div></header>'
      +'<div class="k31c-kpi"><div><small>'+(z()?y+' 年累計簽帳':'YTD spend')+'</small><b>NT$'+N(ytdSp)+'</b></div><div><small>'+(z()?y+' 年回饋哩程':'YTD miles')+'</small><b>'+N(ytdMi)+'</b></div>'
      +(R.tp?'<div><small>'+(z()?'會籍積分（本卡，'+y+'）':'Tier points')+'</small><b>'+N(mine?mine.tp:0)+'<em> / '+R.tpCap+'</em></b></div>':'<div><small>'+(z()?'會籍積分':'Tier points')+'</small><b>—</b><em class="k31c-n">'+(z()?'Star K 不送會籍積分':'Not on Star K')+'</em></div>')
      +'<div><small>'+(z()?'機場接送（'+y+'）':'Transfers')+'</small><b>'+(R.xfer?(Math.max(0,xferQuota(u.id)-usedXfer(u.id,y))+'<em> / '+xferQuota(u.id)+'</em>'):'—')+'</b></div></div>'
      +'<nav class="k31c-tabs">'+tabs.map(function(t){return '<button class="'+(tab===t[0]?'on':'')+'" onclick="S.k31tab=\''+t[0]+'\';if(S.view!==\'card31\')S.view=\'card31\';render()">'+t[1]+'</button>'}).join('')+'</nav>';
    var body='';
    if(tab==='bill')body='<section class="k31c-box"><div class="k31c-bh"><label>'+(z()?'帳單月份':'Statement')+'<select class="inp" onchange="S.k31ym=this.value;render()">'+ms.map(function(m){return '<option value="'+m+'"'+(m===ym?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label>'
        +'<div class="k31c-sum"><span><small>'+(z()?'結帳日':'Closing')+'</small><b>'+E(s.close)+'</b></span><span><small>'+(z()?'本期應繳':'Amount due')+'</small><b>NT$'+N(s.bill)+'</b></span><span><small>'+(z()?'繳款截止':'Due')+'</small><b>'+E(s.due)+'</b></span><span><small>'+(z()?'本期回饋':'Miles')+'</small><b>'+N(s.mi)+(z()?' 哩':' mi')+'</b></span><span>'+stState(s)+'</span></div></div>'+stmtTable(s)
        +'<p class="k31c-foot">'+(z()?'海外消費＝交易幣別非新臺幣或收單機構在境外（含國外網站）。預借現金、繳稅、年費與手續費不回饋（KGM-CRD-020 第 10 條）。':'')+'</p></section>';
    else if(tab==='miles')body='<section class="k31c-box"><table class="k31c-t"><thead><tr><th>'+(z()?'帳單月份':'Month')+'</th><th class="r">'+(z()?'國內':'Domestic')+'</th><th class="r">'+(z()?'海外（含線上）':'Overseas')+'</th><th class="r">KGM</th><th class="r">'+(z()?'簽帳合計':'Spend')+'</th><th class="r">'+(z()?'回饋哩程':'Miles')+'</th><th>'+(z()?'入帳':'Status')+'</th></tr></thead><tbody>'
        +ms.map(function(m){var q=stmt(c,m),by={dom:0,ovs:0,kgm:0};q.L.forEach(function(t){if(t.cat==='dom')by.dom+=t.twd;else if(t.cat==='ovs'||t.cat==='ovsweb')by.ovs+=t.twd;else if(t.cat==='kgm')by.kgm+=t.twd});
          return '<tr><td><a href="javascript:void(0)" onclick="S.k31ym=\''+m+'\';S.k31tab=\'bill\';render()">'+m+'</a></td><td class="r">'+N(by.dom)+'</td><td class="r">'+N(by.ovs)+'</td><td class="r">'+N(by.kgm)+'</td><td class="r">'+N(q.spend)+'</td><td class="r"><b>'+N(q.mi)+'</b></td><td>'+stState(q)+'</td></tr>'}).join('')+'</tbody></table>'
        +(R.tp?'<p class="k31c-foot">'+(z()?R.name+' 每 NT$10,000 簽帳另送 '+R.tp+' 分會籍積分（同時計入自營航班會籍積分），每年上限 '+R.tpCap+' 分；以已入帳帳單計算。':'')+'</p>':'')+'</section>';
    else if(tab==='xfer'){var q=xferQuota(u.id),used=usedXfer(u.id,y),segs=mySegs(u.id),f=S.k31x||{},L=xfers().filter(function(x){return x&&x.userId===u.id}).slice().reverse();
      body='<section class="k31c-box">'+(q?('<div class="k31c-xq"><b>'+(z()?y+' 年剩 '+Math.max(0,q-used)+' 次':Math.max(0,q-used)+' left')+'</b><span>'+(z()?'Star G／Star M 每曆年 '+q+' 次，桃園／松山機場，限搭乘 KGM 航班當天；起飛（抵達）前 24 小時以前取消會退回次數。':'')+'</span></div>'
          +(segs.length?('<div class="k31c-xf"><label>'+(z()?'航班':'Flight')+'<select class="inp" onchange="kgmXferSetR1103A(\'seg\',this.value)">'+segs.map(function(sg,i){return '<option value="'+i+'"'+(+f.seg===i?' selected':'')+'>'+E(sg.date+' '+sg.code+' '+(sg.kind==='drop'?(z()?'送機 → ':'to ')+sg.port+' '+sg.dep:(z()?'接機 ← ':'from ')+sg.port+' '+sg.dep)+' · '+sg.pnr)+'</option>'}).join('')+'</select></label>'
            +'<label>'+(z()?'地址':'Address')+'<input class="inp" value="'+E(f.addr||'')+'" oninput="kgmXferSetR1103A(\'addr\',this.value)" placeholder="'+(z()?'例：台北市信義區松仁路 100 號':'')+'"></label>'
            +'<label>'+(z()?'人數':'Pax')+'<select class="inp" onchange="kgmXferSetR1103A(\'pax\',this.value)">'+[1,2,3,4].map(function(n){return '<option'+(+f.pax===n?' selected':'')+'>'+n+'</option>'}).join('')+'</select></label>'
            +'<label>'+(z()?'車型':'Car')+'<select class="inp" onchange="kgmXferSetR1103A(\'car\',this.value)"><option value="sedan">'+(z()?'豪華轎車（3 件行李）':'Sedan')+'</option><option value="van"'+(f.car==='van'?' selected':'')+'>'+(z()?'商務廂型車（6 件行李）':'Van')+'</option></select></label>'
            +'<label class="w">'+(z()?'備註':'Note')+'<input class="inp" value="'+E(f.note||'')+'" oninput="kgmXferSetR1103A(\'note\',this.value)"></label>'
            +'<button class="k31c-go"'+(used>=q?' disabled':'')+' onclick="kgmXferBookR1103A()">'+(used>=q?(z()?'今年次數已用完':'Quota used'):(z()?'預約接送':'Book transfer'))+'</button></div>'):'<p class="k31c-foot">'+(z()?'沒有即將出發的 KGM 航班（桃園／松山出發或抵達）可以預約。':'No eligible flights.')+'</p>'))
          :'<p class="k31c-foot">'+(z()?'機場接送是 Star G／Star M 的禮遇，Star K 沒有。':'Star G / M only.')+'</p>')
        +(L.length?'<table class="k31c-t"><thead><tr><th>'+(z()?'編號':'No.')+'</th><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'航班':'Flight')+'</th><th>'+(z()?'類型':'Type')+'</th><th>'+(z()?'地址':'Address')+'</th><th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'+L.map(function(x){return '<tr><td>'+E(x.id)+'</td><td>'+E(x.date+' '+(x.time||''))+'</td><td>'+E(x.code+' '+x.pnr)+'</td><td>'+(x.kind==='drop'?(z()?'送機':'Drop-off'):(z()?'接機':'Pick-up'))+' '+E(x.port)+'</td><td>'+E(x.addr)+'</td><td>'+xst(x.status)+'</td><td>'+(x.status==='booked'||x.status==='confirmed'?'<button class="btn btn-sm" onclick="kgmXferCancelR1103A(\''+A(x.id)+'\')">'+(z()?'取消':'Cancel')+'</button>':'')+'</td></tr>'}).join('')+'</tbody></table>':'')+'</section>'}
    else body='<section class="k31c-box">'+(window.kgmCardPerksHtmlR1023A?window.kgmCardPerksHtmlR1023A():'')+'<p class="k31c-foot">'+(z()?'Star K → Star G：持有 Star K 滿一年且前 12 個月簽帳 NT$750,000；Star G → Star M：持有 Star G 滿一年、前 12 個月簽帳 NT$3,000,000，且為 Explorer 銀卡以上（KGM-CRD-020 表一）。':'')+'</p></section>';
    return '<main class="k31c">'+head+body+'</main>'}
  function xst(s){return '<i class="k31c-st '+(s==='done'||s==='confirmed'?'ok':s==='cancelled'?'no':'')+'">'+({booked:z()?'已預約':'Booked',confirmed:z()?'已派車':'Confirmed',done:z()?'已完成':'Done',cancelled:z()?'已取消':'Cancelled'}[s]||s)+'</i>'}
  /* ── 後台：信用卡驗證頁加兩個分頁（消費與回饋、機場接送） ── */
  function admin(){var tab=S.k31atab||'bind';var bar='<nav class="k31c-atabs">'+[['bind',z()?'綁定驗證':'Binding'],['spend',z()?'消費與哩程回饋':'Spend & miles'],['xfer',z()?'機場接送':'Transfers']].map(function(t){return '<button class="'+(tab===t[0]?'on':'')+'" onclick="S.k31atab=\''+t[0]+'\';render()">'+t[1]+'</button>'}).join('')+'</nav>';
    return {tab:tab,bar:bar}}
  function adminSpend(){var cs=(S.cardBindR1022A||[]).filter(function(c){return c&&c.status==='verified'&&isKgm(c)}),y=T().slice(0,4),sel=S.k31acard||'';
    var rows=cs.map(function(c){var ms=months(c),sp=0,mi=0,post=0,cur=stmt(c,ms[0]);ms.forEach(function(m){if(m.slice(0,4)!==y)return;var q=stmt(c,m);sp+=q.spend;mi+=q.mi;if(q.posted)post+=q.mi});
      var u=memberOf(c.userId),R=RATE[c.net],tp=R.tp?Math.min(R.tpCap,Math.floor(sp/10000)*R.tp):0;return {c:c,u:u,sp:sp,mi:mi,post:post,tp:tp,cur:cur}});
    var tot={sp:0,mi:0},by={stark:0,starg:0,starm:0};rows.forEach(function(r){tot.sp+=r.sp;tot.mi+=r.mi;by[r.c.net]++});
    var h='<div class="k31c-ak"><div><small>'+(z()?'有效 KGM Cards':'Active cards')+'</small><b>'+rows.length+'</b><em>K '+by.stark+' · G '+by.starg+' · M '+by.starm+'</em></div><div><small>'+(z()?y+' 年簽帳':'YTD spend')+'</small><b>NT$'+N(tot.sp)+'</b></div><div><small>'+(z()?y+' 年回饋哩程':'YTD miles')+'</small><b>'+N(tot.mi)+'</b></div></div>'
      +'<table class="k31c-t"><thead><tr><th>'+(z()?'會員':'Member')+'</th><th>'+(z()?'卡別':'Card')+'</th><th class="r">'+(z()?'本期簽帳':'This month')+'</th><th class="r">'+(z()?y+' 年簽帳':'YTD')+'</th><th class="r">'+(z()?'回饋哩程':'Miles')+'</th><th class="r">'+(z()?'已入帳':'Posted')+'</th><th class="r">'+(z()?'會籍積分':'TP')+'</th><th></th></tr></thead><tbody>'
      +(rows.length?rows.map(function(r){var on=sel===r.c.id;return '<tr class="'+(on?'on':'')+'"><td><b>'+E(r.c.memberName||'')+'</b><small>'+E(r.c.userId)+'</small></td><td><i class="k31c-net '+r.c.net+'">'+RATE[r.c.net].name+'</i> •••• '+E(r.c.last4)+'</td><td class="r">'+N(r.cur.spend)+'</td><td class="r">'+N(r.sp)+'</td><td class="r"><b>'+N(r.mi)+'</b></td><td class="r">'+N(r.post)+'</td><td class="r">'+(RATE[r.c.net].tp?N(r.tp):'—')+'</td><td><button class="btn btn-sm" onclick="S.k31acard=(S.k31acard===\''+A(r.c.id)+'\'?\'\':\''+A(r.c.id)+'\');render()">'+(on?(z()?'收起':'Hide'):(z()?'明細':'Detail'))+'</button></td></tr>'
          +(on?'<tr class="k31c-ad"><td colspan="8">'+adminDetail(r.c)+'</td></tr>':'')}).join(''):'<tr><td colspan="8" class="k31c-none">'+(z()?'還沒有通過驗證的 KGM Cards。':'No verified KGM Cards.')+'</td></tr>')+'</tbody></table>';
    return h}
  function adminDetail(c){var ms=months(c),ym=ms.indexOf(S.k31aym)>=0?S.k31aym:ms[0],s=stmt(c,ym);
    return '<div class="k31c-bh"><label>'+(z()?'帳單月份':'Month')+'<select class="inp" onchange="S.k31aym=this.value;render()">'+ms.map(function(m){return '<option'+(m===ym?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label><div class="k31c-sum"><span><small>'+(z()?'持卡起':'Since')+'</small><b>'+issueYm(c)+'</b></span><span><small>'+(z()?'綁定日':'Bound')+'</small><b>'+bindDay(c)+'</b></span><span><small>'+(z()?'本期簽帳':'Spend')+'</small><b>NT$'+N(s.spend)+'</b></span><span><small>'+(z()?'本期回饋':'Miles')+'</small><b>'+N(s.mi)+'</b></span><span>'+stState(s)+'</span></div></div>'+stmtTable(s)}
  function adminXfer(){var L=xfers().slice().reverse(),y=T().slice(0,4);
    return '<p class="k31c-foot">'+(z()?'Star G／Star M 每曆年 2 次；旅客在前台 KGM Cards › 機場接送預約。派車後改「已派車」，完成後「已完成」。':'')+'</p>'
      +'<table class="k31c-t"><thead><tr><th>'+(z()?'編號':'No.')+'</th><th>'+(z()?'會員':'Member')+'</th><th>'+(z()?'日期':'Date')+'</th><th>'+(z()?'航班':'Flight')+'</th><th>'+(z()?'類型':'Type')+'</th><th>'+(z()?'地址／人數／車型':'Address')+'</th><th>'+(z()?'本年已用':'Used')+'</th><th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
      +(L.length?L.map(function(x){return '<tr><td>'+E(x.id)+'</td><td><b>'+E(x.name)+'</b><small>'+E(x.userId)+'</small></td><td>'+E(x.date+' '+(x.time||''))+'</td><td>'+E(x.code+' · '+x.pnr)+'</td><td>'+(x.kind==='drop'?(z()?'送機':'Drop-off'):(z()?'接機':'Pick-up'))+' '+E(x.port)+'</td><td>'+E(x.addr)+'<small>'+x.pax+(z()?' 位 · ':' pax · ')+(x.car==='van'?(z()?'廂型車':'Van'):(z()?'轎車':'Sedan'))+(x.note?' · '+E(x.note):'')+'</small></td><td>'+usedXfer(x.userId,String(x.date).slice(0,4))+' / '+xferQuota(x.userId)+'</td><td>'+xst(x.status)+'</td><td>'
        +(x.status==='booked'?'<button class="btn btn-sm btn-g" onclick="kgmXferAdminR1103A(\''+A(x.id)+'\',\'confirmed\')">'+(z()?'派車':'Dispatch')+'</button>':'')+(x.status==='confirmed'?'<button class="btn btn-sm" onclick="kgmXferAdminR1103A(\''+A(x.id)+'\',\'done\')">'+(z()?'完成':'Done')+'</button>':'')+'</td></tr>'}).join(''):'<tr><td colspan="9" class="k31c-none">'+(z()?'還沒有接送預約。':'No bookings.')+'</td></tr>')+'</tbody></table>'}
  function hookAdmin(){var O=window.kgmCardVerifyPageR1022A;if(typeof O!=='function'||O.__kc31)return;
    var w=function(){var a=admin();if(a.tab==='bind')return a.bar+O.apply(this,arguments);
      return '<div class="cv22"><div class="cv22-hero"><small>KGM CARDS</small><h2>'+(a.tab==='spend'?(z()?'KGM Cards 消費與哩程回饋':'Card spend & miles'):(z()?'KGM Cards 機場接送':'Card transfers'))+'</h2></div>'+a.bar+'<div class="cv22-card k31c-adm">'+(a.tab==='spend'?adminSpend():adminXfer())+'</div></div>'};
    w.__kc31=1;window.kgmCardVerifyPageR1022A=w}
  hookAdmin();setTimeout(hookAdmin,0);setTimeout(hookAdmin,3000);
  /* 前台頁面掛在內容區（跟 cs28 寵物／案件同一個做法） */
  function host(){var app=document.getElementById('app');if(!app)return null;var h=null;[].slice.call(app.children).forEach(function(n){if(!h&&n.tagName==='DIV'&&n.id!=='aiChat')h=n});return h}
  function paint(){try{if(S.view!=='card31'&&S.view!=='card31x'&&S.view!=='card31p')return;var h=host();if(!h)return;h.innerHTML=front()}catch(e){try{console.warn('kc31',e)}catch(_){}}}
  function hook(){var r0=window.render;if(typeof r0==='function'&&!r0.__kc31){var w=function(){var r=r0.apply(this,arguments);paint();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__kc31=1;window.render=w;try{render=w}catch(_){}}}
  hook();setTimeout(hook,0);setTimeout(hook,3000);
  try{var css=document.createElement('style');css.textContent=[
    '.k31c{max-width:1120px;margin:0 auto;padding:28px 20px 48px}.k31c-h{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;flex-wrap:wrap;margin-bottom:18px}',
    '.k31c-h small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}.k31c-h h1{margin:4px 0 6px;font:700 28px Georgia,serif;color:#0b3b30}.k31c-h p{margin:0;color:#5d665f;font-size:13px;max-width:560px;line-height:1.6}',
    '.k31c-arts{display:flex;gap:10px;flex-wrap:wrap}.k31c-art{width:190px;height:116px;border:0;border-radius:14px;padding:12px 14px;color:#fff;text-align:left;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;opacity:.62;transition:.15s;box-shadow:0 8px 20px rgba(0,0,0,.12)}',
    '.k31c-art.on{opacity:1;transform:translateY(-2px);box-shadow:0 14px 28px rgba(0,0,0,.18)}.k31c-art small{font-size:9px;letter-spacing:.14em;opacity:.85}.k31c-art b{font:700 20px Georgia,serif}.k31c-art span{font:600 13px ui-monospace,monospace;letter-spacing:.12em}.k31c-art em{font-style:normal;font-size:10px;opacity:.85}',
    '.k31c-art.stark{background:linear-gradient(135deg,#0B3D2E,#1F6B52)}.k31c-art.starg{background:linear-gradient(135deg,#8A6A22,#D6B25E)}.k31c-art.starm{background:linear-gradient(135deg,#111,#3d3d3d 60%,#8a7442)}',
    '.k31c-kpi,.k31c-ak{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 14px}.k31c-ak{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:760px){.k31c-kpi{grid-template-columns:1fr 1fr}}',
    '.k31c-kpi>div,.k31c-ak>div{background:#fff;border:1px solid #e6e0d2;border-radius:12px;padding:12px 14px}.k31c-kpi small,.k31c-ak small{display:block;font-size:11px;color:#8a8175;font-weight:700}.k31c-kpi b,.k31c-ak b{font-size:20px;color:#0b3b30}.k31c-kpi b em,.k31c-ak em{font-style:normal;font-size:12px;color:#8a8175;font-weight:600}.k31c-n{display:block;font-style:normal;font-size:11px;color:#8a8175}',
    '.k31c-tabs,.k31c-atabs{display:flex;gap:6px;margin:0 0 12px;flex-wrap:wrap}.k31c-tabs button,.k31c-atabs button{border:1px solid #ddd5c4;background:#fff;border-radius:999px;padding:7px 16px;font-weight:700;color:#0b3b30;cursor:pointer;font-size:13px}.k31c-tabs button.on,.k31c-atabs button.on{background:#0b3b30;color:#fff;border-color:#0b3b30}',
    '.k31c-box{background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:16px;overflow-x:auto}.k31c-bh{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px}.k31c-bh label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#6b645a}.k31c-bh .inp{height:36px;min-width:130px}',
    '.k31c-sum{display:flex;gap:18px;flex-wrap:wrap;align-items:center}.k31c-sum span small{display:block;font-size:10.5px;color:#8a8175;font-weight:700}.k31c-sum span b{font-size:15px;color:#0b3b30}',
    '.k31c-t{width:100%;border-collapse:collapse;font-size:12.5px}.k31c-t th{text-align:left;font-size:11px;color:#8a8175;font-weight:800;border-bottom:1px solid #e6e0d2;padding:8px 8px;white-space:nowrap}.k31c-t td{border-bottom:1px solid #f1ede4;padding:8px 8px;vertical-align:top}.k31c-t .r{text-align:right;white-space:nowrap}',
    '.k31c-t tfoot td{font-weight:800;border-top:2px solid #e6e0d2;border-bottom:0}.k31c-t tfoot small{display:block;font-weight:600;color:#9b2d17}.k31c-t td small{display:block;font-size:11px;color:#8a8175}.k31c-t tr.on td{background:#f5faf7}.k31c-ad>td{background:#fbf9f4!important;padding:14px}.k31c-none{text-align:center;color:#8a8175;padding:22px!important}',
    '.k31c-cat{font-style:normal;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:999px;background:#eef2f0;color:#3c5a50;white-space:nowrap}.k31c-cat.ovs,.k31c-cat.ovsweb{background:#e8eefb;color:#2b4f8f}.k31c-cat.kgm{background:#f5ecd8;color:#7a5608}.k31c-cat.fee,.k31c-cat.none{background:#f3f0ea;color:#8a8175}',
    '.k31c-st{font-style:normal;font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;background:#fdf3d8;color:#7a5608;white-space:nowrap}.k31c-st.ok{background:#e7f4ec;color:#1f6f4a}.k31c-st.no{background:#f3f0ea;color:#8a8175}',
    '.k31c-net{font-style:normal;font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;color:#fff}.k31c-net.stark{background:#1F6B52}.k31c-net.starg{background:#a8842f}.k31c-net.starm{background:#222}',
    '.k31c-foot{font-size:12px;color:#7a7266;line-height:1.6;margin:12px 0 0}.k31c-xq{display:flex;gap:14px;align-items:center;background:#f5faf7;border:1px solid #d8e5dd;border-radius:12px;padding:10px 14px;margin-bottom:12px;flex-wrap:wrap}.k31c-xq b{font-size:16px;color:#0b3b30}.k31c-xq span{font-size:12px;color:#5d665f}',
    '.k31c-xf{display:grid;grid-template-columns:2fr 2fr 1fr 1.4fr;gap:10px;align-items:end;margin-bottom:14px}.k31c-xf label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700;color:#6b645a}.k31c-xf label.w{grid-column:1/4}.k31c-xf .inp{height:38px}@media(max-width:760px){.k31c-xf{grid-template-columns:1fr}.k31c-xf label.w{grid-column:auto}}',
    '.k31c-go{height:40px;border:0;border-radius:10px;background:#a77d33;color:#fff;font-weight:800;cursor:pointer}.k31c-go:disabled{background:#cfc8b8;cursor:not-allowed}'
  ].join('');document.head.appendChild(css)}catch(_){}
})();
/* ══ 1108B B10（使用者：「前台 AI 太笨 我問他哪裡綁信用卡他跟我鬼打牆 不過這在上排哪裡我沒找到」）══
   ① 上排「無限萬哩遊 → 帳戶管理 → 信用卡綁定」（gen kc31 menu）：打開 Member Portal「我的帳戶」並捲到「信用卡綁定」（k22 的綁卡區）。
   ② 前台 AI：問「…在哪裡／怎麼…／入口／找不到」而且講到網站上的某個功能 → 直接回答上排選單的位置＋「帶我過去」按鈕
      （位置從上排選單 .mega 現讀，不另寫一份）；原本只會依關鍵字貼同一條規章（CRD-020 第 18 條）。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  /* ① 信用卡綁定：profileTab='cards' → 我的帳戶＋捲到綁卡區 */
  setInterval(function(){try{if(S.view!=='profile'||S.profileTab!=='cards')return;S.profileTab='account';try{render()}catch(_){}
      var t0=Date.now();(function go(){var el=document.querySelector('.k22-cardb');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('k39-flash');setTimeout(function(){el.classList.remove('k39-flash')},2200);return}if(Date.now()-t0<3000)setTimeout(go,150)})()}catch(_){}},200);
  try{var cs=document.createElement('style');cs.textContent='.k22-cardb.k39-flash{box-shadow:0 0 0 3px #B08A3E;transition:box-shadow .4s}.k39-guide{display:flex;flex-direction:column;gap:6px}.k39-guide b{color:#0B3D2E}.k39-guide .k39-path{font-weight:700;color:#0B3D2E}.k39-guide button{align-self:flex-start;margin-top:4px;border:1px solid #0B3D2E;background:#0B3D2E;color:#fff;border-radius:999px;padding:6px 14px;font:700 12.5px inherit;font-family:inherit;cursor:pointer}';document.head.appendChild(cs)}catch(_){}
  /* ② 網站導覽 */
  var TOPZ={book:['優惠與訂票','Book'],trip:['行程管理','Trips'],prep:['飛行準備','Travel Info'],miles:['無限萬哩遊','KGM Miles'],cards31:['KGM Cards','KGM Cards']};
  var SYN=[[/綁.{0,3}(信用)?卡|信用卡.{0,6}(綁|設定|新增|儲存)|(saved|bind|add|link).{0,12}card|card.{0,10}(bind|link)/i,'信用卡綁定'],[/聯名卡.{0,6}(帳單|消費|紀錄)|kgm cards?.{0,10}(bill|statement)/i,'帳單與消費'],[/機場接送/,'機場接送'],
    [/我的團體|團體訂位.{0,4}(管理|名單|付款|尾款)/,'我的團體訂位'],[/團體/,'團體訂位'],[/寵物/,'寵物同行申請'],[/徽章|badge/i,'我的徽章'],[/票夾|wallet/i,'我的票夾'],[/bigdeal|競標/i,'BigDeal 競標升等'],[/(哩|里)程(明細|紀錄|記錄)/,'哩程明細'],
    [/(哩|里)程.{0,2}轉讓|轉讓/,'里程轉讓'],[/補登/,'哩程補登'],[/案件|客訴|申訴/,'案件進度查詢'],[/退票|退款/,'退票申請'],[/改票|改期|改航班/,'改票'],[/選位|座位/,'選位'],[/選餐|特別餐|餐點/,'選餐'],[/報到|check.?in/i,'線上報到'],
    [/登機證|boarding pass/i,'登機證'],[/航班動態|航班狀態|flight status/i,'航班動態'],[/個人資料|會員資料|改密碼|profile/i,'個人資料'],[/(買|購買).{0,2}(哩|里)程/,'購買里程'],[/酬賓/,'酬賓機票'],[/升等/,'艙位升等'],[/我的行程|my trips?/i,'我的行程'],[/訂位代號|pnr/i,'查詢訂位（PNR）']];
  var WHERE=/哪裡|哪里|哪邊|在哪|去哪|那裡|入口|找不到|怎麼(綁|弄|用|找|申請|去|設定|進|改|查|辦|新增|加)|如何|要去|where|how (do|can|to)|how to/i;
  function items(){var L=[];[].slice.call(document.querySelectorAll('.mega')).forEach(function(m){var k=String(m.id||'').replace(/^mega_/,''),top=TOPZ[k]||[k,k];
      [].slice.call(m.querySelectorAll(':scope>div')).forEach(function(col,ci){var h=(col.querySelector('h4')||{}).textContent||'';[].slice.call(col.querySelectorAll('li')).forEach(function(li,j){L.push({mega:m.id,ci:ci,j:j,top:top,col:h,label:String(li.textContent||'').trim()})})})});return L}
  window.kgmAiGuideR1108B=function(q){q=String(q||'');if(!WHERE.test(q))return null;var L=items();if(!L.length)return null;var want=null;
    for(var i=0;i<SYN.length&&!want;i++)if(SYN[i][0].test(q))want=SYN[i][1];
    var it=null;if(want)it=L.filter(function(x){return x.label===want})[0];
    if(!it)it=L.filter(function(x){return x.label.length>=2&&q.indexOf(x.label)>=0}).sort(function(a,b){return b.label.length-a.label.length})[0];
    if(!it)return null;var zh=z(),path=(zh?it.top[0]:it.top[1])+' → '+it.col+' → '+it.label,login=/信用卡綁定|個人資料|哩程明細|我的徽章|我的票夾|里程轉讓|哩程補登|帳單與消費|機場接送|我的團體訂位/.test(it.label)&&!S.user;
    var extra=it.label==='信用卡綁定'?(zh?'綁定頁在 Member Portal 的「我的帳戶」：填卡號、卡別、持卡人英文姓名與有效期限後按「送出驗證」；本站只接受綁定 KGM 聯名卡（Star K／G／M），其他信用卡結帳時直接輸入即可。':'It is under Member Portal → My account.'):'';
    var html='<div class="k39-guide"><span>'+(zh?'在上排選單：':'In the top menu: ')+'<span class="k39-path">'+E(path)+'</span></span>'+(extra?'<span>'+E(extra)+'</span>':'')+(login?'<span>'+(zh?'需要先登入會員。':'Please sign in first.')+'</span>':'')
      +'<button type="button" onclick="kgmAiGoR1108B(\''+E(it.mega)+'\','+it.ci+','+it.j+')">'+(zh?'帶我過去 →':'Take me there →')+'</button></div>';
    return {label:it.label,path:path,html:html,text:(zh?'在上排選單：':'Top menu: ')+path+(extra?'\n'+extra:'')}};
  window.kgmAiGoR1108B=function(mega,ci,j){try{var m=document.getElementById(mega),col=m&&m.querySelectorAll(':scope>div')[ci],li=col&&col.querySelectorAll('li')[j];if(li){li.click();return true}}catch(_){}return false};
  /* 包在最外層的送出：原本的回覆出來之後（450 ms 後 1006A 會換成規章／Claude），問「在哪裡」的就換成導覽答案 */
  var MINE39=null;   /* 用函式本身判斷是不是最外層（別層包的時候會把 __g39 這種旗標一起抄過去） */
  function hook(){var O=window.kgmSendAi0819I;if(typeof O!=='function'||O===MINE39)return;
    var w=function(){var inp=document.getElementById('aiInput'),q=String(inp&&inp.value||'').trim(),c=S.aiConversation0819I,n0=(c&&c.messages||[]).length,gd=null;try{gd=q?window.kgmAiGuideR1108B(q):null}catch(_){}
      var r=O.apply(this,arguments);if(!gd)return r;
      var put=function(){try{var c2=S.aiConversation0819I;if(!c2||!c2.messages)return;var M=c2.messages,ui=-1,m=null;for(var i=M.length-1;i>=0;i--){if(M[i]&&M[i].role==='user'&&String(M[i].text||'').trim()===q){ui=i;break}}if(ui<0)return;   /* 只改「這一題」後面那一則回覆（到下一題之前） */
          for(var k=ui+1;k<M.length;k++){if(!M[k])continue;if(M[k].role==='user')break;m=M[k]}if(!m)return;
          if(m.guideR1108B&&m.text===gd.html)return;m.text=gd.html;m.html=true;m.guideR1108B=gd.label;m.fai1006A=1;try{save()}catch(_){}try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}}catch(_){}};
      var t0=Date.now();(function poll(){put();if(Date.now()-t0<12000)setTimeout(poll,200)})();return r};   /* 原本的回覆可能晚幾秒才出來（打字動畫／規章／Claude），12 秒內出現的都換成導覽答案 */
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__g39=1;MINE39=w;window.kgmSendAi0819I=w;try{window.sendAI=w}catch(_){}}
  hook();[0,3000,9000,20000].forEach(function(t){setTimeout(hook,t)});setInterval(function(){try{if(window.kgmSendAi0819I&&window.kgmSendAi0819I!==MINE39)hook()}catch(_){}},2000);
})();

/* ══ 1103A：BigDeal 前台頁、徽章、驚喜包、票夾、後台競標管理整理（使用者：
   「競標管理頁面缺乏質感」「用戶端要有個 bigdeal 頁面 我希望可以多加入 badge 這種東西 像是 bigdeal 賭王 residence… badge 要在會員資料裡
   每收集到一個會給予 500 里程 每收集滿五個可以拿到一個驚喜包 裡面有里程也有免費升等卷哪個航線（期限一年）或是會籍積分或等等好東西機率一定要低
   或是下一趟旅行從 TPE 出發贈與貴賓室卷等等 然後地勤在航班資料要印的時候就會顯示要印貴賓室 invitation card 所以旅客端那裡也要有 inventory
   然後免費升等卷要限定航線可能是比較冷門一點的航線之類的」「badge 滿 16 個集滿全部會送大禮 你幫我設定這個大禮」）
   · 徽章 16 枚（BADGES），條件都從網站既有資料判定（已飛航段、BigDeal 得標、Residence、哩程、卡等、KGM Cards、寵物申請）；
     每枚第一次取得 +500 哩（只發一次，紀錄 S.badgeR1103A＝kgm31_badge）。
   · 每滿 5／10／15 枚 → 驚喜包（票夾裡一包，自己打開）；內容依會員＋第幾包固定（重新整理不會重抽），好東西機率低（PACK 權重）。
     16 枚全收集 → 大禮包 GRAND。
   · 票夾 S.invR1103A（kgm31_inv）：哩程、會籍積分打開就入帳；升等券（冷門航線、一年）在票夾選「即將出發的這條航線訂位」直接升一個艙等
     （空位讀訂位庫存 cabinInventory54，艙等代號跟 BigDeal 得標同一份 KGM_BD_WIN_R1103A）；桃園貴賓室券在地勤報到時自動帶出
     「貴賓室邀請卡」（ci31 kgmLoungeVoucherForR1103A），印出即用掉。
   · BigDeal 頁＝上排 🔥 BigDeal 按鈕（原本只跳到里程總覽，沒有頁面）：出價卡用「我的行程」同一張（kgmBigDealTripHtmlR929）、同一套出價引擎。
   · 後台競標管理：頂部改成數字總覽＋分類切換（全部／Residence／BigDeal），規則收進「競標規則」；每一組預設收起（點標題列展開），表格重新排版。 */
(function(){
  if(window.__bd31)return;window.__bd31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function N(n){return (Math.round(+n||0)).toLocaleString()}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function AD(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function H(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
  function me(){try{if(!S.user)return null;return (S.users||[]).filter(function(u){return u&&u.id===S.user.id})[0]||S.user}catch(_){return null}}
  function tierN(l){try{return (typeof tierOf==='function')?tierOf(l):l}catch(_){return l}}
  var ORD=['Economy','Premium','Business','First','Resident'];
  function cabOf(code){try{var f=FARES[code]||(typeof AWARD_FARES!=='undefined'&&AWARD_FARES[code]);return (f&&f.cabin)||'Economy'}catch(_){return 'Economy'}}
  /* 會員已飛的航段（KGM 營運，不含取消、員工票） */
  function flown(u){var out=[];(S.bookings||[]).forEach(function(b){if(!u||!b||b.userId!==u.id||b.status==='cancelled'||b.staff)return;var segs=[];try{segs=(typeof tripSegments==='function'&&tripSegments(b))||[]}catch(_){}
      segs.forEach(function(sg){if(!sg||!sg.date||sg.date>T())return;var code=sg.fare||(sg.dir==='inb'?b.inbC:b.outC),km=0;try{km=distOf(sg.fr,sg.to)||0}catch(_){}out.push({code:sg.code,fr:sg.fr,to:sg.to,date:sg.date,dep:sg.dep||'',cab:cabOf(code),km:km})})});return out}
  function bdWon(u){return (S.bigDeals||[]).filter(function(b){return b&&u&&b.userId===u.id&&b.status==='won'&&!b.demoR922}).length}
  function resWon(u){try{return (S.residenceBidsR83||[]).some(function(b){return b&&u&&b.userId===u.id&&/won|awarded|confirmed/.test(String(b.status||''))})}catch(_){return false}}
  function petCase(u){try{return (S.staffCasesR1007A||[]).some(function(c){return c&&u&&c.type==='pet'&&c.userId===u.id})}catch(_){return false}}
  /* 1108A（使用者：「寵物同行不能是一個徽章換一個」）：原本送出一件申請就拿到徽章（＋500 哩）→ 改成核准且已搭乘的寵物同行航段累計 3 段才拿到；撤回、不同意、還沒飛的不算 */
  function petTrips(u){var n=0,t='';try{t=todayISO()}catch(_){t=new Date().toISOString().slice(0,10)}try{(S.bookings||[]).forEach(function(b){if(!b||!u||b.userId!==u.id||b.status==='cancelled')return;(b.petsR1101A||[]).forEach(function(p){if(p&&p.date&&p.date<t)n++})})}catch(_){}return n}
  function hasCard(u){try{return !!(window.kgmCardsOfR1103A&&u&&window.kgmCardsOfR1103A(u.id).length)}catch(_){return false}}
  function lvl(u){var t=tierN((u&&(u.level||u.tier))||'Bronze');return ['Bronze','Silver','Gold','Diamond'].indexOf(t)}
  /* [id, 中文, English, 說明, 顏色, 圖示, 進度(u,F)→[目前,目標]] */
  var BADGES=[
    ['first','首航啟程','First Flight','搭乘第一個 KGM 航段','#1F6B52','✈',function(u,F){return [Math.min(1,F.length),1]}],
    ['ten','十段常客','Ten Segments','累計搭乘 10 個航段','#1F6B52','10',function(u,F){return [Math.min(10,F.length),10]}],
    ['long','長程旅人','Long Hauler','搭乘一個 9,000 公里以上的航段','#2B4F8F','⟷',function(u,F){return [F.some(function(s){return s.km>=9000})?1:0,1]}],
    ['city','六城旅人','Six Cities','飛抵 6 個不同的目的地','#2B4F8F','◎',function(u,F){var h={};F.forEach(function(s){h[s.to]=1});return [Math.min(6,Object.keys(h).length),6]}],
    ['red','紅眼戰士','Red-eye','搭乘 22:00–02:59 起飛的航段','#4A3A78','☾',function(u,F){return [F.some(function(s){var h=+String(s.dep).slice(0,2);return s.dep&&(h>=22||h<3)})?1:0,1]}],
    ['bd1','BigDeal 初勝','BigDeal Winner','第一次 BigDeal 得標','#C2410C','🔥',function(u){return [Math.min(1,bdWon(u)),1]}],
    ['bd3','BigDeal 賭王','BigDeal King','BigDeal 得標 3 次','#9A3412','♛',function(u){return [Math.min(3,bdWon(u)),3]}],
    ['res','Residence 住客','Residence Guest','入住 A380 Residence（搭乘或競標得標）','#7A5608','⌂',function(u,F){return [(F.some(function(s){return s.cab==='Resident'})||resWon(u))?1:0,1]}],
    ['fst','頭等禮遇','First Class','搭乘頭等艙','#8A6A22','★',function(u,F){return [F.some(function(s){return s.cab==='First'})?1:0,1]}],
    ['biz','商務常客','Business Regular','搭乘商務艙 5 個航段','#0B3B30','◆',function(u,F){return [Math.min(5,F.filter(function(s){return s.cab==='Business'}).length),5]}],
    ['prem','豪經初體驗','Premium Economy','搭乘豪華經濟艙','#3C6E5E','◇',function(u,F){return [F.some(function(s){return s.cab==='Premium'})?1:0,1]}],
    ['mil','哩程大亨','Miles Tycoon','哩程餘額達 200,000 哩','#A77D33','∞',function(u){return [Math.min(200000,+u.miles||0),200000]}],
    ['sil','銀翼','Silver Wings','取得 Silver 以上卡等','#6F7780','S',function(u){return [lvl(u)>=1?1:0,1]}],
    ['gld','金翼','Gold Wings','取得 Gold 以上卡等','#B08A3E','G',function(u){return [lvl(u)>=2?1:0,1]}],
    ['card','KGM Cards 持卡人','Cardholder','綁定 KGM Cards（Star K／G／M）','#222','▭',function(u){return [hasCard(u)?1:0,1]}],
    ['pet','寵物好夥伴','Pet Pal','帶寵物搭乘 3 個航段（核准且已搭乘）','#5B7A2E','❀',function(u){return [Math.min(3,petTrips(u)),3]}]];
  window.KGM_BADGES_R1103A=BADGES;
  function led(){return S.badgeR1103A=S.badgeR1103A||{}}
  function invAll(){return S.invR1103A=S.invR1103A||{}}
  function inv(uid){var I=invAll();return I[uid]=I[uid]||[]}
  function evalB(u){var F=flown(u);return BADGES.map(function(b){var p=[0,1];try{p=b[6](u,F)}catch(_){}return {b:b,cur:p[0],need:p[1],ok:p[0]>=p[1]}})}
  window.kgmBadgeEvalR1103A=evalB;
  function credit(u,mi,desc){if(!mi)return;u.miles=(+u.miles||0)+mi;(u.milesLog=u.milesLog||[]).unshift({date:T(),type:'credit',miles:mi,desc:desc});try{if(S.user&&S.user!==u&&S.user.id===u.id){S.user.miles=u.miles;S.user.milesLog=u.milesLog}}catch(_){}}
  function notify(u,title,msg){try{S.notifs=S.notifs||[];S.notifs.unshift({title:title,message:msg,date:T(),read:false,userId:u.id})}catch(_){}}
  function gid(){return 'IV'+Date.now().toString(36).toUpperCase()+String(Math.random()).slice(2,5)}
  /* 取得新徽章 → +500 哩；跨過 5／10／15 → 驚喜包；16 → 大禮包 */
  function sync(u){u=u||me();if(!u||!u.id)return [];var L=led(),got=L[u.id]=L[u.id]||{},nw=[];
    evalB(u).forEach(function(r){if(r.ok&&!got[r.b[0]]){got[r.b[0]]=T();nw.push(r.b);credit(u,500,(z()?'徽章「':'Badge ')+r.b[1]+(z()?'」獎勵':' reward'))}});
    if(nw.length){var n=Object.keys(got).length,I=inv(u.id);
      [5,10,15].forEach(function(k){if(n>=k&&!I.some(function(x){return x.type==='pack'&&x.n===k}))I.unshift({id:gid(),type:'pack',n:k,at:T(),opened:false})});
      if(n>=BADGES.length&&!I.some(function(x){return x.type==='grand'}))I.unshift({id:gid(),type:'grand',n:16,at:T(),opened:false});
      notify(u,z()?'獲得新徽章':'New badge',(z()?'恭喜獲得 ':'You earned ')+nw.map(function(b){return '「'+b[1]+'」'}).join('')+(z()?'，每枚 +500 哩已入帳。':' (+500 miles each).'));
      try{save()}catch(_){}}
    return nw}
  window.kgmBadgeSyncR1103A=sync;
  /* 冷門航線：KGM 自營、每週班次最少的航線 */
  function coldRoutes(){var w={};try{[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){if(!f||f.partner||f.via||!/^KX/.test(String(f.code||''))||f.tempR49)return;if(f.fr!=='TPE'&&f.to!=='TPE')return;
      var k=[f.fr,f.to].sort().join('-'),d=String(f.days||'1234567').replace(/[^1-7]/g,'').length||7;w[k]=(w[k]||0)+d})}catch(_){}
    return Object.keys(w).sort(function(a,b){return w[a]-w[b]||a.localeCompare(b)}).slice(0,10)}
  window.kgmColdRoutesR1103A=coldRoutes;
  var PACK=[[34,'mi',1000],[22,'mi',2000],[14,'tp',30],[10,'mi',5000],[9,'lounge',1],[6,'tp',60],[4,'upg',1],[1,'mi',10000]];
  function roll(seed){var r=H(seed)%100,a=0;for(var i=0;i<PACK.length;i++){a+=PACK[i][0];if(r<a)return PACK[i]}return PACK[0]}
  window.kgmPackOpenR1103A=function(id){var u=me();if(!u)return;var I=inv(u.id),p=I.filter(function(x){return x.id===id})[0];if(!p||p.opened)return;
    var got=[],exp=AD(T(),365);
    if(p.type==='grand'){credit(u,50000,z()?'徽章全收集大禮包':'All-badges grand prize');got.push({type:'mi',v:50000});
      if(lvl(u)<3){u.level='Diamond';u.grandDiamondR1103A=(+T().slice(0,4)+1)+'-12-31';try{if(S.user&&S.user!==u&&S.user.id===u.id)S.user.level='Diamond'}catch(_){}}got.push({type:'tier',v:'Diamond'});
      for(var g=0;g<2;g++){I.push({id:gid(),type:'upg',route:'',exp:exp,at:T(),from:p.id,used:false});got.push({type:'upg',route:''})}
      for(var l=0;l<2;l++){I.push({id:gid(),type:'lounge',ap:'TPE',guest:1,exp:exp,at:T(),from:p.id,used:false});got.push({type:'lounge'})}}
    else{var cr=coldRoutes();for(var k=0;k<3;k++){var it=roll(u.id+'#pack'+p.n+'#'+k);
      if(it[1]==='mi'){credit(u,it[2],(z()?'驚喜包（第 ':'Surprise pack #')+p.n/5+(z()?' 包）':'')+' · '+N(it[2])+(z()?' 哩':' mi'));got.push({type:'mi',v:it[2]})}
      else if(it[1]==='tp'){(u.tpBonusR1103A=u.tpBonusR1103A||[]).push({date:T(),tp:it[2],desc:'pack '+p.n});got.push({type:'tp',v:it[2]})}
      else if(it[1]==='lounge'){I.push({id:gid(),type:'lounge',ap:'TPE',guest:0,exp:exp,at:T(),from:p.id,used:false});got.push({type:'lounge'})}
      else{var rt=cr.length?cr[H(u.id+'#rt'+p.n+'#'+k)%cr.length]:'';I.push({id:gid(),type:'upg',route:rt,exp:exp,at:T(),from:p.id,used:false});got.push({type:'upg',route:rt})}}}
    p.opened=true;p.openedAt=T();p.got=got;try{save()}catch(_){}try{render()}catch(_){}};
  /* 升等券：即將出發、未過期、航線符合（任一方向）的訂位航段 */
  function upSegs(u,it){var out=[];(S.bookings||[]).forEach(function(b){if(!b||b.userId!==u.id||b.status!=='confirmed')return;var segs=[];try{segs=window.kgmTripSegmentsH(b)||[]}catch(_){}
      segs.forEach(function(s){if(!s||!s.date||s.date<=T()||s.date>it.exp)return;if(s.key!=='out'&&s.key!=='inb')return;if(it.route&&[s.fr,s.to].sort().join('-')!==it.route)return;
        var cur=cabOf((b.segmentFare0826A||{})[s.key]||(s.key==='out'?b.outC:b.inbC)),f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0]}catch(_){}if(!f)return;
        var nx=null,left=0,i0=ORD.indexOf(cur);for(var i=i0+1;i<ORD.length-1&&!nx;i++){var iv=null;try{iv=window.kgmCabInvR1103A(Object.assign({},f,{date:s.date}),s.date,ORD[i])}catch(_){}if(iv&&(+iv.capacity||+iv.total||(iv.seats&&iv.seats.length))){nx=ORD[i];left=Math.max(0,+iv.left||0)}}
        var pax=Math.max(1,(b.paxList||[]).length);out.push({b:b,s:s,cur:cur,nx:nx,ok:!!nx&&left>=pax,left:left,pax:pax})})});return out}
  window.kgmUpgUseR1103A=function(id,pnr,key){var u=me();if(!u)return;var it=inv(u.id).filter(function(x){return x.id===id})[0];if(!it||it.used)return;
    var c=upSegs(u,it).filter(function(x){return x.b.pnr===pnr&&x.s.key===key})[0];if(!c||!c.ok){alert(z()?'這個航段的上一個艙等目前沒有足夠空位。':'No seats in the next cabin.');return}
    var cz={Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'};
    if(!confirm((z()?'使用升等券：'+c.s.code+' '+c.s.date+' '+c.s.fr+'→'+c.s.to+' 升至 '+(cz[c.nx]||c.nx)+'（同訂位 '+c.pax+' 位）？':'Use voucher?')))return;
    var W=window.KGM_BD_WIN_R1103A||{},nc=W[c.nx];if(!nc){alert('fare');return}
    var b=c.b;if(key==='out')b.outC=nc;else b.inbC=nc;b.segmentFare0826A=b.segmentFare0826A||{};b.segmentFare0826A[key]=nc;b.seats=b.seats||{};b.seats[key]={};
    (b.upgVoucherR1103A=b.upgVoucherR1103A||[]).push({id:it.id,seg:key,from:c.cur,to:c.nx,at:T()});it.used=true;it.usedAt=T();it.usedOn=pnr+' '+c.s.code+' '+c.s.date;
    notify(u,z()?'升等券已使用':'Upgrade applied',(z()?'訂位 '+pnr+' 的 '+c.s.code+'（'+c.s.date+'）已升至 '+(cz[c.nx]||c.nx)+'，請重新選位。':'Upgraded.'));
    try{save()}catch(_){}try{render()}catch(_){}};
  /* 地勤報到：訂位會員有未使用的桃園貴賓室券 → ci31 列印貴賓室邀請卡；印出即用掉 */
  window.kgmLoungeVoucherForR1103A=function(pnr,f){try{if(!f||f.fr!=='TPE')return null;var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b||!b.userId)return null;
      return inv(b.userId).filter(function(x){return x.type==='lounge'&&!x.used&&x.exp>=(f.date||T())&&(!x.forPnr||x.forPnr===pnr)})[0]||null}catch(_){return null}};
  window.kgmLoungeVoucherUseR1103A=function(v,pnr,f){try{if(!v||v.used)return;v.used=true;v.usedAt=T();v.usedOn=pnr+(f?' '+f.code+' '+f.date:'');save()}catch(_){}};
  /* ── 徽章圖示 ── */
  function medal(b,ok,sz){sz=sz||64;var c=ok?b[4]:'#C9C4B8',id='bg31'+b[0]+(ok?'a':'b');
    return '<svg viewBox="0 0 64 64" width="'+sz+'" height="'+sz+'" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c+'"/><stop offset="1" stop-color="'+(ok?'#0d0d0d':'#B5AE9F')+'" stop-opacity="'+(ok?'.55':'1')+'"/></linearGradient></defs>'
      +'<path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="url(#'+id+')" stroke="'+(ok?'#E8D9A8':'#DDD7C9')+'" stroke-width="2"/><path d="M32 10 51 21v22L32 54 13 43V21z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>'
      +'<text x="32" y="38" text-anchor="middle" font-size="'+(b[5].length>1?15:19)+'" font-weight="800" fill="#fff" font-family="Georgia,serif">'+E(b[5])+'</text></svg>'}
  /* 會員資料頁的徽章列 */
  window.kgmBadgeStripR1103A=function(u){u=u||me();if(!u)return '';var R=evalB(u),got=(led()[u.id]||{}),n=R.filter(function(r){return got[r.b[0]]}).length;
    return '<div class="k31b-strip"><div class="k31b-sh"><div><small>BADGES</small><b>'+(z()?'我的徽章 ':'Badges ')+n+' / '+BADGES.length+'</b></div><button class="btn btn-sm" onclick="nav(\'badge31\')">'+(z()?'全部徽章與驚喜包 ›':'All badges ›')+'</button></div>'
      +'<div class="k31b-row">'+R.map(function(r){var ok=!!got[r.b[0]];return '<span class="'+(ok?'on':'')+'" title="'+E(r.b[1]+'：'+r.b[3])+'">'+medal(r.b,ok,40)+'</span>'}).join('')+'</div>'
      +'<div class="k31b-bar"><i style="width:'+Math.round(n/BADGES.length*100)+'%"></i>'+[5,10,15,16].map(function(k){return '<em style="left:'+(k/16*100)+'%" class="'+(n>=k?'on':'')+'">'+(k===16?'🏆':'🎁')+'</em>'}).join('')+'</div></div>'};
  function itemTxt(x){var cz=z();if(x.type==='mi')return N(x.v)+(cz?' 哩':' miles');if(x.type==='tp')return N(x.v)+(cz?' 會籍積分':' tier points');if(x.type==='lounge')return cz?'桃園貴賓室券':'TPE lounge pass';if(x.type==='tier')return cz?'Diamond 卡等至 '+(+T().slice(0,4)+1)+'/12/31':'Diamond status';return (cz?'免費升等券 ':'Upgrade voucher ')+(x.route?x.route.replace('-',' ⇄ '):(cz?'任選航線':'any route'))}
  function badgePage(){var u=me();if(!u)return '<main class="k31b"><p>'+(z()?'請先登入。':'Please log in.')+'</p></main>';sync(u);var R=evalB(u),got=(led()[u.id]||{}),n=R.filter(function(r){return got[r.b[0]]}).length,I=inv(u.id);
    var packs=I.filter(function(x){return x.type==='pack'||x.type==='grand'});
    return '<main class="k31b"><header class="k31b-h"><div><small>KGM EXPLORER · BADGES</small><h1>'+(z()?'我的徽章':'My badges')+'</h1><p>'+(z()?'每取得一枚徽章 +500 哩；每收集 5 枚送一個驚喜包（5、10、15 枚），16 枚全收集送大禮包。':'+500 miles per badge; a surprise pack every 5; a grand prize at 16.')+'</p></div>'
      +'<div class="k31b-cnt"><b>'+n+'</b><span>/ '+BADGES.length+'</span></div></header>'
      +window.kgmBadgeStripR1103A(u).replace('k31b-strip','k31b-strip big')
      +'<section class="k31b-grid">'+R.map(function(r){var ok=!!got[r.b[0]];return '<article class="'+(ok?'on':'')+'">'+medal(r.b,ok,64)+'<div><b>'+E(z()?r.b[1]:r.b[2])+'</b><span>'+E(r.b[3])+'</span>'+(ok?'<em>'+(z()?'取得於 ':'Earned ')+E(got[r.b[0]])+' · +500</em>':'<i><u style="width:'+Math.min(100,Math.round(r.cur/r.need*100))+'%"></u></i><em>'+N(r.cur)+' / '+N(r.need)+'</em>')+'</div></article>'}).join('')+'</section>'
      +'<section class="k31b-pk"><h2>'+(z()?'驚喜包':'Surprise packs')+'</h2>'+[5,10,15,16].map(function(k){var p=packs.filter(function(x){return x.n===k})[0];
        return '<div class="k31b-pc'+(p?(p.opened?' done':' ready'):'')+'"><span>'+(k===16?'🏆':'🎁')+'</span><div><b>'+(k===16?(z()?'全收集大禮包':'Grand prize'):(z()?'第 '+(k/5)+' 包（'+k+' 枚）':'Pack '+(k/5)))+'</b><small>'+(p?(p.opened?(z()?'已打開：':'Opened: ')+p.got.map(itemTxt).join('、'):(z()?'可以打開了！':'Ready to open')):(z()?'還差 '+Math.max(0,k-n)+' 枚':(k-n)+' to go'))+'</small></div>'
          +(p&&!p.opened?'<button class="k31b-go" onclick="kgmPackOpenR1103A(\''+A(p.id)+'\')">'+(z()?'打開':'Open')+'</button>':'')+'</div>'}).join('')
      +'<p class="k31b-n">'+(z()?'驚喜包每包 3 樣，可能是 1,000～10,000 哩、30／60 會籍積分、桃園貴賓室券或冷門航線免費升等券（一年內有效）；好東西機率低：10,000 哩 1%、升等券 4%、貴賓室券 9%。大禮包：50,000 哩＋Diamond 卡等至次年底＋任選航線升等券 2 張＋桃園貴賓室同行券 2 張。':'')+'</p></section>'
      +'<p class="k31b-n"><a href="javascript:void(0)" onclick="nav(\'inv31\')">'+(z()?'到我的票夾使用升等券、貴賓室券 ›':'Open my wallet ›')+'</a></p></main>'}
  function invPage(){var u=me();if(!u)return '<main class="k31b"><p>'+(z()?'請先登入。':'Please log in.')+'</p></main>';sync(u);var I=inv(u.id),vou=I.filter(function(x){return x.type==='upg'||x.type==='lounge'}),packs=I.filter(function(x){return (x.type==='pack'||x.type==='grand')&&!x.opened});
    var air=((S.vouchersR1101A||[]).filter(function(v){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===v.pnr})[0];return v&&((b&&b.userId===u.id)||v.userId===u.id)}));
    var card=function(x){var dead=x.exp<T(),st=x.used?(z()?'已使用 ':'Used ')+(x.usedOn||''):(dead?(z()?'已過期':'Expired'):(z()?'有效至 ':'Valid to ')+x.exp);var body='';
      if(x.type==='upg'&&!x.used&&!dead){var c=upSegs(u,x);body=c.length?'<div class="k31w-use">'+c.map(function(q){return '<button '+(q.ok?'':'disabled ')+'onclick="kgmUpgUseR1103A(\''+A(x.id)+'\',\''+A(q.b.pnr)+'\',\''+A(q.s.key)+'\')">'+E(q.s.code+' '+q.s.date.slice(5)+' '+q.s.fr+'→'+q.s.to)+' · '+(q.nx?(q.ok?(z()?'升至 ':'to ')+q.nx:(z()?'上一艙沒有空位':'no seats')):(z()?'已是最高艙':'top cabin'))+'</button>'}).join('')+'</div>':'<p>'+(z()?'目前沒有'+(x.route?'這條航線':'')+'即將出發的訂位可以使用。':'No eligible booking.')+'</p>'}
      if(x.type==='lounge'&&!x.used&&!dead)body='<p>'+(z()?'桃園機場出發時，櫃檯報到會自動印出貴賓室邀請卡'+(x.guest?'（可攜同行 1 位）':'')+'。':'Printed at TPE check-in.')+'</p>';
      return '<article class="k31w-c '+x.type+(x.used||dead?' off':'')+'"><div class="k31w-art"><small>'+(x.type==='upg'?'UPGRADE VOUCHER':'LOUNGE PASS')+'</small><b>'+E(itemTxt(x))+'</b><span>'+E(x.id)+'</span></div><div class="k31w-b"><em>'+E(st)+'</em>'+body+'</div></article>'};
    return '<main class="k31b"><header class="k31b-h"><div><small>KGM EXPLORER · WALLET</small><h1>'+(z()?'我的票夾':'My wallet')+'</h1><p>'+(z()?'驚喜包、升等券、貴賓室券與機場抵用券。':'Packs, vouchers and lounge passes.')+'</p></div></header>'
      +(packs.length?'<section class="k31b-pk">'+packs.map(function(p){return '<div class="k31b-pc ready"><span>'+(p.type==='grand'?'🏆':'🎁')+'</span><div><b>'+(p.type==='grand'?(z()?'全收集大禮包':'Grand prize'):(z()?'驚喜包（'+p.n+' 枚）':'Surprise pack'))+'</b><small>'+(z()?'取得於 ':'')+E(p.at)+'</small></div><button class="k31b-go" onclick="kgmPackOpenR1103A(\''+A(p.id)+'\')">'+(z()?'打開':'Open')+'</button></div>'}).join('')+'</section>':'')
      +'<section class="k31w">'+(vou.length?vou.map(card).join(''):'<p class="k31b-n">'+(z()?'還沒有升等券或貴賓室券。收集徽章、打開驚喜包就有機會拿到。':'Nothing yet.')+'</p>')+'</section>'
      +(air.length?'<section class="k31w"><h2>'+(z()?'機場抵用券':'Airport vouchers')+'</h2>'+air.map(function(v){return '<article class="k31w-c air'+(v.used?' off':'')+'"><div class="k31w-art"><small>AIRPORT VOUCHER</small><b>USD '+N(v.usd)+'</b><span>'+E(v.no)+'</span></div><div class="k31w-b"><em>'+E(v.used?(z()?'已使用':'Used'):(z()?'有效':'Valid')+(v.exp?(z()?'至 ':' to ')+v.exp:''))+'</em><p>'+E((v.code||'')+' '+(v.date||'')+' · '+(v.pnr||''))+'</p></div></article>'}).join('')+'</section>':'')+'</main>'}
  /* ── BigDeal 前台頁（上排 🔥 BigDeal） ── */
  function bdPage(){var u=me();if(!u)return '<main class="k31d"><p>'+(z()?'請先登入。':'Please log in.')+'</p></main>';sync(u);
    var mine=(S.bigDeals||[]).filter(function(b){return b&&b.userId===u.id&&!b.demoR922}).slice().sort(function(a,b){return String(b.at||b.ts||'').localeCompare(String(a.at||a.ts||''))});
    var cnt={live:0,lead:0,won:0};mine.forEach(function(b){if(/open|leading|outbid|pending/.test(b.status))cnt.live++;if(b.status==='leading')cnt.lead++;if(b.status==='won')cnt.won++});
    var cfg=window.KGM_BIGDEAL_R929||{},rate=0.3;try{rate=+window.KGM_MILE_RATE_R929||0.3}catch(_){}
    var cards=[],soon=[];(S.bookings||[]).forEach(function(b){if(!b||b.userId!==u.id||b.status!=='confirmed')return;var segs=[];try{segs=window.kgmTripSegmentsH(b)||[]}catch(_){}var h='';try{h=window.kgmBigDealTripHtmlR929(b,segs)||''}catch(_){}
      if(h&&segs.some(function(q){return q.date>=T()}))cards.push('<div class="k31d-trip"><div class="k31d-tt"><b>'+E(b.pnr)+'</b>'+segs.map(function(s){return '<span>'+E(s.code+' '+s.fr+'→'+s.to+' '+s.date)+'</span>'}).join('')+'</div>'+h+'</div>');
      else segs.forEach(function(s){if(!(s.date>T()&&s.date<=AD(T(),60)))return;var el=false;try{var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];var cab=cabOf((b.segmentFare0826A||{})[s.key]||(s.key==='inb'?b.inbC:b.outC));el=!!(f&&window.kgmBigDealTargetsR929(f,s.date,cab).length)}catch(_){}soon.push({b:b,s:s,el:el,grp:!!(window.kgmBdIsGroupR1112A&&window.kgmBdIsGroupR1112A(b))})})});   /* 1112A C5：團體票不適用 */   /* 這一段有沒有可以競標的艙等：問 BigDeal 引擎（長程豪經／商務、頭等、Residence） */
    var CZ={Premium:z()?'豪經':'Premium',Business:z()?'商務':'Business',First:z()?'頭等':'First',Resident:'Residence'},ST={open:z()?'出價中':'Open',pending:z()?'出價中':'Open',leading:z()?'領先':'Leading',outbid:'Out of Bid',won:z()?'得標':'Won',lost:z()?'未得標':'Lost',withdrawn:z()?'已撤回':'Withdrawn'};
    var hist=mine.length?'<table class="k31d-t"><thead><tr><th>'+(z()?'航班':'Flight')+'</th><th>'+(z()?'升至':'To')+'</th><th class="r">'+(z()?'現金':'Cash')+'</th><th class="r">'+(z()?'哩程':'Miles')+'</th><th class="r">'+(z()?'總價值':'Value')+'</th><th>'+(z()?'名次':'Rank')+'</th><th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
      +mine.map(function(b){var v=0;try{v=window.kgmBigDealValueR929(b)}catch(_){}var live=/open|leading|outbid|pending/.test(b.status);return '<tr><td><b>'+E(b.code)+'</b> '+E((b.fr||'')+'→'+(b.to||''))+'<small>'+E(b.date)+' · '+E(b.pnr)+'</small></td><td>'+E(CZ[b.toCabin||b.nextCabin]||b.toCabin||b.nextCabin||'')+'</td><td class="r">'+(+b.amount?'NT$'+N(b.amount):'—')+'</td><td class="r">'+(+b.miles?N(b.miles):'—')+'</td><td class="r">NT$'+N(v)+'</td><td>'+(b.rankR929?'#'+b.rankR929:'—')+'</td><td><i class="k31d-st '+E(b.status)+'">'+E(ST[b.status]||b.status)+'</i></td><td>'+(live&&b.id?'<button class="btn btn-sm" onclick="if(kgmBigDealWithdrawR929(\''+A(b.id)+'\'))render()">'+(z()?'撤回':'Withdraw')+'</button>':'')+'</td></tr>'}).join('')+'</tbody></table>'
      :'<p class="k31b-n">'+(z()?'還沒有出價紀錄。':'No bids yet.')+'</p>';
    var bk=BADGES.filter(function(b){return b[0]==='bd3'})[0],won=bdWon(u);
    return '<main class="k31d"><header class="k31d-h"><div><small>KGM BIGDEAL · UPGRADE AUCTION</small><h1>BigDeal</h1><p>'+(z()?'起飛前 7 天開放、48 小時前公布。用現金、哩程或現金＋哩程（1 哩＝NT$'+rate.toFixed(2)+'）出價升等上一個艙等；依每位總價值排名，排在座位數內的得標，其餘不收任何費用。':'Bid cash and/or miles to move up one cabin; results 48 h before departure.')+'</p></div>'
      +'<div class="k31d-k"><div><small>'+(z()?'出價中':'Live')+'</small><b>'+cnt.live+'</b></div><div><small>'+(z()?'目前領先':'Leading')+'</small><b>'+cnt.lead+'</b></div><div><small>'+(z()?'已得標':'Won')+'</small><b>'+cnt.won+'</b></div><div class="bd">'+medal(bk,won>=3,46)+'<span><small>'+(z()?'BigDeal 賭王':'BigDeal King')+'</small><b>'+Math.min(3,won)+' / 3</b></span></div></div></header>'
      +'<section><h2>'+(z()?'現在可以出價':'Open now')+'</h2>'+(cards.length?cards.join(''):'<p class="k31b-n">'+(z()?'目前沒有開放中的 BigDeal（起飛前 7 天～48 小時、長程豪經／商務、頭等與 Residence）。':'No open BigDeal.')+'</p>')+'</section>'
      +(soon.length?'<section><h2>'+(z()?'即將開放':'Opening soon')+'</h2><div class="k31d-soon">'+soon.slice(0,8).map(function(q){var op=AD(q.s.date,-7);return '<div><b>'+E(q.s.code)+'</b><span>'+E(q.s.fr+'→'+q.s.to+' · '+q.s.date)+'</span><em>'+(q.grp?(z()?'團體票不適用 BigDeal':'Group fares not eligible'):!q.el?(z()?'這段沒有可競標的艙等':'not eligible'):(op>T()?(z()?op.slice(5)+' 開放':'opens '+op.slice(5)):(z()?'已截止':'closed')))+'</em></div>'}).join('')+'</div></section>':'')
      +'<section><h2>'+(z()?'我的出價紀錄':'My bids')+'</h2>'+hist+'</section></main>'}
  /* 前台頁面掛在內容區（跟 cs28 寵物／案件同一個做法）；🔥 BigDeal 按鈕（miles_page＋bigdeal）也畫這頁 */
  function host(){var app=document.getElementById('app');if(!app)return null;var h=null;[].slice.call(app.children).forEach(function(n){if(!h&&n.tagName==='DIV'&&n.id!=='aiChat')h=n});return h}
  function paint(){try{var v=S.view,html=null;if(v==='badge31')html=badgePage();else if(v==='inv31')html=invPage();else if(v==='bigdeal31'||(v==='miles_page'&&S.milesTab==='bigdeal'))html=bdPage();else return;var h=host();if(h)h.innerHTML=html}catch(e){try{console.warn('bd31',e)}catch(_){}}}
  /* 會員資料頁：會籍積分面板下面加徽章列 */
  function hookTp(){var O=window.kgmTpPanelR1103A;if(typeof O!=='function'||O.__bd31)return;var w=function(u){var h=O.apply(this,arguments);try{sync(u);h=h.replace(/<\/div>$/,window.kgmBadgeStripR1103A(u)+'</div>')}catch(_){}return h};w.__bd31=1;window.kgmTpPanelR1103A=w}
  function hook(){var r0=window.render;if(typeof r0==='function'&&!r0.__bd31){var w=function(){var r=r0.apply(this,arguments);paint();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__bd31=1;window.render=w;try{render=w}catch(_){}}hookTp()}
  hook();setTimeout(hook,0);setTimeout(hook,3000);
  setInterval(function(){try{if(S.user&&S.view!=='admin'&&sync().length&&/badge31|inv31|profile/.test(S.view))render()}catch(_){}},60000);
  /* ── 後台競標管理：頂部總覽＋分類切換＋規則收合；每組預設收起 ── */
  window.kgmAucToggleR1103A=function(k){S._aucColR1022A=S._aucColR1022A||{};var cur=(k in S._aucColR1022A)?!!S._aucColR1022A[k]:true;S._aucColR1022A[k]=!cur;try{render()}catch(_){}};
  window.kgmAucPageR1103A=function(fn){var h=fn(),srch=!!(String(S.auctionQR920||'').trim()||String(S.auctionCodeR923||'').trim());
    try{var rows=window.kgmAuctionRowsR920('')||[],z0=z(),c={res:0,bd:0,lead:0,won:0,val:0},fl={};rows.forEach(function(r){var k=r.code+'|'+r.date+'|'+r.kind;if(!fl[k]){fl[k]=1;if(r.kind==='bigdeal')c.bd++;else c.res++}if(r.status==='leading')c.lead++;if(r.status==='won')c.won++;c.val+=(+r.combined||((+r.ticket||0)+(+r.amount||0)))});
      var v=S.aucViewR1103A||'all';
      var head='<header class="k31a-h"><div><small>AUCTIONS</small><h2>'+(z0?'競標管理':'Auctions')+'</h2><div class="k31a-seg">'+[['all',z0?'全部':'All'],['res','Residence'],['bd','BigDeal']].map(function(t){return '<button class="'+(v===t[0]?'on':'')+'" onclick="S.aucViewR1103A=\''+t[0]+'\';render()">'+t[1]+'</button>'}).join('')+'</div></div>'
        +'<div class="k31a-k"><div><small>'+(z0?'Residence 競標組':'Residence groups')+'</small><b>'+N(c.res)+'</b></div><div><small>'+(z0?'BigDeal 競標組':'BigDeal groups')+'</small><b>'+N(c.bd)+'</b></div><div><small>'+(z0?'目前領先出價':'Leading bids')+'</small><b>'+N(c.lead)+'</b></div><div><small>'+(z0?'已得標':'Won')+'</small><b>'+N(c.won)+'</b></div><div><small>'+(z0?'出價總價值':'Total bid value')+'</small><b>NT$'+N(c.val)+'</b></div></div>'
        +'<details class="k31a-r"><summary>'+(z0?'競標規則':'Rules')+'</summary>';
      h=h.replace(/<header><small>AUCTIONS · 競標管理<\/small><b>[\s\S]*?<\/b><p>/,head+'<p>').replace(/<\/p><\/header>/,'</p></details></header>');
      h=h.replace('<section class="k920-auc">','<section class="k920-auc k31a v-'+v+'">');
      if(!srch)h=h.replace(/<article class="k920-grp( k22c)?" data-k22="([^"]*)">/g,function(m,cl,k){var st=(S._aucColR1022A||{});var col=(k in st)?!!st[k]:true;return '<article class="k920-grp'+(col?' k22c':'')+'" data-k22="'+k+'">'});
      h=h.replace(/onclick="kgmAucColR1022A\(this\.closest\('\.k920-grp'\)\.getAttribute\('data-k22'\)\)"/g,'onclick="kgmAucToggleR1103A(this.closest(\'.k920-grp\').getAttribute(\'data-k22\'))"')}catch(e){try{console.warn('bd31 auc',e)}catch(_){}}
    return h};
  try{var css=document.createElement('style');css.textContent=[
    '.k31b,.k31d{max-width:1120px;margin:0 auto;padding:28px 20px 48px}.k31b-h,.k31d-h{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:16px}.k31b-h small,.k31d-h small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}',
    '.k31b-h h1,.k31d-h h1{margin:4px 0 6px;font:700 28px Georgia,serif;color:#0b3b30}.k31b-h p,.k31d-h p{margin:0;color:#5d665f;font-size:13px;max-width:620px;line-height:1.6}.k31b-cnt b{font:700 44px Georgia,serif;color:#0b3b30}.k31b-cnt span{font-size:16px;color:#8a8175;margin-left:4px}',
    '.k31b-strip{margin:14px 0 4px;border-top:1px dashed #e3dccb;padding-top:12px}.k31b-strip.big{background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:14px 16px}.k31b-sh{display:flex;justify-content:space-between;align-items:center;gap:10px}.k31b-sh small{font-size:10px;letter-spacing:.16em;color:#a08a5c;font-weight:800;display:block}.k31b-sh b{font-size:14px;color:#0b3b30}',
    '.k31b-row{display:flex;flex-wrap:wrap;gap:4px;margin:10px 0 8px}.k31b-row span{opacity:.55;filter:grayscale(.6)}.k31b-row span.on{opacity:1;filter:none}',
    '.k31b-bar{position:relative;height:8px;border-radius:99px;background:#ece6d8;margin:14px 6px 8px}.k31b-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,#a77d33,#d6b25e)}.k31b-bar em{position:absolute;top:-9px;transform:translateX(-50%);font-style:normal;font-size:15px;filter:grayscale(1);opacity:.55}.k31b-bar em.on{filter:none;opacity:1}',
    '.k31b-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;margin:16px 0}.k31b-grid article{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:10px 12px}.k31b-grid article.on{border-color:#d6c49a;background:linear-gradient(180deg,#fffdf6,#fff)}',
    '.k31b-grid b{display:block;font-size:14px;color:#0b3b30}.k31b-grid span{display:block;font-size:11.5px;color:#6b645a;margin:2px 0 4px}.k31b-grid em{font-style:normal;font-size:11px;color:#1f6f4a;font-weight:700}.k31b-grid i{display:block;height:5px;border-radius:9px;background:#ece6d8;overflow:hidden;margin-bottom:3px}.k31b-grid i u{display:block;height:100%;background:#a77d33}.k31b-grid article:not(.on) em{color:#8a8175}',
    '.k31b-pk{margin:16px 0}.k31b-pk h2,.k31d h2,.k31w h2{font-size:16px;color:#0b3b30;margin:18px 0 10px}.k31b-pc{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e6e0d2;border-radius:12px;padding:10px 14px;margin-bottom:8px}.k31b-pc>span{font-size:26px;filter:grayscale(1);opacity:.5}.k31b-pc.ready>span,.k31b-pc.done>span{filter:none;opacity:1}',
    '.k31b-pc div{flex:1}.k31b-pc b{display:block;font-size:13.5px;color:#0b3b30}.k31b-pc small{font-size:12px;color:#6b645a}.k31b-pc.ready{border-color:#a77d33;box-shadow:0 0 0 3px rgba(167,125,51,.12)}.k31b-go{height:36px;padding:0 18px;border:0;border-radius:10px;background:#a77d33;color:#fff;font-weight:800;cursor:pointer}.k31b-n{font-size:12px;color:#7a7266;line-height:1.6}',
    '.k31w{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:12px}.k31w h2{grid-column:1/-1}.k31w-c{display:flex;background:#fff;border:1px solid #e6e0d2;border-radius:14px;overflow:hidden}.k31w-c.off{opacity:.55}.k31w-art{width:150px;flex:none;padding:12px;color:#fff;background:linear-gradient(135deg,#0b3b30,#1f6b52);display:flex;flex-direction:column;justify-content:space-between}',
    '.k31w-c.lounge .k31w-art{background:linear-gradient(135deg,#14322A,#2A5B4D)}.k31w-c.air .k31w-art{background:linear-gradient(135deg,#7a5608,#c79a3e)}.k31w-art small{font-size:9px;letter-spacing:.16em;opacity:.85}.k31w-art b{font-size:14px;line-height:1.35}.k31w-art span{font:600 10px ui-monospace,monospace;opacity:.8}',
    '.k31w-b{padding:10px 12px;flex:1}.k31w-b em{font-style:normal;font-size:11.5px;font-weight:800;color:#1f6f4a}.k31w-b p{margin:6px 0 0;font-size:12px;color:#6b645a}.k31w-use{display:flex;flex-direction:column;gap:5px;margin-top:8px}.k31w-use button{text-align:left;border:1px solid #d8e5dd;background:#f5faf7;border-radius:8px;padding:6px 9px;font-size:12px;cursor:pointer;color:#0b3b30}.k31w-use button:disabled{opacity:.5;cursor:not-allowed}',
    '.k31d-k{display:flex;gap:10px;flex-wrap:wrap}.k31d-k>div{background:#fff;border:1px solid #e6e0d2;border-radius:12px;padding:10px 14px;min-width:92px}.k31d-k small{display:block;font-size:11px;color:#8a8175;font-weight:700}.k31d-k b{font-size:22px;color:#0b3b30}.k31d-k .bd{display:flex;gap:8px;align-items:center;background:linear-gradient(135deg,#fff7ed,#fff)}',
    '.k31d-trip{background:#fff;border:1px solid #f1d6bd;border-radius:14px;padding:12px 14px;margin-bottom:10px}.k31d-tt{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:6px;font-size:12px;color:#6b645a}.k31d-tt b{font-size:14px;color:#9a3412}',
    '.k31d-soon{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.k31d-soon div{background:#fff;border:1px solid #e6e0d2;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column}.k31d-soon b{color:#0b3b30}.k31d-soon span{font-size:12px;color:#6b645a}.k31d-soon em{font-style:normal;font-size:11.5px;color:#c2410c;font-weight:800}',
    '.k31d-t{width:100%;border-collapse:collapse;font-size:12.5px;background:#fff;border:1px solid #e6e0d2;border-radius:12px;overflow:hidden}.k31d-t th{text-align:left;font-size:11px;color:#8a8175;background:#faf8f3;padding:8px}.k31d-t td{padding:8px;border-top:1px solid #f1ede4}.k31d-t td small{display:block;font-size:11px;color:#8a8175}.k31d-t .r{text-align:right}',
    '.k31d-st{font-style:normal;font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;background:#eef2f0;color:#3c5a50}.k31d-st.leading,.k31d-st.won{background:#e7f4ec;color:#1f6f4a}.k31d-st.outbid,.k31d-st.lost{background:#fbe6e0;color:#9b2d17}',
    /* 後台競標管理 */
    '.k31a>header{display:block!important;padding:0!important;background:none!important;border:0!important}.k31a-h{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}.k31a-h small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}.k31a-h h2{margin:2px 0 8px;font-size:24px;color:#0b3b30}',
    '.k31a-seg{display:inline-flex;background:#f1ede4;border-radius:999px;padding:3px}.k31a-seg button{border:0;background:none;padding:6px 16px;border-radius:999px;font-weight:800;color:#6b645a;cursor:pointer;font-size:12.5px}.k31a-seg button.on{background:#0b3b30;color:#fff}',
    '.k31a-k{display:grid;grid-template-columns:repeat(5,minmax(110px,1fr));gap:8px}.k31a-k>div{background:#fff;border:1px solid #e6e0d2;border-radius:12px;padding:10px 12px}.k31a-k small{display:block;font-size:10.5px;color:#8a8175;font-weight:700}.k31a-k b{font-size:18px;color:#0b3b30}@media(max-width:1100px){.k31a-k{grid-template-columns:repeat(3,1fr)}}',
    '.k31a-r{margin:12px 0 4px;background:#fbf9f4;border:1px solid #ece6d8;border-radius:10px;padding:8px 12px}.k31a-r summary{cursor:pointer;font-weight:800;color:#0b3b30;font-size:12.5px}.k31a-r p{font-size:12px!important;line-height:1.65;color:#5d665f;margin:8px 0 2px!important}',
    '.k31a.v-res .k923-col:nth-of-type(2),.k31a.v-bd .k923-col:nth-of-type(1){display:none!important}.k31a.v-res .k923-two,.k31a.v-bd .k923-two{grid-template-columns:1fr!important;display:block!important}',
    '.k31a .k920-grp{border:1px solid #e6e0d2!important;border-radius:12px!important;background:#fff!important;margin:0 0 8px!important;overflow:hidden;box-shadow:none!important}.k31a .k920-grp>h3{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:0!important;padding:9px 12px!important;background:#faf8f3;font-size:13px!important}',
    '.k31a .k920-grp.k22c>h3{background:#fff}.k31a .k920-grp.k22c>h3:hover{background:#faf8f3}.k31a .k22-agt{width:24px;height:24px;border-radius:7px;border:1px solid #ddd5c4;background:#fff;font-weight:800;cursor:pointer;margin-right:6px}',
    '.k31a .k920-t{width:100%;font-size:12px!important}.k31a .k920-t th{background:#fbf9f4!important;color:#8a8175!important;font-size:10.5px!important;font-weight:800!important;text-align:left;padding:7px 8px!important}.k31a .k920-t td{padding:7px 8px!important;border-top:1px solid #f1ede4!important}.k31a .k920-t tbody tr:hover td{background:#fbfaf6}',
    '.k31a .k920-bar{display:flex!important;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0}.k31a .k920-bar .inp{width:auto!important;flex:0 1 190px;height:38px;margin:0!important}.k31a .k920-bar>span{font-size:12px;color:#8a8175;margin-left:auto}',
    '.k31a .k22-agt{font-size:0!important;line-height:22px}.k31a .k22-agt::after{content:"−";font-size:14px}.k31a .k920-grp.k22c .k22-agt::after{content:"+"}.k31b-strip.big .k31b-sh button{display:none}',
    '.k31a .k920-t select{height:30px!important;padding:2px 8px!important;line-height:1.2!important;border-radius:7px;border:1px solid #ddd5c4;background:#fff;font-size:12px!important;min-width:96px}.k31a .k923-col>h2{font-size:15px!important;color:#0b3b30!important;display:flex;align-items:center;gap:8px;flex-wrap:wrap}'
  ].join('');document.head.appendChild(css)}catch(_){}
})();
/* ══ 1108B B9（使用者：「BigDeal 我希望是圖三那樣用拉的 有一張圖是現金 另一個是里程這樣」）══
   出價列原本兩個數字框（現金／里程）→ 各自一個「儀表＋拉桿」：指針看出價強度（以這一列的起標價為準：偏低／普通／不錯／很好／極佳），
   拉桿直接改原本那個數字框（id 不變），出價／加碼按鈕、出價引擎都照舊。我的行程與 BigDeal 頁同一張出價卡，兩邊一起換。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var LV=[[0,'偏低','Poor','#D2524A'],[0.6,'普通','Fair','#E8834A'],[1,'不錯','Good','#E9C84A'],[1.4,'很好','Very good','#A9CF6A'],[1.9,'極佳','Excellent','#5FAE6A']];
  function arc(cx,cy,r,a0,a1){var p=function(a){return [cx+r*Math.cos(a),cy-r*Math.sin(a)]},s=p(a0),e=p(a1);return 'M'+s[0].toFixed(1)+' '+s[1].toFixed(1)+' A'+r+' '+r+' 0 0 1 '+e[0].toFixed(1)+' '+e[1].toFixed(1)}
  function svg(id){var cx=80,cy=78,r=58,segs='',n=LV.length;for(var i=0;i<n;i++){var a0=Math.PI-(i/n)*Math.PI,a1=Math.PI-((i+1)/n)*Math.PI+0.03;segs+='<path d="'+arc(cx,cy,r,a0,a1)+'" stroke="'+LV[i][3]+'" stroke-width="22" fill="none"/>'}
    return '<svg viewBox="0 0 160 92" class="k39g-svg" aria-hidden="true">'+segs+'<g class="k39g-ndl" id="'+id+'_n" style="transform-origin:80px 78px;transform:rotate(-90deg)"><path d="M78 78 L80 24 L82 78 Z" fill="#14231D"/></g><circle cx="80" cy="78" r="7" fill="#14231D"/><circle cx="80" cy="78" r="3" fill="#fff"/></svg>'}
  function lvl(x){var k=0;for(var i=0;i<LV.length;i++)if(x>=LV[i][0])k=i;return k}
  /* 1108B 第二輪（使用者看圖：「這樣有點醜喔」）：已經出價的列，儀表顯示「目前出價＋加碼」的總額（起點＝目前出價，拉桿不能低於它；
     底下數字框照舊只放加碼的差額，出價引擎是累加的）；右邊一格「出價總價值」＋加碼／撤回按鈕，不再浮在空白裡。 */
  function rate(){try{var m=/1\s*哩\s*=\s*NT\$\s*([\d.]+)/.exec(document.querySelector('.k929bd-note').textContent);if(m)return +m[1]}catch(_){}return 0.3}
  function mineOf(box){var bt=box.querySelector('button[onclick*="kgmBigDealBidUiR929"]');if(!bt)return null;var m=/kgmBigDealBidUiR929\('([^']*)','([^']*)','([^']*)'\)/.exec(bt.getAttribute('onclick')||'');if(!m)return null;
    try{return (S.bigDeals||[]).filter(function(b){return b&&b.pnr===m[1]&&b.segKey===m[2]&&b.toCabin===m[3]&&['open','leading','outbid'].indexOf(b.status)>=0}).slice(-1)[0]||null}catch(_){return null}}
  function money(u,v){return u==='c'?'NT$'+v.toLocaleString():v.toLocaleString()+(z()?' 哩':' mi')}
  function sum(box){var t=box.querySelector('.k39g-tot');if(!t)return;var g={};[].slice.call(box.querySelectorAll('.k39g')).forEach(function(w){g[w.getAttribute('data-u')]=+w.getAttribute('data-v')||0});
    var c=g.c||0,m=g.m||0,tot=Math.round(c+m*rate()),cur=+box.getAttribute('data-cur')||0;
    t.innerHTML='<i>'+(z()?'出價總價值':'Total bid value')+'</i><b>NT$'+tot.toLocaleString()+'</b><small>'+(c||m?((c?'NT$'+c.toLocaleString():'')+(c&&m?'＋':'')+(m?m.toLocaleString()+(z()?' 哩':' mi'):'')):(z()?'拉動左邊的拉桿出價':'Drag a slider to bid'))+'</small>'
      +(cur&&tot>cur?'<em>'+(z()?'比目前出價多 NT$':'+NT$')+(tot-cur).toLocaleString()+'</em>':'')
      +(function(){var oc=+box.getAttribute('data-open')||0;if(!oc||cur)return '';return '<em>'+(z()?'起標價 NT$':'Opening NT$')+oc.toLocaleString()+(tot?(z()?' · 現金＋里程合計已達起標':' · reached'):(z()?' · 現金、里程或兩者合計達到即可出價':' · cash, miles or both'))+'</em>'})()}
  /* 1112A C5（使用者：「bigdeal低於起標價無法競標所以最左邊要是起標價」「改採取總價值衡量 如果里程+現金有超過起標價就可以」）：
     拉桿最左邊＝還差多少才到起標價（以總價值算：另一支拉桿是 0 → 最左邊就是起標價；里程拉了 NT$3,300 → 現金最左邊 NT$3,300），
     兩支拉桿怎麼拉，總價值都不會低於起標價；已經出價的列照舊從目前出價起。指針與「偏低～極佳」看總價值對起標價。 */
  function sib(w){var box=w.closest('.k929bd-in');if(!box)return null;return [].slice.call(box.querySelectorAll('.k39g')).filter(function(x){return x!==w})[0]||null}
  function need40(w){var cur=+w.getAttribute('data-cur')||0;if(cur)return cur;var box=w.closest('.k929bd-in'),oc=+(box&&box.getAttribute('data-open'))||0,o=sib(w),R=rate();
    var ov=o?(+o.getAttribute('data-v')||0)*(o.getAttribute('data-u')==='m'?R:1):0,nt=Math.max(0,oc-ov);return w.getAttribute('data-u')==='m'?Math.ceil(nt/R/STP40.m)*STP40.m:Math.ceil(nt/STP40.c)*STP40.c}
  var STP40={c:100,m:500};   /* 拉桿刻度：現金 NT$100、里程 500 哩；最低值也落在刻度上（拉桿顯示的值＝實際出價，不會差一格） */
  function totV40(box){var c=0,m=0;[].slice.call(box.querySelectorAll('.k39g')).forEach(function(w){if(w.getAttribute('data-u')==='m')m=+w.getAttribute('data-v')||0;else c=+w.getAttribute('data-v')||0});return c+m*rate()}
  function paint40(box){var oc=+box.getAttribute('data-open')||1,tv=totV40(box),x=tv/oc,k=lvl(x),hi=(k+1<LV.length?LV[k+1][0]:2.6),fr=Math.min(1,(k+Math.max(0,Math.min(1,(x-LV[k][0])/Math.max(0.01,hi-LV[k][0]))))/LV.length),deg=tv?-90+fr*180:-90;
    [].slice.call(box.querySelectorAll('.k39g')).forEach(function(w){var u=w.getAttribute('data-u'),mn=need40(w),v=+w.getAttribute('data-v')||0,r=w.querySelector('input[type=range]'),base=+w.getAttribute('data-base')||0;
      if(r){r.min=String(mn);var rv=Math.max(mn,v);if(+r.value!==rv)r.value=rv}
      var sc=w.querySelector('.k39g-sc span');if(sc)sc.textContent=(+w.getAttribute('data-cur')?(z()?'目前 ':'Now '):(mn>=base?(z()?'起標 ':'Open '):(mn?(z()?'最低 ':'Min '):'')))+money(u,mn);
      var id=(w.parentNode.querySelector('input[type=number]')||{}).id,n=id&&document.getElementById(id+'_n');if(n)n.style.transform='rotate('+deg.toFixed(1)+'deg)';
      var t=w.querySelector('.k39g-lv');if(t){t.textContent=tv?(z()?LV[k][1]:LV[k][2]):(z()?'未出價':'No bid');t.style.color=tv?LV[k][3]:'#8A938F'}})}
  window.kgmBdGaugeR1108B=function(inpId,v){var inp=document.getElementById(inpId);if(!inp)return;var w=inp.closest('label').querySelector('.k39g');if(!w)return;var base=+w.getAttribute('data-base')||1,max=+w.getAttribute('data-max')||1,cur=+w.getAttribute('data-cur')||0,u=w.getAttribute('data-u');
    v=Math.min(max,Math.round(+v||0));if(v!==cur)v=Math.round(v/STP40[u==='m'?'m':'c'])*STP40[u==='m'?'m':'c'];v=(v<=0&&!cur)?0:Math.max(cur,need40(w),v);   /* 1112A C5：0＝這支沒用；有用就不能低於「還差多少到起標價」 */
    inp.value=v>cur?String(v-cur):'';w.setAttribute('data-v',v);var x=v/base,k=lvl(x),hi=(k+1<LV.length?LV[k+1][0]:max/base),fr=Math.min(1,(k+Math.max(0,Math.min(1,(x-LV[k][0])/Math.max(0.01,hi-LV[k][0]))))/LV.length),deg=-90+fr*180;   /* 指針落在跟文字同一色段 */
    var n=document.getElementById(inpId+'_n');if(n)n.style.transform='rotate('+deg.toFixed(1)+'deg)';var t=w.querySelector('.k39g-lv');if(t){t.textContent=v?(z()?LV[k][1]:LV[k][2]):(z()?'未出價':'No bid');t.style.color=v?LV[k][3]:'#8A938F'}
    var sub=w.querySelector('.k39g-sub');if(sub)sub.textContent=cur?(v>cur?((z()?'目前 ':'Now ')+money(u,cur)+(z()?'，加碼 ':', +')+money(u,v-cur)):(z()?'目前出價・往右拉加碼':'Current bid · drag right to raise')):'';
    var a=w.querySelector('.k39g-amt');if(a)a.textContent=v?money(u,v):'';var r=w.querySelector('input[type=range]');if(r&&+r.value!==v)r.value=v;var box=w.closest('.k929bd-in');if(box){sum(box);paint40(box)}};
  function deco(){try{[].slice.call(document.querySelectorAll('.k929bd-in')).forEach(function(box){if(box.getAttribute('data-k39g'))return;var row=box.closest('.k929bd-row');if(!row)return;
      var tx=String((row.querySelector('.k929bd-cab small')||{}).textContent||''),mc=/NT\$\s*([\d,]+)/.exec(tx),mm=/([\d,]+)\s*(哩|mi)/.exec(tx),oc=mc?+mc[1].replace(/,/g,''):0,om=mm?+mm[1].replace(/,/g,''):0;if(!oc&&!om)return;box.setAttribute('data-k39g','1');box.classList.add('k39g-box');
      var mine=mineOf(box),R=rate();box.setAttribute('data-open',oc||Math.round(om*R));if(mine)box.setAttribute('data-cur',Math.round((+mine.amount||0)+(+mine.miles||0)*R));
      [].slice.call(box.querySelectorAll('label')).forEach(function(lb){var inp=lb.querySelector('input[type=number]');if(!inp||!inp.id)return;var u=/_c$/.test(inp.id)?'c':(/_m$/.test(inp.id)?'m':'');if(!u)return;
        var cur=mine?Math.round(+(u==='c'?mine.amount:mine.miles)||0):0,base=u==='c'?(oc||1):(om||1),stp=STP40[u],max=Math.ceil(Math.max(base*2.6,cur*1.6)/stp)*stp;inp.classList.add('k39g-hid');
        var w=document.createElement('div');w.className='k39g';w.setAttribute('data-base',base);w.setAttribute('data-max',max);w.setAttribute('data-u',u);w.setAttribute('data-cur',cur);w.setAttribute('data-v',cur);
        w.innerHTML='<div class="k39g-hd"><b>'+(u==='c'?(z()?'現金':'Cash'):(z()?'里程':'Miles'))+'</b><span class="k39g-amt"></span></div>'+svg(inp.id)+'<div class="k39g-lv">'+(z()?'未出價':'No bid')+'</div><div class="k39g-sub"></div>'
          +'<input type="range" min="0" max="'+max+'" step="'+stp+'" value="'+cur+'" aria-label="'+(u==='c'?'cash':'miles')+'" oninput="kgmBdGaugeR1108B(\''+inp.id+'\',this.value)" onpointerup="kgmBdGaugeR1108B(\''+inp.id+'\',this.value)" onkeyup="kgmBdGaugeR1108B(\''+inp.id+'\',this.value)">'
          +'<div class="k39g-sc"><span>'+(z()?'起標 ':'Open ')+money(u,base)+'</span><span>'+(u==='c'?'NT$'+max.toLocaleString():max.toLocaleString())+'</span></div>';
        lb.insertBefore(w,inp);inp.addEventListener('input',function(){window.kgmBdGaugeR1108B(inp.id,cur+(+inp.value||0))});window.kgmBdGaugeR1108B(inp.id,cur+(+inp.value||0))});
      var act=document.createElement('div');act.className='k39g-act';act.innerHTML='<div class="k39g-tot"></div>';[].slice.call(box.children).filter(function(c){return c.classList&&c.classList.contains('btn')}).forEach(function(bt){act.appendChild(bt)});box.appendChild(act);sum(box);paint40(box)})}catch(e){try{console.warn('bd39 gauge',e)}catch(_){}}}
  setInterval(deco,400);
  try{var cs=document.createElement('style');cs.textContent='.k929bd-row:has(.k39g-box){grid-template-columns:minmax(150px,1fr) minmax(260px,1.4fr)!important}.k929bd-in.k39g-box{grid-column:1/-1;display:grid!important;grid-template-columns:minmax(220px,1fr) minmax(220px,1fr) minmax(200px,240px);gap:14px;align-items:stretch;margin-top:6px}.k39g-act{display:flex;flex-direction:column;gap:10px;background:#0B3D2E;border-radius:16px;padding:16px;color:#fff}.k39g-act .btn{width:100%;height:42px;white-space:nowrap;margin:0}.k39g-act .btn:not(.btn-g){background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}.k39g-act .btn-g{background:#C9A24A;border-color:#C9A24A;color:#14231D}.k39g-tot{flex:1;display:flex;flex-direction:column;gap:3px}.k39g-tot i{font-style:normal;font-size:11px;letter-spacing:.08em;color:#BFD3CA}.k39g-tot b{font:800 26px system-ui,sans-serif;color:#fff}.k39g-tot small{font-size:12px;color:#DCE7E2}.k39g-tot em{font-style:normal;font-size:12px;color:#F1D58A;margin-top:2px}.k39g-sub{font-size:11.5px;color:#6B7A72;min-height:16px;margin:-4px 0 4px;text-align:center}.k929bd>header em{display:inline-block;margin-right:12px}.k929bd-in.k39g-box>label{display:flex;flex-direction:column;gap:6px;font-size:0}'
    +'.k39g{background:#fff;border:1px solid #E1E8E4;border-radius:16px;padding:12px 14px 10px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:13px}.k39g-hd{width:100%;display:flex;justify-content:space-between;align-items:baseline}.k39g-hd b{color:#0B3D2E;font-size:13px}.k39g-amt{font:700 15px system-ui,sans-serif;color:#14231D}'
    +'.k39g-svg{width:170px;height:98px}.k39g-ndl{transition:transform .25s ease}.k39g-lv{font:700 16px system-ui,sans-serif;margin:-2px 0 6px}'
    +'.k39g input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:12px;border-radius:999px;background:#E3E1E2;outline:none;margin:4px 0}.k39g input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:34px;border-radius:9px;background:#4E7A68;cursor:pointer;border:0}.k39g input[type=range]::-moz-range-thumb{width:30px;height:34px;border-radius:9px;background:#4E7A68;cursor:pointer;border:0}'
    +'.k39g-sc{width:100%;display:flex;justify-content:space-between;font-size:10.5px;color:#8A938F;margin-top:10px}.k39g-sc span:first-child{color:#4E7A68;font-weight:700}.k39g-hid{display:none!important}@media(max-width:760px){.k929bd-in.k39g-box{grid-template-columns:1fr}}';document.head.appendChild(cs)}catch(_){}
})();
/* ══ 1112A C5（使用者：「團體定位無法bigdeal喔」「Available Seats and 競標人數要正確的mock and show喔」）══
   ① 團體訂位（G 艙，含拆出去的其他艙旅客）不能 BigDeal：行程管理／BigDeal 頁不出出價卡、出價引擎直接擋；BigDeal 頁「即將開放」寫「團體票不適用」。
   ② 艙等已經沒有可售座位（Available Seats 0）就不拿出來競標：原本照樣列出、模擬出價者也是 0 位 → 畫面「0／0」。
      這位會員在這一艙還有出價中的，照舊列出（讓他看得到結果、可以撤回）。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function isGrp(b){try{if(!b)return false;if(b.groupR1025B)return true;return [b.outC,b.inbC].some(function(c){var f=c&&FARES[c];return !!(f&&f.groupPlanR1026C)||/^[EPB]-G$/.test(String(c||''))})}catch(_){return false}}
  window.kgmBdIsGroupR1112A=isGrp;
  function hook(){var ok=0;
    var T0=window.kgmBigDealTargetsR929;if(typeof T0==='function'){if(!T0.__c540){var tw=function(f,date,fromCab,all){var L=T0.apply(this,arguments)||[];if(!Array.isArray(L))return L;
        return L.filter(function(t){if((+t.seats||0)>0)return true;try{var uid=S.user&&S.user.id;return !!uid&&(S.bigDeals||[]).some(function(b){return b&&b.userId===uid&&!b.demoR922&&b.code===f.code&&b.date===date&&(b.toCabin||b.cabin)===t.cab&&/open|leading|outbid|pending/.test(String(b.status||''))})}catch(_){return false}})};
      tw.__c540=1;window.kgmBigDealTargetsR929=tw}ok++}
    var H0=window.kgmBigDealTripHtmlR929;if(typeof H0==='function'){if(!H0.__c540){var hw=function(b){if(isGrp(b))return '';return H0.apply(this,arguments)};hw.__c540=1;window.kgmBigDealTripHtmlR929=hw}ok++}
    var P0=window.kgmBigDealPlaceR929;if(typeof P0==='function'){if(!P0.__c540){var pw=function(pnr){try{var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(isGrp(b))return {ok:false,why:z()?'團體訂位不適用 BigDeal':'Group bookings are not eligible for BigDeal'}}catch(_){}return P0.apply(this,arguments)};pw.__c540=1;window.kgmBigDealPlaceR929=pw}ok++}
    return ok===3}
  if(!hook()){var n=0,t=setInterval(function(){if(hook()||++n>60)clearInterval(t)},500)}
  setTimeout(hook,3000);setTimeout(hook,12000);
})();
/* ══ 1112A C9（使用者：「Residence競標一樣要選擇若有競標上要付款的差價要用同一張卡還是額外」）══
   Residence 現金出價視窗（訂位流程 k161）原本寫死「得標差額直接用這次訂位付款的同一張卡」→ 加一格選擇：
   「同一張卡（這次訂位付款的卡）」／「另一張信用卡」；另一張卡用付款頁同一個卡片表單（卡號、有效期限、安全碼 CVV、持卡人），
   缺一不能送出。存在出價紀錄 bid.diffCardR1112A（只存末四碼、有效期限、持卡人；安全碼只驗證不存，跟付款頁一樣）。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var ST=window.__k40rc=window.__k40rc||{mode:'same',cvv:''};
  var IDS={num:'k40rcNum',name:'k40rcName',expM:'k40rcM',expY:'k40rcY',exp:'k40rcExp',cvv:'k40rcCvv'};
  function vals(){var v=function(k){return String((document.getElementById(IDS[k])||{}).value||'').trim()};var m=v('expM'),y=v('expY');return {num:v('num').replace(/\s/g,''),exp:(m&&y)?(m+'/'+y):v('exp'),cvv:v('cvv'),name:v('name')}}
  function bad(c){var zh=z(),m=[];if(!/^\d{13,19}$/.test(c.num))m.push(zh?'卡號':'card number');if(!/^\d{2}\/\d{2}$/.test(c.exp))m.push(zh?'有效期限（月／年）':'expiry');if(!/^\d{3,4}$/.test(c.cvv))m.push(zh?'安全碼 CVV':'CVV');if(!c.name)m.push(zh?'持卡人姓名':'name on card');return m}
  function boxHtml(){var zh=z(),o=ST.mode==='other',form='';
    if(o){try{form=kgmCardFormR923({key:'resdiff',ids:IDS,contact:false,ssl:zh?'只在得標、需要補差額時扣款；安全碼只用來驗證，不會儲存。':'Charged only if you win; CVV is not stored.'})}catch(_){form=''}
      form=form.replace('id="'+IDS.cvv+'"','id="'+IDS.cvv+'" value="'+E(ST.cvv||'')+'"')}
    return '<div class="k40rc"><b>'+(zh?'得標後要補的差額，用哪一張卡扣款？':'If you win, charge the difference to')+'</b>'
      +'<div class="k40rc-opt"><label><input type="radio" name="k40rc" value="same"'+(o?'':' checked')+' onchange="kgmResDiffModeR1112A(\'same\')"> '+(zh?'同一張卡（這次訂位付款的卡）':'The card used for this booking')+'</label>'
      +'<label><input type="radio" name="k40rc" value="other"'+(o?' checked':'')+' onchange="kgmResDiffModeR1112A(\'other\')"> '+(zh?'另一張信用卡':'Another card')+'</label></div>'
      +(o?'<div class="k40rc-card">'+form+'</div>':'')+'</div>'}
  function inject(force){try{var amt=document.getElementById('k161amt');if(!amt)return;var old=document.querySelector('.k40rc');if(old&&!force)return;
      var p=document.querySelector('.k923-rescard');if(p&&!p.getAttribute('data-k40')){p.setAttribute('data-k40','1');p.innerHTML=p.innerHTML.replace(/並且<b>直接用這次訂位付款的同一張卡<\/b>，不需要另外輸入卡片資料。/,'差額依下面選的卡扣款（同一張卡或另一張卡）。').replace(/on the same card[^.]*\./,'on the card you choose below.')}
      var d=document.createElement('div');d.innerHTML=boxHtml();var nb=d.firstChild;
      if(old)old.parentNode.replaceChild(nb,old);else if(p&&p.parentNode)p.parentNode.insertBefore(nb,p.nextSibling);else{var sec=amt.closest('section')||amt.parentNode;sec.appendChild(nb)}
      try{if(ST.mode==='other'&&window.kgmCardLiveR923)window.kgmCardLiveR923('resdiff')}catch(_){}}catch(_){}}
  window.kgmResDiffModeR1112A=function(m){ST.mode=m==='other'?'other':'same';inject(true)};
  document.addEventListener('input',function(e){var t=e.target;if(t&&t.id===IDS.cvv)ST.cvv=t.value},true);
  setInterval(function(){inject(false)},400);
  function hook(){var O=window.kgmResCashSubmitR161;if(typeof O!=='function')return false;if(O.__c940)return true;
    var w=function(){var zh=z(),m=null;try{m=S.resModalR161}catch(_){}var card=null;
      if(ST.mode==='other'&&document.getElementById('k161amt')){var c=vals(),b=bad(c);if(b.length){alert((zh?'得標差額要扣的另一張信用卡還差：':'Card for the difference is missing: ')+b.join(zh?'、':', '));return}
        card={mode:'other',last4:c.num.slice(-4),exp:c.exp,holder:c.name.toUpperCase(),cvvOkR1112A:1}}else card={mode:'same'};
      var seg=m&&m.seg==='inb'?'inb':'out',before=(S.resBidSegR923||{})[seg];
      var A0=window.alert;if(card.mode==='other')window.alert=function(t){return A0.call(window,String(t).replace('，使用本次訂位付款的同一張卡','，使用另一張信用卡（末四碼 '+card.last4+'）').replace(' on the same card',' on card ••'+card.last4))};
      var r;try{r=O.apply(this,arguments)}finally{window.alert=A0}
      try{var id=(S.resBidSegR923||{})[seg];if(id&&id!==before){var bd=(S.residenceBidsR83||[]).filter(function(x){return x&&x.id===id})[0];if(bd){bd.diffCardR1112A=card;ST.cvv='';try{window.__kgmCardDraft928&&(window.__kgmCardDraft928.resdiff={})}catch(_){}try{save()}catch(_){}}}}catch(_){}
      return r};w.__c940=1;window.kgmResCashSubmitR161=w;return true}
  if(!hook()){var n=0,t=setInterval(function(){if(hook()||++n>60)clearInterval(t)},500)}setTimeout(hook,3000);setTimeout(hook,12000);
  window.kgmResDiffCardTxtR1112A=function(b){var c=b&&b.diffCardR1112A,zh=z();if(!c)return zh?'同一張卡（訂位付款卡）':'Booking card';return c.mode==='other'?((zh?'另一張卡 •••• ':'Card •••• ')+c.last4+(c.exp?' · '+c.exp:'')):(zh?'同一張卡（訂位付款卡）':'Booking card')};
  try{var cs=document.createElement('style');cs.textContent='.k40rc{margin:12px 0;padding:12px 14px;border:1px solid #E1D6BC;background:#FFFCF4;border-radius:12px}.k40rc>b{display:block;font-size:13px;color:#4A3B12;margin-bottom:8px}.k40rc-opt{display:flex;gap:18px;flex-wrap:wrap}.k40rc-opt label{display:flex!important;flex-direction:row!important;gap:8px;align-items:center!important;font-size:13px;color:#14231D;cursor:pointer;margin:0!important}.k40rc-opt input[type=radio]{width:16px!important;height:16px!important;margin:0!important;flex:none}.k40rc-card{margin-top:10px}';document.head.appendChild(cs)}catch(_){}
})();

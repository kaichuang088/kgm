/* ══ 1004A：後台通用 AI（Claude Opus 5.5）═════════════════════════════════════
   使用者：「一但AI到後台也要可以協助處理後台事物，例如：調整某航線某日期區間的票價、Apply Special Rule：第一段台灣出發的航班比較貴」
           「前台的對話存在前台、後台的存在後台」「後台AI應該要用Claude的Symbol」「介面一樣」
           「把舊的組員排班 AI 拿掉，換成這個 General AI，它有權限直接調整」「處理中要顯示思考中」
           「客服人員要調動票價此類的一樣寫無權限，只有有權限的人才可以調整」「That AI must be able to directly edit EVERYTHING, and it is Opus 5.5.」
   作法：
   · 介面跟前台 KGM AI 同一個版型（右下角圓鈕＋對話視窗），但圖示是 Claude 的放射狀標誌、標題註明 Claude Opus 5.5；
     只在管理後台出現；對話依員工編號存在 localStorage 'kgm_adminai929'，跟前台的對話完全分開。
   · 先把需求送到 Worker 的 /ai/admin（Worker 轉給 Anthropic，模型 claude-opus-5-5，失敗再用 claude-sonnet-5-5），
     模型回傳要執行的工具與參數；連不上 Worker 時，改用站內規則引擎解析中文指令（回覆裡會老實註明）。
   · 每一個工具都對應一個後台分頁權限（kgmPermR123）：沒有「使用」權限就回覆「無權限」，不會執行。
     「直接修改任何資料」（set_state）只開放系統人員與 CEO。 */
(function adminAiR929(){
  var MODEL='claude-opus-5-5',MODEL2='claude-sonnet-5-5';
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function N(n){return Math.round(+n||0).toLocaleString('en-US')}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function me(){return S.adminUser||{}}
  function roleOf(){var r=String(me().role||'').toLowerCase();if(me().empId==='MASTER')return 'ceo';return r}
  function roleZh(){try{return (ROLE_ZH&&ROLE_ZH[roleOf()])||roleOf()}catch(_){return roleOf()}}
  function can(tab){try{if(roleOf()==='ceo')return true;if(typeof window.kgmPermR123==='function')return window.kgmPermR123(tab)==='use'}catch(_){}return false}
  function store(){if(!S.adminAiR929){try{S.adminAiR929=LS.get('kgm_adminai929',{})||{}}catch(_){S.adminAiR929={}}}return S.adminAiR929}
  function chat(){var s=store(),k=me().empId||'ADMIN';s[k]=s[k]||[];return s[k]}
  function persist(){try{LS.set('kgm_adminai929',store())}catch(_){}}
  /* 特殊連假（後台加的）也要存起來 */
  try{var hs=LS.get('kgm_holiday929',[])||[];hs.forEach(function(h){if(h&&h.c&&!(window.KGM_HOLIDAYS_R929||[]).some(function(x){return x.c===h.c&&x.from===h.from&&x.to===h.to}))window.KGM_HOLIDAYS_R929.push(h)})}catch(_){}
  /* ── 解析輔助 ── */
  var CITY={'台北':'TPE','臺北':'TPE','桃園':'TPE','松山':'TSA','東京':'NRT,HND','成田':'NRT','羽田':'HND','大阪':'KIX,ITM','關西':'KIX','名古屋':'NGO','福岡':'FUK','札幌':'CTS','沖繩':'OKA','那霸':'OKA','首爾':'ICN,GMP','仁川':'ICN','釜山':'PUS','香港':'HKG','澳門':'MFM','上海':'PVG,SHA','北京':'PEK,PKX','曼谷':'BKK','新加坡':'SIN','吉隆坡':'KUL','胡志明':'SGN','河內':'HAN','馬尼拉':'MNL','峇里島':'DPS','洛杉磯':'LAX','舊金山':'SFO','西雅圖':'SEA','紐約':'JFK','溫哥華':'YVR','多倫多':'YYZ','休士頓':'IAH','拉斯維加斯':'LAS','倫敦':'LHR','巴黎':'CDG','法蘭克福':'FRA','阿姆斯特丹':'AMS','慕尼黑':'MUC','維也納':'VIE','羅馬':'FCO','雪梨':'SYD','墨爾本':'MEL','奧克蘭':'AKL','杜拜':'DXB'};
  var CTRY={'台灣':'TW','臺灣':'TW','日本':'JP','韓國':'KR','南韓':'KR','中國':'CN','大陸':'CN','香港':'HK','澳門':'MO'};
  var CAB={'經濟':'Economy','豪經':'Premium','豪華經濟':'Premium','商務':'Business','頭等':'First','Residence':'Resident'};
  function norm(t){return String(t||'').replace(/[０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-65248)}).replace(/[～〜]/g,'~').replace(/[－—–]/g,'-').replace(/％/g,'%').replace(/，/g,',')}
  function dateOf(s){var y=+T().slice(0,4),m;
    if((m=/(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/.exec(s)))return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
    if((m=/(\d{1,2})\s*[\/月]\s*(\d{1,2})/.exec(s))){var d=y+'-'+('0'+m[1]).slice(-2)+'-'+('0'+m[2]).slice(-2);if(d<T())d=(y+1)+d.slice(4);return d}return ''}
  function rangeOf(t){
    var re=/((?:\d{4}[-\/.])?\d{1,2}[-\/.月]\d{1,2}日?)\s*(?:~|-|到|至|–)\s*((?:\d{4}[-\/.])?\d{1,2}[-\/.月]\d{1,2}日?)/,m=re.exec(t);
    if(m){var a=dateOf(m[1]),b=dateOf(m[2]);if(b&&a&&b<a&&!/\d{4}/.test(m[2]))b=(+b.slice(0,4)+1)+b.slice(4);return {from:a,to:b}}
    var one=dateOf(t);return one?{from:one,to:one}:{from:'',to:''};
  }
  function apsOf(t){var out=[],u=t.toUpperCase(),m,re=/\b([A-Z]{3})\b/g;while((m=re.exec(u))){try{if(typeof CITY_ZH!=='undefined'&&CITY_ZH[m[1]]&&out.indexOf(m[1])<0)out.push(m[1])}catch(_){}}
    /* 一個城市可能有兩座機場（東京＝成田＋羽田、首爾＝仁川＋金浦…），兩座都算 */
    Object.keys(CITY).forEach(function(k){var i=t.indexOf(k);if(i>=0)CITY[k].split(',').forEach(function(c,j){out.push({i:i+j/10,c:c})})});
    var codes=out.filter(function(x){return typeof x==='string'}),named=[];out.filter(function(x){return typeof x!=='string'}).sort(function(a,b){return a.i-b.i}).forEach(function(x){if(named.indexOf(x.c)<0)named.push(x.c)});
    return codes.length?codes:named}
  function ctryOf(t){var hit=[];Object.keys(CTRY).forEach(function(k){var i=t.indexOf(k);if(i>=0)hit.push({i:i,c:CTRY[k]})});return hit.sort(function(a,b){return a.i-b.i}).map(function(x){return x.c})}
  function cabOf(t){var c='';Object.keys(CAB).forEach(function(k){if(t.indexOf(k)>=0&&!c)c=CAB[k]});return c}
  function mulOf(t){
    var m=/打\s*(\d(?:\.\d)?)\s*折/.exec(t);if(m){var v=+m[1];return v<10?v/10:v/100}
    m=/(\d+(?:\.\d+)?)\s*%/.exec(t);if(!m)m=/(\d+(?:\.\d+)?)\s*(?:成)/.exec(t)&&{1:+/(\d+(?:\.\d+)?)\s*成/.exec(t)[1]*10};
    if(!m)return 0;var p=+m[1]/100;
    if(/降|減|便宜|折扣|少|下調|調低|dis/i.test(t))return Math.max(0.05,1-p);
    return 1+p;
  }
  /* ── 工具 ── */
  var TOOLS={
    fare_rule_add:{tab:'price',zh:'新增特殊票價規則',run:function(a){
      var r={id:'FR'+Date.now().toString(36).toUpperCase(),fr:a.fr||'',toAp:a.toAp||'',from:a.from||'',to:a.to||'',cabin:a.cabin||'',code:a.code||'',mul:+a.mul||1,firstSegOnly:!!a.firstSegOnly,note:a.note||'',by:me().empId||'',at:new Date().toISOString()};
      if(!(r.mul>0)||r.mul===1)return {ok:false,msg:z()?'沒有讀到要調整的幅度（例如「漲 15%」「打 9 折」）。':'No adjustment found.'};
      S.fareRulesR929=S.fareRulesR929||[];S.fareRulesR929.push(r);try{save()}catch(_){}
      return {ok:true,msg:(z()?'已套用規則 ':'Rule added ')+r.id+'：'+ruleTxt(r)}}},
    fare_rule_list:{tab:'price',view:true,zh:'列出特殊票價規則',run:function(){
      var l=(S.fareRulesR929||[]).filter(function(r){return r&&!r.off});
      return {ok:true,msg:l.length?l.map(function(r){return r.id+'　'+ruleTxt(r)}).join('\n'):(z()?'目前沒有特殊票價規則。':'No rules.')}}},
    fare_rule_remove:{tab:'price',zh:'刪除特殊票價規則',run:function(a){
      var l=S.fareRulesR929||[],n=0;l.forEach(function(r){if(r&&!r.off&&(a.all||String(r.id).toUpperCase()===String(a.id||'').toUpperCase())){r.off=true;r.offBy=me().empId;n++}});try{save()}catch(_){}
      return {ok:n>0,msg:n?((z()?'已停用 ':'Removed ')+n+(z()?' 條規則。':' rule(s).')):(z()?'找不到這條規則。':'Rule not found.')}}},
    price_override:{tab:'price',zh:'艙等／航線倍率',run:function(a){
      S.priceOverrides=S.priceOverrides||{};var k=a.scope==='route'?(a.fr+a.to+a.cabin):('global_'+a.cabin);S.priceOverrides[k]=+a.mul||1;try{save()}catch(_){}
      return {ok:true,msg:(z()?'已設定倍率 ':'Multiplier set ')+k+' × '+(+a.mul).toFixed(2)}}},
    holiday_add:{tab:'price',zh:'新增方向性連假',run:function(a){
      var h={c:a.c,from:a.from,to:a.to,zh:a.zh||'連假',mul:a.mul?+a.mul:undefined,byAi:true};if(!h.c||!h.from||!h.to)return {ok:false,msg:z()?'連假需要國家與起訖日期。':'Need country and dates.'};
      window.KGM_HOLIDAYS_R929.push(h);try{var hs=LS.get('kgm_holiday929',[])||[];hs.push(h);LS.set('kgm_holiday929',hs)}catch(_){}try{window.KGM_RM_MEMO_R929&&(window.KGM_RM_MEMO_R929={})}catch(_){}
      return {ok:true,msg:(z()?'已新增連假：':'Holiday added: ')+h.c+' '+h.from+'～'+h.to+'（'+h.zh+'）；從該國出發的第一天、回到該國的最後一天自動加價。'}}},
    seat_inventory:{tab:'price',zh:'開放／關閉訂位艙等座位',run:function(a){
      S.seatInventory=S.seatInventory||{};var k=a.code+'_'+a.date+'_'+a.fare;S.seatInventory[k]=Math.max(0,+a.seats||0);try{save()}catch(_){}
      return {ok:true,msg:(z()?'已設定 ':'Set ')+a.code+' '+a.date+' '+a.fare+(z()?' 可售 ':' seats ')+S.seatInventory[k]}}},
    aircraft_swap:{tab:'fleetsched',zh:'換機',run:function(a){
      var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===a.code&&!x.partner})[0];if(!f)return {ok:false,msg:z()?'找不到這個班號。':'Flight not found.'};
      if(!AC[a.type])return {ok:false,msg:(z()?'沒有這個機型：':'Unknown type: ')+a.type};
      S.acftSub=S.acftSub||{};S.acftSub[a.code+'_'+a.date]={code:a.code,date:a.date,route:f.fr+'→'+f.to,orig:f.acft,sub:a.type,manual:true,auto:false,by:me().empId||'AI',reason:'後台 AI',at:new Date().toISOString()};
      try{if(typeof window.kgmClearRotationCacheR72==='function')window.kgmClearRotationCacheR72()}catch(_){}try{save()}catch(_){}
      return {ok:true,msg:(z()?'已將 ':'Swapped ')+a.code+' '+a.date+(z()?' 換成 ':' to ')+a.type+(z()?'（機隊排班會在背景重算）':'')}}},
    crew_swap:{tab:'sched',zh:'組員換班',run:function(a){return crewSwap(a)}},
    crew_swap_approve:{tab:'sched',zh:'核准換班',run:function(){
      var r=S.crewAiR928;if(!r||!r.ok||r.approved)return {ok:false,msg:z()?'目前沒有可以核准的換班方案。':'Nothing to approve.'};
      try{window.kgmCrewAiApproveR928()}catch(e){return {ok:false,msg:String(e.message||e)}}return {ok:true,msg:(z()?'已核准：':'Approved: ')+r.X.name+' ⇄ '+r.Y.name+' '+r.date+(z()?'，班表重排並通知相關組員。':'')}}},
    news_post:{tab:'news_r49',zh:'發布新聞',run:function(a){
      S.r49=S.r49||{};S.r49.news=S.r49.news||[];S.r49.news.unshift({id:'AI'+Date.now().toString(36),tag:a.tag||'公告',date:T(),title:a.title||'KGM 公告',summary:(a.body||'').slice(0,80),body:a.body||'',published:true,byAi:me().empId||''});try{save()}catch(_){}
      return {ok:true,msg:(z()?'已發布：':'Published: ')+(a.title||'')}}},
    coupon_create:{tab:'coupons',zh:'建立優惠碼',run:function(a){
      S.coupons=S.coupons||[];if(S.coupons.some(function(c){return c.code===a.code}))return {ok:false,msg:z()?'優惠碼已存在。':'Exists.'};
      S.coupons.unshift({code:a.code,type:a.type||'percent',value:+a.value||10,minSegs:0,tier:'all',expiry:a.expiry||null,maxUses:0,usedCount:0,sectors:[],active:true,created:T()});try{save()}catch(_){}
      return {ok:true,msg:(z()?'已建立優惠碼 ':'Coupon ')+a.code+'（'+(a.type==='fixed'?'折 NT$'+N(a.value):'折 '+a.value+'%')+(a.expiry?'，到 '+a.expiry:'')+'）'}}},
    member_suspend:{tab:'members',zh:'會員停權／恢復',run:function(a){
      var u=(S.users||[]).filter(function(x){return x&&String(x.id).toUpperCase()===String(a.id).toUpperCase()})[0];if(!u)return {ok:false,msg:z()?'找不到這個會員。':'Member not found.'};
      u.suspended=!!a.on;u.suspendedAt=a.on?new Date().toISOString():'';u.suspendedBy=me().empId||'';try{save()}catch(_){}
      return {ok:true,msg:(a.on?(z()?'已停權 ':'Suspended '):(z()?'已恢復 ':'Restored '))+u.id+' '+(u.name||'')}}},
    bigdeal_settle:{tab:'auctions',zh:'BigDeal 結標',run:function(a){
      if(typeof window.kgmBigDealSettleR929!=='function')return {ok:false,msg:'—'};var f=[].concat(FLIGHTS).filter(function(x){return x&&x.code===a.code&&!x.via})[0]||{};
      var r=window.kgmBigDealSettleR929(a.code,a.date,f.fr,f.to,a.cabin||'Business');return {ok:true,msg:(z()?'已結標：得標 ':'Settled: won ')+r.won+' / '+r.total}}},
    set_state:{tab:'syscfg',sys:true,zh:'直接修改資料',run:function(a){
      var p=String(a.path||'').replace(/^S\./,'').split('.').filter(Boolean);if(!p.length)return {ok:false,msg:'path'};
      var o=S;for(var i=0;i<p.length-1;i++){if(o[p[i]]==null||typeof o[p[i]]!=='object')o[p[i]]={};o=o[p[i]]}
      var old=o[p[p.length-1]];o[p[p.length-1]]=a.value;try{save()}catch(_){}try{logAct('後台 AI 直接修改','S.'+p.join('.'))}catch(_){}
      return {ok:true,msg:'S.'+p.join('.')+' ＝ '+JSON.stringify(a.value)+'（'+(z()?'原本 ':'was ')+JSON.stringify(old)+'）'}}}
  };
  function ruleTxt(r){var cz={Economy:'經濟艙',Premium:'豪經',Business:'商務艙',First:'頭等艙'};
    return (r.fr||'任何地點')+' → '+(r.toAp||'任何地點')+(r.code?(' '+r.code):'')+(r.cabin?(' '+(cz[r.cabin]||r.cabin)):'')+(r.from?(' '+r.from+'～'+(r.to||r.from)):' 不限日期')
      +(r.firstSegOnly?' · 只套第一段':'')+'　×'+(+r.mul).toFixed(2)+'（'+((r.mul>=1?'+':'')+Math.round((r.mul-1)*100))+'%）'}
  window.kgmFareRuleTxtR929=ruleTxt;
  /* 票價管理分頁：列出特殊票價規則（後台 AI 或手動新增的），有「使用」權限的人可以直接停用 */
  window.kgmFareRuleSecR929=function(){
    var l=(S.fareRulesR929||[]).filter(function(r){return r&&!r.off}),ok=can('price');
    return '<section class="adm-card k929-frs"><div class="adm-sec">'+(z()?'特殊票價規則':'Special fare rules')+'<small>'+(z()?'　航線／國家 × 日期區間 × 艙等的倍率，疊在營收管理價格上；方向性連假另計':'')+'</small></div>'
      +(l.length?'<table class="adm-tbl"><thead><tr><th>ID</th><th>'+(z()?'規則':'Rule')+'</th><th>'+(z()?'建立':'By')+'</th><th></th></tr></thead><tbody>'+l.map(function(r){
        return '<tr><td><code>'+E(r.id)+'</code></td><td>'+E(ruleTxt(r))+(r.note?'<div class="k929-frs-n">'+E(r.note)+'</div>':'')+'</td><td>'+E(r.by||'')+'<div class="k929-frs-n">'+E(String(r.at||'').replace('T',' ').slice(0,16))+'</div></td><td>'
          +(ok?'<button class="btn btn-sm" onclick="kgmFareRuleOffR929(\''+E(r.id)+'\')">'+(z()?'停用':'Remove')+'</button>':'<span class="k929-frs-n">'+(z()?'僅檢視':'View only')+'</span>')+'</td></tr>'}).join('')+'</tbody></table>'
        :'<p class="k929-frs-n">'+(z()?'目前沒有特殊票價規則。':'No special rules.')+'</p>')
      +(ok?'<button class="btn btn-g btn-sm" onclick="kgmAdminAiOpenR929(\'TPE-NRT 10/1~10/10 經濟艙漲 15%\')">'+(z()?'用後台 AI 新增規則':'Add with Admin AI')+'</button>':'')+'</section>'};
  window.kgmFareRuleOffR929=function(id){if(!can('price')){alert(z()?'無權限':'No permission');return}var r=exec([{tool:'fare_rule_remove',args:{id:id}}]).out[0];try{render()}catch(_){}if(r&&!r.ok)alert(r.msg)};
  /* ── 組員換班：先列出至少三位候選，再用排班引擎模擬第一位（或指定的第 n 位） ── */
  function crewSwap(a){
    try{
      /* 組員來源跟舊的換班引擎一樣：排班池（kgmCrewPoolR121）＋ S.staff 裡的真人組員 */
      var t=String(a.text||''),ids=[],m,re=/\b([A-Z]\d{5,6})\b/g,st={};
      try{var PL=window.kgmCrewPoolR121();(PL.pilots||[]).concat(PL.cabin||[]).forEach(function(x){if(x&&x.empId)st[x.empId]=x})}catch(_){}
      (S.staff||[]).forEach(function(x){if(x&&x.empId&&(x.role==='pilot'||x.role==='cabin'))st[x.empId]=x});
      while((m=re.exec(t.toUpperCase()))){if(st[m[1]]&&ids.indexOf(m[1])<0)ids.push(m[1])}
      var date=dateOf(t);if(!ids.length)return {ok:false,msg:z()?'請寫出組員員工編號（例如 K60012）。':'Need an employee ID.'};if(!date)return {ok:false,msg:z()?'請寫出日期（例如 10/12）。':'Need a date.'};
      var X=ids[0],p=null;try{p=window.kgmCrewPlanR121(date)}catch(_){}
      var dx=null;((p&&p.flights)||[]).some(function(f){var q=(f.pilots||[]).concat(f.cabin||[]).filter(function(y){return y&&y.empId===X})[0];if(q){dx={f:f,q:q};return true}});
      if(!dx)return {ok:false,msg:(st[X].name||X)+' '+date+(z()?' 沒有排到航班。':' has no duty.')};
      var Y=ids[1]||'',cands=[];if(Y)S.adminAiSwapCandsR929=null;
      if(!Y){
        var aps=apsOf(t),code=(/\bKX\s?(\d{1,4})\b/i.exec(t)||[])[1],fam=function(x){try{return window.kgmTypeFamilyR121(x)}catch(_){return x}},rk=function(q){return q.rankCode||q.rank||''};
        ((p&&p.flights)||[]).forEach(function(f){
          if(f.code===dx.f.code)return;
          if(!(code&&f.code==='KX'+code)&&!(aps.length&&(aps.indexOf(f.to)>=0||aps.indexOf(f.fr)>=0)))return;
          if(fam(f.type)!==fam(dx.f.type))return;
          try{if(!window.kgmSameCityR928(f.fr,dx.f.fr))return}catch(_){}
          var list=(st[X].role==='pilot')?(f.pilots||[]):(f.cabin||[]);
          list.forEach(function(q){if(q&&q.empId&&st[q.empId]&&rk(q)===rk(dx.q)&&!cands.some(function(c){return c.id===q.empId}))cands.push({id:q.empId,name:st[q.empId].name,f:f})});
        });
        if(!cands.length)return {ok:false,msg:z()?('找不到可以對調的人：'+date+' 符合的航班上沒有同機型族、同階級、同一站出發的組員。'):'No candidate.'};
        /* 排序：整趟對調才合法，所以先挑「接下來三天有沒有飛」跟對方一樣的人（例如對方是過夜班，就找也是過夜班的），再把不同航班的人錯開排 */
        try{
          var AD=function(d,k){var x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+k);return x.toISOString().slice(0,10)};
          var bz=[1,2,3].map(function(k){var pp=null;try{pp=window.kgmCrewPlanR121(AD(date,k))}catch(_){}var o={};((pp&&pp.flights)||[]).forEach(function(f){(f.pilots||[]).concat(f.cabin||[]).forEach(function(q){if(q&&q.empId)o[q.empId]=1})});return o});
          var seen={};cands.forEach(function(c,i){c.i=i;c.sc=bz.reduce(function(n,o){return n+((!!o[X])!==(!!o[c.id])?1:0)},0);c.o=seen[c.f.code]=(seen[c.f.code]||0)+1});
          /* 休息時間：排班是一個接一個緊排的，每個人最早可報到的時間（上一班落地＋30 分＋最低休息）通常就貼著自己原本那班。
             對調後被換到「比較早」那班的人一定要休息夠，否則引擎一定排不上（實測 0928B 的換班幾乎全部因此失敗）。
             這裡先用前四天的班表算出兩人的可報到時間，休息不夠的候選直接排除。 */
          var readyOf=function(id){for(var k=1;k<=4;k++){var pp=null;try{pp=window.kgmCrewPlanR121(AD(date,-k))}catch(_){}var mx=0;((pp&&pp.flights)||[]).forEach(function(f){if((f.pilots||[]).concat(f.cabin||[]).some(function(q){return q&&q.empId===id}))mx=Math.max(mx,(+f.arrUTC||0)+30+(+f.minimumRestMinutes||720))});if(mx)return mx}return 0};
          var rX=readyOf(X),okRest=cands.filter(function(c){var rY=readyOf(c.id);return rY<=(+dx.f.depUTC||0)-60&&rX<=(+c.f.depUTC||0)-60});
          var dropped=cands.length-okRest.length;if(okRest.length){cands=okRest;if(dropped)S.adminAiRestDropR929=dropped}
          cands.sort(function(a,b){return (a.sc-b.sc)||(a.o-b.o)||(a.i-b.i)});
        }catch(_){}
        var restNote=S.adminAiRestDropR929?(z()?('（另有 '+S.adminAiRestDropR929+' 位因對調後休息時間不足已先排除）\n'):''):'';S.adminAiRestDropR929=0;
        var few=cands.length<3?(z()?('（'+date+' 符合條件的只有這 '+cands.length+' 位；想看更多可以放寬目的地，或改寫班號）\n'):''):'';
        var pick=Math.max(0,Math.min(cands.length-1,(+a.pick||1)-1));Y=cands[pick].id;
        S.adminAiSwapCandsR929={X:X,date:date,at:pick,list:cands.slice(0,6).map(function(c){return {id:c.id,name:c.name,flight:c.f.code+' '+c.f.fr+'→'+c.f.to}})};
      }
      var ta=document.getElementById('k928aiTxt');if(!ta){ta=document.createElement('textarea');ta.id='k928aiTxt';ta.style.display='none';document.body.appendChild(ta)}
      ta.value=X+' 和 '+Y+' '+date+' 對調';window.kgmCrewAiAskR928();
      return {ok:true,async:'crew',msg:(cands.length?((z()?'候選人（同機型族、同階級、同站出發）：\n':'Candidates:\n')+cands.slice(0,Math.max(3,Math.min(6,cands.length))).map(function(c,i){return (i+1)+'. '+c.name+'（'+c.id+'）'+c.f.code+' '+c.f.fr+'→'+c.f.to}).join('\n')+'\n'+(few||'')+(restNote||'')):'')
        +(z()?('正在模擬 '+(st[X].name||X)+' ⇄ '+(st[Y].name||Y)+' '+date+' 整趟對調…'):'Simulating…')};
    }catch(e){return {ok:false,msg:String(e.message||e)}}
  }
  /* ── 站內規則引擎（Worker 連不上時） ── */
  function plan(text){
    var t=norm(text),acts=[];
    if(/^(help|幫助|你可以做什麼|可以做什麼|功能)/i.test(t.trim()))return [{tool:'help'}];
    if(/核准.*換班|換班.*核准|approve/i.test(t))return [{tool:'crew_swap_approve'}];
    var mp=/(?:改用|換成)?第\s*(\d)\s*(?:位|個)/.exec(t);
    if(/換班|對調|換到|swap/i.test(t)||(mp&&S.adminAiSwapCandsR929)){
      if(mp&&S.adminAiSwapCandsR929&&!/\b[A-Z]\d{5,6}\b/i.test(t))return [{tool:'crew_swap',args:{text:S.adminAiSwapCandsR929.X+' '+S.adminAiSwapCandsR929.date+' '+(S.adminAiSwapCandsR929.list[+mp[1]-1]||{}).flight,pick:1}}];
      return [{tool:'crew_swap',args:{text:t,pick:mp?+mp[1]:1}}];
    }
    if(/(列出|查看|目前|有哪些).*(規則)|rules?/i.test(t)&&!/新增|套用/.test(t))return [{tool:'fare_rule_list'}];
    var rm=/(刪除|移除|停用|取消).*(規則)\s*(FR[0-9A-Z]+)?/i.exec(t);if(rm)return [{tool:'fare_rule_remove',args:{id:rm[3]||'',all:/全部|所有/.test(t)}}];
    var ms=/^\s*(?:設定|set)\s+(S\.[\w.]+)\s*=\s*(.+)$/i.exec(t);if(ms){var v=ms[2].trim();try{v=JSON.parse(v)}catch(_){}return [{tool:'set_state',args:{path:ms[1],value:v}}]}
    if(/連假|假期|holiday/i.test(t)&&/新增|加入|增加|add/i.test(t)){var r1=rangeOf(t),c1=ctryOf(t)[0];return [{tool:'holiday_add',args:{c:c1,from:r1.from,to:r1.to,zh:(/[（(]([^）)]+)[）)]/.exec(t)||[])[1]||'連假',mul:(mulOf(t)>1?mulOf(t):0)}}]}
    var sw=/(KX\s?\d{1,4}).*?(換成|換機|改用|改成)\s*([A-Z0-9]{3,5})/i.exec(t);if(sw)return [{tool:'aircraft_swap',args:{code:sw[1].replace(/\s+/g,'').toUpperCase(),date:dateOf(t),type:sw[3].toUpperCase()}}];
    var si=/(KX\s?\d{1,4}).*?\b([EPBFR]-[A-Z])\b.*?(\d+)\s*(?:位|席|seats?)/i.exec(t);if(si&&/開放|釋出|可售|關閉|設定/.test(t))return [{tool:'seat_inventory',args:{code:si[1].replace(/\s+/g,'').toUpperCase(),date:dateOf(t),fare:si[2].toUpperCase(),seats:/關閉/.test(t)?0:+si[3]}}];
    var nw=/(?:發布|發佈|公告).*?(?:新聞|公告)?[:：]\s*([^；;\n]+)[；;\n]?\s*(?:內容[:：])?\s*([\s\S]*)/.exec(t);if(nw&&/新聞|公告/.test(t))return [{tool:'news_post',args:{title:nw[1].trim(),body:(nw[2]||'').trim()}}];
    var cp=/(?:優惠碼|折扣碼)\s*([A-Z0-9]{3,16})/i.exec(t);if(cp&&/建立|新增|create/i.test(t)){var fx=/(?:折|減)\s*NT\$?\s*(\d+)/i.exec(t);return [{tool:'coupon_create',args:{code:cp[1].toUpperCase(),type:fx?'fixed':'percent',value:fx?+fx[1]:Math.round((1-(mulOf(t)||0.9))*100),expiry:rangeOf(t).to||''}}]}
    var mb=/(停權|恢復|解除停權)\s*(?:會員)?\s*([A-Z]{3}\d{4,})/i.exec(t);if(mb)return [{tool:'member_suspend',args:{id:mb[2].toUpperCase(),on:/^停權/.test(mb[1])}}];
    var bd=/結標.*?(KX\s?\d{1,4})/i.exec(t);if(bd)return [{tool:'bigdeal_settle',args:{code:bd[1].replace(/\s+/g,'').toUpperCase(),date:dateOf(t),cabin:cabOf(t)||'Business'}}];
    /* 票價：航線／國家 × 日期區間 × 幅度 */
    var mul=mulOf(t);
    if(mul&&mul!==1&&/(票價|價格|票|price|fare|漲|降|貴|便宜|折)/i.test(t)){
      var aps=apsOf(t),cs=ctryOf(t),r2=rangeOf(t),first=/第一段|首段|第一個航段|first segment/i.test(t),code=(/\b(KX\s?\d{1,4})\b/i.exec(t)||[])[1];
      /* 票價規則用城市名時取該城市的主機場（東京→NRT）；要羽田請直接寫 HND */
      var capt=[];Object.keys(CITY).map(function(k){return {i:t.indexOf(k),c:CITY[k].split(',')[0]}}).filter(function(x){return x.i>=0}).sort(function(a,b){return a.i-b.i}).forEach(function(x){if(capt.indexOf(x.c)<0)capt.push(x.c)});
      if(!aps.some(function(x){return typeof x==='string'&&/^[A-Z]{3}$/.test(x)&&t.toUpperCase().indexOf(x)>=0}))aps=capt;
      var fr=aps[0]||'',to=aps[1]||'';
      if(!fr&&cs.length){fr=/(出發|起飛|departing|from)/i.test(t)||first?cs[0]:'';to=(!fr?cs[0]:(cs[1]||''))}
      if(/往|飛往|到|抵達|to\b/i.test(t)&&!aps[1]&&aps[0]&&!/出發/.test(t)){to=aps[0];fr=''}
      acts.push({tool:'fare_rule_add',args:{fr:fr,toAp:to,from:r2.from,to:r2.to,cabin:cabOf(t),code:code?code.replace(/\s+/g,'').toUpperCase():'',mul:+mul.toFixed(4),firstSegOnly:first,note:text.slice(0,80)}});
      return acts;
    }
    return [];
  }
  function helpTxt(){
    var rows=Object.keys(TOOLS).map(function(k){var o=TOOLS[k],ok=o.sys?(roleOf()==='ceo'||roleOf()==='backend'):can(o.tab)||(o.view&&typeof window.kgmPermR123==='function'&&window.kgmPermR123(o.tab)==='view');return (ok?'✓ ':'✕ ')+o.zh+(ok?'':(z()?'（無權限）':' (no permission)'))});
    return (z()?('我是 KGM 後台 AI（Claude Opus 5.5），依你目前的職務「'+roleZh()+'」可以直接執行：\n'):'KGM admin AI (Claude Opus 5.5). You can:\n')+rows.join('\n')
      +(z()?'\n\n例如：\n· TPE-NRT 10/1~10/10 經濟艙漲 15%\n· 台灣出發的第一段票價貴 10%\n· 新增連假 日本 2027-07-17~07-19（海の日）\n· K60012 10/12 想換到東京的班（會列出至少三位候選）\n· KX12 10/05 換成 B789\n· 列出票價規則／刪除規則 FRxxxx\n· 設定 S.xxx = 值（系統人員／CEO）':'');
  }
  function exec(acts,src){
    var out=[],asyncCrew=false;
    acts.forEach(function(x){
      if(x.tool==='help'){out.push({ok:true,msg:helpTxt()});return}
      var tl=TOOLS[x.tool];if(!tl){out.push({ok:false,msg:(z()?'不認得的工具：':'Unknown tool: ')+x.tool});return}
      var allowed=tl.sys?(roleOf()==='ceo'||roleOf()==='backend'):(can(tl.tab)||(tl.view&&typeof window.kgmPermR123==='function'&&window.kgmPermR123(tl.tab)==='view'));
      if(!allowed){out.push({ok:false,denied:true,msg:(z()?'無權限：':'No permission: ')+tl.zh+(z()?'（你的職務「'+roleZh()+'」沒有這項後台權限，請洽 CEO 或有權限的同仁）':'')});return}
      var r;try{r=tl.run(x.args||{})}catch(e){r={ok:false,msg:String(e&&e.message||e)}}
      if(r.async==='crew')asyncCrew=true;
      try{if(r.ok&&!tl.view&&typeof logAct==='function')logAct((z()?'後台 AI：':'Admin AI: ')+tl.zh,String(r.msg||'').slice(0,120))}catch(_){}
      out.push(r);
    });
    return {out:out,asyncCrew:asyncCrew};
  }
  async function remote(text){
    var base='';try{base=(window.kgmWorkerBaseR22&&window.kgmWorkerBaseR22())||'https://kgm-email.amychen-640413.workers.dev'}catch(_){base='https://kgm-email.amychen-640413.workers.dev'}
    if(!base||S.adminAiRemoteOffR929)return null;
    var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},15000);
    try{
      var res=await fetch(base.replace(/\/+$/,'')+'/ai/admin',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,
        body:JSON.stringify({model:MODEL,fallbackModel:MODEL2,text:text,role:roleOf(),empId:me().empId||'',today:T(),
          history:chat().slice(-8).map(function(m){return {role:m.role,text:m.text}}),
          tools:Object.keys(TOOLS).map(function(k){return {name:k,tab:TOOLS[k].tab,desc:TOOLS[k].zh}})})});
      clearTimeout(tm);if(!res.ok)return null;var j=await res.json();if(!j||(!j.actions&&!j.reply))return null;return j;
    }catch(_){clearTimeout(tm);return null}
  }
  /* 換班模擬是分段跑的：等結果出來再回報；不合法就自動改試下一位候選，直到找到合法的或全部試完 */
  function watchCrew(src){
    var tries=0,iv=setInterval(function(){var cr=S.crewAiR928;tries++;if(!(cr&&!cr.pending)&&tries<=240)return;clearInterval(iv);
      var cs=S.adminAiSwapCandsR929,msg=cr?cr.msgs.join('\n'):'—';
      if(cr&&!cr.ok&&cs&&cs.list&&(cs.at||0)+1<cs.list.length){
        cs.at=(cs.at||0)+1;var nx=cs.list[cs.at];
        chat().push({role:'assistant',text:msg+'\n'+(z()?('→ 自動改試第 '+(cs.at+1)+' 位：'+nx.name+'（'+nx.id+'）'+nx.flight+'…'):'Trying next candidate…'),at:new Date().toISOString(),src:src});persist();draw();
        var ta=document.getElementById('k928aiTxt');if(ta){ta.value=cs.X+' 和 '+nx.id+' '+cs.date+' 對調';window.kgmCrewAiAskR928();setTimeout(function(){watchCrew(src)},300)}
        return}
      if(cr&&!cr.ok&&cs&&cs.list&&cs.list.length>1)msg+='\n'+(z()?'（'+cs.list.length+' 位候選都試過了，都不合法；請換一天或換目的地。）':'');
      if(cr&&cr.ok&&!cr.approved)msg+=z()?'\n→ 回覆「核准換班」就會寫入班表並通知兩位組員。':'';
      chat().push({role:'assistant',text:msg,at:new Date().toISOString(),src:src});persist();draw()},500)}
  window.kgmAdminAiAskR929=async function(text){
    text=String(text||'').trim();if(!text)return;
    var c=chat();c.push({role:'user',text:text,at:new Date().toISOString()});
    var th={role:'assistant',text:'',pending:true,at:new Date().toISOString()};c.push(th);S.adminAiBusyR929=true;draw();
    var j=await remote(text),acts=[],src='opus',reply='';
    if(j){acts=(j.actions||[]).map(function(a){return {tool:a.tool||a.name,args:a.args||a.input||{}}});reply=j.reply||'';src=j.model||MODEL}
    else{acts=plan(text);src='local'}
    var r=exec(acts,src);
    var lines=r.out.map(function(o){return (o.ok?'✓ ':(o.denied?'⛔ ':'✕ '))+o.msg});
    if(!acts.length)lines.push(z()?'我還看不懂這個需求。可以說得更具體一點（航線／日期區間／幅度，或員工編號／日期），或輸入「help」看我能做什麼。':'I could not map that to an action. Type "help".');
    th.pending=false;th.text=(reply?reply+'\n':'')+lines.join('\n');th.src=src;th.at=new Date().toISOString();
    if(src==='local')th.note=z()?'Claude Opus 5.5（Worker /ai/admin）目前連不上，這次由站內規則引擎依同一套權限執行。':'Worker unreachable — handled by the built-in rule engine with the same permissions.';
    S.adminAiBusyR929=false;persist();draw();try{render()}catch(_){}
    if(r.asyncCrew)watchCrew(src);
  };
  /* ── 介面（與前台 KGM AI 同一版型） ── */
  var CLAUDE='<svg viewBox="0 0 100 100" width="26" height="26" aria-hidden="true"><g fill="#D97757">'
    +[0,30,60,90,120,150,180,210,240,270,300,330].map(function(a,i){var l=i%2?30:40;return '<rect x="46.5" y="'+(50-l)+'" width="7" height="'+l+'" rx="3.5" transform="rotate('+a+' 50 50)"/>'}).join('')+'</g></svg>';
  window.KGM_CLAUDE_MARK_R929=CLAUDE;
  function draw(){
    try{
      var host=document.getElementById('kgmAdminAi929');
      var show=S.view==='admin'&&S.adminAuthed;
      var fr=document.getElementById('aiChat');if(fr)fr.style.display=show?'none':'';
      if(!show){if(host)host.style.display='none';return}
      if(!host){host=document.createElement('div');host.id='kgmAdminAi929';document.body.appendChild(host)}
      host.style.display='';
      var open=!!S.adminAiOpenR929,c=chat();
      var msgs=c.length?c.map(function(m){
        if(m.pending)return '<div class="k929ai-m a"><span class="k929ai-think">'+CLAUDE.replace('width="26" height="26"','width="14" height="14"')+(z()?' 思考中':' Thinking')+'<i>.</i><i>.</i><i>.</i></span></div>';
        return '<div class="k929ai-m '+(m.role==='user'?'u':'a')+'"><div>'+E(m.text).replace(/\n/g,'<br>')+'</div>'+(m.note?'<small>'+E(m.note)+'</small>':'')+'</div>'}).join('')
        :'<div class="k929ai-welcome"><b>'+(z()?'你好，我是 KGM 後台 AI':'KGM admin AI')+'</b><span>'+(z()?'Claude Opus 5.5 · 依你的職務「'+E(roleZh())+'」權限直接處理後台事務。':'Claude Opus 5.5 · acts within your role permissions.')+'</span>'
          +'<div class="k929ai-cards">'+[[z()?'調整票價':'Adjust fares',z()?'TPE-NRT 10/1~10/10 經濟艙漲 15%':'TPE-NRT 10/1~10/10 economy +15%'],[z()?'特殊規則':'Special rule',z()?'台灣出發的第一段票價貴 10%':'First segment from Taiwan +10%'],[z()?'組員換班':'Crew swap',z()?'K60012 10/12 想換到東京的班':'K60012 10/12 to Tokyo'],[z()?'我能做什麼':'Help','help']].map(function(x){return '<button onclick="kgmAdminAiFillR929(this)" data-q="'+E(x[1])+'"><strong>'+E(x[0])+'</strong><small>'+E(x[1])+'</small></button>'}).join('')+'</div></div>';
      host.innerHTML='<div class="k929ai-win" style="display:'+(open?'flex':'none')+'">'
        +'<div class="k929ai-h"><div class="k929ai-t">'+CLAUDE.replace('width="26" height="26"','width="22" height="22"')+'<div><b>'+(z()?'KGM 後台 AI':'KGM Admin AI')+'</b><small>Claude Opus 5.5 · '+E(roleZh())+' '+E(me().empId||'')+'</small></div></div>'
          +'<div><button onclick="kgmAdminAiClearR929()">'+(z()?'清除':'Clear')+'</button><button onclick="S.adminAiOpenR929=false;kgmAdminAiDrawR929()">×</button></div></div>'
        +'<div class="k929ai-msgs" id="k929aiMsgs">'+msgs+'</div>'
        +'<div class="k929ai-in"><input id="k929aiIn" class="inp" placeholder="'+(z()?'輸入後台指令，例如：TPE-NRT 10/1~10/10 漲 15%':'Type an admin request…')+'" onkeydown="if(event.key===\'Enter\'&&!event.isComposing){kgmAdminAiSendR929()}"'+(S.adminAiBusyR929?' disabled':'')+'>'
          +'<button class="btn" onclick="kgmAdminAiSendR929()"'+(S.adminAiBusyR929?' disabled':'')+'>'+(z()?'送出':'Send')+'</button></div></div>'
        +'<button class="k929ai-fab" title="'+(z()?'KGM 後台 AI（Claude Opus 5.5）':'KGM Admin AI')+'" onclick="S.adminAiOpenR929=!S.adminAiOpenR929;kgmAdminAiDrawR929()">'+CLAUDE+'</button>';
      var box=document.getElementById('k929aiMsgs');if(box)box.scrollTop=box.scrollHeight;
      if(open&&!S.adminAiBusyR929){var i=document.getElementById('k929aiIn');if(i&&S.adminAiPrefillR929){i.value=S.adminAiPrefillR929;S.adminAiPrefillR929='';i.focus()}}
    }catch(_){}
  }
  window.kgmAdminAiDrawR929=draw;
  window.kgmAdminAiSendR929=function(){var i=document.getElementById('k929aiIn');if(!i)return;var v=i.value;i.value='';window.kgmAdminAiAskR929(v)};
  window.kgmAdminAiFillR929=function(b){var q=b.getAttribute('data-q');if(q==='help'){window.kgmAdminAiAskR929('help');return}var i=document.getElementById('k929aiIn');if(i){i.value=q;i.focus()}};
  window.kgmAdminAiOpenR929=function(q){S.adminAiOpenR929=true;S.adminAiPrefillR929=q||'';draw()};
  window.kgmAdminAiClearR929=function(){var s=store();s[me().empId||'ADMIN']=[];S.adminAiSwapCandsR929=null;persist();draw()};
  (function css(){if(document.getElementById('k929ai-css'))return;var st=document.createElement('style');st.id='k929ai-css';
    st.textContent='#kgmAdminAi929{position:fixed;right:20px;bottom:52px;z-index:1001}'
      +'.k929ai-fab{width:52px;height:52px;border-radius:50%;background:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18),inset 0 0 0 1px rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center;margin-left:auto;transition:transform .2s}'
      +'.k929ai-fab:hover{transform:rotate(30deg)}'
      +'.k929ai-win{width:380px;height:540px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2);flex-direction:column;overflow:hidden;margin-bottom:10px}'
      +'.k929ai-h{background:#1f1e1d;color:#fff;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}'
      +'.k929ai-t{display:flex;align-items:center;gap:10px}.k929ai-t b{display:block;font-size:14px}.k929ai-t small{display:block;font-size:10px;opacity:.75;letter-spacing:.03em;margin-top:2px}'
      +'.k929ai-h button{background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:6px;padding:3px 8px;margin-left:6px;cursor:pointer;font-size:11px}'
      +'.k929ai-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f8f6f2}'
      +'.k929ai-m{max-width:88%;font-size:12.5px;line-height:1.65}.k929ai-m>div{padding:9px 11px;border-radius:12px;white-space:normal;word-break:break-word}'
      +'.k929ai-m.u{align-self:flex-end}.k929ai-m.u>div{background:#0b493b;color:#fff;border-bottom-right-radius:4px}'
      +'.k929ai-m.a{align-self:flex-start}.k929ai-m.a>div{background:#fff;border:1px solid #ece7da;color:#1f2a25;border-bottom-left-radius:4px}'
      +'.k929ai-m small{display:block;margin-top:4px;font-size:10px;color:#9a8f7a}'
      +'.k929ai-think{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:#fff;border:1px solid #ece7da;color:#8a6a55;font-size:12px;font-weight:700}'
      +'.k929ai-think i{font-style:normal;animation:k929blink 1.2s infinite}.k929ai-think i:nth-child(3){animation-delay:.2s}.k929ai-think i:nth-child(4){animation-delay:.4s}'
      +'.k929ai-think svg{animation:k929spin 2.4s linear infinite}'
      +'@keyframes k929blink{0%,100%{opacity:.2}50%{opacity:1}}@keyframes k929spin{to{transform:rotate(360deg)}}'
      +'.k929ai-welcome b{display:block;font-size:14px;color:#1f1e1d}.k929ai-welcome>span{display:block;font-size:11.5px;color:#6b6358;margin:4px 0 10px}'
      +'.k929ai-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}.k929ai-cards button{text-align:left;border:1px solid #e6dfd3;background:#fff;border-radius:10px;padding:9px 10px;cursor:pointer}'
      +'.k929ai-cards strong{display:block;font-size:12px;color:#1f1e1d}.k929ai-cards small{display:block;font-size:10.5px;color:#8a8175;margin-top:3px;line-height:1.5}'
      +'.k929ai-in{padding:10px;border-top:1px solid #eee;display:flex;gap:6px;flex-shrink:0}.k929ai-in input{flex:1;height:36px;font-size:12px}.k929ai-in .btn{height:36px;padding:0 12px;font-size:12px;background:#D97757;border-color:#D97757;color:#fff}'
      +'.k929-frs .adm-sec small{font-weight:400;font-size:11px;color:#8a8175;letter-spacing:0}.k929-frs-n{font-size:11px;color:#8a8175;margin-top:2px}.k929-frs td code{font-size:11px}.k929-frs .btn-g{margin-top:10px}'
      +'@media(max-width:520px){#kgmAdminAi929{right:12px}.k929ai-win{width:calc(100vw - 24px);height:68vh}}';
    (document.head||document.documentElement).appendChild(st)})();
  if(typeof render==='function'){var rdA=render;render=window.render=function(){var r=rdA.apply(this,arguments);setTimeout(draw,0);return r}}
  setTimeout(draw,1500);
})();

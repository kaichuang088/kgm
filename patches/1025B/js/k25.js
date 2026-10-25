
/* ══ 1025B k25（r229 最後，grp23 之後）══════════════════════════════════════ */
/* ── I：前台行程管理用 DH PNR 查不到（使用者：「你後台DH的PNR仍然找不到」，截圖 名 TAYLOR／姓 SHU-HAN）
      訂位上是 姓 TAYLOR、名 SHU-HAN；班表卡片寫「TAYLOR / SHU-HAN」看不出哪個是姓，照順序填就反了。
      名、姓填反也接受（仍然要兩個都對，不放寬成只看一個）。 ── */
(function(){
  var MY=null;
  function wrap(){var o=window.kgmLookupPnrR23;if(typeof o!=='function'||o===MY)return;
    var w=function(pnr,first,last){var r=o.apply(this,arguments);
      try{if(r&&!r.ok&&first&&last&&String(first).trim().toUpperCase()!==String(last).trim().toUpperCase()){var r2=o.call(this,pnr,last,first);if(r2&&r2.ok)return r2}}catch(_){}
      return r};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}MY=w;window.kgmLookupPnrR23=w}
  wrap();setTimeout(wrap,0);setTimeout(wrap,3000);setTimeout(wrap,10000);
})();

/* ── 共用：區塊 + / −（使用者：「機隊排班旁邊每個都加入+/- (可展開收起) 有點亂」）
      收起時只留一條標題列（標題＋展開鈕），內容完全藏起來（不是壓矮加漸層）；展開時右上角一顆收起鈕，不重複標題。
      狀態存在本機（kgm25_col，每個人自己的版面偏好）。畫面重畫後由 MutationObserver 在繪出前補上。 ── */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function get(){try{return JSON.parse(localStorage.getItem('kgm25_col')||'{}')||{}}catch(_){return {}}}
  function put(o){try{localStorage.setItem('kgm25_col',JSON.stringify(o))}catch(_){}}
  var PAGES={};   /* page → function(main) 回傳 [{el,key,title}] */
  window.kgmColPageR1025B=function(page,fn){PAGES[page]=fn};
  window.kgmColR1025B=function(page,key){var o=get(),k=page+'|'+key;
    if(key==='*'||key==='-'){var L=list(page);L.forEach(function(x){var kk=page+'|'+x.key;if(key==='-')o[kk]=1;else delete o[kk]})}
    else{if(o[k])delete o[k];else o[k]=1}
    put(o);apply()};
  function list(page){try{var main=document.querySelector('#app main.p-admin-main');return main&&PAGES[page]?(PAGES[page](main)||[]):[]}catch(_){return []}}
  function apply(){
    try{
      if(!(S.view==='admin'&&PAGES[S.adminTab]))return;
      var page=S.adminTab,L=list(page);if(!L.length)return;var o=get();
      L.forEach(function(x){var el=x.el;if(!el)return;
        var h=el.querySelector(':scope > .k25c-h');
        if(!h){h=document.createElement('div');h.className='k25c-h';el.insertBefore(h,el.firstChild);el.classList.add('k25c')}
        var off=!!o[page+'|'+x.key],sig=(off?1:0)+'|'+x.title+'|'+(x.sum||'');
        if(h.getAttribute('data-s')!==sig){h.setAttribute('data-s',sig);
          h.innerHTML='<b>'+E(x.title)+'</b>'+(x.sum?'<span>'+E(x.sum)+'</span>':'')+'<button type="button" class="k25c-b" title="'+(off?(z()?'展開':'Expand'):(z()?'收起':'Collapse'))+'" onclick="kgmColR1025B(\''+page+'\',\''+x.key+'\')">'+(off?'+':'−')+'</button>'}
        el.classList.toggle('k25c-off',off)});
      var host=L[0].el.parentNode,bar=host.querySelector(':scope > .k25c-bar');
      var nOff=L.filter(function(x){return o[page+'|'+x.key]}).length;
      var bh='<span>'+(z()?'區塊 ':'Sections ')+(L.length-nOff)+' / '+L.length+(z()?' 展開':' open')+'</span><button type="button" onclick="kgmColR1025B(\''+page+'\',\'*\')">'+(z()?'＋ 全部展開':'＋ Expand all')+'</button><button type="button" onclick="kgmColR1025B(\''+page+'\',\'-\')">'+(z()?'－ 全部收起':'－ Collapse all')+'</button>';
      if(!bar){bar=document.createElement('div');bar.className='k25c-bar';host.insertBefore(bar,L[0].el)}
      if(bar.getAttribute('data-h')!==bh){bar.innerHTML=bh;bar.setAttribute('data-h',bh)}
      if(bar.nextElementSibling!==L[0].el)host.insertBefore(bar,L[0].el);
    }catch(e){try{console.warn('k25 col',e)}catch(_){}}
  }
  window.kgmColApplyR1025B=apply;
  var Q=false;
  try{new MutationObserver(function(){if(Q)return;if(!(S.view==='admin'&&PAGES[S.adminTab]))return;Q=true;Promise.resolve().then(function(){Q=false;apply()})}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  setInterval(apply,1500);
  var CSS='.k25c{position:relative}'
   +'.k25c > .k25c-h{position:absolute;top:10px;right:10px;z-index:4;display:flex;align-items:center;gap:10px}'
   +'.k25c > .k25c-h > b,.k25c > .k25c-h > span{display:none}'
   +'.k25c-b{width:28px;height:28px;padding:0;border-radius:50%;border:1px solid #d6dbd4;background:#fff;color:#173f33;font:700 17px/26px system-ui,-apple-system,sans-serif;cursor:pointer;flex:none}'
   +'.k25c-b:hover{background:#eef6f1;border-color:#9cc2ad}'
   +'.k25c.k25c-off{min-height:0!important;height:auto!important;padding-top:14px!important;padding-bottom:14px!important}'
   +'.k25c.k25c-off > :not(.k25c-h){display:none!important}'
   +'.k25c.k25c-off{display:block!important}'
   +'.k69-main.k25c-off{border:1px solid #e3e8e5;border-radius:16px;background:#fff;padding:14px 20px!important}'   /* 格狀版面（機身與當日航班）收起時標題列佔滿 */
   +'.k69-main.k25c:not(.k25c-off) > .k25c-h{top:-13px;right:auto;left:-13px}'   /* 展開時鈕放左上角，不壓到「AI 排整機隊一週」 */
   +'.k25c.k25c-off > .k25c-h{position:static;display:flex;justify-content:space-between}'
   +'.k25c.k25c-off > .k25c-h > b{display:block;font-size:15px;color:#173f33;letter-spacing:.02em}'
   +'.k25c.k25c-off > .k25c-h > span{display:block;margin-right:auto;font-size:12px;color:#7a817b;font-weight:500}'
   +'.k25c-bar{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin:12px 0 8px}.k25c-bar span{margin-right:auto;font-size:11.5px;color:#7a817b}'
   +'.k25c-bar button{padding:6px 12px;border-radius:999px;border:1px solid #d6dbd4;background:#fff;color:#173f33;font-size:12px;font-weight:700;cursor:pointer}.k25c-bar button:hover{background:#eef6f1}';
  try{var st=document.createElement('style');st.id='k25c-css';st.textContent=CSS;document.head.appendChild(st)}catch(_){}
  /* 機隊排班 */
  window.kgmColPageR1025B('fleetsched',function(main){
    var w=main.querySelector('.k69-wrap');if(!w)return [];var out=[];
    [].forEach.call(w.children,function(c){
      var t='',k='',sum='';
      if(c.classList.contains('k72-strip')){t=z()?'輪轉檢查':'Rotation check';k='rot'}
      else if(c.classList.contains('k69-main')){t=z()?'機身與當日航班':'Aircraft & day board';k='main'}
      else if(c.tagName==='SECTION'){var h=c.querySelector('h2,h3,h4,.k69-h,b');t=(h?h.textContent:'').trim().replace(/\s+/g,' ').slice(0,40);
        k=c.classList.contains('k148-card')?'tsa':(c.classList.contains('k78-chg')?'chg':(c.classList.contains('k69-status')?'status':(/逐月|Monthly/i.test(t)?'month':(/機身查詢|Enquiry|ENQUIRY/i.test(c.textContent.slice(0,80))?'query':'s'+out.length))))}
      if(k)out.push({el:c,key:k,title:t||k,sum:sum})});
    return out});
})();

/* ── M：員工票 Payload／workload（使用者：「員工票還是沒有考慮到workload啊 你要寫清楚再員工票狀態那裡 workload simulate by yourself」）
      1023A 的 kgmPayloadR1023A 只算「最大無燃油重量 − 無燃油重量」，沒算貨運、沒算燃油 → 每班都還剩幾十噸，員工票永遠不會被 Payload 擋。
      這裡在外層加上模擬：
      · 腹艙貨運：依機型上限 × 35～100%（班號＋日期固定，長程台北出發 +15%），不超過貨艙扣掉行李後的空間；
      · 燃油：每小時油耗 ×（輪擋時間 × 1.05 ＋ 1.25 小時備用／備降）＋ 滑行 300 kg；
      · 可用載重＝min(最大無燃油重量 − 無燃油重量, 最大起飛重量 − 無燃油重量 − 燃油)；貨運優先（營收），剩下的才給員工票。
      旅客、行李、無燃油重量照舊用航班資料載重平衡那一份。候補、BigDeal、員工票 48–72 小時通知、行李改運都讀這一支，一起生效。 ── */
(function(){
  var AC25={A388:[575000,11000,25000],B779:[351500,7000,40000],B77W:[351500,7500,40000],A359:[280000,5800,30000],A35K:[319000,6800,36000],B789:[254000,5600,25000],B78X:[254000,5900,30000],
    A339:[251000,5700,22000],A339L:[251000,5700,22000],A339R:[251000,5700,22000],A21N:[97000,2300,4500],A21X:[101000,2400,4000]};   /* [最大起飛重量, 每小時油耗, 腹艙貨運上限] kg */
  function H(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  var C25={};
  function wrap(){var o=window.kgmPayloadR1023A;if(typeof o!=='function'||o.__k25)return;
    var w=function(code,date,fr,to){var v=o.apply(this,arguments);if(!v||v.k25)return v;
      var k=[code,date,fr||'',to||''].join('|'),c=C25[k];if(c&&c.src===v)return c.v;
      var x=Object.assign({},v);
      try{
        var t=String(v.type||'').toUpperCase(),a=AC25[t]||AC25[t.replace(/[LR]$/,'')]||[Math.round((v.mzfw||0)*1.35),5000,10000];
        var f=v.f||{},blk=0;try{blk=blockMin(f.fr,f.to,f.dep,f.arr,f.dd||0)||0}catch(_){blk=0}if(!(blk>0))blk=180;
        var fuel=Math.round(a[1]*(blk/60*1.05+1.25)+300);
        var hold=Math.max(0,a[2]-(+v.holdKg||0)),lh=blk>=360&&/^(TPE|TSA)$/.test(f.fr||fr||'');
        var frac=0.35+(H(code+'|'+date+'|cargo')%66)/100+(lh?0.15:0);frac=Math.min(1,frac);
        var plan=Math.round(Math.min(hold,a[2]*frac)/10)*10;
        var room=Math.min((v.mzfw||0)-(v.zfw||0),a[0]-(v.zfw||0)-fuel);
        var cargo=Math.max(0,Math.min(plan,room)),left=room-cargo;
        x.mtow=a[0];x.fuelKg=fuel;x.cargoPlanKg=plan;x.cargoKg=cargo;x.cargoOffKg=Math.max(0,plan-cargo);x.blockMin=blk;
        x.zfwRoom=(v.mzfw||0)-(v.zfw||0)-cargo;x.towRoom=a[0]-(v.zfw||0)-cargo-fuel;x.limitBy=x.towRoom<x.zfwRoom?'mtow':'mzfw';
        x.left0R1023A=v.left;x.left=Math.max(0,left);x.k25=1;
      }catch(_){}
      C25[k]={src:v,v:x};return x};
    w.__k25=1;try{Object.keys(o).forEach(function(kk){if(!(kk in w))w[kk]=o[kk]})}catch(_){}window.kgmPayloadR1023A=w}
  wrap();setTimeout(wrap,0);setTimeout(wrap,3000);
  /* 員工票狀態頁：每班寫清楚 workload */
  function z(){try{return LANG!=='en'}catch(_){return true}}
  window.kgmStxWorkloadR1025B=function(p,code,date,fr,to){
    try{var pl=window.kgmPayloadR1023A(code,date,fr,to);if(!pl)return '';var kg=+window.KGM_STAFF_KG_R1023A||107,n=Math.floor(pl.left/kg);
      var seats=0;Object.keys((p&&p.after)||{}).forEach(function(c){seats+=Math.max(0,+p.after[c]||0)});
      var blocked=(p&&p.staff||[]).filter(function(r){return r&&r.payloadR1023A}).length;
      var t=function(v){return (Math.round(v/100)/10).toLocaleString()+' t'};
      var m=Math.min(n,seats),cls=m<=0?'r':((n<seats||m<5)?'y':'g');
      var lim=n<seats?(z()?'Payload 卡住：座位 '+seats+' 席，只能上 '+n+' 人':'Payload-limited: '+n+' of '+seats+' seats'):(z()?'座位決定：還能上 '+seats+' 人':'Seat-limited: '+seats);
      return '<em class="k25-wl '+cls+'">'+(z()?'Workload：旅客 ':'Load: pax ')+(pl.pax||0)+(z()?' 人、行李 ':', bags ')+t(pl.holdKg||0)+(z()?'、貨 ':', cargo ')+t(pl.cargoKg)+(pl.cargoOffKg?(z()?'（卸 '+t(pl.cargoOffKg)+'）':' (offload '+t(pl.cargoOffKg)+')'):'')+(z()?'、油 ':', fuel ')+t(pl.fuelKg)
        +(z()?' · Payload 餘 ':' · Payload left ')+Math.round(pl.left).toLocaleString()+' kg（'+(pl.limitBy==='mtow'?(z()?'最大起飛重量':'MTOW'):(z()?'最大無燃油重量':'MZFW'))+'）· '+lim+(blocked?(z()?' · '+blocked+' 筆員工票因 Payload 上不了':' · '+blocked+' blocked by payload'):'')+'</em>'}catch(_){return ''}};
  try{var st=document.createElement('style');st.textContent='.k6ss-f em.k25-wl,.k25-wl{display:block;margin-top:5px;font-style:normal;font-size:11px;line-height:1.55;padding:4px 9px;border-radius:8px;background:#eef6f1;color:#1f5a45;font-weight:600}.k6ss-f em.k25-wl.y,.k25-wl.y{background:#fdf3d8;color:#7a5608}.k6ss-f em.k25-wl.r,.k25-wl.r{background:#fbe6e0;color:#9b2d17}';document.head.appendChild(st)}catch(_){}
})();

/* ── N：後台 AI 建立臨時航班（使用者：「後台AI可能說創建臨時航班之類的也要可以喔然後可能問機型或是時間都要給予適當建議」）
      「加開 TPE-NRT 11/5」「11/8 臨時航班 台北到首爾 B789」→ 依距離建議機型，列三個方案（機身、去回程時刻），選方案、決定是否販售 → 建立。
      規則跟航線管理「新增航線／臨時航班」同一套：機身那個時間必須已經在出發站（kgmTailAtR913，沒勤務視為在基地）、前後勤務不重疊、
      寫進同一份 S.customFlights（effFrom＝effTo＝那一天、tempR49）與 S.tailAssign（manualR69，機隊重排保留）。
      時刻避開當地 00:30–05:59 抵達（全網不在 03 點抵達的規則也一起守）；回程＝抵達＋轉機時間（窄體 60、廣體 90、A388 120 分）。 ── */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function AF(){try{return allF()}catch(_){return [].concat(FLIGHTS,S.customFlights||[])}}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(n){n=((n%1440)+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)}
  function D(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function tz(a){try{return +TZ[a]||8}catch(_){return 8}}
  function abs(date,t,ap){return Date.parse(date+'T00:00:00Z')/60000+mn(t)-tz(ap)*60}
  function today(){var d=new Date(Date.now()+8*3600e3);return d.toISOString().slice(0,10)}
  function dateIn(t){var n=today(),y=+n.slice(0,4),m;if(/今天|今日/.test(t))return n;if(/明天|明日/.test(t))return D(n,1);if(/後天/.test(t))return D(n,2);
    if((m=/(20\d\d)[-\/.年](\d{1,2})[-\/.月](\d{1,2})/.exec(t)))return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
    if((m=/(?:^|[^\d])(\d{1,2})\s*[\/月]\s*(\d{1,2})(?!\d)/.exec(t))){var d=y+'-'+('0'+m[1]).slice(-2)+'-'+('0'+m[2]).slice(-2);if(d<D(n,-1))d=(y+1)+d.slice(4);return d}return ''}
  function aps(t){var out=[],u=t.toUpperCase(),m,re=/\b([A-Z]{3})\b/g;while((m=re.exec(u))){if(/^KX/.test(m[1]))continue;try{if(CITY_ZH[m[1]]&&out.indexOf(m[1])<0)out.push(m[1])}catch(_){}}
    var hits=[];try{Object.keys(CITY_ZH).forEach(function(k){var nm=String(CITY_ZH[k]||'').replace(/(桃園|松山|成田|羽田|關西|仁川|金浦|浦東|虹橋|國際)$/,'');if(nm.length>=2){var i=t.indexOf(nm);if(i>=0)hits.push([i,k,nm.length])}})}catch(_){}
    hits.sort(function(a,b){return a[0]-b[0]||b[2]-a[2]});hits.forEach(function(h){if(out.indexOf(h[1])<0&&!out.some(function(o){try{return window.kgmSameCityR928&&window.kgmSameCityR928(o,h[1])}catch(_){return false}}))out.push(h[1])});
    if(out[0]==='TSA'&&/桃園/.test(t))out[0]='TPE';return out.slice(0,2)}
  var TYPES=['A21N','B78X','B789','B779','A359','A35K','A339R','A339L','A388'];
  function typeIn(t){var u=t.toUpperCase().replace(/\s/g,'');for(var i=0;i<TYPES.length;i++)if(u.indexOf(TYPES[i])>=0)return TYPES[i];if(/A321/.test(u))return 'A21N';if(/A380/.test(u))return 'A388';if(/777/.test(u))return 'B779';if(/787-?10/.test(u))return 'B78X';if(/787/.test(u))return 'B789';if(/A350/.test(u))return 'A359';if(/A330/.test(u))return 'A339R';return ''}
  function timeIn(t){var m=/(\d{1,2})\s*[:：點]\s*(\d{2})?/.exec(t.replace(/\d{1,2}\s*[\/月]\s*\d{1,2}/,''));return m?((+m[1])*60+(+(m[2]||0))):null}
  function dur(fr,to){var d=0;try{d=Math.max(55,Math.round((distOf(fr,to)||1200)/780*60+35))}catch(_){d=150}return Math.round(d/5)*5}   /* 時刻取整到 5 分鐘 */
  function rec(fr,to){var d=0;try{d=+distOf(fr,to)||0}catch(_){}
    if(d<1500)return {d:d,types:['A21N','A339R','B78X'],why:z()?'短程（'+Math.round(d).toLocaleString()+' km）：A321neo 最省；臨時需求大再用 A330／787-10':'short-haul'};
    if(d<3000)return {d:d,types:['A21N','B78X','A339R','B789'],why:z()?'區域線（'+Math.round(d).toLocaleString()+' km）：A321neo 或 787-10／A330':'regional'};
    if(d<5000)return {d:d,types:['B78X','B789','A339R','A359'],why:z()?'中程（'+Math.round(d).toLocaleString()+' km）：787 或 A330-900neo':'medium-haul'};
    if(d<9000)return {d:d,types:['B789','A359','A339L','B779'],why:z()?'長程（'+Math.round(d).toLocaleString()+' km）：787-9／A350-900':'long-haul'};
    return {d:d,types:['B779','A359','A35K','A388'],why:z()?'超長程（'+Math.round(d).toLocaleString()+' km）：777-9／A350（載重與航程夠）':'ultra long-haul'}}
  function turn(t){return t==='A388'?120:(/^A21|^A32/.test(t)?60:90)}
  function legsOf(tl){return ((S.tailAssign||{})[tl]||[]).filter(function(x){return x&&x.date&&!x.cancelledR1023A}).map(function(x){var fr=x.fr||String(x.route||'').split('→')[0],to=x.to||String(x.route||'').split('→')[1];
    var a=abs(x.date,x.dep,fr),f=AF().filter(function(q){return q&&!q.via&&q.code===x.code&&q.fr===fr&&q.to===to})[0],du=(f&&+f.dur)||((function(){try{return blockMin(fr,to,x.dep,x.arr,x.dd||0)}catch(_){return 180}})());return [a,a+du]})}
  function free(tl,a,b){return !legsOf(tl).some(function(r){return !(b+75<=r[0]||r[1]+75<=a)})}
  function atStation(tl,date,depMin,fr){var at=null;try{at=window.kgmTailAtR913(tl,date,depMin)}catch(_){}if(at==null)at=(S.tsaFleet&&S.tsaFleet[tl])?'TSA':'TPE';if(at==='TSA'&&fr==='TPE')at='TPE';if(at==='TPE'&&fr==='TSA')at='TSA';return at===fr}
  function badArr(m){m=((m%1440)+1440)%1440;return m>=30&&m<360}
  function newCode(){var used={};AF().forEach(function(f){if(f&&f.code)used[f.code]=1});for(var n=2001;n<2999;n++)if(!used['KX'+n])return 'KX'+n;return 'KX2999'}
  function plan(P){
    var r=rec(P.fr,P.to),types=P.type?[P.type]:r.types,du=dur(P.fr,P.to),out=[];
    var starts=P.time!=null?[P.time,P.time+30,P.time-30,P.time+60,P.time-60,P.time+90,P.time+120]:[];for(var s=7*60;s<=22*60;s+=30)starts.push(s);
    types.forEach(function(t){var tails=[];try{tails=(tailsFor(t)||[]).slice()}catch(_){}
      tails=tails.filter(function(tl){return (S.tailStatus||{})[tl]!=='maintenance'&&!(S.fleetMaintenanceR830||[]).some(function(m){return m.tail===tl&&P.date>=m.from&&P.date<=m.until})});
      for(var i=0;i<starts.length&&out.filter(function(o){return o.type===t}).length<(P.type?3:1);i++){var dep=starts[i];if(dep<5*60||dep>23*60+30)continue;
        var arrL=dep+du+Math.round((tz(P.to)-tz(P.fr))*60);if(badArr(arrL))continue;
        var a=abs(P.date,hm(dep),P.fr),b=a+du,rdep=arrL+turn(t),rArrL=rdep+du+Math.round((tz(P.fr)-tz(P.to))*60);if(P.round&&badArr(rArrL))continue;
        var end=P.round?(b+turn(t)+du):b;
        var tl=tails.filter(function(x){return atStation(x,P.date,dep,P.fr)&&free(x,a,end)})[0];if(!tl)continue;
        if(out.some(function(o){return o.dep===hm(dep)&&o.type===t}))continue;
        out.push({type:t,tail:tl,dep:hm(dep),arr:hm(arrL),dd:Math.floor(arrL/1440),rdep:hm(rdep),rdd:Math.floor(rdep/1440),rarr:hm(rArrL),rad:Math.floor(rArrL/1440),du:du})}});
    return {r:r,opts:out.slice(0,3)}}
  function optTxt(o,i,P){var dd=function(n){return n>0?'⁺'+n:''};return (i+1)+'）'+o.type+' '+o.tail+'：'+P.fr+' '+o.dep+' → '+P.to+' '+o.arr+dd(o.dd)+(P.round?('，回程 '+P.to+' '+o.rdep+dd(o.rdd)+' → '+P.fr+' '+o.rarr+dd(o.rad)):'')}
  function start(t){
    var A=aps(t),d=dateIn(t);if(A.length<2)return z()?'請告訴我航線與日期，例如「加開 TPE-NRT 11/5」或「11/8 臨時航班 台北到首爾 B789 09:30」。':'Tell me the route and date.';
    if(!d)d=D(today(),1);
    var P={kind:'temp',fr:A[0],to:A[1],date:d,type:typeIn(t),time:timeIn(t),round:!/單程|只飛去|one-?way/i.test(t),sale:!/不(開放)?販售|不賣|no ?sale/i.test(t),at:Date.now()};
    var pl=plan(P);P.opts=pl.opts;S.adminAiPendR1025B=P;
    var head=(z()?'臨時航班 ':'Temporary flight ')+P.fr+'→'+P.to+' '+P.date+(P.round?(z()?'（含回程）':' (return incl.)'):'')+'\n'+(z()?'建議機型：':'Suggested type: ')+pl.r.why+(P.type?(z()?'（你指定 '+P.type+'）':''):'')+'；'+(z()?'飛行約 ':'block ~')+Math.floor(pl.opts[0]?pl.opts[0].du/60:dur(P.fr,P.to)/60)+(z()?' 小時 ':'h ')+((pl.opts[0]?pl.opts[0].du:dur(P.fr,P.to))%60)+(z()?' 分':'m');
    if(!pl.opts.length){S.adminAiPendR1025B=null;return head+'\n\n'+(z()?'這一天找不到「當時已經在 '+P.fr+'」而且前後勤務排得開的機身'+(P.type?'（'+P.type+'）':'')+'。可以換一天、換機型，或先安排一段調機。':'No aircraft available.')}
    return head+'\n\n'+(z()?'可行方案（機身當時已在 '+P.fr+'、前後勤務排得開、不在凌晨抵達）：':'Options:')+'\n'+pl.opts.map(function(o,i){return optTxt(o,i,P)}).join('\n')
      +'\n\n'+(z()?'回覆 1／2／3 選方案；也可以改「機型 B789」「時間 10:30」「單程」。預設開放販售，要只排班不賣票請說「不販售」。':'Reply 1/2/3.');
  }
  function create(P,o){
    var code=newCode(),code2=P.round?('KX'+(+code.slice(2)+1)):'',f={code:code,fr:P.fr,to:P.to,dep:o.dep,arr:o.arr,dd:o.dd,dur:o.du,acft:o.type,days:'daily',effFrom:P.date,effTo:P.date,tempR49:true,newRouteR830:true,noSaleR913:!P.sale,aiTempR1025B:true,createdAtR1025B:new Date().toISOString()};
    S.customFlights=S.customFlights||[];S.customFlights.push(f);S.tailAssign=S.tailAssign||{};var L=S.tailAssign[o.tail]=S.tailAssign[o.tail]||[];
    L.push({date:P.date,code:code,route:P.fr+'→'+P.to,fr:P.fr,to:P.to,dep:o.dep,arr:o.arr,dd:o.dd,manualR69:true,newRouteR830:true,aiTempR1025B:true});
    var r2=null;if(P.round){var rd=D(P.date,o.rdd);r2={code:code2,fr:P.to,to:P.fr,dep:o.rdep,arr:o.rarr,dd:o.rad-o.rdd,dur:o.du,acft:o.type,days:'daily',effFrom:rd,effTo:rd,tempR49:true,newRouteR830:true,noSaleR913:!P.sale,aiTempR1025B:true,createdAtR1025B:f.createdAtR1025B};
      S.customFlights.push(r2);L.push({date:rd,code:code2,route:P.to+'→'+P.fr,fr:P.to,to:P.fr,dep:o.rdep,arr:o.rarr,dd:r2.dd,manualR69:true,newRouteR830:true,aiTempR1025B:true})}
    try{if(window.kgmClearRotationCacheR72)window.kgmClearRotationCacheR72()}catch(_){}
    try{logAct('AI 建立臨時航班',code+' '+P.fr+'→'+P.to+' '+P.date+' '+o.type+' '+o.tail+(r2?'（回程 '+code2+'）':''))}catch(_){}
    try{save()}catch(_){}
    return '✓ '+(z()?'已建立 ':'Created ')+code+' '+P.fr+'→'+P.to+' '+P.date+' '+o.dep+'–'+o.arr+(r2?('，回程 '+code2+' '+P.to+'→'+P.fr+' '+r2.effFrom+' '+o.rdep+'–'+o.rarr):'')+' · '+o.type+' '+o.tail+' · '+(P.sale?(z()?'已開放販售（訂票頁查得到）':'on sale'):(z()?'不開放販售（只排班）':'not on sale'))+(z()?'。飛機排班已寫入這架；組員班表會在背景重排。':'.');
  }
  function step(t){var P=S.adminAiPendR1025B;if(!P||P.kind!=='temp')return null;if(Date.now()-P.at>30*60000){S.adminAiPendR1025B=null;return null}
    if(/^(算了|不要了|放棄|cancel)$/i.test(t.trim())){S.adminAiPendR1025B=null;return z()?'好，沒有建立。':'Cancelled.'}
    P.at=Date.now();var ch=false,ty=typeIn(t),tm=timeIn(t);if(ty&&ty!==P.type){P.type=ty;ch=true}if(tm!=null&&/時間|點|:|：/.test(t)&&!/^\s*[123]\s*$/.test(t)){P.time=tm;ch=true}
    if(/單程/.test(t)&&P.round){P.round=false;ch=true}if(/來回|含回程/.test(t)&&!P.round){P.round=true;ch=true}
    if(/不(開放)?販售|不賣|只排班/.test(t))P.sale=false;else if(/開放販售|要賣|販售/.test(t))P.sale=true;
    if(ch){var pl=plan(P);P.opts=pl.opts;if(!pl.opts.length)return z()?'改了之後找不到可用的機身與時間，換一個機型或時間試試。':'No options.';
      return (z()?'更新後的方案：':'Updated options:')+'\n'+pl.opts.map(function(o,i){return optTxt(o,i,P)}).join('\n')+'\n\n'+(z()?'回覆 1／2／3 選方案（目前'+(P.sale?'開放販售':'不販售')+'）。':'Reply 1/2/3.')}
    var m=/^\s*(?:方案\s*)?([123])\b/.exec(t);if(m){var o=P.opts[+m[1]-1];if(!o)return z()?'沒有這個方案。':'No such option.';S.adminAiPendR1025B=null;return create(P,o)}
    if(/販售|不賣|只排班/.test(t))return z()?('已記下：'+(P.sale?'開放販售':'不販售')+'。請回覆 1／2／3 選方案。'):'Noted.';
    return null}
  function isTemp(t){return /臨時航班|加班機|加開|加飛|增開|開一班|新增.{0,6}航班|extra (section|flight)|temporary flight/i.test(t)&&!/取消|延誤|查|哪些|有沒有/.test(t)}
  window.kgmAiTempFlightR1025B=function(a){var t=String((a&&a.text)||'');var r=(S.adminAiPendR1025B&&!isTemp(t))?step(t):start(t);return {ok:true,msg:r||(z()?'請回覆 1／2／3 選方案。':'Reply 1/2/3.')}};
  function hook(){var a0=window.kgmAdminAiAskR929;if(typeof a0!=='function'||a0.__k25)return;
    var w=async function(text){var t=String(text||'').trim(),r=null;
      try{if(isTemp(t))r=start(t);else if(S.adminAiPendR1025B)r=step(t)}catch(e){r=(z()?'處理時發生錯誤：':'Error: ')+(e&&e.message||e)}
      if(r==null)return a0.apply(this,arguments);
      try{var st=S.adminAiR929||(S.adminAiR929=LS.get('kgm_adminai929',{})||{}),k=(S.adminUser||{}).empId||'ADMIN',L=st[k]=st[k]||[];
        L.push({role:'user',text:t,at:new Date().toISOString()});L.push({role:'assistant',text:r,at:new Date().toISOString(),src:'local',note:z()?'站內 AI 引擎處理（依同一套權限執行）':'Built-in engine'});LS.set('kgm_adminai929',st)}catch(_){}
      try{window.kgmAdminAiDrawR929&&window.kgmAdminAiDrawR929()}catch(_){}try{render()}catch(_){}};
    try{Object.keys(a0).forEach(function(k){if(!(k in w))w[k]=a0[k]})}catch(_){}w.__k25=1;window.kgmAdminAiAskR929=w}
  hook();setTimeout(hook,0);setTimeout(hook,3500);setTimeout(hook,8000);
})();

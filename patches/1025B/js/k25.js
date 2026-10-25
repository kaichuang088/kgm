
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

/* ══ 1004A：KGM＋合作航空的行程 —— 一家航空一個訂位代號 ══════════════════════
   使用者：「如果是訂購 KGM＋其他航空的組合航班要給多個 PNR」「KGM 的 PNR 處理改票退票，
   合作航空的 PNR 處理選位、選餐、報到」「報到要兩個都可以」。
   · 合作航空營運的航段（聯營 KX 班號、operatorFlight＝JL096 這種）依營運航空分組，每家一個 6 碼代號，
     由 KGM 代號＋航空代碼固定推出（重新整理不會變），第一次算出來就存在訂位上。
   · 行程管理輸入任何一個代號都查得到同一筆行程；用合作航空代號進來時只能選位／選餐（該航空的航段）與報到，
     改票、取消、退款、里程升等要用 KGM 代號。用 KGM 代號對合作航空營運的航段選位／選餐，會請旅客改用該航空代號。
   · 行程管理與訂位完成頁都列出全部代號與各自負責的事；訂位確認信也附上合作航空代號。 */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function h32(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function code6(seed){var out='',h=h32(seed),g=h32(seed+'#');for(var i=0;i<6;i++){var n=(i<3?h:g);out+=CH[(n>>>(i%3*8))%CH.length]}return out}
  function segsOf(b){try{return (typeof window.segs7==='function'?window.segs7(b):[])||[]}catch(_){return []}}
  function airOf(f){
    if(!f||!f.partner)return null;
    var m=/^([A-Z0-9]{2})\s*\d/.exec(String(f.operatorFlight||''));
    return m?m[1]:null;
  }
  function bkOf(pnr){pnr=String(pnr||'').toUpperCase();return (S.bookings||[]).filter(function(b){return b&&String(b.pnr||'').toUpperCase()===pnr})[0]||null}
  /* 這筆訂位的合作航空代號：[{air,name,pnr,flights:[JL096],segs:['out']}] */
  function list(b){
    if(!b||!b.pnr)return [];
    var g={},order=[];
    segsOf(b).forEach(function(s){
      var a=airOf(s&&s.f);if(!a)return;
      if(!g[a]){g[a]={air:a,name:s.f.operator||a,flights:[],segs:[]};order.push(a)}
      if(g[a].flights.indexOf(s.f.operatorFlight)<0)g[a].flights.push(s.f.operatorFlight);
      if(g[a].segs.indexOf(s.key)<0)g[a].segs.push(s.key);
    });
    if(!order.length)return [];
    var st=b.partnerPnrsR929=b.partnerPnrsR929||{};
    order.forEach(function(a){
      if(!st[a]){
        var p=code6(b.pnr+'|'+a),k=0;
        while((bkOf(p)||p===b.pnr)&&k<20){p=code6(b.pnr+'|'+a+'|'+(++k))}
        st[a]=p;
      }
      g[a].pnr=st[a];
    });
    return order.map(function(a){return g[a]});
  }
  window.kgmPartnerPnrsR929=list;
  /* 任何一個代號 → {pnr:KGM 代號, air, partnerPnr} */
  window.kgmResolvePnrR929=function(raw){
    var v=String(raw||'').toUpperCase().trim();if(!v)return null;
    if(bkOf(v))return {pnr:v,air:null};
    var bs=S.bookings||[];
    for(var i=0;i<bs.length;i++){
      var b=bs[i];if(!b||!b.pnr)continue;
      var st=b.partnerPnrsR929;
      if(st){for(var a in st)if(st[a]===v)return {pnr:b.pnr,air:a,partnerPnr:v}}
    }
    for(var j=0;j<bs.length;j++){
      var L=list(bs[j]);for(var q=0;q<L.length;q++)if(L[q].pnr===v)return {pnr:bs[j].pnr,air:L[q].air,partnerPnr:v};
    }
    return null;
  };
  /* 目前是用哪一個代號在看這筆行程 */
  function mode(pnr){var m=S.partnerViewR929;return (m&&m.pnr===pnr)?m:null}
  function segAir(b,seg){var s=segsOf(b).filter(function(x){return x&&x.key===seg})[0];return s?{air:airOf(s.f),f:s.f}:null}

  /* 行程管理：用合作航空代號也查得到 */
  try{
    var f0=window.findTripR20;
    if(typeof f0==='function'&&!f0.__r929){
      var fw=function(){
        try{
          var el=document.getElementById('r20Pnr');
          var r=el?window.kgmResolvePnrR929(el.value):null;
          if(r&&r.air){el.value=r.pnr;S.partnerViewR929={pnr:r.pnr,air:r.air,partnerPnr:r.partnerPnr}}
          else S.partnerViewR929=null;
        }catch(_){}
        return f0.apply(this,arguments);
      };
      fw.__r929=1;window.findTripR20=fw;
    }
  }catch(_){}

  function why(b,kind,seg){
    var m=mode(b.pnr),L=list(b);if(!L.length)return '';
    var sa=seg?segAir(b,seg):null;
    if(m){
      var me=L.filter(function(x){return x.air===m.air})[0]||{name:m.air};
      if(/^(change|cancel|refund|upgrade)$/.test(kind))
        return z()?('您目前以 '+me.name+' 訂位代號 '+m.partnerPnr+' 查詢。改票、取消、退款與里程升等由 KGM 辦理，請改用 KGM 訂位代號 '+b.pnr+' 查詢後操作。')
                  :('You are viewing this trip with the '+me.name+' reference '+m.partnerPnr+'. Changes, cancellations, refunds and mileage upgrades are handled by KGM — please use the KGM reference '+b.pnr+'.');
      if(/^(seat|meal)$/.test(kind)&&sa&&sa.air!==m.air)
        return z()?(sa.f.code+' 由 KGM 營運，選位與選餐請改用 KGM 訂位代號 '+b.pnr+' 辦理。')
                  :(sa.f.code+' is operated by KGM. Use the KGM reference '+b.pnr+' for seats and meals.');
      return '';
    }
    if(/^(seat|meal)$/.test(kind)&&sa&&sa.air){
      var it=L.filter(function(x){return x.air===sa.air})[0];
      if(it)return z()?(sa.f.code+' 由 '+it.name+' 營運（'+sa.f.operatorFlight+'），選位與選餐請使用 '+it.name+' 訂位代號 '+it.pnr+' 辦理（行程管理輸入這個代號即可）。')
                     :(sa.f.code+' is operated by '+it.name+' ('+sa.f.operatorFlight+'). Use the '+it.name+' reference '+it.pnr+' for seats and meals.');
    }
    return '';
  }
  window.kgmPartnerWhyR929=function(pnr,kind,seg){var b=bkOf(pnr);return b?why(b,kind,seg):''};
  function say(msg){
    try{
      var old=document.querySelector('.k929-pnr-msg');if(old)old.remove();
      var d=document.createElement('div');d.className='k929-pnr-msg';d.setAttribute('role','alert');
      d.innerHTML='<b>'+(z()?'請使用對應的訂位代號':'Use the matching booking reference')+'</b><span></span><button type="button" aria-label="close">×</button>';
      d.querySelector('span').textContent=msg;
      d.querySelector('button').onclick=function(){d.remove()};
      document.body.appendChild(d);
      setTimeout(function(){try{d.remove()}catch(_){}},9000);
    }catch(_){}
  }
  /* 按鈕：選位／選餐是直接改 S.mtOpen，改票／取消走 tripSvcR25、升等走 pickUpgradeFlight0813 —— 一律在點擊的捕獲階段先檢查 */
  document.addEventListener('click',function(e){
    try{
      var el=e.target;
      while(el&&el!==document.body&&!(el.getAttribute&&el.getAttribute('onclick')))el=el.parentNode;
      if(!el||!el.getAttribute)return;
      var oc=String(el.getAttribute('onclick')||''),pnr='',seg='',kind='';
      var m1=/S\.mtOpen=\{pnr:'([^']+)',seg:'([^']+)',tab:'(seat|meal)'\}/.exec(oc);
      var m2=/tripSvcR25\('([^']+)','([^']+)','(change|cancel|refund)'\)/.exec(oc);
      var m3=/pickUpgradeFlight0813\('([^']+)','([^']+)'\)/.exec(oc);
      if(m1){pnr=m1[1];seg=m1[2];kind=m1[3]}else if(m2){pnr=m2[1];seg=m2[2];kind=m2[3]}else if(m3){pnr=m3[1];seg=m3[2];kind='upgrade'}else return;
      var b=bkOf(pnr);if(!b)return;
      var w=why(b,kind,seg);if(!w)return;
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      say(w);
    }catch(_){}
  },true);
  /* 從選單意圖直接呼叫的改票／取消／退款也擋 */
  function wrapSvc(){
    var t=window.tripSvcR25;
    if(typeof t!=='function'||t.__r929)return;
    var w=function(pnr,seg,kind){
      try{var b=bkOf(pnr);if(b&&/^(change|cancel|refund)$/.test(String(kind||''))){var m=why(b,String(kind),seg);if(m){say(m);return}}}catch(_){}
      return t.apply(this,arguments);
    };
    try{Object.keys(t).forEach(function(k){if(!(k in w))w[k]=t[k]})}catch(_){}
    w.__r929=1;window.tripSvcR25=w;try{tripSvcR25=w}catch(_){}
  }
  /* 行程管理的「更改行程／取消退款」卡片是另一個點擊路由直接呼叫 kgmPnrGoR59（不經 tripSvcR25），這一支也要擋 */
  function wrapGo(){
    var g=window.kgmPnrGoR59;
    if(typeof g!=='function'||g.__r929)return;
    var w=function(pnr,seg,tab){
      try{var b=bkOf(pnr),k=String(tab||'change');if(b&&/^(change|cancel|refund|upgrade|seat|meal)$/.test(k)){var m=why(b,k,seg||'out');if(m){say(m);return}}}catch(_){}
      return g.apply(this,arguments);
    };
    try{Object.keys(g).forEach(function(k){if(!(k in w))w[k]=g[k]})}catch(_){}
    w.__r929=1;window.kgmPnrGoR59=w;
  }
  wrapSvc();wrapGo();setTimeout(function(){wrapSvc();wrapGo()},0);setTimeout(function(){wrapSvc();wrapGo()},2000);

  /* 畫面：代號清單 */
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  window.kgmPnrNoteHtmlR929=function(b){
    var L=list(b);if(!L.length)return '';
    var rows='<li><b>KGM</b><code>'+esc(b.pnr)+'</code><span>'+(z()?'改票、取消／退款、里程升等；KGM 營運航段的選位與選餐':'Changes, cancellations/refunds, mileage upgrades; seats & meals on KGM-operated flights')+'</span></li>'
      +L.map(function(x){return '<li><b>'+esc(x.name)+'</b><code>'+esc(x.pnr)+'</code><span>'+esc(x.flights.join('、'))+(z()?' 的選位與選餐':' seats & meals')+'</span></li>'}).join('');
    return '<div class="k929-pnrs"><div class="k929-pnrs-h">'+(z()?'這筆行程有 '+(L.length+1)+' 個訂位代號（一家航空一個）':'This trip has '+(L.length+1)+' booking references (one per airline)')+'</div>'
      +'<ul>'+rows+'</ul><p>'+(z()?'兩個代號都可以辦理報到；在行程管理輸入任何一個代號都查得到這筆行程。':'Check in with any of these references; any of them opens this trip in Manage Booking.')+'</p></div>';
  };
  function paint(){
    try{
      var box=document.querySelector('#app .k56-trip');
      if(box){
        var pnr=(S.mtOnly||'').toUpperCase(),b=bkOf(pnr),L=list(b);
        if(b&&L.length&&!box.querySelector('.k929-pnrs')){
          var m=mode(b.pnr);
          var pb=box.querySelector('.k217-pnr');
          if(pb&&!pb.querySelector('.k929-pnr-alt')){
            if(m){pb.querySelector('small').textContent=z()?'KGM 訂位代號':'KGM reference'}
            else pb.querySelector('small').textContent=z()?'KGM 訂位代號':'KGM reference';
            L.forEach(function(x){
              var d=document.createElement('div');d.className='k929-pnr-alt'+(m&&m.air===x.air?' on':'');
              d.innerHTML='<small></small><b></b>';d.querySelector('small').textContent=x.name+(z()?' 訂位代號':' reference');d.querySelector('b').textContent=x.pnr;
              pb.appendChild(d);
            });
            if(m)pb.classList.add('k929-via-partner');
          }
          var hero=box.querySelector('.k217-hero-top');
          var host=hero&&hero.parentElement;
          var note=document.createElement('div');note.innerHTML=window.kgmPnrNoteHtmlR929(b);note=note.firstChild;
          if(m){var t=document.createElement('div');t.className='k929-pnrs-now';t.textContent=(z()?'您目前以 ':'Viewing with ')+(L.filter(function(x){return x.air===m.air})[0]||{name:m.air}).name+(z()?' 訂位代號 ':' reference ')+m.partnerPnr+(z()?' 查詢':'');note.insertBefore(t,note.firstChild)}
          if(host&&host.parentElement)host.parentElement.insertBefore(note,host.nextSibling);else box.insertBefore(note,box.firstChild);
          L.forEach(function(x){x.segs.forEach(function(k){
            var sc=box.querySelector('.k56-seg[data-seg="'+k+'"] .k56-foot');
            if(sc&&!sc.querySelector('.k929-pnr-pill')){var p=document.createElement('span');p.className='k217-pill k929-pnr-pill';p.textContent=x.name+(z()?' 訂位代號 ':' ref ')+x.pnr;sc.insertBefore(p,sc.children[1]?sc.children[2]||null:null)}
          })});
        }
      }
      /* 訂位完成頁 */
      var app=document.getElementById('app');
      if(app&&S.view==='booking'&&S.phase==='success'&&!app.querySelector('.k929-pnrs')){
        var bk=bkOf(S.pnr||'');
        if(bk&&list(bk).length){
          var tgt=[].slice.call(app.querySelectorAll('*')).filter(function(e){return e.children.length===0&&String(e.textContent||'').trim()===bk.pnr})[0];
          var card=tgt&&tgt.closest('.card,section,div');
          var n2=document.createElement('div');n2.innerHTML=window.kgmPnrNoteHtmlR929(bk);n2=n2.firstChild;n2.classList.add('k929-pnrs-success');
          if(card&&card.parentElement)card.parentElement.insertBefore(n2,card.nextSibling);
        }
      }
    }catch(e){try{console.warn('1004A partner pnr',e)}catch(_){}}
  }
  window.kgmPartnerPnrPaintR929=paint;
  if(!document.getElementById('k929-pnr-css')){
    var st=document.createElement('style');st.id='k929-pnr-css';
    st.textContent='.k929-pnr-alt{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.22)}'
      +'.k929-pnr-alt small{display:block}.k929-pnr-alt b{font-size:.78em;letter-spacing:.14em}'
      +'.k217-pnr.k929-via-partner>b{opacity:.72}.k929-pnr-alt.on b{color:#f3d58a}'
      +'.k929-pnrs{margin:14px 0;padding:14px 18px;border:1px solid #e3d6b4;border-radius:14px;background:#fffdf6;color:#23313a;font-size:13px}'
      +'.k929-pnrs-h{font-weight:800;color:#0f3d2e;margin-bottom:8px}.k929-pnrs-now{display:inline-block;margin-bottom:8px;padding:2px 10px;border-radius:999px;background:#0f3d2e;color:#fff;font-size:12px;font-weight:700}'
      +'.k929-pnrs ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}.k929-pnrs li{display:grid;grid-template-columns:minmax(110px,auto) 90px 1fr;gap:10px;align-items:baseline}'
      +'.k929-pnrs li b{color:#0f3d2e}.k929-pnrs code{font:800 14px ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#8a6a1f}.k929-pnrs li span{color:#5b6570}'
      +'.k929-pnrs p{margin:8px 0 0;color:#5b6570;font-size:12px}'
      +'.k929-pnrs-success{max-width:640px;margin:14px auto;text-align:left}'
      +'@media(max-width:640px){.k929-pnrs li{grid-template-columns:1fr auto}.k929-pnrs li span{grid-column:1/-1}}'
      +'.k929-pnr-pill{background:#fff8e6!important;border-color:#e3d6b4!important;color:#8a6a1f!important;font-weight:700}'
      +'.k929-pnr-msg{position:fixed;z-index:10050;top:84px;left:50%;transform:translateX(-50%);width:min(560px,calc(100vw - 32px));box-sizing:border-box;display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:12px;background:#fff4e5;border:1px solid #f0c27a;color:#6b4a12;font-size:13px;box-shadow:0 10px 28px rgba(0,0,0,.16)}'
      +'.k929-pnr-msg b{white-space:nowrap}.k929-pnr-msg span{flex:1}.k929-pnr-msg button{border:0;background:none;font-size:18px;line-height:1;color:#6b4a12;cursor:pointer}';
    (document.head||document.documentElement).appendChild(st);
  }
  var RAF=0;
  function hook(){
    var app=document.getElementById('app');if(!app)return false;if(app.__k929pnr)return true;app.__k929pnr=1;
    new MutationObserver(function(){if(RAF)return;RAF=requestAnimationFrame(function(){RAF=0;paint()})}).observe(app,{childList:true,subtree:true});
    paint();return true;
  }
  if(!hook())document.addEventListener('DOMContentLoaded',hook);
  /* 訂位確認信附上合作航空代號 */
  try{
    var n0=window.kgmNotify;
    if(typeof n0==='function'&&!n0.__r929pnr){
      var nw=function(ev,data,to){
        try{
          if(ev==='booking.confirmed'&&data&&data.pnr){
            var b=bkOf(data.pnr),L=list(b);
            if(L.length){
              data=Object.assign({},data,{partnerPnrs:L.map(function(x){return {airline:x.name,code:x.air,pnr:x.pnr,flights:x.flights}})});
              data.message=(data.message?data.message+'\n\n':'')+(z()?'合作航空訂位代號：':'Partner airline references: ')
                +L.map(function(x){return x.name+' '+x.pnr+'（'+x.flights.join('、')+'）'}).join('；')
                +(z()?'。改票與退票請用 KGM 訂位代號 ':'. Use KGM reference ')+data.pnr+(z()?'；兩個代號都可以辦理報到。':' for changes and refunds; check in with either reference.');
            }
          }
        }catch(_){}
        return n0.call(this,ev,data,to);
      };
      nw.__r929pnr=1;nw.__r115=n0.__r115;window.kgmNotify=nw;try{kgmNotify=nw}catch(_){}
    }
  }catch(_){}
})();

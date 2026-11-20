/* ══ 1120A J3（使用者：「如果一段行程有超過兩個航段，那已經結束的航段無法改票！！」）══
   實測（多航段 TPE→HKG→TPE→NRT，第一段 11/17 已飛）：行程管理「更改行程」帶的是 'out'＝第一段 → 改票頁「目前航班 KX351 11/17」還能選新日期；
   第二段的卡片帶 'mc1'，改票頁認不得 → 也落到第一段。
   改：最外層包 openTicketService（行程管理、選單、AI、tripSvcR25 最後都走這裡）——
   · 航段代號一律換成改票頁認得的 segs7 代號（'out'＝第一段、'mcN'＝第 N+1 段 → 'segN'）；
   · 已完成（已起飛）的航段不能改：帶到下一個還沒飛的航段，並說明；全部飛完 → 不開改票頁、說明原因；
   · 改票頁上方加「選擇要更改的航段」：還沒飛的可以點，已完成的灰色寫「已完成・無法改票」。
   · 送出前（doCheckChange／doChangeFlight2）再擋一次。 */
(function(){
  if(window.__chg120)return;window.__chg120=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function bk(pnr){return (S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0]||null}
  function segs(b){try{return (window.segs7?window.segs7(b):[])||[]}catch(_){return []}}
  function today(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  /* 已完成＝已起飛：日期在今天以前，或今天且已經過了起飛時間（用網站原本的 segFlown 判抵達；起飛時間用出發地當地時間） */
  function done(s){if(!s||!s.f)return false;var d=s.date||s.f.date||'';if(!d)return false;if(d<today())return true;
    try{if(typeof segFlown==='function'&&segFlown(Object.assign({},s.f,{date:d}),d))return true}catch(_){}
    if(d===today()){try{var m=/^(\d{1,2}):(\d{2})/.exec(String(s.f.dep||''));var tz=(typeof window.kgmTzAtR1026C==='function'?window.kgmTzAtR1026C(s.f.fr,d):null);if(m){var off=(tz!=null?tz:8),now=new Date(Date.now()+off*3600000),nm=now.getUTCHours()*60+now.getUTCMinutes();if(nm>=(+m[1])*60+(+m[2]))return true}}catch(_){}}
    return false}
  function norm(b,seg){var L=segs(b);if(!L.length)return seg;seg=String(seg||'out');if(L.some(function(s){return s.key===seg}))return seg;
    var m=/^mc(\d+)$/.exec(seg);if(m&&L[+m[1]])return L[+m[1]].key;if(seg==='out')return L[0].key;if(seg==='inb'){var i=L.filter(function(s){return /^inb/.test(s.key)})[0];if(i)return i.key}return seg}
  function lbl(s){return (s.f.code||'')+' '+(s.f.fr||'')+'→'+(s.f.to||'')+' '+String(s.date||'').slice(5).replace('-','/')}
  window.kgmSegDoneR1120A=function(pnr,seg){var b=bk(pnr);if(!b)return false;var k=norm(b,seg),s=segs(b).filter(function(x){return x.key===k})[0];return done(s)};
  function wrap(){var O=window.openTicketService;if(typeof O!=='function'||O.__chg120)return;
    var w=function(pnr,seg,tab){
      if(String(tab||'change')==='change'){var b=bk(pnr),L=b?segs(b):[];
        if(b&&L.length){var k=norm(b,seg),s=L.filter(function(x){return x.key===k})[0]||L[0],zh=z();
          if(done(s)){var nx=L.filter(function(x){return !done(x)})[0];
            if(!nx){alert(zh?'這筆行程的航段都已完成，已完成的航段無法改票。':'All sectors of this trip have been flown; completed sectors cannot be changed.');return}
            S.chgNoteR1120A={pnr:pnr,k:nx.key,at:Date.now(),msg:(zh?'已完成的航段 '+lbl(s)+' 無法改票，已帶到下一段 '+lbl(nx)+'。':'Completed sector '+lbl(s)+' cannot be changed — showing the next sector '+lbl(nx)+'.')};k=nx.key}
          else{k=s.key;var N0=S.chgNoteR1120A;if(!(N0&&N0.pnr===pnr&&N0.k===k&&Date.now()-(N0.at||0)<3000))S.chgNoteR1120A=null}   /* 直接選還沒飛的航段：不顯示「已帶到下一段」 */
          return O.call(this,pnr,k,tab)}}
      return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__chg120=1;window.openTicketService=w;try{openTicketService=w}catch(_){}}
  /* 送出前再擋（改票頁停在已完成航段、或從程式直接呼叫） */
  function guard(name){var O=window[name];if(typeof O!=='function'||O.__chg120)return;
    var w=function(){try{var o=S.ticketService||{};var pnr=name==='doChangeFlight2'?arguments[0]:o.pnr,seg=name==='doChangeFlight2'?arguments[1]:o.seg;if(pnr&&window.kgmSegDoneR1120A(pnr,seg)){alert(z()?'這個航段已經完成，無法改票。':'This sector has been flown and cannot be changed.');return}}catch(_){}return O.apply(this,arguments)};
    try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__chg120=1;window[name]=w;try{if(name==='doCheckChange')doCheckChange=w;else if(name==='doChangeFlight2')doChangeFlight2=w}catch(_){}}
  function all(){wrap();guard('doCheckChange');guard('doChangeFlight2')}
  all();[0,800,3000,9000,20000].forEach(function(t){setTimeout(all,t)});
  /* 改票頁：選擇航段 */
  function paint(){try{
    if(S.view!=='ticketService')return;var o=S.ticketService||{};if(o.tab&&o.tab!=='change')return;var b=bk(o.pnr);if(!b)return;var L=segs(b);if(L.length<2)return;
    var grid=document.querySelector('#app .ticket-change-grid');if(!grid)return;var cur=norm(b,o.seg),zh=z();
    var sig=o.pnr+'|'+cur+'|'+(S.chgNoteR1120A&&S.chgNoteR1120A.k===cur?'n':'')+'|'+L.map(function(s){return s.key+(done(s)?'x':'')}).join(',');var old=document.querySelector('#app .k120seg');if(old&&old.getAttribute('data-s')===sig)return;if(old)old.remove();
    var h='<div class="k120seg" data-s="'+E(sig)+'"><b>'+(zh?'選擇要更改的航段':'Choose the sector to change')+'</b><div class="k120seg-l">'
      +L.map(function(s,i){var d=done(s),on=s.key===cur;return d?'<span class="k120seg-i done"><i>'+(i+1)+'</i><em>'+E(lbl(s))+'</em><small>'+(zh?'已完成・無法改票':'Flown · not changeable')+'</small></span>'
        :'<button type="button" class="k120seg-i'+(on?' on':'')+'" onclick="openTicketService(\''+E(o.pnr)+'\',\''+E(s.key)+'\',\'change\')"><i>'+(i+1)+'</i><em>'+E(lbl(s))+'</em><small>'+(on?(zh?'目前選擇':'Selected'):(zh?'可更改':'Changeable'))+'</small></button>'}).join('')+'</div>'
      +((S.chgNoteR1120A&&S.chgNoteR1120A.pnr===o.pnr&&S.chgNoteR1120A.k===cur)?'<p>'+E(S.chgNoteR1120A.msg)+'</p>':'')+'</div>';
    grid.insertAdjacentHTML('beforebegin',h)}catch(_){}}
  function hookRender(){var r0=window.render;if(typeof r0!=='function'||r0.__chg120)return;var w=function(){var r=r0.apply(this,arguments);paint();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__chg120=1;window.render=w;try{render=w}catch(_){}}
  hookRender();[0,1500,4000,12000].forEach(function(t){setTimeout(hookRender,t)});
  var CSS='.k120seg{border:1px solid #e3e7ec;border-radius:14px;background:#fff;padding:14px 16px;margin:0 0 14px}.k120seg>b{display:block;font-size:12px;letter-spacing:.06em;color:#8A7444;margin-bottom:10px}'
    +'.k120seg-l{display:flex;flex-wrap:wrap;gap:8px}.k120seg-i{display:flex;align-items:center;gap:8px;border:1px solid #dfe6e2;border-radius:12px;padding:8px 12px;background:#fff;font:inherit;color:#17202a;cursor:pointer;text-align:left}'
    +'.k120seg-i i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#eef3f0;color:#0B3D2E;font-size:11px;font-weight:800}.k120seg-i em{font-style:normal;font-weight:700;font-size:13px}.k120seg-i small{font-size:11px;color:#6E7670}'
    +'.k120seg-i.on{border-color:#0B3D2E;box-shadow:0 0 0 1px #0B3D2E inset}.k120seg-i.on i{background:#0B3D2E;color:#fff}'
    +'.k120seg-i.done{cursor:not-allowed;background:#f4f5f4;color:#9aa39f;border-style:dashed}.k120seg-i.done i{background:#e3e6e4;color:#9aa39f}.k120seg-i.done small{color:#b4412b}'
    +'.k120seg p{margin:10px 0 0;font-size:12px;color:#7a5b16;background:#fffaf0;border:1px solid #f0e3c4;border-radius:10px;padding:8px 10px}';
  try{var st=document.createElement('style');st.id='chg120-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();

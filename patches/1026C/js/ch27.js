/* ══ 1026C：販售通路（sell54 最前面問這裡；回 null＝照舊）
   ① 一般訂票的夥伴營運航段（使用者：「非團體的一般訂票，夥伴營運直飛會顯示所選艙等售罄…一樣要修」）
      夥伴營運的座位不在我們的庫存（cabinInventory54 一律 0，1019A 起直飛就整班售罄）→ 依聯營協議給 KX 代碼配額（自由銷售）：
      每班每艙 經濟 30／豪經 8／商務 8／頭等 2 席，扣掉我們已賣出的（真實訂位，同班同日同艙），每個訂位代號最多顯示 9 席。
      團體模式照 1026B（團體代號 30 席）。座位由營運航空在機場劃位。
   ② 只開放包機／只開放旅客訂購（使用者：「有些航班要可以只開放包機或是旅客訂購（現在預設所有航班都可以）」）
      後台「航線管理」頁上方「販售對象」：依班號（＋可選日期區間）設定
        · 只開放包機＝只有已綁定的團體／旅行社帳號（團體訂位）能訂，一般旅客搜尋看得到但標「包機航班」、不能訂；
        · 只開放旅客訂購＝一般旅客才能訂，團體模式不能訂。
      沒設定＝兩者都可（預設）。存在 S.salesModeR1026C（kgm27_salesmode，前後台同步）。 ══ */
(function(){
  'use strict';
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  function grp(){try{return !!(window.kgmGrpOnR1025B&&window.kgmGrpOnR1025B())}catch(_){return false}}
  /* ── ② 販售對象 ── */
  function rules(){S.salesModeR1026C=S.salesModeR1026C||{rules:[]};S.salesModeR1026C.rules=S.salesModeR1026C.rules||[];return S.salesModeR1026C.rules}
  function modeOf(code,date){var R=rules(),m='';for(var i=0;i<R.length;i++){var r=R[i];if(!r||r.code!==code)continue;if(r.from&&date<r.from)continue;if(r.to&&date>r.to)continue;m=r.mode}return m}
  window.kgmSalesModeR1026C=modeOf;
  /* 1026C（交付 1027A）：包機／自創航班核准後的規則帶 owner（團體帳號的會員編號）→ 只有那個帳號能訂（js/cr27.js） */
  function ownerOf(code,date){var R=rules(),o='';for(var i=0;i<R.length;i++){var r=R[i];if(!r||r.code!==code||r.mode!=='charter')continue;if(r.from&&date<r.from)continue;if(r.to&&date>r.to)continue;o=r.owner||''}return o}
  window.kgmSalesOwnerR1026C=ownerOf;
  /* ── ① 夥伴營運配額 ── */
  var ALLOT={Economy:30,Premium:8,Business:8,First:2},PER=9;window.KGM_PARTNER_ALLOT_R1026C={allot:ALLOT,perCode:PER};
  var SOLD=null,SOLDT=0;
  function soldMap(){if(SOLD&&Date.now()-SOLDT<2000)return SOLD;var m={};
    try{(S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled')return;if(window.kgmIsMockBookingR1026C&&window.kgmIsMockBookingR1026C(b))return;var n=(b.paxList||[]).filter(function(p){return p&&p.passengerType!=='INF'}).length||1;
      var segs=typeof window.segs7==='function'?window.segs7(b,true):[{f:b.outF,c:b.outC,date:b.outF&&b.outF.date},{f:b.inbF,c:b.inbC,date:b.inbF&&b.inbF.date}];
      (segs||[]).forEach(function(s){if(!s||!s.f)return;var cab=((FARES[s.c]||{}).cabin)||'Economy',k=s.f.code+'|'+(s.date||s.f.date)+'|'+cab;m[k]=(m[k]||0)+n})})}catch(_){}
    SOLD=m;SOLDT=Date.now();return m}
  function partnerLeft(code,date,flight){var cab=(FARES[code]||{}).cabin||'Economy',al=ALLOT[cab];if(!al)return 0;var sold=soldMap()[flight.code+'|'+date+'|'+cab]||0;return Math.max(0,Math.min(PER,al-sold))}
  window.kgmPartnerLeftR1026C=partnerLeft;
  window.kgmChannelSellR1026C=function(code,date,flight){
    if(!flight||!date)return null;var m=modeOf(flight.code,date),g=grp();
    if(m==='charter'&&!g)return 0;   /* 包機航班：一般旅客不能訂 */
    if(m==='charter'){var ow=ownerOf(flight.code,date);if(ow&&!(S.user&&S.user.id===ow))return 0}   /* 1026C：已被某個團體包下 */
    if(m==='pax'&&g)return 0;        /* 只開放旅客訂購：團體不能訂 */
    if((flight.partner||flight.codeshare)&&!g){if(window.__grp25raw)return null;return partnerLeft(code,date,flight)}
    return null};
  /* ── 搜尋結果標示（包機航班／只開放旅客訂購）── */
  var CHIP={charter:['包機航班・僅開放團體／包機訂位','Charter flight · group/charter booking only'],pax:['僅開放旅客個人訂購（不接受團體）','Individual bookings only']};
  function deco(){try{if(S.view!=='booking'||!S.search)return;var d=S.phase==='sel_inb'?S.search.ret:S.search.dep,g=grp();if(!d)return;
      [].forEach.call(document.querySelectorAll('#app tr.fl-row'),function(tr){var t=tr.innerText||'',mm=t.match(/\b(KX\d{1,4})\s*\|/);if(!mm)return;var md=modeOf(mm[1],d);
        var want=(md==='charter'&&!g)?'charter':(md==='pax'&&g)?'pax':'',old=tr.querySelector('.k27-ch');
        if(!want){if(old)old.remove();return}if(old&&old.getAttribute('data-m')===want)return;if(old)old.remove();
        var c=document.createElement('div');c.className='k27-ch';c.setAttribute('data-m',want);c.textContent=z()?CHIP[want][0]:CHIP[want][1];var td=tr.querySelector('td');if(td)td.appendChild(c)})}catch(_){}}
  var DQ=0;try{new MutationObserver(function(){if(DQ)return;DQ=setTimeout(function(){DQ=0;deco()},60)}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  /* ── 後台：航線管理頁「販售對象」── */
  function who(){try{return (S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''}catch(_){return ''}}
  function done(msg){S.salesModeR1026C.at=new Date().toISOString();S.salesModeR1026C.by=who();try{save()}catch(_){}try{logAct(z()?'販售對象設定':'Sales channel changed',msg)}catch(_){}SOLD=null;paint()}
  function codes(){var o={};try{FLIGHTS.forEach(function(f){if(f&&/^KX\d+$/.test(String(f.code||''))&&!f.partner&&!f.codeshare)o[f.code]=1})}catch(_){}return o}
  window.kgmSalesAddR1026C=function(){var g=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
    var c=g('k27sc').toUpperCase().replace(/\s+/g,''),m=g('k27sm'),f=g('k27sf'),t=g('k27st'),n=g('k27sn');if(/^\d+$/.test(c))c='KX'+c;
    if(!codes()[c]){S.k27sMsg=z()?'找不到班號「'+c+'」（只能設定 KGM 自營航班）。':'Unknown flight '+c;paint();return}
    if(m!=='charter'&&m!=='pax'){S.k27sMsg=z()?'請選販售對象。':'Pick a channel.';paint();return}
    if(f&&t&&t<f){S.k27sMsg=z()?'結束日期不能早於開始日期。':'End before start.';paint();return}
    rules().push({id:'S'+String(Date.now()).slice(-7),code:c,mode:m,from:f||'',to:t||'',note:n,at:new Date().toISOString(),by:who()});S.k27sMsg='';
    done(c+' '+(m==='charter'?(z()?'只開放包機':'charter only'):(z()?'只開放旅客訂購':'individuals only'))+(f||t?'（'+(f||'…')+'～'+(t||'…')+'）':''))};
  window.kgmSalesDelR1026C=function(id){var R=rules(),r=R.filter(function(x){return x.id===id})[0];if(!r)return;S.salesModeR1026C.rules=R.filter(function(x){return x.id!==id});done((z()?'取消 ':'Removed ')+r.code+' '+(r.mode==='charter'?(z()?'只開放包機':'charter'):(z()?'只開放旅客訂購':'individuals')))};
  function html(){var R=rules(),td=T(),Z=z();
    var rows=R.map(function(r){var act=(!r.to||r.to>=td);return '<tr'+(act?'':' class="off"')+'><td><b>'+E(r.code)+'</b></td><td><span class="k27s-m '+r.mode+'">'+(r.mode==='charter'?(Z?'只開放包機':'Charter only'):(Z?'只開放旅客訂購':'Individuals only'))+'</span></td>'
      +'<td>'+(r.from||r.to?E((r.from||(Z?'即日起':'now'))+' ～ '+(r.to||(Z?'不限':'open'))):(Z?'全部日期':'All dates'))+'</td><td class="b">'+E(r.note||'')+'</td><td class="b">'+E(String(r.at||'').slice(0,10))+(r.by?' · '+E(r.by):'')+'</td>'
      +'<td><button type="button" onclick="kgmSalesDelR1026C(\''+E(r.id)+'\')">'+(Z?'取消設定':'Remove')+'</button></td></tr>'}).join('');
    return '<section class="k26z k27s"><header><div><small>SALES CHANNEL</small><h2>'+(Z?'販售對象（包機／旅客訂購）':'Sales channel')+'</h2>'
      +'<p>'+(Z?'預設每一班都開放「旅客訂購」與「團體／包機訂位」。這裡可以把某個班號（或某段日期）設成只開放包機（只有已綁定的團體／旅行社帳號能訂，一般旅客搜尋時標「包機航班」、不能訂），或只開放旅客訂購（團體模式不能訂）。':'By default every flight is open to individuals and groups/charters.')+'</p></div>'
      +'<div class="k26z-meta">'+(R.length?(Z?'共 ':'')+R.length+(Z?' 筆設定':' rules'):(Z?'目前全部航班兩者都可':'All flights open to both'))+'</div></header>'
      +(R.length?'<div class="k26z-scroll"><table class="k26z-t"><thead><tr><th>'+(Z?'班號':'Flight')+'</th><th>'+(Z?'販售對象':'Channel')+'</th><th>'+(Z?'期間':'Period')+'</th><th>'+(Z?'備註':'Note')+'</th><th>'+(Z?'設定':'Set')+'</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'')
      +'<div class="k26z-add"><b>'+(Z?'新增設定':'Add')+'</b><input id="k27sc" placeholder="'+(Z?'班號（例：KX180）':'Flight (e.g. KX180)')+'"><select id="k27sm"><option value="charter">'+(Z?'只開放包機':'Charter only')+'</option><option value="pax">'+(Z?'只開放旅客訂購':'Individuals only')+'</option></select>'
      +'<label>'+(Z?'從':'From')+'<input id="k27sf" type="date"></label><label>'+(Z?'到':'To')+'<input id="k27st" type="date"></label><input id="k27sn" placeholder="'+(Z?'備註（例：XX 旅行社包機）':'Note')+'"><button type="button" onclick="kgmSalesAddR1026C()">'+(Z?'加入':'Add')+'</button>'
      +(S.k27sMsg?'<em>'+E(S.k27sMsg)+'</em>':'')+'</div></section>'}
  function paint(){var el=document.getElementById('k27sales');if(!el)return;var vals={};['k27sc','k27sm','k27sf','k27st','k27sn'].forEach(function(id){var x=document.getElementById(id);if(x)vals[id]=x.value});
    el.innerHTML=html();Object.keys(vals).forEach(function(id){var x=document.getElementById(id);if(x)x.value=vals[id]})}
  function mount(){try{if(!(S.view==='admin'&&S.adminTab==='flightadjust'))return;var m=document.querySelector('#app main')||document.getElementById('app');if(!m)return;
      var el=document.getElementById('k27sales');if(!el||!m.contains(el)){el=document.createElement('div');el.id='k27sales';var zn=document.getElementById('k26zones');if(zn&&zn.parentNode===m)m.insertBefore(el,zn.nextSibling);else m.insertBefore(el,m.firstChild);paint()}}catch(_){}}
  setInterval(mount,700);
  try{var cs=document.createElement('style');cs.id='k27-css';cs.textContent=
    '.k27-ch{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;font:600 11.5px system-ui,sans-serif;background:#FFF4E0;color:#8A5A00;border:1px solid #F1D9A6}'
   +'.k27s-m{display:inline-block;padding:2px 10px;border-radius:999px;font-size:11.5px;font-weight:700}.k27s-m.charter{background:#FFF4E0;color:#8A5A00}.k27s-m.pax{background:#E8F3EE;color:#0B5A40}'
   +'.k27s tr.off td{opacity:.5}.k27s td button{border:1px solid #CFD9D3;background:#fff;border-radius:999px;padding:4px 12px;font:600 11.5px inherit;cursor:pointer;color:#8A2B2B}'
   +'.k27s .k26z-add label{display:inline-flex;gap:6px;align-items:center;font-size:12px;color:#55605B}.k27s .k26z-add select{border:1px solid #CFD9D3;border-radius:10px;padding:7px 10px;font:inherit;font-size:12.5px;background:#fff}';
    document.head.appendChild(cs)}catch(_){}
})();
/* 1026C（交付 1027A）：前台搜尋卡（使用者：「前後台一樣非常卡頓」）——一次轉機搜尋裡同一條航段同一天會被重抓幾十次
   （實測 TPE→NRT 一次畫面 12,516 次 sortedFlights、0.9 秒；HKG→NRT 11 個日期抓了 840 次，每次都整份複製）。
   轉機搜尋（三個版本）拿到清單都只讀、要用時自己複製 → 在「這一次搜尋」裡同一條同一天只抓一次；搜尋結束就丟掉，不跨次快取。 */
(function(){function arm(){var F=window.findConnectionsFull;if(typeof F!=='function'||F.__memo27)return;
  /* 再加：同一組輸入 20 秒內再問（訂票頁換日期時日期列 7 天有 6 天一樣）直接用上次的結果（回傳複本）；班表或單日調整一變 key 就不同 */
  var CC=new Map();function ck(a){try{return [a[0],a[1],a[2],a[3],(S.customFlights||[]).length,Object.keys(S.flightDateOverride||{}).length,Object.keys(S.flightOverrides||{}).length,S.hotelPref0809C||'',S.wantHotel?1:0,(window.kgmSalesModeR1026C?((S.salesModeR1026C||{}).rules||[]).length:0)].join('|')}catch(_){return ''}}
  function cp(r){return (r||[]).map(function(c){return Object.assign({},c,{f1:Object.assign({},c.f1),f2:Object.assign({},c.f2)})})}
  var w=function(){var key=ck(arguments),hit=key&&CC.get(key);if(hit&&Date.now()-hit.t<20000)return cp(hit.r);
    var res=w0.apply(this,arguments);if(key&&Array.isArray(res)){if(CC.size>200)CC.clear();CC.set(key,{t:Date.now(),r:cp(res)})}return res};
  var w0=function(){var SF=window.sortedFlights;if(typeof SF!=='function'||SF.__memo27run)return F.apply(this,arguments);
    var memo=new Map(),m=function(fr,to,date){var k=fr+'|'+to+'|'+date,r=memo.get(k);if(!r){r=SF.apply(this,arguments);memo.set(k,r)}return r};m.__memo27run=1;
    window.sortedFlights=m;try{sortedFlights=m}catch(_){}
    try{return F.apply(this,arguments)}finally{window.sortedFlights=SF;try{sortedFlights=SF}catch(_){}}};
  try{Object.keys(F).forEach(function(k){if(!(k in w))w[k]=F[k]})}catch(_){}w.__memo27=1;window.findConnectionsFull=w;try{findConnectionsFull=w}catch(_){}}
  arm();setTimeout(arm,0);setTimeout(arm,3000);setTimeout(arm,12000)})();

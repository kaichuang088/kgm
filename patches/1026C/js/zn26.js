
/* ══ 1026B：後台「航線管理」→ 關閉空域（使用者：「關閉空域清單是我假設的 … 你查一下，也要隨著時事調整這一塊」）
   預設＝2026-10-25 查證（EASA CZIB／Safe Airspace，逐區寫依據）；每一區可以關／開，可以加自訂空域（中心點＋半徑），可以回到預設。
   改了就存（S.warZonesR1026B，kgm26_zones，前後台同步），所有航段的避戰航路、起飛前 48 小時延遲抵達通知、Payload 限座、航班資料路線圖跟著重算。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function st(){S.warZonesR1026B=S.warZonesR1026B||{on:{},custom:[]};S.warZonesR1026B.on=S.warZonesR1026B.on||{};S.warZonesR1026B.custom=S.warZonesR1026B.custom||[];return S.warZonesR1026B}
  function who(){try{return (S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''}catch(_){return ''}}
  function done(msg){var o=st();o.at=new Date().toISOString();o.by=who();try{save()}catch(_){}try{logAct(z()?'關閉空域調整':'Closed airspace changed',msg)}catch(_){}AFF=null;paint()}
  window.kgmZoneToggleR1026B=function(k){var L=window.kgmWarZonesR1025B?window.kgmWarZonesR1025B():[],Zx=L.filter(function(x){return x.k===k})[0];if(!Zx)return;var o=st();
    if(Zx.custom){o.custom=o.custom.filter(function(c){return 'C:'+c.id!==k});done((z()?'刪除自訂空域 ':'Removed ')+Zx.zh);return}
    o.on[k]=!Zx.on;if(o.on[k]===Zx.def)delete o.on[k];done((Zx.on?(z()?'開放 ':'Opened '):(z()?'關閉 ':'Closed '))+Zx.zh)};
  window.kgmZoneAddR1026B=function(){var g=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
    var nm=g('k26zn'),la=+g('k26zla'),lo=+g('k26zlo'),r=+g('k26zr');
    if(!nm||!isFinite(la)||!isFinite(lo)||!(r>=20&&r<=2000)||Math.abs(la)>85||Math.abs(lo)>180){S.k26zMsg=z()?'請填名稱、中心緯度（−85～85）、經度（−180～180）、半徑 20～2,000 公里。':'Enter name, centre lat/lon and radius 20–2,000 km.';paint();return}
    var o=st(),id='Z'+String(Date.now()).slice(-6);o.custom.push({id:id,zh:nm,lat:la,lon:lo,r:r,at:new Date().toISOString(),by:who()});S.k26zMsg='';
    done((z()?'新增自訂空域 ':'Added ')+nm+'（'+la+', '+lo+'，'+r+' km）')};
  window.kgmZoneResetR1026B=function(){if(!confirm(z()?'回到 2026-10-25 查證的預設？（自訂空域會一起刪除）':'Reset to the 2026-10-25 defaults?'))return;var o=st();o.on={};o.custom=[];done(z()?'回到預設':'Reset')};
  /* 受影響的 KGM 航段（分批算，不卡畫面） */
  var AFF=null,AFS=null,BUSY=0;
  function pairs(){var seen={},out=[];try{FLIGHTS.forEach(function(f){if(!f||f.via||f.partner||f.codeshare||!/^KX\d+$/.test(String(f.code||'')))return;var k=f.fr<f.to?f.fr+'-'+f.to:f.to+'-'+f.fr;if(seen[k])return;seen[k]=1;out.push(f)})}catch(_){}return out}
  function work(){var s=window.kgmWarSigR1026B?window.kgmWarSigR1026B():'';if(AFF&&AFS===s)return;if(BUSY)return;BUSY=1;AFS=s;var P=pairs(),i=0,res=[];
    (function step(){var t=Date.now();while(i<P.length&&Date.now()-t<40){var f=P[i++],w=null;try{w=window.kgmWarRouteR1025B(f.fr,f.to)}catch(_){}
        if(w){var dS=null,dW=null;try{dS=window.kgmWarDelayR1025B(f,'2027-07-15');dW=window.kgmWarDelayR1025B(f,'2027-01-15')}catch(_){}res.push({f:f,w:w,s:dS,wi:dW})}}
      if(i<P.length){S.k26zProg=i+'/'+P.length;paintSoon();setTimeout(step,0);return}
      BUSY=0;S.k26zProg='';if(AFS!==(window.kgmWarSigR1026B?window.kgmWarSigR1026B():'')){AFF=null;work();return}
      AFF=res.sort(function(a,b){return (b.w.extra-a.w.extra)});paint()})()}
  var PS=0;function paintSoon(){if(PS)return;PS=setTimeout(function(){PS=0;paint()},300)}
  function html(){var L=window.kgmWarZonesR1025B?window.kgmWarZonesR1025B():[],o=st(),asof=window.KGM_WAR_ASOF_R1026B||'';
    var cnt={};(AFF||[]).forEach(function(a){a.w.zones.forEach(function(k){cnt[k]=(cnt[k]||0)+1})});
    var rows=L.map(function(x){var chg=!x.custom&&x.on!==x.def;
      return '<tr class="'+(x.on?'on':'off')+'"><td><b>'+E(x.zh)+'</b>'+(x.en?'<small>'+E(x.en)+'</small>':'')+'</td>'
        +'<td><button type="button" class="k26z-sw '+(x.on?'on':'')+'" onclick="kgmZoneToggleR1026B(\''+E(x.k)+'\')">'+(x.custom?(z()?'刪除':'Delete'):(x.on?(z()?'關閉中':'Closed'):(z()?'開放':'Open')))+'</button>'+(chg?'<i>'+(z()?'已改（預設'+(x.def?'關閉':'開放')+'）':'changed')+'</i>':'')+'</td>'
        +'<td class="b">'+(x.custom?E((z()?'自訂：中心 ':'Custom: ')+x.lat+', '+x.lon+'，'+(z()?'半徑 ':'r ')+x.r+' km'):E(x.basis||''))+'</td>'
        +'<td class="n">'+(AFF?(cnt[x.k]||0):'…')+'</td></tr>'}).join('');
    var aff=AFF?AFF.map(function(a){var s=a.s,w=a.wi;return '<tr><td><b>'+E(a.f.fr)+'–'+E(a.f.to)+'</b></td><td>'+E(a.w.zonesTxt.join('、'))+'</td><td class="n">+'+a.w.extra.toLocaleString()+' km</td>'
        +'<td class="n">'+(s?Math.round(s.raw)+' / '+(w?Math.round(w.raw):'—'):'—')+'</td><td class="n">'+(s?(s.min+' / '+(w?w.min:'—')):'—')+'</td></tr>'}).join(''):'';
    return '<section class="k26z"><header><div><small>CLOSED AIRSPACE</small><h2>'+(z()?'關閉空域（避戰航路）':'Closed airspace')+'</h2>'
      +'<p>'+(z()?'依時事調整：每一區可以關閉／開放，也可以新增自訂空域。改了以後所有航段的航路、起飛前 48 小時的延遲抵達通知、Payload 限座與航班資料路線圖都會跟著重算。預設依 '+E(asof)+' 查證的 EASA 衝突區公告（CZIB）與 Safe Airspace。':'Toggle zones or add your own; routes, 48-hour late-arrival notices, payload limits and route maps recalculate. Defaults as verified on '+E(asof)+'.')+'</p></div>'
      +'<div class="k26z-meta">'+(o.at?(z()?'最後調整 ':'Last change ')+E(String(o.at).slice(0,16).replace('T',' '))+(o.by?' · '+E(o.by):''):(z()?'目前為預設':'Defaults'))+'<button type="button" onclick="kgmZoneResetR1026B()">'+(z()?'回到預設':'Reset')+'</button></div></header>'
      +'<details class="k26z-body"'+(S.k26zMain?' open':'')+' ontoggle="S.k26zMain=this.open"><summary>'+(z()?'目前關閉 <b>'+L.filter(function(x){return x.on}).length+'</b> 區・影響 <b>'+(AFF?AFF.length:'…')+'</b> 條 KGM 航線（展開後按狀態按鈕切換關閉／開放）':'<b>'+L.filter(function(x){return x.on}).length+'</b> zones closed · <b>'+(AFF?AFF.length:'…')+'</b> routes affected')+'</summary>'
      +'<div class="k26z-scroll"><table class="k26z-t"><thead><tr><th>'+(z()?'區域':'Zone')+'</th><th>'+(z()?'狀態':'Status')+'</th><th>'+(z()?'依據':'Basis')+'</th><th>'+(z()?'影響航線':'Routes')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      +'<div class="k26z-add"><b>'+(z()?'新增自訂空域':'Add a zone')+'</b><input id="k26zn" placeholder="'+(z()?'名稱（例：某地飛彈試射區）':'Name')+'"><input id="k26zla" placeholder="'+(z()?'中心緯度':'Lat')+'" inputmode="decimal"><input id="k26zlo" placeholder="'+(z()?'中心經度':'Lon')+'" inputmode="decimal"><input id="k26zr" placeholder="'+(z()?'半徑（公里）':'Radius km')+'" inputmode="numeric"><button type="button" onclick="kgmZoneAddR1026B()">'+(z()?'新增':'Add')+'</button>'+(S.k26zMsg?'<span class="err">'+E(S.k26zMsg)+'</span>':'')+'</div>'
      +'<details class="k26z-aff"'+(S.k26zOpen?' open':'')+' ontoggle="S.k26zOpen=this.open"><summary>'+(z()?'受影響的 KGM 航線':'Affected KGM routes')+' '+(AFF?'<b>'+AFF.length+'</b>':'<i>'+(z()?'計算中 ':'calculating ')+E(S.k26zProg||'')+'</i>')+'</summary>'
      +(AFF?(AFF.length?'<div class="k26z-scroll"><table class="k26z-t"><thead><tr><th>'+(z()?'航線':'Route')+'</th><th>'+(z()?'避開':'Avoids')+'</th><th>'+(z()?'多飛距離':'Extra')+'</th><th>'+(z()?'多飛分鐘 夏／冬':'Extra min S/W')+'</th><th>'+(z()?'預計晚到 夏／冬':'Late S/W')+'</th></tr></thead><tbody>'+aff+'</tbody></table></div><p class="k26z-note">'+(z()?'「預計晚到」＝多飛的空中時間扣掉時刻表本身的彈性；15 分以上起飛前 48 小時自動通知旅客。':'Late = extra air time minus timetable buffer; 15+ min triggers the 48-hour notice.')+'</p>':'<p class="k26z-note">'+(z()?'目前沒有航線經過關閉空域。':'No route crosses closed airspace.')+'</p>'):'')+'</details></details></section>'}
  function paint(){var el=document.getElementById('k26zones');if(!el)return;var a=document.activeElement,keep=a&&a.id&&/^k26z/.test(a.id)?{id:a.id,v:a.value}:null;
    var vals={};['k26zn','k26zla','k26zlo','k26zr'].forEach(function(id){var x=document.getElementById(id);if(x)vals[id]=x.value});
    el.innerHTML=html();Object.keys(vals).forEach(function(id){var x=document.getElementById(id);if(x)x.value=vals[id]});if(keep){var y=document.getElementById(keep.id);if(y)y.focus()}}
  function mount(){try{if(!(S.view==='admin'&&S.adminTab==='flightadjust'))return;var m=document.querySelector('#app main')||document.getElementById('app');if(!m)return;
      var el=document.getElementById('k26zones');if(!el||!m.contains(el)){el=document.createElement('div');el.id='k26zones';m.insertBefore(el,m.firstChild);paint()}
      work()}catch(e){try{console.warn('zn26',e)}catch(_){}}}
  setInterval(mount,700);
  try{var cs=document.createElement('style');cs.id='k26z-css';cs.textContent=
    '.k26z{margin:0 0 18px;background:#fff;border:1px solid #E4E9E6;border-radius:16px;padding:18px 20px}'
   +'.k26z header{display:flex;gap:16px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap}.k26z header small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}'
   +'.k26z h2{margin:2px 0 6px;font-size:19px;color:#0F2A21}.k26z header p{margin:0;max-width:760px;font-size:12.5px;color:#66726C;line-height:1.6}'
   +'.k26z-meta{font-size:12px;color:#66726C;display:flex;gap:10px;align-items:center}.k26z-meta button,.k26z-add button{border:1px solid #CFD9D3;background:#fff;border-radius:999px;padding:6px 14px;font:600 12px inherit;cursor:pointer;color:#0B3D2E}'
   +'.k26z-scroll{overflow-x:auto;margin-top:12px}.k26z-t{width:100%;border-collapse:collapse;font-size:12.5px}.k26z-t th{text-align:left;font-size:11px;color:#7A8580;font-weight:700;padding:8px 10px;border-bottom:1px solid #E4E9E6;white-space:nowrap}'
   +'.k26z-t td{padding:9px 10px;border-bottom:1px solid #F1F4F2;vertical-align:top}.k26z-t td small{display:block;color:#8A948F;font-size:11px}.k26z-t td.b{color:#55605B;line-height:1.5}.k26z-t td.n{text-align:right;font-family:ui-monospace,Menlo,monospace;white-space:nowrap}'
   +'.k26z-t tr.off td{color:#8A948F}.k26z-t td i{display:block;font-style:normal;font-size:10.5px;color:#9A7B2F;margin-top:4px}'
   +'.k26z-sw{border:1px solid #CFD9D3;background:#F4F7F5;color:#3D4944;border-radius:999px;padding:4px 12px;font:700 11.5px inherit;cursor:pointer;white-space:nowrap}.k26z-sw.on{background:#B4472F;border-color:#B4472F;color:#fff}'
   +'.k26z-add{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px;padding:12px;border-radius:12px;background:#F8FAF9;font-size:12.5px}.k26z-add input{height:34px;border:1px solid #D6DED9;border-radius:9px;padding:0 10px;min-width:120px;font:13px inherit}.k26z-add input:first-of-type{min-width:220px}.k26z-add .err{color:#B4472F;font-size:12px;flex-basis:100%}'
   +'.k26z-body{margin-top:12px}.k26z-body>summary{cursor:pointer;font-size:13px;color:#0F2A21;padding:9px 12px;border-radius:10px;background:#F8FAF9}.k26z-body>summary b{color:#B4472F}'
   +'.k26z-aff{margin-top:12px}.k26z-aff summary{cursor:pointer;font-weight:700;font-size:13px;color:#0F2A21}.k26z-aff summary i{font-style:normal;color:#8A948F;font-weight:500}.k26z-note{font-size:11.5px;color:#7A8580;margin:8px 0 0}';
    document.head.appendChild(cs)}catch(_){}
})();

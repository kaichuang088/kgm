
/* ══ 1026C：後台「航班營運」→ 新分頁「關閉空域・Payload」（使用者：「關閉空域（避戰航路）改成航班營運底下的新 TAB，要可以手動調整 Payload」）
   ① 原本放在「航線管理」最上面的關閉空域面板（zn26）整塊搬到這一頁（同一份程式，不另做一套；航線管理頁不再顯示）。
   ② Payload 限座（經濟艙少賣幾席，kgmPaxCapR1025B：依實際航路＋當季高空風算飛行時間）可以人工改：
      依班號（＋航段），可選季節（全年／夏季／冬季）與日期區間，填「經濟艙少賣幾席」（0＝不限座）；最後設定的那一條優先。
      販售（sell54 → cabinInventory54）、團體可賣座位、航班資料路線圖說明都讀 kgmPaxCapR1025B → 改了全部跟著變。
      存在 S.paxCapAdjR1026C（kgm27_paxcap，save() 同步前後台）。Payload 表 PDF（tests/pl25dump.js）印的是模型值，不含人工調整。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function who(){try{return (S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''}catch(_){return ''}}
  function L(){return S.paxCapAdjR1026C=Array.isArray(S.paxCapAdjR1026C)?S.paxCapAdjR1026C:[]}
  function winOf(d){try{return window.kgmSeasonAtR112(d)==='winter'}catch(_){return /-(1[12]|0[1-3])-/.test(d)}}
  /* 這一班這一天適用的人工設定（最後設定的優先） */
  function ruleOf(f,d){var R=L(),w=null;for(var i=R.length-1;i>=0;i--){var r=R[i];if(!r||r.off)continue;
      if(r.code!==f.code)continue;if(r.fr&&(r.fr!==f.fr||r.to!==f.to))continue;
      if(r.season==='summer'&&winOf(d))continue;if(r.season==='winter'&&!winOf(d))continue;
      if(r.from&&d<r.from)continue;if(r.until&&d>r.until)continue;w=r;break}return w}
  window.kgmPaxCapRuleR1026C=ruleOf;
  /* 最外層包 kgmPaxCapR1025B：只改「販售用」的呼叫（沒有 opt；Payload 表 PDF 用 opt 問模型值，不受影響） */
  function install(){var O=window.kgmPaxCapR1025B;if(typeof O!=='function'||O.__zn27)return;
    var w=function(f,date,opt){var r=O.apply(this,arguments);if(opt||!r||!f)return r;var u=null;try{u=ruleOf(f,String(date||''))}catch(_){}if(!u)return r;
      var b=Math.max(0,Math.min(+r.ySeats||0,Math.round(+u.blocked||0)));
      return Object.assign({},r,{blocked:b,maxPax:(+r.seats||0)-b,payloadKg:((+r.seats||0)-b)*100,autoBlockedR1026C:r.blocked,manualR1026C:{id:u.id,by:u.by,at:u.at,note:u.note||''}})};
    w.__zn27=1;window.kgmPaxCapR1025B=w}
  install();setTimeout(install,0);setTimeout(install,3000);setInterval(install,5000);
  function done(msg){try{save()}catch(_){}try{logAct(z()?'Payload 限座調整':'Payload cap changed',msg)}catch(_){}paint()}
  window.kgmPaxCapSetR1026C=function(){var g=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
    var code=g('k27pcC').toUpperCase().replace(/\s+/g,''),leg=g('k27pcL'),n=g('k27pcN'),se=g('k27pcS')||'all',fr0=g('k27pcF'),un=g('k27pcU'),note=g('k27pcT');
    var legs=own().filter(function(f){return f.code===code});
    if(!legs.length){S.k27pcMsg=z()?'找不到這個班號（只限 KGM 自營 KX 班號）。':'Unknown flight number.';paint();return}
    if(!/^\d+$/.test(n)||+n>400){S.k27pcMsg=z()?'「經濟艙少賣」請填 0～400 的整數（0＝不限座）。':'Enter 0–400.';paint();return}
    if(fr0&&un&&un<fr0){S.k27pcMsg=z()?'結束日期不能早於開始日期。':'End date before start.';paint();return}
    var p=leg?leg.split('-'):null;
    L().push({id:'PC'+Date.now().toString(36),code:code,fr:p?p[0]:'',to:p?p[1]:'',season:se,from:fr0,until:un,blocked:+n,note:note,by:who(),at:new Date().toISOString()});
    S.k27pcMsg='';S.k27pcPick=code;['k27pcN','k27pcT','k27pcF','k27pcU'].forEach(function(id){var e=document.getElementById(id);if(e)e.value=''});done(code+(p?' '+p.join('→'):'')+'：'+(z()?'經濟艙少賣 ':'block ')+n+(z()?' 席':' seats')+'（'+({all:'全年',summer:'夏季',winter:'冬季'}[se]||se)+(fr0||un?' '+(fr0||'…')+'～'+(un||'…'):'')+'）')};
  window.kgmPaxCapDelR1026C=function(id){var r=L().filter(function(x){return x.id===id})[0];if(!r)return;r.off=new Date().toISOString();r.offBy=who();
    done((z()?'取消人工 Payload 設定 ':'Removed ')+r.code+(r.fr?' '+r.fr+'→'+r.to:''))};
  window.kgmPaxCapPaintR1101A=function(){paint()};   /* 1101A：區域篩選 */
  window.kgmPaxCapPickR1026C=function(code){S.k27pcPick=code;paint();setTimeout(function(){var e=document.getElementById('k27pcN');if(e)e.focus()},30)};
  /* 長程航段的模型值（夏季／冬季），分段算 */
  function own(){try{return [].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&!f.via&&!f.partner&&!f.codeshare&&/^KX\d+$/.test(String(f.code||''))})}catch(_){return []}}
  var ROWS=null,RS='',BUSY=0;
  function sig(){return (window.kgmWarSigR1026B?window.kgmWarSigR1026B():'')+'|'+L().length}
  function work(){var s=sig();if((ROWS&&RS===s)||BUSY)return;BUSY=1;RS=s;var P=own(),i=0,out=[];
    (function step(){var t=Date.now();while(i<P.length&&Date.now()-t<40){var f=P[i++],d=0;try{d=+distOf(f.fr,f.to)||0}catch(_){}if(d<4000)continue;
        var sm=null,wi=null;try{sm=window.kgmPaxCapR1025B(f,'2027-07-15',{win:false});wi=window.kgmPaxCapR1025B(f,'2027-01-15',{win:true})}catch(_){}
        if(sm||wi)out.push({f:f,s:sm,w:wi,km:Math.round(d)})}
      if(i<P.length){setTimeout(step,0);return}
      BUSY=0;if(RS!==sig()){ROWS=null;work();return}
      ROWS=out.sort(function(a,b){return ((b.w&&b.w.blocked)||0)+((b.s&&b.s.blocked)||0)-((a.w&&a.w.blocked)||0)-((a.s&&a.s.blocked)||0)||b.km-a.km});paint()})()}
  function seaTxt(r){return ({all:z()?'全年':'All year',summer:z()?'夏季':'Summer',winter:z()?'冬季':'Winter'}[r.season]||r.season)+(r.from||r.until?' · '+(r.from||'…')+'～'+(r.until||'…'):'')}
  function plHtml(){var R=L().filter(function(r){return r&&!r.off}),man={};R.forEach(function(r){(man[r.code]=man[r.code]||[]).push(r)});
    /* 1101A：使用者「這裡幫我分好清楚一點超亂，順序是亂的，至少同個目的地要放一起」——依目的地分組（區域：歐洲→北美→大洋洲→中東→亞洲，同區依城市），
       每組標題寫城市與區域、組內去程／回程依班號排；上方區域篩選。原本整張依少賣席數排，同一個目的地的去回程散在各處。 */
    var RG28=[['歐洲','Europe'],['美洲','Americas'],['大洋洲','Oceania'],['中東','Middle East'],['東南亞','SE Asia'],['東北亞','NE Asia'],['中港澳','Greater China']];
    function reg28(c){try{for(var i=0;i<RG28.length;i++){var L=REGIONS_ZH[RG28[i][0]]||[];if(L.indexOf(c)>=0)return i}}catch(_){}return RG28.length}
    function dest28(f){var H={TPE:1,TSA:1};if(H[f.fr])return f.to;if(H[f.to])return f.fr;return f.fr==='BKK'?f.to:(f.to==='BKK'?f.fr:f.to)}
    function city28(c){try{var n=window.kgmAirportNameR115?window.kgmAirportNameR115(c):null;return n?(z()?n.zh:n.en):c}catch(_){return c}}
    var grp={};(ROWS||[]).forEach(function(x){var d=dest28(x.f);(grp[d]=grp[d]||[]).push(x)});
    var keys=Object.keys(grp).sort(function(a,b){return reg28(a)-reg28(b)||String(city28(a)).localeCompare(String(city28(b)))||a.localeCompare(b)});
    var rf=S.k28plR==null?'all':S.k28plR,cnt={};keys.forEach(function(k){var r=reg28(k);cnt[r]=(cnt[r]||0)+1});
    var chips28='<div class="k28pl-chips"><button type="button" class="'+(rf==='all'?'on':'')+'" onclick="S.k28plR=\'all\';kgmPaxCapPaintR1101A()">'+(z()?'全部':'All')+' <i>'+keys.length+'</i></button>'
      +RG28.map(function(r,i){return cnt[i]?'<button type="button" class="'+(String(rf)===String(i)?'on':'')+'" onclick="S.k28plR=\''+i+'\';kgmPaxCapPaintR1101A()">'+(z()?r[0]:r[1])+' <i>'+cnt[i]+'</i></button>':''}).join('')+'</div>';
    var rows=chips28?'':'';
    rows=keys.filter(function(k){return rf==='all'||String(reg28(k))===String(rf)}).map(function(k){var L=grp[k].slice().sort(function(a,b){var na=+String(a.f.code).slice(2),nb=+String(b.f.code).slice(2);return (Math.ceil(na/2)-Math.ceil(nb/2))||(na%2-nb%2)||String(a.f.fr).localeCompare(String(b.f.fr))}),r=reg28(k),mx=0;
      L.forEach(function(x){mx=Math.max(mx,(x.s&&x.s.blocked)||0,(x.w&&x.w.blocked)||0)});
      return '<tr class="k28pl-g"><td colspan="6"><b>'+E(city28(k))+'</b> <code>'+E(k)+'</code><span>'+E(r<RG28.length?(z()?RG28[r][0]:RG28[r][1]):(z()?'其他':'Other'))+' · '+L.length+(z()?' 個航段':' legs')+(mx?' · '+(z()?'最多少賣 ':'max ')+mx:'')+'</span></td></tr>'
        +L.map(function(x){var f=x.f,m=man[f.code]||[];
      return '<tr><td><b>'+E(f.code)+'</b><small>'+E(f.fr)+'→'+E(f.to)+' · '+x.km.toLocaleString()+' km</small></td>'
        +'<td class="n">'+(x.s?E(x.s.type)+'<small>'+(z()?'座位 ':'seats ')+x.s.seats+'</small>':'—')+'</td>'
        +'<td class="n">'+(x.s?(x.s.blocked?'<em>'+x.s.blocked+'</em>':'0'):'—')+'</td><td class="n">'+(x.w?(x.w.blocked?'<em>'+x.w.blocked+'</em>':'0'):'—')+'</td>'
        +'<td>'+(m.length?m.map(function(r){return '<span class="k27pc-chip">'+E((r.fr?r.fr+'→'+r.to+' ':'')+seaTxt(r))+'：'+(z()?'少賣 ':'block ')+r.blocked+'</span>'}).join(''):'<span class="k27pc-auto">'+(z()?'依模型':'Model')+'</span>')+'</td>'
        +'<td><button type="button" class="k27pc-b" onclick="kgmPaxCapPickR1026C(\''+A(f.code)+'\')">'+(z()?'調整':'Adjust')+'</button></td></tr>'}).join('')}).join('');
    var pick=S.k27pcPick||'',legs=own().filter(function(f){return f.code===pick});
    var list=R.slice().reverse().map(function(r){return '<tr><td><b>'+E(r.code)+'</b>'+(r.fr?'<small>'+E(r.fr)+'→'+E(r.to)+'</small>':'<small>'+(z()?'全部航段':'All legs')+'</small>')+'</td><td>'+E(seaTxt(r))+'</td><td class="n"><em>'+r.blocked+'</em></td><td>'+E(r.note||'')+'</td><td><small>'+E(String(r.at||'').slice(0,16).replace('T',' '))+' · '+E(r.by||'')+'</small></td><td><button type="button" class="k27pc-b ghost" onclick="kgmPaxCapDelR1026C(\''+A(r.id)+'\')">'+(z()?'取消':'Remove')+'</button></td></tr>'}).join('');
    return '<section class="k27pc"><header><small>PAYLOAD LIMIT</small><h2>'+(z()?'Payload 限座（人工調整）':'Payload seat limit (manual)')+'</h2>'
      +'<p>'+(z()?'長程航班飛行時間太長（冬季逆風、繞開關閉空域）時，經濟艙要少賣幾席才載得動。下表是系統依實際航路與當季高空風算的「少賣席數」；需要時可依班號（＋航段）、季節或日期區間改成人工數字（0＝不限座）。改了以後販售、團體可賣座位、航班資料路線圖說明立即跟著變；已訂位的旅客不受影響。':'Seats withheld from sale in economy when the flight is too long to carry a full load. Override per flight, season or date range (0 = no limit).')+'</p></header>'
      +'<div class="k27pc-form"><label>'+(z()?'班號':'Flight')+'<input id="k27pcC" value="'+E(pick)+'" placeholder="KX71" oninput="S.k27pcPick=this.value.toUpperCase()" onchange="kgmPaxCapPickR1026C(this.value.toUpperCase())"></label>'
        +'<label>'+(z()?'航段':'Leg')+'<select id="k27pcL"><option value="">'+(z()?'全部航段':'All legs')+'</option>'+legs.map(function(f){return '<option value="'+E(f.fr+'-'+f.to)+'">'+E(f.fr+' → '+f.to)+'</option>'}).join('')+'</select></label>'
        +'<label>'+(z()?'季節':'Season')+'<select id="k27pcS"><option value="all">'+(z()?'全年':'All year')+'</option><option value="winter">'+(z()?'冬季':'Winter')+'</option><option value="summer">'+(z()?'夏季':'Summer')+'</option></select></label>'
        +'<label>'+(z()?'開始日期（可空白）':'From (optional)')+'<input id="k27pcF" type="date"></label><label>'+(z()?'結束日期（可空白）':'Until (optional)')+'<input id="k27pcU" type="date"></label>'
        +'<label>'+(z()?'經濟艙少賣（席）':'Block (seats)')+'<input id="k27pcN" inputmode="numeric" placeholder="0"></label>'
        +'<label class="w">'+(z()?'原因（選填）':'Note')+'<input id="k27pcT" placeholder="'+(z()?'例：貨運承諾、備降油量':'e.g. cargo commitment')+'"></label>'
        +'<button type="button" class="k27pc-b" onclick="kgmPaxCapSetR1026C()">'+(z()?'套用':'Apply')+'</button>'
        +(S.k27pcMsg?'<div class="err">'+E(S.k27pcMsg)+'</div>':'')+'</div>'
      +(R.length?'<div class="k27pc-h">'+(z()?'目前的人工設定（最後設定的優先）':'Manual overrides (latest wins)')+'</div><div class="k26z-scroll"><table class="k26z-t"><thead><tr><th>'+(z()?'班號':'Flight')+'</th><th>'+(z()?'適用':'Applies')+'</th><th>'+(z()?'少賣':'Block')+'</th><th>'+(z()?'原因':'Note')+'</th><th>'+(z()?'設定':'Set')+'</th><th></th></tr></thead><tbody>'+list+'</tbody></table></div>':'')
      +'<div class="k27pc-h">'+(z()?'長程航班：系統計算的少賣席數（夏季 7 月／冬季 1 月）':'Long-haul: model seats withheld (Jul / Jan)')+(ROWS?'':' <i>'+(z()?'計算中…':'calculating…')+'</i>')+'</div>'
      +(ROWS?chips28+'<div class="k26z-scroll"><table class="k26z-t"><thead><tr><th>'+(z()?'班號／航段':'Flight')+'</th><th>'+(z()?'機型':'Type')+'</th><th>'+(z()?'夏季少賣':'Summer')+'</th><th>'+(z()?'冬季少賣':'Winter')+'</th><th>'+(z()?'人工設定':'Manual')+'</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'')
      +'</section>'}
  function paint(){var el=document.getElementById('k27pcw');if(!el)return;var a=document.activeElement,keep=a&&a.id&&/^k27pc/.test(a.id)?{id:a.id}:null,vals={};
    ['k27pcC','k27pcL','k27pcS','k27pcF','k27pcU','k27pcN','k27pcT'].forEach(function(id){var x=document.getElementById(id);if(x)vals[id]=x.value});
    el.innerHTML=plHtml();Object.keys(vals).forEach(function(id){var x=document.getElementById(id);if(x&&!(id==='k27pcC'&&S.k27pcPick&&vals[id]!==S.k27pcPick))x.value=vals[id]});var c=document.getElementById('k27pcC');if(c&&S.k27pcPick)c.value=S.k27pcPick;
    if(keep){var y=document.getElementById(keep.id);if(y)y.focus()}}
  window.kgmAirspacePageR1026C=function(){var pm='use';try{pm=window.kgmPermR123?window.kgmPermR123('airspace27'):'use'}catch(_){}
    if(pm==='none')return '<div class="k23g-note bad">'+(z()?'你的職務沒有「關閉空域・Payload」分頁的權限，可在審核中心申請。':'No access.')+'</div>';
    try{work()}catch(_){}
    return '<div class="k27as"><div class="k27as-hd"><small>FLIGHT OPERATIONS</small><h1>'+(z()?'關閉空域・Payload':'Closed airspace & payload')+'</h1></div>'
      +'<div id="k26zones">'+(window.kgmZoneHtmlR1026C?window.kgmZoneHtmlR1026C():'')+'</div><div id="k27pcw">'+plHtml()+'</div></div>'};
  try{var cs=document.createElement('style');cs.id='k27pc-css';cs.textContent=
    '.k27as-hd{margin:0 0 16px}.k27as-hd small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}.k27as-hd h1{margin:2px 0 0;font-size:22px;color:#0F2A21}'
   +'.k27pc{margin:0 0 18px;background:#fff;border:1px solid #E4E9E6;border-radius:16px;padding:18px 20px}'
   +'.k27pc header small{font:700 10.5px system-ui,sans-serif;letter-spacing:.14em;color:#9A7B2F}.k27pc h2{margin:2px 0 6px;font-size:19px;color:#0F2A21}.k27pc header p{margin:0;max-width:820px;font-size:12.5px;color:#66726C;line-height:1.6}'
   +'.k27pc-form{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-top:14px;padding:12px;border-radius:12px;background:#F8FAF9}'
   +'.k27pc-form label{display:flex;flex-direction:column;gap:4px;font-size:11px;font-weight:700;color:#66726C}.k27pc-form label.w{flex:1;min-width:200px}'
   +'.k27pc-form input,.k27pc-form select{height:34px;border:1px solid #D6DED9;border-radius:9px;padding:0 10px;font:13px inherit;color:#14231D;background:#fff;min-width:110px}'
   +'.k27pc-form .err{flex-basis:100%;color:#B4472F;font-size:12px}'
   +'.k27pc-b{border:0;background:#0B3D2E;color:#fff;border-radius:999px;padding:8px 16px;font:700 12px inherit;cursor:pointer;white-space:nowrap}.k27pc-b.ghost{background:#fff;color:#0B3D2E;border:1px solid #CFD9D3;padding:5px 12px}'
   +'.k27pc-h{margin:16px 0 0;font-size:13px;font-weight:700;color:#0F2A21}.k27pc-h i{font-style:normal;font-weight:500;color:#8A948F}'
   +'.k27pc td em{font-style:normal;font-weight:700;color:#B4472F}.k27pc-chip{display:inline-block;margin:0 4px 4px 0;padding:2px 9px;border-radius:999px;background:#FFF3DC;color:#8A5A12;font-size:11.5px;font-weight:700}.k27pc-auto{color:#8A948F;font-size:12px}'
   +'@media(max-width:760px){.k27pc-form label{flex:1 1 45%}.k27pc-form input,.k27pc-form select{min-width:0;width:100%}}';
    document.head.appendChild(cs)}catch(_){}
})();

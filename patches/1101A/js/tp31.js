/* ══ 1103A：會籍積分（使用者：「可以加入會籍積分嗎 不要用旅遊航段用積分來看 你來定 然後頁面要長得像那樣（華航）
   要升級 Explorer 一定要打一個標準 去參考現有航空的」「使用 STAR G/M 也要送會籍積分和自營會籍積分 所以就看新的那兩個不會單獨看里程」）
   參考：華航 2025 年底新制「會籍積分」——一年內 360／720／1,400 分升金卡／翡翠卡／晶鑽卡，且 50% 以上來自華航自營航班；台北—成田經濟艙約 24 分。
   KGM（KGM-FFP-011 Rev. D）：
   · 卡等只看兩個數字：會籍積分（全部）與自營航班會籍積分（KGM 自己營運的航班＋KGM Cards Star G／M 簽帳）；每年 1/1–12/31 累計。
       Silver 240 分（其中自營 120）、Gold 480（240）、Diamond 960（480）——跟舊制 12／24／48 航段同一個量（台北—成田經濟艙超值 20 分）。
   · 每一航段＝距離基數 ×（艙等／票價家族比率）：
       距離（大圓公里）<1,000：10｜1,000–1,999：15｜2,000–3,999：20｜4,000–6,999：35｜7,000–9,999：50｜≥10,000：60
       經濟 基本 50%／超值 100%／舒適 110%／豪華 125%；豪經 150／175／185／200%；商務 250／275／290／300%；頭等 400%；Residence 450%；
       團體票＝同艙超值的一半；酬賓、員工票 0。
     夥伴航空營運（聯營、聯盟）的航段只算會籍積分，不算自營。
   · KGM Cards：Star G 每 NT$10,000 簽帳 2 分、Star M 3 分，同時算自營；每年上限 100／200 分（kc31.js kgmCardTpR1103A）。
   · 徽章驚喜包的會籍積分（bd31）只算會籍積分。
   · 模擬會員（沒有訂位、只有 flownSectors）：每段以 20 分（自營）估。
   · 卡等仍「只升不降」（1006A 起網站就是這樣；FFP Rev. D 寫成 2027 年底前的過渡條款，參考華航兩年內不降等）。 */
(function(){
  if(window.__tp31)return;window.__tp31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function N(n){return (Math.round(+n||0)).toLocaleString()}
  function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
  var TIERS=[['Silver',240,120],['Gold',480,240],['Diamond',960,480]];
  window.KGM_TP_TIERS_R1103A=TIERS;
  var BANDS=[[1000,10],[2000,15],[4000,20],[7000,35],[10000,50],[1e9,60]];
  var PCT={Economy:{Basic:50,Value:100,Comfort:110,Deluxe:125},Premium:{Basic:150,Value:175,Comfort:185,Deluxe:200},Business:{Basic:250,Value:275,Comfort:290,Deluxe:300},First:{Basic:400,Value:400,Comfort:400,Deluxe:400},Resident:{Resident:450,Value:450}};
  function base(km){for(var i=0;i<BANDS.length;i++)if(km<BANDS[i][0])return BANDS[i][1];return 60}
  function pctOf(code){var f=null;try{f=FARES[code]}catch(_){}if(!f)return 100;var cab=f.cabin||'Economy',fam=String(f.familyR48||f.tierEN||f.tier||'Value'),t=PCT[cab]||PCT.Economy;
    if(/staff/i.test(fam)||/^S[EKZH]$/.test(code))return 0;
    if(/group/i.test(String(f.tierEN||'')+' '+fam)||/^G$/.test(code))return Math.round((t.Value||100)/2);   /* 團體票（Group Saver／Flex）的 familyR48 寫的是 Basic／Value → 先看 tierEN */
    return t[fam]!=null?t[fam]:(t.Value||100)}
  window.kgmTpSegR1103A=function(fr,to,fare){var km=0;try{km=distOf(fr,to)||0}catch(_){}return Math.round(base(km)*pctOf(fare)/100)};
  function partnerOf(code,fr,to){if(!/^KX/.test(String(code||'')))return true;try{var r=[].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&f.code===code&&f.fr===fr&&f.to===to})[0];return !!(r&&r.partner)}catch(_){return false}}
  var C={};
  window.kgmTpOfR1103A=function(u,year){u=u||{};year=String(year||T().slice(0,4));var k=u.id+'|'+year+'|'+(S.bookings||[]).length+'|'+Math.floor(Date.now()/60000)+'|'+((u.tpBonusR1103A||[]).length);if(C[k])return C[k];
    var r={tp:0,own:0,fl:{tp:0,n:0},pt:{tp:0,n:0},card:{tp:0},bonus:{tp:0},segs:[],year:year};
    (S.bookings||[]).forEach(function(b){if(!u.id||!b||b.userId!==u.id||b.status==='cancelled')return;if(b.award||b.usedMiles||b.staff)return;
      var segs=[];try{segs=(typeof tripSegments==='function'&&tripSegments(b))||[]}catch(_){}
      segs.forEach(function(sg){if(!sg||!sg.date||sg.date>T()||String(sg.date).slice(0,4)!==year)return;var code=sg.fare||((sg.dir==='inb')?b.inbC:b.outC),pts=window.kgmTpSegR1103A(sg.fr,sg.to,code),pa=partnerOf(sg.code,sg.fr,sg.to);
        r.segs.push({date:sg.date,code:sg.code,fr:sg.fr,to:sg.to,fare:code,tp:pts,own:!pa,pnr:b.pnr});if(pa){r.pt.tp+=pts;r.pt.n++}else{r.fl.tp+=pts;r.fl.n++}})});
    if(!r.fl.n&&!r.pt.n&&u.flownSectors&&year===T().slice(0,4)){r.fl.tp=(+u.flownSectors||0)*20;r.fl.n=+u.flownSectors||0;r.simR1103A=1}
    try{if(window.kgmCardTpR1103A)r.card.tp=window.kgmCardTpR1103A(u.id,year).tp}catch(_){}
    (u.tpBonusR1103A||[]).forEach(function(x){if(x&&String(x.date||'').slice(0,4)===year)r.bonus.tp+=+x.tp||0});
    r.tp=r.fl.tp+r.pt.tp+r.card.tp+r.bonus.tp;r.own=r.fl.tp+r.card.tp;C[k]=r;return r};
  window.kgmTpEvalR1103A=function(u){var r=window.kgmTpOfR1103A(u),best='Bronze';TIERS.forEach(function(t){if(r.tp>=t[1]&&r.own>=t[2])best=t[0]});return {tier:best,tp:r.tp,own:r.own}};
  function tierN(l){try{return (typeof tierOf==='function')?tierOf(l):l}catch(_){return l}}
  window.kgmTierValidR1103A=function(u){var t=tierN((u&&(u.level||u.tier))||'Bronze');if(t==='Bronze')return z()?'—':'—';return (+T().slice(0,4)+1)+'/12/31'};
  function ring(v,max,lbl,sub,col){var p=max?Math.min(1,v/max):1,R=52,L=2*Math.PI*R;
    return '<div class="k31t-ring"><svg viewBox="0 0 132 132" width="132" height="132" aria-hidden="true"><circle cx="66" cy="66" r="'+R+'" fill="none" stroke="#ece6d8" stroke-width="11"/><circle cx="66" cy="66" r="'+R+'" fill="none" stroke="'+col+'" stroke-width="11" stroke-linecap="round" stroke-dasharray="'+(L*p).toFixed(1)+' '+L.toFixed(1)+'" transform="rotate(-90 66 66)"/></svg>'
      +'<div class="k31t-rv"><b>'+N(v)+'</b><span>/ '+N(max)+'</span></div><h5>'+lbl+'</h5><p>'+sub+'</p></div>'}
  window.kgmTpPanelR1103A=function(u){u=u||{};var r=window.kgmTpOfR1103A(u),cur=tierN(u.level||u.tier||'Bronze'),ci=['Bronze','Silver','Gold','Diamond'].indexOf(cur);if(ci<0)ci=0;
    var nx=TIERS[Math.min(ci,TIERS.length-1)],top=ci>=3,needT=Math.max(0,nx[1]-r.tp),needO=Math.max(0,nx[2]-r.own),keep=ci>0?TIERS[ci-1]:null;
    var keepT=keep?Math.max(0,keep[1]-r.tp):0,keepO=keep?Math.max(0,keep[2]-r.own):0,y=r.year;
    var head='<div class="k31t-h"><div><small>TIER POINTS · '+y+'</small><h3>'+(z()?'會籍積分':'Tier points')+'</h3><p>'+(z()?y+' 年度（1/1–12/31）累計；卡等只看會籍積分與自營航班會籍積分兩個數字，兩個都達到才升等。':'Status is earned on tier points and on-KGM tier points only.')+'</p></div>'
      +'<div class="k31t-card '+cur.toLowerCase()+'"><small>KGM EXPLORER</small><b>'+E(cur.toUpperCase())+'</b><span>'+E(u.id||'')+'</span><dl><div><dt>'+(z()?'效期':'Valid thru')+'</dt><dd>'+E(window.kgmTierValidR1103A(u))+'</dd></div><div><dt>'+(z()?'里程總數':'Miles')+'</dt><dd>'+N(u.miles)+'</dd></div></dl></div></div>';
    var rings='<div class="k31t-rings">'+ring(r.tp,top?TIERS[2][1]:nx[1],z()?'會籍積分':'Tier points',top?(z()?'已是最高卡等':'Top tier'):(needT?(z()?'升 '+nx[0]+' 尚需 <b>'+N(needT)+'</b> 分':'<b>'+N(needT)+'</b> to '+nx[0]):(z()?'升 '+nx[0]+' 已達標':'met')),'#a77d33')
      +ring(r.own,top?TIERS[2][2]:nx[2],z()?'自營航班會籍積分':'On-KGM tier points',top?(z()?'KGM 自營航班＋Star G／M':'KGM-operated + Star G/M'):(needO?(z()?'升 '+nx[0]+' 尚需 <b>'+N(needO)+'</b> 分':'<b>'+N(needO)+'</b> to '+nx[0]):(z()?'升 '+nx[0]+' 已達標':'met')),'#0b3b30')+'</div>';
    var keepRow='<div class="k31t-keep"><div><small>'+(z()?'保留餘額':'To retain')+'</small><b>'+(keep?((keepT||keepO)?(z()?'保留 '+cur+' 還需 '+N(keepT)+' 分（自營 '+N(keepO)+' 分）':N(keepT)+' pts ('+N(keepO)+' on KGM)'):(z()?'已達 '+cur+' 保留門檻':'Retained')):(z()?'—':'—'))+'</b></div>'
      +'<div><small>'+(z()?'卡等效期':'Valid thru')+'</small><b>'+E(window.kgmTierValidR1103A(u))+'</b></div><div><small>'+(z()?'里程總數':'Miles balance')+'</small><b>'+N(u.miles)+'</b></div></div>';
    var src='<table class="k31t-src"><thead><tr><th>'+(z()?'來源':'Source')+'</th><th class="r">'+(z()?'會籍積分':'Tier pts')+'</th><th class="r">'+(z()?'自營航班會籍積分':'On KGM')+'</th></tr></thead><tbody>'
      +'<tr><td>'+(z()?'KGM 自營航班':'KGM-operated flights')+'<small>'+r.fl.n+(z()?' 個航段':' segments')+(r.simR1103A?(z()?'（模擬會員以每段 20 分估）':' (estimated)'):'')+'</small></td><td class="r">'+N(r.fl.tp)+'</td><td class="r">'+N(r.fl.tp)+'</td></tr>'
      +'<tr><td>'+(z()?'夥伴航空營運航班':'Partner-operated')+'<small>'+r.pt.n+(z()?' 個航段':' segments')+'</small></td><td class="r">'+N(r.pt.tp)+'</td><td class="r">—</td></tr>'
      +'<tr><td>KGM Cards Star G／M<small>'+(z()?'每 NT$10,000：G 2 分、M 3 分（年上限 100／200）':'')+'</small></td><td class="r">'+N(r.card.tp)+'</td><td class="r">'+N(r.card.tp)+'</td></tr>'
      +'<tr><td>'+(z()?'徽章驚喜包':'Badge packs')+'</td><td class="r">'+N(r.bonus.tp)+'</td><td class="r">—</td></tr></tbody><tfoot><tr><td>'+(z()?'合計':'Total')+'</td><td class="r">'+N(r.tp)+'</td><td class="r">'+N(r.own)+'</td></tr></tfoot></table>';
    var lad='<div class="k31t-lad">'+[['Bronze',0,0]].concat(TIERS).map(function(t,i){return '<div class="'+(i===ci?'on ':'')+(i<ci?'past':'')+'"><b>'+t[0]+'</b><span>'+(t[1]?(N(t[1])+(z()?' 分':' pts')):(z()?'加入即享':'Join'))+'</span><em>'+(t[2]?((z()?'自營 ':'on KGM ')+N(t[2])):'')+'</em></div>'}).join('')+'</div>';
    var segs=r.segs.slice(-6).reverse();
    var recent=segs.length?'<div class="k31t-rec"><small>'+(z()?'最近入帳的航段':'Recent segments')+'</small>'+segs.map(function(s){return '<span>'+E(s.date.slice(5))+' '+E(s.code)+' '+E(s.fr)+'→'+E(s.to)+' <b>+'+s.tp+'</b>'+(s.own?'':(z()?'（夥伴）':' (partner)'))+'</span>'}).join('')+'</div>':'';
    return '<div class="r20-qual k31t">'+head+rings+keepRow+lad+src+recent
      +'<div class="r20-excl">'+(z()?'哩程不再作為升等條件。每航段的會籍積分＝距離基數（10～60 分）×艙等票價比率；夥伴航空營運的航段只計會籍積分。酬賓機票、員工票、購買及受讓的哩程不計。2027 年 12 月 31 日前卡等只升不降（KGM-FFP-011 Rev. D）。':'Miles no longer qualify. Award and staff tickets earn no tier points.')+'</div></div>'};
  try{var css=document.createElement('style');css.textContent=[
    '.k31t-h{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}.k31t-h small{font-size:10px;letter-spacing:.16em;color:var(--gold,#a77d33);font-weight:800}.k31t-h h3{margin:2px 0 4px}.k31t-h p{margin:0;font-size:12px;color:#6b645a;max-width:360px;line-height:1.55}',
    '.k31t-card{width:200px;border-radius:14px;padding:12px 14px;color:#fff;background:linear-gradient(135deg,#7a6a52,#b49a6c);box-shadow:0 8px 20px rgba(0,0,0,.12)}.k31t-card.silver{background:linear-gradient(135deg,#6f7780,#c4ccd4)}.k31t-card.gold{background:linear-gradient(135deg,#8A6A22,#D6B25E)}.k31t-card.diamond,.k31t-card.black{background:linear-gradient(135deg,#0d0d0d,#3a3a3a 65%,#7d6a40)}',
    '.k31t-card small{font-size:9px;letter-spacing:.16em;opacity:.85;color:#fff!important}.k31t-card b{display:block;font:700 20px Georgia,serif;margin:4px 0 2px}.k31t-card span{font:600 11.5px ui-monospace,monospace;letter-spacing:.08em;opacity:.9}.k31t-card dl{display:flex;gap:16px;margin:8px 0 0}.k31t-card dt{font-size:9.5px;opacity:.8}.k31t-card dd{margin:0;font-weight:800;font-size:12.5px}',
    '.k31t-rings{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0 8px}.k31t-ring{position:relative;text-align:center;background:#fbf9f4;border:1px solid #ece6d8;border-radius:14px;padding:12px 8px}.k31t-ring svg{display:block;margin:0 auto}',
    '.k31t-rv{position:absolute;left:0;right:0;top:48px;text-align:center}.k31t-rv b{display:block;font-size:24px;color:#0b3b30;line-height:1}.k31t-rv span{font-size:11px;color:#8a8175}.k31t-ring h5{margin:6px 0 2px;font-size:13px;color:#0b3b30}.k31t-ring p{margin:0;font-size:11.5px;color:#6b645a}.k31t-ring p b{color:#9b2d17}',
    '.k31t-keep{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:8px;margin:8px 0}.k31t-keep>div{border:1px solid #ece6d8;border-radius:10px;padding:8px 10px}.k31t-keep small{display:block;font-size:10.5px;color:#8a8175;font-weight:700}.k31t-keep b{font-size:13px;color:#0b3b30}',
    '.k31t-lad{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:10px 0}.k31t-lad div{border-radius:8px;padding:7px 8px;background:#f6f3ec;font-size:11px;color:#6b645a;display:flex;flex-direction:column}.k31t-lad b{font-size:12px;color:#3c3a35}.k31t-lad em{font-style:normal;font-size:10.5px}.k31t-lad .on{background:#0b3b30;color:#d9e8e1}.k31t-lad .on b{color:#fff}.k31t-lad .past{background:#e7f0eb}',
    '.k31t-src{width:100%;border-collapse:collapse;font-size:12px;margin:6px 0}.k31t-src th{font-size:10.5px;color:#8a8175;text-align:left;border-bottom:1px solid #ece6d8;padding:6px}.k31t-src td{padding:6px;border-bottom:1px solid #f3efe6}.k31t-src td small{display:block;font-size:10.5px;color:#8a8175}.k31t-src .r{text-align:right}.k31t-src tfoot td{font-weight:800;border-bottom:0}',
    '.k31t-rec{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}.k31t-rec small{font-size:10.5px;color:#8a8175;font-weight:700;margin-right:4px}.k31t-rec span{font-size:11px;background:#f6f3ec;border-radius:999px;padding:2px 9px}.k31t-rec b{color:#1f6f4a}',
    '@media(max-width:640px){.k31t-rings{grid-template-columns:1fr}.k31t-keep{grid-template-columns:1fr}.k31t-lad{grid-template-columns:1fr 1fr}}'
  ].join('');document.head.appendChild(css)}catch(_){}
})();

/* ══ 1108A：訂位頁每個票價卡「哩程累積 N 哩」後面加（會籍積分 N 分）（使用者：「定位時每個航班要在累積多少里程後面括號那一趟會累計匯集幾分」）
   票價卡是舊層（1004A k929）畫的，這裡在每次 render 後補字：從卡上的 pickFare(方向,班次,代號) 取代號，去程／回程依搜尋的出發地、目的地；積分＝kgmTpSegR1103A（跟會員頁同一份計算）。 */
(function(){
  if(window.__tp38)return;window.__tp38=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function deco(){try{if(S.view!=='booking'||!S.search||S.search.useMiles)return;
      [].forEach.call(document.querySelectorAll('#app article.k929-fare'),function(a){if(a.__tp38)return;var on=a.querySelector('[onclick*="pickFare("]')||(String(a.getAttribute('onclick')||'').indexOf('pickFare(')>=0?a:null);if(!on)return;
        var m=/pickFare\('(out|inb)',\s*\d+,\s*'([^']+)'/.exec(on.getAttribute('onclick')||'');if(!m)return;var fr=m[1]==='out'?S.search.fr:S.search.to,to=m[1]==='out'?S.search.to:S.search.fr;
        var b=[].filter.call(a.querySelectorAll('b'),function(x){return /^\d[\d,]*\s*哩$|^\d[\d,]*\s*mi(les)?$/.test(x.textContent.trim())})[0];if(!b)return;a.__tp38=1;
        var tp=0;try{tp=window.kgmTpSegR1103A(fr,to,m[2])||0}catch(_){}
        var s=document.createElement('small');s.className='k38tp';s.textContent=z()?'（會籍積分 '+tp+' 分）':' ('+tp+' tier pts)';b.appendChild(s)})}catch(e){try{console.warn('tp38',e)}catch(_){}}}
  function hook(){var r0=window.render;if(typeof r0==='function'&&!r0.__tp38){var w=function(){var r=r0.apply(this,arguments);deco();return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__tp38=1;window.render=w;try{render=w}catch(_){}}}
  hook();setTimeout(hook,0);setTimeout(hook,4000);setTimeout(hook,13000);
  try{var c=document.createElement('style');c.textContent='.k38tp{display:block;font-size:11px;color:#8a6d2b;font-weight:600;white-space:nowrap;text-align:right}';document.head.appendChild(c)}catch(_){}
})();

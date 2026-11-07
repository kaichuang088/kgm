from common import *
# ══ 1006A #38：「我在後台搞一個里程特惠前台沒有更新上去」——資料其實有同步（實測 3 秒內前台 S.milesPromos 已更新），
#    是前台只挑「bonus%+折扣%」最大的一個活動顯示：萬聖節 130+35 永遠贏，新活動看起來像沒同步。改成以最新推出的活動為準。
R('active promo newest',
 "}).sort(function(a,b){return (b.bonus||0)+(b.discount||0)-(a.bonus||0)-(a.discount||0);})[0]||null;",
 "}).sort(function(a,b){/* 1006A：多個活動同時有效時，以最新推出的為準（後台一推出前台就換） */return ((+b.created||Date.parse(b.start||'')||0)-(+a.created||Date.parse(a.start||'')||0));})[0]||null;")
# ══ 1006A #39：「里程購買的優惠就是要分買超過幾個里程給幾％Bonus，可以有很多個，買越多送越多」 ══
i=SRC.index('function milesPromoCouponsPanel0809CFinal(){')
e=SRC.index("  window.kgmMilesPromoPanelR1004B=milesPromoCouponsPanel0809CFinal;",i)
old=SRC[i:e]
new=r'''function milesPromoCouponsPanel0809CFinal(){
    /* 1006A：每個活動可以設很多個級距（買滿 X 哩加贈 Y%，買越多送越多）；列表標出前台目前顯示的是哪一個 */
    S.milesPromos=S.milesPromos||[];
    var cur=null;try{cur=activeMilesPromo()}catch(_){}
    function tiersOf(p){return ((p.tiers&&p.tiers.length)?p.tiers:(+p.bonus?[{min:1000,bonus:+p.bonus}]:[])).slice().sort(function(a,b){return a.min-b.min})}
    var rows=S.milesPromos.map(function(p,i){
      var tt=tiersOf(p).map(function(t){return '<span class="mp6-chip">'+Number(t.min).toLocaleString()+'+ 哩 <b>+'+(+t.bonus||0)+'%</b></span>'}).join('')||'—';
      var n=todayISO(),st=(p.end&&p.end<n)?'<span class="chip chip-err">已結束・原價</span>':(p.start&&p.start>n)?'<span class="chip chip-warn">未開始</span>':'<span class="chip chip-ok">進行中</span>';
      return '<tr'+(p===cur?' class="mp6-cur"':'')+'><td><b>'+esc(p.title||'')+'</b>'+(p===cur?'<div class="mp6-live">前台顯示中</div>':'')+'</td><td>'+esc(p.region||'')+'</td><td><div class="mp6-chips">'+tt+'</div></td><td>'+(p.discount||0)+'%</td><td>'+esc(p.start||'')+' ~ <input type="date" class="inp" style="display:inline-block;width:auto;padding:2px 6px;height:28px" value="'+esc(p.end||'')+'" title="改結束日＝延長或提前結束" onchange="adminExtendMilesPromoR928('+i+',this.value)"> '+st+'</td><td><button class="btn btn-sm" onclick="adminDeleteMilesPromo('+i+')">刪除</button></td></tr>';}).join('');
    function tierRow(min,b){return '<div class="mp6-row"><label>買滿<input type="number" class="inp mp6-min" min="1000" step="1000" value="'+min+'"><em>哩</em></label><label>加贈<input type="number" class="inp mp6-bonus" min="0" max="300" value="'+b+'"><em>%</em></label><button type="button" class="mp6-x" title="移除這一級" onclick="this.parentNode.remove()">×</button></div>'}
    window.kgmMpTierRowR1006A=tierRow;
    return '<div class="adm-card miles-promo-coupon0809c"><style>'
      +'.mp6-form{display:grid;grid-template-columns:1.3fr .8fr .6fr 1fr 1fr;gap:10px;align-items:end}'
      +'.mp6-tiers{margin-top:12px;border:1px solid #E6E1D6;border-radius:14px;padding:12px 14px;background:#FCFBF8}'
      +'.mp6-tiers h4{margin:0 0 8px;font-size:12px;color:#0B493B;letter-spacing:.04em;display:flex;justify-content:space-between;align-items:center}'
      +'.mp6-tiers h4 small{font-weight:600;color:#8a8f88;letter-spacing:0}'
      +'.mp6-row{display:flex;gap:12px;align-items:center;padding:6px 0;border-top:1px dashed #E6E1D6}.mp6-row:first-of-type{border-top:0}'
      +'.mp6-row label{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#4f5b55}.mp6-row .inp{width:120px;height:34px}.mp6-row em{font-style:normal;color:#8a8f88;font-weight:600}'
      +'.mp6-x{border:0;background:#f1ece2;color:#8a6a22;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:15px;margin-left:auto}'
      +'.mp6-add{border:1px dashed #b9a57a;background:#fff;color:#8a6a22;border-radius:999px;padding:6px 14px;font-weight:800;font-size:12px;cursor:pointer;margin-top:8px}'
      +'.mp6-go{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}.mp6-go p{margin:0;font-size:11.5px;color:#7b8580;max-width:70ch;line-height:1.7}'
      +'.mp6-chips{display:flex;flex-wrap:wrap;gap:5px}.mp6-chip{display:inline-block;border:1px solid #E1D7C2;background:#FBF7EE;border-radius:999px;padding:2px 9px;font-size:11px;color:#5b5446;white-space:nowrap}.mp6-chip b{color:#0B493B}'
      +'.mp6-cur td{background:#F3F8F5}.mp6-live{display:inline-block;margin-top:4px;font-size:10.5px;font-weight:800;color:#fff;background:#0B493B;border-radius:999px;padding:1px 8px}'
      +'@media(max-width:1100px){.mp6-form{grid-template-columns:1fr 1fr}}'
      +'</style><div class="adm-sec">購買里程優惠 / 地區投放</div>'
      +'<div class="mp6-form"><div><label class="mc-label">優惠名稱</label><input id="mpTitle" class="inp" placeholder="Asia Miles Bonus"></div><div><label class="mc-label">地區</label><select id="mpRegion" class="inp"><option value="GLOBAL">Global</option><option value="TW">台灣</option><option value="NEA">東北亞</option><option value="SEA">東南亞</option><option value="ASIA">亞洲</option><option value="NA">北美</option><option value="EU">歐洲</option><option value="OCE">大洋洲</option></select></div><div><label class="mc-label">價格折扣 %</label><input id="mpDiscount" type="number" class="inp" value="0"></div><div><label class="mc-label">開始</label><input id="mpStart" type="date" class="inp" value="'+todayISO()+'"></div><div><label class="mc-label">結束</label><input id="mpEnd" type="date" class="inp" value="'+addDays(todayISO(),30)+'"></div></div>'
      +'<div class="mp6-tiers"><h4>加贈級距<small>買越多送越多：每一級的門檻與加贈 % 都要比上一級高</small></h4><div id="mpTiers">'+tierRow(3000,30)+tierRow(10000,60)+tierRow(20000,100)+'</div>'
      +'<button type="button" class="mp6-add" onclick="var b=document.getElementById(\'mpTiers\'),r=b.querySelectorAll(\'.mp6-row\'),l=r[r.length-1],m=l?(+l.querySelector(\'.mp6-min\').value||0)+10000:3000,g=l?(+l.querySelector(\'.mp6-bonus\').value||0)+20:30,d=document.createElement(\'div\');d.innerHTML=window.kgmMpTierRowR1006A(m,g);b.appendChild(d.firstChild)">＋ 新增一級</button></div>'
      +'<div class="mp6-go"><p>同一時間有多個活動時，前台套用<b>最新推出</b>的那一個（下表標「前台顯示中」）；旅客購買時依購買數量自動套用對應級距。</p><button class="btn btn-g" onclick="adminAddMilesPromo()">推出</button></div>'
      +'<div style="overflow-x:auto;margin-top:12px"><table class="adm-tbl"><thead><tr><th>名稱</th><th>地區</th><th>加贈級距</th><th>折扣</th><th>期間</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
  }
  /* 1006A：推出時讀級距；每級門檻、加贈都要遞增 */
  window.adminAddMilesPromo=function(){
    var g=function(id){return (document.getElementById(id)||{}).value};
    var tiers=[].map.call(document.querySelectorAll('#mpTiers .mp6-row'),function(r){return {min:Math.round((+r.querySelector('.mp6-min').value||0)/1000)*1000,bonus:+r.querySelector('.mp6-bonus').value||0}}).filter(function(t){return t.min>0}).sort(function(a,b){return a.min-b.min});
    if(!tiers.length){alert('請至少設定一個加贈級距。');return}
    for(var k=1;k<tiers.length;k++){if(tiers[k].min===tiers[k-1].min||tiers[k].bonus<=tiers[k-1].bonus){alert('級距要「買越多送越多」：第 '+(k+1)+' 級的門檻與加贈 % 都必須高於上一級。');return}}
    var now=Date.now(),p={id:'MP'+now,title:g('mpTitle')||'Miles offer',region:g('mpRegion')||'GLOBAL',tiers:tiers,bonus:tiers[tiers.length-1].bonus,discount:+(g('mpDiscount')||0),start:g('mpStart')||todayISO(),end:g('mpEnd')||addDays(todayISO(),30),active:true,created:now};
    S.milesPromos=S.milesPromos||[];S.milesPromos.unshift(p);LS.set('kgm_miles_promos',S.milesPromos);try{save()}catch(_){}render();
  };
  try{adminAddMilesPromo=window.adminAddMilesPromo}catch(_){}
'''
R('promo panel tiers',old,new)
R('buy tiers columns',"(tiers?'<div class=\"buy-tier0815\">'+tiers+'</div>':'')",
 "(tiers?'<div class=\"buy-tier0815\" style=\"grid-template-columns:repeat('+Math.min(5,Math.max(1,(tiers.match(/<div/g)||[]).length))+',minmax(0,1fr))\">'+tiers+'</div>':'')/* 1006A：級距幾個就分幾欄，不會 3＋2 空一格 */")
save('p_h_promo.js','/* 1006A · 里程購買優惠：級距＋最新推出為準 */\n')

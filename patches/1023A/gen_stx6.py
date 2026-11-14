from common import *
# ══ 1006A #19：「員工票狀態我要很基本的就是每個航班每一天各個倉等還有幾個位置，是紅燈綠燈還是黃燈，介面和資料不夠清晰，也不好看」 ══
#   版面重做（資料來源不變：kgmStandbyPlanR1004B，跟航班資料的候補名單同一份數字）：
#   每一列一個航班，每個艙等一格：剩餘座位數＋燈號（綠 5 席以上／黃 1–4 席／紅 已滿）；沒有這個艙等寫「無此艙」。
#   「剩餘」＝扣掉調位組員（DH）、哩程升等候補、以及排在前面預計會上的員工票之後還空著的位子。
#   日期可以前一天／後一天切換。原本的 DH／升等／候補人數這些細節收進每列下方一行小字，點「候補名單」看完整名單。
L='kgm-0816d-r40'
li=SRC.index('<script id="'+L+'"');le=SRC.index('</script>',li);LAY=SRC[li:le]
a0=LAY.index("  var rows=window.kgmStxStatusRowsR1004B(d,fr,to,code);\n  var CZ=")
a1=LAY.index("    +'</section>';\n};\n",a0)+len("    +'</section>';\n};\n")
old=LAY[a0:a1]
new=r"""  var rows=window.kgmStxStatusRowsR1004B(d,fr,to,code);
  /* 1006A #19：每個航班 × 每個艙等：剩幾席＋紅黃綠燈 */
  var CABS6=['First','Business','Premium','Economy'],CN6={First:z()?'頭等艙':'First',Business:z()?'商務艙':'Business',Premium:z()?'豪華經濟艙':'Premium',Economy:z()?'經濟艙':'Economy'};
  function lt6(n){return n>=5?'g':n>=1?'y':'r'}
  function ltTxt6(k){return ({g:z()?'綠燈':'Green',y:z()?'黃燈':'Yellow',r:z()?'紅燈':'Red'})[k]}
  var tot={fl:rows.length,g:0,y:0,r:0};
  var body=rows.map(function(x){
    var f=x.f,p=x.p,ac='';try{ac=acftNameOf(Object.assign({},f,{date:d}))}catch(_){ac=f.acft||''}
    var cells=CABS6.map(function(c){
      if(!p.cap[c])return '<td class="k6ss-c"><span class="k6ss-na">'+(z()?'無此艙':'—')+'</span></td>';
      var n=Math.max(0,+((p.after||{})[c])||0),k=lt6(n);tot[k]++;
      return '<td class="k6ss-c"><span class="k6ss-p '+k+'" title="'+ltTxt6(k)+'"><i></i><b>'+n+'</b><small>'+(z()?'席':'')+'</small></span></td>';
    }).join('');
    var det=[(z()?'DH ':'DH ')+p.dh.length,(z()?'升等候補 ':'Upgrades ')+p.upClear+'/'+p.up.length,(z()?'員工票候補 ':'Staff ')+p.staffClearPax+'/'+p.staffPax+(z()?' 人':'')].join(' · ');
    return '<tr>'
      +'<td class="k6ss-f"><b>'+E(f.code)+'</b><span>'+E(f.fr)+' → '+E(f.to)+'</span><small>'+E(f.dep||'')+' · '+E(ac)+'</small><em>'+E(det)+'</em></td>'
      +cells
      +'<td class="k6ss-go"><button onclick="kgmStxStatusOpenR1004B(\''+A(f.code)+'\',\''+A(d)+'\',\''+A(f.fr)+'\',\''+A(f.to)+'\')">'+(z()?'候補名單':'Standby')+' ›</button></td></tr>';
  }).join('');
  var now=new Date(),hh=function(n){return (n<10?'0':'')+n};
  var css6='<style>'
    +'.k6ss{background:#fff;border:1px solid #e9e4d8;border-radius:16px;overflow:hidden}'
    +'.k6ss-h{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding:20px 24px 14px;border-bottom:1px solid #f0ebe0}'
    +'.k6ss-h small{font-size:10.5px;letter-spacing:.14em;color:#a08a5c;font-weight:800}.k6ss-h h2{margin:4px 0 4px;font-size:22px;color:#0b3b30}.k6ss-h p{margin:0;color:#7a7266;font-size:12.5px;max-width:640px;line-height:1.6}'
    +'.k6ss-live{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#1f6f4a;font-weight:800;white-space:nowrap}.k6ss-live i{width:8px;height:8px;border-radius:50%;background:#22a565;box-shadow:0 0 0 4px rgba(34,165,101,.15)}.k6ss-live small{color:#9a9186;font-weight:600}'
    +'.k6ss-bar{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px;padding:14px 24px;background:#fbf9f4;border-bottom:1px solid #f0ebe0}'
    +'.k6ss-bar label{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#8a8175;font-weight:700}.k6ss-bar .inp{height:36px;min-width:0;width:120px}'
    +'.k6ss-day{display:flex;align-items:flex-end;gap:6px}.k6ss-day button,.k6ss-clr{height:36px;border:1px solid #ddd5c4;background:#fff;border-radius:9px;padding:0 12px;font-weight:800;color:#0b3b30;cursor:pointer}'
    +'.k6ss-day input{width:150px!important}'
    +'.k6ss-leg{margin-left:auto;display:flex;gap:12px;font-size:11.5px;color:#6f675c;align-items:center;padding-bottom:9px}.k6ss-leg span{display:inline-flex;align-items:center;gap:5px}'
    +'.k6ss-leg i,.k6ss-p i{width:9px;height:9px;border-radius:50%;display:inline-block}'
    +'.k6ss .g i{background:#22a565}.k6ss .y i{background:#e0a100}.k6ss .r i{background:#d93a3a}'
    +'.k6ss-sum{display:flex;gap:10px;padding:12px 24px;border-bottom:1px solid #f0ebe0;flex-wrap:wrap}.k6ss-sum span{border-radius:10px;padding:7px 12px;font-size:12px;font-weight:800;display:inline-flex;gap:8px;align-items:center}'
    +'.k6ss-sum .n{background:#f3f0e8;color:#4a443b}.k6ss-sum .g{background:#e8f6ee;color:#1f6f4a}.k6ss-sum .y{background:#fdf4dc;color:#8a6400}.k6ss-sum .r{background:#fcebea;color:#a32a2a}.k6ss-sum b{font-size:15px}'
    +'.k6ss-t{width:100%;border-collapse:collapse}.k6ss-t th{font-size:11px;color:#8a8175;font-weight:800;text-align:center;padding:10px 8px;border-bottom:1px solid #eee7da;background:#fff;position:sticky;top:0}.k6ss-t th:first-child{text-align:left;padding-left:24px}'
    +'.k6ss-t td{border-bottom:1px solid #f3efe6;padding:10px 8px;vertical-align:middle}.k6ss-t tr:hover td{background:#fcfbf7}'
    +'.k6ss-f{padding-left:24px!important;min-width:210px}.k6ss-f b{font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#0b3b30;margin-right:8px}.k6ss-f span{font-weight:700;color:#2c2a26;font-size:13px}.k6ss-f small{display:block;color:#9a9186;font-size:11px;margin-top:2px}.k6ss-f em{display:block;color:#b2aa9c;font-size:10.5px;font-style:normal;margin-top:2px}'
    +'.k6ss-c{text-align:center;width:13%}.k6ss-p{display:inline-flex;align-items:center;gap:6px;min-width:74px;justify-content:center;border-radius:999px;padding:6px 12px;font-size:12px}'
    +'.k6ss-p b{font-size:16px;font-variant-numeric:tabular-nums}.k6ss-p small{color:inherit;opacity:.75;font-size:11px}'
    +'.k6ss-p.g{background:#e8f6ee;color:#1f6f4a}.k6ss-p.y{background:#fdf4dc;color:#8a6400}.k6ss-p.r{background:#fcebea;color:#a32a2a}'
    +'.k6ss-na{color:#c4bcae;font-size:11.5px}'
    +'.k6ss-go{text-align:right;padding-right:20px!important}.k6ss-go button{border:0;background:none;color:#0b6b52;font-weight:800;cursor:pointer;font-size:12px;white-space:nowrap}'
    +'.k6ss-empty{padding:36px;text-align:center;color:#9a9186}'
    +'@media(max-width:760px){.k6ss-h{flex-direction:column;align-items:flex-start}.k6ss-leg{margin-left:0}.k6ss-wrap{overflow-x:auto}}'
    +'</style>';
  return css6+'<section class="k6ss">'
    +'<div class="k6ss-h"><div><small>STAFF TRAVEL · LIVE</small><h2>'+(z()?'員工票狀態':'Staff travel status')+'</h2>'
      +'<p>'+(z()?'每個航班、每個艙等現在還剩幾席可以給員工票。剩餘＝空位扣掉調位組員（DH）、哩程升等候補、以及排在前面預計會上的員工票之後的座位。':'Seats still open for staff travel, per flight and cabin, after crew deadheads, upgrade standbys and staff already ahead.')+'</p></div>'
      +'<div class="k6ss-live"><i></i>'+(z()?'即時更新':'Live')+'<small>'+hh(now.getHours())+':'+hh(now.getMinutes())+'</small></div></div>'
    +'<div class="k6ss-bar">'
      +'<div class="k6ss-day"><button title="'+(z()?'前一天':'Previous day')+'" onclick="kgmStxStatusSetR1004B(\'date\',\''+A(addDays(d,-1))+'\')">‹</button>'
        +'<label>'+(z()?'日期':'Date')+'<input type="date" class="inp" value="'+E(d)+'" onchange="kgmStxStatusSetR1004B(\'date\',this.value)"></label>'
        +'<button title="'+(z()?'後一天':'Next day')+'" onclick="kgmStxStatusSetR1004B(\'date\',\''+A(addDays(d,1))+'\')">›</button></div>'
      +'<label>'+(z()?'出發':'From')+'<input class="inp" maxlength="3" value="'+E(fr)+'" placeholder="'+(z()?'全部':'All')+'" onchange="kgmStxStatusSetR1004B(\'fr\',this.value)"></label>'
      +'<label>'+(z()?'抵達':'To')+'<input class="inp" maxlength="3" value="'+E(to)+'" placeholder="'+(z()?'全部':'All')+'" onchange="kgmStxStatusSetR1004B(\'to\',this.value)"></label>'
      +'<label>'+(z()?'班號':'Flight')+'<input class="inp" maxlength="6" value="'+E(code)+'" placeholder="KX180" onchange="kgmStxStatusSetR1004B(\'code\',this.value)"></label>'
      +((q.fr||q.to||q.code)?'<button class="k6ss-clr" onclick="S.stxStatusQR1004B={date:\''+A(d)+'\'};render()">'+(z()?'清除條件':'Clear')+'</button>':'')
      +'<div class="k6ss-leg"><span class="g"><i></i>'+(z()?'綠燈 5 席以上':'Green 5+')+'</span><span class="y"><i></i>'+(z()?'黃燈 1–4 席':'Yellow 1–4')+'</span><span class="r"><i></i>'+(z()?'紅燈 已滿':'Red full')+'</span></div>'
    +'</div>'
    +'<div class="k6ss-sum"><span class="n">'+(z()?'航班':'Flights')+' <b>'+tot.fl+'</b></span><span class="g">'+(z()?'綠燈艙等':'Green')+' <b>'+tot.g+'</b></span><span class="y">'+(z()?'黃燈艙等':'Yellow')+' <b>'+tot.y+'</b></span><span class="r">'+(z()?'紅燈艙等':'Red')+' <b>'+tot.r+'</b></span>'
      +(dhBusy?'<span class="n">'+(z()?'調位組員計算中…（算完自動更新）':'Working out crew deadheads…')+'</span>':dhFar&&!dhKnown?'<span class="n">'+(z()?'這天的組員班表還沒排，DH 先不扣':'Crew roster not built yet')+'</span>':'')+'</div>'
    +(rows.length?'<div class="k6ss-wrap"><table class="k6ss-t"><thead><tr><th>'+(z()?'航班':'Flight')+'</th>'+CABS6.map(function(c){return '<th>'+CN6[c]+'</th>'}).join('')+'<th></th></tr></thead><tbody>'+body+'</tbody></table></div>'
     :'<div class="k6ss-empty">'+(z()?'這一天沒有符合條件的航班。':'No flights match.')+'</div>')
    +'</section>';
};
"""
R('stx status grid',old,new)
save('p_h_stx6.js','/* 1006A · 員工票狀態：每班每艙剩幾席＋紅黃綠燈 */\n')

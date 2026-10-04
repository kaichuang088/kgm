    /* 1004B：使用者：「優惠碼頁面整個請重整這樣好亂因為不只有優惠代碼還有里程的優惠…另外優惠碼頁面還是要優化一下」
       里程購買優惠移到「里程購買審查 › 里程購買優惠」；這一頁只管優惠碼：上面摘要，左邊建立、右邊清單（含狀態：使用中／已到期／已用完／已停用）。 */
    var _n4b=todayISO(),_st4b=function(c){return c.active===false?'off':(c.expiry&&c.expiry<_n4b)?'exp':(c.maxUses&&(+c.usedCount||0)>=+c.maxUses)?'full':'on'};
    var _cnt4b={on:0,off:0,exp:0,full:0},_used4b=0;_cps.forEach(function(c){_cnt4b[_st4b(c)]++;_used4b+=(+c.usedCount||0)});
    var _lab4b={on:'使用中',off:'已停用',exp:'已到期',full:'已用完'};
    body='<section class="k4b-cp">'
      +'<header><div><small>MARKETING · PROMO CODES</small><h2>優惠碼</h2><p>建立折扣碼，旅客在訂票確認頁輸入即可折抵。購買里程的加贈／折扣活動已移到「里程購買審查 › 里程購買優惠」。</p></div>'
      +'<div class="k4b-cp-kpi"><span><i>使用中</i><b>'+_cnt4b.on+'</b></span><span><i>已到期／用完</i><b>'+(_cnt4b.exp+_cnt4b.full)+'</b></span><span><i>已停用</i><b>'+_cnt4b.off+'</b></span><span><i>累計使用次數</i><b>'+_used4b+'</b></span></div></header>'
      +'<div class="k4b-cp-body"><div class="k4b-cp-form"><h3>建立新的優惠碼</h3>'
        +'<label>折扣碼 Code<input id="cpCode" class="inp" style="text-transform:uppercase" placeholder="SUMMER25"></label>'
        +'<div class="k4b-cp-2"><label>類型 Type<select id="cpType" class="inp"><option value="percent">百分比 % off</option><option value="fixed">固定金額 TWD off</option></select></label>'
        +'<label>折扣值 Value<input id="cpValue" class="inp" type="number" placeholder="15"></label></div>'
        +'<div class="k4b-cp-2"><label>最少航段 Min segments<input id="cpMinSegs" class="inp" type="number" value="1"></label>'
        +'<label>最多使用次數<input id="cpMaxUses" class="inp" type="number" min="0" value="0" placeholder="0 = 不限"></label></div>'
        +'<div class="k4b-cp-2"><label>適用對象 Eligible<select id="cpTier" class="inp"><option value="all">所有人 Everyone</option><option value="Bronze">Bronze Explorer</option><option value="Silver">Silver Explorer</option><option value="Gold">Gold Explorer</option><option value="Diamond">Diamond Explorer</option></select></label>'
        +'<label>到期日 Expiry（選填）<input id="cpExpiry" class="inp" type="date"></label></div>'
        +'<label>限定航段 Eligible sectors<input id="cpSectors" class="inp" style="text-transform:uppercase" placeholder="TPE-ICN, TSA-GMP 或 KX104（空白＝全部）"></label>'
        +'<button class="btn btn-g" onclick="doCreateCoupon()">建立優惠碼</button></div>'
      +'<div class="k4b-cp-list"><h3>全部優惠碼 <span>'+_cps.length+'</span></h3>'
        +(_cps.length?'<div class="k4b-cp-scroll"><table><thead><tr><th>Code</th><th>折扣</th><th>適用</th><th>限定航段</th><th class="c">使用</th><th>到期</th><th>狀態</th><th></th></tr></thead><tbody>'+_cps.map(function(c,i){var st=_st4b(c);
          return '<tr class="'+st+'"><td><b class="k4b-cp-code">'+esc(c.code)+'</b></td><td>'+(c.type==="percent"?c.value+'%':'NT$'+Number(c.value||0).toLocaleString())+(+c.minSegs>1?'<small>'+c.minSegs+' 段以上</small>':'')+'</td><td>'+(c.tier&&c.tier!=="all"?esc(c.tier):'所有人')+'</td><td>'+esc((c.sectors||[]).join(', ')||'全部')+'</td><td class="c">'+(+c.usedCount||0)+' / '+(c.maxUses||'∞')+'</td><td>'+esc(c.expiry||'—')+'</td><td><span class="k4b-cp-st '+st+'">'+_lab4b[st]+'</span></td>'
            +'<td class="r"><button class="btn btn-sm" onclick="doToggleCoupon('+i+')">'+(c.active===false?'啟用':'停用')+'</button> <button class="btn btn-sm k4b-cp-del" onclick="doDeleteCoupon('+i+')">刪除</button></td></tr>'}).join('')+'</tbody></table></div>'
         :'<div class="k4b-cp-empty">還沒有任何優惠碼。左邊填好後按「建立優惠碼」。</div>')
      +'</div></div></section>';

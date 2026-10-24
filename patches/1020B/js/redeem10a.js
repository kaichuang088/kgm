    /* 1010A #9：里程兌換優惠（酬賓機票／艙等升等）
       使用者：「里程優惠活動要可以設定航線、搭乘日期、購票（兌換）期間、折扣 %，可以選擇用在升等或酬賓」。
       · 後台：里程購買 › 里程兌換優惠（第三個分頁），推出／停用／刪除；存在 S.redeemPromosR1010A（kgm10_rdpromo，前後台同步）。
       · 航線：留空＝全部航線；「TPE-NRT」＝這個城市對（去回都算）；只寫「NRT」＝進出成田的所有航線。
       · 計價：酬賓（getAwardMi）與升等（getUpgradeMi）所需里程 × (1 − 折扣%)，四捨五入到百位；同時有好幾個活動符合時取折扣最高的那個。
       · 兌換期間看「今天」；搭乘日期看那一段航班的日期（拿不到日期時，有設搭乘期間的活動不套用）。 */
    function rdList10(){return (S.redeemPromosR1010A=Array.isArray(S.redeemPromosR1010A)?S.redeemPromosR1010A:[])}
    function rdRouteOk10(p,fr,to){
      var rs=String(p.routes||'').toUpperCase().split(/[\s,，、]+/).filter(Boolean);if(!rs.length)return true;
      return rs.some(function(r){var m=r.split(/[-–>→]+/);if(m.length===1)return m[0]===fr||m[0]===to;return (m[0]===fr&&m[1]===to)||(m[0]===to&&m[1]===fr)});
    }
    window.kgmRedeemPromoR1010A=function(fr,to,date,kind){
      var best=null,now=todayISO();
      rdList10().forEach(function(p){
        if(!p||p.active===false||!(+p.pct>0))return;
        if(kind==='award'&&!p.award)return;if(kind==='upgrade'&&!p.upgrade)return;
        if(p.bookFrom&&now<p.bookFrom)return;if(p.bookTo&&now>p.bookTo)return;
        if(p.travelFrom||p.travelTo){if(!date)return;if(p.travelFrom&&date<p.travelFrom)return;if(p.travelTo&&date>p.travelTo)return}
        if(!rdRouteOk10(p,fr,to))return;
        if(!best||+p.pct>+best.pct)best=p;
      });
      return best;
    };
    function rdDateOf10(f){
      try{if(f&&f.date)return String(f.date).slice(0,10);var s=S.search||{};if(f&&s.to&&f.fr===s.to&&s.ret)return s.ret;return s.dep||''}catch(_){return ''}
    }
    function rdApply10(v,p){return (typeof v==='number'&&v>0&&p)?Math.round(v*(1-(+p.pct)/100)/100)*100:v}
    (function(){
      try{if(typeof getAwardMi==='function'&&!getAwardMi.__r1010A){var ga=getAwardMi,w1=function(cabin,dist,f){var v=ga.apply(this,arguments);try{if(f&&f.fr&&f.to)v=rdApply10(v,window.kgmRedeemPromoR1010A(f.fr,f.to,rdDateOf10(f),'award'))}catch(_){}return v};w1.__r1010A=1;getAwardMi=w1;window.getAwardMi=w1}}catch(_){}
      try{if(typeof getUpgradeMi==='function'&&!getUpgradeMi.__r1010A){var gu=getUpgradeMi,w2=function(type,dist,cls,f){var v=gu.apply(this,arguments);try{if(f&&f.fr&&f.to)v=rdApply10(v,window.kgmRedeemPromoR1010A(f.fr,f.to,rdDateOf10(f),'upgrade'))}catch(_){}return v};w2.__r1010A=1;getUpgradeMi=w2;window.getUpgradeMi=w2}}catch(_){}
    })();
    function rdE(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function rdDesc10(p,zh){
      var k=[p.award?(zh?'酬賓機票':'Award tickets'):'',p.upgrade?(zh?'艙等升等':'Upgrades'):''].filter(Boolean).join(zh?'、':' & ');
      return k+(zh?' 所需里程 −':' miles −')+(+p.pct)+'%'+(p.routes?(zh?'・航線 ':' · routes ')+String(p.routes).toUpperCase():(zh?'・全部航線':' · all routes'))
        +((p.travelFrom||p.travelTo)?(zh?'・搭乘 ':' · travel ')+(p.travelFrom||'…')+' ~ '+(p.travelTo||'…'):'')
        +((p.bookFrom||p.bookTo)?(zh?'・兌換期間 ':' · redeem by ')+(p.bookFrom||'…')+' ~ '+(p.bookTo||'…'):'');
    }
    /* 後台面板 */
    window.kgmRedeemPromoPanelR1010A=function(){
      var zh=LANG!=='en',L=rdList10(),n=todayISO(),T=todayISO();
      var st=function(p){if(p.active===false)return '<span class="chip">'+(zh?'已停用':'Off')+'</span>';if(p.bookTo&&p.bookTo<n)return '<span class="chip chip-err">'+(zh?'已結束':'Ended')+'</span>';if(p.bookFrom&&p.bookFrom>n)return '<span class="chip chip-warn">'+(zh?'未開始':'Upcoming')+'</span>';return '<span class="chip chip-ok">'+(zh?'進行中':'Live')+'</span>'};
      var rows=L.map(function(p,i){return '<tr><td><b>'+rdE(p.title||'')+'</b><small class="rd10-sub">'+rdE(rdDesc10(p,zh))+'</small></td>'
        +'<td>'+(p.award?'✓':'—')+'</td><td>'+(p.upgrade?'✓':'—')+'</td><td><b class="rd10-pct">−'+(+p.pct)+'%</b></td>'
        +'<td>'+rdE(p.routes?String(p.routes).toUpperCase():(zh?'全部航線':'All'))+'</td>'
        +'<td>'+rdE((p.travelFrom||'—')+' ~ '+(p.travelTo||'—'))+'</td><td>'+rdE((p.bookFrom||'—')+' ~ '+(p.bookTo||'—'))+'</td><td>'+st(p)+'</td>'
        +'<td style="white-space:nowrap"><button class="btn btn-sm" onclick="kgmRedeemPromoToggleR1010A('+i+')">'+(p.active===false?(zh?'啟用':'Enable'):(zh?'停用':'Disable'))+'</button> <button class="btn btn-sm" onclick="kgmRedeemPromoDelR1010A('+i+')">'+(zh?'刪除':'Delete')+'</button></td></tr>'}).join('');
      return '<div class="adm-card rd10"><style>'
        +'.rd10-form{display:grid;grid-template-columns:1.4fr 1.2fr .6fr;gap:10px;align-items:end}.rd10-form2{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-top:10px;align-items:end}'
        +'.rd10-kind{display:flex;gap:14px;align-items:center;margin-top:12px;flex-wrap:wrap}.rd10-kind label{display:flex;gap:6px;align-items:center;font-size:12.5px;font-weight:700;color:#4f5b55;cursor:pointer}'
        +'.rd10-go{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}.rd10-go p{margin:0;font-size:11.5px;color:#7b8580;max-width:72ch;line-height:1.7}'
        +'.rd10-sub{display:block;font-size:10.5px;color:#8a8f88;margin-top:2px;font-weight:500}.rd10-pct{color:#0B493B}'
        +'.rd10 .adm-tbl td{white-space:nowrap}.rd10 .adm-tbl td:first-child{white-space:normal;min-width:220px}'
        +'@media(max-width:1100px){.rd10-form,.rd10-form2{grid-template-columns:1fr 1fr}}'
        +'</style><div class="adm-sec">'+(zh?'新增優惠活動':'New offer')+'</div>'
        +'<div class="rd10-form"><div><label class="mc-label">'+(zh?'活動名稱':'Title')+'</label><input id="rd10Title" class="inp" placeholder="'+(zh?'例：東京線酬賓 8 折':'e.g. Tokyo awards 20% off')+'"></div>'
        +'<div><label class="mc-label">'+(zh?'航線（留空＝全部；TPE-NRT 或 NRT，可多個用逗號分開）':'Routes (blank = all)')+'</label><input id="rd10Routes" class="inp" placeholder="TPE-NRT, TPE-HND"></div>'
        +'<div><label class="mc-label">'+(zh?'折扣 %':'Discount %')+'</label><input id="rd10Pct" class="inp" type="number" min="1" max="90" value="20"></div></div>'
        +'<div class="rd10-form2"><div><label class="mc-label">'+(zh?'搭乘日期（起）':'Travel from')+'</label><input id="rd10TF" class="inp" type="date" value="'+T+'"></div>'
        +'<div><label class="mc-label">'+(zh?'搭乘日期（迄）':'Travel to')+'</label><input id="rd10TT" class="inp" type="date" value="'+addDays(T,90)+'"></div>'
        +'<div><label class="mc-label">'+(zh?'兌換期間（起）':'Redeem from')+'</label><input id="rd10BF" class="inp" type="date" value="'+T+'"></div>'
        +'<div><label class="mc-label">'+(zh?'兌換期間（迄）':'Redeem to')+'</label><input id="rd10BT" class="inp" type="date" value="'+addDays(T,30)+'"></div></div>'
        +'<div class="rd10-kind"><b style="font-size:12px;color:#0B493B">'+(zh?'適用於':'Applies to')+'</b><label><input type="checkbox" id="rd10Aw" checked>'+(zh?'酬賓機票':'Award tickets')+'</label><label><input type="checkbox" id="rd10Up" checked>'+(zh?'艙等升等':'Upgrades')+'</label></div>'
        +'<div class="rd10-go"><p>'+(zh?'兌換期間看「旅客兌換的那一天」，搭乘日期看「那一段航班的日期」。同一段航班同時符合好幾個活動時，取折扣最高的一個；所需里程四捨五入到百位。':'Redeem window = the day the member redeems; travel window = the flight date. If several offers match, the highest discount applies.')+'</p>'
        +'<button class="btn btn-g" onclick="kgmRedeemPromoAddR1010A()">'+(zh?'推出':'Launch')+'</button></div>'
        +'<div style="overflow-x:auto;margin-top:12px"><table class="adm-tbl"><thead><tr><th>'+(zh?'活動':'Offer')+'</th><th>'+(zh?'酬賓':'Award')+'</th><th>'+(zh?'升等':'Upgrade')+'</th><th>'+(zh?'折扣':'Off')+'</th><th>'+(zh?'航線':'Routes')+'</th><th>'+(zh?'搭乘日期':'Travel')+'</th><th>'+(zh?'兌換期間':'Redeem')+'</th><th>'+(zh?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
        +(rows||'<tr><td colspan="9" style="text-align:center;color:#9a948a;padding:18px">'+(zh?'目前沒有里程兌換優惠。':'No redemption offers.')+'</td></tr>')+'</tbody></table></div></div>';
    };
    window.kgmRedeemPromoAddR1010A=function(){
      var g=function(id){return (document.getElementById(id)||{}).value||''},c=function(id){return !!(document.getElementById(id)||{}).checked},zh=LANG!=='en';
      var p={id:'RD'+Date.now(),title:g('rd10Title')||(zh?'里程兌換優惠':'Redemption offer'),routes:String(g('rd10Routes')).toUpperCase().replace(/\s+/g,''),pct:Math.round(+g('rd10Pct')||0),
        travelFrom:g('rd10TF'),travelTo:g('rd10TT'),bookFrom:g('rd10BF'),bookTo:g('rd10BT'),award:c('rd10Aw'),upgrade:c('rd10Up'),active:true,created:Date.now(),by:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''};
      if(!(p.pct>0&&p.pct<=90)){alert(zh?'折扣 % 要在 1–90 之間。':'Discount must be 1–90%.');return}
      if(!p.award&&!p.upgrade){alert(zh?'請至少勾選「酬賓機票」或「艙等升等」其中一個。':'Pick award tickets and/or upgrades.');return}
      if(p.travelFrom&&p.travelTo&&p.travelTo<p.travelFrom){alert(zh?'搭乘日期的迄日不能早於起日。':'Travel end is before start.');return}
      if(p.bookFrom&&p.bookTo&&p.bookTo<p.bookFrom){alert(zh?'兌換期間的迄日不能早於起日。':'Redeem end is before start.');return}
      var bad=p.routes?p.routes.split(',').filter(Boolean).filter(function(r){return !/^[A-Z]{3}(-[A-Z]{3})?$/.test(r)}):[];
      if(bad.length){alert((zh?'航線格式看不懂：':'Unknown route format: ')+bad.join(', ')+(zh?'（請寫 TPE-NRT 或 NRT）':' (use TPE-NRT or NRT)'));return}
      rdList10().unshift(p);try{logAct&&logAct('推出里程兌換優惠',p.title+'：'+rdDesc10(p,true))}catch(_){}try{save()}catch(_){}render();
    };
    window.kgmRedeemPromoToggleR1010A=function(i){var p=rdList10()[i];if(!p)return;p.active=p.active===false;try{save()}catch(_){}render()};
    window.kgmRedeemPromoDelR1010A=function(i){var L=rdList10(),p=L[i];if(!p)return;if(!confirm((LANG!=='en'?'刪除這個里程兌換優惠？':'Delete this offer?')+'\n'+(p.title||'')))return;L.splice(i,1);try{save()}catch(_){}render()};
    /* 前台：酬賓搜尋頁與升等頁顯示符合的優惠（所需里程本身已經是折扣後的數字） */
    window.kgmRedeemBannerR1010A=function(fr,to,date,kind){
      var p=window.kgmRedeemPromoR1010A(fr,to,date,kind);if(!p)return '';var zh=LANG!=='en';
      return '<div class="rd10-ban" data-rd10="'+rdE(p.id)+'"><b>−'+(+p.pct)+'%</b><span><strong>'+rdE(p.title||'')+'</strong>'
        +(zh?'　'+(kind==='award'?'酬賓機票':'艙等升等')+'所需里程已打 '+(100-(+p.pct))/10+' 折（已反映在下方里程數）':'  '+(+p.pct)+'% fewer miles — already reflected below')
        +((p.bookTo)?(zh?'・兌換至 '+p.bookTo:' · redeem by '+p.bookTo):'')+'</span></div>';
    };
    (function(){
      try{if(!document.getElementById('kgm-rd10-css')){var s=document.createElement('style');s.id='kgm-rd10-css';s.textContent='.rd10-ban{display:flex;align-items:center;gap:12px;margin:10px 0 14px;padding:11px 16px;border:1px solid #E7D6A8;background:linear-gradient(90deg,#FBF4E2,#FFFDF8);border-radius:14px;font-size:12.5px;color:#5B4A1E}.rd10-ban b{font:900 15px Georgia,serif;color:#fff;background:#B0892F;border-radius:10px;padding:4px 10px;white-space:nowrap}.rd10-ban strong{color:#1F4E46;margin-right:2px}';(document.head||document.documentElement).appendChild(s)}}catch(_){}
      var r0=window.render;if(typeof r0!=='function'||r0.__rd10)return;
      var w=function(){var r=r0.apply(this,arguments);try{
        var s=S.search||{};
        if(S.view==='booking'&&s.useMiles){var h=document.querySelector('#app section.award-shop .award-heading');if(h&&!h.parentNode.querySelector('.rd10-ban')){var inb=S.phase==='inb'||S.bookPhase==='inb',fr=inb?s.to:s.fr,to=inb?s.fr:s.to,d=inb?s.ret:s.dep;var x=window.kgmRedeemBannerR1010A(fr,to,d,'award');if(x)h.insertAdjacentHTML('afterend',x)}}
      }catch(_){}return r};
      w.__rd10=1;Object.keys(r0).forEach(function(k){try{w[k]=r0[k]}catch(_){}});window.render=w;try{render=w}catch(_){}
    })();

import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
hdr='''/* 0928B · 購買里程優惠到期自動恢復原價（使用者：「里程活動到10/31一但結束要自動恢復原價移除那些特惠什麼的，除非後台有去延長或是創立新活動」）
   原本：0919A 把「USD26／1,000 哩、加贈 80／100／130%」直接寫死在報價函式，promo 物件也是寫死的 end:'2026-10-31'，
   畫面上的「萬聖節限定、下調 35%、至 10/31」也是寫死的字 —— 所以 11/1 之後還是照優惠價賣，後台也延長不了。
   現在：萬聖節優惠變成後台「購買里程優惠／地區投放」裡的一檔活動（HALLOWEEN2026，2026-09-19～2026-10-31）；
   報價與畫面都讀「今天有效的活動」（activeMilesPromo，原本就有）。沒有有效活動 → 原價 USD40／1,000 哩、不加贈、不顯示優惠字樣。
   後台活動表的結束日可以直接改（延長），也可以照舊推出新活動。 */
'''
old_q="""  promoTiers0815=function(){return [{min:3000,bonus:80},{min:10000,bonus:100},{min:20000,bonus:130}];};
  buyMilesTierQuote0815=function(qty){qty=Math.max(1000,Math.min(100000,Math.round((qty||1000)/1000)*1000));var tiers=promoTiers0815(),pct=0;tiers.forEach(function(t){if(qty>=t.min)pct=Math.max(pct,t.bonus);});var bonus=Math.round(qty*pct/100),usd=qty/1000*26;return{qty:qty,bonus:bonus,bonusPct:pct,totalMiles:qty+bonus,usd:usd,promo:{end:'2026-10-31',region:'GLOBAL'},tiers:tiers};};"""
new_q="""  /* 0928B：優惠改成後台活動、到期自動恢復原價（原價 USD40／1,000 哩，就是上面註解裡的「原本」價格） */
  var MILES_BASE_USD_R928=40;window.KGM_MILES_BASE_USD_R928=MILES_BASE_USD_R928;
  try{S.milesPromos=S.milesPromos||LS.get('kgm_miles_promos',[])||[];
    if(!LS.get('kgm_promo_seed_r928',0)){
      if(!S.milesPromos.some(function(p){return p&&p.id==='HALLOWEEN2026'}))S.milesPromos.push({id:'HALLOWEEN2026',title:'萬聖節限定優惠',titleEn:'Halloween offer',region:'GLOBAL',bonus:130,discount:35,usdPerK:26,tiers:[{min:3000,bonus:80},{min:10000,bonus:100},{min:20000,bonus:130}],start:'2026-09-19',end:'2026-10-31',active:true});
      LS.set('kgm_miles_promos',S.milesPromos);LS.set('kgm_promo_seed_r928',1)}}catch(_){}
  promoTiers0815=function(){var p=activeMilesPromo();if(!p)return [];if(p.tiers&&p.tiers.length)return p.tiers;if(+p.bonus)return [{min:3000,bonus:Math.max(0,p.bonus-20)},{min:10000,bonus:Math.max(0,p.bonus-10)},{min:20000,bonus:+p.bonus}];return [];};
  buyMilesTierQuote0815=function(qty){qty=Math.max(1000,Math.min(100000,Math.round((qty||1000)/1000)*1000));var p=activeMilesPromo(),tiers=promoTiers0815(),pct=0;tiers.forEach(function(t){if(qty>=t.min)pct=Math.max(pct,+t.bonus||0);});var perK=p?(+p.usdPerK||MILES_BASE_USD_R928*(1-(+p.discount||0)/100)):MILES_BASE_USD_R928;var bonus=Math.round(qty*pct/100),usd=Math.round(qty/1000*perK*100)/100;return{qty:qty,bonus:bonus,bonusPct:pct,totalMiles:qty+bonus,usd:usd,promo:p,tiers:tiers,perK:perK,basePerK:MILES_BASE_USD_R928};};
  /* 0928B：購買里程頁上的優惠字樣全部依有效活動產生；沒有活動就不顯示任何優惠字樣 */
  window.kgmBuyPromoTextR928=function(q,Z){
    var p=q&&q.promo;
    if(!p)return{tag:'KGM MILES · BUY MILES',h1:Z?'購買哩程':'Buy miles',p:Z?'目前沒有進行中的購買里程優惠，依原價 USD '+MILES_BASE_USD_R928+'／1,000 哩計算。':'No miles promotion is running right now. Standard price: USD '+MILES_BASE_USD_R928+' per 1,000 miles.',note:Z?'原價 USD '+MILES_BASE_USD_R928+'／1,000 哩，結帳時自動計算。':'Standard price USD '+MILES_BASE_USD_R928+' per 1,000 miles, calculated at checkout.',small:Z?'原價 USD '+MILES_BASE_USD_R928+'／1,000 哩｜目前無加贈':'Standard price USD '+MILES_BASE_USD_R928+' / 1,000 miles · no bonus'};
    var max=(q.tiers||[]).reduce(function(a,t){return Math.max(a,+t.bonus||0)},0),off=Math.round((1-(q.perK||MILES_BASE_USD_R928)/MILES_BASE_USD_R928)*100),end=p.end||'',hw=p.id==='HALLOWEEN2026',md=end?(+end.slice(5,7))+'/'+(+end.slice(8,10)):'',glob=p.region==='GLOBAL';
    var t=Z?(p.title||'限時優惠'):(p.titleEn||p.title||'Limited-time offer');
    return{tag:'KGM MILES · '+(hw?'HALLOWEEN OFFER':'LIMITED OFFER'),
      h1:max?(Z?'最高加贈 '+max+'% 哩程':'Get up to '+max+'% bonus miles'):(Z?'購買哩程優惠':'Miles offer'),
      p:Z?(t+(off>0?'，所有購買里程價格下調 '+off+'%':'')+(end?'。優惠至 '+end+(hw&&end==='2026-10-31'?'（萬聖節）':''):'')+'。'):(t+(off>0?'. Buy miles at '+off+'% lower prices':'')+(end?'. Ends '+end:'')+'.'),
      note:Z?(t+'價格，'+(glob?'全球會員皆適用':'符合地區的會員適用')+'，結帳時自動套用。'):(t+' pricing, '+(glob?'available to all members':'for eligible regions')+', applied automatically at checkout.'),
      small:Z?((max?'最高加贈 '+max+'%｜':'')+(off>0?'價格下調 '+off+'%｜':'')+(glob?'全球適用｜':'')+'至'+(hw&&end==='2026-10-31'?'萬聖節 ':' ')+md+'。'):((max?'Up to '+max+'% bonus · ':'')+(off>0?off+'% lower pricing · ':'')+'until '+md+'.')};
  };
  window.adminExtendMilesPromoR928=function(i,v){S.milesPromos=S.milesPromos||[];var p=S.milesPromos[i];if(!p||!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(v||'')))return;p.end=v;LS.set('kgm_miles_promos',S.milesPromos);try{save()}catch(_){}render();};"""
R('promo quote 0919A',old_q,new_q)
# UI strings (buyMilesPointsUI at 0809B block)
R('promo ui hero',
"""<span>KGM MILES · HALLOWEEN OFFER</span><h1>'+(Z?'最高加贈 130% 哩程':'Get up to 130% bonus miles')+'</h1><p>'+(Z?'萬聖節限定優惠，所有購買里程價格下調 35%。優惠至 2026-10-31（萬聖節）。':'Halloween offer. Buy miles at 35% lower prices. Ends 2026-10-31.')+'</p><div class="buy-tier0815">'+tiers+'</div>""",
"""<span>'+pt928.tag+'</span><h1>'+pt928.h1+'</h1><p>'+pt928.p+'</p>'+(tiers?'<div class="buy-tier0815">'+tiers+'</div>':'')+'""")
R('promo ui note',
"""<div class="buy-note0815">'+(Z?'萬聖節限定價格，全球會員皆適用，結帳時自動套用。':'Halloween pricing, available to all members, applied automatically at checkout.')+'</div>""",
"""<div class="buy-note0815">'+pt928.note+'</div>""")
R('promo ui small',
"""<small>'+(Z?'最高加贈 130%｜價格下調 35%｜全球適用｜至萬聖節 10/31。':'Up to 130% bonus · 35% lower pricing · until 10/31.')+'</small>""",
"""<small>'+pt928.small+'</small>""")
# define pt928 in that function: tiers var line (unique inside that function? check count)
R('promo ui var',
"""    var tiers=q.tiers.map(function(t){return '<div><b>'+t.bonus+'% '+(Z?'加贈':'bonus')+'</b><span>'+Number(t.min).toLocaleString()+'+ '+(Z?'哩程':'miles')+'</span></div>';}).join('');
    return '<div class="buy-points0815"><section class="buy-hero0815"><div class="buy-skyline0815"></div><div class="buy-hero-content0815"><span>'+pt928.tag""",
"""    var tiers=q.tiers.map(function(t){return '<div><b>'+t.bonus+'% '+(Z?'加贈':'bonus')+'</b><span>'+Number(t.min).toLocaleString()+'+ '+(Z?'哩程':'miles')+'</span></div>';}).join('');
    var pt928=window.kgmBuyPromoTextR928?window.kgmBuyPromoTextR928(q,Z):{tag:'',h1:'',p:'',note:'',small:''};   /* 0928B：優惠字樣依有效活動 */
    return '<div class="buy-points0815"><section class="buy-hero0815"><div class="buy-skyline0815"></div><div class="buy-hero-content0815"><span>'+pt928.tag""")
# admin rows: period cell + status
R('promo admin period',
"""<td>'+esc(p.start||'')+' ~ '+esc(p.end||'')+'</td>""",
"""<td>'+esc(p.start||'')+' ~ <input type="date" class="inp" style="display:inline-block;width:auto;padding:2px 6px;height:28px" value="'+esc(p.end||'')+'" title="改結束日＝延長或提前結束" onchange="adminExtendMilesPromoR928('+i+',this.value)"> '+(function(){var n=todayISO();return (p.end&&p.end<n)?'<span class="chip chip-err">已結束・原價</span>':(p.start&&p.start>n)?'<span class="chip chip-warn">未開始</span>':'<span class="chip chip-ok">進行中</span>'})()+'</td>""",2)
open('p_e_promo.js','w').write(hdr+'\n'.join(out)+'\n')

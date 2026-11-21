import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
hdr='''/* 0928B · 購買里程（使用者：「購買里程完要有一個大勾勾購買成功的頁面 如果是首次或是第二次購買要寫您購買會需要24-72小時安全驗證才會有里程入帳，
   如果是第三次以後就可以直接給里程，然後後台里程購買審核要顯示所有旅客資料、付款資料、第幾次購買等等要夠清楚」）
   ① 成功頁：0809G 寫好的成功頁其實是死碼 —— r49 之後的里程頁整個換掉、0919A 的「購買里程」分頁直接回購買畫面，
      所以付款後永遠只回到購買頁。改由實際在跑的 0919A 分頁先判斷「剛完成的訂單」，畫出大勾勾成功頁；換頁（nav）就清掉。
   ② 入帳規則：原本「首次驗證通過後一律直接入帳」（第二次就直接入帳）。改成：先前已成功入帳 0 或 1 次（也就是第 1、2 次購買）
      → 24–72 小時安全驗證；已成功入帳 2 次以上（第 3 次起）→ 付款完成直接入帳。購買頁、付款視窗、通知、Email 的字都照這個規則。
   ③ 後台審核（實際在用的是 r6 milesReviewHtml6）：每一筆加上「旅客資料（輸入 vs 會員註冊）」「付款資料」「第幾次購買／先前成功幾次／適用規則」「購買明細（基本＋加贈、單價、活動）」。
      付款視窗改用訂位那一版信用卡介面後，多了持卡人姓名、Email、電話，AI 比對的 Email／持卡人姓名兩欄也才有資料可比。 */
'''
# 1) quote breakdown carried into pendingMiles (live declaration: tier version)
R('buymi quote carry',
"""function doPointsBuyMiles(){var q=buyMilesTierQuote0815(S._buyMilesQty||10000);doBuyMiles(q.totalMiles,q.usd);}""",
"""function doPointsBuyMiles(){var q=buyMilesTierQuote0815(S._buyMilesQty||10000);doBuyMiles(q.totalMiles,q.usd);if(S.pendingMiles)S.pendingMiles.quoteR928={qty:q.qty,bonus:q.bonus,bonusPct:q.bonusPct,perK:q.perK||0,promo:q.promo?(q.promo.title||q.promo.id||''):''};   /* 0928B：後台看得到基本／加贈／單價／活動 */}""")
# 2) 0809G: rule helper + confirm logic
R('buymi rule helper',
"""  function purchaseNoG(uid){return (S.milesPurchaseCases0809D||[]).filter(function(x){return x.userId===uid;}).length+1;}""",
"""  function purchaseNoG(uid){return (S.milesPurchaseCases0809D||[]).filter(function(x){return x.userId===uid;}).length+1;}
  /* 0928B：第 1、2 次購買要 24–72 小時安全驗證；先前已成功入帳 2 次（第 3 次起）直接入帳 */
  function milesRuleR928(uid){var cs=(S.milesPurchaseCases0809D||[]).filter(function(x){return x.userId===uid;}),ok=cs.filter(function(x){return /approved|credited/.test(String(x.status||''));}).length;return {n:cs.length+1,ok:ok,instant:ok>=2};}
  window.kgmMilesRuleR928=milesRuleR928;""")
R('buymi confirm',
"""    var c={id:nextMilesOrderG(),userId:u.id,name:name,dob:dob,address:addr,memberId:mid,cardLast4:cc.slice(-4),miles:+p.mi||0,usd:+p.usd||0,purchaseNo:purchaseNoG(u.id),created:new Date().toISOString(),window:'24–72 hr',paymentMethod:'card •••• '+cc.slice(-4),status:'pending_security',reason:''};
    c.ai=aiMilesCompareG(c,memberByIdG(u.id)||u);var verified=firstVerifiedG(memberByIdG(u.id)||u);
    if(verified){c.status='credited_direct';c.reviewed=new Date().toISOString();creditPurchasedMilesG(c);notifyG(u.id,'購買里程已入帳 '+c.id,Number(c.miles).toLocaleString()+' 哩已直接入帳；您已通過首次購買驗證。','miles_purchase');}""",
"""    var rule=milesRuleR928(u.id),qt=p.quoteR928||{},br=(typeof kgmCardBrandR923==='function'?kgmCardBrandR923(cc):'')||'CARD';
    var c={id:nextMilesOrderG(),userId:u.id,name:name,dob:dob,address:addr,memberId:mid,cardLast4:cc.slice(-4),miles:+p.mi||0,usd:+p.usd||0,purchaseNo:rule.n,okBeforeR928:rule.ok,ruleR928:rule.instant?'instant':'review',created:new Date().toISOString(),window:rule.instant?'—':'24–72 hr',paymentMethod:br+' •••• '+cc.slice(-4),status:'pending_security',reason:'',
      cardName:v('bmCardName'),cardBrand:br,cardExp:exp,email:v('bmEmail'),phone:(v('bmCc')+' '+v('bmTel')).trim(),baseMilesR928:+qt.qty||0,bonusMilesR928:+qt.bonus||0,bonusPctR928:+qt.bonusPct||0,perKR928:+qt.perK||0,promoR928:qt.promo||''};
    c.ai=aiMilesCompareG(c,memberByIdG(u.id)||u);
    if(rule.instant){c.status='credited_direct';c.reviewed=new Date().toISOString();creditPurchasedMilesG(c);notifyG(u.id,'購買里程已入帳 '+c.id,'第 '+rule.n+' 次購買：'+Number(c.miles).toLocaleString()+' 哩已直接入帳（先前已成功購買 '+rule.ok+' 次，免安全驗證）。','miles_purchase');}""")
R('buymi pending notify',
"""    else {notifyG(u.id,'購買里程審核 '+c.id,'首次購買資料比對一致，進入 24–72 小時安全審核；審核通過後才會入帳。','miles_purchase_review');}""",
"""    else {notifyG(u.id,'購買里程審核 '+c.id,'第 '+rule.n+' 次購買：付款完成，需要 24–72 小時安全驗證，驗證通過後里程才會入帳。','miles_purchase_review');}""")
# 3) buy page note + modal intro
R('buymi page note',
"""note='<div class="buy-note0815">'+(Z?'里程購買完成付款後，首次購買通常需要 24–72 小時完成資料驗證後才會進帳；首次驗證成功後，之後購買將直接入帳。':'After payment, a first-time miles purchase normally takes 24–72 hours to verify and credit. After one successful verification, later purchases credit directly.')+'</div>';""",
"""rl=S.user?milesRuleR928(S.user.id):null,note='<div class="buy-note0815">'+(Z?'第 1、2 次購買：付款後需要 24–72 小時安全驗證，通過後里程才會入帳；第 3 次起付款完成直接入帳。':'1st and 2nd purchases: miles credit after a 24–72 hour security verification. From the 3rd purchase, miles credit as soon as you pay.')+(rl?'<br><b>'+(Z?('這將是您第 '+rl.n+' 次購買，'+(rl.instant?'付款完成後直接入帳。':'付款後需 24–72 小時安全驗證才會入帳。')):('This will be your purchase #'+rl.n+': '+(rl.instant?'miles credit immediately.':'miles credit after a 24–72 hour verification.')))+'</b>':'')+'</div>';""")
R('buymi modal intro',
"""var Z=LANG!=='en',verified=firstVerifiedG(memberByIdG(S.user.id)||S.user);
    var intro=verified?(Z?'您的首次購買驗證已通過，本次付款完成後里程會直接入帳。':'Your first-purchase verification is already complete. Miles from this payment will credit directly.'):(Z?'首次購買需進行資料驗證，通常需要 24–72 小時後里程才會進帳。':'A first miles purchase requires identity verification and normally credits within 24–72 hours.');""",
"""var Z=LANG!=='en',rl=milesRuleR928(S.user.id),verified=rl.instant;
    var intro=verified?(Z?('這是您第 '+rl.n+' 次購買（先前已成功 '+rl.ok+' 次），付款完成後里程直接入帳。'):('Purchase #'+rl.n+' (already '+rl.ok+' successful). Miles credit as soon as you pay.')):(Z?('這是您第 '+rl.n+' 次購買：付款後需要 24–72 小時安全驗證，通過後里程才會入帳（第 3 次起直接入帳）。'):('Purchase #'+rl.n+': miles credit after a 24–72 hour security verification (from the 3rd purchase, instantly).'));""")
# 4) success page: 0809G renderer becomes a named function, used by live 0919A tab
R('buymi success fn',
"""  var _milesPageG=milesPageView;
  milesPageView=function(){
    if(S.milesPurchaseSuccess0809D){var c=S.milesPurchaseSuccess0809D,Z=LANG!=='en',bad=/refunded|mismatch/.test(c.status),ok=/approved|credited/.test(c.status);return""",
"""  /* 0928B：大勾勾成功頁（實際由 0919A 的「購買里程」分頁呼叫） */
  window.kgmMilesSuccessR928=function(c){
    var Z=LANG!=='en',bad=/refunded|mismatch/.test(String(c.status||'')),ok=/approved|credited/.test(String(c.status||'')),t=new Date(c.created||Date.now());
    function dt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
    var from=new Date(t.getTime()+24*3600e3),to=new Date(t.getTime()+72*3600e3);
    var msg=bad?(Z?'輸入資料與會員註冊資料不一致，購買未成立，款項將原路退回原付款方式。':'Your details did not match your registered profile. The payment will be returned to the original payment method.')
      :ok?(Z?('第 '+c.purchaseNo+' 次購買：里程已直接入帳，現在就可以使用。'):('Purchase #'+c.purchaseNo+': your miles are already in your account.'))
      :(Z?('第 '+c.purchaseNo+' 次購買：您購買會需要 24–72 小時安全驗證才會有里程入帳。驗證完成後會以通知與 Email 告訴您。'):('Purchase #'+c.purchaseNo+': miles are credited after a 24–72 hour security verification. We will notify you by message and email.'));
    var base=+c.baseMilesR928||0,bon=+c.bonusMilesR928||0;
    return '<style>.k928-ms{max-width:760px;margin:26px auto 40px;background:#fff;border:1px solid var(--border);border-radius:22px;padding:40px 38px 32px;text-align:center;box-shadow:0 18px 40px -24px rgba(11,73,59,.45)}'
      +'.k928-ms-tick{width:104px;height:104px;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:#0B493B;color:#fff;font-size:58px;font-weight:900;line-height:1;box-shadow:0 0 0 12px #E5F1EC}'
      +'.k928-ms-tick.bad{background:#B4472F;box-shadow:0 0 0 12px #F8E4DE}'
      +'.k928-ms small.k{display:block;font-size:10px;letter-spacing:.16em;color:var(--gold);font-weight:900;margin-top:6px}'
      +'.k928-ms h1{font-family:Georgia,serif;font-size:38px;color:var(--g);margin:6px 0 8px}.k928-ms p{color:#4E5A54;font-size:14px;line-height:1.75;margin:0 auto;max-width:560px}'
      +'.k928-ms-note{margin:16px auto 0;max-width:560px;padding:11px 14px;border-radius:12px;background:#FFF8EA;border:1px solid #EAD9B4;color:#6B5A2E;font-size:12.5px;text-align:left}'
      +'.k928-ms-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:22px 0 18px;text-align:left}.k928-ms-grid div{background:#F7F5EF;border-radius:12px;padding:11px 13px}.k928-ms-grid small{display:block;font-size:10px;color:#7B817D;letter-spacing:.06em}.k928-ms-grid b{display:block;font-size:15px;color:#0B493B;margin-top:3px}'
      +'.k928-ms-act{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}@media(max-width:640px){.k928-ms{padding:28px 16px}.k928-ms-grid{grid-template-columns:1fr 1fr}.k928-ms h1{font-size:30px}}</style>'
      +'<section class="k928-ms"><div class="k928-ms-tick'+(bad?' bad':'')+'">'+(bad?'✕':'✓')+'</div><small class="k">KGM MILES · '+(bad?'PURCHASE FAILED':'PURCHASE COMPLETE')+'</small>'
      +'<h1>'+(bad?(Z?'購買失敗':'Purchase failed'):(Z?'購買成功':'Purchase successful'))+'</h1><p>'+hg(msg)+'</p>'
      +(!bad&&!ok?'<div class="k928-ms-note">'+(Z?('預計入帳：'+dt(from)+' ～ '+dt(to)+'（24–72 小時）。第 3 次購買起付款完成直接入帳。'):('Expected credit: '+dt(from)+' – '+dt(to)+' (24–72 hours). From your 3rd purchase, miles credit instantly.'))+'</div>':'')
      +'<div class="k928-ms-grid"><div><small>'+(Z?'訂單號碼':'Order number')+'</small><b>'+hg(c.id)+'</b></div><div><small>'+(Z?'入帳里程':'Miles')+'</small><b>'+Number(c.miles||0).toLocaleString()+' mi</b></div><div><small>'+(Z?'付款金額':'Amount paid')+'</small><b>USD '+Number(c.usd||0).toFixed(2)+'</b></div>'
      +'<div><small>'+(Z?'購買／加贈':'Purchased / bonus')+'</small><b>'+(base?base.toLocaleString()+' + '+bon.toLocaleString():Number(c.miles||0).toLocaleString())+'</b></div><div><small>'+(Z?'付款方式':'Payment')+'</small><b>'+hg(c.paymentMethod||('•••• '+(c.cardLast4||'')))+'</b></div><div><small>'+(Z?'第幾次購買':'Purchase no.')+'</small><b>'+(Z?('第 '+c.purchaseNo+' 次'):('#'+c.purchaseNo))+'</b></div></div>'
      +'<div class="k928-ms-act"><button class="btn btn-g" onclick="S.milesPurchaseSuccess0809D=null;S.profileTab=\\'miles\\';nav(\\'profile\\')">'+(Z?'查看我的里程':'View my miles')+'</button><button class="btn" onclick="S.milesPurchaseSuccess0809D=null;S.milesTab=\\'overview\\';render()">'+(Z?'返回無限萬哩遊':'Back to KGM Miles')+'</button></div></section>';
  };
  var _milesPageG=milesPageView;
  milesPageView=function(){
    if(S.milesPurchaseSuccess0809D){var c=S.milesPurchaseSuccess0809D,Z=LANG!=='en',bad=/refunded|mismatch/.test(c.status),ok=/approved|credited/.test(c.status);return""")
# live 0919A tab
R('buymi success live',
"""  if(t==='buymiles'||t==='buy')return '<main class="h-buy-page"><button class="btn" onclick="S.milesTab=\\'overview\\';render()">← '+(hz()?'返回無限萬里遊':'Back to KGM Miles')+'</button>'+buyMilesPointsUI()+'</main>';""",
"""  if((t==='buymiles'||t==='buy')&&S.milesPurchaseSuccess0809D&&window.kgmMilesSuccessR928)return '<main class="h-buy-page">'+window.kgmMilesSuccessR928(S.milesPurchaseSuccess0809D)+'</main>';   /* 0928B：付款後的成功頁 */
  if(t==='buymiles'||t==='buy')return '<main class="h-buy-page"><button class="btn" onclick="S.milesTab=\\'overview\\';render()">← '+(hz()?'返回無限萬里遊':'Back to KGM Miles')+'</button>'+buyMilesPointsUI()+'</main>';""")
# 5) email status follows the real result
R('buymi email status',
"""status:'pending_security',statusLabel:statusNameQ('pending_security'),subject:(Z()?'里程購買確認 ':'Mileage purchase confirmation ')+c.id,title:Z()?'里程購買確認':'Mileage purchase confirmation',message:Z()?'訂單已收到，狀態：安全驗證中。':'Order received. Status: Security verification.'});""",
"""status:c.status,statusLabel:statusNameQ(c.status),subject:(Z()?'里程購買確認 ':'Mileage purchase confirmation ')+c.id,title:Z()?'里程購買確認':'Mileage purchase confirmation',message:c.status==='credited_direct'?(Z()?('第 '+c.purchaseNo+' 次購買，里程已直接入帳。'):('Purchase #'+c.purchaseNo+'. Miles credited.')):/refunded|mismatch/.test(c.status)?(Z()?'資料不一致，購買未成立，款項原路退回。':'Details did not match; payment refunded.'):(Z()?('第 '+c.purchaseNo+' 次購買，訂單已收到，需要 24–72 小時安全驗證後入帳。'):('Purchase #'+c.purchaseNo+' received. Miles credit after a 24–72 hour security verification.'))});   /* 0928B：狀態照實際結果 */""")
# 6) r75 validation: cardholder name
RL('buymi r75 name','kgm-0823p-r75',
"""      if(v('bmCVV').length<3)miss.push(z()?'安全碼 CVV':'CVV');""",
"""      if(v('bmCVV').length<3)miss.push(z()?'安全碼 CVV':'CVV');
      if(document.getElementById('bmCardName')&&!v('bmCardName'))miss.push(z()?'持卡人姓名':'Name on card');   /* 0928B：新版信用卡介面 */""")
# 7) admin r6 panel: detail block
R('buymi admin detail',
"""return '<article class="r6-card r6-admin-case"><header><div><b>'+E6(c.id)+'</b><p class="r6-muted">'+E6(c.memberId||c.userId)+' · '+Number(c.miles||0).toLocaleString()+' mi · USD '+Number(c.usd||0).toFixed(2)+'</p></div>""",
"""var u928=(S.users||[]).find(function(x){return x.id===c.userId||x.id===c.memberId;})||{},D928=function(k,a,b){return '<tr><th>'+E6(k)+'</th><td>'+E6(a||'—')+'</td>'+(b===undefined?'':'<td>'+E6(b||'—')+'</td>')+'</tr>';},nb928=+c.purchaseNo||1,okb928=(c.okBeforeR928!=null)?+c.okBeforeR928:(S.milesPurchaseCases0809D||[]).filter(function(x){return x.userId===c.userId&&x!==c&&String(x.created||'')<String(c.created||'')&&/approved|credited/.test(String(x.status||''));}).length;
      /* 0928B：旅客資料／付款資料／第幾次購買，一筆看完 */
      var det928='<div class="k928-mr"><section><h4>'+(Z6()?'旅客資料':'Passenger')+'</h4><table><tr><th></th><td><i>'+(Z6()?'購買時輸入':'Entered')+'</i></td><td><i>'+(Z6()?'會員註冊資料':'Registered')+'</i></td></tr>'
        +D928(Z6()?'會員卡號':'Member ID',c.memberId,u928.id)+D928(Z6()?'姓名':'Name',c.name,u928.name||[u928.lastName,u928.firstName].filter(Boolean).join(' '))+D928(Z6()?'出生日期':'Date of birth',c.dob,u928.dob)
        +D928(Z6()?'帳單地址':'Billing address',c.address,u928.address||u928.city||'')+D928('Email',c.email,u928.email)+D928(Z6()?'電話':'Phone',c.phone,[u928.phoneCc||u928.countryCode,u928.phone].filter(Boolean).join(' '))+'</table></section>'
        +'<section><h4>'+(Z6()?'付款資料':'Payment')+'</h4><table>'+D928(Z6()?'付款方式':'Method',c.paymentMethod||('•••• '+(c.cardLast4||'')))+D928(Z6()?'卡別':'Brand',c.cardBrand)+D928(Z6()?'持卡人姓名':'Cardholder',c.cardName||c.cardholder)+D928(Z6()?'有效期限':'Expiry',c.cardExp)+D928(Z6()?'付款金額':'Amount','USD '+Number(c.usd||0).toFixed(2))+D928(Z6()?'付款時間':'Paid at',String(c.created||'').replace('T',' ').slice(0,16))+D928(Z6()?'退款':'Refund',c.refundUSD?('USD '+Number(c.refundUSD).toFixed(2)+' · '+(c.refundMethod||'')):'')+'</table></section>'
        +'<section><h4>'+(Z6()?'購買紀錄':'Purchase')+'</h4><table>'+D928(Z6()?'第幾次購買':'Purchase no.',(Z6()?'第 ':'#')+nb928+(Z6()?' 次':''))+D928(Z6()?'先前成功入帳':'Previously credited',okb928+(Z6()?' 次':''))+D928(Z6()?'適用規則':'Rule',okb928>=2?(Z6()?'第 3 次起：直接入帳':'3rd+: instant credit'):(Z6()?'第 1、2 次：24–72 小時安全驗證':'1st/2nd: 24–72h verification'))
        +D928(Z6()?'入帳里程':'Miles',Number(c.miles||0).toLocaleString()+' mi')+D928(Z6()?'購買／加贈':'Base / bonus',c.baseMilesR928?(Number(c.baseMilesR928).toLocaleString()+' + '+Number(c.bonusMilesR928||0).toLocaleString()+' ('+(c.bonusPctR928||0)+'%)'):'')+D928(Z6()?'單價／活動':'Price / offer',c.perKR928?('USD '+c.perKR928+' / 1,000'+(c.promoR928?' · '+c.promoR928:'')):'')+D928(Z6()?'會員等級／國籍':'Tier / nationality',[u928.level,u928.nat||u928.country].filter(Boolean).join(' · '))+D928(Z6()?'審核完成':'Reviewed',String(c.reviewed||'').replace('T',' ').slice(0,16))+'</table></section></div>';
      return '<article class="r6-card r6-admin-case"><header><div><b>'+E6(c.id)+'</b> <span class="k928-mr-no">'+(Z6()?'第 '+nb928+' 次購買':'Purchase #'+nb928)+'</span><p class="r6-muted">'+E6(c.memberId||c.userId)+' · '+Number(c.miles||0).toLocaleString()+' mi · USD '+Number(c.usd||0).toFixed(2)+'</p></div>""")
R('buymi admin detail place',
"""'</b><small>'+E6(x.caseValue)+' / '+E6(x.accountValue)+'</small></div>';}).join('')+'</div><div style="display:flex;gap:8px;flex-wrap:wrap">""",
"""'</b><small>'+E6(x.caseValue)+' / '+E6(x.accountValue)+'</small></div>';}).join('')+'</div>'+det928+'<div style="display:flex;gap:8px;flex-wrap:wrap">""")
R('buymi admin head css',
"""<div class="r6-admin-panel"><div class="r6-review-head"><div><div class="r6-eyebrow">AI PRE-SCREEN""",
"""<div class="r6-admin-panel"><style>.k928-mr{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:10px;margin:12px 0}.k928-mr section{border:1px solid #E6E1D6;border-radius:12px;padding:10px 12px;background:#FCFBF8}.k928-mr h4{margin:0 0 6px;font-size:12px;color:#0B493B;letter-spacing:.04em}.k928-mr table{width:100%;border-collapse:collapse;font-size:11.5px}.k928-mr th{text-align:left;color:#7B817D;font-weight:700;padding:4px 8px 4px 0;white-space:nowrap;vertical-align:top}.k928-mr td{padding:4px 6px 4px 0;color:#1F2A25;word-break:break-word}.k928-mr i{font-style:normal;color:#A87C34;font-size:10px;font-weight:800}.k928-mr-no{display:inline-block;margin-left:6px;padding:2px 9px;border-radius:999px;background:#0B493B;color:#fff;font-size:10.5px;font-weight:800;vertical-align:1px}@media(max-width:1100px){.k928-mr{grid-template-columns:1fr}}</style><div class="r6-review-head"><div><div class="r6-eyebrow">AI PRE-SCREEN""")
# 8) clear success state on navigation (end of r229)
RL('buymi nav clear','kgm-0909E-r229',
"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""",
"""  /* 0928B：購買里程成功頁只在剛付款完顯示；換頁就清掉，下次進購買頁是正常的購買畫面 */
  (function(){try{var nv928=window.nav;if(typeof nv928==='function'&&!nv928.__ms928){var w928=function(){try{S.milesPurchaseSuccess0809D=null}catch(_){}return nv928.apply(this,arguments)};w928.__ms928=1;w928.__src928=1;nav=window.nav=w928}}catch(_){}})();
try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""")
open('p_e_buymi.js','w').write(hdr+'\n'.join(out)+'\n')

from common import *
import res_doc
# ══ 1006A #7：Residence ══
#   ① 使用者：「Residence競標如果已經現金有人有了里程的也要自動結標，因為里程的這樣就是算失敗，如果沒有用錢的話才會進到里程的那一輪」
#      原本：有現金出價的班要等到起飛前 14 天（現金截標）才結標、通知里程未得標；而且自動結標只在開頁 4 秒／20 秒與每 5 分鐘跑，
#      後台競標頁是打開時才補模擬出價，補完要等 5 分鐘 → 圖一那樣現金、里程都還「競標中」。
#      改成：同一段只要有現金出價（競標中或已得標），那一段的里程出價立刻自動結標＝未得標（cash_priority）、照他選的未得標處理方式辦理、通知；
#      之後也不再收那一段的里程出價。競標頁補完模擬出價就馬上跑一次自動結標。
#   ② 「要參與競標前要有一個同意Residence競標辦法（一樣要滑完才可以，包含如果該日臨時換機型不提供Residence的解決辦法就是按照第二個方案的錢）」
#      → 第 16 份辦法 KGM-RSB-016，沿用 0915A 那一套「滑到最底才能按我同意」的小視窗；現金出價（訂位彈窗）、里程出價（艙位升等）、
#        以 Residence 為標的的 BigDeal 送出前都要同意。
#   ③ 「短程Residence起標價要再往下」→ 未滿 4,000 公里：頭等艙最低票價 ×1.10（原本 ×1.30 且至少 NT$100,000×距離係數）；長程不變。

# ── ① 里程出價遇到現金出價就自動結標 ──
RL('res mile sweep fn','kgm-0905b-r161',
 "window.kgmResFallbackSettleR161=settleFallback161;",
 "window.kgmResFallbackSettleR161=settleFallback161;\n"
 "/* 1006A：同一段只要已經有現金出價（競標中或已得標），里程出價就是輸 —— 立刻自動結標，不用等到起飛前 14 天 */\n"
 "function cashKeys1006A(){\n"
 "  var o={};\n"
 "  (S.residenceBidsR83||[]).forEach(function(c){if(c&&c.code&&c.date&&(c.status==='open'||c.status==='won')){o[c.code+'|'+c.date]=1;if(c.fr)o[c.code+'|'+c.date+'|'+c.fr+'|'+c.to]=1;else o[c.code+'|'+c.date+'|*']=1}});\n"
 "  return o;\n"
 "}\n"
 "function cashHit1006A(o,code,date,fr,to){\n"
 "  if(!fr)return !!o[code+'|'+date];                    /* 沒有航段的里程出價：這一班有任何現金出價就算 */\n"
 "  return !!(o[code+'|'+date+'|'+fr+'|'+to]||o[code+'|'+date+'|*']);   /* 沒有航段的現金出價視為整班 */\n"
 "}\n"
 "window.kgmResCashOnR1006A=function(code,date,fr,to){return cashHit1006A(cashKeys1006A(),code,date,fr,to)};\n"
 "window.kgmResMileCashSweepR1006A=function(){\n"
 "  var n=0;\n"
 "  try{\n"
 "    var open=mbids().filter(function(b){return b&&b.status==='open'&&b.code&&b.date});\n"
 "    if(!open.length)return 0;\n"
 "    var ck=cashKeys1006A(),now=new Date().toISOString();\n"
 "    open.forEach(function(b){\n"
 "      if(!cashHit1006A(ck,b.code,b.date,b.fr,b.to))return;\n"
 "      b.status='lost';b.settledAt=now;b.lostReasonR927='cash_priority';b.autoCloseR1006A=1;\n"
 "      settleFallback161(b);n++;\n"
 "      if(b.demoR922)return;   /* 模擬出價沒有真的會員，不發通知 */\n"
 "      try{\n"
 "        S.notifs=S.notifs||[];\n"
 "        S.notifs.unshift({title:'Residence 里程競標未得標 '+b.code+' '+b.date,\n"
 "          message:'本班 Residence 已有旅客以現金出價，現金出價一律優先：您的里程出價已自動結標，未得標，未扣任何里程。'\n"
 "            +(b.fallbackDone?'（未得標處理：'+fbName(b.fallback)+'）':''),\n"
 "          date:T(),at:now,read:false,userId:b.userId||null,type:'residence'});\n"
 "      }catch(_){}\n"
 "    });\n"
 "    if(n){try{save()}catch(_){}log('現金優先：里程出價自動結標 '+n+' 筆')}\n"
 "  }catch(_){}\n"
 "  return n;\n"
 "};")
RL('res mile bid refuse when cash','kgm-0905b-r161',
 "      return {ok:false,why:(z()?'里程競標已於起飛前 7 天截止。':'Mileage bidding closed 7 days before departure.')};\n  }catch(_){}\n",
 "      return {ok:false,why:(z()?'里程競標已於起飛前 7 天截止。':'Mileage bidding closed 7 days before departure.')};\n  }catch(_){}\n"
 "  /* 1006A：這一段已經有現金出價 → 由現金決勝，里程那一輪不會開，不再收里程出價 */\n"
 "  try{if(window.kgmResCashOnR1006A(f.code,date,f.fr,f.to))\n"
 "    return {ok:false,why:(z()?'這一段已經有旅客以現金出價，Residence 一律由現金決勝，里程競標已自動結標，不再受理里程出價。':'A cash bid already exists on this sector; mileage bids are closed.')}}catch(_){}\n")
RL('auto settle sweeps first','kgm-0823h-r61',
 "if(!window.KGM_AUTO_SETTLE_R923)return out;",
 "if(!window.KGM_AUTO_SETTLE_R923)return out;\n"
 "    try{out.mileClosed=window.kgmResMileCashSweepR1006A?window.kgmResMileCashSweepR1006A():0}catch(_){}   /* 1006A：有現金出價 → 里程立刻未得標 */")
RL('auction page text','kgm-0823h-r61',
 "已有現金出價的航班於現金截標（起飛前 14 天）當下結標，並立即通知里程出價未得標；",
 "同一航段只要已有任何一筆現金出價，里程出價即自動結標為未得標並立即通知（現金出價於起飛前 14 天截標時結標）；")
RL('cash bid -> sweep','kgm-0907B-r182',
 "return _bid182.apply(this,arguments);",
 "var r1006A=_bid182.apply(this,arguments);\n"
 "    try{if(r1006A&&r1006A.ok&&window.kgmResMileCashSweepR1006A)window.kgmResMileCashSweepR1006A()}catch(_){}   /* 1006A：現金出價成立 → 這一段的里程出價立刻結標 */\n"
 "    return r1006A;")
RL('auction rows: settle after seeding','kgm-0909E-r229',
 "        return _rows.apply(this,arguments);\n      };\n      W.__a922=1;",
 "        /* 1006A：模擬出價是打開競標頁才補的；補完馬上跑一次自動結標（有現金 → 里程立刻未得標；過了截止日 → 結標），\n"
 "           不用等 5 分鐘那一輪。出價筆數有變就跑，沒變的話 5 秒內不重跑。 */\n"
 "        try{var sg6=(S.residenceBidsR83||[]).length+'|'+(S.resMileBidsR161||[]).length,t6=Date.now(),L6=window.__kgmAucSettleR1006A||{};\n"
 "          if(L6.sg!==sg6||t6-L6.t>5000){window.__kgmAucSettleR1006A={sg:sg6,t:t6};window.kgmAutoSettleAuctionsR923()}}catch(_){}\n"
 "        return _rows.apply(this,arguments);\n      };\n      W.__a922=1;")
# 模擬資料：四班有一班完全沒有現金出價，才看得到「沒有現金 → 里程那一輪」還在競標中
RL('seed: some flights miles only','kgm-0909E-r229',
 "if(!has9(S.residenceBidsR83,code,date,f.fr,f.to)){\n          var nCash=2+(seed%3);",
 "if(!has9(S.residenceBidsR83,code,date,f.fr,f.to)&&seed%4!==0){   /* 1006A：四班留一班只有里程出價（沒有現金 → 里程那一輪） */\n          var nCash=2+(seed%3);")
RL('audit: residence bid = cash or miles','kgm-0909E-r229',
 "hit=(S.residenceBidsR83||[]).some(function(b){return b&&b.code===f.code&&b.date===dd});",
 "hit=[].concat(S.residenceBidsR83||[],S.resMileBidsR161||[]).some(function(b){return b&&b.code===f.code&&b.date===dd});",2)

# ── ② 《Residence 御璽套房競標辦法》＋同意閘門 ──
doc=res_doc.doc()
RL('policy doc 016','kgm-0831c-r86',
 "\"}};\nwindow.kgmPolicyDocR914=function(id)",
 "\"}};\n"
 "/* 1006A：第 16 份辦法《Residence 御璽套房競標辦法》—— 參加 Residence 競標前要滑到底、按我同意（含臨時換機型沒有 Residence 時依第二志願辦理） */\n"
 "window.KGM_POLICY_DOCS_R914["+J(res_doc.ID)+"]="+J(doc)+";\n"
 "window.kgmPolicyDocR914=function(id)")
RL('policy audit 16','kgm-0909E-r229',
 "if(o.docs!==15)o.bad.push('辦法份數 '+o.docs+'（應為 15）');",
 "if(o.docs!==16)o.bad.push('辦法份數 '+o.docs+'（應為 16）');   /* 1006A：加上 KGM-RSB-016 Residence 競標辦法 */")
GATE="window.kgmPolicyGateR914&&!window.kgmPolicyGateR914(['KGM-RSB-016'])"
CONSENT="(window.kgmPolicyConsentRowR914?window.kgmPolicyConsentRowR914(['KGM-RSB-016']):'')"
# 訂位彈窗（現金）
RL('cash modal consent','kgm-0905b-r161',
 "+'<button class=\"k161-go\" onclick=\"kgmResCashSubmitR161()\">'",
 "+"+CONSENT+"   /* 1006A：送出前要同意 Residence 競標辦法 */\n      +'<button class=\"k161-go\" onclick=\"kgmResCashSubmitR161()\">'")
RL('cash submit gate','kgm-0907B-r182',
 "if(!alt){alert(z()?'請先選擇未得標時的備選艙等。':'Choose a fallback cabin first.');return}",
 "if(!alt){alert(z()?'請先選擇未得標時的備選艙等。':'Choose a fallback cabin first.');return}\n"
 "  if("+GATE+")return;   /* 1006A：沒同意 Residence 競標辦法 → 擋下並打開辦法 */")
# 同意之後整頁會重畫：出價金額不能被洗回起標價
RL('cash amount keep','kgm-0905b-r161',
 "'<input id=\"k161amt\" class=\"inp\" type=\"number\" min=\"'+minCash+'\" step=\"1000\" value=\"'+minCash+'\"></label>'",
 "'<input id=\"k161amt\" class=\"inp\" type=\"number\" min=\"'+minCash+'\" step=\"1000\" value=\"'+(function(){   /* 1006A：重畫後保留已輸入的金額 */\n"
 "          var m6=md(),k6=f.code+'|'+date;return (m6&&m6.amtR1006A&&m6.amtR1006A.k===k6&&+m6.amtR1006A.v>=minCash)?+m6.amtR1006A.v:minCash})()\n"
 "        +'\" oninput=\"kgmResAmtR1006A(this.value)\"></label>'")
RL('cash amount fn','kgm-0905b-r161',
 "window.kgmResNextSegR161=function(code,date){",
 "window.kgmResAmtR1006A=function(v){var m=md();if(m)m.amtR1006A={k:m.code+'|'+m.date,v:v}};\n"
 "window.kgmResNextSegR161=function(code,date){")
# 艙位升等（里程）
RL('mile form fn','kgm-0905c-r173',
 "window.kgmResUpgPickR173=function(k){S.resUpgPickR173=k;paint173()};",
 "window.kgmResUpgPickR173=function(k){S.resUpgPickR173=k;paint173()};\n"
 "/* 1006A：同意辦法後整頁重畫，里程出價表單已填的內容要留著 */\n"
 "window.kgmResUpgFormR1006A=function(k,f,v){var o=S.resUpgFormR1006A;if(!o||o.k!==k)o=S.resUpgFormR1006A={k:k};o[f]=v};")
RL('mile submit gate','kgm-0905c-r173',
 "  var mi=Math.round(+(document.getElementById('k173mi')||{}).value||0);",
 "  if("+GATE+")return;   /* 1006A：沒同意 Residence 競標辦法 → 擋下並打開辦法 */\n"
 "  var mi=Math.round(+(document.getElementById('k173mi')||{}).value||0);")
RL('mile form block when cash','kgm-0905c-r173',
 "elig=window.kgmResidentEligibleR159({code:cur.code,date:cur.date,pnr:cur.pnr});\n    }catch(_){}\n",
 "elig=window.kgmResidentEligibleR159({code:cur.code,date:cur.date,pnr:cur.pnr});\n    }catch(_){}\n"
 "    /* 1006A：這一段已經有現金出價 → 里程那一輪不會開 */\n"
 "    try{if(!(elig&&elig.ok===false)&&window.kgmResCashOnR1006A&&window.kgmResCashOnR1006A(cur.code,cur.date,cur.fr,cur.to))\n"
 "      elig={ok:false,why:z()?'這一段已經有旅客以現金出價。Residence 一律由現金決勝，這一段的里程出價已自動結標，不再受理里程出價。':'A cash bid already exists on this sector; mileage bids are closed.'}}catch(_){}\n")
RL('mile form state','kgm-0905c-r173',
 "  var bids=cur?myMileBids173(cur.code,cur.date):[];",
 "  var fm1006A=(cur&&S.resUpgFormR1006A&&S.resUpgFormR1006A.k===cur.code+'|'+cur.date)?S.resUpgFormR1006A:{},fk1006A=cur?A(cur.code+'|'+cur.date):'';\n"
 "  var bids=cur?myMileBids173(cur.code,cur.date):[];")
RL('mile input keep','kgm-0905c-r173',
 "'<input id=\"k173mi\" class=\"inp\" type=\"number\" min=\"'+min+'\" step=\"1000\" value=\"'+min+'\"></label>'",
 "'<input id=\"k173mi\" class=\"inp\" type=\"number\" min=\"'+min+'\" step=\"1000\" value=\"'+((+fm1006A.mi>=min)?+fm1006A.mi:min)+'\" oninput=\"kgmResUpgFormR1006A(\\''+fk1006A+'\\',\\'mi\\',this.value)\"></label>'")
RL('mile select keep','kgm-0905c-r173',
 "<select id=\"k173fb\" class=\"inp\">",
 "<select id=\"k173fb\" class=\"inp\" onchange=\"kgmResUpgFormR1006A(\\''+fk1006A+'\\',\\'fb\\',this.value)\">")
RL('mile option keep','kgm-0905c-r173',
 "+fbs.map(function(a){return '<option value=\"'+E(a.k)+'\">'",
 "+fbs.map(function(a){return '<option value=\"'+E(a.k)+'\"'+(fm1006A.fb===a.k?' selected':'')+'>'")
RL('mile pnr keep','kgm-0905c-r173',
 "'<input id=\"k173pnr\" class=\"inp\" placeholder=\"'+(z()?'選填':'optional')+'\"></label>'",
 "'<input id=\"k173pnr\" class=\"inp\" placeholder=\"'+(z()?'選填':'optional')+'\" value=\"'+E(fm1006A.pnr||'')+'\" oninput=\"kgmResUpgFormR1006A(\\''+fk1006A+'\\',\\'pnr\\',this.value)\"></label>'")
RL('mile consent','kgm-0905c-r173',
 "+'<button class=\"k173-go\" onclick=\"kgmResUpgSubmitR173(",
 "+"+CONSENT+"   /* 1006A：送出前要同意 Residence 競標辦法 */\n            +'<button class=\"k173-go\" onclick=\"kgmResUpgSubmitR173(")
# BigDeal 以 Residence 為標的
RL('bigdeal residence gate','kgm-0909E-r229',
 "var id='bd929_'+key+'_'+cab,",
 "if(cab==='Resident'&&"+GATE+")return;   /* 1006A：BigDeal 標 Residence 也要同意 Residence 競標辦法 */\n    var id='bd929_'+key+'_'+cab,")
# 說明文字跟著新規則
NEWTXT="'金額最高者得標，這一段的里程出價會立即自動結標為未得標；完全沒有現金出價時，才進入里程那一輪，由合併價值最高者得標。'"
RL('modal rule text a','kgm-0905b-r161',
 "'訂位流程裡不處理里程。結標時只要當天有任何一筆現金出價，就一律由現金決勝、'",
 "'訂位流程裡不處理里程。只要這一段有任何一筆現金出價，就一律由現金決勝、'")
RL('modal rule text b','kgm-0905b-r161',"'金額最高者得標；完全沒有現金出價時，才由里程出價最高者得標。'",NEWTXT)
RL('upgrade rule text','kgm-0905c-r173',"'金額最高者得標；完全沒有現金出價時，才由里程出價最高者得標。'",NEWTXT)
RL('mile submit alert text','kgm-0905c-r173',
 "' 哩\\n只要當天有任何一筆現金出價，就會由現金決勝。結標日 '",
 "' 哩\\n之後只要這一段出現任何一筆現金出價，就由現金決勝，這筆里程出價會立即自動結標為未得標（不扣里程）。結標日 '")
RL('r182 audit agrees temporarily','kgm-0907B-r182',
 "S.resModalR161={code:f.code,date:d,step:2};\n    var oldAlert=window.alert;window.alert=function(){};",
 "S.resModalR161={code:f.code,date:d,step:2};\n    var oldAlert=window.alert;window.alert=function(){};\n"
 "    var pa6=S.policyAgreedR914||(S.policyAgreedR914={}),had6=pa6['KGM-RSB-016'];if(!had6)pa6['KGM-RSB-016']={at:'audit'};   /* 1006A：這個稽核只測送出內容，暫時視為已同意辦法（不能跳出辦法視窗） */")
RL('r182 audit restore','kgm-0907B-r182',
 "window.alert=oldAlert;\n    window.kgmResidenceBidR83=real;S.resModalR161=oldM;",
 "window.alert=oldAlert;if(!had6)delete pa6['KGM-RSB-016'];\n    window.kgmResidenceBidR83=real;S.resModalR161=oldM;")

# ── ③ 短程起標價往下 ──
RL('short-haul opening','kgm-0907B-r182',
 "var v=Math.max(first*1.30,FLOOR182.Resident*pax*distFac182(dist));",
 "/* 1006A：使用者「短程Residence起標價要再往下」—— 未滿 4,000 公里改為頭等艙最低票價 ×1.10，不再套 NT$100,000 的下限\n"
 "       （頭等艙本身有 NT$60,000 起、隨距離走的下限，所以起標價仍一定高於頭等艙）；長程不變。 */\n"
 "    var v=dist<4000?Math.max(first*1.10,FLOOR182.First*1.10*pax*distFac182(dist))\n"
 "                   :Math.max(first*1.30,FLOOR182.Resident*pax*distFac182(dist));")
RL('opening mul fn','kgm-0907B-r182',
 "/* ── ③ 備選艙等：一律「超值」票種 ───────────────────────────────── */",
 "/* 1006A：起標倍數（畫面說明用；跟上面的起標價同一條 4,000 公里分界） */\n"
 "window.kgmResOpenMulR1006A=function(f){var d=800;try{d=distOf(f.fr,f.to)||800}catch(_){}return d<4000?1.10:1.30};\n"
 "/* ── ③ 備選艙等：一律「超值」票種 ───────────────────────────────── */")
RL('opening audit','kgm-0907B-r182',
 "if(!(o.icnMinBid>=100000))bad.push('TPE-ICN Residence 起標價 '+o.icnMinBid+' 未達 NT$100,000');",
 "if(!(o.icnMinBid>o.firstMin))bad.push('TPE-ICN Residence 起標價 '+o.icnMinBid+' 不高於頭等艙最低票價 '+o.firstMin);   /* 1006A：短程改為頭等 ×1.10，NT$100,000 下限只留給長程 */")
RL('opening label','kgm-0905b-r161',
 "(z()?'頭等艙票價 ×1.30':'First fare ×1.30')",
 "(function(){var mu=window.kgmResOpenMulR1006A?window.kgmResOpenMulR1006A(f):1.3;   /* 1006A：短程 ×1.10、長程 ×1.30 */\n"
 "        return z()?('頭等艙票價 ×'+mu.toFixed(2)+(mu<1.3?'（短程）':'')):('First fare ×'+mu.toFixed(2))})()")
save('p_h_res.js','/* 1006A · Residence：有現金出價 → 里程立即自動結標、競標辦法須滑到底同意、短程起標價調降 */\n')

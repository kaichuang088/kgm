import json
SRC=open('/tmp/j/kgm1004B_t13.html',encoding='utf-8').read()   # 已含 p_g_bk 之前的全部 1004B 修補
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):
    n=SRC.count(old)
    assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 第二批：行程管理說明區塊、外站櫃檯格式、改票／退款卡片、單航段退票比例、票務中心、經濟艙降價、KX3 季節時間、Sky Couch */\n'

# ── A. 行程管理：「AFTER YOU RETRIEVE A BOOKING」與「出發當天的時間點」只在查到訂位之後顯示 ──
R('A r226 inverse',"    if(!off){if(hint)hint.remove();return 1}",
  "    /* 1004B：使用者「這個是要進去定位管理才會顯示的」—— 反過來：查到訂位才出現，入口頁不出現 */\n    if(off){if(hint)hint.remove();return 1}")
R('A r226 place',"      var first=a.querySelector('[data-k222]');\n      var host=first?first.parentElement:null;\n      if(host&&host.parentNode)host.parentNode.insertBefore(hint,host);\n      else a.appendChild(hint);",
  "      /* 1004B：放在行程內容的最後面 */\n      var trip1004B=a.querySelector('.k56-trip');\n      if(trip1004B&&trip1004B.parentNode)trip1004B.parentNode.insertBefore(hint,trip1004B.nextSibling);\n      else (a.querySelector('main')||a).appendChild(hint);")
R('A r124 inverse',"  if(hasTrip){\n    if(have){have.remove();var tl0=app.querySelector('.k124-tl');if(tl0)tl0.remove()}\n    return;\n  }",
  "  /* 1004B：入口頁不顯示；查到訂位之後才在行程下面放「出發當天的時間點」 */\n  if(!hasTrip){\n    if(have){have.remove();var hp0=app.querySelector('.k124-help');if(hp0)hp0.remove()}\n    return;\n  }")
R('A r124 have',"  var have=app.querySelector('.k124-help');","  var have=app.querySelector('.k124-tl');")
R('A r124 only timeline',"  d.innerHTML=helpHtml();","  d.innerHTML=helpHtml().replace(/^<div class=\"k124-help\">[\\s\\S]*?<\\/div><div class=\"k124-tl\">/,'<div class=\"k124-tl\">');")

# ── C. 更改／退款三張卡填滿整排、按鈕放大 ──
R('C acts fill',"'.k56-trip .k56-acts{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;',",
  "'.k56-trip .k56-acts{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;',",2)
R('C acts big',"'.k56-trip .k56-service{margin:0 22px 20px!important;padding:11px 20px!important}',",
  "'.k56-trip .k56-service{margin:0 22px 20px!important;padding:11px 20px!important}',\n"
  "/* 1004B：使用者「三格每個按鈕位置大一點，不填滿那個很醜」 */\n"
  "'.k56-trip .k56-acts .k56-act{padding:24px 22px 22px!important;min-height:150px!important;border-radius:16px!important}',\n"
  "'.k56-trip .k56-acts .k56-act .ic{width:44px!important;height:44px!important;border-radius:12px!important;margin-bottom:14px!important}',\n"
  "'.k56-trip .k56-acts .k56-act .ic svg{width:21px!important;height:21px!important}',\n"
  "'.k56-trip .k56-acts .k56-act b{font-size:16px!important;margin-bottom:6px!important}',\n"
  "'.k56-trip .k56-acts .k56-act small{font-size:12px!important;line-height:1.7!important}',")

# ── D. 單航段退票：金額按航段、退票手續費按航段數比例 ──
R('D seg share fn',"function paidItemH(b,m){",
  "/* 1004B：退單一航段 —— 金額以訂位當時各段鎖定的票價比例分攤（沒有就平均） */\n"
  "window.kgmSegShareR1004B=function(b,key){try{var ss=tripSegmentsG(b)||[];if(ss.length<2)return 1;var w=ss.map(function(s){return +((s.f||{})._lockedFare)||0});var tot=w.reduce(function(a,x){return a+x},0);var i=ss.map(function(s){return s.key}).indexOf(key);if(i<0)return 1;return tot>0&&w[i]>0?w[i]/tot:1/ss.length}catch(_){return 1}};\n"
  "function paidItemH(b,m){")
R('D seg amount',"else if(m.item==='order')v=+br.total||+(b.total||0);else v=+(m.customAmount||0);var from=b.curr||'TWD'",
  "else if(m.item==='order')v=+br.total||+(b.total||0);else v=+(m.customAmount||0);if((m.item==='ticket'||m.item==='order')&&m.segKey&&m.segKey!=='all'&&window.kgmSegShareR1004B)v=Math.round(v*window.kgmSegShareR1004B(b,m.segKey));var from=b.curr||'TWD'")
R('D prorate fee',"    if(typeof window.kgmFarePolicyG==='function')\n      out.fee=+window.kgmFarePolicyG(out.cabin,out.fam).refund||0;",
  "    if(typeof window.kgmFarePolicyG==='function')\n      out.fee=+window.kgmFarePolicyG(out.cabin,out.fam).refund||0;\n"
  "    /* 1004B：使用者「依照整筆定位最高退費費用如4800有三個航段退了一個就是少退1600退兩個就是少退3200按照比例」\n"
  "       整筆行程只收一次（各段方案裡最高的那一個）；只退其中幾段，就按退的段數比例收。 */\n"
  "    try{\n"
  "      var it1004B=window.kgmRefundFeeR207?window.kgmRefundFeeR207(pnr):null;\n"
  "      var n1004B=0;try{n1004B=(window.kgmSegsR45?window.kgmSegsR45(pnr):[]).length}catch(_){}\n"
  "      if(!n1004B)n1004B=b.inbF?2:1;\n"
  "      out.full=(it1004B&&+it1004B.fee>0)?+it1004B.fee:out.fee;out.segs=n1004B;\n"
  "      out.scope=(!segKey||segKey==='all')?'all':'seg';\n"
  "      out.fee=out.scope==='all'?out.full:Math.round(out.full/Math.max(1,n1004B));\n"
  "    }catch(_){}")
R('D fill recompute',"    if(!d||d.getAttribute('data-r91')==='1')return;\n    var r=window.kgmRefundDeductR91(m.pnr,m.segKey==='all'?'out':m.segKey);",
  "    var sk1004B=String(m.segKey||'all');\n    if(!d||d.getAttribute('data-r91')===sk1004B)return;\n    var r=window.kgmRefundDeductR91(m.pnr,sk1004B);")
R('D fill set',"    d.setAttribute('data-r91','1');\n    if(!+d.value){d.value=r.fee;m.deduct=r.fee}",
  "    d.setAttribute('data-r91',sk1004B);\n"
  "    /* 1004B：換航段時重新帶入（只覆蓋系統自己帶的數字，人工改過的不動） */\n"
  "    if(!+d.value||+d.value===+(m.autoDeductR1004B||-1)){var chg1004B=(+m.deduct!==+r.fee);d.value=r.fee;m.deduct=r.fee;m.autoDeductR1004B=r.fee;if(chg1004B)setTimeout(function(){try{render()}catch(_){}},0)}\n"
  "    try{var oh1004B=d.closest&&d.closest('label')&&d.closest('label').querySelector('.k91-hint');if(oh1004B)oh1004B.remove()}catch(_){}")
R('D hint text',"      s.textContent=(z()?'已依 ':'From ')+r.code+'（'+r.fam+'）'\n        +(z()?' 票價產品自動帶入退票手續費 NT$':' fare rules: NT$')+N(r.fee);",
  "      s.textContent=(r.scope==='seg'&&r.segs>1)\n"
  "        ?((z()?'退票手續費整筆 NT$'+N(r.full)+' ÷ '+r.segs+' 段 × 退 1 段 = NT$':'Refund fee NT$'+N(r.full)+' ÷ '+r.segs+' sectors × 1 = NT$')+N(r.fee))\n"
  "        :((z()?'已依 ':'From ')+r.code+'（'+r.fam+'）'+(z()?' 票價產品自動帶入退票手續費 NT$':' fare rules: NT$')+N(r.fee)+(z()?'（整筆行程只收一次）':''));")

# ── E. 改票手續費：客服／線上依票價方案（基本 1,200／超值 900／豪華 0，每航段）；機場櫃檯一律 1,800／航段 ──
R('E policy change',"      r.change=+window.KGM_CHANGE_FEE_R151||1200;",
  "      /* 1004B：使用者「事前改票是（基本）1200/航段、900/段、0/段…客服改票也是看航段方案收取費用…現場改票一律是1800/航段」 */\n"
  "      r.change=CHG1004B(arguments[1]);")
R('E changeFeeOf',"      return +window.KGM_CHANGE_FEE_R151||1200;\n    };\n    CF.__r151=1;",
  "      return CHG1004B(((FARES[k]||{}).familyR48)||((FARES[k]||{}).family));\n    };\n    CF.__r151=1;")
R('E desk quote',"        q.changeFee=+window.KGM_CHANGE_FEE_R151||1200;","        q.changeFee=CHG1004B(((FARES[(q.seg||{}).cls]||{}).familyR48));")
R('E self quote',"        q.fee=+window.KGM_CHANGE_FEE_R151||1200;","        q.fee=CHG1004B(((FARES[q.fc]||{}).familyR48));")
R('E fn def',"function relabel151(){\n  var per=+window.KGM_CHANGE_FEE_R151||1200;\n  var zh='改票手續費（每更改一個航段 NT$'+N(per)+'，改兩段即 '+N(per)+'+'+N(per)+'）';",
  "function relabel151(){\n  var per=+window.KGM_CHANGE_FEE_R151||1200;\n  var zh='改票手續費（每更改一個航段依票價方案：基本 NT$1,200／超值 NT$900／豪華免費；機場櫃檯現場一律 NT$1,800）';")
R('E fn helper',"/* ══ ② 改票手續費：每更改一個航段 NT$1,200 ═══════════════════════ */",
  "/* ══ ② 改票手續費：每更改一個航段 NT$1,200 ═══════════════════════ */\n"
  "/* 1004B：改成依票價方案（每航段）—— 基本 1,200、超值 900、豪華 0；不認得的方案照舊 1,200 */\n"
  "function CHG1004B(fam){var t={Basic:1200,Value:900,Deluxe:0}[String(fam||'')];return t==null?(+window.KGM_CHANGE_FEE_R151||1200):t}\n"
  "window.kgmChangeFeeByFamR1004B=CHG1004B;")
R('E counter ground flat',"  try{var ch914=window.kgmReissueFeeR914();if(ch914>0&&fee>0)fee=ch914}catch(_){}",
  "  /* 1004B：客服／線上依票價方案（上面 kgmFarePolicyG 已經是方案費）；機場櫃檯現場一律 NT$1,800／航段（豪華也收） */\n"
  "  try{if(window.kgmReissueIdentR914()==='ground')fee=+(((window.KGM_FEE_TIERS_R155||{}).ground||{}).fee)||1800}catch(_){}")
SV='NT$1,200／900／0'
R('E tier card',"      +'<b>NT$'+N(t.fee)+'</b><i>'+(z()?'每更改一個航段':'per changed sector')\n      +(pax>1?('　×　'+pax+' '+(z()?'位旅客':'pax')+'　=　NT$'+N(t.fee*pax)):'')+'</i>'",
  "      +'<b>'+(k==='service'?'"+SV+"':('NT$'+N(t.fee)))+'</b><i>'+(z()?(k==='service'?'每航段・基本／超值／豪華':'每更改一個航段'):'per changed sector')\n      +(pax>1&&k!=='service'?('　×　'+pax+' '+(z()?'位旅客':'pax')+'　=　NT$'+N(t.fee*pax)):'')+'</i>'")
R('E tier note',"    noteZH:'旅客自行於行程管理改票，或由客服代為操作。每更改一個航段收取。',",
  "    noteZH:'旅客自行於行程管理改票，或由客服代為操作。每更改一個航段依票價方案收取：基本 NT$1,200、超值 NT$900、豪華免費。',")
R('E 186 card',"        +'<div class=\"fee\">NT$'+N(fS)+'</div>'","        +'<div class=\"fee\">"+SV+"</div>'")
R('E 186 note',"      ?('目前是 <b>'+(g?'地勤改票':'客服改票')+'</b>，本次適用手續費 <b>NT$'+N(g?fG:fS)+'</b>／'+pax+' 位旅客。')",
  "      ?('目前是 <b>'+(g?'地勤改票':'客服改票')+'</b>，本次適用手續費 <b>'+(g?('NT$'+N(fG)+'／航段'):'依票價方案 "+SV+"／航段')+'</b>。')")
R('E 201 card',"    +'<div class=\"k201-fee\">NT$'+N(f)+'</div>'","    +'<div class=\"k201-fee\">'+(g?('NT$'+N(f)):'"+SV+"')+'</div>'")
R('E 227 fee',"          +'<b>NT$'+N(fee)+'</b></div>'","          +'<b>'+(g?('NT$'+N(fee)):'"+SV+"')+'</b></div>'")
R('E 227 rule',"            +'每更改一個航段收一次。')","            +(g?'每更改一個航段收一次（一律 NT$1,800）。':'每更改一個航段依票價方案收一次：基本 NT$1,200、超值 NT$900、豪華免費。'))")
R('E policy doc',"<td class=\\\"num\\\">NT$ 1,200</td><td>同一航線之日期或班次變更</td>","<td class=\\\"num\\\">依票價方案 NT$ 1,200／900／0</td><td>同一航線之日期或班次變更</td>")
R('E desk label',"<small>BOOKING MANAGEMENT · 0913B</small>","<small>BOOKING MANAGEMENT · TICKETING</small>")
R('E fare card chg',"              ${_row929(\"chg\",LANG===\"en\"?\"Change fee per sector\":\"改票手續費（每航段）\",(chgLabel||\"—\"),true)}",
  "              ${_row929(\"chg\",LANG===\"en\"?\"Change fee per sector\":\"改票手續費（每航段）\",(chgLabel||\"—\")+(_staffFare?\"\":`<small class=\"k929-chgn\">${LANG===\"en\"?\"Airport counter NT$1,800\":\"機場櫃檯現場 NT$1,800\"}</small>`),true)}")

# ── F. 經濟艙票價普遍調降 8–15%（基本 −15%、超值 −12%、豪華 −8%） ──
R('F eco cut',"  const sub=FARES[code].pct; // within-cabin sub-multiplier (saver/standard/flex)",
  "  /* 1004B：使用者「現在普遍經濟艙可以調降8%-15%價錢有點高」—— 基本 −15%、超值 −12%、豪華 −8%（只動經濟艙的票價家族，其他艙等不動） */\n"
  "  const sub=FARES[code].pct*((cabin===\"Economy\"&&FARES[code].familyR48)?({Basic:0.85,Value:0.88,Deluxe:0.92}[FARES[code].familyR48]||1):1); // within-cabin sub-multiplier (saver/standard/flex)")

# ── G. KX3 冬夏季時間：選好的航班一律套上季節班表（列表 00:00、結帳卻寫 00:30） ──
R('G sync on phase',"var goPhase0R1004B=goPhase;goPhase=function(p){",
  "/* 1004B：KX3 訂票頁 00:00、結帳 00:30 —— 已選的航班在換步驟時一律重新套用當天的冬夏季班表 */\n"
  "window.kgmSeasonSyncR1004B=function(){try{if(typeof window.kgmApplySeasonR112!=='function')return;var fix=function(f){if(!f||!f.date||f.via)return f;var g=window.kgmApplySeasonR112(f,f.date);if(!g||g===f||(g.dep===f.dep&&g.arr===f.arr))return f;return Object.assign({},f,{dep:g.dep,arr:g.arr,dd:g.dd,dur:g.dur,durStr:g.durStr,seasonR112:g.seasonR112})};S.outF=fix(S.outF);S.inbF=fix(S.inbF);(S.mcFlights||[]).forEach(function(x){if(x&&x.f)x.f=fix(x.f)})}catch(_){}};\n"
  "var goPhase0R1004B=goPhase;goPhase=function(p){try{window.kgmSeasonSyncR1004B()}catch(_){}")
R('G segs7',"  function segs7(b,physical){var out=[];function add(f,c,key,date){if(!f)return;",
  "  function segs7(b,physical){var out=[];function add(f,c,key,date){if(!f)return;try{if(f.date&&!f.via&&window.kgmApplySeasonR112){var g1004B=window.kgmApplySeasonR112(f,f.date);if(g1004B&&g1004B!==f)f=g1004B}}catch(_){}")

# ── H. Sky Couch 不是只有一排：選位圖、說明卡與座位費都用機型原本設計的整組排數 ──
R('H sky rows',"return _s59.slice(-_w59)}}catch(_s59e){}","return _s59.slice()/* 1004B：使用者「Sky Couch不是只有一排吧」—— 用整組（A388 第 69–75 排、B779 第 48–51 排） */}}catch(_s59e){}")

# ── B. 外站報到航廈與櫃檯：各機場真正的櫃檯編法 ──
R('B term map',"var AP_TERM_MAP={ONT:\"T2\",LHR:\"T3\",LAX:\"TB\",JFK:\"T1\",SFO:\"I\",SEA:\"S\",NRT:\"T1\",HND:\"T3\",KIX:\"T1\",ICN:\"T2\",HKG:\"T1\",SIN:\"T3\",BKK:\"Main\",CDG:\"1\",AMS:\"3\",FRA:\"1\",MUC:\"2\",SYD:\"T1\",YVR:\"M\",TSA:\"T1\",HNL:\"T2\"};",
  open('ctr_out.js',encoding='utf-8').read())
R('B r929 map',"        return CTRC929[k][code]||null;\n      }catch(_){return null}\n    };",
  "        var hit1004B=CTRC929[k][code]||null;\n        return (hit1004B&&window.kgmOutCtrR1004B)?window.kgmOutCtrR1004B(fr,hit1004B,code):hit1004B;\n      }catch(_){return null}\n    };")
R('B alloc map',"    W.__r116=1;window.kgmCounterAllocR74=W;",
  "    W.__r116=1;window.kgmCounterAllocR74=W;\n"
  "    /* 1004B：外站的櫃檯號改成該機場的編法（後台地勤頁與旅客行程頁一致） */\n"
  "    window.kgmCounterAllocR74=function(ap){var o=W.apply(this,arguments);try{if(o&&o.rows&&ap!=='TPE'&&ap!=='TSA'&&window.kgmOutCtrR1004B)o.rows.forEach(function(r){if(r._ctr1004B)return;var x=window.kgmOutCtrR1004B(ap,{term:r.term,counter:r.counter},(r.flights&&r.flights[0]||{}).code||'');r.term=x.term;r.counter=x.counter;r._ctr1004B=1})}catch(_){}return o};\n"
  "    window.kgmCounterAllocR74.__r116=1;")
R('B trip label',"            var tz=String(tl||'').replace(/^T/,'');\n            var v=(Z()?((tz?('第 '+tz+' 航廈'):'')+(c&&c.counter?('　櫃檯 '+c.counter):'　櫃檯依機場公告')):((tl?('Terminal '+tz):'')+(c&&c.counter?(' · Counter '+c.counter):' · see airport screens')));",
  "            var tz=String(tl||'').replace(/^T/,'');\n"
  "            var v=(Z()?((tz?('第 '+tz+' 航廈'):'')+(c&&c.counter?('　櫃檯 '+c.counter):'　櫃檯依機場公告')):((tl?('Terminal '+tz):'')+(c&&c.counter?(' · Counter '+c.counter):' · see airport screens')));\n"
  "            try{var lb1004B=window.kgmCheckinLabelR1004B?window.kgmCheckinLabelR1004B(s.fr,tl,c,Z()):null;if(lb1004B)v=lb1004B}catch(_){}")

R('B fix98 SIN',"  SIN:'T3',BKK:'Main',SHA:'T1',PVG:'T2',PEK:'T3E',","  SIN:'T1'/* 1004B：A380 機位 A2–B7 在第 1 航廈 */,BKK:'Main',SHA:'T1',PVG:'T2',PEK:'T3E',")
R('A r200 keep tl',"    if(!tagTrip200())return 0;\n    var n=0;\n    document.querySelectorAll('.k124-help,.k124-tl').forEach(function(e){e.remove();n++});",
  "    /* 1004B：反過來 —— 查到訂位之後只收掉六格說明卡，「出發當天的時間點」留在行程下面 */\n    if(!tagTrip200())return 0;\n    var n=0;\n    document.querySelectorAll('.k124-help').forEach(function(e){e.remove();n++});")
R('A r200 css',"  +'body[data-kgm-trip=\"1\"] .k124-help,body[data-kgm-trip=\"1\"] .k124-tl{display:none!important}'",
  "  +'body[data-kgm-trip=\"1\"] .k124-help,body[data-kgm-trip=\"0\"] .k124-tl,body[data-kgm-trip=\"0\"] .k226-hint{display:none!important}'")
# ── 樣式：票務中心只留一個作業區；改票費小字 ──
R('css',".k929-more:empty{display:none}",
  ".k929-more:empty{display:none}\n"
  "/* 1004B：票價卡改票費下面的機場櫃檯費率 */\n"
  ".k929-fr b small.k929-chgn{display:block;font-size:9.5px;color:#9a9a9a;font-weight:700;margin-top:2px}\n"
  "/* 1004B：定位管理／票務中心 —— 舊的改票面板（含它自己的訂位代號框、費率卡）與「① 定位管理（…）原本的欄位與按鈕全部照舊可用」標題列一律收起來，\n"
  "   只留一個查詢＋核對＋作業區；改票從「更換航班／日期／艙等」進去。 */\n"
  "body[data-kgm-tab=\"bookings\"] .k164-wrap:not(:has(.j-booking,.k82-cab)),body[data-kgm-tab=\"bookings\"] .k186:not(:has(.j-booking,.k82-cab)){display:none!important}\n"
  "body[data-kgm-tab=\"bookings\"] .k164-wrap:has(.j-booking,.k82-cab)>:not(:has(.j-booking,.k82-cab)):not(.j-booking):not(.k82-cab){display:none!important}\n"
  "body[data-kgm-tab=\"bookings\"] .k164-wrap:has(.j-booking,.k82-cab){border:0!important;padding:0!important;box-shadow:none!important;background:none!important}\n"
  "body[data-kgm-tab=\"bookings\"] .k165-cap{display:none!important}")
open('p_g_b2.js','w').write(hdr+'\n'.join(out)+'\n')
print('ok',len(out))

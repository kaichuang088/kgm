import json
SRC=open('/tmp/j/kgm1004A_final.html',encoding='utf-8').read()
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):
    n=SRC.count(old)
    assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 訂位頁：剩餘座位標籤位置、優先登機／免費 Wi-Fi 列、+價差為主、選位前告知座位保留、短程加長座位 */\n'
# ── 1. 票價方案卡（單一航班） ──
R('card badge out of header','              ${_badge929}\n              <div class="k929-nm">','              <div class="k929-nm">')
R('card price plus','<div class="k929-pr">${useMi?(mi.toLocaleString()+" mi"):fmtAmt(prVar,curr)}</div>',
  '<div class="k929-pr">${useMi?(mi.toLocaleString()+" mi"):(_isBase?fmtAmt(prVar,curr):("+"+fmtAmt(_dlt,curr)))}</div>')
R('card sub total','<div class="k929-sub">${useMi?(LANG==="en"?"per guest":"每人"):((LANG==="en"?"for all guests":"全部旅客")+(_isBase?"":` · <em>${LANG==="en"?"+"+fmtAmt(_dlt,curr)+" vs lowest":"較最低 +"+fmtAmt(_dlt,curr)}</em>`))}</div>',
  '<div class="k929-sub">${useMi?(LANG==="en"?"per guest":"每人"):(_isBase?((LANG==="en"?"for all guests":"全部旅客")+` · <em>${LANG==="en"?"lowest in cabin":"本艙最低"}</em>`):(`${LANG==="en"?"Total ":"總額 "}<b>${fmtAmt(prVar,curr)}</b> · ${LANG==="en"?"all guests":"全部旅客"}`))}</div>')
R('card badge on divider','            <div class="k929-rows">\n              ${_row929("bag"',
  '            ${_badge929?`<div class="k929-leftw">${_badge929}</div>`:""}\n            <div class="k929-rows">\n              ${_row929("bag"')
R('card rows prio wifi','              <div class="k929-more">${[_zn<=2?(LANG==="en"?"Priority boarding":"優先登機"):"",_staffFare?"":(_wf?(LANG==="en"?"Free Wi-Fi":"免費 Wi-Fi"):(fareInfo?.msg?(LANG==="en"?"Free messaging":"免費文字訊息"):""))].filter(Boolean).map(function(x){return `<span>✓ ${x}</span>`}).join("")}</div>',
  '              ${_row929("prio",LANG==="en"?"Priority boarding":"優先登機",(!_staffFare&&_zn<=2)?"✓":"—",!_staffFare&&_zn<=2)}\n'
  '              ${_row929("wifi",LANG==="en"?"Free Wi-Fi":"免費 Wi-Fi",_staffFare?"—":(_wf?"✓":(fareInfo?.msg?(LANG==="en"?"Messaging only":"僅免費文字訊息"):"—")),!_staffFare&&(_wf||!!fareInfo?.msg))}')
R('card icons',"ns:'<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M6 6l12 12\"/>'}",
  "ns:'<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M6 6l12 12\"/>',prio:'<path d=\"M5 21V4\"/><path d=\"M5 4h12l-2.5 4L17 12H5\"/>',wifi:'<path d=\"M2.5 9a14 14 0 0 1 19 0\"/><path d=\"M5.5 12.5a9.5 9.5 0 0 1 13 0\"/><path d=\"M8.7 16a5 5 0 0 1 6.6 0\"/><circle cx=\"12\" cy=\"19.4\" r=\".9\"/>'}",2)
# ── 2. 轉機組合卡 ──
R('conn badge out of header',"+'<div class=\"k929-hd\">'+badge","+'<div class=\"k929-hd\">'")
R('conn price plus',"+'<div class=\"k929-pr\">'+fmtAmt(p,curr2)+'</div>'","+'<div class=\"k929-pr\">'+(base?fmtAmt(p,curr2):('+'+fmtAmt(dlt,curr2)))+'</div>'")
R('conn sub total',"+'<div class=\"k929-sub\">'+(EN?\"both legs, all guests\":\"兩段全部旅客\")+(base?'':' · <em>'+(EN?(\"+\"+fmtAmt(dlt,curr2)+\" vs lowest\"):(\"較最低 +\"+fmtAmt(dlt,curr2)))+'</em>')+'</div>'",
  "+'<div class=\"k929-sub\">'+(base?((EN?\"both legs, all guests\":\"兩段全部旅客\")+' · <em>'+(EN?\"lowest in cabin\":\"本艙最低\")+'</em>'):((EN?\"Total \":\"總額 \")+'<b>'+fmtAmt(p,curr2)+'</b> · '+(EN?\"both legs, all guests\":\"兩段全部旅客\")))+'</div>'")
R('conn badge on divider',"+'<div class=\"k929-sel\"><span class=\"k929-selb\">'+(EN?'Select':'選擇')+'</span></div>'",
  "+'<div class=\"k929-sel\"><span class=\"k929-selb\">'+(EN?'Select':'選擇')+'</span></div>'+(badge?'<div class=\"k929-leftw\">'+badge+'</div>':'')")
R('conn rows prio wifi',"+'<div class=\"k929-more\">'+more.map(function(x){return '<span>✓ '+x+'</span>'}).join(\"\")+'</div>'",
  "+row929(\"prio\",EN?\"Priority boarding\":\"優先登機\",(fi.zone||4)<=2?\"✓\":\"—\",(fi.zone||4)<=2)"
  "+row929(\"wifi\",EN?\"Free Wi-Fi\":\"免費 Wi-Fi\",fi.wifi?\"✓\":(fi.msg?(EN?\"Messaging only\":\"僅免費文字訊息\"):\"—\"),!!(fi.wifi||fi.msg))")
# ── 3. CSS ──
R('css name pad','.k929-nm{font-size:15px;font-weight:800;color:#111;line-height:1.2;padding-right:74px}','.k929-nm{font-size:15px;font-weight:800;color:#111;line-height:1.2}')
R('css badge','.k929-more:empty{display:none}',
  '.k929-more:empty{display:none}\n'
  '/* 1004B：剩餘座位標籤照參考圖掛在「選擇」按鈕下方、價格區與規則表的分界線上，置中 */\n'
  '.k929-leftw{display:flex;justify-content:center;position:relative;z-index:1;margin:0 0 -10px}\n'
  '.k929-leftw .k929-left{position:static;display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:6px}\n'
  '.k929-leftw .k929-left:before{content:"";width:9px;height:10px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M12 2a6 6 0 0 0-6 6v4l-2 4h16l-2-4V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M12 2a6 6 0 0 0-6 6v4l-2 4h16l-2-4V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z%27/%3E%3C/svg%3E") center/contain no-repeat}\n'
  '.k929-leftw+.k929-rows{padding-top:14px}\n'
  '.k929-sub b{color:#2b2b2b;font-weight:800}\n'
  '/* 1004B：進入選位前的座位保留告知 */\n'
  '.k4b-hold{position:fixed;inset:0;z-index:9999;background:rgba(10,30,24,.42);display:flex;align-items:center;justify-content:center;padding:16px;animation:k4bHoldIn .18s ease}\n'
  '@keyframes k4bHoldIn{from{opacity:0}to{opacity:1}}\n'
  '.k4b-hold-card{width:min(440px,100%);background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.25);overflow:hidden}\n'
  '.k4b-hold-card header{display:flex;gap:14px;align-items:center;padding:20px 22px 6px}\n'
  '.k4b-hold-card header i{flex:0 0 44px;height:44px;border-radius:50%;background:#eef4f0;display:flex;align-items:center;justify-content:center}\n'
  '.k4b-hold-card header i svg{width:22px;height:22px;stroke:#0a4537}\n'
  '.k4b-hold-card h3{margin:0;font-size:17px;font-weight:900;color:#0a4537}\n'
  '.k4b-hold-card p{margin:0;padding:8px 22px 4px 80px;font-size:13px;line-height:1.85;color:#3b4642}\n'
  '.k4b-hold-card p b{color:#0a4537}\n'
  '.k4b-hold-card footer{display:flex;gap:10px;justify-content:flex-end;padding:16px 22px 20px}\n'
  '@media(max-width:480px){.k4b-hold-card p{padding-left:22px}.k4b-hold-card footer .btn{flex:1}}')
# ── 4. 座位保留：從選位頁的橫幅改成進入選位之前告知 ──
R('hold banner removed',"return exp.length?'<div class=\"r4-alert\" style=\"max-width:1080px;margin:12px auto\">'+(z4()?'座位保留 20 分鐘；未完成下單將自動釋出。':'Seats are held for 20 minutes and released automatically without an order.')+'</div>'+h:h;};",
  "return h;};/* 1004B：座位保留的提醒改成進入選位之前告知（kgmSeatHoldGateR1004B），選位頁本身不再顯示 */")
R('hold gate',"function goPhase(p){S.phase=p;if(p===\"seat\")S.seatPhase=((S.mcFlights||[]).filter(Boolean).length>=2)?\"seg0\":\"out\";window.scrollTo(0,0);render();}",
  "function goPhase(p){S.phase=p;if(p===\"seat\")S.seatPhase=((S.mcFlights||[]).filter(Boolean).length>=2)?\"seg0\":\"out\";window.scrollTo(0,0);render();}\n"
  "/* 1004B：使用者「座位保留 20 分鐘；未完成下單將自動釋出。是進去選座位前要告知而非顯示在系統中」\n"
  "   → 每次要進入選位之前先跳出告知，按「我知道了，前往選位」才進去；選位頁不再掛橫幅。 */\n"
  "window.kgmSeatHoldGateR1004B=function(go){\n"
  "  try{\n"
  "    var old=document.getElementById('k4bHold');if(old)old.remove();\n"
  "    var Z=LANG!=='en',el=document.createElement('div');el.id='k4bHold';el.className='k4b-hold';\n"
  "    el.innerHTML='<div class=\"k4b-hold-card\" role=\"dialog\" aria-modal=\"true\"><header><i><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg></i><h3>'+(Z?'選位前請注意':'Before you choose seats')+'</h3></header>'\n"
  "      +'<p>'+(Z?'您選好的座位會為您<b>保留 20 分鐘</b>；20 分鐘內未完成下單，座位將<b>自動釋出</b>給其他旅客。':'Seats you pick are <b>held for 20 minutes</b>. If the order is not completed in time they are <b>released automatically</b>.')+'</p>'\n"
  "      +'<footer><button type=\"button\" class=\"btn\" data-k=\"no\">'+(Z?'返回':'Back')+'</button><button type=\"button\" class=\"btn btn-g\" data-k=\"go\">'+(Z?'我知道了，前往選位':'OK, choose seats')+'</button></footer></div>';\n"
  "    el.addEventListener('click',function(e){var k=e.target&&e.target.getAttribute&&e.target.getAttribute('data-k');if(e.target===el)k='no';if(!k)return;el.remove();if(k==='go')go()});\n"
  "    document.body.appendChild(el);\n"
  "  }catch(_){go()}\n"
  "};\n"
  "var goPhase0R1004B=goPhase;goPhase=function(p){if(p===\"seat\"&&S.view===\"booking\"){var a=arguments,t=this;window.kgmSeatHoldGateR1004B(function(){goPhase0R1004B.apply(t,a)});return}return goPhase0R1004B.apply(this,arguments)};")
R('hold gate trip',"S.seatChangePnr=bk.pnr;S.phase='seat';nav('booking')}\">","S.seatChangePnr=bk.pnr;kgmSeatHoldGateR1004B(function(){S.phase='seat';nav('booking')})}\">")
R('hold gate reseat',"S.seatReturn='manage';S.view='booking';S.phase='seat';render();};","S.seatReturn='manage';S.view='booking';kgmSeatHoldGateR1004B(function(){S.phase='seat';render()});};")
R('hold gate addons',"S.seatOnly=false;S.seatReturn='addons';S.seatPhase=ss[0].key;S.view='booking';S.phase='seat';save();render();};",
  "S.seatOnly=false;S.seatReturn='addons';S.seatPhase=ss[0].key;S.view='booking';kgmSeatHoldGateR1004B(function(){S.phase='seat';save();render()});};")
# ── 5. 短程加長座位：第五航權判斷只算真的經停／第五航權航班 ──
R('fifth only through codes',"    if(f.via)return false;\n    return (typeof isFifthMarket==='function')&&!!isFifthMarket(f.fr,f.to);",
  "    if(f.via)return false;\n"
  "    /* 1004B：FIFTH_MARKETS 收的是「經停航班飛過的所有城市對」，TPE-NRT 也在裡面 —— 結果 KX180／182／184 這種\n"
  "       一般直飛 TPE-NRT 也被當成第五航權段，經濟艙不能選豪經排的加長座位（使用者：「為什麼短程like TPE-NRT無法選擇豪經座位？」）。\n"
  "       只有這個班號本身是經停航班的那一段才算。 */\n"
  "    var thr1004B=FIFTH_THRU1004B[f.code];\n"
  "    if(thr1004B===undefined){thr1004B=false;try{thr1004B=[].concat(FLIGHTS,(typeof S!=='undefined'&&S.customFlights)||[]).some(function(x){return x&&x.code===f.code&&x.via})}catch(_){}FIFTH_THRU1004B[f.code]=thr1004B}\n"
  "    if(!thr1004B)return false;\n"
  "    return (typeof isFifthMarket==='function')&&!!isFifthMarket(f.fr,f.to);")
R('fifth cache var',"function kgmFifthNoPremR913(f){","var FIFTH_THRU1004B={};\nfunction kgmFifthNoPremR913(f){")
open('p_g_bk.js','w').write(hdr+'\n'.join(out)+'\n')
print('ok',len(out))

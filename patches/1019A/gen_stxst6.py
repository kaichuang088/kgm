from common import *
# ══ 1006A #30：「員工票在我的行程裡面不能寫已確認要寫Standby」 ══
#   員工票的訂位 status 本來就是 confirmed（訂位流程共用），所以「我的行程」每一個狀態欄都直接印已確認。
#   員工票是候補（報到時才定案），一律顯示 Standby；後台按了「候補成功・配位」之後顯示 Standby（候補成功）。
#   單一來源 kgmStaffStatusR1006A(b)：不是員工票、或已取消／退票 → 回傳空字串，照原本顯示。
RL('staff status helper','kgm-0814d-r25',
 "function upcomingView(b){",
 "/* 1006A：員工票的狀態文字（單一來源；不是員工票就回空字串） */\n"
 "window.kgmStaffStatusR1006A=function(b){\n"
 "  try{\n"
 "    if(!b||!(b.stx||b.staffTravel||b.staffTix||b.staffPricing))return '';\n"
 "    if(/cancel|refund/.test(String(b.status||''))||b.ticketStatus==='refunded')return '';\n"
 "    var done=!!(b.staffClearR1006A&&Object.keys(b.staffClearR1006A).length);\n"
 "    if(!done)try{done=((b.staffPricing||{}).segments||[]).some(function(x){return x&&x.assignedCabin})}catch(_){}\n"
 "    var zz=(typeof LANG==='undefined'||LANG!=='en');\n"
 "    return done?(zz?'Standby（候補成功）':'Standby (cleared)'):'Standby';\n"
 "  }catch(_){return ''}\n"
 "};\n"
 "function upcomingView(b){")
RL('r25 badge','kgm-0814d-r25',
 "<span class=\"r25-badge\">'+(z()?'已確認':'Confirmed')+'</span>",
 "<span class=\"r25-badge\">'+E(window.kgmStaffStatusR1006A(b)||(z()?'已確認':'Confirmed'))+'</span>")
RL('r52 badge','kgm-0823b-r52',
 "(n>1?((Z()?'第 ':'Segment ')+(i+1)+(Z()?' 段':'')):(Z()?'已確認':'Confirmed'))",
 "(n>1?((Z()?'第 ':'Segment ')+(i+1)+(Z()?' 段':'')):(window.kgmStaffStatusR1006A(b)||(Z()?'已確認':'Confirmed')))")
RL('r60 list','kgm-0823g-r60',
 "+'<em>'+(cancelled?(z()?'已取消':'Cancelled'):(z()?'已確認':'Confirmed'))",
 "+'<em>'+(cancelled?(z()?'已取消':'Cancelled'):E(window.kgmStaffStatusR1006A(b)||(z()?'已確認':'Confirmed')))")
R('main list',
 "${b.status===\"cancelled\"?(LANG===\"en\"?\"Cancelled\":\"已取消\"):b.status===\"confirmed\"?(LANG===\"en\"?\"Confirmed\":\"已確認\"):(b.status||\"\")}</span>",
 "${b.status===\"cancelled\"?(LANG===\"en\"?\"Cancelled\":\"已取消\"):((window.kgmStaffStatusR1006A&&window.kgmStaffStatusR1006A(b))||(b.status===\"confirmed\"?(LANG===\"en\"?\"Confirmed\":\"已確認\"):(b.status||\"\")))}</span>")
RL('r15 status','kgm-0814d-r15',
 "+E(b.status==='confirmed'?(z()?'已確認':'Confirmed'):(b.status||''))+'</b></div>'",
 "+E((window.kgmStaffStatusR1006A&&window.kgmStaffStatusR1006A(b))||(b.status==='confirmed'?(z()?'已確認':'Confirmed'):(b.status||'')))+'</b></div>'")
RL('0812a badge','kgm-0812a-client',
 "<span class=\"a-confirmed\">'+(Z()?'已確認':'Confirmed')+'</span>",
 "<span class=\"a-confirmed\">'+H((window.kgmStaffStatusR1006A&&window.kgmStaffStatusR1006A(b))||(Z()?'已確認':'Confirmed'))+'</span>")
RL('r217 hero','kgm-0909B-r217',
 "  var stLab=Z()?({confirmed:'已確認',cancelled:'已取消',pending:'處理中',refunded:'已退票'}[st]||st):st;\n  var pax=(b.paxList||[]).length||1;",
 "  var stLab=Z()?({confirmed:'已確認',cancelled:'已取消',pending:'處理中',refunded:'已退票'}[st]||st):st;\n"
 "  try{var sx6=window.kgmStaffStatusR1006A&&window.kgmStaffStatusR1006A(b);if(sx6)stLab=sx6}catch(_){}   /* 1006A #30：員工票＝Standby */\n"
 "  var pax=(b.paxList||[]).length||1;")
RL('r208 sum','kgm-0908B-r208',
 "    var stLab=Z()\n      ?({confirmed:'已確認',cancelled:'已取消',pending:'處理中',refunded:'已退票'}[st]||st)\n      :st;",
 "    var stLab=Z()\n      ?({confirmed:'已確認',cancelled:'已取消',pending:'處理中',refunded:'已退票'}[st]||st)\n      :st;\n"
 "    try{var b6=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0],sx6=window.kgmStaffStatusR1006A&&window.kgmStaffStatusR1006A(b6);if(sx6)stLab=sx6}catch(_){}   /* 1006A #30 */")
save('p_h_stxst.js','/* 1006A · 員工票在我的行程顯示 Standby */\n')

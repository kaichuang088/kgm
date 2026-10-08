from common import *
# ══ 1006A #5：「里程升等候補一但按下候補成功的話他們的位置要自動換到商務艙（先換到隨機空位），員工票也是」 ══
#   原本候補成功只把原座位清掉，留一則「請免費重新選位」通知；員工票在航班資料上沒有「候補成功」可按。
#   改成：哩程升等候補成功（後台按、或起飛前自動遞補）→ 直接在新艙等配一個空位（沿用 autoAssignSeat：避開真實與模擬已占的位子），
#   通知寫出新座位、仍可免費改選。員工票：航班資料的員工票候補列加「候補成功・配位」，依預判可上的艙等改成員工艙等代號並配位。
#   立即確認的升等（不是候補）維持原本流程，不動。
R('seat6 helper',
 "  function applyUpgradeK(req,b){",
 "  /* 1006A：候補成功 → 在新艙等直接配一個空位（之後仍可免費改選）；回傳配到的座位 */\n"
 "  function seat6(b,seg){try{b.seats=b.seats||{};b.seats[seg]={};var s=autoAssignSeat(b,seg);if(b.seatResetAfterUpgrade0815)delete b.seatResetAfterUpgrade0815[seg];\n"
 "    var ids=Object.keys(b.seats[seg]||{}).filter(function(k){return k!=='_auto'&&b.seats[seg][k]});return ids.join('、')||s||''}catch(_){return ''}}\n"
 "  window.kgmAutoSeatR1006A=seat6;\n"
 "  function applyUpgradeK(req,b){")
R('admin decide seat',
 "if(ok){applyUpgradeK(req,b);req.decision='admin_success';_pushBkNotif(b,'✓ 【升等候補成功】'+req.code+' '+req.date+' 已升至 '+req.toCabin+'。原座位已清除，請免費重新選位。');",
 "if(ok){applyUpgradeK(req,b);var st6=seat6(b,req.seg);req.seat=st6;req.decision='admin_success';_pushBkNotif(b,'✓ 【升等候補成功】'+req.code+' '+req.date+' 已升至 '+req.toCabin+(st6?'，已自動改配座位 '+st6+'（可至行程管理免費改選）。':'。原座位已清除，請免費重新選位。'));")
R('auto clear seat',
 "if(b){applyUpgradeK(req,b);_pushBkNotif(b,'✓ 【里程升等候補已自動遞補】'+req.code+' '+req.date+' 已升至 '+req.toCabin+'。')}",
 "if(b){applyUpgradeK(req,b);var st6=seat6(b,req.seg);req.seat=st6;_pushBkNotif(b,'✓ 【里程升等候補已自動遞補】'+req.code+' '+req.date+' 已升至 '+req.toCabin+(st6?'，已自動改配座位 '+st6+'（可至行程管理免費改選）。':'。'))}")
L='kgm-0816d-r40'
RL('staff clear button',L,
 "    if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSimDecideR929(\\''+A(r.id)+'\\',\\'ok\\')\">'+(z()?'候補成功・配位':'Seat')+'</button>",
 "    /* 1006A：真的員工票也可以按「候補成功・配位」；已配位的直接顯示座位 */\n"
 "    var dn6=r.booking&&window.kgmStaffClearedR1006A&&window.kgmStaffClearedR1006A(r.booking,f.code,f.date);\n"
 "    if(dn6)act='<span class=\"k4b-v ok\">✓ '+(z()?'已配位 ':'Seated ')+E(dn6.seat||'—')+'</span>';\n"
 "    else if(!r.simR929&&r.booking)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmStaffClearR1006A(\\''+A(r.pnr)+'\\',\\''+A(f.code)+'\\',\\''+A(f.date)+'\\',\\''+A(r.clearCabR1004B||r.cabsR1004B[0]||'Economy')+'\\')\">'+(z()?'候補成功・配位':'Seat')+'</button>';\n"
 "    if(r.simR929)act='<button class=\"btn btn-sm btn-g\" onclick=\"kgmSbSimDecideR929(\\''+A(r.id)+'\\',\\'ok\\')\">'+(z()?'候補成功・配位':'Seat')+'</button>")
RL('staff clear fn',L,
 "window.kgmSbSimDecideR929=function(id,how){",
 "/* 1006A：員工票候補成功 → 改成該艙等的員工艙等代號（SE／SK／SZ／SH）並直接配一個空位 */\n"
 "function segOf6(b,code,date){var hit=null;['out','inb'].forEach(function(k){try{var i=bookingSegInfo0813(b,k);if(!hit&&i&&i.f&&i.f.code===code&&i.f.date===date)hit=k}catch(_){}});return hit}\n"
 "window.kgmStaffClearedR1006A=function(b,code,date){var k=segOf6(b,code,date);return k&&b.staffClearR1006A&&b.staffClearR1006A[k]||null};\n"
 "window.kgmStaffClearR1006A=function(pnr,code,date,cab){\n"
 "  var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(!b)return;\n"
 "  var seg=segOf6(b,code,date);if(!seg)return;\n"
 "  var cc={Economy:'SE',Premium:'SK',Business:'SZ',First:'SH'}[cab]||'SE';\n"
 "  if(seg==='inb')b.inbC=cc;else b.outC=cc;\n"
 "  var st=window.kgmAutoSeatR1006A?window.kgmAutoSeatR1006A(b,seg):'';\n"
 "  b.staffClearR1006A=b.staffClearR1006A||{};b.staffClearR1006A[seg]={cabin:cab,seat:st,at:new Date().toISOString(),by:(S.adminUser||{}).empId||''};\n"
 "  try{b.notifs=b.notifs||[];b.notifs.unshift({date:T(),read:false,msg:'✓ 【員工票候補成功】'+code+' '+date+'：'+({Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙'}[cab]||cab)+(st?'，座位 '+st:'')+'。'})}catch(_){}\n"
 "  try{logAct('員工票候補成功',pnr+' '+code+' '+date+' '+cab+' '+(st||''))}catch(_){}\n"
 "  sbCache1004B={};try{save()}catch(_){}try{render()}catch(_){}\n"
 "};\n"
 "window.kgmSbSimDecideR929=function(id,how){")
save('p_h_clear.js','/* 1006A · 候補成功自動配位 */\n')

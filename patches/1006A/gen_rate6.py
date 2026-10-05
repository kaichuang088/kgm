from common import *
# ══ 1006A #42：「我飛過的航班：給旅客評分」只有前幾個員工有資料，其他都是無紀錄 ══
#   根因：組員排班只從機隊輪轉的第一天往後算（游標一路往前），第一天之前的日子永遠不會進快取；
#   面板卻要求「30 天前那一天」已經算好才肯取資料 —— 條件永遠不成立，一直「計算中…最近 30 天沒有派飛紀錄」。
#   前幾位是剛好被別的地方強制算過才有。改成：要求的最早日期不早於班表的第一天。
RL('r210 earliest helper','kgm-0908B-r210',
 "var target=D(T(),-1),guard=0,slice=function(){",
 "var need6=window.kgmCrewNeedDayR1006A(days||30),target=D(T(),-1),guard=0,slice=function(){")
RL('r210 warm ready','kgm-0908B-r210',
 "&&window.kgmCrewHasDayR121(D(T(),-(days||30))));",
 "&&window.kgmCrewHasDayR121(need6));/* 1006A：班表第一天之前沒有資料可等 */")
RL('r210 fn ready','kgm-0908B-r210',
 "&&!(window.kgmCrewHasDayR121(D(T(),-days))&&window.kgmCrewHasDayR121(D(T(),-1))))return null;",
 "&&!(window.kgmCrewHasDayR121(window.kgmCrewNeedDayR1006A(days))&&window.kgmCrewHasDayR121(D(T(),-1))))return null;")
RL('r210 need fn','kgm-0908B-r210',
 "/* ── 組員最近 N 天飛過的航班：改用連續鏈 ─────────────────────── */",
 "/* 1006A：最早需要的日子＝max(今天−N 天, 班表第一天)；同一天同一份機隊只算一次 */\n"
 "var NEED6={};\n"
 "window.kgmCrewNeedDayR1006A=function(days){\n"
 "  var want=D(T(),-(days||30)),k=T()+'|'+Object.keys(S.tailAssign||{}).length;\n"
 "  if(!NEED6[k]){var first=T();try{Object.keys(S.tailAssign||{}).forEach(function(t){(S.tailAssign[t]||[]).forEach(function(f){if(f&&f.date&&f.date<first)first=f.date})})}catch(_){}NEED6={};NEED6[k]=first}\n"
 "  return want<NEED6[k]?NEED6[k]:want;\n"
 "};\n"
 "/* ── 組員最近 N 天飛過的航班：改用連續鏈 ─────────────────────── */")
save('p_h_rate.js','/* 1006A · 組員評分面板 */\n')

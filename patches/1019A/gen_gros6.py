from common import *
# ══ 1006A #44：「INDIVIDUAL GROUND ROSTER」除了 TPE／TSA 都不要顯示 ══
#   原本外站（例如 Qantas 代理的 SYD）也會出一張「外站由代理航空自行安排個人班表…」的卡；DMK 因為列成自營也會出完整個人班表。
#   使用者：「除了TSA/TPE不用show this」→ 只有 TPE、TSA 畫這張卡，其餘機場整張不畫。
RL('ground roster TPE/TSA only','kgm-0823o-r74',
 "var individual74=h.self?",
 "var individual74=!(ap==='TPE'||ap==='TSA')?'':h.self?   /* 1006A：只有 TPE／TSA 有個人地勤班表 */")
#   同一件事另一張卡〈地勤分區排班〉（r65）把 HND／SYD／LAX／JFK／LHR 也列成 KGM 自營站、排出個人勤務，
#   跟〈櫃檯分配〉說 SYD 由 Qantas 代理互相矛盾（兩個資料來源不一致）。照使用者規則，個人地勤班表只有 TPE／TSA。
RL('r65 roster TPE/TSA only ap','kgm-0823k-r65',
 "  var ap=S._k65GAp||'TPE',date=S._k65Date||T();\n  var r=window.kgmGroundRosterR65(ap,date);",
 "  var ap=S._k65GAp==='TSA'?'TSA':'TPE',date=S._k65Date||T();   /* 1006A：個人地勤班表只有 TPE／TSA */\n  var r=window.kgmGroundRosterR65(ap,date);")
RL('r65 roster TPE/TSA only tabs','kgm-0823k-r65',
 "  var reg=window.kgmSelfActiveR65();\n",
 "  var reg=window.kgmSelfActiveR65(),own6=function(a){return a==='TPE'||a==='TSA'};\n  reg={active:(reg.active||[]).filter(own6),idle:(reg.idle||[]).filter(own6)};   /* 1006A：外站由代理航空排班，不列個人班表 */\n")
save('p_h_gros.js','/* 1006A · 地勤個人班表只在 TPE／TSA 顯示 */\n')

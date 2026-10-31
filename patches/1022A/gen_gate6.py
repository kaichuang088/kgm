from common import *
# ══ 1006A #43：登機門要平均分配，不能集中在某一個或某幾個，也不能重疊（SYD 一個門疊了一堆聯營班） ══
#   根因（三個）：
#   ① 0922B 的配位器 kgmGateAllocR922 只讀 AP_GATES；SYD 等外站沒有 AP_GATES → 每一班都拿到「—」，
#      登機門時刻表把「—」當成一個門，聯營班全部疊在同一個「門」上。
#   ② 配位是「第一個空的門就用」→ 永遠先塞前面幾個門（TPE 一個門一天 11 班、其他門空著）。
#   ③ 登機門時刻表畫的佔用時間一律「起飛前 90 分」，配位器窄體只算 60 分 → 畫面上看起來會重疊。
#   另外 KX192 夏季岡山／冬季鹿兒島兩列（seasonOnlyR126）在 flyOn() 不分季節，同一天兩列都出現、搶同一個門。
#   改成：沒有 AP_GATES 的機場用該機型可停的位子（kgmStandsForR100）；在「空著的門」裡挑當天用得最少的
#   （遠端機位 R 稍微往後排，同分時依班號錯開）；時刻表的佔用時間直接讀配位器；flyOn 認季節限定航段。
RL('gate allowed list from stands','kgm-0909E-r229',
 "  function allowed9(ap,tp,term){\n    var all=stands9(ap);",
 "  function allowed9(ap,tp,term){\n"
 "    var all=[];try{all=(window.kgmStandsForR100&&window.kgmStandsForR100(ap,tp))||[]}catch(_){all=[]}   /* 1006A：機型停得下的位子；外站沒有 AP_GATES 也有門可配 */\n"
 "    if(!all.length)all=stands9(ap);")
RL('gate least-used pick','kgm-0909E-r229',
 "      for(i=0;i<opts.length;i++)if(free(opts[i],r)){pick=opts[i];break}",
 "      /* 1006A：空著的門裡挑當天用得最少的（遠端機位稍後），同分依班號錯開 —— 不再永遠先塞前面幾個門 */\n"
 "      var h6=2166136261,s6=String(r.code)+'|'+date,bs6=1e9;for(i=0;i<s6.length;i++){h6^=s6.charCodeAt(i);h6=Math.imul(h6,16777619)>>>0}\n"
 "      for(i=0;i<opts.length;i++){var g6=opts[(i+h6)%opts.length];if(!free(g6,r))continue;\n"
 "        var sc6=(busy[g6]||[]).length*10+(/R$/.test(g6)?15:0);if(sc6<bs6){bs6=sc6;pick=g6}}")
RL('gate overflow list','kgm-0909E-r229',
 "        var all2=stands9(ap);",
 "        var all2=stands9(ap);if(!all2.length)try{all2=window.kgmStandsForR100(ap,'B789')||[]}catch(_){all2=[]}")
# 登機門時刻表：佔用時間直接用配位器算的那一段
RL('timetable window helper','kgm-0823k-r65',
 "function gateTimetable65(){",
 "/* 1006A：佔用時間跟配位器同一份（A380 起飛前 120 分、廣體 90 分、窄體 60 分，至起飛後 15 分） */\n"
 "function gw6(f,date){try{var a=window.kgmGateAllocR922&&window.kgmGateAllocR922(f.fr,date);var r=a&&a.rows.filter(function(x){return x.code===f.code&&x.fr===f.fr&&x.to===f.to})[0];if(r)return mn(f.dep)-r.start}catch(_){}return 90}\n"
 "function gateTimetable65(){")
RL('timetable window use','kgm-0823k-r65',
 "from:hm(d-90),to:hm(d+15)});",
 "from:hm(d-gw6(f,date)),to:hm(d+15)});",2)
RL('timetable text','kgm-0823k-r65',
 "佔用時間（起飛前 90 分鐘至起飛後 15 分鐘）",
 "佔用時間（起飛前地面作業至起飛後 15 分鐘：A380 120 分、廣體 90 分、窄體 60 分；同一個門兩班之間至少隔 10 分鐘）")
# flyOn：季節限定的航段（seasonOnlyR126，例如 KX192 夏季岡山／冬季鹿兒島）只在那一季飛。
#   有月份閘門（f.mon，KX51／KX52 紐澳段）的照舊由 mon 與 r66 的「看前一天」規則處理，這裡不碰。
R('flyOn season-only legs',
 'function flyOn(f,d){\n  if(typeof S!=="undefined"&&S.flightDisabled',
 'function flyOn(f,d){\n'
 '  if(f&&f.seasonOnlyR126&&!(f.mon&&f.mon.length)&&typeof window!=="undefined"&&window.kgmSeasonKeepR126&&d&&d.getFullYear){var _s6=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(!window.kgmSeasonKeepR126(f,_s6))return false;}/* 1006A：季節限定航段只在那一季飛 */\n'
 '  if(typeof S!=="undefined"&&S.flightDisabled')
# 同一個班號有兩段（第五航權 KX74 TPE→BKK→CDG）時，查登機門沒帶出發機場 → 一律拿到 TPE 那段的門，
#   曼谷出發那段在時刻表、旅客行程卡上都顯示桃園的門。查詢一律帶出發機場。
RL('planned gate pass ap','kgm-0823k-r65',
 "kgmGatePlannedR65=function(code,date){\n  var g=null;\n  try{S._k65Raw=1;g=window.kgmGateOfR26(code,date)}",
 "kgmGatePlannedR65=function(code,date,ap){\n  var g=null;\n  try{S._k65Raw=1;g=window.kgmGateOfR26(code,date,ap)}")
RL('timetable pass ap','kgm-0823k-r65',
 "window.kgmGatePlannedR65(f.code,date)",
 "window.kgmGatePlannedR65(f.code,date,ap)",3)
RL('front gate pass ap','kgm-0814d-r22',
 "window.kgmGateR22=function(code,date){",
 "window.kgmGateR22=function(code,date,ap){   /* 1006A：ap＝出發機場（第五航權同班號兩段各有自己的門） */")
RL('front gate pass ap 2','kgm-0814d-r22',
 "try{var r=window.kgmGateOfR26(code,date);",
 "try{var r=window.kgmGateOfR26(code,date,ap);")
RL('trip card gate ap r25','kgm-0814d-r25',
 "window.kgmGateR22(sg.code,sg.date)",
 "window.kgmGateR22(sg.code,sg.date,sg.fr)")
RL('trip card gate ap r52','kgm-0823b-r52',
 "window.kgmGateR22(s.code,s.date)",
 "window.kgmGateR22(s.code,s.date,(s.fr||(s.f&&s.f.fr)||''))")
RL('r100 flight = departing leg','kgm-0902a-r100',
 "    out.flight=out.flight||f;",
 "    out.flight=f;   /* 1006A：同班號兩段時 base 帶的是第一段（TPE），要用這次查的出發機場那一段 */")
save('p_h_gate.js','/* 1006A · 登機門平均分配、不重疊、外站也有門；季節限定航段 */\n')

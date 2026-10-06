from common import *
# ══ 1006A #25：「如遇連假，或是寒假等，所有里程升等和酬賓機票提供的位置要少很多（可能少一半），
#    還有連假的時候通常會把最便宜的方案比例調得很低就是可能那個只有20%之類的」 ══
#   連假／寒暑假判斷（kgmHolSeatR1006A）：
#     · 寒假 1/20–2/15、暑假 7/1–8/31（不分航線）
#     · KGM_HOLIDAYS_R929 裡的各國連假（前一天到收假隔天），航班出發或抵達是該國才算
#   酬賓與哩程升等：同一個來源 awardSeatsLeft（r10 依未售座位決定放多少），連假時放出的量減半。
#     （春節 2/2–2/15 原本就整段不開放酬賓，維持不動。）後台手動額外釋出（S.awardRelease）不受影響。
#   票價家族：連假時同艙等「基本」只佔 20%，其餘座位由超值、豪華平分（原本三家族各 1/3）。
#   比例集中在 window.KGM_HOLSEAT_R1006A（程式常數，前台檔、後台檔同一份）。
L10='kgm-0814c-r10'
RL('r10 holiday helper',L10,
 "awardSeatsLeft=function(code,date,cabin){\n  if(String(date||'').slice(5,10)>='02-02'",
 "/* 1006A #25：連假／寒暑假 —— 酬賓與升等放出量減半、基本票只佔 20% */\n"
 "window.KGM_HOLSEAT_R1006A=window.KGM_HOLSEAT_R1006A||{award:0.5,basic:0.2,winter:['01-20','02-15'],summer:['07-01','08-31']};\n"
 "window.kgmHolSeatR1006A=function(date,flight,code){\n"
 "  var d=String(date||'').slice(0,10);if(!/^\\d{4}-\\d\\d-\\d\\d$/.test(d))return null;\n"
 "  var C=window.KGM_HOLSEAT_R1006A||{},md=d.slice(5);\n"
 "  if(C.winter&&md>=C.winter[0]&&md<=C.winter[1])return {zh:'寒假',en:'Winter break'};\n"
 "  if(C.summer&&md>=C.summer[0]&&md<=C.summer[1])return {zh:'暑假',en:'Summer break'};\n"
 "  var H=window.KGM_HOLIDAYS_R929||[];if(!H.length)return null;\n"
 "  var f=flight;try{if(!f&&code)f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===code})[0]}catch(_){}\n"
 "  var cf='',ct='';try{if(f&&typeof kgmCountryR929==='function'){cf=kgmCountryR929(f.fr);ct=kgmCountryR929(f.to)}}catch(_){}\n"
 "  var t=Date.parse(d+'T00:00:00Z');\n"
 "  for(var i=0;i<H.length;i++){var h=H[i];if(!h||!h.c||!h.from||!h.to)continue;\n"
 "    if(f?(cf!==h.c&&ct!==h.c):h.c!=='TW')continue;\n"
 "    if(t>=Date.parse(h.from+'T00:00:00Z')-864e5&&t<=Date.parse(h.to+'T00:00:00Z')+864e5)return {zh:h.zh||'連假',en:'Holiday',c:h.c};\n"
 "  }\n"
 "  return null;\n"
 "};\n"
 "awardSeatsLeft=function(code,date,cabin){\n  if(String(date||'').slice(5,10)>='02-02'")
RL('r10 holiday halve',L10,
 "  return Math.max(0,Math.min(raw,Math.max(0,base),room));\n};",
 "  /* 1006A #25：連假／寒暑假放出的酬賓與升等座位減半（無條件捨去：剩 1 席就不放） */\n"
 "  try{if(window.kgmHolSeatR1006A(date,arguments[3],code)){var k6=+(window.KGM_HOLSEAT_R1006A||{}).award;if(!(k6>=0&&k6<=1))k6=0.5;return Math.floor(Math.max(0,Math.min(raw,Math.max(0,base),room))*k6)}}catch(_){}\n"
 "  return Math.max(0,Math.min(raw,Math.max(0,base),room));\n};")
RL('r54 holiday basic share','kgm-0823c-r54',
 "  var families=Object.keys(FAM54[cab]||{}),famCap=Math.max(1,Math.floor(cap/Math.max(1,families.length))),bucket=Math.max(1,Math.floor(famCap/all.length));",
 "  var families=Object.keys(FAM54[cab]||{}),famCap=Math.max(1,Math.floor(cap/Math.max(1,families.length)));\n"
 "  /* 1006A #25：連假／寒暑假，基本只佔這一艙 20%，其餘由超值、豪華平分 */\n"
 "  try{if(families.length>1&&families.indexOf('Basic')>=0&&typeof window.kgmHolSeatR1006A==='function'&&window.kgmHolSeatR1006A(date,flight)){\n"
 "    var bs6=+(window.KGM_HOLSEAT_R1006A||{}).basic;if(!(bs6>0&&bs6<1))bs6=0.2;\n"
 "    famCap=fam==='Basic'?Math.max(1,Math.floor(cap*bs6)):Math.max(1,Math.floor(cap*(1-bs6)/(families.length-1)));\n"
 "  }}catch(_){}\n"
 "  var bucket=Math.max(1,Math.floor(famCap/all.length));")
save('p_h_hol.js','/* 1006A · 連假／寒暑假：酬賓升等減半、基本票 20% */\n')

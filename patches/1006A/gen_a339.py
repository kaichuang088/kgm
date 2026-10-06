from common import *
# ══ 1006A #18：「我同意把一些常態是A339R/L的機型換成B779或A35K因為太常被調度了，而且A339太多航班了他幾乎是其他機型的三倍」 ══
#   實測（1006A w43，一整年）：A339R 12 架每週 170 段（每架 14.2 段，其他機型 4–9 段）；
#   A339L 的歐洲線一年被換成 B779 4,085 次（等於幾乎都是 B779 在飛），A339L 機身反而被拿去補 A339R（416 次）。
#   時刻表改成照實際在飛的機型：
#     A339L → B779：維也納 KX94/93、赫爾辛基 KX98/97、華沙 KX90/89、布達佩斯 KX80/79
#     A339L → A35K：墨爾本／伯斯 KX54/53（第五航權兩段＋直掛列）
#     A339R → A339L（同一機型族，空出來的 12 架 A339L 接手）：新加坡 KX278/277、KX282/281、KX290/289；宿霧 KX260/259、KX262/261；峴港 KX272/271；清邁 KX264/263
#   沿用 r143 的「機型指定」（基準列＋夏季＋冬季三份一起改，每次掃描都會再套一次，舊的儲存資料蓋不掉）。
L='kgm-0906a-r143'
pairs=[('KX94','TPE','VIE','B779'),('KX93','VIE','TPE','B779'),('KX98','TPE','HEL','B779'),('KX97','HEL','TPE','B779'),
 ('KX90','TPE','WAW','B779'),('KX89','WAW','TPE','B779'),('KX54','TPE','MEL','A35K'),('KX54','MEL','PER','A35K'),('KX53','PER','MEL','A35K'),('KX53','MEL','TPE','A35K'),
 ('KX278','TPE','SIN','A339L'),('KX277','SIN','TPE','A339L'),('KX282','TPE','SIN','A339L'),('KX281','SIN','TPE','A339L'),
 ('KX290','TPE','SIN','A339L'),('KX289','SIN','TPE','A339L'),('KX260','TPE','CEB','A339L'),('KX259','CEB','TPE','A339L'),
 ('KX262','TPE','CEB','A339L'),('KX261','CEB','TPE','A339L'),('KX272','TPE','DAD','A339L'),('KX271','DAD','TPE','A339L'),
 ('KX264','TPE','CNX','A339L'),('KX263','CNX','TPE','A339L')]
lst=",\n             ".join("{code:'%s',fr:'%s',to:'%s',acft:'%s',r1006A:1}"%p for p in pairs)
RL('type143 list',L,
 "var TYPE143=[{code:'KX90',fr:'TPE',to:'WAW',acft:'A339L'},\n             {code:'KX89',fr:'WAW',to:'TPE',acft:'A339L'}];",
 "/* 1006A #18：A339 減量 —— 歐洲線改 B779、墨爾本／伯斯改 A35K、部分 A339R 區域線交給同族的 A339L（原本 KX90/89 華沙的 A339L 指定改成 B779） */\n"
 "var TYPE143=[{code:'KX90',fr:'TPE',to:'WAW',acft:'A339L'},\n             {code:'KX89',fr:'WAW',to:'TPE',acft:'A339L'}].filter(function(x){return x.code!=='KX90'&&x.code!=='KX89'}).concat([\n             "+lst+"]);")
# 第五航權的直掛列（via）跟兩段同一個機型
RL('type143 via rows',L,
 "      n++;log(t.code+' 機型 → '+t.acft);\n    });\n  });\n  return n;\n}",
 "      n++;log(t.code+' 機型 → '+t.acft);\n    });\n"
 "    /* 1006A：同班號的直掛列（例如 KX54 TPE–MEL–PER）跟分段一起改 */\n"
 "    try{FLIGHTS.filter(function(f){return f&&f.via&&f.code===t.code&&f.acft!==t.acft&&(f.fr===t.fr||f.to===t.to)}).forEach(function(f){f.acft=t.acft;var v=seasonOf(f);if(v){if(v.summer)v.summer.acft=t.acft;if(v.winter)v.winter.acft=t.acft}n++})}catch(_){}\n"
 "  });\n  return n;\n}")
RL('type143 audit waw',L,
 "o.wawOK=!!(o.waw.KX90&&o.waw.KX90.days==='136'&&o.waw.KX90.acft==='A339L'\n    &&o.waw.KX89&&o.waw.KX89.days==='136'&&o.waw.KX89.acft==='A339L');",
 "o.wawOK=!!(o.waw.KX90&&o.waw.KX90.days==='136'&&o.waw.KX90.acft==='B779'\n    &&o.waw.KX89&&o.waw.KX89.days==='136'&&o.waw.KX89.acft==='B779');   /* 1006A #18：華沙改 B779 */")
# EQV：實測 EQV 機型一年前就排定、重排前後 4,608 個抽樣日 0 筆改變；A339 段數多是因為飛短程（12 月每架 243／164 block 小時，與 B779 261、A359 254 相當），EQV 機型池不動。
# 布達佩斯 KX80/79 原本就是兩種機型共同營運（A339L/B789）—— A339L 那一半改成 B779（不能同時放進單一機型指定，兩條規則會互相覆蓋）
RL('mix143 BUD',L,
 "  'KX80|TPE|BUD':['A339L','B789'],'KX79|BUD|TPE':['A339L','B789'],",
 "  'KX80|TPE|BUD':['B779','B789'],'KX79|BUD|TPE':['B779','B789'],   /* 1006A #18：A339L → B779 */")
save('p_h_a339.js','/* 1006A · A339 減量：部分航線改 B779／A35K／A339L */\n')

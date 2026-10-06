from common import *
# ══ 1006A #46：第五航權中停一律 75 分鐘；回台北的後段（例 FRA-BKK-TPE 的 BKK→TPE）一定 07:00 以後才起飛 ══
#   r179 原本把中停鎖在 90–105 分（KX43 另外豁免 2 小時）。使用者：「第五航權中停一率75mins」。
#   回台北那一段如果「前段落地＋75 分」會早於 07:00，不縮短中停，而是把前段整段往後移，讓後段剛好 07:00 起飛。
L='kgm-0907B-r179'
RL('ground 75',L,
 "var GROUND_MIN=90, GROUND_MAX=105, GROUND_SET=90;\nvar EXEMPT={'KX43':1};                     /* 使用者指定過的時刻 */",
 "var GROUND_MIN=75, GROUND_MAX=75, GROUND_SET=75;   /* 1006A：使用者「第五航權中停一率75mins」 */\n"
 "var EXEMPT={};                             /* 1006A：KX43 不再例外，一樣 75 分 */\n"
 "var TPE_EARLIEST=420;                      /* 1006A：回台北（TPE／TSA）的後段 07:00 以後才起飛 */\n"
 "function toTpe(V){return V&&(V.to==='TPE'||V.to==='TSA')}")
RL('ground report early',L,
 "        ground:groundOf(times(L1,sea),times(L2,sea)),exempt:!!EXEMPT[V.code]});",
 "        ground:groundOf(times(L1,sea),times(L2,sea)),exempt:!!EXEMPT[V.code],\n"
 "        early:toTpe(V)&&mn(times(L2,sea).dep)<TPE_EARLIEST});   /* 1006A */")
RL('apply 75 + 07:00',L,
 "      if(g>=GROUND_MIN&&g<=GROUND_MAX)return;                 /* 已在區間內 */\n"
 "      var dur=block(L2,t2);\n"
 "      var newDep=hm(mn(t1.arr)+GROUND_SET);",
 "      var early=toTpe(V)&&mn(t2.dep)<TPE_EARLIEST;\n"
 "      if(g>=GROUND_MIN&&g<=GROUND_MAX&&!early)return;                 /* 已在區間內 */\n"
 "      var dur=block(L2,t2);\n"
 "      var newDep=hm(mn(t1.arr)+GROUND_SET);\n"
 "      /* 1006A：回台北的後段不能早於 07:00 —— 前段整段往後移，中停仍是 75 分 */\n"
 "      if(toTpe(V)&&mn(newDep)<TPE_EARLIEST){\n"
 "        var sh=TPE_EARLIEST-mn(newDep),d1=hm(mn(t1.dep)+sh),a1=hm(mn(t1.arr)+sh);\n"
 "        var dd1=(+t1.dd||0)+Math.floor((mn(t1.arr)+sh)/1440);\n"
 "        if(o1&&o1[sea]){o1[sea].dep=d1;o1[sea].arr=a1;o1[sea].dd=dd1}\n"
 "        if(sea==='summer'){L1.dep=d1;L1.arr=a1;L1.dd=dd1;\n"
 "          try{L1.dur=blockMin(L1.fr,L1.to,L1.dep,L1.arr,L1.dd);L1.durStr=durStr(L1.dur)}catch(_){}}\n"
 "        log(V.code+' '+V.fr+'-'+V.via+' '+sea+'：前段延後 '+sh+' 分（'+V.fr+' '+d1+' 起飛），回台北段 07:00 起飛');\n"
 "        t1={dep:d1,arr:a1,dd:dd1};newDep=hm(TPE_EARLIEST);\n"
 "      }")
RL('interval check early',L,
 "      return !x.exempt&&(x.ground<GROUND_MIN||x.ground>GROUND_MAX)});\n    /* 1004A",
 "      return !x.exempt&&(x.ground<GROUND_MIN||x.ground>GROUND_MAX||x.early)});\n    /* 1004A")
RL('audit early',L,
 "  var outR=g.filter(function(x){return !x.exempt&&(x.ground<GROUND_MIN||x.ground>GROUND_MAX)});",
 "  var outR=g.filter(function(x){return !x.exempt&&(x.ground<GROUND_MIN||x.ground>GROUND_MAX||x.early)});")
RL('audit text',L,
 "bad.push('第五航權中停未落在 90–105 分鐘 ('+outR.length+')');",
 "bad.push('第五航權中停不是 75 分鐘或回台北段早於 07:00 ('+outR.length+')');")
# KX43 LAS–ICN–TPE：原本 r96／r136／r160／r77 與主表各自把首爾→台北寫死成夏季 08:10（2 小時中停，r179 也豁免它）。
#   照「一率 75 分」：夏季 ICN 06:10 到、07:25 走、台北 08:30 到；冬季本來就是 07:25 到、08:40 走（75 分），不動。
R('KX43 main ICN-TPE','["KX43","ICN","TPE","08:10","09:15"','["KX43","ICN","TPE","07:25","08:30"')
R('KX43 main LAS-TPE','["KX43","LAS","TPE","01:20","09:15"','["KX43","LAS","TPE","01:20","08:30"')
R('KX43 r77 ICN-TPE',"'KX43|ICN|TPE':{summer:['08:10','09:15',0,[1,3,6],'A359']","'KX43|ICN|TPE':{summer:['07:25','08:30',0,[1,3,6],'A359']")
R('KX43 r77 LAS-TPE',"'KX43|LAS|TPE':{summer:['01:20','09:15',1,[2,5,7],'A359']","'KX43|LAS|TPE':{summer:['01:20','08:30',1,[2,5,7],'A359']")
R('KX43 r96 ICN-TPE',"{code:'KX43',fr:'ICN',to:'TPE',via:null, dep:'08:10',arr:'09:15',dd:0,dur:125}","{code:'KX43',fr:'ICN',to:'TPE',via:null, dep:'07:25',arr:'08:30',dd:0,dur:125}")
R('KX43 r96 LAS-TPE',"{code:'KX43',fr:'LAS',to:'TPE',via:'ICN',dep:'01:20',arr:'09:15',dd:1,dur:955,ground:120}","{code:'KX43',fr:'LAS',to:'TPE',via:'ICN',dep:'01:20',arr:'08:30',dd:1,dur:910,ground:75}")
R('KX43 r136',"{code:'KX43', fr:'ICN',to:'TPE',dep:'08:10',arr:'09:15',dd:0}","{code:'KX43', fr:'ICN',to:'TPE',dep:'07:25',arr:'08:30',dd:0}")
R('KX43 r160',"'KX43|ICN|TPE':{summer:{dep:'08:10',arr:'09:15',dd:0},","'KX43|ICN|TPE':{summer:{dep:'07:25',arr:'08:30',dd:0},")
# 1006A #46（第二輪）：r106 的 kgmViaGroundR106（開站 2.5／9／20 秒各跑一次）用不分夏冬季的主表時刻算中停，
#   不在 45–120 分就改成 90 分、還直接改後段起飛時間（KX51 雪梨段同屬 CHC-SYD-TPE 與 AKL-SYD-TPE，被改成 18:30 又改回 19:55）；
#   在範圍內也把主表算出的值（KX44／KX30 是 90）寫進 __groundR34，蓋掉 r179／r34 依季節算好的 75。
#   兩套規則互相蓋 → 時刻表、後台「中途過站」、機隊輪轉都看開站第幾秒。中停由 r179 唯一決定；這裡只回報、不再寫任何欄位。
RL('r106 via ground report only','kgm-0902a-r106',
 "      if(g>max||g<45){\n        var nd=clock106(arr+sug);",
 "      /* 1006A #46：中停由 r179 唯一決定（一律 75 分、回台北段 07:00 以後、夏冬季分開算）；這裡只回報，不改時刻、不寫中停欄位 */\n"
 "      if(window.KGM_VIA_GROUND_FIX_R106!==true){if(g>max||g<45)out.fixed.push(t.code+' '+t.fr+'-'+t.via+'-'+t.to+' '+g+'min（主表；實際依 r179）');else out.ok++;return}\n"
 "      if(g>max||g<45){\n        var nd=clock106(arr+sug);")

# 1006A #46（第二輪）：r77 的 kgmRepairTimetableR77 有自己寫死的時刻（KX44 仁川→拉斯維加斯 23:45＝中停 90 分），
#   每次機隊重排前都會跑 → 重排當下用的是 90 分版本，r179 之後又改回 75 分。比照 r160 的作法：r77 修完立刻在同一個呼叫裡再套一次 r179。
RL('r179 after r77','kgm-0907B-r179',
 "window.kgmFixFifthGroundR179=run179;\nrun179();",
 "window.kgmFixFifthGroundR179=run179;\n"
 "/* 1006A #46：r77 修時刻表會把第五航權中停改回 90 分 —— 修完立刻再鎖回 75 分（同一個同步呼叫，重排看到的就是 75 分） */\n"
 "try{if(typeof window.kgmRepairTimetableR77==='function'&&!window.kgmRepairTimetableR77.__r179){var p77x=window.kgmRepairTimetableR77;\n"
 "  var w77x=function(){var r=p77x.apply(this,arguments);try{run179()}catch(_){}return r};w77x.__r179=1;window.kgmRepairTimetableR77=w77x}}catch(_){}\n"
 "run179();")

# 1006A #46（第二輪）：r77 寫死的 KX44／KX30／KX29 時刻是中停 90 分的舊版本（每次機隊重排前都會寫回主表），改成 r179 的 75 分版本，兩邊同一份數字
RL('r77 75min 0','kgm-0823p-r77',"'KX44|ICN|LAS':{summer:['23:45','19:05',0,[1,4,6],'A359'],winter:['23:30','18:05',0,[1,4,6],'A359']}","'KX44|ICN|LAS':{summer:['23:30','18:50',0,[1,4,6],'A359'],winter:['23:10','17:45',0,[1,4,6],'A359']}")
RL('r77 75min 1','kgm-0823p-r77',"'KX44|TPE|LAS':{summer:['19:05','19:05',0,[1,4,6],'A359'],winter:['18:50','18:05',0,[1,4,6],'A359']}","'KX44|TPE|LAS':{summer:['19:05','18:50',0,[1,4,6],'A359'],winter:['18:50','17:45',0,[1,4,6],'A359']}")
RL('r77 75min 2','kgm-0823p-r77',"'KX29|YVR|TPE':{summer:['11:40','15:40',1,[1,2,4,6],'B789'],winter:['11:45','16:30',1,[1,2,4,6],'B789']}","'KX29|YVR|TPE':{summer:['11:25','15:25',1,[1,2,4,6],'B789'],winter:['11:30','16:15',1,[1,2,4,6],'B789']}")
RL('r77 75min 3','kgm-0823p-r77',"'KX30|YVR|YYZ':{summer:['22:40','05:50',1,[1,3,5,7],'B789'],winter:['00:20','07:15',0,[1,2,4,6],'B789']}","'KX30|YVR|YYZ':{summer:['22:25','05:35',1,[1,3,5,7],'B789'],winter:['00:05','07:00',0,[1,2,4,6],'B789']}")
RL('r77 75min 4','kgm-0823p-r77',"'KX30|TPE|YYZ':{summer:['01:15','05:50',0,[1,2,4,6],'B789'],winter:['02:10','07:15',0,[1,2,4,6],'B789']}","'KX30|TPE|YYZ':{summer:['01:15','05:35',0,[1,2,4,6],'B789'],winter:['02:10','07:00',0,[1,2,4,6],'B789']}")
# /* 1006A #46（第三輪）：KX31 溫哥華→台北主表原始資料是 01:10–05:10（12 小時），時刻表 PDF 是 23:10–04:10／23:15–04:00（13 小時／12 小時 45 分）；
# 1004B 剛好被其他層寫回 PDF 值，改 75 分後主表那一套贏了（夏 22:55–02:55、冬 23:00–04:45，飛行時間差正負 1 小時）。
# 比照 KX29／KX30 直接寫成 PDF 時刻減 15 分（中停 75 分、飛行時間不變）。KX59 吉隆坡→台北冬季同理（PDF 4h10 → 07:00–11:10）。 */
RL('r77 75min 5','kgm-0823p-r77',"'KX29|YYZ|TPE':{summer:['08:10','15:40',1,[1,2,4,6],'B789'],winter:['08:25','16:30',1,[1,2,4,6],'B789']}","'KX29|YYZ|TPE':{summer:['08:10','15:25',1,[1,2,4,6],'B789'],winter:['08:25','16:15',1,[1,2,4,6],'B789']},"
 "'KX31|YVR|TPE':{summer:['22:55','03:55',2,[1,3,5,6,7],'B789'],winter:['23:00','03:45',2,[1,3,5,6,7],'B789']},"
 "'KX31|YYZ|TPE':{summer:['19:40','03:55',2,[1,3,5,6,7],'B789'],winter:['19:55','03:45',2,[1,3,5,6,7],'B789']},"
 "'KX59|KUL|TPE':{summer:['07:00','11:15',0,[1,2,3,4,5,6,7],'A359'],winter:['07:00','11:10',0,[1,2,3,4,5,6,7],'A359']}")

save('p_h_fifth.js','/* 1006A · 第五航權中停 75 分、回台北段 07:00 以後 */\n')

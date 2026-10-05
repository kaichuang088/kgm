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
save('p_h_fifth.js','/* 1006A · 第五航權中停 75 分、回台北段 07:00 以後 */\n')

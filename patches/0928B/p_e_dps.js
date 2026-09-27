/* 0928B · KX240／KX239 冬季改成 EQV（A21N／B78X）（使用者：「KX240 冬季是 A21N/B78X，所以後台機型應該要選擇 EQV 並選 A21N/B78X 而非 B78X」）
   0928A 把冬季寫成 A21N，但 r160 每 4 秒把季節列機型強制改回基準列（B78X），後台看到的就一直是 B78X。
   ① 冬季機型改成 EQV，EQV 機型池（r198，去回程共用一筆）冬季勾 A21N／B78X、夏季 B78X；已存的舊資料也補改。
   ② r160 不再覆蓋管理端親自儲存過的季節機型（原本任何季節機型都會被改回基準列，後台根本無法讓夏冬不同機型）。 */
RL('dps winter eqv 240','kgm-0823p-r77',"winter:['01:05','05:55',0,'daily','A21N']","winter:['01:05','05:55',0,'daily','EQV']",1);
RL('dps winter eqv 239','kgm-0823p-r77',"winter:['07:35','12:50',0,'daily','A21N']","winter:['07:35','12:50',0,'daily','EQV']",1);
RL('dps winter eqv migrate','kgm-0823p-r77',
"var old=S.seasonSchedulesR48[k];if(old&&old.userR928A)return;",
"var old=S.seasonSchedulesR48[k];\n      /* 0928B：0928A 已寫入的舊資料只補改冬季機型（時刻不動）；管理端之後自己存過的不動 */\n      if(old&&old.userR928A&&!old.userR928B){if(old.winter&&!old.winter.acftUserR928)old.winter.acft='EQV';old.userR928B=1}\n      try{S.eqvPoolR198=S.eqvPoolR198||{};if(!S.eqvPoolR198['KX239|DPS-TPE'])S.eqvPoolR198['KX239|DPS-TPE']={summer:['B78X'],winter:['A21N','B78X']}}catch(_){}\n      if(old&&old.userR928A)return;",1);
RL('dps new record flag','kgm-0823p-r77',"seededR57:0,winterBlockR68:0,pinnedR179:1,userR928A:1,","seededR57:0,winterBlockR68:0,pinnedR179:1,userR928A:1,userR928B:1,",1);
RL('r160 keep admin acft','kgm-0905b-r160',
"        if(r.acft===f.acft)return;",
"        if(r.acft===f.acft)return;\n        if(r.acftUserR928||(v.userR928B&&s==='winter'))return;   /* 0928B：管理端親自選的季節機型不覆蓋 */",1);
R('season save marks admin acft',
"    o[sea]={dep:dep,arr:arr,dd:dd,acft:acft,days:dayVal};",
"    o[sea]={dep:dep,arr:arr,dd:dd,acft:acft,days:dayVal,acftUserR928:1};   /* 0928B：標記為管理端親自選的機型，r160 不再改回基準列 */",1);

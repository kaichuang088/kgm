/* 1006A · 地勤個人班表只在 TPE／TSA 顯示 */
RL("ground roster TPE/TSA only","kgm-0823o-r74","var individual74=h.self?","var individual74=!(ap==='TPE'||ap==='TSA')?'':h.self?   /* 1006A：只有 TPE／TSA 有個人地勤班表 */",1);
RL("r65 roster TPE/TSA only ap","kgm-0823k-r65","  var ap=S._k65GAp||'TPE',date=S._k65Date||T();\n  var r=window.kgmGroundRosterR65(ap,date);","  var ap=S._k65GAp==='TSA'?'TSA':'TPE',date=S._k65Date||T();   /* 1006A：個人地勤班表只有 TPE／TSA */\n  var r=window.kgmGroundRosterR65(ap,date);",1);
RL("r65 roster TPE/TSA only tabs","kgm-0823k-r65","  var reg=window.kgmSelfActiveR65();\n","  var reg=window.kgmSelfActiveR65(),own6=function(a){return a==='TPE'||a==='TSA'};\n  reg={active:(reg.active||[]).filter(own6),idle:(reg.idle||[]).filter(own6)};   /* 1006A：外站由代理航空排班，不列個人班表 */\n",1);

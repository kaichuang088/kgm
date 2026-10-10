/* 0928B · 剩餘座位：>5 席只寫「有剩餘位置」（使用者：「如果定位時各個倉等剩餘位置 >5 只要寫有剩餘位置就好不用寫幾個」）
   原本的規則是 <5 才寫數字（剛好 5 席也寫「尚有座位」），而且「後台已登入」就整段不做 —— 使用者常常後台登著、
   同時在前台訂位，於是看到的一直是「剩餘 37 席」。改成：
   · 0 席：售完；1–5 席：寫數字；>5 席：有剩餘位置。
   · 判斷的是「現在是不是在後台畫面」，不是「後台有沒有登入」。
   · 票價卡、改票選航班、後台代訂位的票種選單都照同一個規則，直接在產生文字的地方改，不再先印數字再被換掉。 */
R('fare card seats',
"${LANG===\"en\"?((seatLeft==null?'Available':seatLeft+' seats left')):((seatLeft==null?'尚有座位':'剩餘 '+seatLeft+' 席'))}",
"${LANG===\"en\"?((seatLeft==null||seatLeft>5?'Seats available':seatLeft+' seats left')):((seatLeft==null||seatLeft>5?'有剩餘位置':'剩餘 '+seatLeft+' 席'))}",1);
R('r95 threshold',
"      }else if(v<lim){\n        n.textContent=z()?('剩餘 '+v+' 席'):(v+' seats left');",
"      }else if(v<=lim){   /* 0928B：5 席（含）以下才寫數字 */\n        n.textContent=z()?('剩餘 '+v+' 席'):(v+' seats left');",1);
R('r95 label',
"        n.textContent=z()?'尚有座位':'Available';\n        n.style.background='#eef4f1';n.style.color='var(--g,#0b493b)';\n      }\n      n.style.display='';",
"        n.textContent=z()?'有剩餘位置':'Seats available';\n        n.style.background='#eef4f1';n.style.color='var(--g,#0b493b)';\n      }\n      n.style.display='';",1);
R('r95 admin view',
"    if(S.adminAuthed)return;\n    /* 只掃有票價卡的頁",
"    if(S.view==='admin')return;   /* 0928B：看的是現在在不在後台畫面 */\n    /* 只掃有票價卡的頁",1);
R('r130 rule',
"      if(v>=lim){\n        /* 舊版會把「剩餘 37 個位置」直接印出來；新規則是五席以下才寫數字 */\n        n.textContent=z()?'尚有座位':'Available';",
"      if(v>lim){   /* 0928B：>5 席才改成「有剩餘位置」 */\n        /* 舊版會把「剩餘 37 個位置」直接印出來；新規則是五席以下才寫數字 */\n        n.textContent=z()?'有剩餘位置':'Seats available';",1);
R('r130 admin view',
"    if(S.adminAuthed)return;\n    if(!/^(booking|search|results|upgrade|miles_page)$/.test(String(S.view||'')))return;\n    var app=document.getElementById('app');if(!app)return;\n    var lim=+window.KGM_SEATS_SHOW_BELOW_R95||5;",
"    if(S.view==='admin')return;   /* 0928B */\n    if(!/^(booking|search|results|upgrade|miles_page)$/.test(String(S.view||'')))return;\n    var app=document.getElementById('app');if(!app)return;\n    var lim=+window.KGM_SEATS_SHOW_BELOW_R95||5;",1);
R('admin fare select',"(z()?'剩餘 ':'left ')+x.left)","(x.left>5?(z()?'有剩餘位置':'seats available'):((z()?'剩餘 ':'left ')+x.left)))",1);
R('reissue r49',"(z()?'剩餘 ':'Seats ')+E(qq.seatsLeft)","(+qq.seatsLeft>5?(z()?'有剩餘位置':'Seats available'):((z()?'剩餘 ':'Seats ')+E(qq.seatsLeft)))",1);
R('reissue H',"(zhH()?'剩餘 ':'Seats ')+eh(qq.seatsLeft)","(+qq.seatsLeft>5?(zhH()?'有剩餘位置':'Seats available'):((zhH()?'剩餘 ':'Seats ')+eh(qq.seatsLeft)))",1);
R('reissue r59',"'<dt>'+(z()?'剩餘可售':'Seats left')+'</dt><dd>'+N(r.left)+'</dd>'","'<dt>'+(z()?'剩餘可售':'Seats left')+'</dt><dd>'+(+r.left>5?(z()?'有剩餘位置':'Available'):N(r.left))+'</dd>'",1);

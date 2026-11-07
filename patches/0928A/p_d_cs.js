/* 0927D · 聯營航班增加（使用者：「聯營航班需要增加太少了（聯營航班需要是現實世界有的航班喔）」）
   全部是現實世界有的航班，時刻依 2026-09 查到的公開班表（Airportia／FlightAware 等航班資料網站）。
   加在原本那份「已查證」的聯營清單裡，不另建結構。 */
RL('cs add real','#function rebuildPartnerNetworkE(){',
"      {code:'KX9872',op:'QF439',airline:'Qantas',fr:'SYD',to:'MEL',dep:'11:45',arr:'13:20',eq:'737-800 / A330-300 varies by date',days:'SU'}\n    ];",
"      {code:'KX9872',op:'QF439',airline:'Qantas',fr:'SYD',to:'MEL',dep:'11:45',arr:'13:20',eq:'737-800 / A330-300 varies by date',days:'SU'},\n"
+"      // 0927D：新增（現實世界航班；2026-09 查證）\n"
+"      // 國泰 CX450／451 的台北⇄東京成田段（第五航權段；香港⇄台北段已在上面）、CX564／565 台北⇄大阪關西段\n"
+"      {code:'KX9876',op:'CX450',airline:'Cathay Pacific',fr:'TPE',to:'NRT',dep:'13:00',arr:'17:15',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9877',op:'CX451',airline:'Cathay Pacific',fr:'NRT',to:'TPE',dep:'15:45',arr:'18:25',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9878',op:'CX564',airline:'Cathay Pacific',fr:'TPE',to:'KIX',dep:'11:05',arr:'14:55',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9879',op:'CX565',airline:'Cathay Pacific',fr:'KIX',to:'TPE',dep:'16:20',arr:'18:15',eq:'Aircraft varies by date'},\n"
+"      // 馬來西亞航空（寰宇一家）台北⇄吉隆坡：MH367 每日、MH366 週四不飛\n"
+"      {code:'KX9880',op:'MH367',airline:'Malaysia Airlines',fr:'TPE',to:'KUL',dep:'15:10',arr:'20:00',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9889',op:'MH366',airline:'Malaysia Airlines',fr:'KUL',to:'TPE',dep:'09:15',arr:'14:10',eq:'Aircraft varies by date',days:'MTWFSSU'},\n"
+"      // 澳航國內線（接 KGM 雪梨／墨爾本／布里斯本）：QF400／401 雪梨⇄墨爾本、QF500／501 雪梨⇄布里斯本（QF500 週二不飛）\n"
+"      {code:'KX9890',op:'QF401',airline:'Qantas',fr:'SYD',to:'MEL',dep:'06:00',arr:'07:35',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9891',op:'QF400',airline:'Qantas',fr:'MEL',to:'SYD',dep:'05:45',arr:'07:10',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9892',op:'QF500',airline:'Qantas',fr:'SYD',to:'BNE',dep:'06:00',arr:'07:35',eq:'Aircraft varies by date',days:'MWTHFSSU'},\n"
+"      {code:'KX9893',op:'QF501',airline:'Qantas',fr:'BNE',to:'SYD',dep:'06:00',arr:'07:45',eq:'Aircraft varies by date'},\n"
+"      // 美國航空 AA1／AA2 紐約甘迺迪⇄洛杉磯（接 KGM 洛杉磯）\n"
+"      {code:'KX9894',op:'AA2',airline:'American Airlines',fr:'LAX',to:'JFK',dep:'07:05',arr:'15:39',eq:'Aircraft varies by date'},\n"
+"      {code:'KX9895',op:'AA1',airline:'American Airlines',fr:'JFK',to:'LAX',dep:'09:15',arr:'12:12',eq:'Aircraft varies by date'}\n"
+"    ];",1);

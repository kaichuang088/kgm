/* 0928B · 後台航班狀態照季節時刻（使用者：「從後台的 Flight Status 看，夏季班表和冬季都一樣欸」）
   這張表直接印 FLIGHTS 的基準列（夏季時刻），沒有經過季節表：KX240 冬季 01:05 起飛，11/15 查出來卻是 18:45。
   改成每一列先換成「該日期所屬季節」的時刻再顯示；編輯框的抵達日偏移預設值也照季節。 */
R('status season rows',
"      }else srchF.push(f);\n    });\n    const editKey=S.adEditKey;\n",
"      }else srchF.push(f);\n    });\n    /* 0928B：換成該日所屬季節的時刻 */\n    for(var _si928=0;_si928<srchF.length;_si928++){try{if(window.kgmSeasonFlightR48)srchF[_si928]=window.kgmSeasonFlightR48(srchF[_si928],qdate)||srchF[_si928]}catch(_){}}\n    const editKey=S.adEditKey;\n",1);
R('status edit dd season',
"var _f=[].concat(FLIGHTS,(S.customFlights||[])).find(function(x){return x.code===_c;});_v=_f?(_f.dd||0):0;}",
"var _f=[].concat(FLIGHTS,(S.customFlights||[])).find(function(x){return x.code===_c;});try{var _d928=(editKey||'').split('_').pop();if(_f&&window.kgmSeasonFlightR48&&/^\\d{4}-\\d\\d-\\d\\d$/.test(_d928))_f=window.kgmSeasonFlightR48(_f,_d928)||_f}catch(_){}_v=_f?(_f.dd||0):0;}",1);

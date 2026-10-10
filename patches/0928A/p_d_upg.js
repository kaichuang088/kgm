/* 0927D · 艙位升等不顯示已起飛的航班（使用者：「艙位升等不能顯示已經過去的航班」） */
R('upg departed fn',
"function z0920(){try{return LANG!=='en'}catch(_){return true}}\nvar _upgradeView_before0815=upgradeView;",
"function z0920(){try{return LANG!=='en'}catch(_){return true}}\n/* 0927D：已起飛（起飛站當地起飛時間已過）的航段不列在升等中心 —— 日期比今天早一定算；今天的班看實際起飛時間 */\nfunction departed0927D(f){\n  try{\n    if(!f||!f.date)return false;\n    var t=todayISO();if(f.date<t)return true;if(f.date>t)return false;\n    var dep=(typeof _fUTC==='function')?_fUTC(f,f.date,'dep'):NaN;\n    return isFinite(dep)&&dep<=Date.now()/60000;\n  }catch(_){return false}\n}\nwindow.kgmDepartedR927D=departed0927D;\nvar _upgradeView_before0815=upgradeView;");
R('upg list filter',
"var info=bookingSegInfo0813(b,seg),ops=upgradeOptions0815(b,seg);if(!info||!ops.length)return;var f=info.f;",
"var info=bookingSegInfo0813(b,seg),ops=upgradeOptions0815(b,seg);if(!info||!ops.length)return;var f=info.f;if(departed0927D(f))return;/* 0927D：已起飛不列 */");
RL('upg r173 filter','kgm-0905c-r173',
"        var f=x.f;if(!f||!f.date||f.date<T())return;",
"        var f=x.f;if(!f||!f.date||f.date<T())return;\n        try{if(window.kgmDepartedR927D&&window.kgmDepartedR927D(f))return}catch(_){}   /* 0927D：今天已起飛的也不列 */");

/* 0928A · 台北⇄峇里島（DPS）班表微調（使用者指定）
   (夏) KX240 TPE→DPS 18:45–23:45 B78X　　(夏) KX239 DPS→TPE 07:20–12:30（隔天早上飛回，不跨日）B78X
   (冬) KX240 TPE→DPS 01:05–05:55 A21N/B78X　(冬) KX239 DPS→TPE 07:35–12:50 A21N/B78X（落地後直接飛回）
   峇里島安寧日（Nyepi）機場關閉：2027-03-08、2028-02-26 當天這兩班取消。 */
R('dps base 240','["KX240","TPE","DPS","19:00","23:40","B78X","daily",null,0],','["KX240","TPE","DPS","18:45","23:45","B78X","daily",null,0],',1);
R('dps base 239','["KX239","DPS","TPE","12:35","17:25","B78X","daily",null,0],','["KX239","DPS","TPE","07:20","12:30","B78X","daily",null,0],',1);
/* 指定日期停飛（航班上的 noOpDatesR928 清單），在最底層的 flyOn 判斷，所有頁面一致 */
R('flyOn noop dates',
'  if(typeof S!=="undefined"&&S.flightDisabled&&S.flightDisabled[f.code+"_"+f.fr+"_"+f.to])return false;// 已移除(停飛)',
'  if(typeof S!=="undefined"&&S.flightDisabled&&S.flightDisabled[f.code+"_"+f.fr+"_"+f.to])return false;// 已移除(停飛)\n  if(f.noOpDatesR928&&f.noOpDatesR928.length){const _ds928=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(f.noOpDatesR928.indexOf(_ds928)>=0)return false;}// 0928A：指定日期停飛（例：峇里島安寧日）',1);
/* 季節班表：跟 KX52／KX51 雪梨延伸段同一個寫法，明確寫出夏／冬；標成人工排定（seededR57:0），其他層不再自動位移 */
RL('dps season','kgm-0823p-r77',
"      if(f&&window.kgmClearDerivedOverridesR57){window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}\n    });\n  }catch(_){}",
"      if(f&&window.kgmClearDerivedOverridesR57){window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}\n    });\n  }catch(_){}\n  /* 0928A：台北⇄峇里島（使用者指定時刻）＋安寧日停飛 */\n  try{\n    var dps928={\n      'KX240|TPE|DPS':{summer:['18:45','23:45',0,'daily','B78X'],winter:['01:05','05:55',0,'daily','A21N']},\n      'KX239|DPS|TPE':{summer:['07:20','12:30',0,'daily','B78X'],winter:['07:35','12:50',0,'daily','A21N']}\n    };\n    Object.keys(dps928).forEach(function(k){\n      var old=S.seasonSchedulesR48[k];if(old&&old.userR928A)return;\n      var v=dps928[k];function rec(a){return {dep:a[0],arr:a[1],dd:a[2],days:a[3],acft:a[4]}}\n      S.seasonSchedulesR48[k]={summer:rec(v.summer),winter:rec(v.winter),seededR57:0,winterBlockR68:0,pinnedR179:1,userR928A:1,updatedAt:new Date().toISOString()};\n      var f=allF().filter(function(x){return x&&!x.via&&[x.code,x.fr,x.to].join('|')===k})[0];\n      if(f&&window.kgmClearDerivedOverridesR57){window.kgmClearDerivedOverridesR57(f,'summer');window.kgmClearDerivedOverridesR57(f,'winter')}\n    });\n    /* 換季當天：夏季最後一班 KX240（前一晚 18:45）與冬季第一班 KX240（當天 01:05）會在同一個早上一起落地，只有一班 KX239 回來 → 多一架困在峇里島；\n       換回夏季那天，夏季第一班 KX239（07:20）前一晚沒有飛機飛進來。所以冬季第一天不飛 KX240、夏季第一天不飛 KX239。 */\n    var nyepi928=['2027-03-08','2028-02-26'];\n    allF().forEach(function(f){if(!f||f.partner||!(f.fr==='DPS'||f.to==='DPS'))return;\n      if(f.code==='KX240')f.noOpDatesR928=nyepi928.concat(['2026-10-25','2027-10-31']);\n      if(f.code==='KX239')f.noOpDatesR928=nyepi928.concat(['2027-03-28','2028-03-26']);});\n  }catch(_){}",1);
/* 冬季 A21N／B78X 兩種機型輪流（跟 KX136／KX135 同一套：台北出發那段依日期輪替，回程跟著把飛機帶進來的那段）；夏季只有 B78X */
RL('dps mixed','kgm-0905a-r136',
"              'KX168|TPE|HND':['A21N','B78X'],'KX167|HND|TPE':['A21N','B78X']};",
"              'KX168|TPE|HND':['A21N','B78X'],'KX167|HND|TPE':['A21N','B78X'],\n              'KX240|TPE|DPS':['A21N','B78X'],'KX239|DPS|TPE':['A21N','B78X']};\n/* 0928A：只在某一季兩種機型共飛的航線（其餘季節照時刻表單一機型） */\nvar MIXSEA928={'KX240|TPE|DPS':'winter','KX239|DPS|TPE':'winter'};",1);
RL('dps mixed season','kgm-0905a-r136',
"          if(p[0]===code&&(!fr||p[1]===fr)&&(!to||p[2]===to)){l=MIXED136[k];break}",
"          if(p[0]===code&&(!fr||p[1]===fr)&&(!to||p[2]===to)){l=MIXED136[k];\n            if(MIXSEA928[k]){var sea928='';try{sea928=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){}if(sea928!==MIXSEA928[k])l=[]}\n            break}",1);
RL('dps label skip','kgm-0905a-r136',
"      var m=MIXED136[key(f)];if(!m)return;",
"      var m=MIXED136[key(f)];if(!m)return;\n      if(MIXSEA928[key(f)]){if(!f.mixedTypesR136){f.mixedTypesR136=m.slice();n++}return}   /* 0928A：只有冬季共飛 —— 標成「公告就是兩種機型」（每日異動不算換機），但不掛固定的機型標籤，機型欄照當天實際機型 */",1);

/* 0927D · 無機可派（使用者：「無機可派 255 這是問題一定要解決的，照理來說這要是 0，雖然寫 255 在輪轉檢查
   但是卻在每日異動班表寫 0？記得喔，有調換飛機一定要提前 7 日通知。」）
   ① 舊的「AI 排整機隊一週」／「立即補排 X 機隊」走的是 r72 之前的舊排班器（aiFleetWeek → _fleetAssignV3），
      會把 r72 輪轉的機身指派整批洗掉：實測按一下之後 107,232 段裡 105,474 段無機可派，而且不會自己恢復。
      改成一律交給現行的輪轉重排（起飛前 30 天內不動，所以不會有 7 天內的換機），同一次點擊只跑一次。 */
RL('aiweek delegate','#var _aiFleetWeek0817_balance=aiFleetWeek;',
"var _aiFleetWeek0817_balance=aiFleetWeek;aiFleetWeek=function(tp){var r=_aiFleetWeek0817_balance(tp);",
"var _aiFleetWeek0817_balance=aiFleetWeek;aiFleetWeek=function(tp){if(typeof window.kgmRebuildRotationFromLockR922==='function'&&typeof window.kgmRebuildFleetR72==='function'){/* 0927D：舊排班器會洗掉現行輪轉；改交給現行輪轉重排（30 天內不動），同一次點擊只跑一次 */if(window.__aiWeekBusy927D)return null;window.__aiWeekBusy927D=1;setTimeout(function(){window.__aiWeekBusy927D=0},0);return window.kgmRebuildRotationFromLockR922();}var r=_aiFleetWeek0817_balance(tp);",1);
/* ② 重排之後，把還沒派到的航段用現有的補洞程式補上（只動 30 天之後的日子） */
RL('rebuild then fill','kgm-0909E-r229',
"    var r=window.kgmRebuildFleetR72(start,366-lock,true);\n    var seam=window.kgmRotSeamR922();",
"    /* 0927D：r72 重排會把「重排起點之前」的輪轉整段清掉（它原本只給從今天起的整年重排用），\n       從第 30 天起重排時，已定案的 30 天（含松山固定班）會被洗掉 —— 實測今天 323 班只剩 26 班有機身。\n       重排前先把今天～起點前一天的輪轉原樣存下來，重排完再原樣放回，鎖定期一段都不動。 */\n    var T927D=T9,keep927D={};\n    try{Object.keys(S.tailAssign||{}).forEach(function(tl){keep927D[tl]=(S.tailAssign[tl]||[]).filter(function(x){return x&&x.date>=T927D&&x.date<start}).map(function(x){return Object.assign({},x)})})}catch(_){}\n    /* 0927D：從第 30 天才開始排，飛機在第 30 天的位置是憑空假設的（實測接縫 13～43 架接不起來），背景的輪轉修補層還會一直改它，\n       最後每天有二十幾段沒有機身。改成跟開站時一樣從今天排整年（這條路實測 0 段無機可派），再把鎖定期原樣放回。 */\n    var r=window.kgmRebuildFleetR72(null,366,true);\n    try{Object.keys(S.tailAssign||{}).forEach(function(tl){S.tailAssign[tl]=(S.tailAssign[tl]||[]).filter(function(x){return !(x&&x.date>=T927D&&x.date<start)})});\n      Object.keys(keep927D).forEach(function(tl){if(!keep927D[tl].length)return;S.tailAssign[tl]=keep927D[tl].concat(S.tailAssign[tl]||[]).sort(function(a,b){return String(a.date).localeCompare(String(b.date))||String(a.dep||'').localeCompare(String(b.dep||''))})});\n      if(typeof window.kgmClearRotationCacheR72==='function')window.kgmClearRotationCacheR72()}catch(_){}\n    /* 0927D：重排後還有無機可派的，用 r135 的補洞程式補（範圍就是 30 天之後），補完讓輪轉檢查重新量 */\n    try{var g927D=window.kgmCoverGapsR135(false);if(g927D.missing&&g927D.missing<=300)window.kgmCoverGapsR135(true)}catch(_){}\n    try{window.KGM_COVER_CACHE_R914=null}catch(_){}\n    var seam=window.kgmRotSeamR922();",1);
/* ③ 兩邊講的是同一件事，但範圍不同：輪轉檢查量的是「30 天鎖定之後一整年」，每日異動只看「選的那一天」（預設今天）。
     補上「哪幾天」讓兩邊對得起來。 */
RL('gaps by date','kgm-0904a-r135',
"  out.missing=miss.length;\n  if(!miss.length)return out;",
"  out.missing=miss.length;\n  /* 0927D：記下是哪幾天（輪轉檢查／每日異動共用） */\n  var bd927D={};miss.forEach(function(m){bd927D[m.date]=(bd927D[m.date]||0)+1});out.byDate927D=bd927D;\n  if(!miss.length)return out;",1);
RL('live cover dates','kgm-0904a-r135',
"  return {expected:r.expected,missing:r.missing,skipped:r.skipped};",
"  return {expected:r.expected,missing:r.missing,skipped:r.skipped,window:r.window,byDate927D:r.byDate927D||{}};",1);
RL('strip first date','kgm-0823o-r72',
"    {k:zz()?'無機可派':'Uncovered',v:String(orphan),ok:orphan===0}",
"    {k:zz()?'無機可派':'Uncovered',v:String(orphan)+(function(){\n      /* 0927D：寫出最早是哪一天（每日異動選那一天就看得到同一批航段） */\n      try{var c=window.KGM_COVER_CACHE_R914,bd=c&&c.v&&c.v.byDate927D;if(!orphan||!bd)return '';\n        var ds=Object.keys(bd).sort();if(!ds.length)return '';\n        return zz()?('（最早 '+ds[0]+'，共 '+ds.length+' 天）'):(' (from '+ds[0]+', '+ds.length+' days)')}catch(_){return ''}})(),ok:orphan===0}",1);
RL('daily year total','kgm-0823p-r78',
"    +'<div class=\"k78-sum\">'\n      +'<span>'+(z()?'換機 ':'Swaps ')+sub.length+'</span>'",
"    +(function(){\n      /* 0927D：跟輪轉檢查同一個數字（同一份量測）；有的話列出日期，點了就切到那一天 */\n      try{var c=window.KGM_COVER_CACHE_R914,v=c&&c.v;if(!v||v.expected==null)return '';\n        var bd=v.byDate927D||{},ds=Object.keys(bd).sort();\n        if(!v.missing)return '<div class=\"k78-blk ok\"><b>'+(z()?('輪轉檢查：鎖定期之後一整年 0 段無機可派（'+E(v.window||'')+'）'):('Rotation check: 0 uncovered legs ('+E(v.window||'')+')'))+'</b></div>';\n        return '<div class=\"k78-blk bad\"><b>'+(z()?('輪轉檢查：一整年共 '+v.missing+' 段無機可派，分布在 '+ds.length+' 天（這裡一次看一天）'):(v.missing+' uncovered legs over '+ds.length+' days'))+'</b>'\n          +'<div class=\"k78-chips\">'+ds.slice(0,24).map(function(d){return '<span role=\"button\" style=\"cursor:pointer\" onclick=\"kgmChgDateR78(\\''+A(d)+'\\')\">'+E(d)+'<i>'+bd[d]+'</i></span>'}).join('')+(ds.length>24?'<span class=\"k78-more\">…</span>':'')+'</div></div>';\n      }catch(_){return ''}\n    })()\n    +'<div class=\"k78-sum\">'\n      +'<span>'+(z()?'換機 ':'Swaps ')+sub.length+'</span>'",1);
/* ⑤ 真正把「AI 排整機隊一週」變成十萬段無機可派的，是 r43（最早期的輪轉層）：它掛在 aiFleetWeek／doGenSimPax 等舊函式後面，
     4 秒後把它自己那一份舊輪轉整份蓋回 S.tailAssign（每天少二十幾段、鎖定期也被換掉）。
     現在的輪轉唯一來源是 r72，所以有 r72 時 r43 不再蓋回（開站時的第一次建置不受影響）。 */
RL('r43 no overwrite','kgm-0817b-r43',
"    try{SNAP43=null;rebuilds43=0;built43=false;ensureRotationsR43(true)}catch(_){}",
"    if(typeof window.kgmRebuildFleetR72==='function')return;   /* 0927D：r72 是唯一來源，不再用 r43 的舊輪轉蓋回 */\n    try{SNAP43=null;rebuilds43=0;built43=false;ensureRotationsR43(true)}catch(_){}",1);

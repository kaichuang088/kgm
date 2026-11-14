/* 0928B · 機隊班表均勻（使用者：「為什麼有的 B779 有 1131 個班表有的卻只有 439？這就是不平均」）
   B779 每架從輪轉分派拿到的都差不多（約 422 段）；差距全部來自「覆蓋補救」—— 別的機型派不到的航段
   （主要是 A339L 缺機、改由 B779 代飛）會找「第一架放得下的」，於是 B-58001、58002… 各多出 500 段上下。
   改成：同一個機型裡，挑放得下而且目前班最少的那一架。 */
RL('recovery least loaded','kgm-0823o-r72',
"          return (tailsFor(t)||[]).some(function(tail){if((S.tsaFleet||{})[tail]||(S.tsaExchangePool||[]).indexOf(tail)>=0)return false;\n            initTail(tail);\n            if(!canFit(tail,block))return false;pick=tail;pickType=t;return true;\n          });",
"          var best928=null,bestN928=1e9;\n          (tailsFor(t)||[]).forEach(function(tail){if((S.tsaFleet||{})[tail]||(S.tsaExchangePool||[]).indexOf(tail)>=0)return;\n            initTail(tail);\n            if(!canFit(tail,block))return;var n928=(S.tailAssign[tail]||[]).length;if(n928<bestN928){bestN928=n928;best928=tail}\n          });\n          if(best928){pick=best928;pickType=t;return true}\n          return false;",1);
/* A339L／A35K 的備用機也一起輪流飛（使用者：「機隊分配班表要均勻」）。
   原本只有 B779 備用機輪流（0927D）；A339L 備用機 B-58931 不在輪轉裡，一年 996 段全部是「覆蓋補救」塞進去的，
   其他 12 架各約 1,450 段。A339L 本來就缺機，讓它正常輪流比只拿來補洞合理。 */
RL('reserve rotate all','kgm-0823o-r72',
"var ROTATE_RESERVE_R927D={B779:1};",
"var ROTATE_RESERVE_R927D={B779:1,A339L:1,A35K:1};   /* 0928B：A339L、A35K 備用機也一起輪流 */",1);

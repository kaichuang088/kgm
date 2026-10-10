/* 0928B · 多段班配對第二輪：第一輪（每班後段給最近落地的前段）之後，還沒配到的前段（多在換季當天，兩個前段搶一個後段），
   改接「3 天內最早、還沒有人接的後段」。0928A 只有第一輪，換季那天會多出一架前段飛機落在中停站、改用調機回台北
   （實測今天起一年 59 次拆段，其中 16 次就是這樣來的；0927C 是 47 次）。 */
RL('pair second pass','kgm-0823o-r72',
"          if(pick){used.add(pick);map.set(pick,s)}\n        });\n        PAIR928[code]=map;",
"          if(pick){used.add(pick);map.set(pick,s)}\n        });\n        /* 0928B：第二輪 */\n        var taken928=new Set();map.forEach(function(v){taken928.add(v)});\n        fronts.forEach(function(y){\n          if(used.has(y))return;\n          for(var j=0;j<secs.length;j++){var s3=secs[j];\n            if(taken928.has(s3)||s3.c.fr!==y.f.to)continue;\n            if(s3.dep<y.arrAbs+75)continue;\n            if(s3.dep>y.arrAbs+3*1440)break;\n            taken928.add(s3);used.add(y);map.set(y,s3);break}\n        });\n        PAIR928[code]=map;",1);

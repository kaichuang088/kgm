/* 0927D · 機隊：B779 備用機跟營運機輪流飛（使用者回答：「營運機輪流飛」）
   0927C 修好調機之後，B779 3 架備用登記（B-58911～913）不必再飛首爾空機，60 天內閒置 23～29 天。
   改成：B779 備用登記一起進入輪轉與月平均分派，空檔平均分給 44 架，不再固定由 3 架閒置。
   A35K（B-58921）、A339L（B-58931）的備用機沒有 7 天以上空白，這一輪不動。 */
RL('fleet reserve rotate var','kgm-0823o-r72',
"Object.keys(RESERVE72).forEach(function(t){RESERVE72[t].forEach(function(r){RESERVE_TYPE72[r]=t})});",
"Object.keys(RESERVE72).forEach(function(t){RESERVE72[t].forEach(function(r){RESERVE_TYPE72[r]=t})});\nvar ROTATE_RESERVE_R927D={B779:1};   /* 0927D：這些機型的備用登記跟營運機一起輪流飛 */\nwindow.KGM_ROTATE_RESERVE_R927D=ROTATE_RESERVE_R927D;");
RL('fleet reserve rotate live','kgm-0823o-r72',
"  var live=tails.filter(function(t){return !mxSet[t]&&!RESERVE_TYPE72[t]});",
"  var live=tails.filter(function(t){return !mxSet[t]&&!(RESERVE_TYPE72[t]&&!ROTATE_RESERVE_R927D[RESERVE_TYPE72[t]])});   /* 0927D：B779 備用機一起輪流 */");

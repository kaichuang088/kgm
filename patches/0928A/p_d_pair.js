/* 0928A · 外站落地後直接飛回（r72 輪轉產生器） */
const SNIPPAIR=require('fs').readFileSync(require('path').join(__dirname,'snip_pair.js'),'utf8');
RL('pair fn','kgm-0823o-r72',
"  function nextLegOf(x){\n    if(x._nx!==undefined)return x._nx;\n    x._nx=null;\n    if(!isFirst72(x.f))return null;",
SNIPPAIR+"  function nextLegOf(x){\n    if(x._nx!==undefined)return x._nx;\n    x._nx=null;\n    if(!isFirst72(x.f))return null;\n    var pr928=pair928(x);if(pr928!==undefined){x._nx=pr928;return pr928}   /* 0928A：依時間配對 */",1);
/* 外站一般往返：飛對號航班進來的飛機裡，原本挑「等最久的」，於是只要外站多停一架，之後每一架都要多等一輪
   （實測 ONT、LHR、AMS、CHC、AKL、SFO、MUC、ICN… 一年 2,000 多次「落地後等一天、同型機的回程卻給了別架」）。
   改成挑「剛落地、來得及轉機」的那一架。代價：外站多出來的那架不再輪流等，而是等超過 6 天由既有的切段調機送回台北，
   一年空機調機 114 → 486 段（大多是日本線 A21N／B78X／EQV 混合航線，兩種機型每天進出數不相等）。照實列在 notes。 */
RL('mate newest','kgm-0823o-r72',
"        if(!mate||pos[mate].since>st.since)mate=tl;",
"        if(!mate||(LIFO928?pos[mate].since<st.since:pos[mate].since>st.since))mate=tl;   /* 0928A：剛飛進來的那架直接飛回 */",1);
RL('mate newest flag','kgm-0823o-r72',
"  var PAIR928={},BASE928=",
"  var LIFO928=true;   /* 0928A：全機型「剛到的先回」（實測比較見 notes：A21N／B78X 例外反而更糟）*/\n  var PAIR928={},BASE928=",1);

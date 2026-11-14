/* 0928A · 後台新增／退役飛機 */
const SNIPF928=require('fs').readFileSync(require('path').join(__dirname,'snip_fleet928.js'),'utf8').replace(/\n$/,'');
RL('fleet add r203','kgm-0907C-r203',"window.KGM_EXTRA_TAILS_R203=EXTRA203;",SNIPF928,1);
/* r72：「這一天這架能不能排」原本只看松山派駐（tsaBusy72，第一輪、分派勤務、覆蓋補救都用它）。
   加上：退役日（含）之後不能排、新增飛機投入日之前不能排 —— 每次重排（含開站時）都照這個日期走，退役前的班不會被動到。 */
RL('fleet unavailable','kgm-0823o-r72',
"function tsaBusy72(tail,date){\n  try{",
"function tsaBusy72(tail,date){\n  try{if(window.kgmTailUnavailR928&&window.kgmTailUnavailR928(tail,date))return true}catch(_){}   /* 0928A：退役／尚未投入 */\n  try{",1);
/* r135 補洞程式也照同一個規則 */
RL('fleet unavailable r135','kgm-0904a-r135',
"      if((S.tsaFleet||{})[t])return;",
"      if((S.tsaFleet||{})[t])return;\n      if(window.kgmTailUnavailR928&&window.kgmTailUnavailR928(t,m.date))return;   /* 0928A：退役／尚未投入 */",1);
const SNIPFUI928=require('fs').readFileSync(require('path').join(__dirname,'snip_fleetui928.js'),'utf8');
RL('fleet ui fn','kgm-0823l-r69',"function page69(){",SNIPFUI928+"function page69(){",1);
RL('fleet ui mount','kgm-0823l-r69',"    +enquiry69()+status69()+calendar69()","    +fleetMgmt928()+enquiry69()+status69()+calendar69()",1);
/* 每一架的狀態卡上寫出機齡與是否退役 */
RL('fleet status age','kgm-0823l-r69',
"    +'<h3>'+E(tail)+'・'+(z()?'飛機狀態':'Aircraft status')+'</h3>'",
"    +'<h3>'+E(tail)+'・'+(z()?'飛機狀態':'Aircraft status')+(function(){try{var a=window.kgmTailAgeR928(tail),rt=(S.fleetRetiredR928||{})[tail];return '<small class=\"k928-tage\">　'+(z()?'機齡 ':'Age ')+E(a.text)+(a.simulated?(z()?'（模擬）':' (sim.)'):(a.acq==='lease'?(z()?'・租賃':' · leased'):(z()?'・購買':' · purchased')))+(rt?((z()?'・自 ':' · retired from ')+E(rt.from)+(z()?' 退役':'')):'')+'</small>'}catch(_){return ''}})()+'</h3>'",1);

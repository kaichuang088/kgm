/* 0927C · 全站動畫：放在最外層 r229（不新增層），樣式在執行時注入 <style id="kgm-motion-927c"> */
const SNIPM927C=require('fs').readFileSync(require('path').join(__dirname,'snip_motion.js'),'utf8');
RL('motion','kgm-0909E-r229',
"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}",
SNIPM927C+"try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}");

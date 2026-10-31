
/* ══ 1101A：季節性 Payload 限座＝鎖經濟艙最後幾排（使用者：「Payload 有影響少賣的座位要在選位系統整個季節所有日期調整」＋實務說明：
   「以排為單位鎖死，而非零散鎖位……直接把經濟艙最後面的 3–4 排整區完全鎖住」）。
   少賣席數照舊讀 kgmPaxCapR1025B（最外層含後台人工調整）；鎖幾排＝少賣席數 ÷ 每排座位數（無條件進位），從經濟艙最後一排往前。
   選位圖（seatView）、真實訂位自動劃位（autoAssignSeat 0814）、模擬旅客座位（simManifest 1018A）三個地方都用這一份。 ══ */
(function(){
  var C=new Map();
  function sprOf(type){try{var e=((AC[type]||{}).cabins||{}).econ;if(!e||!e.lay)return 0;return e.lay.filter(function(c){return c!=='|'}).length}catch(_){return 0}}
  /* f：航班（或航段）物件；回傳 {seats:少賣席數, rows:鎖幾排, spr:每排座位數} */
  window.kgmPlBlockRowsR1101A=function(f,date,type){try{
    if(!f||!date||f.partner||f.codeshare)return {seats:0,rows:0,spr:0};
    var ty=type||f.acft;try{ty=type||acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){}
    var k=f.code+'|'+f.fr+'|'+f.to+'|'+date+'|'+ty,v=C.get(k);if(v&&Date.now()-v.t<20000)return v.r;
    var c=null;try{c=window.kgmPaxCapR1025B?window.kgmPaxCapR1025B(f,date):null}catch(_){c=null}
    var b=c&&+c.blocked>0?+c.blocked:0,spr=sprOf(ty)||10,r={seats:b,rows:b?Math.ceil(b/spr):0,spr:spr,type:ty};
    if(C.size>4000)C.clear();C.set(k,{t:Date.now(),r:r});return r}catch(_){return {seats:0,rows:0,spr:0}}};
  /* 經濟艙座位號清單（已依前→後排序或任意）→ 最後 rows 排的座位號 */
  window.kgmPlBlockedIdsR1101A=function(f,date,ids){var out={};try{var B=window.kgmPlBlockRowsR1101A(f,date);if(!B.rows||!ids||!ids.length)return out;
    var rows=[];ids.forEach(function(s){var n=parseInt(String(s),10);if(!isNaN(n)&&rows.indexOf(n)<0)rows.push(n)});rows.sort(function(a,b){return a-b});
    var cut=rows.slice(Math.max(0,rows.length-B.rows));ids.forEach(function(s){if(cut.indexOf(parseInt(String(s),10))>=0)out[s]=1})}catch(_){}return out};
  try{var cs=document.createElement('style');cs.id='k28pl-css';cs.textContent=
    '.seat.k28-plblk{background:repeating-linear-gradient(135deg,#EEF1EF 0 4px,#E1E6E3 4px 8px)!important;border-color:#CBD3CE!important;color:transparent!important;cursor:not-allowed}'
   +'.k28pl-chips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}.k28pl-chips button{border:1px solid #DCE5E0;background:#fff;border-radius:999px;padding:6px 12px;font:600 12.5px system-ui,sans-serif;color:#33443C;cursor:pointer}.k28pl-chips button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}.k28pl-chips i{font-style:normal;opacity:.65;margin-left:2px}'
   +'tr.k28pl-g td{background:#F4F1E8!important;padding:10px 14px!important;border-top:2px solid #E3DAC3}tr.k28pl-g b{font-size:14px;color:#0F2A21}tr.k28pl-g code{font:700 11px ui-monospace,monospace;color:#9A7B2F;margin-left:4px}tr.k28pl-g span{float:right;font-size:11.5px;color:#6B5A2E}'
   +'.k28-pl-div{display:flex;align-items:center;gap:8px;margin:6px 0 4px;font:700 10.5px system-ui,sans-serif;color:#6B5A2E;letter-spacing:.04em}.k28-pl-div span{flex:1;height:1px;background:#D9CBA6}.k28-pl-div b{white-space:nowrap}';
    document.head.appendChild(cs)}catch(_){}
})();

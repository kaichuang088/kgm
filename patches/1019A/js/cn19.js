/* 1019A：轉機票價兩段都要賣得到（使用者：「轉機票價…這是舊問題，要不要修？要」）
   原本轉機卡取兩段 validCodes 的交集（同一個代號剛好兩段都是「第一個還能賣的」才算），交集空了就退回只看第一段 →
   第二段那個方案已經賣完、或第二段最便宜的階比第一段高時，照樣用第一段的代號整段賣出去。
   改成逐方案：兩段各自第一個能賣的代號取較貴的那一階，再往上找到兩段都還有 pax 個位子的代號；
   找不到，這個方案就不賣（訂票頁由 kgmSoldFamR1018B 補「售完」卡）。轉機卡、轉機列的「去程起」、選票（第二段代號）都讀這一份。
   夥伴營運的那一段（f.partner）座位不在我們的庫存裡（kgmInventory49 一律 0、validCodes 列出整個方案每一階）→ 那一段不查座位，方案取最便宜那一階。 */
window.kgmConnCodesR1019A=function(f1,f2,pax){
  var out=[];
  try{
    if(!f1||!f2)return out;
    pax=Math.max(1,+pax||+((S.search||{}).pax)||1);
    var inv=window.kgmInventory49,d1=f1.date||(S.search&&S.search.dep)||todayISO(),d2=f2.date||d1;
    function first(f){var m={},ord=[];(validCodes(f)||[]).forEach(function(k){if(k==='R')return;var fi=FARES[k]||{},key=(fi.cabin||'Economy')+'|'+(fi.familyR48||'');if(!fi.familyR48||m[key])return;m[key]=k;ord.push(key)});return {m:m,ord:ord}}
    function ok(f,c,d){if(f.partner)return true;if(typeof inv!=='function')return (validCodes(f)||[]).indexOf(c)>=0;return (+inv(c,d,f)||0)>=pax}
    var A=first(f1),B=first(f2);
    A.ord.forEach(function(key){
      var a=A.m[key],b=B.m[key];if(!b)return;   /* 第二段這個方案已經沒得賣 */
      var cab=key.split('|')[0],fm=key.split('|')[1];
      var lad=((typeof CAB_CODES==='function'?CAB_CODES(cab):[])||[]).filter(function(x){return (FARES[x]||{}).familyR48===fm});
      var i=Math.max(lad.indexOf(a),lad.indexOf(b));if(i<0)return;
      for(;i<lad.length;i++){var c=lad[i];if(ok(f1,c,d1)&&ok(f2,c,d2)){out.push(c);return}}
    });
  }catch(_){}
  return out;
};

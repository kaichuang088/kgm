/* 1018B：票價方案「售完」也要列出來（使用者：「其他倉等（基本超值）顯示出來但是寫售完按不下去」）。
   r54 的 validCodes 對每個方案只取第一個還能賣的代號，整個方案賣完就不列 → 訂票頁只剩豪華一張卡。
   validCodes 不動（價格「本艙最低」、AI、結帳、競標都讀它），只在訂票頁的方案面板把同艙等缺的方案補成「售完」卡：
   回傳這個艙等裡、present（目前可賣的代號）沒有涵蓋到的方案，各取該方案第一個代號。 */
window.kgmSoldFamR1018B=function(cab,present){
  try{
    var all=(typeof CAB_CODES==='function'?CAB_CODES(cab):[])||[],have={},seen={},out=[];
    (present||[]).forEach(function(c){var fm=(FARES[c]||{}).familyR48;if(fm)have[fm]=1});
    if(!Object.keys(have).length)return [];   /* 這個艙等整個沒在賣（例如短程豪經）就不補 */
    all.forEach(function(c){var fm=(FARES[c]||{}).familyR48;if(!fm||seen[fm])return;seen[fm]=1;if(!have[fm])out.push(c)});
    return out;
  }catch(_){return []}
};

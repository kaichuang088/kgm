import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='''/* 1004A · 訂票頁 Residence 出價：回程頁開啟時對到回程、送出後進下一步；備案表的售完跟票價卡同一套判斷 */
'''
R('#85 modal open inbound','''window.kgmResModalOpenR161=function(code,date){
  var s=S.search||{};
  date=date||s.dep||T();''','''window.kgmResModalOpenR161=function(code,date){
  var s=S.search||{};
  /* 1004A：使用者「Residence 送出競標確認後要往下一個航段頁面或是輸入資料頁面，而非同航段選擇航班頁面」。
     根因：在「選回程」那一頁按升等 Resident，入口一律拿去程的航線／日期、段別寫死 'out' ——
     出價送出後把去程蓋成回程的航班，回到流程又停在「選回程」。這裡依目前步驟判斷是哪一段。 */
  var inb929=(S.view==='booking'&&S.phase==='sel_inb'&&!!s.ret);
  if(inb929){
    date=s.ret;
    try{var L929=window.kgmResFlightsR161(s.to,s.fr,s.ret)||[];if(!code||!L929.some(function(x){return x.code===code}))code=L929.length?L929[0].code:null}catch(_){}
  }
  date=date||s.dep||T();''')
R('#85 modal seg','''  S.resModalR161={code:code,date:date,step:1,seg:'out',at:new Date().toISOString()};''',
'''  S.resModalR161={code:code,date:date,step:1,seg:(inb929?'inb':'out'),at:new Date().toISOString()};''')
R('#85 sold like fare cards','''function open927D(f,date,codes,c){
  try{
    var iv=(S.seatInventory||{})[f.code+'_'+date+'_'+c];
    if(iv!==undefined&&!(iv>0))return false;
    var bs=(typeof kgmBucketStateR11==='function')?kgmBucketStateR11(f.code,date,codes.indexOf(c)):{sold:false,trickle:0};''','''function open927D(f,date,codes,c){
  try{
    var iv=(S.seatInventory||{})[f.code+'_'+date+'_'+c];
    if(iv!==undefined&&!(iv>0))return false;
    /* 1004A：「第二選擇該日已經沒有 E-C 就顯示售完」—— 跟訂票頁的票價卡用同一套：先過 validCodes（營收管理當天關掉的票種不在裡面），
       艙位狀態的索引也用過濾後的清單（原本用未過濾的清單，索引會錯位，訂票頁已售完的票種這裡還能按）。 */
    var vc929=null;try{vc929=validCodes(Object.assign({},f,{date:date}))}catch(_){}
    if(vc929&&vc929.length){codes=codes.filter(function(x){return vc929.indexOf(x)>=0});if(codes.indexOf(c)<0)return false}
    var bs=(typeof kgmBucketStateR11==='function')?kgmBucketStateR11(f.code,date,codes.indexOf(c)):{sold:false,trickle:0};''')
# ── #85 根因：艙位狀態的索引被當成「搜尋艙等」的索引 ──
R('#85 bucket cab param','''  var b11=window.kgmBucketStateR11;
  window.kgmBucketStateR11=function(code,date,idx){
    try{
      var f=flightRecK(code);
      if(f&&typeof window.kgmInventory49==='function'){
        f=Object.assign({},f,{date:date});
        var cab=(S.search&&S.search.cabin)||'Economy';''','''  var b11=window.kgmBucketStateR11;
  window.kgmBucketStateR11=function(code,date,idx,cab929){
    try{
      var f=flightRecK(code);
      if(f&&typeof window.kgmInventory49==='function'){
        f=Object.assign({},f,{date:date});
        /* 1004A：idx 是「這張卡所屬艙等」清單裡的位置；原本一律拿搜尋的艙等去解讀，
           搜經濟艙時商務艙卡片的第 0 格會讀成 E-R 的狀態 —— 升等卡與 Residence 備案表的售完因此跟實際不一致。
           呼叫端現在把艙等傳進來；沒傳的舊呼叫照舊用搜尋艙等。 */
        var cab=cab929||(S.search&&S.search.cabin)||'Economy';''')
R('#85 card bucket cab','''            ? kgmBucketStateR11(f.code,(isOut?S.search.dep:S.search.ret),gc.indexOf(c))''',
'''            ? kgmBucketStateR11(f.code,(isOut?S.search.dep:S.search.ret),gc.indexOf(c),(FARES[c]||{}).cabin)''')
R('#85 staff bucket cab','''        var bs=(typeof kgmBucketStateR11==="function")?kgmBucketStateR11(f.code,date,ii):{sold:false,trickle:0};''',
'''        var bs=(typeof kgmBucketStateR11==="function")?kgmBucketStateR11(f.code,date,ii,(FARES[cc]||{}).cabin):{sold:false,trickle:0};''')
R('#85 alt bucket cab','''    var bs=(typeof kgmBucketStateR11==='function')?kgmBucketStateR11(f.code,date,codes.indexOf(c)):{sold:false,trickle:0};''',
'''    var bs=(typeof kgmBucketStateR11==='function')?kgmBucketStateR11(f.code,date,codes.indexOf(c),(FARES[c]||{}).cabin):{sold:false,trickle:0};''')
open('p_f_res.js','w').write(hdr+'\n'.join(out)+'\n')

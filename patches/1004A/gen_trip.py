import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 行程管理（前台） */
'''
# ---- #83 移除「加購服務退款」 ----
RL('trip no extras refund r217','kgm-0909B-r217',"""     +act(IC.undo,Z()?'加購服務退款':'Refund extras',
          Z()?'選位、行李與餐點等加購項目退款':'Refund seats, bags and meals',
          "tripSvcR25('"+A(pnr)+"','out','bag')",false)
""","""     /* 1004A：使用者：「行程管理移除加購服務退款」 */
""")
RL('trip no extras refund r56','kgm-0823d-r56',"""      +act('↺',Z()?'已訂購服務退款':'Refund purchased services',
           Z()?'選位、行李與餐點等加購項目退款':'Refund seats, bags and meals',
           "tripSvcR25('"+E6(pnr)+"','out','bag')",false)
""","")
# ---- #96 舊版行程管理徹底不顯示 ----
RL('trip old never shown css','kgm-0823d-r56',"':root{--k56-g:#0b493b;--k56-gold:#a77d33}',","""':root{--k56-g:#0b493b;--k56-gold:#a77d33}',
'.r25-up,.r25-h,.r25-grid,.r25-note{display:none!important}',   /* 1004A：舊版行程管理（即將到來的航班／行程服務）在任何路徑都不顯示 */""")
RL('trip paint fallback','kgm-0823d-r56',"    var b=findTripBooking6();if(!b)return;","""    var b=findTripBooking6();
    /* 1004A：舊版卡片上找不到按鈕時（例如報到已關閉），直接用目前開啟的訂位代號，不然新版不畫、舊版就露出來 */
    if(!b&&S.mtOnly)b=(S.bookings||[]).filter(function(x){return x.pnr===S.mtOnly})[0]||null;
    if(!b)return;""")
RL('trip list new','kgm-0907a-r151',"""      if(v==='manage'||v==='mytrip'){
        try{
          S.pnrModeR7='';""","""      if(v==='manage'||v==='mytrip'){
        /* 1004A：會員進「我的行程」卻沒有指定哪一筆（里程升等結果頁「回到行程」、取消訂位後返回…），
           舊的 r26 會把所有訂位用舊版卡片列出來 → 一律改走新版的行程清單 */
        try{if(v==='mytrip'&&!S.mtOnly&&S.user)S.tripsListR60=true}catch(_){}
        try{
          S.pnrModeR7='';""")

# ---- #96 姓名打錯直接「資料錯誤」、不給任何提示；姓名必填 ----
RL('trip strict name','kgm-0814d-r23',"""function nameMatches(b,first,last){
  if(!first&&!last)return true;""","""function nameMatches(b,first,last){
  /* 1004A：名、姓都要填，而且要跟訂位上的旅客完全相同（不分大小寫、空白、連字號）；原本可以留空、也接受部分相符 */
  if(!first||!last)return false;
  var F=norm(first),L=norm(last);
  return (b.paxList||[]).some(function(p){
    if(p.firstName&&p.lastName)return norm(p.firstName)===F&&norm(p.lastName)===L;
    var full=norm(p.name||p.fullName||p.engName||'');
    return !!full&&(full===F+L||full===L+F);
  });
}
function nameMatchesOld929(b,first,last){
  if(!first&&!last)return true;""")
RL('trip lookup msgs','kgm-0814d-r23',"""    var msg=({
      nostore:""","""    /* 1004A：使用者：「行程管理輸入錯名字不能提示，要直接顯示資料錯誤」—— 查不到、姓名不符一律只說「資料錯誤」，不透露訂位上的旅客姓名或本機有幾筆 */
    if(r.why!=='empty')return alert(z()?'資料錯誤':'Incorrect booking details');
    var msg=({
      nostore:""")
# ---- #96 隱私權政策：跟其他辦法一樣，要打開、滑到底、按我同意 ----
RL('trip privacy consent html','kgm-0814d-r20',"""        +'<label class="r20-agree"><input type="checkbox" id="r20Agree"><span>'
          +(z()?'我已閱讀隱私權政策，並同意依相關規定查詢此訂位。':'I have read the privacy policy and agree to look up this booking.')+'</span></label>'""","""        +(window.kgmPolicyConsentR914?('<div class="r20-agree" style="display:block">'+window.kgmPolicyConsentR914('KGM-PRV-014')+'</div>')   /* 1004A：隱私權政策改成跟其他辦法一樣：打開、滑到最下方、按「我同意」 */
          :('<label class="r20-agree"><input type="checkbox" id="r20Agree"><span>'
          +(z()?'我已閱讀隱私權政策，並同意依相關規定查詢此訂位。':'I have read the privacy policy and agree to look up this booking.')+'</span></label>'))""")
RL('trip privacy check','kgm-0814d-r23',"""  var agreed=!!(document.getElementById('r20Agree')||{}).checked;""","""  var agreed=window.kgmPolicyAgreedR914?window.kgmPolicyAgreedR914('KGM-PRV-014'):!!(document.getElementById('r20Agree')||{}).checked;   /* 1004A */
  if(!agreed&&window.kgmPolicyGateR914){S.r20Stash929={p:pnr,f:first,l:last};window.kgmPolicyGateR914(['KGM-PRV-014'],'kgmFindTripAfterPolicyR929()');return}""")
RL('trip privacy after fn','kgm-0814d-r23',"window.findTripR20=function(){","""/* 1004A：隱私權政策按「我同意」之後頁面會重畫、輸入框被清空 —— 把剛才輸入的代號與姓名放回去再查 */
window.kgmFindTripAfterPolicyR929=function(){
  var v=S.r20Stash929||{};S.r20Stash929=null;
  setTimeout(function(){
    var put=function(id,x){var e=document.getElementById(id);if(e&&x!=null)e.value=x};
    put('r20Pnr',v.p);put('r20First',v.f);put('r20Last',v.l);
    if(v.p)window.findTripR20();
  },120);
};
window.findTripR20=function(){""")
RL('trip staff wrapper after name','kgm-0909E-r229',"""          var e=document.getElementById('r20Pnr');
          var pnr=e?String(e.value||'').trim().toUpperCase():'';
          var b=pnr?bkOf(pnr):null;""","""          var e=document.getElementById('r20Pnr');
          var pnr=e?String(e.value||'').trim().toUpperCase():'';
          /* 1004A：先過隱私權政策與姓名核對，才判斷是不是員工票（原本只憑訂位代號就回「員工票未驗證」） */
          if(window.kgmPolicyAgreedR914&&!window.kgmPolicyAgreedR914('KGM-PRV-014'))return _ft.apply(this,arguments);
          if(pnr&&window.kgmLookupPnrR23){var g929=function(id){var x=document.getElementById(id);return x?String(x.value||'').trim():''};
            if(!window.kgmLookupPnrR23(pnr,g929('r20First'),g929('r20Last')).ok)return _ft.apply(this,arguments)}
          var b=pnr?bkOf(pnr):null;""")

# ---- #74／#96 行程管理：開櫃時間依長短程；顯示報到航廈與櫃檯 ----
RL('trip counter haul','kgm-0909B-r217',"""  var ctr=dom?60:180, close=dom?30:60, brd=dom?25:40;""","""  var L929=false;try{L929=!!(window.kgmHaulOfR928&&window.kgmHaulOfR928({code:s.code,fr:s.fr,to:s.to})==='L')}catch(_){}
  var ctr=dom?60:(L929?180:150), close=dom?30:60, brd=dom?25:40;   /* 1004A：長程起飛前 3 小時、短程 2.5 小時開櫃 */""")
RL('trip counter info','kgm-0909B-r217',"""         +'<div><small>'+(Z()?'櫃檯開放（建議）':'CHECK-IN OPENS')+'</small><b>'+E(t.counter)+'</b></div>'""","""         +(function(){   /* 1004A：報到航廈與櫃檯（台北出發由站內櫃檯分配決定；外站寫航廈，櫃檯依當地機場公告） */
            var c=null;try{c=window.kgmCounterOfFlightR929?window.kgmCounterOfFlightR929(s.code,s.date,s.fr):null}catch(_){}
            var tm='';try{tm=term(s.fr,s.code,s.to)||''}catch(_){}
            var tl=c&&c.term&&c.term!=='—'?c.term:tm;
            var tz=String(tl||'').replace(/^T/,'');
            var v=(Z()?((tz?('第 '+tz+' 航廈'):'')+(c&&c.counter?('　櫃檯 '+c.counter):'　櫃檯依機場公告')):((tl?('Terminal '+tz):'')+(c&&c.counter?(' · Counter '+c.counter):' · see airport screens')));
            return '<div><small>'+(Z()?'報到航廈／櫃檯':'CHECK-IN AT')+'</small><b>'+E(v)+'</b></div>';
          })()
         +'<div><small>'+(Z()?'櫃檯開放（建議）':'CHECK-IN OPENS')+'</small><b>'+E(t.counter)+'</b></div>'""")
# ---- #97 KGM＋合作航空：一家航空一個訂位代號 ----
_A97='/* ══ 0922B：競標資料 —— 每一班都要有人競標'
RL('#97 合作航空訂位代號','kgm-0909E-r229',_A97,open('partner_pnr.js',encoding='utf-8').read()+_A97)
open('p_f_trip.js','w').write(hdr+'\n'.join(out)+'\n')

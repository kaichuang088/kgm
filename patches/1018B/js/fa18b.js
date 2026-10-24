/* 1018B：票價分析（使用者：「航點搜尋哪裡出發到哪不是這種好亂 然後這個總覽不用有 也要可以用編號搜尋」「圖二要可編輯」）
   · 航線改成「出發地／目的地」兩個選單（機場代碼＋城市），可以對調；也可以直接打班號（KX182）找；航線總覽拿掉。
   · 每班艙位階梯的每一格（E-C…）執行長／定價人員點一下就能改「這一班、這一天」的：
       價格 → 寫成一筆人工調整（S.fareRulesR929，多一個 bucket＝這個代號；跟上面「人工調整」同一份，一樣可以停用／刪除），
       可售座位 → S.seatInventory「班號_日期_代號」人工值（sell54 是各代號剩幾位的唯一來源，本來就讀這一份；0＝關閉這一階）。
     「恢復系統」把這一格的兩種人工設定都拿掉。 */
function fa18bEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fa18bKey(code,d,c){return code+'_'+d+'_'+c}
function fa18bRule(code,d,c){return (S.fareRulesR929||[]).filter(function(r){return r&&!r.off&&r.bucket===c&&r.code===code&&r.from===d&&r.to===d})[0]||null}
function fa18bSeatMan(code,d,c){var k=fa18bKey(code,d,c),v=(S.seatInventory||{})[k];return (v!=null&&!(S.fareThirds0810P||{})[k])?+v:null}
/* 出發地／目的地／班號 */
function fa18bBar(q,routes,fl){
  var frs={},tos=[];Object.keys(routes).forEach(function(k){var p=k.split('-');frs[p[0]]=1;if(p[0]===q.fr)tos.push(p[1])});
  var lab=function(a){var n='';try{n=cityOf(a)}catch(_){}return a+(n&&n!==a?' '+n:'')};
  var opt=function(list,cur){return list.sort().map(function(a){return '<option value="'+fa18bEsc(a)+'"'+(a===cur?' selected':'')+'>'+fa18bEsc(lab(a))+'</option>'}).join('')};
  var back=routes[q.to+'-'+q.fr];
  return '<label>'+(z()?'出發地':'From')+'<select class="inp k4b-fa-sel" onchange="kgmFareAnaSetR1004B(\'fr\',this.value)">'+opt(Object.keys(frs),q.fr)+'</select></label>'
    +'<button class="btn btn-sm fa18b-sw" title="'+(z()?'對調':'Swap')+'"'+(back?'':' disabled')+' onclick="kgmFareAnaSetR1004B(\'route\',\''+fa18bEsc(q.to+'-'+q.fr)+'\')">⇄</button>'
    +'<label>'+(z()?'目的地':'To')+'<select class="inp k4b-fa-sel" onchange="kgmFareAnaSetR1004B(\'to\',this.value)">'+opt(tos,q.to)+'</select></label>'
    +'<label>'+(z()?'或輸入班號':'Or flight no.')+'<span class="fa18b-q"><input class="inp" id="fa18bCode" placeholder="KX182" value="'+fa18bEsc(q.code||'')+'" onkeydown="if(event.key===\'Enter\')kgmFareAnaSetR1004B(\'code\',this.value)">'
    +'<button class="btn btn-sm" onclick="kgmFareAnaSetR1004B(\'code\',document.getElementById(\'fa18bCode\').value)">'+(z()?'搜尋':'Find')+'</button>'
    +(q.code?'<button class="btn btn-sm" onclick="kgmFareAnaSetR1004B(\'code\',\'\')">'+(z()?'清除':'Clear')+'</button>':'')+'</span></label>';
}
/* 階梯格子：可以點（執行長／定價人員）、有人工設定的標出來 */
function fa18bCls(a,d,r){var c=' ';if(fa18CanEdit())c+='fa18b-ed';if(fa18bRule(a.f.code,d,r.c)||fa18bSeatMan(a.f.code,d,r.c)!=null)c+=' fa18b-man';var e=S.fa18bEdR1018B;if(e&&e.code===a.f.code&&e.d===d&&e.c===r.c)c+=' fa18b-on';return c}
function fa18bOn(a,d,r){return fa18CanEdit()?' onclick="kgmFaEditR1018B(\''+fa18bEsc(a.f.code)+'\',\''+fa18bEsc(d)+'\',\''+fa18bEsc(r.c)+'\')"':''}
function fa18bEditor(a,d,cab){
  var e=S.fa18bEdR1018B;if(!e||e.code!==a.f.code||e.d!==d||!fa18CanEdit())return '';
  var row=null;cab.rows.forEach(function(r){if(r.c===e.c)row=r});if(!row)return '';
  var FZ={Basic:z()?'基本':'Basic',Value:z()?'超值':'Value',Deluxe:z()?'豪華':'Deluxe'};
  var rule=fa18bRule(a.f.code,d,e.c),man=fa18bSeatMan(a.f.code,d,e.c),sysLeft=row.left;
  if(man!=null){var k=fa18bKey(a.f.code,d,e.c);delete S.seatInventory[k];try{sysLeft=+window.kgmInventory49(e.c,d,Object.assign({},a.f,{date:d}))||0}catch(_){}S.seatInventory[k]=man}   /* 系統原本算出來的座位（人工上限先拿掉量） */
  /* 同一家族上下兩階：價格改到比上一階貴／比下一階便宜，階梯會倒過來 —— 提醒 */
  var fam=cab.rows.filter(function(r){return r.fam===row.fam}),ix=fam.indexOf(row),lo=fam[ix-1],hi=fam[ix+1];
  var warn=(hi&&row.price>hi.price)?(z()?'注意：比上一階 '+hi.c+'（NT$ '+Math.round(hi.price).toLocaleString()+'）還貴，階梯會倒過來。':'Note: above the next class '+hi.c+'.')
    :(lo&&row.price<lo.price)?(z()?'注意：比下一階 '+lo.c+'（NT$ '+Math.round(lo.price).toLocaleString()+'）還便宜，階梯會倒過來。':'Note: below the previous class '+lo.c+'.'):'';
  return '<div class="fa18b-box"><div class="fa18b-h"><b>'+fa18bEsc(e.c)+'</b> '+fa18bEsc(FZ[row.fam]||row.fam)+' · '+fa18bEsc(a.f.code)+' '+fa18bEsc(d)
      +'<small>'+(z()?'只改這一班、這一天；訂票頁立即生效':'This flight and date only; live on the booking page')+'</small></div>'
    +'<div class="fa18b-f">'
      +'<label>'+(z()?'價格（NT$，來回每段成人）':'Price (NT$)')+'<input id="fa18bPrice" type="number" min="1" step="1" class="inp" value="'+Math.round(row.price)+'"></label>'
      +'<label>'+(z()?'可售座位（0＝關閉這一階）':'Seats (0 = close)')+'<input id="fa18bSeats" type="number" min="0" step="1" class="inp" value="'+(man!=null?man:row.left)+'"></label>'
      +'<button class="btn btn-sm btn-g" onclick="kgmFaEditApplyR1018B()">'+(z()?'套用':'Apply')+'</button>'
      +((rule||man!=null)?'<button class="btn btn-sm" onclick="kgmFaEditResetR1018B()">'+(z()?'恢復系統':'Reset')+'</button>':'')
      +'<button class="btn btn-sm" onclick="kgmFaEditR1018B()">'+(z()?'關閉':'Close')+'</button></div>'
    +'<div class="fa18b-n">'+(z()?'系統原本：':'System: ')+'NT$ '+Math.round(row.price/((rule&&+rule.mul)||1)).toLocaleString()+(z()?'，剩 ':' · left ')+sysLeft
      +(rule?(z()?'　人工價格 ':' · manual price ')+((rule.mul>=1?'+':'')+Math.round((rule.mul-1)*1000)/10)+'%':'')
      +(man!=null?(z()?'　人工座位上限 ':' · manual seat cap ')+man:'')
      +(z()?'。座位只能比系統算出來的少（關閉或限量）；系統已經關閉的階要重新開放，告訴我們再加。':'. Seats can only be capped below the system figure.')+'</div>'+(warn?'<div class="fa18b-w">'+fa18bEsc(warn)+'</div>':'')+'</div>';
}
window.kgmFaEditR1018B=function(code,d,c){S.fa18bEdR1018B=code?{code:code,d:d,c:c}:null;try{render()}catch(_){}};
function fa18bFlight(code,d){var x=null;try{faFlights1004B(d).forEach(function(y){if(!x&&y.f.code===code)x=y})}catch(_){}return x}
window.kgmFaEditApplyR1018B=function(){
  var e=S.fa18bEdR1018B;if(!e||!fa18CanEdit())return;
  var x=fa18bFlight(e.code,e.d);if(!x){alert(z()?'這一天找不到這個航班。':'Flight not found on that date.');return}
  var price=Math.round(+((document.getElementById('fa18bPrice')||{}).value||0)),seats=(document.getElementById('fa18bSeats')||{}).value;
  var cab=(FARES[e.c]||{}).cabin||'Economy',k=fa18bKey(e.code,e.d,e.c),who=(S.adminUser||{}).empId||'',at=new Date().toISOString(),log=[];
  /* 價格：先拿掉這一格舊的人工價格，量系統價，再算倍率 */
  var old=fa18bRule(e.code,e.d,e.c);if(old)S.fareRulesR929=(S.fareRulesR929||[]).filter(function(r){return r!==old});
  fa18Clear();var sys=0;try{sys=faAnalyze1004B(x,e.d).cabs.filter(function(c){return c.cab===cab})[0].rows.filter(function(r){return r.c===e.c})[0].price}catch(_){}
  if(price>0&&sys>0&&Math.abs(price-sys)>=1){
    var mul=Math.round(price/sys*100000)/100000;
    S.fareRulesR929=S.fareRulesR929||[];S.fareRulesR929.push({id:'FB'+Date.now().toString(36).toUpperCase(),fr:x.f.fr,toAp:x.f.to,from:e.d,to:e.d,cabin:cab,code:e.code,bucket:e.c,mul:mul,
      note:(z()?'票價分析：':'Fare analysis: ')+e.c+' NT$'+price.toLocaleString(),by:who,at:at,srcR1018B:'bucket'});
    log.push(e.c+' NT$'+Math.round(sys).toLocaleString()+' → NT$'+price.toLocaleString());
  }else if(old)log.push(e.c+(z()?' 價格恢復系統':' price reset'));
  /* 座位：跟系統一樣就不設 */
  if(seats!==''&&seats!=null){var n=Math.max(0,Math.floor(+seats||0)),left=0;
    var pv=fa18bSeatMan(e.code,e.d,e.c);if(pv!=null)delete S.seatInventory[k];   /* 先拿掉舊的人工上限，才量得到系統值 */
    try{left=+window.kgmInventory49(e.c,e.d,Object.assign({},x.f,{date:e.d}))||0}catch(_){}
    if(n<left){S.seatInventory=S.seatInventory||{};try{delete (S.fareThirds0810P||{})[k]}catch(_){}S.seatInventory[k]=n;   /* fareThirds 有這個鍵＝自動紀錄、sell54 不看 → 拿掉才算人工 */
      log.push(e.c+(z()?' 可售 ':' seats ')+left+' → '+n+(n===0?(z()?'（關閉）':' (closed)'):''))}
    else if(pv!=null)log.push(e.c+(z()?' 座位恢復系統':' seats reset'))
  }
  fa18Clear();try{logAct&&logAct('票價分析人工調整',e.code+' '+e.d+'：'+(log.join('；')||(z()?'沒有變更':'no change')))}catch(_){}
  try{save()}catch(_){}try{render()}catch(_){}
};
window.kgmFaEditResetR1018B=function(){
  var e=S.fa18bEdR1018B;if(!e||!fa18CanEdit())return;var k=fa18bKey(e.code,e.d,e.c);
  S.fareRulesR929=(S.fareRulesR929||[]).filter(function(r){return !(r&&r.bucket===e.c&&r.code===e.code&&r.from===e.d&&r.to===e.d)});
  if(fa18bSeatMan(e.code,e.d,e.c)!=null)delete S.seatInventory[k];
  fa18Clear();try{logAct&&logAct('票價分析人工調整',e.code+' '+e.d+' '+e.c+(z()?'：恢復系統':': reset'))}catch(_){}
  try{save()}catch(_){}try{render()}catch(_){}
};
var FA18B_CSS='<style id="fa18b-css">.fa18b-sw{align-self:flex-end;height:38px;min-width:40px;font-size:15px}.fa18b-q{display:flex;gap:6px}.fa18b-q .inp{width:110px;min-width:110px;text-transform:uppercase}'
  +'.k4b-fa-b.fa18b-ed{cursor:pointer}.k4b-fa-b.fa18b-ed:hover{box-shadow:0 0 0 2px #1F4E46}.k4b-fa-b.fa18b-on{box-shadow:0 0 0 2px #1F4E46}'
  +'.k4b-fa-b.fa18b-man::after{content:"人工";position:absolute;top:-7px;right:6px;font:800 9.5px system-ui,sans-serif;background:#b7791f;color:#fff;border-radius:999px;padding:1px 6px}.k4b-fa-b{position:relative}'
  +'.fa18b-box{margin:10px 0 2px;border:1px solid #cfe0d8;border-radius:12px;background:#f6faf8;padding:12px 14px}.fa18b-h{font-size:13px;color:#123c32;margin-bottom:8px}.fa18b-h small{display:block;font-size:11px;color:#6b7b74;margin-top:2px}'
  +'.fa18b-f{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.fa18b-f label{display:flex;flex-direction:column;gap:4px;font-size:10.5px;font-weight:800;color:#6b7b74}.fa18b-f .inp{height:34px;width:150px}'
  +'.fa18b-n{font-size:11px;color:#6b7b74;margin-top:8px;line-height:1.6}.fa18b-w{font-size:11.5px;color:#9b2c1c;font-weight:800;margin-top:4px}'
  /* 工具列一行放得下：日期、出發地、⇄、目的地、班號、艙等、前後一天、匯出 */
  +'.k4b-fa .k4b-ss-bar select.k4b-fa-sel{width:122px!important;min-width:0!important}.k4b-fa .k4b-ss-bar input[type=date]{width:142px!important;min-width:0!important}.k4b-fa .k4b-ss-bar .fa18b-q .inp{width:88px!important;min-width:0!important}.k4b-fa .k4b-ss-bar{gap:8px!important}'
  +'.k4b-fa .k4b-ss-bar{flex-wrap:wrap;row-gap:10px}</style>';

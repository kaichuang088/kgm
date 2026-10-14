/* ── 0927D：未得標時的備案 —— 艙等 × 方案用表格讓旅客自己按 ─────────────
   使用者：「residence 競標要可以選擇要哪個艙等、哪個方案，以表格呈現讓旅客自己按下」。
   （取代 0907B ③「備選艙等一律超值」：沒有按的時候仍預設超值，按了就用旅客選的那一格。）
   每一格＝該艙等、該方案（基本／超值／豪華）今天一般訂位頁真的在賣的那一個票種：
   依票種順序找第一個「還有座位、沒有關艙」的（跟票價頁同一套 seatInventory／kgmBucketStateR11）。
   金額＝owPrice × 來回停留係數＝本次結帳金額（跟原本下拉選單寫的一樣）。 */
var TIERS927D=[{k:'basic',re:/基本|Basic/i,zh:'基本 Basic'},{k:'value',re:/超值|Value/i,zh:'超值 Value'},{k:'deluxe',re:/豪華|Deluxe/i,zh:'豪華 Deluxe'}];
var CABROW927D=[{k:'first',cab:'First',zh:'頭等艙',en:'First'},{k:'business',cab:'Business',zh:'商務艙',en:'Business'},
  {k:'premium',cab:'Premium',zh:'豪華經濟艙',en:'Premium Economy'},{k:'economy',cab:'Economy',zh:'經濟艙',en:'Economy'}];
function offered927D(f,date,cab){
  try{
    var ac=(typeof acftOfFlight==='function'&&acftOfFlight(f.code,date,f.fr,f.to))||f.acft;
    var cb=(AC[ac]||{}).cabins||{};
    if(cab==='First')return !!(cb.first||cb.suite);
    if(cab==='Business')return !!cb.biz;
    if(cab==='Premium'){if(!cb.prem)return false;try{if(typeof window.kgmSellsPremiumR71==='function')return !!window.kgmSellsPremiumR71(f)}catch(_){}return true}
    if(cab==='Economy')return !!cb.econ;
  }catch(_){}
  return true;
}
function open927D(f,date,codes,c){
  try{
    var iv=(S.seatInventory||{})[f.code+'_'+date+'_'+c];
    if(iv!==undefined&&!(iv>0))return false;
    var bs=(typeof kgmBucketStateR11==='function')?kgmBucketStateR11(f.code,date,codes.indexOf(c)):{sold:false,trickle:0};
    return !(bs&&bs.sold&&bs.trickle<=0);
  }catch(_){return true}
}
/* 某艙等、某方案今天賣的票種；沒有這個方案回 null，有但全賣完回 {sold:true} */
window.kgmResAltCellR927D=function(k,tier,f,date,pax){
  var row=CABROW927D.filter(function(r){return r.k===k})[0],t=TIERS927D.filter(function(x){return x.k===tier})[0];
  if(!row||!t)return null;
  var codes=[];try{codes=CAB_CODES(row.cab)||[]}catch(_){}
  var inTier=codes.filter(function(c){var fa=FARES[c];return fa&&t.re.test(String(fa.tier||''))});
  if(!inTier.length)return null;
  var pick=null;for(var i=0;i<inTier.length;i++){if(open927D(f,date,codes,inTier[i])){pick=inTier[i];break}}
  if(!pick)return {sold:true,code:inTier[0]};
  var p=0;try{p=owPrice(Object.assign({},f,{date:date}),pick,pax||1)||0}catch(_){}
  try{if(window.kgmStayMul0826A)p=Math.round(p*window.kgmStayMul0826A())}catch(_){}
  return {code:pick,price:p,tier:tier,cab:row.cab};
};
window.kgmResAltTableR927D=function(f,date){
  var m=S.resModalR161||{},pax=1;
  try{pax=(window.kgmResCounts161&&window.kgmResCounts161().seats)||1}catch(_){}
  var rows=CABROW927D.filter(function(r){return offered927D(f,date,r.cab)});
  var cols=TIERS927D.filter(function(t){return rows.some(function(r){return !!window.kgmResAltCellR927D(r.k,t.k,f,date,pax)})});
  var head='<tr><th>'+(z()?'艙等 ＼ 方案':'Cabin \\ Fare')+'</th>'+cols.map(function(t){return '<th>'+E(z()?t.zh:t.zh.split(' ')[1])+'</th>'}).join('')+'</tr>';
  var body=rows.map(function(r){
    return '<tr><th>'+E(z()?r.zh:r.en)+'</th>'+cols.map(function(t){
      var c=window.kgmResAltCellR927D(r.k,t.k,f,date,pax);
      if(!c)return '<td class="na">—</td>';
      if(c.sold)return '<td class="na">'+(z()?'售完':'Sold out')+'</td>';
      var on=(m.altR927D===r.k&&m.altFareR927D===c.code);
      return '<td><button type="button" class="k927d-cell'+(on?' on':'')+'" data-k="'+E(r.k)+'" data-code="'+E(c.code)+'"'
        +' onclick="kgmResAltPickR927D(\''+E(r.k)+'\',\''+E(c.code)+'\')">'
        +'<b>NT$'+N(c.price)+'</b><small>'+E(c.code)+'</small>'+(on?'<i>✓ '+(z()?'已選':'Selected')+'</i>':'')+'</button></td>';
    }).join('')+'</tr>';
  }).join('');
  var rf=(m.altR927D==='refund');
  return '<div class="k927d-alt"><div class="k927d-cap">'+(z()?'未得標時的備案：點一格選艙等與方案（金額＝本次結帳金額）':'Fallback if not accepted — tap a cabin and fare (amount = charged now)')+'</div>'
    +'<table class="k927d-tbl">'+head+body+'</table>'
    +'<button type="button" class="k927d-refund'+(rf?' on':'')+'" data-k="refund" onclick="kgmResAltPickR927D(\'refund\',\'\')">'
    +(rf?'✓ ':'')+(z()?'取消行程並全額退還（結帳付出價金額，未得標全退）':'Cancel and refund in full (bid charged now, refunded if not accepted)')+'</button></div>';
};
window.kgmResAltPickR927D=function(k,code){
  var m=S.resModalR161;if(!m)return;
  m.altR927D=k;m.altFareR927D=code||null;
  try{var sel=document.getElementById('k161alt');if(sel){sel.value=k;try{sel.dispatchEvent(new Event('change'))}catch(_){}}}catch(_){}
  try{
    document.querySelectorAll('.k927d-cell,.k927d-refund').forEach(function(b){
      var on=(b.getAttribute('data-k')===k&&(k==='refund'||b.getAttribute('data-code')===code));
      b.classList.toggle('on',on);
      var i=b.querySelector('i');if(i)i.remove();
      if(on&&b.classList.contains('k927d-cell')){var t=document.createElement('i');t.textContent='✓ '+(z()?'已選':'Selected');b.appendChild(t)}
    });
    var rb=document.querySelector('.k927d-refund');
    if(rb)rb.textContent=(k==='refund'?'✓ ':'')+(z()?'取消行程並全額退還（結帳付出價金額，未得標全退）':'Cancel and refund in full (bid charged now, refunded if not accepted)');
  }catch(_){}
  try{save()}catch(_){}
  setTimeout(function(){try{paintAlt182()}catch(_){}},20);
};
/* 旅客按過的那一格就是備案票種；沒按過維持原本「超值」 */
try{
  var _altFare927D=window.kgmResAltFareR182;
  window.kgmResAltFareR182=function(k){
    try{
      var m=S.resModalR161;
      if(m&&m.altR927D===k&&m.altFareR927D&&FARES[m.altFareR927D]&&FARES[m.altFareR927D].cabin===ALTCAB182[k])return m.altFareR927D;
    }catch(_){}
    return _altFare927D.apply(this,arguments);
  };
}catch(_){}

/* ── 0927D：行程管理 —— 這筆訂位的 Residence 競標狀態與撤回 ───────────────
   使用者：「有參與 Residence 要可以在截止日之前撤回競標，在行程管理要可操作，也要 show 競標 status」。
   截止日＝現金出價截止（起飛前 14 天）。在行程管理撤回沿用 0831C 既有規則：收 NT$1,200（在競標頁撤回免費）。
   「取消行程並全額退還」的出價撤回＝跟未得標一樣：那一段取消、出價金額退回同一張卡（撤回費另計）。 */
function stat927D(s){return ({open:z()?'競標中':'Open',won:z()?'得標':'Won',lost:z()?'未得標':'Not accepted',withdrawn:z()?'已撤回':'Withdrawn'})[s]||s}
function cashClose927D(date){
  try{if(window.kgmResidenceDeadlineR89)return window.kgmResidenceDeadlineR89(date)}catch(_){}
  var d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(+window.KGM_RES_CASH_CLOSE_DAYS_R920||14));return d.toISOString().slice(0,10);
}
function today927D(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
window.kgmResTripBidsR927D=function(bk){
  if(!bk||!bk.pnr)return [];
  var ids=bk.resBidsR923||[];
  var cash=(S.residenceBidsR83||[]).filter(function(b){return b&&(b.pnr===bk.pnr||ids.indexOf(b.id)>=0)}).map(function(b){return {kind:'cash',b:b}});
  var mile=(S.resMileBidsR161||[]).filter(function(b){return b&&b.pnr===bk.pnr}).map(function(b){return {kind:'miles',b:b}});
  return cash.concat(mile);
};
window.kgmResTripCanWithdrawR927D=function(b){
  return !!(b&&b.status==='open'&&today927D()<cashClose927D(b.date));
};
window.kgmResTripWithdrawR927D=function(id){
  var b=(S.residenceBidsR83||[]).filter(function(x){return x&&x.id===id})[0],kind='cash';
  if(!b){b=(S.resMileBidsR161||[]).filter(function(x){return x&&x.id===id})[0];kind='miles'}
  if(!b){alert(z()?'找不到這筆出價。':'Bid not found.');return}
  if(!window.kgmResTripCanWithdrawR927D(b)){alert(z()?('已過截止日（'+cashClose927D(b.date)+'）或已結標，不能撤回。'):'Past the deadline or already settled.');return}
  var rf=(kind==='cash'&&b.alt==='refund');
  var msg=z()
    ?('撤回 '+b.code+'（'+b.date+'）的 Residence 出價？\n\n在行程管理撤回收撤回費 NT$1,200（在競標頁撤回免費）。\n'
      +(kind==='miles'?'里程出價撤回後里程不扣。':(rf?'這一段是「未得標全額退還」：撤回後這一段取消，出價金額 NT$'+N(b.amount)+' 退回同一張卡。':'撤回後維持你已付款的備案艙等（'+E(b.fallbackCodeR923||'')+'），不再扣款。')))
    :('Withdraw the Residence bid on '+b.code+' '+b.date+'? A NT$1,200 fee applies in Manage Booking.');
  if(!confirm(msg))return;
  var r=null;
  if(kind==='miles'){try{r=window.kgmResMileWithdrawR161?window.kgmResMileWithdrawR161(id):null}catch(e){r={ok:false,why:e.message}}if(r===undefined||r===null)r={ok:b.status==='withdrawn'}}
  else{try{r=window.kgmResidenceWithdrawR83(id,'manage')}catch(e){r={ok:false,why:e.message}}}
  if(!r||!r.ok){alert((r&&r.why)||(z()?'撤回失敗。':'Could not withdraw.'));return}
  try{
    var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0];
    if(bk){
      var seg=b.segR923==='inb'?'inb':'out',at=new Date().toISOString(),fee=1200;
      bk.total=(+bk.total||0)+fee;
      (bk.resChargesR923=bk.resChargesR923||[]).push({bid:b.id,seg:seg,type:'withdraw_fee',amount:fee,card:b.cardLast4R923||bk.cardLast4||'',at:at});
      if(rf&&!b.refundedR923){
        var paid=+b.fallbackPriceR923||+b.amount||0;
        bk.cancelledSegsR60=(bk.cancelledSegsR60||[]).concat([seg]);
        bk.total=Math.max(0,(+bk.total||0)-paid);
        (bk.refundsR60=bk.refundsR60||[]).push({at:at,segs:[seg],fare:paid,fee:0,noShow:0,net:paid,resBidR923:b.id});
        (bk.resChargesR923=bk.resChargesR923||[]).push({bid:b.id,seg:seg,type:'refund',amount:-paid,card:b.cardLast4R923||bk.cardLast4||'',at:at});
        b.refundedR923=paid;
      }
      b.cardSettledR923=true;b.withdrawFeeR927D=fee;
      (bk.deskLogR87=bk.deskLogR87||[]).unshift({at:at,what:z()?'Residence 撤回出價':'Residence bid withdrawn',
        detail:b.code+' '+b.date+(z()?'　撤回費 NT$':'  fee NT$')+N(fee)+(rf?(z()?'　這一段取消並退款':' sector cancelled and refunded'):''),by:z()?'旅客（行程管理）':'Passenger (Manage Booking)'});
    }
  }catch(_){}
  try{save()}catch(_){}
  try{render()}catch(_){}
};
function tripBks927D(){
  var out=[];
  try{
    if(S.mtOnly){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===S.mtOnly})[0];if(b)out.push(b)}
    else if(S.mgResult)out.push(S.mgResult);
  }catch(_){}
  return out;
}
function tripCss927D(){
  if(document.getElementById('kgm-r927d-res'))return;
  var s=document.createElement('style');s.id='kgm-r927d-res';
  s.textContent=
   '.k927d-alt{margin:8px 0 10px}.k927d-cap{font-size:12px;font-weight:800;color:#1F4E46;margin:0 0 7px}'
  +'.k927d-tbl{width:100%;border-collapse:separate;border-spacing:6px;margin:0 -6px;table-layout:fixed}'
  +'.k927d-tbl th{font-size:11px;font-weight:800;color:#6B5A2E;text-align:left;padding:2px 4px;letter-spacing:.02em}'
  +'.k927d-tbl td{padding:0}.k927d-tbl td.na{font-size:11px;color:#9AA3A0;text-align:center;border:1px dashed #E3E0D6;border-radius:10px;height:52px}'
  +'.k927d-cell{width:100%;min-height:52px;border:1px solid #D9D2BF;border-radius:10px;background:#fff;cursor:pointer;padding:7px 8px;text-align:left;display:flex;flex-direction:column;gap:2px;font:inherit}'
  +'.k927d-cell b{font-size:13px;color:#1F4E46;font-weight:900}.k927d-cell small{font-size:10px;color:#889;font-family:ui-monospace,Menlo,monospace}'
  +'.k927d-cell i{font-style:normal;font-size:10px;font-weight:900;color:#8A6B1F}'
  +'.k927d-cell:hover{border-color:#B8964A;background:#FFFCF4}'
  +'.k927d-cell.on{border:2px solid #B8964A;background:#FFF7E3;box-shadow:0 0 0 3px rgba(184,150,74,.15)}'
  +'.k927d-refund{margin-top:4px;width:100%;border:1px dashed #C9B27A;border-radius:10px;background:#FFFAF0;color:#6B5A2E;font:inherit;font-size:12px;font-weight:700;padding:9px 10px;cursor:pointer;text-align:left}'
  +'.k927d-refund.on{border:2px solid #B8964A;background:#FFF7E3;color:#1F4E46}'
  +'.k927d-trip{margin:0 0 16px;border:1px solid #E3DCC8;border-radius:16px;background:linear-gradient(180deg,#FFFDF8,#fff);padding:18px 22px;box-sizing:border-box}'
  +'.k927d-trip h3{margin:0 0 4px;font-family:Georgia,serif;color:#1F4E46;font-size:17px}.k927d-trip .sub{font-size:11.5px;color:#6B5A2E;margin:0 0 12px;line-height:1.7}'
  +'.k927d-bid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr auto;gap:10px;align-items:center;border-top:1px solid #EFE8D6;padding:11px 0;font-size:12.5px}'
  +'.k927d-bid small{display:block;font-size:10.5px;color:#889;margin-top:2px}.k927d-bid b{color:#1F4E46}'
  +'.k927d-st{display:inline-block;font-size:11px;font-weight:900;border-radius:20px;padding:3px 10px}'
  +'.k927d-st.open{background:#FFF3D6;color:#8A6B1F}.k927d-st.won{background:#E4F2EA;color:#1F6B43}.k927d-st.lost{background:#F3ECEA;color:#8E3B2C}.k927d-st.withdrawn{background:#EEF0EF;color:#667}'
  +'.k927d-wd{border:1px solid #D9B8AE;background:#fff;color:#8E3B2C;border-radius:10px;padding:8px 12px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}'
  +'.k927d-wd:hover{background:#FFF4F1}'
  +'@media (max-width:720px){.k927d-bid{grid-template-columns:1fr 1fr}}';
  (document.head||document.documentElement).appendChild(s);
}
function tripPanel927D(bk){
  var list=window.kgmResTripBidsR927D(bk);if(!list.length)return '';
  return '<section class="k927d-trip" data-pnr="'+E(bk.pnr)+'"><h3>'+(z()?'Residence 競標':'Residence bids')+'</h3>'
    +'<p class="sub">'+(z()?'現金出價截止（起飛前 14 天）之前都可以在這裡撤回；在行程管理撤回收 NT$1,200。結果公布後這裡會顯示得標或未得標。':'You can withdraw until cash bidding closes (14 days before departure). A NT$1,200 fee applies here.')+'</p>'
    +list.map(function(x){
      var b=x.b,dl=cashClose927D(b.date),pub='';
      try{var d=new Date(b.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(+window.KGM_RES_MILE_CLOSE_DAYS_R920||7));pub=d.toISOString().slice(0,10)}catch(_){}
      var can=window.kgmResTripCanWithdrawR927D(b);
      var fb=x.kind==='miles'?'':(b.alt==='refund'?(z()?'未得標全額退還':'Refund if not accepted'):((z()?'備案 ':'Fallback ')+E(b.fallbackCodeR923||b.backupFare||'')));
      return '<div class="k927d-bid"><div><b>'+E(b.code)+'</b> '+E(b.date)+'<small>'+(x.kind==='miles'?(z()?'里程出價':'Miles bid'):(z()?'現金出價':'Cash bid'))+'</small></div>'
        +'<div><b>'+(x.kind==='miles'?(N(b.miles)+(z()?' 哩':' mi')):('NT$'+N(b.amount)))+'</b><small>'+fb+'</small></div>'
        +'<div>'+(z()?'截止 ':'Closes ')+E(dl)+'<small>'+(z()?'結果公布 ':'Result ')+E(pub)+'</small></div>'
        +'<div><span class="k927d-st '+E(b.status)+'">'+E(stat927D(b.status))+'</span>'
          +(b.status==='withdrawn'&&b.withdrawFeeR927D?'<small>'+(z()?'撤回費 NT$':'Fee NT$')+N(b.withdrawFeeR927D)+'</small>':'')
          +(b.status==='lost'&&b.lostReasonR927==='cash_priority'?'<small>'+(z()?'已有現金出價優先':'Cash bid took priority')+'</small>':'')+'</div>'
        +'<div>'+(can?'<button class="k927d-wd" onclick="kgmResTripWithdrawR927D(\''+E(b.id)+'\')">'+(z()?'撤回出價':'Withdraw')+'</button>':'')+'</div></div>';
    }).join('')+'</section>';
}
function mountTrip927D(){
  try{
    var app=document.getElementById('app');if(!app)return;
    var okView=(S.view==='mytrip'||S.view==='manage'),sub=false;
    try{sub=(typeof window.kgmSubPageR60==='function')&&window.kgmSubPageR60()}catch(_){}
    var old=app.querySelector('.k927d-trip');
    if(!okView||sub){if(old)old.remove();return}
    var bks=tripBks927D();if(!bks.length){if(old)old.remove();return}
    var html=bks.map(tripPanel927D).join('');
    if(old){if(old.outerHTML===html)return;old.remove()}
    if(!html)return;
    tripCss927D();
    var wrap=document.createElement('div');wrap.innerHTML=html;
    var node=wrap.firstChild;
    /* 放進行程頁本身的欄位（跟「更改／退款行程」同一欄），不要整條拉到頁面邊緣 */
    var col=app.querySelector('.k56-trip'),blocks=col?col.querySelectorAll(':scope > .k56-block'):[];
    if(col&&blocks.length){var last=blocks[blocks.length-1];last.parentNode.insertBefore(node,last.nextSibling)}
    else{var host=app.querySelector('main')||app,ft=host.querySelector('footer')||app.querySelector('footer');
      if(ft&&ft.parentNode)ft.parentNode.insertBefore(node,ft);else host.appendChild(node)}
  }catch(e){try{console.warn('r927d trip',e)}catch(_){}}
}
window.kgmResTripMountR927D=mountTrip927D;
if(typeof render==='function'){
  var _rd927D=render;
  render=window.render=function(){
    try{window.kgmResBidSegSyncR927D()}catch(_){}   /* 0927D：上一趟沒付款的出價不要跟到這一趟 */
    var r=_rd927D.apply(this,arguments);
    try{tripCss927D()}catch(_){}
    [40,200,700].forEach(function(ms){setTimeout(mountTrip927D,ms)});
    return r;
  };
}

/* ── 0927D：Residence 出價只跟「這一次訂位流程」有關 ─────────────────────
   使用者：「residence 明明是上次的，會顯示在其他航班的訂位」—— 付款頁出現上一趟沒付款的 KX3 出價。
   原因：S.resBidSegR923 記的是「訂位流程中已出價的段」，換了航班或重新搜尋都沒有清，付款成功時還會把那筆出價記到新訂位上。
   改成：目前選的去程／回程不是那筆出價的航班（航班號＋日期）就從這次訂位拿掉；那筆出價沒付過款（沒有 PNR）就視為放棄、撤回（不收費），並釋放備案保留的座位。 */
window.kgmResBidSegSyncR927D=function(){
  try{
    var m=S.resBidSegR923;if(!m)return 0;
    var n=0;
    ['out','inb'].forEach(function(seg){
      var id=m[seg];if(!id)return;
      var b=(S.residenceBidsR83||[]).filter(function(x){return x&&x.id===id})[0];
      var f=seg==='inb'?S.inbF:S.outF;
      var ok=!!(b&&f&&b.code===f.code&&b.date===f.date);
      if(ok)return;
      delete m[seg];n++;
      if(b&&b.status==='open'&&!b.pnr){
        b.status='withdrawn';b.fee=0;b.withdrawnAt=new Date().toISOString();b.withdrawSource='abandoned';
        try{if(window.kgmResReleaseAltR89)window.kgmResReleaseAltR89(b.id)}catch(_){}
      }
    });
    if(!m.out&&!m.inb)S.resBidSegR923=null;
    if(n){try{save()}catch(_){}}
    return n;
  }catch(_){return 0}
};

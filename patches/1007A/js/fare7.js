/* ══ 1007A：票價即時變動時的「抱歉，票價已更新」 ═══════════════════════════
   使用者：「票價是隨時可以更新的（我希望現在是真的浮動的）再改票或是里程升等甚至酬賓一但票價臨時有更新上面要寫個抱歉票價上漲之類的」
   · 票價本身：營收管理（kgmRmR929）原本一天只動一次；改成白天每 3 小時重新最佳化一次，
     並且真實訂位會推高需求（過去 24 小時同一班每賣出一位，價格壓力就往上加）—— 前後台用同一個公式，看到的價格一致。
     定價人員在後台改價、調整票價規則也是立刻生效（同步到前台）。
   · 酬賓與升等所需哩程：原本只隨日期、時段、模擬載客率變；現在同一班過去 24 小時的真實售出也會往上推（awardTimeMul，上下限仍是 ±20%）。
   · 報價保護：現金票在選航班時鎖價（0814 的報價合約）；酬賓在付款頁、改票在確認頁、升等在升等選項列出時記下當下的報價；
     真正付款／送出那一刻用即時價再算一次。
       變貴 → 不直接收，跳出「很抱歉，票價已更新」：原報價、新價格、差額，讓旅客選「接受新價格並繼續」或「返回重新選擇」。
       變便宜 → 照新的（較低）價格收，並提示「票價已調降」。
     適用：新訂位（現金與酬賓哩程）、改票補差額、里程升等所需哩程。 */
(function(){
'use strict';
function zh(){try{return LANG!=='en'}catch(_){return true}}
function money(v,c){try{return typeof fmtAmt==='function'?fmtAmt(v,c||'TWD'):((c||'TWD')+' '+Math.round(v).toLocaleString())}catch(_){return (c||'TWD')+' '+Math.round(v||0).toLocaleString()}}
function mi(v){return Math.round(+v||0).toLocaleString()+(zh()?' 哩':' miles')}
function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var Q7={};   /* 這次瀏覽中第一次看到的報價（不存檔：重新整理就是重新報價） */
window.kgmQuoteR1007A=Q7;
/* 抱歉視窗 */
function modal(o){
  try{
    var old=document.getElementById('k7f-modal');if(old)old.remove();
    var d=document.createElement('div');d.id='k7f-modal';
    var up=o.up!==false,Z=zh();
    d.innerHTML='<div class="k7f-dlg'+(up?'':' k7f-dn')+'" role="dialog" aria-modal="true"><div class="k7f-ic">'+(up?'!':'✓')+'</div>'
      +'<h3>'+E(up?(Z?'很抱歉，票價已更新':'Sorry — the fare has changed'):(Z?'好消息，票價已調降':'Good news — the fare went down'))+'</h3>'
      +'<p>'+E(o.lead||(Z?'在您確認的這段時間，這個航班的票價已更新（即時座位銷售或票價調整）。':'While you were completing this step, the fare for this flight was updated (live seat sales or a fare adjustment).'))+'</p>'
      +'<div class="k7f-cmp"><div><small>'+(Z?'原報價':'Previous quote')+'</small><b>'+E(o.oldTxt)+'</b></div><span>→</span>'
      +'<div class="k7f-new"><small>'+(Z?'目前價格':'Current price')+'</small><b>'+E(o.newTxt)+'</b></div></div>'
      +(o.diffTxt?'<div class="k7f-diff">'+E((up?(Z?'多 ':'+'):(Z?'少 ':'−'))+o.diffTxt)+'</div>':'')
      +'<p class="k7f-note">'+E(o.note&&up?o.note:up?(Z?'您尚未被收取任何費用。接受新價格後才會繼續；也可以返回重新選擇其他航班或艙等。':'You have not been charged. Continue only if you accept the new price, or go back and choose again.')
        :(Z?'將以較低的新價格計算。':'You will be charged the lower price.'))+'</p>'
      +'<div class="k7f-btns">'+(up?'<button class="k7f-back">'+(Z?'返回重新選擇':'Go back')+'</button>':'')
      +'<button class="k7f-ok">'+E(up?(Z?'接受新價格並繼續':'Accept and continue'):(Z?'好，繼續':'Continue'))+'</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('.k7f-ok').onclick=function(){d.remove();try{o.onAccept&&o.onAccept()}catch(e){try{console.warn('k7f',e)}catch(_){}}};
    var bk=d.querySelector('.k7f-back');if(bk)bk.onclick=function(){d.remove();try{o.onBack&&o.onBack()}catch(_){}};
  }catch(_){try{if(o.up!==false&&!confirm((zh()?'票價已更新：':'Fare changed: ')+o.oldTxt+' → '+o.newTxt))return;o.onAccept&&o.onAccept()}catch(__){}}
}
window.kgmPriceChangedR1007A=modal;
/* ── 1. 新訂位 ──
   現金票：選航班那一刻價格就鎖在航班上（_lockedFare，0814 起的報價合約），付款頁的總額一直是鎖定價。
     按「付款」時用即時價重算一次整趟總額（暫時把鎖定價換成即時價、算完換回）；不同就先問旅客。
   酬賓票：哩程不鎖，付款頁出現時記下當下的哩程與稅金，按「付款」時重算。 */
function bookSig(){
  try{var s=S.search||{},a=[s.type,s.fr,s.to,s.dep,s.ret,s.pax,s.useMiles?'M':'C',S.mileageSourceR4||''];
    [S.outF,S.inbF].forEach(function(f){if(f)a.push(f.code+'@'+(f.date||''))});a.push(S.outC||'',S.inbC||'');
    (S.mcFlights||[]).forEach(function(x){var f=x&&(x.f||x);if(f)a.push((f.code||'')+'@'+(f.date||'')+':'+(x.c||''))});
    return a.join('|')}catch(_){return ''}
}
function curJ(){try{return (typeof journeyCurr==='function'&&journeyCurr())||S.curr||'TWD'}catch(_){return 'TWD'}}
function awardNow(){try{var aq=awardQuote0815();return {miles:+aq.baseMiles||0,cash:+aq.totalCash||0}}catch(_){return null}}
function snapBook(){
  try{if(S.view!=='booking'||S.phase!=='pay'||(S.stx&&S.stx.plan)||S.seatOnly||!(S.search&&S.search.useMiles))return;
    var k='book|'+bookSig();if(!Q7[k]){var n=awardNow();if(n)Q7[k]=n}}catch(_){}
}
function liveCash(){
  var segs=[];
  try{segs=(typeof _journeySegs==='function'?_journeySegs():[]).filter(function(sg){
    return sg&&sg.f&&sg.c&&sg.f._lockedFare!=null&&!(typeof isAwardFare==='function'&&isAwardFare(sg.c))})}catch(_){segs=[]}
  if(!segs.length)return null;
  /* 第 4 個參數：繞過 r44 的畫面內價格快取（它的鍵不含即時售出與時段），付款那一刻一定要真的重算 */
  var pax=(S.search&&S.search.pax)||1,saved=segs.map(function(sg){return sg.f._lockedFare});
  var live=segs.map(function(sg){try{var v=owPrice(sg.f,sg.c,pax,'live7');return v>0?v:sg.f._lockedFare}catch(_){return sg.f._lockedFare}});
  var old=0,now=0;
  try{old=+(journeyPrice()||{}).total||0;segs.forEach(function(sg,i){sg.f._lockedFare=live[i]});now=+(journeyPrice()||{}).total||0}
  catch(_){now=old}
  finally{segs.forEach(function(sg,i){sg.f._lockedFare=saved[i]})}
  return {old:old,now:now,apply:function(){segs.forEach(function(sg,i){sg.f._lockedFare=live[i]})}};
}
/* 接受新價格後要重畫付款頁（總額換成新價）；旅客已經填好的卡號、有效期限等只存在畫面上，重畫前記下、重畫後填回 */
/* 「返回重新選擇」：回到選航班（重新選會用當下的價格重新鎖價）；多航段行程的選擇流程不同，只關掉視窗留在付款頁 */
function backToSelect(){try{if(S.search&&S.search.type!=='MC'){S.phase='sel_out';render();try{window.scrollTo(0,0)}catch(_){}}}catch(_){}}
function rerenderKeep(){
  var keep=[];
  try{[].forEach.call(document.querySelectorAll('#app input[id],#app select[id],#app textarea[id]'),function(e){
    if(e.id==='aiInput')return;keep.push([e.id,e.type==='checkbox'||e.type==='radio'?null:e.value,e.checked])})}catch(_){}
  try{render()}catch(_){}
  keep.forEach(function(k){try{var e=document.getElementById(k[0]);if(!e)return;
    if(k[1]==null){if(e.checked!==k[2])e.checked=k[2]}else if(e.value!==k[1]){e.value=k[1];e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}}catch(_){}});
}
var pass7=false;   /* 已經檢查過、正在往裡面送：裡層若還有一份同樣的檢查就直接放行 */
function mkPay(inner){
  var w=function(total,curr){
    var self=this;
    function go(t){pass7=true;try{return inner.call(self,t,curr)}finally{pass7=false}}
    if(pass7)return inner.apply(self,arguments);
    /* 先過規章同意（跟 r914 閘門同一個檢查、同兩份文件），再查票價：旅客不會在還沒同意條款時就看到改價視窗 */
    try{if(typeof window.kgmPolicyGateR914==='function'&&!window.kgmPolicyGateR914(['KGM-GC-001','KGM-CON-006']))return}catch(_){}
    try{
      if(S.view==='booking'&&!(S.stx&&S.stx.plan)&&!S.seatOnly){
        var cu=curJ();
        if(S.search&&S.search.useMiles){
          var k='book|'+bookSig(),q=Q7[k],n=awardNow();
          if(q&&n&&(n.miles!==q.miles||Math.round(n.cash)!==Math.round(q.cash))){
            var upA=n.miles>q.miles||(n.miles===q.miles&&n.cash>q.cash);
            modal({up:upA,lead:zh()?'在您確認的這段時間，這個航班的酬賓哩程依即時的座位銷售情況調整了。':'While you were completing this step, the award price was updated based on live seat sales.',
              note:zh()?'您的哩程與費用都還沒有扣除。接受新的價格後才會繼續；也可以返回重新選擇其他航班或艙等。':'No miles or money have been taken yet. Continue only if you accept the new price, or go back and choose again.',
              oldTxt:mi(q.miles)+' + '+money(q.cash,cu),newTxt:mi(n.miles)+' + '+money(n.cash,cu),
              diffTxt:n.miles!==q.miles?mi(Math.abs(n.miles-q.miles)):money(Math.abs(n.cash-q.cash),cu),
              onAccept:function(){Q7[k]=n;rerenderKeep();setTimeout(function(){go(n.cash)},30)},onBack:backToSelect});
            return;
          }
        }else{
          var lc=liveCash();
          if(lc&&Math.round(lc.now)!==Math.round(lc.old)){
            var up=lc.now>lc.old;
            modal({up:up,oldTxt:money(lc.old,cu),newTxt:money(lc.now,cu),diffTxt:money(Math.abs(lc.now-lc.old),cu),
              onAccept:function(){lc.apply();rerenderKeep();setTimeout(function(){go(lc.now)},30)},onBack:backToSelect});
            return;
          }
        }
      }
    }catch(_){}
    return go(total);
  };
  w.__r1007aQ=1;w.__inner914=inner;   /* __inner914：讓政策閘門與里程折抵看得到裡面那層，不會再補包一次 */
  w.__gate914=1;w._rawGate914=inner;  /* 這一層本身就做規章閘門檢查（上面），所以也是閘門層 */
  return w;
}
/* 別層之後還會再包 doPay（政策閘門、里程折抵），所以這層要在它們之後維持在最外面：
   載入完、1.5 秒後、以及每次畫面更新時檢查一次；最多補掛 4 次，不會無限疊。 */
var ARM7={};
function outer7(n,mk){
  try{var cur=window[n];if(typeof cur!=='function'||cur.__r1007aQ)return;
    if((ARM7[n]||0)>=4)return;ARM7[n]=(ARM7[n]||0)+1;
    var w=mk(cur);window[n]=w;
    try{if(n==='doPay')doPay=w;else if(n==='doPayChange')doPayChange=w;else if(n==='doRequestUpgrade')doRequestUpgrade=w;else if(n==='canUpgradeWithMiles')canUpgradeWithMiles=w}catch(_){}
  }catch(_){}
}
/* ── 2. 改票：確認改票時已經算好報價（S.pendingChange），付款那一刻重算 ── */
function mkChange(inner){
  var w=function(){
    var self=this,args=arguments;
    try{
      var pc=S.pendingChange;
      if(!pass7&&pc&&!pc.priceOkR1007A&&typeof changeQuote==='function'){
        try{window.kgmPriceCacheClearR1007A&&window.kgmPriceCacheClearR1007A()}catch(_){}
        var q=changeQuote(pc.pnr,pc.seg,pc.newDate,pc.flCode,pc.fr,pc.to);
        if(q&&!(q.fee<0)&&!q.full&&Math.round(q.total)!==Math.round(pc.total||0)){
          var up=q.total>(pc.total||0),old=pc.total||0;
          var apply=function(){pc.fee=q.fee;pc.diff=q.diff;pc.saved=q.saved;pc.total=q.total;pc.newFc=q.newFc;pc.priceOkR1007A=true;rerenderKeep()};
          modal({up:up,lead:zh()?'在您確認改票的這段時間，新航班的票價依即時座位銷售情況調整了，應付差額跟著改變。':'While you were confirming, the new flight\'s fare changed, so the amount due changed.',
            oldTxt:money(old,pc.curr),newTxt:money(q.total,pc.curr),diffTxt:money(Math.abs(q.total-old),pc.curr),
            onAccept:function(){apply();setTimeout(function(){w.apply(self,args)},30)},   /* 旅客已同意新金額：更新畫面上的應付金額後直接繼續付款 */
            onBack:function(){try{S.modal=null;render()}catch(_){}}});   /* 返回：關掉改票付款視窗，回到改票頁重新選 */
          return;
        }
      }
    }catch(_){}
    pass7=true;try{return inner.apply(self,args)}finally{pass7=false}
  };
  w.__r1007aQ=1;w.__inner914=inner;return w;
}
/* ── 3. 里程升等：升等頁列出所需哩程時記下（第一次看到的數字），送出申請時重算 ── */
function upKey(type,cls,acft,dist,f){return 'upg|'+[type,cls,acft,f&&f.code,f&&f.date].join('|')}
function mkCanUp(inner){
  var w=function(type,cls,acft,dist,f){var r=inner.apply(this,arguments);try{if(r&&r.ok&&+r.miles>0&&f&&f.code){var k=upKey(type,cls,acft,dist,f);if(!(k in Q7))Q7[k]=+r.miles}}catch(_){}return r};
  w.__r1007aQ=1;w.__inner914=inner;return w;
}
/* 新版升等頁（R920）的哩數來自 kgmUpgradeOptionsR920，不經過 canUpgradeWithMiles —— 那裡也要記下第一次列出的數字 */
function optKey(pnr,seg,o){return 'upo|'+pnr+'|'+seg+'|'+o.type+'|'+(o.legKey||'')}
function mkOpts(inner){
  var w=function(b,seg){var r=inner.apply(this,arguments);
    try{(r||[]).forEach(function(o){if(o&&o.type&&!o.auction&&+o.miles>0&&b&&b.pnr){var k=optKey(b.pnr,seg,o);if(!(k in Q7))Q7[k]=+o.miles}})}catch(_){}
    return r};
  w.__r1007aQ=1;w.__inner914=inner;return w;
}
function mkReqUp(inner){
  var w=function(pnr,seg,type,toCabin){
    var self=this,args=arguments;
    try{
      var bk=(S.bookings||[]).filter(function(b){return b&&b.pnr===pnr})[0];
      if(bk&&!pass7){
        var old=null,now=null,k=null;
        /* 新版升等頁：重新列一次選項，跟第一次列出的哩數比 */
        try{(window.kgmUpgradeOptionsR920?window.kgmUpgradeOptionsR920(bk,seg)||[]:[]).forEach(function(o){
          if(old!=null||!o||o.type!==type||o.auction)return;var kk=optKey(pnr,seg,o);
          if(Q7[kk]!=null&&+o.miles>0&&+Q7[kk]!==+o.miles){old=+Q7[kk];now=+o.miles;k=kk}})}catch(_){}
        /* 舊版升等頁：canUpgradeWithMiles 記下的數字 */
        if(old==null){
          var f=(seg==='inb')?bk.inbF:bk.outF,cls=(seg==='inb')?bk.inbC:bk.outC;
          if(f){
            var dist=distOf(f.fr,f.to),acft=acftOfFlight(f.code,f.date)||f.acft,k2=upKey(type,cls,acft,dist,f),q2=Q7[k2];
            var c2=window.canUpgradeWithMiles(type,cls,acft,dist,f);
            if(c2&&c2.ok&&q2!=null&&+c2.miles!==+q2){old=+q2;now=+c2.miles;k=k2}
          }
        }
        if(old!=null){
          var up=now>old,pax=(bk.paxList||[{}]).filter(function(p){return p&&p.passengerType!=='INF'}).length||1,per=pax>1?(zh()?'（每位旅客）':' (per passenger)'):'';
          modal({up:up,lead:zh()?'在您確認的這段時間，這個航班的升等哩程依即時座位情況調整了。':'While you were confirming, the miles needed for this upgrade changed.',
            note:zh()?'您的哩程還沒有扣除。接受新的哩數後才會送出升等申請；也可以返回升等頁重新選擇。':'No miles have been deducted yet. The upgrade request is sent only if you accept the new miles, or go back to the upgrade page.',
            oldTxt:mi(old)+per,newTxt:mi(now)+per,diffTxt:mi(Math.abs(now-old))+per,
            onAccept:function(){Q7[k]=now;try{render()}catch(_){}pass7=true;try{inner.apply(self,args)}finally{pass7=false}},
            onBack:function(){try{render()}catch(_){}}});
          return;
        }
      }
    }catch(_){}
    pass7=true;try{return inner.apply(self,args)}finally{pass7=false}
  };
  w.__r1007aQ=1;w.__inner914=inner;return w;
}
function ensure7(){outer7('kgmUpgradeOptionsR920',mkOpts);outer7('doPay',mkPay);outer7('doPayChange',mkChange);outer7('canUpgradeWithMiles',mkCanUp);outer7('doRequestUpgrade',mkReqUp)}
window.kgmFareGuardR1007A=function(){var o={};['doPay','doPayChange','canUpgradeWithMiles','doRequestUpgrade','kgmUpgradeOptionsR920'].forEach(function(n){o[n]=!!(window[n]&&window[n].__r1007aQ)});return o};
ensure7();setTimeout(ensure7,0);setTimeout(ensure7,1500);setTimeout(ensure7,4000);
/* 付款頁畫出來的那一刻記下（酬賓）報價；順便確認報價檢查仍在最外層 */
try{if(typeof render==='function'&&!render.__r1007aQ){var rd=render;var R=function(){var x=rd.apply(this,arguments);snapBook();ensure7();return x};R.__r1007aQ=1;render=window.render=R}}catch(_){}
(function(){try{if(document.getElementById('k7f-css'))return;var s=document.createElement('style');s.id='k7f-css';s.textContent=''
  +'#k7f-modal{position:fixed;inset:0;z-index:100200;background:rgba(17,27,23,.5);display:flex;align-items:center;justify-content:center;padding:16px}'
  +'.k7f-dlg{background:#fff;border-radius:18px;width:min(460px,100%);padding:26px 26px 22px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.3)}'
  +'.k7f-ic{width:46px;height:46px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font:900 24px/1 -apple-system,sans-serif;color:#fff;background:#b7791f}'
  +'.k7f-dlg h3{margin:0 0 8px;font:900 19px/1.3 -apple-system,"Noto Sans TC",sans-serif;color:#1f2a25}.k7f-dlg p{margin:0 0 14px;font-size:13px;line-height:1.7;color:#4b5852}'
  +'.k7f-cmp{display:flex;align-items:center;justify-content:center;gap:12px;background:#f7f5ef;border-radius:12px;padding:14px 12px;margin:0 0 8px}.k7f-cmp>span{color:#a9822f;font-weight:900}'
  +'.k7f-cmp small{display:block;font-size:11px;color:#8b948f}.k7f-cmp b{font-size:16px;color:#5c6a63;text-decoration:line-through;text-decoration-color:rgba(163,52,43,.5)}.k7f-new b{color:#17493a;text-decoration:none;font-size:18px}'
  +'.k7f-diff{display:inline-block;font-size:12px;font-weight:800;color:#a3342b;background:#fbeceb;border-radius:99px;padding:3px 12px;margin:0 0 12px}'
  +'.k7f-dn .k7f-ic{background:#2f7a52}.k7f-dn .k7f-diff{color:#2f7a52;background:#e6f3ec}'
  +'.k7f-note{font-size:12px!important;color:#7d8780!important}.k7f-btns{display:flex;gap:10px;justify-content:center}'
  +'.k7f-btns button{flex:1;height:44px;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer}.k7f-back{border:1px solid #cfd6d2;background:#fff;color:#3b4842}.k7f-ok{border:0;background:#17493a;color:#fff}';
  (document.head||document.documentElement).appendChild(s)}catch(_){}})();
})();

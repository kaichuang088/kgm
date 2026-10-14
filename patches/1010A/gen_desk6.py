from common import *
# ══ 1006A #21：「票務中心變成不要withhold里程，就直接可以Cancel里程升等，然後在後台幫他重新升等」 ══
#   原本票務中心有一塊「MILEAGE CONTROL 暫扣里程［輸入］暫扣／解除暫扣」，里程票務（0923A）也是「把暫扣里程改掛到新日期」。
#   改成：同一塊列出這筆訂位的里程升等 —— 可以直接「取消里程升等」（全額依原批次退還里程、已確認的改回原艙等並重新配位；
#   櫃檯作業不受旅客端「起飛前 72 小時不可取消」的限制），沒有升等的航段列出可升等的艙等，客服直接幫旅客重新升等（從會員帳戶扣里程）。
DESK=r'''
/* ══ 1006A #21：票務中心「里程升等」—— 不再暫扣里程，直接取消／重新升等 ══ */
(function(){
  function Z(){try{return LANG!=='en'}catch(_){return true}}
  function E(t){return String(t==null?'':t).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
  function A(t){return String(t==null?'':t).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
  function N(n){return Number(n||0).toLocaleString()}
  function bk(p){return (S.bookings||[]).filter(function(x){return x&&x.pnr===p})[0]||null}
  function cabOf(c){try{return (FARES[c]||(typeof AWARD_FARES!=='undefined'&&AWARD_FARES[c])||{}).cabin||''}catch(_){return ''}}
  var CZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙',First:'頭等艙',Resident:'Residence'};
  function cz(c){return Z()?(CZ[c]||c):c}
  /* 升等里程依會員等級計價、扣的是訂位會員的里程 —— 後台沒有登入會員（或登入的是別人）時，計算當下暫時以訂位會員身分進行 */
  function asOwner(b,fn){
    var keep=S.user,own=null;
    try{own=(S.users||[]).filter(function(x){return x&&b&&x.id===b.userId})[0]||null}catch(_){}
    if(own)S.user=own;
    try{return fn()}finally{S.user=keep}
  }
  function css(){
    if(document.getElementById('k6-mup-css'))return;
    var s=document.createElement('style');s.id='k6-mup-css';
    s.textContent='.k6-mup{border:1px solid #E4D3AC;border-radius:12px;background:#FFFCF4;padding:12px 14px;margin-top:12px}'
      +'.k6-mup>header small{display:block;font-size:9px;letter-spacing:.18em;font-weight:900;color:#A9822F}'
      +'.k6-mup>header b{display:block;font-size:14px;color:#0B493B;margin:2px 0 3px}'
      +'.k6-mup>header p{margin:0 0 8px;font-size:11px;color:#6B7A72;line-height:1.7}'
      +'.k6-mup-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px dashed #EADFC9;padding:8px 0}'
      +'.k6-mup-row span{flex:1 1 260px;font-size:12px;color:#26332E}'
      +'.k6-mup-row em{font-style:normal;font-size:10.5px;font-weight:800;border-radius:999px;padding:2px 9px;background:#EDF4F0;color:#1F4E46}'
      +'.k6-mup-row em.w{background:#FFF4DC;color:#8A6414}'
      +'.k6-mup-row button{border:1px solid #C0392B;background:#fff;color:#8E3B2C;border-radius:8px;padding:6px 12px;font-size:11.5px;font-weight:800;cursor:pointer}'
      +'.k6-mup-row button.up{border-color:#0B493B;background:#0B493B;color:#fff}'
      +'.k6-mup-row button[disabled]{opacity:.45;cursor:not-allowed}'
      +'.k6-mup-none{font-size:11.5px;color:#8A8578;padding:6px 0 2px}';
    (document.head||document.documentElement).appendChild(s);
  }
  window.kgmDeskUpgHtmlR1006A=function(b,ok){
    try{
      if(!b)return '';
      if(window.kgmIsStaffBkR928&&window.kgmIsStaffBkR928(b))return '';   /* 員工票不能里程升等 */
      css();
      var dis=ok===false?' disabled title="'+E(Z()?'請先完成上方核對':'Complete the checks first')+'"':'';
      var reqs=(S.upgradeReqs||[]).filter(function(r){return r&&r.pnr===b.pnr&&/confirmed|waitlist/.test(String(r.status||''))});
      var h='<section class="k6-mup"><header><small>MILEAGE UPGRADE · 里程升等</small>'
        +'<b>'+(Z()?'這筆訂位的里程升等':'Mileage upgrades on this booking')+'</b>'
        +'<p>'+(Z()?'票務中心不暫扣里程。取消升等＝依原扣除批次全額退還里程（已確認者改回原艙等並重新配位）；需要時在下面直接幫旅客重新升等，里程從會員帳戶扣除。'
                   :'No miles are withheld here. Cancelling refunds the miles in full; re-upgrade below deducts from the member account.')+'</p></header>';
      if(reqs.length)h+=reqs.map(function(r){
        var w=String(r.status)==='waitlist';
        return '<div class="k6-mup-row"><span><b>'+E(r.code)+'</b>　'+E(r.date)+'　'+E(cz(r.prevCabinR922||cabOf(r.fromClass||r.prevClsR922)||''))+' → '+E(cz(r.toCabin||''))
          +'　<b>'+N(r.miles)+(Z()?' 哩':' mi')+'</b></span>'
          +'<em class="'+(w?'w':'')+'">'+(w?(Z()?'候補中':'Waitlisted'):(Z()?'已確認':'Confirmed'))+'</em>'
          +'<button'+dis+' onclick="kgmDeskCancelUpgR1006A(\''+A(r.id)+'\')">'+(Z()?('取消里程升等（退還 '+N(r.miles)+' 哩）'):('Cancel upgrade (refund '+N(r.miles)+' mi)'))+'</button></div>';
      }).join('');
      var segs=['out','inb'].filter(function(k){return b[k+'F']&&!reqs.some(function(r){return (r.seg||'out')===k})});
      var opts=[];
      segs.forEach(function(k){
        var f=b[k+'F'],o=[];try{o=asOwner(b,function(){return window.kgmUpgradeOptionsR920?(window.kgmUpgradeOptionsR920(b,k)||[]):[]})}catch(_){o=[]}
        o.filter(function(x){return x&&!x.auction&&x.to&&x.to!=='Resident'}).forEach(function(x){
          /* 沒有立即可升的座位 → 進候補，加收 10% 哩程（跟旅客端同一規則）；按鈕上先寫清楚實際會扣多少 */
          var inst=true;try{inst=!!asOwner(b,function(){return typeof upgradeStatus==='function'&&upgradeStatus(f.code,f.date,x.to,(b.paxList||[{}]).length).instant})}catch(_){}
          var mi=inst?(+x.miles||0):Math.round((+x.miles||0)*1.1);
          opts.push('<div class="k6-mup-row"><span>'+(k==='inb'?(Z()?'回程 ':'Return '):(Z()?'去程 ':'Outbound '))+'<b>'+E(f.code)+'</b>　'+E(f.date)+'　'
            +E(cz(cabOf(b[k+'C'])))+' → '+E(cz(x.to))+'　<b>'+N(mi)+(Z()?' 哩':' mi')+'</b>'+(inst?'':('<small style="color:#8A6414">　'+(Z()?'目前無立即可升座位：進候補（加收 10% 哩程）':'Waitlist (+10% miles)')+'</small>'))+'</span>'
            +'<button class="up"'+dis+' onclick="kgmDeskUpgR1006A(\''+A(b.pnr)+'\',\''+k+'\',\''+A(x.type)+'\',\''+A(x.to)+'\','+mi+','+(inst?1:0)+')">'
            +(Z()?('幫旅客升等至'+cz(x.to)):('Upgrade to '+x.to))+'</button></div>');
        });
      });
      if(opts.length)h+=opts.join('');
      if(!reqs.length&&!opts.length)h+='<div class="k6-mup-none">'+(Z()?'這筆訂位目前沒有里程升等，也沒有可以升等的航段。':'No mileage upgrades on this booking.')+'</div>';
      return h+'</section>';
    }catch(e){return ''}
  };
  window.kgmDeskCancelUpgR1006A=function(id){
    var r=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0];
    if(!r||!/confirmed|waitlist/.test(String(r.status||''))){alert(Z()?'這筆升等已經不在有效狀態。':'This upgrade is no longer active.');return}
    if(!confirm(Z()?('取消 '+r.code+' '+r.date+' 的里程升等，並全額退還 '+N(r.miles)+' 哩？'):('Cancel this upgrade and refund '+N(r.miles)+' miles?')))return;
    var b=bk(r.pnr),u=(S.users||[]).filter(function(x){return x&&b&&(x.id===b.userId||x.id===r.memberId)})[0]||null;
    var was=r.status;r.status='cancelled';r.cancelledAt=new Date().toISOString();r.cancelledByDeskR1006A=((S.adminUser||{}).empId||'desk');
    var got=0;try{if(window.kgmRestoreUpgradeMilesR1006A&&b)got=+window.kgmRestoreUpgradeMilesR1006A(r,b)||0}catch(_){}
    if(!got&&!r.refundDone0810K&&u){u.miles=(+u.miles||0)+(+r.miles||0);r.refundDone0810K=true;got=+r.miles||0}
    try{if(u&&window.kgmMilesSyncR1006A)window.kgmMilesSyncR1006A(u)}catch(_){}
    if(S.user&&u&&S.user.id===u.id)S.user.miles=u.miles;
    r.refundedMiles=got||(+r.miles||0);
    /* 已確認的升等：艙等改回原艙等，座位重新配 */
    try{
      var sg=r.seg||'out',from=r.fromClass||r.prevClsR922;
      if(b&&from&&was==='confirmed'&&cabOf(b[sg+'C'])===r.toCabin){
        b[sg+'C']=from;if(b.upgraded&&b.upgraded[sg])delete b.upgraded[sg];
        b.seats=b.seats||{};b.seats[sg]={};try{autoAssignSeat(b,sg)}catch(_){}
      }
    }catch(_){}
    try{if(b&&typeof _pushBkNotif==='function')_pushBkNotif(b,(Z()?'【里程升等已取消】':'[Upgrade cancelled] ')+r.code+' '+r.date+(Z()?('，已全額退還 '+N(r.refundedMiles)+' 哩。'):(' — '+N(r.refundedMiles)+' miles refunded.')))}catch(_){}
    try{if(typeof logAct==='function')logAct(Z()?'票務中心：取消里程升等':'Desk: upgrade cancelled',r.pnr+'　'+r.code+' '+r.date+'　'+N(r.refundedMiles)+' 哩')}catch(_){}
    try{save()}catch(_){}try{render()}catch(_){}
  };
  window.kgmDeskUpgR1006A=function(pnr,seg,type,to,miles,inst){
    if(!confirm(Z()?('幫旅客把這一段升等至'+cz(to)+(inst?'（立即確認）':'（目前無位，進候補、加收 10%）')+'，從會員帳戶扣 '+N(miles)+' 哩？'):('Upgrade to '+to+' using the member\'s miles?')))return;
    /* 櫃檯代旅客扣里程：先用自有里程，不足再用非自有里程（兩者不混用，跟旅客端同一套扣除規則） */
    var keep=S.mileageSourceR4,r=null;
    ['self','non_self'].some(function(src){
      S.mileageSourceR4=src;
      try{r=asOwner(bk(pnr),function(){return window.requestUpgrade(pnr,seg,type,to)})}catch(e){r={ok:false,why:e.message}}
      return r&&r.ok;
    });
    S.mileageSourceR4=keep;
    if(!r||!r.ok){alert((r&&r.why)||(Z()?'升等失敗。':'Upgrade failed.'));return}
    try{var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===r.id})[0];if(q)q.byDeskR1006A=((S.adminUser||{}).empId||'desk')}catch(_){}
    try{if(typeof logAct==='function')logAct(Z()?'票務中心：幫旅客里程升等':'Desk: upgrade applied',pnr+'　'+seg+' → '+to+'　'+N(r.miles||miles)+' 哩　'+(r.status||''))}catch(_){}
    alert(Z()?((r.status==='confirmed'?'升等已確認':'已加入升等候補')+'，扣除 '+N(r.miles||miles)+' 哩。'):('Upgrade '+(r.status||'')+'.'));
    try{save()}catch(_){}try{render()}catch(_){}
  };
})();
'''
RL('desk upg fns','kgm-0909E-r229',
 "/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){",
 DESK+"/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){")
R('desk replace withhold',
 "<div class=\"j-mile-hold\"><div><small>MILEAGE CONTROL</small><b>'+(ZJ()?'暫扣里程':'Withheld miles')+' · '+Number(b.milesWithheld||0).toLocaleString()+'</b></div><input id=\"jMilesHold\" class=\"inp\" type=\"number\" min=\"1\" placeholder=\"Miles\"><button class=\"btn\" '+(verifiedJ(b.pnr)?'':'disabled')+' onclick=\"kgmWithholdMiles0819J(\\''+AJ(b.pnr)+'\\',false)\">'+(ZJ()?'暫扣':'Withhold')+'</button><button class=\"btn\" '+(verifiedJ(b.pnr)?'':'disabled')+' onclick=\"kgmWithholdMiles0819J(\\''+AJ(b.pnr)+'\\',true)\">'+(ZJ()?'解除暫扣':'Release')+'</button></div>",
 "'+(window.kgmDeskUpgHtmlR1006A?window.kgmDeskUpgHtmlR1006A(b,verifiedJ(b.pnr)):'')+'")
RL('mile desk held -> cancel','kgm-0909E-r229',
 "    h+='<div class=\"k923-held\"><b>'+(Z?'暫扣里程（可改掛到改票後的新日期）':'Held miles')+'</b>'",
 "    h+='<div class=\"k923-held\"><b>'+(Z?'里程升等（不暫扣；可直接取消並全額退還）':'Mileage upgrades')+'</b>'   /* 1006A #21 */")
RL('mile desk move -> cancel btn','kgm-0909E-r229',
 "          +'<span class=\"k923-move\"><input id=\"k923d_'+E(x.id)+'\" type=\"date\" class=\"inp\">'\n"
 "          +'<input id=\"k923c_'+E(x.id)+'\" class=\"inp\" placeholder=\"'+(Z?'新航班（可不填）':'new flight')+'\" value=\"'+E(x.code)+'\">'\n"
 "          +'<button class=\"btn btn-sm btn-g\" onclick=\"kgmMileMoveR923(\\''+E(x.id)+'\\','\n"
 "          +'document.getElementById(\\'k923d_'+E(x.id)+'\\').value,'\n"
 "          +'document.getElementById(\\'k923c_'+E(x.id)+'\\').value)\">'+(Z?'改掛新日期':'Move')+'</button></span></div>';",
 "          +'<span class=\"k923-move\"><button class=\"btn btn-sm\" onclick=\"kgmDeskCancelUpgR1006A(\\''+E(x.id)+'\\')\">'   /* 1006A #21：不再改掛暫扣，直接取消並退還 */\n"
 "          +(Z?('取消里程升等（退還 '+(+x.miles||0).toLocaleString()+' 哩）'):'Cancel upgrade')+'</button></span></div>';")
save('p_h_desk.js','/* 1006A · 票務中心：不暫扣里程，直接取消里程升等／幫旅客重新升等 */\n')

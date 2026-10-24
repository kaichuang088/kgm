
/* ══ 1023A k23（r229 最後，k22 之後）══════════════════════════════════════
   使用者（1022A 交付後）：
   「員工票要加入Payload考量然後就是一個員工要可以同時候補很多航班」
   「圖一候補的名單MOCK要分航段！要的話是分開航段申請所以不會有全程！」
   「圖二這是TPE-SYD的航班欸 經濟只能到豪經啊為啥是商務 然後左下角的經濟而已是怎麼回事」
   「然後我希望按下候補成功要輸入座位（系統要自動核對可能有人了就無法選或是不正確倉等就不行）」 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function A(s){return String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
function T(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
function D(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function N(n){return Math.round(+n||0).toLocaleString('en-US')}
function AF(){try{return allF()}catch(_){try{return [].concat(FLIGHTS,S.customFlights||[])}catch(__){return []}}}
function bk(p){var k=String(p||'').toUpperCase();return (S.bookings||[]).filter(function(b){return b&&String(b.pnr||'').toUpperCase()===k})[0]||null}
var CZ={Resident:['Residence','Residence'],First:['頭等','First'],Business:['商務','Business'],Premium:['豪經','Premium'],Economy:['經濟','Economy']};
function cz(c){var x=CZ[c];return x?(z()?x[0]:x[1]):(c||'')}

/* ── ① 這一段有沒有賣豪經：r71 的規則把 TPE→SYD 這種「後面還有第五航權段」的第一段判成不賣，
      可是同一架飛機、同一段的 TPE→CHC 經停票有賣豪經，豪經客艙是真的有人坐 → 經過這一段的經停票有賣也算 ── */
window.kgmLegSellsPremR1023A=function(f,date){
  if(!f)return false;
  try{if(window.kgmSellsPremiumR71&&window.kgmSellsPremiumR71(f,date))return true}catch(_){}
  try{return AF().some(function(x){return x&&x.code===f.code&&x.via&&!x.partner&&((x.fr===f.fr&&x.via===f.to)||(x.via===f.fr&&x.to===f.to))&&window.kgmSellsPremiumR71(x,date)})}catch(_){return false}
};
/* 升等只往上一級：這一段（含經停票）有賣、這架飛機也有的下一個艙等（經濟 → 豪經 → 商務 → 頭等） */
window.kgmUpTargetR1023A=function(f,date,from){
  var t='';try{t=acftOfFlight(f.code,date,f.fr,f.to)||f.acft}catch(_){t=f&&f.acft}
  var cb=((AC[t]||{}).cabins)||{},has={Premium:!!cb.prem&&window.kgmLegSellsPremR1023A(f,date),Business:!!cb.biz,First:!!(cb.first||cb.suite)};
  var order=['Economy','Premium','Business','First'],i=order.indexOf(from||'Economy');
  for(var k=i+1;k<order.length;k++)if(has[order[k]])return order[k];
  return null;
};

/* ── ② Payload：跟航班資料頁的載重平衡同一個函式（r7 loadBalance7）—— 最大無燃油重量 MZFW 減去目前無燃油重量 ZFW
      （營運空重＋旅客 77 kg＋手提 7 kg＋托運行李）。員工票每人以 107 kg 計（77＋7＋一件 23 kg 托運）。 ── */
window.KGM_STAFF_KG_R1023A=107;
var PL23={};
function legOf(code,fr,to){var all=AF().filter(function(x){return x&&x.code===code&&!x.partner});return all.filter(function(x){return !x.via&&(!fr||x.fr===fr)&&(!to||x.to===to)})[0]||all.filter(function(x){return (!fr||x.fr===fr)&&(!to||x.to===to)})[0]||all[0]||null}
window.kgmPayloadR1023A=function(code,date,fr,to){
  var k=[code,date,fr||'',to||''].join('|'),c=PL23[k];if(c&&Date.now()-c.t<60000)return c.v;
  var v=null;
  try{
    var f0=legOf(code,fr,to);if(f0){
      var f=f0;try{f=(window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f0,date))||f0}catch(_){}
      var t=f.acft;try{t=acftOfFlight(code,date,f.fr,f.to)||t}catch(_){}
      var man=[];try{man=window.manifest7(f,date)||[]}catch(_){}
      if(!man.length){try{man=simManifest(code,date,Object.assign({},f,{acft:t}))||[]}catch(_){}}
      if(window.kgmLoadBalanceR1022A){window.kgmLoadBalanceR1022A(f,date,man,t);var lb=(window.KGM_LB_R1022A||{})[code+'|'+date+'|'+f.fr];
        if(lb)v={type:t,mzfw:lb.mzfw,zfw:lb.zfw,left:lb.mzfw-lb.zfw,util:lb.util,pax:man.length,bagN:lb.bagN,holdKg:lb.holdKg,man:man,f:f}}
    }
  }catch(_){}
  if(Object.keys(PL23).length>200)PL23={};
  PL23[k]={t:Date.now(),v:v};return v;
};
window.kgmPayloadClearR1023A=function(){PL23={}};

/* ── ③ 候補成功要輸入座位：座位要是這架飛機的座位、在那個艙等、而且沒有人（訂位旅客、DH 組員、已候補成功的人） ── */
function cellMap(t){var o={};try{(window.seatSections7(t)||[]).forEach(function(c){(c.rows||[]).forEach(function(r){(r.cells||[]).forEach(function(x){if(x&&!x.aisle&&x.id)o[String(x.id).toUpperCase()]=c.name})})})}catch(_){}return o}
function occupied(code,date,fr,to){
  var o={};
  /* 跟航班資料頁的座位圖同一份來源：旅客名單（manifest7）＋DH 組員＋已候補成功 */
  try{var pl=window.kgmPayloadR1023A(code,date,fr,to);((pl&&pl.man)||[]).forEach(function(x){if(x&&x.seat)o[String(x.seat).toUpperCase()]=(x.pnr?'PNR '+x.pnr:(z()?'已有旅客':'taken'))})}catch(_){}
  try{((S.crewPositioningR121||{})[[date,code,fr,to].join('|')]||[]).forEach(function(p){if(p&&p.seat)o[String(p.seat).toUpperCase()]='DH '+(p.name||p.empId)})}catch(_){}
  /* 員工票候補成功的座位不在旅客名單裡（manifest7 不列員工票），要另外算 */
  try{(S.bookings||[]).forEach(function(b){if(!b||!b.staffTix||!b.staffClearR1006A)return;var c=window.kgmStaffClearedR1006A&&window.kgmStaffClearedR1006A(b,code,date);if(!c)return;
    var L=[];String(c.seat||'').split(/[、,\s]+/).forEach(function(s){if(s)L.push(s)});
    L.forEach(function(s){o[String(s).toUpperCase()]=(z()?'員工票 ':'staff ')+b.pnr})})}catch(_){}
  try{var sim=S.sbSimR929||{};Object.keys(sim).forEach(function(id){var r=sim[id];if(r&&r.seatsR1023A&&r.code===code&&r.date===date&&(!fr||!r.fr||r.fr===fr))r.seatsR1023A.forEach(function(s){o[String(s).toUpperCase()]=(z()?'候補成功 ':'cleared ')+id})})}catch(_){}
  return o;
}
window.kgmSbSeatCheckR1023A=function(code,date,fr,to,cabin,ids){
  var t='';try{t=acftOfFlight(code,date,fr,to)}catch(_){}
  if(!t){var f0=legOf(code,fr,to);t=f0&&f0.acft||''}
  var cm=cellMap(t),occ=occupied(code,date,fr,to),seen={},bad=[];
  ids.forEach(function(id,i){id=String(id||'').toUpperCase().replace(/\s/g,'');var who=(z()?'第 '+(i+1)+' 位':'Pax '+(i+1));
    if(!id){bad.push(who+(z()?'：請輸入座位':': enter a seat'));return}
    if(!cm[id]){bad.push(id+(z()?' 不是這架 '+t+' 的座位':' is not a seat on this '+t));return}
    if(cm[id]!==cabin){bad.push(id+(z()?' 是'+cz(cm[id])+'艙，不是'+cz(cabin)+'艙':' is '+cm[id]+', not '+cabin));return}
    if(occ[id]){bad.push(id+(z()?' 已經有人（'+occ[id]+'）':' is taken ('+occ[id]+')'));return}
    if(seen[id]){bad.push(id+(z()?' 重複':' repeated'));return}
    seen[id]=1});
  return {ok:!bad.length,bad:bad,type:t};
};
function freeSeats(code,date,fr,to,cabin,n,grp){
  var t='';try{t=acftOfFlight(code,date,fr,to)}catch(_){}
  var occ=occupied(code,date,fr,to),out=[],blk=null;grp=Math.max(1,+grp||1);
  try{(window.seatSections7(t)||[]).forEach(function(c){if(c.name!==cabin)return;(c.rows||[]).forEach(function(r){
    var run=[];(r.cells||[]).forEach(function(x){
      if(!x||x.aisle||!x.id){run=[];return}
      var id=String(x.id).toUpperCase();if(occ[id]){run=[];return}
      run.push(id);if(!blk&&grp>1&&run.length>=grp)blk=run.slice(run.length-grp);   /* 1023A：同一訂位一起候補的，先找同一排、中間沒有走道的連號 */
      if(out.length<n)out.push(id)})})})}catch(_){}
  if(blk)out=blk.concat(out.filter(function(s){return blk.indexOf(s)<0})).slice(0,n);
  return out;
}
window.kgmSbSeatAskR1023A=function(id){S._sbSeatR1023A=(S._sbSeatR1023A===id)?'':id;S._sbSeatMsgR1023A='';S._sbSeatCabR1023A='';try{render()}catch(_){}};
window.kgmSbSeatCabR1023A=function(c){S._sbSeatCabR1023A=c;S._sbSeatMsgR1023A='';try{render()}catch(_){}};
window.kgmSbSeatPickR1023A=function(s){var L=[].slice.call(document.querySelectorAll('.k23-sbs input[data-k23]'));var e=L.filter(function(i){return !i.value})[0]||L[L.length-1];if(e)e.value=s};
/* 編輯列：哩程升等＝目標艙等；員工票＝預判的艙等（可以改成他申請的其他艙等） */
window.kgmSbSeatRowR1023A=function(r,f,kind){
  if(!r||S._sbSeatR1023A!==r.id||!f)return '';
  var cabs=kind==='up'?[r.toCabR1004B]:(r.cabsR1004B||['Economy']);
  var cab=kind==='up'?r.toCabR1004B:((S._sbSeatCabR1023A&&cabs.indexOf(S._sbSeatCabR1023A)>=0)?S._sbSeatCabR1023A:(r.clearCabR1004B||cabs[0]));
  var n=kind==='up'?Math.max(1,+r.pax||1):Math.max(1,+r.seatsR1004B||1);
  var sug=freeSeats(f.code,f.date,f.fr,f.to,cab,12,n),msg=S._sbSeatMsgR1023A||'';
  var ins='';for(var i=0;i<n;i++)ins+='<label>'+(n>1?(z()?'第 '+(i+1)+' 位':'Pax '+(i+1)):(z()?'座位':'Seat'))+'<input class="inp" data-k23="1" maxlength="4" placeholder="'+E(sug[i]||'12A')+'" style="text-transform:uppercase"></label>';
  return '<tr class="k23-sbs"><td></td><td colspan="4"><div class="k23-sbs-box">'
    +'<div class="k23-sbs-h"><b>'+(z()?'候補成功 · 輸入座位':'Clear · enter seat')+'</b><span>'+E(r.name)+' · '+(z()?'艙等 ':'Cabin ')+'</span>'
      +(cabs.length>1?cabs.map(function(c){return '<button type="button" class="'+(c===cab?'on':'')+'" onclick="kgmSbSeatCabR1023A(\''+A(c)+'\')">'+E(cz(c))+'</button>'}).join(''):'<i>'+E(cz(cab))+'</i>')
    +'</div>'
    +'<div class="k23-sbs-f">'+ins
      +'<button class="btn btn-sm btn-g" onclick="kgmSbSeatConfirmR1023A(\''+A(r.id)+'\',\''+kind+'\',\''+A(cab)+'\')">'+(z()?'確認座位':'Confirm')+'</button>'
      +'<button class="btn btn-sm" onclick="kgmSbSeatAskR1023A(\''+A(r.id)+'\')">'+(z()?'取消':'Cancel')+'</button></div>'
    +(sug.length?'<div class="k23-sbs-sug"><small>'+(z()?cz(cab)+'艙目前空位：':'Free seats: ')+'</small>'+sug.map(function(s){return '<button type="button" onclick="kgmSbSeatPickR1023A(\''+s+'\')">'+s+'</button>'}).join('')+'</div>':'<div class="k23-sbs-sug"><small>'+(z()?cz(cab)+'艙目前沒有空位。':'No free seat in this cabin.')+'</small></div>')
    +(msg?'<div class="k23-sbs-msg">'+E(msg)+'</div>':'')
    +'</div></td></tr>';
};
window.kgmSbSeatConfirmR1023A=function(id,kind,cab){
  var p=String(S.opsSelectedR7||'').split('|'),code=p[0],date=p[1],fr=p[2],to=p[3];if(!code)return;
  var ids=[].slice.call(document.querySelectorAll('.k23-sbs input[data-k23]')).map(function(i){return String(i.value||'').trim().toUpperCase()});
  var chk=window.kgmSbSeatCheckR1023A(code,date,fr,to,cab,ids);
  if(!chk.ok){S._sbSeatMsgR1023A=chk.bad.join(z()?'；':'; ');try{render()}catch(_){}return}
  var sim=/^SB[US]929/.test(String(id)),done=false;
  try{
    if(sim){
      window.kgmSbSimDecideR929(id,'ok');
      var rec=(S.sbSimR929||{})[id];if(rec){rec.seatsR1023A=ids;rec.seat=ids.join('、');rec.cabin=cab;rec.cabinR1023A=cab;rec.code=code;rec.date=date;rec.fr=fr;rec.to=to}done=true;   /* 只留輸入的座位（原本另外隨機配一個） */
    }else if(kind==='up'){
      var q=(S.upgradeReqs||[]).filter(function(x){return x&&x.id===id})[0],b0=q&&bk(q.pnr),sg0=q&&(q.seg||'out'),keep=b0&&b0.seats&&b0.seats[sg0]?JSON.parse(JSON.stringify(b0.seats[sg0])):null;
      /* 升等成功原本由系統隨機配位（autoAssignSeat），旅客通知與信件都寫那個位子 → 這裡改成地勤輸入的座位，通知寫的才會是真的位子 */
      var oa=window.autoAssignSeat;
      window.autoAssignSeat=function(b,seg){if(q&&q.legR1012A){if(keep){b.seats=b.seats||{};b.seats[seg]=JSON.parse(JSON.stringify(keep))}}else{b.seats=b.seats||{};b.seats[seg]={};ids.forEach(function(s){b.seats[seg][s]=true})}return ids.join('、')};
      try{window.adminDecideUpgrade0810K(id,true)}finally{window.autoAssignSeat=oa}
      try{var R0='（候補成功的座位由系統隨機分配，無法更改）',R1='（座位由地勤於候補成功時指定）';
        if(b0&&b0.notifs&&b0.notifs[0]&&b0.notifs[0].msg)b0.notifs[0].msg=String(b0.notifs[0].msg).replace(R0,R1);
        (S.notifs||[]).slice(0,3).forEach(function(n){if(n&&n.message&&n.message.indexOf(q.code)>=0)n.message=String(n.message).replace(R0,R1)})}catch(_){}
      if(q&&String(q.status)==='confirmed'){var b=bk(q.pnr),sg=q.seg||'out';
        if(b){if(q.legR1012A){b.legSeatR1012A=b.legSeatR1012A||{};(b.legSeatR1012A[sg]=b.legSeatR1012A[sg]||{})[q.legR1012A]=ids.slice()}else{b.seats=b.seats||{};b.seats[sg]={};ids.forEach(function(s){b.seats[sg][s]=true})}}
        q.seat=ids.join('、');q.seatByR1023A=(S.adminUser||{}).empId||'';done=true}
    }else{
      var b2=bk(id);if(b2){window.kgmStaffClearR1006A(b2.pnr,code,date,cab,ids);done=!!(b2.staffClearR1006A&&Object.keys(b2.staffClearR1006A).length)}
    }
  }catch(e){S._sbSeatMsgR1023A=String(e&&e.message||e)}
  if(done){S._sbSeatR1023A='';S._sbSeatMsgR1023A='';try{window.kgmPayloadClearR1023A()}catch(_){}
    try{logAct(z()?'候補成功・指定座位':'Standby cleared · seat',id+' '+code+' '+date+' '+cab+' '+ids.join(','))}catch(_){}}
  try{save()}catch(_){}try{render()}catch(_){}
};

/* ── ④ 一位員工同時候補很多班：員工票訂位可以「同時候補」同一條航線前後一天的其他航班（b.staffTix.altR1023A）；
      任一班候補成功（地勤按「候補成功・配位」）→ 訂位改到那一班、其他班自動不再列出 ── */
function seasonal(f,date){try{return (window.kgmSeasonFlightR48&&window.kgmSeasonFlightR48(f,date))||f}catch(_){return f}}
function flies(f,date){try{return flyOn(f,new Date(date+'T12:00:00'))}catch(_){return true}}
function cleared(b){return !!(b&&b.staffClearR1006A&&Object.keys(b.staffClearR1006A).length)}
window.kgmStxAltOnR1023A=function(b,code,date){
  if(!b||!b.staffTix||cleared(b))return false;
  return (b.staffTix.altR1023A||[]).some(function(a){return a&&a.code===code&&a.date===date});
};
function altCands(b,seg){
  var f=b&&b[seg+'F'];if(!f||!f.date)return [];
  var out=[];[-1,0,1].forEach(function(k){var d=D(f.date,k);if(d<T())return;
    AF().forEach(function(x){if(!x||x.partner||x.codeshare||x.fr!==f.fr||x.to!==f.to||!/^KX\d/.test(String(x.code)))return;if(x.code===f.code&&d===f.date)return;if(!flies(x,d))return;
      var s=seasonal(x,d);if(out.some(function(o){return o.code===x.code&&o.date===d}))return;out.push({code:x.code,date:d,fr:x.fr,to:x.to,dep:s.dep||x.dep,arr:s.arr||x.arr,seg:seg})})});
  out.sort(function(a,b){return (a.date+a.dep).localeCompare(b.date+b.dep)});
  return out.slice(0,12);
}
window.kgmStxAltToggleR1023A=function(pnr,seg,code,date){
  var b=bk(pnr);if(!b||!b.staffTix||cleared(b))return;
  var L=b.staffTix.altR1023A=b.staffTix.altR1023A||[],i=-1;L.forEach(function(a,j){if(a.code===code&&a.date===date&&(a.seg||'out')===seg)i=j});
  if(i>=0)L.splice(i,1);else{var c=altCands(b,seg).filter(function(a){return a.code===code&&a.date===date})[0];if(c)L.push(c)}
  try{save()}catch(_){}try{render()}catch(_){}
};
function altHtml(b){
  try{
    if(!b||!b.staffTix||b.dhR929)return '';
    var segs=['out','inb'].filter(function(k){return b[k+'F']});if(!segs.length)return '';
    var L=b.staffTix.altR1023A||[],done=cleared(b);
    var body=segs.map(function(seg){var f=b[seg+'F'],c=altCands(b,seg);
      return '<div class="k23-alt-seg"><div class="k23-alt-h"><b>'+E(f.code)+'</b> '+E(f.fr)+' → '+E(f.to)+' · '+E(f.date)+' <small>'+(z()?'（原訂）':'(booked)')+'</small></div>'
        +(c.length?'<div class="k23-alt-list">'+c.map(function(a){var on=L.some(function(x){return x.code===a.code&&x.date===a.date&&(x.seg||'out')===seg});
          return '<label class="'+(on?'on':'')+'"><input type="checkbox"'+(on?' checked':'')+(done?' disabled':'')+' onchange="kgmStxAltToggleR1023A(\''+A(b.pnr)+'\',\''+seg+'\',\''+A(a.code)+'\',\''+A(a.date)+'\')"><b>'+E(a.code)+'</b><span>'+E(a.date.slice(5).replace('-','/'))+' '+E(a.dep)+'–'+E(a.arr)+'</span></label>'}).join('')+'</div>'
          :'<div class="k23-alt-none">'+(z()?'前後一天沒有同航線的其他航班。':'No other flight on this route ±1 day.')+'</div>')+'</div>'}).join('');
    return '<section class="k56-block k23-alt"><header><em>MULTI-FLIGHT STANDBY</em>'+(z()?'同時候補其他航班':'Also list on other flights')+'</header><div class="k23-alt-b">'
      +'<p>'+(z()?'員工票可以同時列在同一條航線前後一天的其他航班上（各班依當班順位候補）。任一班候補成功，訂位就改到那一班，其他班自動取消候補。':'List on other flights on the same route (±1 day). Once you clear on one flight, the booking moves to it and the other listings are released.')+'</p>'
      +(done?'<div class="k23-alt-done">'+(z()?'已候補成功，其他班已自動取消。':'Cleared — other listings released.')+'</div>':'')
      +body+'</div></section>';
  }catch(_){return ''}
}
(function wrapNotice(n){var g=window.kgmStaffNoticeHtmlR929;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapNotice(n+1)},500);return}if(g.__r1023A)return;
  var w=function(b){return String(g.apply(this,arguments)||'')+altHtml(b)};w.__r1023A=1;window.kgmStaffNoticeHtmlR929=w})(0);
/* 候補成功：在「同時候補」的那一班成功 → 先把訂位那一段改到那一班；有輸入座位就用輸入的座位（不再隨機配） */
(function wrapClear(n){var g=window.kgmStaffClearR1006A;if(typeof g!=='function'){if(n<40)setTimeout(function(){wrapClear(n+1)},500);return}if(g.__r1023A)return;
  var w=function(pnr,code,date,cab,seats){
    var b=bk(pnr);
    try{if(b&&b.staffTix){var on=['out','inb'].some(function(k){var f=b[k+'F'];return f&&f.code===code&&f.date===date});
      if(!on){var a=(b.staffTix.altR1023A||[]).filter(function(x){return x&&x.code===code&&x.date===date})[0];
        if(a){var sg=a.seg||'out',old=b[sg+'F'],src=AF().filter(function(x){return x&&x.code===code&&x.fr===a.fr&&x.to===a.to&&!x.partner})[0];
          if(src&&old){var s=seasonal(src,date);b[sg+'F']=Object.assign({},old,{code:code,fr:src.fr,to:src.to,dep:s.dep||src.dep,arr:s.arr||src.arr,dd:s.dd||src.dd||0,dur:s.dur||src.dur,date:date,acft:src.acft});
            b.staffTix.movedR1023A={seg:sg,from:old.code+' '+old.date,to:code+' '+date,at:new Date().toISOString()}}}}}}catch(_){}
    if(seats&&seats.length){var a0=window.kgmAutoSeatR1006A;window.kgmAutoSeatR1006A=function(bb,sg){bb.seats=bb.seats||{};bb.seats[sg]={};seats.forEach(function(s){bb.seats[sg][s]=true});return seats.join('、')};
      try{return g.call(this,pnr,code,date,cab)}finally{window.kgmAutoSeatR1006A=a0}}
    return g.call(this,pnr,code,date,cab)};
  w.__r1023A=1;window.kgmStaffClearR1006A=w})(0);

var CSS='.k23-sbs td{background:#F6FAF8!important}.k23-sbs-box{border:1px solid #CFE0D7;border-radius:12px;padding:10px 12px;background:#fff}'
 +'.k23-sbs-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}.k23-sbs-h b{font-size:12.5px;color:#123C32}.k23-sbs-h span{font-size:11.5px;color:#5F6B66}'
 +'.k23-sbs-h i{font-style:normal;font-size:11px;font-weight:800;padding:2px 9px;border-radius:99px;background:#EEF3F0;color:#1F6F4A}.k23-sbs-h button{font-size:11px;font-weight:800;padding:3px 10px;border-radius:99px;border:1px solid #D6DEDB;background:#fff;color:#45574F;cursor:pointer}.k23-sbs-h button.on{background:#1F4E46;border-color:#1F4E46;color:#fff}'
 +'.k23-sbs-f{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap}.k23-sbs-f label{display:flex;flex-direction:column;gap:3px;font-size:10.5px;color:#6D7873;font-weight:700}.k23-sbs-f input{width:86px;height:34px;font:800 13px ui-monospace,Menlo,monospace}'
 +'.k23-sbs-sug{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;align-items:center}.k23-sbs-sug small{font-size:10.5px;color:#6D7873;margin-right:4px}.k23-sbs-sug button{font:800 11px ui-monospace,Menlo,monospace;padding:3px 8px;border-radius:7px;border:1px solid #D6DEDB;background:#FBFCFB;color:#1F4E46;cursor:pointer}'
 +'.k23-sbs-msg{margin-top:8px;padding:7px 10px;border-radius:8px;background:#FDEDEA;color:#A3271C;font-size:11.5px;font-weight:700}'
 +'.k23-pl small{display:inline;font-size:12px;margin-left:2px}.k23-pl.low b{color:#A3271C}'
 +'.k23-alt-b{padding:12px 22px 18px;font-size:12.5px;color:#5f6b66;line-height:1.7}.k23-alt-seg{margin-top:10px}.k23-alt-h{font-size:12.5px;color:#123C32;margin-bottom:6px}.k23-alt-h small{color:#8A948F}'
 +'.k23-alt-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:6px}.k23-alt-list label{display:flex;align-items:center;gap:6px;border:1px solid #E1E8E3;border-radius:10px;padding:7px 9px;background:#fff;cursor:pointer;font-size:12px}.k23-alt-list label.on{border-color:#1F6F4A;background:#F1F8F4}'
 +'.k23-alt-list b{color:#123C32}.k23-alt-list span{color:#5F6B66;font-size:11px;white-space:nowrap}.k23-alt-none{font-size:11.5px;color:#8A948F}.k23-alt-done{margin-top:6px;padding:8px 10px;border-radius:9px;background:#E7F4EE;color:#0B6B48;font-weight:800}';
try{if(!document.getElementById('k23-css')){var st=document.createElement('style');st.id='k23-css';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}}catch(_){}
})();

/* ══ 1023A：夥伴聯營一整班都要掛（使用者：「通常聯營航班會是整條航線不會是單獨航班 然後你確定CX564是A21N??」）
   CX564 是 香港→台北→大阪關西 同一班、CX565 是 大阪→台北→香港 同一班，原本只掛台北⇄大阪那段；補上香港⇄台北那段。
   機型：1020B 用「航空公司＋距離」猜的（台北⇄大阪／東京 < 2,800 km → A321neo）是錯的，同一班號前後兩段一定同一架飛機；
   CX450／451／564／565 一律 Boeing 777-300（2026 年 Trip.com、AirNav Radar、Planemapper 的實際紀錄）。
   時刻：CX564 香港 08:10 → 台北 10:00、CX565 台北 19:15 → 香港 21:10（Planemapper／Avionio 2026-07）。 ══ */
(function(){
  var EQ23={CX450:'Boeing 777-300',CX451:'Boeing 777-300',CX564:'Boeing 777-300',CX565:'Boeing 777-300'};
  var ADD23=[{code:'KX9898',like:'KX9878',fr:'HKG',to:'TPE',dep:'08:10',arr:'10:00'},{code:'KX9899',like:'KX9879',fr:'TPE',to:'HKG',dep:'19:15',arr:'21:10'}];
  function fix(){
    try{
      ADD23.forEach(function(a){
        if(FLIGHTS.some(function(f){return f&&f.code===a.code}))return;
        var src=FLIGHTS.filter(function(f){return f&&f.code===a.like})[0];if(!src)return;
        var f=JSON.parse(JSON.stringify(src));f.code=a.code;f.fr=a.fr;f.to=a.to;f.dep=a.dep;f.arr=a.arr;f.dd=0;f.via=null;f.days=src.days;f.addedR1023A=true;
        try{f.dur=blockMin(f.fr,f.to,f.dep,f.arr,0);f.durStr=durStr(f.dur)}catch(_){}
        f.acft='CS_'+a.code;try{AC[f.acft]=Object.assign({},AC[src.acft]||{},{nm:(src.operator||'')+' · '+(src.operatorFlight||'')})}catch(_){}
        FLIGHTS.push(f);
      });
      FLIGHTS.forEach(function(f){if(f&&f.partner&&EQ23[f.operatorFlight])f.partnerEquipment=EQ23[f.operatorFlight]});
      try{if(typeof CONN_HUBS!=='undefined'&&CONN_HUBS.indexOf('TPE')<0)CONN_HUBS.push('TPE')}catch(_){}
    }catch(_){}
  }
  fix();setTimeout(fix,300);setTimeout(fix,3000);
  var pe=window.partnerEquipment0809D;
  if(pe&&!pe.k23)(window.partnerEquipment0809D=function(f){if(f&&f.partner&&EQ23[f.operatorFlight])return EQ23[f.operatorFlight];return pe.apply(this,arguments)}).k23=1;
})();

/* ══ 1023A：模擬訂位的資料不能是「—」或空的（使用者：「後台你MOCK的定位資料很好 但是資料不能是 - 或是空的 不合理」）
   模擬旅客轉成正式訂位（r229 1010A simMat10）只帶了姓名，Email／電話／護照／付款方式都是空的，訂購時間又固定 09:00 UTC。
   這裡依訂位代號固定產生（同一個代號每次都一樣），只補空的欄位、不改已經有的：
   國籍（沒寫的依航線抽）、生日、護照號碼（各國格式）、Email、行動電話（國碼依國籍）、付款方式（卡別＋末四碼，不存完整卡號）、
   訂購時間（原本固定 09:00 → 依代號分散到一天中的時間），訂購地點就會依電話國碼推定（kgmBookedWhereR1022A）。
   沒有會員的旅客 Member ID 寫「非會員」，沒加購寫「無加購服務」。 ══ */
(function(){
  var NI={TW:['+886','9',8,function(h){return '3'+dg(8,h)}],JP:['+81','90',8,function(h){return 'T'+String.fromCharCode(65+h%26)+dg(7,h)}],
    KR:['+82','10',8,function(h){return 'M'+dg(8,h)}],HK:['+852','9',7,function(h){return 'K'+dg(8,h)}],SG:['+65','8',7,function(h){return 'E'+dg(7,h)+String.fromCharCode(65+h%26)}],
    TH:['+66','8',8,function(h){return 'AA'+dg(7,h)}],US:['+1','415',7,function(h){return '5'+dg(8,h)}],CA:['+1','604',7,function(h){return 'A'+dg(6,h)+String.fromCharCode(65+h%26)+String.fromCharCode(65+(h>>>5)%26)}],
    AU:['+61','4',8,function(h){return 'PA'+dg(7,h)}],NZ:['+64','21',7,function(h){return 'LA'+dg(6,h)}],GB:['+44','7',9,function(h){return '5'+dg(8,h)}],
    FR:['+33','6',8,function(h){return dg(2,h)+'AB'+dg(5,h>>>3)}],DE:['+49','15',9,function(h){return 'C'+dg(8,h)}],MY:['+60','12',7,function(h){return 'A'+dg(8,h)}],
    VN:['+84','9',8,function(h){return 'C'+dg(7,h)}],PH:['+63','917',7,function(h){return 'P'+dg(7,h)+'A'}],ID:['+62','812',8,function(h){return 'B'+dg(7,h)}],
    QA:['+974','5',7,function(h){return dg(8,h)}],IT:['+39','3',9,function(h){return 'YA'+dg(7,h)}],ES:['+34','6',8,function(h){return 'PA'+dg(6,h)}],NL:['+31','6',8,function(h){return 'NW'+dg(7,h)}]};
  var N3={TWN:'TW',JPN:'JP',KOR:'KR',HKG:'HK',SGP:'SG',THA:'TH',USA:'US',CAN:'CA',AUS:'AU',NZL:'NZ',GBR:'GB',FRA:'FR',DEU:'DE',MYS:'MY',VNM:'VN',PHL:'PH',IDN:'ID',QAT:'QA',ITA:'IT',ESP:'ES',NLD:'NL'};
  var AP={NRT:'JP',HND:'JP',KIX:'JP',NGO:'JP',FUK:'JP',CTS:'JP',OKA:'JP',ICN:'KR',GMP:'KR',PUS:'KR',HKG:'HK',MFM:'HK',SIN:'SG',BKK:'TH',CNX:'TH',HKT:'TH',LAX:'US',SFO:'US',SEA:'US',JFK:'US',ORD:'US',LAS:'US',HNL:'US',BOS:'US',DFW:'US',IAH:'US',YVR:'CA',YYZ:'CA',
    SYD:'AU',MEL:'AU',BNE:'AU',PER:'AU',AKL:'NZ',CHC:'NZ',LHR:'GB',CDG:'FR',FRA:'DE',MUC:'DE',KUL:'MY',SGN:'VN',HAN:'VN',MNL:'PH',CGK:'ID',DPS:'ID',DOH:'QA',FCO:'IT',MXP:'IT',MAD:'ES',BCN:'ES',AMS:'NL',VIE:'DE'};
  var MAIL={TW:['gmail.com','yahoo.com.tw','hotmail.com'],JP:['gmail.com','yahoo.co.jp','icloud.com'],KR:['naver.com','gmail.com'],HK:['gmail.com','yahoo.com.hk'],AU:['gmail.com','outlook.com.au','bigpond.com']};
  function dg(n,h){var o='',x=h>>>0;for(var i=0;i<n;i++){x=(x*1103515245+12345)>>>0;o+=String((x>>>16)%10)}return o}
  function hs(t){var h=2166136261;t=String(t||'');for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
  function natOf(p,b,h){var n=String(p.nat||p.nationality||'').toUpperCase();if(N3[n])n=N3[n];if(NI[n])return n;
    var f=b.outF||{},o=AP[f.fr]||AP[f.to]||'';return (o&&h%100<38)?o:'TW'}
  function mock(b){return !!(b&&(b.simR1010A||b.csSimR1012A||b.simulated||b.caseSimR1022A||b.mockR1023A))}
  window.kgmMockFillR1023A=function(b){
    if(!mock(b)||!Array.isArray(b.paxList))return false;var ch=false,h0=hs(b.pnr);
    b.paxList.forEach(function(p,i){if(!p)return;var h=hs(b.pnr+'#'+i),n=natOf(p,b,h0),ni=NI[n];
      if(!p.nat&&!p.nationality){p.nat=n;ch=true}
      if(!p.dob){var y=+todayISO().slice(0,4)-(22+h%46);p.dob=y+'-'+('0'+(1+(h>>>4)%12)).slice(-2)+'-'+('0'+(1+(h>>>8)%28)).slice(-2);ch=true}
      if(!p.passport){p.passport=ni[3](h);ch=true}
      if(!p.passportExp){p.passportExp=(+todayISO().slice(0,4)+2+h%7)+'-'+('0'+(1+(h>>>3)%12)).slice(-2)+'-'+('0'+(1+(h>>>6)%28)).slice(-2);ch=true}
      if(!p.email){var fn=String(p.firstName||'').toLowerCase().replace(/[^a-z]/g,''),ln=String(p.lastName||'').toLowerCase().replace(/[^a-z]/g,'');
        var dm=(MAIL[n]||['gmail.com','outlook.com'])[h%(MAIL[n]||[0,0]).length];p.email=((fn||'pax')+'.'+(ln||'kgm')+(10+h%89))+'@'+dm;ch=true}
      if(!p.phone){p.countryCode=ni[0];p.phone=ni[1]+dg(ni[2],h^0x5bd1);ch=true}
      if(!p.countryCode){p.countryCode=ni[0];ch=true}
    });
    var p0=b.paxList[0]||{};
    if(!b.contactEmail){b.contactEmail=p0.email;ch=true}
    if(!b.contactPhone){b.contactPhone=(p0.countryCode||'')+(p0.phone||'');ch=true}
    if(!b.paymentMethod&&!b.cardLast4&&!b.isAward){var br=['VISA','Mastercard','JCB','American Express'][h0%4];b.paymentMethod=br+' •••• '+dg(4,h0^0x2c1b);b.cardBrandR1023A=br;ch=true}
    if(b.simR1010A&&/T09:00:00(\.000)?Z$/.test(String(b.bookedAt||''))){var t=Date.parse(b.bookedAt);if(t>0){var mm=(h0%1440)-540;var nt=new Date(t+mm*60000);if(nt>new Date())nt=new Date(Date.now()-(1+h0%48)*3600e3);b.bookedAt=nt.toISOString();ch=true}}
    return ch;
  };
  /* 模擬旅客轉成正式訂位當下就補；之前已經轉過的，打開定位管理那一筆時補（kgmMockFillR1023A 在 r49 detailsJ 開頭也會呼叫） */
  setTimeout(function(){try{var n=0;(S.bookings||[]).forEach(function(b){if(window.kgmMockFillR1023A(b))n++});if(n)save()}catch(_){}},6000);
  var sm=window.kgmSimMaterializeR1010A;
  if(typeof sm==='function'&&!sm.k23){var w=function(){var b=sm.apply(this,arguments);try{if(window.kgmMockFillR1023A(b))save()}catch(_){}return b};w.k23=1;window.kgmSimMaterializeR1010A=w}
})();

/* ══ 1023A：非自願降艙案件直接寫退多少錢（使用者：「沒有加50%這一回事然後要直接在那裡寫要退多少錢」）
   1022A 模擬案件的步驟寫「退還該航段商務與豪經票價差額，另加 50% 補償」→ 改成用這筆訂位實際付的商務艙票價，
   減掉同一班、同一天、同票價方案（基本／超值／豪華）的豪華經濟艙票價（訂票頁同一個 owPrice），寫出金額與退款方式。
   已經產生過的案件（存在 S.staffCasesR1007A）也一起改。 ══ */
(function(){
  function fam(c){var x=FARES[c]||{};return x.familyR48||x.family||''}
  function quote(c){
    var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===c.pnr})[0];if(!b||!b.outF)return null;
    var g=c.segment||{},f=b.outF,d=g.date||f.date,n=Math.max(1,(b.paxList||[]).length),code=b.outC;
    var fo=Object.assign({},f,{date:d}),paid=0,prem=0,pc='';
    try{paid=Math.round(owPrice(fo,code,1)||0)}catch(_){}
    if(!(paid>0))paid=Math.round((+b.total||0)/n);
    var fm=fam(code);
    Object.keys(FARES).forEach(function(k){var x=FARES[k];if(!x||x.cabin!=='Premium')return;if(fm&&fam(k)!==fm)return;var v=0;try{v=Math.round(owPrice(fo,k,1)||0)}catch(_){}if(v>0&&(!prem||v<prem)){prem=v;pc=k}});
    if(!(paid>0&&prem>0))return null;
    var diff=Math.max(0,paid-prem);
    return {paid:paid,prem:prem,pc:pc,diff:diff,code:code,pay:b.paymentMethod||(b.cardLast4?'•••• '+b.cardLast4:'')};
  }
  function nt(v){return 'NT$'+Number(v).toLocaleString()}
  window.kgmDowngradeQuoteR1023A=quote;
  function fix(){
    var L=S.staffCasesR1007A||[],ch=0;
    L.forEach(function(c){
      if(!c||c.type!=='invol_downgrade'||c.refundR1023A)return;
      var st=(c.progress||[]).filter(function(x){return x&&/50%|票價差額/.test(String(x.label||''))})[0];if(!st)return;
      try{if(window.kgmMockFillR1023A){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===c.pnr})[0];if(b)window.kgmMockFillR1023A(b)}}catch(_){}
      var q=quote(c);if(!q)return;
      st.label='計算退款：本航段商務艙票價 '+nt(q.paid)+'（'+q.code+'）－ 豪華經濟艙同方案票價 '+nt(q.prem)+'（'+q.pc+'）＝ 退還 '+nt(q.diff);
      (c.notes||[]).forEach(function(n){if(n&&/差額與補償/.test(String(n.text||'')))n.text='退還 '+nt(q.diff)+'，退回原付款方式'+(q.pay?'（'+q.pay+'）':'')+'，約 7–14 個工作天。'});
      c.refundR1023A={amount:q.diff,curr:'TWD',paid:q.paid,premium:q.prem,from:q.code,to:q.pc};ch++;
    });
    if(ch)try{save()}catch(_){}
    return ch;
  }
  window.kgmCaseRefundFixR1023A=fix;
  (function loop(n){setTimeout(function(){try{fix()}catch(_){}if(n<40)loop(n+1)},n?5000:15000)})(0);
  var cs=window.kgmCaseSimR1022A;if(typeof cs==='function'&&!cs.k23){var w=function(){var r=cs.apply(this,arguments);try{if(fix())render()}catch(_){}return r};w.k23=1;window.kgmCaseSimR1022A=w}
})();

/* ══ 1023A：換機型要真的同步（使用者：「我在後台調整航班動態機型現在看來販售系統和航班動態都不會更新喔」
   「後台航班動態編輯要可以看到是哪一台飛機飛的…改機型的話系統要自動列出來有哪些是available的在那機型中然後管理員選一台班表也會更新」
   「飛機排班也要可以看到哪一天哪一台飛機是完全沒有航班的」）
   根因：後台改機型會寫進人工換機紀錄 S.acftSub（setFlightAcftOnDate，也會通知旅客、重新配位），
        但 1018A 起最外層的機型（MAP18 定案、季節、各航線上限那幾層）不看這份紀錄，販售、航班動態、機隊都還是原機型；
        競標頁、旅客通知讀的卻是換機紀錄 → 兩個來源不一致。
   ① 最外層 acftOfFlight：當天有「人工」換機（manual、不是系統自動）就以它為準（只有 setFlightAcftOnDate 寫得進去，
      受保護航班（BKK／TSA／UKB／固定機型）原本就會被擋）。
   ② 後台航班動態編輯：機型選單只列 KGM 機隊機型（原本混了幾十個夥伴航空假機型），上面寫目前機身；選了機型就列出
      這個機型當天每一架的狀態（可用／時間衝突／不在出發站／維修／退役），只有可用的能選；存檔＝換機型（販售、航班動態、
      旅客通知、重新配位同一個 setFlightAcftOnDate）＋把這一班（和同一架接著飛的回程）從原機身搬到選的那一架。
   ③ 飛機排班：「閒置機身」表 —— 這個機型每一架未來 14 天每天有幾段，完全沒排航班的標出來。
   ④ 航班機身查詢：同一班號兩列時刻（KX4／KX24 依星期不同列）季節表只存第一列，兩列都變成一樣 → 重複列拿掉。
   ⑤ Residence 機型異動檢查是一次性、不可逆的：只在機型定案後（整年機隊重排做完）才判斷；之前誤判的（起飛前、現在機型其實有 Residence）撤回。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function allF(){return [].concat(FLIGHTS,S.customFlights||[])}
  function man(code,date){var x=(S.acftSub||{})[code+'_'+date];return x&&x.manual&&!x.auto&&x.sub&&typeof AC!=='undefined'&&AC[x.sub]?x.sub:''}
  /* ① */
  function acWrap(){var a0=window.acftOfFlight;if(typeof a0!=='function'||a0.__k23)return;
    var w=function(code,date){var m=date?man(code,date):'';if(m)return m;return a0.apply(this,arguments)};
    try{Object.keys(a0).forEach(function(k){if(!(k in w))w[k]=a0[k]})}catch(_){}
    w.__k23=1;window.acftOfFlight=w;try{acftOfFlight=w}catch(_){}}
  acWrap();setTimeout(acWrap,0);setTimeout(acWrap,4000);setTimeout(acWrap,15000);
  function flush(){['kgmClearPerfCacheR44','kgmPayloadClearR1023A'].forEach(function(n){try{if(window[n])window[n]()}catch(_){}})}
  /* 機身工具 */
  function mins(t){var p=String(t||'0:0').split(':');return (+p[0]||0)*60+(+p[1]||0)}
  function dnum(d){return Math.round(Date.parse(d+'T00:00:00Z')/864e5)}
  function span(x){var a=dnum(x.date)*1440+mins(x.dep),b=dnum(x.date)*1440+(+x.dd||0)*1440+mins(x.arr);if(b<a)b+=1440;return [a,b]}
  function routeOf(x){return String(x.route||((x.fr||'')+'→'+(x.to||'')))}
  function tailOf(code,date,fr,to){var TA=S.tailAssign||{},hit='';Object.keys(TA).some(function(t){return (TA[t]||[]).some(function(x){if(x&&x.code===code&&x.date===date&&(!fr||routeOf(x)===fr+'→'+to)){hit=t;return true}})});return hit}
  function typeOfTail(t){try{return window._typeOfTail(t)||''}catch(_){return ''}}
  function fam(t){t=String(t||'');return t==='A339L'||t==='A339R'?'A339':(t==='A21X'?'A21N':t)}
  function fleetTypes(){var out=[];try{Object.keys(AC).forEach(function(k){if(/^(CS_|KX|PARTNER|_)/.test(k)||k==='EQV')return;var n=0;try{n=(tailsFor(k)||[]).length}catch(_){}if(n)out.push(k)})}catch(_){}return out}
  function mx(t,d){if((S.tailStatus||{})[t]==='maintenance')return true;return (S.fleetMaintenanceR830||[]).some(function(m){return m&&m.tail===t&&d>=m.from&&d<=m.until})}
  function gone(t,d){try{return !!(window.kgmTailUnavailR928&&window.kgmTailUnavailR928(t,d))}catch(_){return false}}
  /* 這一班要搬的段：本段＋同一架緊接著的回程（同一天或隔天、起訖對調） */
  function legsToMove(code,date,fr,to){var t=tailOf(code,date,fr,to),L=t?((S.tailAssign||{})[t]||[]).slice():[],out=[];
    L.sort(function(a,b){return span(a)[0]-span(b)[0]});
    for(var i=0;i<L.length;i++){var x=L[i];if(x.code===code&&x.date===date&&(!fr||routeOf(x)===fr+'→'+to)){out.push(x);var n=L[i+1];if(n&&routeOf(n)===(to||routeOf(x).split('→')[1])+'→'+(fr||routeOf(x).split('→')[0])&&span(n)[0]-span(x)[1]<36*60)out.push(n);break}}
    return {tail:t,legs:out};
  }
  function availTails(type,code,date,fr,to){
    var mv=legsToMove(code,date,fr,to),legs=mv.legs.length?mv.legs:[{code:code,date:date,route:fr+'→'+to,dep:(allF().filter(function(f){return f.code===code&&f.fr===fr&&f.to===to})[0]||{}).dep||'00:00',arr:'23:59',dd:0}];
    var win=[span(legs[0])[0]-60,span(legs[legs.length-1])[1]+60],T=[];try{T=(tailsFor(type)||[]).slice()}catch(_){}
    return T.map(function(t){var st='ok',why='';
      if(gone(t,date)){st='gone';why=z()?'已退役／尚未交機':'Retired / not delivered'}
      else if(mx(t,date)){st='mx';why=z()?'維修中':'In maintenance'}
      else{var c=((S.tailAssign||{})[t]||[]).filter(function(x){if(!x||legs.indexOf(x)>=0)return false;var q=span(x);return q[0]<win[1]&&win[0]<q[1]})[0];
        if(c){st='busy';why=(z()?'時間衝突：':'Conflict: ')+c.code+' '+routeOf(c)+' '+c.dep}
        else{var at=null;try{at=window.kgmTailAtR913?window.kgmTailAtR913(t,date,mins(legs[0].dep)):null}catch(_){}
          if(at==null)at='TPE';var f0=routeOf(legs[0]).split('→')[0];if(at!==f0&&!(at==='TPE'&&f0==='TSA')&&!(at==='TSA'&&f0==='TPE')){st='away';why=(z()?'不在 ':'Not at ')+f0+(z()?'（在 '+at+'）':' (at '+at+')')}}}
      var n=((S.tailAssign||{})[t]||[]).filter(function(x){return x&&x.date===date}).length;
      return {tail:t,st:st,why:why,legs:n,cur:t===mv.tail}});
  }
  window.kgmAvailTailsR1023A=availTails;window.kgmTailOfR1023A=tailOf;
  function findLeg(sp){var TA=S.tailAssign||{},hit=null;Object.keys(TA).some(function(t){var L=TA[t]||[];for(var i=0;i<L.length;i++){var x=L[i];if(x&&x.code===sp.code&&x.date===sp.date&&routeOf(x)===sp.route){hit={tail:t,x:x};return true}}});return hit}
  /* 要搬的段：本段＋回程（換機型時用 setFlightAcftOnDate 一起換的那一班；只換機身時用同一架緊接著的回程） */
  function specsFor(code,date,fr,to,res){var sp=[{code:code,date:date,route:fr+'→'+to}],m=res&&/^(\S+) (\d{4}-\d{2}-\d{2}) ok/.exec(String(res.pairR922||''));
    if(m){var TA=S.tailAssign||{},r=null;Object.keys(TA).some(function(t){return (TA[t]||[]).some(function(x){if(x&&x.code===m[1]&&x.date===m[2]&&routeOf(x)===to+'→'+fr){r=x;return true}})});if(r)sp.push({code:r.code,date:r.date,route:routeOf(r)})}
    else{var mv=legsToMove(code,date,fr,to);if(mv.legs[1])sp.push({code:mv.legs[1].code,date:mv.legs[1].date,route:routeOf(mv.legs[1])})}
    return sp}
  /* 把指定的段放到 dest：dest 那段時間原本的段換回原機身（同機型才換） */
  function applyPick(pk){
    var got=pk.legs.map(findLeg).filter(Boolean);if(!got.length)return 0;
    var src=got[0].tail,dest=pk.tail;if(src===dest&&got.every(function(g){return g.tail===dest}))return 0;
    var same=fam(typeOfTail(dest))===fam(typeOfTail(src));
    var mine=got.map(function(g){return g.x}),win=[span(mine[0])[0]-60,span(mine[mine.length-1])[1]+60];
    S.tailAssign[dest]=S.tailAssign[dest]||[];
    var clash=(S.tailAssign[dest]||[]).filter(function(x){if(!x||mine.indexOf(x)>=0)return false;var q=span(x);return q[0]<win[1]&&win[0]<q[1]});
    got.forEach(function(g){S.tailAssign[g.tail]=(S.tailAssign[g.tail]||[]).filter(function(x){return x!==g.x})});
    if(clash.length&&!same)return 0;   /* 換機型：選的那架那段時間要是空的（原機身是別的機型，不能對調） */
    if(clash.length){S.tailAssign[dest]=S.tailAssign[dest].filter(function(x){return clash.indexOf(x)<0});S.tailAssign[src]=(S.tailAssign[src]||[]).concat(clash)}
    mine.forEach(function(x){x.manualR69=1;x.byR1023A=1;delete x.auto;S.tailAssign[dest].push(x)});
    [dest,src].forEach(function(t){(S.tailAssign[t]||[]).sort(function(a,b){return span(a)[0]-span(b)[0]})});
    return mine.length;
  }
  function remember(pk){var T0=todayISO();S.tailPickR1023A=(S.tailPickR1023A||[]).filter(function(x){return x&&(x.kind==='chain'||x.date>=addDays(T0,-1))&&!(x.code===pk.code&&x.date===pk.date)});S.tailPickR1023A.push(pk)}
  /* 整串接手：退役機原本退役後第一段（first）現在落在哪一架（H），從 H 與接手機 Y 都在同一站的那一刻起，兩架之後的勤務整串互換 */
  function chainSwap(pk){
    var Y=pk.by,n=0;if(!Y||gone(Y,pk.from))return 0;
    for(var i=0;i<(pk.first||[]).length;i++){var h=findLeg(pk.first[i]);if(!h)continue;var H=h.tail;if(H===Y)return 0;if(fam(typeOfTail(H))!==fam(typeOfTail(Y)))return 0;
      var srt=function(L){return (L||[]).slice().sort(function(a,b){return span(a)[0]-span(b)[0]})},LH=srt(S.tailAssign[H]),LY=srt(S.tailAssign[Y]),t0=span(h.x)[0];
      for(var j=0;j<LH.length;j++){var c=LH[j],ct=span(c)[0];if(ct<t0)continue;var org=routeOf(c).split('→')[0];
        var busy=LY.some(function(x){var q=span(x);return q[0]<ct&&ct<q[1]+45});if(busy)continue;
        var prev=null;LY.forEach(function(x){if(span(x)[1]<=ct)prev=x});var loc=prev?routeOf(prev).split('→')[1]:'TPE';
        if(loc!==org&&!(loc==='TPE'&&org==='TSA')&&!(loc==='TSA'&&org==='TPE'))continue;
        var mh=LH.filter(function(x){return span(x)[0]>=ct}),my=LY.filter(function(x){return span(x)[0]>=ct});
        S.tailAssign[H]=LH.filter(function(x){return span(x)[0]<ct}).concat(my);S.tailAssign[Y]=LY.filter(function(x){return span(x)[0]<ct}).concat(mh);
        return mh.length}
      return 0}
    return n}
  function reapply(){var n=0;try{(S.tailPickR1023A||[]).forEach(function(pk){if(!pk)return;if(pk.kind==='chain'){n+=chainSwap(pk);return}if(pk.date>=addDays(todayISO(),-1))n+=applyPick(pk)})}catch(_){}if(n){try{window.IDX69=null}catch(_){}}return n}
  window.kgmTailPickApplyR1023A=reapply;
  /* 飛機退役＋指定接手（使用者：「飛機排班AI可能可以跟AI說哪一台飛機要退役哪一台會直接取代他的行程」）
     先記下退役機從退役日起 60 天原本排的班，照原本的退役流程（kgmFleetRetireR928：至少 7 天後、不能是該機型最後一架、整個機隊重排），
     再把那些班逐段放到接手機（跟航班動態選機身同一套 applyPick：接手機那個時段原本的班換給拿到那一段的飛機），存成管理員指定，
     之後每次機隊重排完都會再套一次。 */
  window.kgmFleetRetireReplaceR1023A=function(reg,from,rep){
    reg=String(reg||'').toUpperCase().trim();rep=String(rep||'').toUpperCase().trim();
    var tr=typeOfTail(reg),tp=rep?typeOfTail(rep):'';
    if(!tr)return {ok:false,msg:(z()?'查無這架飛機：':'Unknown aircraft: ')+reg};
    if(rep&&!tp)return {ok:false,msg:(z()?'查無接手的飛機：':'Unknown replacement: ')+rep};
    if(rep&&fam(tp)!==fam(tr))return {ok:false,msg:(z()?'接手的飛機要同機型（'+reg+' 是 '+tr+'，'+rep+' 是 '+tp+'）。':'Replacement must be the same type.')};
    if(rep&&gone(rep,from))return {ok:false,msg:rep+(z()?' 在退役日也不能飛（已退役或尚未交機）。':' is not available on that date.')};
    var snap=((S.tailAssign||{})[reg]||[]).filter(function(x){return x&&x.date>=from}).sort(function(a,b){return span(a)[0]-span(b)[0]}).slice(0,6).map(function(x){return {code:x.code,date:x.date,route:routeOf(x)}});
    var r=window.kgmFleetRetireR928(reg,from);if(!r||!r.ok)return {ok:false,msg:(r&&r.why)||'?'};
    var moved=0;
    if(rep&&snap.length){var pk={kind:'chain',code:'RET:'+reg,date:from,from:from,reg:reg,by:rep,first:snap,at:new Date().toISOString(),who:(S.adminUser||{}).empId||'AI'};
      S.tailPickR1023A=(S.tailPickR1023A||[]).filter(function(x){return !(x&&x.kind==='chain'&&(x.reg===reg||x.by===rep))});S.tailPickR1023A.push(pk);moved=chainSwap(pk)}
    try{logAct('飛機退役'+(rep?'＋接手':''),reg+' '+from+(rep?' → '+rep+' 整串接手 '+moved+' 段':''))}catch(_){}
    flush();try{save()}catch(_){}try{render()}catch(_){}
    return {ok:true,msg:(z()?(reg+' 自 '+from+' 退役'+(rep?('；'+rep+' 從 '+(snap[0]?snap[0].date+' '+snap[0].code:from)+' 起整串接手原本 '+reg+' 的輪轉（'+moved+' 段），'+rep+' 原本的班由同型機接手。'):'，原本的班已改派其他飛機。')):(reg+' retired from '+from+(rep?'; '+rep+' takes over its rotation ('+moved+' legs).':''))),moved:moved};
  };

  /* 整年／60 天機隊重排會把窗期內的手動機身清掉（r72：「一年重排必須是一套完整輪轉」）→ 重排完再套一次管理員選的機身 */
  function rbWrap(){var o=window.kgmRebuildFleetR72;if(typeof o!=='function'||o.__k23)return;var w=function(){var r=o.apply(this,arguments);try{reapply()}catch(_){}return r};try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__k23=1;window.kgmRebuildFleetR72=w}
  rbWrap();setTimeout(rbWrap,0);setTimeout(rbWrap,3000);
  (function tick(n){setTimeout(function(){try{if(window.KGM_FULLDONE_1006A&&reapply())save()}catch(_){}if(n<30)tick(n+1)},n?10000:30000)})(0);
  /* ② 後台航班動態編輯 */
  function edKey(){var k=String(S.adEditKey||''),i=k.indexOf('_');return i>0?{code:k.slice(0,i),date:k.slice(i+1)}:null}
  function baseF(code){return allF().filter(function(f){return f&&f.code===code&&!f.via&&!f.partner})[0]||null}
  window.kgmEdTypeR1023A=function(v){S._k23EdType=v;S._k23EdTail='';paint()};
  window.kgmEdTailR1023A=function(t){S._k23EdTail=t;paint()};
  function paint(){
    var el=document.getElementById('adAcft'),k=edKey();if(!el||!k)return;var f=baseF(k.code);if(!f)return;
    if(el.getAttribute('data-k23')!==S.adEditKey){
      el.setAttribute('data-k23',S.adEditKey);if(S._k23EdKey!==S.adEditKey){S._k23EdKey=S.adEditKey;S._k23EdType='';S._k23EdTail=''}
      var cur=acftOfFlight(k.code,k.date);
      el.innerHTML='<option value="">'+(z()?'不換機型（可只換機身）':'No change')+'</option>'+fleetTypes().map(function(t){return '<option value="'+E(t)+'">'+E(t)+' · '+E((AC[t]||{}).nm||t)+(fam(t)===fam(cur)?(z()?'（目前）':' (current)'):'')+'</option>'}).join('');
      el.onchange=function(){window.kgmEdTypeR1023A(this.value)};
      var box=document.createElement('div');box.id='k23TailBox';box.className='k23-tb';var host=el.closest('div');(host&&host.parentNode||el.parentNode).insertBefore(box,host&&host.nextSibling);
      if(host&&host.parentNode&&getComputedStyle(host.parentNode).display==='grid')box.style.gridColumn='1 / -1';
    }
    var box=document.getElementById('k23TailBox');if(!box)return;
    var cur=acftOfFlight(k.code,k.date,f.fr,f.to),tl=tailOf(k.code,k.date,f.fr,f.to),type=S._k23EdType||fam(cur);
    var L=availTails(type,k.code,k.date,f.fr,f.to),ok=L.filter(function(x){return x.st==='ok'&&!x.cur});
    var h='<div class="k23-tb-cur"><span>'+(z()?'目前執飛':'Now operating')+'</span><b>'+E(k.code)+' '+E(f.fr)+'→'+E(f.to)+' · '+E(k.date)+'</b><em>'+E((AC[cur]||{}).nm||cur)+'</em><strong>'+E(tl||(z()?'尚未派機身':'No tail yet'))+'</strong></div>'
      +'<div class="k23-tb-h">'+(S._k23EdType&&fam(S._k23EdType)!==fam(cur)?((z()?'換成 ':'Change to ')+E((AC[type]||{}).nm||type)+(z()?' —— 選一架可用的飛機':' — pick an available aircraft')):(z()?'同機型換機身（不換機型）：':'Same type, swap aircraft:'))+' <small>'+ok.length+(z()?' 架可用':' available')+'</small></div>'
      +'<div class="k23-tb-list">'+L.map(function(x){var on=S._k23EdTail===x.tail,dis=x.st!=='ok'||x.cur;
        return '<button type="button" class="k23-tb-t '+x.st+(on?' on':'')+(x.cur?' cur':'')+'"'+(dis?' disabled':'')+' onclick="kgmEdTailR1023A(\''+E(x.tail)+'\')"><b>'+E(x.tail)+'</b><small>'+(x.cur?(z()?'目前這架':'current'):(x.st==='ok'?((z()?'當天 ':'')+x.legs+(z()?' 段':' legs')):E(x.why)))+'</small></button>'}).join('')+'</div>'
      +(S._k23EdType&&fam(S._k23EdType)!==fam(cur)&&!S._k23EdTail?'<div class="k23-tb-msg">'+(z()?'請選一架飛機；存檔後販售系統、航班動態、機隊排班同步，並通知這班旅客。':'Pick an aircraft; saving syncs sales, status and fleet and notifies passengers.')+'</div>':'')
      +(S._k23EdTail?'<div class="k23-tb-msg ok">'+(z()?'存檔後 ':'On save ')+E(k.code)+(z()?'（和同一架接著飛的回程）會改由 ':' (and its return) moves to ')+'<b>'+E(S._k23EdTail)+'</b>'+(z()?' 執飛。':'.')+'</div>':'');
    box.innerHTML=h;
    if(S._k23EdType&&el.value!==S._k23EdType)el.value=S._k23EdType;
  }
  function saveWrap(){var o=window.doAdminSave;if(typeof o!=='function'||o.__k23)return;
    var w=function(){
      var k=edKey(),f=k&&baseF(k.code),el=document.getElementById('adAcft'),type=el&&el.value||'',tail=S._k23EdTail||'',before=k?acftOfFlight(k.code,k.date):'';
      if(type&&f&&fam(type)!==fam(before)&&!tail){var L=availTails(type,k.code,k.date,f.fr,f.to).filter(function(x){return x.st==='ok'});
        if(!L.length){alert(z()?('這天沒有可用的 '+type+'（全部時間衝突、不在 '+f.fr+' 或維修），不能換。'):('No '+type+' available that day.'));return}
        tail=L.sort(function(a,b){return a.legs-b.legs})[0].tail}
      if(el&&type&&fam(type)===fam(before))el.value='';
      var r=o.apply(this,arguments),msg='';
      try{
        if(k&&f&&type&&fam(type)!==fam(before)){var res=window.setFlightAcftOnDate(k.code,k.date,type);
          if(res&&res.ok){var pk={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,res),at:new Date().toISOString(),by:(S.adminUser||{}).empId||''};if(!pk.legs.some(findLeg)){var b0=baseF(k.code);S.tailAssign=S.tailAssign||{};(S.tailAssign[tail]=S.tailAssign[tail]||[]).push({date:k.date,code:k.code,route:f.fr+'→'+f.to,dep:b0.dep,arr:b0.arr,dd:b0.dd||0,manualR69:1,byR1023A:1})}var n=applyPick(pk);remember(pk);msg=k.code+' '+k.date+'：'+before+' → '+type+'（'+tail+'），'+(res.bookings||0)+(z()?' 筆訂位已通知':' bookings notified');try{logAct('航班動態換機型',msg+' · 搬 '+n+' 段')}catch(_){}}
          else if(res&&res.why)alert(res.why)}
        else if(k&&f&&tail){var pk2={code:k.code,date:k.date,tail:tail,legs:specsFor(k.code,k.date,f.fr,f.to,null),at:new Date().toISOString(),by:(S.adminUser||{}).empId||''};var m=applyPick(pk2);remember(pk2);try{logAct('航班動態換機身',k.code+' '+k.date+' → '+tail+' · '+m+' 段')}catch(_){}}
      }catch(e){try{console.warn('k23 acft save',e)}catch(_){}}
      try{var ov3=k&&(S.flightOverrides||{})[S.adEditKey];if(k&&f&&ov3&&ov3.arr&&/Delayed|Time Change/.test(String(ov3.status||''))){var cs=cascade(k.code,k.date,f.fr,f.to,0);if(cs.length){S._k23Cascade=cs;try{alert((z()?'同一架的下一班過站不足 '+TURN23+' 分鐘，已自動延誤並通知旅客：\n':'Downline flights delayed:\n')+cs.map(function(c){return c.code+' '+c.date+' '+c.route+'：'+c.band+' → '+c.dep+'–'+c.arr+'（'+c.pax+(z()?' 筆訂位':' bookings')+'）'}).join('\n'))}catch(_){}}}}catch(e){try{console.warn('k23 cascade',e)}catch(_){}}
      S._k23EdTail='';S._k23EdType='';S._k23EdKey='';flush();try{save()}catch(_){}try{render()}catch(_){}
      return r};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}
    w.__k23=1;window.doAdminSave=w;try{doAdminSave=w}catch(_){}}
  saveWrap();setTimeout(saveWrap,0);setTimeout(saveWrap,4000);
  /* 機型異動後清快取：setFlightAcftOnDate 包一層 */
  function setWrap(){var o=window.setFlightAcftOnDate;if(typeof o!=='function'||o.__k23)return;var w=function(){var r=o.apply(this,arguments);flush();return r};try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__k23=1;window.setFlightAcftOnDate=w;try{setFlightAcftOnDate=w}catch(_){}}
  setWrap();setTimeout(setWrap,1500);setTimeout(setWrap,5000);
  /* ⑥ 前一班延誤 → 同一架的下一班過站不到 1 小時就自動延誤（使用者：「如果已經在航班動態確認該飛機前一班延誤，並且可能15:00抵達下一班15:45出發
        (差距<1hr)要自動發送通知給旅客說航班延誤並自動更改航班動態（要自動判斷延誤多久像是這個Case就是延誤15-30分鐘寫新的出發時間和抵達時間）」）
        後台航班動態存檔時，這一班是 Delayed／Time Change 而且有新的抵達時間 → 找同一架（機隊排班 S.tailAssign）接著飛的下一班：
        新抵達＋最短過站 60 分鐘 晚於下一班的出發 → 下一班改 Delayed、新出發＝新抵達＋60 分（取 5 分）、新抵達＝原抵達＋同樣延誤，
        寫進 S.flightOverrides（前台航班動態讀同一份），通知這班的旅客；再往下一班連鎖檢查（最多 6 班）。 */
  var TURN23=60;
  function hhmm(m){m=((m%1440)+1440)%1440;return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
  function band(d){return d<15?(z()?'延誤 15 分鐘內':'under 15 min'):d<=30?(z()?'延誤 15–30 分鐘':'15–30 min'):d<=60?(z()?'延誤 30–60 分鐘':'30–60 min'):d<=120?(z()?'延誤 1–2 小時':'1–2 h'):(z()?'延誤 2 小時以上':'over 2 h')}
  function nextLeg(code,date,fr,to){var t=tailOf(code,date,fr,to);if(!t)return null;var L=((S.tailAssign||{})[t]||[]).slice().sort(function(a,b){return span(a)[0]-span(b)[0]});
    for(var i=0;i<L.length;i++){var x=L[i];if(x.code===code&&x.date===date&&routeOf(x)===fr+'→'+to)return L[i+1]?{x:L[i+1],tail:t}:null}return null}
  function tellPax(code,date,msg,title){var n=0;(S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled')return;var hit=(b.outF&&b.outF.code===code&&b.outF.date===date)||(b.inbF&&b.inbF.code===code&&b.inbF.date===date);if(!hit)return;n++;
      b.statusNotifs=b.statusNotifs||[];b.statusNotifs.push({date:todayISO(),status:'Delayed',msg:msg});
      b.tripAlerts0809G=b.tripAlerts0809G||[];b.tripAlerts0809G.unshift({title:title,message:msg,at:new Date().toISOString()});
      b.notifs=b.notifs||[];b.notifs.unshift({msg:msg,date:todayISO(),read:false});
      if(b.userId){var u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0];if(u){u.notifs=u.notifs||[];u.notifs.unshift({title:title,message:msg,date:todayISO(),type:'flight_status'})}}
      try{var em=b.contactEmail||((b.paxList||[])[0]||{}).email;if(em&&typeof kgmNotify==='function')Promise.resolve(kgmNotify('flight.changed',{email:em,pnr:b.pnr,flight:code,date:date,message:msg})).catch(function(){})}catch(_){}});return n}
  function cascade(code,date,fr,to,depth){
    depth=depth||0;if(depth>6)return [];var out=[],ov=(S.flightOverrides||{})[code+'_'+date]||{};if(!ov.arr)return out;
    var f=allF().filter(function(x){return x&&x.code===code&&!x.via&&(!fr||x.fr===fr&&x.to===to)})[0];if(!f)return out;fr=f.fr;to=f.to;
    var nx=nextLeg(code,date,fr,to);if(!nx)return out;var x=nx.x,xr=routeOf(x).split('→');
    var arrAbs=dnum(date)*1440+(+ov.arrDD||0)*1440+mins(ov.arr);
    var xo=(S.flightOverrides||{})[x.code+'_'+x.date]||{};
    var schedDep=dnum(x.date)*1440+mins(x.dep),curDep=xo.dep?dnum(x.date)*1440+(+xo.depDD||0)*1440+mins(xo.dep):schedDep;
    if(curDep-arrAbs>=TURN23)return out;
    var nd=Math.ceil((arrAbs+TURN23)/5)*5,delay=nd-schedDep;if(delay<=0)return out;
    var schedArr=dnum(x.date)*1440+(+x.dd||0)*1440+mins(x.arr),na=schedArr+delay;
    var why=(z()?'前一班 ':'Inbound ')+code+' '+fr+'→'+to+(z()?' 預計 ':' ETA ')+ov.arr+(z()?' 抵達 ':' at ')+to+(z()?'，最短過站 ':'; minimum turn ')+TURN23+(z()?' 分鐘':' min');
    S.flightOverrides=S.flightOverrides||{};
    S.flightOverrides[x.code+'_'+x.date]=Object.assign({},xo,{status:'Delayed',dep:hhmm(nd),depDD:Math.floor(nd/1440)-dnum(x.date),arr:hhmm(na),arrDD:Math.floor(na/1440)-dnum(x.date),depRemark:why,reason:why,autoDelayR1023A:{from:code+' '+date,delay:delay,band:band(delay),at:new Date().toISOString()}});
    try{LS.set('kgmov4',S.flightOverrides)}catch(_){}
    var msg=(z()?'航班 ':'Flight ')+x.code+'（'+x.date+'）'+band(delay)+(z()?'：新出發 ':': new departure ')+hhmm(nd)+(z()?'、新抵達 ':', new arrival ')+hhmm(na)+(Math.floor(na/1440)-dnum(x.date)>0?'⁺'+(Math.floor(na/1440)-dnum(x.date)):'')+(z()?'（原 ':' (was ')+x.dep+'–'+x.arr+'）。'+(z()?'原因：前一班機延誤抵達。':'Reason: late inbound aircraft.');
    var n=tellPax(x.code,x.date,msg,z()?'航班延誤通知':'Flight delayed');
    out.push({code:x.code,date:x.date,route:routeOf(x),delay:delay,band:band(delay),dep:hhmm(nd),arr:hhmm(na),pax:n,tail:nx.tail});
    try{logAct('自動延誤（前一班延誤、過站不足）',x.code+' '+x.date+' '+band(delay)+' '+hhmm(nd)+'–'+hhmm(na)+' · 通知 '+n+' 筆')}catch(_){}
    return out.concat(cascade(x.code,x.date,xr[0],xr[1],depth+1));
  }
  window.kgmDelayCascadeR1023A=cascade;
  /* ⑦ 前台卡頓（使用者：「前台系統非常卡頓」）：前台點「航班動態」第一次要 3.7 秒不能動 —— 看板每一列要報到櫃檯號
        （kgmCounterOfFlightR929），它把當天 8 個時段的櫃檯分配整個跑一遍，連帶把地勤派人（誰站哪個櫃檯、休息、航廈）也算完，
        但這裡只用得到櫃檯號／航廈／開關櫃時間。派人那段本來就有開關（KGM_GPLAN_BUSY_R1008A，地勤派工計畫自己排人時用），
        查櫃檯號時打開：154 班櫃檯號逐一比對完全相同，6.7 秒 → 0.23 秒。 */
  function ctrWrap(){var o=window.kgmCounterOfFlightR929;if(typeof o!=='function'||o.__k23)return;
    var w=function(){var was=window.KGM_GPLAN_BUSY_R1008A;window.KGM_GPLAN_BUSY_R1008A=true;try{return o.apply(this,arguments)}finally{window.KGM_GPLAN_BUSY_R1008A=was}};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__k23=1;window.kgmCounterOfFlightR929=w}
  ctrWrap();setTimeout(ctrWrap,0);setTimeout(ctrWrap,4000);setTimeout(ctrWrap,15000);
  /* 前台首頁每次重畫都把「台北過境住宿」的轉機組合整個重找一次（searchExtrasHTML → findConnectionsFull，約佔首頁重畫的 1/3）；
     結果是一段 HTML，只跟搜尋條件與航班資料有關 → 同樣條件 60 秒內直接用上一次的字串。 */
  function sxWrap(){var o=window.searchExtrasHTML;if(typeof o!=='function'||o.__k23)return;var C={k:'',v:'',t:0};
    var w=function(){var s=S.search||{},k=[s.fr,s.to,s.dep,s.ret,s.type,s.pax,S.hotelPref0809C,(typeof LANG!=='undefined'?LANG:''),FLIGHTS.length,(S.customFlights||[]).length,Object.keys(S.flightOverrides||{}).length].join('|');
      if(C.k===k&&Date.now()-C.t<60000)return C.v;var v=o.apply(this,arguments);C={k:k,v:v,t:Date.now()};return v};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__k23=1;window.searchExtrasHTML=w;try{searchExtrasHTML=w}catch(_){}}
  sxWrap();setTimeout(sxWrap,0);setTimeout(sxWrap,4000);
  (function faWrap(){var o=window.kgmFareAdjAddR1022A;if(typeof o!=='function'||o.__k23)return;var w=function(){var n=(S.fareRulesR929||[]).length,r=o.apply(this,arguments);if((S.fareRulesR929||[]).length>n){S._fa23Pct='';S._fa23Note=''}return r};w.__k23=1;window.kgmFareAdjAddR1022A=w})();
  window.kgmFa23PrevR1023A=function(){var e=document.getElementById('fa22Pct'),p=e?+e.value:0;[].slice.call(document.querySelectorAll('[data-fa23]')).forEach(function(b){var v=+b.getAttribute('data-fa23');b.textContent=(p&&isFinite(p))?'NT$'+Math.round(v*(1+p/100)).toLocaleString():'—';b.style.color=p>0?'#9b2c1c':(p<0?'#145c38':'')})};
  /* ③ 飛機排班：閒置機身 */
  function busyOn(t,d){var L=(S.tailAssign||{})[t]||[],n=0,dn=dnum(d);L.forEach(function(x){if(!x||x.cancelledR1023A)return;var q=span(x),a=Math.floor(q[0]/1440),b=Math.floor((q[1]-1)/1440);if(dn>=a&&dn<=b)n++});return n}
  window.kgmIdleDaysR1023A=busyOn;
  function idleHtml(){
    var type=S._fsType||'';try{if(!type&&window.kgmFleetTypeR69)type=''}catch(_){}
    var T=[];try{T=(tailsFor(type==='A339L'||type==='A339R'?'A339':type)||[]).slice()}catch(_){}if(!T.length)return '';
    var d0=S._fsDate||todayISO(),D=[];for(var i=0;i<14;i++)D.push(addDays(d0,i));
    var idle=0,rows=T.map(function(t){return '<tr><th>'+E(t)+'</th>'+D.map(function(d){if(gone(t,d))return '<td class="g">—</td>';if(mx(t,d))return '<td class="m">MX</td>';var n=busyOn(t,d);if(!n){idle++;return '<td class="i" title="'+E(t+' '+d)+'">'+(z()?'閒置':'idle')+'</td>'}return '<td>'+n+'</td>'}).join('')+'</tr>'}).join('');
    return '<section class="k69-card k23-idle"><div class="k69-kick">IDLE AIRCRAFT</div><h3>'+(z()?'閒置機身（'+E(type)+'，'+E(d0)+' 起 14 天）':'Idle aircraft ('+E(type)+', 14 days)')+'</h3>'
      +'<p class="k69-sub">'+(z()?'數字＝當天執飛段數（跨午夜的長程兩天都算）；「閒置」＝當天完全沒有航班。共 ':'Numbers are legs per day; "idle" = no flights at all. ')+idle+(z()?' 個機身日閒置。':' idle aircraft-days.')+'</p>'
      +'<div class="k23-idle-w"><table><thead><tr><th></th>'+D.map(function(d){var w=new Date(d+'T12:00:00Z').getUTCDay();return '<th>'+E(d.slice(5))+'<small>'+(z()?'日一二三四五六'.charAt(w):['Su','Mo','Tu','We','Th','Fr','Sa'][w])+'</small></th>'}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }
  /* ⑧ 前台航班動態上排（機場看板／依航線／依航班號）改成跟後台「里程購買審查／里程購買優惠／里程兌換優惠」同一種膠囊分頁（使用者圖四） */
  function stNav(){
    if(S.view!=='status')return;var B=[].slice.call(document.querySelectorAll('#app button')).filter(function(b){return /^(機場看板|依航線|依航班號|Airport board|By route|By flight( number)?)$/i.test(String(b.textContent||'').trim())});
    if(B.length<2)return;var par=B[0].parentElement;if(!par||par.classList.contains('k23-stnav'))return;if(!B.every(function(b){return b.parentElement===par}))return;
    par.classList.add('k23-stnav');B.forEach(function(b){b.classList.toggle('on',b.classList.contains('btn-g'))});
  }
  function post(){
    try{stNav()}catch(e){}
    try{if(S.view==='admin'&&S.adminTab==='status')paint()}catch(e){}
    try{if(S.view==='admin'&&S.adminTab==='fleetsched'&&!document.querySelector('.k23-idle')){var c=[].slice.call(document.querySelectorAll('.k69-card'));var last=c[c.length-1];if(last){var h=idleHtml();if(h)last.insertAdjacentHTML('afterend',h)}}}catch(e){}
  }
  function renWrap(){if(typeof render!=='function'||render.__k23)return;var rd=render;
    var w=function(){var r=rd.apply(this,arguments);try{post()}catch(_){}setTimeout(function(){try{post()}catch(_){}},80);return r};
    try{Object.keys(rd).forEach(function(k){if(!(k in w))w[k]=rd[k]})}catch(_){}w.__k23=1;render=window.render=w}
  renWrap();setTimeout(renWrap,4500);
  /* ④ 航班機身查詢重複列 */
  function qWrap(){var o=window.kgmFleetQueryR69;if(typeof o!=='function'||o.__k23)return;
    var w=function(){var r=o.apply(this,arguments);try{var R=S._fsQRes;if(R&&R.rows){var seen={};R.rows=R.rows.filter(function(x){var k=[x.code,x.fr,x.to,x.dep,x.arr].join('|');if(seen[k])return false;seen[k]=1;return true});try{render()}catch(_){}}}catch(_){}return r};
    w.__k23=1;window.kgmFleetQueryR69=w}
  qWrap();setTimeout(qWrap,3000);
  /* ⑤ Residence 機型異動：定案後才判斷；誤判撤回 */
  function resWrap(){var o=window.kgmResEquipCheckR928;if(typeof o!=='function'||o.__k23)return;
    var w=function(){if(!window.KGM_FULLDONE_1006A&&(typeof performance==='undefined'||performance.now()<180000))return {checked:0,moved:0,list:[],deferredR1023A:1};undo();return o.apply(this,arguments)};
    w.__k23=1;window.kgmResEquipCheckR928=w}
  function hasRes(b){var t='';try{t=acftOfFlight(b.code,b.date,b.fr,b.to)||''}catch(_){}return !!(((AC[t]||{}).cabins||{}).res)}
  function undo(){var n=0,T0=todayISO();
    (S.residenceBidsR83||[]).forEach(function(b){var r=b&&b.equipLossR928;if(!r||r.voidR1023A||!b.date||b.date<T0||!hasRes(b))return;
      var bk=b.pnr?(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0]:null,seg=b.segR923==='inb'?'inb':'out';
      if(bk){bk.refundsR60=(bk.refundsR60||[]).filter(function(x){return !(x&&x.resEquipR928===b.id)});bk.total=(+bk.total||0)+(+r.refund||0);
        if(r.alt==='refund')bk.cancelledSegsR60=(bk.cancelledSegsR60||[]).filter(function(s){return s!==seg});else{bk.residenceWonR83=true;bk.residenceSeatLockedR83=true}
        bk.notifs=bk.notifs||[];bk.notifs.unshift({date:T0,read:false,msg:'更正：'+b.code+'（'+b.date+'）實際由 '+acftOfFlight(b.code,b.date,b.fr,b.to)+' 執飛，Residence 照常提供，先前的機型異動通知作廢。'})}
      delete b.equipLossR928;n++});
    (S.resMileBidsR161||[]).forEach(function(b){var r=b&&b.equipLossR928;if(!r||!b.date||b.date<T0||!hasRes(b))return;
      var u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0];if(u&&r.milesBack){u.miles=Math.max(0,(+u.miles||0)-r.milesBack);(u.milesLog=u.milesLog||[]).unshift({date:T0,miles:-r.milesBack,desc:'更正：Residence 機型異動誤判撤回 '+b.code+' '+b.date})}
      delete b.equipLossR928;n++});
    if(n){try{logAct('Residence 機型異動更正','撤回 '+n+' 筆（機型其實有 Residence）')}catch(_){}try{save()}catch(_){}}
    return n}
  window.kgmResUndoR1023A=undo;
  resWrap();setTimeout(resWrap,0);
  var CSS='.k23-tb{margin:6px 0 4px;padding:12px 14px;border:1px solid #E1E8E3;border-radius:12px;background:#FAFCFB}'
   +'.k23-tb-cur{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;font-size:12px;color:#5F6B66;margin-bottom:8px}.k23-tb-cur b{color:#123C32}.k23-tb-cur em{font-style:normal;color:#123C32}.k23-tb-cur strong{font-family:ui-monospace,Menlo,monospace;background:#123C32;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px}'
   +'.k23-tb-h{font-size:12.5px;font-weight:800;color:#123C32;margin-bottom:6px}.k23-tb-h small{font-weight:600;color:#8A948F;margin-left:6px}'
   +'.k23-tb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}'
   +'.k23-tb-t{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid #DCE5DF;border-radius:10px;padding:7px 10px;background:#fff;cursor:pointer;text-align:left}'
   +'.k23-tb-t b{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:#123C32}.k23-tb-t small{font-size:10.5px;color:#5F6B66;line-height:1.35}'
   +'.k23-tb-t.on{border-color:#1F6F4A;background:#E9F5EE;box-shadow:0 0 0 2px #1F6F4A33}.k23-tb-t.cur{border-style:dashed}.k23-tb-t[disabled]{cursor:not-allowed;opacity:.55;background:#F4F6F5}.k23-tb-t.busy small,.k23-tb-t.away small{color:#9A6B15}.k23-tb-t.mx small,.k23-tb-t.gone small{color:#A3271C}'
   +'.k23-tb-msg{margin-top:8px;font-size:11.5px;color:#9A6B15}.k23-tb-msg.ok{color:#0B6B48}'
   +'.k23-idle-w{overflow-x:auto}.k23-idle table{border-collapse:collapse;font-size:11.5px;min-width:100%}.k23-idle th,.k23-idle td{border:1px solid #E6ECE8;padding:5px 6px;text-align:center;white-space:nowrap}'
   +'.k23-idle thead th{background:#F4F7F5;color:#123C32;font-weight:700}.k23-idle thead small{display:block;color:#8A948F;font-weight:500}.k23-idle tbody th{font-family:ui-monospace,Menlo,monospace;color:#123C32;text-align:left;background:#FAFCFB}'
   +'.k23r-jump{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 14px}.k23r-jump button{border:1px solid #DCE5DF;background:#fff;border-radius:999px;padding:5px 12px;font-size:12px;color:#123C32;cursor:pointer}.k23r-jump i{font-style:normal;color:#8A948F;margin-left:5px;font-size:11px}'
   +'.k23r-list{display:grid;gap:10px;padding:10px 12px 14px}.k23r-card{border:1px solid #E1E8E3;border-radius:12px;background:#fff;overflow:hidden}.k23r-card>header{display:flex;align-items:baseline;gap:10px;padding:9px 14px;background:#F6F9F7;border-bottom:1px solid #E8EEEA}.k23r-card>header b{font-size:14px;color:#123C32;letter-spacing:.02em}.k23r-card>header span{font-size:12px;color:#6B7671}'
   +'.k23r-cols{display:grid;grid-template-columns:1fr 1fr}.k23r-dir{padding:8px 12px 10px}.k23r-dir+.k23r-dir{border-left:1px solid #EEF2EF}.k23r-dh{font-size:11.5px;font-weight:800;color:#8A6A2E;letter-spacing:.04em;margin-bottom:4px}.k23r-dh small{color:#9AA39F;font-weight:600;margin-left:6px}'
   +'.k23r-fl{display:grid;grid-template-columns:62px 1fr 1fr auto;gap:8px;align-items:center;padding:6px 0;border-top:1px dashed #EEF2EF}.k23r-fl:first-of-type{border-top:0}.k23r-code{font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:700;color:#123C32;background:#EEF4F0;border-radius:6px;padding:2px 6px;text-align:center}'
   +'.k23r-s{display:flex;flex-wrap:wrap;align-items:center;gap:4px;font-size:12px}.k23r-s small{color:#9AA39F;font-size:10.5px}.k23r-s b{font-family:ui-monospace,Menlo,monospace;font-weight:600;color:#123C32}.k23r-s sup{font-size:9px;color:#8A6A2E}.k23r-s u{text-decoration:none;font-size:10.5px;color:#B26A00}'
   +'.k23r-off{font-style:normal;color:#9AA39F}.k23r-daily{font-size:10.5px;color:#5F6B66}.k23r-wd{display:inline-flex;gap:1px}.k23r-wd i{font-style:normal;font-size:9.5px;width:14px;text-align:center;border-radius:3px;color:#B8C0BB}.k23r-wd i.on{background:#123C32;color:#fff}'
   +'.k23r-open{border:1px solid #DCE5DF;background:#fff;border-radius:8px;padding:4px 10px;font-size:11.5px;font-weight:700;color:#123C32;cursor:pointer}.k23r-open:hover{background:#123C32;color:#fff}.k23r-none{font-size:11.5px;color:#9AA39F;padding:6px 0}'
   +'@media(max-width:900px){.k23r-cols{grid-template-columns:1fr}.k23r-dir+.k23r-dir{border-left:0;border-top:1px solid #EEF2EF}}'
   +'.k23-ng{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px 12px;align-items:end}.k23-ng>label{display:flex;flex-direction:column;gap:4px}.k23-ng>label>span,.k23-ng-opt label>span{font-size:11px;color:#6B7671;font-weight:700}.k23-ng-key>span{color:#8A6A2E!important}.k23-ng-key input{border-color:#C9A96A}'
   +'.k23-ng-opt{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:12px;align-items:end;padding:8px 10px;border:1px dashed #E1E8E3;border-radius:10px}.k23-ng-opt>label:not(.k57-temp){display:flex;flex-direction:column;gap:4px;min-width:180px}'
   +'.k23-stnav{display:inline-flex!important;flex-wrap:wrap;gap:4px!important;padding:4px;border:1px solid #e3ddcf;border-radius:999px;background:#f7f4ec;margin:0 0 14px}'
   +'.k23-stnav>button.btn{border:0!important;background:transparent!important;border-radius:999px!important;padding:8px 18px!important;font-size:12.5px!important;font-weight:800!important;color:#5d6a64!important;box-shadow:none!important;height:auto!important;min-height:0!important}'
   +'.k23-stnav>button.btn.on{background:#0a4537!important;color:#fff!important;box-shadow:0 2px 8px rgba(10,69,55,.2)!important}'
   +'@media(max-width:640px){.k23-stnav{display:flex!important;width:100%}.k23-stnav>button.btn{flex:1;padding:8px 6px!important;font-size:12px!important}}'
   +'.fa23{display:grid;gap:0}.fa23-step{display:grid;grid-template-columns:34px 1fr;gap:14px;padding:14px 0;border-top:1px solid #EEF2EF}.fa23-step:first-child{border-top:0;padding-top:2px}'
   +'.fa23-n{width:28px;height:28px;border-radius:50%;background:#123c32;color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;margin-top:2px}'
   +'.fa23-b h4{margin:2px 0 10px;font-size:13.5px;color:#123c32}.fa23-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px 12px;align-items:end}'
   +'.fa23 label{display:flex;flex-direction:column;gap:5px;font-size:10.5px;font-weight:800;color:#6b7b74;letter-spacing:.03em}.fa23 .inp{height:36px;width:100%}'
   +'.fa23-chips{grid-column:span 3;display:flex;flex-wrap:wrap;gap:6px;align-self:end}.fa23-chips button,.fa23-quick button{padding:7px 12px;border-radius:999px;border:1px solid #d6dbd4;background:#fff;color:#173f33;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}.fa23-chips button.on{background:#123c32;border-color:#123c32;color:#fff}'
   +'.fa23-quick{grid-column:span 2;display:flex;flex-wrap:wrap;gap:6px;align-self:end}.fa23-quick button.dn{color:#145c38}.fa23-quick button.up{color:#9b2c1c}'
   +'.fa23-note{margin-top:10px}.fa23-more{margin-top:10px;font-size:12px;color:#5f6b66}.fa23-more summary{cursor:pointer;font-weight:700}.fa23-more .fa23-row{margin-top:8px;max-width:400px}'
   +'.fa23-hint{margin:6px 0 0;font-size:11.5px;color:#8a948f}.fa23-warn{margin:8px 0 0;font-size:11.5px;color:#8a5a00}.fa23-sum{margin:0 0 10px;font-size:12.5px;color:#3d4b45}.fa23-sum b{color:#123c32}'
   +'.fa23-prev{display:flex;flex-wrap:wrap;gap:8px}.fa23-prev>div{display:grid;grid-template-columns:auto auto auto;align-items:baseline;gap:6px;padding:9px 12px;border:1px solid #e3ebe7;border-radius:12px;background:#fbfcfb}.fa23-prev small{grid-column:1/-1;font-size:10.5px;color:#8a948f}.fa23-prev span{font-family:ui-monospace,Menlo,monospace;color:#5f6b66;text-decoration:line-through}.fa23-prev i{font-style:normal;color:#9aa39f}.fa23-prev b{font-family:ui-monospace,Menlo,monospace;color:#123c32;font-size:14px}'
   +'.fa23 .fa22-go{margin-top:12px}@media(max-width:700px){.fa23-chips,.fa23-quick{grid-column:auto}}'
   +'.k8-walk{display:grid;grid-template-columns:110px 1fr auto;gap:12px;align-items:center;padding:7px 14px;margin:2px 0;border-left:3px dashed #C9D3CD;background:transparent;color:#6B7671;font-size:12px}.k8-walk time{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:#8A948F}.k8-walk time i{display:block;font-style:normal;font-size:10px;color:#B0B8B3}.k8-walk b{font-size:12px;color:#5F6B66;font-weight:700;margin-right:6px}.k8-walk em{font-style:normal;font-size:11px;color:#9AA39F}'
   +'.k23-idle td.i{background:#FFF4E0;color:#9A6B15;font-weight:800}.k23-idle td.m{background:#FDECEA;color:#A3271C;font-weight:700}.k23-idle td.g{color:#B8C0BB}';
  try{if(!document.getElementById('k23-css2')){var st=document.createElement('style');st.id='k23-css2';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}}catch(_){}
})();

/* ══ 1023A：冬季飛行時間依風向（使用者：「這樣不make sense喔 你冬天假設去程-5可能因為風向 回來就會是逆風應該是+5或更多才對啊 所以你要確認好並給我新的時刻表PDF」）
   r68 的 kgmWinterBlockDeltaR68 註解寫「去程與回程受到的影響是相反的」，程式卻用排序後的城市對決定正負號 → 去回永遠同號
   （實測 96 對航線有 75 對冬季去回同號，例：KIX⇄TPE 兩邊都 −10、DOH→PVG→DOH 兩段都 +35），航線管理的標籤也是公式值不是實際時刻。
   新模型：冬季北半球西風帶（噴射氣流）—— 往東飛順風縮短、往西飛逆風加長（逆風的損失比順風的節省多），幅度＝航程×東西向分量
   （用兩地時區差估：每 1 小時約 1,300 km 東西距離），5 分鐘取整，−45～+60 分；700 km 以下、或同一時區（南北向）不調。
   冬季抵達＝冬季出發＋夏季飛行時間＋風向修正（從夏季算定值，不在存檔值上加減）；冬季出發不動。
   使用者逐列審過的時刻不動：KX37、KX51（奧克蘭→雪梨、雪梨→台北）、KX288／287、KX212／211、KX282／281、KX31。
   全網不在 03:00–03:59 抵達：落在 03 點就把修正往同方向多推（最多 20 分），推不出去就往反方向退到 02:55。 ══ */
(function(){
  var KEEP23={KX37:1,KX38:1,KX51:1,KX288:1,KX287:1,KX212:1,KX211:1,KX282:1,KX281:1,KX31:1};
  function tzd(a,b){var d=0;try{d=(TZ[b]-TZ[a])}catch(_){d=0}if(!isFinite(d))d=0;while(d>12)d-=24;while(d<-12)d+=24;return d}
  window.kgmWindDeltaR1023A=function(fr,to){
    if(!fr||!to||fr===to)return 0;var d=0;try{d=+distOf(fr,to)||0}catch(_){d=0}if(d<700)return 0;
    var dt=tzd(fr,to);if(!dt)return 0;var ew=Math.min(1,Math.abs(dt)*1300/d),k=d/1000*ew;
    var v=dt>0?-k*4:k*6;v=Math.round(v/5)*5;return Math.max(-45,Math.min(60,v));
  };
  window.kgmWinterBlockDeltaR68=window.kgmWindDeltaR1023A;   /* 航線管理標籤與往後的冬季推算都用同一個模型 */
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function hm(n){n=((n%1440)+1440)%1440;return ('0'+Math.floor(n/60)).slice(-2)+':'+('0'+n%60).slice(-2)}
  function sumDate(date){var y=+String(date).slice(0,4),m=+String(date).slice(5,7);return (m>=4?y:y-1)+'-07-15'}
  var MEMO={};
  function adj(o0,f,date,x){
    if(!x||!f||f.partner||f.codeshare||!/^KX\d+$/.test(String(f.code||''))||KEEP23[f.code])return x;
    var sea=x.seasonR57||x.seasonR48;if(!sea){try{sea=window.kgmSeasonR57?window.kgmSeasonR57(date):''}catch(_){}}if(sea!=='winter')return x;
    if(f.via){   /* 經停整段列：跟著第二段的冬季抵達走 */
      try{var L2=[].concat(FLIGHTS,S.customFlights||[]).filter(function(y){return y&&!y.via&&y.code===f.code&&y.fr===f.via&&y.to===f.to})[0];if(!L2)return x;
        var r0=o0(L2,date),r1=adj(o0,L2,date,r0);if(!r0||!r1||r0===r1)return x;
        var dlt=(mn(r1.arr)+(+r1.dd||0)*1440)-(mn(r0.arr)+(+r0.dd||0)*1440);if(!dlt)return x;
        var ab=mn(x.arr)+(+x.dd||0)*1440+dlt,y=Object.assign({},x,{arr:hm(ab),dd:Math.floor(ab/1440)});try{y.dur=blockMin(y.fr,y.to,y.dep,y.arr,y.dd||0);y.durStr=durStr(y.dur)}catch(_){}return y}catch(_){return x}}
    var k=[f.code,f.fr,f.to,date.slice(0,7),x.dep,x.arr,x.dd].join('|');if(MEMO[k])return MEMO[k];
    var su=null;try{su=o0(f,sumDate(date))}catch(_){}
    if(!su||!su.dep)return x;var ss=su.seasonR57||su.seasonR48;if(!ss){try{ss=window.kgmSeasonR57?window.kgmSeasonR57(sumDate(date)):''}catch(_){}}if(ss!=='summer')return x;
    var bs=0;try{bs=blockMin(f.fr,f.to,su.dep,su.arr,su.dd||0)}catch(_){bs=0}if(!(bs>0))return x;
    var w=window.kgmWindDeltaR1023A(f.fr,f.to),off=0,dep=mn(x.dep);try{off=Math.round((TZ[f.to]-TZ[f.fr])*60)||0}catch(_){}   /* 跟 blockMin 同一個時區差（不正規化），日期才不會差一天 */
    var at=function(w){return dep+bs+w+off},in3=function(v){var m=((v%1440)+1440)%1440;return m>=180&&m<240};
    var a=at(w);
    if(in3(a)){var sg=w>0?1:-1,ok=false;for(var e=5;e<=20&&!ok;e+=5){if(!in3(at(w+sg*e))){w+=sg*e;ok=true}}if(!ok){var m=((a%1440)+1440)%1440;w-= (m-175)}a=at(w)}
    var y=Object.assign({},x,{arr:hm(a),dd:Math.floor(a/1440),windR1023A:w});
    try{y.dur=blockMin(y.fr,y.to,y.dep,y.arr,y.dd||0);y.durStr=durStr(y.dur)}catch(_){}
    if(Object.keys(MEMO).length>6000)MEMO={};MEMO[k]=y;return y;
  }
  /* 要在最外層（1012A 洛杉磯線依星期挑列那層會在之後再包一次）：不是自己就再包一次；重算是從夏季算定值，包兩次結果一樣 */
  var MY=null;
  function wrap(){var o=window.kgmSeasonFlightR48;if(typeof o!=='function'||o===MY)return;
    var w=function(f,date){var x=o.apply(this,arguments);try{if(x&&date)return adj(o,f,String(date),x)}catch(_){}return x};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}w.__k23=1;MY=w;window.kgmSeasonFlightR48=w;try{kgmSeasonFlightR48=w}catch(_){}}
  wrap();setTimeout(wrap,0);setTimeout(wrap,2000);setTimeout(wrap,6000);setTimeout(wrap,12000);
})();

/* ══ 1023A：取消航班（使用者：「航班動態去取消航班也要同步到飛機排班然後選擇方案如果是退費是指退費這一筆航段的費用（當初定了多少錢就是多少錢，
   附加服務費用也要退），系統會自動Process然後此類不自動創立案件編號…取消的話也要自動通知旅客」）
   ① 退費：只退被取消的那一段 —— 當初實付總額扣掉附加服務後依各段票價（訂位艙等、當天價格）比例分攤，加上這一段自己的選位費與行李費；
      直接退款、寫退款紀錄（refundsR60，跟旅客自己退票同一份），不開 IRR 案件；整筆都沒有剩下的段才把訂位改成已取消。
   ② 飛機排班：取消的那一段在機身勤務上標「已取消」（不再算進執飛段數、閒置表、航班機身查詢），重排之後再標一次。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var KEYS=['out','out2','inb','inb2'];
  function segsOf(b){var L=[];KEYS.forEach(function(k){try{var i=bookingSegInfo0813(b,k);if(i&&i.f)L.push({key:k,f:i.f,c:i.c||(k.indexOf('inb')===0?b.inbC:b.outC)})}catch(_){}});
    (b.mcFlights||[]).forEach(function(x,j){['', 'b'].forEach(function(t){try{var i=bookingSegInfo0813(b,'mc'+j+t);if(i&&i.f)L.push({key:'mc'+j+t,f:i.f,c:i.c})}catch(_){}})});return L}
  function bagFee(b,k){try{var n=+(((b.addons||{}).bagBySeg0812A||{})[k])||0;return n?Math.round(n*toTWD(125,'USD')):0}catch(_){return 0}}
  function seatFee(b,k){try{return +_seatFeePaidFor(b,k)||0}catch(_){return 0}}
  window.kgmSegRefundR1023A=function(b,seg){
    var L=segsOf(b),pax=Math.max(1,(b.paxList||[{}]).length),gone=(b.cancelledSegsR60||[]);
    var anc={};L.forEach(function(s){anc[s.key]=seatFee(b,s.key)+bagFee(b,s.key)});
    var ancAll=L.reduce(function(t,s){return t+anc[s.key]},0),paid=+b.total||0,fare=Math.max(0,paid-ancAll);
    var live=L.filter(function(s){return gone.indexOf(s.key)<0}),w={},W=0;
    live.forEach(function(s){var v=0;try{v=owPrice(Object.assign({},s.f,{date:s.f.date}),s.c,pax)||0}catch(_){}w[s.key]=v>0?v:1;W+=w[s.key]});
    var segFare=live.length<=1?fare:Math.round(fare*(w[seg]||0)/(W||1)),a=anc[seg]||0,last=live.length<=1;
    return {fare:segFare,anc:a,total:segFare+a,last:last,curr:b.curr||'TWD'};
  };
  function legsOf(code,date){var out=[];Object.keys(S.tailAssign||{}).forEach(function(t){(S.tailAssign[t]||[]).forEach(function(x){if(x&&x.code===code&&x.date===date)out.push(x)})});return out}
  window.kgmCancelFleetR1023A=function(){var n=0;Object.keys(S.flightOverrides||{}).forEach(function(k){var o=S.flightOverrides[k];if(!o||o.status!=='Cancelled')return;var i=k.indexOf('_');legsOf(k.slice(0,i),k.slice(i+1)).forEach(function(x){if(!x.cancelledR1023A){x.cancelledR1023A=1;n++}})});return n};
  var rb=window.kgmRebuildFleetR72;if(typeof rb==='function'&&!rb.__k23c){var rw=function(){var r=rb.apply(this,arguments);try{window.kgmCancelFleetR1023A()}catch(_){}return r};try{Object.keys(rb).forEach(function(k){if(!(k in rw))rw[k]=rb[k]})}catch(_){}rw.__k23c=1;window.kgmRebuildFleetR72=rw}
  setTimeout(function(){try{window.kgmCancelFleetR1023A()}catch(_){}},20000);
  var p0=window.processCancelledFlight0815;
  if(typeof p0==='function'&&!p0.__k23){
    var w=function(k,cfg){
      var i=String(k).indexOf('_'),code=String(k).slice(0,i),date=String(k).slice(i+1);
      var r;
      if(cfg&&cfg.mode==='refund'){
        r=[];S.flightCancelOps0815=S.flightCancelOps0815||{};S.flightCancelOps0815[k]=cfg;
        (S.bookings||[]).filter(function(b){return b&&b.status==='confirmed'&&findAffectedBookingSeg0815(b,code,date)}).forEach(function(b){
          var hit=findAffectedBookingSeg0815(b,code,date),q=window.kgmSegRefundR1023A(b,hit.seg),at=new Date().toISOString(),miles=0;
          b.cancelledSegsR60=(b.cancelledSegsR60||[]).concat([hit.seg]);b.total=Math.max(0,(+b.total||0)-q.total);
          (b.refundsR60=b.refundsR60||[]).push({at:at,segs:[hit.seg],fare:q.fare,fee:0,noShow:0,anc:q.anc,net:q.total,airlineCancelR1023A:code+' '+date});
          if(q.last){try{miles=refundMilesForBooking0815(b,'Cancelled flight '+code+' '+date+' '+b.pnr)}catch(_){}b.status='cancelled';b.cancelledAt=todayISO()}
          b.irrops={status:'refunded',resolution:'refund',affectedSeg:hit.seg,flight:code,date:date,cashRefund:q.total,fareRefund:q.fare,ancRefund:q.anc,milesRefund:miles,noCaseR1023A:true};
          var msg=(z()?('航班 '+code+'（'+date+'）已取消'+(cfg.reason?'（'+cfg.reason+'）':'')+'。這一段已自動退款 '+fmtAmt(q.total,q.curr)+'（票價 '+fmtAmt(q.fare,q.curr)+(q.anc?'＋附加服務 '+fmtAmt(q.anc,q.curr):'')+'），退回原付款方式'+(miles?'，並退還 '+miles.toLocaleString()+' 哩':'')+'。'+(q.last?'':'其他航段照常。'))
            :('Flight '+code+' on '+date+' is cancelled. This segment has been refunded '+fmtAmt(q.total,q.curr)+'.'));
          try{pushIrropsNotice0815(b,z()?'航班取消・已自動退款':'Flight cancelled · refunded',msg,'flight.cancelled_refund')}catch(_){}
          b.notifs=b.notifs||[];b.notifs.unshift({msg:msg,date:todayISO(),read:false});
          r.push(b.pnr);
        });
        try{persist0815()}catch(_){try{save()}catch(__){}}
      }else r=p0.apply(this,arguments);
      try{legsOf(code,date).forEach(function(x){x.cancelledR1023A=1});save()}catch(_){}
      return r};
    w.__k23=1;window.processCancelledFlight0815=w;try{processCancelledFlight0815=w}catch(_){}
  }
})();

/* ══ 1023A：後台 AI 要能做事、能回答（使用者：「取消10/23 03:00以後出發的航班 → ✕ 查無此組員（員工編號）。這種也要可以處理喔 AI要是萬能的」
   「我叫他幫我查後台相關他都要可以回答 我叫他幫我改系統什麼也要可以做 然後不會死當」
   「AI跟他說取消今日所有航班，他也要懂的Follow-Up像是詢問取消原因是否一致還有補償方案是什麼之類的」）
   站內引擎（沒有 Claude 金鑰時）在原本的規則之前先看：
   ① 取消航班：日期（今天／明天／後天／10/23／2026-10-23）、時間（03:00 以後／以前）、出發站、班號 → 先列出符合的班，
      再依序追問：原因（全部一樣，或逐班寫）→ 補償方案（1 退費＝這一段實付票價＋附加服務、2 改搭同航線下一班、可加發里程）→ 確認後執行；
      執行走後台航班動態同一條路（S.flightOverrides＋processCancelledFlight0815，旅客通知、飛機排班同步），途中說「算了」就放棄。
   ② 查詢：班號（＋日期）、訂位代號、員工編號、機身、延誤／取消清單、待處理案件 → 直接回答。
   ③ 有連線 Claude 時同樣兩件事以工具給它用（flight_cancel／data_query）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function allF(){return [].concat(FLIGHTS,S.customFlights||[])}
  function tpeNow(){var d=new Date(Date.now()+8*3600e3);return {date:d.toISOString().slice(0,10),min:d.getUTCHours()*60+d.getUTCMinutes()}}
  function mn(t){var q=String(t||'0:0').split(':');return (+q[0]||0)*60+(+q[1]||0)}
  function D(d,n){try{return addDays(d,n)}catch(_){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}}
  function dateIn(t){var n=tpeNow().date,y=+n.slice(0,4),m;
    if(/今天|今日|today/i.test(t))return n;if(/明天|明日|tomorrow/i.test(t))return D(n,1);if(/後天/.test(t))return D(n,2);
    if((m=/(20\d\d)[-\/.年](\d{1,2})[-\/.月](\d{1,2})/.exec(t)))return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
    if((m=/(?:^|[^\d])(\d{1,2})\s*[\/月]\s*(\d{1,2})(?!\d)/.exec(t))){var d=y+'-'+('0'+m[1]).slice(-2)+'-'+('0'+m[2]).slice(-2);if(d<D(n,-30))d=(y+1)+d.slice(4);return d}
    return ''}
  function timeIn(t){var m=/(\d{1,2})\s*[:：點]\s*(\d{2})?\s*(分)?\s*(以後|之後|後|起|以前|之前|前)/.exec(t);if(!m)return null;var v=(+m[1])*60+(+(m[2]||0));return {min:v,after:!/前/.test(m[4])}}
  function apsIn(t){var out=[],u=t.toUpperCase(),m,re=/\b([A-Z]{3})\b/g;while((m=re.exec(u))){if(/^KX\d/.test(m[1]))continue;try{if((typeof CITY_ZH!=='undefined'&&CITY_ZH[m[1]]))out.push(m[1])}catch(_){}}
    try{Object.keys(CITY_ZH).forEach(function(k){var nm=CITY_ZH[k];if(nm&&nm.length>=2&&t.indexOf(nm)>=0&&out.indexOf(k)<0)out.push(k)})}catch(_){}return out}
  function seasonal(f,d){try{return window.kgmSeasonFlightR48?(window.kgmSeasonFlightR48(f,d)||f):f}catch(_){return f}}
  function flies(f,d){try{return !!flyOn(seasonal(f,d),new Date(d+'T12:00:00'))}catch(_){return false}}
  function ov(code,d){return (S.flightOverrides||{})[code+'_'+d]||{}}
  function paxOn(code,d){var n=0;(S.bookings||[]).forEach(function(b){if(!b||b.status!=='confirmed')return;try{if(findAffectedBookingSeg0815(b,code,d))n++}catch(_){}});return n}
  /* ── ① 取消航班 ── */
  function findFlights(t){
    var d=dateIn(t)||tpeNow().date,tm=timeIn(t),codes=(t.toUpperCase().match(/\bKX\s?\d{1,4}\b/g)||[]).map(function(x){return x.replace(/\s/g,'')}),aps=apsIn(t);
    var out=[],seen={};
    allF().forEach(function(f){if(!f||f.partner||f.codeshare||f.via||!/^KX\d+$/.test(f.code))return;
      if(codes.length&&codes.indexOf(f.code)<0)return;
      if(aps.length&&!codes.length&&aps.indexOf(f.fr)<0&&!(aps.length>1&&aps.indexOf(f.to)>=0))return;
      if(!flies(f,d))return;var x=seasonal(f,d),k=f.code+'|'+f.fr+'|'+d;if(seen[k])return;seen[k]=1;
      if(tm){var v=mn(x.dep);if(tm.after?v<tm.min:v>=tm.min)return}
      if(ov(f.code,d).status==='Cancelled')return;
      out.push({code:f.code,fr:f.fr,to:f.to,dep:x.dep,arr:x.arr,date:d,pax:paxOn(f.code,d)})});
    out.sort(function(a,b){return mn(a.dep)-mn(b.dep)||a.code.localeCompare(b.code)});
    return {date:d,tm:tm,list:out};
  }
  var REASONS=[['天氣','Weather'],['機械','Technical'],['航管','ATC'],['營運','Operational'],['罷工','Industrial action'],['颱風','Typhoon'],['疫情','Public health']];
  function listTxt(L){return L.slice(0,15).map(function(x){return x.code+' '+x.fr+'→'+x.to+' '+x.dep+'（'+x.pax+' 筆訂位）'}).join('\n')+(L.length>15?'\n…另 '+(L.length-15)+' 班':'')}
  function start(t){
    var r=findFlights(t);if(!r.list.length)return '找不到符合的航班（'+r.date+(r.tm?(' '+('0'+Math.floor(r.tm.min/60)).slice(-2)+':'+('0'+r.tm.min%60).slice(-2)+(r.tm.after?' 以後':' 以前')):'')+'）。已經取消的班不會重複列。';
    S.adminAiPendR1023A={kind:'cancel',step:'reason',list:r.list,date:r.date,at:Date.now()};
    var nb=r.list.reduce(function(s,x){return s+x.pax},0);
    return '找到 '+r.list.length+' 班要取消（'+r.date+(r.tm?('，'+('0'+Math.floor(r.tm.min/60)).slice(-2)+':'+('0'+r.tm.min%60).slice(-2)+(r.tm.after?' 以後出發':' 以前出發')):'')+'），共 '+nb+' 筆訂位：\n'+listTxt(r.list)
      +'\n\n① 取消原因是什麼？全部同一個原因就直接回答（天氣／颱風／機械故障／航管流量／營運調整／罷工／其他請描述）；每班不同請寫「KX12 天氣、KX14 機械」。說「算了」就放棄。';
  }
  function reasonOf(t){var hit='';REASONS.forEach(function(r){if(!hit&&t.indexOf(r[0])>=0)hit=r[0]+(r[0]==='機械'?'故障':(r[0]==='航管'?'流量管制':(r[0]==='營運'?'調整':'')))});return hit||t.trim().slice(0,40)}
  function step(t){
    var P=S.adminAiPendR1023A;if(!P||P.kind!=='cancel')return null;
    if(Date.now()-P.at>30*60000){S.adminAiPendR1023A=null;return null}
    if(/^(算了|不要了|放棄|取消對話|cancel|abort)$/i.test(t.trim())){S.adminAiPendR1023A=null;return '好，已放棄，這 '+P.list.length+' 班沒有動。'}
    P.at=Date.now();
    if(P.step==='reason'){
      var per={},m,re=/(KX\s?\d{1,4})\s*[:：]?\s*([^、，,；;\n]+)/gi;while((m=re.exec(t)))per[m[1].toUpperCase().replace(/\s/g,'')]=reasonOf(m[2]);
      var all=Object.keys(per).length?'':reasonOf(t);P.list.forEach(function(x){x.reason=per[x.code]||all||'營運調整'});
      var miss=P.list.filter(function(x){return !per[x.code]&&!all});P.step='comp';
      var grp={};P.list.forEach(function(x){(grp[x.reason]=grp[x.reason]||[]).push(x.code)});
      return '原因：'+Object.keys(grp).map(function(k){return k+'（'+grp[k].length+' 班）'}).join('、')+(miss.length?'；沒寫到的 '+miss.length+' 班先記「營運調整」':'')
        +'\n\n② 補償方案？\n1）退費：退這一段的實付票價＋附加服務（選位、行李），系統自動退回原付款方式，不開案件\n2）改搭：自動改到同航線之後最近一班還在營運的航班（同艙等），旅客收到通知\n可以再加：「里程 3000」（每位會員補償哩程）、「餐券」（機場餐券／延誤過夜住宿）\n例如回答「1」或「2＋里程 3000」。';
    }
    if(P.step==='comp'){
      var mode=/(^|\D)2(\D|$)|改搭|下一班|改到/.test(t)?'move':(/(^|\D)1(\D|$)|退費|退款|refund/i.test(t)?'refund':'');
      if(!mode)return '請回答 1（退費）或 2（改搭下一班），可以再加「里程 3000」「餐券」。';
      var mi=/(\d{3,6})\s*(哩|miles?)/i.exec(t);P.comp={mode:mode,miles:mi?+mi[1]:0,voucher:/餐券|住宿|voucher/i.test(t)};P.step='confirm';
      var nb=P.list.reduce(function(s,x){return s+x.pax},0);
      return '③ 請確認：取消 '+P.list.length+' 班（'+P.date+'），'+(mode==='refund'?'退這一段實付票價＋附加服務（自動退款）':'改搭同航線下一班')+(P.comp.miles?'，每位會員補償 '+P.comp.miles.toLocaleString()+' 哩':'')+(P.comp.voucher?'，發放餐券／住宿':'')
        +'；系統會通知 '+nb+' 筆訂位、同步航班動態與飛機排班。\n回覆「確認」執行，或「算了」放棄。';
    }
    if(P.step==='confirm'){
      if(!/確認|是|好|ok|yes|執行|go/i.test(t))return '還沒執行。回覆「確認」執行，或「算了」放棄。';
      S.adminAiPendR1023A=null;return run(P);
    }
    return null;
  }
  function nextFlight(x){for(var i=0;i<=2;i++){var d=D(x.date,i),best=null;
      allF().forEach(function(f){if(!f||f.partner||f.via||f.fr!==x.fr||f.to!==x.to||!/^KX\d+$/.test(f.code))return;if(!flies(f,d))return;var y=seasonal(f,d);if(i===0&&mn(y.dep)<=mn(x.dep))return;if(ov(f.code,d).status==='Cancelled')return;if((P23cancel[f.code+'_'+d]))return;
        if(!best||mn(y.dep)<mn(best.dep))best=Object.assign({},y,{date:d})});if(best)return best}return null}
  var P23cancel={};
  function run(P){
    var done=0,nb=0,moved=0,fail=[],who=(S.adminUser||{}).empId||'AI';P23cancel={};P.list.forEach(function(x){P23cancel[x.code+'_'+x.date]=1});
    S.flightOverrides=S.flightOverrides||{};
    P.list.forEach(function(x){
      var k=x.code+'_'+x.date,cfg={mode:P.comp.mode==='move'?'move_existing':'refund',reason:x.reason};
      if(cfg.mode==='move_existing'){var nf=nextFlight(x);if(!nf){cfg={mode:'refund',reason:x.reason};fail.push(x.code+' 沒有後續航班，改為退費')}else cfg.moveFlight=nf}
      S.flightOverrides[k]=Object.assign({},S.flightOverrides[k]||{},{status:'Cancelled',depRemark:x.reason,reason:x.reason,cancelledBy:who,cancelledAt:new Date().toISOString(),aiR1023A:1});
      var before=paxOn(x.code,x.date);
      try{processCancelledFlight0815(k,cfg)}catch(e){fail.push(x.code+'：'+(e&&e.message||e))}
      nb+=before;if(cfg.mode==='move_existing')moved+=before;done++;
      if(P.comp.miles||P.comp.voucher)(S.bookings||[]).forEach(function(b){if(!b||!b.irrops||b.irrops.flight!==x.code||b.irrops.date!==x.date||b.compR1023A)return;b.compR1023A={miles:P.comp.miles,voucher:!!P.comp.voucher,at:new Date().toISOString()};
        var u=b.userId&&(S.users||[]).filter(function(q){return q&&q.id===b.userId})[0];if(u&&P.comp.miles){u.miles=(+u.miles||0)+P.comp.miles;(u.milesLog=u.milesLog||[]).unshift({date:todayISO(),miles:P.comp.miles,desc:'航班取消補償 '+x.code+' '+x.date})}
        b.notifs=b.notifs||[];b.notifs.unshift({msg:'航班 '+x.code+'（'+x.date+'）取消補償：'+(P.comp.miles?P.comp.miles.toLocaleString()+' 哩已入帳':'')+(P.comp.voucher?((P.comp.miles?'、':'')+'機場餐券／住宿請洽 KGM 櫃檯'):''),date:todayISO(),read:false})});
    });
    try{LS.set('kgmov4',S.flightOverrides)}catch(_){}try{window.kgmCancelFleetR1023A&&window.kgmCancelFleetR1023A()}catch(_){}
    try{logAct('AI 取消航班',P.date+' '+done+' 班 · '+(P.comp.mode==='move'?'改搭':'退費')+' · '+nb+' 筆訂位')}catch(_){}
    try{save()}catch(_){}
    return '✓ 已取消 '+done+' 班（'+P.date+'），通知 '+nb+' 筆訂位；'+(P.comp.mode==='move'?('改搭下一班 '+moved+' 筆'):'這一段已自動退款（不開案件）')+'；航班動態、飛機排班已同步。'+(fail.length?'\n注意：'+fail.join('；'):'');
  }
  /* ── ② 查詢 ── */
  function q(t){
    var u=t.toUpperCase(),m,d=dateIn(t)||tpeNow().date,out=[];
    var ask=/查|多少|幾|哪些|哪一|有沒有|列出|顯示|狀態|資料|是誰|誰|\?|？|嗎|how|what|which|list|show/i.test(t);
    if(!ask)return null;
    if((m=/\b(KX\s?\d{1,4})\b/.exec(u))){var code=m[1].replace(/\s/g,''),L=allF().filter(function(f){return f&&f.code===code&&!f.via&&!f.partner});if(!L.length)return '找不到 '+code+'。';
      L.forEach(function(f){if(!flies(f,d)){out.push(code+' '+f.fr+'→'+f.to+' '+d+' 沒有飛');return}var x=seasonal(f,d),o=ov(code,d),t0='',tl='',gt='',ct='';try{t0=acftOfFlight(code,d,f.fr,f.to)}catch(_){}try{tl=window.kgmTailOfR1023A?window.kgmTailOfR1023A(code,d,f.fr,f.to):''}catch(_){}
        try{var g=window.kgmGateOfR26?window.kgmGateOfR26(code,d):null;gt=g&&(g.gate||g.stand)||''}catch(_){}try{var c=window.kgmCounterOfFlightR929?window.kgmCounterOfFlightR929(code,d,f.fr):null;ct=c&&c.counter||''}catch(_){}
        var pl=null;try{pl=window.kgmPayloadR1023A?window.kgmPayloadR1023A(code,d,f.fr,f.to):null}catch(_){}
        out.push(code+' '+f.fr+'→'+f.to+' '+d+'：'+(o.status||'Scheduled')+(o.dep?'（新出發 '+o.dep+'）':'')+' · '+x.dep+'–'+x.arr+' · '+t0+(tl?' '+tl:'')+' · 訂位 '+paxOn(code,d)+' 筆'+(pl?' · 旅客 '+pl.pax+' 人、Payload 餘 '+Math.round(pl.left).toLocaleString()+' kg':'')+(ct?' · 櫃檯 '+ct:'')+(gt?' · 登機門 '+gt:''))});
      return out.join('\n')}
    if((m=/\b([A-Z0-9]{6})\b/.exec(u))&&/[A-Z]/.test(m[1])&&/\d/.test(m[1])){var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===m[1]})[0];if(b){var p0=(b.paxList||[])[0]||{};
      return '訂位 '+b.pnr+'：'+b.status+' · '+(b.paxList||[]).length+' 位（'+(p0.lastName||'')+'/'+(p0.firstName||'')+'）· '+[b.outF,b.inbF].filter(Boolean).map(function(f){return f.code+' '+f.fr+'→'+f.to+' '+f.date}).join('、')+' · 總額 '+(b.curr||'TWD')+' '+Number(b.total||0).toLocaleString()+(b.groupR1023A?' · 團體 '+(b.groupR1023A.name||''):'')+(b.irrops?' · 異常：'+b.irrops.status:'')}}
    if((m=/\b(K[GA-Z]?\d{5,6})\b/.exec(u))){var st=(S.staff||[]).filter(function(x){return x&&x.empId===m[1]})[0];if(st){var dut='';try{var g2=window.kgmGroundDutyR99?window.kgmGroundDutyR99(st.empId,d):null;if(g2&&st.role==='ground')dut=g2.off?'休':(g2.label+' '+g2.from+'–'+g2.to)}catch(_){}
      return st.empId+' '+st.name+' · '+(st.role||'')+(st.rank?' '+st.rank:'')+(st.nationality?' · '+st.nationality:'')+(st.base?' · base '+st.base:'')+(dut?' · '+d+' '+dut:'')}}
    if((m=/\b(B-?\d{5})\b/.exec(u))){var tl2=m[1].replace(/^B-?/,'B-'),legs=((S.tailAssign||{})[tl2]||[]).filter(function(x){return x&&x.date===d});
      return tl2+'（'+(window._typeOfTail?window._typeOfTail(tl2):'')+'）'+d+'：'+(legs.length?legs.map(function(x){return x.code+' '+x.route+' '+x.dep+(x.cancelledR1023A?'（已取消）':'')}).join('、'):'沒有排航班')}
    if(/延誤|delay/i.test(t)||/取消/.test(t)&&/哪些|列出|有沒有|幾/.test(t)){var want=/延誤|delay/i.test(t)?'Delayed':'Cancelled',L2=Object.keys(S.flightOverrides||{}).filter(function(k){return k.slice(-10)===d&&(S.flightOverrides[k]||{}).status===want});
      return d+' '+(want==='Delayed'?'延誤':'取消')+' '+L2.length+' 班'+(L2.length?'：'+L2.map(function(k){var o=S.flightOverrides[k];return k.split('_')[0]+(o.dep?' '+o.dep:'')+(o.reason?'（'+o.reason+'）':'')}).join('、'):'')}
    if(/航班|班機|幾班|flights?/i.test(t)){var n=0;allF().forEach(function(f){if(f&&!f.partner&&!f.via&&/^KX\d+$/.test(f.code)&&flies(f,d))n++});return d+' KGM 自營航班 '+n+' 段'}
    if(/案件|case/i.test(t)){var C=S.staffCasesR1007A||[],by={};C.forEach(function(c){by[c.status]=(by[c.status]||0)+1});return '案件 '+C.length+' 件：'+Object.keys(by).map(function(k){return k+' '+by[k]}).join('、')}
    return null;
  }
  window.kgmAiCancelR1023A=function(a){a=a||{};var t=String(a.text||'')||[a.date||'',a.after?a.after+'以後':'',a.station||'',(a.codes||[]).join(' ')].join(' ');
    if(!S.adminAiPendR1023A||S.adminAiPendR1023A.kind!=='cancel')return {ok:true,msg:start(t)};var r=step(t);return {ok:true,msg:r||''}};
  window.kgmAiQueryR1023A=function(a){var r=q(String((a&&(a.q||a.text))||'')+' ?');return {ok:!!r,msg:r||'查不到相關資料。'}};
  function isQ(t){return /哪些|有沒有|幾班|幾|列出|查|嗎|？|\?|多少|是否|狀態/.test(t)}
  function isCancel(t){return /取消/.test(t)&&/航班|班機|所有|全部|班|KX\s?\d|flight/i.test(t)&&!/候補|訂位代號|規則|優惠|升等|案件|假|請假|換班|對調/.test(t)&&!isQ(t)}
  function hook(){var a0=window.kgmAdminAiAskR929;if(typeof a0!=='function'||a0.__k23)return;
    var w=async function(text){
      var t=String(text||'').trim();if(!t)return;var r=null;
      try{
        if(S.adminAiPendR1023A&&isCancel(t)){S.adminAiPendR1023A=null;r=start(t)}   /* 新的取消指令：重新開始 */
        else if(S.adminAiPendR1023A&&isQ(t)&&S.adminAiPendR1023A.step!=='confirm'){var qa=q(t);if(qa)r=qa+'\n\n（剛才的取消還在等你回答'+({reason:'原因',comp:'補償方案',confirm:'確認'}[S.adminAiPendR1023A.step]||'')+'，說「算了」可以放棄）'}
        if(!r&&S.adminAiPendR1023A)r=step(t);if(!r&&isCancel(t))r=start(t);if(!r)r=q(t)}catch(e){r='處理時發生錯誤：'+(e&&e.message||e)}
      if(r==null)return a0.apply(this,arguments);
      try{var st=S.adminAiR929||(S.adminAiR929=LS.get('kgm_adminai929',{})||{}),k=(S.adminUser||{}).empId||'ADMIN',L=st[k]=st[k]||[];
        L.push({role:'user',text:t,at:new Date().toISOString()});L.push({role:'assistant',text:r,at:new Date().toISOString(),src:'local',note:z()?'站內 AI 引擎處理（依同一套權限執行）':'Built-in engine'});
        LS.set('kgm_adminai929',st)}catch(_){}
      try{window.kgmAdminAiDrawR929&&window.kgmAdminAiDrawR929()}catch(_){}try{render()}catch(_){}
    };
    try{Object.keys(a0).forEach(function(k){if(!(k in w))w[k]=a0[k]})}catch(_){}w.__k23=1;window.kgmAdminAiAskR929=w}
  hook();setTimeout(hook,0);setTimeout(hook,3000);
})();

/* ══ 1023A：AI 換班（使用者：「換其他人(AI)要寫員工編號換成是誰 然後自己可能變成DH也要寫PNR出來 然後按下接受此方案就會整個系統死當…
   AI調整班表只會調整到有影響那兩個喔不會調整其他的喔 很重要 也只有調整那一些要改的航班而已」）
   · 方案卡片寫清楚：誰（員工編號）原本飛哪幾班 → 改由誰（員工編號）飛；兩人這幾天如果有 DH（調位）一併列出 PNR（kgmDhEnsureR1008A，行程管理查得到）。
   · 核准＝把兩人那幾班對調寫進 S.crewSwapR1023A（排班引擎每天的計畫回傳前套用），只清畫面快取，不重排引擎 → 不卡、不動到別人。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function D(d,n){try{return addDays(d,n)}catch(_){return d}}
  function dhOf(id,from,to){var out=[];try{Object.keys(S.crewPositioningR121||{}).forEach(function(k){var p=k.split('|');if(p[0]<from||p[0]>to)return;(S.crewPositioningR121[k]||[]).forEach(function(x){if(x&&x.empId===id){var r=null;try{r=window.kgmDhEnsureR1008A?window.kgmDhEnsureR1008A(id,p[0],p[1],p[2],p[3]):null}catch(_){}out.push(p[0].slice(5)+' '+p[1]+' '+p[2]+'→'+p[3]+' DH'+(r&&r.pnr?'（PNR '+r.pnr+'）':''))}})})}catch(_){}return out}
  window.kgmSwapWhoR1023A=function(X,xName,o){
    var from=D(o.end,-14)<o.end?Object.keys(o.pins||{}).sort()[0]:o.end,to=o.end;
    var dx=dhOf(X,from,D(to,1)),dy=dhOf(o.id,from,D(to,1));
    return '<div class="k23-who"><div><b>'+E(xName)+'</b> <code>'+E(X)+'</code> 原本飛 <i>'+E(o.fromX||'—')+'</i> → 改由 <b>'+E(o.name)+'</b> <code>'+E(o.id)+'</code> 飛</div>'
      +'<div><b>'+E(o.name)+'</b> <code>'+E(o.id)+'</code> 原本飛 <i>'+E(o.fromY||'—')+'</i> → 改由 <b>'+E(xName)+'</b> <code>'+E(X)+'</code> 飛</div>'
      +((dx.length||dy.length)?'<div class="k23-dh">DH：'+dx.map(function(t){return E(X)+' '+E(t)}).concat(dy.map(function(t){return E(o.id)+' '+E(t)})).join('；')+'</div>':'<div class="k23-dh">'+(z()?'兩人這幾天都不需要 DH（調位）。':'No deadheading needed.')+'</div>')
      +'<div class="k23-dh">'+(z()?'只對調這兩位、這幾班，其他組員不會變動。':'Only these two crew and these flights change.')+'</div></div>';
  };
  window.kgmCrewSwapApplyR1023A=function(p){
    var L=S.crewSwapR1023A;if(!p||!L||!L.length||!p.flights)return p;var d=p.date;
    L.forEach(function(r){if(r.d!==d)return;p.flights.forEach(function(f){if(f.code!==r.code||f.fr!==r.fr)return;
      ['pilots','cabin'].forEach(function(k){(f[k]||[]).forEach(function(c){if(c&&c.empId===r.from){c.empId=r.to;c.name=r.toName||c.name;if(r.toSen!=null)c.seniority=r.toSen;c.swapR1023A=1}})})})});
    return p;
  };
  function legs(pinsDay){return String(pinsDay||'').split('|').filter(function(x){return x&&x!=='__LAYOVER__'}).map(function(x){var q=x.split('@');return {code:q[0],fr:q[1]}})}
  var APPR23=function(){
    var r=S.crewAiR928;if(!r||!r.ok||r.approved)return;
    var X=r.X.id,Y=r.Y.id,st={};(S.staff||[]).forEach(function(s){if(s)st[s.empId]=s});
    var recs=[];Object.keys(r.pins||{}).forEach(function(d){var pd=r.pins[d]||{};
      legs(pd[X]).forEach(function(l){recs.push({d:d,code:l.code,fr:l.fr,from:Y,to:X,toName:(st[X]||{}).name||r.X.name})});
      legs(pd[Y]).forEach(function(l){recs.push({d:d,code:l.code,fr:l.fr,from:X,to:Y,toName:(st[Y]||{}).name||r.Y.name})})});
    S.crewSwapR1023A=(S.crewSwapR1023A||[]).filter(function(x){return x&&x.d>=D(todayISO(),-7)}).concat(recs);
    r.approved=true;r.approvedAt=new Date().toISOString();r.changed=2;
    try{window.kgmPlanCacheClearR196&&window.kgmPlanCacheClearR196()}catch(_){}
    var msg=function(a,b,fa,fb){return (z()?'【換班核准】':'[Swap approved] ')+r.date+'：你原本的 '+fa+' 改由 '+b+' 執飛；你改飛 '+fb+'。'};
    try{notifyStaff(X,msg(X,r.Y.name+'（'+Y+'）',r.X.from,r.X.to))}catch(_){}try{notifyStaff(Y,msg(Y,r.X.name+'（'+X+'）',r.Y.from,r.Y.to))}catch(_){}
    try{logAct('AI 換班核准',r.X.name+'（'+X+'）⇄ '+r.Y.name+'（'+Y+'）'+r.date+' · '+recs.length+' 段')}catch(_){}
    S._crMsg928=(z()?'✓ 已核准：只對調 '+r.X.name+'（'+X+'）與 '+r.Y.name+'（'+Y+'）的 '+recs.length+' 段，其他組員不變，兩位已收到通知。':'Approved; only the two crew were changed.');
    try{save()}catch(_){}try{render()}catch(_){}
  };
  /* r229 的組員工具在之後（畫面第一次畫組員頁時）才定義 kgmCrewAiApproveR928 → 不是自己就再換回來 */
  function inst(){if(window.kgmCrewAiApproveR928!==APPR23)window.kgmCrewAiApproveR928=APPR23}
  inst();[0,1500,5000,15000,40000,90000].forEach(function(ms){setTimeout(inst,ms)});
  var rd=window.render;if(typeof rd==='function'&&!rd.__k23ap){var w=function(){inst();return rd.apply(this,arguments)};try{Object.keys(rd).forEach(function(k){if(!(k in w))w[k]=rd[k]})}catch(_){}w.__k23ap=1;window.render=w;try{render=w}catch(_){}}
  var CSS='.k23-who{margin:8px 0;padding:10px 12px;border:1px solid #E1E8E3;border-radius:10px;background:#F7FAF8;font-size:12.5px;line-height:1.7;color:#24312C}.k23-who code{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;background:#123C32;color:#fff;border-radius:5px;padding:1px 6px}.k23-who i{font-style:normal;color:#8A6A2E}.k23-dh{font-size:11.5px;color:#5F6B66;margin-top:2px}';
  try{var st2=document.createElement('style');st2.textContent=CSS;(document.head||document.documentElement).appendChild(st2)}catch(_){}
})();

/* ══ 1023A：前台 AI 一般問題（使用者：「前台AI不能只會回答那些喔其他基本KGM的問題要能夠正確清楚的回答喔」）
   原本自由輸入只有在「主選單」狀態回不出來時才查規章；在航班查詢／酬賓等模式下，問「行李可以帶多重」會被當成查航班的條件。
   現在最外層先判斷是不是一般問題：行李、改退票、報到／登機時間、登機組別、會員與哩程、特殊協助、寵物、嬰兒、單獨旅行孩童、
   危險物品、客服 → 用網站自己的規則資料（票價方案 FARES、規章 KGM_POLICY_DOCS_R914、登機組別）直接回答；其他問句再全文找規章；
   都找不到才交回原本的流程（有連線 Claude 時由 Claude 回答）。真人客服對話中、選位模式不攔。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function find(q){try{return (window.kgmFrontAiFindR1006A&&window.kgmFrontAiFindR1006A(q,2))||[]}catch(_){return []}}
  function pol(q,n){var h=find(q)[0];if(!h)return '';var b=String(h.body||'');return (n?b.slice(0,n):b)+(b.length>(n||1e9)?'…':'')}
  var CABS=[['Economy','經濟艙'],['Premium','豪華經濟艙'],['Business','商務艙'],['First','頭等艙']],FAM={Basic:'基本',Value:'超值',Deluxe:'豪華'};
  function fareRows(field){var out=[];CABS.forEach(function(c){var seen={};Object.keys(FARES).forEach(function(k){var f=FARES[k];if(!f||f.cabin!==c[0]||!f.familyR48||seen[f.familyR48])return;seen[f.familyR48]=1;out.push('· '+c[1]+'「'+(FAM[f.familyR48]||f.familyR48)+'」：'+field(f))})});return out.join('\n')}
  var T=[
    [/行李|托運|託運|超重|幾公斤|多重|baggage|luggage|suitcase/i,function(){return '託運行李額度（依艙等與票價方案，每位旅客）：\n'+fareRows(function(f){return f.bagZH||f.bag||'—'})+'\n（經濟艙「基本」短程 1 件、4,500 公里以上長程 2 件。）\n\n手提行李：'+pol('手提行李 七公斤',140)+'\n超額或超重請在報到前於「行程管理」加購，櫃檯現場加購會寄付款通知到您的信箱。'}],
    [/改票|退票|手續費|取消訂位|退款|change|refund/i,function(){return '改票／退票手續費（依票價方案，整筆訂位）：\n'+fareRows(function(f){return '改票 '+(f.chgZH||'—')+'、退票 '+(f.refZH||'—')})+'\n改票另補票價差額；可在「行程管理」自己改或退，航班被 KGM 取消時該航段票價與附加服務全額退回。'}],
    [/報到|check.?in|幾點到機場|櫃檯.*(開|關)|截止/i,function(){return '報到：\n· 線上報到：起飛前 48 小時開始（需託運超額行李、特殊協助、攜帶動物或證件須現場查驗者請到櫃檯）。\n· 機場櫃檯：起飛前 60 分鐘截止，建議國際線提早 2.5～3 小時到機場。\n· 登機：起飛前 30 分鐘開始登機。\n'+(pol('報到截止',120)?('規章：'+pol('報到截止',120)):'')}],
    [/登機.*(時間|幾點)|幾點登機|boarding time/i,function(){return '所有航班一律於起飛前 30 分鐘開始登機，請在登機證上的時間前到登機門。'}],
    [/登機組別|優先登機|zone|priority boarding/i,function(){return '登機組別：頭等艙 PRIORITY → 商務艙與金卡／鑽石卡會員 ZONE 1 → 豪華經濟艙與經濟艙「豪華」方案 ZONE 2 → 經濟艙依座位排數由後往前 ZONE 3／4（A380、777-9 分 3／4／5）；員工票最後一組。銀卡沒有優先登機。'}],
    [/會員|等級|升級|金卡|銀卡|鑽石|哩程怎麼|累積|miles?|tier|member/i,function(){return (pol('會員等級 資格 晉升',260)||'')+'\n\n哩程累積與兌換規則請見「規章 › 無限萬哩遊會員」；您的哩程餘額可以直接問我「我還有多少里程」。'}],
    [/寵物|狗|貓|動物|pet/i,function(){return '寵物（犬、貓）可以，需於起飛前申請：'+pol('寵物 受理',300)}],
    [/嬰兒|小孩|兒童|孩童|infant|child/i,function(){return pol('嬰兒 成人 攜帶',220)+'\n單獨旅行孩童（5–11 歲）須申請 UM 服務：'+pol('單獨旅行孩童',160)}],
    [/輪椅|特殊協助|身障|視障|聽障|氧氣|擔架|懷孕|孕婦|wheelchair|assistance|pregnan/i,function(){var p=/懷孕|孕婦|pregnan/i.test(String(window.__k23q||''));return p?'懷孕 28–36 週需附 7 日內醫師開立的適航證明（含預產期），請於報到前上傳；36 週以上（多胞胎 32 週以上）不予受理搭乘。':('特殊協助申請時限：'+pol('申請時限 輪椅',300))}],
    [/危險物品|行動電源|充電寶|鋰電池|打火機|battery|power bank/i,function(){return '行動電源與備用鋰電池只能放手提行李、不能託運：'+pol('行動電源 鋰電池',280)}],
    [/客服|電話|聯絡|真人|agent|contact/i,function(){return '可以按對話視窗下方「轉真人客服」，客服會在這裡直接接手；也可以在「行程管理」查訂位或申請案件。'}]
  ];
  function looksSearch(t){return /\b[A-Z]{3}\b.*\b[A-Z]{3}\b|\d{1,2}\s*[\/月]\s*\d{1,2}|\b20\d\d-\d\d-\d\d\b|從.+到|飛往|去程|回程|來回|單程/.test(t)}
  window.kgmFrontFaqR1023A=function(t){window.__k23q=t;for(var i=0;i<T.length;i++){if(T[i][0].test(t)){var a='';try{a=T[i][1]()}catch(_){a=''}if(a)return a}}
    if(!looksSearch(t)&&/\?|？|嗎|怎麼|如何|可以|能不能|多少|什麼|哪裡|規定|政策|how|what|can i|policy/i.test(t)){try{var l=window.kgmFrontAiLocalR1006A?window.kgmFrontAiLocalR1006A(t):'';if(l)return l}catch(_){}}
    return ''};
  var MY=null;
  function inst(){var o=window.kgmSendAi0819I;if(typeof o!=='function'||o===MY)return;
    var w=function(){
      try{var inp=document.getElementById('aiInput'),t=String(inp&&inp.value||'').trim(),c=S.aiConversation0819I;
        var live=c&&c.csIdR1006A&&(S.csQueueR1006A||{})[c.csIdR1006A]&&/waiting|active/.test((S.csQueueR1006A||{})[c.csIdR1006A].status);
        if(t&&!live&&!(c&&c.mode==='seat65')){var a=window.kgmFrontFaqR1023A(t);
          if(a){inp.value='';if(!c||!c.messages){try{window.kgmRestartAi0819I()}catch(_){}c=S.aiConversation0819I}
            var now=new Date().toISOString();c.messages.push({role:'user',text:t,at:now});c.messages.push({role:'assistant',text:a,at:now,srcR1023A:'faq'});c.done=true;
            try{save()}catch(_){}try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}return}}}catch(_){}
      return o.apply(this,arguments)};
    try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}MY=w;window.kgmSendAi0819I=w;try{window.sendAI=sendAI=w}catch(_){}}
  inst();[0,1500,5000,15000,40000].forEach(function(ms){setTimeout(inst,ms)});
})();

/* ══ 1023A R：員工票候補通知與 BigDeal 也看 Payload；報到行李超額提示的樣式 ══════════════
   使用者：「員工票候補狀態也要consider workload喔 big deal也是」
   ① 起飛前 48–72 小時員工票通知（r40 kgmStaffStandbyNoticeR929）：座位夠還要 Payload 夠 —— 同一班已經通知「請前往」的其他員工票先扣掉（每人 107 kg）。
   ② BigDeal：升等不會多一位旅客，但免費托運額度會變大（例如經濟 1×23 kg → 商務 2×32 kg），多出來的額度要放得進 Payload 餘量；
      依排名往下算，放不下的那一筆改成 Out of Bid（b.payloadR1023A），結標時就不會得標。 */
(function(){
'use strict';
function z(){try{return LANG!=='en'}catch(_){return true}}
function kg(){return +window.KGM_STAFF_KG_R1023A||107}
window.kgmStaffPayloadR1023A=function(f,date,pax,pnr){
  if(!f||!date||!window.kgmPayloadR1023A)return null;
  var pl=null;try{pl=window.kgmPayloadR1023A(f.code,date,f.fr,f.to)}catch(_){}
  if(!pl||!isFinite(pl.left))return null;
  var used=0;   /* 同一班已經通知「請前往機場」的其他員工票 */
  try{(S.bookings||[]).forEach(function(b){if(!b||!b.staffTix||b.dhR929||b.status==='cancelled'||b.pnr===pnr)return;
    var r=(b.stbNoticeR929||{});Object.keys(r).forEach(function(k){var x=r[k];if(x&&x.go){
      var on=false;try{on=(window.segs7?window.segs7(b):[]).some(function(s){return s&&s.f&&s.f.code===f.code&&s.date===date&&(s.key||s.f.code)===k})}catch(_){}
      if(on)used+=Math.max(1,(b.paxList||[]).length)*kg()}})})}catch(_){}
  var left=pl.left-used,need=Math.max(1,+pax||1)*kg();
  return {ok:left>=need,left:left,need:need,kg:kg(),mzfw:pl.mzfw,zfw:pl.zfw,used:used};
};
function bagKgOf(cls){var f=null;try{f=(FARES&&FARES[cls])||(AWARD_FARES&&AWARD_FARES[cls])||null}catch(_){}
  var m=/(\d+)\s*[×xX]\s*(\d+)\s*kg/.exec(String(f&&f.bag||''));return m?(+m[1])*(+m[2]):23}
function cabBagKg(cab){var lo=null,kgv=0;try{Object.keys(FARES).forEach(function(c){var f=FARES[c];if(f&&f.cabin===cab&&(lo===null||(+f.pct||0)<lo)){lo=+f.pct||0;kgv=bagKgOf(c)}})}catch(_){}return kgv||46}
function curCls(b){try{var bk=(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0];if(!bk)return '';
  return ((bk.segmentFare0826A||{})[b.segKey])||(b.segKey==='inb'?bk.inbC:bk.outC)||''}catch(_){return ''}}
window.kgmBigDealBagKgR1023A=function(b){var cls=curCls(b),from=bagKgOf(cls),to=cabBagKg(b.toCabin||b.cabin);return Math.max(0,to-(cls?from:23))*Math.max(1,+b.pax||1)};
var MY=null;
function inst(){var o=window.kgmBigDealRankR929;if(typeof o!=='function'||o===MY)return;
  var w=function(code,date,fr,to,cab,notify){
    var r=o.apply(this,arguments);
    try{if(r&&r.list&&r.list.length&&window.kgmPayloadR1023A){
      var pl=window.kgmPayloadR1023A(code,date,fr,to),left=pl&&isFinite(pl.left)?pl.left:Infinity,used=0;
      r.payloadKg=isFinite(left)?left:null;
      r.list.forEach(function(b){b.payloadR1023A=false;if(b.status!=='leading')return;var need=window.kgmBigDealBagKgR1023A(b);
        if(used+need>left){b.status='outbid';b.payloadR1023A=true;b.payloadNeedR1023A=need}else used+=need});
      r.payloadUsed=used}}catch(_){}
    return r};
  try{Object.keys(o).forEach(function(k){if(!(k in w))w[k]=o[k]})}catch(_){}MY=w;window.kgmBigDealRankR929=w}
inst();[0,1500,5000,15000].forEach(function(ms){setTimeout(inst,ms)});
var CSS='.k23-bagmail{margin:12px 0 4px;padding:12px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F0C778;color:#6B4A0E}'
  +'.k23-bagmail b{display:block;font-size:14px;letter-spacing:.2px}.k23-bagmail p{margin:4px 0 0;font-size:12.5px;line-height:1.7;color:#6B5A2A}'
  +'.k23-bagmail.sent{background:#E9F5EF;border-color:#9FD3B8;color:#0B6B48}.k23-bagmail.sent p{color:#3D6655}';
try{var st=document.createElement('style');st.id='k23-css-r';st.textContent=CSS;(document.head||document.documentElement).appendChild(st)}catch(_){}
})();

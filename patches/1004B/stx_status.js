
/* 1004B：員工票訂位頁的「剩餘座位預估」。使用者：「我想在員工票定位的頁面寫剩餘幾個位置預估」
   = 這個艙等扣掉 DH、哩程升等之後的空位，再扣掉順位排在這位員工前面、預計會上這個艙等的員工票。 */
window.kgmStaffSeatEstR1004B=function(f,date,cabin){
  try{
    var pl=window.kgmStandbyPlanR1004B(f.code,date,f.fr,f.to);if(!pl.cap[cabin])return null;
    var me=S.stx||{},pr=PLAN1004B[String(me.plan||'').toUpperCase()];pr=pr==null?4:pr;
    var emp=(S.staff||[]).filter(function(x){return x&&x.empId===me.empId})[0],j=emp&&(emp.joinDate||emp.hireDate);
    var yrs=j?Math.max(0,(+String(date).slice(0,4))-(+String(j).slice(0,4))):0;
    var fr=(me.fam||[]).some(function(x){return x&&x.relation==='friend'})?1:0,ahead=0;
    pl.staff.forEach(function(r){
      if(me.empId&&r.empIdR1004B===me.empId)return;
      if(!r.clearR1004B||r.clearCabR1004B!==cabin)return;
      var rp=PLAN1004B[r.planR1004B];rp=rp==null?2:rp;var rf=r.friendR1004B?1:0;
      if(rf<fr||(rf===fr&&(rp<pr||(rp===pr&&r.yearsR1004B>=yrs))))ahead+=r.seatsR1004B;
    });
    return {left:Math.max(0,(pl.forStaff[cabin]||0)-ahead),ahead:ahead,base:pl.forStaff[cabin]||0,dh:pl.dh.length,up:pl.up.length};
  }catch(_){return null}
};

/* 1004B：後台「員工票狀態」分頁。使用者：「後台多一個員工票狀態的TAB，可以搜尋現在每個航班剩餘幾個位置
   （里程升等候補優先算進去如果有），然後是即時更新的」；「員工票狀態系統也要讓這些DH優先喔才是員工票」
   與航班資料頁的候補名單共用 kgmStandbyPlanR1004B，數字一定一致。 */
window.kgmStxStatusSetR1004B=function(k,v){
  var q=S.stxStatusQR1004B=S.stxStatusQR1004B||{};
  q[k]=k==='date'?String(v||''):String(v||'').trim().toUpperCase();
  try{render()}catch(_){}
};
window.kgmStxStatusOpenR1004B=function(code,date,fr,to){
  S.adminTab='flightdata';S.opsQueryR7=code;S.opsSelectedR7=[code,date,fr,to].join('|');
  try{render()}catch(_){}
};
window.kgmStxStatusRowsR1004B=function(d,fr,to,code){
  var codeN=/^\d+$/.test(code||'')?'KX'+code:(code||''),pairs={},seen={},list=[];
  try{[].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){
    if(!f||f.partner||!/^KX/.test(String(f.code||'')))return;
    if(codeN&&f.code!==codeN)return;if(fr&&f.fr!==fr)return;if(to&&f.to!==to)return;
    pairs[f.fr+'|'+f.to]=1;
  })}catch(_){}
  Object.keys(pairs).forEach(function(k){
    var p=k.split('|'),fs=[];try{fs=sortedFlights(p[0],p[1],d)||[]}catch(_){}
    fs.forEach(function(f){
      if(!f||f.partner||!/^KX/.test(String(f.code||'')))return;
      if(codeN&&f.code!==codeN)return;if(f.fr!==p[0]||f.to!==p[1])return;
      if(f.via)return;   /* 經停的直通行程（TPE→MEL via KUL）不是實體航段，各段另外列 */
      var key=f.code+'|'+f.fr+'|'+f.to;if(seen[key])return;seen[key]=1;
      list.push(f);
    });
  });
  list.sort(function(a,b){return String(a.dep||'').localeCompare(String(b.dep||''))||String(a.code).localeCompare(String(b.code))});
  return list.map(function(f){return {f:f,p:window.kgmStandbyPlanR1004B(f.code,d,f.fr,f.to)}});
};
var DHP1004B={};
window.kgmStxStatusPageR1004B=function(){
  var q=S.stxStatusQR1004B=S.stxStatusQR1004B||{};
  var d=/^\d{4}-\d\d-\d\d$/.test(q.date||'')?q.date:T();
  var fr=q.fr||'',to=q.to||'',code=q.code||'';
  if(!fr&&!to&&!code)fr='TPE';
  /* DH 來自組員排班引擎（S.crewPositioningR121）；那一天還沒算過就在背景算一次再重畫。
     引擎一天要 2–6 秒，只自動算到 21 天內；更遠的日期組員班表本來就還沒排。 */
  var dhKnown=Object.keys(S.crewPositioningR121||{}).some(function(k){return k.slice(0,10)===d});
  var dhFar=d>addDays(T(),21),dhBusy=false;
  if(!dhKnown&&!dhFar&&typeof window.crewOnFlight==='function'){
    dhBusy=true;
    if(!DHP1004B[d]){DHP1004B[d]=1;setTimeout(function(){
      try{window.crewOnFlight('KX20',d)}catch(_){}
      sbCache1004B={};try{if(S.view==='admin'&&S.adminTab==='stxstatus')render()}catch(_){}
    },300)}
  }
  /* 引擎的 DH 有了之後，再把組員鏈補出來的 DH 也算到這一天（分段，算完重畫） */
  if(dhKnown&&!dhFar&&window.kgmDhWarmR1004B&&!window.kgmDhWarmR1004B(d))dhBusy=true;
  var rows=window.kgmStxStatusRowsR1004B(d,fr,to,code);
  var CZ={First:z()?'頭':'F',Business:z()?'商':'J',Premium:z()?'豪':'W',Economy:z()?'經':'Y'};
  function lvl(n){return n>=10?['ok',z()?'寬鬆':'Open']:n>=3?['mid',z()?'尚可':'Fair']:n>=1?['low',z()?'緊':'Tight']:['full',z()?'已滿':'Full']}
  var tot={fl:rows.length,dh:0,up:0,upOk:0,sp:0,spOk:0,full:0};
  var body=rows.map(function(x){
    var f=x.f,p=x.p,L=lvl(p.afterTotal);
    tot.dh+=p.dh.length;tot.up+=p.up.length;tot.upOk+=p.upClear;tot.sp+=p.staffPax;tot.spOk+=p.staffClearPax;if(!p.afterTotal)tot.full++;
    var cabs=['First','Business','Premium','Economy'].filter(function(c){return p.cap[c]}).map(function(c){
      return '<span class="k4b-ss-cab'+(p.forStaff[c]?'':' z')+'"><i>'+CZ[c]+'</i>'+p.forStaff[c]+'</span>'}).join('');
    var ac='';try{ac=acftNameOf(Object.assign({},f,{date:d}))}catch(_){ac=f.acft||''}
    return '<tr>'
      +'<td><b class="r40-mono">'+E(f.code)+'</b></td>'
      +'<td>'+E(f.fr)+' → '+E(f.to)+'<small class="k4b-sub">'+E(f.dep||'')+' · '+E(ac)+'</small></td>'
      +'<td class="c">'+p.dh.length+'</td>'
      +'<td class="c">'+(p.up.length?'<b>'+p.upClear+'</b><small> / '+p.up.length+'</small>':'—')+'</td>'
      +'<td><div class="k4b-ss-cabs">'+cabs+'</div></td>'
      +'<td class="c"><b class="k4b-ss-big">'+p.forStaffTotal+'</b></td>'
      +'<td class="c">'+(p.staffPax?'<b>'+p.staffClearPax+'</b><small> / '+p.staffPax+'</small>':'—')+'</td>'
      +'<td class="c"><b class="k4b-ss-big">'+p.afterTotal+'</b></td>'
      +'<td><span class="k4b-ss-l '+L[0]+'">'+L[1]+'</span></td>'
      +'<td><button class="btn btn-sm" onclick="kgmStxStatusOpenR1004B(\''+A(f.code)+'\',\''+A(d)+'\',\''+A(f.fr)+'\',\''+A(f.to)+'\')">'+(z()?'候補名單':'Standby')+' ›</button></td></tr>';
  }).join('');
  var now=new Date(),hh=function(n){return (n<10?'0':'')+n};
  return '<section class="k4b-ss">'
    +'<header><div><small>STAFF TRAVEL · LIVE LOAD</small><h2>'+(z()?'員工票狀態':'Staff travel status')+'</h2>'
      +'<p>'+(z()?'每班可給員工票的座位＝目前空位，先扣調位組員（DH），再扣哩程升等候補（依申請先後），剩下的才給員工票（依方案、年資、艙等）。資料隨訂位、候補處理即時更新。'
                 :'Seats for staff = seats left, after crew deadheads and then mileage-upgrade standbys. Updates live.')+'</p></div>'
      +'<div class="k4b-ss-live"><i></i>'+(z()?'即時更新':'Live')+'<small>'+hh(now.getHours())+':'+hh(now.getMinutes())+':'+hh(now.getSeconds())+'</small></div></header>'
    +'<div class="k4b-ss-bar">'
      +'<label>'+(z()?'日期':'Date')+'<input type="date" class="inp" value="'+E(d)+'" onchange="kgmStxStatusSetR1004B(\'date\',this.value)"></label>'
      +'<label>'+(z()?'出發':'From')+'<input class="inp" maxlength="3" value="'+E(fr)+'" placeholder="'+(z()?'全部':'All')+'" onchange="kgmStxStatusSetR1004B(\'fr\',this.value)"></label>'
      +'<label>'+(z()?'抵達':'To')+'<input class="inp" maxlength="3" value="'+E(to)+'" placeholder="'+(z()?'全部':'All')+'" onchange="kgmStxStatusSetR1004B(\'to\',this.value)"></label>'
      +'<label>'+(z()?'班號':'Flight')+'<input class="inp" maxlength="6" value="'+E(code)+'" placeholder="KX180" onchange="kgmStxStatusSetR1004B(\'code\',this.value)"></label>'
      +((q.fr||q.to||q.code)?'<button class="btn btn-sm" onclick="S.stxStatusQR1004B={date:\''+A(d)+'\'};render()">'+(z()?'清除條件':'Clear')+'</button>':'')
    +'</div>'
    +'<div class="k4b-ss-sum">'
      +'<span><i>'+(z()?'航班':'Flights')+'</i><b>'+tot.fl+'</b></span>'
      +'<span><i>'+(z()?'調位組員 DH':'Crew DH')+'</i><b>'+(dhBusy?'<em class="k4b-ss-wait">'+(z()?'計算中…':'Working…')+'</em>':dhFar&&!dhKnown?'<em class="k4b-ss-wait">'+(z()?'班表未排':'Not rostered')+'</em>':tot.dh)+'</b></span>'
      +'<span><i>'+(z()?'哩程升等 預計成功':'Upgrades clear')+'</i><b>'+tot.upOk+'<small> / '+tot.up+'</small></b></span>'
      +'<span><i>'+(z()?'員工票 預計可上（人）':'Staff clear (pax)')+'</i><b>'+tot.spOk+'<small> / '+tot.sp+'</small></b></span>'
      +'<span><i>'+(z()?'員工票已滿的班次':'Full flights')+'</i><b class="'+(tot.full?'r':'')+'">'+tot.full+'</b></span>'
    +'</div>'
    +(rows.length?'<div class="r40-scroll"><table class="k4b-ss-t"><thead><tr>'
      +'<th>'+(z()?'班號':'Flight')+'</th><th>'+(z()?'航線 / 起飛 / 機型':'Route')+'</th><th class="c">DH</th>'
      +'<th class="c">'+(z()?'哩程升等':'Upgrades')+'</th><th>'+(z()?'各艙可給員工票':'Seats for staff by cabin')+'</th>'
      +'<th class="c">'+(z()?'員工票可用':'For staff')+'</th><th class="c">'+(z()?'員工票候補（人）':'Staff standby')+'</th>'
      +'<th class="c">'+(z()?'候補後剩餘':'Left after')+'</th><th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'+body+'</tbody></table></div>'
     :'<div class="r40-empty">'+(z()?'這一天沒有符合條件的航班。':'No flights match.')+'</div>')
    +'</section>';
};
/* 停在這一頁時每 30 秒重算一次（正在輸入時不打斷）；別的分頁、別的視窗的異動也會透過同步引擎即時重畫 */
setInterval(function(){
  try{
    if(document.hidden||S.view!=='admin'||!S.adminAuthed||S.adminTab!=='stxstatus')return;
    var a=document.activeElement;if(a&&a.closest&&a.closest('.k4b-ss-bar'))return;
    render();
  }catch(_){}
},30000);

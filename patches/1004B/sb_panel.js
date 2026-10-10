  /* 1004B：左右兩欄 —— 左：哩程升等（申請先後）；右：員工票（方案→年資→艙等），眷屬縮排在同一張訂位的員工下面。
     每一列先標系統預判（依剩餘座位；DH 與哩程升等先算）。 */
  try{if(window.kgmDhWarmR1004B)window.kgmDhWarmR1004B(f.date)}catch(_){}
  var plan=window.kgmStandbyPlanR1004B(f.code,f.date,f.fr,f.to);
  var CZ1004B={First:z()?'頭等':'First',Business:z()?'商務':'Business',Premium:z()?'豪經':'Premium',Economy:z()?'經濟':'Economy'};
  var REL1004B={spouse:z()?'配偶':'Spouse',child:z()?'子女':'Child',parent:z()?'父母':'Parent',friend:z()?'同性朋友':'Friend',sibling:z()?'兄弟姊妹':'Sibling'};
  function verd(ok,txt){return '<span class="k4b-v '+(ok?'ok':'no')+'">'+(ok?'✓ ':'✕ ')+txt+'</span>'}
  function simTag(r){return r.simR929?'<i class="k4b-sim">'+(z()?'模擬':'SIM')+'</i>':''}
  /* 分子分母拆成兩個元素：r97 的 sweepQuota97 會把畫面上所有葉節點「N / 3」改寫成免費升等額度（實測把「3 / 3」改成「0 / 3」） */
  var seatStrip='<div class="k4b-sb-strip"><div class="k4b-sb-seats"><small>'+(z()?'目前剩餘座位<br>系統預估':'Seats left<br>estimate')+'</small>'
      +['First','Business','Premium','Economy'].filter(function(c){return plan.cap[c]}).map(function(c){return '<span><i>'+CZ1004B[c]+'</i><b>'+plan.left[c]+'</b></span>'}).join('')
    +'</div>'
    +'<div class="k4b-sb-flow"><span><i>'+(z()?'① 調位組員 DH':'① Crew DH')+'</i><b>'+plan.dh.length+'</b><em>'+(z()?'先佔':'first')+'</em></span>'
      +'<span><i>'+(z()?'② 哩程升等':'② Upgrades')+'</i><b>'+plan.upClear+'<small> / '+plan.up.length+'</small></b><em>'+(z()?'預計成功':'clear')+'</em></span>'
      +'<span><i>'+(z()?'③ 員工票（人）':'③ Staff (pax)')+'</i><b>'+plan.staffClearPax+'<small> / '+plan.staffPax+'</small></b><em>'+(z()?'預計可上':'clear')+'</em></span>'
      +'<span><i>'+(z()?'給員工票的座位':'Seats for staff')+'</i><b>'+plan.forStaffTotal+'</b><em>'+(z()?'扣除 ①②':'after ①②')+'</em></span></div></div>';
  var upRows=plan.up.map(function(r){
    var act='';
    if(r.simR929)act='<button class="btn btn-sm btn-g" onclick="kgmSbSimDecideR929(\''+A(r.id)+'\',\'ok\')">'+(z()?'候補成功':'Clear')+'</button><button class="btn btn-sm r40-no" onclick="kgmSbSimDecideR929(\''+A(r.id)+'\',\'no\')">'+(z()?'失敗・退還哩程':'Fail & refund')+'</button>';
    else if(typeof window.adminDecideUpgrade0810K==='function')act='<button class="btn btn-sm btn-g" onclick="adminDecideUpgrade0810K(\''+A(r.id)+'\',true)">'+(z()?'候補成功':'Clear')+'</button><button class="btn btn-sm r40-no" onclick="adminDecideUpgrade0810K(\''+A(r.id)+'\',false)">'+(z()?'失敗・退還哩程':'Fail & refund')+'</button>';
    return '<tr><td class="k4b-n">'+r.rankR1004B+'</td>'
      +'<td><b>'+E(r.name)+'</b>'+(r.pax>1?' <small>×'+r.pax+'</small>':'')+'<small class="k4b-sub">'+simTag(r)+'PNR <span class="r40-mono">'+E(r.pnr)+'</span></small><small class="k4b-sub">'+(z()?'申請 ':'Applied ')+E(r.atR1004B||'—')+'</small></td>'
      +'<td class="k4b-nw">'+E((r.fromCabR1004B?CZ1004B[r.fromCabR1004B]+' → ':'')+CZ1004B[r.toCabR1004B])+'<small class="k4b-sub">'+(r.miles?N(r.miles)+' mi':'—')+'</small></td>'
      +'<td>'+verd(r.clearR1004B,r.clearR1004B?(z()?'預計成功':'Likely'):(z()?'預計失敗・無位':'No seat'))+'</td>'
      +'<td class="r40-act">'+act+'</td></tr>';
  }).join('');
  var awRows=plan.award.map(function(r){
    return '<tr class="k4b-aw"><td class="k4b-n">—</td><td><b>'+E(r.name)+'</b>'+(r.pax>1?' <small>×'+r.pax+'</small>':'')+'<small class="k4b-sub">PNR <span class="r40-mono">'+E(r.pnr)+'</span></small></td>'
      +'<td><span class="r40-kind r40-k-award">'+(z()?'酬賓機票':'Award')+'</span><small class="k4b-sub">'+(r.miles?N(r.miles)+' mi':'—')+'</small></td>'
      +'<td>'+verd(true,z()?'已開票・確認座位':'Ticketed')+'</td><td class="r40-act"></td></tr>';
  }).join('');
  var stRows=plan.staff.map(function(r){
    var act='';
    if(r.simR929)act='<button class="btn btn-sm btn-g" onclick="kgmSbSimDecideR929(\''+A(r.id)+'\',\'ok\')">'+(z()?'候補成功・配位':'Seat')+'</button><button class="btn btn-sm r40-no" onclick="kgmSbSimDecideR929(\''+A(r.id)+'\',\'none\')">'+(z()?'本班無位':'No seat')+'</button>';
    var cabTxt=r.cabsR1004B.map(function(c){return CZ1004B[c]}).join(' / ');
    var h='<tr><td class="k4b-n">'+r.rankR1004B+'</td>'
      +'<td><b>'+E(r.name)+'</b><small class="k4b-sub">'+simTag(r)+'PNR <span class="r40-mono">'+E(r.pnr)+'</span></small><small class="k4b-sub">'+(z()?'年資 ':'')+r.yearsR1004B+(z()?' 年':' yr')+(r.empIdR1004B?' · '+E(r.empIdR1004B):'')+'</small></td>'
      +'<td><b class="k4b-plan">'+E(r.planR1004B)+'</b>'+(r.friendR1004B?' <small class="k4b-fr">'+(z()?'同性朋友同行・順位最後':'with friend · last')+'</small>':'')+'<small class="k4b-sub">'+cabTxt+'</small></td>'
      +'<td>'+verd(r.clearR1004B,r.clearR1004B?(z()?'預計可上':'Likely'):(z()?'預計無位':'No seat'))
        +'<small class="k4b-sub">'+(r.clearR1004B?CZ1004B[r.clearCabR1004B]+(z()?'艙':'')+' · ':'')+r.seatsR1004B+(z()?' 人':' pax')+'</small></td>'
      +'<td class="r40-act">'+act+'</td></tr>';
    r.famR1004B.forEach(function(m){
      h+='<tr class="k4b-fam"><td></td><td colspan="2"><span class="k4b-fam-in">└ '+E(m.name)+' <small>'+E(REL1004B[m.rel]||m.rel||(z()?'眷屬':'Dependant'))+(m.inf?(z()?'・嬰兒不佔位':' · infant'):'')+'</small></span></td>'
        +'<td colspan="2"><small class="k4b-sub" style="margin:0">'+(z()?'同一訂位 ':'Same PNR ')+'<span class="r40-mono">'+E(r.pnr)+'</span> · '+(z()?'隨員工一起候補':'clears with employee')+'</small></td></tr>';
    });
    return h;
  }).join('');
  function col(title,rule,n,body,empty){
    return '<div class="k4b-sb-col"><h3>'+title+' <span>'+n+'</span></h3><p class="k4b-rule">'+rule+'</p>'
      +(body?'<div class="r40-scroll"><table class="k4b-sb-t"><thead><tr><th>#</th><th>'+(z()?'旅客':'Passenger')+'</th><th>'+(z()?'內容':'Request')+'</th><th>'+(z()?'系統預判':'Forecast')+'</th><th>'+(z()?'處理':'Action')+'</th></tr></thead><tbody>'+body+'</tbody></table></div>'
           :'<div class="r40-empty">'+empty+'</div>')+'</div>';
  }
  var table='<div class="k4b-sb-cols">'
    +col(z()?'哩程升等候補':'Mileage-upgrade standby',z()?'依申請時間先後；升等成功空出的原座位留給員工票。':'By application time; seats released by upgrades go to staff travel.',plan.up.length,upRows+awRows,z()?'此航班當日沒有哩程升等候補。':'No mileage-upgrade standbys.')
    +col(z()?'員工票候補':'Staff-ticket standby',z()?'依方案（ID25＞ID50＞ID90＞ZED＞免費票）→ 年資 → 艙等；眷屬與員工同一訂位，一起上才算成功。':'By plan, then seniority, then cabin; dependants clear together with the employee.',plan.staff.length,stRows,z()?'此航班當日沒有員工票候補。':'No staff-ticket standbys.')
    +'</div>';
  return '<section class="r40-panel">'+head+bar+seatStrip+table+'</section>';
}

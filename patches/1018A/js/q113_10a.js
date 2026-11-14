/* 1010A：使用者「這個應該放到下面依照案件為主，然後那個好醜喔，那個要有 Simulate Data」
   —— 退票核准改成以案件為主：每一件申請是一張卡，案件編號在最上面（按下去在案件處理中心打開完整紀錄），
   待核准在前、已處理收在下面；不可復原的提醒縮成一行。案件處理中心的案件明細也可以直接核准／駁回。 */
function paxOf10(pnr){
  var b=bk(pnr),p=(b&&(b.paxList||[])[0])||{},sr=(b&&b.search)||{};
  /* 1010A：旅客端退票一律是整筆訂位（全部航段），卡片上列出全部航段，不是只寫去程 */
  var segs=[];if(b){if(b.outF)segs.push([b.outF,sr.dep]);if(b.inbF)segs.push([b.inbF,sr.ret]);(b.mcFlights||[]).forEach(function(m){if(m&&m.f)segs.push([m.f,m.date])})}
  var flt=segs.map(function(x){var f=x[0];return f.code+' '+(f.fr||'')+'→'+(f.to||'')+' '+String(f.date||x[1]||'').slice(5)}).join('、');
  return {name:[p.lastName,p.firstName].filter(Boolean).join(' / '),flt:flt,segs:segs.length||1,
    n:((b&&b.paxList)||[]).length||1};
}
function t10(s){s=String(s||'');return s.slice(5,16).replace('T',' ')}
window.kgmRefundOpenCaseR1010A=function(no,done){
  if(!no)return;
  S.adminTab='cases0831B';S.caseTabR913=done?'done':'open';S.case7F={};S.caseFilter0831B='';S.case7Sel=no;
  try{render()}catch(_){}
  try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){}
};
function queueHtml113(){
  var all=window.kgmRefundQueueR113(),pend=all.filter(function(r){return r.status==='pending'}),
      done=all.filter(function(r){return r.status!=='pending'});
  var ceo=isCeo(),zh=z(),sum=pend.reduce(function(a,r){return a+(+r.net||0)},0);
  var lab={pending:zh?'待核准':'Pending',approved:zh?'已核准・PNR 永久失效':'Approved (void)',
           withdrawn:zh?'旅客撤回':'Withdrawn',rejected:zh?'已駁回':'Rejected'};
  var card=function(r){
    var x=paxOf10(r.pnr);
    return '<article class="k10rq"><div class="k10rq-top">'
      +'<button type="button" class="k10rq-no" onclick="kgmRefundOpenCaseR1010A(\''+E(r.caseId||'')+'\')" title="'+(zh?'在案件處理中心打開':'Open in the case centre')+'">'+E(r.caseId||'—')+'</button>'
      +'<span class="k10rq-chip">'+E(lab.pending)+'</span></div>'
      +'<div class="k10rq-who"><b>'+E(x.name||'—')+'</b><small>PNR '+E(r.pnr)+(x.flt?'　·　'+E(x.flt):'')
        +(x.n>1?'　·　'+x.n+(zh?' 位旅客':' pax'):'')+'</small></div>'
      +'<div class="k10rq-amt"><span><small>'+(zh?'退款':'REFUND')+'</small><b>NT$'+N(r.net)+'</b></span>'
        +'<span><small>'+(zh?('手續費 · 全部 '+x.segs+' 段'):'FEE · ALL '+x.segs+' SECTORS')+'</small><b>NT$'+N(r.fee)+'</b></span>'
        +'<span><small>'+(zh?'申請時間':'REQUESTED')+'</small><b>'+E(t10(r.at))+'</b></span></div>'
      +'<div class="k10rq-foot">'+(ceo
        ?('<button class="k113-no" onclick="kgmRefundRejectR113(\''+E(r.pnr)+'\')">'+(zh?'駁回':'Reject')+'</button>'
          +'<button class="k113-go" onclick="kgmRefundApproveR113(\''+E(r.pnr)+'\')">'+(zh?'核准退款':'Approve')+'</button>')
        :'<span class="k10rq-wait">'+(zh?'等待執行長核准':'Awaiting CEO')+'</span>')+'</div></article>';
  };
  return '<section class="k113-panel k10rq-panel"><header><div><small>REFUND APPROVAL · CEO</small>'
      +'<h3>'+(zh?'退票核准':'Refund approvals')+'</h3>'
      +'<p>'+(zh?'每一件取消／退票申請都是案件處理中心裡的一件案件；按案件編號可以看完整紀錄。'
               :'Every request is a case in the case centre; click the case number for its full record.')+'</p></div>'
      +'<div class="k10rq-kpi"><span><small>'+(zh?'待核准':'PENDING')+'</small><b>'+pend.length+'</b></span>'
        +'<span><small>'+(zh?'待退款合計':'TO REFUND')+'</small><b>NT$'+N(sum)+'</b></span>'
        +'<span><small>'+(zh?'已處理':'PROCESSED')+'</small><b>'+done.length+'</b></span></div></header>'
    +(pend.length?'<div class="k10rq-grid">'+pend.map(card).join('')+'</div>'
      :'<div class="k113-empty">'+(zh?'目前沒有待核准的退票申請。':'No pending refund requests.')+'</div>')
    +'<div class="k10rq-irr">⚠ '+E(irrText())+'</div>'
    +(done.length?('<details class="k10rq-hist"><summary>'+(zh?'已處理的申請':'Processed requests')+' <b>'+done.length+'</b></summary>'
      +'<table class="k113-t"><thead><tr><th>'+(zh?'案件':'Case')+'</th><th>PNR</th><th>'+(zh?'旅客':'Passenger')+'</th>'
      +'<th>'+(zh?'退款':'Refund')+'</th><th>'+(zh?'結果':'Outcome')+'</th><th>'+(zh?'處理時間':'Closed')+'</th></tr></thead><tbody>'
      +done.slice(0,30).map(function(r){
        var x=paxOf10(r.pnr);
        return '<tr><td><button type="button" class="k10rq-no" onclick="kgmRefundOpenCaseR1010A(\''+E(r.caseId||'')+'\',1)">'+E(r.caseId||'—')+'</button></td>'
          +'<td><b>'+E(r.pnr)+'</b></td><td>'+E(x.name||'—')+'</td><td>NT$'+N(r.net)+'</td>'
          +'<td><span class="k10rq-st s-'+E(r.status)+'">'+E(lab[r.status]||r.status)+'</span>'+(r.reason?'<small>'+E(r.reason)+'</small>':'')+'</td>'
          +'<td>'+E(t10(r.approvedAt||r.closedAt||r.at))+'</td></tr>';
      }).join('')+'</tbody></table></details>'):'')
    +'</section>';
}
/* 案件處理中心的案件明細：退票案件直接在這裡核准／駁回 */
window.kgmRefundCaseActsR1010A=function(r){
  var st=store(),q=st[String((r&&r.pnr)||'').toUpperCase()]||st[(r&&r.pnr)||''];
  if(!q||q.status!=='pending')return '';
  var zh=z();
  return '<div class="k7c-act k10rq-act"><div class="k7c-sub">'+(zh?'退票核准':'Refund approval')+'</div>'
    +'<div class="k10rq-amt"><span><small>'+(zh?'預計退款':'REFUND')+'</small><b>NT$'+N(q.net)+'</b></span>'
      +'<span><small>'+(zh?('退票手續費（整筆訂位 '+paxOf10(q.pnr).segs+' 段，只收一次）'):'FEE (WHOLE BOOKING, ONCE)')+'</small><b>NT$'+N(q.fee)+'</b></span>'
      +'<span><small>'+(zh?'申請時間':'REQUESTED')+'</small><b>'+E(t10(q.at))+'</b></span></div>'
    +'<p class="k10rq-irr in" style="color:#6B6658">'+(zh?'旅客端只能整筆退票（全部航段）。只退其中一段請在「票務中心」辦理：手續費按段數比例（例：整筆 NT$4,800，兩段退一段 NT$2,400、三段退一段 NT$1,600）。':'Passengers can only refund the whole booking. Single-sector refunds are done at the ticketing desk with a pro-rated fee.')+'</p>'
    +'<p class="k10rq-irr in">⚠ '+E(irrText())+'</p>'
    +(isCeo()
      ?('<div class="k7c-btns"><button class="btn btn-g" onclick="kgmRefundApproveR113(\''+E(q.pnr)+'\')">'+(zh?'核准退款':'Approve refund')+'</button>'
        +'<button class="btn j-reject" onclick="kgmRefundRejectR113(\''+E(q.pnr)+'\')">'+(zh?'駁回':'Reject')+'</button></div>')
      :'<div class="k7c-closed">'+(zh?'等待執行長核准；只有執行長可以核准或駁回退款。':'Awaiting CEO approval.')+'</div>')
    +'</div>';
};

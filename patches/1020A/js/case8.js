/* 1008A：組員調位（DH）造成的非自願降艙／無位改搭 → 自動成立案件（依訂位上的 dhBumpR1007A 紀錄，旅客與客服都看得到）。
   案件編號由 PNR＋紀錄算出來（同一筆紀錄永遠同一個編號，不必另外存檔）。 */
function invol8J(){
  var out=[],CZ={First:'頭等艙',Business:'商務艙',Premium:'豪華經濟艙','Premium Economy':'豪華經濟艙',Economy:'經濟艙'};
  function cz(c){return ZJ()?(CZ[c]||c||''):(c||'')}
  function h8(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
  (S.bookings||[]).forEach(function(b){
    ((b&&b.dhBumpR1007A)||[]).forEach(function(a){
      if(!a||!/^(basic|award|offload|upgrade)$/.test(String(a.kind||'')))return;
      var off=a.kind==='offload',at=String(a.at||new Date().toISOString());
      var d=at.slice(0,10).replace(/-/g,''),md=d.slice(4)+d.slice(2,4);
      var no='KG'+String(1000+(h8(b.pnr+'|'+a.id+'|'+at+'|'+a.kind)%9000))+md+'M';
      var seg=(a.code||'')+' '+(a.fr||'')+'→'+(a.dest||'')+' '+(a.date||'');
      var reverted=a.status==='reverted',changed=a.status==='changed';
      var detail=off
        ?(ZJ()?('組員調位（DH）需要座位，'+seg+' 已沒有任何艙等的座位；旅客可免費改搭其他班次，不收任何費用。'):('Seat needed for crew positioning on '+seg+'; no seat left in any cabin. Free change to another flight.'))
        :a.kind==='upgrade'
          ?(ZJ()?('組員調位（DH）需要座位，'+seg+' 的里程升等取消，改回'+cz(a.to)+'，'+Number(a.miles||0).toLocaleString()+' 哩全額退回。'):('Crew positioning on '+seg+': mileage upgrade cancelled, miles refunded.'))
          :(ZJ()?('組員調位（DH）需要座位，'+seg+' 由'+cz(a.from)+'改為'+cz(a.to)+(a.refund?('，退還票價差額 NT$'+Number(a.refund).toLocaleString()):'')+(a.miles?('，退還哩程差 '+Number(a.miles).toLocaleString()+' 哩'):'')+'。'):('Involuntary downgrade on '+seg+' from '+a.from+' to '+a.to+'.'));
      var prog=[{at:at,status:'received',label:ZJ()?('系統自動成立：'+(off?'無位改搭（拒絕登機）':'非自願降艙')):'Opened automatically'}];
      var st;
      if(reverted){st='closed';prog.push({at:at,status:'closed',label:ZJ()?'座位已恢復，案件結案':'Seat restored; closed'})}
      else if(off){st=changed?'completed':'awaiting_customer';
        prog.push(changed?{at:at,status:'completed',label:ZJ()?('旅客已免費改搭 '+(a.newCode||'')+' '+(a.newDate||'')):'Rebooked free of charge'}
                         :{at:at,status:'awaiting_customer',label:ZJ()?'等待旅客到「行程管理」選擇改搭班次（免費）':'Waiting for the passenger to choose a new flight (free)'})}
      else{st='completed';prog.push({at:at,status:'refunded',label:ZJ()?(a.refund?('票價差額 NT$'+Number(a.refund).toLocaleString()+' 已退回原付款方式'):(a.miles?(Number(a.miles).toLocaleString()+' 哩已退回會員帳戶'):'艙等差額已處理')):'Difference refunded'});
        prog.push({at:at,status:'completed',label:ZJ()?'差額已退回，案件完成':'Refunded; case completed'})}
      out.push({caseNo:no,pnr:b.pnr,type:off?'denied_boarding':'invol_downgrade',status:st,createdAt:at,updatedAt:at,amount:+a.refund||0,currency:'TWD',
        detail:detail,progress:prog,paxName:a.name||'',segment:{code:a.code,fr:a.fr,to:a.dest,date:a.date},userId:b.userId||null,autoR1008A:true});
    });
  });
  return out;
}
/* 1008A：案件查詢頁改成左右兩欄 —— 左邊查詢，右邊是「會處理哪些事、怎麼處理」（登入後右邊直接是我的案件） */
function caseInfo8J(){
  var zh=ZJ();
  var T=[
    ['↺',zh?'退款':'Refunds',zh?'退票、差額與加購服務退款；核准後 3–5 個工作日退回原付款方式。':'Refunds of tickets, fare differences and extras; 3–5 working days after approval.'],
    ['⧉',zh?'行李延誤／遺失／損壞':'Baggage',zh?'機場登記行李事故報告（PIR），延誤行李 24 小時內與您聯繫。':'Report at the airport (PIR); delayed bags are traced and we contact you within 24 hours.'],
    ['⇣',zh?'非自願降艙／拒絕登機':'Downgrade / denied boarding',zh?'因組員調位或超賣被降艙、移出班次，系統自動成立案件並退還差額。':'Opened automatically when you are downgraded or offloaded; differences are refunded.'],
    ['⏱',zh?'航班延誤／取消':'Delay / cancellation',zh?'改搭、住宿與交通安排，以及依規定的補償申請。':'Rebooking, hotel and transport, and compensation claims.'],
    ['◎',zh?'遺失物品':'Lost property',zh?'機上或貴賓室遺失的物品協尋。':'Items left on board or in the lounge.'],
    ['✉',zh?'服務意見':'Feedback',zh?'對機場、機上或客服的意見與申訴。':'Comments and complaints about our service.']
  ];
  var P=[[zh?'受理':'Received',zh?'寄出案件編號':'Case number emailed'],[zh?'調查處理':'Investigating',zh?'專人與相關單位確認':'Handled by a specialist'],
         [zh?'等待您回覆':'Your reply',zh?'需要補件時才會出現':'Only if documents are needed'],[zh?'結案':'Closed',zh?'結果以 Email 通知':'Outcome emailed']];
  return '<section class="k8c-card"><small>'+(zh?'案件會處理什麼':'WHAT A CASE COVERS')+'</small>'
    +'<div class="k8c-types">'+T.map(function(t){return '<div><i>'+t[0]+'</i><b>'+EJ(t[1])+'</b><span>'+EJ(t[2])+'</span></div>'}).join('')+'</div>'
    +'<p class="k8c-note">'+(zh?'改票、選位、里程購買與里程升等屬於一般交易，不另外成立案件，請直接到「行程管理」或「無限萬哩遊」辦理。':'Changes, seats, mileage purchases and upgrades are regular transactions, not cases — use Manage booking or the miles pages.')+'</p></section>'
    +'<section class="k8c-card"><small>'+(zh?'處理流程':'HOW IT WORKS')+'</small><ol class="k8c-steps">'
    +P.map(function(p,i){return '<li><i>'+(i+1)+'</i><b>'+EJ(p[0])+'</b><span>'+EJ(p[1])+'</span></li>'}).join('')+'</ol>'
    +'<p class="k8c-note">'+(zh?'找不到案件編號？請看案件成立時寄出的 Email 或站內通知；也可以來電 0800-789-456（24 小時）。':'Your case number is in the email and notification sent when the case was opened, or call 0800-789-456 (24h).')+'</p></section>';
}
(function(){try{if(document.getElementById('k8c-css'))return;var s=document.createElement('style');s.id='k8c-css';s.textContent=''
  +'.k8c-cols{display:grid;grid-template-columns:minmax(300px,5fr) minmax(0,7fr);gap:18px;align-items:start;margin-top:16px}'
  +'.k8c-cols .j-case-public-card{margin:0!important}.k8c-left{position:sticky;top:12px}'
  +'.k8c-left .k8c-hint{margin:10px 2px 0;font-size:11px;color:#7d8780;line-height:1.7}'
  +'.k8c-card{background:#fff;border:1px solid #e4dfd3;border-radius:16px;padding:18px 20px;margin-bottom:14px;box-shadow:0 8px 24px rgba(16,40,32,.05)}'
  +'.k8c-card>small{display:block;font-size:10px;letter-spacing:.16em;font-weight:900;color:#a9822f;margin-bottom:10px}'
  +'.k8c-types{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
  +'.k8c-types>div{display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:start;padding:11px 12px;border:1px solid #edf0ec;border-radius:12px;background:#fbfcfa}'
  +'.k8c-types i{grid-row:span 2;width:30px;height:30px;border-radius:9px;background:#eef5f1;color:#17493a;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900}'
  +'.k8c-types b{font-size:12.5px;color:#17493a}.k8c-types span{font-size:11px;color:#6d7873;line-height:1.6}'
  +'.k8c-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}'
  +'.k8c-steps li{position:relative;padding:12px 10px;border-radius:12px;background:#f6f8f6;text-align:center}'
  +'.k8c-steps i{display:inline-flex;width:26px;height:26px;border-radius:50%;background:#17493a;color:#fff;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:12px}'
  +'.k8c-steps b{display:block;margin-top:6px;font-size:12.5px;color:#1f2a25}.k8c-steps span{display:block;font-size:10.5px;color:#7d8780;margin-top:2px}'
  +'.k8c-note{margin:12px 0 0;font-size:11px;color:#7d8780;line-height:1.7}'
  +'.k8c-right .jc90-mine{margin-top:0!important}'
  +'@media(max-width:860px){.k8c-cols{grid-template-columns:1fr}.k8c-left{position:static}.k8c-types{grid-template-columns:1fr}.k8c-steps{grid-template-columns:1fr 1fr}}';
  (document.head||document.documentElement).appendChild(s)}catch(_){}})();

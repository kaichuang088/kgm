/* 0928B · 機型異動拿掉 Residence（使用者：「機型異動的通知如果原本有 Residence 變成沒有並且 Residence 有旅客，系統要退費那個差價給
   競標上的旅客，並且給那位旅客第二志願選的艙等。後台競標要看到用錢競標的第二選擇是什麼。」）
   · 每分鐘（以及進後台、打開競標管理時）檢查一次：已得標的 Residence（現金或里程），當天實際執飛的機型沒有 Residence 艙 →
     現金：改成他出價時選的第二志願（頭等／商務，座位用他選的備選座位），退還「得標金額 − 第二志願票價」的差額；第二志願是「全額退款」就整段取消全額退。
     里程：第二志願頭等 → 退 5% 里程；商務 → 退 10%；全額退還 → 退 100%。
     同時寫進訂位、旅客通知與 Email，並在競標紀錄上標註（只處理一次）。
   · 後台競標表多一欄「第二選擇」：現金出價顯示替代方案＋備選座位；里程出價顯示未得標處理方式；已因機型異動改派的標出結果。 */
RL('res equip check','kgm-0823h-r61',
"window.kgmAuctionRowsR920=function(q){\n  try{window.kgmAucSegFixR928()}catch(_){}",
"window.kgmResEquipCheckR928=function(){\n"
+"  var out={checked:0,moved:0,list:[]};\n"
+"  try{\n"
+"    var T0=(typeof todayISO==='function')?todayISO():new Date().toISOString().slice(0,10);\n"
+"    function hasRes(b){var t='';try{t=acftOfFlight(b.code,b.date,b.fr,b.to)||''}catch(_){}\n"
+"      var c=((typeof AC!=='undefined'&&AC[t])||{}).cabins||{};return {type:t,ok:!!c.res}}\n"
+"    function priceOf(b,code){try{var f=[].concat(FLIGHTS,(S.customFlights||[])).filter(function(x){return x&&!x.via&&x.code===b.code&&(!b.fr||(x.fr===b.fr&&x.to===b.to))})[0];return f?Math.round(+window.owPrice(Object.assign({},f,{date:b.date}),code,1)||0):0}catch(_){return 0}}\n"
+"    function codeFor(cab){try{var k=Object.keys(FARES).filter(function(x){return FARES[x]&&FARES[x].cabin===cab})[0];return k||''}catch(_){return ''}}\n"
+"    function tell(b,msg,email){try{S.notifs=S.notifs||[];S.notifs.unshift({title:'Residence 機型異動 '+b.code+' '+b.date,message:msg,date:T0,at:new Date().toISOString(),read:false,userId:b.userId||null,type:'residence'})}catch(_){}\n"
+"      try{var bk=b.pnr?(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0]:null;if(bk){bk.notifs=bk.notifs||[];bk.notifs.unshift({date:T0,read:false,msg:msg});var em=bk.contactEmail||bk.email||((bk.paxList||[])[0]||{}).email;if(em&&typeof kgmNotify==='function')kgmNotify('aircraft.changed',Object.assign({email:em,pnr:bk.pnr,flight:b.code,date:b.date,residenceRemoved:true},email||{}))}}catch(_){}}\n"
+"    (S.residenceBidsR83||[]).forEach(function(b){\n"
+"      if(!b||b.status!=='won'||b.equipLossR928||!b.date||b.date<T0)return;out.checked++;\n"
+"      var r=hasRes(b);if(r.ok||!r.type)return;\n"
+"      var bk=b.pnr?(S.bookings||[]).filter(function(x){return x&&x.pnr===b.pnr})[0]:null,seg=b.segR923==='inb'?'inb':'out';\n"
+"      var alt=b.alt||'business',rec={at:new Date().toISOString(),type:r.type,alt:alt};\n"
+"      if(alt==='refund'){\n"
+"        rec.refund=(+b.amount||0);rec.cabin='';\n"
+"        if(bk){bk.cancelledSegsR60=(bk.cancelledSegsR60||[]).concat([seg]);bk.total=Math.max(0,(+bk.total||0)-rec.refund);(bk.refundsR60=bk.refundsR60||[]).push({at:rec.at,segs:[seg],fare:rec.refund,fee:0,noShow:0,net:rec.refund,resEquipR928:b.id})}\n"
+"      }else{\n"
+"        var cab=alt==='first'?'First':'Business',fc=b.fallbackCodeR923||codeFor(cab),fp=+b.fallbackPriceR923||priceOf(b,fc);\n"
+"        rec.cabin=cab;rec.fare=fc;rec.refund=Math.max(0,(+b.amount||0)-fp);rec.seat=b.backupSeat||'';\n"
+"        if(bk){if(fc)bk[seg+'C']=fc;bk.total=Math.max(0,(+bk.total||0)-rec.refund);(bk.refundsR60=bk.refundsR60||[]).push({at:rec.at,segs:[seg],fare:rec.refund,fee:0,noShow:0,net:rec.refund,resEquipR928:b.id});\n"
+"          bk.residenceWonR83=false;bk.residenceSeatLockedR83=false;if(rec.seat){bk.seats=bk.seats||{};bk.seats[seg]={};bk.seats[seg][rec.seat]=((bk.paxList||[])[0]||{}).lastName||'PAX'}}\n"
+"      }\n"
+"      b.equipLossR928=rec;out.moved++;out.list.push(b.code+' '+b.date+' '+(b.pnr||b.id));\n"
+"      tell(b,alt==='refund'\n"
+"        ?('您得標的 '+b.code+'（'+b.date+'）因機型異動改由 '+r.type+' 執飛，該機型沒有 Residence。依您出價時選的第二志願「取消並全額退款」，已退還 NT$'+Number(rec.refund).toLocaleString()+'。')\n"
+"        :('您得標的 '+b.code+'（'+b.date+'）因機型異動改由 '+r.type+' 執飛，該機型沒有 Residence。已依您的第二志願改為'+(rec.cabin==='First'?'頭等艙':'商務艙')+(rec.seat?'（座位 '+rec.seat+'）':'')+'，並退還差價 NT$'+Number(rec.refund).toLocaleString()+'。'),\n"
+"        {residenceRefund:rec.refund,newCabin:rec.cabin||'refund'});\n"
+"    });\n"
+"    (S.resMileBidsR161||[]).forEach(function(b){\n"
+"      if(!b||b.status!=='won'||b.equipLossR928||!b.date||b.date<T0)return;out.checked++;\n"
+"      var r=hasRes(b);if(r.ok||!r.type)return;\n"
+"      var fb=b.fallback||'refund',pct=fb==='first90'?0.05:(fb==='biz95'?0.10:1),back=Math.round((+b.miles||0)*pct);\n"
+"      var u=(S.users||[]).filter(function(x){return x&&x.id===b.userId})[0];\n"
+"      if(u&&back){u.miles=(+u.miles||0)+back;(u.milesLog=u.milesLog||[]).unshift({date:T0,miles:back,desc:'Residence 機型異動退還 '+b.code+' '+b.date})}\n"
+"      b.equipLossR928={at:new Date().toISOString(),type:r.type,fallback:fb,milesBack:back,cabin:fb==='first90'?'First':(fb==='biz95'?'Business':'')};out.moved++;out.list.push(b.code+' '+b.date+' '+(b.pnr||b.id));\n"
+"      tell(b,'您以里程得標的 '+b.code+'（'+b.date+'）因機型異動改由 '+r.type+' 執飛，該機型沒有 Residence。'+(fb==='refund'?'依您的第二志願全額退還 '+Number(back).toLocaleString()+' 哩。':('已依您的第二志願改為'+(fb==='first90'?'頭等艙，退還 5%（':'商務艙，退還 10%（')+Number(back).toLocaleString()+' 哩）。')),{milesRefund:back});\n"
+"    });\n"
+"    if(out.moved)try{save()}catch(_){}\n"
+"  }catch(e){out.err=e.message}\n"
+"  return out;\n"
+"};\n"
+"try{setTimeout(function(){try{window.kgmResEquipCheckR928()}catch(_){}},6000);setInterval(function(){try{window.kgmResEquipCheckR928()}catch(_){}},60000)}catch(_){}\n"
+"window.kgmAuctionRowsR920=function(q){\n  try{window.kgmAucSegFixR928()}catch(_){}\n  try{window.kgmResEquipCheckR928()}catch(_){}",1);
/* 模擬出價也要有第二志願（決定性） */
RL('res demo alt','kgm-0823h-r61',
"        if(seg){b.fr=seg.fr;b.to=seg.to;n++}\n",
"        if(seg){b.fr=seg.fr;b.to=seg.to;n++}\n",1);
RL('res demo alt fill','kgm-0823h-r61',
"    if(n)try{save()}catch(_){}\n  }catch(_){}\n  return n;\n};\nwindow.kgmResEquipCheckR928",
"    /* 模擬現金出價補上第二志願與備選座位（決定性，只補一次） */\n"
+"    (S.residenceBidsR83||[]).forEach(function(b){if(!b||b.alt)return;var h=0,k=String(b.id||b.pnr);for(var i=0;i<k.length;i++)h=((h*31)+k.charCodeAt(i))>>>0;b.alt=['business','first','business','refund'][h%4];b.backupSeat=b.backupSeat||['2A','2K','3A','3K','5A','5K'][(h>>>4)%6];n++});\n"
+"    if(n)try{save()}catch(_){}\n  }catch(_){}\n  return n;\n};\nwindow.kgmResEquipCheckR928",1);
RL('rows cash alt','kgm-0823h-r61',
"      placedAt:b.placedAt||'',src:'residenceBidsR83'})})}catch(_){}",
"      placedAt:b.placedAt||'',src:'residenceBidsR83',alt:b.alt||'',backupSeat:b.backupSeat||'',equipLoss:b.equipLossR928||null})})}catch(_){}",1);
RL('rows miles alt','kgm-0823h-r61',
"      placedAt:b.placedAt||'',src:'resMileBidsR161'})})}catch(_){}",
"      placedAt:b.placedAt||'',src:'resMileBidsR161',fallback:b.fallback||'',equipLoss:b.equipLossR928||null})})}catch(_){}",1);
RL('table second choice th','kgm-0823h-r61',
"        '<th>'+(z920a()?'合併價值':'Combined')+'</th>','<th>'+(z920a()?'狀態':'Status')+'</th>'].join('')",
"        '<th>'+(z920a()?'合併價值':'Combined')+'</th>','<th>'+(z920a()?'第二選擇':'2nd choice')+'</th>','<th>'+(z920a()?'狀態':'Status')+'</th>'].join('')",1);
RL('table second choice td','kgm-0823h-r61',
"          +'<td>'+(r.combined?('NT$'+n920(r.combined)):'—')+'</td>'",
"          +'<td>'+(r.combined?('NT$'+n920(r.combined)):'—')+'</td>'\n"
+"          +'<td>'+(function(){\n"
+"            var z=z920a(),t='—';\n"
+"            if(r.kind==='res-cash')t=({first:z?'改訂頭等艙':'First',business:z?'改訂商務艙':'Business',refund:z?'取消並全額退款':'Refund'})[r.alt]||'—';\n"
+"            else if(r.kind==='res-miles')t=({refund:z?'全額退還里程':'Refund miles',first90:z?'95% 里程改頭等':'First (95%)',biz95:z?'90% 里程改商務':'Business (90%)'})[r.fallback]||'—';\n"
+"            var s=e920(t)+(r.backupSeat?'<br><small style=\"color:#8a94a0\">'+(z?'備選座位 ':'seat ')+e920(r.backupSeat)+'</small>':'');\n"
+"            if(r.equipLoss)s+='<br><small style=\"color:#b42318;font-weight:800\">'+(z?'機型異動（'+e920(r.equipLoss.type)+'）已改派':'Equipment change — reassigned')+(r.equipLoss.refund!=null?(' · '+(z?'退 NT$':'refund NT$')+n920(r.equipLoss.refund)):(r.equipLoss.milesBack!=null?(' · '+(z?'退 ':'')+n920(r.equipLoss.milesBack)+(z?' 哩':' mi')):''))+'</small>';\n"
+"            return s})()+'</td>'",1);

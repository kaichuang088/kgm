import json
out=[]
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
L='kgm-0823p-r82'
hdr='''/* 0928B · 後台改票中心（使用者：「我改票改到KX54但是該航班不是每一天都有，但是後台改票中心看起來是顯示每一天都有因為我換到每一天他都可以換
   然後後台改票如果是要還旅客錢為什麼還要跟旅客收里程？然後是用里程訂票（酬賓）的才需要用里程付款，如果是現金就是全部現金處理，
   還有改票不用案件是退票才要。還有，改票也要可以從經濟換成豪經之類的。」）
   ① 日期：日期欄本身是瀏覽器的日曆，每天都點得到；選到不飛的日子，航班下拉只是變空白、沒有任何說明。
      現在：選到不飛的日期直接寫「這天沒有 KX54」，並列出最近 6 個有飛的日期（按一下就換過去）；
      非每天飛的航班在日期旁邊標出實際飛的星期（從接下來四週真正的班表算，不是看設定檔）。
   ② 金額：降艙時原本「應向旅客收取＝地勤加收」又「應退還旅客＝差額－手續費－地勤加收」，同一筆加收收了兩次，
      而且因為「應收 > 0」就跳出「以里程折抵」。改成一次算淨額：差額＋手續費＋加收 > 0 才收，< 0 就退，兩者不會同時出現。
   ③ 里程：只有酬賓（里程）機票才顯示「以里程付款」，而且預設勾選；現金票一律現金／信用卡收款。
   ④ 案件：改票（含換艙、換日期、換航班）不再開案件，只記在訂位歷程與款項紀錄；退票照舊由退票流程開案件。
   ⑤ 換艙等：這個區塊本來就有「艙等」選單（經濟／豪經／商務／頭等），實測經濟→豪經可以換；沒有改動。 */
'''
RL('adrb net',L,
"""    charge:up?(diff+fee+surcharge):surcharge,
    refund:up?0:Math.max(0,(-diff)-fee-surcharge),""",
"""    charge:Math.max(0,diff+fee+surcharge),   /* 0928B：淨額一次算，加收不會既收又扣 */
    refund:Math.max(0,-(diff+fee+surcharge)),""")
RL('adrb note',L,
"""           :(z()?'降艙：不需補票差；退款依票規另案處理':'Downgrade: no added fare; any refund follows the fare rule')};""",
"""           :(z()?'降艙／較便宜：票價差額扣掉手續費與加收後，剩下的退還旅客':'Lower fare: the difference minus fees is refunded')};""")
RL('adrb apply miles',L,
"""  if(kind==='charge'&&amt>0&&st.payMiles){""",
"""  if(kind==='charge'&&amt>0&&b.isAward&&st.payMiles!==false){   /* 0928B：只有酬賓機票用里程付，預設勾選 */""")
RL('adrb panel miles',L,
"""        if(!(q.charge>0))return '';
        var mi=window.kgmCabMilesR914(st.pnr,q.charge);
        var on=!!st.payMiles;""",
"""        if(!(q.charge>0))return '';
        if(!b.isAward)return '<div class="k82-miles"><small>'+(z()?'付款方式':'Payment')+'</small><b>'+(z()?'現金機票：差額與手續費以現金／信用卡收款（付款連結）。':'Cash ticket: collected by card / payment link.')+'</b></div>';   /* 0928B */
        var mi=window.kgmCabMilesR914(st.pnr,q.charge);
        var on=st.payMiles!==false&&mi.enough;""")
RL('adrb panel btn',L,
"""          +(st.payMiles?(z()?'確認以里程折抵並更換':'Apply using miles')""",
"""          +((b.isAward&&st.payMiles!==false&&window.kgmCabMilesR914(st.pnr,q.charge).enough)?(z()?'確認以里程折抵並更換':'Apply using miles')""")
# operating dates helper
RL('adrb helper',L,
"""function targetFlight82(s,date,code,fr,to){""",
"""/* 0928B：實際有飛的日期（從真正的班表算） */
function opHint928(sg,date,fr,to,flights,code){
  if(!sg||!date)return '';
  var F=fr||sg.fr,T=to||sg.to,next=[],wk={},WD=z()?['日','一','二','三','四','五','六']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var c=code||sg.code;
  for(var i=0;i<28;i++){var x=addDays(todayISO(),i+1),fl=routeFlights82(sg,x,F,T);if(fl.some(function(f){return f.code===c}))wk[new Date(x+'T12:00:00').getDay()]=1;}
  var days=Object.keys(wk).map(Number),daily=days.length===7;
  if(flights.length){
    if(daily||!days.length||!flights.some(function(f){return f.code===c}))return '';
    return '<div class="k82-op"><b>'+E(c)+'</b> '+(z()?'每週 ':'operates ')+[1,2,3,4,5,6,0].filter(function(d){return wk[d]}).map(function(d){return WD[d]}).join(z()?'、':', ')+(z()?' 飛航':'')+'</div>';
  }
  for(var j=1;j<=60&&next.length<6;j++){var y=addDays(date,j);if(y<=todayISO())continue;var f2=routeFlights82(sg,y,F,T);if(f2.length)next.push({d:y,codes:f2.map(function(f){return f.code}).join('／')})}
  return '<div class="k82-op none"><b>'+E(date)+' '+(z()?'沒有 ':'no ')+E(F+'→'+T)+(z()?' 的航班':' flight')+'</b>'
    +(days.length&&!daily?('　'+E(c)+(z()?' 每週 ':' operates ')+[1,2,3,4,5,6,0].filter(function(d){return wk[d]}).map(function(d){return WD[d]}).join(z()?'、':', ')+(z()?' 飛航':'')):'')
    +(next.length?('<div class="k82-op-next">'+(z()?'最近可改：':'Next: ')+next.map(function(n){return '<button type="button" onclick="kgmCabDateR82(\\''+n.d+'\\')">'+E(n.d.slice(5).replace('-','/'))+' <i>'+E(n.codes)+'</i></button>'}).join('')+'</div>'):'')+'</div>';
}
function targetFlight82(s,date,code,fr,to){""")
RL('adrb panel op',L,
"""    +(st.pnr&&!b?('<div class="k82-empty">'+(z()?'查無此訂位。':'Booking not found.')+'</div>'):'')""",
"""    +(sg?opHint928(sg,targetDate,useFr,useTo,flights,targetCode||(sg&&sg.code)):'')   /* 0928B：不飛的日期講清楚 */
    +(st.pnr&&!b?('<div class="k82-empty">'+(z()?'查無此訂位。':'Booking not found.')+'</div>'):'')""")
RL('adrb done payno',L,
"""  var caseNo=(rec&&(rec.caseNoR84||rec.chargeId))||'';""",
"""  var caseNo=(rec&&rec.caseNoR84)||'',payNo928=(rec&&rec.chargeId)||'';   /* 0928B：付款單號不是案件編號 */""")
RL('adrb done payno row',L,
"""        +(caseNo?row(z()?'案件編號':'Case number','<span class="k82-done-pnr">'+E(caseNo)+'</span>'):'')""",
"""        +(caseNo?row(z()?'案件編號':'Case number','<span class="k82-done-pnr">'+E(caseNo)+'</span>'):'')
        +(payNo928?row(z()?'付款單號':'Payment request','<span class="k82-done-pnr">'+E(payNo928)+'</span>'):'')""")
open('p_e_adrb.js','w').write(hdr+'\n'.join(out)+'\n')
RL('adrb css',L,
"""    +'.k82-empty{padding:16px;text-align:center;color:#8a97a6;font-size:11.5px;background:#fafbfd;border-radius:10px}'""",
"""    +'.k82-empty{padding:16px;text-align:center;color:#8a97a6;font-size:11.5px;background:#fafbfd;border-radius:10px}'
    +'.k82-op{margin:-4px 0 12px;font-size:11.5px;color:#46604f;background:#f2f7f4;border:1px solid #d7e7dd;border-radius:10px;padding:8px 12px}'
    +'.k82-op.none{background:#fff7f2;border-color:#f0d3c2;color:#8a3b2c}.k82-op b{color:inherit}'
    +'.k82-op-next{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;color:#5e5a50}'
    +'.k82-op-next button{border:1px solid #0b493b;background:#fff;color:#0b493b;border-radius:999px;padding:4px 11px;font-size:11.5px;font-weight:800;cursor:pointer}'
    +'.k82-op-next button:hover{background:#0b493b;color:#fff}.k82-op-next i{font-style:normal;font-weight:600;opacity:.75;margin-left:3px}'""")
RL('adrb no case','kgm-0831c-r87',
"""        if((S.moneyCasesG||[]).length>n&&rec&&rec.r82&&!rec.caseNoR84){
          var b=(S.bookings||[]).filter(function(x){return x.pnr===rec.pnr})[0];
          var c=window.kgmOpenCaseR84({pnr:rec.pnr,booking:b,type:'cabin',
            title:(z()?'艙等更換 ':'Cabin change ')+(rec.from||'')+'→'+(rec.to||''),
            amount:rec.amount,currency:rec.currency,
            external:rec.external,internal:(z()?'差額 ':'Difference ')+N(rec.diff||0)+(z()?'，手續費 ':', fee ')+N(rec.fee||0),
            chargeId:rec.chargeId||'',link:rec.link||'',
            needsApproval:kind!=='charge'});
          rec.caseNoR84=c.id;
          if(b)log87(b,z()?'更換艙等':'Cabin change',
            (rec.from||'')+'→'+(rec.to||'')+'　'+rec.currency+' '+N(rec.amount)+'　'+(z()?'案件 ':'case ')+c.id);
        }""",
"""        /* 0928B：改票不開案件（使用者：「改票不用案件是退票才要」），只記在訂位歷程 */
        if((S.moneyCasesG||[]).length>n&&rec&&rec.r82){
          var b=(S.bookings||[]).filter(function(x){return x.pnr===rec.pnr})[0];
          if(b)log87(b,z()?'更換航班／日期／艙等':'Flight / cabin change',
            (rec.from||'')+'→'+(rec.to||'')+'　'+rec.currency+' '+N(rec.amount)+(rec.action==='customer_refund'?(z()?'（退還旅客）':' (refund)'):''));
        }""")
open('p_e_adrb.js','w').write(hdr+'\n'.join(out)+'\n')

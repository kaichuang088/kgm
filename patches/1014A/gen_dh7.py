from common import *
# ══ 1007A：DH（組員調位）—— 艙等規則、4 碼 PNR、行程管理、自動騰位與免費改搭 ══
#   本 patch 的比對字串有一部分是 1006A 前面 patch 加進去的，所以比對基準用「本 patch 之前的建置結果」（CUR），
#   pf.js 套用時會再對一次數量。
CUR=open('/tmp/j/kgm1006A_w52.html',encoding='utf-8').read()
def LAY(layer):
    i=CUR.index('<script id="'+layer+'"');return CUR[i:CUR.index('</script>',i)]
def RC(label,layer,old,new,cnt=1):
    n=LAY(layer).count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
CORE=open('js/dh7_core.js',encoding='utf-8').read()
R7='kgm-r7-admin-ops'
# ── 1. 排班引擎：位子有沒有照舊判斷，坐哪一艙、哪一個位子改由 kgmDhSlotR1007A 決定 ──
RC('dh7 engine commit','kgm-0903b-r121',
   "if(!slot)return false;slots.push(slot)}",
   "if(!slot)return false;try{if(window.kgmDhSlotR1007A)slot=window.kgmDhSlotR1007A(p,m,m.date,slot)||slot}catch(_){}if(slot.hardR1007A)return false;slots.push(slot)}   /* 1007A：機長商務、座艙長豪經、其他經濟；這班真的沒位子就換一班 */")
RC('dh7 engine release','kgm-0903b-r121',
   "if(!slot)continue;var key=[date,m.code,m.fr,m.to].join('|');",
   "if(!slot)continue;try{if(window.kgmDhSlotR1007A)slot=window.kgmDhSlotR1007A(p,m,date,slot)||slot}catch(_){}if(slot.hardR1007A)continue;/* 1007A */var key=[date,m.code,m.fr,m.to].join('|');")
RC('dh7 chain dh pre','kgm-0908B-r210',
   "(dh.dhLegsR1004B||[{d:date,fr:dh.fr,to:dh.to}]).forEach(function(lg){",
   "var sl7=null,dhSlR210=function(e,s,lg,dh){try{var c=lg.code||dh.dhFlightR1004B||'';if(c&&c!=='DH'&&window.kgmDhSlotR1007A)return window.kgmDhSlotR1007A({empId:e,role:s.role||''},{code:c,fr:lg.fr,to:lg.to,type:''},lg.d,null)}catch(_){}return null};   /* 1007A */\n"
   "        (dh.dhLegsR1004B||[{d:date,fr:dh.fr,to:dh.to}]).forEach(function(lg){")
RC('dh7 chain dh','kgm-0908B-r210',
   "lst.push({empId:empId,name:staff.name||'',role:staff.role||'',cabin:'Economy',seat:'',",
   "lst.push({empId:empId,name:staff.name||'',role:staff.role||'',cabin:((sl7=dhSlR210(empId,staff,lg,dh))&&sl7.cabin)||'Economy',seat:(sl7&&sl7.seat)||'',")
# ── 2. 航班資料（r7）：4 碼 PNR、DH 訂位同步艙等座位、騰位 ──
RC('dh7 pnr4',R7,
   "  function dhPnr929(empId,date,code){var h=2166136261,s=empId+'|'+date+'|'+code;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}h>>>=0;\n"
   "    var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='D';for(var k=0;k<5;k++){o+=A[h%A.length];h=Math.floor(h/32)+(k+1)*7919}return o}",
   "  /* 1007A：使用者：「每一個DH都要提供一個四位英數混合的PNR」—— 原本是 D＋5 碼；改成 4 碼英數混合（見 dhPnr4） */\n"
   "  function dhPnr929(empId,date,code){return dhPnr4(empId,date,code)}")
RC('dh7 booking migrate',R7,
   "var pnr=dhPnr929(p.empId,date,f.code),b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];\n    if(b)return b;",
   "var pnr=dhPnr929(p.empId,date,f.code),b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];\n"
   "    if(!b){b=(S.bookings||[]).filter(function(x){return dhOwn7(x,p.empId,date,f.code)})[0]||null;if(b)b.pnr=pnr}   /* 1007A：舊的 D＋5 碼改成 4 碼 */\n"
   "    if(b){syncDh7(b,p,f,date);return b}")
RC('dh7 booking ticket',R7,
   "ticketNumber:'297'+String(parseInt(pnr.slice(1),36)%10000000000).padStart(10,'0')};",
   "ticketNumber:'297'+String(parseInt(pnr,36)*7919%10000000000).padStart(10,'0')};b.ticket=b.ticketNumber;")
RC('dh7 booking sync new',R7,
   "S.bookings=S.bookings||[];S.bookings.push(b);return b;",
   "S.bookings=S.bookings||[];S.bookings.push(b);syncDh7(b,p,f,date);return b;")
RC('dh7 core',R7,"  window.kgmDhPnrR929=dhPnr929;\n",
   "  window.kgmDhPnrR929=dhPnr929;\n"+CORE+"\n"
   "  /* DH 訂位跟著排班紀錄／騰位結果更新艙等與座位 */\n"
   "  function syncDh7(b,p,f,date){try{var s=((S.dhBumpR1007A||{})[opKey(f,date)]||{}).dhSeats||{},q=s[p.empId]||{},cab=q.cabin||p.cabin||'Economy',seat=q.seat||p.seat||'';\n"
   "    var code={Economy:'E-C',Premium:'P-F',Business:'B-T',First:'F-X'}[cab]||'E-C';if(b.outC!==code)b.outC=code;\n"
   "    var cur=Object.keys((b.seats||{}).out||{}).filter(function(x){return x!=='_auto'})[0]||'';if(seat&&cur!==seat){b.seats=b.seats||{};var o={};o[seat]=p.name||'';b.seats.out=o}\n"
   "    if(!b.ticket)b.ticket=b.ticketNumber;b.dhR929.rank=rankOf7(p).rank}catch(_){}}\n"
   "  function dhBar7(k,m){\n"
   "    var dh=(m||[]).filter(function(x){return x&&x.dhR929});if(!dh.length)return '';\n"
   "    var rec=(S.dhBumpR1007A||{})[k]||{},cnt={};(rec.actions||[]).forEach(function(a){if(a&&a.status==='open')cnt[a.kind]=(cnt[a.kind]||0)+1});\n"
   "    var KN={staff:'員工票退回候補',upgrade:'里程升等取消',award:'酬賓機票降等',basic:'基本方案非自願降等',offload:'移出本班（可免費改搭）'},ks=Object.keys(cnt),need=dh.filter(function(x){return !x.seat}).length;\n"
   "    return '<div class=\"k4b-dhbar k7-dhbar\"><b>'+(z7()?'本班調位組員 DH':'Crew deadheading on this flight')+' <i>'+dh.length+'</i></b>'\n"
   "      +'<div class=\"k7-dhlist\">'+dh.map(function(x){return '<span class=\"k7-dhp'+(x.seat?'':' need')+'\">'+E(x.name)+'<small>'+E(dhTitle7({empId:x.member,role:x.dhRole}))+' · '+E(cz7(x.cabin))+' '+(x.seat?E(x.seat):(z7()?'待騰位':'pending'))+' · PNR '+E(x.pnr)+'</small></span>'}).join('')+'</div>'\n"
   "      +(ks.length?'<div class=\"k7-bumps\">'+(z7()?'已自動騰位：':'Released: ')+ks.map(function(t){return E(z7()?KN[t]:t)+' <b>'+cnt[t]+'</b>'}).join('　')+'</div>':'')\n"
   "      +(need?'<div class=\"k7-bumps\"><b>'+(z7()?(need+' 位 DH 還沒有座位</b>：起飛前 72 小時內系統自動騰位（員工票 → 里程升等 → 酬賓機票 → 基本方案隨機）'):(need+' DH without a seat</b>'))+'</div>':'')\n"
   "      +'<em>'+(z7()?'DH 是確認座位，優先於員工票候補。機長商務艙、座艙長豪華經濟艙、其他組員經濟艙。':'Deadheads hold confirmed seats ahead of staff standby.')+'</em></div>';\n"
   "  }\n"
   "  function tag7(r){var KN={upgrade:'里程升等取消',award:'酬賓降等',basic:'非自願降等',staff:'員工票改艙',offload:'移出・可免費改搭'};\n"
   "    return '<span class=\"k929-fdtag '+(r.auto1007A==='upgrade'||r.auto1007A==='staff'?'warn':'bad')+'\">DH '+(z7()?'騰位 · ':'· ')+E(z7()?(KN[r.auto1007A]||''):r.auto1007A)+(r.to&&r.auto1007A!=='offload'?(' → '+E(cz7(r.to))):'')\n"
   "      +(r.amount?(' · '+(z7()?'退 ':'')+'NT&#36;'+Number(r.amount).toLocaleString()):'')+(r.miles?(' · '+(z7()?'退 ':'')+Number(r.miles).toLocaleString()+(z7()?' 哩':' mi')):'')+'</span>'}\n")
RC('dh7 dh row meal',R7,"fare:'DH',seat:p.seat||'',meal:'',","fare:'DH',seat:p.seat||'',meal:((b.meals||{}).out||''),   /* 1007A：DH 在行程管理選的餐，航班資料要看得到 */")
RC('dh7 materialize regex',R7,"if(!/^D[A-Z0-9]{5}$/.test(pnr)","if(!/^[A-Z0-9]{4}$/.test(pnr)")
RC('dh7 manifest rows',R7,
   "var rows=real.concat(base).concat(dhRows929(f,date,k)),st=store7(k),used={},wrote=false;",
   "var rows=real.concat(base).concat(dhRows929(f,date,k)),st=store7(k),used={},wrote=false,bz7=bumpMap7(k);   /* 1007A：DH 騰位紀錄 */")
RC('dh7 manifest apply',R7,
   "rows.forEach(function(x){var edit=st.rows[x.id]||{};Object.assign(x,edit);",
   "rows.forEach(function(x){var edit=st.rows[x.id]||{};Object.assign(x,edit);if(bz7[x.id])Object.assign(x,bz7[x.id]);});\n"
   "    /* 1007A：有騰位紀錄的人（DH、被移位的旅客）先排座位 —— DH 拿到的座位若剛好是某位模擬旅客的預設座位，不能被旅客先佔走 */\n"
   "    rows.slice().sort(function(a,b){return (bz7[b.id]?1:0)-(bz7[a.id]?1:0)}).forEach(function(x){")
RC('dh7 manifest queue',R7,
   "var k=opKey(f,date),used=upgradeQuota7(k).length;",
   "var k=opKey(f,date),used=upgradeQuota7(k).length;dhQueue7(f,date,m);   /* 1007A：DH 沒有座位 → 排一次自動騰位 */")
i=LAY(R7).index("(function(){/* 1004B：使用者：「航班資料要看到哪一些是DH」");e=LAY(R7).index("'</em></div>'})()",i)+len("'</em></div>'})()")
RC('dh7 dhbar',R7,LAY(R7)[i:e],"dhBar7(k,m)/* 1007A：DH 名單（職位・艙等・座位・PNR）與騰位結果 */")
RC('dh7 fdtag',R7,"tag='<span class=\"k929-fdtag '+cls+'\">'","tag=r.auto1007A?tag7(r):'<span class=\"k929-fdtag '+cls+'\">'")
RC('dh7 row tint',R7,"+(x.offloadR929?' k929-off':'')+'\" data-q929=","+(x.offloadR929?' k929-off':'')+(x.dhR929?' k7-dhrow':'')+'\" data-q929=")
# ── 3. 票務中心取消里程升等：騰位時不跳確認框，通知寫明原因 ──
RC('dh7 desk noask','kgm-0909E-r229',
   "if(!confirm(Z()?('取消 '+r.code+' '+r.date+' 的里程升等，並全額退還 '+N(r.miles)+' 哩？'):('Cancel this upgrade and refund '+N(r.miles)+' miles?')))return;",
   "if(!window.KGM_NOASK_R1007A&&!confirm(Z()?('取消 '+r.code+' '+r.date+' 的里程升等，並全額退還 '+N(r.miles)+' 哩？'):('Cancel this upgrade and refund '+N(r.miles)+' miles?')))return;   /* 1007A：DH 騰位自動執行 */")
RC('dh7 desk who','kgm-0909E-r229',
   "r.cancelledByDeskR1006A=((S.adminUser||{}).empId||'desk');",
   "r.cancelledByDeskR1006A=window.KGM_NOASK_R1007A?'DH':((S.adminUser||{}).empId||'desk');")
RC('dh7 desk notif','kgm-0909E-r229',
   "try{if(b&&typeof _pushBkNotif==='function')_pushBkNotif(b,(Z()?'【里程升等已取消】':'[Upgrade cancelled] ')+r.code+' '+r.date+(Z()?('，已全額退還 '+N(r.refundedMiles)+' 哩。'):(' — '+N(r.refundedMiles)+' miles refunded.')))}catch(_){}",
   "try{if(b&&typeof _pushBkNotif==='function')_pushBkNotif(b,window.KGM_NOASK_R1007A?('【艙等異動】'+window.KGM_NOASK_R1007A):((Z()?'【里程升等已取消】':'[Upgrade cancelled] ')+r.code+' '+r.date+(Z()?('，已全額退還 '+N(r.refundedMiles)+' 哩。'):(' — '+N(r.refundedMiles)+' miles refunded.'))))}catch(_){}")
RC('dh7 desk render','kgm-0909E-r229',
   "try{save()}catch(_){}try{render()}catch(_){}\n  };\n  window.kgmDeskUpgR1006A",
   "try{save()}catch(_){}if(!window.KGM_NOASK_R1007A)try{render()}catch(_){}\n  };\n  window.kgmDeskUpgR1006A")
# ── 4. 行程管理（r217）：DH 無法選位、可選餐、組員資料；被騰位的旅客看到異動與免費改搭 ──
T='kgm-0909B-r217'
RC('dh7 trip seg cls',T,"function segCard(b,s,i){\n  var key=s.key||'out',f=s.f||s;\n",
   "function segCard(b,s,i){\n  var key=s.key||'out',f=s.f||s;\n"
   "  try{var c7=(b.segmentFare0826A||{})[key];if(c7&&c7!==s.cls)s=Object.assign({},s,{cls:c7})}catch(_){}   /* 1007A：降等／改艙之後顯示實際艙等（原本一直顯示訂位時的艙等） */\n")
RC('dh7 trip seat btn',T,
   "+'<button type=\"button\" onclick=\"'+op('seat')+'\">'+IC.seat+'<span>'+(Z()?'選位':'Seat')+'</span></button>'",
   "+(b.dhR929?('<button type=\"button\" class=\"k7-noseat\" disabled title=\"'+(Z()?'DH 調位的座位由公司指派':'Assigned by the company')+'\">'+IC.seat+'<span>'+(Z()?'無法選位':'No seat choice')+'</span></button>')   /* 1007A：DH 無法選位 */\n"
   "           :('<button type=\"button\" onclick=\"'+op('seat')+'\">'+IC.seat+'<span>'+(Z()?'選位':'Seat')+'</span></button>'))")
RC('dh7 trip pills',T,
   "+'<span class=\"k217-pill\">'+E(cabZH(s.cls))+'　'+E(s.cls)+'</span>'\n         +'<span class=\"k217-pill gold\">'+E(brand(s.cls))+'</span>'",
   "+'<span class=\"k217-pill\">'+E(cabZH(s.cls))+'　'+E(b.dhR929?'DH':s.cls)+'</span>'\n         +'<span class=\"k217-pill gold\">'+E(b.dhR929?(Z()?'組員調位':'Crew positioning'):brand(s.cls))+'</span>'")
RC('dh7 trip acts',T,"function actsBlock(b){\n","function actsBlock(b){\n  if(b&&b.dhR929&&window.kgmDhActsHtmlR1007A)return window.kgmDhActsHtmlR1007A(b);   /* 1007A：DH 不能改退升等，改放組員資料 */\n")
RC('dh7 trip key',T,
   "      +'|'+(window.kgmBigDealKeyR929?window.kgmBigDealKeyR929(b):'');",
   "      +'|'+(window.kgmBigDealKeyR929?window.kgmBigDealKeyR929(b):'')\n      +'|'+(b.dhBumpR1007A||[]).map(function(a){return a.status}).join('');")
RC('dh7 trip card',T,"    box.innerHTML=heroBlock(b,segs)\n",
   "    box.innerHTML=heroBlock(b,segs)\n      +(window.kgmDhTripHtmlR1007A?window.kgmDhTripHtmlR1007A(b):'')   /* 1007A：組員調位造成的艙等異動＋免費改搭 */\n")
RC('dh7 trip seat guard',T,
   "  render=window.render=function(){var r=rd.apply(this,arguments);",
   "  render=window.render=function(){try{var mo7=S.mtOpen;if(mo7&&mo7.tab==='seat'&&(S.bookings||[]).some(function(x){return x&&x.pnr===mo7.pnr&&x.dhR929}))S.mtOpen=null}catch(_){}   /* 1007A：DH 不開選位 */\n    var r=rd.apply(this,arguments);")
RC('dh7 staff status','kgm-0814d-r25',
   "if(!b||!(b.stx||b.staffTravel||b.staffTix||b.staffPricing))return '';",
   "if(b&&b.dhR929)return (typeof LANG==='undefined'||LANG!=='en')?'DH 已確認':'DH confirmed';   /* 1007A：調位是確認座位，不是 Standby */\n    if(!b||!(b.stx||b.staffTravel||b.staffTix||b.staffPricing))return '';")
RC('dh7 miles reason','kgm0810pR4',
   "if(/^Demo opening balance/.test(t))return '開戶贈送里程';",
   "m=t.match(/^DH downgrade refund (\\S+) (\\S+) \\(new expiry (\\S+)\\)/);if(m)return '組員調位降等 · 退還哩程差（PNR '+m[1]+'，'+m[2]+'，新效期至 '+m[3]+'）';   /* 1007A */\n"
   "    m=t.match(/^DH downgrade reversed (\\S+) → (\\S+)/);if(m)return '免費改搭 '+m[2]+' 維持原艙等 · 收回哩程差（PNR '+m[1]+'）';\n"
   "    if(/^Demo opening balance/.test(t))return '開戶贈送里程';")
save('p_h_dh7.js','/* 1007A · DH：機長商務／座艙長豪經／組員經濟、4 碼 PNR、行程管理、起飛前 72 小時自動騰位與免費改搭 */\n')

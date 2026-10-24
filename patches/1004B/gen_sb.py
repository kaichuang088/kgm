import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 候補名單左右兩欄、系統預判、眷屬縮排 */\n'
L='kgm-0816d-r40'
s=open('/tmp/j/kgm1004A_final.html',encoding='utf-8').read()
a=s.index("  var table=rows.length\n    ? '<div class=\"r40-scroll\"><table class=\"r40-tbl\">")
e="  return '<section class=\"r40-panel\">'+head+bar+table+'</section>';\n}\n"
b=s.index(e,a)+len(e)
RL('sb panel two cols',L,s[a:b],open('sb_panel.js',encoding='utf-8').read())
RL('sb sim staff fields',L,"          years:1+(h2%24)});}",
 "          years:1+(h2%24),\n"
 "          /* 1004B：模擬員工票也要有艙等偏好與同行眷屬（人數 2 的那一位就是眷屬，名字放在員工下面） */\n"
 "          cabsR1004B:((dist929>=3000?(h2>>>11)%3===0:(h2>>>11)%5===0)?['Business','Economy']:['Economy']),\n"
 "          famR1004B:((h2>>>7)%3===0)?[{name:NM929[(h2>>>3)%NM929.length].split(' ')[0]+' '+['YI-AN','HSIN-YU','KAI','MEI','HARU','JUN'][(h2>>>9)%6],rel:['spouse','child','parent'][(h2>>>13)%3]}]:[]});}")
RL('sb plan fn',L,"window.kgmSbSimDecideR929=function(id,how){",open('sb_plan.js',encoding='utf-8').read()+"window.kgmSbSimDecideR929=function(id,how){")
css=[
"'.k4b-sb-strip{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 14px}',",
"'.k4b-sb-seats,.k4b-sb-flow{display:flex;gap:0;align-items:stretch;border:1px solid #e6e3d8;border-radius:11px;background:#fff;overflow:hidden}',",
"'.k4b-sb-seats{background:#f6f7f3}',",
"'.k4b-sb-seats>small{display:flex;align-items:center;padding:0 14px;font-size:9px;letter-spacing:.12em;font-weight:900;color:#8a938d;white-space:nowrap;line-height:1.6}',",
"'.k4b-sb-seats span,.k4b-sb-flow span{display:flex;flex-direction:column;justify-content:center;padding:9px 14px;border-left:1px solid #e6e3d8;min-width:64px}',",
"'.k4b-sb-flow span:first-child{border-left:0}',",
"'.k4b-sb-seats i,.k4b-sb-flow i{font-style:normal;font-size:9.5px;font-weight:800;color:#7b837d;letter-spacing:.04em;white-space:nowrap}',",
"'.k4b-sb-seats b,.k4b-sb-flow b{font:800 18px Georgia,serif;color:#0a4537;line-height:1.25}',",
"'.k4b-sb-flow b small{font:700 12px Georgia,serif;color:#8a938d}',",
"'.k4b-sb-flow em{font-style:normal;font-size:9.5px;color:#a88240;font-weight:800}',",
"'.k4b-sb-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}',",
"'@media(max-width:1180px){.k4b-sb-cols{grid-template-columns:minmax(0,1fr)}}',",
"'.k4b-sb-col{border:1px solid #e6e3d8;border-radius:12px;padding:14px 14px 6px;background:#fff;min-width:0}',",
"'.k4b-sb-col h3{margin:0;font:800 15px Georgia,\"Noto Serif TC\",serif;color:#0a4537;display:flex;align-items:center;gap:8px}',",
"'.k4b-sb-col h3 span{font:900 11px system-ui;background:#0a4537;color:#fff;border-radius:999px;padding:2px 9px}',",
"'.k4b-rule{margin:4px 0 10px;font-size:10.5px;color:#7b837d;line-height:1.7}',",
"'.k4b-sb-t{width:100%;border-collapse:collapse;font-size:11.5px}',",
"'.k4b-sb-t th{background:#fafaf7;color:#7b837d;font-size:9.5px;letter-spacing:.08em;font-weight:900;text-align:left;padding:8px 8px;border-bottom:1px solid #e6e3d8;white-space:nowrap}',",
"'.k4b-sb-t td{padding:9px 8px;border-bottom:1px solid #f1efe8;color:#1e2b26;vertical-align:top}',",
"'.k4b-sb-t td.r40-act{white-space:normal;width:118px}',",
"'.k4b-sb-t td.r40-act .btn{display:block;width:100%;margin:0 0 5px;padding-left:6px;padding-right:6px;white-space:nowrap}',",
"'.k4b-sb-t td.k4b-nw{white-space:nowrap}',",
"'.k4b-sb-t th:nth-child(2){min-width:150px}',",
"'.k4b-n{font:800 13px Georgia,serif;color:#a88240;width:22px}',",
"'.k4b-sub{display:block;color:#7b837d;font-size:10.5px;margin-top:3px;line-height:1.5}',",
"'.k4b-sim{font-style:normal;font-size:10px;color:#5d6a64;background:#eceee9;border:1px solid #dfe2dc;font-weight:800;border-radius:4px;padding:0 5px;margin-right:6px;line-height:15px;display:inline-block}',",
"'.k4b-plan{display:inline-block;font:900 10.5px ui-monospace,Menlo,monospace;background:#e6ecf6;color:#1d4f9c;border-radius:6px;padding:2px 7px}',",
"'.k4b-fr{color:#b3261e;font-size:9.5px;font-weight:800}',",
"'.k4b-v{display:inline-block;font-size:10.5px;font-weight:800;border-radius:999px;padding:3px 9px;white-space:nowrap}',",
"'.k4b-v.ok{background:#e4f1ea;color:#0a4537}',",
"'.k4b-v.no{background:#fdeceb;color:#9b1f18}',",
"'.k4b-fam td{border-bottom:1px solid #f1efe8;background:#fbfbf8;padding-top:6px;padding-bottom:6px}',",
"'.k4b-fam-in{display:block;padding-left:22px;color:#33413b;font-size:11.5px}',",
"'.k4b-fam-in small{color:#7b837d;font-size:10px;margin-left:4px}',",
"'.k4b-aw td{background:#fffdf6}',",
]
RL('sb css',L,"'.r40-moved{font-size:11.5px","\n".join(css)+"\n'.r40-moved{font-size:11.5px")
open('p_g_sb.js','w').write(hdr+'\n'.join(out)+'\n')

# ---- #108 員工票：訂位頁剩餘座位預估 ＋ 後台「員工票狀態」分頁 ----
out2=[]
RL('stx status fns',L,"window.kgmSbSimDecideR929=function(id,how){",open('stx_status.js',encoding='utf-8').read()+"window.kgmSbSimDecideR929=function(id,how){")
R('stx est in shop',"+'</div><small class=\"staff-wait-note\">'+(Z?'候補 · 依實際空位確認':'Standby · subject to space')+'</small></div>';}",
  "+'</div><small class=\"staff-wait-note\">'+(Z?'候補 · 依實際空位確認':'Standby · subject to space')+'</small>'"
  "+(function(){/* 1004B：剩餘座位預估（DH、哩程升等、順位在前的員工票都先扣） */var e=window.kgmStaffSeatEstR1004B?window.kgmStaffSeatEstR1004B(f,d,c):null;if(!e)return '';"
  "return '<small class=\"k4b-est '+(e.left>=pax?'ok':'no')+'\">'+(Z?'預估剩餘 ':'Est. ')+'<b>'+e.left+'</b>'+(Z?' 位':' seats')+'</small>'})()+'</div>';}")
R('stx est head note',"(staff?(Z?'每班選擇兩個不同艙等志願':'Choose two cabin preferences per flight'):(Z?'航班':'Flights'))",
  "(staff?(Z?'每班選擇兩個不同艙等志願':'Choose two cabin preferences per flight')+'<small class=\"k4b-est-note\">'+(Z?'「預估剩餘」已先扣除調位組員、哩程升等候補，以及順位排在您之前的員工票；實際以櫃檯候補為準。':'Estimates exclude crew deadheads, upgrade standbys and staff ahead of you; final allocation at the counter.')+'</small>':(Z?'航班':'Flights'))")
J49='kgm-0819e-r49'
R('stx tab side',"['stafftix','員工票'],['salary','薪資功過']]],['系統',[['approve','審核中心'],['history','動作歷史'],['syscfg','系統設定'],['chat','訊息中心'],['simdata','模擬資料']]]];\nfunction canJ",
  "['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]],['系統',[['approve','審核中心'],['history','動作歷史'],['syscfg','系統設定'],['chat','訊息中心'],['simdata','模擬資料']]]];/* 1004B：員工票狀態 */\nfunction canJ")
R('stx tab can',"if(r==='ground')return ['flightdata','groundops','bookings','cases0831B','checkin_fail','leave','stafftix','salary','chat'].indexOf(tab)>=0;return ['sched','leave','stafftix','salary','chat'].indexOf(tab)>=0}",
  "if(r==='ground')return ['flightdata','groundops','bookings','cases0831B','checkin_fail','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0;return ['sched','leave','stafftix','stxstatus','salary','chat'].indexOf(tab)>=0}")
R('stx tab route',"if(tab==='bookings')body=bookingAdminJ();else if(tab==='cases0831B')",
  "if(tab==='bookings')body=bookingAdminJ();else if(tab==='stxstatus')body=(typeof window.kgmStxStatusPageR1004B==='function'?window.kgmStxStatusPageR1004B():'');else if(tab==='cases0831B')")
J123='kgm-0903b-r123'
RL('stx perm list',J123,"    ['leave','請假管理'],['stafftix','員工票'],['salary','薪資功過']]],\n  ['系統'","    ['leave','請假管理'],['stafftix','員工票'],['stxstatus','員工票狀態'],['salary','薪資功過']]],\n  ['系統'")
RL('stx perm backend',J123,"backend:{status:'use',flightdata:'use'","backend:{stxstatus:'use',status:'use',flightdata:'use'")
RL('stx perm ground',J123,"  ground:{flightdata:'view',groundops:'use',bookings:'use',cases0831B:'use',\n    leave:'use',stafftix:'use',","  ground:{flightdata:'view',groundops:'use',bookings:'use',cases0831B:'use',\n    leave:'use',stafftix:'use',stxstatus:'use',")
RL('stx perm crew',J123,"  crew:{status:'view',sched:'view',leave:'use',stafftix:'use',","  crew:{status:'view',sched:'view',leave:'use',stafftix:'use',stxstatus:'use',")
RL('stx perm pilot',J123,"  pilot:{flightdata:'view',status:'view',sched:'view',fleetsched:'view',leave:'use',\n    stafftix:'use',","  pilot:{flightdata:'view',status:'view',sched:'view',fleetsched:'view',leave:'use',\n    stafftix:'use',stxstatus:'use',")
RL('stx perm service',J123,"service:{bookings:'use',cases0831B:'use',","service:{stxstatus:'use',bookings:'use',cases0831B:'use',")
RL('stx perm pricing',J123,"  pricing:{price:'use',finance:'use',coupons:'use',auctions:'use',routes:'use',status:'view',news_r49:'view',\n    leave:'use',stafftix:'use',","  pricing:{price:'use',finance:'use',coupons:'use',auctions:'use',routes:'use',status:'view',news_r49:'view',\n    leave:'use',stafftix:'use',stxstatus:'use',")
css2=[
"'.k4b-est{display:inline-block;margin-top:7px;font-size:11px;font-weight:700;border-radius:999px;padding:3px 11px;white-space:nowrap}',",
"'.k4b-est b{font-size:13px;font-weight:900}',",
"'.k4b-est.ok{background:#e4f1ea;color:#0a4537}',",
"'.k4b-est.no{background:#fdeceb;color:#9b1f18}',",
"'.k4b-est-note{display:block;margin-top:6px;font-size:10.5px;color:#7b837d;font-weight:500;line-height:1.65;max-width:300px;letter-spacing:0}',",
"'.k4b-ss{border:1px solid #e6e0d0;border-radius:18px;background:#fff;overflow:hidden;margin:0 0 20px}',",
"'.k4b-ss>header{display:flex;gap:20px;align-items:flex-start;padding:20px 24px;border-bottom:1px solid #efeadc;background:linear-gradient(180deg,#fbf9f3,#f7f4ea)}',",
"'.k4b-ss>header small{display:block;font-size:9.5px;letter-spacing:.2em;color:#b39b5e;font-weight:800}',",
"'.k4b-ss>header h2{margin:4px 0 0;font:800 21px Georgia,\"Noto Serif TC\",serif;color:#0a4537}',",
"'.k4b-ss>header p{margin:8px 0 0;font-size:11.5px;color:#7b837d;line-height:1.85;max-width:720px}',",
"'.k4b-ss-live{margin-left:auto;display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;color:#0a4537;border:1px solid #d6e4dc;background:#fff;border-radius:999px;padding:6px 14px;white-space:nowrap}',",
"'.k4b-ss-live i{width:8px;height:8px;border-radius:50%;background:#1f9d63;box-shadow:0 0 0 3px rgba(31,157,99,.18);animation:k4bPulse 1.8s infinite}',",
"'.k4b-ss-live small{font:600 10.5px ui-monospace,Menlo,monospace;color:#7b837d;letter-spacing:0}',",
"'@keyframes k4bPulse{0%,100%{opacity:1}50%{opacity:.35}}',",
"'.k4b-ss-bar{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;padding:14px 24px;border-bottom:1px solid #f2eee2}',",
"'.k4b-ss-bar label{display:flex;flex-direction:column;gap:5px;font-size:9.5px;letter-spacing:.1em;font-weight:900;color:#8a938d}',",
"'.k4b-ss-bar .inp{width:132px;text-transform:uppercase;font-weight:700;letter-spacing:.04em}',",
"'.k4b-ss-bar input[type=date].inp{width:160px;text-transform:none}',",
"'.k4b-ss-sum{display:flex;flex-wrap:wrap;border-bottom:1px solid #f2eee2}',",
"'.k4b-ss-sum span{flex:1 1 150px;padding:12px 24px;border-right:1px solid #f2eee2}',",
"'.k4b-ss-sum span:last-child{border-right:0}',",
"'.k4b-ss-sum i{display:block;font-style:normal;font-size:9.5px;letter-spacing:.08em;font-weight:900;color:#8a938d}',",
"'.k4b-ss-sum b{font:800 20px Georgia,serif;color:#0a4537}',",
"'.k4b-ss-sum b small{font:700 12px Georgia,serif;color:#8a938d}',",
"'.k4b-ss-sum b.r{color:#9b1f18}',",
"'.k4b-ss-wait{font:italic 600 13px Georgia,serif;color:#a88240}',",
"'.k4b-ss-t{width:100%;border-collapse:collapse;font-size:12px;min-width:980px}',",
"'.k4b-ss-t th{background:#f6f3ea;text-align:left;padding:10px 12px;font-size:9.5px;letter-spacing:.08em;color:#7a7468;font-weight:900;white-space:nowrap}',",
"'.k4b-ss-t td{padding:11px 12px;border-top:1px solid #f2eee2;vertical-align:middle;color:#1e2b26}',",
"'.k4b-ss-t tr:hover td{background:#fcfbf6}',",
"'.k4b-ss-t .c{text-align:center}',",
"'.k4b-ss-t td small{color:#8a938d}',",
"'.k4b-ss-big{font:800 17px Georgia,serif;color:#0a4537}',",
"'.k4b-ss-cabs{display:flex;gap:5px;flex-wrap:wrap}',",
"'.k4b-ss-cab{display:inline-flex;align-items:center;gap:4px;font:800 12px Georgia,serif;color:#0a4537;background:#eef4f0;border-radius:7px;padding:3px 8px}',",
"'.k4b-ss-cab i{font:900 9.5px system-ui;color:#5d6a64;font-style:normal}',",
"'.k4b-ss-cab.z{background:#f5f2ec;color:#b0a99a}',",
"'.k4b-ss-l{display:inline-block;font-size:10.5px;font-weight:900;border-radius:999px;padding:3px 11px;white-space:nowrap}',",
"'.k4b-ss-l.ok{background:#e4f1ea;color:#0a4537}',",
"'.k4b-ss-l.mid{background:#fbf3df;color:#7a5a12}',",
"'.k4b-ss-l.low{background:#fdeee0;color:#9a4b0c}',",
"'.k4b-ss-l.full{background:#fdeceb;color:#9b1f18}',",
"'@media(max-width:760px){.k4b-ss>header{flex-direction:column}.k4b-ss-live{margin-left:0}.k4b-ss-bar,.k4b-ss>header{padding-left:16px;padding-right:16px}}',",
]
RL('stx css',L,"'.r40-moved{font-size:11.5px","\n".join(css2)+"\n'.r40-moved{font-size:11.5px")
open('p_g_sb.js','w').write(hdr+'\n'.join(out)+'\n')

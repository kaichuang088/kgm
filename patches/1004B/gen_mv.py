import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 里程購買（審查：待處理／處理中／已完成、人工覆核；優惠搬過來）、優惠碼頁重整 */\n'
SORT="var cases=(S.milesPurchaseCases0809D||[]).slice().sort(function(a,b){return (a.status==='pending_security'?0:1)-(b.status==='pending_security'?0:1)||((b.riskR929&&b.riskR929.flag)?1:0)-((a.riskR929&&a.riskR929.flag)?1:0)||String(b.created||'').localeCompare(String(a.created||''));});"
R('miles tabs filter',SORT,SORT+r"""
/* 1004B：使用者：「里程購買除了AI審核也要可以人工批准或拒絕，儘管一審可疑，然後也要分處理中和待處理」；
   「把里程的這個放到里程購買審查，就等於說里程的那裡有兩個東西一個是里程購買優惠一個是里程購買審查」
   · 待處理：還在安全驗證、而且 AI 標記可疑 —— 一定要有人決定（核准或拒絕都可以，AI 標記只是提醒）
   · 處理中：還在安全驗證、AI 比對都通過 —— 等驗證期滿；也可以提前人工核准或拒絕
   · 已完成：已入帳／已退款。AI 自動做的決定（第 3 次起直接入帳、資料不符自動退款）可以人工覆核推翻 */
var mvSub1004B=S.milesSubR1004B==='promo'?'promo':'review';
var mvPend1004B=function(c){return /^pending/.test(String(c.status||''))};
var mvFlag1004B=function(c){return !!(c.riskR929&&c.riskR929.flag)||!!(c.aiR4&&c.aiR4.ok===false)};
var mvTodo1004B=cases.filter(function(c){return mvPend1004B(c)&&mvFlag1004B(c)}),mvDoing1004B=cases.filter(function(c){return mvPend1004B(c)&&!mvFlag1004B(c)}),mvDone1004B=cases.filter(function(c){return !mvPend1004B(c)});
var mvTab1004B=S.milesTabR1004B||(mvTodo1004B.length?'todo':mvDoing1004B.length?'doing':'done');
var mvPromoN1004B=(S.milesPromos||[]).filter(function(p){var n=todayISO();return p&&(!p.end||p.end>=n)&&(!p.start||p.start<=n)}).length;
var mvNav1004B='<div class="k4b-mv-nav"><button class="'+(mvSub1004B==='review'?'on':'')+'" onclick="S.milesSubR1004B=\'review\';render()">'+(Z6()?'里程購買審查':'Purchase review')+'<b>'+(mvTodo1004B.length+mvDoing1004B.length)+'</b></button><button class="'+(mvSub1004B==='promo'?'on':'')+'" onclick="S.milesSubR1004B=\'promo\';render()">'+(Z6()?'里程購買優惠':'Purchase offers')+'<b>'+mvPromoN1004B+'</b></button></div>';
if(mvSub1004B==='promo')return '<div class="r6-admin-panel">'+mvNav1004B+'<div class="r6-review-head"><div><div class="r6-eyebrow">MILES SALES · OFFERS & REGIONAL TARGETING</div><h1>'+(Z6()?'里程購買優惠':'Mileage purchase offers')+'</h1><p class="r6-muted">'+(Z6()?'購買里程的加贈與折扣活動，可依地區投放；到期自動恢復原價，要延長直接改結束日。原本放在「優惠碼」頁，1004B 起移到這裡。':'Bonus and discount campaigns for buying miles, by region. Ends automatically; change the end date to extend.')+'</p></div></div>'+(typeof window.kgmMilesPromoPanelR1004B==='function'?window.kgmMilesPromoPanelR1004B():'')+'</div>';
cases=mvTab1004B==='todo'?mvTodo1004B:mvTab1004B==='doing'?mvDoing1004B:mvDone1004B;
var mvTabs1004B='<div class="k4b-mv-tabs">'+[['todo',Z6()?'待處理':'To decide',mvTodo1004B.length,Z6()?'AI 標記可疑，需要人工核准或拒絕':'Flagged by AI — decide'],['doing',Z6()?'處理中':'In verification',mvDoing1004B.length,Z6()?'安全驗證期間，AI 比對通過；可提前決定':'AI checks passed; waiting out the window'],['done',Z6()?'已完成':'Completed',mvDone1004B.length,Z6()?'已入帳／已退款；AI 自動決定的可人工覆核':'Credited / refunded; AI decisions can be overridden']].map(function(t){return '<button class="'+(mvTab1004B===t[0]?'on':'')+'" onclick="S.milesTabR1004B=\''+t[0]+'\';render()"><span>'+t[1]+' <b>'+t[2]+'</b></span><small>'+t[3]+'</small></button>'}).join('')+'</div>';""")
s=open('/tmp/j/kgm1004A_final.html',encoding='utf-8').read()
i=s.index(SORT);j=s.index("+(cases.length?cases.map(",i)
HEADEND="Approval immediately credits miles and sends a credited notice.\')+\'</p></div></div>\'+(cases.length?cases.map("
assert s.count(HEADEND)==1
R('miles nav tabs',HEADEND,HEADEND.replace("</p></div></div>\'+(cases.length?cases.map(","</p></div></div>\'+mvNav1004B+mvTabs1004B+(cases.length?cases.map("))
# move nav above head: put nav before head instead — simpler: keep nav right after head (reads fine)
BTN="(c.status==='pending_security'?'<button class=\"btn btn-g\" onclick=\"approveMilesPurchaseR4(\\''+A6(c.id)+'\\')\">'+(Z6()?'核准、立即入帳並寄信':'Approve, credit & email')+'</button><button class=\"btn\" onclick=\"rejectMilesPurchaseR4(\\''+A6(c.id)+'\\')\">'+(Z6()?'拒絕／退款並寄信':'Reject/refund & email')+'</button>':'')"
R('miles override btns',BTN,BTN+r"""+(c.status==='refunded_mismatch'&&!c.overrideR1004B?'<button class="btn btn-g" onclick="kgmMilesOverrideR1004B(\''+A6(c.id)+'\',\'approve\')">'+(Z6()?'人工核准（推翻 AI 退款，重新扣款並入帳）':'Override: approve & credit')+'</button>':'')+(c.status==='credited_direct'&&!c.overrideR1004B?'<button class="btn" onclick="kgmMilesOverrideR1004B(\''+A6(c.id)+'\',\'revoke\')">'+(Z6()?'人工撤銷（扣回里程並退款）':'Override: revoke & refund')+'</button>':'')+(c.overrideR1004B?'<span class="k4b-mv-ov">'+(Z6()?'已人工覆核：':'Overridden: ')+E6(c.overrideR1004B.by||'')+' · '+E6(String(c.overrideR1004B.at||'').replace('T',' ').slice(0,16))+'</span>':'')""")
R('miles override fn',"  window.approveMilesPurchase0809D=window.approveMilesPurchaseR4;",r"""  window.approveMilesPurchase0809D=window.approveMilesPurchaseR4;
  window.KGM_PROMO_MOVED_R1004B=true;   /* 1004B：里程購買優惠已移到里程購買審查頁，優惠碼頁的四個插入點都不再插 */
  /* 1004B：AI 自動做的決定可以人工推翻（自動退款 → 重新扣款入帳；第 3 次起直接入帳 → 扣回里程並退款） */
  window.kgmMilesOverrideR1004B=function(id,how){
    var c=(S.milesPurchaseCases0809D||[]).find(function(x){return x.id===id;});if(!c||c.overrideR1004B)return;
    var by=(S.adminUser||{}).empId||'ADMIN',from=c.status;
    if(how==='approve'){
      if(!confirm(Z6()?'AI 判定資料不符已自動退款。確定由人工核准、重新扣款並入帳？':'Override the AI refund, charge again and credit?'))return;
      c.overrideR1004B={by:by,at:new Date().toISOString(),from:from,how:how};c.refundUSD=0;c.status='pending_security';
      window.approveMilesPurchaseR4(id);
      if(!/credited|approved/.test(String(c.status||''))){c.status=from;c.overrideR1004B=null}
      return;
    }
    var why=prompt(Z6()?'撤銷原因（會寄給會員）':'Reason (emailed to the member)');if(!why)return;
    var u=(S.users||[]).find(function(x){return x.id===c.userId||x.id===c.memberId;});
    try{creditMiles(c.userId||c.memberId,-(+c.miles||0),'Miles purchase revoked '+c.id)}catch(_){}
    if(u&&u.purchasedMiles)u.purchasedMiles=u.purchasedMiles.filter(function(x){return x.order!==c.id});
    c.overrideR1004B={by:by,at:new Date().toISOString(),from:from,how:how};c.status='refunded';c.reason=why;c.refundUSD=c.usd;c.reviewed=c.overrideR1004B.at;
    try{S.notifs.unshift({title:'購買里程已撤銷並退款 / Mile purchase refunded',message:Number(c.miles||0).toLocaleString()+' mi · '+c.id+' · '+why,date:todayISO(),read:false,userId:c.userId||c.memberId})}catch(_){}
    try{if(typeof kgmNotify==='function')kgmNotify('miles.purchase.result',{email:u&&u.email||c.email||'',memberId:c.userId||c.memberId,caseId:c.id,orderId:c.id,status:'refunded',approved:false,miles:+c.miles||0,reason:why})}catch(_){}
    try{save()}catch(_){}try{render()}catch(_){}
  };""")
FLAG="!window.KGM_PROMO_MOVED_R1004B&&"
R('coupon inj 1',"if(S.adminAuthed&&S.adminTab==='coupons'&&h.indexOf('購買哩程優惠 / 地區投放')<0){","if("+FLAG+"S.adminAuthed&&S.adminTab==='coupons'&&h.indexOf('購買哩程優惠 / 地區投放')<0){")
R('coupon inj 2',"      if(S.adminAuthed && S.adminTab==='coupons' && !/購買里程優惠\\s*\\/\\s*地區投放|Mileage purchase promotion|MILES PROMO/i.test(h)){","      if("+FLAG+"S.adminAuthed && S.adminTab==='coupons' && !/購買里程優惠\\s*\\/\\s*地區投放|Mileage purchase promotion|MILES PROMO/i.test(h)){")
R('coupon inj 3',"    if(S.adminAuthed && S.adminTab==='coupons' && h.indexOf('miles-promo-coupon0809c')<0){","    if("+FLAG+"S.adminAuthed && S.adminTab==='coupons' && h.indexOf('miles-promo-coupon0809c')<0){")
R('coupon inj 4',"    if(S.adminAuthed && S.adminTab==='coupons'){\n      try{\n        var tmp=document.createElement('div');tmp.innerHTML=h;","    if("+FLAG+"S.adminAuthed && S.adminTab==='coupons'){\n      try{\n        var tmp=document.createElement('div');tmp.innerHTML=h;")
# coupon page rewrite
i=s.index('    body=`<div style="max-width:640px">\n      <h3 style="font-size:14px;color:var(--g);margin-bottom:6px">🎟️ 折扣碼管理 Coupon Codes</h3>')
j=s.index('  }else if(_t==="upgmiles"){',i)
R('coupon page',s[i:j],open('coupon_page.js',encoding='utf-8').read())
R('promo panel expose',"  var adminView0809CCouponFinal=adminView;","  window.kgmMilesPromoPanelR1004B=milesPromoCouponsPanel0809CFinal;   /* 1004B：搬到里程購買審查 › 里程購買優惠 */\n  var adminView0809CCouponFinal=adminView;")
R('promo panel note','<div style="font-size:11px;color:var(--sub);margin-bottom:10px">此區只在「折扣碼 Coupon」管理頁顯示，用於設定購買里程的區域優惠。</div>','')
css=[
"'.k4b-mv-nav{display:inline-flex;gap:4px;padding:4px;border:1px solid #e3ddcf;border-radius:999px;background:#f7f4ec;margin:0 0 14px}',",
"'.k4b-mv-nav button{border:0;background:transparent;border-radius:999px;padding:8px 18px;font-size:12.5px;font-weight:800;color:#5d6a64;cursor:pointer;display:inline-flex;gap:8px;align-items:center}',",
"'.k4b-mv-nav button.on{background:#0a4537;color:#fff;box-shadow:0 2px 8px rgba(10,69,55,.2)}',",
"'.k4b-mv-nav button b{font:900 10.5px system-ui;background:rgba(0,0,0,.08);border-radius:999px;padding:1px 8px}',",
"'.k4b-mv-nav button.on b{background:rgba(255,255,255,.22)}',",
"'.k4b-mv-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:4px 0 16px}',",
"'.k4b-mv-tabs button{text-align:left;border:1px solid #e3ddcf;background:#fff;border-radius:14px;padding:12px 16px;cursor:pointer;display:flex;flex-direction:column;gap:3px}',",
"'.k4b-mv-tabs button span{font-size:14px;font-weight:900;color:#0a4537}',",
"'.k4b-mv-tabs button span b{font:900 12px system-ui;color:#fff;background:#a88240;border-radius:999px;padding:1px 9px;margin-left:4px}',",
"'.k4b-mv-tabs button small{font-size:11px;color:#7b837d;line-height:1.5}',",
"'.k4b-mv-tabs button.on{border-color:#0a4537;box-shadow:inset 0 0 0 1px #0a4537;background:#f3f8f5}',",
"'.k4b-mv-ov{align-self:center;font-size:11px;color:#7b837d}',",
"'.k4b-cp{border:1px solid #e6e0d0;border-radius:18px;background:#fff;overflow:hidden}',",
"'.k4b-cp>header{display:flex;gap:20px;align-items:flex-start;padding:20px 24px;border-bottom:1px solid #efeadc;background:linear-gradient(180deg,#fbf9f3,#f7f4ea);flex-wrap:wrap}',",
"'.k4b-cp>header small{display:block;font-size:9.5px;letter-spacing:.2em;color:#b39b5e;font-weight:800}',",
"'.k4b-cp>header h2{margin:4px 0 0;font:800 21px Georgia,serif;color:#0a4537}',",
"'.k4b-cp>header p{margin:8px 0 0;font-size:11.5px;color:#7b837d;line-height:1.85;max-width:560px}',",
"'.k4b-cp-kpi{margin-left:auto;display:flex;border:1px solid #e7ddc6;border-radius:14px;background:#fff;overflow:hidden}',",
"'.k4b-cp-kpi span{padding:10px 18px;border-left:1px solid #efe9da;min-width:86px}',",
"'.k4b-cp-kpi span:first-child{border-left:0}',",
"'.k4b-cp-kpi i{display:block;font-style:normal;font-size:9.5px;font-weight:900;color:#8a938d;letter-spacing:.06em}',",
"'.k4b-cp-kpi b{font:800 20px Georgia,serif;color:#0a4537}',",
"'.k4b-cp-body{display:grid;grid-template-columns:minmax(260px,340px) minmax(0,1fr);gap:0}',",
"'.k4b-cp-form{padding:18px 22px;border-right:1px solid #f0ebde;display:flex;flex-direction:column;gap:10px;background:#fcfbf7}',",
"'.k4b-cp-form h3,.k4b-cp-list h3{margin:0 0 4px;font-size:13px;color:#0a4537;font-weight:900}',",
"'.k4b-cp-form label{display:flex;flex-direction:column;gap:5px;font-size:10.5px;font-weight:800;color:#6d7873}',",
"'.k4b-cp-form .inp{height:36px}',",
"'.k4b-cp-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',",
"'.k4b-cp-form .btn{margin-top:4px;height:38px}',",
"'.k4b-cp-list{padding:18px 22px;min-width:0}',",
"'.k4b-cp-list h3 span{font:900 11px system-ui;background:#0a4537;color:#fff;border-radius:999px;padding:1px 9px;margin-left:4px}',",
"'.k4b-cp-scroll{overflow:auto}',",
"'.k4b-cp-list table{width:100%;border-collapse:collapse;font-size:12px;min-width:620px}',",
"'.k4b-cp-list th{background:#f6f3ea;text-align:left;padding:9px 10px;font-size:9.5px;letter-spacing:.08em;color:#7a7468;font-weight:900;white-space:nowrap}',",
"'.k4b-cp-list td{padding:10px;border-top:1px solid #f2eee2;vertical-align:middle}',",
"'.k4b-cp-list td small{display:block;color:#8a938d;font-size:10px}',",
"'.k4b-cp-list .c{text-align:center}.k4b-cp-list .r{text-align:right;white-space:nowrap}',",
"'.k4b-cp-list tr.exp td,.k4b-cp-list tr.off td,.k4b-cp-list tr.full td{color:#9aa19c}',",
"'.k4b-cp-code{font:800 12.5px ui-monospace,Menlo,monospace;color:#a88240;letter-spacing:.04em}',",
"'.k4b-cp-st{display:inline-block;font-size:10.5px;font-weight:900;border-radius:999px;padding:2px 10px}',",
"'.k4b-cp-st.on{background:#e4f1ea;color:#0a4537}.k4b-cp-st.off{background:#eef0ee;color:#6b7470}.k4b-cp-st.exp{background:#fbf3df;color:#7a5a12}.k4b-cp-st.full{background:#fdeee0;color:#9a4b0c}',",
"'.k4b-cp-del{border-color:#e9b8b3!important;color:#b3261e!important}',",
"'.k4b-cp-empty{padding:36px 10px;text-align:center;color:#8a938d;font-size:12px;background:#fafaf7;border:1px dashed #e0ddd2;border-radius:11px}',",
"'@media(max-width:900px){.k4b-cp-body{grid-template-columns:1fr}.k4b-cp-form{border-right:0;border-bottom:1px solid #f0ebde}.k4b-mv-tabs{grid-template-columns:1fr}}',",
]
out.append('RL(%s,%s,%s,%s,%d);'%(J('mv css'),J('kgm-0816d-r40'),J("'.r40-moved{font-size:11.5px"),J("\n".join(css)+"\n'.r40-moved{font-size:11.5px"),1))
open('p_g_mv.js','w').write(hdr+'\n'.join(out)+'\n')

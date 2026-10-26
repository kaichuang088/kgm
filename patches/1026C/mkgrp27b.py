# 1026C 第二批（使用者：「團體定位就是有個按鈕一邊是團體定位一邊是團體定位帳號綁定 AI要可以審核 也要人工可自己加入」）：在 mkgrp27 的結果上再改
s=open('js/grp25_27.js',encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)
rep("""  /* 1026C：使用者「後台團體定位也要有地方…一個是核准或是新增用戶開放期間可訂購團體票」→ AI 客服核對完是「申請中」，後台團體業務核准並設定開放期間後才能訂 */
  var rec={status:'pending',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI',requestedAt:now};""",
"""  /* 1026C：使用者「團體定位就是有個按鈕一邊是團體定位一邊是團體定位帳號綁定 AI要可以審核 也要人工可自己加入」
     → AI 客服核對（統編檢查碼、執照格式、聯絡資料）就是審核，通過直接開通，開放期間預設一年；後台「團體帳號綁定」可以調整期間、停用，也可以人工新增 */
  var rec={status:'active',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI',from:T(),to:AD(T(),365),approvedAt:now,approvedBy:'AI'};""")
rep("""{at:now,status:'resolved',label:z()?'基本資料核對完成，轉團體業務核准開放期間':'Verified; sent to the group desk for approval',by:'AI'}],""",
    """{at:now,status:'resolved',label:z()?'AI 審核通過（統編檢查碼、執照、聯絡資料），開通團體帳號一年':'Verified and approved by AI (one year)',by:'AI'}],""")
rep("""kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',caseNo:no,message:(z()?'團體帳號申請待核准：':'Group account awaiting approval: ')+d.company+'（'+typeName(d.type)+'，統編 '+d.taxId+'）'})""",
    """kgmNotify('group.account_bound',{email:u.email||'',name:d.contact,caseNo:no,message:(z()?'您的團體帳號已由 AI 客服審核開通（'+d.company+'），開放期間 '+rec.from+' ～ '+rec.to+'；期間內可在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is active.')})""")
i=s.index("✓ 已送出團體帳號申請，案件編號 '+r.caseNo+'。");j=s.index("（10–99 位，選航班跟一般訂票一樣）。",i)
s=s[:i]+"✓ 審核通過，團體帳號已開通（案件編號 '+r.caseNo+'，開放到 '+r.to+'）。\\n\\n現在首頁訂票卡多了「團體訂位」分頁"+s[j:]
rep(""":'Request sent. Case '+r.caseNo+'. We will email you once the group desk approves it.')}""",""":'Approved. Case '+r.caseNo+'. The Group tab is now on the home booking card.')}""")
rep("""  return '<section class="k25gd"><header>""","""  var tabs='<div class="k27gd-tabs"><button type="button" class="'+(S.k27gdTab==='acct'?'':'on')+'" onclick="S.k27gdTab=\\'\\';render()">'+(z()?'團體訂位':'Group bookings')+' <i>'+cnt.active+'</i></button><button type="button" class="'+(S.k27gdTab==='acct'?'on':'')+'" onclick="S.k27gdTab=\\'acct\\';render()">'+(z()?'團體帳號綁定':'Group accounts')+' <i>'+accts.length+'</i></button></div>';
  if(S.k27gdTab==='acct')return '<section class="k25gd">'+tabs+(S.grp25AdmMsg?'<div class="k25g-msg">'+E(S.grp25AdmMsg)+'</div>':'')+acform+ac+'</section>';
  return '<section class="k25gd">'+tabs+'<header>""")
rep("""。規章 KGM-GRP-021。':'')+'</span></header>'+acform""","""。規章 KGM-GRP-021。':'')+'</span></header>'""")
rep("""  +'.k27ga{""","""  +'.k27gd-tabs{display:flex;gap:6px;background:#F1F4F2;border-radius:999px;padding:4px;width:max-content;margin:0 0 14px}.k27gd-tabs button{border:0;background:transparent;border-radius:999px;padding:8px 18px;font:700 13px inherit;color:#55605B;cursor:pointer}.k27gd-tabs button.on{background:#0B3D2E;color:#fff}.k27gd-tabs i{font-style:normal;opacity:.75;margin-left:4px}'
  +'.k27ga{""")
# 1027A 使用者：「大型旅團會給的是案件編號（團為單位的），開票後每個旅客都有自己的定位代號」→ 團體頁主要編號寫「團體案件編號」，開票前的整團 PNR 只當附註
rep("""<div><small>PNR</small><b class="mono">'+E(g.pnr)+'</b></div>""",
    """<div><small>'+(z()?'團體案件編號':'Group case no.')+'</small><b class="mono">'+E(g.id)+'</b><span>'+(g.split?(z()?'已開票：每位旅客一個 PNR':'Ticketed: one PNR each'):(z()?'開票前整團 PNR ':'Group PNR ')+E(g.pnr))+'</span></div>""")
rep("""<small>'+E(g.id)+' · PNR '+E(g.pnr)+' · '+g.pax+(z()?' 位':' pax')+'</small>""",
    """<small>'+(z()?'案件 ':'Case ')+E(g.id)+' · '+g.pax+(z()?' 位':' pax')+'</small>""")
rep("""<small>'+E(g.id)+' · PNR '+E(g.pnr)+'</small>""","""<small>'+(z()?'案件 ':'Case ')+E(g.id)+(g.split?'':' · PNR '+E(g.pnr))+'</small>""")
open('js/grp25_27.js','w',encoding='utf-8').write(s);print('ok')

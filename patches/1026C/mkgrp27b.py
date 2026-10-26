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
# 1027A 使用者：「訂購團體機票也要選擇包機或是建立航班…後台會給予回覆，若成功，後台會給與班機編號，然後也要加入該飛機的飛行Schedule」
#   → js/cr27.js；這裡只開口：finish 可以由後台替申請的團體帳號建立（不跳畫面、不寄「訂金已收到」）、狀態「已核准・待付訂金」、前台三個按鈕、後台第三個分頁
rep("function finish(b,d,pc){\n  var a=acct()||{},u=me()||{},segs=segsOf(b)","function finish(b,d,pc,opt){\n  var a=(opt&&opt.acct)||acct()||{},u=(opt&&opt.user)||me()||{},segs=segsOf(b)")
rep("  mail('group.booked',g,","  if(opt&&opt.quiet){save1();return g}   /* 1026C：包機／自創航班由後台建立 */\n  mail('group.booked',g,")
rep("doPayWrap();setTimeout(doPayWrap,0);setTimeout(doPayWrap,3000);","doPayWrap();setTimeout(doPayWrap,0);setTimeout(doPayWrap,3000);\nwindow.kgmGrpFinishR1026C=function(b,d,pc,opt){return finish(b,d,pc,opt)};   /* 1026C：包機／自創航班核准後由後台建立團體訂位（js/cr27.js） */")
rep("var ST={deposit_paid:","var ST={quoted:['已核准・待付訂金','Approved · deposit due','#7A4B00','#FFF4E0'],deposit_paid:")
rep("""<button type="button" class="k25g-btn" onclick="nav(\\'home\\');setTimeout(function(){kgmGrpModeR1025B(1)},50)">'+(z()?'＋ 新的團體訂位':'＋ New booking')+'</button></div></div>'+list()+'</div>'};""",
    """<div class="k27cr-acts"><button type="button" class="k25g-btn" onclick="nav(\\'home\\');setTimeout(function(){kgmGrpModeR1025B(1)},50)">'+(z()?'＋ 一般航班團體訂位':'＋ Scheduled flights')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmCharterOpenR1026C(\\'charter\\')">'+(z()?'包機申請':'Charter')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmCharterOpenR1026C(\\'custom\\')">'+(z()?'自創航班申請':'Custom flight')+'</button></div></div></div>'+(window.kgmCharterFrontR1026C?window.kgmCharterFrontR1026C():'')+list()+'</div>'};""")
rep("""class="'+(S.k27gdTab==='acct'?'':'on')+'" onclick="S.k27gdTab=\\'\\';render()">""","""class="'+(S.k27gdTab?'':'on')+'" onclick="S.k27gdTab=\\'\\';render()">""")
rep("""+(z()?'團體帳號綁定':'Group accounts')+' <i>'+accts.length+'</i></button></div>';""",
    """+(z()?'團體帳號綁定':'Group accounts')+' <i>'+accts.length+'</i></button><button type="button" class="'+(S.k27gdTab==='charter'?'on':'')+'" onclick="S.k27gdTab=\\'charter\\';render()">'+(z()?'包機／自創航班':'Charter / custom')+' <i>'+((window.kgmCharterPendR1026C&&window.kgmCharterPendR1026C())||0)+'</i></button></div>';""")
rep("""if(S.k27gdTab==='acct')return '<section class="k25gd">'+tabs+""","""if(S.k27gdTab==='charter')return '<section class="k25gd">'+tabs+(window.kgmCharterDeskR1026C?window.kgmCharterDeskR1026C():'')+'</section>';
  if(S.k27gdTab==='acct')return '<section class="k25gd">'+tabs+""")
# 1027A 包機（整架已付）：個別旅客改艙等不收差額；自創航班照收（報價是人數 × 經濟艙）
rep("var chd=i>=g.adults,unit=chd?0.75:1,old=Math.round(g.perSeat*unit),nw=Math.round(diff*unit),d=nw-old;",
    "var chd=i>=g.adults,unit=chd?0.75:1,old=Math.round(g.perSeat*unit),nw=Math.round(diff*unit),d=nw-old;if(g.charterR1026C&&g.kindR1026C!=='custom'){nw=old;d=0}   /* 1026C：包機整架已付，改艙等不另收 */")
# 1027A 包機核准後還沒付訂金：下一步是付訂金
rep("status==='cancelled'?(z()?'已取消':'Cancelled'):!(sc[1]&&sc[0]===sc[1])?","status==='cancelled'?(z()?'已取消':'Cancelled'):g.status==='quoted'?(z()?'下一步：付訂金 ':'Next: deposit ')+E(g.deposit&&g.deposit.due||''):!(sc[1]&&sc[0]===sc[1])?")
# 1027A 包機核准後訂金未付：明細頁不能寫「已付」
rep("""stepCard('booked',1,z()?'訂位成立・訂金':'Booked',true,(z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 已付・':' paid · ')+E(String(g.createdAt||'').slice(0,10)),""",
    """stepCard('booked',1,z()?'訂位成立・訂金':'Booked',g.deposit.paid!==false,g.deposit.paid===false?((z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 待付・期限 ':' due ')+E(g.deposit.due||'')):((z()?'訂金 ':'Deposit ')+M(g.deposit.amount,g.curr)+(z()?' 已付・':' paid · ')+E(String(g.deposit.paidAt||g.createdAt||'').slice(0,10))),""")
rep("""Math.round(((g.deposit.amount+(g.balance.paid?g.balance.amount:0))/(g.total||1))*100)""","""Math.round((((g.deposit.paid===false?0:g.deposit.amount)+(g.balance.paid?g.balance.amount:0))/(g.total||1))*100)""")
rep("""(z()?'已付 ':'Paid ')+M(g.deposit.amount+(g.balance.paid?g.balance.amount:0),g.curr)+'</span>'+(!g.balance.paid&&act?""",
    """(z()?'已付 ':'Paid ')+M((g.deposit.paid===false?0:g.deposit.amount)+(g.balance.paid?g.balance.amount:0),g.curr)+'</span>'+(g.deposit.paid===false&&g.deposit.token?'<button type="button" class="k25g-btn full" onclick="kgmOpenPayR45(\\''+A(g.deposit.token)+'\\')">'+(z()?'付訂金 ':'Pay deposit ')+M(g.deposit.amount,g.curr)+'</button>':'')+(!g.balance.paid&&act&&g.deposit.paid!==false?""")

# 1027A 使用者：「後台團體頁要有地方核准帳號／新增用戶＋開放期間」→ 使用中的帳號也看得到、改得了開放期間（原本只有停用）；清單預設展開
rep(r"""</td><td>'+(x.status==='active'?(z()?'使用中':'Active'):(z()?'已停用':'Revoked'))+'</td><td>'+(x.status==='active'?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'停用':'Revoke')+'</button>':'')+'</td></tr>'""",
    r"""</td><td>'+(x.status==='active'?((x.to&&x.to<T())?(z()?'已過期':'Expired'):(z()?'使用中':'Active')):(z()?'已停用':'Revoked'))+'</td>'
      +'<td class="k27ga-per">'+(x.status==='active'?'<input id="k27gpF'+E(u.id)+'" type="date" class="inp" value="'+E(x.from||'')+'"><span>～</span><input id="k27gpE'+E(u.id)+'" type="date" class="inp" value="'+E(x.to||'')+'"><button type="button" class="k25g-btn ghost" onclick="var r=kgmGrpPeriodR1026C(\''+A(u.id)+'\',document.getElementById(\'k27gpF'+A(u.id)+'\').value,document.getElementById(\'k27gpE'+A(u.id)+'\').value);S.grp25AdmMsg=r?\''+(z()?'✓ 已更新開放期間':'Period updated')+'\':\''+(z()?'結束日期不能早於開始日期':'End before start')+'\';render()">'+(z()?'更新':'Update')+'</button>':E((x.from||'')+(x.to?' ～ '+x.to:'')))+'</td>'   /* 1026C：開放期間可改 */
      +'<td>'+(x.status==='active'?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\'unbind\',\''+A(u.id)+'\')">'+(z()?'停用':'Revoke')+'</button>':'')+'</td></tr>'""")
rep(r"""<th>'+(z()?'狀態':'Status')+'</th><th></th></tr></thead><tbody>'
    +(accts.length?accts.map(""",r"""<th>'+(z()?'狀態':'Status')+'</th><th>'+(z()?'開放期間':'Open period')+'</th><th></th></tr></thead><tbody>'
    +(accts.length?accts.map(""")
rep(r"""'<tr><td colspan="7" class="k25g-none">'+(z()?'還沒有團體帳號。""",r"""'<tr><td colspan="8" class="k25g-none">'+(z()?'還沒有團體帳號。""")
rep(r"""var ac='<details class="k25gd-acc"'+(S.grp25AccOpen?' open':'')""",r"""var ac='<details class="k25gd-acc"'+(S.grp25AccOpen!==false?' open':'')""")
rep(r"""window.kgmGrpAddUserR1026C=function(q,d){""",r"""window.kgmGrpPeriodR1026C=function(uid,from,to){var u=(S.users||[]).filter(function(x){return x&&x.id===uid})[0];if(!u||!u.groupAccountR1025B)return false;if(from&&to&&to<from)return false;   /* 1026C：改開放期間 */
  var x=u.groupAccountR1025B,was=(x.from||'')+'～'+(x.to||'');x.from=from||x.from||T();x.to=to||'';x.periodAt=new Date().toISOString();x.periodBy=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';if(S.user&&S.user.id===uid)S.user.groupAccountR1025B=x;
  acctMail(u,x,'group.account_bound',(z()?'您的團體帳號（'+x.company+'）開放期間已更新為 '+x.from+' ～ '+(x.to||'不限')+'。':'Your group account period was updated.'));
  try{logAct(z()?'團體帳號開放期間':'Group account period',x.company+' · '+was+' → '+x.from+'～'+(x.to||'—'))}catch(_){}save1();return true};
window.kgmGrpAddUserR1026C=function(q,d){""")
rep(r"""  +'.k27ga{""",r"""  +'.k25gd-acc .k25g-btn{white-space:nowrap}.k25gd-acc td:nth-last-child(-n+3){white-space:nowrap}.k25gd-acc td:first-child{min-width:130px}.k27ga-per{white-space:nowrap}.k27ga-per input{width:138px;height:32px;display:inline-block}.k27ga-per span{margin:0 4px;color:#8A948F}.k27ga-per button{margin-left:6px}'
  +'.k27ga{""")

# 1027A：團體帳號表欄位太多擠成直排 → 類型併到名稱下、會員與案件併一欄
rep(r"""<th>'+(z()?'名稱':'Name')+'</th><th>'+(z()?'類型':'Type')+'</th><th>'+(z()?'統編／執照':'Tax / licence')+'</th><th>'+(z()?'會員':'Member')+'</th><th>'+(z()?'案件':'Case')+'</th>""",
    r"""<th>'+(z()?'名稱／類型':'Name / type')+'</th><th>'+(z()?'統編／執照':'Tax / licence')+'</th><th>'+(z()?'會員／案件':'Member / case')+'</th>""")
rep(r"""<small>'+E(x.contact&&x.contact.name||'')+' · '+E(x.contact&&x.contact.phone||'')+'</small></td><td>'+E(typeName(x.type))+'</td><td>'+E(x.taxId)+'<small>'+E(x.license||'')+'</small></td><td>'+E(u.email||'')+'<small>'+E(u.id||'')+'</small></td><td>'+E(x.caseNo)+'<small>'+E(String(x.boundAt||'').slice(0,10))+'</small></td>""",
    r"""<small>'+E(typeName(x.type))+' · '+E(x.contact&&x.contact.name||'')+' · '+E(x.contact&&x.contact.phone||'')+'</small></td><td>'+E(x.taxId)+'<small>'+E(x.license||'')+'</small></td><td>'+E(u.email||'')+'<small>'+E(x.caseNo)+' · '+E(String(x.boundAt||'').slice(0,10))+'</small></td>""")
rep(r"""'<tr><td colspan="8" class="k25g-none">""",r"""'<tr><td colspan="6" class="k25g-none">""")
open('js/grp25_27.js','w',encoding='utf-8').write(s);print('ok')

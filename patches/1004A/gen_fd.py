import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 航班資料表格（搜尋、作業動作、右上白塊） */
'''
L7='kgm-r7-admin-ops'
RL('fd core',L7,"  window.searchOpsR7=function(){",open('fd_ops.js',encoding='utf8').read())
RL('fd action cell',L7,"      var action=x.groundUpgrade?'<span class=\"r7-tier\" style=\"background:#dff4e8;color:#075f3f\">'+(z()?'已免費升等':'UPGRADED')+'</span>':(can?'<button class=\"btn btn-sm btn-g\" onclick=\"groundUpgradeR7(\\''+A(k)+'\\',\\''+A(x.id)+'\\')\">'+(z()?('免費升至 '+target):('Upgrade to '+target))+'</button>':'—');",
  "      /* 1004A：最右欄改成「作業動作」按鈕（免費升等也要先選動作再按）；已升等的標籤照舊顯示 */\n      var action=fdCell929(k,x,'<span class=\"r7-tier\" style=\"background:#dff4e8;color:#075f3f\">'+(z()?'已免費升等':'UPGRADED')+'</span>');")
RL('fd row attr',L7,"      return '<tr class=\"'+(elite?'elite ':'')+(x.staff?'staff':'')+'\"><td>'+(i+1)+'</td>",
  "      return '<tr class=\"'+(elite?'elite ':'')+(x.staff?'staff':'')+(x.offloadR929?' k929-off':'')+'\" data-q929=\"'+E(String([x.name,x.last,x.first,x.pnr,x.member].join(' ')).toLowerCase())+'\"><td>'+(i+1)+'</td>")
RL('fd bar',L7,"'+(z()?'最多升至商務艙；禁止升至頭等艙':'Up to Business only; never First')+'</span></div><table>",
  "'+(z()?'最多升至商務艙；禁止升至頭等艙':'Up to Business only; never First')+'</span></div>'+fdBar929()+'<table>")
# ---- #69：DH 組員 ----
RL('dh core',L7,"  function manifest7(f,date){",open('dh.js',encoding='utf8').read())
RL('dh rows',L7,"    var rows=real.concat(base),st=store7(k),used={},wrote=false;","    var rows=real.concat(base).concat(dhRows929(f,date,k)),st=store7(k),used={},wrote=false;   /* 1004A：DH 組員 */")
RL('dh badge',L7,"'+(x.staff?' <span class=\"r7-staff-badge\">STAFF</span>':'')+'","'+(x.staff?' <span class=\"r7-staff-badge\">STAFF</span>':'')+(x.dhR929?' <span class=\"k929-dh\" title=\"'+E(z()?'組員以旅客身分調位（Deadhead）':'Crew positioning (deadhead)')+'\">DH '+(z()?'調位':'')+(x.dhRole?' · '+E(({pilot:z()?'飛行員':'Pilot',cabin:z()?'客艙':'Cabin',crew:z()?'客艙':'Cabin'})[x.dhRole]||x.dhRole):'')+'</span>':'')+'")
R('dh lookup',"window.kgmLookupPnrR23=function(rawPnr,first,last){\n  var key=norm(rawPnr);","window.kgmLookupPnrR23=function(rawPnr,first,last){\n  try{if(window.kgmDhMaterializeR929)window.kgmDhMaterializeR929(rawPnr)}catch(_){}   /* 1004A：員工調位 PNR */\n  var key=norm(rawPnr);")
RL('dh person',"kgm-0823c-r55","function personK5(pnr,name){","function personK5(pnr,name){\n  /* 1004A：調位組員（員工 PNR）顯示員工本人資料，不要用模擬旅客產生器 */\n  try{var b929=(S.bookings||[]).filter(function(b){return b&&b.pnr===pnr&&b.dhR929})[0];if(b929){var st929=(S.staff||[]).filter(function(x){return x&&x.empId===b929.dhR929.empId})[0]||{};\n    return {dob:st929.dob||'—',nat:(Z()?'TW 台灣':'TW'),passport:st929.passport||'—',email:st929.email||(String(b929.dhR929.empId).toLowerCase()+'@kgm-airways.com'),phone:st929.phone||(Z()?'員工':'Staff')}}}catch(_){}")
RL('trip seat auto',"kgm-0909B-r217","    var k=Object.keys(s).filter(function(x){return s[x]});\n    try{if(window.kgmSeatShowR65)","    var k=Object.keys(s).filter(function(x){return s[x]&&x!=='_auto'});   /* 1004A：_auto 是「系統指派」的標記，不是座位 */\n    try{if(window.kgmSeatShowR65)")
open('p_f_fd.js','w').write(hdr+'\n'.join(out)+'\n')

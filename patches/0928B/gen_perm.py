import json
out=[]
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
L='kgm-0903b-r123'
hdr='''/* 0928B · 審核中心「部門權限（可整個部門一次切換）」（使用者：「幫我分類然後確認每一頁都有在上面」）
   原本：28 列攤成一張表，沒有分類；「AI 對話查詢」「競標管理」沒寫在清單裡，是從側邊欄撿回來、排在最後；
   每列底下印的分頁代碼會被全站版號替換改成 cases0928B（跟實際的 cases0831B 對不起來，看起來像錯的）。
   現在：照左側選單的七個分類（航班營運／訂位與客服／會員服務／行銷／財務與航網／人資與組員／系統）分段，
   每段有一列「整個分類」可以對某部門一次切換；兩個漏掉的分頁放回「訂位與客服」；名稱跟左側選單一致；
   表頭上方即時比對左側選單，列出「左側 N 頁全部在表上」或缺了哪幾頁。
   順手修正：設成「可註解」的格子重畫後會顯示成「未解鎖」（下拉沒有 annot 這個選項），權限本身是對的，只是顯示錯。 */
'''
RL('perm tabs',L,
"""  ['訂位與客服',[['bookings','定位管理'],['cases0831B','案件處理中心']]],/* 0913A：旅客資料更改併入案件處理中心 */
  ['會員服務',[['members','會員管理'],['blacklist_r117','黑名單'],['milesverify','里程購買審核'],""",
"""  ['訂位與客服',[['bookings','定位管理'],['cases0831B','案件處理中心'],['cases0831C','AI 對話查詢'],['auctions','競標管理']]],/* 0913A：旅客資料更改併入案件處理中心；0928B：補上 AI 對話查詢、競標管理 */
  ['會員服務',[['members','會員管理'],['blacklist_r117','黑名單'],['milesverify','里程購買審查'],""")
RL('perm group setter',L,
"""window.kgmPermSetAcctR123=function(empId,tab,level){""",
"""/* 0928B：同一個分類一次切換 */
window.kgmPermSetDeptGroupR928=function(dept,group,level){
  if(!isCeo()){alert(z()?'只有執行長可以調整權限。':'CEO only.');return}
  var p=P();p.dept[dept]=p.dept[dept]||{};
  window.kgmPermTabsR123().filter(function(t){return t.group===group}).forEach(function(t){
    if(level==='default')delete p.dept[dept][t.tab];else p.dept[dept][t.tab]=level});
  try{save()}catch(_){}try{render()}catch(_){}
};
window.kgmPermSetAcctR123=function(empId,tab,level){""")
RL('perm matrix',L,
"""  html+='<section class="k123-panel"><header><small>PERMISSION MATRIX</small>'
    +'<h3>'+(z()?'部門權限（可整個部門一次切換）':'Department permissions')+'</h3></header>'
    +'<div class="k123-matrix"><table class="k123-t"><thead><tr><th>'+(z()?'分頁':'Page')+'</th>'""",
"""  /* 0928B：比對左側選單，確認每一頁都在表上 */
  var cov928=(function(){try{var hasTab={},hasLab={};tabs.forEach(function(t){hasTab[t.tab]=1;hasLab[t.label]=1});var seen={},n=0,miss=[];
    document.querySelectorAll('.p-admin-side button').forEach(function(b){
      if(b.offsetParent===null||getComputedStyle(b).display==='none')return;   /* 隱藏的按鈕不算 */
      var t=(b.textContent||'').trim(),m=/S\.adminTab='([^']+)'/.exec(b.getAttribute('onclick')||'');
      if(!t||/登出|Logout/.test(t))return;var key=m?m[1]:t;if(seen[key])return;seen[key]=1;n++;
      if(!(m?hasTab[m[1]]:hasLab[t]))miss.push(t)});
    return {n:n,miss:miss}}catch(_){return null}})();
  /* 分類列用自己的下拉：各頁設定不一樣時顯示「各頁不同」，不會被當成未解鎖 */
  var gsel928=function(cur,onch){var o=[['use',z()?'可使用':'Use'],['annot',z()?'可註解':'Annotate'],['none',z()?'未解鎖':'Locked']];
    return '<select class="k928-gsel" onchange="'+onch+'">'+(cur?'':'<option value="" selected disabled>'+(z()?'各頁不同':'Mixed')+'</option>')
      +o.map(function(x){return '<option value="'+x[0]+'"'+(cur===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'};
  var groups928=[];tabs.forEach(function(t){if(groups928.indexOf(t.group)<0)groups928.push(t.group)});
  html+='<section class="k123-panel"><header><small>PERMISSION MATRIX</small>'
    +'<h3>'+(z()?'部門權限（可整個部門一次切換）':'Department permissions')+'</h3>'
    +(cov928&&cov928.n?('<p class="k928-cov'+(cov928.miss.length?' bad':'')+'">'+(cov928.miss.length
      ?((z()?'左側選單有 ':'Sidebar has ')+cov928.n+(z()?' 頁，下表缺：':' pages; missing: ')+E(cov928.miss.join('、')))
      :('✓ '+(z()?('左側選單 '+cov928.n+' 頁全部列在下表，共 '+groups928.length+' 個分類'):('All '+cov928.n+' sidebar pages listed in '+groups928.length+' groups'))))+'</p>'):'')
    +'</header>'
    +'<div class="k123-matrix"><table class="k123-t"><thead><tr><th>'+(z()?'分頁':'Page')+'</th>'""")
RL('perm matrix body',L,
"""    +'</tr></thead><tbody>'
    +tabs.map(function(t){
      return '<tr><td>'+E(t.label)+'<br><small style="color:#9A948A">'+E(t.tab)+'</small></td>'
        +depts.map(function(d){
          var cur=(p.dept[d]&&p.dept[d][t.tab])||'default';
          return '<td>'+LEVELSEL(cur,"kgmPermSetDeptR123('"+d+"','"+t.tab+"',this.value)")+'</td>';
        }).join('')+'</tr>';
    }).join('')+'</tbody></table></div></section>';""",
"""    +'</tr></thead><tbody>'
    +groups928.map(function(g){
      var gt=tabs.filter(function(t){return t.group===g});
      /* 0928B：分類標題列＋「整個分類」一次切換（全部同一個值時顯示那個值） */
      return '<tr class="k928-grp"><td><b>'+E(g)+'</b><small>'+gt.length+(z()?' 頁':' pages')+(z()?'　整個分類':' · whole group')+'</small></td>'
        +depts.map(function(d){
          var vals=gt.map(function(t){var v=(p.dept[d]&&p.dept[d][t.tab])||'none';return v==='view'?'annot':(v==='default'?'none':v)}),same=vals.every(function(v){return v===vals[0]});
          return '<td>'+gsel928(same?vals[0]:'',"kgmPermSetDeptGroupR928('"+d+"','"+g+"',this.value)")+'</td>';
        }).join('')+'</tr>'
        +gt.map(function(t){
          return '<tr class="k928-pg"><td>'+E(t.label)+'</td>'
            +depts.map(function(d){
              var cur=(p.dept[d]&&p.dept[d][t.tab])||'default';
              return '<td>'+LEVELSEL(cur,"kgmPermSetDeptR123('"+d+"','"+t.tab+"',this.value)")+'</td>';
            }).join('')+'</tr>';
        }).join('');
    }).join('')+'</tbody></table></div></section>';""")
RL('perm css',L,
"""+'.k123-empty{padding:22px;text-align:center;color:#9A948A;font-size:12px}';""",
"""+'.k123-empty{padding:22px;text-align:center;color:#9A948A;font-size:12px}'
+'.k928-grp td{background:#F3F7F5;border-top:2px solid #D6E4DD}.k928-grp td:first-child b{display:block;color:#1F4E46;font-size:12.5px}'
+'.k928-grp td:first-child small{display:block;color:#8A8578;font-size:10px;margin-top:2px}.k928-pg td:first-child{padding-left:26px}'
+'.k928-cov{margin:6px 0 0;font-size:11.5px;color:#2E6B55}.k928-cov.bad{color:#B04A38;font-weight:700}'
+'.k123-matrix thead th{position:sticky;top:0;z-index:1}'
+'.k928-gsel{font-size:11.5px;padding:4px 8px;border:1px solid #9FBFB2;border-radius:8px;background:#fff;font-weight:700;color:#1F4E46}';""")
RL('perm levelsel annot',L,
"""  var unset=(!cur||cur==='default');
  return '<select class="k123-sel""",
"""  if(cur==='annot')cur='view';   /* 0928B：存的是 annot（r197），這裡沒有 annot 選項 → 以前一律顯示成未解鎖 */
  var unset=(!cur||cur==='default');
  return '<select class="k123-sel""")
RL('perm whole dept row',L,
"""      return '<td>'+LEVELSEL('',"kgmPermSetDeptAllR123('"+d+"',this.value)")+'</td>'}).join('')""",
"""      var va928=tabs.map(function(t){var v=(p.dept[d]&&p.dept[d][t.tab])||'none';return v==='view'?'annot':(v==='default'?'none':v)}),sa928=va928.every(function(v){return v===va928[0]});   /* 0928B：不一樣就寫「各頁不同」 */
      return '<td>'+gsel928(sa928?va928[0]:'',"kgmPermSetDeptAllR123('"+d+"',this.value)")+'</td>'}).join('')""")
open('p_e_perm.js','w').write(hdr+'\n'.join(out)+'\n')

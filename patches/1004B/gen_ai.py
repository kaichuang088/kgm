import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 後台 AI 擴充、組員班表頁卡片移除 */\n'
R('ai tools',"    set_state:{tab:'syscfg',sys:true,zh:'直接修改資料',run:function(a){",open('ai_tools.js',encoding='utf-8').read()+"    set_state:{tab:'syscfg',sys:true,zh:'直接修改資料',run:function(a){")
R('ai pending fn',"  /* ── 站內規則引擎（Worker 連不上時） ── */\n  function plan(text){\n    var t=norm(text),acts=[];",
  open('ai_pending.js',encoding='utf-8').read()+"  /* ── 站內規則引擎（Worker 連不上時） ── */\n  function plan(text){\n    var t=norm(text),acts=[];\n"+open('ai_plan.js',encoding='utf-8').read())
R('ai any tools',"      var allowed=tl.sys?(roleOf()==='ceo'||roleOf()==='backend'):","      var allowed=tl.any?true:tl.sys?(roleOf()==='ceo'||roleOf()==='backend'):")
R('ai help any',"var rows=Object.keys(TOOLS).map(function(k){var o=TOOLS[k],ok=o.sys?","var rows=Object.keys(TOOLS).map(function(k){var o=TOOLS[k],ok=o.any?true:o.sys?")
R('ai help examples',"· 列出票價規則／刪除規則 FRxxxx\\n· 設定 S.xxx = 值（系統人員／CEO）':'');",
  "· 列出票價規則／刪除規則 FRxxxx\\n· 目前還有沒有我沒處理的案件\\n· 移除 K60012 10/12~10/14 的班表（原因：訓練）／恢復 K60012 的班表\\n· 排班更新\\n· KX20 10/12 員工票還剩幾位\\n· 打開員工票狀態\\n· 設定 S.xxx = 值（系統人員／CEO）':'');")
R('case rows expose',"function caseCenterJ(){","/* 1004B：後台 AI 的「待處理事項總覽」要讀同一份案件清單 */\nwindow.kgmCaseOpenRowsR1004B=function(){try{return caseRowsJ().filter(function(r){return !caseClosedJ(r)})}catch(_){return []}};\nfunction caseCenterJ(){")
# crew remove accepts args from AI
R('crew remove args',"""    window.kgmCrewRemoveR928=function(){
      var v=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
      var emp=v('k928crEmp').toUpperCase(),a=v('k928crFrom'),b=v('k928crTo')||a,why=v('k928crWhy');
      var st=crewAll()[emp];
      if(!st){alert(Z()?'查無此組員（員工編號）。':'No such crew member.');return}
      if(!a||b<a){alert(Z()?'請選擇正確的日期區間。':'Choose a valid date range.');return}
      if(!why){alert(Z()?'請填寫原因。':'Enter a reason.');return}""","""    /* 1004B：卡片拿掉之後由後台 AI 呼叫：o={empId,from,to,reason}；成功回傳 true，失敗回傳原因字串（不跳 alert） */
    window.kgmCrewRemoveR928=function(o){
      var v=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
      var say=function(m){if(!o)alert(m);return m};
      var emp=String(o?o.empId||'':v('k928crEmp')).toUpperCase(),a=o?o.from||'':v('k928crFrom'),b=(o?o.to:v('k928crTo'))||a,why=o?o.reason||'':v('k928crWhy');
      var st=crewAll()[emp];
      if(!st)return say(Z()?'查無此組員（員工編號）。':'No such crew member.');
      if(!a||b<a)return say(Z()?'請選擇正確的日期區間。':'Choose a valid date range.');
      if(!why)return say(Z()?'請填寫原因。':'Enter a reason.');""")
R('crew remove ret',"""        done:function(rec){S._crMsg928=(Z()?'✓ 已移除 '+st.name+' '+a+'～'+b+' 的班表，重排後共 '+rec.n+' 位組員班表異動並已通知。':'Removed; '+rec.n+' crew changed and notified.')}});
    };""","""        done:function(rec){S._crMsg928=(Z()?'✓ 已移除 '+st.name+' '+a+'～'+b+' 的班表，重排後共 '+rec.n+' 位組員班表異動並已通知。':'Removed; '+rec.n+' crew changed and notified.')}});
      return true;
    };""")
s=open('/tmp/j/kgm1004A_final.html',encoding='utf-8').read()
i=s.index("        +'<div class=\"k928-ct-grid\">'\n        +'<section><h4>'+(window.KGM_CLAUDE_MARK_R929")
j=s.index("        +'</section></div>'\n        +(log?",i)+len("        +'</section></div>'\n")
R('crew cards removed',s[i:j],"""        /* 1004B：「後台 AI」卡與「移除班表」卡拿掉 —— 換班、移除／恢復班表、排班更新都直接跟右下角的後台 AI 說。
           移除中的班表照樣列在這裡（可以直接按恢復）。 */
        +(offs.length?'<div class="k4b-crew-off"><b>'+(Z()?'目前移除中的班表':'Removed duties')+'</b><table class="k928-ct-t"><tbody>'+offs.map(function(o){return '<tr><td><b>'+E(o.name)+'</b> <small>'+E(o.empId)+'</small></td><td>'+E(o.from)+'～'+E(o.to)+'</td><td>'+E(o.reason)+'</td><td><button class="btn btn-sm" onclick="kgmCrewRestoreR928(\\''+o.id+'\\')">'+(Z()?'恢復':'Restore')+'</button></td></tr>'}).join('')+'</tbody></table></div>':'')
        +'<div class="k4b-crew-ai">'+(window.KGM_CLAUDE_MARK_R929||'').replace('width="26" height="26"','width="14" height="14" style="vertical-align:-2px"')+' '+(Z()?'換班、移除／恢復班表請直接跟右下角的後台 AI 說，例如「移除 K60012 10/12~10/14 的班表（原因：訓練）」、「K60012 10/12 想換到東京的班」。':'Ask the Admin AI (bottom right) to swap, remove or restore duties.')+'</div>'
""")
R('crew off css',"      +'.k928-ok{color:#0b493b!important;font-weight:700}","      +'.k4b-crew-off{margin-top:12px;border:1px solid #e3ebe7;border-radius:12px;padding:10px 12px;background:#fff}.k4b-crew-off>b{font-size:12px;color:var(--g)}'\n      +'.k4b-crew-ai{margin-top:10px;font-size:11.5px;color:#667;line-height:1.7}'\n      +'.k928-ok{color:#0b493b!important;font-weight:700}")
R('miles sim expose',"  window.kgmMilesRiskR929=milesRiskR929;\n  function milesSimR929(){","  window.kgmMilesRiskR929=milesRiskR929;\n  window.kgmMilesSimR1004B=function(){try{return milesSimR929()}catch(_){return 0}};   /* 1004B：後台 AI 總覽用 */\n  function milesSimR929(){")
open('p_g_ai.js','w').write(hdr+'\n'.join(out)+'\n')

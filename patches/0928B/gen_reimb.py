import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
snip=open('snip_reimb.js').read()
hdr='''/* 0928B · 員工報銷（幣別、金額、收據照片，CEO 核准後併入當月薪資）—— 詳見 r229 內的說明 */
'''
R('reimb salaryOf',
"""  return{base:base,yrs:yrs,sen:sen,perf:perf,bonus:bonus,adj:adj,restWork:rw,restPay:rpay,holidayPay:hpay,restNext:rn,restNextPay:npay,monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay,items:items};""",
"""  /* 0928B：CEO 核准的報銷，併入核准當月 */
  var reimb=0,reimbItems=[];(S.reimbR928||[]).forEach(function(r){if(r&&r.empId===stf.empId&&r.status==='approved'&&r.payMonth===todayISO().slice(0,7)){reimb+=(+r.twd||0);reimbItems.push(r)}});
  return{base:base,yrs:yrs,sen:sen,perf:perf,bonus:bonus,adj:adj,restWork:rw,restPay:rpay,holidayPay:hpay,restNext:rn,restNextPay:npay,reimb:reimb,reimbItems:reimbItems,monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay+reimb,items:items};""")
R('reimb emp row',
"""            ${sal.adj?`<tr><td>CEO 調整</td><td style="text-align:right">${sal.adj>0?"+":""}NT$ ${sal.adj.toLocaleString()}</td></tr>`:""}""",
"""            ${sal.adj?`<tr><td>CEO 調整</td><td style="text-align:right">${sal.adj>0?"+":""}NT$ ${sal.adj.toLocaleString()}</td></tr>`:""}
            ${sal.reimb?`<tr><td>員工報銷（CEO 已核准，本月入帳 ${sal.reimbItems.length} 筆）</td><td style="text-align:right">+ NT$ ${sal.reimb.toLocaleString()}</td></tr>`:""}""")
R('reimb emp panel',
"""'<div style="color:#889;font-size:13px">無功過記錄。</div>'}</div>`;""",
"""'<div style="color:#889;font-size:13px">無功過記錄。</div>'}</div>`;
        try{body+=window.kgmReimbPanelR928?window.kgmReimbPanelR928(_meS):''}catch(_){}   /* 0928B：員工報銷 */""")
R('reimb ceo panel',
"""      <div class="adm-card"><div style="font-weight:700;margin-bottom:8px">全員薪資總表（AI 依 底薪×年資×績效＋功獎金＋休息日出勤加給 計算）</div>
      <div style="overflow-x:auto"><table class="adm-tbl"><tr><th>員工</th><th>職務</th><th>年資</th><th>底薪</th><th>績效</th><th>功獎金</th><th>功過</th><th>CEO調整</th><th>休息日加給</th><th style="text-align:right">本月薪資</th></tr>""",
"""      ${window.kgmReimbPanelR928?window.kgmReimbPanelR928(null):""}
      <div class="adm-card"><div style="font-weight:700;margin-bottom:8px">全員薪資總表（AI 依 底薪×年資×績效＋功獎金＋休息日出勤加給＋報銷 計算）</div>
      <div style="overflow-x:auto"><table class="adm-tbl"><tr><th>員工</th><th>職務</th><th>年資</th><th>底薪</th><th>績效</th><th>功獎金</th><th>功過</th><th>CEO調整</th><th>休息日加給</th><th>報銷</th><th style="text-align:right">本月薪資</th></tr>""")
R('reimb ceo cell',
"""<td style="font-size:11.5px">'+(restCell927C(sal)||'—')+'</td><td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+'</td></tr>';}).join("");
          return '<tr style="background:linear-gradient(180deg,#eef4f0,#e6eeea)"><td colspan="9" """,
"""<td style="font-size:11.5px">'+(restCell927C(sal)||'—')+'</td><td style="font-size:11.5px">'+(sal.reimb?('+'+sal.reimb.toLocaleString()):'—')+'</td><td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+'</td></tr>';}).join("");
          return '<tr style="background:linear-gradient(180deg,#eef4f0,#e6eeea)"><td colspan="10" """)
RL('reimb helpers','kgm-0909E-r229',
"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""",
snip+"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""")
open('p_e_reimb.js','w').write(hdr+'\n'.join(out)+'\n')

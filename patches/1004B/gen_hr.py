import json,base64
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 員工管理辦法 PDF（後台右上角）＋年終獎金（固定五個月＋績效月數） */\n'
b64=base64.b64encode(open('pdf/KGM-HR-001.pdf','rb').read()).decode()
js=('''/* ══ 1004B 員工管理辦法（PDF，內嵌） ══════════════════════════════
   使用者：「後台除了員工票管理辦法也要有員工管理辦法所以右上方PDF加入員工管理辦法」。
   KGM-HR-001 Rev.A，與 KGM-STX-015 同一版型；右上角第二顆小按鈕，開法與員工票管理辦法相同。 */
window.KGM_EMP_POLICY_META_R1004B={id:'KGM-HR-001',title:'員工管理辦法',en:'Employee Management Regulations',
  ver:'2026.10（Rev. A）',eff:'2026-10-05',pages:13,arts:32,owner:'人力資源處',approver:'董事長',issued:'2026-10-02',
  file:'16_KGM_員工管理辦法.pdf'};
window.KGM_EMP_POLICY_PDF_R1004B='data:application/pdf;base64,'''+b64+'''';
window.kgmEmpPolicyOpenR1004B=function(){
  try{
    if(!window._empPolicyUrlR1004B){
      var bin=atob(String(window.KGM_EMP_POLICY_PDF_R1004B).split(',')[1]||''),n=bin.length,a=new Uint8Array(n);
      for(var i=0;i<n;i++)a[i]=bin.charCodeAt(i);
      window._empPolicyUrlR1004B=URL.createObjectURL(new Blob([a],{type:'application/pdf'}));
    }
    var w=window.open(window._empPolicyUrlR1004B,'_blank','noopener');if(!w)location.href=window._empPolicyUrlR1004B;
  }catch(_){try{location.href=window.KGM_EMP_POLICY_PDF_R1004B}catch(__){}}
};
window.kgmEmpPolicyChipR1004B=function(){
  var Z=z();
  return '<button type="button" class="k914-polchip" title="'+(Z?'開啟《員工管理辦法》PDF':'Open the Employee Management Regulations (PDF)')
    +'" onclick="kgmEmpPolicyOpenR1004B()">'
    +'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.6h7.2L16 6.4V17a.9.9 0 0 1-.9.9H5a.9.9 0 0 1-.9-.9V3.5A.9.9 0 0 1 5 2.6Z"/>'
    +'<path class="fold" d="M12.2 2.6 16 6.4h-3.8Z"/><rect x="6.3" y="9.2" width="7.4" height="1.15" rx=".57"/>'
    +'<rect x="6.3" y="11.9" width="5.4" height="1.15" rx=".57"/></svg>'
    +'<span>'+(Z?'員工管理辦法':'Employee Regulations')+'</span>'
    +'<em>PDF</em></button>';
};
window.kgmStxPolicyBlobR914=function(){''')
R('emp policy pdf',"window.kgmStxPolicyBlobR914=function(){",js)
R('emp policy chip',"+(typeof window.kgmStxPolicyChipR914==='function'?window.kgmStxPolicyChipR914():'')+'</div></header>",
  "+(typeof window.kgmStxPolicyChipR914==='function'?window.kgmStxPolicyChipR914():'')+(typeof window.kgmEmpPolicyChipR1004B==='function'?window.kgmEmpPolicyChipR1004B():'')+'</div></header>")
# 年終獎金
R('ye salaryOf',"monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay+reimb,items:items};",
"""monthly:Math.round(base*sen*perf)+bonus+adj+rpay+hpay+reimb,items:items,
    /* 1004B：年終獎金＝月薪基數（底薪×年資係數）×（固定 5 個月＋績效月數）×當年度在職月數÷12，次年一月發給，不併入本月。
       績效月數：嘉獎+0.1／小功+0.3／大功+1.0／警告−0.1／小過−0.3／大過−1.0，當年度合計，最低 0、最高 3（《員工管理辦法》第 20、21 條） */
    yearEndPerf:yePerfR1004B,yearEndMonths:5,yearEndPro:yeProR1004B,yearEnd:Math.round(base*sen*(5+yePerfR1004B)*yeProR1004B)};""")
R('ye calc',"  var perf=Math.max(0.6,1+pct/100);// 績效下限 60%",
"""  var perf=Math.max(0.6,1+pct/100);// 績效下限 60%
  var YEM1004B={award1:0.1,award2:0.3,award3:1,warn1:-0.1,warn2:-0.3,warn3:-1},yePerfR1004B=0;   /* 1004B：年終績效月數 */
  items.forEach(function(m){yePerfR1004B+=YEM1004B[m.type]||0});
  yePerfR1004B=Math.max(0,Math.min(3,Math.round(yePerfR1004B*10)/10));
  var yeProR1004B=1;try{var hd1004B=String(stf.hireDate||'');if(hd1004B.slice(0,4)===yr)yeProR1004B=Math.max(1,12-(+hd1004B.slice(5,7))+1)/12;else if(hd1004B.slice(0,4)>yr)yeProR1004B=0}catch(_){}""")
R('ye own row','<tr style="font-weight:900;color:var(--g)"><td>本月薪資</td><td style="text-align:right;font-size:16px">NT$ ${sal.monthly.toLocaleString()}</td></tr>',
'<tr style="font-weight:900;color:var(--g)"><td>本月薪資</td><td style="text-align:right;font-size:16px">NT$ ${sal.monthly.toLocaleString()}</td></tr>'
'\n            <tr style="color:#7a5d1f;background:#fbf7ec"><td><b>年終獎金（本年度預估，次年一月發給，不含在本月薪資）</b><div style="font-size:11px;line-height:1.8;color:#7b6a45">月薪基數 NT$ ${Math.round(sal.base*sal.sen).toLocaleString()} ×（固定 5 個月 ＋ 績效 ${sal.yearEndPerf.toFixed(1)} 個月）${sal.yearEndPro<1?\'× 在職 \'+Math.round(sal.yearEndPro*12)+\'/12\':\'\'}<br>績效月數：嘉獎 +0.1・小功 +0.3・大功 +1.0・警告 −0.1・小過 −0.3・大過 −1.0，本年度合計 0～3 個月（《員工管理辦法》第 20 條）</div></td><td style="text-align:right;font-weight:900;font-size:15px">NT$ ${sal.yearEnd.toLocaleString()}</td></tr>')
R('ye ceo th','<th>報銷</th><th style="text-align:right">本月薪資</th>','<th>報銷</th><th style="text-align:right">本月薪資</th><th style="text-align:right">年終獎金（預估）</th>')
R('ye ceo td',"""<td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+'</td></tr>';}).join("");""",
"""<td style="text-align:right;font-weight:800;color:var(--g)">NT$ '+sal.monthly.toLocaleString()+'</td><td style="text-align:right;white-space:nowrap;color:#7a5d1f"><b>NT$ '+sal.yearEnd.toLocaleString()+'</b><div style="font-size:10px;color:#9a8a66">5 ＋ '+sal.yearEndPerf.toFixed(1)+' 個月'+(sal.yearEndPro<1?'・在職 '+Math.round(sal.yearEndPro*12)+'/12':'')+'</div></td></tr>';}).join("");""")
R('ye ceo colspan','<td colspan="10" style="font-weight:900;color:var(--g);font-size:12.5px','<td colspan="11" style="font-weight:900;color:var(--g);font-size:12.5px')
R('ye ceo rule',"同年度功過可相抵於績效與獎金各自計算",
  "<b>年終獎金</b>:月薪基數(底薪×年資係數)×(固定 5 個月＋績效月數),績效月數 嘉獎 +0.1/小功 +0.3/大功 +1.0/警告 −0.1/小過 −0.3/大過 −1.0,本年度合計 0～3 個月,次年一月發給(《員工管理辦法》第 20、21 條)。<br>同年度功過可相抵於績效與獎金各自計算")
R('ye ceo title',"全員薪資總表（AI 依 底薪×年資×績效＋功獎金＋休息日出勤加給＋報銷 計算）","全員薪資總表（AI 依 底薪×年資×績效＋功獎金＋休息日出勤加給＋報銷 計算；年終獎金另列，次年一月發給）")
open('p_g_hr.js','w').write(hdr+'\n'.join(out)+'\n')

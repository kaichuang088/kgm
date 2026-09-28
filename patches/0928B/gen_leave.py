import json
out=[]
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
hdr='/* 0928B · 請假申請書正式化＋多張證明照片（說明見 r229 內） */\n'
R('leave form',"    <div class=\"adm-card\">\n      <div style=\"display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px\">\n        <input class=\"inp\" value=\"${S.adminUser?S.adminUser.name+\"（\"+S.adminUser.empId+\"）\":\"\"}\" disabled style=\"background:#f4f7f5;color:#556\">\n        <select class=\"inp\" onchange=\"S._lvType=this.value\">${[[\"annual\",\"特休\"],[\"sick\",\"病假\"],[\"personal\",\"事假\"],[\"menstrual\",\"生理假\"]].map(function(t){return '<option value=\"'+t[0]+'\"'+((S._lvType||\"annual\")===t[0]?\" selected\":\"\")+'>'+t[1]+'</option>';}).join(\"\")}</select>\n        <input type=\"date\" class=\"inp\" title=\"結束日\" value=\"${S._lvEnd||todayISO()}\" oninput=\"S._lvEnd=this.value\">\n      </div>\n      <div style=\"display:grid;grid-template-columns:1fr 2fr;gap:8px;margin-top:8px\">\n        <input type=\"date\" class=\"inp\" value=\"${S._lvStart||todayISO()}\" oninput=\"S._lvStart=this.value\">\n        <input class=\"inp\" placeholder=\"事由（必填）\" value=\"${S._lvReason||\"\"}\" oninput=\"S._lvReason=this.value\">\n      </div>\n      <button class=\"btn btn-g\" style=\"margin-top:10px\" onclick=\"doFileLeave2()\">送出請假申請</button>\n      ${S._lvMsg?`<div class=\"chip chip-ok\" style=\"margin-top:8px\">${S._lvMsg}</div>`:\"\"}\n    </div>","    ${window.kgmLeaveFormR928?window.kgmLeaveFormR928():\"\"}")
R('leave file photos',
"""  S.leave.unshift({caseNo:caseNo,empId:empId,empName:st.name,type:type,days:days,start:start,end:end,reason:reason,status:"pending",filed:todayISO(),filedAt:new Date().toISOString().slice(0,16).replace("T"," ")});""",
"""  S.leave.unshift({caseNo:caseNo,empId:empId,empName:st.name,type:type,days:days,start:start,end:end,reason:reason,status:"pending",filed:todayISO(),filedAt:new Date().toISOString().slice(0,16).replace("T"," "),
    proxy:S._lvProxy||"",photos:((window.__lvDraft928||{}).photos||[]).slice()});   /* 0928B：代理人＋多張證明照片 */
  window.__lvDraft928={photos:[]};S._lvReason="";S._lvProxy="";""")
R('leave list photos',
"""        +'<div style="font-size:12px;color:#334;margin-top:5px;padding:7px 9px;background:#f7faf8;border-left:3px solid var(--g);border-radius:0 6px 6px 0"><b>員工事由：</b>'+(l.reason||"（未填）")+'</div>'""",
"""        +'<div style="font-size:12px;color:#334;margin-top:5px;padding:7px 9px;background:#f7faf8;border-left:3px solid var(--g);border-radius:0 6px 6px 0"><b>員工事由：</b>'+(l.reason||"（未填）")+'</div>'
        +(window.kgmLeavePhotosR928?window.kgmLeavePhotosR928(i):'')""")
snip=open('snip_leave.js').read()
RL('leave helpers','kgm-0909E-r229',
"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""",
snip+"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""")
RL('cabin dept','kgm-0903b-r123',
"""  var d=u.dept||u.department||u.role||'';
  return String(d||'staff').toLowerCase();""",
"""  var d=u.dept||u.department||u.role||'';
  d=String(d||'staff').toLowerCase();
  return d==='cabin'?'crew':d;   /* 0928B：空服員帳號 role 是 cabin，權限表的部門叫 crew；沒對上會讓 260 位空服員連請假／班表都未解鎖 */""")
open('p_e_leave.js','w').write(hdr+'\n'.join(out)+'\n')

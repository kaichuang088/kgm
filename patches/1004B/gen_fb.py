import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 客人回饋 → 旅客回饋；組員表揚／申訴與一鍵績效 */\n'
R('fb label tabs',"['feedback_r48','客人回饋']","['feedback_r48','旅客回饋']",2)
R('fb label subnav',"['feedback','客人回饋']","['feedback','旅客回饋']",3)
R('fb label btn',"b.textContent=z()?'客人回饋':'Customer feed","b.textContent=z()?'旅客回饋':'Customer feed")
R('fb label kill re',"里程購買審查|客人回饋|KGM 航空新聞","里程購買審查|客人回饋|旅客回饋|KGM 航空新聞")
R('fb crew emp',"        if(cb.length)crew=(cb[h%cb.length]||{}).name||'';","        if(cb.length){crew=(cb[h%cb.length]||{}).name||'';x.crewEmpR1004B=(cb[h%cb.length]||{}).empId||''}   /* 1004B：一併記員工編號，表揚／申訴才能直接登錄績效 */",2)
R('fb panel',"function feedback49(){var a=filtFeedback49();return '<section class=\"r49-feedback\">",open('fb.js',encoding='utf-8').read()+"function feedback49(){var a=filtFeedback49();return fbCrew1004B()+'<section class=\"r49-feedback\">")
css=[
"'.k4b-fb{border:1px solid #e6e0d0;border-radius:18px;background:#fff;overflow:hidden;margin:0 0 18px}',",
"'.k4b-fb-head{padding:20px 24px;border-bottom:1px solid #efeadc;background:linear-gradient(180deg,#fbf9f3,#f7f4ea)}',",
"'.k4b-fb-head small{display:block;font-size:9.5px;letter-spacing:.2em;color:#b39b5e;font-weight:800}',",
"'.k4b-fb-head h2{margin:4px 0 0;font:800 21px Georgia,serif;color:#0a4537}',",
"'.k4b-fb-head p{margin:8px 0 0;font-size:11.5px;color:#7b837d;line-height:1.85;max-width:760px}',",
"'.k4b-fb-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}',",
"'.k4b-fb-col{padding:16px 20px}.k4b-fb-col.p{border-right:1px solid #f0ebde}',",
"'.k4b-fb-col h3{margin:0 0 10px;font-size:14px;font-weight:900;display:flex;align-items:center;gap:8px}',",
"'.k4b-fb-col.p h3{color:#0a4537}.k4b-fb-col.c h3{color:#9b1f18}',",
"'.k4b-fb-col h3 span{font:900 11px system-ui;color:#fff;border-radius:999px;padding:1px 9px;background:#0a4537}.k4b-fb-col.c h3 span{background:#9b1f18}',",
"'.k4b-fb-col h3 i{font-style:normal;font-size:10.5px;color:#a88240;font-weight:800;margin-left:auto}',",
"'.k4b-fb-it{border:1px solid #ebe6d9;border-left:4px solid #1f9d63;border-radius:11px;padding:10px 12px;margin:0 0 8px;background:#fff}',",
"'.k4b-fb-it.complaint{border-left-color:#c0392b}.k4b-fb-it.done{opacity:.62}',",
"'.k4b-fb-it header{display:flex;align-items:baseline;gap:8px}.k4b-fb-it header b{font-size:13px;color:#1e2b26}.k4b-fb-it header small{font:600 10.5px ui-monospace,Menlo,monospace;color:#7b837d}',",
"'.k4b-fb-sc{margin-left:auto;font-size:10.5px;font-weight:900;color:#5d6a64;background:#f3f1ea;border-radius:999px;padding:1px 9px}',",
"'.k4b-fb-it p{margin:6px 0 8px;font-size:12px;color:#33413b;line-height:1.7}.k4b-fb-it p i{color:#9aa19c}',",
"'.k4b-fb-it footer{display:flex;align-items:center;gap:8px;font-size:10.5px;color:#7b837d}.k4b-fb-it footer .btn,.k4b-fb-it footer em{margin-left:auto}.k4b-fb-it footer em{font-style:normal;font-weight:800;color:#a88240}',",
"'.k4b-fb-neg{border-color:#e9b8b3!important;color:#b3261e!important;background:#fff!important}',",
"'.k4b-fb-none,.k4b-fb-more{padding:16px;text-align:center;font-size:11.5px;color:#8a938d}',",
"'@media(max-width:900px){.k4b-fb-cols{grid-template-columns:1fr}.k4b-fb-col.p{border-right:0;border-bottom:1px solid #f0ebde}}',",
]
RL('fb css','kgm-0816d-r40',"'.r40-moved{font-size:11.5px","\n".join(css)+"\n'.r40-moved{font-size:11.5px")
R('fb sim neg list',"var FB_TXT_K=[","/* 1004B：模擬問卷補上「對組員的抱怨」（約 6%，空服員評分 1–2 分），表揚／申訴兩邊都看得到 */\nvar FB_NEG_K1004B=['空服員態度冷淡，按服務鈴很久才來。','組員對詢問愛理不理，口氣不太好。','座艙長處理座位問題態度不耐煩。','空服員送餐時很敷衍，飲料也忘了補。'];\nvar FB_TXT_K=[")
R('fb sim neg use',"            overall:3+(h%3),meal:2+((h>>>3)%4),crew:3+((h>>>6)%3),","            overall:3+(h%3),meal:2+((h>>>3)%4),crew:(((h>>>21)%16)===0?1+((h>>>6)%2):3+((h>>>6)%3)),")
R('fb sim neg txt',"            crewMember:'',crewPendingR923:h,comment:FB_TXT_K[(h>>>18)%FB_TXT_K.length],","            crewMember:'',crewPendingR923:h,comment:(((h>>>21)%16)===0?FB_NEG_K1004B[(h>>>18)%FB_NEG_K1004B.length]:FB_TXT_K[(h>>>18)%FB_TXT_K.length]),")
open('p_g_fb.js','w').write(hdr+'\n'.join(out)+'\n')

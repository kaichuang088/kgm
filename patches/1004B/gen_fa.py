import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 財務與航網 → 票價分析（每航線每航班） */\n'
L40='kgm-0816d-r40'
RL('fa fns',L40,"window.kgmSbSimDecideR929=function(id,how){",open('fare_ana.js',encoding='utf-8').read()+"window.kgmSbSimDecideR929=function(id,how){")
R('fa side',"['財務與航網',[['finance','營收分析'],['price','票價管理']]]","['財務與航網',[['finance','營收分析'],['price','票價管理'],['fareana','票價分析']]]",2)
R('fa route',"else if(tab==='stxstatus')body=","else if(tab==='fareana')body=(typeof window.kgmFareAnaPageR1004B==='function'?window.kgmFareAnaPageR1004B():'');else if(tab==='stxstatus')body=")
J123='kgm-0903b-r123'
RL('fa perm backend',J123,"news_r49:'use',notify:'use',coupons:'use',finance:'view',price:'view',","news_r49:'use',notify:'use',coupons:'use',finance:'view',price:'view',fareana:'view',")
RL('fa perm pricing',J123,"  pricing:{price:'use',finance:'use',","  pricing:{price:'use',finance:'use',fareana:'use',")
R('fa role tabs','ROLE_TABS.pricing=["price","finance",','ROLE_TABS.pricing=["price","finance","fareana",')
css=[
"'.k4b-fa-sel{width:170px!important;text-transform:none!important}',",
"'.k4b-fa-xls{margin-left:auto}',",
"'.k4b-fa-sec{padding:18px 24px;border-bottom:1px solid #f2eee2}.k4b-fa-sec:last-child{border-bottom:0}',",
"'.k4b-fa-sec>h3{margin:0 0 12px;font:800 15px Georgia,\"Noto Serif TC\",serif;color:#0a4537}.k4b-fa-sec>h3 small{font:600 11px system-ui;color:#8a938d;margin-left:8px;letter-spacing:.04em}',",
"'.k4b-fa-empty{padding:22px;text-align:center;font-size:12px;color:#8a938d;border:1px dashed #e6e0d0;border-radius:12px}',",
"'.k4b-fa-ovw{max-height:372px;overflow:auto;border:1px solid #f0ebde;border-radius:12px}.k4b-fa-ovw thead th{position:sticky;top:0;z-index:1}',",
"'.k4b-fa-ov{min-width:860px}.k4b-fa-ov tbody tr{cursor:pointer}.k4b-fa-ov tr.on td{background:#eef4f0}.k4b-fa-go{color:#a88240;font-weight:800;text-align:right;white-space:nowrap}',",
"'.k4b-fa-hol{display:inline-block;font-size:10.5px;font-weight:800;color:#8a5a00;background:#fbf0d6;border-radius:999px;padding:2px 9px;white-space:nowrap}',",
"'.k4b-fa-key{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:11px;color:#7b837d;margin:0 0 12px}.k4b-fa-key .k4b-fa-b{min-width:0;padding:2px 9px}.k4b-fa-key .k4b-fa-b i{font-size:10px}',",
"'.k4b-fa-card{border:1px solid #e9e4d6;border-radius:14px;margin:0 0 14px;overflow:hidden;background:#fff}',",
"'.k4b-fa-card>header{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;padding:12px 16px;background:#fbfaf5;border-bottom:1px solid #f0ebde}',",
"'.k4b-fa-card>header>div:first-child{display:flex;flex-direction:column;gap:2px;min-width:190px}.k4b-fa-card>header>div:first-child b{font-size:16px;color:#0a4537}.k4b-fa-card>header>div:first-child span{font-size:12px;color:#1e2b26;font-weight:700}.k4b-fa-card>header>div:first-child small{font-size:10.5px;color:#8a938d}',",
"'.k4b-fa-kpi{display:flex;flex-wrap:wrap;gap:6px 0;flex:1}.k4b-fa-kpi span{padding:0 14px;border-left:1px solid #ece7da}.k4b-fa-kpi i{display:block;font-style:normal;font-size:9px;letter-spacing:.08em;font-weight:900;color:#8a938d}.k4b-fa-kpi b{font:800 14px Georgia,serif;color:#0a4537;white-space:nowrap}.k4b-fa-kpi b small{font:700 10.5px system-ui;color:#8a938d}.k4b-fa-kpi b.h{font:inherit}',",
"'.k4b-fa-t{width:100%;border-collapse:collapse;min-width:900px}.k4b-fa-t td{padding:10px 14px;border-top:1px solid #f4f0e6;vertical-align:middle}.k4b-fa-t tr:first-child td{border-top:0}',",
"'.k4b-fa-cab{width:150px;white-space:nowrap}.k4b-fa-cab b{font-size:12.5px;color:#1e2b26}',",
"'.k4b-fa-low{width:140px;text-align:right;white-space:nowrap}.k4b-fa-low b{font:800 15px Georgia,serif;color:#0a4537}.k4b-fa-low b.r{color:#9b1f18}',",
"'.k4b-fa-ladder{display:flex;flex-wrap:wrap;gap:6px}',",
"'.k4b-fa-b{display:inline-flex;flex-direction:column;min-width:84px;border:1px solid #e3ded0;border-radius:9px;padding:5px 9px;background:#fff;line-height:1.35}',",
"'.k4b-fa-b i{font:900 10.5px ui-monospace,Menlo,monospace;font-style:normal;color:#5d6a64;display:flex;justify-content:space-between;gap:6px}.k4b-fa-b i em{font:700 9px system-ui;font-style:normal;color:#a39d8f}',",
"'.k4b-fa-b b{font:800 13px Georgia,serif;color:#1e2b26}.k4b-fa-b small{font-size:9.5px;color:#8a938d;font-weight:700}',",
"'.k4b-fa-b.sell{background:#e4f1ea;border-color:#9cc9b0}.k4b-fa-b.sell i,.k4b-fa-b.sell b{color:#0a4537}.k4b-fa-b.sell small{color:#1f7a50}',",
"'.k4b-fa-b.next{background:#fff;border-style:dashed}',",
"'.k4b-fa-b.closed,.k4b-fa-b.held{background:#f6f4ef;border-color:#ebe7dd}.k4b-fa-b.closed b,.k4b-fa-b.held b{color:#b0a99a;text-decoration:line-through;text-decoration-color:rgba(176,169,154,.6)}.k4b-fa-b.closed i,.k4b-fa-b.held i{color:#b0a99a}',",
"'.k4b-fa-svg{width:100%;height:230px;display:block}.k4b-fa-svg .gl{stroke:#efeadc;stroke-width:1}.k4b-fa-svg .yl{font:600 10px system-ui;fill:#9aa19c;text-anchor:end}.k4b-fa-svg .xl{font:600 10px system-ui;fill:#9aa19c;text-anchor:middle}',",
"'.k4b-fa-leg{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:8px;font:800 11px ui-monospace,Menlo,monospace;color:#1e2b26}.k4b-fa-leg i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}',",
"'@media(max-width:760px){.k4b-fa-sec{padding:14px 16px}.k4b-fa-xls{margin-left:0}}',",
]
RL('fa css',L40,"'.r40-moved{font-size:11.5px","\n".join(css)+"\n'.r40-moved{font-size:11.5px")
open('p_g_fa.js','w').write(hdr+'\n'.join(out)+'\n')

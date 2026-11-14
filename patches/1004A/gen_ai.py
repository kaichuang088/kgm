import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 後台通用 AI（Claude Opus 5.5），取代舊的組員排班 AI 卡片 */
'''
LY='kgm-0909E-r229'
A='/* ══ 0922B：競標資料 —— 每一班都要有人競標'
ai=open('ai_admin.js',encoding='utf-8').read()
RL('#67 後台 AI 引擎與介面',LY,A,ai+A)
old=open('/tmp/j/crewai_old.txt',encoding='utf-8').read()
new=("        +'<section><h4>'+(window.KGM_CLAUDE_MARK_R929||'').replace('width=\"26\" height=\"26\"','width=\"16\" height=\"16\" style=\"vertical-align:-2px\"')+' '+(Z()?'後台 AI（Claude Opus 5.5）':'Admin AI (Claude Opus 5.5)')+'</h4>'\n"
     "          +'<p>'+(Z()?'舊的「AI 換班」已換成後台 AI：換班、調整票價、特殊票價規則、連假、換機、新聞、優惠碼… 直接跟右下角的後台 AI 說，它會依你的職務權限直接處理；沒有權限的事會回覆「無權限」。換班會先列出至少三位候選，再模擬整趟對調，回覆「核准換班」才寫入班表並通知。':'The old AI swap is replaced by the Admin AI (bottom right). It acts within your role permissions.')+'</p>'\n"
     "          +'<div class=\"k928-ct-act\"><button class=\"btn btn-g btn-sm\" onclick=\"kgmAdminAiOpenR929(\\'K60012 10/12 想換到東京的班\\')\">'+(Z()?'開啟後台 AI':'Open Admin AI')+'</button></div>'\n"
     "        +'</section>'\n")
RL('#67 舊 AI 換班卡片 → 後台 AI',LY,old,new)
RL('#67 票價分頁列出特殊票價規則','kgm-0819e-r49',"""'</tbody></table><button class="btn btn-g" onclick="kgmSaveFareRulesG()">儲存票價規則</button></section>'}""","""'</tbody></table><button class="btn btn-g" onclick="kgmSaveFareRulesG()">儲存票價規則</button></section>'+(window.kgmFareRuleSecR929?window.kgmFareRuleSecR929():'')}   /* 1004A：特殊票價規則 */""")
open('p_f_ai.js','w').write(hdr+'\n'.join(out)+'\n')

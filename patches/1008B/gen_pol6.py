from common import *
import pol6
# ══ 1006A #8：規章（網站內嵌條文）加入 1004B＋1006A 兩輪的規則 —— 與 ZIP 內的 PDF 同一份資料（pol6.py） ══
#   改的文件：RES-002、CHG-003、FFP-011、AWD-012、PRV-014（Rev. B）、STX-015（Rev. C）；其餘 10 份與 RSB-016 不動。
#   這幾份的條文前面的 patch 已改過一部分（miles6 的卡等門檻、stby6 的員工票候補順位），所以整份條目以「本輪前面各 patch 之後」
#   的內容為比對基準（docs_r914.json 是從建好的檔案取出來的），放在 list.txt 最後；比對數量對不上 pf.js 就中止。
docs = json.load(open('docs_r914.json', encoding='utf-8'))
new = pol6.build(docs)
CUR = open('/tmp/j/kgm1006A_w49.html', encoding='utf-8').read()   # 本 patch 之前的建置結果（只用來檢查比對字串）
L = CUR.index('<script id="kgm-0831c-r86"'); L = CUR[L:CUR.index('</script>', L)]
for k, d in new.items():
    old = '"%s":%s' % (k, json.dumps(docs[k], ensure_ascii=False, separators=(',', ':')))
    nw = '"%s":%s' % (k, json.dumps(d, ensure_ascii=False, separators=(',', ':')))
    assert L.count(old) == 1, k
    out.append('RL(%s,%s,%s,%s,1);' % (J('policy ' + k), J('kgm-0831c-r86'), J(old), J(nw)))

# ── 後台票務工作台的說明文字跟著規則（部分航段退票按段數比例收手續費；前台官網退票本來就只能整筆退，r94）──
RL('r114 workbench refund text', 'kgm-0903b-r114',
   "'定位管理、資料驗證之間跳來跳去。退票手續費 NT$4,800 只有整筆訂單退票才會扣，'\n      +'部分航段退票不收。'",
   "'定位管理、資料驗證之間跳來跳去。退票手續費依整筆訂位最高的票價方案收一次（例如 NT$4,800），'\n      +'只退部分航段時按退的段數比例收（三段退一段收 NT$1,600）。'   /* 1006A：與 KGM-CHG-003 一致 */")
RL('r55 staff standby order text', 'kgm-0823c-r55',
   "實際是否登機以櫃檯依順位（職務、年資、申請時間）辦理為準",
   "實際是否登機以櫃檯依順位（方案與年資同權計分，再依艙等、申請時間）辦理為準")

# ── 後台右上角內嵌的兩份 PDF（員工票管理辦法 Rev. C、員工管理辦法 Rev. B）換成同一版型的新版 ──
import base64
SRC6 = SRC
def b64(p): return 'data:application/pdf;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def pages(p):
    import pypdf; return len(pypdf.PdfReader(p).pages)
for var, pdf in (('KGM_STX_POLICY_PDF_R914', 'pol/KGM-STX-015.pdf'), ('KGM_EMP_POLICY_PDF_R1004B', 'pol/KGM-HR-001.pdf')):
    a = SRC6.index("window.%s='" % var) + len("window.%s='" % var); e = SRC6.index("'", a)
    RL('pdf ' + var, 'kgm-0831c-r86', SRC6[a:e], b64(pdf))
RL('stx pdf meta', 'kgm-0831c-r86',
   "  en:'Staff Travel Policy',ver:'2026.09（Rev. B）',eff:'2026-09-14',pages:10,arts:29,\n  owner:'人力資源處　員工旅遊組',approver:'董事長',issued:'2026-09-05',\n  file:'15_KGM_員工票管理辦法.pdf'};",
   "  en:'Staff Travel Policy',ver:'2026.10（Rev. C）',eff:'2026-10-06',pages:%d,arts:29,\n  owner:'人力資源處　員工旅遊組',approver:'董事長',issued:'2026-10-05',\n  file:'15_KGM_員工票管理辦法.pdf'};   /* 1006A：Rev. C（與 KGM_Policies 同一份） */" % pages('pol/KGM-STX-015.pdf'))
RL('hr pdf meta', 'kgm-0831c-r86',
   "  ver:'2026.10（Rev. A）',eff:'2026-10-05',pages:13,arts:32,owner:'人力資源處',approver:'董事長',issued:'2026-10-02',\n  file:'16_KGM_員工管理辦法.pdf'};",
   "  ver:'2026.10（Rev. B）',eff:'2026-10-06',pages:%d,arts:32,owner:'人力資源處',approver:'董事長',issued:'2026-10-05',\n  file:'17_KGM_員工管理辦法.pdf'};   /* 1006A：Rev. B；彙編第 16 份改為 KGM-RSB-016 */" % pages('pol/KGM-HR-001.pdf'))
save('p_h_pol.js', '/* 1006A · 規章條文加入 1004B＋1006A 規則（與 ZIP 內 PDF 同一份）＋說明文字與規則一致 */\n')

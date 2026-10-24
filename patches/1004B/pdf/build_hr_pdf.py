# 1004B：《員工管理辦法》KGM-HR-001 —— 與《員工票管理辦法》KGM-STX-015 同一版型（WeasyPrint＋思源黑體／宋體）
# 用法：python3 build_hr_pdf.py <fontsource 目錄> <輸出.pdf>
import sys, os, re, glob
FNT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/fnt'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'KGM-HR-001.pdf'
MF = sys.argv[3] if len(sys.argv) > 3 else ''
def fontcss():
    # WeasyPrint 只吃到 fontsource 第一個 unicode-range 子集 → 先用 mkfont.py 把用到的子集合併成單一 TTF（第三個參數）
    if MF:
        return '\n'.join("@font-face{font-family:'%s';font-weight:%s;src:url(file://%s/%s-%s.ttf)}" % (f, w, os.path.abspath(MF), f.replace(' ', ''), w)
                         for f in ('Noto Sans TC', 'Noto Serif TC') for w in ('400', '700'))
    css = []
    for fam, pkg in (('Noto Sans TC', 'noto-sans-tc'), ('Noto Serif TC', 'noto-serif-tc')):
        d = glob.glob(os.path.join(FNT, 'fontsource-%s-*' % pkg))
        d = [x for x in d if os.path.isdir(x)][0]
        for w in ('400', '700'):
            t = open(os.path.join(d, w + '.css'), encoding='utf-8').read()
            t = re.sub(r"url\(\./files/([^)]+)\)", lambda m: "url(file://%s/files/%s)" % (d, m.group(1)), t)
            t = re.sub(r",\s*url\(file://[^)]+\.woff\) format\('woff'\)", '', t)
            css.append(t)
    return '\n'.join(css)

META = dict(id='KGM-HR-001', title='員工管理辦法', en='Employee Management Regulations', ver='2026.10（Rev. A）',
            approved='2026-10-02', eff='2026-10-05', prev='—（首次發布）', owner='人力資源處', approver='董事長',
            level='內部規章（Internal）', keep='永久保存（電子檔）', scope='本公司全體在職員工（含飛行員、客艙組員、地勤、客服、後台、定價及系統人員）。')

CH = []  # (章名, [(條名, html)])
def ch(name): CH.append((name, []))
def art(name, *paras): CH[-1][1].append((name, ''.join(paras)))
def p(t): return '<p>' + t + '</p>'
def ol(*items):
    n = '一二三四五六七八九十'
    return ''.join('<div class="li"><b>%s、</b><span>%s</span></div>' % (n[i], x) for i, x in enumerate(items))
def table(cap, head, rows):
    return ('<div class="cap">%s</div><table class="t"><thead><tr>%s</tr></thead><tbody>%s</tbody></table>'
            % (cap, ''.join('<th>%s</th>' % h for h in head), ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % c for c in r) for r in rows)))

ch('總則')
art('制定目的', p('為建立本公司人事管理之一致標準，明定僱用、排班、出勤、請假、薪資、年終獎金、考核及行為規範等事項，以保障員工權益並維護飛航安全與服務品質，特訂定本辦法。'))
art('適用對象', p('本辦法適用於本公司全體在職員工。派遣人員、實習生及外部合作廠商人員，依其契約約定辦理；契約未約定者，準用本辦法。'))
art('用詞定義', p('本辦法用詞定義如下：'), ol('<b>組員</b>：指飛行員及客艙組員。', '<b>執勤期</b>：指組員自報到起至該日最後一個航段落地後結束之期間；當日來回（例如 TPE→KIJ→TPE）仍屬同一執勤期。',
    '<b>調位（DH）</b>：指組員以旅客身分搭乘本公司或聯營夥伴之航班前往或返回執勤地點，不計入執勤航段及飛行時數。',
    '<b>地面轉場</b>：指同城機場之間（例如 TPE／TSA、NRT／HND、ICN／GMP）以地面交通移動，不視為調位。',
    '<b>月薪基數</b>：指底薪乘以年資係數之金額。'))
art('法令優先適用', p('本辦法未規定者，依勞動基準法、民用航空法及其相關法規辦理；本辦法與法令牴觸者，以法令為準。'))

ch('僱用與職務')
art('職務類別', p('本公司職務分為下列類別，各類別之後台系統權限依「審核中心」之部門權限設定辦理：'),
    table('表一　職務類別與系統權限', ['職務', '主要職責', '後台權限（預設）'], [
        ['飛行員', '執行航班飛行任務', '組員班表、請假、員工票、薪資（檢視）'],
        ['客艙組員', '客艙服務及安全', '組員班表、請假、員工票、薪資（檢視）'],
        ['地勤人員', '報到、登機門、候補作業', '航班資料、登機門／櫃檯、定位管理'],
        ['客服人員', '訂位、案件、會員服務', '定位管理、案件處理中心、里程購買審查'],
        ['後台人員', '營運管理', '依部門權限'],
        ['定價人員', '票價與營收管理', '票價管理、營收分析、優惠碼、競標管理'],
        ['系統人員', '系統維運', '系統設定、資料修改'],
        ['執行長', '經營決策與最終核定', '全部']]))
art('報到及試用', p('新進員工應於報到日完成資料登錄、保密切結及教育訓練。試用期間為三個月，試用期滿經單位主管考核合格者，正式任用。'))
art('員工編號及帳號', p('員工編號及系統帳號由人力資源處核發，限本人使用，<b>不得出借或共用</b>。離職時帳號即時停用。'))
art('權限申請', p('員工因職務需要使用預設權限以外之後台分頁者，應於系統提出權限申請，經執行長核准後開通；任何資料異動須先送變更申請。'))

ch('工作時間與排班')
art('一般員工工時', p('一般員工每日正常工時八小時，每週四十小時；延長工時依勞動基準法規定給付加班費或補休。'))
art('組員排班原則', p('組員班表由系統依下列原則自動排定：'), ol(
    '任七日內至少有連續三十小時之休息；每週（週一至週日）至少一日全日休息。',
    '長程航班落地後，次日強制休息。',
    '每日僅得有一個執勤期；同日出現兩趟互不相接之勤務者，視為違規，不得排定。',
    '組員位置須前後連續：前一執勤期落地之機場，即為下一執勤期之出發地；位置不連續時，以調位（DH）補足，並登記於實際搭乘之航班。',
    '調位組員於該航班持有確認座位，<b>優先於員工票候補</b>；同城機場之地面轉場不列為調位。'))
art('排班更新及異動通知', p('航班、機隊或請假有變動時，系統於當日重新計算；班表有異動之組員，系統即時以站內通知及電子郵件告知。換班須經後台核准，後台 AI 應先列出至少三位候選人並模擬整趟對調之合法性，經核准後始寫入班表。'))
art('班表移除及恢復', p('因訓練、體檢或其他事由須移除組員特定日期之班表者，由有權限之主管於後台（得由後台 AI 代為執行）註明原因後移除，系統自動安排符合休息及位置規定之人員接手；事由消滅時得恢復原班表。'))

ch('請假')
art('特別休假', p('特別休假依勞動基準法第三十八條規定給予；未休畢之日數，於年度終結時依規定折發工資。'))
art('其他假別', p('事假、病假、婚假、喪假、公傷病假、生理假、產假及陪產假等，依勞工請假規則及性別平等工作法辦理。申請時應檢附證明文件，<b>得上傳多張照片</b>。'))
art('請假審核', p('請假應於系統提出申請，經主管核准後生效。組員之請假日，系統不予排班；已排定之班表由系統重排並通知相關人員。'))

ch('薪資')
art('薪資結構', p('員工每月薪資依下列公式計算：'),
    '<div class="fx">本月薪資 ＝ 底薪 × 年資係數 × 績效係數 ＋ 功獎金 ＋ 休息日出勤加給 ＋ 執行長調整 ＋ 核准報銷</div>',
    ol('<b>年資係數</b>：每滿一年加計百分之一點五（1 ＋ 0.015 × 年資）。', '<b>績效係數</b>：依第二十二條之過（警告、小過、大過）累計扣減，下限為百分之六十。', '<b>功獎金</b>：依第二十二條之功（嘉獎、小功、大功）於當年度累計發給。'))
art('休息日出勤加給', p('組員於每週第六個執勤日出勤者，視為休息日出勤，依勞動基準法第二十四條第二項給付加給：時薪以底薪乘以年資係數除以二百四十計算；前二小時按時薪加給三分之一，第三至第八小時加給三分之二，第九至第十二小時加給一又三分之二。第七個執勤日為例假出勤，另加給一日工資並應補假。'))
art('費用報銷', p('員工因公支出之費用，應於系統填寫幣別、金額、事由並上傳收據照片（至多六張），經執行長核准後，依核准日匯率折合新臺幣併入核准當月薪資發給。'))
art('發薪', p('每月薪資於次月五日前發給，並提供薪資明細；員工得於後台「薪資功過」查閱本人薪資、功過與年終獎金預估。'))

ch('年終獎金')
art('年終獎金之計算', p('年終獎金由<b>固定獎金</b>及<b>績效獎金</b>組成，依下列公式計算：'),
    '<div class="fx">年終獎金 ＝ 月薪基數 × （ 5 個月 ＋ 績效月數 ）</div>',
    table('表二　績效月數計算', ['當年度功過', '每次績效月數', '說明'], [
        ['嘉獎', '＋0.1 個月', '旅客表揚經登錄者亦同'], ['小功', '＋0.3 個月', ''], ['大功', '＋1.0 個月', ''],
        ['警告', '－0.1 個月', '旅客申訴經登錄者亦同'], ['小過', '－0.3 個月', ''], ['大過', '－1.0 個月', '']]),
    p('績效月數依當年度（一月一日至十二月三十一日）之功過合計，<b>最低為零、最高為三個月</b>；即年終獎金最少為五個月月薪基數，最多為八個月。過之扣減已反映於每月績效係數，不另使固定獎金減少。'))
art('年終獎金之發放', p('年終獎金於次年一月薪資一併發給。年度中到職或留職停薪者，按當年度實際在職月數比例計算；發放日前離職者，固定獎金按在職月數比例發給，績效獎金不予發給。'))

ch('考核與功過')
art('功過種類', table('表三　功過種類', ['種類', '薪資效果', '年終績效月數'], [
        ['嘉獎', '當年度功獎金 ＋NT$1,000', '＋0.1'], ['小功', '當年度功獎金 ＋NT$3,000', '＋0.3'], ['大功', '當年度功獎金 ＋NT$9,000', '＋1.0'],
        ['警告', '績效係數 －2%', '－0.1'], ['小過', '績效係數 －6%', '－0.3'], ['大過', '績效係數 －18%', '－1.0']]),
    p('績效係數之下限為百分之六十。'))
art('旅客回饋', p('旅客問卷得指定一位客艙組員並評分。近三十日內，該組員獲評四分以上且意見為稱讚者，列為<b>旅客表揚</b>；獲評二分以下或意見為抱怨組員者，列為<b>旅客申訴</b>。主管於後台「旅客回饋」確認後，得一鍵登錄嘉獎或警告，系統即時通知當事人。'))
art('功過之登錄及撤銷', p('功過由主管於後台「薪資功過」登錄並註明事由，系統即時通知當事人；登錄有誤者，由執行長撤銷並留存紀錄。'))

ch('行為規範')
art('服儀及保密', p('員工執勤時應依規定穿著制服並保持儀容整潔；對於職務上知悉之公司機密及旅客資料，在職期間及離職後均負保密義務。'))
art('個人資料保護', p('員工僅得於職務必要範圍內查閱旅客個人資料。客艙組員不得開啟航班資料頁之旅客個人資料、座位圖及實體報到資料。'))
art('資訊系統之使用', p('後台 AI 依登入者之職務權限執行指令；員工不得要求他人代為執行自身無權限之事項。系統操作均留存動作歷史備查。'))

ch('福利')
art('員工票', p('員工及其登記之眷屬得申請員工票，相關規定依《員工票管理辦法》（KGM-STX-015）辦理。'))
art('其他福利', p('勞工保險、全民健康保險、勞工退休金提繳、團體保險及職工福利委員會福利，依相關法令及公司規定辦理。'))

ch('附則')
art('申訴', p('員工對於考核、功過或其他人事處分不服者，得於收到通知之日起三十日內，以書面向人力資源處提出申訴。'))
art('未盡事宜', p('本辦法未盡事宜，依相關法令及本公司其他規章辦理。'))
art('修訂與施行', p('本辦法經董事長核定後，自生效日起施行；修訂時亦同。'))

ROMAN = '一二三四五六七八九十'
def chap_no(i): return '第%s章' % ROMAN[i]
n_art = sum(len(a) for _, a in CH)
assert n_art == 32, n_art

html = ['<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>%s %s</title><style>' % (META['id'], META['title']), fontcss(), '''
@page{size:A4;margin:22mm 20mm 22mm 20mm;
  @top-left{content:string(docid);font:400 7.6pt "Noto Sans TC";color:#0d3a2e;vertical-align:bottom;padding-bottom:3mm}
  @top-right{content:string(chap);font:400 7.6pt "Noto Sans TC";color:#6b7872;vertical-align:bottom;padding-bottom:3mm}
  @bottom-left{content:"KGM 航空股份有限公司　·　''' + META['id'] + '''　·　''' + META['ver'] + '''　·　受控文件，列印後為非受控版本";font:400 7pt "Noto Sans TC";color:#8d9a93}
  @bottom-right{content:"第 " counter(page) " 頁，共 " counter(pages) " 頁";font:400 7pt "Noto Sans TC";color:#8d9a93}}
@page:first{@top-left{content:none}@top-right{content:none}}
html{font-family:"Noto Serif TC",serif;color:#17201c;font-size:10.5pt;line-height:1.95}
.docid{string-set:docid content()}
.sans,h1,h2,h3,.cap,th,.meta td,.toc{font-family:"Noto Sans TC",sans-serif}
.cover-h{border-bottom:2.2pt solid #0d3a2e;position:relative;padding-bottom:9pt;margin-bottom:96pt}
.cover-h:after{content:"";position:absolute;left:0;bottom:-2.2pt;width:36%;border-bottom:2.2pt solid #a88240}
.co{font:700 10.5pt "Noto Sans TC";color:#0d3a2e}.co-en{font:700 7.4pt "Noto Sans TC";color:#8d9a93;letter-spacing:.32em}
.kick{font:700 8.6pt "Noto Sans TC";color:#9a7d3c;letter-spacing:.3em}
.title{font:700 24pt "Noto Serif TC";color:#0d3a2e;margin:20pt 0 10pt;letter-spacing:.06em}
.en{font:400 10.5pt "Noto Sans TC";color:#5c6b64}
.dno{font:700 11.5pt "Noto Sans TC";color:#0d3a2e;letter-spacing:.16em;margin:30pt 0 56pt}
table.meta{width:100%;border-collapse:collapse;border-top:1.2pt solid #0d3a2e;border-bottom:1.2pt solid #0d3a2e;font-size:8.8pt}
table.meta td{padding:7pt 8pt;border-bottom:.5pt solid #dfe5e2;color:#25342d;vertical-align:top}
table.meta td.k{background:#eef3f1;color:#7c8a83;font-weight:700;width:17%}
table.sign{width:100%;border-collapse:collapse;margin-top:26pt;font-family:"Noto Sans TC";font-size:8.4pt}
table.sign th{background:#eef3f1;color:#4b5a53;font-weight:700;padding:6pt;border:.5pt solid #c9d4ce;letter-spacing:.4em;text-align:center}
table.sign td{height:46pt;border:.5pt solid #c9d4ce;text-align:center;vertical-align:bottom;color:#a9b3ae;padding-bottom:6pt;font-size:7.4pt}
.notice{margin-top:22pt;border-left:2.4pt solid #a88240;padding:2pt 0 2pt 12pt;font-size:8pt;line-height:1.95;color:#4b5a53}
h2.rev,h2.toch{font:700 13pt "Noto Sans TC";color:#0d3a2e;margin:0 0 12pt;border-bottom:.6pt solid #c9d4ce;padding-bottom:6pt}
h2.toch{border:0;letter-spacing:.4em;margin-top:30pt}
table.revt{width:100%;border-collapse:collapse;font-size:8.6pt;font-family:"Noto Sans TC"}
table.revt th{background:#0d3a2e;color:#fff;text-align:left;padding:8pt}table.revt td{padding:8pt;border-bottom:.5pt solid #dfe5e2;vertical-align:top}
.toc .tc{font-weight:700;color:#0d3a2e;font-size:9.4pt;margin-top:12pt;overflow:hidden}
.toc .tc .n{display:inline-block;width:62pt}.toc .tc i{float:right;font-style:normal;color:#8d9a93;font-weight:400;font-size:8.4pt}
.toc .ta{padding-left:88pt;font-size:8.4pt;color:#5c6b64;line-height:2.1}
h2.ch{string-set:chap content();page-break-before:always;font:700 11.5pt "Noto Sans TC";color:#0d3a2e;border-bottom:1.2pt solid #0d3a2e;padding-bottom:7pt;margin:0 0 16pt;letter-spacing:.12em}
h3{font:700 10.2pt "Noto Sans TC";color:#0d3a2e;margin:16pt 0 6pt;page-break-after:avoid}
p{margin:0 0 6pt;text-indent:2em;text-align:justify}
.li{margin:0 0 4pt 1.4em;padding-left:2em;text-indent:-2em;text-align:justify}.li b{font-family:"Noto Sans TC";color:#2c4a40}
.fx{margin:6pt 0 10pt 2em;padding:9pt 12pt;background:#f4f7f5;border-left:2.4pt solid #0d3a2e;font:700 9.6pt "Noto Sans TC";color:#0d3a2e}
.cap{font:700 8.4pt "Noto Sans TC";color:#4b5a53;margin:10pt 0 6pt}
table.t{width:100%;border-collapse:collapse;font-size:8.6pt;font-family:"Noto Sans TC";margin-bottom:8pt;page-break-inside:avoid}
table.t th{background:#eef3f1;color:#0d3a2e;text-align:left;padding:7pt 8pt;border:.5pt solid #c9d4ce}
table.t td{padding:7pt 8pt;border:.5pt solid #dfe5e2;vertical-align:top}
.end{margin-top:26pt;text-align:center;font:400 8pt "Noto Sans TC";color:#8d9a93;letter-spacing:.3em}
</style></head><body>''']
M = META
html.append('<div class="docid" style="height:0;overflow:hidden">%s　%s</div>' % (M['id'], M['title']))
html.append('<div class="cover-h"><div class="co">KGM 航空股份有限公司</div><div class="co-en">KGM AIRWAYS CO., LTD.</div></div>')
html.append('<div class="kick">人 事 規 章</div><div class="title">%s</div><div class="en">%s</div><div class="dno">%s</div>' % (M['title'], M['en'], ' '.join(M['id'])))
rows = [('文件編號', M['id'], '版　　次', M['ver']), ('核定日期', M['approved'], '生效日期', M['eff']), ('前一版次', M['prev'], '條文總數', '全文 %d 條' % n_art),
        ('主辦單位', M['owner'], '核定層級', M['approver']), ('文件等級', M['level'], '保存年限', M['keep'])]
html.append('<table class="meta">' + ''.join('<tr><td class="k">%s</td><td>%s</td><td class="k">%s</td><td>%s</td></tr>' % r for r in rows)
            + '<tr><td class="k">適用範圍</td><td colspan="3">%s</td></tr></table>' % M['scope'])
html.append('<table class="sign"><tr><th>擬 案</th><th>會 辦</th><th>審 查</th><th>核 定</th></tr><tr><td>人力資源處</td><td>法務暨法令遵循室</td><td>經營管理委員會</td><td>董事長</td></tr></table>')
html.append('<div class="notice">本文件為 KGM 航空股份有限公司 受控文件，著作權為本公司所有。未經主辦單位書面同意，不得複製、外流或作成衍生文件。自本文件封面所載生效日期起施行。<b>列印本或另存本為非受控版本</b>，使用前應向主辦單位查對現行版次。</div>')
html.append('<h2 class="rev" style="page-break-before:always">修訂履歷</h2><table class="revt"><tr><th style="width:13%%">版次</th><th style="width:14%%;white-space:nowrap">修訂編號</th><th style="width:15%%">生效日期</th><th>修訂要旨</th></tr>'
            '<tr><td>2026.10</td><td>Rev. A</td><td>%s</td><td>首次發布。整合原「薪資功過」「請假」「組員排班」作業規定；新增年終獎金（固定五個月＋績效月數）、旅客回饋表揚／申訴登錄功過、調位（DH）優先於員工票之規定。</td></tr></table>' % M['eff'])
html.append('<h2 class="toch">目　錄</h2><div class="toc">')
k = 1
for i, (cn, arts) in enumerate(CH):
    html.append('<div style="page-break-inside:avoid"><div class="tc"><i>第 %d–%d 條</i><span class="n">%s</span>%s</div>' % (k, k + len(arts) - 1, chap_no(i), cn))
    html.append('<div class="ta">' + ''.join('第 %d 條　%s<br>' % (k + j, a[0]) for j, a in enumerate(arts)) + '</div></div>')
    k += len(arts)
html.append('</div>')
k = 1
for i, (cn, arts) in enumerate(CH):
    html.append('<h2 class="ch">%s　%s</h2>' % (chap_no(i), cn))
    for a in arts:
        html.append('<h3>第 %d 條　%s</h3>%s' % (k, a[0], a[1])); k += 1
html.append('<div class="end">— 以 下 空 白 —</div></body></html>')
open(OUT.replace('.pdf', '.html'), 'w', encoding='utf-8').write(''.join(html))
from weasyprint import HTML
HTML(string=''.join(html), base_url='/').write_pdf(OUT)
print('ok', OUT, n_art)

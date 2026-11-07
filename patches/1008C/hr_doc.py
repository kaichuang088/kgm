# 1006A：《員工管理辦法》KGM-HR-001 Rev. B —— 條文沿用 1004B 的 patches/1004B/pdf/build_hr_pdf.py（Rev. A），
#   改成與 KGM_Policies 同一套條文標記（h4.ch／div.art），由 pol/render_pol.py 用同一版型排版。
#   Rev. B 加入 1006A：#11 調位只搭本公司航班、同一外站每月一次；#40 座艙長／副座艙長與服務艙等；#41 工作量平均；#49 薪資總表直接加扣功過。
import os, re
import pol6
from pol6 import P, OL, TBL, cn
ID = 'KGM-HR-001'
_H = os.path.dirname(os.path.abspath(__file__))
SRC = next(p for p in (os.path.join(_H, '..', '1004B', 'pdf', 'build_hr_pdf.py'), os.path.join(_H, 'build_hr_pdf_1004B.py')) if os.path.exists(p))

def doc():
    s = open(SRC, encoding='utf-8').read()
    a = s.index('CH = []'); b = s.index('ROMAN = ')
    meta = {}
    exec(s[s.index('META = dict('):s.index('CH = []')], {}, meta)
    CH = []
    def ch(name): CH.append([name, []])
    def art(name, *paras): CH[-1][1].append([name, ''.join(paras)])
    def ol(*items): return OL(*items)
    def table(cap, head, rows): return TBL(cap, head, rows)
    body = s[a:b].replace('CH = []', '').replace('def ch(name): CH.append((name, []))\n', '')
    body = re.sub(r'^def (ch|art|p|ol|table)\(.*?(?=^\S)', '', body, flags=re.S | re.M)
    exec(body, {'ch': ch, 'art': art, 'p': P, 'ol': ol, 'table': table})
    assert sum(len(x[1]) for x in CH) == 32
    A = {t: x for c in CH for x in c[1] for t in [x[0]]}
    def rep(t, old, new):
        assert A[t][1].count(old) == 1, (t, old); A[t][1] = A[t][1].replace(old, new)
    # ── Rev. B（1006A）──
    rep('用詞定義', '<b>調位（DH）</b>：指組員以旅客身分搭乘本公司或聯營夥伴之航班前往或返回執勤地點，不計入執勤航段及飛行時數。',
        '<b>調位（DH）</b>：指組員以旅客身分搭乘<b>本公司自營之航班</b>前往或返回執勤地點，不搭乘聯營夥伴之航班，不計入執勤航段及飛行時數。')
    rep('組員排班原則', '調位組員於該航班持有確認座位，<b>優先於員工票候補</b>；同城機場之地面轉場不列為調位。</li>',
        '調位組員於該航班持有確認座位，<b>優先於員工票候補</b>；同城機場之地面轉場不列為調位。</li>'
        '<li><b>六、</b>同一組員於同一日曆月內，<b>同一外站航點至多前往一次</b>；自基地出發之一趟行程計為一次，同一趟行程之後續航段、返回基地之航段及調位均不另計。</li>'
        '<li><b>七、</b>工作量平均分配：系統以<b>計薪時數</b>平衡各組員之工作量，每一航段至少以三小時計；每月飛行時數上限仍依實際飛行時間及法令計算。</li>'
        '<li><b>八、</b>每一航班之客艙組員，依職級及年資排序，第一位為<b>座艙長</b>、第二位為<b>副座艙長</b>，其餘為空服員；服務艙等依各艙座位數與服務比例'
        '（頭等艙一比二、商務艙一比八、豪華經濟艙一比二十、經濟艙一比四十）分配人數，年資越深者服務越高之艙等，並於個人班表載明職位及服務艙等。</li>'
        '<li><b>九、</b>調位組員之艙等：<b>正機師及副機師（機長、副機長）安排商務艙</b>，<b>巡航機師安排豪華經濟艙</b>（未販售豪華經濟艙之航段為商務艙），<b>座艙長安排豪華經濟艙</b>（未販售豪華經濟艙之航段為經濟艙），其他組員安排經濟艙；經濟艙及豪華經濟艙均客滿時，得安排商務艙空位。'
        '正機師、副機師、巡航機師或座艙長應搭乘之艙等客滿時，依《旅客機票更改、重新開立及退票作業辦法》（KGM-CHG-003）所定順序釋出座位。</li>'
        '<li><b>十、</b>每一調位航段發給<b>四碼英數混合之訂位代號</b>；組員得以該代號及姓名於官網「行程管理」查看本人資料、航班、艙等及座位，並得<b>選擇餐點</b>。'
        '調位座位由公司指派，組員<b>不得自行選位</b>，亦不得改票、退票或申請哩程升等；班表異動時由系統更新。航班資料清單中，調位組員一律標示為 DH。</li>')   # 1007A
    rep('功過之登錄及撤銷', '登錄有誤者，由執行長撤銷並留存紀錄。</p>',
        '登錄有誤者，由執行長撤銷並留存紀錄。</p>'
        + P('執行長並得於後台「全員薪資總表」該員工列直接加扣功過，應填寫事由；系統即通知當事人並記入動作歷史，效果與前項登錄相同。'))
    h = ''; k = 0
    for i, (cname, arts) in enumerate(CH):
        h += '<h4 class="ch">第%s章　%s</h4>' % (cn(i + 1), cname)
        for t, b2 in arts:
            k += 1; h += '<div class="art"><span class="t">第 %d 條　%s</span>%s</div>' % (k, t, b2)
    M = meta['META']
    ver = '2026.10（Rev. B）'
    return dict(t=M['title'], en=M['en'], ver=ver, h=h, arts=k,
                meta=[['文件編號', ID, '版　　次', ver], ['核定日期', pol6.APPROVED, '生效日期', pol6.EFF],
                      ['前一版次', M['ver'], '條文總數', '全文 %d 條' % k], ['主辦單位', M['owner'], '核定層級', M['approver']],
                      ['文件等級', M['level'], '保存年限', M['keep']], ['適用範圍', M['scope']]],
                sign=['人力資源處', '法務暨法令遵循室', '營運管理委員會', '董事長'],
                rev=[['2026.10', 'Rev. B', pol6.EFF, '組員調位限搭乘本公司自營航班；增訂同一外站每月至多一次、工作量依計薪時數平均分配、座艙長及副座艙長與服務艙等之指派原則（第十條）；'
                      '執行長得於全員薪資總表直接加扣功過（第二十四條）；增訂調位組員之艙等（正、副機師商務艙，巡航機師及座艙長豪華經濟艙）及四碼訂位代號、可選餐不可選位（第十條）；審查單位名稱更正為營運管理委員會。'],
                     ['2026.10', 'Rev. A', M['eff'], '首次發布。整合原「薪資功過」「請假」「組員排班」作業規定；新增年終獎金（固定五個月＋績效月數）、旅客回饋表揚／申訴登錄功過、調位（DH）優先於員工票之規定。']])

if __name__ == '__main__':
    d = doc(); print(d['arts'], len(d['h']))

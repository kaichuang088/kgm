# 1012A #1：規章 —— 員工聘僱契約書（甲方／乙方，中英對照）、旅客同意書（機上設備故障補償、非自願降艙；金額留空現場填寫），
#   以及《員工管理辦法》KGM-HR-001 Rev. C（主管職務 Manager I／II／III、出勤點名、無故缺席）。
#   版型沿用 1010A pol/render_pol.py（同一份 CSS、封面文件控制表、頁首頁尾）。
#   用法：python3 pol12.py <lxgw 套件目錄> <輸出目錄>
import sys, os, re, html as H, subprocess, copy
D = os.path.dirname(os.path.abspath(__file__))
P10 = os.path.join(D, '..', '..', '1010A')
sys.path.insert(0, os.path.join(P10, 'pol')); sys.path.insert(0, P10)
PKG, OUT = sys.argv[1], sys.argv[2]
import render_pol as RP          # 讀 sys.argv[1:3]；匯入時已依 1010A 條文建好 JOBS（01～17 不變的那幾份不重排）
import pol6, hr_doc
from pol6 import cn
APPROVED, EFF = '2026-10-11', '2026-10-12'
VER = '2026.10（Rev. A）'

def esc(s): return H.escape(s, quote=False)
BL = '<span class="bl">　　　　　　　　</span>'          # 空白欄（現場填寫）
BLS = '<span class="bl s">　　　　</span>'
BLL = '<span class="bl l">　　　　　　　　　　　　　　　　</span>'
BOX = '<span class="bx">□</span>'

# ─────────────────────────────────────────────────────────────────────────────
# 一、員工聘僱契約書（中文本＋英文本，條次一一對應）
# ─────────────────────────────────────────────────────────────────────────────
C_ZH = [
 ('契約之訂立', [
   '甲方 KGM 航空股份有限公司（以下簡稱「甲方」）聘僱乙方（以下簡稱「乙方」）為甲方員工，雙方依勞動基準法、勞工退休金條例、性別平等工作法、職業安全衛生法及其他相關法令，本於誠信原則訂立本契約。',
   '本契約附件（職務說明書、甲方《工作規則》、《員工管理辦法》KGM-HR-001、《員工票管理辦法》KGM-STX-015 及《個人資料保護及隱私政策》KGM-PRV-014）為本契約之一部分；附件與本契約牴觸者，以本契約為準；本契約與法令牴觸者，以法令為準。']),
 ('契約期間及到職日', [
   '本契約為' + BOX + '不定期契約／' + BOX + '定期契約（限臨時性、短期性、季節性及特定性工作，期間自 ' + BLS + ' 年 ' + BLS + ' 月 ' + BLS + ' 日至 ' + BLS + ' 年 ' + BLS + ' 月 ' + BLS + ' 日止）。',
   '乙方到職日為 ' + BLS + ' 年 ' + BLS + ' 月 ' + BLS + ' 日；乙方應於到職日攜帶甲方通知之證件及文件辦理報到。']),
 ('試用期間', [
   '乙方之試用期間為自到職日起 ' + BLS + ' 個月（不超過三個月）。試用期間乙方仍享有法令所定之一切權益，年資自到職日起算。',
   '試用期滿經考核不適任者，甲方得依勞動基準法之規定終止本契約，並依法預告及給付資遣費。']),
 ('職務及工作地點', [
   '乙方之職稱為 ' + BL + '，所屬部門為 ' + BL + '，職級為 ' + BL + '，工作內容詳職務說明書。',
   '乙方之基地（報到地點）為 ' + BOX + '臺灣桃園國際機場（TPE）／' + BOX + '臺北松山機場（TSA）／' + BOX + '甲方總部（臺北市）／' + BOX + '其他：' + BL + '。飛航組員依班表於外站過夜或調位（DH）者，視為執行職務。',
   '甲方因業務需要調動乙方之職務或工作地點時，應符合勞動基準法第十條之一所定原則，不得降低工資或為其他不利之變更，並應考量乙方及其家庭之生活利益。']),
 ('工作時間、休息及排班', [
   '乙方每日正常工作時間不超過八小時，每週不超過四十小時；地勤人員依甲方排定之班別時間帶（早班、日班、中班、晚班）輪班，更換班次時至少應有連續十一小時之休息時間。',
   '飛航組員（飛行員及客艙組員）之飛航時間、執勤時間及休息時間，依民用航空法、航空器飛航作業管理規則及甲方核准之組員派遣規定辦理；任何連續七日內至少應有連續三十小時之休息。',
   '乙方每七日中應有二日之休息，其中一日為例假、一日為休息日；甲方使乙方於休息日出勤者，依勞動基準法第二十四條第二項及《員工管理辦法》加給工資。',
   '班表及異動依《員工管理辦法》以系統公告並通知乙方；乙方應依公告之班表準時報到。']),
 ('工資', [
   '乙方每月本薪為新臺幣 ' + BL + ' 元整；年資加給、績效係數、功獎金、休息日出勤加給及費用報銷，依《員工管理辦法》計算。',
   '乙方經甲方任命為主管者，任命期間每月另給付主管職務加給：Manager I 新臺幣八千元、Manager II 新臺幣一萬五千元、Manager III 新臺幣二萬五千元；職務撤銷者，自撤銷之次月起停止給付，不視為減薪或降調。',
   '其他津貼（外站津貼、飛行津貼等）：' + BLL + '。',
   '工資於次月五日前全額直接給付至乙方指定之金融帳戶；遇例假日提前一日給付。甲方應提供工資各項目計算方式明細。']),
 ('年終獎金', [
   '甲方於次年一月發給年終獎金，以月薪基數（本薪乘以年資係數）乘以固定五個月加計績效月數（本年度合計零至三個月），年度中到職或離職者按在職月數比例計算，計算方式依《員工管理辦法》第二十條及第二十一條。']),
 ('休假及請假', [
   '乙方之特別休假依勞動基準法第三十八條給予；國定假日、例假、休息日依法令辦理。',
   '乙方之婚假、喪假、病假、事假、公傷病假、生理假、產假、陪產檢及陪產假、家庭照顧假等，依勞工請假規則、性別平等工作法及《員工管理辦法》辦理。']),
 ('保險、退休及福利', [
   '甲方依法為乙方辦理勞工保險、就業保險、勞工職業災害保險及全民健康保險，並按月為乙方提繳不低於工資百分之六之勞工退休金至乙方之個人退休金專戶。',
   '乙方得依《員工票管理辦法》KGM-STX-015 申請員工票（含眷屬）；員工票應以綁定之本人會員帳號使用，不得轉讓、出售或供他人使用。',
   '甲方提供之團體保險、教育訓練補助及其他福利，依甲方公告辦理。']),
 ('教育訓練及最低服務年限', [
   '甲方為乙方支出之專業訓練費用（例如機型檢定、模擬機及航路訓練）新臺幣 ' + BL + ' 元，雙方約定最低服務年限為 ' + BLS + ' 年，自訓練完成之日起算。',
   '乙方於最低服務年限屆滿前因可歸責於乙方之事由離職者，應按未服務期間之比例返還前項訓練費用；甲方不得要求乙方給付違約金。因不可歸責於乙方之事由離職者，乙方無需返還。']),
 ('工作規則及考核', [
   '乙方應遵守甲方依法公開揭示之《工作規則》及《員工管理辦法》，服從主管合理之指揮監督。',
   '甲方依《員工管理辦法》辦理考核、功過（嘉獎、小功、大功、警告、小過、大過）及年終獎金；功過之登錄均通知乙方，乙方得依該辦法提出申訴。']),
 ('出勤及無故缺席', [
   '乙方應依班表準時報到，並接受所屬主管（地勤主管、當班座艙長或副座艙長、教官）之出勤點名。',
   '乙方無正當理由未於班表時間報到且未依規定請假者，為無故缺席：每次記警告一次，並扣除當日工資（月薪除以三十）；主管登錄錯誤經更正為出勤者，警告及扣薪一併撤回。',
   '乙方無正當理由繼續曠職三日，或一個月內曠職達六日者，甲方得依勞動基準法第十二條第一項第六款不經預告終止本契約。']),
 ('主管職務', [
   '甲方得依乙方之能力及考核任命乙方為 Manager I、Manager II 或 Manager III，並得調整或撤銷之；任命、調整及撤銷均以書面或系統通知乙方。',
   '擔任主管者，應依《員工管理辦法》管理所屬組員、辦理出勤點名及考核，並對所屬組員之個人資料負保密義務。']),
 ('保密義務', [
   '乙方對於任職期間知悉之甲方營業秘密、營運及財務資訊、資訊系統帳號密碼、旅客及其他員工之個人資料，負保密義務，非經甲方書面同意，不得洩漏、交付或為職務以外之使用；本條義務於本契約終止後仍繼續有效。',
   '乙方違反前項義務致甲方受有損害者，應負損害賠償責任；情節重大者，甲方得依法終止本契約。']),
 ('個人資料之蒐集及利用', [
   '甲方為人事管理、薪資給付、保險、排班、員工票、飛航安全及法令遵循之目的，蒐集、處理及利用乙方之個人資料，並依個人資料保護法及《個人資料保護及隱私政策》KGM-PRV-014 辦理；乙方得依法行使查詢、閱覽、更正等權利。']),
 ('健康及執照', [
   '乙方應配合甲方辦理到職及定期健康檢查。飛航組員應持有效之執照、體格檢查及格證及各項訓練檢定；前開文件逾期或失效時，乙方應立即通知甲方，甲方得暫停其飛航職務並另行安排適當工作，工資依法令及相關規定辦理。']),
 ('競業禁止', [
   '本條' + BOX + '不適用／' + BOX + '適用。適用者，雙方另以書面約定競業禁止之期間（不超過二年）、區域、職業活動範圍及甲方給付之合理補償，並應符合勞動基準法第九條之一之規定；未另行約定者，本條不適用。']),
 ('契約之終止', [
   '契約之終止、預告期間及資遣費，依勞動基準法第十一條至第十八條及勞工退休金條例之規定辦理。',
   '乙方自請離職者，應依勞動基準法第十五條之規定預告甲方，並辦妥職務交接，交還甲方之證件、制服、裝備、文件及資訊系統帳號；甲方應於離職時發給服務證明書。']),
 ('職業災害及退休', [
   '乙方因執行職務致傷病、失能或死亡者，甲方依勞動基準法第七章及勞工職業災害保險及保護法之規定予以補償。乙方之退休依勞工退休金條例及勞動基準法辦理。']),
 ('契約之變更', [
   '本契約之變更或補充，應經雙方以書面為之；甲方依法修訂並公告之《工作規則》及各項規章，其變更不得低於法令所定之勞動條件。']),
 ('爭議處理及管轄', [
   '本契約如有爭議，雙方應本誠信原則協商解決；協商不成者，得依勞資爭議處理法申請調解，並以臺灣桃園地方法院為第一審管轄法院。']),
 ('契約份數及語文', [
   '本契約以中文及英文作成，兩種語文內容如有歧異，以中文本為準。本契約一式二份，由雙方各執一份為憑。']),
]
C_EN = [
 ('Formation of the Contract', [
   'KGM Airways Co., Ltd. ("Party A") employs the undersigned employee ("Party B"). The Parties enter into this Contract in good faith in accordance with the Labor Standards Act, the Labor Pension Act, the Gender Equality in Employment Act, the Occupational Safety and Health Act and other applicable laws of Taiwan.',
   'The appendices to this Contract (the Job Description, Party A\'s Work Rules, the Employee Management Regulations KGM-HR-001, the Staff Travel Regulations KGM-STX-015 and the Personal Data Protection and Privacy Policy KGM-PRV-014) form part of this Contract. Where an appendix conflicts with this Contract, this Contract prevails; where this Contract conflicts with the law, the law prevails.']),
 ('Term and Commencement', [
   'This Contract is ' + BOX + ' of indefinite duration / ' + BOX + ' of fixed duration (only for temporary, short-term, seasonal or specific work) from ' + BL + ' to ' + BL + '.',
   'Party B commences employment on ' + BL + ' and shall report for duty with the documents notified by Party A.']),
 ('Probation', [
   'The probation period is ' + BLS + ' month(s) (not exceeding three months) from the commencement date. Party B enjoys all statutory rights during probation and seniority counts from the commencement date.',
   'If Party B is assessed as unsuitable at the end of probation, Party A may terminate this Contract in accordance with the Labor Standards Act, with statutory notice and severance pay.']),
 ('Position and Place of Work', [
   'Party B\'s title is ' + BL + ', department ' + BL + ', grade ' + BL + '. The duties are set out in the Job Description.',
   'Party B\'s base (reporting station) is ' + BOX + ' Taiwan Taoyuan International Airport (TPE) / ' + BOX + ' Taipei Songshan Airport (TSA) / ' + BOX + ' Head Office (Taipei) / ' + BOX + ' other: ' + BL + '. Layovers at outstations and positioning (DH) under the roster are part of the duties of flight crew.',
   'Any transfer of position or place of work required by business needs shall comply with Article 10-1 of the Labor Standards Act, shall not reduce wages or otherwise be unfavourable, and shall take into account the circumstances of Party B and Party B\'s family.']),
 ('Working Hours, Rest and Rostering', [
   'Normal working hours shall not exceed eight hours a day or forty hours a week. Ground staff work in the shift bands set by Party A (early, day, mid and late) with at least eleven consecutive hours of rest when changing shifts.',
   'Flight time, duty time and rest of flight crew (pilots and cabin crew) follow the Civil Aviation Act, the Aircraft Flight Operation Regulations and Party A\'s approved crew scheduling rules; in any seven consecutive days there shall be at least thirty consecutive hours of rest.',
   'Party B is entitled to two days off in every seven days, one regular day off and one rest day. Work on a rest day is paid in accordance with Article 24(2) of the Labor Standards Act and the Employee Management Regulations.',
   'Rosters and roster changes are published in Party A\'s system and notified to Party B under the Employee Management Regulations. Party B shall report on time as rostered.']),
 ('Wages', [
   'Party B\'s monthly base salary is NT$ ' + BL + '. Seniority increments, the performance factor, merit bonuses, rest-day pay and reimbursements are calculated under the Employee Management Regulations.',
   'If appointed as a manager, Party B receives a monthly managerial allowance during the appointment: Manager I NT$8,000, Manager II NT$15,000, Manager III NT$25,000. On revocation, the allowance ceases from the following month; this is not a wage reduction or demotion.',
   'Other allowances (outstation, flying, etc.): ' + BLL + '.',
   'Wages are paid in full by the 5th day of the following month directly into Party B\'s designated bank account, one day earlier if that day is a holiday, together with a statement of each wage item.']),
 ('Year-end Bonus', [
   'Party A pays a year-end bonus in January of the following year equal to the monthly base (base salary multiplied by the seniority factor) multiplied by a fixed five months plus performance months (zero to three months in total for the year), pro rata for partial years, as set out in Articles 20 and 21 of the Employee Management Regulations.']),
 ('Leave', [
   'Annual paid leave is granted under Article 38 of the Labor Standards Act. National holidays, regular days off and rest days follow the law.',
   'Marriage, funeral, sick, personal, occupational injury, menstrual, maternity, paternity and family care leave follow the Regulations of Leave-Taking of Workers, the Gender Equality in Employment Act and the Employee Management Regulations.']),
 ('Insurance, Pension and Benefits', [
   'Party A enrols Party B in labour insurance, employment insurance, occupational accident insurance and national health insurance, and contributes no less than six percent of wages each month to Party B\'s individual labour pension account.',
   'Party B may apply for staff travel (including dependants) under the Staff Travel Regulations KGM-STX-015. Staff tickets shall be used only through Party B\'s own linked member account and may not be transferred, sold or used by others.',
   'Group insurance, training subsidies and other benefits are provided as announced by Party A.']),
 ('Training and Minimum Service Period', [
   'For professional training funded by Party A (for example type rating, simulator and line training) costing NT$ ' + BL + ', the Parties agree a minimum service period of ' + BLS + ' year(s) from completion of the training.',
   'If Party B leaves for reasons attributable to Party B before the minimum service period ends, Party B shall repay the training cost in proportion to the unserved period. Party A shall not claim liquidated damages. No repayment is due if Party B leaves for reasons not attributable to Party B.']),
 ('Work Rules and Appraisal', [
   'Party B shall comply with Party A\'s published Work Rules and the Employee Management Regulations and follow the reasonable instructions of supervisors.',
   'Appraisal, commendations and penalties (commendation, minor and major merit, warning, minor and major demerit) and the year-end bonus follow the Employee Management Regulations. Every entry is notified to Party B, who may file a grievance under those Regulations.']),
 ('Attendance and Unexcused Absence', [
   'Party B shall report on time as rostered and is subject to the attendance roll call of the responsible supervisor (ground manager, the duty purser or deputy purser, or the instructor).',
   'Failure to report as rostered without good cause and without approved leave is an unexcused absence: each occurrence is recorded as one warning and one day\'s wages (monthly salary divided by thirty) are deducted. If the supervisor corrects an erroneous entry to "present", the warning and the deduction are withdrawn together.',
   'If Party B is absent without good cause for three consecutive days or six days within one month, Party A may terminate this Contract without notice under Article 12(1)(6) of the Labor Standards Act.']),
 ('Managerial Positions', [
   'Party A may appoint Party B as Manager I, Manager II or Manager III based on ability and appraisal, and may adjust or revoke the appointment, in each case by written or system notice to Party B.',
   'A manager shall supervise the assigned team, take attendance and appraise in accordance with the Employee Management Regulations, and shall keep the personal data of team members confidential.']),
 ('Confidentiality', [
   'Party B shall keep confidential Party A\'s trade secrets, operational and financial information, system accounts and passwords, and the personal data of passengers and other employees learned during employment, and shall not disclose, deliver or use them other than for duties without Party A\'s written consent. This obligation survives termination of this Contract.',
   'Party B is liable for damage caused to Party A by a breach of this Article; in serious cases Party A may terminate this Contract in accordance with the law.']),
 ('Personal Data', [
   'Party A collects, processes and uses Party B\'s personal data for personnel administration, payroll, insurance, rostering, staff travel, flight safety and legal compliance in accordance with the Personal Data Protection Act and the Personal Data Protection and Privacy Policy KGM-PRV-014. Party B may exercise the statutory rights of inquiry, review and correction.']),
 ('Health and Licences', [
   'Party B shall undergo pre-employment and periodic health checks. Flight crew shall hold a valid licence, medical certificate and required training and checks; Party B shall notify Party A immediately if any of them lapses, and Party A may suspend flying duties and assign other suitable work, with wages handled under the law and the applicable rules.']),
 ('Non-competition', [
   'This Article ' + BOX + ' does not apply / ' + BOX + ' applies. Where it applies, the Parties shall agree separately in writing the period (not exceeding two years), region, scope of activities and reasonable compensation payable by Party A, in compliance with Article 9-1 of the Labor Standards Act; absent such agreement, this Article does not apply.']),
 ('Termination', [
   'Termination, notice periods and severance pay follow Articles 11 to 18 of the Labor Standards Act and the Labor Pension Act.',
   'Party B resigning shall give notice under Article 15 of the Labor Standards Act, complete the handover and return Party A\'s identification, uniforms, equipment, documents and system accounts. Party A shall issue a certificate of service on separation.']),
 ('Occupational Accidents and Retirement', [
   'If Party B is injured, disabled or dies in the course of duty, Party A compensates Party B in accordance with Chapter VII of the Labor Standards Act and the Labor Occupational Accident Insurance and Protection Act. Retirement follows the Labor Pension Act and the Labor Standards Act.']),
 ('Amendment', [
   'Amendments or supplements to this Contract shall be made in writing by both Parties. Changes to the Work Rules and regulations lawfully amended and published by Party A shall not fall below the statutory working conditions.']),
 ('Disputes and Jurisdiction', [
   'The Parties shall resolve disputes in good faith by consultation; failing that, either Party may apply for mediation under the Act for Settlement of Labor-Management Disputes. The Taiwan Taoyuan District Court is the court of first instance.']),
 ('Counterparts and Language', [
   'This Contract is made in Chinese and English; in case of any discrepancy, the Chinese version prevails. This Contract is executed in two counterparts, one for each Party.']),
]
assert len(C_ZH) == len(C_EN) == 22

def parties_zh():
    r = lambda k, v: '<tr><td class="k">%s</td><td>%s</td></tr>' % (k, v)
    return ('<table class="pt"><tr><th colspan="2">甲　　方（雇主）</th></tr>'
            + r('名　　稱', 'KGM 航空股份有限公司') + r('統一編號', BL) + r('代 表 人', BL) + r('地　　址', BL)
            + '<tr><th colspan="2">乙　　方（員工）</th></tr>'
            + r('姓　　名', BL) + r('員工編號', BL) + r('身分證統一編號／護照號碼', BL) + r('出生日期', BL) + r('戶籍地址', BLL) + r('通訊地址', BLL) + r('聯絡電話／電子郵件', BLL)
            + '</table>')
def parties_en():
    r = lambda k, v: '<tr><td class="k">%s</td><td>%s</td></tr>' % (k, v)
    return ('<table class="pt"><tr><th colspan="2">PARTY A (Employer)</th></tr>'
            + r('Name', 'KGM Airways Co., Ltd.') + r('Business ID No.', BL) + r('Representative', BL) + r('Address', BL)
            + '<tr><th colspan="2">PARTY B (Employee)</th></tr>'
            + r('Name', BL) + r('Employee No.', BL) + r('ID / Passport No.', BL) + r('Date of Birth', BL) + r('Registered Address', BLL) + r('Mailing Address', BLL) + r('Phone / E-mail', BLL)
            + '</table>')
def sign_block(zh):
    if zh:
        return ('<table class="sg"><tr><th>甲　方</th><th>乙　方</th></tr><tr>'
                '<td>KGM 航空股份有限公司<br>代表人：' + BL + '<br>（公司大小章）<br><br>日期：' + BLS + ' 年 ' + BLS + ' 月 ' + BLS + ' 日</td>'
                '<td>姓名（親簽）：' + BL + '<br>身分證統一編號：' + BL + '<br><br><br>日期：' + BLS + ' 年 ' + BLS + ' 月 ' + BLS + ' 日</td></tr></table>')
    return ('<table class="sg"><tr><th>PARTY A</th><th>PARTY B</th></tr><tr>'
            '<td>KGM Airways Co., Ltd.<br>Representative: ' + BL + '<br>(Company seals)<br><br>Date: ' + BL + '</td>'
            '<td>Signature: ' + BL + '<br>ID / Passport No.: ' + BL + '<br><br><br>Date: ' + BL + '</td></tr></table>')

def contract_body():
    zh = '<h4 class="ch">中文本　員工聘僱契約書</h4><p class="lead">立契約書人：</p>' + parties_zh()
    zh += '<p class="lead">雙方同意訂立本聘僱契約，條款如下：</p>'
    for i, (t, ps) in enumerate(C_ZH):
        zh += '<div class="art"><span class="t">第 %d 條　%s</span>%s</div>' % (i + 1, t, ''.join('<p>%s</p>' % p for p in ps))
    zh += '<div class="kp">附件：' + BOX + '職務說明書　' + BOX + '工作規則　' + BOX + '員工管理辦法（KGM-HR-001）　' + BOX + '員工票管理辦法（KGM-STX-015）　' + BOX + '個人資料保護及隱私政策（KGM-PRV-014）</div>' + sign_block(True)
    en = '<h4 class="ch pb lat">English Version — Employment Contract</h4><p class="lead">The Parties:</p>' + parties_en()
    en += '<p class="lead">The Parties agree to the following terms:</p>'
    for i, (t, ps) in enumerate(C_EN):
        en += '<div class="art"><span class="t">Article %d　%s</span>%s</div>' % (i + 1, t, ''.join('<p class="en">%s</p>' % p for p in ps))
    en += '<div class="kp">Appendices: ' + BOX + ' Job Description　' + BOX + ' Work Rules　' + BOX + ' KGM-HR-001　' + BOX + ' KGM-STX-015　' + BOX + ' KGM-PRV-014</div>' + sign_block(False)
    return zh + en

# ─────────────────────────────────────────────────────────────────────────────
# 二、旅客同意書（金額及細節留空，櫃檯／機上現場填寫）
# ─────────────────────────────────────────────────────────────────────────────
def fld(zh, en, w=''):
    return '<td class="k">%s<small>%s</small></td><td%s>%s</td>' % (zh, en, ' colspan="3"' if w == 'w' else '', BL)
def info_table():
    return ('<table class="ff">'
            '<tr>' + fld('旅客姓名', 'Passenger name') + fld('訂位代號', 'Booking ref.') + '</tr>'
            '<tr>' + fld('機票號碼', 'Ticket no.') + fld('會員卡號', 'Member no.') + '</tr>'
            '<tr>' + fld('航班／日期', 'Flight / Date') + fld('航段', 'Sector') + '</tr>'
            '<tr>' + fld('聯絡電話', 'Phone') + fld('電子郵件', 'E-mail') + '</tr></table>')
def staff_sign():
    return ('<table class="sg"><tr><th>旅客簽名　Passenger signature</th><th>經辦人員　KGM staff</th></tr><tr>'
            '<td><br><br>' + BL + '<br>日期／時間 Date / time：' + BL + '</td>'
            '<td>姓名 Name：' + BL + '<br>員工編號 Staff no.：' + BL + '<br>站別／航班 Station / flight：' + BL + '<br>主管覆核 Supervisor：' + BL + '</td></tr></table>'
            '<p class="sm">本同意書一式二聯，第一聯由本公司留存，第二聯交旅客收執。本公司依《個人資料保護及隱私政策》（KGM-PRV-014）處理本同意書所載個人資料。<br>'
            'This form is made in duplicate: copy 1 is retained by KGM Airways and copy 2 is given to the passenger. Personal data on this form is processed under KGM-PRV-014.</p>')
def chk(items):
    return '<div class="ck">' + ''.join('<div>%s %s<small>%s</small></div>' % (BOX, a, b) for a, b in items) + '</div>'

def consent_body():
    a = ('<h4 class="ch">表一　機上設備故障補償同意書</h4><p class="sub">FORM 1 · In-flight Equipment Malfunction — Compensation Consent</p>'
         + '<p class="sm">適用：旅客所乘座位之機上設備於本次航段發生故障且無法更換至同艙等可用座位時（《航班異常處理及旅客權益辦法》KGM-IRR-013、《旅客及行李運送契約條款》KGM-GC-001）。'
           'Applies when equipment at the passenger\'s seat failed on this sector and no serviceable seat in the same cabin was available.</p>'
         + '<h5>一、旅客及航班資料　Passenger and flight</h5>' + info_table()
         + '<table class="ff"><tr>' + fld('艙等／座位', 'Cabin / seat') + fld('發現時間', 'Time noted') + '</tr></table>'
         + '<h5>二、故障設備　Equipment affected</h5>'
         + chk([('座椅傾倒／腳踏／平躺功能', 'Seat recline / leg rest / flat-bed'), ('個人娛樂系統（螢幕、耳機孔、遙控器）', 'In-flight entertainment'),
                ('閱讀燈／服務呼叫鈕', 'Reading light / call button'), ('電源插座／USB', 'Power outlet / USB'), ('機上 Wi-Fi', 'In-flight Wi-Fi'),
                ('餐桌／置物空間', 'Tray table / stowage'), ('其他', 'Other: ' + BL)])
         + '<p>故障情形說明 Description：' + BLL + BLL + '</p>'
         + '<h5>三、補償方式（金額現場填寫）　Compensation (amounts completed on site)</h5>'
         + chk([('哩程 ' + BL + ' 哩', 'Miles'), ('電子禮券 NT$ ' + BL, 'e-Voucher'), ('退還票價差額／現金 NT$ ' + BL, 'Refund / cash'),
                ('免費改座或艙等安排：' + BL, 'Free reseat / cabin'), ('其他：' + BL, 'Other')])
         + '<h5>四、旅客聲明　Passenger declaration</h5>'
         + '<ol class="kuan"><li><b>一、</b>本人確認上列設備故障情形屬實，並同意以上列方式及金額作為本次航段該項設備故障之補償。'
           'I confirm the malfunction above and accept the compensation stated as settlement for this equipment malfunction on this sector.</li>'
           '<li><b>二、</b>本同意書僅就上列設備故障事項為之，不影響本人依法令、國際公約（包括蒙特婁公約）及本公司運送契約條款就其他事項所享有之權利。'
           'This consent covers only the malfunction stated and does not affect any other right under law, international conventions (including the Montreal Convention) or the Conditions of Carriage.</li>'
           '<li><b>三、</b>補償以哩程或電子禮券給付者，於本同意書簽署後七個工作日內入帳；以現金或退款給付者，依原付款方式退回。'
           'Miles or e-vouchers are credited within seven working days; cash or refunds are returned to the original form of payment.</li></ol>'
         + staff_sign())
    b = ('<h4 class="ch pb">表二　非自願降艙同意書</h4><p class="sub">FORM 2 · Involuntary Downgrade — Acknowledgement and Consent</p>'
         + '<p class="sm">適用：旅客已確認之艙等因超賣、機型或客艙配置變更、座位故障、組員調位等原因無法提供，經本公司安排於較低艙等搭乘時（《旅客機票更改、重新開立及退票作業辦法》KGM-CHG-003、KGM-IRR-013）。'
           'Applies when a confirmed cabin cannot be provided and the passenger is accommodated in a lower cabin.</p>'
         + '<h5>一、旅客及航班資料　Passenger and flight</h5>' + info_table()
         + '<table class="ff"><tr>' + fld('原訂艙等／票價方案', 'Booked cabin / fare') + fld('實際搭乘艙等／座位', 'Cabin flown / seat') + '</tr></table>'
         + '<h5>二、降艙原因　Reason</h5>'
         + chk([('座位超賣', 'Oversold cabin'), ('機型或客艙配置變更', 'Aircraft or configuration change'), ('座位故障無法使用', 'Unserviceable seat'),
                ('組員調位（DH）', 'Crew positioning'), ('其他：' + BL, 'Other')])
         + '<h5>三、旅客之選擇　Passenger\'s choice</h5>'
         + chk([('接受於上列艙等搭乘本航班', 'Accept the lower cabin on this flight'), ('改搭本公司其他航班（免費）：' + BL, 'Rebook free of charge on: '),
                ('辦理退票（免收手續費）', 'Refund without fee')])
         + '<h5>四、退款及補償（金額現場填寫）　Refund and compensation (completed on site)</h5>'
         + '<table class="ff">'
           '<tr><td class="k">艙等差額退款<small>Fare difference refund</small></td><td colspan="3">NT$ ' + BL + '（退回原付款方式 to original payment）</td></tr>'
           '<tr><td class="k">額外補償<small>Additional compensation</small></td><td colspan="3">' + BOX + ' 哩程 Miles ' + BL + '　' + BOX + ' 電子禮券 e-Voucher NT$ ' + BL + '　' + BOX + ' 現金 Cash NT$ ' + BL + '</td></tr>'
           '<tr><td class="k">哩程退還<small>Miles redeposit</small></td><td colspan="3">' + BOX + ' 酬賓機票／哩程升等哩程 ' + BL + ' 哩，全額退還，到期日不變 Award / upgrade miles redeposited in full, expiry unchanged</td></tr>'
           '<tr><td class="k">其他<small>Other</small></td><td colspan="3">' + BLL + '</td></tr></table>'
         + '<h5>五、旅客聲明　Passenger declaration</h5>'
         + '<ol class="kuan"><li><b>一、</b>本公司已向本人說明降艙原因、可選擇之處理方式及上列退款與補償；本人係自行選擇上列方式。'
           'KGM Airways has explained the reason, the options available and the refund and compensation above, and I have made my own choice.</li>'
           '<li><b>二、</b>艙等差額依本人實付票價與實際搭乘艙等之票價差額計算，並於十四個工作日內退回原付款方式；里程累積依實際搭乘艙等計算。'
           'The fare difference is calculated on the fare paid and refunded within fourteen working days; miles accrue on the cabin flown.</li>'
           '<li><b>三、</b>本同意書不影響本人依法令、國際公約及本公司運送契約條款所享有之其他權利。'
           'This consent does not affect any other right under law, international conventions or the Conditions of Carriage.</li></ol>'
         + staff_sign())
    return '<div class="frm">' + a + b + '</div>'

# ─────────────────────────────────────────────────────────────────────────────
# 三、《員工管理辦法》Rev. C：新增第八章「主管職務及出勤點名」（考核與功過之後；前面的條次不變）
# ─────────────────────────────────────────────────────────────────────────────
HR_NEW = [
 ('主管職務之設置', pol6.P('本公司於各部門設主管職務，分為 <b>Manager I</b>、<b>Manager II</b> 及 <b>Manager III</b> 三級，由執行長或該部門之 Manager III 自在職員工中任命、調整或撤銷，並以系統通知當事人。')
   + pol6.OL('Manager I、Manager II 及 Manager III 之每月職務加給依序為新臺幣八千元、一萬五千元及二萬五千元，自任命之月起併入當月薪資；撤銷者自撤銷之次月起停止給付。',
             '主管職務之任命及撤銷不影響本薪、年資及職級；同一員工同時僅得擔任一項主管職務。',
             '本辦法施行時，本公司依各部門人數隨機選任首批主管，嗣後依前項規定調整。')),
 ('地勤主管及所屬組員', pol6.P('地勤主管（Manager I 及 Manager II）管理同一站別、同一班別時間帶之組員；Manager III 督導全站。')
   + pol6.OL('桃園站依班別輪替組分組：同一輪替組之組員每週均排同一時間帶，每組十人至十五人（含主管）配置一名主管，組別固定。',
             '松山站人數較少，依當週時間帶分組；該時間帶無主管者，由站主管（Manager II）代管。',
             '主管得於系統將所屬組員改派予其他主管，改派紀錄保存於「主管紀錄」。')),
 ('出勤點名及無故缺席', pol6.P('主管應於組員報到時點名，記錄為出勤、遲到或無故缺席：地勤由所屬地勤主管點名；客艙由當班<b>座艙長</b>（Manager II 層級）及<b>副座艙長</b>（Manager I 層級）點名該班全體客艙組員；<b>總座艙長</b>（Manager III）負責客艙組員之培訓及組員事宜，得查閱全部點名紀錄。')
   + pol6.OL('無正當理由未於班表時間報到且未請假者，記<b>警告一次</b>（績效係數減百分之二），並<b>扣除當日工資</b>（月薪除以三十），於當月薪資扣除，並通知本人。',
             '點名錯誤經主管更正為出勤或遲到者，警告及扣薪一併撤回。',
             '繼續曠職三日或一個月內曠職達六日者，依勞動基準法第十二條第一項第六款辦理。')),
 ('機師晉升考核', pol6.P('副機長晉升機長、機長晉升教官，由教官於系統登錄晉升考核之日期、結果（通過或不通過）及評語；通過者依第十條所定職級晉升程序送核，核准後第三十日生效並自生效日起重新排班；不通過者僅保存紀錄，不影響其他權益。')),
]
def hr_rev_c():
    d = hr_doc.doc()
    chs = pol6.parse(d['h'])
    i = [c['name'] for c in chs].index('考核與功過')
    chs.insert(i + 1, dict(name='主管職務及出勤點名', arts=[dict(no=0, t=t, b=b) for t, b in HR_NEW]))
    pol6.number(chs)
    h = pol6.serial(chs)
    n = sum(len(c['arts']) for c in chs)
    # 條次只在新章之後往後移（第二十五條以後）；辦法內引用的第二十二、二十四條不受影響
    assert n == 36, n
    ver = '2026.10（Rev. C）'
    meta = copy.deepcopy(d['meta'])
    for r in meta:
        for j in (0, 2):
            if len(r) > j + 1:
                k = r[j].replace('　', '').replace(' ', '')
                if k == '版次': prev = r[j + 1]; r[j + 1] = ver
                if r[j] == '核定日期': r[j + 1] = APPROVED
                if r[j] == '生效日期': r[j + 1] = EFF
                if r[j] == '條文總數': r[j + 1] = '全文 %d 條' % n
    for r in meta:
        if r[0] == '前一版次': r[1] = '2026.10（Rev. B）'
    rev = [['2026.10', 'Rev. C', EFF, '增訂第八章「主管職務及出勤點名」（第二十五條至第二十八條）：主管職務分 Manager I／II／III 三級及每月職務加給新臺幣八千元／一萬五千元／二萬五千元；'
            '地勤主管依同站、同班別時間帶之輪替組管理十人至十五人；客艙由當班座艙長、副座艙長點名，總座艙長負責培訓；無故缺席記警告一次並扣當日工資，登錄錯誤得撤回；'
            '機師晉升由教官登錄考核結果。原第二十五條以下條次依序遞移。聘僱契約範本另訂 KGM-HR-018。']] + d['rev']
    return dict(id=hr_doc.ID, t=d['t'], en=d['en'], ver=ver, h=h, kick='人 事 規 章', meta=meta, sign=d['sign'], rev=rev, arts=n)

CSS_X = r'''
p.lead{text-indent:0;font-weight:700;margin:4mm 0 2mm}
.art p.en{text-indent:0}
h4.ch.pb{page-break-before:always}
h4.ch.lat{letter-spacing:.04em}
p.sub{text-align:center;text-indent:0;margin:-3mm 0 4mm;font-size:10.5pt}
.frm table.ff td{padding:1.2mm 2.2mm;line-height:1.45}.frm h5{margin:3.2mm 0 1.4mm}.frm .ck{gap:.6mm 6mm;font-size:10pt}.frm table.sg td{height:30mm}.frm p{margin:0 0 1.2mm}.frm ol.kuan li{font-size:10.5pt;line-height:1.6}
h5{font-size:11.5pt;margin:5mm 0 2mm;page-break-after:avoid}
span.bl{display:inline-block;min-width:34mm;border-bottom:.6pt solid #000;line-height:1.2}
span.bl.s{min-width:12mm}span.bl.l{min-width:80mm}
span.bx{font-family:"LXGW WenKai";font-size:12pt}
table.pt,table.ff,table.sg{width:100%;border-collapse:collapse;font-size:10.5pt;line-height:1.7;margin:2mm 0 3mm;page-break-inside:avoid}
table.pt th,table.sg th{border:.8pt solid #000;background:#eee;padding:1.8mm 2.4mm;text-align:left}
table.pt td,table.ff td,table.sg td{border:.8pt solid #000;padding:2mm 2.4mm;vertical-align:top}
table.pt td.k{width:46mm}
table.ff td.k{width:30mm;background:#f6f6f6}
table.ff td.k small,.ck small{display:block;font-size:8.5pt;color:#333}
table.sg td{height:38mm;width:50%}
.ck{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 6mm;font-size:10.5pt;line-height:1.5;margin:1mm 0 3mm}
.ck small{display:inline;margin-left:2mm}
.kp{margin:5mm 0 3mm;font-size:10.5pt}
p.sm{font-size:9pt;line-height:1.6;text-indent:0;color:#222}
'''

def custom_html(c, toc):
    css = RP.CSS % dict(F=RP.FONT, ID=c['id'], VER=c['ver']) + CSS_X
    rev = '<tr><th style="width:15%">版次</th><th style="width:15%">修訂編號</th><th style="width:18%">生效日期</th><th>修訂要旨</th></tr>'
    rev += ''.join('<tr><td>%s</td><td>%s</td><td>%s</td><td class="w">%s</td></tr>' % tuple(r) for r in c['rev'])
    return ('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>%s %s</title><style>%s</style></head><body>'
            '<div class="docid" style="height:0;overflow:hidden">%s　%s</div>%s'
            '<div class="tocw"><h2 class="sec">修訂履歷</h2><table class="rev">%s</table><h2 class="sec">目　　錄</h2>%s</div>'
            '%s<div class="end">%s全文完　—　%s　%s</div></body></html>'
            % (c['id'], c['t'], css, c['id'], c['t'], RP.cover_html(c), rev, toc, c['h'], c.get('endk', '本文件'), c['id'], c['ver']))

def toc_list(rows):
    return '<div class="toc">' + ''.join('<div class="c"><span><span class="n">%s</span>%s</span><span>%s</span></div>%s' % (a, b, c, ('<div class="a">' + d + '</div>') if d else '') for a, b, c, d in rows) + '</div>'

def cover_meta(did, ver, arts_txt, owner, level, scope, cls):
    return [['文件編號', did, '版　　次', ver], ['核定日期', APPROVED, '生效日期', EFF], ['前一版次', '—（首次發布）', '條文總數', arts_txt],
            ['主辦單位', owner, '核定層級', level], ['文件等級', cls, '保存年限', '永久保存（電子檔）'], ['適用範圍', scope]]

def jobs():
    out = []
    ctr = dict(id='KGM-HR-018', t='員工聘僱契約書（範本）', en='Employment Contract (Template)', ver=VER, h=contract_body(), kick='人 事 規 章',
               meta=cover_meta('KGM-HR-018', VER, '中文本、英文本各 %d 條' % len(C_ZH), '人力資源處', '董事長',
                               '本公司與全體員工簽訂之聘僱契約（中英對照，以中文本為準）。', '內部規章（Internal）'),
               sign=['人力資源處', '法務暨法令遵循室', '營運管理委員會', '董事長'], rev=[['2026.10', 'Rev. A', EFF, '首次發布。甲方／乙方聘僱契約範本，中文本及英文本條次一一對應；工資、主管職務加給、出勤及無故缺席與《員工管理辦法》Rev. C 一致。']],
               endk='本契約')
    toc = toc_list([('中文本', '員工聘僱契約書', '第 1–%d 條' % len(C_ZH), ''.join('第 %d 條　%s<br>' % (i + 1, t) for i, (t, _) in enumerate(C_ZH))),
                    ('英文本', 'Employment Contract', 'Art. 1–%d' % len(C_EN), ''.join('Article %d　%s<br>' % (i + 1, t) for i, (t, _) in enumerate(C_EN)))])
    out.append(('18_KGM_員工聘僱契約書範本（中英對照）.pdf', ctr, toc))
    cs = dict(id='KGM-FRM-019', t='旅客同意書格式', en='Passenger Consent Forms', ver=VER, h=consent_body(), kick='表 單 格 式',
              meta=cover_meta('KGM-FRM-019', VER, '表單二種', '旅客服務處', '營運管理委員會',
                              '機上設備故障補償及非自願降艙時與旅客簽署；金額現場填寫。', '對外使用（Public）'),
              sign=['旅客服務處', '法務暨法令遵循室', '總經理', '營運管理委員會'], rev=[['2026.10', 'Rev. A', EFF, '首次發布。表一機上設備故障補償同意書、表二非自願降艙同意書，中英對照，補償金額及方式留空現場填寫。']],
              endk='本表單')
    toc2 = toc_list([('表一', '機上設備故障補償同意書', 'Form 1', 'In-flight Equipment Malfunction — Compensation Consent<br>'),
                     ('表二', '非自願降艙同意書', 'Form 2', 'Involuntary Downgrade — Acknowledgement and Consent<br>')])
    out.append(('19_KGM_旅客同意書格式（設備故障補償・非自願降艙）.pdf', cs, toc2))
    return out

# ─────────────────────────────────────────────────────────────────────────────
# 四、登機組別（RES-002 Rev. C、CKI-005 Rev. B、FFP-011 Rev. C）：條文修改跟網站內嵌條文同一份（bz_pol12.py）
# ─────────────────────────────────────────────────────────────────────────────
import bz_pol12 as BZ
def zone_jobs():
    out = []
    for k, fn in BZ.FILES.items():
        j = [c for f, c in RP.JOBS if f == fn]
        c = copy.deepcopy(j[0]) if j else RP.from_meta(fn, k, RP.DOCS[k], '規 章 文 件')
        d = BZ.apply(k, dict(h=c['h'], ver=c['ver']))
        c['h'], c['ver'] = d['h'], d['ver']
        # PDF 左右對齊時，一行裡只有「第 2 組」「ZONE 2」的半形空白能拉開 → 會拉出大空隙；改成窄的不換行空白（不會被拉開，也不會在中間斷行）
        c['h'] = re.sub(r'ZONE (\d)', 'ZONE\u202f\\1', re.sub(r'第 (\d) 組', '第\u202f\\1\u202f組', c['h']))
        c['h'] = c['h'].replace('波音 777-9 或空中巴士 A380 執飛者', '波音\u202f777-9\u202f或空中巴士\u202fA380\u202f執飛者')
        for r in c['meta']:
            for i in (0, 2):
                if len(r) > i + 1:
                    key = r[i].replace('　', '').replace(' ', '')
                    if key == '版次': r[i + 1] = c['ver']
                    if r[i] == '前一版次': r[i + 1] = BZ.VER[k][0]
                    if r[i] == '核定日期': r[i + 1] = APPROVED
                    if r[i] == '生效日期': r[i + 1] = EFF
        v = re.match(r'(\d{4}\.\d\d)（(Rev\. [A-Z])）', c['ver'])
        c['rev'] = [[v.group(1), v.group(2), EFF, BZ.REV[k]]] + c['rev']
        out.append((fn, c))
    return out

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    paths, todo = [], []
    for fn, c, toc in jobs():
        p = os.path.join(OUT, fn.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(custom_html(c, toc)); paths.append(p); todo.append((fn, p))
    for fn, c in zone_jobs():
        p = os.path.join(OUT, fn.replace('.pdf', '.html')); open(p, 'w', encoding='utf-8').write(RP.doc_html(c)); paths.append(p); todo.append((fn, p))
    hr = hr_rev_c()
    p = os.path.join(OUT, '17_KGM_員工管理辦法.html'); open(p, 'w', encoding='utf-8').write(RP.doc_html(hr)); paths.append(p); todo.append(('17_KGM_員工管理辦法.pdf', p))
    subprocess.check_call([sys.executable, os.path.join(P10, 'pol', 'mkfont_lxgw.py'), PKG, RP.FONT] + paths)
    from weasyprint import HTML
    for fn, p in todo:
        HTML(filename=p).write_pdf(os.path.join(OUT, fn)); print('ok', fn)
    import json
    json.dump(dict(arts=hr['arts'], ver=hr['ver']), open(os.path.join(OUT, 'hr001_meta.json'), 'w'))

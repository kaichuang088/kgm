# 1101B：《航班異常處理及旅客權益辦法》KGM-IRR-013 Rev. B——增訂第 8 條之一「座位之非自願調整」（網站 1101A 已做：航班資料調整座位＝非自願、補償二擇一），
#   網站內嵌（gen_r28 RW）與 PDF（pol/irr29_pdf.py）用這同一份。條號用「之一」，其他條號不動。
import json, os
ID = 'KGM-IRR-013'
ART = ('<div class="art"><span class="t">第 8 條之一　座位之非自願調整</span>'
       '<p>為維持載重平衡，或因機型變更、Payload 限座等營運需要，本公司於航班資料系統調整旅客座位者，屬非自願調整，依下列方式處理：</p>'
       '<ol class="kuan">'
       '<li><b>一、</b>依序先調整由系統自動劃位（未自行選位）之旅客，其次為經濟艙基本票價之旅客，最後始調整已自行選定座位之旅客；</li>'
       '<li><b>二、</b>系統自動劃位之旅客被調整者，以電子郵件及站內通知告知新座位，不另補償；</li>'
       '<li><b>三、</b>已自行選定座位之旅客被調整者，已付選位費全額退還，並另提供下列補償，由旅客於「行程管理」二擇一：（一）哩程：短程航段五百哩、長程航段一千二百哩；（二）機場抵用券：短程航段美金二十元、長程航段美金三十元；</li>'
       '<li><b>四、</b>每次調整均留存紀錄並寄送通知。</li></ol>'
       '<p>旅客自行申請更換座位者，不適用本條。</p></div>')
ANCHOR = '加計百分之十之補償。</p></div>'
VER_OLD, VER_NEW = '2026.09（Rev. A）', '2026.11（Rev. B）'
EFF_NEW = '2026-11-08'
def doc(path=None):
    path = path or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '1026C', 'docs_r914.json')
    d = dict(json.load(open(path, encoding='utf-8'))[ID])
    assert d['h'].count(ANCHOR) == 1
    d['h'] = d['h'].replace(ANCHOR, ANCHOR + ART); d['ver'] = VER_NEW; d['eff'] = EFF_NEW; d['arts'] = d['arts'] + 1
    return d

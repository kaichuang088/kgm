from common import *
import json
# ══ 1026C ═══════════════════════════════════════════════════════════════
#   使用者（1026B 交付後）訊息，逐條見 notes/1026C-pass129-notes.md。
#   比對基準：1026B 最終版 w23（/tmp/j/kgm1026B_w23.html，patches/1026B/build.sh 重建）。
CUR=open('/tmp/j/kgm1026B_w23.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 1：夏令時間（js/bt26.js 改版：輪擋／飛行時間依日期的時差；TZ 表本身不動）══
_bt26old=open('../1026B/js/bt26.js',encoding='utf-8').read()
RW('bt26 dst',_bt26old,JS('bt26.js'))

# ══ 2：時刻異動通知（js/sc27.js，接在 zn26 後面）══
_zn=open('../1026B/js/zn26.js',encoding='utf-8').read()
RW('sc27 embed',_zn,_zn+JS('sc27.js')+JS('ch27.js'))

# ══ 1b：航班動態等畫面的 UTC 換算（_utcOf）也用依日期的時差（航班動態卡片寫的飛行時間、抵達日期）══
RW('utcOf dst',"return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tzMin(ap))*60000;",
   "var _tz27=_tzMin(ap);try{if(window.kgmTzAtR1026C)_tz27=Math.round(window.kgmTzAtR1026C(ap,String(dateISO).slice(0,10))*60)}catch(_){}   /* 1026C：夏令時間 */\n  return Date.UTC(+d[0],+d[1]-1,+d[2],0,0,0)+(((+t[0])*60+(+t[1]))-_tz27)*60000;")

# ══ 4：販售通路（js/ch27.js）：夥伴營運一般訂票配額、只開放包機／只開放旅客訂購 —— sell54 最前面問（在團體之前：只開放旅客訂購的班團體也不能訂）══
RC('sell54 channel','kgm-0823c-r54',"  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}",
   "  if(window.kgmChannelSellR1026C){var c27=window.kgmChannelSellR1026C(code,date,flight);if(c27!=null)return c27}   /* 1026C：販售通路 */\n  if(window.kgmGrpSellR1025B){var g25=window.kgmGrpSellR1025B(code,date,flight);if(g25!=null)return g25}")
RW('sales S init','warZonesR1026B:LS.get("kgm26_zones",null),','warZonesR1026B:LS.get("kgm26_zones",null),salesModeR1026C:LS.get("kgm27_salesmode",null),')
RW('sales save','LS.set("kgm26_zones",S.warZonesR1026B||null);','LS.set("kgm26_zones",S.warZonesR1026B||null);LS.set("kgm27_salesmode",S.salesModeR1026C||null);')

# ══ 3：團體訂位兩方案（js/grp25_27.js＝mkgrp27.py＋mkgrp27b.py 在現行 grp25 上逐段改；js/grp27x.js 團體不能網路報到）══
RW('grp27',open('js/grp25_cur.js',encoding='utf-8').read(),JS('grp25_27.js')+JS('grp27x.js'))
RW('grp27 seat text','const _seat929=_staffFare?(LANG==="en"?"Assigned at check-in":"報到時指派")',
   'const _seat929=(FARES[c]&&FARES[c].groupPlanR1026C)?(LANG==="en"?"Paid seat selection (after ticketing, until 72h before departure)":"付費選位（開票後至起飛前 72 小時）"):_staffFare?(LANG==="en"?"Assigned at check-in":"報到時指派")')

RW('grp27 counter fee','_cv6(chgLabel||"—")+(_staffFare?"":`<small class="k929-chgn">',
   '_cv6(chgLabel||"—")+(_staffFare?"":(FARES[c]&&FARES[c].groupPlanR1026C)?`<small class="k929-chgn">${LANG==="en"?"Per passenger · counter same fee":"每位旅客 · 櫃檯同價"}</small>`:`<small class="k929-chgn">')   # 1026C：團體方案改票費一律方案金額
# ══ 3b：寄信清單（後台「寄信事件」）：團體兩方案、帳號人工新增、時刻異動信 ══
RW('mail list sched',"{ev:'flight.schedule_changed', who:'ext', zh:'季節班表調整',    en:'Seasonal schedule change',   when:'冬夏季班表切換'}",
   "{ev:'flight.schedule_changed', who:'ext', zh:'季節班表調整／時刻異動',    en:'Schedule change',   when:'冬夏季班表切換；或時刻調整（輪擋彈性、夏令時間）後已開票訂位的時刻跟現行班表不同：每筆真實訂位寄一次、分批寄，模擬資料不寄'}")
RW('mail list grp',"  {ev:'group.reduced',who:'ext',zh:'團體人數減少・尾款更新',en:'Group size reduced',when:'旅行社減少人數（最多 3 位），寫明剩餘人數與新尾款'},",
   "  {ev:'group.reduced',who:'ext',zh:'團體人數減少・尾款更新',en:'Group size reduced',when:'旅行社減少人數（名單期限前優惠 3 位／彈性 6 位免手續費，超過每位收退票手續費），寫明剩餘人數與新尾款'},\n"
   "  {ev:'group.pax_added',who:'ext',zh:'團體人數增加・尾款更新',en:'Group size increased',when:'旅行社加人（依當天剩餘座位；名單期限前優惠 3 位／彈性 6 位免手續費，超過每位收改票手續費），寫明人數與新尾款'},")
RW('mail list grp bal',"when:'尾款期限（最慢起飛前 14 天）前每 7 天一次，剩 3 天、1 天再寄；團體業務也可手動寄'}",
   "when:'尾款期限（優惠：起飛前 21 天／彈性：起飛前 7 天）前每 7 天一次，剩 3 天、1 天再寄；團體業務也可手動寄'}")
RW('mail list grp bind',"when:'AI 客服依案件號完成旅行社帳號綁定，可開始團體訂位'}",
   "when:'AI 客服審核通過或團體業務人工新增帳號，寫明可訂團體票的開放期間'}")

# ══ 3c：《團體訂位規章》KGM-GRP-021（grp_doc.py，PDF 同一份）：網站內嵌、辦法份數 17→18、團體訂位付款前要同意 ══
import grp_doc
RW('grp policy doc',"window.kgmPolicyDocR914=function(id){",
   "/* 1026C：《團體訂位規章》（patches/1026C/grp_doc.py，PDF 同一份） */\nwindow.KGM_POLICY_DOCS_R914[\"KGM-GRP-021\"]="+json.dumps(grp_doc.doc(),ensure_ascii=False)+";\nwindow.kgmPolicyDocR914=function(id){")
RW('grp policy audit',"if(o.docs!==17)o.bad.push('辦法份數 '+o.docs+'（應為 17）');","if(o.docs!==18)o.bad.push('辦法份數 '+o.docs+'（應為 18）');   /* 1026C：加 KGM-GRP-021 */")
RW('grp policy gate',"  {fn:'doPay',                    ids:['KGM-GC-001','KGM-CON-006'],",
   "  {fn:'doPay',                    get ids(){try{if(S&&S.search&&S.search.grp25)return ['KGM-GC-001','KGM-CON-006','KGM-GRP-021']}catch(_){}return ['KGM-GC-001','KGM-CON-006']},   /* 1026C：團體訂位付款另要同意 KGM-GRP-021 */")

open('p_h_r27.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))

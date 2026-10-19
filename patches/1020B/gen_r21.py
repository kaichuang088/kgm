from common import *
import json
# ══ 1020B ═══════════════════════════════════════════════════════════════════
#   使用者（1020A 交付後，版號 1020B）：
#   「最底下那一排要FIX喔」（下排五鈕要固定在畫面最底）、「手機登入放右上角按鈕」→「右上角只要登入就好進去之後就是會員資料 其他的功能一樣放在左邊」
#   「KX104/KX103不應該是A21N!」「TPE-NRT可以有1-2班改成A21N 如果有A388了」「KX120/KX119可改成其他小一點的機型」
#   「KX304夏季改成A359/B779，冬季維持A388」（→ 選「A359/B779 輪流（EQV）」）「Qatar也要Code Share 他是OneWorld欸 Etihad保留」
#   「加入這航班夏季冬季你自己算KX2 TPE-DOH 00:30-05:40 (B779/每週四班), KX2 TPE-DOH 17:55-23:05 (A359/每週三班), KX1 DOH-TPE 09:05-22:05 (B779/每週四班), KX1 DOH-TPE 01:55-14:55 (A359/每週三班)」
#     （A359 那組會跟 B779 的 KX1 同一天兩班 → 使用者選改用 KX100／KX99）
#   「KX306/KX305冬季改成A21N 既然KX304都是A388了」「KX398/KX397縮小機型」「同意加入三台A21N」「TPE-XMN/XMN-TPE飛行時間不make sense」
#   「KUL可以不用那麼多A359, 甚至有一班可以改A21N， A359應該分配更多到其他航線」「HAN可以有一班是A21N」「KX228/KX227改A21N」「MNL也可以EQV沒差」
#   「CNX每日兩班都A21N」「KX78/KX77我想改成每週五班 這樣飛機排法可以更好」（「這一班可以A35K/B789如果要的話」→ 不改，維持 B779）
#   「航班動態可能那個航班那一天沒有飛不能顯示喔！ 圖二頁面有待加強」「圖三聯營那邊資料不全喔」（時刻表聯營頁機型、飛行時間）
#   KHH 這一輪先不做（使用者選「這輪先不加，之後給清單」）。
#   比對基準：1020A 最終版 w5（/tmp/j/kgm1020A_w5.html，patches/1020A/build.sh 重建）。
CUR=open('/tmp/j/kgm1020A_w5.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ 機型定案（MAP18，1018A tf18）════════════════════════════════════════════
RW('map18 a339r 1',"KX261:'A339R',KX262:'A339R',KX263:'A339R',KX264:'A339R',KX175:'A339R',KX176:'A339R',",
   "KX261:'A339R',KX262:'A339R',KX263:'A21N',KX264:'A21N',KX175:'A339R',KX176:'A339R',")   # 1020B：清邁兩班都 A21N
RW('map18 a339r 2',"KX195:'A339R',KX196:'A339R',KX245:'A339R',KX246:'A339R',KX251:'A339R',KX252:'A339R',KX133:'A339R',KX134:'A339R',",
   "KX195:'A339R',KX196:'A339R',KX245:'EQV',KX246:'EQV',KX251:'EQV',KX252:'EQV',KX133:'A339R',KX134:'A339R',")   # 1020B：馬尼拉 EQV
RW('map18 b78x mnl',"KX247:'B78X',KX248:'B78X',KX249:'B78X',KX250:'B78X',KX105:'B78X',KX106:'B78X',",
   "KX247:'EQV',KX248:'EQV',KX249:'EQV',KX250:'EQV',KX105:'B78X',KX106:'B78X',")
RW('map18 kx104',"KX253:'A21N',KX254:'A21N',KX103:'A21N',KX104:'A21N'",
   "KX253:'A21N',KX254:'A21N',KX103:'A359',KX104:'A359'")   # 1020B：「KX104/KX103不應該是A21N!」→ A359（使用者：A359 要分到更多航線）
RW('map18 nrt',"KX181:'A388',KX182:'A388',KX183:'A359',KX184:'A359',KX185:'B779',KX186:'B779',KX187:'A359',KX188:'A359'",
   "KX181:'A388',KX182:'A388',KX183:'A359',KX184:'A359',KX185:'B779',KX186:'B779',KX187:'A21N',KX188:'A21N',\n"
   "    /* 1020B：使用者逐條指定（KX304／303、KX306／305 冬夏不同機型寫在 js/fl20b.js） */\n"
   "    KX179:'A21N',KX180:'A21N',KX119:'A21N',KX120:'A21N',KX397:'A359',KX398:'A359',KX223:'A21N',KX224:'A21N',KX219:'A339R',KX220:'A339R',\n"
   "    KX215:'A21N',KX216:'A21N',KX227:'A21N',KX228:'A21N'")

# ══ 新航線 台北—杜哈（底表；季節時刻寫在 r77 定值表）══════════════════════════
RW('doh base rows','["KX304","TPE","PVG","09:15","10:30","A388","daily",null,0],',
   '["KX304","TPE","PVG","09:15","10:30","A388","daily",null,0],\n'
   '["KX2","TPE","DOH","00:30","05:40","B779","MWFSU",null,0],\n["KX1","DOH","TPE","09:05","22:05","B779","MWFSU",null,0],\n'
   '["KX100","TPE","DOH","17:55","23:05","A359","TTHS",null,0],\n["KX99","DOH","TPE","01:55","14:55","A359","WFSU",null,0],')
# 0809C 的開頁計時器把「所有」KX100／KX99 改名成 KX74／KX73（台北—曼谷—巴黎那組的舊班號），新的杜哈線會被改掉 → 杜哈線除外
RW('0809C rename only BKK',"        if(f.code==='KX100')f.code='KX74';\n        if(f.code==='KX99')f.code='KX73';",
   "        if(f.code==='KX100'&&f.fr!=='DOH'&&f.to!=='DOH')f.code='KX74';   /* 1020B：杜哈線（新的 KX100／KX99）不改，其餘照舊（曼谷—巴黎那組還是改成 KX74／KX73） */\n"
   "        if(f.code==='KX99'&&f.fr!=='DOH'&&f.to!=='DOH')f.code='KX73';")

# ══ r77 定值表：杜哈線、KX78/77 每週五班、廈門時刻 ══════════════════════════════
RC('tt20b fixed','kgm-0823p-r77',
   "      ,'KX37|BOS|TPE':{summer:['00:20','04:55',1,[2,4,5,7],'B789'],winter:['00:05','04:50',1,[2,4,5,7],'B789']}\n    };",
   "      ,'KX37|BOS|TPE':{summer:['00:20','04:55',1,[2,4,5,7],'B789'],winter:['00:05','04:50',1,[2,4,5,7],'B789']}\n"
   "      /* 1020B：台北—杜哈（使用者給的是夏季；冬季：去程逆風多 10 分、回程順風少 10 分，起飛差 15 分），B779 週一三五日、A359 週二四六（回程隔天三五日） */\n"
   "      ,'KX2|TPE|DOH':{summer:['00:30','05:40',0,[1,3,5,7],'B779'],winter:['00:15','05:35',0,[1,3,5,7],'B779']},'KX1|DOH|TPE':{summer:['09:05','22:05',0,[1,3,5,7],'B779'],winter:['09:20','22:10',0,[1,3,5,7],'B779']}\n"
   "      ,'KX100|TPE|DOH':{summer:['17:55','23:05',0,[2,4,6],'A359'],winter:['17:40','23:00',0,[2,4,6],'A359']},'KX99|DOH|TPE':{summer:['01:55','14:55',0,[3,5,7],'A359'],winter:['02:10','15:00',0,[3,5,7],'A359']}\n"
   "      /* 1020B：KX78/77（台北—曼谷—倫敦）每週五班：一三四六日（KX62 二五日續飛倫敦，兩班合起來倫敦每天都有）；時刻不變 */\n"
   "      ,'KX78|TPE|BKK':{summer:['10:35','12:45',0,[1,3,4,6,7],'B779'],winter:['11:05','13:20',0,[1,3,4,6,7],'B779']},'KX78|BKK|LHR':{summer:['14:00','19:35',0,[1,3,4,6,7],'B779'],winter:['14:35','20:55',0,[1,3,4,6,7],'B779']}\n"
   "      ,'KX78|TPE|LHR':{summer:['10:35','19:35',0,[1,3,4,6,7],'B779'],winter:['11:05','20:55',0,[1,3,4,6,7],'B779']}\n"
   "      ,'KX77|LHR|BKK':{summer:['21:45','14:10',1,[1,3,4,6,7],'B779'],winter:['21:15','14:25',1,[1,3,4,6,7],'B779']},'KX77|BKK|TPE':{summer:['15:25','19:50',0,[1,2,4,5,7],'B779'],winter:['15:40','20:00',0,[1,2,4,5,7],'B779']}\n"
   "      ,'KX77|LHR|TPE':{summer:['21:45','19:50',1,[1,3,4,6,7],'B779'],winter:['21:15','20:00',1,[1,3,4,6,7],'B779']}\n"
   "      /* 1020B：廈門原本 50 分（不合理）→ 去程 1h20／冬 1h25、回程 1h10／冬 1h15；回程寫成過站規則（60 分、冬夏錯開 20 分）推完的定值，開頁不再位移 */\n"
   "      ,'KX320|TPE|XMN':{summer:['12:30','13:50',0,'daily','A21N'],winter:['12:15','13:40',0,'daily','A21N']},'KX319|XMN|TPE':{summer:['14:50','16:00',0,'daily','A21N'],winter:['15:10','16:25',0,'daily','A21N']}\n"
   "    };")

# ══ 三架 A21N（後台「新增飛機」同一份紀錄）══════════════════════════════════════
RW('a21n x3',"try{applyAdded928()}catch(_){}",
   "/* 1020B：使用者「同意加入三台A21N」—— 跟後台「新增飛機」寫同一份紀錄（S.fleetAddedR928），只補一次（builtinR1020B）；從今天起可派 */\n"
   "try{if(!(S.fleetAddedR928||[]).some(function(a){return a&&a.builtinR1020B})){var n20b=58801,used20b={};(S.fleetAddedR928||[]).forEach(function(a){if(a&&a.reg)used20b[a.reg]=1});\n"
   "  S.fleetAddedR928=S.fleetAddedR928||[];for(var i20b=0;i20b<3;i20b++){while(OWNER203['B-'+n20b]||used20b['B-'+n20b])n20b++;used20b['B-'+n20b]=1;\n"
   "    S.fleetAddedR928.push({reg:'B-'+n20b,type:'A21N',ageMonths:0,enteredAt:'2026-10-19',acq:'buy',from:'2026-10-19',at:'2026-10-19T00:00:00.000Z',builtinR1020B:1});n20b++}}}catch(_){}\n"
   "try{applyAdded928()}catch(_){}")

# r203 稽核寫死「新增機身上限 13 架」（使用者歷次核准的數量）；這輪使用者「同意加入三台A21N」→ 13＋3＝16
RC('r203 cap 16','kgm-0907C-r203',"if(o.addedTotal>13)bad.push('加了 '+o.addedTotal+' 架，超過 13 架的上限');",
   "if(o.addedTotal>16)bad.push('加了 '+o.addedTotal+' 架，超過 16 架的上限');   /* 1020B：使用者同意再加三台 A21N（13→16） */")

# ══ 航班動態：卡達航空掛在 KGM 杜哈線（QR 代碼）＋「依航線」「依航班號」重做 —— fb19 → fb20b（r229 同一個位置）══════════
RW('fb20b',JS('fb19.js'),JS('fb20b.js'))
# r38 會掃航班動態頁所有機型文字、往上找班號再改寫；新的卡片（.fs20）沒有 ISO 日期 → 它一路往上爬到整個清單、抓到第一張卡的班號，每張卡都被改成同一種機型。
#   新卡片的機型本來就用 acftNameOf（同一個來源）算好 → r38 跳過 .fs20
RC('r38 skip fs20','kgm-0816b-r38',"      if(TYPE_NAME_RE.test(n.nodeValue||''))hits.push(n);",
   "      if(TYPE_NAME_RE.test(n.nodeValue||'')&&!(n.parentElement&&n.parentElement.closest&&n.parentElement.closest('.fs20')))hits.push(n);   /* 1020B：新的依航線／依航班號卡片自己算好機型，不改 */")

# ══ fl20b：冬夏不同機型、杜哈線生效日、卡達聯營、夥伴機型（放在 MAP18 那一段之後）══════
RW('fl20b embed',"  try{document.addEventListener('DOMContentLoaded',function(){apply18();setTimeout(apply18,4000)})}catch(_){}\n})();\n",
   "  try{document.addEventListener('DOMContentLoaded',function(){apply18();setTimeout(apply18,4000)})}catch(_){}\n})();\n"+JS('fl20b.js'))

# ══ 手機：下排五鈕固定（鍵盤打開時收起）、右上角登入 —— mb20 → mb20b（r229 最前面同一個位置）══════════
RW('mb20b',JS('mb20.js'),JS('mb20b.js'))

open('p_h_r21.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))

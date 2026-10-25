from common import *
import json
# ══ 1025B ═══════════════════════════════════════════════════════════════
#   使用者（1025A 交付後）訊息，逐條見 notes/1025B-pass127-notes.md。
#   比對基準：1025A 最終版 w43（/tmp/j/kgm1025A_w43.html，patches/1023A/build.sh 重建）。
CUR=open('/tmp/j/kgm1025A_w43.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
out=[]

# ══ F：後台按「信用卡驗證」倒回前台 —— 1025A 把卡別表 NET22 換成只有 KGM Cards，瀏覽器裡存著 1022A 產生的舊卡（visa／mc／jcb／amex／cup）
#    → NET22[c.net] 是 undefined → 頁面畫到一半丟錯 → 被丟回首頁。舊卡別只留顯示名稱（不可列舉，不會出現在綁定選單）；
#    1022A 的舊「模擬」卡清掉讓系統重新產生 KGM Cards 模擬資料；會員自己綁的舊卡保留，標「舊卡別」。══
RW('card legacy nets',"var NET22={stark:['KGM Star K',['Visa Signature']],starg:['KGM Star G',['Mastercard World Elite']],starm:['KGM Star M',['Visa Infinite']]};",
   "var NET22={stark:['KGM Star K',['Visa Signature']],starg:['KGM Star G',['Mastercard World Elite']],starm:['KGM Star M',['Visa Infinite']]};\n"
   "  /* 1025B：舊卡別（1022A 綁定的）只留顯示名稱，不可列舉 → 不會出現在綁定選單；沒見過的卡別也給一個名稱，頁面不會因為一筆舊資料整頁壞掉 */\n"
   "  [['visa','Visa'],['mc','Mastercard'],['jcb','JCB'],['amex','American Express'],['cup','UnionPay']].forEach(function(o){try{Object.defineProperty(NET22,o[0],{value:[o[1]+(LANG==='en'?' (legacy, not a KGM Card)':'（舊卡別・不符合現行綁定規定）'),['']],enumerable:false})}catch(_){}});\n"
   "  try{S.cardBindR1022A=(S.cardBindR1022A||[]).filter(function(c){return !(c&&c.simR1022A&&!/^star[kgm]$/.test(c.net))})}catch(_){}\n"
   "  try{(S.cardBindR1022A||[]).forEach(function(c){if(c&&!NET22[c.net])Object.defineProperty(NET22,c.net,{value:[String(c.net||'?').toUpperCase(),['']],enumerable:false,configurable:true})})}catch(_){}")

# ══ B：後台 AI 取消航班（整組輪轉含回程、長程可排除、旅客數含模擬訂位、否定句不再被當成新指令）══
_k23=open('../1023A/js/k23.js',encoding='utf-8').read()
_a=_k23.index("  /* ── ① 取消航班 ── */\n  function findFlights(t){");_b=_k23.index("  function reasonOf(t){",_a)
RW('cx find/start',_k23[_a:_b],JS('cx25.js'))
RW('cx step head',"  function step(t){\n    var P=S.adminAiPendR1023A;if(!P||P.kind!=='cancel')return null;\n    if(Date.now()-P.at>30*60000){S.adminAiPendR1023A=null;return null}\n    if(/^(算了|不要了|放棄|取消對話|cancel|abort)$/i.test(t.trim())){S.adminAiPendR1023A=null;return '好，已放棄，這 '+P.list.length+' 班沒有動。'}\n    P.at=Date.now();\n",
   "  async function step(t){\n    var P=S.adminAiPendR1023A;if(!P||P.kind!=='cancel')return null;\n    if(Date.now()-P.at>30*60000){S.adminAiPendR1023A=null;return null}\n    if(/^(算了|不要了|放棄|取消對話|cancel|abort)$/i.test(t.trim())){S.adminAiPendR1023A=null;return '好，已放棄，這 '+P.list.length+' 班沒有動。'}\n    P.at=Date.now();\n"
   "    /* 1025B：範圍（長程／外站）在任何一步都可以改：重新列出，已回答的原因與補償方案保留 */\n"
   "    var sc2=scopeIn(t,P.sc);\n"
   "    if(P.step==='scope'&&sc2.long==null)return /回程/.test(t)?'回程本來就一起取消（每一組都含同一架飛機的回程／後段）。長程要一起取消嗎？回答「長程不取消」或「長程也取消」。':'請回答「長程不取消」或「長程也取消」（說「算了」放棄）。';\n"
   "    if(P.step==='scope'||sc2.long!==P.sc.long||!!sc2.away!==!!P.sc.away){\n"
   "      var rs={},cp=P.comp,st0=P.step;P.list.forEach(function(x){if(x.reason)rs[x.code]=x.reason});\n"
   "      var msg=await start(P.text,sc2),P2=S.adminAiPendR1023A;if(!P2||P2.kind!=='cancel'||!P2.list.length)return msg;\n"
   "      var hasR=Object.keys(rs).length,r0=hasR?rs[Object.keys(rs)[0]]:'';P2.list.forEach(function(x){if(hasR)x.reason=rs[x.code]||r0});\n"
   "      if(st0==='comp'&&hasR){P2.step='comp';return msg.replace(Q_REASON,'')+'\\n\\n（原因沿用剛才的回答）請回答補償方案：1 退費、2 改搭下一班，可以再加「里程 3000」「餐券」。'}\n"
   "      if(st0==='confirm'&&cp){P2.step='confirm';P2.comp=cp;var s3=sum25(P2.list);return msg.replace(Q_REASON,'')+'\\n\\n（原因與補償方案沿用剛才的回答）請確認：取消 '+P2.list.length+' 班，'+(cp.mode==='refund'?'退這一段實付票價＋附加服務':'改搭同航線下一班')+'；受影響旅客約 '+s3.px.toLocaleString()+' 人、通知線上訂位 '+s3.bk.toLocaleString()+' 筆。回覆「確認」執行，或「算了」放棄。'}\n"
   "      return msg}\n"
   "    var on2=scopeIn(t,{});if((on2.long!=null||on2.away!=null)&&!/天氣|颱風|機械|航管|營運|罷工|疫情|退費|改搭|確認|^\\s*[12](\\D|$)/.test(t))return '範圍沒有變：'+(P.sc.long==='ex'?'長程不取消':(P.sc.long==='in'?'長程一起取消':'沒有長程'))+'、'+(P.sc.away?'外站飛回基地的也取消':'外站飛回基地的照飛')+'，清單不變。'+(P.step==='reason'?Q_REASON:(P.step==='comp'?'\\n\\n請回答補償方案：1 退費、2 改搭下一班，可以再加「里程 3000」「餐券」。':'\\n\\n回覆「確認」執行，或「算了」放棄。'));\n"
   "    if(/回程/.test(t)&&/取消/.test(t)&&P.step==='reason'&&!/天氣|颱風|機械|航管|營運|罷工|疫情/.test(t))return '回程本來就一起取消（每一組都含同一架飛機的回程／後段，已列在清單）。'+Q_REASON;\n")
RW('cx confirm msg',"        +'；系統會通知 '+nb+' 筆訂位、同步航班動態與飛機排班。\\n回覆「確認」執行，或",
   "        +'；受影響旅客約 '+sum25(P.list).px.toLocaleString()+' 人，系統會通知線上訂位 '+nb+' 筆、同步航班動態與飛機排班。\\n回覆「確認」執行，或")
RW('cx done msg',"    return '✓ 已取消 '+done+' 班（'+P.date+'），通知 '+nb+' 筆訂位；",
   "    return '✓ 已取消 '+done+' 班（'+P.date+' 起，含回程／後段），受影響旅客約 '+sum25(P.list).px.toLocaleString()+' 人，通知線上訂位 '+nb+' 筆；")
RW('cx tool async',"  window.kgmAiCancelR1023A=function(a){a=a||{};var t=String(a.text||'')||[a.date||'',a.after?a.after+'以後':'',a.station||'',(a.codes||[]).join(' ')].join(' ');\n    if(!S.adminAiPendR1023A||S.adminAiPendR1023A.kind!=='cancel')return {ok:true,msg:start(t)};var r=step(t);return {ok:true,msg:r||''}};",
   "  window.kgmAiCancelR1023A=async function(a){a=a||{};var t=String(a.text||'')||[a.date||'',a.after?a.after+'以後':'',a.station||'',(a.codes||[]).join(' ')].join(' ');\n    if(!S.adminAiPendR1023A||S.adminAiPendR1023A.kind!=='cancel'||(isCancel(t)&&target25(t)))return {ok:true,msg:await start(t)};var r=await step(t);return {ok:true,msg:r||''}};   /* 1025B：非同步（旅客數分批算） */")
RW('cx isCancel neg',"  function isCancel(t){return /取消/.test(t)&&",
   "  function isCancel(t){if(/(不|別|不要|不用|免)取消|照飛|保留|也要?取消|也取消|一起取消/.test(t)&&!/\\d{1,2}\\s*[\\/月]\\s*\\d{1,2}|今天|今日|明天|後天/.test(t))return false;   /* 1025B：「長程不取消」「回程也要取消」是對目前流程的補充，不是新指令 */\n    return /取消/.test(t)&&")
RW('cx hook await',"if(S.adminAiPendR1023A&&isCancel(t)){S.adminAiPendR1023A=null;r=start(t)}","if(S.adminAiPendR1023A&&isCancel(t)&&target25(t)){S.adminAiPendR1023A=null;r=await start(t)}")
RW('cx hook await2',"if(!r&&S.adminAiPendR1023A)r=step(t);if(!r&&isCancel(t))r=start(t);if(!r)r=q(t)}","if(!r&&S.adminAiPendR1023A)r=await step(t);if(!r&&isCancel(t))r=await start(t);if(!r)r=q(t)}")

# ══ 結尾 ══
open('p_h_r25.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))

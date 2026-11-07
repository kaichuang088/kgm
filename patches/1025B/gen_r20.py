from common import *
import json
# ══ 1020A ═══════════════════════════════════════════════════════════════════
#   使用者（1019A 第二輪交付後）：「手機版上面中間的應該是用Side Bar才對啊」
#   「我個人還是覺得很醜欸 可能要有一定的設計跟電腦有點不同吧 不然真的很不好看」
#   「一、儲存空間滿了 這個我不想再看到這個東東跳出來喔！！！」「請開始1020A（先改手機＋儲存空間）」
#   比對基準：1019A 最終版 w27（/tmp/j/kgm1019A_w27.html，patches/1019A/build.sh 重建）。
CUR=open('/tmp/j/kgm1019A_w27.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def JS(name):return open('js/'+name,encoding='utf-8').read()
def JS19(name):return open('../1019A/js/'+name,encoding='utf-8').read()
out=[]
# ══ 儲存空間：開頁就壓縮（lz20 取代 lz19，同一個位置：第一個 <script> 開頭）══════════════════
RW('lz20',JS19('lz19.js'),JS('lz20.js'))
# ══ 儲存空間：寫入失敗不再跳出提示（先前 1015A 清理＋lz 壓縮都做過了；還是存不進去就只記在 KGM_LS_FAIL_R1012A）══
RW('ls no banner',"    if(Date.now()>=hidUntil)setTimeout(banner,0);\n  };","    /* 1020A：使用者「這個我不想再看到這個東東跳出來」→ 不再自動跳出提示（後台仍可從 kgmLsCleanR1012A() 打開整理面板） */\n  };")
# ══ 手機介面：mb20 取代 mb19（r229 最前面同一個位置）══════════════════════════════════════
RW('mb20',JS19('mb19.js'),JS('mb20.js'))
open('p_h_r20.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))

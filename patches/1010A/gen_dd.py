from common import *
import re
# ── 1006A #16：使用者截圖「KX26 TPE→SEA 00:35–20:10 +-1」—— 跨日寫法一律是 '+'+dd，往回跨一天（-1）就變成「+-1」。
#    加一個共用格式（正數 +1、負數 -1），把所有畫面上的跨日標示換過去（純紀錄用的除錯字串不動）。
R('dd helper',"// ── LANGUAGE ─","/* 1006A：跨日標示（+1／-1）。原本一律 '+'+dd，-1 會變成「+-1」 */\nfunction kgmDdR1006A(n){n=+n||0;return n>0?'+'+n:String(n)}\n// ── LANGUAGE ─")
seen={}
for m in re.finditer(r"(['\"])([^'\"\n]{0,12})\+\1\+((?:[a-zA-Z_]+\.)*dd)\b",SRC):
    lit=m.group(0)
    if lit in seen: continue
    q,pre,expr=m.group(1),m.group(2),m.group(3)
    if pre.endswith('('): continue          # '(+'+f.dd 是改點紀錄字串，不動
    seen[lit]=1
    R('dd '+lit,lit,q+pre+q+'+kgmDdR1006A('+expr+')',SRC.count(lit))
R('dd sg',"'<u>+'+E(sg.dd)","'<u>'+E(kgmDdR1006A(sg.dd))")
save('p_h_dd.js','/* 1006A · 跨日標示 +1／-1 */\n')

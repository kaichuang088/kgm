from common import *
# ══ 1006A #23：「為什麼A35K沒有頭等艙？A35K也有四個啊！」 ══
#   根因：simManifest 對豪經以上所有艙等一律模擬 70–100% 滿（cap×(0.7+rnd×0.3)），頭等只有 4 席 → 幾乎每班 3–4 人；
#   8–60 天前就有約 40% 的 A35K／B779／A359 班次頭等全滿，r49／r54 只列「還有座位」的票種 → F-X 從票價卡消失，看起來就像 A35K 沒有頭等。
#   改成：頭等模擬 30–75%，且模擬旅客最多佔到「容量 − 1」（只有真的訂位才可能把頭等賣滿）。
#   亂數仍然只抽一次，其他艙等的模擬名單完全不變。
R('first sim load',
 "    if(sg.key!==\"econ\")want=Math.min(sg.cap,Math.max(1,Math.round(sg.cap*(0.7+rnd()*0.3))));",
 "    if(sg.key!==\"econ\")want=(sg.key===\"suite\"||sg.key===\"first\")\n"
 "      ?Math.min(Math.max(1,sg.cap-1),Math.max(1,Math.round(sg.cap*(0.3+rnd()*0.45))))   /* 1006A #23：頭等模擬 30–75%，模擬旅客不會把頭等佔滿 */\n"
 "      :Math.min(sg.cap,Math.max(1,Math.round(sg.cap*(0.7+rnd()*0.3))));")
save('p_h_first.js','/* 1006A · 頭等艙模擬載客率（A35K／B779／A359 頭等不再一直售完） */\n')

import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='/* 1004B · 機隊輪轉 */\n'
# ---- 第二次開網站就拆機：舊的一次性遷移旗標 ----
R('rot flags reset','  // ── v0721 一次性遷移 ──\n  try{\n    if(LS.get("kgm_migr","")!=="v0721b"){',
'''  /* 1004B：使用者截圖「第五航權拆機 44」—— 同一個瀏覽器第二次開網站就出現（第一次開永遠 0）。
     原因：下面這幾個「一次性」遷移第一次載入時會先產生一份早期機隊指派，之後的整年重排是在它的基礎上排的；
     第二次載入時旗標已在、全部跳過，重排起點不同，結果 KX73／KX74 等第五航權就拆開。
     機隊排班本來就不存檔（自動航段每次載入都重排），這些旗標對排班沒有意義 —— 每次載入前清掉，
     每一次載入都走第一次載入那條（所有測試驗證過、0 拆機）的路徑。 */
  try{['kgm_migr','kgm_migr2','kgm_migr3','kgm_migr4','kgm_0809f_migrated','kgm_0809g_migrated','kgm_0810j_fleet_migrated','kgm_0810k_fleet_repaired'].forEach(function(k){try{localStorage.removeItem(k)}catch(_){}})}catch(_){}
  // ── v0721 一次性遷移 ──
  try{
    if(LS.get("kgm_migr","")!=="v0721b"){''')
# 1004B：分頁標題「1004B · 1004B · 1004B」—— 去掉舊版號的規則只認 0 開頭（0928B），1 開頭的版號去不掉、每次都往後加
R('title strip any version',"replace(/\\s*·\\s*0\\d{3}[A-Z]\\s*$/,'')","replace(/(\\s*·\\s*\\d{4}[A-Z])+\\s*$/,'')",4)
# 1004B：外站對號回程配對（放在 r72 層裡，跟 kgmFixSplitR929 共用 rowEpoch72／TURN72／unavailable72）
RL('pair return engine','kgm-0823o-r72',"  window.KGM_SPLITFIX_R929=stat;\n  return stat;\n};\nvar ROT72={};","  window.KGM_SPLITFIX_R929=stat;\n  return stat;\n};\n"+open('pair_return.js',encoding='utf-8').read()+"var ROT72={};")
R('pair return after final',"    window.kgmRebuildFleetR72(T(),366,true);\n    window.KGM_ROT_FINAL_MS_R913=Date.now()-t0;","    window.kgmRebuildFleetR72(T(),366,true);\n    try{if(window.kgmPairReturnR1004B)window.kgmPairReturnR1004B()}catch(_){}   /* 1004B：外站對號回程配對 */\n    window.KGM_ROT_FINAL_MS_R913=Date.now()-t0;")
# 1004B：整年重排從今天排起，排班窗起點前一天的暖機結果會留下「外站多一架飛機」（跨機型替換頂替），之後每天變成接力式過夜。
#        實測起點往前 3 天，未來一年外站過夜從 10 次降到 1 次 → 起點是今天時自動從 3 天前排（結束日不變）。
RL('r72 start 3 days earlier','kgm-0823o-r72',"window.kgmRebuildFleetR72=function(start,days,force){\n  start=start||T();days=days||366;",
"window.kgmRebuildFleetR72=function(start,days,force){\n  start=start||T();days=days||366;\n  /* 1004B：排班窗起點的暖機邊界會留下「外站多一架飛機」，之後每天接力過夜（實測 KX344 澳門 97 小時、KX310 浦東 73 小時）。\n     起點是今天時改從 3 天前排起、結束日不變，邊界落在已經過去的日子。 */\n  if(start===T()){start=D(T(),-3);days+=3}")
open('p_g_rot.js','w').write(hdr+'\n'.join(out)+'\n')

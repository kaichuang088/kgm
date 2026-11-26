from common import *
import json
# ══ 1014A ═══════════════════════════════════════════════════════════════════
#   使用者（1012A 交付後）：「你先修吧…先改吧 1014A下一版 票價如果真的是客流量太多可以有時候假裝經濟艙賣完了特別是只有A21N的
#   A388是盡量賣掉 當然旺季應該也賣得掉啦」＋ 1012A 交付時列出的未解決項目。逐項見 notes/1014A-pass118-notes.md。
#   比對基準：1012A 最終版 w40（/tmp/j/kgm1012A_w40.html，由 patches/1012A/build.sh 重建，跟交付檔逐位元相同）。
#   不要改到版號字串（build.sh 最後才換版號）。
CUR=open('/tmp/j/kgm1012A_w40.html',encoding='utf-8').read()
def RW(label,old,new,cnt=1):
    n=CUR.count(old);assert n==cnt,(label,n)
    out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RC(label,layer,old,new,cnt=1):
    i=CUR.index('<script id="'+layer+'"');L=CUR[i:CUR.index('</script>',i)];n=L.count(old);assert n==cnt,(label,n)
    out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
R229='kgm-0909E-r229'
EMB="    window.kgmCrewUpdateR928=function(){"

# ── 1. 兩個分頁同時存檔，新增的 BigDeal 出價被蓋掉（1012A 未解決 D-1）────────────────────────────
#   根因（race14.js／race14t.js 逐步追蹤，w40 3／3 次掉資料）：
#   (a) 「對方剛改過」是看另一個鍵 kgmrev:鍵 的版本號判斷的。兩個分頁各在自己的行程裡、各有一份儲存區快取，
#       實測 A 寫入時已經讀得到 B 剛寫的資料，kgmrev 卻還是舊的 → 判斷成「沒人改過」→ 不合併直接蓋掉 B 的出價。
#       資料跟版本號是兩個鍵，到達對方的時間不一定一樣，版本號不能拿來當唯一依據。
#   (b) 存檔有 0.5 秒合併（_ls0818flush，佇列裡放的是 S 欄位本身的參照）；這半秒內收到對方的 storage 事件，
#       pull(k,false) 直接把自己的 S 換成對方那份，自己剛新增的只剩在佇列裡的舊陣列。
#   修法（都在 r229 同步引擎裡，沒有新的層）：
#   · 每個分頁記住「自己最後寫入／讀入的那一份內容」（LASTS14）；寫入前儲存區的內容跟它不一樣 → 有人改過 → 先合併再寫
#     （原本的版本號判斷保留，兩個條件任一成立都合併）。資料本身同一個鍵，不會有到達時間不一致的問題。
#   · 版本號多記兩個指紋：這次寫入的內容、寫入當下儲存區原本的內容（＝寫的人已經看過、併進去的那一份）。
#     收到對方的寫入時：資料跟版本號指紋對不上 → 版本號還沒到，等另一個事件；
#     寫的人當時看到的不是自己最後知道的那一份 → 對方沒看到自己的修改 → 合併（同一筆以對方為準、兩邊各自新增都保留）後寫回。
#   · 收到事件時本分頁這一份還有沒寫出去的存檔 → 先寫（寫的時候會合併），再讀回來。
RC('sync lasts state',R229,"  var BASE={},TAB=Math.random().toString(36).slice(2,8),_get=Storage.prototype.getItem,_set=Storage.prototype.setItem;",
   "  var BASE={},TAB=Math.random().toString(36).slice(2,8),_get=Storage.prototype.getItem,_set=Storage.prototype.setItem;\n"
   "  /* 1014A：每一份資料「這個分頁最後寫入或讀入的內容」與內容指紋（FNV-1a）；用內容判斷有沒有人改過，不只看 kgmrev 版本號 */\n"
   "  var LASTS14={},LH14={};\n"
   "  function h14(s){s=String(s==null?'':s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+'.'+s.length}\n"
   "  function lh14(k){var s=LASTS14[k];if(s==null)return '';var c=LH14[k];if(c&&c.s===s)return c.h;var h=h14(s);LH14[k]={s:s,h:h};return h}\n"
   "  function last14(k,s){if(s==null)return;s=String(s);LASTS14[k]=s;var c=LH14[k];if(c&&c.s!==s)delete LH14[k]}")
RC('sync pull remembers',R229,"    BASE[k]=revOf(k);\n    /* 1007A",
   "    BASE[k]=revOf(k);if(raw!=null)last14(k,raw);   /* 1014A */\n    /* 1007A")
RC('sync write content check',R229,"          if(cur>(BASE[k]||0)){\n            /* 對方剛改過、這邊還沒讀到 → 先合併再寫 */",
   "          var curS14=_get.call(this,k);   /* 1014A：寫入前儲存區的內容跟這邊最後知道的不同 → 有人改過（不只看版本號；版本號是另一個鍵，可能比資料晚到） */\n"
   "          if(cur>(BASE[k]||0)||(LASTS14[k]!=null&&curS14!=null&&curS14!==LASTS14[k])){\n            /* 對方剛改過、這邊還沒讀到 → 先合併再寫 */")
RC('sync write fingerprint',R229,
   "          if(_get.call(this,k)===String(v)){BASE[k]=Math.max(BASE[k]||0,cur);return}   /* 內容沒變：不寫、不改版本號 */\n          var r=_set.call(this,k,v);\n          var nr=Date.now();if(nr<=cur)nr=cur+1;\n          _set.call(this,'kgmrev:'+k,nr+'|'+TAB);BASE[k]=nr;",
   "          if(_get.call(this,k)===String(v)){BASE[k]=Math.max(BASE[k]||0,cur);last14(k,v);return}   /* 內容沒變：不寫、不改版本號 */\n          var r=_set.call(this,k,v);\n          var nr=Date.now();if(nr<=cur)nr=cur+1;\n"
   "          var hv14=h14(v);LH14[k]={s:String(v),h:hv14};LASTS14[k]=String(v);\n"
   "          _set.call(this,'kgmrev:'+k,nr+'|'+TAB+'|'+hv14+'|'+h14(curS14==null?'':curS14));BASE[k]=nr;   /* 1014A：版本號＋這次內容指紋＋寫入當下原本內容的指紋 */")
RC('sync init lasts',R229,"  try{buildMap();Object.keys(MAP).forEach(function(k){BASE[k]=revOf(k)})}catch(_){}",
   "  try{buildMap();Object.keys(MAP).forEach(function(k){BASE[k]=revOf(k);try{last14(k,_get.call(localStorage,k))}catch(_){}})}catch(_){}")
#   save() 本身也被 r32 延到下一個工作才做（setTimeout 0，合併連續存檔）；這段空檔收到事件一樣會蓋掉自己剛新增的 → 讓 r32 告訴外面有沒有排著
RC('r32 queued state','kgm-0816a-r32',"  window.kgmFlushSaveR32=flushSaveR32;",
   "  window.kgmFlushSaveR32=flushSaveR32;\n  window.kgmSaveQueuedR1014A=function(){return queued};   /* 1014A：同步引擎收到對方寫入時，先把自己排著的存檔做完 */")
RC('sync event conflict',R229,"      if(pull(k,false))changed([k]);",
   "      /* 1014A：本分頁還有沒寫出去的存檔（r32 排著的 save()、0.5 秒合併中的這一份）→ 先寫（寫的時候會合併），不然直接讀入會把自己剛新增的蓋掉 */\n"
   "      try{if(typeof window.kgmSaveQueuedR1014A==='function'&&window.kgmSaveQueuedR1014A()&&typeof window.kgmFlushSaveR32==='function')window.kgmFlushSaveR32()}catch(_){}\n"
   "      try{if(window._ls0818q&&Object.prototype.hasOwnProperty.call(window._ls0818q,k)&&typeof window._lsFlush0818==='function')window._lsFlush0818()}catch(_){}\n"
   "      var c14=conflict14(k);\n"
   "      if(c14<0){setTimeout(function(){try{if(conflict14(k)>0){if(pull(k,true))changed([k]);write14(k)}else if(pull(k,false))changed([k])}catch(_){}},1500);return}   /* 版本號還沒到：等另一個事件（1.5 秒後還沒到就照常讀入） */\n"
   "      if(c14>0){if(pull(k,true))changed([k]);write14(k);return}   /* 對方寫的時候沒看到這邊最後的修改 → 合併後寫回 */\n"
   "      if(pull(k,false))changed([k]);")
RC('sync conflict fns',R229,"  function changed(keys){",
   "  /* 1014A：收到對方的寫入 → 1＝對方沒看到這邊最後的內容（要合併）、0＝照常讀入、-1＝版本號跟資料還對不上（版本號晚到） */\n"
   "  function conflict14(k){\n"
   "    try{var R=String(_get.call(localStorage,'kgmrev:'+k)||'').split('|');if(R.length<4)return 0;   /* 舊版分頁寫的（沒有指紋）照舊 */\n"
   "      var D=_get.call(localStorage,k);if(D==null)return 0;\n"
   "      if(h14(D)!==R[2])return -1;   /* 先看資料跟版本號對不對得上：資料先到、版本號還是上一次（可能是自己寫的那一次）→ 等 */\n"
   "      if(R[1]===TAB)return 0;\n"
   "      if(LASTS14[k]==null||D===LASTS14[k]||R[3]===lh14(k))return 0;\n"
   "      return 1;\n"
   "    }catch(_){return 0}\n"
   "  }\n"
   "  function write14(k){\n"
   "    try{var f=MAP[k],v;if(typeof f==='string')v=S[f];else{v={};try{v=JSON.parse(_get.call(localStorage,k)||'{}')}catch(_){}Object.keys(f).forEach(function(p){v[p]=S[f[p]]})}\n"
   "      var s=window.kgmLsStrR1012A?window.kgmLsStrR1012A(k,v):JSON.stringify(v);localStorage.setItem(k,s);try{if(window._ls8last)window._ls8last[k]=s}catch(_){}\n"
   "    }catch(_){}\n"
   "  }\n"
   "  function changed(keys){")
#   合併時辨認「同一筆」原本先看 pnr：同一個訂位代號可以對去程、回程各出一次 BigDeal（或 Residence）價，
#   合併會把其中一筆當成重複丟掉。競標三份清單改用每一筆自己的 id。
RC('sync merge id first',R229,"  function idOf(x){if(!x||typeof x!=='object')return null;for(var i=0;i<IDK.length;i++)",
   "  var IDFIRST14={kgmbd4:1,kgm_resbid6:1,kgm_resmile6:1},MK14='';   /* 1014A：競標清單以每一筆自己的 id 辨認（同一個訂位可以出好幾筆價） */\n"
   "  function idOf(x){if(!x||typeof x!=='object')return null;if(IDFIRST14[MK14]&&x.id!=null&&x.id!=='')return 'id:'+x.id;for(var i=0;i<IDK.length;i++)")
RC('sync merge key',R229,"    var f=MAP[k];if(!f)return false;var ch=false;",
   "    var f=MAP[k];if(!f)return false;var ch=false;MK14=k;")

# ── 2. 票價庫存紀錄不再無限長大（kgm7_fare3／kgm_seatinv6；1012A 未解決 D-2、使用者同意清已起飛的自動紀錄）────────────
RC('inv14 embed',R229,EMB,open('js/inv14.js',encoding='utf-8').read()+EMB)
RW('inv14 before write',"function kgmLsStrR1012A(k,v){\n  try{\n",
   "function kgmLsStrR1012A(k,v){\n  try{\n"
   "    if((k==='kgm7_fare3'||k==='kgm_seatinv6')&&typeof window.kgmInvTrimR1014A==='function')window.kgmInvTrimR1014A(false);   /* 1014A：自動庫存紀錄超過上限 → 寫入前先整理（兩份一起） */\n")

# ── 3. 經濟艙「營收管理售完」：客流量太多時有時候把經濟艙關掉（A21N 最常；A388 盡量賣、只有旺季真的賣光）────────────
RC('rm14 embed',R229,EMB,open('js/rm14.js',encoding='utf-8').read()+EMB)
RC('rm14 sell54','kgm-0823c-r54',"  return Math.min(inv.left,left);\n}\nsell54.__canonical54=true;",
   "  left=Math.min(inv.left,left);\n"
   "  /* 1014A：需求真的太多時，營收管理有時候把整個經濟艙關掉（顯示售完、往上一艙賣）；規則見 kgmRmEcoCloseR1014A（r229） */\n"
   "  if(cab==='Economy'&&left>0&&typeof window.kgmRmEcoCloseR1014A==='function'){try{if(window.kgmRmEcoCloseR1014A(flight,date))left=0}catch(_){}}\n"
   "  return left;\n}\nsell54.__canonical54=true;")

#   訂票頁上方的七天日期列：當天有航班、只是所選艙等賣完（或被營收管理關掉）時原本寫「無航班」—— 那是錯的，改寫「售完」
RW('strip sold out flag','    return {d,dO:new Date(d+"T00:00:00"),min:mn,act:d===date,past:d<todayISO(),conn:_hasConn&&!_directFare0810J};',
   '    return {d,dO:new Date(d+"T00:00:00"),min:mn,act:d===date,past:d<todayISO(),conn:_hasConn&&!_directFare0810J,has14:fs.length>0||_hasConn};   /* 1014A：有航班但所選艙等售完 */')
RW('strip sold out label','      <div class="dc-price">${x.min!==null?fmtAmt(x.min,curr):(LANG==="en"?"No flights":"\\u7121\\u822a\\u73ed")}</div>',
   '      <div class="dc-price">${x.min!==null?fmtAmt(x.min,curr):x.has14?(LANG==="en"?"Sold out":"\\u552e\\u5b8c"):(LANG==="en"?"No flights":"\\u7121\\u822a\\u73ed")}</div>')
RW('strip sold out class','${x.min===null?" none":""}','${x.min===null?(x.has14?" so14":" none"):""}')   # 售完的那天照樣按得下去（還有別的艙），不是「無航班」的灰格子
#   （月曆 fareCalendarHTML 是舊版、已經沒有任何地方叫它（r11 註明 legacy），不改死碼）
open('p_h_r15.js','w',encoding='utf-8').write('\n'.join(out)+'\n')
print('ops',len(out))

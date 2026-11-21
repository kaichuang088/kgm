# 1108B B5／B6：班號改成「去程奇數、回程偶數」（使用者：「FUK的航班號碼調整一下最早出發的先 然後所有航班號碼我想改成去程是奇數回程是偶數」）
#
# 原本全網 161 對都是去程偶數 N、回程 N−1（例 KX180 台北→成田、KX179 成田→台北）。
# 做法：建置最後一步把整個 HTML 裡 1～3 位數的 KX 班號一律 +1（去程 N→N+1 變奇數、回程 N−1→N 變偶數），
#       「回程＝去程−1」這個關係不變，各引擎用 n−1／n+1 找對號班的地方都不用改；
#       只有「用奇偶判斷去回程／把一對班號分組」的地方要翻過來（FLIPS，數量不符就中止）。
#       福岡（FUK）另外依台北出發時間重排（成對一起換）：07:30→KX171、11:20→KX173、15:10→KX175、18:05→KX177，
#       回程＝去程−1（KX170 11:30、KX172 15:20、KX174 19:25、KX176 07:40）。
#       聯營代碼表 MKT19 的 kx:[…] 是不帶 KX 的數字，也一起換。
#       已經存在使用者瀏覽器的資料（訂位、航班狀態、團體…）由開頁時的遷移程式一次改過（MIG，只跑一次，kgm39_kxnum）。
# 用法：python3 kx39.py <in.html> <out.html>
import re, sys
# 1108C（使用者：「等一下回程是+1喔 eg KX129 tpe-kix, KX130 kix-tpe」）：回程＝去程＋1。
#   舊班號一對＝去程偶數 E、回程 E−1 → 新：去程 E+1（奇數）、回程 E+2（偶數）＝舊去程 +1、舊回程 +3。
#   福岡照出發時間：去程 KX171／173／175／177，回程各自 +1（172／174／176／178）。
#   杭州：舊去程 314、回程 315（重慶回程也是 315）→ 去程 315、杭州回程 316（依航線另外改）、重慶 317／318。
#   KX999（後台新增航班欄位的範例字）不動。各引擎原本用「n−1／n+1、相差 1」找對號班的地方，一律先換回舊班號算、再換回新號（ADDS），結果跟改號前一樣。
FUK = {172: 171, 171: 172, 174: 173, 173: 174, 176: 175, 175: 176, 170: 177, 169: 178}
def mp(n):
    if n in FUK: return FUK[n]
    if n == 999 or n > 999: return n
    return n + 1 if n % 2 == 0 else n + 3

FLIPS = [
    # 全部改用開頁最前面定義的輔助函式（kgmKx*R1108B）：1～3 位數＝新規則（去程奇數、回程＝去程−1），
    # 4 位數（聯營代碼 KX9xxx、空機調派 KX8900、包機…）照舊規則，結果跟改號前一樣。
    # 機型／機身抽選的配對鍵（拿去雜湊；雜湊入口會換回舊班號）
    ("String(_num%2?_num:_num-1)", "String(kgmKxPkR1108B(_num))", 1),
    ("String(num%2?num:num-1)", "String(kgmKxPkR1108B(num))", 2),
    ("var pk=String(code).replace(/\\d+/,'')+String(n%2?n:n-1);", "var pk=String(code).replace(/\\d+/,'')+String(kgmKxPkR1108B(n));", 1),
    # 存設定用的配對鍵（r198／r214 PAIRNO）：用新班號（舊資料由開頁遷移改過）
    ("return String(code).replace(/\\d+/,'')+String(n%2?n:n-1);", "return String(code).replace(/\\d+/,'')+String(kgmKxPnR1108B(n));", 2),
    # 對號班（另一個方向的班號）
    ("'KX'+String(num%2===0?num-1:num+1)", "'KX'+String(kgmKxPairR1108B(num))", 1),
    ("'KX'+(n%2===0?n-1:n+1)", "'KX'+kgmKxPairR1108B(n)", 2),
    ("var pair='KX'+(num%2===0?num-1:num+1);", "var pair='KX'+kgmKxPairR1108B(num);", 1),
    ("var n=+m[1],q=n%2?n+1:n-1;", "var n=+m[1],q=kgmKxPairR1108B(n);", 1),
    ("var pm928=(m%2)?m+1:m-1", "var pm928=kgmKxPairR1108B(m)", 1),
    # 「這班是去程」
    ("n%2===0&&num(d.code)===n-1", "kgmKxOutR1108B(n)&&num(d.code)===kgmKxAddR1108C(n,-1)", 1),
    ("n>0&&n%2===0&&BASE[frOf(x)]", "n>0&&kgmKxOutR1108B(n)&&BASE[frOf(x)]", 1),
    ("var n=+m[1];if(n%2!==0)return;", "var n=+m[1];if(!kgmKxOutR1108B(n))return;", 1),
    # 機型種子（r79 seed79、r88／r92 pairSeed）＝去程班號（拿去雜湊；雜湊入口會換回舊班號）
    ("return 'KX'+(n%2===0?n:n+1);", "return 'KX'+kgmKxSdR1108B(n);", 3),
    # 依一對分組排序（去程在前）
    ("(Math.ceil(na/2)-Math.ceil(nb/2))||(na%2-nb%2)", "(kgmKxPnR1108B(na)-kgmKxPnR1108B(nb))||(kgmKxOutR1108B(nb)-kgmKxOutR1108B(na))", 1),
    # 原本用「班號是 key 的一部分」比對（KX30 會比到 KX305|TPE|PVG）：結果隨編號而變 → 一律整個班號相同才算
    #   （r106 季節時刻找不到時的備援：改號後 KX30 撞到杜哈線，把台北→上海冬季抵達改成 11:00；r48 航班作業報告找預測）
    ("if(String(k).indexOf(h106(f))<0)return;", "if(!kgmKxHasR1108B(String(k),h106(f)))return;", 1),
    ("return k.indexOf(code)>=0&&k.indexOf(date)>=0&&k.indexOf(f.fr)>=0", "return kgmKxHasR1108B(k,code)&&k.indexOf(date)>=0&&k.indexOf(f.fr)>=0", 1),
    # 模擬組員評語的班號由亂數產生（100～399）：亂數照舊，號碼換成新班號（同一班）
    ("flight:'KX'+(100+(hh%300))", "flight:'KX'+kgmKxNewR1108B(100+(hh%300))", 2),
    # 1108C：回程＝去程＋1 以後，「舊班號 ±1／相差 1」不再等於對號班 → 換回舊班號算（kgmKxAddR1108C／kgmKxOldR1108B），結果跟改號前一樣
    ("retCode='KX'+(num-1)", "retCode='KX'+kgmKxAddR1108C(num,-1)", 1),
    ("var back=J['KX'+(n-1)];", "var back=J['KX'+kgmKxAddR1108C(n,-1)];", 1),
    ("PAIR72['KX'+(n-1)]=", "PAIR72['KX'+kgmKxAddR1108C(n,-1)]=", 1),
    ("var out=byStart['KX'+(n+1)];", "var out=byStart['KX'+kgmKxAddR1108C(n,1)];", 1),
    ("var want='KX'+(n-1);", "var want='KX'+kgmKxAddR1108C(n,-1);", 1),
    ("PI['KX'+(n+1)+'>'+f.fr]", "PI['KX'+kgmKxAddR1108C(n,1)+'>'+f.fr]", 1),
    ("n>0&&y.code==='KX'+(n-1))", "n>0&&y.code==='KX'+kgmKxAddR1108C(n,-1))", 1),
    ("ST['KX'+(num+1)+'|'+f.to+'|'+f.fr]", "ST['KX'+kgmKxAddR1108C(num,1)+'|'+f.to+'|'+f.fr]", 1),
    ("ST['KX'+(num-1)+'|'+f.to+'|'+f.fr]", "ST['KX'+kgmKxAddR1108C(num,-1)+'|'+f.to+'|'+f.fr]", 1),
    ("as=an===n-1?0:1,bs=bn===n-1?0:1;return as-bs||an-bn;", "as=an===kgmKxAddR1108C(n,-1)?0:1,bs=bn===kgmKxAddR1108C(n,-1)?0:1;return as-bs||kgmKxOldR1108B(an)-kgmKxOldR1108B(bn);", 1),
    ("as=(an===num-1?0:1),bs=(bn===num-1?0:1);", "as=(an===kgmKxAddR1108C(num,-1)?0:1),bs=(bn===kgmKxAddR1108C(num,-1)?0:1);", 1),
    ("as=an===num-1?0:1,bs=bn===num-1?0:1;", "as=an===kgmKxAddR1108C(num,-1)?0:1,bs=bn===kgmKxAddR1108C(num,-1)?0:1;", 1),
    ("sa=Math.abs(na-(n-1)),sb=Math.abs(nb-(n-1));", "sa=Math.abs(kgmKxOldR1108B(na)-(kgmKxOldR1108B(n)-1)),sb=Math.abs(kgmKxOldR1108B(nb)-(kgmKxOldR1108B(n)-1));", 1),
    ("return Math.abs(n2-_pn)===1;", "return Math.abs(kgmKxOldR1108B(n2)-kgmKxOldR1108B(_pn))===1;", 1),
    ("(k===m||Math.abs(k-m)===1)", "(k===m||Math.abs(kgmKxOldR1108B(k)-kgmKxOldR1108B(m))===1)", 2),
    ("Math.abs(n0-n1)===1)?0:1", "Math.abs(kgmKxOldR1108B(n0)-kgmKxOldR1108B(n1))===1)?0:1", 1),
    ("Math.abs(n0-n1)<=1?0:1000", "Math.abs(kgmKxOldR1108B(n0)-kgmKxOldR1108B(n1))<=1?0:1000", 1),
    ("pair='KX'+(num(a.code)-1);", "pair='KX'+kgmKxAddR1108C(num(a.code),-1);", 1),
    ("b=acftOfFlight('KX'+(num(c)-1),d)", "b=acftOfFlight('KX'+kgmKxAddR1108C(num(c),-1),d)", 1),
    # r132 外站過站：第五航權續飛判斷（原本 KX(n−1) 剛好是別的經停班 → 布達佩斯回程冬季時刻會少推 5 分，跟時刻表 PDF 不同）
    ("x.code==='KX'+(num132(o.code)-1))", "x.code==='KX'+kgmKxAddR1108C(num132(o.code),-1))", 2),
    # r179 稽核／r204 第五航權去回配對（reg2 kgmAuditR202 抓到：配不到回程 → 0%）
    ("var inCode=String(V.code).replace(/\\d+$/,String((+m[1])-1));", "var inCode=String(V.code).replace(/\\d+$/,String(kgmKxAddR1108C(+m[1],-1)));", 2),
]

MIG = r"""
/* 1108B B6／1108C：班號規則的輔助函式。1～3 位數＝新班號（1108C：去程奇數、回程＝去程＋1）；4 位數照舊（去程偶數、回程＝去程−1）。
   全部用「換回舊班號 → 舊規則 → 換回新班號」算，所以任何找對號班／配對鍵／種子的結果都跟改號前一樣。
   kgmKxOldR1108B 新→舊班號；kgmKxHsR1108B 把字串裡的新班號換回舊班號，只放在雜湊函式的輸入（建置時自動加），
   所以機型、機身、登機門、模擬旅客、組員挑人等所有用班號當種子抽出來的結果都跟改號前一樣。
   配對鍵／種子（kgmKxPk／Sd）一律回傳新班號，換回舊號只在雜湊入口做一次。 */
window.kgmKxNewR1108B=function(n){n=+n||0;if(n<=0||n>=999)return n;var F={172:171,171:172,174:173,173:174,176:175,175:176,170:177,169:178};return F[n]!=null?F[n]:(n%2===0?n+1:n+3)};
window.kgmKxOldR1108B=function(n){n=+n||0;if(n<=0||n>=999)return n;var I={171:172,172:171,173:174,174:173,175:176,176:175,177:170,178:169};if(I[n]!=null)return I[n];return n%2?n-1:(n>=4?n-3:n)};
window.kgmKxAddR1108C=function(n,d){n=+n||0;if(n<=0||n>999)return n+d;return kgmKxNewR1108B(kgmKxOldR1108B(n)+d)};
window.kgmKxHsR1108B=(function(){var re=/(^|[^A-Za-z])KX([1-9]\d{0,2})(?=\d{4}-\d\d-\d\d|[^0-9a-z]|$)/g;
  function f(_,a,d){return a+'KX'+kgmKxOldR1108B(+d)}
  return function(x){if(typeof x!=='string'||x.length>800||x.indexOf('KX')<0)return x;return x.replace(re,f)}})();
window.kgmKxHasR1108B=function(k,code){k=String(k||'');code=String(code||'');if(!code)return false;var i=k.indexOf(code);while(i>=0){var a=i?k.charAt(i-1):'',b=k.charAt(i+code.length);if(!/[A-Za-z0-9]/.test(a)&&!/[0-9]/.test(b))return true;i=k.indexOf(code,i+1)}return false};
window.kgmKxOutR1108B=function(n){n=+n||0;if(n>999)return n%2===0?1:0;return kgmKxOldR1108B(n)%2===0?1:0};
window.kgmKxPairR1108B=function(n){n=+n||0;if(n>999)return n%2===0?n-1:n+1;var o=kgmKxOldR1108B(n);return kgmKxNewR1108B(o%2===0?o-1:o+1)};
window.kgmKxPnR1108B=function(n){n=+n||0;if(n>999)return n%2?n:n-1;var o=kgmKxOldR1108B(n);return kgmKxNewR1108B(o%2?o:o-1)};
window.kgmKxPkR1108B=function(n){return kgmKxPnR1108B(n)};
window.kgmKxSdR1108B=function(n){n=+n||0;if(n>999)return n%2===0?n:n+1;var o=kgmKxOldR1108B(n);return kgmKxNewR1108B(o%2===0?o:o+1)};
(function(){try{var F='kgm39_kxnum',st=localStorage.getItem(F);if(st==='2')return;
  /* 舊資料遷移（只跑一次）：沒有旗標＝改號前的舊班號 → 1108C 新班號；旗標 1＝1108B 的班號（去程奇數、回程＝去程−1）→ 1108C（回程 +2）。
     「KX118/117」這種簡寫（輪轉標籤）後面不帶 KX 的號碼一起換。 */
  var mpO=function(n){return kgmKxNewR1108B(n)},mpB=function(n){n=+n;return (n>0&&n<997&&n%2===0)?n+2:n},mp=st==='1'?mpB:mpO;
  var re=/(^|[^A-Za-z0-9_])KX([1-9]\d{0,2})((?:[\/／][1-9]\d{0,2}(?![\d:.]))*)(?![0-9A-Za-z\\])/g,keys=[],n=0;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k!==F)keys.push(k)}
  keys.forEach(function(k){try{var v=localStorage.getItem(k);if(typeof v!=='string'||v.indexOf('KX')<0)return;var w=v.replace(re,function(_,a,d,r){return a+'KX'+mp(+d)+(r?r.replace(/[1-9]\d{0,2}/g,function(x){return mp(+x)}):'')});if(w!==v){localStorage.setItem(k,w);n++}}catch(_){}});
  /* 杭州回程：改號前跟重慶回程同號 KX315，照一般規則換成 KX318（＝重慶回程）→ 同一個物件裡 fr＝HGH 的改成 KX316（1108B 的資料已經依航線分好，不用再改） */
  if(st!=='1'){try{var H1=/("code"\s*:\s*")KX318("(?:[^{}]{0,400}?)"fr"\s*:\s*"HGH")/g,H2=/("fr"\s*:\s*"HGH"(?:[^{}]{0,400}?)"code"\s*:\s*")KX318"/g,H3=/KX318\|HGH\|/g;
    keys.forEach(function(k){try{var v=localStorage.getItem(k);if(typeof v!=='string'||v.indexOf('KX318')<0||v.indexOf('HGH')<0)return;var w=v.replace(H1,'$1KX316$2').replace(H2,'$1KX316"').replace(H3,'KX316|HGH|');if(w!==v)localStorage.setItem(k,w)}catch(_){}})}catch(_){}}
  try{indexedDB.deleteDatabase('kgm25_crew')}catch(_){}
  localStorage.setItem(F,'2');window.KGM_KXNUM_R1108B={from:st||'old',keys:n,at:new Date().toISOString()}}catch(_){}})();
"""
ANCHOR = "window.__kgmLzR1019A=1;\n})();"

B64 = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")

HASHRE = re.compile(r"imul|\*\s*31\b|16777619|\*\s*33\b|\(h\s*\*\s*31\)|\^=")
def seeds(s):
    """雜湊種子沿用舊班號（只換雜湊的輸入，不動任何拿去顯示或當資料鍵的變數）：
       ① 寫在程式裡的雜湊迴圈 for(var i=0;i<K.length;i++)…K.charCodeAt(i) → 改讀 __kxN＝K 換回舊班號後的暫存變數；
       ② 其餘單一參數的雜湊函式（迴圈沒被①抓到的）在最前面把參數換回舊班號。每個雜湊只換一次。"""
    lp=re.compile(r"for\s*\(\s*(?:var\s+)?(\w+)\s*=\s*0\s*;\s*\1\s*<\s*([\w$]+)\.length\s*;\s*\1\+\+\s*\)(\s*\{?\s*[\w$]+\s*(?:\^=|=)[^;]{0,48}?)\2\.charCodeAt\(\s*\1\s*\)")
    cnt=[0]
    def rl(m):
        if not HASHRE.search(m.group(0)): return m.group(0)
        i,K,mid=m.group(1),m.group(2),m.group(3)
        cnt[0]+=1; t='__kx'+str(cnt[0])
        return 'for(var '+t+'=kgmKxHsR1108B('+K+'),'+i+'=0;'+i+'<'+t+'.length;'+i+'++)'+mid+t+'.charCodeAt('+i+')'
    s=lp.sub(rl,s)
    # ③ 依班號字串排序的同分比較（不含 numeric:true 的顯示用排序）：比舊班號，先後順序跟改號前一樣
    E=r"[\w$]+(?:\.[\w$]+|\[\d+\])*\.code"
    s,c1=re.subn(r"String\(("+E+r")\)\.localeCompare\(String\(("+E+r")\)\)(?!,)", r"kgmKxHsR1108B(String(\1)).localeCompare(kgmKxHsR1108B(String(\2)))", s)
    s,c2=re.subn(r"(?<![\w$.])([\w$]+\.code)\.localeCompare\(([\w$]+\.code)\)(?=\s*[;}|)])", r"kgmKxHsR1108B(\1).localeCompare(kgmKxHsR1108B(\2))", s)
    s,c3=re.subn(r"return a\.code<b\.code\?-1:1", r"return kgmKxHsR1108B(a.code)<kgmKxHsR1108B(b.code)?-1:1", s)
    s,c4=re.subn(r"if\(a\.code!==b\.code\)return a\.code<b\.code\?-1:1;", r"if(a.code!==b.code)return kgmKxHsR1108B(a.code)<kgmKxHsR1108B(b.code)?-1:1;", s)
    s,c5=re.subn(r"\(a\.code\+a\.dep\)\.localeCompare\(b\.code\+b\.dep\)", r"kgmKxHsR1108B(a.code+a.dep).localeCompare(kgmKxHsR1108B(b.code+b.dep))", s)
    print('kx39: code sorts', c1, c2, c3, c4, c5)
    out=[]; last=0; nh=0
    pat=re.compile(r"function\s*([\w$]*)\s*\(\s*([\w$]+)\s*\)\s*\{")
    for m in pat.finditer(s):
        p=m.group(2); a=m.end()
        if 'charCodeAt' not in s[a:a+300]: continue
        d=1;i=a
        while d:
            c=s[i]; d+=(c=='{')-(c=='}'); i+=1
        body=s[a:i-1]
        if len(body)>400 or 'kgmKxHsR1108B' in body or not HASHRE.search(body) or 'return' not in body: continue
        if p in ('ch','date','T','k','sea','b','c','p','h'): continue
        if re.search(r"\b"+re.escape(p)+r"\.(?!length\b|charCodeAt\b|split\b)", body): continue
        if re.search(r"\["+re.escape(p)+r"\]", body): continue
        out.append(s[last:a]); out.append(p+'=kgmKxHsR1108B('+p+');'); last=a; nh+=1
    out.append(s[last:]); s=''.join(out)
    return s, nh, cnt[0]

def main():
    src, out = sys.argv[1], sys.argv[2]
    s = open(src, encoding='utf-8').read()
    for old, new, cnt in FLIPS:
        n = s.count(old)
        assert n == cnt, ('flip', old, n, cnt)
        s = s.replace(old, new)
    # 聯營代碼表的數字清單
    def kxlist(m):
        nums = [mp(int(x)) for x in re.findall(r'\d+', m.group(1))]
        return 'kx:[' + ','.join(str(x) for x in nums) + ']'
    s, nk = re.subn(r"kx:\[([\d,\s]+)\]", kxlist, s)
    assert nk == 10, ('MKT19 kx lists', nk)
    # KX000（預設佔位）、正規式裡的前綴（/^KX9\d{3}$/ 聯營代碼）、拼字用的前綴（'KX89'+… 空機調派 4 位數）都不動
    # 簡寫「KX180/179」「KX181／182／184」「KX180、180」後面那幾個不帶 KX 的號碼也一起換
    def run(m):
        return re.sub(r'(?<=[/／、,，])(\s*)([1-9]\d{0,2})(?![\d:.])', lambda q: q.group(1)+str(mp(int(q.group(2)))), m.group(0))
    s, nr = re.subn(r'(?<![A-Za-z0-9_])KX[1-9]\d{0,2}(?:\s*[/／、,，]\s*[1-9]\d{0,2}(?![\d:.]))+', run, s)
    # 查詢框範例的聯營代碼（JL＋5000＋KX 號碼）
    nj = s.count('JL5180'); assert nj == 4, ('JL5180', nj); s = s.replace('JL5180', 'JL5181')
    print('kx39: shorthand runs', nr)
    pat = re.compile(r'(?<![A-Za-z0-9_])KX([1-9]\d{0,2})(?![0-9A-Za-z\\\[])(?![\'"]\s*\+)')
    cnt = [0, 0]
    def rep(m):
        a, b = m.start(), m.end()
        pre, post = s[max(0, a - 24):a], s[b:b + 24]
        if len(pre) == 24 and len(post) == 24 and all(c in B64 for c in pre + post):
            cnt[1] += 1
            return m.group(0)          # base64 圖片／字型裡剛好出現 KX 數字 → 不動
        cnt[0] += 1
        return 'KX' + str(mp(int(m.group(1))))
    s = pat.sub(rep, s)
    # 規章條文「班號以 KX9 開頭者」說的是聯營 4 位數班號（KX9xxx）的前綴，不是 9 號班 → 還原
    n9 = s.count('班號以 KX12 開頭者'); assert n9 == 1, ('KX9 prefix', n9); s = s.replace('班號以 KX12 開頭者', '班號以 KX9 開頭者')
    # 杭州線跟全站統一（1108B 使用者：「OK」；1108C 回程＝去程＋1）：原本 KX314 去、KX315 回（KX315 同時也是重慶→台北，班號重複）
    #   → 一般規則換完：杭州去程 KX315、兩條回程都是 KX318 → 只把指杭州回程的那幾處（班表、回程跟去程同機型、1018A 定案表、r79 稽核取樣、註解）改成 KX316；
    #   重慶 KX317／318。雜湊入口把 KX316 換回舊 313（＝1108B 杭州回程的種子），機型、機身抽選跟 1108B 相同。
    for a, b, c in [('["KX318","HGH","TPE"', '["KX316","HGH","TPE"', 1),
                    ("if(code==='KX318'&&fr==='HGH'&&to==='TPE')", "if(code==='KX316'&&fr==='HGH'&&to==='TPE')", 1),
                    ("sample:['KX315','KX318',", "sample:['KX315','KX316',", 1),
                    ("KX315:'A339R',KX318:'A339R',", "KX315:'A339R',KX316:'A339R',", 1),
                    ("/* 同一個班號兩條線：KX318 杭州→台北（定案）跟重慶→台北（原本 A21N，不動） */", "/* 1108C：杭州→台北改成 KX316（去程 KX315＋1），KX318 只剩重慶→台北（原本 A21N，不動；這條保留無害） */", 1)]:
        n = s.count(a); assert n == c, ('HGH', a, n); s = s.replace(a, b)
    s, nh, ni = seeds(s)
    assert s.count(ANCHOR) == 1, 'migration anchor'
    s = s.replace(ANCHOR, ANCHOR + MIG, 1)
    open(out, 'w', encoding='utf-8').write(s)
    print('kx39: flips', len(FLIPS), 'codes', cnt[0], 'skipped(base64)', cnt[1], 'mkt19', nk, 'hashfn', nh, 'loops', ni)

if __name__ == '__main__':
    main()

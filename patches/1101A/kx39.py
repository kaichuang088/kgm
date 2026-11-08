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

FUK = {172: 171, 171: 170, 174: 173, 173: 172, 176: 175, 175: 174, 170: 177, 169: 176}
def mp(n): return FUK.get(n, n + 1)

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
    ("n%2===0&&num(d.code)===n-1", "kgmKxOutR1108B(n)&&num(d.code)===n-1", 1),
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
]

MIG = r"""
/* 1108B B6：班號規則的輔助函式（1～3 位數＝新班號：去程奇數、回程＝去程−1；4 位數照舊：去程偶數、回程＝去程−1）。
   kgmKxOldR1108B 新→舊班號；kgmKxHsR1108B 把字串裡的新班號換回舊班號，只放在雜湊函式的輸入（建置時自動加），
   所以機型、機身、登機門、模擬旅客、組員挑人等所有用班號當種子抽出來的結果都跟改號前一樣。
   配對鍵／種子（kgmKxPk／Sd）一律用新班號，換回舊號只在雜湊入口做一次。 */
window.kgmKxOldR1108B=function(n){n=+n||0;if(n<=0||n>999)return n;var I={171:172,170:171,173:174,172:173,175:176,174:175,177:170,176:169};return I[n]!=null?I[n]:n-1};
window.kgmKxHsR1108B=(function(){var re=/(^|[^A-Za-z])KX([1-9]\d{0,2})(?=\d{4}-\d\d-\d\d|[^0-9a-z]|$)/g;
  function f(_,a,d){return a+'KX'+kgmKxOldR1108B(+d)}
  return function(x){if(typeof x!=='string'||x.length>800||x.indexOf('KX')<0)return x;return x.replace(re,f)}})();
window.kgmKxNewR1108B=function(n){n=+n||0;if(n<=0||n>999)return n;var F={172:171,171:170,174:173,173:172,176:175,175:174,170:177,169:176};return F[n]!=null?F[n]:n+1};
window.kgmKxHasR1108B=function(k,code){k=String(k||'');code=String(code||'');if(!code)return false;var i=k.indexOf(code);while(i>=0){var a=i?k.charAt(i-1):'',b=k.charAt(i+code.length);if(!/[A-Za-z0-9]/.test(a)&&!/[0-9]/.test(b))return true;i=k.indexOf(code,i+1)}return false};
window.kgmKxOutR1108B=function(n){n=+n||0;return (n>999?n%2===0:n%2===1)?1:0};
window.kgmKxPairR1108B=function(n){n=+n||0;return kgmKxOutR1108B(n)?n-1:n+1};
window.kgmKxPnR1108B=function(n){n=+n||0;return kgmKxOutR1108B(n)?n-1:n};
window.kgmKxPkR1108B=function(n){return kgmKxPnR1108B(n)};
window.kgmKxSdR1108B=function(n){n=+n||0;return kgmKxOutR1108B(n)?n:n+1};
(function(){try{var F='kgm39_kxnum';if(localStorage.getItem(F)==='1')return;
  var FUK={172:171,171:170,174:173,173:172,176:175,175:174,170:177,169:176},mp=function(n){return FUK[n]!=null?FUK[n]:n+1};
  /* 「KX118/117」這種簡寫（輪轉標籤）後面不帶 KX 的號碼一起換 */
  var re=/(^|[^A-Za-z0-9_])KX([1-9]\d{0,2})((?:[\/／][1-9]\d{0,2}(?![\d:.]))*)(?![0-9A-Za-z\\])/g,keys=[],n=0;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k!==F)keys.push(k)}
  keys.forEach(function(k){try{var v=localStorage.getItem(k);if(typeof v!=='string'||v.indexOf('KX')<0)return;var w=v.replace(re,function(_,a,d,r){return a+'KX'+mp(+d)+(r?r.replace(/[1-9]\d{0,2}/g,function(x){return mp(+x)}):'')});if(w!==v){localStorage.setItem(k,w);n++}}catch(_){}});
  /* 杭州回程：改號後是 KX316（跟重慶回程重複）→ 依航線改成 KX314（同一個物件裡 fr＝HGH 的才改） */
  try{var H1=/("code"\s*:\s*")KX316("(?:[^{}]{0,400}?)"fr"\s*:\s*"HGH")/g,H2=/("fr"\s*:\s*"HGH"(?:[^{}]{0,400}?)"code"\s*:\s*")KX316"/g,H3=/KX316\|HGH\|/g;
    keys.forEach(function(k){try{var v=localStorage.getItem(k);if(typeof v!=='string'||v.indexOf('KX316')<0||v.indexOf('HGH')<0)return;var w=v.replace(H1,'$1KX314$2').replace(H2,'$1KX314"').replace(H3,'KX314|HGH|');if(w!==v)localStorage.setItem(k,w)}catch(_){}})}catch(_){}
  try{indexedDB.deleteDatabase('kgm25_crew')}catch(_){}
  localStorage.setItem(F,'1');window.KGM_KXNUM_R1108B={keys:n,at:new Date().toISOString()}}catch(_){}})();
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
    n9 = s.count('班號以 KX10 開頭者'); assert n9 == 1, ('KX9 prefix', n9); s = s.replace('班號以 KX10 開頭者', '班號以 KX9 開頭者')
    # 杭州線跟全站統一（使用者：「OK」）：原本 KX314 去、KX315 回（KX315 同時也是重慶→台北，班號重複）→ 去程 KX315、回程 KX314（＝去程−1），
    #   重慶→台北維持 KX316。只改指杭州回程的那幾處（班表、回程跟去程同機型、1018A 定案表、r79 稽核取樣、註解）。
    #   雜湊入口把 KX314 換回舊 313（＝原本這一對的配對鍵），機型抽選不變；杭州回程自己的種子（登機門、天氣…）會跟改號前不同。
    for a, b, c in [('["KX316","HGH","TPE"', '["KX314","HGH","TPE"', 1),
                    ("if(code==='KX316'&&fr==='HGH'&&to==='TPE')", "if(code==='KX314'&&fr==='HGH'&&to==='TPE')", 1),
                    ("sample:['KX315','KX316',", "sample:['KX315','KX314',", 1),
                    ("KX315:'A339R',KX316:'A339R',", "KX315:'A339R',KX314:'A339R',", 1),
                    ("/* 同一個班號兩條線：KX316 杭州→台北（定案）跟重慶→台北（原本 A21N，不動） */", "/* 1108B：杭州→台北改成 KX314（去程 KX315−1），KX316 只剩重慶→台北（原本 A21N，不動；這條保留無害） */", 1)]:
        n = s.count(a); assert n == c, ('HGH', a, n); s = s.replace(a, b)
    s, nh, ni = seeds(s)
    assert s.count(ANCHOR) == 1, 'migration anchor'
    s = s.replace(ANCHOR, ANCHOR + MIG, 1)
    open(out, 'w', encoding='utf-8').write(s)
    print('kx39: flips', len(FLIPS), 'codes', cnt[0], 'skipped(base64)', cnt[1], 'mkt19', nk, 'hashfn', nh, 'loops', ni)

if __name__ == '__main__':
    main()

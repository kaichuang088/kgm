/* 1020A：使用者：「儲存空間滿了 這個我不想再看到這個東東跳出來喔！！！」
   → 不等到寫入失敗才壓：開頁時整站已超過 260 萬字元（Chromium 上限約 520 萬的一半）就直接開始壓縮、把現有大鍵改存壓縮版；
     寫入失敗的提示（kgmLsFailR1012A 的 banner）在 gen_r20 拿掉，不再跳出來。
   以下為 1019A 原說明。
   1019A：瀏覽器儲存空間（使用者貼上「整理瀏覽器儲存空間…目前使用約 7.4 MB，已達到這個瀏覽器的上限」）
   原因：1018A 以前產生的 6,000 位模擬會員（kgmus4 3.0 MB）＋員工、競標、季節時刻等，加起來仍頂到瀏覽器上限；
   會員是使用者的資料，不能刪 → 大的鍵改成壓縮後再存（內容一字不差，讀出來還原）。
   · 壓縮：LZW（同 lz-string 的作法）＋每 15 位元裝進一個字元（字元碼 32～32799，不碰代理對範圍），前面加 "\u0001Z9"。
   · 掛在 localStorage 最底層（Storage.prototype.setItem／getItem）＋跨分頁的 StorageEvent.newValue／oldValue：
     LS.get、_ls0818flush、r229 同步（pull／merge）、精簡格式 ls12 全部照舊拿到原本的字串，不用一條一條改。
   · 只有這個瀏覽器真的存滿過才壓（kgm19_lz）；只壓 ≥ 20,000 字元的值；同一個鍵內容沒變不重壓（記上一次的原文／壓縮結果）；讀取記上一次的壓縮字串／原文。
   · 舊的（沒壓縮的）值照常讀；下次寫入時才變成壓縮。 */
(function(){
  if(window.__kgmLzR1019A)return;
  var MARK='\u0001Z9',MIN=20000;
  /* 演算法同 lz-string（LZW，字典從空的開始；新字元先送 8／16 位元字面值；碼長隨字典變大） */
  function comp(s){
    /* 字典用數字鍵（前一個碼×65536＋字元碼），不組字串，1.8M 字元約快 3～5 倍；輸出跟字串版一模一樣 */
    var one=new Map(),two=new Map(),create=new Set(),w=-1,wc1=-1,enl=2,size=3,nb=2,out=[],val=0,pos=0,i,cc,k,code;
    function put(x,n){for(var b=0;b<n;b++){val=(val<<1)|(x&1);if(pos===14){pos=0;out.push(String.fromCharCode(val+32));val=0}else pos++;x>>=1}}
    function emit(){
      if(wc1>=0&&create.has(wc1)){if(wc1<256){put(0,nb);put(wc1,8)}else{put(1,nb);put(wc1,16)}
        if(--enl===0){enl=Math.pow(2,nb);nb++}create.delete(wc1)}
      else put(w,nb);
      if(--enl===0){enl=Math.pow(2,nb);nb++}
    }
    for(i=0;i<s.length;i++){
      cc=s.charCodeAt(i);
      if(!one.has(cc)){one.set(cc,size++);create.add(cc)}
      if(w<0){w=one.get(cc);wc1=cc;continue}
      k=w*65536+cc;code=two.get(k);
      if(code!==undefined){w=code;wc1=-1;continue}
      emit();
      two.set(k,size++);
      w=one.get(cc);wc1=cc;
    }
    if(w>=0)emit();
    put(2,nb);
    for(;;){val=val<<1;if(pos===14){out.push(String.fromCharCode(val+32));break}pos++}
    return out.join('');
  }
  function decomp(z){
    var len=z.length;if(!len)return '';
    var dval=z.charCodeAt(0)-32,dpos=16384,didx=1;
    function rd(n){var r=0,p=1,b;while(p!==(1<<n)){b=dval&dpos;dpos>>=1;if(dpos===0){dpos=16384;dval=z.charCodeAt(didx++)-32}r|=(b>0?1:0)*p;p<<=1}return r}
    var dict=[0,1,2],enl=4,size=4,nb=3,out=[],w,c,entry,t;
    t=rd(2);
    if(t===2)return '';
    c=String.fromCharCode(rd(t===0?8:16));
    dict[3]=c;w=c;out.push(c);
    for(;;){
      if(didx>len+1)return null;
      t=rd(nb);
      if(t===2)return out.join('');
      if(t===0||t===1){dict[size++]=String.fromCharCode(rd(t===0?8:16));t=size-1;enl--}
      if(enl===0){enl=Math.pow(2,nb);nb++}
      if(dict[t]!==undefined&&t>2)entry=dict[t];
      else if(t===size)entry=w+w.charAt(0);
      else return null;
      out.push(entry);
      dict[size++]=w+entry.charAt(0);
      enl--;
      w=entry;
      if(enl===0){enl=Math.pow(2,nb);nb++}
    }
  }
  window.kgmLzCompR1019A=comp;window.kgmLzDecompR1019A=decomp;
  if(typeof Storage==='undefined')return;
  var SP=Storage.prototype,oSet=SP.setItem,oGet=SP.getItem;
  var lastIn={},lastOut={},rdRaw={},rdVal={};
  /* 只有「這個瀏覽器真的存滿過」才開始壓縮（kgm19_lz＝1，之後一直開著）：
     一般瀏覽器完全照舊，舊版網站檔也讀得懂；存滿的瀏覽器舊版本來就存不進去。 */
  var ON=false;try{ON=oGet.call(window.localStorage,'kgm19_lz')==='1'}catch(_){}
  function isQuota(e){try{return !!e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014||/quota/i.test(String(e.message||'')))}catch(_){return false}}
  function enc(k,v){
    v=String(v);
    if(!ON||v.length<MIN||v.charCodeAt(0)===1)return v;
    if(lastIn[k]===v)return lastOut[k];
    var z=MARK+comp(v);
    if(z.length>=v.length)z=v;
    lastIn[k]=v;lastOut[k]=z;rdRaw[k]=z;rdVal[k]=v;
    return z;
  }
  function dec(k,raw){
    if(raw==null||raw.charCodeAt(0)!==1||raw.slice(0,3)!==MARK)return raw;
    if(k!=null&&rdRaw[k]===raw)return rdVal[k];
    var v=decomp(raw.slice(3));
    if(v==null)return raw;
    if(k!=null){rdRaw[k]=raw;rdVal[k]=v;lastIn[k]=v;lastOut[k]=raw}
    return v;
  }
  /* 第一次存滿：把現有的大鍵全部改存壓縮版（由大到小），騰出空間 */
  function packAll(ls){
    var a=[],i,k,r;
    for(i=0;i<ls.length;i++){k=ls.key(i);r=oGet.call(ls,k);if(r&&r.length>=MIN&&r.charCodeAt(0)!==1)a.push(k)}
    a.sort(function(x,y){return (oGet.call(ls,y)||'').length-(oGet.call(ls,x)||'').length});
    a.forEach(function(k){try{var v=oGet.call(ls,k),z=enc(k,v);if(z!==v)oSet.call(ls,k,z)}catch(_){}});
    window.KGM_LZ_R1019A={on:true,keys:a.length,at:Date.now()};
  }
  /* 1020A：開頁就檢查；整站（原始字元數）≥ 260 萬 → 直接開始壓縮 */
  try{
    var ls0=window.localStorage,tot=0;
    for(var i0=0;i0<ls0.length;i0++){var k0=ls0.key(i0);tot+=k0.length+((oGet.call(ls0,k0)||'').length)}
    window.KGM_LS_TOTAL_R1020A=tot;
    if(!ON&&tot>=2600000){ON=true;packAll(ls0);try{oSet.call(ls0,'kgm19_lz','1')}catch(_){}window.KGM_LZ_R1020A={early:true,before:tot}}
  }catch(_){}
  SP.setItem=function(k,v){
    if(this!==window.localStorage)return oSet.call(this,k,v);
    k=String(k);
    try{return oSet.call(this,k,enc(k,v))}
    catch(e){
      if(!isQuota(e))throw e;
      var was=ON;ON=true;packAll(this);
      try{oSet.call(this,'kgm19_lz','1')}catch(_){}
      if(was&&String(v).length<MIN)throw e;
      return oSet.call(this,k,enc(k,v));
    }
  };
  SP.getItem=function(k){var r=oGet.call(this,k);return this===window.localStorage?dec(String(k),r):r};
  /* 儲存空間面板量的是真正佔用的大小 */
  window.kgmLsRawGetR1019A=function(k){return oGet.call(window.localStorage,k)};
  try{
    var E=StorageEvent.prototype;
    ['newValue','oldValue'].forEach(function(p){
      var d=Object.getOwnPropertyDescriptor(E,p);if(!d||!d.get)return;
      Object.defineProperty(E,p,{configurable:true,enumerable:d.enumerable,get:function(){var r=d.get.call(this);return dec(p==='newValue'?this.key:null,r)}});
    });
  }catch(_){}
  window.__kgmLzR1019A=1;
})();

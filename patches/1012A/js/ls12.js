/* 1012A：前後台同步 —— 使用者：「然後前後台沒有同步喔」（後台綁定 K74992 ↔ KGMDEMO0911，前台員工票驗證頁顯示「尚未綁定」）。
   寫進瀏覽器儲存區（localStorage）失敗時，原本整個被 catch(e){} 吞掉：這一邊畫面上有、儲存區裡沒有 →
   另一個分頁／前後台永遠收不到，重新整理後也不見，而且沒有任何提示。最常見的原因是儲存空間滿了
   （上傳的護照／收據／艙等照片整張原檔存成文字，一張 4MB 的照片存起來約 530 萬字元；Chrome 每個網站約 500 萬字元）。
   · 寫入失敗 → 記在 window.KGM_LS_FAIL_R1012A，畫面下方出現提示（不會被 render() 洗掉）；
     「整理儲存空間」列出各份資料的大小與已上傳的附件，可一鍵把圖片附件壓縮（不刪資料），或逐一移除附件，處理完立刻重新存檔。
   · 之後新上傳的圖片附件先縮小（長邊 1600px、JPEG）再存；PDF 不動；艙等照片長邊 2000px、品質較高。 */
/* 1012A：kgm_crewsched（舊版組員班表 S.crewSched，後台登入後產生：380 位 × 60 天 ≈ 188 萬字元，佔掉瀏覽器儲存上限將近四成）
   存檔時改用「欄位＋字典」的精簡格式（同 0818 的 _packTA0818 做法），讀回時還原成一模一樣的物件；舊格式照常讀得到。
   只要遇到不是「員工編號 → 物件陣列」的內容就原樣存，不冒險。 */
function _packCS1012A(v){
  try{
    if(!v||typeof v!=='object'||Array.isArray(v)||v.__cs1012A)return v;
    var cols=[],ci={},dict=[],di={},d={},ok=true;
    Object.keys(v).forEach(function(emp){
      var a=v[emp];if(!ok)return;if(!Array.isArray(a)){ok=false;return}
      d[emp]=a.map(function(row){
        if(!row||typeof row!=='object'||Array.isArray(row)){ok=false;return null}
        var r=[];Object.keys(row).forEach(function(k){
          if(!(k in ci)){ci[k]=cols.length;cols.push(k)}
          var j=JSON.stringify(row[k]);if(j===undefined)return;
          if(!(j in di)){di[j]=dict.length;dict.push(j)}
          var c=ci[k];while(r.length<c)r.push(-1);r[c]=di[j];
        });
        return r;
      });
    });
    return ok?{__cs1012A:1,c:cols,v:dict,d:d}:v;
  }catch(e){return v}
}
function _unpackCS1012A(v){
  try{
    if(!v||typeof v!=='object'||!v.__cs1012A)return v;
    var cols=v.c||[],vals=(v.v||[]).map(function(j){return JSON.parse(j)}),out={};
    Object.keys(v.d||{}).forEach(function(emp){
      out[emp]=(v.d[emp]||[]).map(function(r){var o={};for(var i=0;i<r.length;i++)if(r[i]>=0){var x=vals[r[i]];o[cols[i]]=(x&&typeof x==='object')?JSON.parse(JSON.stringify(x)):x}return o});
    });
    return out;
  }catch(e){return v}
}
try{window._packCS1012A=_packCS1012A;window._unpackCS1012A=_unpackCS1012A}catch(e){}
/* 1012A #254：已公布班表的凍結（S.crewFreezeR928：日期 → 員工編號 → 當天的航班）原本沒有存檔，重新整理後整份重算，
   請假／換班／晉升「只改必要的人」只在同一個頁面裡成立。現在存檔（kgm12_crewfrz），用「員工字典＋值字典」精簡格式：
   每天一串「員工序號.值序號」，讀回時還原成一模一樣的物件。 */
function _packFZ1012A(v){
  try{
    if(!v||typeof v!=='object'||Array.isArray(v)||v.__fz1012A)return v;
    var E=[],ei={},V=[],vi={},d={},ok=true;
    Object.keys(v).forEach(function(day){var m=v[day];if(!ok)return;if(!m||typeof m!=='object'||Array.isArray(m)){ok=false;return}
      d[day]=Object.keys(m).map(function(id){var x=m[id];if(typeof x!=='string'){ok=false;return ''}
        if(!(id in ei)){ei[id]=E.length;E.push(id)}if(!(x in vi)){vi[x]=V.length;V.push(x)}return ei[id].toString(36)+'.'+vi[x].toString(36)}).join(',')});
    return ok?{__fz1012A:1,e:E,v:V,d:d}:v;
  }catch(e){return v}
}
function _unpackFZ1012A(v){
  try{
    if(!v||typeof v!=='object'||!v.__fz1012A)return v;
    var E=v.e||[],V=v.v||[],out={};
    Object.keys(v.d||{}).forEach(function(day){var m=out[day]={};String(v.d[day]||'').split(',').forEach(function(p){if(!p)return;var q=p.split('.');m[E[parseInt(q[0],36)]]=V[parseInt(q[1],36)]})});
    return out;
  }catch(e){return v}
}
try{window._packFZ1012A=_packFZ1012A;window._unpackFZ1012A=_unpackFZ1012A}catch(e){}
/* 1012A：使用者回報「瀏覽器儲存空間已滿」。實測（開頁 100 秒＋後台開過幾個分頁）整站 445 萬字元，Chromium 上限約 520 萬：
   其中 S.bigDeals（kgmbd4）一份 294 萬 —— 模擬 BigDeal 出價一天約 1,265 筆，起飛前 7 天到起飛後 3 天都留著（1010A 起過去的再要看時重新補），
   每筆約 400 字元的完整 JSON（欄位名稱一筆一筆重複）。改用「欄位＋值字典」精簡格式（每筆存成一串序號），讀回時還原成一模一樣的物件；
   Residence 現金／哩程競標同一種格式。不刪任何資料。 */
function _packAR1012A(v){
  try{
    if(!Array.isArray(v)||!v.length)return v;
    var cols=[],ci={},dict=[],di={},d=[];
    for(var i=0;i<v.length;i++){var o=v[i];if(!o||typeof o!=='object'||Array.isArray(o))return v;
      var r=[];Object.keys(o).forEach(function(k){
        var j=JSON.stringify(o[k]);if(j===undefined)return;
        if(!(k in ci)){ci[k]=cols.length;cols.push(k)}
        if(!(j in di)){di[j]=dict.length;dict.push(j)}
        var c=ci[k];while(r.length<c)r.push('');r[c]=di[j].toString(36);
      });
      d.push(r.join('.'));
    }
    return {__ar1012A:1,c:cols,v:dict,d:d};
  }catch(e){return v}
}
function _unpackAR1012A(v){
  try{
    if(!v||typeof v!=='object'||!v.__ar1012A)return v;
    var cols=v.c||[],raw=v.v||[],vals=raw.map(function(j){return JSON.parse(j)});   /* 數字、字串解析一次；物件（例如寄信紀錄）每一筆各自一份，不共用 */
    return (v.d||[]).map(function(s){var o={},p=String(s).split('.');
      for(var i=0;i<p.length;i++){if(p[i]==='')continue;var n=parseInt(p[i],36),x=vals[n];o[cols[i]]=(x&&typeof x==='object')?JSON.parse(raw[n]):x}return o});
  }catch(e){return v}
}
try{window._packAR1012A=_packAR1012A;window._unpackAR1012A=_unpackAR1012A}catch(e){}
/* 1012A：存檔／讀檔／跨分頁同步都走這兩個 —— 上一輪 kgm12_crewfrz 改成精簡格式後，同步那一條直接 JSON.parse，
   另一個分頁改了凍結班表，這一邊會讀到壓縮後的物件。以標記辨認格式，舊的（未壓縮）內容照常讀得到。 */
var KGM_PACK_AR_R1012A={kgmbd4:1,kgm_resbid6:1,kgm_resmile6:1};
function kgmLsPackR1012A(k,v){
  try{
    if(k==='kgm_tailasg'&&typeof _packTA0818==='function')return _packTA0818(v);
    if(k==='kgm_crewsched')return _packCS1012A(v);
    if(k==='kgm12_crewfrz')return _packFZ1012A(v);
    if(KGM_PACK_AR_R1012A[k])return _packAR1012A(v);
  }catch(e){}
  return v;
}
function kgmLsUnpackR1012A(k,o){
  try{
    if(!o||typeof o!=='object'||Array.isArray(o))return o;
    if(o.__ta0818&&typeof _unpackTA0818==='function')return _unpackTA0818(o);
    if(o.__cs1012A)return _unpackCS1012A(o);
    if(o.__fz1012A)return _unpackFZ1012A(o);
    if(o.__ar1012A)return _unpackAR1012A(o);
  }catch(e){}
  return o;
}
try{window.kgmLsPackR1012A=kgmLsPackR1012A;window.kgmLsUnpackR1012A=kgmLsUnpackR1012A}catch(e){}
var kgmLsFailR1012A=null,kgmLsOkR1012A=null;
(function(){
  function isQuota(e){try{return !!e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014||/quota/i.test(String(e.message||'')))}catch(_){return false}}
  function zh(){try{return LANG!=='en'}catch(_){return true}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function mb(b){return (b/1048576).toFixed(b<1048576?2:1)+' MB'}
  var hidUntil=0;
  kgmLsFailR1012A=window.kgmLsFailR1012A=function(k,e,s){
    var F=window.KGM_LS_FAIL_R1012A=window.KGM_LS_FAIL_R1012A||{n:0,keys:{}};
    F.n++;F.at=new Date().toISOString();F.quota=isQuota(e);F.last=k;F.keys[k]=(s&&s.length)||0;
    F.msg=(String((e&&e.name)||'')+' '+String((e&&e.message)||'')).slice(0,160);
    try{console.warn('[KGM 1012A] localStorage write failed:',k,F.msg)}catch(_){}
    if(Date.now()>=hidUntil)setTimeout(banner,0);
  };
  /* 之前失敗的那一份後來寫進去了 → 從清單拿掉，全部寫進去了就收起提示 */
  kgmLsOkR1012A=window.kgmLsOkR1012A=function(k){
    var F=window.KGM_LS_FAIL_R1012A;if(!F||!F.keys||!(k in F.keys))return;
    delete F.keys[k];if(!Object.keys(F.keys).length){window.KGM_LS_FAIL_R1012A=null;var b=document.getElementById('k12-lsfail');if(b)b.remove()}
  };
  function label(k){
    var L={kgm10_stflink:['員工 ↔ 會員帳號綁定','Staff ↔ member links'],kgm_staff:['員工資料','Staff'],kgmbk4:['訂位','Bookings'],kgmus4:['會員','Members'],
      kgmcph4:['艙等照片','Cabin photos'],kgm_chreq:['資料變更申請（含護照證明）','Data-change requests'],kgm_leave:['請假（含照片）','Leave'],
      kgm7_svc:['客服案件','Service cases'],kgm10_cases84:['案件（含附件）','Cases'],kgm_r48:['冬夏季時刻／里程帳','Seasons / ledger'],
      kgmdov4:['單日航班調整','Date overrides'],kgm_roster:['班表','Roster'],kgm_crewsched:['組員排班（各分頁自己算）','Crew plan (computed)'],
      kgm_tailasg:['機隊排班（各分頁自己算）','Fleet plan (computed)'],kgm_acftsub:['換機紀錄','Swaps'],kgm_audit:['動作歷史','Audit log'],kgm_chat:['員工對話','Staff chat'],kgmu4:['目前登入的會員','Signed-in member'],
      kgmbd4:['BigDeal 競標','BigDeal bids'],kgm_resbid6:['Residence 現金競標','Residence cash bids'],kgm_resmile6:['Residence 哩程競標','Residence mileage bids'],
      kgm_seatinv6:['座位庫存','Seat inventory'],kgm_priceov6:['票價調整','Fare overrides'],kgm12_crewfrz:['已公布組員班表','Published crew roster']}[k];   /* 1012A：補上名稱（原本顯示 S.欄位名稱） */
    if(L)return zh()?L[0]:L[1];
    try{var m=window.kgmSyncMapR1004B&&window.kgmSyncMapR1004B(),f=m&&m[k];if(typeof f==='string')return 'S.'+f}catch(_){}
    return '';
  }
  function usage(){
    var a=[],t=0;
    try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k)||'',b=(k.length+v.length)*2;t+=b;a.push({k:k,b:b})}}catch(_){}
    a.sort(function(x,y){return y.b-x.b});return {t:t,a:a};
  }
  /* 已上傳的附件（dataURL）：在 S 裡找出 100KB 以上的 */
  var TOP={cabinPhotos:['艙等照片','Cabin photo'],profileProofR920G:['護照證明（會員資料）','Passport proof'],chgReq:['資料變更申請','Data-change request'],
    leave:['請假','Leave'],serviceCases0831A:['客服案件','Service case'],casesR84:['案件','Case'],staffCasesR1007A:['員工案件','Staff case'],moneyCasesG:['款項案件','Money case']};
  function atts(){
    var out=[],seen=[];
    function walk(o,path,top,d){
      if(!o||typeof o!=='object'||d>7||seen.indexOf(o)>=0)return;seen.push(o);
      Object.keys(o).forEach(function(k){var v=o[k],p=path+(Array.isArray(o)?'['+k+']':'.'+k);
        if(typeof v==='string'){if(v.length>100000&&v.slice(0,5)==='data:')out.push({o:o,k:k,p:p,top:top,len:v.length,img:/^data:image\//.test(v),name:(o&&o.name)||''})}
        else if(v&&typeof v==='object')walk(v,p,top,d+1)});
    }
    try{Object.keys(S).forEach(function(f){var v=S[f];if(f==='user')return;   /* S.user 是 S.users 裡同一位的副本 */
      if(typeof v==='string'){if(v.length>100000&&v.slice(0,5)==='data:')out.push({o:S,k:f,p:'S.'+f,top:f,len:v.length,img:/^data:image\//.test(v),name:''})}
      else if(v&&typeof v==='object')walk(v,'S.'+f,f,0)})}catch(_){}
    out.sort(function(x,y){return y.len-x.len});return out;
  }
  function attLabel(x){var t=TOP[x.top];return (t?(zh()?t[0]:t[1]):x.top)+(x.name?' · '+x.name:'')}
  function resave(){try{save()}catch(_){}try{(window._lsFlush0818||function(){})()}catch(_){}}
  function banner(){
    var F=window.KGM_LS_FAIL_R1012A;if(!F||!document.body)return;
    var b=document.getElementById('k12-lsfail');
    if(!b){b=document.createElement('div');b.id='k12-lsfail';document.body.appendChild(b)}
    var ks=Object.keys(F.keys||{}),names=ks.map(function(k){return label(k)||k}).slice(0,4).join('、');
    b.innerHTML='<style>#k12-lsfail{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99990;max-width:min(760px,calc(100vw - 32px));box-sizing:border-box;'
      +'background:#2b1a17;color:#fff;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.28);padding:14px 16px 14px 18px;display:flex;gap:14px;align-items:center;font:13px/1.6 system-ui,-apple-system,"Noto Sans TC",sans-serif}'
      +'#k12-lsfail b{color:#ffd9d2}#k12-lsfail .k12l-t{flex:1}#k12-lsfail button{border:0;border-radius:999px;padding:8px 14px;font:800 12.5px system-ui,sans-serif;cursor:pointer;white-space:nowrap}'
      +'#k12-lsfail .k12l-go{background:#fff;color:#7a1f14}#k12-lsfail .k12l-x{background:transparent;color:#d9c3bf;padding:6px 8px;font-size:16px}</style>'
      +'<div class="k12l-t"><b>'+(zh()?(F.quota?'瀏覽器儲存空間已滿':'瀏覽器儲存失敗'):(F.quota?'Browser storage is full':'Browser storage failed'))+'</b>　'
      +(zh()?('剛才的修改（'+esc(names||'—')+'）沒有存進瀏覽器：另一個分頁／前台後台看不到，重新整理也會不見。'):('Recent changes ('+esc(names||'—')+') were not saved: other tabs and the other site file will not see them, and a reload will lose them.'))+'</div>'
      +'<button class="k12l-go" onclick="kgmLsCleanR1012A()">'+(zh()?'整理儲存空間':'Free up space')+'</button>'
      +'<button class="k12l-x" title="'+(zh()?'先關閉（再失敗時會再出現）':'Dismiss')+'" onclick="this.parentNode.remove()">×</button>';
    b.querySelector('.k12l-x').addEventListener('click',function(){hidUntil=Date.now()+60000});
  }
  var ATT=[];
  window.kgmLsCleanR1012A=function(){
    var Z=zh(),u=usage(),F=window.KGM_LS_FAIL_R1012A;ATT=atts();
    var o=document.getElementById('k12-lsclean');if(!o){o=document.createElement('div');o.id='k12-lsclean';document.body.appendChild(o)}
    var tot=ATT.reduce(function(s,x){return s+x.len*2},0),imgs=ATT.filter(function(x){return x.img}).length;
    o.innerHTML='<style>#k12-lsclean{position:fixed;inset:0;z-index:99995;background:rgba(18,24,22,.46);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font:13px/1.6 system-ui,-apple-system,"Noto Sans TC",sans-serif}'
      +'#k12-lsclean .k12c{background:#fff;border-radius:18px;max-width:760px;width:100%;max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 24px 70px rgba(0,0,0,.3);padding:22px 24px}'
      +'#k12-lsclean h3{margin:0 0 4px;font:900 18px Georgia,serif;color:#1F4E46}#k12-lsclean p{margin:0 0 12px;color:#6b7470}'
      +'#k12-lsclean table{width:100%;border-collapse:collapse;margin:6px 0 14px}#k12-lsclean td,#k12-lsclean th{padding:7px 8px;border-bottom:1px solid #eee9e0;text-align:left;vertical-align:top}#k12-lsclean th{font-size:11px;letter-spacing:.06em;color:#8a8478;text-transform:uppercase}'
      +'#k12-lsclean td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}#k12-lsclean code{font-size:11.5px;color:#55605b}'
      +'#k12-lsclean .k12c-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}#k12-lsclean .k12c-sum{background:#f5f2ea;border-radius:12px;padding:10px 14px;margin:10px 0 14px}'
      +'#k12-lsclean button{border:1px solid #d9d2c3;background:#fff;border-radius:999px;padding:6px 12px;font:700 12px system-ui,sans-serif;cursor:pointer}#k12-lsclean button.p{background:#1F4E46;border-color:#1F4E46;color:#fff}'
      +'#k12-lsclean .k12c-msg{min-height:20px;font-weight:700;color:#1f6f4a}</style>'
      +'<div class="k12c"><div class="k12c-h"><div><h3>'+(Z?'整理瀏覽器儲存空間':'Browser storage')+'</h3>'
      +'<p>'+(Z?'前台與後台靠同一個瀏覽器儲存區同步。空間滿了，新的修改就存不進去。':'The front and admin files sync through one browser storage area. When it is full, new changes cannot be saved.')+'</p></div>'
      +'<button onclick="document.getElementById(\'k12-lsclean\').remove()">'+(Z?'關閉':'Close')+'</button></div>'
      +'<div class="k12c-sum">'+(Z?'目前使用約 ':'In use: about ')+'<b>'+mb(u.t)+'</b>'+(F&&F.quota?(Z?'，已達到這個瀏覽器的上限':' — this browser\'s limit has been reached'):'')
      +(F?('<br>'+(Z?'沒有存進去的：':'Not saved: ')+'<b>'+esc(Object.keys(F.keys||{}).map(function(k){return (label(k)||k)+'（'+mb(F.keys[k]*2)+'）'}).join('、')||'—')+'</b>'):'')+'</div>'
      +'<b>'+(Z?'已上傳的附件':'Uploaded attachments')+'</b>　<span style="color:#6b7470">'+ATT.length+(Z?' 個，共 ':' files, ')+mb(tot)+'</span>'
      +(imgs?'　<button class="p" onclick="kgmLsShrinkAllR1012A(this)">'+(Z?'壓縮全部圖片附件（不刪除）':'Compress all images')+'</button>':'')
      +'<table><thead><tr><th>'+(Z?'附件':'Attachment')+'</th><th>'+(Z?'大小':'Size')+'</th><th></th></tr></thead><tbody>'
      +(ATT.length?ATT.map(function(x,i){return '<tr><td>'+esc(attLabel(x))+'<br><code>'+esc(x.p)+'</code></td><td class="n">'+mb(x.len*2)+'</td><td class="n"><button onclick="kgmLsDropAttR1012A('+i+')">'+(Z?'移除':'Remove')+'</button></td></tr>'}).join('')
        :'<tr><td colspan="3" style="color:#9a948a;text-align:center;padding:14px">'+(Z?'沒有大型附件。':'No large attachments.')+'</td></tr>')
      +'</tbody></table>'
      +'<b>'+(Z?'各份資料大小（前 12 名）':'Largest stored items')+'</b>'
      +'<table><thead><tr><th>'+(Z?'資料':'Item')+'</th><th>'+(Z?'大小':'Size')+'</th></tr></thead><tbody>'
      +u.a.slice(0,12).map(function(x){var l=label(x.k);return '<tr><td>'+(l?esc(l)+'<br>':'')+'<code>'+esc(x.k)+'</code></td><td class="n">'+mb(x.b)+'</td></tr>'}).join('')
      +'</tbody></table><div class="k12c-msg" id="k12-lsmsg"></div></div>';
  };
  function after(msg){
    resave();
    setTimeout(function(){var F=window.KGM_LS_FAIL_R1012A,Z=zh();
      window.kgmLsCleanR1012A();
      var m=document.getElementById('k12-lsmsg');
      if(m){m.style.color=F?'#B3261E':'#1f6f4a';m.textContent=msg+(F?(Z?'　仍有資料存不進去，請再移除較大的附件。':'  Some data still cannot be saved.'):(Z?'　已重新存檔，另一邊會同步。':'  Saved; the other side will sync.'))}
      try{render()}catch(_){}
    },700);
  }
  window.kgmLsDropAttR1012A=function(i){
    var x=ATT[i],Z=zh();if(!x)return;
    if(!confirm((Z?'移除這個附件？\n':'Remove this attachment?\n')+attLabel(x)+'（'+mb(x.len*2)+'）\n'+(Z?'紀錄本身保留，只是看不到這個檔案。':'The record stays; only the file is removed.')))return;
    if(x.o===S||x.top==='cabinPhotos')delete x.o[x.k];else{x.o[x.k]='';try{x.o.removedR1012A=new Date().toISOString()}catch(_){}}
    try{logAct&&logAct('整理儲存空間','移除附件 '+x.p)}catch(_){}
    after(Z?'已移除。':'Removed.');
  };
  window.kgmLsShrinkAllR1012A=function(btn){
    var Z=zh(),list=ATT.filter(function(x){return x.img}),n=0,saved=0;if(!list.length)return;
    if(btn){btn.disabled=true;btn.textContent=Z?'壓縮中…':'Compressing…'}
    (function next(i){
      if(i>=list.length){try{logAct&&logAct('整理儲存空間','壓縮圖片附件 '+n+' 個')}catch(_){}after((Z?'已壓縮 ':'Compressed ')+n+(Z?' 個，省下 ':' files, saved ')+mb(saved*2)+(Z?'。':'.'));return}
      var x=list[i],cab=x.top==='cabinPhotos';
      window.kgmShrinkAttR1012A(x.o[x.k],(x.o&&x.o.type)||'',function(v,t){
        if(v!==x.o[x.k]){saved+=x.o[x.k].length-v.length;x.o[x.k]=v;n++;try{if(!cab&&x.o.type)x.o.type=t;if(!cab&&x.o.size)x.o.size=Math.round(v.length*0.75)}catch(_){}}
        next(i+1)},cab?{max:2000,q:0.86,min:100000}:{min:100000});
    })(0);
  };
  /* 圖片縮小：長邊 max（預設 1600px）、JPEG 品質 q（預設 0.8）；只處理 min（預設 300KB）以上的圖片，結果沒有比較小就用原檔 */
  window.kgmShrinkAttR1012A=function(u,type,cb,opt){
    opt=opt||{};var max=opt.max||1600,qu=opt.q||0.8,min=opt.min||300000;
    try{
      if(typeof u!=='string'||u.length<min||!/^data:image\/(jpeg|jpg|png|webp|bmp)/i.test(u))return cb(u,type);
      var im=new Image();
      im.onload=function(){try{
        var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,max/Math.max(w,h)),c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(w*sc));c.height=Math.max(1,Math.round(h*sc));
        var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.imageSmoothingQuality='high';g.drawImage(im,0,0,c.width,c.height);
        var o=c.toDataURL('image/jpeg',qu);if(o&&o.length<u.length)cb(o,'image/jpeg');else cb(u,type);
      }catch(_){cb(u,type)}};
      im.onerror=function(){cb(u,type)};im.src=u;
    }catch(_){cb(u,type)}
  };
})();

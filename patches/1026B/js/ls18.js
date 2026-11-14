/* 1018A：使用者回報（1015A 交付後）「瀏覽器儲存空間已滿」還是一開頁就跳，整理儲存空間畫面：
   員工通知 kgm_stnotif 3.4 MB、會員 kgmus4 3.0 MB（沒存進去的 7.9 MB）、員工資料 kgm_staff 2.9 MB、單日航班調整 0.48 MB。
   實測找到的來源（tests/grow16.js、days16.js、sim16.js）：
   · 員工通知：組員 60 天班表每次開頁重排一次，就對每位組員再發一則一模一樣的「您的 60 天班表已更新」，從來不刪
     （開一次頁多 380 則；用後台「模擬資料」產生 3,000 位員工時一次多 1,900 則）。→ notifyStaff 同一則只留一份（另一段）。
   · 單日航班調整 kgmdov4：每天自動寫入當天每一班的動態預測（約 1,000 筆、13 萬字元），一天一天累積、從來不刪。→ kgmDovTrimR1018A。
   · 會員：後台「模擬資料」產生會員之後，會替每一位模擬會員補一整年的假里程紀錄（每位約 13 筆、1,340 字元）直接存進去：
     6,000 位會員從 240 萬字元變成 1,050 萬字元，比整個瀏覽器的上限（約 520 萬字元）還大，永遠存不進去。
     → 這些自動產生的紀錄存檔時只存「怎麼重算」（synLog18：產生日期、等級、里程、語言、筆數、指紋），讀回時用同一套公式重算，
       內容一模一樣（r53 kgmSynLogR1018A）；之後有真的里程異動（筆數或指紋不一樣）就整份照存，不冒險。
   · 員工資料、員工通知、會員改用跟競標清單同一種「欄位＋值字典」精簡格式（_packAR1012A），讀回時還原成一模一樣的物件，不刪任何資料。
   · 模擬資料一次要產生多少，先估算瀏覽器存不存得下；存不下就不產生、告訴使用者最多大約多少（kgmSimFitR1018A）。 */
KGM_PACK_AR_R1012A.kgm_staff=1;KGM_PACK_AR_R1012A.kgm_stnotif=1;KGM_PACK_AR_R1012A.kgmus4=1;
function _h18(s){s=String(s);var h=2166136261>>>0;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(36)+'.'+s.length.toString(36)}
try{window.kgmHashR1018A=_h18}catch(e){}
/* 存檔前：自動產生、而且之後沒有變過的模擬會員里程紀錄不存（只留 synLog18） */
function _stripSynR1018A(arr){
  if(!Array.isArray(arr))return arr;var out=null;
  for(var i=0;i<arr.length;i++){var u=arr[i],g=u&&u.synLog18;
    if(!g||!Array.isArray(u.milesLog)||u.milesLog.length!==g.n)continue;
    if(_h18(JSON.stringify(u.milesLog))!==g.h)continue;
    if(!out)out=arr.slice();var c={};for(var k in u)if(k!=='milesLog'&&Object.prototype.hasOwnProperty.call(u,k))c[k]=u[k];out[i]=c}
  return out||arr;
}
try{window._stripSynR1018A=_stripSynR1018A}catch(e){}
/* 單日航班調整裡「每天自動寫入的航班動態預測」：前天以前、純預測（只有時間／狀態／預測欄位）的整筆刪掉；
   人工調整（manual、取消、轉降、或有預測以外的欄位）一律保留。航班動態頁只看今天前後，舊的預測沒有任何地方讀。 */
var _dovT18=0;
function kgmDovTrimR1018A(v,force){
  try{
    if(!v||typeof v!=='object'||Array.isArray(v))return 0;var now=Date.now();if(!force&&now-_dovT18<60000)return 0;_dovT18=now;
    var t;try{t=todayISO()}catch(_){t=new Date().toISOString().slice(0,10)}
    var c=new Date(t+'T12:00:00Z');c.setUTCDate(c.getUTCDate()-2);var cut=c.toISOString().slice(0,10),n=0,
      AUTO={dep:1,arr:1,status:1,predictedAt:1,predictionSource:1,predictionUpdatedAt:1,depDD:1,arrDD:1};
    for(var k in v){if(!Object.prototype.hasOwnProperty.call(v,k))continue;var m=/(20\d\d-\d\d-\d\d)$/.exec(k);if(!m||m[1]>=cut)continue;var o=v[k];
      if(!o||typeof o!=='object'||o.manual===true||o.status==='Cancelled'||o.status==='Diverted')continue;
      /* 換季整理會把預測欄位拿掉、只剩預測狀態（Scheduled／Time Change／On Time）：也算自動的 */
      if(!(o.predictedAt||o.predictionSource||o.predictionUpdatedAt)&&!(o.status==='Scheduled'||o.status==='Time Change'||o.status==='On Time'))continue;
      var auto=true;for(var f in o)if(!AUTO[f]){auto=false;break}if(!auto)continue;delete v[k];n++}
    if(n)window.KGM_DOV_TRIM_R1018A=(window.KGM_DOV_TRIM_R1018A||0)+n;return n;
  }catch(e){return 0}
}
try{window.kgmDovTrimR1018A=kgmDovTrimR1018A}catch(e){}
/* 模擬資料產生前估算：員工每位約 380 字元（含員工票眷屬名單）、會員約 290、訂位約 1,400（實測精簡格式的平均）。
   可用空間 = 上限 − 其他資料 − 預留 35 萬（組員班表、通知、競標每天會長）。 */
function kgmSimFitR1018A(nS,nC,nB){
  try{
    var Q=5200000,R=350000,used=0,old=0,K={kgm_staff:1,kgmus4:1,kgmbk4:1};
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),l=k.length+(localStorage.getItem(k)||'').length;used+=l;if(K[k])old+=l}
    var real=0;try{real+=JSON.stringify(_packAR1012A((S.staff||[]).filter(function(x){return !(x&&x.simulated)}))).length}catch(_){}
    try{real+=JSON.stringify(_packAR1012A(_stripSynR1018A((S.users||[]).filter(function(x){return !(x&&x.simulated)})))).length}catch(_){}
    try{real+=JSON.stringify((S.bookings||[]).filter(function(x){return !(x&&x.simulated)})).length}catch(_){}
    /* 空間滿時會自動清掉的（組員排班快取、模擬競標出價）也算可用 */
    var ev=0;try{ev+=(localStorage.getItem('kgm_crewsched')||'').length;
      [['bigDeals','kgmbd4'],['residenceBidsR83','kgm_resbid6'],['resMileBidsR161','kgm_resmile6']].forEach(function(z){var a=S[z[0]],l=(localStorage.getItem(z[1])||'').length;if(!Array.isArray(a)||!l)return;
        ev+=Math.max(0,l-JSON.stringify(_packAR1012A(a.filter(function(x){return !(x&&x.demoR922)}))).length)})}catch(_){}
    var room=Q-R-(used-old)-real+ev,need=nS*380+nC*290+nB*1400;
    if(need<=room)return {ok:true,need:need,room:room};
    var sc=room>0?room/need:0,zh=true;try{zh=LANG!=='en'}catch(_){}
    var a=Math.floor(nS*sc),b=Math.floor(nC*sc),c=Math.floor(nB*sc);
    return {ok:false,need:need,room:room,max:[a,b,c],msg:zh?('瀏覽器儲存空間不夠：這次約需 '+Math.round(need/10000)+' 萬字元，目前只剩約 '+Math.max(0,Math.round(room/10000))+' 萬字元（瀏覽器上限約 520 萬）。'
        +'產生了也存不進去，另一個分頁／重新整理就會不見，所以這次沒有產生。可以改成大約：員工 '+a.toLocaleString()+'、會員 '+b.toLocaleString()+'、訂位 '+c.toLocaleString()+' 以內。')
      :('Not enough browser storage: about '+Math.round(need/1000)+'k characters needed, '+Math.max(0,Math.round(room/1000))+'k available. Nothing was generated. Try at most staff '+a+', members '+b+', bookings '+c+'.')};
  }catch(e){return {ok:true}}
}
try{window.kgmSimFitR1018A=kgmSimFitR1018A}catch(e){}

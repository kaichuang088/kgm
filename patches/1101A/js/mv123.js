/* ══ 資料搬家（工作代號 1123A；使用者：「以前帳號紀錄都不見了」「你可以搬家嗎 你改改看」）══
   網站沒有伺服器：帳號、訂位、員工帳號都存在「這個瀏覽器、這個網址」的儲存區。上 Netlify（https://kgm-airways.netlify.app）＝新網址，從空的開始。
   Chrome 直接打開本機 HTML 檔時，所有本機檔案共用同一份儲存區 → 用這一版的檔案在電腦上打開，就讀得到以前的資料。
   ① 本機檔案（或任何不是線上版的網址）：頁尾「資料搬家」→「搬到線上版」＝開線上版新分頁，用 postMessage 把整份儲存區傳過去；也可以「下載備份檔」。
   ② 線上版：收到資料 → 顯示來源與筆數 → 使用者按「匯入」才寫入；或「從備份檔匯入」。
   寫入一律用瀏覽器原生的 setItem（網站的跨分頁同步那層會跟頁面上目前的資料合併、把匯入的訂位蓋成空的——實測），
   寫完這一頁不准再寫（關頁前的存檔會把記憶體裡的舊資料存回去），再重新整理。 */
(function(){
  if(window.__mv123)return;window.__mv123=1;
  var TARGET=window.KGM_MOVE_URL_R1123A||'https://kgm-airways.netlify.app/';
  var TO=(function(){try{return new URL(TARGET).origin}catch(_){return ''}})();
  function online(){return location.origin===TO}
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function flush(){try{if(typeof save==='function')save()}catch(_){}try{if(window.kgmFlushSaveR32)window.kgmFlushSaveR32()}catch(_){}try{if(typeof _ls0818now==='function')_ls0818now()}catch(_){}}
  function pack(){flush();var o={},n=0,sz=0;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k);if(v==null)continue;o[k]=v;n++;sz+=v.length}
    return {kgmBackup:1,at:new Date().toISOString(),from:location.href.split('#')[0],n:n,size:sz,counts:counts(),keys:o}}
  function counts(){var c={};try{c.users=(S.users||[]).length;c.bookings=(S.bookings||[]).length;c.staff=(S.staff||[]).length}catch(_){}return c}
  function kb(n){return n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'}
  function cntTxt(c){c=c||{};var zh=z();return (zh?'會員 ':'Members ')+(c.users==null?'—':c.users)+(zh?'、訂位 ':', bookings ')+(c.bookings==null?'—':c.bookings)+(zh?'、員工 ':', staff ')+(c.staff==null?'—':c.staff)}
  function sumTxt(d){var zh=z();return cntTxt(d.counts)+(zh?'（共 ':' (')+(d.n||Object.keys(d.keys||{}).length)+(zh?' 筆、':' items, ')+kb(d.size||0)+(zh?'）':')')}
  /* ── 寫入 ── */
  function apply(d){var ifr=document.createElement('iframe');ifr.style.display='none';document.body.appendChild(ifr);var NS=ifr.contentWindow.Storage.prototype.setItem;
    var ok=0,bad=[];Object.keys(d.keys).forEach(function(k){try{NS.call(localStorage,k,d.keys[k]);ok++}catch(e){bad.push(k)}});
    try{var N=function(){};Storage.prototype.setItem=N;Storage.prototype.removeItem=N;Storage.prototype.clear=N}catch(_){}
    window.KGM_MOVED_R1123A={ok:ok,bad:bad.length};return {ok:ok,bad:bad}}
  function done(r){var zh=z();box('<small>DATA MOVE</small><h3>'+(zh?'匯入完成':'Import complete')+'</h3><p>'+(zh?'已寫入 '+r.ok+' 筆':'Wrote '+r.ok+' items')+(r.bad.length?(zh?'；有 '+r.bad.length+' 筆寫不進去（儲存空間不足）':'; '+r.bad.length+' failed (storage full)'):'')+(zh?'。網頁會重新整理，之後用原本的帳號登入即可（後台 /admin/ 也一起搬好了）。':'. The page will reload.')+'</p>');
    setTimeout(function(){location.replace(location.pathname+location.search)},1600)}
  function valid(d){return d&&d.kgmBackup&&d.keys&&typeof d.keys==='object'}
  /* ── 視窗 ── */
  function close(){var m=document.getElementById('mv123m');if(m)m.remove()}
  function box(inner){close();var ov=document.createElement('div');ov.id='mv123m';ov.innerHTML='<div class="mv123-box"><button type="button" class="mv123-x" aria-label="close">×</button>'+inner+'</div>';
    ov.addEventListener('click',function(e){if(e.target===ov||(e.target.classList&&e.target.classList.contains('mv123-x')))close()});document.body.appendChild(ov);return ov}
  function confirmImport(d,how){var zh=z();var ov=box('<small>DATA MOVE</small><h3>'+(zh?'把資料匯入這個網址？':'Import data into this site?')+'</h3>'
      +'<p class="mv123-src">'+(zh?'來源：':'From: ')+E(d.from||'—')+'<br>'+(zh?'時間：':'Saved: ')+E(String(d.at||'').replace('T',' ').slice(0,16))+'<br>'+E(sumTxt(d))+'</p>'
      +'<p class="mv123-warn">'+(zh?'這個網址目前的資料（'+E(cntTxt(counts()))+'）會被換成上面這一份。':'Data currently on this site ('+E(cntTxt(counts()))+') will be replaced.')+'</p>'
      +'<div class="mv123-act"><button type="button" class="mv123-sec" data-a="no">'+(zh?'取消':'Cancel')+'</button><button type="button" class="mv123-go" data-a="yes">'+(zh?'匯入':'Import')+'</button></div>');
    ov.querySelector('[data-a=no]').onclick=close;ov.querySelector('[data-a=yes]').onclick=function(){done(apply(d))};}
  function pickFile(){var f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.style.display='none';document.body.appendChild(f);
    f.onchange=function(){var r=new FileReader();r.onload=function(){var d=null;try{d=JSON.parse(r.result)}catch(_){}if(!valid(d)){alert(z()?'這不是 KGM 備份檔。':'Not a KGM backup file.');return}confirmImport(d,'file')};if(f.files[0])r.readAsText(f.files[0]);f.remove()};f.click()}
  function download(){var d=pack();var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));a.download='kgm-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500);return d}
  var SENT=0;
  function push(){var zh=z(),w=null;try{w=window.open(TARGET+'#kgm-move','kgm_move_r1123a')}catch(_){}
    if(!w){alert(zh?'瀏覽器擋住了新分頁。請允許這個網頁開新視窗，或改用「下載備份檔」。':'Pop-up blocked. Allow pop-ups or use "Download backup".');return}
    var d=pack();SENT=0;window.__mv123d=d;
    box('<small>DATA MOVE</small><h3>'+(zh?'正在搬到線上版…':'Moving to the online site…')+'</h3><p>'+(zh?'已開啟 '+E(TARGET)+'。資料傳過去之後，請到那個分頁按「匯入」。':'Switch to the new tab and press Import.')+'</p><p class="mv123-src">'+E(sumTxt(d))+'</p><p class="mv123-st" id="mv123st">'+(zh?'等待線上版回應…':'Waiting for the online site…')+'</p>');
    var t0=Date.now(),iv=setInterval(function(){if(SENT||Date.now()-t0>90000){clearInterval(iv);if(!SENT){var s=document.getElementById('mv123st');if(s)s.textContent=zh?'線上版沒有回應（可能是網路或瀏覽器擋住）。請改用「下載備份檔」，再到線上版按「從備份檔匯入」。':'No response. Use Download backup instead.'}}},1000)}
  window.addEventListener('message',function(e){var m=e.data;if(!m||typeof m!=='object')return;
    if(m.type==='kgm-move-ready-r1123a'&&e.origin===TO&&window.__mv123d){try{e.source.postMessage({type:'kgm-move-data-r1123a',data:window.__mv123d},TO)}catch(_){}SENT=1;var s=document.getElementById('mv123st');if(s)s.textContent=z()?'已傳過去 ✓ 請到線上版分頁按「匯入」。':'Sent ✓ Press Import on the online tab.'}
    if(m.type==='kgm-move-data-r1123a'&&online()&&window.opener&&e.source===window.opener&&valid(m.data)&&!window.__mv123got){window.__mv123got=1;confirmImport(m.data,'push')}});
  /* 線上版被「搬到線上版」打開：一直跟開它的那頁說「準備好了」，直到收到資料（本機檔案的 origin 是 null，只能用 '*'；資料只收開它的那個視窗傳來的） */
  if(online()&&/^#kgm-move$/.test(location.hash)&&window.opener){var k=0,rv=setInterval(function(){if(window.__mv123got||++k>90){clearInterval(rv);return}try{window.opener.postMessage({type:'kgm-move-ready-r1123a'},'*')}catch(_){}},1000);
    try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}}
  window.kgmMoveOpenR1123A=function(){var zh=z(),on=online(),c=counts();
    var ov=box('<small>DATA MOVE</small><h3>'+(zh?'資料搬家':'Move your data')+'</h3>'
      +'<p>'+(zh?'KGM 的帳號、訂位、員工帳號存在<b>這個瀏覽器、這個網址</b>裡，換網址或換電腦都是另一份。':'Accounts and bookings are stored in this browser for this address only.')+'</p>'
      +'<p class="mv123-src">'+(zh?'這裡目前：':'Here now: ')+E(cntTxt(c))+'</p>'
      +(on?('<p>'+(zh?'要把舊資料搬來：在<b>原本那台電腦、原本那個瀏覽器</b>打開 KGM 網站檔案（新版的檔案也可以，Chrome 的本機檔案共用同一份資料）→ 頁尾「資料搬家」→「搬到線上版」，這裡會自動收到。或者：':'On the old computer, open the KGM file → footer "Move data" → "Move to online site". Or:')+'</p>'
            +'<div class="mv123-act"><button type="button" class="mv123-sec" data-a="dl">'+(zh?'下載這裡的備份檔':'Download backup')+'</button><button type="button" class="mv123-go" data-a="file">'+(zh?'從備份檔匯入':'Import from file')+'</button></div>')
         :('<div class="mv123-act"><button type="button" class="mv123-sec" data-a="dl">'+(zh?'下載備份檔':'Download backup')+'</button><button type="button" class="mv123-go" data-a="push">'+(zh?'搬到線上版':'Move to online site')+'</button></div>'
            +'<p class="mv123-n">'+(zh?'「搬到線上版」會開 '+E(TARGET)+'，把這裡的資料直接傳過去，在那邊按「匯入」就好。也可以下載備份檔，到線上版按「從備份檔匯入」（換電腦時用這個）。':'Opens '+E(TARGET)+' and sends the data there.')+'</p>'
            +'<p class="mv123-n"><a href="javascript:void 0" data-a="file">'+(zh?'從備份檔匯入到這裡':'Import a backup here')+'</a></p>')));
    [].forEach.call(ov.querySelectorAll('[data-a]'),function(b){b.onclick=function(){var a=b.getAttribute('data-a');if(a==='dl')download();else if(a==='file')pickFile();else if(a==='push')push()}})};
  /* ── 入口：前台頁尾、後台登入頁頁尾 ── */
  function paint(){try{var zh=z(),t=zh?'資料搬家':'Move data';
      var f=document.querySelector('#app footer')||document.querySelector('footer');if(f&&!f.querySelector('.mv123-l')){var a=document.createElement('a');a.href='javascript:void 0';a.className='mv123-l';a.textContent=t;a.onclick=window.kgmMoveOpenR1123A;f.appendChild(a)}
      var g=document.querySelector('.k7a-foot');if(g&&!g.querySelector('.mv123-l')){var b=document.createElement('a');b.href='javascript:void 0';b.className='mv123-l mv123-l2';b.textContent=t;b.onclick=window.kgmMoveOpenR1123A;g.appendChild(document.createTextNode(' · '));g.appendChild(b)}}catch(_){}}
  function hook(){var r0=window.render;if(typeof r0!=='function'||r0.__mv123)return;var w=function(){var r=r0.apply(this,arguments);try{paint()}catch(_){}return r};try{Object.keys(r0).forEach(function(k){if(!(k in w))w[k]=r0[k]})}catch(_){}w.__mv123=1;window.render=w;try{render=w}catch(_){}}
  hook();[0,1500,4000,12000].forEach(function(t){setTimeout(hook,t)});setInterval(paint,1500);
  try{var cs=document.createElement('style');cs.textContent='#mv123m{position:fixed;inset:0;z-index:2147483000;background:rgba(18,28,22,.46);display:flex;align-items:center;justify-content:center;padding:16px}'
    +'.mv123-box{position:relative;background:#fff;border-radius:18px;max-width:500px;width:100%;padding:26px 28px;box-shadow:0 24px 60px rgba(0,0,0,.25);color:#1f2a24;max-height:90vh;overflow:auto}'
    +'.mv123-box small{font-size:10.5px;letter-spacing:.18em;color:#a08a5c;font-weight:800}.mv123-box h3{margin:4px 0 10px;font-size:20px;color:#0b3b30}.mv123-box p{font-size:13.5px;line-height:1.75;color:#4a564f;margin:0 0 12px}'
    +'.mv123-src{background:#F6F9F7;border:1px solid #D8E5DD;border-radius:10px;padding:10px 12px;font-size:12.5px!important;color:#2d4a3e!important;word-break:break-all}.mv123-warn{color:#9a3b2f!important;font-size:12.5px!important}.mv123-n{font-size:12px!important;color:#8a8175!important}.mv123-st{font-weight:700;color:#0b3b30!important}'
    +'.mv123-act{display:flex;justify-content:flex-end;gap:8px;margin:6px 0 12px;flex-wrap:wrap}.mv123-go{background:#0b3b30;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-weight:800;cursor:pointer;font-size:14px}.mv123-sec{background:#fff;border:1px solid #dcd3be;color:#0b3b30;border-radius:10px;padding:9px 16px;font-weight:700;cursor:pointer;font-size:14px}'
    +'.mv123-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:1px solid #e3e0d8;background:#fff;font-size:18px;cursor:pointer;line-height:1}'
    +'footer .mv123-l{display:block;text-align:center;margin:10px auto 0;font-size:12px;color:inherit;opacity:.75;text-decoration:underline;cursor:pointer}.k7a-foot .mv123-l2{color:inherit;text-decoration:underline;cursor:pointer}'
    +'@media (max-width:640px){.mv123-box{padding:22px 18px}.mv123-act{justify-content:stretch}.mv123-act button{flex:1}}';(document.head||document.documentElement).appendChild(cs)}catch(_){}
})();

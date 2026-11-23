/* KGM 資料搬家②（新網址 https://kgm-airways.netlify.app）：打開網站，按 F12 → Console，貼上整段按 Enter，畫面右上角會出現「選擇 KGM 備份檔」按鈕，按它選剛才下載的 json，完成後自動重新整理 */
(function(){var b=document.createElement('div');b.style.cssText='position:fixed;top:16px;right:16px;z-index:2147483647;background:#0b493b;color:#fff;padding:14px 18px;border-radius:12px;font:600 15px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer';b.textContent='選擇 KGM 備份檔';
var f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.style.display='none';b.onclick=function(){f.click()};
f.onchange=function(){var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||!d.kgmBackup||!d.keys)throw new Error('不是 KGM 備份檔');
  if(!confirm('要把備份（'+Object.keys(d.keys).length+' 筆，'+String(d.at).slice(0,16)+'）匯入這個網址嗎？這個網址目前的資料會被備份內容蓋掉。'))return;
  /* 直接用瀏覽器原生的寫入（網站自己包了一層跨分頁同步，整批寫進去會跟頁面上目前的空資料合併掉） */
  var ifr=document.createElement('iframe');ifr.style.display='none';document.body.appendChild(ifr);var NS=ifr.contentWindow.Storage.prototype.setItem,NR=ifr.contentWindow.Storage.prototype.removeItem;
  var ok=0,bad=[];Object.keys(d.keys).forEach(function(k){try{NS.call(localStorage,k,d.keys[k]);ok++}catch(e){bad.push(k)}});
  /* 匯入後這一頁不能再寫：網頁關閉／重新整理前會把記憶體裡的舊資料（空的）存回去，蓋掉剛匯入的 */
  try{var N=function(){};Storage.prototype.setItem=N;Storage.prototype.removeItem=N;Storage.prototype.clear=N;localStorage.setItem=N}catch(_){}window.onbeforeunload=null;
  alert('匯入完成：'+ok+' 筆'+(bad.length?'；寫不進去 '+bad.length+' 筆（儲存空間不足）':'')+'。按確定後重新整理。');location.reload()}catch(e){alert('匯入失敗：'+e.message)}};r.readAsText(f.files[0])};
document.body.appendChild(b);document.body.appendChild(f)})();

/* KGM 資料搬家①（舊網址）：在「原本有帳號紀錄的那個網址」打開 KGM，按 F12 → Console，貼上整段按 Enter，會下載 kgm-backup-日期.json */
(function(){var o={},n=0,sz=0;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i),v=localStorage.getItem(k);if(v==null)continue;o[k]=v;n++;sz+=v.length}
var blob=new Blob([JSON.stringify({kgmBackup:1,at:new Date().toISOString(),from:location.href,keys:o})],{type:'application/json'});
var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kgm-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();
console.log('KGM 備份完成：'+n+' 筆、約 '+Math.round(sz/1024)+' KB')})();

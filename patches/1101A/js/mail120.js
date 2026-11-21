/* ══ 1120A：模擬訂位一律不寄信（使用者固定要求「模擬資料一律不寄信」）══
   實測（w5，開頁 90 秒、Worker 被擋）：客服／案件模擬轉入的訂位（simR1010A／csSimR1012A）照樣向 Worker 註冊
   /schedule/booking-notifications（報到提醒、BigDeal 開放信），信箱是模擬的（例：daniel.wu82@outlook.com.au）——
   Worker 是通的時候就會寄給不相干的人。註冊的程式在 0811Q／R3／r7 三層閉包裡，各自重試，一個一個改不完。
   改：在最底層的 fetch 擋：送往寄信 Worker 的內容（JSON、form 的 p=、GET 的 ?p=，三種傳輸都會經過 fetch）
   只要提到的訂位代號是模擬訂位（kgmIsMockBookingR1026C，跟時刻異動信同一個判斷），就不送出、直接回「已略過」
   （呼叫端當成成功，不會一直重試）。真實訂位完全照舊。計數在 window.KGM_MAIL_MOCK_SKIP_R1120A。
   R24 開頁 5 秒內會把 window.fetch 換回 window.__kgmWorkerTransportR24 → 那個也一起換成這層。 */
(function(){
  if(window.__mail120)return;window.__mail120=1;
  window.KGM_MAIL_MOCK_SKIP_R1120A=0;
  function host(u){try{return new URL(u,location.href).host}catch(_){return ''}}
  function isWorker(u){if(!/^https?:/i.test(u))return false;var h=host(u);if(/workers\.dev$/i.test(h))return true;try{var b=window.kgmWorkerBaseR22&&window.kgmWorkerBaseR22();if(b&&host(b)===h)return true}catch(_){}return false}
  function b64(q){try{q=decodeURIComponent(q).replace(/-/g,'+').replace(/_/g,'/');while(q.length%4)q+='=';var bin=atob(q),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new TextDecoder().decode(u)}catch(_){return ''}}
  function text(url,init){var t='';try{var b=init&&init.body;if(typeof b==='string'){t+=b;var m=/(?:^|&)p=([^&]+)/.exec(b);if(m)t+=' '+b64(m[1])}}catch(_){}
    try{var q=/[?&]p=([^&]+)/.exec(url);if(q)t+=' '+b64(q[1])}catch(_){}return t}
  var IDX=null,IDXN=-1,IDXT=0;
  function mockIdx(){var L=[];try{L=S.bookings||[]}catch(_){}if(IDX&&IDXN===L.length&&Date.now()-IDXT<15000)return IDX;IDX={};IDXN=L.length;IDXT=Date.now();
    var f=window.kgmIsMockBookingR1026C;L.forEach(function(b){if(!b||!b.pnr)return;var m=false;try{m=f?!!f(b):!!(b.simulated||b.simR1010A||b.csSimR1012A||b.mockR1026C)}catch(_){}IDX[String(b.pnr).toUpperCase()]=m});return IDX}
  function isMockMail(url,init){var t=text(url,init);if(!t)return false;var re=/"pnr"\s*:\s*"([A-Za-z0-9]{5,8})"/g,m,X=null,any=false,real=false;
    while((m=re.exec(t))){X=X||mockIdx();var k=m[1].toUpperCase();if(!(k in X))continue;any=true;if(X[k])continue;real=true}
    return any&&!real}   /* 提到的訂位全是模擬的才擋；混到真實訂位就照送 */
  function skip(){window.KGM_MAIL_MOCK_SKIP_R1120A++;return Promise.resolve(new Response(JSON.stringify({ok:true,skipped:'mock',jobs:[]}),{status:200,headers:{'Content-Type':'application/json'}}))}
  function wrap(F){if(typeof F!=='function'||F.__mail120)return F;var w=function(input,init){try{var url=typeof input==='string'?input:(input&&input.url)||'';if(isWorker(url)&&isMockMail(url,init))return skip()}catch(_){}return F.apply(this,arguments)};w.__mail120=1;w._inner=F;return w}
  function install(){try{if(window.__kgmWorkerTransportR24&&!window.__kgmWorkerTransportR24.__mail120)window.__kgmWorkerTransportR24=wrap(window.__kgmWorkerTransportR24)}catch(_){}
    try{if(!window.fetch.__mail120)window.fetch=wrap(window.fetch)}catch(_){}}
  install();[0,300,1000,3000,6000,12000,30000].forEach(function(t){setTimeout(install,t)});setInterval(install,20000);
})();

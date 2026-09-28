/* 0927D · 後台小問題 */
/* ① 「這個訂位的全部歷史動作 85AKK6」跟著到每一頁：只看「有登入後台＋分頁名稱」，沒看人是不是在後台頁面；
     離開之後每 1.7 秒又把它接到整頁最下面，而且條件不符時也不會拿掉。改成只在後台的客服／訂位相關分頁出現，其餘一律移除。 */
RL('hist only admin','kgm-0908a-r152',
"function mountHist152(){\n  var pnr='';try{\n    if(!S.adminAuthed)return 0;\n    pnr=curPnr152();\n  }catch(_){return 0}\n  if(!pnr)return 0;\n  var app=document.getElementById('app');if(!app)return 0;\n  /* 只掛在客服／訂位管理相關頁面 */\n  var tab='';try{tab=String(S.adminTab||'')}catch(_){}\n  if(!/booking|desk|cases|service|ticket/i.test(tab))return 0;",
"function mountHist152(){\n  var app=document.getElementById('app');if(!app)return 0;\n  /* 0927D：只在後台（S.view==='admin'）的客服／訂位分頁出現；其他頁面（含前台）一律拿掉 */\n  var tab='';try{tab=String(S.adminTab||'')}catch(_){}\n  var okHere=false;try{okHere=!!(S.adminAuthed&&S.view==='admin'&&/booking|desk|cases|service|ticket/i.test(tab))}catch(_){}\n  if(!okHere){app.querySelectorAll('.k152-hist').forEach(function(e){e.remove()});return 0}\n  var pnr='';try{pnr=curPnr152()}catch(_){return 0}\n  if(!pnr){app.querySelectorAll('.k152-hist').forEach(function(e){e.remove()});return 0}");
/* ② 競標管理：里程出價的「金額」欄是 —，看不到旅客買票花了多少。
     旅客實付＝該 PNR 訂位的實付總額；後台自動補的模擬出價（demoR922）沒有真的訂位，
     用該航班當天商務艙 Value（B-K）單程票價當作他買的票，算一次就記在出價上（不會跳動）。
     合併價值（訂位金額＋里程折現）也改用同一個來源，不再只算里程。 */
RL('ticket paid fn','kgm-0905b-r161',
"    var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];\n    if(!b)return 0;\n    return Math.max(0,Math.round(+b.total||0));\n  }catch(_){return 0}\n};",
"    var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];\n    if(!b)return window.kgmResTicketPaidR927D?window.kgmResTicketPaidR927D(bid):0;\n    return Math.max(0,Math.round(+b.total||0));\n  }catch(_){return 0}\n};\n/* 0927D：旅客實付票價（競標管理每一列都顯示，不論現金或里程出價） */\nwindow.kgmResTicketPaidR927D=function(bid){\n  try{\n    if(!bid)return 0;\n    var bk=bid.pnr?(S.bookings||[]).filter(function(x){return x&&x.pnr===bid.pnr})[0]:null;\n    if(bk)return Math.max(0,Math.round(+bk.total||0));\n    if(+bid.ticketPaidR927D>0)return +bid.ticketPaidR927D;\n    if(!bid.demoR922)return 0;\n    var dt=new Date(bid.date+'T12:00:00'),f=null;\n    [].concat(FLIGHTS,(S.customFlights||[])).some(function(x){\n      if(!x||x.via||x.code!==bid.code)return false;\n      var on=true;try{on=(typeof flyOn!=='function')||flyOn(x,dt)}catch(_){on=false}\n      if(on)f=x;return on;\n    });\n    if(!f)return 0;\n    /* 模擬旅客各自買的票種不同（用出價 id 固定挑，不會跳動）：里程出價只能從可升等的 B-K／B-M，現金出價 B-T／B-K／B-M 都有 */\n    var h=0,sid=String(bid.id||bid.pnr||'');for(var i=0;i<sid.length;i++)h=(h*31+sid.charCodeAt(i))>>>0;\n    var codes=(bid.miles!=null&&bid.amount==null)?['B-K','B-M']:['B-T','B-K','B-M'];\n    var p=Math.round(+window.owPrice(Object.assign({},f,{date:bid.date}),codes[h%codes.length],1)||0);\n    if(p>0)bid.ticketPaidR927D=p;\n    return p;\n  }catch(_){return 0}\n};",1);
RL('rows ticket cash','kgm-0823h-r61',
"      who:b.userId||'',amount:+b.amount||0,miles:0,status:b.status||'open',\n      placedAt:b.placedAt||'',src:'residenceBidsR83'})})}catch(_){}",
"      who:b.userId||'',amount:+b.amount||0,miles:0,status:b.status||'open',\n      ticket:(window.kgmResTicketPaidR927D?window.kgmResTicketPaidR927D(b):0),\n      placedAt:b.placedAt||'',src:'residenceBidsR83'})})}catch(_){}",1);
RL('rows ticket miles','kgm-0823h-r61',
"      combined:(window.kgmResCombinedR920?window.kgmResCombinedR920(b):0),\n      placedAt:b.placedAt||'',src:'resMileBidsR161'})})}catch(_){}",
"      combined:(window.kgmResCombinedR920?window.kgmResCombinedR920(b):0),\n      ticket:(window.kgmResTicketPaidR927D?window.kgmResTicketPaidR927D(b):0),\n      placedAt:b.placedAt||'',src:'resMileBidsR161'})})}catch(_){}",1);
RL('grp head ticket','kgm-0823h-r61',
"        '<th>'+(z920a()?'金額':'Cash')+'</th>','<th>'+(z920a()?'里程':'Miles')+'</th>',",
"        '<th>'+(z920a()?'票價（旅客實付）':'Ticket paid')+'</th>',\n        '<th>'+(z920a()?'競標金額':'Cash bid')+'</th>','<th>'+(z920a()?'里程':'Miles')+'</th>',",1);
RL('grp cell ticket','kgm-0823h-r61',
"          +'<td>'+(r.amount?('NT$'+n920(r.amount)):'—')+'</td>'\n          +'<td>'+(r.miles?n920(r.miles):'—')+'</td>'",
"          +'<td>'+(r.kind==='bigdeal'?'—':(r.ticket?('NT$'+n920(r.ticket)):(z920a()?'查無訂位':'no booking')))+'</td>'\n          +'<td>'+(r.amount?('NT$'+n920(r.amount)):'—')+'</td>'\n          +'<td>'+(r.miles?n920(r.miles):'—')+'</td>'",1);
/* ③ 登機門／航班資料的旅客名單「旅客評分」整欄都是「尚無評價」：
     模擬旅客沒有訂位，只能從畫面上的姓名欄猜 key，但姓名欄是「HSU CARLOS」＋會員等級字樣、沒有斜線，
     猜出來的是 N:HSUCARLOSBRONZE，跟座位圖／評分資料用的 N:HSU/CARLOS 對不上，所以一筆都找不到。
     改成先用這一班旅客名單（kgmPaxOfFlightR195，與座位圖同一份）依 PNR＋姓名取 key。 */
RL('manifest key map','kgm-0903b-r119',
"  var rows=[].slice.call(t.querySelectorAll('tbody tr'));",
"  /* 0927D：同一份旅客名單的 key（與座位圖一致） */\n  var pk927D={};\n  try{(window.kgmPaxOfFlightR195?window.kgmPaxOfFlightR195(cur.code,cur.date,cur.fr,cur.to):[]).forEach(function(p){\n    if(p&&p.pnr&&p.key)(pk927D[p.pnr]=pk927D[p.pnr]||[]).push({name:String(p.name||'').toUpperCase(),key:p.key});\n  })}catch(_){}\n  var rows=[].slice.call(t.querySelectorAll('tbody tr'));",1);
RL('manifest key use','kgm-0903b-r119',
"    if(!key){\n      var mm=nm.match(",
"    if(!key&&pk927D[pnr]){\n      var lst927D=pk927D[pnr],nmU927D=nm.toUpperCase();\n      var hit927D=lst927D.filter(function(x){return x.name&&nmU927D.indexOf(x.name)>=0})[0]||(lst927D.length===1?lst927D[0]:null);\n      if(hit927D)key=hit927D.key;\n    }\n    if(!key){\n      var mm=nm.match(",1);
/* ④ 進〈登機門／櫃檯〉「地勤班表（GROUND STAFF · 8-HOUR）」閃兩下：
     r99 把整排人的班表插進主內容（看得到）→ r102 把它藏起來（改成一次看一個人）→
     r117（黑名單分頁）離開時會把主內容裡「所有」被藏起來的區塊打開 → r102 又藏。
     實測進頁面後 0.8 秒藏、1.1 秒又出現、1.3 秒再藏 —— 就是看到的閃兩下。
     改法：r117 只打開它自己藏的區塊（做記號）；r99 插入時如果 r102 在，就直接以收起的狀態插入。 */
RL('r117 mark hide','kgm-0903b-r117',
"    if(!el.classList||!el.classList.contains('k117'))el.style.display='none';\n  });\n  if(have)have.remove();",
"    if(!el.classList||!el.classList.contains('k117')){if(el.style.display!=='none')el.setAttribute('data-k117hid','1');el.style.display='none'}\n  });\n  if(have)have.remove();",1);
RL('r117 restore own','kgm-0903b-r117',
"    if(el.style&&el.style.display==='none'&&(!el.classList||!el.classList.contains('k117')))el.style.display='';",
"    /* 0927D：只打開 r117 自己藏的（別層刻意收起來的區塊不要動） */\n    if(el.getAttribute&&el.getAttribute('data-k117hid')&&el.style&&el.style.display==='none'&&(!el.classList||!el.classList.contains('k117'))){el.style.display='';el.removeAttribute('data-k117hid')}",1);
RL('r99 insert hidden','kgm-0901a-r99',
"    var el=d.firstElementChild;el.setAttribute('data-sig',sig);\n    main.insertBefore(el,main.firstChild);",
"    var el=d.firstElementChild;el.setAttribute('data-sig',sig);\n    /* 0927D：r102 會把整排班表收起來（一次看一個人），直接以收起的狀態插入，不先露出來再藏 */\n    if(typeof window.kgmMountR102==='function')el.style.display='none';\n    main.insertBefore(el,main.firstChild);",1);
/*     同樣「離開時把主內容裡所有被藏的區塊都打開」的還有 r123（權限閘）與 r197（權限鎖頁）：
       有權限的分頁每次重畫、每次巡邏都會把 r102 收起來的整排班表打開，再被 r102 收回去。一樣改成只打開自己藏的。 */
RL('r123 mark hide','kgm-0903b-r123',
"      if(!el.classList||!el.classList.contains('k123-gate'))el.style.display='none'});",
"      if(!el.classList||!el.classList.contains('k123-gate')){if(el.style.display!=='none')el.setAttribute('data-k123hid','1');el.style.display='none'}});",1);
RL('r123 restore own','kgm-0903b-r123',
"    if(el.style&&el.style.display==='none'&&(!el.classList||!el.classList.contains('k123-gate')))\n      el.style.display='';",
"    if(el.getAttribute&&el.getAttribute('data-k123hid')&&el.style&&el.style.display==='none'&&(!el.classList||!el.classList.contains('k123-gate')))\n      {el.style.display='';el.removeAttribute('data-k123hid')}   /* 0927D：只打開自己藏的 */",1);
RL('r197 mark hide','kgm-0907A-r197',
"        if(el.style.display!=='none')el.style.display='none';\n      });\n      var g=main.querySelector('.k123-gate');",
"        if(el.style.display!=='none'){el.setAttribute('data-k197hid','1');el.style.display='none'}\n      });\n      var g=main.querySelector('.k123-gate');",1);
RL('r197 restore own','kgm-0907A-r197',
"      if(el.style&&el.style.display==='none'&&el.className&&!/k197|k123-gate/.test(el.className))\n        el.style.display='';",
"      if(el.getAttribute&&el.getAttribute('data-k197hid')&&el.style&&el.style.display==='none'&&el.className&&!/k197|k123-gate/.test(el.className))\n        {el.style.display='';el.removeAttribute('data-k197hid')}   /* 0927D：只打開自己藏的 */",1);

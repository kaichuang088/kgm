/* 0928B · 後台面板跑到旅客端（使用者 IMG1：「這個後台的東西為什麼會出現在用戶端我的帳號裡面」）
   r110「寄信服務與信件清單」只檢查「後台已登入」，沒檢查現在是不是在後台畫面：
   後台登入後切到旅客端（我的帳號、無限萬哩遊、通知、員工票…），只要後台最後停在「通知管理」或「系統設定」，
   這塊就會掛在旅客頁面最下面。改成只在後台畫面掛，其餘一律移除。 */
RL('mail panel admin only','kgm-0903a-r110',
"    var onTab=/^(notify|syscfg)$/.test(String(S.adminTab||''));\n    var anchor=main.querySelector('.r18-net');\n    if(!anchor&&!onTab){if(have)have.remove();return}",
"    var onTab=/^(notify|syscfg)$/.test(String(S.adminTab||''));\n    var anchor=main.querySelector('.r18-net');\n    if(S.view!=='admin'||(!anchor&&!onTab)){document.querySelectorAll('.k110-mail').forEach(function(e){e.remove()});return}   /* 0928B：只在後台畫面 */",1);
/* 0928B · 員工票「預估候補成功機率」浮動面板移除（使用者：「圖五（新）會一直閃爍在網站最下面，請移除」）
   這塊是 0913B 加的第二個繪製點：頁面沒有 <main> 時會掛到整頁最底（頁尾下面），每次重畫都拆掉再貼回去，所以一直閃。
   員工票首頁裡那一份不動。 */
RL('staff odds float removed','kgm-0909E-r229',
"    if(page())return 0;                       /* 首頁那一份已經畫了，不重複 */",
"    /* 0928B：浮動的那一份整個移除（使用者要求），只保留員工票首頁裡的那一份 */\n    document.querySelectorAll('.k229-odds-fly').forEach(function(e){e.remove()});return 0;\n    if(page())return 0;                       /* 首頁那一份已經畫了，不重複 */",1);

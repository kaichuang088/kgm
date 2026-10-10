from common import *
# ── 1006A #2：後台檔一打開會先看到前台首頁約 2 秒。前台首頁在前面幾層就畫出來了，
#    要等 241 層全部載入、最後的同步引擎把畫面切到後台才換 —— 後台檔一開始就用載入遮罩蓋住，切好、畫好才拿掉。
R('admin boot cover',"<script>\n\n// ── LANGUAGE ─",
 "<script>\n/* 1006A：後台檔（KGM_SIDE='admin'）載入期間不顯示前台畫面 —— 先蓋一層載入遮罩，同步引擎把畫面切到後台並畫好之後才移除（side1004B）。 */\n"
 "(function(){try{if(window.KGM_SIDE!=='admin')return;document.documentElement.classList.add('kgm-boot1006A');var st=document.createElement('style');st.id='kgm-boot-css1006A';"
 "st.textContent='html.kgm-boot1006A #app,html.kgm-boot1006A #aiChat,html.kgm-boot1006A #aiWindow{visibility:hidden!important}'"
 "+'html.kgm-boot1006A body::after{content:\"KGM AIRWAYS　·　管理後台載入中\";position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;'"
 "+'font:700 13px/1.4 -apple-system,BlinkMacSystemFont,\"PingFang TC\",\"Noto Sans TC\",sans-serif;letter-spacing:.28em;color:#0f3d2e;background:#f6f3ec}';"
 "(document.head||document.documentElement).appendChild(st);"
 "setTimeout(function(){document.documentElement.classList.remove('kgm-boot1006A')},20000)   /* 保險：最慢 20 秒一定拿掉 */"
 "}catch(_){}})();\n\n// ── LANGUAGE ─")
R('admin boot cover off',"    try{if(S.view!=='admin'){S.view='admin';render()}}catch(_){}\n",
 "    try{if(S.view!=='admin'){S.view='admin';render()}}catch(_){}\n"
 "    /* 1006A：切到後台、畫好之後（下兩個畫面幀）才拿掉載入遮罩 */\n"
 "    try{requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.remove('kgm-boot1006A')})})}catch(_){try{document.documentElement.classList.remove('kgm-boot1006A')}catch(__){}}\n")
R('admin hide front footer',"html.kgm-side-admin header .portal-util0815>.r4-notify-head,html.kgm-side-admin header .portal-util0815>.portal-link0815:last-child{display:none!important}'",
 "html.kgm-side-admin header .portal-util0815>.r4-notify-head,html.kgm-side-admin header .portal-util0815>.portal-link0815:last-child{display:none!important}'\n      +'html.kgm-side-admin #app>footer{display:none!important}'   /* 1006A：前台的頁尾（關於 KGM／服務／夥伴）在後台檔也收掉 */")
save('p_h_side.js','/* 1006A · 前後台分檔 */\n')

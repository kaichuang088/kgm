from common import *
# ══ 1006A #12：「後台組員和飛行員要評分按下座位圖會出現一秒圖五這樣不行喔」 ══
#   根因：評分視窗由 r195 paintModal 先插入舊版的格狀清單（圖五），真正的座位圖要等 r210 的 MutationObserver
#   （setTimeout 0）或 render 之後 40／220／600 ms 才覆蓋 —— 中間瀏覽器已經把舊格子畫出來。每點一個座位、每按一次分數也是整個重畫，又閃一次。
#   改成：paintModal 插入之後在同一個同步步驟裡直接畫座位圖，瀏覽器根本來不及畫出舊格子（座位圖畫不出來時仍保留舊格子當備援）。
RL('rate modal paint map sync','kgm-0907A-r195',
 "    else document.body.appendChild(d.firstElementChild);\n    return 1;\n  }catch(e){try{console.warn('r195 modal',e)}catch(_){}return 0}",
 "    else document.body.appendChild(d.firstElementChild);\n"
 "    try{if(window.kgmPaintSeatMapR210)window.kgmPaintSeatMapR210()}catch(_){}   /* 1006A #12：同一步就換成座位圖，不再先閃一秒舊格子 */\n"
 "    return 1;\n  }catch(e){try{console.warn('r195 modal',e)}catch(_){}return 0}")
save('p_h_rate6.js','/* 1006A · 組員評分座位圖不再閃舊格子 */\n')

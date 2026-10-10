/* 0928B · 登機門／櫃檯頁移除「未登機模擬（報到 → 行李收費 → 登機 → 關班）」
   使用者：「這個是系統自己本身要跑的 Simulate，不應出現在裡面」。只拿掉畫面上的這一塊；
   模擬本身（kgmNoShowPlanR914／kgmNsAutoR922／關班開案退款）的程式不動，後台其他地方照常可用。 */
RL('gate no-show panel removed','kgm-0823o-r74',
"    +nsPanel914(ap,date)\n",
"    /* 0928B：未登機模擬不再顯示在登機門／櫃檯頁 */\n",1);

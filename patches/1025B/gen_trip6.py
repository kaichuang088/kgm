from common import *
# ── 1006A #31：使用者「移除行程管理的這個」——「AFTER YOU RETRIEVE A BOOKING」說明與「BEFORE YOU FLY 出發當天的時間點」兩塊，入口頁與查到訂位之後都不顯示
R('trip hint+timeline off','body[data-kgm-trip="1"] .k124-help,body[data-kgm-trip="0"] .k124-tl,body[data-kgm-trip="0"] .k226-hint{display:none!important}',
  '.k124-help,.k124-tl,.k226-hint{display:none!important}')
save('p_h_trip.js','/* 1006A · 行程管理 */\n')

/* 0928B · 「新增飛機／退役飛機」收進「編輯機隊」按鈕（使用者：「圖一那個放到圖二那裡（機型列那一排）最右邊加入一個編輯機隊的按鈕」）
   機型列最右邊多一顆「編輯機隊」，按下去才在機型列正下方展開新增／退役卡片，再按一次收起。卡片內容與功能不變。 */
RL('fleet edit button','kgm-0823l-r69',
"      +E(x.t)+' <span>('+x.n+')</span></button>'}).join('')+'</div>';\n}",
"      +E(x.t)+' <span>('+x.n+')</span></button>'}).join('')\n"
+"    +'<button class=\"k928-fm-btn'+(S._fmOpen928?' on':'')+'\" onclick=\"S._fmOpen928=!S._fmOpen928;render()\">'+(S._fmOpen928?(z()?'✕ 收起':'✕ Close'):(z()?'✎ 編輯機隊':'✎ Edit fleet'))+'</button>'   /* 0928B */\n"
+"    +'</div>';\n}",1);
RL('fleet card under tabs','kgm-0823l-r69',"    +tabs69()\n","    +tabs69()\n    +(S._fmOpen928?fleetMgmt928():'')   /* 0928B：按「編輯機隊」才展開，放在機型列下方 */\n",1);
RL('fleet card old spot','kgm-0823l-r69',"    +fleetMgmt928()+enquiry69()+status69()+calendar69()\n","    +enquiry69()+status69()+calendar69()\n",1);
RL('fleet sig','kgm-0823l-r69',"      loadOf69(curTail69())].join('|');","      loadOf69(curTail69()),S._fmOpen928?1:0].join('|');",1);
RL('fleet btn css','kgm-0823l-r69',".k69-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:13px}'",
".k69-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:13px}'\n    +'.k69-tabs button{padding:7px 10px}'\n    +'.k69-tabs .k928-fm-btn{margin-left:auto;padding:7px 12px;background:#0b493b;color:#fff;border-color:#0b493b;font-family:inherit;letter-spacing:.04em}'\n    +'.k69-tabs .k928-fm-btn.on{background:#fff;color:#0b493b}'",1);

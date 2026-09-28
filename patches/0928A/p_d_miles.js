/* 0927D · 里程：回程也要累積（使用者：「里程累計只會累計到去程，回程不會被累計」）
   原因：去程入帳後就把整筆訂位標成 milesGranted=true，自動入帳只掃 milesGranted 為 false 的訂位、
   而且回程還另外檢查 milesGranted!==true —— 回程永遠不會入帳。
   另外自動入帳是「先入帳、後檢查這一段是否已入帳」，只靠整筆的 milesGranted 擋重複。
   改成：每一段各自記（out_mg／inb_mg），入帳前先檢查；兩段都入帳了 milesGranted 才是 true。 */
R('miles scan filter',
"  S.bookings.filter(b=>b.status===\"confirmed\"&&!b.milesGranted).forEach(bk=>{\n    const checkFlight=(f,fc)=>{\n      if(!f)return;",
"  /* 0927D：兩段都入帳了才跳過（以前去程入帳就整筆跳過，回程永遠不會入帳） */\n  S.bookings.filter(b=>b.status===\"confirmed\"&&!(b.milesGranted&&(!b.inbF||b.inb_mg))).forEach(bk=>{\n    const checkFlight=(f,fc)=>{\n      if(!f)return;\n      const _sgk0=(f===bk.outF)?'out_mg':'inb_mg';if(bk[_sgk0])return;   /* 0927D：這一段已入帳就不再入帳（先檢查、再入帳） */");
R('miles mark seg',
"        const _sgk=(bk.outF&&bk.outF.code===f.code)?'out_mg':'inb_mg';if(bk[_sgk])return;bk[_sgk]=true;bk.milesGranted=true;",
"        bk[_sgk0]=true;bk.milesGranted=!!(bk.out_mg&&(!bk.inbF||bk.inb_mg));   /* 0927D：兩段都入帳才算整筆入帳 */");
R('miles inbound call',
"    checkFlight(bk.outF,bk.outC);\n    if(bk.inbF&&bk.milesGranted!==true)checkFlight(bk.inbF,bk.inbC);",
"    checkFlight(bk.outF,bk.outC);\n    if(bk.inbF)checkFlight(bk.inbF,bk.inbC);   /* 0927D：回程各自判斷 */");
R('miles manual mark',
"        recomputeTier(u);\n        credited+=mi;\n      }\n    }\n    bk.milesGranted=true;\n  });",
"        recomputeTier(u);\n        credited+=mi;\n      }\n    }\n    bk.milesGranted=!!(bk.out_mg&&(!bk.inbF||bk.inb_mg));   /* 0927D：兩段都入帳才算整筆入帳 */\n  });");

/* 0928B · 員工票（使用者：「員工票驗證移除圖五（舊）。員工票無法用里程折抵機票費用。」）
   ① 在訂位搜尋的優惠碼欄輸入員工編號後，頁面上同時出現新的「員工票身分驗證」與舊的「員工票查詢」卡（圖五舊）。
      舊卡拿掉；驗證完成後直接用搜尋列原本的航線／日期帶到查詢結果（原本要從舊卡讀航線，讀不到就退回員工票專區）。
   ② 員工票不得用里程折抵：結帳的「用里程折抵票款」拉桿在員工票模式不顯示（並把已設定的折抵歸零）；
      後台改票收差額時，員工票訂位也不提供「以里程折抵」。 */
RL('stx old card removed','kgm-0905b-r169',
"  try{css169();selfRow169();paintCab169();paintAw169()}catch(e){try{console.warn('r169',e)}catch(_){}}",
"  try{css169();selfRow169();paintCab169();document.querySelectorAll('.k169-aw').forEach(function(e){e.remove()})}catch(e){try{console.warn('r169',e)}catch(_){}}   /* 0928B：舊的「員工票查詢」卡不再畫 */",1);
RL('stx audit','kgm-0905b-r169',"  o.gateOK=(!o.host)||(o.selfRow>0&&o.awCard>0);","  o.gateOK=(!o.host)||(o.selfRow>0&&o.awCard===0);   /* 0928B：舊查詢卡已移除 */",1);
R('stx verify uses search bar',
"        S.phase='sel_out';S.view='booking';S.openFare=null;\n        _go922=true;\n      }\n    }catch(_){}\n    if(!_go922)S.view='staff_travel_r10';",
"        S.phase='sel_out';S.view='booking';S.openFare=null;\n        _go922=true;\n      }\n"
+"      /* 0928B：舊查詢卡拿掉之後，直接用搜尋列原本的航線與日期 */\n"
+"      if(!_go922&&S.search&&S.search.fr&&S.search.to&&S.search.fr!==S.search.to&&S.search.dep){\n"
+"        S.outF=null;S.outC=null;S.inbF=null;S.inbC=null;S.phase='sel_out';S.view='booking';S.openFare=null;_go922=true;\n"
+"      }\n"
+"    }catch(_){}\n    if(!_go922)S.view='staff_travel_r10';",1);
RL('stx no miles offset','kgm-0909E-r229',
"    if(S.search&&S.search.useMiles)return out;              /* 酬賓票不適用 */",
"    if(S.search&&S.search.useMiles)return out;              /* 酬賓票不適用 */\n"
+"    try{if(S.stx||(window.kgmStaffEmpFromPromoR225&&window.kgmStaffEmpFromPromoR225())){S.mileOffsetR922=0;return out}}catch(_){}   /* 0928B：員工票不得用里程折抵 */",1);
RL('stx admin no miles','kgm-0823p-r82',
"window.kgmCabMilesR914=function(pnr,twd){\n  var u=window.kgmCabMemberR914(pnr);\n  var b=null;try{b=bk82(pnr)}catch(_){}",
"window.kgmCabMilesR914=function(pnr,twd){\n  var u=window.kgmCabMemberR914(pnr);\n  var b=null;try{b=bk82(pnr)}catch(_){}\n"
+"  if(b&&(b.staffPricing||b.stx||b.staffTicket||b.staffTravel))return {member:null,linked:false,staffR928:true,balance:0,withheld:0,usable:0,need:0,enough:false,rate:0};   /* 0928B：員工票不得用里程折抵 */",1);

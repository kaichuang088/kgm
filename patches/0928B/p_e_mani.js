/* 0928B · 航班資料（實體報到）旅客名單
   ① Residence 一直沒人（使用者：「為什麼從航班資料看每一班的 Residence 都沒有人」）：
      模擬名單 simManifest 只產生 suite／first／biz／prem／econ，A380 的 res（Residence）艙從來沒有旅客。
      這裡補上 Residence：有得標者用得標者；競標還沒結束用目前最高出價者（標「競標領先」）；
      都沒有才用模擬（約 85% 的班有人，1–2 位成人，共用 1A 套房）。
   ② 第五航權第二段（例：KX304 PVG→DOH）的模擬名單跟第一段用同一個種子，於是在 PVG 下機的人也出現在 PVG→DOH。
      改成：第一段判定為「續程」的旅客保留（同一個人、同艙等），其餘換成從 PVG 上機的旅客。
   ③ 續程旅客（搭到 DOH）第二段的「實體報到」自動打勾：跟著他第一段的實體報到狀態走；地勤手動改過的不動。 */
RL('mani leg2 + residence','kgm-r7-admin-ops',
"    var base=[];try{base=simManifest(f.code,date,Object.assign({},f,{acft:t}))||[];}catch(e){}\n",
"    var base=[];try{base=simManifest(f.code,date,Object.assign({},f,{acft:t}))||[];}catch(e){}\n"
+"    /* 0928B ②：第五航權第二段 —— 只有第一段的續程旅客會在機上，其餘換成本站上機的旅客 */\n"
+"    var ch928=null,leg1928=null,thru928={};\n"
+"    try{ch928=window.kgmFifthChainR96?window.kgmFifthChainR96(f.code,f.fr,f.to):null}catch(_){}\n"
+"    if(ch928&&ch928.via===f.fr&&ch928.legs&&ch928.legs[0]&&ch928.legs[0].to===f.fr){\n"
+"      leg1928=ch928.legs[0];\n"
+"      try{\n"
+"        var alt928=simManifest(f.code+'/'+f.fr,date,Object.assign({},f,{acft:t}))||[],q928={};\n"
+"        alt928.forEach(function(x){(q928[x.cabin]=q928[x.cabin]||[]).push(x)});\n"
+"        base=base.map(function(x){\n"
+"          var fd=window.kgmPaxFinalR119?window.kgmPaxFinalR119(x.pnr,f.code,leg1928.fr,leg1928.to):{thru:false};\n"
+"          if(fd&&fd.thru){thru928[x.pnr]=1;return x}\n"
+"          var n=(q928[x.cabin]||[]).shift();if(!n)return x;\n"
+"          return Object.assign({},n,{cabin:x.cabin,fare:x.fare||n.fare,seat:x.seat});\n"
+"        });\n"
+"      }catch(_){}\n"
+"    }\n"
+"    /* 0928B ①：Residence */\n"
+"    try{\n"
+"      if(byCab.Resident&&byCab.Resident.length&&!real.some(function(x){return x.cabin==='Resident'})){\n"
+"        var seat928=byCab.Resident[0],bids928=(S.residenceBidsR83||[]).filter(function(b){return b&&b.code===f.code&&b.date===date});\n"
+"        var win928=bids928.filter(function(b){return b.status==='won'})[0]||bids928.filter(function(b){return b.status==='open'}).sort(function(a,b){return (+b.amount||0)-(+a.amount||0)})[0];\n"
+"        var occ928=[];\n"
+"        if(win928){\n"
+"          var nm928=String(win928.who||'').trim().split(/\\s+/);\n"
+"          occ928.push({pnr:win928.pnr||('RES'+String(win928.id||'').slice(-4)),name:win928.who||'',last:nm928[0]||'',first:nm928.slice(1).join(' '),member:win928.userId||'',tier:'',cabin:'Resident',fare:'R',seat:seat928,\n"
+"            resR928:(win928.status==='won'?'won':'leading')});\n"
+"        }else{\n"
+"          var h928=0,kk928='RES@'+f.code+'@'+date;for(var ii=0;ii<kk928.length;ii++)h928=((h928*31)+kk928.charCodeAt(ii))>>>0;\n"
+"          if(h928%100<85){\n"
+"            var pool928=simManifest(f.code+'/RES',date,Object.assign({},f,{acft:t}))||[];\n"
+"            var two928=(h928>>>8)%3!==0,adults=pool928.filter(function(x){return x.cabin==='First'||x.cabin==='Business'}).slice(0,two928?2:1);\n"
+"            adults.forEach(function(x,j){occ928.push(Object.assign({},x,{pnr:adults[0].pnr,cabin:'Resident',fare:'R',seat:seat928,resR928:'sim',resShareR928:j>0}))});\n"
+"          }\n"
+"        }\n"
+"        if(occ928.length){\n"
+"          /* 模擬名單裡原本坐 1A 的旅客（頭等）讓出來 */\n"
+"          base.forEach(function(x){if(x.seat===seat928)x.seat=''});\n"
+"          base=base.concat(occ928);   /* 放在最後，既有列的編號不位移 */\n"
+"          if(leg1928)occ928.forEach(function(x){thru928[x.pnr]=1});   /* 第五航權：Residence 旅客兩段都在機上 */\n"
+"        }\n"
+"      }\n"
+"    }catch(_){}\n",1);
RL('mani keep res fields','kgm-r7-admin-ops',
"    base=base.filter(function(x){return !realP[x.pnr];}).map(function(x,i){return normPax7(x,i,k);});",
"    base=base.filter(function(x){return !realP[x.pnr];}).map(function(x,i){var y=normPax7(x,i,k);if(x.resR928){y.resR928=x.resR928;y.resShareR928=!!x.resShareR928}return y;});   /* 0928B：保留 Residence 標記 */",1);
RL('mani residence shared seat','kgm-r7-admin-ops',
"    rows.forEach(function(x){var edit=st.rows[x.id]||{};Object.assign(x,edit);if(x.seat&&(byCab[x.cabin]||[]).indexOf(x.seat)>=0&&!used[x.seat])used[x.seat]=1;else x.seat='';});",
"    rows.forEach(function(x){var edit=st.rows[x.id]||{};Object.assign(x,edit);if(x.resShareR928&&x.cabin==='Resident')return;   /* 0928B：Residence 兩位共用同一間套房 */\n      if(x.seat&&(byCab[x.cabin]||[]).indexOf(x.seat)>=0&&!used[x.seat])used[x.seat]=1;else x.seat='';});",1);
RL('mani through physical','kgm-r7-admin-ops',
"    if(wrote)try{save();}catch(_saveManifest){}\n    return rows;\n  }\n  window.manifest7=manifest7;",
"    /* 0928B ③：搭到最終目的地的續程旅客，第二段實體報到跟著第一段自動打勾（地勤手動改過的不動） */\n"
+"    if(leg1928){\n"
+"      try{\n"
+"        var l1f=[].concat(FLIGHTS,(S.customFlights||[])).filter(function(x){return x&&!x.via&&x.code===f.code&&x.fr===leg1928.fr&&x.to===leg1928.to})[0];\n"
+"        var p1=l1f?manifest7(l1f,date):[],ph1={};\n"
+"        p1.forEach(function(x){if(x.physical)ph1[x.pnr+'|'+x.name]=1});\n"
+"        rows.forEach(function(x){\n"
+"          if(x.real&&x.booking){\n"
+"            var s1=window.segs7(x.booking).find(function(q){return q.f&&q.f.code===f.code&&q.f.fr===leg1928.fr&&q.f.to===leg1928.to&&q.date===date});\n"
+"            if(!s1)return;x.thruR928=true;\n"
+"            var c2=ciState7(x.booking,x.segmentKey),c1=ciState7(x.booking,s1.key);\n"
+"            if(c1.physical&&!c2.physicalManualR928&&!c2.physical){c2.physical=true;c2.autoThruR928=true;x.physical=true;wrote=true}\n"
+"            return;\n"
+"          }\n"
+"          if(!thru928[x.pnr])return;\n"
+"          x.thruR928=true;\n"
+"          var e=st.rows[x.id]||{};\n"
+"          if(!('physical' in e))x.physical=!!ph1[x.pnr+'|'+x.name];\n"
+"        });\n"
+"      }catch(_){}\n"
+"    }\n"
+"    if(wrote)try{save();}catch(_saveManifest){}\n    return rows;\n  }\n  window.manifest7=manifest7;",1);
/* 最終目的地只留一欄（r154），而且跟 r119 用同一套判斷 —— 原本兩欄各算各的，同一列一個寫 PVG、一個寫 DOH */
RL('r119 no fd column','kgm-0903b-r119',
"  var isFifth=!!(chain&&chain.via===cur.to);",
"  var isFifth=false;   /* 0928B：最終目的地只保留 r154 那一欄（判斷改用本層的 kgmPaxFinalR119），這裡不再另插一欄 */",1);
RL('r154 use r119 rule','kgm-0908a-r154',
"function paxFinal154(pnr,name,cur,ow){\n",
"function paxFinal154(pnr,name,cur,ow){\n  /* 0928B：跟 r119 同一個判斷來源（原本這裡取「訂位最後一段」，來回票會把回程的台北當成最終目的地） */\n  try{if(typeof window.kgmPaxFinalR119==='function'){var r9=window.kgmPaxFinalR119(pnr,cur.code,cur.fr,cur.to);if(r9&&r9.final)return {ap:r9.final,src:r9.src||'r119',through:!!r9.thru}}}catch(_){}\n",1);
RL('r154 no markdown','kgm-0908a-r154',
"（第五航權航班，續程旅客**同樣要下機重新安檢**再回到原座位；清艙與備餐照全機計算）",
"（第五航權航班，續程旅客<b>同樣要下機重新安檢</b>再回到原座位；清艙與備餐照全機計算）",1);
/* 艙等分組：Residence 放最前面、中文標示（原本顯示英文「Resident」並排在頭等艙後面） */
RL('mani residence group label','kgm-0823c-r55',
"var CAB_ORDER5=[['First','頭等艙'],['Resident','Resident'],",
"var CAB_ORDER5=[['Resident','Residence（御璽套房）'],['First','頭等艙'],   /* 0928B：Residence 排第一、中文標示 */",1);
/* 第五航權第二段的表頭統計：原本寫「非第五航權航班，全部旅客於本站下機」，改成實際的「續程／本站上機」人數 */
RL('r154 leg2 summary','kgm-0908a-r154',
"      +(ow?'':('　'+(z()?'非第五航權航班，全部旅客於本站下機。':'Not a through service; all passengers disembark here.')));",
"      +(ow?'':(function(){\n          /* 0928B：第五航權第二段（例：PVG→DOH） */\n          try{\n            var c928=window.kgmFifthChainR96?window.kgmFifthChainR96(cur.code,cur.fr,cur.to):null;\n            if(c928&&c928.via===cur.fr&&typeof window.manifest7==='function'){\n              var fx=[].concat(FLIGHTS,(S.customFlights||[])).filter(function(x){return x&&!x.via&&x.code===cur.code&&x.fr===cur.fr&&x.to===cur.to})[0];\n              var mm=fx?window.manifest7(fx,cur.date):[],th=mm.filter(function(x){return x.thruR928}).length;\n              return '　'+(z()?('第五航權第二段：自 '+E(c928.origin)+' 續程 <b>'+th+'</b> 人（第一段實體報到自動帶入）、'+E(cur.fr)+' 上機 <b>'+(mm.length-th)+'</b> 人。')\n                :('Second fifth-freedom sector: '+th+' through from '+E(c928.origin)+' (check-in carried over), '+(mm.length-th)+' joining at '+E(cur.fr)+'.'));\n            }\n          }catch(_){}\n          return '　'+(z()?'非第五航權航班，全部旅客於本站下機。':'Not a through service; all passengers disembark here.');\n        })());",1);
/* r55 依艙等分組時寫死讀第 4 欄；r119 在 PNR 後面插「旅客評分」欄之後，第 4 欄就變成評分，整張表被歸成經濟艙。
   改成依表頭文字找「艙等」那一欄。 */
RL('r55 cabin column by header','kgm-0823c-r55',
"      var cabTxt=(cells[3]&&cells[3].textContent||'');",
"      var ci928=3;try{[].slice.call((thead||{}).children||[]).forEach(function(th,ix){if(/艙等|Cabin/.test(th.textContent)&&!/評分|rating/i.test(th.textContent))ci928=ix})}catch(_){}\n      var cabTxt=(cells[ci928]&&cells[ci928].textContent||'');   /* 0928B：依表頭找艙等欄 */",1);

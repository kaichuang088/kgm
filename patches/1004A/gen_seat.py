import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='''/* 1004A · A388 商務艙第一排＝加長商務艙座位：訂位選位圖與機隊客艙配置圖都用另一個顏色標示並寫清楚 */
'''
# ── 訂位選位圖（seatView → renderCab）──
R('#86 seat css','''.seat.b{background:#bfdbfe;border-color:#3b82f6;color:#1e3a8a}''',
'''.seat.b{background:#bfdbfe;border-color:#3b82f6;color:#1e3a8a}.seat.b.k929-xbiz{background:#ede9fe;border-color:#7c3aed;color:#4c1d95}.k929-xbiz-div b{color:#6d28d9}.k929-xbiz-div span{display:inline-block;width:10px;height:10px;border-radius:3px;background:#ede9fe;border:1.5px solid #7c3aed;vertical-align:middle}''')
R('#86 seat row flag','''      if(_fz54&&dn===_fz54[0])html2+=`<div class="kgm-fz-divider"><span class="k54-fz"></span><b>${LANG==="en"?"FRONT ZONE — forward seats":"FRONT ZONE 前段座位"}</b><span class="k54-fz"></span></div>`;''',
'''      if(_fz54&&dn===_fz54[0])html2+=`<div class="kgm-fz-divider"><span class="k54-fz"></span><b>${LANG==="en"?"FRONT ZONE — forward seats":"FRONT ZONE 前段座位"}</b><span class="k54-fz"></span></div>`;
      /* 1004A：使用者「A388 Business 第一排要寫清楚是加長商務艙座位，用另一個顏色標那些位置」 */
      const _xb929=(f.acft==="A388"&&cabinName==="Business"&&r===0);
      if(_xb929)html2+=`<div class="kgm-fz-divider k929-xbiz-div"><span></span><b>${LANG==="en"?"EXTENDED BUSINESS — extra-legroom seats (row "+dn+")":"加長商務艙座位（第 "+dn+" 排・腿部空間加大）"}</b><span></span></div>`;''')
R('#86 seat title','''        if(isSky&&!lk)titleStr+=` [Sky Couch]`;''',
'''        if(isSky&&!lk)titleStr+=` [Sky Couch]`;
        if(_xb929)titleStr+=(LANG==="en"?" [Extended Business seat]":" [加長商務艙座位]");
        if(_xb929&&!lk&&!isExitRow)border="border-color:#7c3aed!important;";   /* 1004A：付費座位的橘框會蓋掉紫色，這一排改用紫框；價格仍在提示文字 */''')
R('#86 seat class','''class="seat ${colorCls}${lk?" lk":""}${isSel?" sel":""}${tipAmt?" has-fee":""}${inFz&&!lk?" k54-fzseat":""}"''',
'''class="seat ${colorCls}${lk?" lk":""}${isSel?" sel":""}${tipAmt?" has-fee":""}${inFz&&!lk?" k54-fzseat":""}${_xb929?" k929-xbiz":""}"''')
R('#86 seat legend','''.concat(isA380?[["k65-res","Resident"]]:[])''',
'''.concat(isA380?[["k65-res","Resident"],["b k929-xbiz",LANG==="en"?"Extended Business":"加長商務艙"]]:[])''')
# ── 機隊客艙配置圖（kgmSeatMapR28）──
R('#86 map css',"""'.r27-s.leg{background:#dbe6f6;box-shadow:inset 0 0 0 2px #5b83bd}',""",
"""'.r27-s.leg{background:#dbe6f6;box-shadow:inset 0 0 0 2px #5b83bd}',
'.r27-s.xbiz{background:#ede9fe!important;border-color:#7c3aed!important;box-shadow:inset 0 0 0 2px #7c3aed}',""")
R('#86 map mod',"""      if(first&&key==='prem')mods+=' leg';""",
"""      if(first&&key==='prem')mods+=' leg';
      if(first&&key==='biz'&&opt.xbiz929)mods+=' xbiz';""")
R('#86 map tip',"""             +(first&&key==='econ'?(z()?' · 可裝置嬰兒搖籃':' · bassinet position'):'');""",
"""             +(first&&key==='econ'?(z()?' · 可裝置嬰兒搖籃':' · bassinet position'):'')
             +(first&&key==='biz'&&opt.xbiz929?(z()?' · 加長商務艙座位（腿部空間加大）':' · Extended Business seat (extra legroom)'):'');""")
R('#86 map opt',"""      if(isA380&&k==='suite'&&ac.cabins.res)opt.resSeat='A';""",
"""      if(isA380&&k==='suite'&&ac.cabins.res)opt.resSeat='A';
      if(isA380&&k==='biz')opt.xbiz929=1;   /* 1004A：A388 商務艙第一排＝加長商務艙座位 */""")
R('#86 map legend',"""legend.map(function(l){var mod=/^(bas|leg|ex|acc|couch|r27fz)$/.test(l[0]);""",
"""(isA380?legend.slice(0,2).concat([['xbiz',z()?'加長商務艙座位':'Extended Business']],legend.slice(2)):legend).map(function(l){var mod=/^(bas|leg|ex|acc|couch|r27fz|xbiz)$/.test(l[0]);""")
# ── #87 模擬嬰兒比例 ──
R('#87 infant sim rate',"""    var R=realMap(f,date),first=[];
    els.forEach(function(e){
      var sid=e.sid;
      if(e.own){if(ownInf>0)first.push(e);return}
      if(!e.taken)return;
      if(R.inf[sid]||(!R.occ[sid]&&!e.front&&(hs('INF|'+f.code+'|'+date+'|'+sid)%100)<2))mark(e.el,false);
    });""","""    var R=realMap(f,date),first=[],simN929=0;
    els.forEach(function(e){
      var sid=e.sid;
      if(e.own){if(ownInf>0)first.push(e);return}
      if(!e.taken)return;
      /* 1004A：使用者「嬰兒 Simulate 比例有點太高」—— 原本每個被佔用的座位 2%、沒有上限（A380 一班動輒 8 個以上）。
         改成 0.6%，且每班模擬的嬰兒最多 3 位；真實訂位的嬰兒照實標示、不受上限影響。 */
      if(R.inf[sid])mark(e.el,false);
      else if(!R.occ[sid]&&!e.front&&simN929<3&&(hs('INF|'+f.code+'|'+date+'|'+sid)%1000)<6){simN929++;mark(e.el,false)}
    });""")
open('p_f_seat.js','w').write(hdr+'\n'.join(out)+'\n')

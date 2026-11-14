import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='/* 1004B · 競標管理：進行中的 Residence／BigDeal 標出進度、空欄說明、BigDeal 欄位不被切掉 */\n'
R('auc empty',"""        :('<div class="k920-none">'+(z920a()?'沒有紀錄。':'No records.')+'</div>'))""","""        :('<div class="k920-none">'+e920(aucEmpty1004B(key))+'</div>'))""")
R('auc fns',"  function colHtml(g,title,settle,key){",open('auc.js',encoding='utf-8').read()+"  function colHtml(g,title,settle,key){")
R('auc stat',"""    return '<article class="k920-grp"><h3><span>'+e920(f.code)+'　'""","""    return '<article class="k920-grp"><h3><span>'+aucStat1004B(list)+e920(f.code)+'　'""")
R('auc css',"   +'.k923-two{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}'",
  "   +'.k923-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}'"
  "   /* 1004B：BigDeal 那一欄在 1500 寬時右邊被切掉 —— 1640 以下改成上下兩段（表格九欄，半寬放不下），更窄時表格在卡片內橫向捲動 */"
  "   +'.k923-col{min-width:0}.k920-grp{overflow-x:auto}.k920-grp .k920-t{min-width:640px}'"
  "   +'@media(max-width:1640px){.k923-two{grid-template-columns:minmax(0,1fr)}}'"
  "   +'.k4b-auc-st{display:inline-block;font-style:normal;font:800 10px system-ui;border-radius:999px;padding:2px 9px;margin-right:8px;vertical-align:1px}'"
  "   +'.k4b-auc-st.on{background:#e4f1ea;color:#0a4537}.k4b-auc-st.due{background:#fbf3df;color:#7a5a12}.k4b-auc-st.done{background:#eef0ee;color:#6b7470}'")
R('auc seed date',"      if(/^KX\\s?\\d{1,4}$/.test(q))codes=[q.replace(/\\s+/g,'')];\n      else{",
  "      if(/^KX\\s?\\d{1,4}$/.test(q))codes=[q.replace(/\\s+/g,'')];\n"
  "      /* 1004B：只給日期（可能在 10 天以後）→ 補那一天的所有航班 */\n"
  "      else if(/^\\d{4}-\\d\\d-\\d\\d$/.test(q)){allF9().forEach(function(f){if(f&&!f.via)n+=window.kgmEnsureAuctionsR922(f.code,q,f)});return n}\n"
  "      else{")
R('auc seed code',"        try{window.kgmEnsureAuctionsForQueryR922(q)}catch(_){}\n        return _rows.apply(this,arguments);",
  "        try{window.kgmEnsureAuctionsForQueryR922(q)}catch(_){}\n"
  "        /* 1004B：0923A 改成「日期＋航班號」兩個欄位之後，搜尋條件放在 S.auctionCodeR923／S.auctionDateR923，\n"
  "           q 是空的 —— 補資料只補到未來 10 天，KX304 2026-10-28 這種較遠的班永遠是 0（使用者的截圖）。 */\n"
  "        try{var c4=String(S.auctionCodeR923||'').trim().toUpperCase(),d4=String(S.auctionDateR923||'').trim();\n"
  "          if(c4&&c4!==String(q||'').trim().toUpperCase())window.kgmEnsureAuctionsForQueryR922(c4);\n"
  "          else if(!c4&&d4&&d4!==String(q||'').trim())window.kgmEnsureAuctionsForQueryR922(d4)}catch(_){}\n"
  "        return _rows.apply(this,arguments);")
open('p_g_auc.js','w').write(hdr+'\n'.join(out)+'\n')

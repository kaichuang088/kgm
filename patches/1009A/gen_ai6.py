from common import *
# ── 1006A #26：使用者「前台的AI我搜TPE-NRT的里程升等剩餘位置，不應該有豪經艙啊，亞洲線只有BKK有豪經」「酬賓AI查詢也要確認好」
#    AI 的升等／酬賓七天表只看「飛機上有沒有這個艙」，沒有看這一班有沒有賣（短程亞洲線除 BKK 外不賣豪經，訂位頁的可售代碼本來就排除）。
#    改成兩個都要：飛機上有這個艙，而且這一班的可售艙等代碼裡有這個艙等（E／P／B／F／R）。
R('ai matrix sellable cabin',"""    var c=a.cabins[k];
    return !!(c&&(+c.seats||+c.rows));
  }catch(_){return true}
}""","""    var c=a.cabins[k];
    if(!(c&&(+c.seats||+c.rows)))return false;
    /* 1006A：這一班有沒有賣這個艙等（跟訂位頁同一份可售代碼） */
    var pre={Economy:'E-',Premium:'P-',Business:'B-',First:'F-',Resident:'R-'}[cab];
    if(pre&&typeof validCodes==='function'){var vc=validCodes(Object.assign({},f,{date:d}))||[];if(vc.length&&!vc.some(function(x){return String(x).indexOf(pre)===0}))return false}
    return true;
  }catch(_){return true}
}""")

# 這條航線七天都沒賣的艙等整列不列（使用者：TPE-NRT「不應該有豪經艙」）；選定的艙等沒賣就改成下一個有賣的艙等，清單也一樣
R('ai matrix drop unsold rows',"""    +cabs.map(function(cab){
        return '<strong class="'+(cab===p.cabin?'selected':'')+'">'""","""    +(function(){   /* 1006A：七天全部「無此艙等」的那一列不列；選定艙等沒賣 → 選下一個有賣的 */
        var keep=cabs.filter(function(cab){var any=false,sold=false;days.forEach(function(d){var c=cell920F(d,cab);if(c.s!=='off')any=true;if(c.s==='ok'||c.s==='wait')sold=true});return sold||!any});
        if(keep.length&&keep.indexOf(p.cabin)<0)p.cabin=keep[0];
        cabs=keep;return '';
      })()
    +cabs.map(function(cab){
        return '<strong class="'+(cab===p.cabin?'selected':'')+'">'""")
R('ai list follow sold cabin',"""  var list=dayOps920F(FR,TO,p.date);
  var direct=[];""","""  var list=dayOps920F(FR,TO,p.date);
  /* 1006A：選定艙等這條航線沒賣（例如 TPE-NRT 豪經）→ 用下一個有賣的艙等 */
  if(p.cabin!=='Resident'&&list.length&&!list.some(function(f){return cabOnBoard920F(f,p.date,p.cabin)})){
    var order6=mode==='award'?['Economy','Premium','Business','First']:['Premium','Business','First'],i6=order6.indexOf(p.cabin);
    for(var j6=Math.max(0,i6+1);j6<order6.length;j6++){if(list.some(function(f){return cabOnBoard920F(f,p.date,order6[j6])})){p.cabin=order6[j6];break}}
  }
  var direct=[];""")

# 問「要查詢哪一個艙等？」時，只列這條航線查詢日起 7 天內實際有賣的艙等（TPE-NRT 不會再出現豪華經濟艙）
R('ai cabin prompt pass p',"    if(!p.cabin)return cabinPromptI(c.mode);\n  }","    if(!p.cabin)return cabinPromptI(c.mode,p);   /* 1006A：只列這條航線實際有賣的艙等 */\n  }")
R('ai cabin prompt filter',"function cabinPromptI(mode){var a=(mode==='upgrade')?[['Premium','豪華經濟艙'],['Business','商務艙'],['First','頭等艙'],['Resident','Resident']]:[['Economy','經濟艙'],['Premium','豪華經濟艙'],['Business','商務艙'],['First','頭等艙']];",
 "function cabinPromptI(mode,p6){var a=(mode==='upgrade')?[['Premium','豪華經濟艙'],['Business','商務艙'],['First','頭等艙'],['Resident','Resident']]:[['Economy','經濟艙'],['Premium','豪華經濟艙'],['Business','商務艙'],['First','頭等艙']];"
 "try{if(p6&&p6.date&&((p6.fr&&p6.to)||p6.code)){var fr6=p6.fr,to6=p6.to;if(!fr6||!to6){var f0=(FLIGHTS||[]).filter(function(f){return f.code===p6.code&&!f.via})[0];if(f0){fr6=f0.fr;to6=f0.to}}"
 "var ds6=[];for(var i6=0;i6<7;i6++)ds6.push(idI(p6.date,i6));"
 "var keep6=a.filter(function(x){return ds6.some(function(d){return dayOps920F(fr6,to6,d).some(function(f){return (!p6.code||f.code===p6.code)&&cabOnBoard920F(f,d,x[0])})})});"
 "if(keep6.length)a=keep6}}catch(_){}   /* 1006A：只列這條航線 7 天內實際有賣的艙等 */")
save('p_h_ai.js','/* 1006A · AI 升等／酬賓座位表只列實際有賣的艙等 */\n')

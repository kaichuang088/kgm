/* ══ 1018A：票價分析「人工調整」、薪資 CSV、營收分析航線搜尋 ══════════════════════════════
   使用者：「票價分析票價師和CEO都要可以去調整（系統當然也要隨時Adjust）但是人工也要可調整」「員工薪資也要可以匯出csv」
           「營收分析要用航線搜尋不要一次列出來太亂了」
   · 人工調整寫進既有的特殊票價規則（S.fareRulesR929，kgm_farerule929，前後台同步）：系統每天照營收管理自動調，
     人工的幅度在系統票價上再乘一次（例：+10%、−15%），有期間、到期自動失效，可停用／刪除；訂票頁立即生效。
     只有執行長與定價人員能改，其他角色只看得到目前的調整。 */
function fa18CanEdit(){try{var r=(S.adminUser||{}).role;return r==='ceo'||r==='pricing'||(typeof isCEO==='function'&&isCEO())}catch(_){return false}}
function fa18Clear(){try{FA1004B.memo={};FA1004B.ov={};FA1004B.trend={}}catch(_){}}
function fa18Rules(fr,to){return (S.fareRulesR929||[]).filter(function(r){return r&&((r.fr===fr&&r.toAp===to)||(r.fr===to&&r.toAp===fr))})}
window.kgmFaAdjAddR1018A=function(fr,to){
  if(!fa18CanEdit()){alert(z()?'只有執行長與定價人員可以調整票價。':'Only CEO and pricing staff can adjust fares.');return}
  var g=function(k){var e=document.getElementById(k);return e?String(e.value||'').trim():''};
  var pct=+g('fa18Pct'),cab=g('fa18Cab'),from=g('fa18From'),until=g('fa18To'),both=g('fa18Dir')==='both',code=g('fa18Code'),note=g('fa18Note');
  if(!isFinite(pct)||!pct||pct<=-90||pct>300){alert(z()?'請輸入調整幅度（%），例如 10 或 -15。':'Enter a percentage, e.g. 10 or -15.');return}
  if(from&&until&&until<from){alert(z()?'結束日期不能早於開始日期。':'End date is before start date.');return}
  S.fareRulesR929=S.fareRulesR929||[];var who=(S.adminUser||{}).empId||'',at=new Date().toISOString(),ids=[];
  (both?[[fr,to],[to,fr]]:[[fr,to]]).forEach(function(p,i){var id='FR'+Date.now().toString(36).toUpperCase()+(i?'B':'');ids.push(id);
    S.fareRulesR929.push({id:id,fr:p[0],toAp:p[1],from:from,to:until,cabin:cab,code:i?'':code,mul:Math.round((1+pct/100)*10000)/10000,note:note,by:who,at:at,srcR1018A:'fareana'})});
  try{logAct&&logAct('票價分析人工調整',fr+'-'+to+(both?'（雙向）':'')+' '+(cab||'全部艙等')+' '+(pct>0?'+':'')+pct+'% '+(from||'')+'～'+(until||'')+(note?' · '+note:''))}catch(_){}
  fa18Clear();try{save()}catch(_){}try{render()}catch(_){}
};
window.kgmFaAdjToggleR1018A=function(id){if(!fa18CanEdit())return;var r=(S.fareRulesR929||[]).filter(function(x){return x&&x.id===id})[0];if(!r)return;r.off=!r.off;
  try{logAct&&logAct('票價分析人工調整',(r.off?'停用 ':'啟用 ')+id)}catch(_){}fa18Clear();try{save()}catch(_){}try{render()}catch(_){}};
window.kgmFaAdjDelR1018A=function(id){if(!fa18CanEdit())return;if(!confirm(z()?'刪除這一筆人工調整？':'Delete this adjustment?'))return;
  S.fareRulesR929=(S.fareRulesR929||[]).filter(function(x){return !(x&&x.id===id)});try{logAct&&logAct('票價分析人工調整','刪除 '+id)}catch(_){}fa18Clear();try{save()}catch(_){}try{render()}catch(_){}};
function fa18Panel(fr,to,d,mine){
  var ed=fa18CanEdit(),CZ={'':z()?'全部艙等':'All cabins',Economy:z()?'經濟艙':'Economy',Premium:z()?'豪華經濟艙':'Premium',Business:z()?'商務艙':'Business',First:z()?'頭等艙':'First'};
  var td=T(),rules=fa18Rules(fr,to).slice().reverse();
  var st=function(r){if(r.off)return ['off',z()?'已停用':'Off'];if(r.to&&r.to<td)return ['exp',z()?'已過期':'Expired'];if(r.from&&r.from>td)return ['wait',z()?'尚未開始':'Upcoming'];return ['on',z()?'生效中':'Active']};
  var codes=[];(mine||[]).forEach(function(x){if(codes.indexOf(x.f.code)<0)codes.push(x.f.code)});
  var css='<style id="fa18-css">.fa18{border:1px solid #e3ebe7;border-radius:14px;padding:14px 16px;margin:0 0 14px;background:#fbfcfb}.fa18 h4{margin:0 0 2px;font-size:14px;color:#123c32}.fa18 p{margin:0 0 10px;font-size:11.5px;color:#6b7b74;line-height:1.6}'
    +'.fa18-f{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.fa18-f label{display:flex;flex-direction:column;gap:4px;font-size:10.5px;font-weight:800;color:#6b7b74}.fa18-f .inp{height:34px;min-width:110px}.fa18-f .pct{width:90px;min-width:90px}'
    +'.fa18-t{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}.fa18-t th{text-align:left;font-size:10.5px;color:#7d8a84;padding:6px 8px;border-bottom:1px solid #e3ebe7}.fa18-t td{padding:7px 8px;border-bottom:1px solid #f0f4f2}'
    +'.fa18-s{display:inline-block;border-radius:999px;padding:2px 9px;font-size:10.5px;font-weight:800}.fa18-s.on{background:#e3f0ea;color:#145c38}.fa18-s.off,.fa18-s.exp{background:#f1f3f2;color:#8a948f}.fa18-s.wait{background:#fff3d6;color:#7a5600}'
    +'.fa18-m{font-weight:900}.fa18-m.up{color:#9b2c1c}.fa18-m.dn{color:#145c38}</style>';
  var form=ed?('<div class="fa18-f">'
      +'<label>'+(z()?'艙等':'Cabin')+'<select id="fa18Cab" class="inp">'+Object.keys(CZ).map(function(k){return '<option value="'+k+'">'+CZ[k]+'</option>'}).join('')+'</select></label>'
      +'<label>'+(z()?'方向':'Direction')+'<select id="fa18Dir" class="inp"><option value="one">'+E(fr+' → '+to)+'</option><option value="both">'+(z()?'雙向':'Both ways')+'</option></select></label>'
      +'<label>'+(z()?'班號（可不選）':'Flight (optional)')+'<select id="fa18Code" class="inp"><option value="">'+(z()?'整條航線':'Whole route')+'</option>'+codes.map(function(c){return '<option>'+E(c)+'</option>'}).join('')+'</select></label>'
      +'<label>'+(z()?'航班日期從':'From')+'<input id="fa18From" type="date" class="inp" value="'+E(d)+'"></label>'
      +'<label>'+(z()?'到':'To')+'<input id="fa18To" type="date" class="inp" value="'+E(addDays(d,30))+'"></label>'
      +'<label>'+(z()?'調整（%）':'Change (%)')+'<input id="fa18Pct" type="number" step="1" class="inp pct" placeholder="+10 / -15"></label>'
      +'<label style="flex:1;min-width:160px">'+(z()?'原因（入動作歷史）':'Reason')+'<input id="fa18Note" class="inp" placeholder="'+(z()?'例：競爭對手降價、包機需求、連假提早漲':'')+'"></label>'
      +'<button class="btn btn-g" style="height:34px" onclick="kgmFaAdjAddR1018A(\''+A(fr)+'\',\''+A(to)+'\')">'+(z()?'套用':'Apply')+'</button></div>')
    :'<p style="margin:0">'+(z()?'只有執行長與定價人員可以調整；你可以看到目前的人工調整。':'View only.')+'</p>';
  var list=rules.length?('<table class="fa18-t"><thead><tr><th>'+(z()?'狀態':'Status')+'</th><th>'+(z()?'方向':'Route')+'</th><th>'+(z()?'艙等／班號':'Cabin / flight')+'</th><th>'+(z()?'期間':'Period')+'</th><th>'+(z()?'幅度':'Change')+'</th><th>'+(z()?'原因':'Reason')+'</th><th>'+(z()?'設定人':'By')+'</th><th></th></tr></thead><tbody>'
      +rules.map(function(r){var s=st(r),p=Math.round((+r.mul-1)*1000)/10;
        return '<tr><td><span class="fa18-s '+s[0]+'">'+s[1]+'</span></td><td>'+E(r.fr+' → '+r.toAp)+'</td><td>'+E(CZ[r.cabin||'']||r.cabin)+(r.code?' · '+E(r.code):'')+'</td><td>'+E((r.from||'—')+' ～ '+(r.to||'—'))+'</td>'
          +'<td><span class="fa18-m '+(p>0?'up':'dn')+'">'+(p>0?'+':'')+p+'%</span></td><td>'+E(r.note||'')+'</td><td>'+E(r.by||'')+'<div style="font-size:10px;color:#8a978f">'+E(String(r.at||'').slice(0,16).replace('T',' '))+'</div></td>'
          +'<td style="white-space:nowrap">'+(ed?'<button class="btn btn-sm" onclick="kgmFaAdjToggleR1018A(\''+A(r.id)+'\')">'+(r.off?(z()?'啟用':'Enable'):(z()?'停用':'Disable'))+'</button> <button class="btn btn-sm" onclick="kgmFaAdjDelR1018A(\''+A(r.id)+'\')">'+(z()?'刪除':'Delete')+'</button>':'')+'</td></tr>'}).join('')+'</tbody></table>')
    :'<p style="margin:10px 0 0">'+(z()?'這條航線目前沒有人工調整，完全由系統（營收管理）定價。':'No manual adjustments on this route.')+'</p>';
  return css+'<div class="fa18"><h4>'+(z()?'人工調整（定價人員／執行長）':'Manual adjustment (pricing / CEO)')+'</h4>'
    +'<p>'+(z()?'系統每天照營收管理自動調整票價；這裡設定的人工幅度會在系統票價上再乘一次，只在設定的期間有效（到期自動失效），訂票頁立即生效，可以隨時停用或刪除。':'Applied on top of the automatic RM price for the chosen period; takes effect immediately.')+'</p>'+form+list+'</div>';
}
/* 薪資 CSV：全員（不受收合、搜尋影響），Excel 開啟不亂碼（UTF-8 BOM） */
window.kgmSalCsvR1018A=function(){
  try{
    var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
    var head=['員工編號','姓名','職務','年資（年）','底薪','績效（%）','功獎金','CEO 調整','休息日／例假出勤加給','主管職務加給','無故缺席扣薪','報銷','本月薪資','年終獎金（預估）','年終月數（5＋績效）'];
    var rows=[head];
    (S.staff||[]).forEach(function(x){if(!x||!x.empId)return;var s={};try{s=salaryOf(x)||{}}catch(_){}
      rows.push([x.empId,x.name||'',(typeof ROLE_ZH!=='undefined'&&ROLE_ZH[x.role])||x.role||'',s.yrs||0,s.base||0,Math.round((s.perf||1)*100),s.bonus||0,s.adj||0,(s.restPay||0)+(s.holidayPay||0),s.mgrAllowR1012A||0,s.absentDedR1012A||0,s.reimb||0,s.monthly||0,s.yearEnd||0,(5+(+s.yearEndPerf||0)).toFixed(1)])});
    var csv='﻿'+rows.map(function(r){return r.map(q).join(',')}).join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='KGM_Payroll_'+T().slice(0,7)+'.csv';document.body.appendChild(a);a.click();
    setTimeout(function(){try{URL.revokeObjectURL(a.href);a.remove()}catch(_){}},1500);
    try{logAct&&logAct('薪資功過','匯出薪資 CSV（'+(rows.length-1)+' 人）')}catch(_){}
    window.KGM_SAL_CSV_R1018A={n:rows.length-1,csv:csv};
  }catch(e){alert(String(e&&e.message||e))}
};

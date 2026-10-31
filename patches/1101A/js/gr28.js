
/* ══ 1101A：地勤個人行事曆的員工清單（使用者：「這裡要有地方可以按進去看每個員工每週的班表，然後列出來員工那裡不好看太醜」）
   原本只有一個下拉選單（員編 · 姓名 · 時段）→ 改成員工表：搜尋、依班別篩選；每人一列寫職務與本週（日～六）每天的班別，點一列＝下面的個人行事曆換成這個人（同一個 kgmCrPersonR74）。
   班別讀 kgmGroundDutyR99（跟個人行事曆週條同一份）。 ══ */
(function(){
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E2(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ad(d,k){return new Date(Date.parse(d+'T12:00:00Z')+k*864e5).toISOString().slice(0,10)}
  function wk(d){var w=new Date(d+'T12:00:00Z').getUTCDay(),s=ad(d,-w),o=[];for(var i=0;i<7;i++)o.push(ad(s,i));return o}
  function cell(id,d){var x=null;try{x=window.kgmGroundDutyR99(id,d)}catch(_){x=null}
    if(!x)return {k:'na',t:'—',s:''};
    if(x.off)return {k:x.leaveR1025B?'lv':'off',t:x.leaveR1025B?(z()?'假':'L'):(z()?'休':'Off'),s:x.label||''};
    if(x.reserveR1008A)return {k:'rs',t:z()?'備':'R',s:(x.from||'')+'–'+(x.to||'')};
    var k=x.k||'',t=k==='early'?(z()?'早':'E'):k==='mid'?(z()?'中':'M'):k==='late'?(z()?'晚':'L'):(z()?'班':'W');
    return {k:k||'w',t:t,s:(x.from||'')+'–'+(x.to||'')}}
  window.kgmGroundRosterListR1101A=function(ap,date,people,sel){try{
    var q=String(S.gr28Q||'').trim().toLowerCase(),f=S.gr28F||'all',days=wk(date),DW=z()?['日','一','二','三','四','五','六']:['Su','Mo','Tu','We','Th','Fr','Sa'];
    var rows=(people||[]).filter(function(p){return p&&p.empId}).map(function(p){var c=cell(p.empId,date);return {p:p,c:c}});
    var cnt={all:rows.length,early:0,mid:0,late:0,rs:0,off:0};rows.forEach(function(r){var k=r.c.k==='lv'?'off':r.c.k;if(cnt[k]!=null)cnt[k]++});
    rows=rows.filter(function(r){var k=r.c.k==='lv'?'off':r.c.k;if(f!=='all'&&k!==f)return false;if(!q)return true;
      return (String(r.p.empId)+' '+String(r.p.name||'')).toLowerCase().indexOf(q)>=0});
    var per=24,pg=Math.max(0,Math.min(+S.gr28Pg||0,Math.ceil(rows.length/per)-1)),shown=rows.slice(pg*per,pg*per+per);
    var role=function(id){try{return (window.kgmGroundRoleR1008A&&window.kgmGroundRoleR1008A(ap,date,id))||''}catch(_){return ''}};
    var chips=[['all',z()?'全部':'All'],['early',z()?'早班':'Early'],['mid',z()?'中班':'Mid'],['late',z()?'晚班':'Late'],['rs',z()?'備勤':'Reserve'],['off',z()?'休假':'Off']]
      .map(function(c){return '<button type="button" class="'+(f===c[0]?'on':'')+'" onclick="S.gr28F=\''+c[0]+'\';S.gr28Pg=0;render()">'+c[1]+' <i>'+(cnt[c[0]]||0)+'</i></button>'}).join('');
    var head='<div class="k28gr-tools"><input class="inp" placeholder="'+(z()?'搜尋姓名或員編':'Search name or ID')+'" value="'+E2(S.gr28Q||'')+'" oninput="S.gr28Q=this.value;S.gr28Pg=0;clearTimeout(window.__gr28t);window.__gr28t=setTimeout(function(){render();var i=document.querySelector(\'.k28gr-tools input\');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)"><div class="k28gr-chips">'+chips+'</div></div>';
    var th='<div class="k28gr-row k28gr-th"><span>'+(z()?'員工':'Staff')+'</span><span>'+(z()?'職務':'Role')+'</span>'+days.map(function(d,i){return '<span class="d'+(d===date?' today':'')+'">'+DW[i]+'<small>'+d.slice(5)+'</small></span>'}).join('')+'</div>';
    var body=shown.map(function(r){var p=r.p;return '<div class="k28gr-row'+(p.empId===sel?' sel':'')+'" role="button" tabindex="0" onclick="kgmCrPersonR74(\''+String(p.empId).replace(/'/g,'')+'\');setTimeout(function(){var e=document.querySelector(\'.k74-person-profile\');if(e)e.scrollIntoView({behavior:\'smooth\',block:\'start\'})},60)">'
      +'<span class="who"><b>'+E2(p.name||p.empId)+'</b><small>'+E2(p.empId)+'</small></span><span class="role">'+E2(role(p.empId)||'—')+'</span>'
      +days.map(function(d){var c=d===date?r.c:cell(p.empId,d);return '<span class="d'+(d===date?' today':'')+'"><em class="c-'+c.k+'" title="'+E2(c.s)+'">'+c.t+'</em></span>'}).join('')+'</div>'}).join('')
      ||'<div class="k28gr-none">'+(z()?'沒有符合的員工。':'No staff found.')+'</div>';
    var pager=rows.length>per?'<div class="k28gr-pg"><button type="button" '+(pg?'':'disabled')+' onclick="S.gr28Pg='+(pg-1)+';render()">‹</button><span>'+(pg*per+1)+'–'+Math.min(rows.length,pg*per+per)+' / '+rows.length+'</span><button type="button" '+((pg+1)*per<rows.length?'':'disabled')+' onclick="S.gr28Pg='+(pg+1)+';render()">›</button></div>':'';
    return '<div class="k28gr">'+head+'<div class="k28gr-tbl">'+th+body+'</div>'+pager+'<p class="k28gr-note">'+(z()?'點一位員工＝下面顯示他的個人行事曆與當天派工；格子游標停留看上下班時間。早／中／晚＝當天派工的班別，備＝在機場備勤，休＝例休或換班別休息，假＝請假。':'Click a row to open the personal roster below.')+'</p></div>';
  }catch(e){return ''}};
  try{var cs=document.createElement('style');cs.id='k28gr-css';cs.textContent=
    '.k28gr{margin:14px 0 18px}.k28gr-tools{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:10px}.k28gr-tools .inp{flex:1;min-width:220px;max-width:340px;height:38px}'
   +'.k28gr-chips{display:flex;gap:6px;flex-wrap:wrap}.k28gr-chips button{border:1px solid #DCE5E0;background:#fff;border-radius:999px;padding:6px 12px;font:600 12.5px system-ui,sans-serif;color:#33443C;cursor:pointer}.k28gr-chips button.on{background:#0B3D2E;color:#fff;border-color:#0B3D2E}.k28gr-chips i{font-style:normal;opacity:.65;margin-left:2px}'
   +'.k28gr-tbl{border:1px solid #E4E9E6;border-radius:14px;overflow:hidden;background:#fff}'
   +'.k28gr-row{display:grid;grid-template-columns:minmax(150px,1.4fr) minmax(130px,1.2fr) repeat(7,minmax(38px,52px));gap:6px;align-items:center;padding:8px 14px;border-top:1px solid #EEF2F0;cursor:pointer}'
   +'.k28gr-row:hover{background:#F6F9F7}.k28gr-row.sel{background:#EEF6F1;box-shadow:inset 3px 0 0 #0B3D2E}'
   +'.k28gr-th{cursor:default;border-top:0;background:#F6F9F7;font:700 11px system-ui,sans-serif;letter-spacing:.04em;color:#66726C;text-transform:uppercase}.k28gr-th:hover{background:#F6F9F7}'
   +'.k28gr-row .who b{display:block;font-size:13.5px;color:#14231D}.k28gr-row .who small{font:500 11.5px ui-monospace,monospace;color:#7A857F}.k28gr-row .role{font-size:12px;color:#55605B;line-height:1.3}'
   +'.k28gr-row .d{text-align:center}.k28gr-th .d small{display:block;font:500 10px ui-monospace,monospace;color:#9AA49F;text-transform:none}.k28gr-th .d.today{color:#0B3D2E}'
   +'.k28gr-row .d em{display:inline-flex;align-items:center;justify-content:center;width:30px;height:26px;border-radius:7px;font:700 12px system-ui,sans-serif;font-style:normal}'
   +'.k28gr-row .d.today em{outline:2px solid #0B3D2E;outline-offset:1px}'
   +'.c-early{background:#E5F1EC;color:#0B3D2E}.c-mid{background:#FFF3D9;color:#7A5A12}.c-late{background:#E8E6F7;color:#3F3A7A}.c-w{background:#E5F1EC;color:#0B3D2E}.c-rs{background:#F1F4F2;color:#55605B;border:1px dashed #C6D0CB}.c-off,.c-na{background:transparent;color:#A3ADA8}.c-lv{background:#FCE9E7;color:#9A3A2F}'
   +'.k28gr-none{padding:24px;text-align:center;color:#7A857F}.k28gr-pg{display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:8px;font-size:12.5px;color:#55605B}.k28gr-pg button{border:1px solid #DCE5E0;background:#fff;border-radius:8px;width:32px;height:30px;cursor:pointer}.k28gr-pg button:disabled{opacity:.4;cursor:default}'
   +'.k28gr-note{margin:8px 2px 0;font-size:11.5px;color:#7A857F}'
   +'.k196-t td.k28-pos{white-space:nowrap;font-size:12px;color:#55605B}.k196-t td.m{white-space:nowrap}'   /* 1101A：組員名冊職位欄、年資不換行 */
   +'@media(max-width:760px){.k28gr-row{grid-template-columns:minmax(120px,1fr) repeat(7,34px);padding:8px 10px}.k28gr-row .role{display:none}.k28gr-row .d em{width:28px}}';
    document.head.appendChild(cs)}catch(_){}
})();

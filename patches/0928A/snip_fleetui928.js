/* 0928A：機隊管理卡（新增飛機／退役飛機／每架機齡） */
function fleetMgmt928(){
  var zh=z(),types=['B779','A388','B78X','B789','A21N','A21X','A359','A35K','A339L','A339R'];
  var m=S._fm928||{},min=D(T(),7),def=D(T(),30);
  var added=(S.fleetAddedR928||[]),ret=S.fleetRetiredR928||{};
  var age=function(r){try{return window.kgmTailAgeR928(r).text}catch(_){return '—'}};
  var h='<section class="k69-card k928-fm"><div class="k69-kick">FLEET MANAGEMENT</div>'
    +'<h3>'+(zh?'新增飛機／退役飛機':'Add / retire aircraft')+'</h3>'
    +'<p class="k69-sub">'+(zh?'新增的飛機從投入日起加入輪轉；退役的飛機從退役日起，它的班全部改派給其他飛機。兩者都至少要 7 天後生效（班表異動要提前 7 天通知旅客），生效日之前的班表一段都不動。每一架都有機齡：新增的從輸入的機齡開始自動往上加，其餘依機型平均機齡模擬。'
      :'New aircraft join the rotation from the entry date; a retired aircraft hands all its flights to others from the retirement date. Both take effect at least 7 days ahead; nothing before that date changes.')+'</p>'
    +'<div class="k928-grid"><div class="k928-box"><b>'+(zh?'新增飛機':'Add aircraft')+'</b>'
      +'<label>'+(zh?'機型':'Type')+'<select id="k928Type" class="inp">'+types.map(function(t){return '<option'+(m.type===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select></label>'
      +'<label>'+(zh?'架數':'Count')+'<input id="k928N" type="number" min="1" max="20" class="inp" value="'+A(m.count||1)+'"></label>'
      +'<label>'+(zh?'機身編號（選填，1 架時）':'Registration (optional)')+'<input id="k928Reg" class="inp" placeholder="'+(zh?'留空＝自動編號':'blank = auto')+'" value="'+A(m.reg||'')+'"></label>'
      +'<label>'+(zh?'機齡':'Age')+'<span class="k928-age"><input id="k928Y" type="number" min="0" max="40" class="inp" value="'+A(m.ageY==null?0:m.ageY)+'">'+(zh?'年':'y')+'<input id="k928M" type="number" min="0" max="11" class="inp" value="'+A(m.ageM==null?0:m.ageM)+'">'+(zh?'個月':'m')+'</span></label>'
      +'<label>'+(zh?'取得方式':'Acquisition')+'<select id="k928Acq" class="inp"><option value="buy"'+(m.acq!=='lease'?' selected':'')+'>'+(zh?'購買':'Purchased')+'</option><option value="lease"'+(m.acq==='lease'?' selected':'')+'>'+(zh?'租賃':'Leased')+'</option></select></label>'
      +'<label>'+(zh?'投入日':'Entry date')+'<input id="k928From" type="date" class="inp" min="'+A(min)+'" value="'+A(m.from||def)+'"></label>'
      +'<button class="k69-go" onclick="kgmFleetAddUiR928()">'+(zh?'新增':'Add')+'</button></div>'
    +'<div class="k928-box"><b>'+(zh?'退役飛機':'Retire aircraft')+'</b>'
      +'<label>'+(zh?'機身編號':'Registration')+'<input id="k928RReg" class="inp" placeholder="B-58001" value="'+A(m.rreg||S._fsTail||'')+'"></label>'
      +'<label>'+(zh?'自這一天起退役':'Retire from')+'<input id="k928RFrom" type="date" class="inp" min="'+A(min)+'" value="'+A(m.rfrom||def)+'"></label>'
      +'<button class="k69-go" onclick="kgmFleetRetireUiR928()">'+(zh?'退役並改派':'Retire & reassign')+'</button></div></div>'
    +(m.msg?'<div class="k69-msg">'+E(m.msg)+'</div>':'');
  if(added.length||Object.keys(ret).length){
    h+='<table class="k69-tbl"><thead><tr><th>'+(zh?'機身編號':'Registration')+'</th><th>'+(zh?'機型':'Type')+'</th><th>'+(zh?'機齡（今天）':'Age today')+'</th><th>'+(zh?'取得':'Acq.')+'</th><th>'+(zh?'狀態':'Status')+'</th></tr></thead><tbody>'
      +added.map(function(a){var r=ret[a.reg];return '<tr><td><b>'+E(a.reg)+'</b></td><td>'+E(a.type)+'</td><td>'+E(age(a.reg))+'</td><td>'+(a.acq==='lease'?(zh?'租賃':'Leased'):(zh?'購買':'Purchased'))+'</td><td>'+(r?((zh?'自 ':'Retired from ')+E(r.from)+(zh?' 退役':'')):((zh?'自 ':'From ')+E(a.from)+(zh?' 投入':'')))+'</td></tr>'}).join('')
      +Object.keys(ret).filter(function(r){return !added.some(function(a){return a.reg===r})}).map(function(r){var x=ret[r];return '<tr><td><b>'+E(r)+'</b></td><td>'+E(x.type||'')+'</td><td>'+E(age(r))+'</td><td>—</td><td>'+(zh?'自 ':'Retired from ')+E(x.from)+(zh?' 退役':'')+' <button class="k69-link" onclick="kgmFleetUnretireR928(\''+A(r)+'\')">'+(zh?'取消退役':'Undo')+'</button></td></tr>'}).join('')
      +'</tbody></table>';
  }
  return h+'</section>';
}
function fmVals928(){
  var g=function(id){return String((document.getElementById(id)||{}).value||'').trim()};
  return {type:g('k928Type'),count:g('k928N'),reg:g('k928Reg'),ageY:g('k928Y'),ageM:g('k928M'),acq:g('k928Acq'),from:g('k928From'),rreg:g('k928RReg'),rfrom:g('k928RFrom')};
}
window.kgmFleetAddUiR928=function(){
  var v=fmVals928(),zh=z();
  var r=window.kgmFleetAddR928(v);
  v.msg=r.ok?((zh?'已新增 ':'Added ')+r.regs.join('、')+(zh?'，自 ':' from ')+r.from+(zh?' 起加入輪轉。':'.')):('✖ '+r.why);
  if(r.ok){v.reg='';}
  S._fm928=v;try{render()}catch(_){}
};
window.kgmFleetRetireUiR928=function(){
  var v=fmVals928(),zh=z();
  if(!confirm(zh?(v.rreg+' 自 '+v.rfrom+' 起退役，之後的班全部改派給其他飛機？'):('Retire '+v.rreg+' from '+v.rfrom+'?'))){return}
  var r=window.kgmFleetRetireR928(v.rreg,v.rfrom);
  v.msg=r.ok?((zh?'已退役 ':'Retired ')+r.reg+(zh?'，自 ':' from ')+r.from+(zh?' 起的班已改派（該機剩餘 ':'; remaining legs ')+r.leftAfter+(zh?' 段）。':')')):('✖ '+r.why);
  S._fm928=v;try{render()}catch(_){}
};
(function(){try{if(document.getElementById('kgm-k928-css'))return;var s=document.createElement('style');s.id='kgm-k928-css';
  s.textContent='.k928-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:10px 0}'
   +'.k928-box{border:1px solid #e6eaf0;border-radius:12px;padding:12px 14px;background:#fafbfc;display:grid;gap:8px}'
   +'.k928-box>b{font-size:12.5px;color:#1f2b3a}.k928-box label{display:grid;gap:3px;font-size:11px;color:#6b7684}'
   +'.k928-age{display:flex;align-items:center;gap:6px}.k928-age .inp{width:70px}';
  (document.head||document.documentElement).appendChild(s)}catch(_){}})();

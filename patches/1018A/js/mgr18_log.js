    /* 1018A：缺席與紀錄 —— 遲到與無故缺席一起列（來源是點名紀錄 attend；之後改回「出勤」的就不列），可依種類、部門、月份、員工編號篩選 */
    function rec18(){var m=st12(),out=[];Object.keys(m.attend||{}).forEach(function(k){var a=m.attend[k];if(!a||(a.status!=='late'&&a.status!=='noshow'))return;
        var p=k.split('|');out.push({kind:p[0],date:p[1],emp:p[2],ref:p.slice(3).join('|'),status:a.status,by:a.byName||a.by,at:a.at})});
      return out.sort(function(a,b){return String(b.date).localeCompare(String(a.date))||String(b.at).localeCompare(String(a.at))})}
    function logSec12(){var m=st12(),all=rec18(),ty=S._mgrLTyR1018A||'',dk=S._mgrLDkR1018A||'',mo=S._mgrLMoR1018A==null?T12().slice(0,7):S._mgrLMoR1018A,q=S._mgrLQR1018A||'';
      var mons={};all.forEach(function(r){mons[String(r.date).slice(0,7)]=1});mons[T12().slice(0,7)]=1;
      var inMo=all.filter(function(r){return !mo||String(r.date).slice(0,7)===mo});
      var L=inMo.filter(function(r){return (!ty||r.status===ty)&&(!dk||r.kind===dk)&&hit18(r.emp,q)});
      var nl=inMo.filter(function(r){return r.status==='late'}).length,nn=inMo.filter(function(r){return r.status==='noshow'}).length;
      var per={};inMo.forEach(function(r){per[r.emp]=(per[r.emp]||0)+1});var top=Object.keys(per).sort(function(a,b){return per[b]-per[a]})[0],ts=top?{name:nm18(top)}:null;
      var voided=(m.absent||[]).filter(function(a){return a&&a.voided&&(!mo||String(a.date).slice(0,7)===mo)}).length;
      var chip=function(key,val,cur,t){return '<button class="'+(cur===val?'on':'')+'" onclick="S.'+key+'=\''+val+'\';render()">'+t+'</button>'};
      var kpi='<div class="k12m-kpi"><div><small>'+(z12()?'遲到':'LATE')+'</small><b>'+nl+'</b><i>'+(mo?mo:(z12()?'全部月份':'all'))+'</i></div><div><small>'+(z12()?'無故缺席':'NO-SHOW')+'</small><b>'+nn+'</b><i>'+(z12()?'警告＋扣當日薪資':'warning + 1 day pay')+'</i></div>'
        +'<div><small>'+(z12()?'次數最多':'MOST RECORDS')+'</small><b style="font-size:15px;margin-top:6px">'+(ts?E12(ts.name):'—')+'</b><i>'+(top?E12(top)+' · '+per[top]+(z12()?' 次':''):'')+'</i></div><div><small>'+(z12()?'登錯已撤回':'VOIDED')+'</small><b>'+voided+'</b><i>'+(z12()?'改回出勤，警告與扣薪一併撤回':'')+'</i></div></div>';
      var bar='<div class="k12m-bar">'+q18('_mgrLQR1018A',z12()?'員工編號或姓名':'Employee ID or name')
        +'<div class="k12m-chips">'+chip('_mgrLTyR1018A','',ty,z12()?'全部':'All')+chip('_mgrLTyR1018A','late',ty,z12()?'遲到':'Late')+chip('_mgrLTyR1018A','noshow',ty,z12()?'無故缺席':'No-show')+'</div>'
        +'<div class="k12m-chips">'+chip('_mgrLDkR1018A','',dk,z12()?'全部部門':'All')+chip('_mgrLDkR1018A','g',dk,z12()?'地勤':'Ground')+chip('_mgrLDkR1018A','c',dk,z12()?'客艙':'Cabin')+'</div>'
        +'<select class="inp" style="height:36px;border-radius:10px;width:auto;min-width:150px;flex:none" onchange="S._mgrLMoR1018A=this.value;render()"><option value=""'+(mo?'':' selected')+'>'+(z12()?'全部月份':'All months')+'</option>'+Object.keys(mons).sort().reverse().map(function(x){return '<option'+(x===mo?' selected':'')+'>'+x+'</option>'}).join('')+'</select></div>';
      var tbl=L.length?'<table class="k12m-t"><thead><tr><th>'+(z12()?'日期':'Date')+'</th><th>'+(z12()?'員工':'Employee')+'</th><th>'+(z12()?'部門':'Dept')+'</th><th>'+(z12()?'班別／航班':'Duty')+'</th><th>'+(z12()?'狀態':'Status')+'</th><th>'+(z12()?'登錄主管':'By')+'</th><th>'+(z12()?'處理':'Action')+'</th></tr></thead><tbody>'
        +L.slice(0,300).map(function(r){return '<tr><td style="white-space:nowrap">'+E12(r.date)+'</td><td>'+who18(nm18(r.emp),r.emp)+'</td><td><span class="k12m-tag dept">'+(r.kind==='g'?(z12()?'地勤':'Ground'):(z12()?'客艙':'Cabin'))+'</span></td><td>'+E12(r.ref||'')+'</td>'
          +'<td><span class="k12m-tag '+r.status+'">'+(r.status==='late'?(z12()?'遲到':'Late'):(z12()?'無故缺席':'No-show'))+'</span></td><td>'+E12(r.by||'')+'<div class="k12m-sub">'+E12(String(r.at||'').slice(0,16).replace('T',' '))+'</div></td>'
          +'<td>'+(r.status==='noshow'?(z12()?'警告一次＋扣當日薪資':'Warning + 1 day pay'):(z12()?'僅紀錄（不扣薪）':'Recorded only'))+'</td></tr>'}).join('')+'</tbody></table>'
        :'<div class="k12m-empty">'+(all.length?(z12()?'沒有符合條件的紀錄':'No matching records'):(z12()?'目前沒有遲到或無故缺席紀錄。在「地勤點名」「客艙點名」按「遲到」「無故缺席」就會列在這裡。':'No late or no-show records yet.'))+'</div>';
      return kpi+bar+'<div class="k12m-card"><div class="k12m-sec"><h3>'+(z12()?'遲到與無故缺席':'Late and no-show')+'</h3><small>'+L.length+(z12()?' 筆':' records')+'</small></div>'+tbl+'</div>'
        +'<details class="k12m-card"><summary>'+(z12()?'所有操作紀錄':'Activity log')+' <span class="k12m-sub">'+m.log.length+'</span></summary><div class="k12m-log" style="margin-top:10px"><table class="k12m-t"><tbody>'+(m.log.filter(function(l){return !q||String(l.text).toUpperCase().indexOf(String(q).trim().toUpperCase())>=0}).slice(0,200).map(function(l){return '<tr><td style="white-space:nowrap">'+E12(String(l.at).slice(0,16).replace('T',' '))+'</td><td>'+E12(l.byName||l.by)+'</td><td>'+E12(l.text)+'</td></tr>'}).join('')||'<tr><td class="k12m-off">—</td></tr>')+'</tbody></table></div></details>'}

    /* ── 1004B：後台 AI 擴充。使用者：「後台AI要更萬能可以做更多事」（實測「目前還有沒有我沒處理的案件」答不出來）、
          「圖二那些應該要可以移除既然後台Claude可以直接幫我處理」（組員班表頁的後台 AI 卡、移除班表卡拿掉，改由 AI 做） ── */
    pending_overview:{tab:'',any:true,view:true,zh:'待處理事項總覽',run:function(){return pending1004B()}},
    crew_remove:{tab:'sched',zh:'移除組員班表（指定日期區間）',run:function(a){
      if(typeof window.kgmCrewRemoveR928!=='function')return {ok:false,msg:'—'};
      var r=window.kgmCrewRemoveR928({empId:String(a.empId||'').toUpperCase(),from:a.from||'',to:a.to||a.from||'',reason:a.reason||''});
      if(r!==true)return {ok:false,msg:String(r||'')};
      return {ok:true,msg:(z()?'已移除 ':'Removed ')+String(a.empId).toUpperCase()+' '+a.from+'～'+(a.to||a.from)+(z()?' 的班表（原因：'+a.reason+'），系統正在找符合休息與位置規定的人接手，完成後所有異動的組員都會收到通知。':'')}}},
    crew_restore:{tab:'sched',zh:'恢復被移除的班表',run:function(a){
      var l=(S.crewOffR928||[]).filter(function(x){return x&&x.active!==false&&(!a.empId||String(x.empId).toUpperCase()===String(a.empId).toUpperCase())&&(!a.id||x.id===a.id)});
      if(!l.length)return {ok:false,msg:z()?'找不到移除中的班表（可以先問「目前移除了哪些班表」）。':'Nothing to restore.'};
      window.kgmCrewRestoreR928(l[0].id);
      return {ok:true,msg:(z()?'已恢復 ':'Restored ')+l[0].name+'（'+l[0].empId+'）'+l[0].from+'～'+l[0].to+(z()?' 的班表，正在重算並通知異動的組員。':'')}}},
    crew_off_list:{tab:'sched',view:true,zh:'列出被移除的班表',run:function(){
      var l=(S.crewOffR928||[]).filter(function(x){return x&&x.active!==false});
      return {ok:true,msg:l.length?l.map(function(x){return x.name+'（'+x.empId+'）'+x.from+'～'+x.to+'　'+(x.reason||'')}).join('\n'):(z()?'目前沒有被移除的班表。':'None.')}}},
    crew_update:{tab:'sched',zh:'排班更新（立即重算）',run:function(){
      if(typeof window.kgmCrewUpdateR928!=='function')return {ok:false,msg:'—'};window.kgmCrewUpdateR928();
      return {ok:true,msg:z()?'已開始排班更新：依最新航班、機隊、請假重算未來 14 天，有異動的組員會收到通知（其餘 60 天在背景補算）。':'Re-planning started.'}}},
    stx_seats:{tab:'stxstatus',view:true,zh:'查員工票剩餘座位',run:function(a){
      var code=String(a.code||'').toUpperCase().replace(/\s+/g,''),d=a.date||T();if(/^\d+$/.test(code))code='KX'+code;
      var fs=[].concat(FLIGHTS,S.customFlights||[]).filter(function(f){return f&&f.code===code&&!f.partner&&!f.via});
      if(!fs.length)return {ok:false,msg:z()?'找不到這個班號。':'Flight not found.'};
      var CZ={First:'頭等',Business:'商務',Premium:'豪經',Economy:'經濟'};
      return {ok:true,msg:fs.map(function(f){var p=window.kgmStandbyPlanR1004B(f.code,d,f.fr,f.to);
        return f.code+' '+f.fr+'→'+f.to+' '+d+'：'+(z()?'給員工票的座位 ':'seats for staff ')+p.forStaffTotal
          +'（'+['First','Business','Premium','Economy'].filter(function(c){return p.cap[c]}).map(function(c){return CZ[c]+' '+p.forStaff[c]}).join('、')+'）'
          +(z()?'；已先扣 DH '+p.dh.length+' 位、哩程升等預計成功 '+p.upClear+'/'+p.up.length+'；員工票候補 '+p.staffPax+' 人、預計可上 '+p.staffClearPax+' 人，候補後剩 '+p.afterTotal+' 位。':'')}).join('\n')}}},
    go_tab:{tab:'',any:true,view:true,zh:'切換後台分頁',run:function(a){
      var list=[];try{list=window.kgmPermTabsR123()}catch(_){}
      var q=String(a.tab||'').trim(),hit=list.filter(function(t){return t.tab===q||t.label===q})[0]||list.filter(function(t){return q&&(t.label.indexOf(q)>=0||q.indexOf(t.label)>=0)})[0];
      if(!hit)return {ok:false,msg:z()?'找不到這個分頁。':'No such tab.'};
      var p='';try{p=window.kgmPermR123?window.kgmPermR123(hit.tab):'use'}catch(_){}
      if(roleOf()!=='ceo'&&p!=='use'&&p!=='view')return {ok:false,denied:true,msg:(z()?'無權限：':'No permission: ')+hit.label};
      S.adminTab=hit.tab;setTimeout(function(){try{render()}catch(_){}},0);
      return {ok:true,msg:(z()?'已切換到「':'Opened “')+hit.label+(z()?'」。':'”.')}}},

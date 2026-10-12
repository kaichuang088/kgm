    /* 1012A #4：主管紀錄（Manager I／II／III）
       使用者：「主管紀錄的 tab……Manager I, Manager II, and Manager III……mark as 無故缺席」；回覆：「請先隨機選」「看你，你決定」
              「座艙長當 Manager II Level，副的當 Manager I Level，總座艙長主要處理培訓和組員事宜當 Manager III」。
       · 主管名冊：員工管理或這一頁都能任命／調整／撤銷（選部門與等級）。第一次開啟時依員編雜湊隨機選出一批主管（只做一次，存檔）。
       · 職務加給：Manager I／II／III 每月 NT$8,000／15,000／25,000，併入薪資功過的月薪。
       · 地勤：同一站、同一週班別時間帶的同仁自動分給該時段的主管（每位約 10–15 人），可以手動改派；主管點名「出勤／遲到／無故缺席」。
       · 無故缺席：記「警告」一次（薪資功過，績效 −2%）並扣當日薪資（月薪 ÷ 30），通知本人；登錯可以撤銷（一併撤回警告與扣薪）。
       · 客艙：當班座艙長＝Manager II、副座艙長＝Manager I，點名該班全體客艙組員；總座艙長（Manager III）負責培訓與組員事宜，看得到全部紀錄。
       · 機師：教官登錄晉升考核（通過／不通過）；通過即送出既有的職級晉升（核准後第 30 天生效、生效日起重排）。
       資料：S.mgrR1012A（存檔、前後台同步）。 */
    var LV12=['','Manager I','Manager II','Manager III'],ALW12=[0,8000,15000,25000];
    var DEPT12={ground:['地勤','Ground'],cabin:['客艙','Cabin'],pilot:['飛航','Flight ops'],service:['客服','Customer service'],backend:['後勤','Back office'],pricing:['定價','Pricing']};
    function z12(){try{return LANG!=='en'}catch(_){return true}}
    function E12(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
    function A12(v){return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}
    function N12(n){return Number(n||0).toLocaleString()}
    function H12(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h}
    function T12(){try{return todayISO()}catch(_){return new Date().toISOString().slice(0,10)}}
    function D12(d,n){var t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
    function st12(){var m=S.mgrR1012A;if(!m||typeof m!=='object'||Array.isArray(m))m=S.mgrR1012A={};
      m.managers=m.managers||{};m.log=m.log||[];m.absent=m.absent||[];m.attend=m.attend||{};m.checks=m.checks||[];m.teamOv=m.teamOv||{};return m}
    function staff12(id){return (S.staff||[]).filter(function(s){return s&&s.empId===id})[0]||null}
    function me12(){var u=S.adminUser||{};return {id:u.empId||'',name:u.name||u.empId||''}}
    function ceo12(){try{return isCEO()}catch(_){return false}}
    function canAppoint12(dept){if(ceo12())return true;var m=st12().managers[me12().id];return !!(m&&+m.level===3&&(!dept||m.dept===dept))}
    function log12(type,text){var m=st12();m.log.unshift({at:new Date().toISOString(),by:me12().id,byName:me12().name,type:type,text:text});if(m.log.length>500)m.log.length=500;try{logAct('主管紀錄',text)}catch(_){}}
    function station12(id){try{return (window.kgmTsaTeamR1006A&&window.kgmTsaTeamR1006A(id))?'TSA':'TPE'}catch(_){return 'TPE'}}
    function band12(id,date){try{return window.kgmGroundBandR1008A?window.kgmGroundBandR1008A(id,date).k:''}catch(_){return ''}}
    var BANDZ12={early:['早班時段（03:00–14:00 之間）','Early (03:00–14:00)'],day:['日班時段（06:30–17:30 之間）','Day (06:30–17:30)'],mid:['中班時段（11:00–22:00 之間）','Mid (11:00–22:00)'],late:['晚班時段（16:00–03:30 之間）','Late (16:00–03:30)']};   /* 時段＝班別時間帶；當天實際上下班時間依航班在這個範圍內排 */
    /* 地勤班別輪替的「組」：桃園的同仁依輪替相位（kgmGroundPhaseR1012A）分組 —— 同一相位的人每一週都是同一個時段，
       所以小組固定、主管跟組員永遠同站同時段。松山只有 44 人、4 個時段，同相位只有 5～6 人，改成每週依當週時段分組。 */
    function phase12(id){try{var q=window.kgmGroundPhaseR1012A&&window.kgmGroundPhaseR1012A(id);return q?q.p:0}catch(_){return 0}}
    function gkey12(ap,id,date){return ap==='TPE'?('p'+phase12(id)):('b'+band12(id,date))}
    /* 第一次：依員編雜湊隨機選主管（只做一次）；桃園每個輪替組 10–15 人配一位主管 */
    function seed12(){var m=st12();
      if(m.seededR1012A&&m.seedV!==2&&!Object.keys(m.managers).some(function(k){return !(m.managers[k]&&m.managers[k].seed)})&&!m.log.length){m.managers={};m.seededR1012A=''}   /* 第一版的隨機名單（還沒人動過）換成依輪替組配的 */
      if(m.seededR1012A)return;var pick=function(list,n,salt){return list.slice().sort(function(a,b){return H12(a.empId+salt)-H12(b.empId+salt)}).slice(0,n)};
      var act=(S.staff||[]).filter(function(s){return s&&s.active!==false&&s.empId&&s.role!=='ceo'&&s.role!=='admin'});
      var put=function(s,dept,lv){if(!s||m.managers[s.empId])return;m.managers[s.empId]={level:lv,dept:dept,since:T12(),by:'系統初始（隨機）',seed:1}};
      var tpe=act.filter(function(s){return s.role==='ground'&&station12(s.empId)==='TPE'}),tsa=act.filter(function(s){return s.role==='ground'&&station12(s.empId)==='TSA'});
      if(tpe.length<50)return;   /* 地勤名單還沒補齊（開頁初期），等一下再選 */
      var m3=pick(tpe,1,'|mgr12|TPE3')[0];put(m3,'ground',3);
      var grp={};tpe.forEach(function(s){if(m3&&s.empId===m3.empId)return;var k=phase12(s.empId);(grp[k]=grp[k]||[]).push(s)});
      var lead=[];Object.keys(grp).sort().forEach(function(k){var g=grp[k],t=Math.max(1,Math.ceil(g.length/15));while(t>1&&g.length/t<10)t--;
        pick(g,t,'|mgr12|TPE|'+k).forEach(function(s){lead.push(s)})});
      var two={};pick(lead,3,'|mgr12|TPE2').forEach(function(s){two[s.empId]=1});
      lead.forEach(function(s){put(s,'ground',two[s.empId]?2:1)});
      if(tsa.length){var ts=pick(tsa,1+Math.max(1,Math.round(tsa.length/12)),'|mgr12|TSA');ts.forEach(function(s,i){put(s,'ground',i===0?2:1)})}
      pick(act.filter(function(s){return s.role==='cabin'}),2,'|mgr12|cab').forEach(function(s){put(s,'cabin',3)});
      pick(act.filter(function(s){return s.role==='pilot'}),1,'|mgr12|plt').forEach(function(s){put(s,'pilot',3)});
      pick(act.filter(function(s){return s.role==='service'}),2,'|mgr12|svc').forEach(function(s,i){put(s,'service',i?1:2)});
      m.seededR1012A=T12();m.seedV=2;try{save()}catch(_){}}
    /* 開頁後自動選好初始主管（薪資功過的職務加給不必等有人打開主管紀錄） */
    (function boot12(n){setTimeout(function(){try{if(window.KGM_SIDE!=='front'&&S.staff&&S.staff.length){seed12();if(!st12().seededR1012A&&n<10)boot12(n+1)}else if(n<10)boot12(n+1)}catch(_){}},n?20000:30000)})(0);
    window.kgmMgrOfR1012A=function(id){var r=st12().managers[id];return r&&r.level?r:null};
    window.kgmMgrAllowR1012A=function(id){var r=window.kgmMgrOfR1012A(id);return r?(ALW12[+r.level]||0):0};
    /* 地勤主管的組員：同站、同一輪替組（桃園）／同一週時段（松山）的同仁平均分給該組的主管；該組沒有主管時由同時段的主管代管；手動改派（teamOv）優先 */
    var COV12={};
    function teams12(ap,date){var m=st12(),out={},cov=COV12[ap]={},mg=Object.keys(m.managers).filter(function(id){var r=m.managers[id],s=staff12(id);return r&&r.dept==='ground'&&+r.level<=2&&s&&s.active!==false&&station12(id)===ap});
      mg.forEach(function(id){out[id]=[]});if(!mg.length)return out;
      var mem=(S.staff||[]).filter(function(s){return s&&s.role==='ground'&&s.active!==false&&station12(s.empId)===ap&&!m.managers[s.empId]}).sort(function(a,b){return String(a.empId).localeCompare(String(b.empId))});
      var byK={},byB={};mg.forEach(function(id){var k=gkey12(ap,id,date),b=band12(id,date);(byK[k]=byK[k]||[]).push(id);(byB[b]=byB[b]||[]).push(id)});
      var low=function(c){return c.slice().sort(function(x,y){return out[x].length-out[y].length||String(x).localeCompare(String(y))})[0]};
      mem.forEach(function(s){var ov=m.teamOv[s.empId];if(ov&&out[ov]){out[ov].push(s.empId);return}
        var k=gkey12(ap,s.empId,date),cand=byK[k];if(!cand||!cand.length){var b=band12(s.empId,date);cand=byB[b]&&byB[b].length?byB[b]:(mg.filter(function(id){return +m.managers[id].level===2}).length?mg.filter(function(id){return +m.managers[id].level===2}):mg);cov[s.empId]=1}   /* 同時段沒有主管：由站主管（Manager II）代管 */
        out[low(cand)].push(s.empId)});
      return out}
    window.kgmMgrTeamsR1012A=teams12;
    /* ── 任命／調整／撤銷 ── */
    window.kgmMgrSetR1012A=function(id,dept,level){
      var s=staff12(String(id||'').trim().toUpperCase())||staff12(String(id||'').trim());if(!s){alert(z12()?'查無此員工編號。':'No such employee.');return false}
      if(s.active===false){alert(z12()?'這位員工已離職／停用，不能任命。':'Inactive employee.');return false}
      level=+level||0;dept=dept||({ground:'ground',cabin:'cabin',pilot:'pilot',service:'service',backend:'backend',pricing:'pricing'}[s.role]||'backend');
      if(!canAppoint12(dept)){alert(z12()?'只有執行長或該部門的 Manager III 可以任命主管。':'Not allowed.');return false}
      var m=st12(),was=m.managers[s.empId];
      if(!level){if(!was)return false;if(!confirm((z12()?'撤銷 ':'Revoke ')+s.name+'（'+s.empId+'）'+(z12()?' 的 ':' ')+LV12[+was.level]+(z12()?' 職務？職務加給自下個月起停止。':'?')))return false;
        delete m.managers[s.empId];Object.keys(m.teamOv).forEach(function(k){if(m.teamOv[k]===s.empId)delete m.teamOv[k]});
        log12('revoke',(z12()?'撤銷主管：':'Revoked: ')+s.name+' '+s.empId+' '+LV12[+was.level]);try{notifyStaff(s.empId,'【主管職務】您的 '+LV12[+was.level]+' 職務已撤銷。')}catch(_){}}
      else{m.managers[s.empId]={level:level,dept:dept,since:(was&&was.since)||T12(),by:me12().name||me12().id};
        log12(was?'level':'appoint',(was?(z12()?'調整主管等級：':'Level changed: '):(z12()?'任命主管：':'Appointed: '))+s.name+' '+s.empId+' '+(DEPT12[dept]||[dept])[0]+' '+LV12[level]);
        try{notifyStaff(s.empId,'【主管職務】您已'+(was?'調整為':'獲任命為')+' '+(DEPT12[dept]||[dept])[0]+' '+LV12[level]+'，每月職務加給 NT$'+N12(ALW12[level])+'。')}catch(_){}}
      S._mgrMsgR1012A=(z12()?'✓ 已更新 ':'✓ Updated ')+s.name;try{save()}catch(_){}try{render()}catch(_){}return true};
    window.kgmMgrFormR1012A=function(){var g=function(k){var e=document.getElementById(k);return e?e.value:''};window.kgmMgrSetR1012A(g('k12mEmp'),g('k12mDept'),g('k12mLv'))};
    window.kgmMgrPrefillR1012A=function(id){S._mgrPreR1012A=id;S.adminTab='mgr12';S._mgrSecR1012A='list';try{render()}catch(_){}try{window.scrollTo(0,0)}catch(_){}};
    window.kgmMgrTeamMoveR1012A=function(emp,to){var m=st12();if(to)m.teamOv[emp]=to;else delete m.teamOv[emp];log12('team',(z12()?'改派組員 ':'Team change ')+emp+(to?' → '+to:(z12()?' → 自動分配':' → auto')));try{save()}catch(_){}try{render()}catch(_){}};
    /* ── 點名 ── */
    function akey12(kind,date,emp,ref){return kind+'|'+date+'|'+emp+(ref?'|'+ref:'')}
    window.kgmMgrMarkR1012A=function(kind,date,emp,status,ref){
      var m=st12(),k=akey12(kind,date,emp,ref),s=staff12(emp),nm=(s&&s.name)||emp,was=m.attend[k];
      if(status==='noshow'){if(!confirm((z12()?'登錄 ':'Mark ')+nm+'（'+emp+'）'+date+(z12()?' 無故缺席？\n\n會記「警告」一次（績效 −2%），並扣當日薪資（月薪 ÷ 30），通知本人。登錯可以撤銷。':' as no-show?')))return;
        if(!m.absent.some(function(a){return a&&a.empId===emp&&a.date===date&&!a.voided})){m.absent.push({empId:emp,date:date,kind:kind,ref:ref||'',by:me12().id,byName:me12().name,at:new Date().toISOString()});
          S.merits=S.merits||[];S.merits.unshift({empId:emp,type:'warn1',reason:'無故缺席 '+date+(ref?'（'+ref+'）':'')+'・主管 '+(me12().name||me12().id)+' 登錄',date:T12(),by:me12().name||'',srcR1012A:akey12(kind,date,emp,ref)});
          try{notifyStaff(emp,'【出勤】'+date+(ref?' '+ref:'')+' 登錄為無故缺席：記警告一次，並扣當日薪資。如有疑義請洽主管。')}catch(_){}}}
      else if(was&&was.status==='noshow'){/* 從無故缺席改成出勤／遲到 → 撤回警告與扣薪 */
        m.absent.forEach(function(a){if(a&&a.empId===emp&&a.date===date&&!a.voided){a.voided=new Date().toISOString();a.voidBy=me12().id}});
        S.merits=(S.merits||[]).filter(function(x){return !(x&&x.srcR1012A===akey12(kind,date,emp,ref))})}
      m.attend[k]={status:status,by:me12().id,byName:me12().name,at:new Date().toISOString()};
      log12('attend',(z12()?'點名 ':'Roll call ')+date+(ref?' '+ref:'')+' '+nm+' '+emp+'：'+({present:'出勤',late:'遲到',noshow:'無故缺席'}[status]||status));
      try{save()}catch(_){}try{render()}catch(_){}};
    function stBtns12(kind,date,emp,ref){var m=st12(),a=m.attend[akey12(kind,date,emp,ref)],cur=a&&a.status;
      var B=function(v,t){return '<button class="'+(cur===v?'on '+v:'')+'" onclick="kgmMgrMarkR1012A(\''+kind+'\',\''+date+'\',\''+A12(emp)+'\',\''+v+'\',\''+A12(ref||'')+'\')">'+t+'</button>'};
      return '<span class="k12m-st">'+B('present',z12()?'出勤':'Present')+B('late',z12()?'遲到':'Late')+B('noshow',z12()?'無故缺席':'No-show')+'</span>'+(a?'<small class="k12m-by">'+E12(a.byName||a.by)+' '+E12(String(a.at).slice(11,16))+'</small>':'')}
    /* ── 機師晉升考核 ── */
    window.kgmMgrCheckR1012A=function(){
      var g=function(k){var e=document.getElementById(k);return e?String(e.value||'').trim():''};
      var ins=g('k12cIns'),cand=g('k12cCand'),res=g('k12cRes'),note=g('k12cNote'),date=g('k12cDate')||T12();
      if(!ins||!cand||!res){alert(z12()?'請選教官、受考人與結果。':'Fill in instructor, candidate and result.');return}
      if(ins===cand){alert(z12()?'教官不能考自己。':'Instructor cannot check themselves.');return}
      var lv=null;try{lv=window.kgmCrewLevelOfR1009B(cand,'9999-12-31')}catch(_){lv=null}
      var to=lv?(lv.rank==='FO'?'CP':(lv.rank==='CP'&&!lv.tri?'TRI':'')):'';
      if(!to){alert(z12()?'這位機師目前沒有可以晉升的下一級。':'No next level.');return}
      var rec={id:'CK'+Date.now().toString(36).toUpperCase(),date:date,instructor:ins,candidate:cand,from:lv.rank,to:to,result:res,note:note,by:me12().id,at:new Date().toISOString()};
      var m=st12();m.checks.unshift(rec);
      var cs=staff12(cand),is=staff12(ins);
      log12('check',(z12()?'晉升考核 ':'Check ')+(cs?cs.name:cand)+' '+lv.rank+'→'+to+'：'+(res==='pass'?'通過':'不通過')+'（教官 '+(is?is.name:ins)+'）');
      if(res==='pass'){var ok=false;try{ok=window.kgmLevelUpR1009B&&window.kgmLevelUpR1009B(cand,true)}catch(_){ok=false}rec.levelUp=ok?'submitted':'pending-approval';
        if(!ok)alert(z12()?'考核已登錄為通過。晉升需要有組員班表權限的人核准（組員班表 → 職級晉升）。':'Recorded. Promotion needs approval.')}
      try{notifyStaff(cand,'【晉升考核】'+date+' '+lv.rank+'→'+to+'：'+(res==='pass'?'通過，職級晉升核准後第 30 天生效。':'未通過。'))}catch(_){}
      ['k12cNote'].forEach(function(k){var e=document.getElementById(k);if(e)e.value=''});
      try{save()}catch(_){}try{render()}catch(_){}};
    /* ── 頁面 ── */
    function css12(){if(document.getElementById('k12m-css'))return;var s=document.createElement('style');s.id='k12m-css';
      s.textContent='.k12m{max-width:1180px}.k12m-hero{background:linear-gradient(135deg,#0f3b33,#1f5a4c);color:#fff;border-radius:16px;padding:20px 24px;margin-bottom:16px}.k12m-hero small{letter-spacing:.16em;font-size:10px;color:#cfe3da;font-weight:800}.k12m-hero h2{margin:4px 0 6px;font-family:Georgia,serif;font-size:24px}.k12m-hero p{margin:0;font-size:12.5px;color:#d7e7e0;line-height:1.6}'
        +'.k12m-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}.k12m-tabs button{border:1px solid #d9e4df;background:#fff;border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:700;color:#28473f;cursor:pointer}.k12m-tabs button.on{background:#1f4e46;color:#fff;border-color:#1f4e46}'
        +'.k12m-card{background:#fff;border:1px solid #e3ebe7;border-radius:14px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 2px rgba(0,0,0,.03)}.k12m-card h3{margin:0 0 4px;font-size:15px;color:#123c32}.k12m-card>p{margin:0 0 12px;font-size:12px;color:#6b7b74;line-height:1.6}'
        +'.k12m-kpi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.k12m-kpi div{background:#f6faf8;border:1px solid #e1ece6;border-radius:12px;padding:10px 12px}.k12m-kpi small{display:block;font-size:10.5px;color:#6b7b74;font-weight:700}.k12m-kpi b{font-size:20px;color:#123c32}'
        +'.k12m-t{width:100%;border-collapse:collapse;font-size:12.5px}.k12m-t th{text-align:left;font-size:10.5px;letter-spacing:.06em;color:#6b7b74;padding:7px 8px;border-bottom:1px solid #e3ebe7;background:#fafcfb}.k12m-t td{padding:8px;border-bottom:1px solid #f0f4f2;vertical-align:middle}.k12m-t td b{color:#123c32}.k12m-t code{font:700 11.5px ui-monospace,Menlo,monospace;color:#476a5f}'
        +'.k12m-lv{display:inline-block;font:800 10.5px ui-monospace,Menlo,monospace;border-radius:999px;padding:3px 9px;background:#eef5f1;color:#1f4e46;border:1px solid #cfe1d6}.k12m-lv.l3{background:#1f4e46;color:#fff}.k12m-lv.l2{background:#dff0e6}'
        +'.k12m-form{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.k12m-form label{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#6b7b74;font-weight:700}.k12m-form .inp{height:36px;min-width:120px}'
        +'.k12m-st{display:inline-flex;gap:4px}.k12m-st button{border:1px solid #d9e4df;background:#fff;border-radius:8px;padding:4px 10px;font-size:11.5px;cursor:pointer;color:#33524a}.k12m-st button.on.present{background:#e8f5ee;border-color:#9fd0b4;color:#145c38;font-weight:800}.k12m-st button.on.late{background:#fff6e0;border-color:#ecd28c;color:#7a5600;font-weight:800}.k12m-st button.on.noshow{background:#fdecea;border-color:#efb1a8;color:#9b2c1c;font-weight:800}'
        +'.k12m-by{margin-left:8px;color:#8a978f;font-size:10.5px}.k12m-msg{background:#e8f5ee;border:1px solid #9fd0b4;color:#145c38;border-radius:10px;padding:8px 12px;font-size:12.5px;margin-bottom:12px}.k12m-off{color:#9aa39f}.k12m-team{margin:10px 0 0;border-top:1px dashed #e3ebe7;padding-top:10px}'
        +'.k12m-sub{font-size:11px;color:#6b7b74;margin-left:6px}.k12m-log{max-height:380px;overflow:auto}@media(max-width:760px){.k12m-kpi{grid-template-columns:repeat(2,minmax(0,1fr))}}';
      (document.head||document.documentElement).appendChild(s)}
    function dz12(d){return (DEPT12[d]||[d,d])[z12()?0:1]}
    function listSec12(){var m=st12(),ids=Object.keys(m.managers).filter(function(id){return staff12(id)});
      var by={};ids.forEach(function(id){var r=m.managers[id];(by[r.dept]=by[r.dept]||[]).push(id)});
      var tot=ids.reduce(function(a,id){return a+(ALW12[+m.managers[id].level]||0)},0),pre=S._mgrPreR1012A||'';
      var ps=pre?staff12(pre):null,pm=pre?m.managers[pre]:null;
      var form='<div class="k12m-card"><h3>'+(z12()?'任命／調整／撤銷主管':'Appoint, change or revoke')+'</h3><p>'+(z12()?'選在職員工、部門與等級。等級選「撤銷」就是取消主管職務。執行長，或該部門的 Manager III 可以操作；員工管理的每一列也有「主管」按鈕可以直接帶進來。':'CEO or the department Manager III.')+'</p>'
        +'<div class="k12m-form"><label>'+(z12()?'員工編號':'Employee ID')+'<input id="k12mEmp" class="inp" list="k12mEmpL" value="'+E12(pre)+'" placeholder="K12345"></label>'
        +'<datalist id="k12mEmpL">'+(S.staff||[]).filter(function(s){return s&&s.active!==false}).slice(0,900).map(function(s){return '<option value="'+E12(s.empId)+'">'+E12(s.name)+'</option>'}).join('')+'</datalist>'
        +'<label>'+(z12()?'部門':'Department')+'<select id="k12mDept" class="inp">'+Object.keys(DEPT12).map(function(k){var sel=(pm&&pm.dept===k)||(!pm&&ps&&ps.role===k);return '<option value="'+k+'"'+(sel?' selected':'')+'>'+dz12(k)+'</option>'}).join('')+'</select></label>'
        +'<label>'+(z12()?'等級':'Level')+'<select id="k12mLv" class="inp">'+[1,2,3].map(function(l){return '<option value="'+l+'"'+(pm&&+pm.level===l?' selected':'')+'>'+LV12[l]+'（NT$'+N12(ALW12[l])+(z12()?'／月':'/mo')+'）</option>'}).join('')+'<option value="0">'+(z12()?'撤銷主管職務':'Revoke')+'</option></select></label>'
        +'<button class="btn btn-g" onclick="kgmMgrFormR1012A()">'+(z12()?'確定':'Apply')+'</button></div>'
        +(ps?'<p style="margin:10px 0 0">'+E12(ps.name)+'（'+E12(ps.empId)+'）'+(pm?'目前是 '+dz12(pm.dept)+' '+LV12[+pm.level]:(z12()?'目前不是主管':'not a manager'))+'</p>':'')+'</div>';
      var tbl=Object.keys(DEPT12).filter(function(d){return by[d]&&by[d].length}).map(function(d){
        var rows=by[d].sort(function(a,b){return (+m.managers[b].level)-(+m.managers[a].level)||String(a).localeCompare(String(b))});
        var tm=d==='ground'?Object.assign({},teams12('TPE',T12()),teams12('TSA',T12())):{};
        return '<div class="k12m-card"><h3>'+dz12(d)+'<span class="k12m-sub">'+rows.length+(z12()?' 位主管':' managers')+'</span></h3>'
          +'<table class="k12m-t"><thead><tr><th>'+(z12()?'員工':'Employee')+'</th><th>'+(z12()?'等級':'Level')+'</th><th>'+(z12()?'職務加給／月':'Allowance')+'</th>'+(d==='ground'?'<th>'+(z12()?'站／本週時段':'Station / band')+'</th><th>'+(z12()?'組員':'Team')+'</th>':'')+'<th>'+(z12()?'任命日':'Since')+'</th><th></th></tr></thead><tbody>'
          +rows.map(function(id){var r=m.managers[id],s=staff12(id);
            return '<tr><td><b>'+E12(s.name)+'</b> <code>'+E12(id)+'</code></td><td><span class="k12m-lv l'+r.level+'">'+LV12[+r.level]+'</span></td><td>NT$'+N12(ALW12[+r.level])+'</td>'
              +(d==='ground'?'<td>'+station12(id)+' · '+E12((BANDZ12[band12(id,T12())]||['—','—'])[z12()?0:1])+'</td><td>'+(+r.level<=2?((tm[id]||[]).length+(z12()?' 人':'')):'<span class="k12m-off">'+(z12()?'督導全站':'Station-wide')+'</span>')+'</td>':'')
              +'<td>'+E12(r.since||'')+(r.seed?'<span class="k12m-sub">'+(z12()?'初始隨機':'seed')+'</span>':'')+'</td>'
              +'<td><button class="btn btn-sm" onclick="kgmMgrPrefillR1012A(\''+A12(id)+'\')">'+(z12()?'調整':'Edit')+'</button></td></tr>'}).join('')+'</tbody></table></div>'}).join('');
      return '<div class="k12m-kpi"><div><small>'+(z12()?'主管人數':'Managers')+'</small><b>'+ids.length+'</b></div><div><small>Manager III</small><b>'+ids.filter(function(i){return +m.managers[i].level===3}).length+'</b></div><div><small>Manager I／II</small><b>'+ids.filter(function(i){return +m.managers[i].level<3}).length+'</b></div><div><small>'+(z12()?'每月職務加給合計':'Monthly allowance')+'</small><b>NT$'+N12(tot)+'</b></div></div>'+form+tbl}
    function groundSec12(){var m=st12(),ap=S._mgrApR1012A||'TPE',date=S._mgrDateR1012A||T12(),T=teams12(ap,date);var ids=Object.keys(T);
      var sel=S._mgrSelR1012A&&T[S._mgrSelR1012A]?S._mgrSelR1012A:(T[me12().id]?me12().id:ids[0]);
      var head='<div class="k12m-form" style="margin-bottom:12px"><label>'+(z12()?'站':'Station')+'<select class="inp" onchange="S._mgrApR1012A=this.value;S._mgrSelR1012A=\'\';render()">'+['TPE','TSA'].map(function(a){return '<option'+(a===ap?' selected':'')+'>'+a+'</option>'}).join('')+'</select></label>'
        +'<label>'+(z12()?'日期':'Date')+'<input type="date" class="inp" value="'+date+'" onchange="S._mgrDateR1012A=this.value;render()"></label>'
        +'<label>'+(z12()?'主管':'Manager')+'<select class="inp" onchange="S._mgrSelR1012A=this.value;render()">'+ids.map(function(id){var s=staff12(id);return '<option value="'+E12(id)+'"'+(id===sel?' selected':'')+'>'+E12(s?s.name:id)+' · '+LV12[+m.managers[id].level]+' · '+T[id].length+(z12()?' 人':'')+'</option>'}).join('')+'</select></label></div>';
      if(!sel)return '<div class="k12m-card"><h3>'+(z12()?'地勤點名':'Ground roll call')+'</h3><p>'+(z12()?'這一站還沒有 Manager I／II。':'No managers at this station.')+'</p>'+head+'</div>';
      var opts=ids.map(function(id){var s=staff12(id);return '<option value="'+E12(id)+'">'+E12(s?s.name:id)+'</option>'}).join('');
      var rows=T[sel].map(function(id){var s=staff12(id),d=null;try{d=window.kgmGroundDutyR99(id,date)}catch(_){d=null}
        var lab=!d?'—':(d.off?(z12()?'例休':'Rest day'):(d.reserveR1008A?(z12()?'備勤':'Reserve'):(d.label+' '+d.from+'–'+d.to)));
        return '<tr><td><b>'+E12(s?s.name:id)+'</b> <code>'+E12(id)+'</code>'+((COV12[ap]||{})[id]?'<span class="k12m-sub">'+(z12()?'代管（該時段沒有主管）':'covered')+'</span>':'')+'</td><td>'+E12(lab)+'</td><td>'+((d&&!d.off&&!d.reserveR1008A)?stBtns12('g',date,id,ap):'<span class="k12m-off">'+(z12()?'不用點名':'—')+'</span>')+'</td>'
          +'<td><select class="inp" style="height:30px;font-size:11.5px" onchange="kgmMgrTeamMoveR1012A(\''+A12(id)+'\',this.value)"><option value="">'+(m.teamOv[id]?(z12()?'改回自動分配':'Auto'):(z12()?'改派給…':'Move to…'))+'</option>'+opts.replace('value="'+E12(sel)+'"','value="'+E12(sel)+'" disabled')+'</select></td></tr>'}).join('');
      var s0=staff12(sel);
      return '<div class="k12m-card"><h3>'+(z12()?'地勤點名':'Ground roll call')+'</h3><p>'+(z12()?(ap==='TPE'?'桃園依班別輪替組分組：同一組的同仁每一週都上同一個時段，每組 10–15 人（含主管）配一位主管，也可以手動改派。':'松山只有 '+((S.staff||[]).filter(function(x){return x&&x.role==='ground'&&x.active!==false&&station12(x.empId)==='TSA'}).length)+' 位地勤、分 4 個時段，依當週時段分組（人少的時段一組不到 10 人）；該時段沒有主管時由站主管代管。')+'無故缺席：記警告一次＋扣當日薪資，登錯改回「出勤」就會撤回。':'')+'</p>'+head
        +'<div class="k12m-team"><b>'+E12(s0?s0.name:sel)+'</b> <span class="k12m-lv l'+m.managers[sel].level+'">'+LV12[+m.managers[sel].level]+'</span><span class="k12m-sub">'+T[sel].length+(z12()?' 位組員 · ':' members · ')+E12((BANDZ12[band12(sel,date)]||['',''])[z12()?0:1])+'</span></div>'
        +'<table class="k12m-t"><thead><tr><th>'+(z12()?'組員':'Member')+'</th><th>'+(z12()?'當日上班時間':'Shift')+'</th><th>'+(z12()?'點名':'Roll call')+'</th><th>'+(z12()?'改派':'Move')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'}
    function cabinSec12(){var date=S._mgrCDateR1012A||T12(),P=null;try{P=window.kgmCrewPlanR121(date)}catch(_){P=null}
      var fl=((P&&P.flights)||[]).filter(function(f){return f&&!f.positioning&&(f.cabin||[]).length}).sort(function(a,b){return String(a.dep).localeCompare(String(b.dep))});
      var code=S._mgrCFltR1012A&&fl.some(function(f){return f.code+'|'+f.fr===S._mgrCFltR1012A})?S._mgrCFltR1012A:(fl[0]?fl[0].code+'|'+fl[0].fr:'');
      var f=fl.filter(function(x){return x.code+'|'+x.fr===code})[0];
      var head='<div class="k12m-form" style="margin-bottom:12px"><label>'+(z12()?'日期':'Date')+'<input type="date" class="inp" value="'+date+'" onchange="S._mgrCDateR1012A=this.value;S._mgrCFltR1012A=\'\';render()"></label>'
        +'<label>'+(z12()?'航班':'Flight')+'<select class="inp" onchange="S._mgrCFltR1012A=this.value;render()">'+fl.map(function(x){var k=x.code+'|'+x.fr;return '<option value="'+E12(k)+'"'+(k===code?' selected':'')+'>'+E12(x.code+' '+x.fr+'→'+x.to+' '+x.dep)+'</option>'}).join('')+'</select></label></div>';
      var pu=f?(f.cabin||[]).filter(function(c){return c.posCode==='PU'})[0]:null,dpu=f?(f.cabin||[]).filter(function(c){return c.posCode==='DPU'}):[];
      var m3=Object.keys(st12().managers).filter(function(id){var r=st12().managers[id];return r.dept==='cabin'&&+r.level===3}).map(function(id){var s=staff12(id);return s?s.name:id});
      var ref=f?(f.code+' '+f.fr+'→'+f.to):'';
      return '<div class="k12m-card"><h3>'+(z12()?'客艙點名':'Cabin roll call')+'</h3><p>'+(z12()?('當班座艙長＝Manager II、副座艙長＝Manager I，報到時點名這一班全體客艙組員。總座艙長（Manager III：'+(m3.join('、')||'尚未任命')+'）負責培訓與組員事宜，看得到全部紀錄。'):'')+'</p>'+head
        +(f?'<div class="k12m-team">'+(pu?('<b>'+E12(pu.name)+'</b> <span class="k12m-lv l2">座艙長 · Manager II</span>'):'')+dpu.map(function(c){return '　<b>'+E12(c.name)+'</b> <span class="k12m-lv l1">副座艙長 · Manager I</span>'}).join('')+'</div>'
          +'<table class="k12m-t"><thead><tr><th>'+(z12()?'組員':'Crew')+'</th><th>'+(z12()?'當班位置':'Position')+'</th><th>'+(z12()?'服務艙等':'Cabin')+'</th><th>'+(z12()?'點名':'Roll call')+'</th></tr></thead><tbody>'
          +(f.cabin||[]).map(function(c){return '<tr><td><b>'+E12(c.name)+'</b> <code>'+E12(c.empId)+'</code></td><td>'+E12(c.posZH||c.posCode||'')+'</td><td>'+E12(c.cabinZH||'')+'</td><td>'+stBtns12('c',date,c.empId,ref)+'</td></tr>'}).join('')+'</tbody></table>'
        :'<p class="k12m-off">'+(z12()?'這一天的組員班表還沒排好（或沒有航班）。':'No crew plan for this day.')+'</p>')+'</div>'}
    function pilotSec12(){var m=st12(),pl=(S.staff||[]).filter(function(s){return s&&s.role==='pilot'&&s.active!==false});
      var lvOf=function(id){try{return window.kgmCrewLevelOfR1009B(id,'9999-12-31')}catch(_){return null}};
      var ins=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.tri||l.rank==='TRI')}),cand=pl.filter(function(s){var l=lvOf(s.empId);return l&&(l.rank==='FO'||(l.rank==='CP'&&!l.tri))});
      var o=function(list){return list.map(function(s){var l=lvOf(s.empId);return '<option value="'+E12(s.empId)+'">'+E12(s.name)+' · '+E12(s.empId)+' · '+E12(l?(l.tri?'TRI':l.rank):'')+'</option>'}).join('')};
      var L=m.checks.slice(0,40),nm=function(id){var s=staff12(id);return s?s.name:id};
      return '<div class="k12m-card"><h3>'+(z12()?'機師晉升考核':'Pilot promotion checks')+'</h3><p>'+(z12()?'由教官登錄：副機師 → 正機師、正機師 → 教官。通過即送出職級晉升（核准後第 30 天生效，生效日起依新職級排班）；不通過只留紀錄。':'')+'</p>'
        +'<div class="k12m-form"><label>'+(z12()?'教官':'Instructor')+'<select id="k12cIns" class="inp"><option value=""></option>'+o(ins)+'</select></label>'
        +'<label>'+(z12()?'受考人':'Candidate')+'<select id="k12cCand" class="inp"><option value=""></option>'+o(cand)+'</select></label>'
        +'<label>'+(z12()?'考核日':'Date')+'<input id="k12cDate" type="date" class="inp" value="'+T12()+'"></label>'
        +'<label>'+(z12()?'結果':'Result')+'<select id="k12cRes" class="inp"><option value=""></option><option value="pass">'+(z12()?'通過':'Pass')+'</option><option value="fail">'+(z12()?'不通過':'Fail')+'</option></select></label>'
        +'<label style="flex:1;min-width:200px">'+(z12()?'評語':'Remarks')+'<input id="k12cNote" class="inp" placeholder="'+(z12()?'例：模擬機 LOFT、航路考驗表現':'')+'"></label>'
        +'<button class="btn btn-g" onclick="kgmMgrCheckR1012A()">'+(z12()?'登錄':'Record')+'</button></div>'
        +(L.length?'<table class="k12m-t" style="margin-top:14px"><thead><tr><th>'+(z12()?'日期':'Date')+'</th><th>'+(z12()?'受考人':'Candidate')+'</th><th>'+(z12()?'晉升':'Step')+'</th><th>'+(z12()?'教官':'Instructor')+'</th><th>'+(z12()?'結果':'Result')+'</th><th>'+(z12()?'評語':'Remarks')+'</th></tr></thead><tbody>'
          +L.map(function(c){return '<tr><td>'+E12(c.date)+'</td><td><b>'+E12(nm(c.candidate))+'</b> <code>'+E12(c.candidate)+'</code></td><td>'+E12(c.from+' → '+c.to)+'</td><td>'+E12(nm(c.instructor))+'</td><td>'+(c.result==='pass'?'<span class="k12m-lv l2">'+(z12()?'通過':'Pass')+'</span>'+(c.levelUp==='pending-approval'?'<span class="k12m-sub">'+(z12()?'待核准':'awaiting approval')+'</span>':''):'<span class="k12m-lv" style="background:#fdecea;color:#9b2c1c;border-color:#efb1a8">'+(z12()?'不通過':'Fail')+'</span>')+'</td><td>'+E12(c.note||'')+'</td></tr>'}).join('')+'</tbody></table>':'')+'</div>'}
    function logSec12(){var m=st12(),ab=m.absent.filter(function(a){return a&&!a.voided});
      return '<div class="k12m-card"><h3>'+(z12()?'無故缺席':'No-shows')+'<span class="k12m-sub">'+ab.length+'</span></h3>'+(ab.length?'<table class="k12m-t"><thead><tr><th>'+(z12()?'日期':'Date')+'</th><th>'+(z12()?'員工':'Employee')+'</th><th>'+(z12()?'班別／航班':'Duty')+'</th><th>'+(z12()?'登錄主管':'By')+'</th><th>'+(z12()?'處分':'Penalty')+'</th></tr></thead><tbody>'
        +ab.slice().reverse().slice(0,60).map(function(a){var s=staff12(a.empId);return '<tr><td>'+E12(a.date)+'</td><td><b>'+E12(s?s.name:a.empId)+'</b> <code>'+E12(a.empId)+'</code></td><td>'+E12(a.ref||(a.kind==='g'?'地勤':'客艙'))+'</td><td>'+E12(a.byName||a.by)+'</td><td>'+(z12()?'警告一次＋扣當日薪資':'Warning + 1 day pay')+'</td></tr>'}).join('')+'</tbody></table>':'<p class="k12m-off">'+(z12()?'沒有紀錄。':'None.')+'</p>')+'</div>'
        +'<div class="k12m-card"><h3>'+(z12()?'所有紀錄':'Activity log')+'</h3><div class="k12m-log"><table class="k12m-t"><tbody>'+(m.log.slice(0,200).map(function(l){return '<tr><td style="white-space:nowrap">'+E12(String(l.at).slice(0,16).replace('T',' '))+'</td><td>'+E12(l.byName||l.by)+'</td><td>'+E12(l.text)+'</td></tr>'}).join('')||'<tr><td class="k12m-off">—</td></tr>')+'</tbody></table></div></div>'}
    window.kgmMgrPageR1012A=function(){
      try{css12();try{window.kgmFixStaffNamesR1012A&&window.kgmFixStaffNamesR1012A()}catch(_){}seed12();var sec=S._mgrSecR1012A||'list',msg=S._mgrMsgR1012A;S._mgrMsgR1012A='';
        var T=[['list',z12()?'主管名冊':'Managers'],['ground',z12()?'地勤點名':'Ground roll call'],['cabin',z12()?'客艙點名':'Cabin roll call'],['pilot',z12()?'機師晉升考核':'Pilot checks'],['log',z12()?'缺席與紀錄':'Records']];
        var body=sec==='ground'?groundSec12():sec==='cabin'?cabinSec12():sec==='pilot'?pilotSec12():sec==='log'?logSec12():listSec12();
        return '<div class="k12m"><div class="k12m-hero"><small>SUPERVISOR RECORDS · MANAGER I／II／III</small><h2>'+(z12()?'主管紀錄':'Supervisor records')+'</h2><p>'
          +(z12()?'主管等級 Manager I／II／III，每月職務加給 NT$8,000／15,000／25,000（併入薪資功過）。地勤主管點名自己的組員；客艙由當班座艙長（Manager II）與副座艙長（Manager I）點名；機師晉升由教官考核。無故缺席記警告一次並扣當日薪資。':'Manager levels I–III with monthly allowances; roll calls, no-show records and pilot checks.')+'</p></div>'
          +'<div class="k12m-tabs">'+T.map(function(t){return '<button class="'+(t[0]===sec?'on':'')+'" onclick="S._mgrSecR1012A=\''+t[0]+'\';render()">'+t[1]+'</button>'}).join('')+'</div>'
          +(msg?'<div class="k12m-msg">'+E12(msg)+'</div>':'')+body+'</div>';
      }catch(e){return '<div class="k12m-card">'+E12(e.message)+'</div>'}
    };

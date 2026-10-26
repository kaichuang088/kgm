# 1026C（交付 1027A）：團體訂位改兩個方案（使用者逐條指定），在網站裡現行的 grp25（含 1026B 夥伴段修改）上逐段改 → js/grp25_27.js
#   js/grp25_cur.js＝1026B 交付檔裡嵌入的 grp25 原文（gen_r27 用它整段換掉）
s=open('js/grp25_cur.js',encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a));s=s.replace(a,b)

# ── 0 規則表 ──
rep("var DISC=0.05,DEP=0.10,FEE=0.75,MINP=10,MAXP=99,RED=3,NAMES_D=14,BAL_D=14;\nwindow.KGM_GRP_RULES_R1025B={disc:DISC,deposit:DEP,fee:FEE,min:MINP,max:MAXP,reduce:RED,namesDays:NAMES_D,balanceDays:BAL_D};",
"""/* 1026C（交付 1027A）：團體訂位兩個方案（使用者：「團體訂購就是提供兩個方案，就是優惠和彈性，你去選沒有用過的英文代號」）
   代號：全站沒用過的字母只剩 Q、U → 團體優惠 Q（E-Q／P-Q／B-Q）、團體彈性 U（E-U／P-U／B-U）。
   優惠：改票每人 NT$1,400、退票每人 NT$2,600；名單（確認人數）出發前 28 天、尾款出發前 21 天；名單期限前可 ±3 位不收手續費（加人看當天空位）；行李經濟艙短程 1×23、長程 2×23。
   彈性：改票每人 NT$600、退票每人 NT$1,500；名單出發前 14 天、尾款出發前 7 天；名單期限前可 ±6 位不收手續費；行李 2×23；可依「超值」規則申請哩程升等。
   兩者：不能用酬賓機票、不能網路報到（出發當日由領隊或全體旅客到機場櫃檯辦理）、開票後到起飛前 72 小時可付費選位、座位保留到起飛前 60 分鐘；
   超過免費名額的增減，每一位都收手續費（加人＝改票費、減人＝退票費）；每位旅客艙等可以不一樣（名單頁逐位調整）。
   價格：本艙一般 1 位可賣的最低價 × 優惠 0.90／彈性 1.05（兩個方案有落差）。訂金照舊 10%。 */
var DEP=0.10,FEE=1,MINP=10,MAXP=99;
var PLANS={Q:{k:'Q',zh:'團體優惠',en:'Group Saver',mul:0.90,chg:1400,ref:2600,names:28,bal:21,free:3,upg:false},
           U:{k:'U',zh:'團體彈性',en:'Group Flex',mul:1.05,chg:600,ref:1500,names:14,bal:7,free:6,upg:true}};
window.KGM_GRP_PLANS_R1026C=PLANS;
window.KGM_GRP_RULES_R1025B={deposit:DEP,min:MINP,max:MAXP,plans:PLANS};
function planOf(x){if(!x)return PLANS.U;if(typeof x==='string'){var f=(typeof FARES!=='undefined')?FARES[x]:null;return PLANS[(f&&f.groupPlanR1026C)||x]||PLANS.U}return PLANS[x.plan]||PLANS.U}
window.kgmGrpPlanOfR1026C=planOf;""")

# ── 1 帳號：AI 綁定改成「送出申請、待核准開放期間」；acct() 要在開放期間內 ──
rep("""  var rec={status:'active',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI'};""",
"""  /* 1026C：使用者「後台團體定位也要有地方…一個是核准或是新增用戶開放期間可訂購團體票」→ AI 客服核對完是「申請中」，後台團體業務核准並設定開放期間後才能訂 */
  var rec={status:'pending',type:d.type,company:d.company,taxId:d.taxId,license:d.license||'',contact:{name:d.contact,phone:d.phone,email:u.email||''},caseNo:no,boundAt:now,boundBy:'AI',requestedAt:now};""")
rep("""    progress:[{at:now,status:'received',label:z()?'AI 客服受理團體帳號綁定':'Received by AI assistant',by:'AI'},{at:now,status:'resolved',label:z()?'基本資料核對完成，已綁定團體帳號':'Verified and bound',by:'AI'}],""",
"""    progress:[{at:now,status:'received',label:z()?'AI 客服受理團體帳號申請':'Received by AI assistant',by:'AI'},{at:now,status:'resolved',label:z()?'基本資料核對完成，轉團體業務核准開放期間':'Verified; sent to the group desk for approval',by:'AI'}],""")
rep("""  try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify('group.account_bound',{email:u.email||'',name:d.contact,caseNo:no,message:(z()?'您的團體帳號已綁定（'+d.company+'），現在可以在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is active.')})).catch(function(){})}catch(_){}""",
"""  try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify('internal.group_request',{email:'groups@kgm-airways.com',caseNo:no,message:(z()?'團體帳號申請待核准：':'Group account awaiting approval: ')+d.company+'（'+typeName(d.type)+'，統編 '+d.taxId+'）'})).catch(function(){})}catch(_){}""")
rep("""function acct(){var u=me();return u&&u.groupAccountR1025B&&u.groupAccountR1025B.status==='active'?u.groupAccountR1025B:null}""",
"""function acctAny(){var u=me();return u&&u.groupAccountR1025B||null}
/* 可以訂團體票＝已核准，而且今天在開放期間內（沒設期間＝不限） */
function openNow(x){if(!x||x.status!=='active')return false;var td=T();if(x.from&&td<x.from)return false;if(x.to&&td>x.to)return false;return true}
function acct(){var x=acctAny();return openNow(x)?x:null}
window.kgmGrpAcctStateR1026C=function(){var x=acctAny();if(!x)return 'none';if(x.status==='pending')return 'pending';if(x.status!=='active')return x.status;return openNow(x)?'open':'closed'};
/* 後台：核准（設定開放期間）、新增用戶、停用 */
function acctMail(u,x,ev,msg){try{if(typeof kgmNotify==='function')Promise.resolve(kgmNotify(ev,{email:u.email||(x.contact&&x.contact.email)||'',name:x.contact&&x.contact.name||'',caseNo:x.caseNo||'',message:msg})).catch(function(){})}catch(_){}}
window.kgmGrpApproveR1026C=function(uid,from,to){var u=(S.users||[]).filter(function(x){return x&&x.id===uid})[0];if(!u||!u.groupAccountR1025B)return false;var x=u.groupAccountR1025B;
  x.status='active';x.from=from||T();x.to=to||'';x.approvedAt=new Date().toISOString();x.approvedBy=(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'';if(S.user&&S.user.id===uid)S.user.groupAccountR1025B=x;
  acctMail(u,x,'group.account_bound',(z()?'您的團體帳號已核准（'+x.company+'），開放期間 '+x.from+' ～ '+(x.to||'不限')+'；期間內可在首頁訂票卡的「團體訂位」分頁訂位。':'Your group account is approved.'));
  try{logAct(z()?'團體帳號核准':'Group account approved',x.company+' · '+x.from+'～'+(x.to||'—'))}catch(_){}save1();return true};
window.kgmGrpAddUserR1026C=function(q,d){q=String(q||'').trim().toLowerCase();var u=(S.users||[]).filter(function(x){return x&&(String(x.id||'').toLowerCase()===q||String(x.email||'').toLowerCase()===q)})[0];if(!u)return 'nouser';
  if(!d.company||!taxOk(d.taxId))return 'bad';var now=new Date().toISOString();
  u.groupAccountR1025B={status:'active',type:d.type||'agency',company:d.company,taxId:String(d.taxId).replace(/\\D/g,''),license:d.license||'',contact:{name:d.contact||u.name||'',phone:d.phone||u.phone||'',email:u.email||''},caseNo:caseNo(),boundAt:now,boundBy:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||'desk',from:d.from||T(),to:d.to||'',approvedAt:now,approvedBy:(S.adminUser&&(S.adminUser.empId||S.adminUser.name))||''};
  if(S.user&&S.user.id===u.id)S.user.groupAccountR1025B=u.groupAccountR1025B;
  acctMail(u,u.groupAccountR1025B,'group.account_bound',(z()?'KGM 團體業務已為您開通團體帳號（'+d.company+'），開放期間 '+u.groupAccountR1025B.from+' ～ '+(u.groupAccountR1025B.to||'不限')+'。':'Group account opened.'));
  try{logAct(z()?'新增團體用戶':'Group user added',d.company+' · '+(u.email||u.id))}catch(_){}save1();return 'ok'};""")
rep("""    return (z()?'✓ 綁定完成，案件編號 '+r.caseNo+'。\\n\\n現在首頁訂票卡多了「團體訂位」分頁：選航班跟一般訂票一樣（單程、來回、多航段都可以），10–99 位，票價比一般最低價少 5%。\\n訂位時付訂金 10%，尾款最晚出發前 14 天付清；名單最晚出發前 14 天提供，名單提供前最多可減少 3 位；付清且名單齊全後一人一個 PNR 開票。\\n管理已訂的團體：選單「優惠與訂票 › 團體訂位」。':'Bound. Case '+r.caseNo+'. The Group tab is now on the home booking card.')}""",
"""    return (z()?'✓ 已送出團體帳號申請，案件編號 '+r.caseNo+'。\\n\\nKGM 團體業務核准並設定開放期間後，會寄信通知您；之後首頁訂票卡會出現「團體訂位」分頁（10–99 位，選航班跟一般訂票一樣）。\\n團體有兩個方案：\\n・團體優惠（Q）：價格較低；名單（確認人數）出發前 28 天、尾款出發前 21 天；名單期限前可 ±3 位不收手續費；改票每人 NT$1,400、退票每人 NT$2,600。\\n・團體彈性（U）：名單出發前 14 天、尾款出發前 7 天；名單期限前可 ±6 位不收手續費；改票每人 NT$600、退票每人 NT$1,500；可申請哩程升等。\\n訂位時付訂金 10%；付清且名單齊全後一人一個 PNR 開票。詳細規定見《團體訂位規章》（KGM-GRP-021）。':'Request sent. Case '+r.caseNo+'. We will email you once the group desk approves it.')}""")

# ── 2 團體代號（Q／U）：等 r54 的票價方案表好了再建；建好的代號不進一般方案表（FAM54 開頁時就定了），一般訂票看不到 ──
rep("""function gcode(cab){var f=fam(),a=f&&f[cab]&&(f[cab].Value||f[cab].Basic);return a&&a[0]||null}
window.kgmGrpCodeR1025B=gcode;""",
"""var GC={};var CABZ={Economy:'經濟艙',Premium:'豪華經濟艙',Business:'商務艙'};
function mkCodes(){if(GC.Economy)return true;var f=fam();if(!f||typeof FARES==='undefined')return false;
  [['Economy','E'],['Premium','P'],['Business','B']].forEach(function(c){var cab=c[0],pre=c[1],F=f[cab];if(!F)return;var bq=(F.Basic||F.Value||[])[0],bu=(F.Value||F.Basic||[])[0];if(!bq||!bu)return;
    GC[cab]={};['Q','U'].forEach(function(k){var code=pre+'-'+k,P=PLANS[k],base=FARES[k==='Q'?bq:bu]||{};
      if(!(FARES[code]&&FARES[code].groupPlanR1026C)){var o=Object.assign({},base,{zh:k+' '+CABZ[cab]+' '+P.zh,en:k+' '+cab+' '+P.en,tier:P.zh+' '+P.en,tierEN:P.en,
          chgZH:'NT$'+P.chg.toLocaleString(),chgEN:'NT$'+P.chg.toLocaleString(),refZH:'NT$'+P.ref.toLocaleString(),refEN:'NT$'+P.ref.toLocaleString(),
          displayCodeR48:k,groupPlanR1026C:k,familyR48:k==='Q'?'Basic':'Value',freeSeat:0,rec:false});   /* 1026C：改票／退票費＝方案金額（每位旅客），changeFeeOf／refundPolicyOf 最外層直接回方案值 */
        if(cab==='Economy')o.bag=k==='Q'?'短程 1×23kg／長程 2×23kg':'2×23kg';
        FARES[code]=o}   /* 基底的 __halfR101 標記要留著（沒有標記的票價表手續費會被 r101 再除一次） */
      GC[cab][k]=code})});
  return !!GC.Economy}
function isG(code){return !!(code&&typeof FARES!=='undefined'&&FARES[code]&&FARES[code].groupPlanR1026C)}
function gcode(cab,k){mkCodes();return GC[cab]&&GC[cab][k||'U']||null}
window.kgmGrpCodeR1025B=gcode;window.kgmGrpCodesR1026C=function(){mkCodes();return GC};window.kgmIsGrpCodeR1026C=isG;
setTimeout(mkCodes,0);setTimeout(mkCodes,1500);setTimeout(mkCodes,6000);
/* 方案清單：團體模式只列 Q／U（這班有的艙等）；一般訂票把 Q／U 拿掉 */
function vcWrap(){var O=window.validCodes;if(typeof O!=='function'||O.__grp27)return;
  var w=function(f){var r=O.apply(this,arguments)||[];try{mkCodes();if(on()&&!window.__grp25raw){var cabs={};r.forEach(function(c){var cb=(FARES[c]||{}).cabin;if(cb)cabs[cb]=1});var out=[];['Economy','Premium','Business'].forEach(function(cb){if(cabs[cb]&&GC[cb])out.push(GC[cb].Q,GC[cb].U)});return out.length?out:r}
      return r.filter(function(c){return !isG(c)})}catch(_){return r}};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27=1;window.validCodes=w;try{validCodes=w}catch(_){}}
vcWrap();setTimeout(vcWrap,0);setTimeout(vcWrap,3000);setTimeout(vcWrap,12000);
/* 搜尋頁「去程起」與票價卡用 CAB_CODES（每一艙的代號清單）篩 → 團體模式把 Q／U 放在最前面 */
function ccWrap(){var O=window.CAB_CODES;if(typeof O!=='function'||O.__grp27)return;
  var w=function(k){var r=O.apply(this,arguments)||[];try{if(on()&&!window.__grp25raw){mkCodes();var g=GC[k];if(g)return [g.Q,g.U].concat(r)}}catch(_){}return r};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27=1;window.CAB_CODES=w;try{CAB_CODES=w}catch(_){}}
ccWrap();setTimeout(ccWrap,0);setTimeout(ccWrap,3000);setTimeout(ccWrap,12000);""")
rep("""  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(code!==gcode(cab))return 0;""",
    """  if(cab==='First'||cab==='Resident'||!fi.familyR48)return 0;if(!isG(code))return 0;""")
rep("""/* 團體票價：這一艙當下一般可賣（1 位）的最低價 × 0.95 */""","""/* 團體票價：這一艙當下一般可賣（1 位）的最低價 × 方案係數（優惠 0.90、彈性 1.05） */""")
rep("""function grpPrice(O,self,f,code,pax){var cab=(FARES[code]||{}).cabin||'Economy',k=[f.code,f.date,f.fr,f.to,cab,pax,""","""function grpPrice(O,self,f,code,pax){var cab=(FARES[code]||{}).cabin||'Economy',k=[f.code,f.date,f.fr,f.to,code,pax,""")
rep("""  try{Object.keys(FARES).forEach(function(cd){var x=FARES[cd];if(!x||x.cabin!==cab||!x.familyR48)return;""","""  try{Object.keys(FARES).forEach(function(cd){var x=FARES[cd];if(!x||x.cabin!==cab||!x.familyR48||x.groupPlanR1026C)return;""")
rep("""  if(best==null)best=+O.call(self,f,code,pax)||0;var v=Math.round(best*(1-DISC));""","""  if(best==null){var fb=gcode(cab,'U');var bc=(fam()||{})[cab];bc=bc&&(bc.Value||bc.Basic||[])[0];window.__grp25raw=1;try{best=+O.call(self,f,bc||fb,pax)||0}finally{window.__grp25raw=0}}var v=Math.round(best*planOf(code).mul);""")
rep("""var w=function(f,code,pax){if(window.__grp25raw||!on()||!f||!f.date)return O.apply(this,arguments);var cab=(FARES[code]||{}).cabin;if(!cab||code!==gcode(cab))return O.apply(this,arguments);return grpPrice(O,this,f,code,pax)};""",
    """var w=function(f,code,pax){if(window.__grp25raw||!f||!f.date||!isG(code))return O.apply(this,arguments);return grpPrice(O,this,f,code,pax)};OW0=O;""")
rep("""function owWrap(){var O=window.owPrice;""","""var OW0=null;function owWrap(){var O=window.owPrice;""")

# ── 3 期限依方案 ──
rep("""function dues(d0){var td=T(),late=days(td,d0)<=BAL_D;return {late:late,balance:late?td:AD(d0,-BAL_D),names:late?AD(td,1)>AD(d0,-1)?AD(d0,-1):AD(td,1):AD(d0,-NAMES_D)}}""",
"""function curPlan(){var c=null;try{c=S.outC||(S.mcFlights&&S.mcFlights[0]&&S.mcFlights[0].c)}catch(_){}return planOf(c)}
function dues(d0,P){P=P||curPlan();var td=T(),late=days(td,d0)<=P.bal,nl=days(td,d0)<=P.names;return {late:late,balance:late?td:AD(d0,-P.bal),names:nl?(AD(td,1)>AD(d0,-1)?AD(d0,-1):AD(td,1)):AD(d0,-P.names)}}""")
# 旅客資料頁（團體）
rep("""+'</b><span>'+(z()?'名單提供前最多可減少 ':'Can reduce by up to ')+RED+(z()?' 位':' before names')+'</span></div></div>'""",
    """+'</b><span>'+(z()?'名單期限前可 ±'+P.free+' 位不收手續費':'±'+P.free+' free before names')+'</span></div></div>'""")
rep("""  var w=function(){if(!on())return O.apply(this,arguments);var a=acct(),d=draft(),p=passengerCounts(),d0=firstDate(),du=dues(d0);""",
    """  var w=function(){if(!on())return O.apply(this,arguments);var a=acct(),d=draft(),p=passengerCounts(),d0=firstDate(),P=curPlan(),du=dues(d0,P);""")
rep("""(z()?' 個座位，名單最晚 ':' seats held as TBA; names due ')+E(du.names)+(z()?' 前提供（出發前 14 天）。':'.')+'</p></div>'""",
    """(z()?' 個座位（'+P.zh+' '+P.k+'），名單（確認人數）最晚 ':' seats held as TBA ('+P.en+'); names due ')+E(du.names)+(z()?' 前提供（出發前 '+P.names+' 天）。':'.')+'</p></div>'""")
rep("""(du.late?'<b>'+(z()?'出發前 14 天內：訂位時一次付清':'Within 14 days: pay in full')+'</b>'""","""(du.late?'<b>'+(z()?'出發前 '+P.bal+' 天內：訂位時一次付清':'Within '+P.bal+' days: pay in full')+'</b>'""")
rep("""+'<div><small>'+(z()?'團體票規':'Group fare rules')+'</small><b>'+(z()?'改票／退票手續費＝該艙「超值」× 0.75':'Change / refund fee = cabin Value fee × 0.75')+'</b><span>'+(z()?'開票後一位旅客一個 PNR，各自報到、改票。':'One PNR per traveller after ticketing.')+'</span></div></div>'""",
    """+'<div><small>'+(z()?'團體票規（'+P.zh+' '+P.k+'）':'Group fare rules ('+P.en+')')+'</small><b>'+(z()?'改票每人 NT$'+P.chg.toLocaleString()+'・退票每人 NT$'+P.ref.toLocaleString():'Change NT$'+P.chg.toLocaleString()+' · refund NT$'+P.ref.toLocaleString()+' per person')+'</b><span>'+(z()?'開票後一位旅客一個 PNR；團體旅客不能網路報到（出發當日由領隊或全體旅客到櫃檯辦理）；開票後到起飛前 72 小時可付費選位；不能使用酬賓機票'+(P.upg?'；可依「超值」規則申請哩程升等':'；不能申請哩程升等')+'。':'One PNR per traveller; airport check-in only.')+'</span></div></div>'""")
rep("""  var w=function(){var h=O.apply(this,arguments);if(!on())return h;var tot=0,cur='TWD';try{var q=journeyPrice();tot=q.total||q.grand||q.amount||0;cur=journeyCurr()}catch(_){}var du=dues(firstDate()),dep=du.late?tot:Math.round(tot*DEP);""",
    """  var w=function(){var h=O.apply(this,arguments);if(!on())return h;var tot=0,cur='TWD';try{var q=journeyPrice();tot=q.total||q.grand||q.amount||0;cur=journeyCurr()}catch(_){}var P=curPlan(),du=dues(firstDate(),P),dep=du.late?tot:Math.round(tot*DEP);""")
rep("""(du.late?(z()?'出發前 14 天內訂位，本次付清全額。':'Paying in full.')""","""(du.late?(z()?'出發前 '+P.bal+' 天內訂位，本次付清全額。':'Paying in full.')""")

# ── 4 訂位成立：記方案 ──
rep("""  var a=acct()||{},u=me()||{},segs=segsOf(b),d0=segs.length?segs[0].date:T(),du=dues(d0),tot=""","""  var a=acct()||{},u=me()||{},segs=segsOf(b),d0=segs.length?segs[0].date:T(),P=planOf(b.outC||(segs[0]||{}).cls),du=dues(d0,P),tot=""")
rep("""    adults:pc?pc.adults:0,children:pc?pc.children:0,infants:pc?pc.infants:0,pax:pc?pc.seats:0,pax0:pc?pc.seats:0,reduced:0,""",
    """    adults:pc?pc.adults:0,children:pc?pc.children:0,infants:pc?pc.infants:0,pax:pc?pc.seats:0,pax0:pc?pc.seats:0,reduced:0,plan:P.k,adj:0,fees:[],moved:[],""")
rep("""b.groupR1025B={id:g.id,feeMul:FEE};""","""b.groupR1025B={id:g.id,plan:P.k};""")
rep("""note:(z()?'團體尾款，請於 ':'Group balance due ')+du.balance+(z()?' 前付清（出發前 14 天），逾期自動取消並釋出座位':'')""","""note:(z()?'團體尾款，請於 ':'Group balance due ')+du.balance+(z()?' 前付清（出發前 '+P.bal+' 天），逾期自動取消並釋出座位':'')""")

# ── 5 增減人數（名單期限前 ±免費名額；超過每位收手續費）、每位旅客艙等 ──
rep("""function canReduce(g){return /deposit_paid|paid/.test(g.status)&&g.reduced<RED&&T()<=g.due.names&&g.pax>MINP-RED}""",
"""function freeLeft(g){var P=planOf(g);return T()<=g.due.names?Math.max(0,P.free-(g.adj||0)):0}
function canReduce(g){return /deposit_paid|paid/.test(g.status)&&g.pax>1}
function canAdd(g){return /deposit_paid|paid/.test(g.status)&&g.pax+(g.moved||[]).length<MAXP}
/* 尾款重開（人數、艙等變了） */
function rebal(g,b,why){var c=charge(g.balance.chargeId);if(c&&c.status==='unpaid'){try{window.kgmVoidChargeR45(c.id)}catch(_){}}
  var paid=g.deposit.amount+(g.balance.paid?g.balance.amountPaid||g.balance.amount:0)+(g.extraPaid||0),need=Math.max(0,g.total+(g.feeTotal||0)-paid);
  if(g.balance.paid&&need>0){g.extraPaid=(g.extraPaid||0)+(g.balance.amountPaid||g.balance.amount);g.balance.amountPaid=0;g.balance.paid=false;g.status='deposit_paid'}
  if(!g.balance.paid){g.balance.amount=need;if(b)b.balanceDue=need;if(need>0){var ch=null;try{ch=window.kgmCreateChargeR45({pnr:g.pnr,items:[{label:'Group balance · '+g.id,amount:need}],note:(z()?'團體尾款（'+why+'後重開），請於 ':'Group balance due ')+g.due.balance+(z()?' 前付清':'')})}catch(_){}g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token}else{g.balance.paid=true;g.status='paid'}}}
function priceOf(g,s,code){var f=null;try{f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0]}catch(_){}if(!f||!OW0)return 0;f=Object.assign({},f,{date:s.date,dep:s.dep,arr:s.arr});var v=0;try{v=+grpPrice(OW0,null,f,code,1)||0}catch(_){v=0}return v}
function feeIn(g,kind,n,why){var P=planOf(g),unit=kind==='add'?P.chg:P.ref,amt=unit*n;g.fees=g.fees||[];g.fees.push({at:new Date().toISOString(),kind:kind,n:n,unit:unit,amount:amt,why:why||''});g.feeTotal=(g.feeTotal||0)+amt;return amt}""")
rep("""window.kgmGrpReduceR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canReduce(g))return;var b=bk(g.pnr);if(!b)return;
  if(!confirm(z()?'減少 1 位？（從名單最後一位開始；已付的訂金不退，尾款會依少掉的人數扣掉）':'Remove one traveller?'))return;""",
"""window.kgmGrpReduceR1025B=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canReduce(g))return;var b=bk(g.pnr);if(!b)return;var P=planOf(g),fl=freeLeft(g);
  if(!confirm(z()?('減少 1 位？（從名單最後一位開始）\\n'+(fl>0?'名單期限前免費名額還有 '+fl+' 位，這一位不收手續費。':'已超過免費名額（或過了名單期限），這一位收退票手續費 NT$'+P.ref.toLocaleString()+'。')):'Remove one traveller?'))return;""")
rep("""  if(chd)g.children--;else g.adults--;g.pax--;g.reduced++;if(g.names)g.names.splice(i,1);
  var unit=chd?0.75:1,cut=Math.round(g.perSeat*unit);g.total=Math.max(0,g.total-cut);b.total=g.total;""",
"""  if(chd)g.children--;else g.adults--;g.pax--;g.reduced++;if(g.names)g.names.splice(i,1);var fee=0;if(fl>0)g.adj=(g.adj||0)+1;else fee=feeIn(g,'reduce',1,z()?'減少 1 位':'remove 1');
  var unit=chd?0.75:1,cut=Math.round(g.perSeat*unit);g.total=Math.max(0,g.total-cut);b.total=g.total;""")
rep("""  if(g.balance&&!g.balance.paid){g.balance.amount=Math.max(0,g.total-g.deposit.amount);b.balanceDue=g.balance.amount;var c=charge(g.balance.chargeId);if(c&&c.status==='unpaid'){try{window.kgmVoidChargeR45(c.id)}catch(_){}var ch=null;try{ch=window.kgmCreateChargeR45({pnr:g.pnr,items:[{label:'Group balance · '+g.id,amount:g.balance.amount}],note:(z()?'團體尾款（減少人數後重開），請於 ':'Group balance due ')+g.due.balance+(z()?' 前付清':'')})}catch(_){}g.balance.chargeId=ch&&ch.charge&&ch.charge.id;g.balance.token=ch&&ch.charge&&ch.charge.token}}
  log(g,'減少 1 位（剩 '+g.pax+' 位，已減 '+g.reduced+'/'+RED+'）');mail('group.reduced',g,{message:(z()?'團體人數減為 '+g.pax+' 位，尾款更新為 '+M(g.balance.amount,g.curr):'Group size reduced.')});""",
"""  if(g.balance&&!g.balance.paid)rebal(g,b,z()?'減少人數':'size change');else if(fee>0)rebal(g,b,z()?'減少人數手續費':'fee');
  log(g,'減少 1 位（剩 '+g.pax+' 位'+(fee?'，退票手續費 NT$'+fee.toLocaleString():'，免費名額已用 '+(g.adj||0)+'/'+P.free)+'）');mail('group.reduced',g,{message:(z()?'團體人數減為 '+g.pax+' 位'+(fee?'（收退票手續費 NT$'+fee.toLocaleString()+'）':'（免手續費）')+'，尾款更新為 '+M(g.balance.amount,g.curr):'Group size reduced.')});""")
# 加人＋每位艙等
rep("""/* ── ⑤⑦ 尾款、提醒、逾期、開票（一人一 PNR） ── */""",
"""/* 加 1 位：每一段（自營）這一艙要有空位；名單期限前在免費名額內不收手續費，超過收改票手續費 */
window.kgmGrpAddR1026C=function(id){var g=G().filter(function(x){return x.id===id})[0];if(!g||!canAdd(g))return;var b=bk(g.pnr);if(!b)return;var P=planOf(g),fl=freeLeft(g);
  var lack=[];segsOf(b).forEach(function(s){if(isPartner26(s))return;var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];if(!f)return;var cab=(FARES[s.cls]||{}).cabin||g.cabin;if(seatsLeft(Object.assign({},f,{date:s.date}),s.date,cab)<1)lack.push(s.code+' '+s.date)});
  if(lack.length){S.grpMsgR1025B=(z()?'今天這些航段已經沒有空位，不能加人：':'No seats on: ')+lack.join('、');try{render()}catch(_){}return}
  if(!confirm(z()?('加 1 位成人？'+(fl>0?'（名單期限前免費名額還有 '+fl+' 位，不收手續費）':'（已超過免費名額或過了名單期限，收改票手續費 NT$'+P.chg.toLocaleString()+'）')+'\\n票價每位約 '+M(g.perSeat,g.curr)+'，加進尾款。'):'Add one adult?'))return;
  var i=g.adults;b.paxList.splice(i,0,{title:'',lastName:'TBA',firstName:'ADT'+('0'+(g.pax+1)).slice(-2),passengerType:'ADT',groupNameTbaR1023A:true});if(g.names)g.names.splice(i,0,{});
  g.adults++;g.pax++;g.added=(g.added||0)+1;var fee=0;if(fl>0)g.adj=(g.adj||0)+1;else fee=feeIn(g,'add',1,z()?'加 1 位':'add 1');
  g.total+=g.perSeat;b.total=g.total;b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  rebal(g,b,z()?'加人':'add');log(g,'加 1 位（共 '+g.pax+' 位'+(fee?'，改票手續費 NT$'+fee.toLocaleString():'，免費名額已用 '+(g.adj||0)+'/'+P.free)+'）；請重新整團劃位');
  mail('group.pax_added',g,{message:(z()?'團體人數增為 '+g.pax+' 位'+(fee?'（收改票手續費 NT$'+fee.toLocaleString()+'）':'（免手續費）')+'，尾款更新為 '+M(g.balance.amount,g.curr)+'；新增的旅客請補名單並重新劃位。':'Traveller added.')});
  S.grpMsgR1025B=(z()?'✓ 已加 1 位，共 ':'✓ Now ')+g.pax+(z()?' 位；請重新整團劃位':'');save1();try{render()}catch(_){}};
/* 每位旅客艙等可以不一樣（使用者：「每位旅客艙等可以不一樣」）：名單頁選別的艙等 → 這位旅客拆成自己的訂位（同團、同方案、那一艙的團體代號），
   每一段（自營）那一艙要有空位；差額＝那一艙團體價 − 原本每位，加進（或扣掉）尾款；座位在新艙等自動劃。 */
window.kgmGrpCabinR1026C=function(id,i,cab){var g=G().filter(function(x){return x.id===id})[0];if(!g||/ticketed|cancelled/.test(g.status))return;var b=bk(g.pnr);if(!b)return;
  var r=(g.names||[])[i]||{};if(!r.last||!r.first){S.grpMsgR1025B=z()?'請先填好這位旅客的姓名、儲存名單，再改艙等。':'Save the name first.';try{render()}catch(_){}return}
  if(g.pax<=1){return}var P=planOf(g),nc=gcode(cab,P.k);if(!nc){return}
  var segs=segsOf(b),lack=[],diff=0;segs.forEach(function(s){if(isPartner26(s))return;var f=[].concat(FLIGHTS,S.customFlights||[]).filter(function(x){return x&&x.code===s.code&&x.fr===s.fr&&x.to===s.to})[0];if(!f)return;if(seatsLeft(Object.assign({},f,{date:s.date}),s.date,cab)<1)lack.push(s.code);diff+=priceOf(g,s,nc)});
  if(lack.length){S.grpMsgR1025B=(z()?CABZ[cab]+'沒有空位：':'No seats: ')+lack.join('、');try{render()}catch(_){}return}
  var chd=i>=g.adults,unit=chd?0.75:1,old=Math.round(g.perSeat*unit),nw=Math.round(diff*unit),d=nw-old;
  if(!confirm(z()?(r.last+'/'+r.first+' 改成'+CABZ[cab]+'？\\n'+CABZ[cab]+'團體價約 '+M(nw,g.curr)+'，差額 '+(d>=0?'+':'')+M(d,g.curr)+'（加進尾款）。這位旅客會拆成自己的訂位代號。'):'Move to '+cab+'?'))return;
  var p=b.paxList[i];var c=JSON.parse(JSON.stringify(b));var np='';try{np=genPNR()}catch(_){np='G'+String(Date.now()).slice(-5)}
  c.pnr=np;c.paxList=[p];c.seats={};c.total=nw;c.balanceDue=0;c.passengerCounts={adults:chd?0:1,children:chd?1:0,infants:0};c.seatPassengerCount=1;c.search=Object.assign({},c.search,{adults:chd?0:1,children:chd?1:0,infants:0,pax:1,cabin:cab});
  if(c.outC)c.outC=nc;if(c.inbC)c.inbC=nc;(c.mcFlights||[]).forEach(function(m){if(m)m.c=nc});c.segmentFare0826A=null;c.groupR1025B={id:g.id,plan:P.k,master:g.pnr,cabinMove:1};c.status='confirmed';
  b.paxList.splice(i,1);Object.keys(b.seats||{}).forEach(function(k){var ks=Object.keys(b.seats[k]||{});if(ks.length>i)delete b.seats[k][ks[i]]});g.names.splice(i,1);if(chd)g.children--;else g.adults--;g.pax--;
  b.seatPassengerCount=g.pax;b.passengerCounts={adults:g.adults,children:g.children,infants:g.infants};b.search=Object.assign({},b.search,{adults:g.adults,children:g.children,pax:g.pax});
  S.bookings.push(c);g.moved=g.moved||[];g.moved.push({pnr:np,name:r.last+'/'+r.first,type:chd?'CHD':'ADT',cab:cab,code:nc,amount:nw,at:new Date().toISOString(),names:r});
  g.total+=d;b.total=Math.max(0,b.total-old);rebal(g,b,z()?'艙等調整':'cabin change');
  try{seatOne(c,cab)}catch(_){}
  log(g,r.last+'/'+r.first+' 改'+CABZ[cab]+'（訂位 '+np+'，差額 '+M(d,g.curr)+'）');S.grpMsgR1025B=(z()?'✓ ':'✓ ')+r.last+'/'+r.first+(z()?' 已改'+CABZ[cab]+'，訂位代號 '+np:' moved to '+cab);save1();try{render()}catch(_){}};
function seatOne(c,cab){segsOf(c).forEach(function(s){if(isPartner26(s))return;var t='';try{t=acftOfFlight(s.code,s.date,s.fr,s.to)}catch(_){}var taken={};try{Object.assign(taken,simSeatMap(s.code,s.date)||{})}catch(_){}try{Object.assign(taken,realTakenSeats0814(Object.assign({},s,{acft:t}),c.pnr)||{})}catch(_){}
  var sec=sectionsOf(t).filter(function(x){return x.name===cabName(cab)})[0];if(!sec)return;var pick=null;(sec.rows||[]).some(function(r){return (r.cells||[]).some(function(x){if(x&&!x.aisle&&x.id&&!taken[x.id]){pick=x.id;return true}return false})});if(pick){c.seats[s.key]={};c.seats[s.key][pick]=true}})}

/* ── ⑤⑦ 尾款、提醒、逾期、開票（一人一 PNR） ── */""")
# 開票：拆出去的（改艙等）一起開票
rep("""    c.search=Object.assign({},c.search,{adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0,pax:1});c.ticketNumber=c.paxList[0].ticketR1023A;c.ticket=c.ticketNumber;c.groupR1025B={id:g.id,feeMul:FEE,master:g.pnr,index:i};c.bookedAt=b.bookedAt;c.status='confirmed';""",
    """    c.search=Object.assign({},c.search,{adults:unit===1?1:0,children:unit===1?0:1,infants:inf?1:0,pax:1});c.ticketNumber=c.paxList[0].ticketR1023A;c.ticket=c.ticketNumber;c.groupR1025B={id:g.id,plan:g.plan||'U',master:g.pnr,index:i};c.bookedAt=b.bookedAt;c.status='confirmed';""")
rep("""  b.status='cancelled';b.cancelledAt=T();b.splitR1025B={at:new Date().toISOString(),into:pnrs.map(function(x){return x.pnr})};b.groupReleasedR1023A=false;""",
    """  (g.moved||[]).forEach(function(m){var c=bk(m.pnr);if(!c||c.status==='cancelled')return;var tn=tno();(c.paxList||[]).forEach(function(p){p.ticketR1023A=tn});c.ticketNumber=tn;c.ticket=tn;pnrs.push({pnr:m.pnr,name:m.name,ticket:tn,seat:Object.keys(c.seats||{}).map(function(k){return Object.keys(c.seats[k]||{})[0]||''}).join(' '),cab:m.cab})});
  b.status='cancelled';b.cancelledAt=T();b.splitR1025B={at:new Date().toISOString(),into:pnrs.map(function(x){return x.pnr})};b.groupReleasedR1023A=false;""")
rep("""  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;if(!g.balance.paid||namesDone(g)<g.pax)return false;""",
    """  if(g.kind!=='v25'||g.status==='ticketed'||g.status==='cancelled')return false;if(!g.balance.paid||namesDone(g)<g.pax)return false;if(g.pax<1&&!(g.moved||[]).length)return false;""")
rep("""      if(c&&c.status==='paid'){g.balance.paid=true;g.balance.paidAt=c.paidAt||new Date().toISOString();g.status='paid';""",
    """      if(c&&c.status==='paid'){g.balance.paid=true;g.balance.amountPaid=g.balance.amount;g.balance.paidAt=c.paidAt||new Date().toISOString();g.status='paid';""")

# ── 6 手續費：團體代號本身就是方案手續費（changeFeeOf／refundPolicyOf 讀票價表）；不再 × 0.75 ──
rep("""  var C=window.changeFeeOf;if(typeof C==='function'&&!C.__grp25){var w=function(k){var v=C.apply(this,arguments),b=window.__grp25raw?null:curBk();if(b&&b.groupR1025B&&v>0)return Math.round(v*FEE);return v};""",
    """  var C=window.changeFeeOf;if(typeof C==='function'&&!C.__grp25){var w=function(k){if(isG(k))return planOf(k).chg;return C.apply(this,arguments)};   /* 1026C：團體代號（Q／U）＝方案改票費（底下 familyR48 那層會換成基本／超值的費用） */""")
rep("""  var R=window.refundPolicyOf;if(typeof R==='function'&&!R.__grp25){var w2=function(k){var v=R.apply(this,arguments),b=window.__grp25raw?null:curBk();if(b&&b.groupR1025B&&v&&v.fee>0)return Object.assign({},v,{fee:Math.round(v.fee*FEE),groupR1025B:1});return v};""",
    """  var R=window.refundPolicyOf;if(typeof R==='function'&&!R.__grp25){var w2=function(k){if(isG(k))return {allowed:true,fee:planOf(k).ref,groupR1025B:1};return R.apply(this,arguments)};""")
rep("""function feeTxt(cab){var f=fam()||{},v=f[cab]&&f[cab].Value&&f[cab].Value[0],c=null,r=null;window.__grp25raw=1;   /* 跟改票／退票實際扣的同一支（changeFeeOf、refundPolicyOf），乘 0.75 */
  try{c=window.changeFeeOf(v);var p=window.refundPolicyOf(v);r=p&&p.allowed?p.fee:null}catch(_){}finally{window.__grp25raw=0}
  var t=function(x){return x==null?(z()?'不可':'n/a'):(x===0?(z()?'免費':'free'):'TWD '+Math.round(x*FEE).toLocaleString())};
  return (z()?'改票每航段 ':'Change/sector ')+(c<0?(z()?'不可':'n/a'):t(c))+(z()?'・退票 ':' · Refund ')+t(r)}""",
"""function feeTxt(g){var P=planOf(g);return (z()?'改票每人 NT$':'Change NT$')+P.chg.toLocaleString()+(z()?'・退票每人 NT$':' · refund NT$')+P.ref.toLocaleString()}""")

# ── 7 選航班頁票價卡：Q／U 本身就是方案卡，只加一行方案重點 ──
rep("""    /* 選航班頁的票價卡（article.k929-fare）：其他方案（售完）收起來；「超值 Value」那張改寫成「團體」、手續費寫 × 0.75 之後的金額 */
    [].forEach.call(document.querySelectorAll('#app article.k929-fare'),function(el){if(el.getAttribute('data-g25'))return;el.setAttribute('data-g25','1');
      if(el.classList.contains('sold')){el.style.display='none';return}
      var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false),n,L=[];while((n=w.nextNode()))L.push(n);
      L.forEach(function(n){var v=n.nodeValue;if(/超值|Value/.test(v))n.nodeValue=v.replace(/超值/g,'團體').replace(/\\bValue\\b/g,'Group');
        var row=n.parentElement&&n.parentElement.parentElement,rt=row?row.textContent:'';
        if(/NT\\$\\s?[\\d,]+/.test(v)&&/改票|退票|手續費|櫃檯/.test(rt))n.nodeValue=n.nodeValue.replace(/NT\\$\\s?([\\d,]+)/g,function(m,x){return 'NT$'+Math.round(+x.replace(/,/g,'')*FEE).toLocaleString()})});
      var pr=[].filter.call(el.querySelectorAll('*'),function(e){return e.children.length===0&&/含稅/.test(e.textContent)})[0];
      if(pr&&!el.querySelector('.k25g-fare-tag')){var t=document.createElement('div');t.className='k25g-fare-tag';t.textContent=z()?'團體價：本艙一般最低價 −5%・改票／退票手續費 × 0.75':'Group fare: lowest public fare −5% · fees × 0.75';pr.parentNode.insertBefore(t,pr.nextSibling)}})}catch(_){}}""",
"""    /* 選航班頁的票價卡（article.k929-fare）：其他方案（售完）收起來；團體優惠 Q／團體彈性 U 各一張，價格下面加一行方案重點 */
    [].forEach.call(document.querySelectorAll('#app article.k929-fare'),function(el){if(el.getAttribute('data-g25'))return;el.setAttribute('data-g25','1');
      if(el.classList.contains('sold')){el.style.display='none';return}
      var bt=el.querySelector('button[onclick*="pickFare("]'),m=bt?String(bt.getAttribute('onclick')).match(/'([A-Z]-[QU])'/):null,P=m?planOf(m[1]):null;if(!P)return;
      var pr=[].filter.call(el.querySelectorAll('*'),function(e){return e.children.length===0&&/含稅/.test(e.textContent)})[0];
      if(pr&&!el.querySelector('.k25g-fare-tag')){var t=document.createElement('div');t.className='k25g-fare-tag';
        t.textContent=z()?(P.zh+'：名單出發前 '+P.names+' 天・尾款出發前 '+P.bal+' 天・名單前 ±'+P.free+' 位免手續費・改票每人 NT$'+P.chg.toLocaleString()+'／退票每人 NT$'+P.ref.toLocaleString()+(P.upg?'・可申請哩程升等':'')):(P.en+': names '+P.names+'d · balance '+P.bal+'d · ±'+P.free+' free');pr.parentNode.insertBefore(t,pr.nextSibling)}})}catch(_){}}""")

# ── 8 前台「我的團體訂位」：方案、增減、每位艙等；舊版（1023A 報價制）拿掉 ──
rep("""+'<div class="k25box rules"><small>'+(z()?'團體票規':'Fare rules')+'</small><ul><li>'+(z()?'改票／退票手續費：「超值」× 0.75（':'Fees ×0.75 (')+E(feeTxt(g.cabin))+(z()?'，每段每位）':')')+'</li><li>'+(z()?'名單期限前可減少 '+RED+' 位（已減 '+g.reduced+'）':'Reduce up to '+RED)+'</li><li>'+(z()?'訂金不退；尾款逾期自動取消':'Deposit non-refundable')+'</li><li>'+(z()?'開票後一人一個 PNR':'One PNR per traveller')+'</li></ul></div></aside""",
    """+'<div class="k25box rules"><small>'+(z()?'團體票規・':'Fare rules · ')+E(z()?planOf(g).zh+' '+planOf(g).k:planOf(g).en)+'</small><ul><li>'+E(feeTxt(g))+'</li><li>'+(z()?'名單期限前 ±'+planOf(g).free+' 位免手續費（已用 '+(g.adj||0)+'）；超過每位收手續費':'±'+planOf(g).free+' free before names')+'</li><li>'+(z()?'訂金不退；尾款逾期自動取消':'Deposit non-refundable')+'</li><li>'+(z()?'不能網路報到：出發當日由領隊或全體旅客到櫃檯辦理':'Airport check-in only')+'</li><li>'+(z()?'開票後到起飛前 72 小時可付費選位；座位保留到起飛前 60 分鐘':'Paid seats until 72h; seats held until 60 min')+'</li><li>'+(z()?'開票後一人一個 PNR':'One PNR per traveller')+'</li></ul></div></aside""")
rep("""function list(){var u=me(),L=G().filter(function(g){return g.kind==='v25'&&u&&g.userId===u.id});var old=G().filter(function(g){return g.kind!=='v25'&&u&&g.contact&&String(g.contact.email||'').toLowerCase()===String(u.email||'').toLowerCase()});""",
    """function list(){var u=me(),L=G().filter(function(g){return g.kind==='v25'&&u&&g.userId===u.id});""")
rep("""    +(old.length?'<p class="k25g-p">'+(z()?'1023A 舊版團體申請：':'Earlier requests: ')+old.map(function(g){return E(g.id)+'（'+E(g.status)+'）'}).join('、')+'</p>':'')+'</div>'}""","""+'</div>'}""")
# 名單：艙等欄
rep("""      +'<td><select id="k25gNG'+i+'" class="inp"><option value=""></option><option'+(r.gender==='M'?' selected':'')+' value="M">M</option><option'+(r.gender==='F'?' selected':'')+' value="F">F</option></select></td><td><input id="k25gND'+i+'" class="inp" value="'+E(r.dob||'')+'" placeholder="1990-05-20"></td><td><input id="k25gNP'+i+'" class="inp" value="'+E(r.passport||'')+'"></td></tr>'}""",
    """      +'<td><select id="k25gNG'+i+'" class="inp"><option value=""></option><option'+(r.gender==='M'?' selected':'')+' value="M">M</option><option'+(r.gender==='F'?' selected':'')+' value="F">F</option></select></td><td><input id="k25gND'+i+'" class="inp" value="'+E(r.dob||'')+'" placeholder="1990-05-20"></td><td><input id="k25gNP'+i+'" class="inp" value="'+E(r.passport||'')+'"></td>'
      +'<td>'+(g.status==='ticketed'?E(cab25(g.cabin)):'<select class="inp" onchange="if(this.value!==\\''+g.cabin+'\\')kgmGrpCabinR1026C(\\''+A(g.id)+'\\','+i+',this.value)">'+['Economy','Premium','Business'].filter(function(cb){return GC[cb]}).map(function(cb){return '<option value="'+cb+'"'+(cb===g.cabin?' selected':'')+'>'+E(cab25(cb))+'</option>'}).join('')+'</select>')+'</td></tr>'}
  var mv=(g.moved||[]).length?'<div class="k25g-moved"><b>'+(z()?'已改艙等（各自的訂位代號）':'Moved to another cabin')+'</b>'+(g.moved||[]).map(function(m){return '<span>'+E(m.name)+' · '+E(cab25(m.cab))+' · <i class="mono">'+E(m.pnr)+'</i></span>'}).join('')+'</div>':'';""")
rep("""+'<div class="k25g-scroll"><table class="k25g-t k25g-names"><thead><tr><th>#</th><th>'+(z()?'姓 Last':'Last')+'</th><th>'+(z()?'名 First':'First')+'</th><th>'+(z()?'性別':'Sex')+'</th><th>'+(z()?'生日':'DOB')+'</th><th>'+(z()?'護照號碼':'Passport')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'""",
    """+'<div class="k25g-scroll"><table class="k25g-t k25g-names"><thead><tr><th>#</th><th>'+(z()?'姓 Last':'Last')+'</th><th>'+(z()?'名 First':'First')+'</th><th>'+(z()?'性別':'Sex')+'</th><th>'+(z()?'生日':'DOB')+'</th><th>'+(z()?'護照號碼':'Passport')+'</th><th>'+(z()?'艙等':'Cabin')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+mv""")
rep("""    +(canReduce(g)?'<div class="k25g-reduce"><b>'+(z()?'減少人數':'Reduce')+'</b><span>'+(z()?'名單期限前最多可減少 '+RED+' 位（已減 '+g.reduced+' 位）；從最後一位開始，尾款依少掉的人數扣掉，訂金不退。':'')+'</span><button type="button" class="k25g-btn ghost" onclick="kgmGrpReduceR1025B(\\''+A(g.id)+'\\')">'+(z()?'減少 1 位':'Remove 1')+'</button></div>':'');""",
    """    +(canReduce(g)||canAdd(g)?'<div class="k25g-reduce"><b>'+(z()?'增減人數':'Group size')+'</b><span>'+(z()?(freeLeft(g)>0?'名單期限（'+g.due.names+'）前還有 '+freeLeft(g)+' 位免手續費的增減名額（'+planOf(g).zh+' ±'+planOf(g).free+'）；':'免費名額已用完或過了名單期限；')+'超過的每一位：加人收改票費 NT$'+planOf(g).chg.toLocaleString()+'、減人收退票費 NT$'+planOf(g).ref.toLocaleString()+'。加人要看當天的空位。':'')+'</span>'
      +(canAdd(g)?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpAddR1026C(\\''+A(g.id)+'\\')">'+(z()?'加 1 位':'Add 1')+'</button>':'')+(canReduce(g)?'<button type="button" class="k25g-btn ghost" onclick="kgmGrpReduceR1025B(\\''+A(g.id)+'\\')">'+(z()?'減少 1 位':'Remove 1')+'</button>':'')+'</div>':'');""")
rep("""'<p class="k25g-p">'+(z()?'一位旅客一個 PNR，可在「行程管理」用各自的 PNR 與姓氏報到、選位、改票（手續費 × 0.75）。':'One PNR per traveller.')+'</p>""",
    """'<p class="k25g-p">'+(z()?'一位旅客一個 PNR，可在「行程管理」用各自的 PNR 查詢、付費選位（到起飛前 72 小時）、改票（'+E(feeTxt(g))+'）；報到請出發當日到機場櫃檯辦理。':'One PNR per traveller.')+'</p>""")
rep("""'<p class="k25g-p">'+(z()?'團體方案：本艙一般最低價 −5%；PNR ':'Group fare; PNR ')+E(g.pnr)+(z()?'（開票前是整團一筆）。':'.')+'</p>'""",
    """'<p class="k25g-p">'+(z()?planOf(g).zh+'（'+planOf(g).k+'）；PNR ':planOf(g).en+'; PNR ')+E(g.pnr)+(z()?'（開票前是整團一筆）。':'.')+'</p>'""")
# 前台未綁定頁：方案說明、申請中狀態
rep("""      +'<ul><li><b>−5%</b><span>'+(z()?'本艙一般最低價再少 5%':'Below the lowest public fare')+'</span></li><li><b>10%</b><span>'+(z()?'訂金，尾款出發前 14 天':'Deposit; balance 14 days out')+'</span></li><li><b>14 '+(z()?'天':'d')+'</b><span>'+(z()?'名單出發前 14 天提供，可減 3 位':'Names 14 days out')+'</span></li><li><b>1:1</b><span>'+(z()?'開票一人一個 PNR':'One PNR each')+'</span></li></ul></div>'""",
    """      +'<ul><li><b>Q</b><span>'+(z()?'團體優惠：名單 28 天、尾款 21 天前，±3 位免手續費':'Group Saver')+'</span></li><li><b>U</b><span>'+(z()?'團體彈性：名單 14 天、尾款 7 天前，±6 位免手續費':'Group Flex')+'</span></li><li><b>10%</b><span>'+(z()?'訂金':'Deposit')+'</span></li><li><b>1:1</b><span>'+(z()?'開票一人一個 PNR':'One PNR each')+'</span></li></ul></div>'""")
rep("""  var w=function(){var a=acct();
    if(!S.user||!a)return""","""  var w=function(){var a=acct(),ax=acctAny();
    if(S.user&&!a&&ax&&ax.status!=='revoked')return '<div class="k25g"><section class="k25bind"><div><small>GROUP TRAVEL</small><h1>'+(z()?'團體訂位':'Group booking')+'</h1><p>'+E(ax.company)+' · '+(z()?'案件 ':'Case ')+E(ax.caseNo||'')+'</p></div><div class="k25bind-c"><b>'+(ax.status==='pending'?(z()?'申請審核中':'Awaiting approval'):(z()?'目前不在開放期間':'Outside the booking period'))+'</b><p>'+(ax.status==='pending'?(z()?'AI 客服已核對您的資料，KGM 團體業務核准並設定開放期間後會寄信通知您。':'We will email you once approved.'):(z()?'開放期間 '+E(ax.from||'—')+' ～ '+E(ax.to||'不限')+'。需要延長請聯絡 KGM 團體業務。':'Contact the group desk to extend.'))+'</p></div></section></div>';
    if(!S.user||!a)return""")
# 後台：帳號核准／新增用戶；拿掉舊版報價制
rep("""  var accts=(S.users||[]).filter(function(u){return u&&u.groupAccountR1025B});""",
"""  var accts=(S.users||[]).filter(function(u){return u&&u.groupAccountR1025B}),pend=accts.filter(function(u){return u.groupAccountR1025B.status==='pending'});
  var dd=AD(td,365),acform='<div class="k27ga"><div class="k27ga-h"><b>'+(z()?'團體帳號':'Group accounts')+'</b><span>'+(z()?'待核准 ':'Pending ')+pend.length+' · '+(z()?'使用中 ':'Active ')+accts.filter(function(u){return openNow(u.groupAccountR1025B)}).length+'</span>'
      +'<button type="button" class="k25g-btn'+(S.k27gaTab==='add'?'':' ghost')+'" onclick="S.k27gaTab=S.k27gaTab===\\'add\\'?\\'\\':\\'add\\';render()">'+(z()?'＋ 新增用戶（設定開放期間）':'＋ Add user')+'</button></div>'
    +(S.k27gaTab==='add'?'<div class="k27ga-f"><label>'+(z()?'會員編號或 Email':'Member ID / email')+'<input id="k27gU" class="inp"></label><label>'+(z()?'名稱':'Company')+'<input id="k27gC" class="inp"></label><label>'+(z()?'類型':'Type')+'<select id="k27gT" class="inp">'+TYPES.map(function(t){return '<option value="'+t[0]+'">'+E(z()?t[1]:t[2])+'</option>'}).join('')+'</select></label><label>'+(z()?'統一編號':'Tax ID')+'<input id="k27gX" class="inp" maxlength="8"></label><label>'+(z()?'旅行業執照（旅行社）':'Licence')+'<input id="k27gL" class="inp"></label><label>'+(z()?'聯絡人':'Contact')+'<input id="k27gN" class="inp"></label><label>'+(z()?'電話':'Phone')+'<input id="k27gP" class="inp"></label><label>'+(z()?'開放期間：從':'From')+'<input id="k27gF" type="date" class="inp" value="'+td+'"></label><label>'+(z()?'到':'To')+'<input id="k27gE" type="date" class="inp" value="'+dd+'"></label>'
      +'<button type="button" class="k25g-btn" onclick="(function(){var v=function(i){return String((document.getElementById(i)||{}).value||\\'\\').trim()};var r=kgmGrpAddUserR1026C(v(\\'k27gU\\'),{company:v(\\'k27gC\\'),type:v(\\'k27gT\\'),taxId:v(\\'k27gX\\'),license:v(\\'k27gL\\'),contact:v(\\'k27gN\\'),phone:v(\\'k27gP\\'),from:v(\\'k27gF\\'),to:v(\\'k27gE\\')});S.grp25AdmMsg=r===\\'ok\\'?\\''+(z()?'✓ 已新增團體用戶':'Added')+'\\':r===\\'nouser\\'?\\''+(z()?'找不到這個會員':'No such member')+'\\':\\''+(z()?'請填名稱與正確的統一編號':'Company and valid tax ID required')+'\\';if(r===\\'ok\\')S.k27gaTab=\\'\\';render()})()">'+(z()?'新增並開放':'Add')+'</button></div>':'')
    +(pend.length?'<div class="k27ga-p">'+pend.map(function(u){var x=u.groupAccountR1025B;return '<div class="k27ga-r"><div><b>'+E(x.company)+'</b><small>'+E(typeName(x.type))+' · '+(z()?'統編 ':'Tax ')+E(x.taxId)+(x.license?' · '+E(x.license):'')+' · '+E(x.contact&&x.contact.name||'')+' '+E(x.contact&&x.contact.phone||'')+' · '+E(u.email||'')+' · '+E(x.caseNo||'')+'</small></div>'
      +'<label>'+(z()?'從':'From')+'<input id="k27gaF'+E(u.id)+'" type="date" class="inp" value="'+td+'"></label><label>'+(z()?'到':'To')+'<input id="k27gaE'+E(u.id)+'" type="date" class="inp" value="'+dd+'"></label>'
      +'<button type="button" class="k25g-btn" onclick="kgmGrpApproveR1026C(\\''+A(u.id)+'\\',document.getElementById(\\'k27gaF'+A(u.id)+'\\').value,document.getElementById(\\'k27gaE'+A(u.id)+'\\').value);S.grp25AdmMsg=\\''+(z()?'✓ 已核准':'Approved')+'\\';render()">'+(z()?'核准開放':'Approve')+'</button><button type="button" class="k25g-btn ghost" onclick="kgmGrpAdmR1025B(\\'unbind\\',\\''+A(u.id)+'\\')">'+(z()?'不核准':'Decline')+'</button></div>'}).join('')+'</div>':'')+'</div>';""")
rep("""  return '<section class="k25gd"><header><div><small>GROUP DESK</small><b>'+(z()?'團體訂位':'Group bookings')+'</b></div><span>'+(z()?'團體帳號經前台 AI 客服核對、綁定；訂位走一般訂票流程（團體方案：一般最低價 −5%、訂金 10%、尾款與名單出發前 14 天、名單前可減 3 位、開票一人一 PNR、改退費 × 0.75）。':'')+'</span></header>'""",
    """  return '<section class="k25gd"><header><div><small>GROUP DESK</small><b>'+(z()?'團體訂位':'Group bookings')+'</b></div><span>'+(z()?'團體帳號經前台 AI 客服核對、團體業務核准開放期間；訂位走一般訂票流程，兩個方案：團體優惠 Q（名單 28／尾款 21 天前、±3 位、改 1,400／退 2,600）、團體彈性 U（名單 14／尾款 7 天前、±6 位、改 600／退 1,500）。規章 KGM-GRP-021。':'')+'</span></header>'+acform""")
rep("""    var old=G().some(function(g){return g.kind!=='v25'});
    return '<div class="k23gp">'+admDesk()+(old?'<details class="k25gd-old"><summary>'+(z()?'1023A 舊版團體申請（報價制）':'Earlier quote-based requests')+'</summary>'+(window.kgmGroupDeskHtmlR1023A?window.kgmGroupDeskHtmlR1023A():'')+'</details>':'')+'</div>'};""",
    """    return '<div class="k23gp">'+admDesk()+'</div>'};   /* 1026C：1023A 舊版團體申請（報價制）拿掉（使用者：「1023A 舊版團體申請（報價制）可移除」） */""")
rep("""<td>'+g.segs.slice(0,3).map(""","""<td>'+E(planOf(g).k)+' · '+g.segs.slice(0,3).map(""")
# CSS
rep("""var CSS='[data-g25hide]{display:none!important}'""","""var CSS='[data-g25hide]{display:none!important}'
  +'.k27ga{border:1px solid #E4E9E6;border-radius:14px;padding:12px 14px;margin:12px 0;background:#FBFCFB}.k27ga-h{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.k27ga-h b{font-size:14px;color:#0F2A21}.k27ga-h span{color:#66726C;font-size:12px;flex:1}'
  +'.k27ga-f{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:10px;align-items:end}.k27ga-f label,.k27ga-r label{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:#55605B}'
  +'.k27ga-r{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;border-top:1px solid #EEF2EF;padding-top:10px;margin-top:10px}.k27ga-r>div{flex:1;min-width:240px}.k27ga-r small{display:block;color:#66726C;font-size:11.5px;margin-top:2px}'
  +'.k25g-moved{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px}.k25g-moved span{background:#F2F6F4;border-radius:999px;padding:3px 10px}'""")
rep("""    +ac+'</section>'}""","""    +'</section>'}""")
open('js/grp25_27.js','w',encoding='utf-8').write(s)
print('ok',len(s))

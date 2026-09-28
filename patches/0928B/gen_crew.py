import json
out=[]
def RL(label,layer,old,new,cnt=1):
    out.append('RL(%s,%s,%s,%s,%d);'%(json.dumps(label),json.dumps(layer),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
def R(label,old,new,cnt=1):
    out.append('R(%s,%s,%s,%d);'%(json.dumps(label),json.dumps(old,ensure_ascii=False),json.dumps(new,ensure_ascii=False),cnt))
L='kgm-0903b-r121'
hdr='''/* 0928B · 組員班表（使用者第 11 點）—— r121 排班引擎本身加三件事：
   ① 不能排班的日子（核准的請假＋後台指定移除的日期區間）：eligible() 一律不派；
      外站的人請假期間不調位回台北，請假結束隔天才以旅客身分（DH）或原本身分飛回來；
      工作量自然由其他符合法規（休息、位置、每週一日全休、月飛時）的人接手 —— 替補一樣過同一套 eligible()。
   ② 同城機場可以互換：TPE/TSA、NRT/HND、KIX/UKB、ICN/GMP、PVG/SHA、LAX/ONT、HKG/MFM、BKK/DMK。
      人在 NRT 可以接 HND 出發的班（例如去程 TPE–NRT、回程 HND–TSA）；班表上會多一段「地面轉場 NRT→HND」，
      位置連續性照樣接得起來，所有既有的連續性稽核不用改。
   ③ 指定（pin）：AI 換班核准後，某人某天固定飛某一班、其他班不能用他。 */
'''
RL('crew helpers',L,
"""function H(s){var h=5381,i;s=String(s||'');for(i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h}""",
"""function H(s){var h=5381,i;s=String(s||'');for(i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h}
/* 0928B：同城機場、不可排班日、指定班次 */
var CITY928={TPE:'TPE',TSA:'TPE',NRT:'TYO',HND:'TYO',KIX:'OSA',UKB:'OSA',ICN:'SEL',GMP:'SEL',PVG:'SHA',SHA:'SHA',LAX:'LAX',ONT:'LAX',HKG:'HKG',MFM:'HKG',BKK:'BKK',DMK:'BKK'};
var SIS928={};Object.keys(CITY928).forEach(function(a){Object.keys(CITY928).forEach(function(b){if(a!==b&&CITY928[a]===CITY928[b])(SIS928[a]=SIS928[a]||[]).push(b)})});
function sameCity928(a,b){return a===b||(!!CITY928[a]&&CITY928[a]===CITY928[b])}
window.kgmSameCityR928=sameCity928;window.KGM_CITY_R928=CITY928;
window.kgmCrewPinOkR928=function(id,date,f){var pn=pinOf928(date),v=pn&&pn[id];return !v||('|'+v+'|').indexOf('|'+f.code+'@'+f.fr+'|')>=0};   /* 0928B：其他層（r196 補人）也要看已公布／指定的班 */
function off928(id,date){try{return !!(window.kgmCrewOffR928&&window.kgmCrewOffR928(id,date))}catch(_){return false}}
function pinOf928(date){try{var fz=(S.crewFreezeR928||{})[date],pn=(S.crewPinR928||{})[date];if(!fz&&!pn)return null;return Object.assign({},fz||{},pn||{})}catch(_){return null}}   /* 0928B：已公布的班表先凍結（只改必要的人），AI 換班的指定優先 */""")
# eligible: off days + city
RL('crew eligible off',L,
"""  function eligible(p,f,rank,ignoreLocation){
    if(rank&&p.rank!==rank)return false;""",
"""  function eligible(p,f,rank,ignoreLocation){
    if(rank&&p.rank!==rank)return false;
    if(off928(p.empId,date)||(f.dd&&off928(p.empId,D(date,f.dd))))return false;   /* 0928B：請假／移除的日子不排 */
    if(PIN928&&PIN928[p.empId]&&('|'+PIN928[p.empId]+'|').indexOf('|'+f.code+'@'+f.fr+'|')<0)return false;   /* 0928B：已指定飛別班（航班號@出發站，一天可多段，用 | 分開） */""")
RL('crew eligible city',L,
"""    if(!ignoreLocation&&st.at!==f.fr&&!(st.initial&&p.virtualR121))return false;""",
"""    if(!ignoreLocation&&st.at!==f.fr&&!sameCity928(st.at,f.fr)&&!(st.initial&&p.virtualR121))return false;   /* 0928B：同城機場可接 */""")
# PIN map per day
RL('crew pin day',L,
"""  var TURN121={};""",
"""  var TURN121={};
  var PIN928=pinOf928(date);   /* 0928B：{empId: 'KX82@ATH|…'}，__OFF__＝已公布的休假日 */""")
# choose: sister stations + pinned first
RL('crew choose',L,
"""    var baseKey=fam121(f.type)+'|'+role,list=(localPeople[baseKey+'|'+f.fr]||[]).filter(function(p){return !used[p.empId]&&eligible(p,f,rank)});""",
"""    var baseKey=fam121(f.type)+'|'+role,list=(localPeople[baseKey+'|'+f.fr]||[]).concat.apply((localPeople[baseKey+'|'+f.fr]||[]),(SIS928[f.fr]||[]).map(function(s){return localPeople[baseKey+'|'+s]||[]})).filter(function(p){return !used[p.empId]&&eligible(p,f,rank)});   /* 0928B：同城機場的人也列入 */
    /* 0928B：指定飛這一班的人排最前面 */
    if(PIN928){var pinL=Object.keys(PIN928).filter(function(id){return ('|'+PIN928[id]+'|').indexOf('|'+f.code+'@'+f.fr+'|')>=0&&byId[id]&&byId[id].role===role&&!used[id]}).map(function(id){return byId[id]}).filter(function(p){return eligible(p,f,rank,true)&&(sameCity928(history(p).at,f.fr)||history(p).initial)});
      if(pinL.length){var pk={};pinL.forEach(function(p){pk[p.empId]=1});list=pinL.concat(list.filter(function(p){return !pk[p.empId]}))}}""")
# surface transfer when assigning from sister airport
RL('crew surface',L,
"""    pilots.concat(cabin).forEach(function(p){var st=history(p);if(st.initial&&p.virtualR121){st.at=f.fr;st.home=f.fr}st.initial=false;""",
"""    pilots.concat(cabin).forEach(function(p){var st=history(p);if(st.initial&&p.virtualR121){st.at=f.fr;st.home=f.fr}
      /* 0928B：人在同城的另一個機場 → 先記一段地面轉場，位置才接得上 */
      if(!st.initial&&st.at&&st.at!==f.fr&&sameCity928(st.at,f.fr)){try{
        var gtArr=f.depUTC-75,gtDep=gtArr-120,gt={date:date,dep:gtDep,report:gtDep,release:gtArr,block:0,code:'地面轉場',fr:st.at,to:f.fr,deadhead:true,surfaceR928:true};
        st.days.push(gt);
        var gk=[date,'GT',st.at,f.fr].join('|');S.crewPositioningR121=S.crewPositioningR121||{};
        var hm=function(u,ap){try{return (typeof hhmmLocalR913==='function')?hhmmLocalR913(u,ap):''}catch(_){return ''}};
        (S.crewPositioningR121[gk]=S.crewPositioningR121[gk]||[]).push({empId:p.empId,name:p.name,role:p.role,cabin:'—',seat:'',surfaceR928:true,
          flight:{code:'地面轉場',fr:st.at,to:f.fr,date:date,arrDate:date,dep:'',arr:'',depUTC:gtDep,arrUTC:gtArr,reportUTC:gtDep,releaseUTC:gtArr,dd:0,block:0,blockStr:'地面',acft:'—',type:'—',deadhead:true,operating:false,surfaceR928:true,remark:z()?'地面轉場（同城機場）':'Ground transfer (same city)'}});
      }catch(_){}}
      st.initial=false;""")
# reposition feasibility: no DH on off days
RL('crew dh off',L,
"""    function feasible(m,ready,path){return m.depUTC-60>=ready&&m.arrUTC+750<=report&&m.date<date&&!m.noPax""",
"""    function feasible(m,ready,path){return !off928(p.empId,m.date)&&m.depUTC-60>=ready&&m.arrUTC+750<=report&&m.date<date&&!m.noPax""")
# release home: city-aware + not during leave
RL('crew release',L,
"""  people.forEach(function(p){var st=DUTY121[p.empId];if(!st||st.initial||st.at==='TPE')return;""",
"""  people.forEach(function(p){var st=DUTY121[p.empId];if(!st||st.initial||sameCity928(st.at,'TPE')||off928(p.empId,date))return;   /* 0928B：回到台北（含松山）就不必調；請假中不調 */""")
RL('crew release cand',L,
"""var candidates=flights.filter(function(f){return f.fr===st.at&&f.to==='TPE'&&f.depUTC-60>=st.ready});""",
"""var candidates=flights.filter(function(f){return f.fr===st.at&&sameCity928(f.to,'TPE')&&f.depUTC-60>=st.ready});""")
RL('crew release after off',L,
"""keep=(nextNeed[k]||0);list.slice(keep).forEach(function(p){""",
"""keep=(nextNeed[k]||0);list.slice(keep).concat(list.slice(0,keep).filter(function(p){return off928(p.empId,D(date,-1))})).forEach(function(p){   /* 0928B：請假／移除剛結束、人還在外站又沒排到班 → 當天就以旅客身分回台北，不在外站空等 */""")
R('crew leave legacy off',
"""    var lst=(S.crewSched||{})[l.empId],removed=0,replaced=0;
    var me=(S.staff||[]).find(function(x){return x.empId===l.empId;});
    var myRoleR=me?me.role:null;
    if(lst){lst.forEach(function(x){""",
"""    var lst=(S.crewSched||{})[l.empId],removed=0,replaced=0;
    var me=(S.staff||[]).find(function(x){return x.empId===l.empId;});
    var myRoleR=me?me.role:null;
    /* 0928B：機師／客艙組員的班表是 r121 那一份，舊的 S.crewSched 早就不用了 —— 不能再照舊資料指派替補、發假的替補通知 */
    if(myRoleR==='pilot'||myRoleR==='cabin')lst=null;
    if(lst){lst.forEach(function(x){""")
RL('crew r196 pin a','kgm-0907A-r196',
"""for(var i=0;i<l.length;i++){var c=l[i];if((f.fr==='TSA'||f.to==='TSA')&&!c.tsa)continue;if(busyDays(c.empId)>=6)continue;l.splice(i,1);sub=c;break}""",
"""for(var i=0;i<l.length;i++){var c=l[i];if((f.fr==='TSA'||f.to==='TSA')&&!c.tsa)continue;if(busyDays(c.empId)>=6)continue;if(window.kgmCrewPinOkR928&&!window.kgmCrewPinOkR928(c.empId,date,f))continue;   /* 0928B：已公布休假或指定別班的人不能拿來補 */l.splice(i,1);sub=c;break}""")
RL('crew r196 pin b','kgm-0907A-r196',
"""            if(weekFull927D(c.empId,date))continue;   /* 0927D：每週一定有一整天不排班 */""",
"""            if(weekFull927D(c.empId,date))continue;   /* 0927D：每週一定有一整天不排班 */
            if(window.kgmCrewPinOkR928&&!window.kgmCrewPinOkR928(c.empId,date,f))continue;   /* 0928B：已公布休假或指定別班的人不能拿來補 */""")
open('p_e_crew.js','w').write(hdr+'\n'.join(out)+'\n')
snip=open('snip_crew.js').read()
RL('crew tools','kgm-0909E-r229',
"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""",
snip+"""try{console.log('KGM '+BUILD+' r229 loaded')}catch(_){}
})();""")
R('crew ai button',
"""        <button class="btn btn-g" onclick="doAICrewReschedule()">🤖 AI 自動排組員班表 60 天</button>
        <span style="font-size:11.5px;color:#667">航段制・長短程混排・落地點串接・依民航局規定：任 7 日內至少連續 30 小時休息・長程落地後隔天強制休</span>
      </div>""",
"""      </div>
      ${window.kgmCrewToolsR928?window.kgmCrewToolsR928():""}
      <div style="font-size:11px;color:#889;margin-top:10px">航段制・長短程混排・落地點串接（同城機場可互換）・依民航局規定：任 7 日內至少連續 30 小時休息・長程落地後隔天強制休・請假與移除的日子不排班</div>""")
R('crew leave decide',
"""    if(removed)logAct("請假自動移班",l.empName+" "+l.start+"~"+l.end+"("+removed+" 個航班改休,"+replaced+" 個已補人)");""",
"""    /* 0928B：組員請假 → 實際在用的 r121 班表重排：請假期間不排、工作量交給符合法規的人、有異動的人全部通知 */
    try{if(window.kgmCrewLeaveApplyR928&&window.kgmCrewLeaveApplyR928(l)){removed=0;replaced=0;l._crewAsync928=1}}catch(_e928){}
    if(removed)logAct("請假自動移班",l.empName+" "+l.start+"~"+l.end+"("+removed+" 個航班改休,"+replaced+" 個已補人)");""")
open('p_e_crew.js','w').write(hdr+'\n'.join(out)+'\n')
R('crew leave notify',
"""(removed?"，該區間 "+removed+" 個排班已移除"+(replaced?"("+replaced+" 個已安排替補)":"")+"。":""));""",
"""(removed?"，該區間 "+removed+" 個排班已移除"+(replaced?"("+replaced+" 個已安排替補)":"")+"。":"")+(l._crewAsync928?"　請假期間的航班由系統改派給符合法規的組員，班表異動另行通知。":""));""")
open('p_e_crew.js','w').write(hdr+'\n'.join(out)+'\n')

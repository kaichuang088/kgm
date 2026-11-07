import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 機場地勤（報到櫃檯、登機門、地勤班表） */
'''
# ---- #74 櫃檯開櫃：長程起飛前 3 小時、短程 2.5 小時（依最終目的地判斷長短程）；時刻用當季 ----
RL('ctr open by haul','kgm-0823o-r74',"""      partner:!!f.partner,open:((mn(f.dep)-150)%1440+1440)%1440,close:((mn(f.dep)-60)%1440+1440)%1440});""","""      partner:!!f.partner,
      /* 1004A：使用者：「長程起飛前 3 小時、短程 2.5 小時開櫃」；長短程依最終目的地（kgmHaulOfR928，第五航權看整趟終點）。起飛時間用當季時刻 */
      open:(function(){var d0=f.dep;try{var sf=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,date):f;if(sf&&sf.dep)d0=sf.dep}catch(_){}
        var L=false;try{L=!f.partner&&window.kgmHaulOfR928&&window.kgmHaulOfR928(f)==='L'}catch(_){}
        return ((mn(d0)-(L?180:150))%1440+1440)%1440})(),
      close:(function(){var d0=f.dep;try{var sf=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,date):f;if(sf&&sf.dep)d0=sf.dep}catch(_){}return ((mn(d0)-60)%1440+1440)%1440})()});""")
# ---- 查某一班的報到航廈與櫃檯（行程管理、登機證用） ----
RL('ctr of flight','kgm-0903b-r116',"    W.__r116=1;window.kgmCounterAllocR74=W;","""    W.__r116=1;window.kgmCounterAllocR74=W;
    /* 1004A：某一班在出發站的報到航廈、櫃檯號與開關櫃時間（整天 8 個時段掃一次，依 站｜日期 快取） */
    var CTRC929={};
    window.kgmCounterOfFlightR929=function(code,date,fr){
      try{
        var k=fr+'|'+date;
        if(!CTRC929[k]){
          var m={};
          for(var sl=0;sl<8;sl++){var o=W(fr,date,sl);(o&&o.rows||[]).forEach(function(r){(r.flights||[]).forEach(function(f){m[f.code]={term:r.term,counter:r.counter,open:r.open,close:r.close,zone:r.zoneR928||''}})})}
          if(Object.keys(CTRC929).length>30)CTRC929={};
          CTRC929[k]=m;
        }
        return CTRC929[k][code]||null;
      }catch(_){return null}
    };""")

# ---- #96 櫃檯分配新聞：0928B 寫進 S.news，但會員端新聞讀的是 S.r49.news → 使用者根本看不到。改發到會員新聞 ----
RL('ctr news r49','kgm-0903b-r116',"newsCtrR928();setTimeout(newsCtrR928,3000);","""newsCtrR928();setTimeout(newsCtrR928,3000);
/* 1004A：上一版的櫃檯公告寫進 S.news，會員中心與後台「KGM 航空新聞」讀的是 S.r49.news，所以前台看不到。
   這裡發到真正的新聞列表，內容一併更新開櫃時間（長程 3 小時、短程 2.5 小時）。 */
function newsCtrR929(){
  try{
    S.r49=S.r49||{};S.r49.news=S.r49.news||[];
    var ID='KGM-COUNTER-1004A';if(S.r49.news.some(function(n){return n&&n.id===ID}))return 0;
    var body='親愛的旅客：\\n\\n'
      +'自 **2026 年 10 月 5 日（星期一）** 起，KGM 航空各機場的報到櫃檯改為兩個區域；**航廈不變**。開櫃時間同步調整。\\n\\n'
      +'## 一、櫃檯分區\\n'
      +'| 區域 | 適用航班 |\\n| --- | --- |\\n'
      +'| 長程櫃檯 | 歐洲、北美、大洋洲、中東、馬爾地夫等最終目的地距離 4,500 公里以上的航班。經停航班依**最終目的地**判斷，例如台北－曼谷－伊斯坦堡的台北－曼谷段屬於長程櫃檯。 |\\n'
      +'| 短程＋聯營櫃檯 | 日本、韓國、港澳、中國大陸、東南亞等短程航班，以及所有由合作航空公司營運的聯營航班。 |\\n\\n'
      +'同一區裡，開櫃時間相近的 2～3 個航班共用一個櫃檯。\\n\\n'
      +'## 二、開櫃與關櫃時間\\n'
      +'| 航班 | 開櫃 | 關櫃 |\\n| --- | --- | --- |\\n'
      +'| 長程 | 起飛前 **3 小時** | 起飛前 60 分鐘 |\\n'
      +'| 短程＋聯營 | 起飛前 **2 小時 30 分** | 起飛前 60 分鐘 |\\n'
      +'| 國內線（松山） | 起飛前 1 小時 | 起飛前 30 分鐘 |\\n\\n'
      +'## 三、怎麼知道我的櫃檯\\n'
      +'「行程管理」每一段航班都會顯示**報到航廈／櫃檯**與開櫃時間；機場現場也有看板。櫃檯號碼在起飛前一天確定，若有變動會以訊息通知。\\n\\n'
      +'## 四、需要協助\\n'
      +'需要輪椅、無人陪伴兒童或其他特殊協助的旅客，請在開櫃時間內到櫃檯，地勤人員會優先協助。\\n';
    S.r49.news.unshift({id:ID,tag:'航班／航線消息',date:(typeof todayISO==='function'?todayISO():'2026-09-28'),
      title:'10 月 5 日起報到櫃檯分為「長程」與「短程＋聯營」，開櫃時間同步調整',
      summary:'長程航班起飛前 3 小時、短程與聯營航班起飛前 2 小時 30 分開櫃；航廈不變。行程管理會顯示每一段的報到航廈與櫃檯。',
      body:body,published:true,pinned:true,generatedAt:new Date().toISOString(),r929:true});
    try{save()}catch(_){}
    return 1;
  }catch(_){return 0}
}
newsCtrR929();setTimeout(newsCtrR929,3000);""")

# ---- #74 桃園新增登機門 B1R、C5R、D5R、D11–D18 ----
RL('tpe gates r98','kgm-0901a-r98',"""  D1:'B77W',D2:'B77W',D3:'B763',D4:'B77W',D5:'B77W',D6:'A388',D7:'B77W',D8:'B77W',D9:'B77W',D10:'B763'
};""","""  D1:'B77W',D2:'B77W',D3:'B763',D4:'B77W',D5:'B77W',D6:'A388',D7:'B77W',D8:'B77W',D9:'B77W',D10:'B763',
  /* 1004A：使用者：「TPE 登機門加入 B1R、C5R、D5R、D11–D18」（R＝接駁車登機門，跟原本同號門同樣大小；D11–D18 第二航廈 D 區延伸） */
  B1R:'A21N',C5R:'B77W',D5R:'B77W',
  D11:'B77W',D12:'B77W',D13:'B77W',D14:'B77W',D15:'B77W',D16:'B77W',D17:'B77W',D18:'B77W'
};""")
RL('tpe stands r42','kgm-0817a-r42',"""  mk(['D7','D8','D9'],'B77W',['MD','ERJ'],'T2')
);""","""  mk(['D7','D8','D9'],'B77W',['MD','ERJ'],'T2'),
  /* 1004A：新增登機門 */
  mk(['B1R'],'A21N',['A220','MD','ERJ'],'T1'),
  mk(['C5R','D5R'],'B77W',['MD','ERJ'],'T2'),
  mk(['D11','D12','D13','D14','D15','D16','D17','D18'],'B77W',['MD','ERJ'],'T2')
);""")
RL('tpe t1 order','kgm-0817a-r42',"var T1_ORDER=['A4','A9','B4','B5','B6','B7','B8','B9','A5','A6','A7','A8','A1','B1','B2','B3','A2','A3'];","var T1_ORDER=['A4','A9','B4','B5','B6','B7','B8','B9','A5','A6','A7','A8','A1','B1','B2','B3','A2','A3','B1R'];")
RL('tpe t2 order','kgm-0817a-r42',"var T2_ORDER=['C4','C5','C6','C7','C8','C9','C10','D1','D2','D4','D5','D7','D8','D9','C1','C2','C3','D6','D3','D10'];","var T2_ORDER=['C4','C5','C6','C7','C8','C9','C10','D1','D2','D4','D5','D7','D8','D9','D11','D12','D13','D14','D15','D16','D17','D18','C1','C2','C3','D6','D3','D10','C5R','D5R'];")
# ---- 旅客端登機門跟後台同一份（原本旅客端是雜湊亂數 A1–A18／B1–B18，跟後台排的登機門不一樣） ----
RL('gate one source','kgm-0814d-r22',"""window.kgmGateR22=function(code,date){
  var f=""","""var BUSY929=0;
window.kgmGateR22=function(code,date){
  /* 1004A：旅客看到的登機門改讀後台同一份分配（kgmGateOfR26，含手動指定）；原本這裡用雜湊產生 A1–A18／B1–B18，跟後台排的門對不起來 */
  if(!BUSY929&&typeof window.kgmGateOfR26==='function'){
    BUSY929=1;
    try{var r=window.kgmGateOfR26(code,date);
      if(r&&r.gate){
        if(r.published===false)return {published:false,hoursOut:r.hoursOut,note:z()?'登機門將於起飛前 12 小時公布':'Gate is published 12 hours before departure'};
        return {published:true,gate:r.gate,terminal:r.terminal,manual:!!r.manual};
      }
    }catch(_){}finally{BUSY929=0}
  }
  var f=""")

# ---- #73 會員中心出現後台「櫃檯分配與地勤行事曆」 ----
RL('k74 admin only','kgm-0823o-r74',"""    if(!(S.adminAuthed&&(S.adminTab==='gates'||S.adminTab==='groundops')))return;""","""    /* 1004A：原本只看「後台已登入＋後台分頁是登機門」，沒看目前是不是後台畫面 —— 後台登入著切到前台 Member Portal，
       這塊面板就被塞進前台頁面（使用者圖 12）。只在後台畫面掛；離開後台時把殘留的面板拿掉。 */
    if(!(S.adminAuthed&&S.view==='admin'&&(S.adminTab==='gates'||S.adminTab==='groundops'))){
      try{if(S.view!=='admin')document.querySelectorAll('#app .k74-wrap,#app .k74-mounted').forEach(function(e){e.remove()})}catch(_){}
      return;
    }""")

# ---- #71 地勤班表「一般櫃檯（此時段未綁定特定航班）」看不懂 → 找真的有航班的櫃檯；真的沒有出發班時寫出具體工作 ----
RL('ground real counter','kgm-0907A-r194',"""    blocks.push({from:hm(from),to:hm(to),hours:split[i],term:pick.term,no:pick.no,""","""    /* 1004A：這一段的櫃檯在這段時間沒有任何航班報到 → 在同一航廈找這段時間真的有航班、還沒派給這個人的櫃檯（整段時間的每個三小時時段都看）；
       還是沒有（例如清晨沒有出發班）→ 列出這段時間抵達這個航廈的航班，改排抵達層行李服務；連抵達都沒有 → 旅客服務台。 */
    var arr929='';
    if(!fl.length){
      try{
        var ap929='TPE';try{ap929=(S.groundApR7||S._cr74Ap||'TPE')}catch(_){}
        var d929='';try{d929=(S.groundDateR7||todayISO())}catch(_){d929=todayISO()}
        var cand929={};
        for(var s929=Math.floor((from%1440)/180);s929<=Math.floor(((Math.max(from,to-1))%1440)/180);s929++){
          var al929=window.kgmCounterAllocR74?window.kgmCounterAllocR74(ap929,d929,s929):null;
          ((al929&&al929.rows)||[]).forEach(function(rr){
            var o=mn(rr.open),c=mn(rr.close);if(!(Math.min(to,c)-Math.max(from,o)>0))return;
            var k=rr.term+'|'+rr.counter;if(used[k]&&k!==pick.term+'|'+pick.no)return;
            var e=cand929[k]||(cand929[k]={term:rr.term,no:String(rr.counter),fl:[]});
            (rr.flights||[]).forEach(function(f){var c2=f&&(f.code||f);if(c2&&e.fl.indexOf(c2)<0)e.fl.push(c2)});
          });
        }
        var ks929=Object.keys(cand929).filter(function(k){return cand929[k].fl.length});
        ks929.sort(function(a,b){return (cand929[a].term===pick.term?0:1)-(cand929[b].term===pick.term?0:1)});
        if(ks929.length){
          var np=cand929[ks929[0]];delete used[pick.term+'|'+pick.no];pick={term:np.term,no:np.no};used[pick.term+'|'+pick.no]=1;fl=[np.fl.join(' ')];
        }else{
          var dt929=new Date(d929+'T12:00:00'),arrs=[];
          [].concat(FLIGHTS,S.customFlights||[]).forEach(function(f){
            if(!f||f.via||f.partner||f.to!==ap929)return;
            try{if(!flyOn(f,dt929))return}catch(_){return}
            var sf=f;try{sf=window.kgmSeasonFlightR48?window.kgmSeasonFlightR48(f,d929):f}catch(_){}
            var a=mn(sf.arr);if(a<from%1440||a>=((to-1)%1440)+1)return;
            var tm='';try{tm=terminalForFlight(f)||''}catch(_){}
            if(tm&&pick.term&&tm!==pick.term)return;
            arrs.push(f.code+' '+sf.arr);
          });
          arr929=arrs.slice(0,5).join('、');
        }
      }catch(_){}
    }
    blocks.push({from:hm(from),to:hm(to),hours:split[i],term:pick.term,no:pick.no,arrivalsR929:arr929,""")
RL('ground real text','kgm-0907A-r194',"""          :('<span class="fl">'+(z()
              ?('一般櫃檯（此時段未綁定特定航班）・'+termName(b.term)+'抵達層行李服務櫃檯，負責行李分配與旅客諮詢。')
              :('General counter (no specific flights in this block) · '+termName(b.term)+' arrivals baggage desk.'))+'</span>'))""","""          :('<span class="fl">'+(z()
              ?(b.arrivalsR929
                 ?('這段時間本航廈沒有出發班報到 → 到'+termName(b.term)+'抵達層行李服務：接 '+b.arrivalsR929+' 的行李轉盤、延誤／遺失行李登記與轉機旅客指引。')
                 :('這段時間本航廈沒有航班起降 → 到'+termName(b.term)+'出境大廳旅客服務台：協助改票、候補與需協助的旅客，並完成下一段開櫃前的報到系統與行李秤檢查。'))
              :(b.arrivalsR929
                 ?('No departures checking in at this terminal now → '+termName(b.term)+' arrivals baggage service for '+b.arrivalsR929+' (belts, delayed/lost bags, transfer guidance).')
                 :('No flights at this terminal now → '+termName(b.term)+' departure hall service desk: rebooking, standby, assistance; prepare counters for the next block.')))+'</span>'))""")
open('p_f_ops.js','w').write(hdr+'\n'.join(out)+'\n')

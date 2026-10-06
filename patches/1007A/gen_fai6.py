from common import *
# ══ 1006A #15：「其實前台AI也不夠聰明」 ══
#   前台 AI 是選單式的：任何自由輸入（「託運行李可以帶幾公斤」「小孩單獨搭機怎麼辦」「可以帶寵物嗎」「你好」、英文問題）
#   一律回「請從上方選擇航班查詢、酬賓機票、里程升等或我的里程」。前台也沒有接 Claude（只有後台有 /ai/admin）。
#   作法（不動原本會的流程）：站內引擎照常先處理；只有它回「請從上方選擇…」時才接手 ——
#     ① 從網站內嵌的 16 份規章找最相關的條文；
#     ② Worker 的 /ai/front（Claude）連得上：把問題、最近 8 句對話、相關條文、旅客自己的會員卡等／里程、目前搜尋條件送過去，
#        Claude 直接回答；要查航班時給出起訖與日期，這裡幫旅客打開搜尋結果；要找真人就轉 #20 的真人客服；
#     ③ 連不上：直接用找到的條文回答（附條號），不再只叫人點選單。
#   真人客服進行中時這層不介入（#20 那一層先處理、不會產生「請從上方選擇」）。
L='kgm-0909E-r229'
JS=r"""/* ══ 1006A #15：前台 AI —— 站內引擎聽不懂時，改用規章條文＋Claude（/ai/front）回答 ═════════════════ */
(function fai1006A(){
  if(window.KGM_SIDE==='admin')return;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  var FALL=/請從上方選擇航班查詢|Choose a service above/;
  /* ── 規章條文索引（同一份 KGM_POLICY_DOCS_R914，跟網站「規章」頁一樣的文字） ── */
  var IDX=null;
  function strip(h){return String(h||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
  function idx(){
    if(IDX)return IDX;IDX=[];
    var D=window.KGM_POLICY_DOCS_R914||{};
    Object.keys(D).forEach(function(id){var d=D[id]||{},h=String(d.h||'');
      h.split('<div class="art">').slice(1).forEach(function(part){
        var m=/<span class="t">([^<]*)<\/span>/.exec(part);if(!m)return;
        var title=strip(m[1]),body=strip(part.replace(m[0],'').split('<h4')[0]);
        IDX.push({id:id,doc:d.t||id,title:title,body:body,all:title+' '+body});
      });
    });
    return IDX;
  }
  var SYN={'寵物':'動物 寵物','貓':'動物','狗':'動物','改到':'更改','改成':'更改','換到':'更改','改期':'更改','改日期':'更改','改票':'更改','小孩':'孩童 兒童','孩子':'孩童 兒童',
    '退錢':'退票','託運':'託運行李','手提':'隨身行李','wifi':'wi-fi','網路':'wi-fi','懷孕':'孕婦','行動電源':'鋰電池','電池':'鋰電池','遲到':'未登機','沒搭':'未登機',
    '個資':'個人資料','隱私':'個人資料','輪椅':'輪椅 行動不便 特殊協助','補償':'補償 賠償','延誤':'延誤 航班異常','取消航班':'航班異常',
    'baggage':'行李 託運','luggage':'行李','pet':'動物','pets':'動物','child':'孩童 兒童','children':'孩童 兒童','infant':'嬰兒','baby':'嬰兒','refund':'退票','cancel':'取消 退票',
    'change':'更改','seat':'選位 座位','meal':'餐','miles':'哩程','upgrade':'升等','check-in':'報到','checkin':'報到','wheelchair':'輪椅 行動不便 特殊協助','pregnant':'孕婦',
    'battery':'鋰電池','award':'酬賓','privacy':'個人資料','no-show':'未登機','noshow':'未登機','delay':'延誤 航班異常','staff':'員工票','residence':'residence'};
  var STOP=['的','我','你','嗎','可以','怎麼','要怎','什麼','請問','一下','如果','有沒','沒有','幾公','以帶','想把','天的','的票','麼辦','服務'];
  var BOIL=/制定目的|解釋及適用疑義|爭議處理|未盡事宜|修訂與施行|適用範圍|名詞定義|用詞定義/;
  function grams(t){
    t=String(t||'').toLowerCase();var g={};
    function add(str,w){str.replace(/[^一-鿿]+/g,'|').split('|').forEach(function(x){for(var i=0;i+1<x.length;i++){var k=x.slice(i,i+2);g[k]=Math.max(g[k]||0,w)}});
      (str.match(/[a-z][a-z\-]{2,}/g)||[]).forEach(function(x){g[x]=Math.max(g[x]||0,w)})}
    add(t,1);add(Object.keys(SYN).filter(function(k){return t.indexOf(k)>=0}).map(function(k){return SYN[k]}).join(' ').toLowerCase(),2);
    STOP.forEach(function(x){delete g[x]});return g;
  }
  function cnt(h,k){var n=0,i=h.indexOf(k);while(i>=0&&n<3){n++;i=h.indexOf(k,i+k.length)}return n}
  /* 條文比對：出現次數（最多算 3 次）×權重（同義詞 2）＋條文標題命中 2；問題命中文件名稱，那份文件的條文再加分；
     總則類（運送契約條款）×0.7、制定目的／爭議處理這類程序條文 ×0.3 */
  function find(q,n){
    var G=grams(q),ks=Object.keys(G);if(!ks.length)return [];
    var D=window.KGM_POLICY_DOCS_R914||{},ds={};Object.keys(D).forEach(function(id){var dt=String((D[id]||{}).t||'').toLowerCase();ds[id]=ks.reduce(function(a,k){return a+(dt.indexOf(k)>=0?G[k]:0)},0)});
    var out=[];idx().forEach(function(a){var s=0,hit=0,low=a.all.toLowerCase(),tl=a.title.toLowerCase();
      ks.forEach(function(k){var c=cnt(low,k);if(c){hit++;s+=G[k]*c+(tl.indexOf(k)>=0?2:0)}});
      if(!hit)return;s+=(ds[a.id]||0)*3;if(a.id==='KGM-GC-001')s*=0.7;if(BOIL.test(a.title))s*=0.3;
      if(s>=4)out.push({a:a,s:s})});
    out.sort(function(x,y){return y.s-x.s});return out.slice(0,n||3).map(function(x){return x.a});
  }
  function cite(a){return '《'+a.doc+'》（'+a.id+'）'+a.title}
  function localAnswer(q){
    if(/^(你好|妳好|哈囉|嗨|hi|hello|hey|早安|午安|晚安)[!！。.~～\s]*$/i.test(q.trim()))
      return z()?'您好！我是 KGM 小幫手。可以直接問我行李、改票退票、報到、特殊協助、會員與哩程等規定，或告訴我「從哪裡到哪裡、哪一天」幫您查航班；需要真人協助也可以按下方「轉真人客服」。'
                :'Hi! Ask me about baggage, changes and refunds, check-in, special assistance or miles, or tell me where and when you want to fly. Tap “Talk to an agent” for a person.';
    var hits=find(q,3);if(!hits.length)return '';
    var a=hits[0],b=a.body.length>220?a.body.slice(0,220)+'…':a.body;
    var t=(z()?'依':'Per ')+cite(a)+(z()?'：\n':':\n')+b;
    var rel=hits.slice(1).filter(function(x){return x.id===a.id}).map(function(x){return x.title});
    if(rel.length)t+='\n'+(z()?'同一份規定也請看：':'See also: ')+rel.join('、');
    return t+(z()?'\n（完整條文在網站「規章」頁；要真人協助可按「轉真人客服」。）':'\n(Full text on the Policies page.)');
  }
  /* ── Claude（Worker /ai/front） ── */
  function base(){try{return (window.kgmWorkerBaseR22&&window.kgmWorkerBaseR22())||'https://kgm-email.amychen-640413.workers.dev'}catch(_){return 'https://kgm-email.amychen-640413.workers.dev'}}
  async function ask(q,c){
    if(S.frontAiRemoteOffR1006A)return null;
    var ctl=new AbortController(),tm=setTimeout(function(){ctl.abort()},9000);
    try{
      var u=S.user||null,arts=find(q,3).map(function(a){return cite(a)+'：'+a.body.slice(0,900)});
      var body={text:q,lang:z()?'zh-TW':'en',today:(function(){try{return todayISO()}catch(_){return ''}})(),page:S.view||'home',
        history:((c&&c.messages)||[]).slice(-9,-1).map(function(m){return {role:m.role,text:String(m.text||'').slice(0,600)}}),
        policy:arts,search:S.search||null,member:u?{tier:u.tier||'',miles:+u.miles||0,name:u.name||u.firstName||''}:null};
      var res=await fetch(base().replace(/\/+$/,'')+'/ai/front',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,body:JSON.stringify(body)});
      clearTimeout(tm);if(!res.ok)return null;var j=await res.json();if(!j||(!j.reply&&!j.action))return null;return j;
    }catch(_){clearTimeout(tm);return null}
  }
  function apKnown(x){try{return !!(x&&typeof AIRPORTS!=='undefined'&&(AIRPORTS[x]||[].concat(AIRPORTS).some&&[].concat(AIRPORTS).some(function(a){return a&&(a.code===x||a.iata===x)})))}catch(_){return /^[A-Z]{3}$/.test(x)}}
  function act(a){
    try{
      if(!a||!a.type)return '';
      if(a.type==='handoff'&&typeof window.kgmCsHandoffR1006A==='function'){window.kgmCsHandoffR1006A();return ''}
      if(a.type==='search'){
        var fr=String(a.fr||'').toUpperCase(),to=String(a.to||'').toUpperCase(),d=String(a.date||'');
        if(!/^[A-Z]{3}$/.test(fr)||!/^[A-Z]{3}$/.test(to)||!/^\d{4}-\d\d-\d\d$/.test(d))return '';
        var cab=({economy:'Economy',premium:'Premium',business:'Business',first:'First'})[String(a.cabin||'').toLowerCase()]||'Economy';
        var ret=/^\d{4}-\d\d-\d\d$/.test(String(a.ret||''))?a.ret:'';
        S.search=Object.assign({},S.search||{},{fr:fr,to:to,dep:d,ret:ret,type:ret?'RT':'OW',pax:Math.max(1,Math.min(9,+a.pax||1)),adults:Math.max(1,Math.min(9,+a.pax||1)),cabin:cab});
        S.view='booking';S.phase='out';try{render()}catch(_){}
        return z()?('（已幫您打開 '+fr+'→'+to+' '+d+(ret?'，回程 '+ret:'')+' 的航班）'):('(Opened '+fr+'→'+to+' '+d+')');
      }
      if(a.type==='open'){var v=({trips:'manage',manage:'manage',upgrade:'upgrade',status:'status',profile:'profile',miles:'profile'})[String(a.page||'')];if(v){S.view=v;try{render()}catch(_){}}}
    }catch(_){}
    return '';
  }
  if(typeof window.kgmSendAi0819I==='function'&&!window.kgmSendAi0819I.fai1006A){
    var prev=window.kgmSendAi0819I;
    var W=function(){
      var inp=document.getElementById('aiInput'),q=String(inp&&inp.value||'').trim(),c=S.aiConversation0819I,n0=(c&&c.messages||[]).length;
      var r=prev.apply(this,arguments);
      if(!q)return r;
      setTimeout(function(){
        try{
          var c2=S.aiConversation0819I;if(!c2||!c2.messages||c2.messages.length<=n0)return;
          var m=c2.messages[c2.messages.length-1];if(!m||m.role==='user'||!FALL.test(String(m.text||'')))return;
          if(c2.csIdR1006A){var it=(S.csQueueR1006A||{})[c2.csIdR1006A];if(it&&/waiting|active/.test(it.status))return}
          var loc=localAnswer(q);
          m.text=loc||(z()?'思考中…':'Thinking…');m.fai1006A=1;try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}
          ask(q,c2).then(function(j){
            try{
              if(j){var extra=act(j.action);m.text=String(j.reply||loc||'').trim()+(extra?'\n'+extra:'');m.srcR1006A='claude'}
              else if(!loc)m.text=z()?'這個問題我還答不好。您可以換個說法、從上方選擇服務，或按「轉真人客服」請客服協助。':'I could not answer that. Try rephrasing, choose a service above, or talk to an agent.';
              try{save()}catch(_){}try{window.drawAi0819I&&window.drawAi0819I()}catch(_){}
            }catch(_){}
          });
        }catch(_){}
      },450);
      return r;
    };
    W.fai1006A=1;window.kgmSendAi0819I=W;try{window.sendAI=sendAI=W}catch(_){}
  }
  window.kgmFrontAiFindR1006A=find;window.kgmFrontAiLocalR1006A=localAnswer;
})();
"""
RL('front ai',L,
 "/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){",
 JS+"/* 把暫扣的里程改掛到改票後的新日期 */\nwindow.kgmMileMoveR923=function(id,newDate,newCode){")
save('p_h_fai.js','/* 1006A · 前台 AI：規章條文＋Claude（/ai/front） */\n')

import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 票價（營收管理 RM 演算法、方向性連假、特殊票價規則、票價方案卡） */
'''
# ---- #99 / #100：營收管理 + 方向性連假 ----
RM_CORE=r'''/* ── 1004A：營收管理（Revenue Management）──────────────────────────────
   使用者：「我希望你票價可以變成是這種算法而非單純隨機，然後系統票價可以真的自動化每天也會有所起伏」
   分工照真實航空公司：
   · 定價（Pricing）＝固定的票價階梯：FARES 裡每個訂位代號的 pct（E-C .60 → E-I .63 → … → R-R 2.55），
     這一層不動。
   · 營收管理（RM）＝決定「現在開到哪一階」：
       1. 預測最終需求（航線需求 × 星期 × 方向性連假 × 同航線合作／競爭班次）
       2. 訂位進度（booking pace）：過去 7 天每天的訂位拾取量，加權平均 → 每天都會動，
          同一天內固定（不會重整就跳價）
       3. 剩餘座位 vs 剩餘需求（EMSR 概念的保護水位）：需求壓力越大，便宜的階越早關
       4. 離出發越近保護越多（≤3 天至少第 6 階、≤7 天第 5 階、≤14 天第 4 階、≤30 天第 3 階）
       5. 半年以上的遠期航班（非連假）最多開到第 4 階
     結果是 8 階倍率之一（KGM_RM_R929.steps），同時也回饋到 sell54 的「各訂位代號剩幾位」
     （巢狀艙位：壓力大 → 便宜代號先賣完）。 */
var KGM_RM_R929={steps:[0.92,0.96,1.00,1.05,1.10,1.16,1.23,1.31],
  floors:[[3,5],[7,4],[14,3],[30,2]],farCap:[180,3]};
var KGM_CTRY_R929={TW:"TPE TSA KHH RMQ TNN HUN TTT MZG KNH",JP:"NRT HND KIX NGO CTS FUK OKA SDJ UKB MYJ HKD KMJ HIJ TAK KOJ",
  KR:"ICN GMP PUS CJU",CN:"PVG SHA PEK PKX CAN SZX XMN HGH CKG CTU NKG WUH CSX KMG XIY TSN DLC SYX HAK CGO FOC",HK:"HKG",MO:"MFM"};
var KGM_CTRY_IDX_R929=null;
function kgmCountryR929(ap){
  if(!KGM_CTRY_IDX_R929){KGM_CTRY_IDX_R929={};Object.keys(KGM_CTRY_R929).forEach(function(c){KGM_CTRY_R929[c].split(" ").forEach(function(a){KGM_CTRY_IDX_R929[a]=c})})}
  return KGM_CTRY_IDX_R929[String(ap||"").toUpperCase()]||"";
}
window.kgmCountryR929=kgmCountryR929;
/* 1004A：方向性連假。使用者：「日本黃金週日本出發的航班就是貴一點回來到日本的（其他國家出發到日本的就不算），
   台灣自己的中秋連假可能第一天出發最貴第四天回來也最貴（第一個航班是抵達台灣不是從台灣出去此類就不會長）」
   c = 放假的國家。從 c 出發：連假第一天最貴（前一晚 60%、第二天 45%）；
   飛回 c：最後一天最貴（倒數第二天 50%、收假隔天 30%）。反方向完全不加價。
   mul 省略時：連假 ≥4 天 1.45、3 天 1.30。日期依各國政府公告的放假日（未公告的年份以慣例推估，後台 AI／定價人員可改）。 */
var KGM_HOLIDAYS_R929=[
  {c:"TW",from:"2026-09-25",to:"2026-09-28",zh:"中秋節＋教師節連假"},
  {c:"TW",from:"2026-10-09",to:"2026-10-11",zh:"國慶連假"},
  {c:"TW",from:"2026-10-24",to:"2026-10-26",zh:"光復節連假"},
  {c:"TW",from:"2026-12-25",to:"2026-12-27",zh:"行憲紀念日連假"},
  {c:"TW",from:"2027-01-01",to:"2027-01-03",zh:"元旦連假"},
  {c:"TW",from:"2027-02-04",to:"2027-02-10",zh:"春節連假"},
  {c:"TW",from:"2027-02-27",to:"2027-03-01",zh:"和平紀念日連假"},
  {c:"TW",from:"2027-04-02",to:"2027-04-05",zh:"兒童節＋清明連假"},
  {c:"TW",from:"2027-04-30",to:"2027-05-02",zh:"勞動節連假"},
  {c:"TW",from:"2027-10-09",to:"2027-10-11",zh:"國慶連假"},
  {c:"JP",from:"2026-12-29",to:"2027-01-03",zh:"日本年末年始"},
  {c:"JP",from:"2027-04-29",to:"2027-05-05",mul:1.30,zh:"日本黃金週"},
  {c:"JP",from:"2027-08-13",to:"2027-08-16",zh:"日本盂蘭盆"},
  {c:"KR",from:"2027-02-06",to:"2027-02-09",zh:"韓國春節"},
  {c:"KR",from:"2027-09-14",to:"2027-09-16",mul:1.30,zh:"韓國中秋"},
  {c:"CN",from:"2026-10-01",to:"2026-10-07",zh:"中國國慶黃金週"},
  {c:"CN",from:"2027-02-06",to:"2027-02-12",zh:"中國春節"},
  {c:"CN",from:"2027-05-01",to:"2027-05-05",mul:1.30,zh:"中國勞動節"},
  {c:"HK",from:"2026-10-01",to:"2026-10-04",mul:1.25,zh:"香港國慶連假"}
];
window.KGM_HOLIDAYS_R929=KGM_HOLIDAYS_R929;
function kgmDayDiffR929(a,b){return Math.round((Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/864e5)}
function kgmHolDirR929(f,date,why){
  date=date||(f&&f.date);if(!f||!date)return 1;
  var fr=kgmCountryR929(f.fr),to=kgmCountryR929(f.to),m=1,W1={"-1":0.6,"0":1,"1":0.45},W2={"-1":0.3,"0":1,"1":0.5};
  (window.KGM_HOLIDAYS_R929||KGM_HOLIDAYS_R929).forEach(function(h){
    if(!h||!h.c||!h.from||!h.to)return;
    var n=kgmDayDiffR929(h.from,h.to)+1,p=+h.mul||(n>=4?1.45:1.30),w=null,side="";
    if(fr===h.c&&to!==h.c){w=W1[String(kgmDayDiffR929(h.from,date))];side="out"}
    if(w==null&&to===h.c&&fr!==h.c){w=W2[String(kgmDayDiffR929(date,h.to))];side="in"}
    if(w==null)return;
    var v=1+(p-1)*w;if(v>m){m=v;if(why)why.push({zh:h.zh,c:h.c,side:side,mul:Math.round(v*1000)/1000})}
  });
  return m;
}
window.kgmHolDirR929=kgmHolDirR929;
var KGM_COMP_R929=null;
function kgmRmCurveR929(dd){return dd<=14?1:dd<=30?0.94:dd<=60?0.84:dd<=90?0.72:dd<=150?0.56:dd<=240?0.38:dd<=330?0.24:0.14}
function kgmRmHashR929(s){var x=2166136261;s=String(s);for(var i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
/* 訂位進度：過去 7 天（今天權重最高）每天的拾取量。同一天固定，每天換一次。 */
function kgmRmPaceR929(code,date,asOf){
  var t=Date.parse(asOf+"T00:00:00Z"),s=0,w=0;
  for(var k=0;k<7;k++){var day=new Date(t-k*864e5).toISOString().slice(0,10),wt=7-k;s+=(kgmRmHashR929(code+"|"+date+"|"+day)%1000)/1000*wt;w+=wt}
  return Math.max(0.85,Math.min(1.15,1+(s/w-0.5)*0.6));
}
var KGM_RM_MEMO_R929={};
function kgmRmR929(f,date,asOf){
  var res={mul:1,step:2,pace:1,hol:1,dd:0,pressure:1,booked:0,lfFinal:0.9};
  try{
    date=date||(f&&f.date);if(!f||!date)return res;
    asOf=asOf||todayISO();
    var key=(f.code||"")+"|"+f.fr+f.to+"|"+date+"|"+asOf;
    if(KGM_RM_MEMO_R929[key])return KGM_RM_MEMO_R929[key];
    var dd=kgmDayDiffR929(asOf,date),ddReal=kgmDayDiffR929(todayISO(),date);
    var lf=0.9;try{lf=+loadFactor(f.code,date)||0.9}catch(_){}
    var lfFinal=Math.min(0.99,lf/kgmRmCurveR929(Math.max(0,ddReal))),hol=kgmHolDirR929(f,date);
    if(!KGM_COMP_R929){KGM_COMP_R929={};try{(typeof PARTNER_CODESHARE_0817!=="undefined"?PARTNER_CODESHARE_0817:[]).forEach(function(r){KGM_COMP_R929[r[1]+r[2]]=1})}catch(_){}}
    var comp=KGM_COMP_R929[f.fr+f.to]?0.97:1;
    /* 某一天的需求壓力：未受限需求（可以超過 100%）扣掉已訂，除以剩餘座位（至少當 8% 算，避免快滿時暴衝） */
    var pressAt=function(day){
      var dday=kgmDayDiffR929(day,date),pc=kgmRmPaceR929(f.code||"",date,day);
      var demand=lfFinal*1.10*pc*(1+(hol-1)*0.6)*comp;
      var booked=Math.min(0.99,lfFinal*kgmRmCurveR929(Math.max(0,dday))*Math.sqrt(pc));
      return {p:Math.max(0,demand-booked)/Math.max(0.08,1-booked),pace:pc,booked:booked};
    };
    /* RM 每天重新最佳化一次，但不會一天之內整個翻盤：今天 50%、昨天 30%、前天 20% */
    var t0=Date.parse(asOf+"T00:00:00Z"),P0=pressAt(asOf),P1=pressAt(new Date(t0-864e5).toISOString().slice(0,10)),P2=pressAt(new Date(t0-2*864e5).toISOString().slice(0,10));
    var lg=function(x){return Math.log(Math.max(0.1,x))/Math.LN2};
    var pace=P0.pace,booked=P0.booked,pressure=P0.p;
    var st=KGM_RM_R929.steps,idx=Math.round(3+2.2*(0.5*lg(P0.p)+0.3*lg(P1.p)+0.2*lg(P2.p)));
    (KGM_RM_R929.floors||[]).forEach(function(p){if(dd<=p[0])idx=Math.max(idx,p[1])});
    if(dd>=KGM_RM_R929.farCap[0]&&hol<=1)idx=Math.min(idx,KGM_RM_R929.farCap[1]);
    idx=Math.max(0,Math.min(st.length-1,idx));
    res={mul:st[idx],step:idx,pace:Math.round(pace*1000)/1000,hol:hol,dd:dd,pressure:Math.round(pressure*1000)/1000,
      booked:Math.round(booked*1000)/1000,lfFinal:Math.round(lfFinal*1000)/1000,comp:comp};
    KGM_RM_MEMO_R929[key]=res;
  }catch(_){}
  return res;
}
window.kgmRmR929=kgmRmR929;
/* 給 sell54（巢狀艙位）用：訂位進度快／連假 → 各代號賣得快，便宜代號先關；進度慢 → 重新釋出 */
function kgmRmSellAdjR929(f,date){try{var r=kgmRmR929(f,date);return (r.pace-1)*0.9+(r.hol-1)*0.35}catch(_){return 0}}
window.kgmRmSellAdjR929=kgmRmSellAdjR929;
/* 1004A：特殊票價規則（定價人員或後台 AI 新增，例如「台灣出發的第一段加價」「某航線某日期區間調價」）。
   {id, fr, toAp（出發／抵達：機場代碼或國家 TW/JP…，空白＝不限）, from, to（日期區間）, code, cabin（空白＝全部）, mul, firstSegOnly, note} */
function kgmFareRuleMulR929(f,cabin){
  var m=1;
  try{
    var seg0=null;try{seg0=(S.search&&S.search.type==="MC")?((S.mcFlights||[])[0]||{}).code:null}catch(_){}
    (S.fareRulesR929||[]).forEach(function(r){
      if(!r||r.off||!(+r.mul>0))return;
      var okAp=function(want,ap){if(!want)return true;want=String(want).toUpperCase();return want===ap||want===kgmCountryR929(ap)};
      if(!okAp(r.fr,f.fr)||!okAp(r.toAp,f.to))return;
      if(r.from&&f.date&&f.date<r.from)return;
      if(r.to&&f.date&&f.date>r.to)return;
      if(r.cabin&&r.cabin!==cabin)return;
      if(r.code&&r.code!==f.code)return;
      if(r.firstSegOnly){var isRet=false;try{isRet=!!(S.search&&S.search.type==="RT"&&S.search.ret&&f.date===S.search.ret&&f.fr===S.search.to)}catch(_){}
        if(isRet)return;if(seg0&&seg0!==f.code)return}
      m*=+r.mul;
    });
  }catch(_){}
  return m;
}
window.kgmFareRuleMulR929=kgmFareRuleMulR929;
function _dynFareMul(f,date){'''
R('rm core','function _dynFareMul(f,date){',RM_CORE)
R('rm dyn',
  '    var days=Math.round((dt-new Date(todayISO()+"T00:00:00"))/864e5);\n    if(days<=3)m*=1.22; else if(days<=7)m*=1.12; else if(days<=14)m*=1.05;\n    else if(days>=90)m*=0.90; else if(days>=60)m*=0.94;\n',
  '    /* 1004A：原本的「離出發天數固定倍率」與下面的雜湊亂數，改由營收管理決定開到哪一階 */\n    var _rm929=kgmRmR929(f,d);m*=_rm929.mul;\n')
R('rm jitter',
  '    // 每航班每日的小幅隨機浮動(±4%),用雜湊確保同日同班固定\n    var h=0,sd=(f.code||"")+d;for(var i=0;i<sd.length;i++)h=((h*31)+sd.charCodeAt(i))>>>0;\n    m*=(0.96+((h%81)/1000));\n',
  '')
R('rm peak dir','const pkMul=peakMul(f.date);',
  '/* 1004A：方向性連假（從放假國家出發的頭幾天、飛回放假國家的最後幾天）＋特殊票價規則。\n     春節本來就 ×2 以上，方向性加成只算一半，避免疊到離譜。 */\n  const _pk929=peakMul(f.date),_hol929=kgmHolDirR929(f,f.date);\n  const pkMul=_pk929*(1+(_hol929-1)*(_pk929>=1.9?0.5:1))*kgmFareRuleMulR929(f,cabin);')
# 十月一日到十日「不分方向」的黃金週加價 → 改由方向性表（中國國慶、台灣國慶）處理
R('peak gw 1','    if(m===10&&day<=10)mul=Math.max(mul,1.22);// Golden Week\n',
  '    /* 1004A：10/1–10/10 不分方向的「黃金週」加價移除，改由 KGM_HOLIDAYS_R929（中國國慶、台灣國慶）依方向加價 */\n')
R('peak gw 2','if(mo===10&&dy<=10)m=Math.max(m,1.22);','/* 1004A：10/1–10/10 改由方向性連假處理 */')
# 巢狀艙位：原本每班每天固定 ±20% 的雜湊，改由訂位進度＋連假驅動（每天變化）；班次之間的結構差異保留 ±5%
R('rm sell54',"j=((hash54(flight.code+'|'+date+'|'+fam)%41)-20)/100",
  "j=((hash54(flight.code+'|'+date+'|'+fam)%11)-5)/100+(typeof kgmRmSellAdjR929==='function'?kgmRmSellAdjR929(flight,date):0)/* 1004A：RM 訂位進度 */")
# 特殊票價規則要存起來
R('farerule init','priceOverrides:{},// {fr+to+cabin: multiplier}',
  'priceOverrides:{},// {fr+to+cabin: multiplier}\n  fareRulesR929:LS.get("kgm_farerule929",[]),/* 1004A：特殊票價規則（定價人員／後台 AI） */')
R('farerule save','LS.set("kgmfco4",S.fareClsOverrides||[]);','LS.set("kgmfco4",S.fareClsOverrides||[]);LS.set("kgm_farerule929",S.fareRulesR929||[]);')
open('p_f_fare.js','w').write(hdr+'\n'.join(out)+'\n')

# ---- #98：票價方案卡（參考圖：名稱（代號）、價格、選擇、逐列規則；剩餘 <5 才標示，而且顯示實際的一半） ----
_old_card=open('/tmp/j/card_old.txt',encoding='utf8').read()
_new_card=r'''          /* 1004A：票價方案卡改成參考圖的樣式（名稱（代號）→ 價格 → 選擇 → 逐列規則），內容全部用 KGM 自己的規則。
             使用者：「剩餘位置有剩餘位置就不用特別寫」「剩餘<5個位置會放在那裡」「剩餘可能4個位置時就寫剩餘2個，剩餘8個位置寫剩餘4個」
             → 顯示數 = 實際剩餘的一半（至少等於這次訂位人數，否則畫面寫 1 席卻能訂 2 位），顯示數 <5 才出現紅色標籤，其餘什麼都不寫。 */
          const _pax929=Math.max(1,+S.search.pax||1);
          const _shown929=(seatLeft!=null&&isFinite(seatLeft)&&seatLeft>0)?Math.max(_pax929,Math.floor(seatLeft/2)):null;
          const _badge929=(xAvail&&_shown929!=null&&_shown929<5&&!_staffFare)
            ?`<span class="k929-left">${LANG==="en"?("Only "+_shown929+" left"):("剩餘 "+_shown929+" 席")}</span>`:"";
          const _ic929=function(p){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`};
          const _IC929={
            bag:'<rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3M9 20v1M15 20v1"/>',
            chg:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
            ref:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/><path d="M12 8v4l2.5 2"/>',
            seat:'<path d="M7 4v9a2 2 0 0 0 2 2h7l2 5M7 11h8M9 20h8"/>',
            mile:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
            up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
            ns:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'};
          const _seat929=_staffFare?(LANG==="en"?"Assigned at check-in":"報到時指派")
            :(cabin==="Business"||cabin==="First"||cabin==="Resident")?(LANG==="en"?"Free":"免費")
            :_famU==="Deluxe"?(LANG==="en"?"Free (standard + Front Zone)":"免費（一般座位＋Front Zone）")
            :_famU==="Value"?(LANG==="en"?"Standard seats free":"一般座位免費")
            :(LANG==="en"?"Chargeable":"需付費");
          const _ns929=(function(){try{var t=window.kgmNoShowTextR914?window.kgmNoShowTextR914(c):"";if(t)return LANG==="en"?t.replace("／航段"," per sector"):t}catch(_){}return "—"})();
          const _up929=_staffFare?(LANG==="en"?"Not available":"不適用")
            :!canUpgrade?(LANG==="en"?"Not allowed":"不可")
            :(_famU==="Value"?(LANG==="en"?"Allowed · miles +25%":"可（所需哩程 +25%）"):(LANG==="en"?"Allowed · standard miles":"可（標準哩程）"));
          const _row929=function(ic,label,val,good){return `<div class="k929-fr${good?"":" off"}"><span class="k929-ic">${_ic929(_IC929[ic])}</span><span class="k929-lb">${label}</span><b>${val}</b></div>`};
          const _free929=function(t){return t==="免費"||t==="Free"};
          return`<article class="k929-fare${xAvail?"":" sold"}" style="--k929c:${color}">
            <div class="k929-bar"></div>
            ${_isRec?`<div class="k929-rec">${LANG==="en"?"RECOMMENDED":"推薦"}</div>`:""}
            <div class="k929-hd">
              ${_badge929}
              <div class="k929-nm">${_tierNm} <span class="k929-cd">(${_staffFare?"STAFF":((FARES[c]||{}).displayCodeR48||String(c).split("-").pop())})</span></div>
              <div class="k929-cab">${_staffFare?stxPlanLabel():cabinLabel}</div>
              <div class="k929-pr">${useMi?(mi.toLocaleString()+" mi"):fmtAmt(prVar,curr)}</div>
              <div class="k929-sub">${useMi?(LANG==="en"?"per guest":"每人"):((LANG==="en"?"for all guests":"全部旅客")+(_isBase?"":` · <em>${LANG==="en"?"+"+fmtAmt(_dlt,curr)+" vs lowest":"較最低 +"+fmtAmt(_dlt,curr)}</em>`))}</div>
              ${(!xAvail)?`<div class="k929-sold">${LANG==="en"?"Sold out":"售完"}</div>`:""}
            </div>
            ${useMi?(function(){
              var _st=awardStatus(f.code,f.date,(FARES[c]||{}).cabin||"Economy",S.search.pax);
              return `<div style="padding:5px 14px;font-size:10px;font-weight:800;color:${_st.ok?"var(--g)":"var(--red)"};background:${_st.ok?"var(--gsoft)":"#FDECEA"}">${_st.label}</div>`;
            })():""}
            <div class="k929-sel"><button ${xAvail?'':'disabled '}onclick="pickFare('${dir}',${idx},'${c}',${_staffFare?'true':'false'})" style="width:100%;margin-top:0;border:1px solid ${color};border-radius:8px;background:${xAvail?color:'#eee'};color:${xAvail?'#fff':'#999'};padding:10px 12px;font-size:12px;font-weight:900;letter-spacing:.02em;cursor:${xAvail?'pointer':'not-allowed'}" data-r91="1">${LANG==="en"?'Select':'選擇'}</button></div>
            <div class="k929-rows">
              ${_row929("bag",LANG==="en"?"Included baggage":"託運行李",adjBag,true)}
              ${_row929("chg",LANG==="en"?"Change fee per sector":"改票手續費（每航段）",(chgLabel||"—"),true)}
              ${_row929("ref",LANG==="en"?"Refund":"退票",_staffFare?refLabel:((LANG==="en"?"Fee ":"手續費 ")+(refLabel||"—")),!!refLabel&&refLabel.indexOf("不可")<0&&refLabel.indexOf("Non-")<0)}
              ${_row929("seat",LANG==="en"?"Seat selection":"選位",_seat929,_seat929!=="需付費"&&_seat929!=="Chargeable")}
              ${_row929("mile",LANG==="en"?"Miles earned":"哩程累積",miEarnVal>0?(miEarnVal.toLocaleString()+(LANG==="en"?" miles":" 哩")):(LANG==="en"?"None":"不累積"),miEarnVal>0)}
              ${_row929("up",LANG==="en"?"Upgrade with miles":"哩程升等",_up929,canUpgrade&&!_staffFare)}
              ${_row929("ns",LANG==="en"?"No show":"未登機",_staffFare?(LANG==="en"?"No fee":"不收費"):_ns929,true)}
              <div class="k929-more">${[_zn<=2?(LANG==="en"?"Priority boarding":"優先登機"):"",_staffFare?"":(_wf?(LANG==="en"?"Free Wi-Fi":"免費 Wi-Fi"):(fareInfo?.msg?(LANG==="en"?"Free messaging":"免費文字訊息"):""))].filter(Boolean).map(function(x){return `<span>✓ ${x}</span>`}).join("")}</div>
            </div>
          </article>`;'''
R('fare card 929',_old_card,_new_card)
# 樣式放在主程式既有的 <style>（不新增層）
R('fare card css','</style>\n</head>',r'''/* 1004A：票價方案卡 */
.k929-fare{position:relative;border:1px solid #e3e3e3;border-radius:14px;background:#fff;overflow:hidden;width:100%;text-align:left;transition:box-shadow .16s,transform .16s,border-color .16s}
.k929-fare:hover{border-color:var(--k929c);box-shadow:0 8px 22px rgba(0,0,0,.09);transform:translateY(-2px)}
.k929-fare.sold{background:#f7f7f7;opacity:.55}.k929-fare.sold:hover{transform:none;box-shadow:none;border-color:#e3e3e3}
.k929-bar{height:5px;background:var(--k929c)}
.k929-rec{background:var(--k929c);color:#fff;font-size:9px;font-weight:800;letter-spacing:.08em;text-align:center;padding:3px}
.k929-hd{position:relative;padding:14px 14px 10px}
.k929-nm{font-size:15px;font-weight:800;color:#111;line-height:1.2;padding-right:74px}
.k929-cd{font-family:ui-monospace,Menlo,monospace;color:var(--k929c);font-weight:900;letter-spacing:.06em}
.k929-cab{font-size:10px;color:#9a9a9a;margin-top:2px;letter-spacing:.03em}
.k929-pr{font-size:22px;font-weight:900;color:#111;line-height:1;margin-top:12px;letter-spacing:-.01em}
.k929-sub{font-size:10px;color:#8a8a8a;margin-top:4px}.k929-sub em{font-style:normal;color:var(--k929c);font-weight:800}
.k929-sold{margin-top:7px;font-size:10px;font-weight:900;color:var(--red)}
.k929-left{position:absolute;top:12px;right:12px;background:#c90038;color:#fff;border-radius:999px;padding:4px 9px;font-size:10px;font-weight:900;letter-spacing:.02em;box-shadow:0 2px 8px rgba(201,0,56,.25)}
.k929-sel{padding:0 14px 12px}
.k929-rows{border-top:1px solid #f0f0f0;padding:4px 14px 12px}
.k929-fr{display:grid;grid-template-columns:18px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed #efefef;font-size:11px}
.k929-fr:last-of-type{border-bottom:0}
.k929-ic{display:flex;align-items:center;justify-content:center}
.k929-lb{color:#6b6b6b}
.k929-fr b{color:#151515;font-weight:800;text-align:right;max-width:150px;line-height:1.35}
.k929-fr.off b{color:#a3a3a3;font-weight:700}.k929-fr.off .k929-ic{opacity:.45}
.k929-more{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.k929-more span{font-size:10px;color:var(--k929c);background:#f6f6f4;border-radius:999px;padding:3px 8px;font-weight:700}
.k929-more:empty{display:none}
</style>
</head>''',1)
open('p_f_fare.js','w').write(hdr+'\n'.join(out)+'\n')

# 轉機行程的票價卡也用同一套樣式（原本是另一支 connFareGrid，還是舊的 ✓/✕ 清單）
_old_conn=open('/tmp/j/conn_old.txt',encoding='utf8').read()
_new_conn=r'''  /* 1004A：轉機票價卡改成與直飛相同的方案卡樣式（名稱（代號）→ 價格 → 選擇 → 逐列規則）；剩餘席次取兩段較少者，同樣顯示一半、<5 才標示 */
  var ic929=function(p){return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="'+col+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
  var IC929={bag:'<rect x="5" y="7" width="14" height="13" rx="2"/><path d="M9 7V4h6v3M9 20v1M15 20v1"/>',chg:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    ref:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/><path d="M12 8v4l2.5 2"/>',seat:'<path d="M7 4v9a2 2 0 0 0 2 2h7l2 5M7 11h8M9 20h8"/>',
    mile:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',up:'<path d="M12 19V5M6 11l6-6 6 6"/>',ns:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'};
  var row929=function(ic,label,val,good){return '<div class="k929-fr'+(good?'':' off')+'"><span class="k929-ic">'+ic929(IC929[ic])+'</span><span class="k929-lb">'+label+'</span><b>'+val+'</b></div>'};
  var EN=LANG==="en";
  var cards=codes.map(function(k){
    var fi=FARES[k]||{},p=total(k),base=p<=lo,dlt=Math.max(0,p-lo);
    var tier=EN?(fi.tierEN||FARE_NM(k)):(fi.tier||FARE_NM(k));
    var isLH=distOf(f1.fr,f2.to)>=4000;
    var bagL=(k==="B"||k==="H")&&isLH?"2×23kg":(fi.bag||"1×23kg");
    var bm=/短程\s*([^／/]+)[／/]長程\s*(.+)$/.exec(String(bagL||""));if(bm)bagL=(isLH?bm[2]:bm[1]).trim();
    var bq=/^\s*(\d+)\s*[×x*]\s*(\d+)\s*kg/i.exec(String(bagL||""));if(bq)bagL=EN?(bq[1]+" piece"+(+bq[1]>1?"s":"")+" · "+bq[2]+"kg"):(bq[1]+" 件 · "+bq[2]+"kg");
    var chg=EN?fi.chgEN:fi.chgZH, ref=EN?fi.refEN:fi.refZH;
    var miV=fi.mile>0?Math.round((distOf(f1.fr,f1.to)+distOf(f2.fr,f2.to))*fi.mile/100):0;
    var fam=fi.familyR48||"",cab=fi.cabin||cabK;
    var canUp=(fam==="Value"||fam==="Deluxe");
    var seat=(cab==="Business"||cab==="First"||cab==="Resident")?(EN?"Free":"免費"):fam==="Deluxe"?(EN?"Free (standard + Front Zone)":"免費（一般座位＋Front Zone）"):fam==="Value"?(EN?"Standard seats free":"一般座位免費"):(EN?"Chargeable":"需付費");
    var ns="—";try{ns=(window.kgmNoShowTextR914&&window.kgmNoShowTextR914(k))||"—";if(EN)ns=ns.replace("／航段"," per sector")}catch(_){}
    var left=null;try{if(typeof window.kgmInventory49==="function"){[f1,f2].forEach(function(ff){var v=window.kgmInventory49(k,ff.date,ff);if(v!=null&&isFinite(v))left=left==null?v:Math.min(left,v)})}}catch(_){}
    var shown=(left!=null&&left>0)?Math.max(Math.max(1,+pax||1),Math.floor(left/2)):null;
    var badge=(shown!=null&&shown<5)?'<span class="k929-left">'+(EN?("Only "+shown+" left"):("剩餘 "+shown+" 席"))+'</span>':'';
    var more=[(fi.zone||4)<=2?zoneLabel(fi.zone||4):"",fi.wifi?(EN?"Free Wi-Fi":"免費 Wi-Fi"):(fi.msg?(EN?"Free messaging":"免費文字訊息"):"")].filter(Boolean);
    return '<button class="k929-fare k929-cbtn" style="--k929c:'+col+';padding:0" onclick="event.stopPropagation();pickConnectionFare('+cIdx+',\''+dir+'\',\''+f1.date+'\',\''+k+'\')">'
      +'<div class="k929-bar"></div>'
      +(fi.rec?'<div class="k929-rec">'+(EN?"RECOMMENDED":"推薦")+'</div>':'')
      +'<div class="k929-hd">'+badge
      +'<div class="k929-nm">'+tier+' <span class="k929-cd">('+((fi.displayCodeR48)||String(k).split("-").pop())+')</span></div>'
      +'<div class="k929-cab">'+CAB_NM(cabK)+'</div>'
      +'<div class="k929-pr">'+fmtAmt(p,curr2)+'</div>'
      +'<div class="k929-sub">'+(EN?"both legs, all guests":"兩段全部旅客")+(base?'':' · <em>'+(EN?("+"+fmtAmt(dlt,curr2)+" vs lowest"):("較最低 +"+fmtAmt(dlt,curr2)))+'</em>')+'</div>'
      +'</div>'
      +'<div class="k929-sel"><span class="k929-selb">'+(EN?'Select':'選擇')+'</span></div>'
      +'<div class="k929-rows">'
      +row929("bag",EN?"Included baggage":"託運行李",bagL,true)
      +row929("chg",EN?"Change fee per sector":"改票手續費（每航段）",chg||"—",true)
      +row929("ref",EN?"Refund":"退票",(EN?"Fee ":"手續費 ")+(ref||"—"),!!ref&&ref.indexOf("不可")<0&&ref.indexOf("Non-")<0)
      +row929("seat",EN?"Seat selection":"選位",seat,fam!=="Basic"||cab==="Business"||cab==="First"||cab==="Resident")
      +row929("mile",EN?"Miles earned":"哩程累積",miV>0?(miV.toLocaleString()+(EN?" miles":" 哩")):(EN?"None":"不累積"),miV>0)
      +row929("up",EN?"Upgrade with miles":"哩程升等",canUp?(fam==="Value"?(EN?"Allowed · miles +25%":"可（所需哩程 +25%）"):(EN?"Allowed · standard miles":"可（標準哩程）")):(EN?"Not allowed":"不可"),canUp)
      +row929("ns",EN?"No show":"未登機",ns,true)
      +'<div class="k929-more">'+more.map(function(x){return '<span>✓ '+x+'</span>'}).join("")+'</div>'
      +'</div></button>';
  }).join("");'''
R('conn card 929',_old_conn,_new_conn)
R('conn card css','.k929-more:empty{display:none}\n</style>\n</head>','''.k929-more:empty{display:none}
.k929-cbtn{display:block;cursor:pointer;font:inherit;color:inherit}
.k929-selb{display:block;text-align:center;background:var(--k929c);color:#fff;border-radius:8px;padding:10px 12px;font-size:12px;font-weight:900;letter-spacing:.02em}
@media(max-width:560px){div:has(>.k929-fare){grid-template-columns:1fr!important}.k929-fr b{max-width:none}}
</style>
</head>''')
open('p_f_fare.js','w').write(hdr+'\n'.join(out)+'\n')

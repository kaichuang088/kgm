import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 其他（航點清單、KX301/302 停飛、聯營機型與承運人標誌…） */
'''
# ---- #95 ----
R('drop KX302','["KX302","TPE","PVG","06:35","07:50","A359","daily",null,0],\n','')
R('drop KX301','["KX301","PVG","TPE","08:50","10:05","A359","daily",null,0],\n','')
R('ctu dup','"CTU","MFM","PEK","PVG","CGO","HGH","FOC","XMN","CTU","CKG"','"CTU","MFM","PEK","PVG","CGO","HGH","FOC","XMN","CKG"',2)
R('jp dup','"UKB","MYJ","HKD","KMJ","UKB","MYJ","HKD","KMJ","KMJ","HIJ"','"UKB","MYJ","HKD","KMJ","HIJ"')
R('cn dup','"CKG","CTU","CTU","NKG"','"CKG","CTU","NKG"')
# 國泰 TPE–HKG 班次的機型：原本四種機型輪流套（連 777-300ER 都套到 CX401 上），改成去回同號同機型，以 A330-300／A350-900 為主
R('cx equip',"var EQUIP=['Airbus A350-900','Airbus A330-300','Boeing 777-300ER','Airbus A321neo'];",
  "/* 1004A：去回同一對班號用同一機型（CX465/466、CX495/496、CX401/402 A330-300；CX531/530、CX407/408 A350-900） */\nvar EQUIP=['Airbus A330-300','Airbus A330-300','Airbus A350-900','Airbus A330-300','Airbus A350-900'];")
R('cx equip idx','partnerEquipment:EQUIP[i%EQUIP.length]','partnerEquipment:EQUIP[Math.floor(i/2)%EQUIP.length]')
# 這十班沒有 AC 登錄，班號下方那一格印成「KX9870 | KX9870」；補上和其他聯營班一樣的「承運公司 · 原班號」
R('cx ac','    FLIGHTS.push(f);\n    window.KGM_CX_ADDED_R127.push(',
  "    FLIGHTS.push(f);\n    /* 1004A：補 AC 登錄，班號旁顯示「Cathay Pacific · CX401」而不是重複的 KX 班號 */\n    try{if(typeof AC!=='undefined'&&!AC[f.acft])AC[f.acft]={nm:f.operator+' · '+f.operatorFlight,seats:280,hasFirst:false,hasSuite:false,hasWifi:true,avgAge:'—',cabins:{econ:{rows:1,cfg:'',seats:0,lay:[]}}}}catch(_){}\n    window.KGM_CX_ADDED_R127.push(")
# 承運人標誌：寬版文字商標塞進 48px 圓圈會縮成看不清的一條線；離線時又退回「名字字首」（Cathay Pacific → CP、Japan Airlines → JA，都不是航空公司代碼）。
# 改成航空公司代碼（CX／JL／QF…）＋ 該公司代表色的圓形標誌，不依賴外部圖片。
LOGO_OLD=None
import re
s=open('/tmp/j/kgm0928B_final.html',encoding='utf8').read()
i=s.index("    var src=REAL_LOGO_URL_0809C[c.operator]||'',fallback=");j=s.index("\n  }",i)
LOGO_OLD=s[i:j]
LOGO_NEW=r'''    /* 1004A：寬版文字商標在 48px 圓圈裡縮成一條看不清的線，離線時又退回名字字首（CP／JA 不是航空公司代碼）。
       改用航空公司兩碼代號 ＋ 代表色的圓形標誌（不依賴外部圖片）。 */
    var br=(window.kgmAirlineBrandR929&&window.kgmAirlineBrandR929(c.operator))||{code:'OW',color:'#304357'};
    return '<span class="real-air-logo0809c mono929" title="'+safe0815(c.operator)+'" style="background:'+br.color+';border-color:'+br.color+'"><b style="color:#fff;font-size:15px;font-weight:900;letter-spacing:.04em;font-family:ui-sans-serif,system-ui,sans-serif">'+br.code+'</b></span>';'''
R('logo mono',LOGO_OLD,LOGO_NEW)
BRAND=r'''/* 1004A：合作航空公司代號與代表色（承運人標誌共用） */
window.KGM_AIRLINE_BRAND_R929={'Cathay Pacific':['CX','#006564'],'Japan Airlines':['JL','#C8102E'],'American Airlines':['AA','#0078D2'],
  'Alaska Airlines':['AS','#01426A'],'Qantas':['QF','#E0001B'],'Etihad Airways':['EY','#8C6B2F'],'Malaysia Airlines':['MH','#0B3D91'],
  'Finnair':['AY','#0B1560'],'British Airways':['BA','#075AAA'],'Qatar Airways':['QR','#5C0632'],'Iberia':['IB','#D7192D'],
  'Royal Jordanian':['RJ','#8B7148'],'SriLankan Airlines':['UL','#0A3A7A'],'Oneworld':['OW','#304357'],'KGM Airways':['KX','#0d3b2e']};
window.kgmAirlineBrandR929=function(nm){var x=window.KGM_AIRLINE_BRAND_R929[String(nm||'').trim()];
  if(x)return {code:x[0],color:x[1]};
  var ini=String(nm||'').split(/\s+/).map(function(w){return w[0]||''}).join('').slice(0,2).toUpperCase();return {code:ini||'OW',color:'#304357'}};
'''
R('brand map','// ══ 0809C final visual hardening: real partner marks + visible cabin imagery ══\n',
  '// ══ 0809C final visual hardening: real partner marks + visible cabin imagery ══\n'+BRAND)
R('r35 initials',"function initials(nm){\n  return String(nm||'').split(/\\s+/).map(function(x){return x[0]||''}).join('').slice(0,2).toUpperCase();\n}",
  "function initials(nm){\n  /* 1004A：用航空公司代號（CX／JL／QF…），不是名字字首 */\n  try{if(window.kgmAirlineBrandR929)return window.kgmAirlineBrandR929(nm).code}catch(_){}\n  return String(nm||'').split(/\\s+/).map(function(x){return x[0]||''}).join('').slice(0,2).toUpperCase();\n}")
# ── #91 內部信：只帶 role 的通知從來沒寄出去 ──
R('#91 role recipients','''    var W=function(ev,data,to){
      try{
        data=data||{};''','''    var W=function(ev,data,to){
      /* 1004A：寄給執行長的內部信（退票待核、頁面權限申請、變更申請）只帶 role:'ceo'、沒有收件 Email，
         最底層的寄信一律回「找不到收件 Email」，呼叫端又把錯誤吞掉 —— 這幾類信其實從來沒寄出。
         只有 role 沒有收件人時，改寄給該職務所有在職員工（員工管理裡的 Email）。 */
      try{
        /* 里程差額付款信（mileage.diff）把收件人放在 payload.to，最底層只認第三個參數或 payload.email，也是一封都寄不出去 */
        if(data&&!to&&!data.email&&/@/.test(String(data.to||'')))to=String(data.to);
        if(data&&!to&&!data.email&&data.role){
          var self929=this,rs929=(S.staff||[]).filter(function(s){return s&&s.role===data.role&&s.email&&(s.employmentStatus||'active')==='active'&&s.active!==false})
            .map(function(s){return s.email});
          if(rs929.length)return Promise.all(rs929.map(function(m){
            return W.call(self929,ev,Object.assign({},data,{email:m,eventId:(data.eventId||ev)+'|'+m}),m)}));
        }
      }catch(_){}
      try{
        data=data||{};''')
R('#91 staff.status copy to CEO',"""        message:body},x.email);
    }
  }catch(_){}""","""        message:body},x.email);
      /* 1004A：寄信清單寫「同時通知本人與 CEO」，程式卻只寄本人；補一封給執行長（role 由寄信層換成 CEO 的 Email） */
      Promise.resolve(kgmNotify('staff.status',{eventId:'staffst-ceo:'+x.empId+':'+to+':'+now(),
        empId:x.empId,name:x.name,from:from,status:to,reason:why||'',role:'ceo',
        subject:z()?('員工任職狀態異動：'+(x.name||x.empId)):('Staff status change: '+(x.name||x.empId)),message:body})).catch(function(){});
    }
  }catch(_){}""")
open('p_f_misc.js','w').write(hdr+'\n'.join(out)+'\n')

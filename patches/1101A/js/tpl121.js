/* ══ 1121A Q7（使用者：「圖三那裡我希望可以有fill in template然後AI都會把template預設好，系統會根據situtation給出最適合的template」）══
   案件處理中心 → 處理案件 → 「給旅客的說明」(#k7cMsg)：
   ① 上面一排範本（依案件類別＋目前選的狀態，排第一個的＝系統建議）；
   ② 欄位是空的時候，站內 AI 直接把「最適合的範本」填好（旅客姓名、案件編號、航班、日期、行李牌號都代入；
      資料裡沒有的地方用〔 〕標出來，送出前一定要改）；
   ③ 改了「狀態」下拉：如果說明欄還是系統填的那段（沒有人改過），自動換成新狀態的範本；有人改過就不動，只更新範本列。
   不另做一套案件系統：讀同一筆案件 S.staffCasesR1007A（caseNo），送出照原本 kgmCase7Update。 */
(function(){
  if(window.__tpl121)return;window.__tpl121=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  /* [id, 名稱, 適用狀態（*＝任何）, 內容] */
  var T={
    bag_delayed:[
      ['bd_rcv','受理・追蹤中','received investigating','{name} 您好：\n我們已受理您搭乘 {flight} 行李未隨機抵達的通報（案件編號 {no}，行李牌 {tag}）。目前已透過全球行李追蹤系統（WorldTracer）查詢，找到後將免費送到您登記的地址，並以 Email 通知您。\n等待期間如需購買盥洗用品等必需品，請保留收據，可依本公司規定申請臨時生活費補償。'],
      ['bd_info','請旅客補資料','awaiting_customer','{name} 您好：\n為加快尋找您的行李（案件 {no}），請回覆以下資料：① 行李外觀（顏色、品牌、尺寸）照片；② 內容物清單；③ 可收件的地址與時段。收到後我們會立即更新追蹤。'],
      ['bd_done','已送達・結案','closed','{name} 您好：\n您的行李（行李牌 {tag}）已於〔送達日期〕送達您指定的地址，本案件 {no} 予以結案。若開箱後發現損壞或物品短少，請於 7 日內回覆本案件，我們會另行處理。造成您的不便，深感抱歉。']],
    bag_lost:[
      ['bl_rcv','受理・持續追蹤','received investigating','{name} 您好：\n我們已受理您 {flight} 行李遺失的通報（案件編號 {no}，行李牌 {tag}），並已在全球行李追蹤系統登錄。行李自通報日起 21 天內持續追蹤；21 天後仍未尋獲，將依蒙特婁公約辦理賠償。'],
      ['bl_info','請提供理賠資料','awaiting_customer','{name} 您好：\n您的行李（案件 {no}）已追蹤滿 21 天仍未尋獲，我們將進入理賠程序。請提供：① 內容物清單與價值；② 可提供的購買證明；③ 收款帳戶資料。'],
      ['bl_done','理賠完成・結案','closed','{name} 您好：\n您的行李遺失理賠（案件 {no}）已核定為〔金額〕，將於 7 至 14 個工作天內匯入您提供的帳戶。再次為行李未能妥善送達向您致歉。']],
    bag_damaged:[
      ['bdm_rcv','受理・評估','received investigating','{name} 您好：\n我們已受理您 {flight} 行李損壞的通報（案件編號 {no}）。請於 7 日內提供損壞處照片與維修估價單，我們將依規定評估維修或賠償。'],
      ['bdm_done','核定・結案','closed','{name} 您好：\n經評估，您的行李損壞（案件 {no}）核定〔維修費用／更換補償〕〔金額〕，將於 7 至 14 個工作天內匯款。感謝您的耐心與配合。']],
    disruption:[
      ['dis_rcv','致歉・確認補償資格','received investigating','{name} 您好：\n對於 {flight} 延誤／取消造成您的不便，我們深感抱歉。我們已受理您的案件（編號 {no}），正在確認延誤原因與您可適用的補償，將於 7 個工作天內回覆。'],
      ['dis_comp','符合補償','closed','{name} 您好：\n經查 {flight} 延誤原因屬本公司可控制因素，依本公司規定提供〔補償內容，例：NT$〔金額〕或 〔哩程〕哩〕，將於 7 個工作天內入帳。再次為行程受影響致歉。'],
      ['dis_nocomp','不符合現金補償（天候／航管）','closed','{name} 您好：\n經查 {flight} 延誤原因為〔天候／航管〕，屬不可抗力因素，依規定不適用現金補償；我們已依本公司規定於現場提供〔餐券／住宿〕。若您仍有額外支出，請檢附收據回覆本案件 {no}，我們會個別評估。'],
      ['dis_info','請提供收據／帳戶','awaiting_customer','{name} 您好：\n為辦理 {flight} 延誤的費用補償（案件 {no}），請回覆額外支出的收據照片與收款帳戶資料。']],
    complaint:[
      ['cp_rcv','致歉・調查中','received investigating','{name} 您好：\n感謝您告訴我們在 {flight} 的經驗，對於造成您的不愉快我們深感抱歉。您的意見已轉交相關單位調查（案件編號 {no}），我們將於 7 個工作天內回覆處理結果。'],
      ['cp_done','調查結果・誠意補償','closed','{name} 您好：\n經內部調查，〔調查結果〕。我們已針對相關同仁加強教育訓練。為表達歉意，已於您的會員帳戶存入 〔哩程〕 哩。期待未來有機會再為您提供更好的服務。']],
    refund_req:[
      ['rf_rcv','受理・審核中','received investigating','{name} 您好：\n我們已收到您的退款申請（案件編號 {no}，訂位 {pnr}），目前由客服初審，通過後送執行長核准，預計 7 個工作天內完成。'],
      ['rf_ok','核准退款','closed','{name} 您好：\n您的退款申請（案件 {no}）已核准，退款金額 〔金額〕（已扣除〔手續費〕），將退回原付款信用卡，入帳時間依發卡銀行約 7 至 14 個工作天。'],
      ['rf_no','不符退款規定','closed','{name} 您好：\n很抱歉，依您所購票價方案〔方案名稱〕的規定，本次申請不符合退款條件（案件 {no}）。未使用的機場稅與燃油附加費仍可退還，如需辦理請回覆本案件。']],
    invol_downgrade:[
      ['dg_done','非自願降艙補償','*','{name} 您好：\n對於 {flight} 因〔原因〕將您由〔原艙等〕調整至〔新艙等〕，我們深感抱歉。依本公司規定，將退還艙等差價 〔金額〕 並另贈 〔哩程〕 哩，款項於 7 至 14 個工作天退回原付款方式（案件 {no}）。']],
    denied_boarding:[
      ['db_done','拒絕登機補償','*','{name} 您好：\n對於 {flight} 因超賣未能讓您登機，我們誠摯致歉。已為您改搭〔新航班〕，並依規定提供 〔補償金額／抵用券〕（案件 {no}）。']],
    seat_dup:[['sd_done','座位重複・致歉','*','{name} 您好：\n對於 {flight} 機上座位重複造成的困擾，我們深感抱歉。已退還您的選位費 〔金額〕，並贈送 〔哩程〕 哩表示歉意（案件 {no}）。']],
    onboard_service:[['ob_rcv','機上服務事件','*','{name} 您好：\n感謝您反映 {flight} 機上〔事件〕。我們已通知客艙部門了解（案件 {no}），將於 7 個工作天內回覆處理結果。']],
    medical:[['md_rcv','關心・後續協助','*','{name} 您好：\n得知您在 {flight} 身體不適，希望您已經好轉。我們已登錄此事件（案件 {no}）；若有就醫費用，請檢附診斷證明與收據回覆本案件，我們將協助後續處理。']],
    assistance:[['as_ok','特殊協助已安排','*','{name} 您好：\n您於 {flight} 申請的〔輪椅／協助項目〕已安排完成（案件 {no}）。請於起飛前 2 小時至櫃檯報到，地勤人員會在報到櫃檯協助您。']],
    item_lost:[
      ['il_rcv','遺失物協尋中','received investigating awaiting_customer','{name} 您好：\n我們已受理您在 {flight} 遺失物品的協尋（案件 {no}），已通知機上與機場遺失物中心查找，若尋獲會立即通知您。'],
      ['il_found','已尋獲','closed','{name} 您好：\n您的遺失物品已尋獲（案件 {no}），可至〔機場／櫃檯〕領取，或回覆本案件安排寄送（運費由您負擔）。']],
    miles_claim:[['mc_done','里程補登','*','{name} 您好：\n您 {flight} 的里程補登申請（案件 {no}）已完成，補登 〔哩程〕 哩，將於 3 個工作天內顯示在會員帳戶。']],
    pet:[
      ['pt_ok','寵物同行核准','*','{name} 您好：\n您的寵物同行申請（案件 {no}，{flight}）已核准。請攜帶健康證明與狂犬病疫苗證明，於起飛前 2 小時至櫃檯報到並支付運送費用。'],
      ['pt_no','寵物同行未核准','closed','{name} 您好：\n很抱歉，{flight} 的寵物名額已滿（案件 {no}），本次申請未能核准。如需改搭其他航班，請回覆本案件，我們協助您確認名額。']],
    other:[]
  };
  var GEN=[['g_rcv','已受理（通用）','received investigating','{name} 您好：\n我們已受理您的案件（編號 {no}），目前正在處理中，將於 7 個工作天內回覆您。'],
           ['g_info','請旅客補資料（通用）','awaiting_customer','{name} 您好：\n為處理您的案件（編號 {no}），請回覆〔所需資料〕，收到後我們會立即接續處理。'],
           ['g_done','處理完成（通用）','closed','{name} 您好：\n您的案件（編號 {no}）已處理完成：〔處理結果〕。如有其他問題，歡迎隨時與我們聯繫。']];
  T.refund=T.refund_req;T.customer_refund=T.refund_req;
  function rec(no){return (S.staffCasesR1007A||[]).filter(function(x){return x&&x.caseNo===no})[0]||null}
  function nm(c){var n=String(c.paxName||c.name||'').trim();if(!n)return '旅客';var p=n.split(/\s*\/\s*/);return p.length>1?(p[0]+' '+p[1]):n}
  function fill(t,c){var g=c.segment||((c.segments||[])[0])||{},bag=c.bag||{};
    var v={name:nm(c),no:c.caseNo||'',pnr:c.pnr||'〔訂位代號〕',tag:bag.tag||'〔行李牌號〕',flight:g.code?(g.code+'（'+(g.fr||'')+'→'+(g.to||'')+(g.date?' '+g.date:'')+'）'):'〔航班〕'};
    return t.replace(/\{(\w+)\}/g,function(_,k){return v[k]!=null?v[k]:''})}
  function list(c,st){var L=(T[c.type]||[]).concat(GEN);
    /* 站內 AI 挑最適合的：狀態相符優先；延誤類看詳情有沒有「天候／航管」→ 不補償那段排前面 */
    var d=String(c.detail||'')+' '+((c.notes||[]).map(function(n){return n.text}).join(' '));
    function sc(x){var s=0;if(x[2]==='*'||(' '+x[2]+' ').indexOf(' '+st+' ')>=0)s+=10;if(/^g_/.test(x[0]))s-=3;
      if(x[0]==='dis_nocomp'&&/天候|颱風|航管|weather|ATC|不可抗力/.test(d))s+=4;if(x[0]==='dis_comp'&&/機械|故障|組員|technical|crew/.test(d))s+=4;if(x[0]==='rf_no'&&/不可退|不符|non-?refundable/i.test(d))s+=3;return s}
    return L.map(function(x,i){return {x:x,s:sc(x),i:i}}).sort(function(a,b){return b.s-a.s||a.i-b.i}).map(function(o){return o.x})}
  var AUTO={};   /* caseNo → 系統填的那段（判斷有沒有人改過） */
  function paint(){try{var ta=document.getElementById('k7cMsg');if(!ta)return;var box=ta.closest('.k7c-full')||ta.parentElement;
      var btn=box&&box.parentElement&&box.parentElement.querySelector('[onclick*="kgmCase7Assign("],[onclick*="kgmCase7Update("]');var m=btn&&/kgmCase7(?:Assign|Update)\('([^']+)'/.exec(btn.getAttribute('onclick')||'');
      if(!m){var all=document.querySelector('[onclick*="kgmCase7Update("]');m=all&&/kgmCase7Update\('([^']+)'/.exec(all.getAttribute('onclick')||'')}
      var c=m&&rec(m[1]);if(!c)return;var sel=document.getElementById('k7cSt'),st=(sel&&sel.value)||c.status||'received',key=c.caseNo+'|'+st;
      var L=list(c,st),bar=box.querySelector('.tpl121');
      if(!bar||bar.getAttribute('data-k')!==key){if(bar)bar.remove();bar=document.createElement('div');bar.className='tpl121';bar.setAttribute('data-k',key);
        bar.innerHTML='<span>'+(z()?'範本':'Templates')+'</span>'+L.slice(0,6).map(function(x,i){return '<button type="button" data-t="'+E(x[0])+'"'+(i===0?' class="best"':'')+'>'+(i===0?'★ ':'')+E(x[1])+'</button>'}).join('')+'<em>'+(z()?'★＝系統依案件類別與狀態建議；〔 〕內要改成實際內容':'★ suggested; replace text in 〔 〕')+'</em>';
        box.insertBefore(bar,ta);
        bar.addEventListener('click',function(e){var b=e.target.closest('button[data-t]');if(!b)return;var x=L.filter(function(y){return y[0]===b.getAttribute('data-t')})[0];if(!x)return;var t=fill(x[3],c);ta.value=t;AUTO[c.caseNo]=t;ta.focus();[].forEach.call(bar.querySelectorAll('button'),function(q){q.classList.toggle('on',q===b)})});
        var cur=ta.value.trim();if(!cur||cur===String(AUTO[c.caseNo]||'').trim()){var t=fill(L[0][3],c);ta.value=t;AUTO[c.caseNo]=t;var b0=bar.querySelector('button.best');if(b0)b0.classList.add('on')}}
      if(sel&&!sel.__tpl121){sel.__tpl121=1;sel.addEventListener('change',function(){setTimeout(paint,0)})}}catch(e){try{console.warn('tpl121',e)}catch(_){}}}
  setInterval(paint,700);
  try{var st=document.createElement('style');st.textContent='.tpl121{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 8px}.tpl121>span{font-size:11px;font-weight:800;letter-spacing:.12em;color:#9A8A62}.tpl121 button{border:1px solid #DCD3BE;background:#FBFAF6;border-radius:999px;padding:4px 11px;font:inherit;font-size:12px;color:#33413a;cursor:pointer}.tpl121 button.best{border-color:#C9A24F;color:#7a5608;font-weight:700}.tpl121 button.on{background:#0B3D2E;border-color:#0B3D2E;color:#fff}.tpl121>em{flex-basis:100%;font-style:normal;font-size:11px;color:#8A8F86}';(document.head||document.documentElement).appendChild(st)}catch(_){}
  window.kgmCaseTplR1121A={list:list,fill:fill};
})();

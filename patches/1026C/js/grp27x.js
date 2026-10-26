
/* 1026C：團體旅客不能網路報到（出發當日由領隊或全體旅客到機場櫃檯辦理） */
(function(){function ciWrap(){var O=window.kgmCheckinSegR60;if(typeof O!=='function'||O.__grp27)return;
  var w=function(pnr){try{var b=(S.bookings||[]).filter(function(x){return x&&x.pnr===pnr})[0];if(b&&b.groupR1025B){alert((typeof LANG!=='undefined'&&LANG==='en')?'Group travellers cannot check in online. Please check in at the airport counter on the day of departure with your tour leader or the whole group.':'團體旅客不適用網路報到：請於出發當日由領隊或全體旅客至機場櫃檯辦理劃位與報到。');return}}catch(_){}return O.apply(this,arguments)};
  try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27=1;window.kgmCheckinSegR60=w}
  ciWrap();setTimeout(ciWrap,0);setTimeout(ciWrap,3000);setTimeout(ciWrap,12000)})();
/* 1026C：團體訂位不能用酬賓機票（KGM-GRP-021 第 16 條）—— 團體模式藏「酬賓機票」切換；萬一已切到酬賓就切回現金 */
(function(){try{var st=document.createElement('style');st.id='kgm-grp27x-css';st.textContent='html.kgm-grp25 #app button[onclick^="S.search.useMiles=true"]{display:none!important}';(document.head||document.documentElement).appendChild(st)}catch(_){}
  var rw=function(){var R=window.render;if(typeof R!=='function'||R.__grp27aw)return;var w=function(){try{if(S&&S.search&&S.search.useMiles&&document.documentElement.classList.contains('kgm-grp25'))S.search.useMiles=false}catch(_){}return R.apply(this,arguments)};
    try{Object.keys(R).forEach(function(k){if(!(k in w))w[k]=R[k]})}catch(_){}w.__grp27aw=1;try{render=w}catch(_){}window.render=w};
  setTimeout(rw,0);setTimeout(rw,4000)})();
/* 1026C：團體訂位不能參加 Residence 競標（使用者：「團體無法參與Residence競標喔」；KGM-GRP-021 第 16 條）
   ① 團體模式訂票頁不顯示「可參與 Residence 里程競標」與現金競標區塊；② 團體票價代號（Q／U）不算可出價航段（里程競標頁不列）；
   ③ 現金出價、里程出價的送出入口再擋一次（團體模式或手上的票是團體代號） */
(function(){
  function grpOn(){try{return document.documentElement.classList.contains('kgm-grp25')||!!(S&&S.search&&S.search.grp25)}catch(_){return false}}
  function isGC(c){try{return !!(c&&FARES[c]&&FARES[c].groupPlanR1026C)}catch(_){return false}}
  /* 會員在這一班這一天手上的票全是團體代號 → 不能出價（有一般票就照舊規則） */
  function onlyGrp(code,date){try{if(!S.user||!code||!date)return false;var g=0,n=0;(S.bookings||[]).forEach(function(b){if(!b||b.status==='cancelled'||(b.userId&&b.userId!==S.user.id))return;
      [[b.outF,b.outC],[b.inbF,b.inbC]].concat((b.mcFlights||[]).map(function(m){return [m&&m.f,m&&m.c]})).forEach(function(x){var f=x[0];if(!f||f.code!==code||f.date!==date)return;if(isGC(x[1])||b.groupR1025B)g++;else n++})});return g>0&&n===0}catch(_){return false}}
  function no(){alert((typeof LANG!=='undefined'&&LANG==='en')?'Group fares are not eligible for The Residence bidding.':'團體票不適用 Residence 競標（現金與哩程皆不可出價）。')}
  try{var st=document.createElement('style');st.id='kgm-grp27r-css';
    st.textContent='html.kgm-grp25 .k920-resbid,html.kgm-grp25 .k89-res{display:none!important}'
      /* 規章閱讀視窗手機版：進度條一整列、「關閉」「我同意」並排同寬、提示置中（原本「我同意」被擠到下一行單獨一顆） */
      +'@media(max-width:560px){.k914-polfoot{display:grid!important;grid-template-columns:1fr 1fr;gap:10px;align-items:center}'
      +'.k914-polfoot .k914-polprog{grid-column:1/-1;min-width:0;width:100%}.k914-polfoot button{width:100%;min-height:44px;margin:0!important;font-size:14px}'
      +'.k914-polfoot .k914-polhint{grid-column:1/-1;text-align:center}.k914-polbox>header p{font-size:10px;line-height:1.6}'
      +'.k914-polbox table.t{font-size:12px}.k914-polbox table.t th,.k914-polbox table.t td{padding:6px 7px!important}}';
    (document.head||document.documentElement).appendChild(st)}catch(_){}
  function arm(){
    var E=window.kgmResEligR922;if(typeof E==='function'&&!E.__grp27r){var e=function(t,c){if(isGC(c))return false;return E.apply(this,arguments)};e.__grp27r=1;window.kgmResEligR922=e}
    ['kgmResSubmitR89','kgmResidenceBidR83','kgmResMileBidR161'].forEach(function(n){var O=window[n];if(typeof O!=='function'||O.__grp27r)return;
      var w=function(o){try{if(grpOn()||(n==='kgmResSubmitR89'&&S.outF&&isGC(S.outC))||(o&&o.f&&onlyGrp(o.f.code,o.date))){no();return n==='kgmResSubmitR89'?null:{ok:false,why:(typeof LANG!=='undefined'&&LANG==='en')?'Group fares are not eligible.':'團體票不適用 Residence 競標。'}}}catch(_){}return O.apply(this,arguments)};
      try{Object.keys(O).forEach(function(k){if(!(k in w))w[k]=O[k]})}catch(_){}w.__grp27r=1;window[n]=w});
    var B=window.kgmResFareBadgeR920;if(typeof B==='function'&&!B.__grp27r){var bw=function(){if(grpOn()){try{document.querySelectorAll('.k920-resbid').forEach(function(n){n.remove()})}catch(_){}return 0}return B.apply(this,arguments)};bw.__grp27r=1;window.kgmResFareBadgeR920=bw}
  }
  arm();setTimeout(arm,0);setTimeout(arm,3000);setTimeout(arm,12000)})();

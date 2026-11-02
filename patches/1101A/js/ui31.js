/* ══ 1103A：前台航班動態——在出發地／目的地搜尋框打字時，上方「機場看板／依航線／依航班號」整排會閃一下（使用者圖一）══
   原因：每打一個字（kgmStApQueryR929）就整頁 render()，分頁按鈕整排重畫。改成只換掉那個航點選單（搜尋框與清單），游標留在原位。 */
(function(){
  if(window.__ui31)return;window.__ui31=1;
  var tm=null;
  function hook(){var O=window.kgmStApQueryR929;if(typeof O!=='function'||O.__ui31)return;
    var w=function(v){S._stApQR929=String(v==null?'':v);var which=S._stApOpenR929;if(tm)clearTimeout(tm);
      tm=setTimeout(function(){tm=null;try{var box=document.querySelector('.k929-stpick');var inp=box&&box.querySelector('#k158q');
          if(!box||!inp||!which||typeof kgmStPickerR929!=='function'){try{render()}catch(_){}return}
          var cell=null;[].forEach.call(box.children,function(c){if(c.querySelector&&c.querySelector('#k158q'))cell=c});
          if(!cell){try{render()}catch(_){}return}
          var lab=cell.querySelector('.fs20-k'),pos=inp.selectionStart;var tmp=document.createElement('div');tmp.innerHTML=kgmStPickerR929(which);
          [].slice.call(cell.childNodes).forEach(function(n){if(n!==lab)cell.removeChild(n)});[].slice.call(tmp.childNodes).forEach(function(n){cell.appendChild(n)});
          var ni=cell.querySelector('#k158q');if(ni){ni.focus();try{var n=ni.value.length;ni.setSelectionRange(pos==null?n:Math.min(pos,n),pos==null?n:Math.min(pos,n))}catch(_){}}
        }catch(_){try{render()}catch(__){}}},110)};
    w.__ui31=1;window.kgmStApQueryR929=w}
  hook();setTimeout(hook,0);setTimeout(hook,3000);
})();

/* ══ 1103A：航班資料（座位圖、名單）按一下就跳回最上面（使用者：「航班資料座位圖不要每次按完表格都跳回表格最上面」）══
   原因：座位圖 .r7-seatmap 與旅客名單 .r7-manifest 是自己有捲軸的框（max-height:720px; overflow:auto）；
   航班資料頁任何按鈕都整頁 render()，框被換成新的、捲動位置歸零 → 跳回最上面。
   重畫後別層會再晚一點把座位圖補完（高度變回原本），瀏覽器又自動挪一次 → 重畫後 4 秒內，框的高度回到重畫前那樣就再放回原位（重畫前若框還在補完中，記的是補完前的位置）。
   另外點旅客（openOpsPaxR7）會把名單那一列 scrollIntoView（smooth、置中；主執行緒忙時會晚好幾秒才跑），連整個視窗一起被拉走 → 航班資料頁名單框裡的列：只在那一列不在名單框可見範圍時捲名單框本身，不動整個視窗。
   使用者自己捲（滾輪、觸控、鍵盤、按住捲軸）就不再動。只在航班資料頁、同一班航班。 */
(function(){
  if(window.__ui31s)return;window.__ui31s=1;
  var SEL=['.r7-seatmap','.r7-manifest'],lastUser=0,G=null;
  ['wheel','touchmove','keydown'].forEach(function(ev){try{window.addEventListener(ev,function(){lastUser=Date.now()},{passive:true,capture:true})}catch(_){}});
  try{window.addEventListener('mousedown',function(e){var t=e.target;if(t&&t.matches&&SEL.some(function(q){return t.matches('#app '+q)}))lastUser=Date.now()},{passive:true,capture:true})}catch(_){}
  function onFd(){try{return S.view==='admin'&&S.adminTab==='flightdata'}catch(_){return false}}
  function boxes(q){return document.querySelectorAll('#app '+q)}
  function snap(){var g=(G&&lastUser<G.t0&&Date.now()-G.t0<4000)?G.o:null,o={};SEL.forEach(function(q){var a=g&&g[q]||[];o[q]=[].map.call(boxes(q),function(e,i){var v=a[i];if(v&&e.scrollHeight!==v[2])return v;return [e.scrollTop,e.scrollLeft,e.scrollHeight]})});return o}
  function put(o,strict){SEL.forEach(function(q){var a=o[q]||[];[].forEach.call(boxes(q),function(e,i){var v=a[i];if(!v||(!v[0]&&!v[1]))return;if(strict&&e.scrollHeight!==v[2])return;
    if(Math.abs(e.scrollTop-v[0])>1)e.scrollTop=v[0];if(Math.abs(e.scrollLeft-v[1])>1)e.scrollLeft=v[1]})})}
  function guard(o,k0){var g={o:o,t0:Date.now(),k:k0};G=g;var n=0;
    var tick=function(){if(G!==g)return;if(lastUser>g.t0||!onFd()||S.opsSelectedR7!==g.k||Date.now()-g.t0>4000){G=null;return}try{put(g.o,true)}catch(_){}if(++n<40)setTimeout(tick,100)};
    try{requestAnimationFrame(tick)}catch(_){setTimeout(tick,16)}}
  try{var SIV=Element.prototype.scrollIntoView;if(SIV&&!SIV.__ui31s){var nv=function(a){
      if(this&&this.tagName==='TR'&&this.closest&&onFd()){var box=this.closest('#app .r7-manifest');
        if(box){if(!box.offsetParent)return;var br=box.getBoundingClientRect(),r=this.getBoundingClientRect(),th=box.querySelector('thead'),hh=th?th.offsetHeight:0;
          if(r.top>=br.top+hh&&r.bottom<=br.bottom)return;
          box.scrollTop=Math.max(0,box.scrollTop+(r.top-br.top)-box.clientHeight/2+r.height/2);
          if(G)G.o['.r7-manifest']=[].map.call(boxes('.r7-manifest'),function(e){return [e.scrollTop,e.scrollLeft,e.scrollHeight]});return}}
      return SIV.apply(this,arguments)};nv.__ui31s=1;Element.prototype.scrollIntoView=nv}}catch(_){}
  function hook(){var R0=window.render;if(typeof R0==='function'&&!R0.__ui31s){
      var w=function(){if(!onFd())return R0.apply(this,arguments);var k0=S.opsSelectedR7,o=snap();var r=R0.apply(this,arguments);try{if(onFd()&&S.opsSelectedR7===k0){put(o,false);guard(o,k0)}}catch(_){}return r};
      try{Object.keys(R0).forEach(function(k){if(!(k in w))w[k]=R0[k]})}catch(_){}w.__ui31s=1;window.render=w;try{render=w}catch(_){}}}
  hook();setTimeout(hook,0);setTimeout(hook,3000);setTimeout(hook,10000);
})();

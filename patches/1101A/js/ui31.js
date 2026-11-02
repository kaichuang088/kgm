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

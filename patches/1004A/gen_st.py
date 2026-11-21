import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
hdr='''/* 1004A · 前台航班動態：航點選擇改成跟訂票頁同一個元件（可搜尋城市／代碼），加上出發地／目的地交換鈕 */
'''
R('#79 status picker','<div style="display:grid;grid-template-columns:1fr 1fr 160px;gap:8px;margin-bottom:10px">\n        <div><label style="font-size:11px;color:var(--sub);display:block;margin-bottom:2px">${t("from")}</label><select class="inp" onchange="S.stFr=this.value;render()">${cityOpts(S.stFr)}</select></div>\n        <div><label style="font-size:11px;color:var(--sub);display:block;margin-bottom:2px">${t("to")}</label><select class="inp" onchange="S.stTo=this.value;render()">${cityOpts(S.stTo)}</select></div>',
'<div style="display:grid;grid-template-columns:minmax(0,1fr) 40px minmax(0,1fr) 160px;gap:8px;margin-bottom:10px;align-items:end" class="k929-stpick">\n        <div><label style="font-size:11px;color:var(--sub);display:block;margin-bottom:2px">${t("from")}</label>${kgmStPickerR929("fr")}</div>\n        <div style="padding-bottom:6px"><button title="${LANG==="en"?"Swap":"交換出發地與目的地"}" onclick="var x=S.stFr;S.stFr=S.stTo;S.stTo=x;S._stApOpenR929=null;render()" style="width:37px;height:37px;border-radius:50%;border:1px solid var(--border);background:#fff;cursor:pointer;color:var(--g);font-size:15px">&#8644;</button></div>\n        <div><label style="font-size:11px;color:var(--sub);display:block;margin-bottom:2px">${t("to")}</label>${kgmStPickerR929("to")}</div>')
R('#79 picker fn','function apPickerHTML(which){','''/* 1004A：使用者「前台的航班動態航點搜尋改的跟搜尋頁面一樣，然後有那個交換出發地和目的地的按鈕」。
   直接借用訂票頁的 apPickerHTML（同一個清單、同一個搜尋與別名），只是把讀寫的欄位換成航班動態自己的 S.stFr／S.stTo。 */
function kgmStPickerR929(which){
  var sv=S.search,so=S._apOpen,sq=S._apQ,html='';
  try{
    S.search=Object.assign({},sv||{},{fr:S.stFr,to:S.stTo});S._apOpen=S._stApOpenR929||null;S._apQ=S._stApQR929||'';
    html=String(apPickerHTML(which));
  }finally{S.search=sv;S._apOpen=so;S._apQ=sq}
  return html.split("S.search."+which+"=").join(which==="fr"?"S.stFr=":"S.stTo=")
    .split(";S.openFare=null").join(";S.stOff=0")
    .split("S._apOpen").join("S._stApOpenR929").split("S._apQ").join("S._stApQR929")
    /* 執行時訂票頁的航點選單已由 r158 改寫（kgmApOpenR158／kgmApPickR158／kgmApQueryR158 直接改 S.search），換成航班動態自己的版本 */
    .split("kgmApOpenR158(").join("kgmStApOpenR929(").split("kgmApPickR158(").join("kgmStApPickR929(").split("kgmApQueryR158(").join("kgmStApQueryR929(");
}
function kgmStFocusR929(){[0,40,140].forEach(function(ms){setTimeout(function(){try{var el=document.querySelector('.k929-stpick #k158q');if(el&&document.activeElement!==el){el.focus();var n=el.value.length;el.setSelectionRange(n,n)}}catch(_){}},ms)})}
window.kgmStApOpenR929=function(which){S._stApOpenR929=(S._stApOpenR929===which)?null:which;S._stApQR929='';render();if(S._stApOpenR929)kgmStFocusR929()};
window.kgmStApPickR929=function(which,a){if(which==='fr')S.stFr=a;else S.stTo=a;S._stApOpenR929=null;S._stApQR929='';S.stOff=0;render()};
var T929st=null;
window.kgmStApQueryR929=function(v){S._stApQR929=String(v==null?'':v);if(T929st)clearTimeout(T929st);T929st=setTimeout(function(){T929st=null;try{render()}catch(_){}kgmStFocusR929()},110)};
function apPickerHTML(which){''')
open('p_f_st.js','w').write(hdr+'\n'.join(out)+'\n')

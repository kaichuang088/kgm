/* 0927D · 航點輸入：英文城市名、兩個機場的城市依另一端對應（TSA↔HND/GMP/SHA；TPE→NRT/ICN/PVG） */
const SNIPAP=require('fs').readFileSync(require('path').join(__dirname,'snip_ap.js'),'utf8');
RL('ap resolver','#/* 0920E：航點改回「分別輸入」',
"function resolveApt920F(v){\n  v=String(v||'').trim();if(!v)return '';\n  var up=v.toUpperCase(),list=aptCodes920F();\n  if(/^[A-Z]{3}$/.test(up)&&(!list.length||list.indexOf(up)>=0))return up;\n  var hit='';\n  list.forEach(function(k){\n    if(hit)return;\n    var zh=aptZh920F(k);\n    if(zh&&(zh===v||String(zh).indexOf(v)===0))hit=k;\n  });\n  if(!hit&&/^[A-Z]{3}$/.test(up))hit=up;\n  return hit;\n}\n",
SNIPAP,1);
/* 兩端都選好時：用城市名輸入的那一端，依另一端重新對應（例：先打 Tokyo 當出發地、再選 TSA → HND） */
RL('ap pick remap','#/* 0920E：航點改回「分別輸入」',
"  if(which==='fr')st.fr=code;else st.to=code;\n  if(st.fr&&st.to){\n    var a=st.fr,b=st.to;S.aiRoute920F=null;",
"  if(which==='fr')st.fr=code;else st.to=code;\n  if(!st.keepCands927D){if(which==='fr')st.frCands927D=null;else st.toCands927D=null}\n  st.keepCands927D=false;\n  if(st.fr&&st.to){\n    /* 0927D：用城市名輸入的那一端，依另一端重新對應 */\n    if(st.frCands927D&&st.frCands927D.length>1)st.fr=pickAp927D(st.frCands927D,st.to)||st.fr;\n    if(st.toCands927D&&st.toCands927D.length>1)st.to=pickAp927D(st.toCands927D,st.fr)||st.to;\n    var a=st.fr,b=st.to;S.aiRoute920F=null;",1);
RL('ap input other','#/* 0920E：航點改回「分別輸入」',
"  var code=resolveApt920F(v);\n  if(!code){st.msg=(izI()?'查不到這個城市或機場：':'Unknown city or airport: ')+v;",
"  var cs927D=cands927D(v);\n  var code=resolveApt920F(v,which==='fr'?st.to:st.fr);\n  if(which==='fr')st.frCands927D=cs927D;else st.toCands927D=cs927D;\n  st.keepCands927D=true;\n  if(!code){st.msg=(izI()?'查不到這個城市或機場：':'Unknown city or airport: ')+v;",1);
/* 快速按鈕：出發地是松山時，東京／首爾的按鈕直接給羽田／金浦 */
RL('ap quick map','#/* 0920E：航點改回「分別輸入」',
"  var quick=st.fr?['NRT','KIX','HKG','ICN','BKK','SIN','LAX']:['TPE','TSA','KHH','HKG','NRT'];",
"  var quick=st.fr?['NRT','KIX','HKG','ICN','BKK','SIN','LAX']:['TPE','TSA','KHH','HKG','NRT'];\n  /* 0927D：依已選的出發地對應同城市的另一個機場（TSA 出發：NRT→HND、ICN→GMP） */\n  if(st.fr)quick=quick.map(function(a){\n    for(var i=0;i<CITY927D.length;i++)if(CITY927D[i].aps.indexOf(a)>=0)return pickAp927D(CITY927D[i].aps,st.fr)||a;\n    return a;\n  }).filter(function(a,i,arr){return a!==st.fr&&arr.indexOf(a)===i});",1);
/* 輸入框提示也寫出英文可用 */
RL('ap placeholder','#/* 0920E：航點改回「分別輸入」',
"    +(izI()?'台北 或 TPE':'Taipei or TPE')+'\" onkeydown=",
"    +(izI()?'台北、Taipei 或 TPE':'Taipei, 台北 or TPE')+'\" onkeydown=",1);
const SNIPAP2=require('fs').readFileSync(require('path').join(__dirname,'snip_ap2.js'),'utf8').replace(/\n$/,'');
RL('ap free text','#/* 0920E：航點改回「分別輸入」',
"function parseRouteI(t){var u=t.toUpperCase(),m=u.match(/\\b([A-Z]{3})\\s*(?:-|→|TO)\\s*([A-Z]{3})\\b/);if(m)return [m[1],m[2]];var names={台北:'TPE',桃園:'TPE',東京:'NRT',成田:'NRT',大阪:'KIX',關西:'KIX',洛杉磯:'LAX',曼谷:'BKK',新加坡:'SIN',香港:'HKG',倫敦:'LHR'};var keys=Object.keys(names),hits=[];keys.forEach(function(k){var at=t.indexOf(k);if(at>=0)hits.push([at,names[k]])});hits.sort(function(a,b){return a[0]-b[0]});return hits.length>=2?[hits[0][1],hits[1][1]]:null}",
SNIPAP2,1);
/* 前台航點選單：打 Tokyo 時成田、羽田同分，原本照字母排（HND 在前）。改成依另一端：桃園出發成田在前、松山出發羽田在前 */
RL('picker pref','kgm-0908a-r158',
"        return rank158(a,q)-rank158(b,q)||String(a).localeCompare(String(b))});",
"        return rank158(a,q)-rank158(b,q)||pref927D(b)-pref927D(a)||String(a).localeCompare(String(b))});",1);
RL('picker pref fn','kgm-0908a-r158',
"      aps=aps.slice().sort(function(a,b){",
"      /* 0927D：同一個城市的兩個機場，依另一端排「建議」的在前 */\n      var other927D=(which==='fr')?s.to:s.fr;\n      var pref927D=function(a){\n        try{var G=window.kgmAptGroupsR927D||[];for(var i=0;i<G.length;i++)if(G[i].aps.indexOf(a)>=0)return window.kgmAptPickR927D(G[i].aps,other927D)===a?1:0}catch(_){}\n        return 0;\n      };\n      aps=aps.slice().sort(function(a,b){",1);
/* r224（打字時就地篩選、不重畫）也有自己的排序，一樣加上「依另一端的建議機場在前」 */
RL('r224 pref','kgm-0909D-r224',
"          return a.r-b.r||String(a.n.textContent).localeCompare(String(b.n.textContent));",
"          return a.r-b.r||pref927D(b.n)-pref927D(a.n)||String(a.n.textContent).localeCompare(String(b.n.textContent));",1);
RL('r224 pref fn','kgm-0909D-r224',
"    var kids=[].slice.call(p.children);\n    var shown=0,group=null,groupHits=[];",
"    var kids=[].slice.call(p.children);\n    var shown=0,group=null,groupHits=[];\n    /* 0927D：同一個城市的兩個機場，依另一端（TSA↔HND/GMP/SHA；其餘→NRT/ICN/PVG）排建議的在前 */\n    var other927D='';try{other927D=(S._apOpen==='fr')?(S.search||{}).to:(S.search||{}).fr}catch(_){}\n    function pref927D(btn){\n      var b=btn.querySelector('b'),a=b?String(b.textContent||'').trim():'';\n      try{var G=window.kgmAptGroupsR927D||[];for(var i=0;i<G.length;i++)if(G[i].aps.indexOf(a)>=0)return window.kgmAptPickR927D(G[i].aps,other927D)===a?1:0}catch(_){}\n      return 0;\n    }",1);
/* r224 原本把排好的按鈕一個個插到「洲別標題後的第一個按鈕」前面，但那顆按鈕自己也在要搬的名單裡，
   順序會被打亂（實測桃園出發打「東京」變成 HND 在 NRT 前面）。改成從標題後面依序一顆接一顆放。 */
RL('r224 order','kgm-0909D-r224',
"        var ref=group.nextSibling;\n        groupHits.slice().sort(function(a,b){",
"        var after927D=group;\n        groupHits.slice().sort(function(a,b){",1);
RL('r224 order2','kgm-0909D-r224',
"        }).forEach(function(o){p.insertBefore(o.n,ref)});",
"        }).forEach(function(o){p.insertBefore(o.n,after927D.nextSibling);after927D=o.n});",1);

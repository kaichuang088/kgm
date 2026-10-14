/* 0927D：航點輸入（使用者：「航點查詢輸入 Tokyo 居然沒反應，只收東京或是 NRT/HND；
   如果是輸入 TSA 出發的要自動對應到 HND，TPE 優先自動對應到 NRT，ICN 也一樣」）
   · 中文、英文、簡體、三碼都收（Tokyo／東京／东京／NRT）。
   · 一個城市有兩個機場時，看另一端：松山（TSA）↔ 羽田／金浦／虹橋；其餘（含桃園）→ 成田／仁川／浦東。
     先挑「另一端真的有 KGM 航班」的機場，再照上面的規則。 */
var CITY927D=[
  {n:['台北','臺北','taipei'],aps:['TPE','TSA']},
  {n:['東京','东京','tokyo'],aps:['NRT','HND']},
  {n:['首爾','首尔','漢城','汉城','seoul'],aps:['ICN','GMP']},
  {n:['上海','shanghai'],aps:['PVG','SHA']},
  {n:['北京','beijing','peking'],aps:['PEK','PKX']},
  {n:['大阪','osaka'],aps:['KIX','ITM']},
  {n:['曼谷','bangkok'],aps:['BKK','DMK']},
  {n:['紐約','纽约','new york','newyork','nyc'],aps:['JFK','EWR']},
  {n:['洛杉磯','洛杉矶','los angeles','losangeles'],aps:['LAX','ONT']},
  {n:['成都','chengdu'],aps:['CTU','TFU']},
  {n:['倫敦','伦敦','london'],aps:['LHR','LGW']},
  {n:['巴黎','paris'],aps:['CDG','ORY']}
];
/* 市區機場：松山只飛這幾個市區機場，所以兩端互相對應 */
var CITYAP927D={TSA:1,HND:1,GMP:1,SHA:1};
function norm927D(s){
  try{if(typeof window.kgmNormR158==='function')return window.kgmNormR158(s)}catch(_){}
  return String(s==null?'':s).toUpperCase().replace(/[\s　（）()·・,，.．\-]/g,'');
}
function known927D(a){var l=aptCodes920F();return !l.length||l.indexOf(a)>=0}
function served927D(a,b){
  if(!a||!b)return false;
  try{return [].concat(FLIGHTS,(S.customFlights||[])).some(function(f){
    return f&&((f.fr===a&&f.to===b)||(f.fr===b&&f.to===a))})}catch(_){return false}
}
/* 同一個城市的幾個機場，依另一端挑一個 */
function pickAp927D(cands,other){
  cands=(cands||[]).filter(known927D);
  if(!cands.length)return '';
  if(cands.length===1)return cands[0];
  var pool=other?cands.filter(function(a){return served927D(a,other)}):[];
  if(!pool.length)pool=cands;
  var wantCity=!!(other&&CITYAP927D[other]);
  var hit=pool.filter(function(a){return !!CITYAP927D[a]===wantCity})[0];
  return hit||pool[0];
}
window.kgmAptPickR927D=pickAp927D;
/* 把輸入變成候選機場（城市有兩個機場就回兩個，主要機場在前） */
function cands927D(v){
  v=String(v||'').trim();if(!v)return [];
  var up=v.toUpperCase();
  if(/^[A-Z]{3}$/.test(up)&&known927D(up))return [up];
  var n=norm927D(v);if(!n)return [];
  for(var i=0;i<CITY927D.length;i++){
    if(CITY927D[i].n.some(function(x){return norm927D(x)===n}))return CITY927D[i].aps.filter(known927D);
  }
  var list=aptCodes920F(),out=[];
  list.forEach(function(k){
    var zh=norm927D(aptZh920F(k)),en='';
    try{en=norm927D((typeof CITY_EN!=='undefined'&&CITY_EN[k])||'')}catch(_){}
    var ws=[];try{ws=String((typeof CITY_EN!=='undefined'&&CITY_EN[k])||'').split(/[\s,\/]+/).map(norm927D)}catch(_){}
    if((zh&&zh===n)||(en&&en===n))out.unshift(k);
    else if(n.length>=2&&((zh&&zh.indexOf(n)===0)||(en&&n.length>=3&&en.indexOf(n)===0)))out.push(k);
    /* 機場名（成田／Narita、金浦／Gimpo）：中文名裡含、或英文名裡某個字開頭相同 */
    else if((zh&&n.length>=2&&zh.indexOf(n)>0)||(n.length>=4&&ws.some(function(w){return w&&w.indexOf(n)===0})))out.push(k);
  });
  if(out.length>1){
    /* 名稱開頭同時對到兩個以上：同一個城市表裡有的，照表的順序（主要機場在前） */
    for(var j=0;j<CITY927D.length;j++){
      var g=CITY927D[j].aps;
      if(out.every(function(a){return g.indexOf(a)>=0}))return g.filter(function(a){return out.indexOf(a)>=0});
    }
  }
  if(!out.length&&/^[A-Z]{3}$/.test(up))out=[up];
  return out;
}
window.kgmAptCandsR927D=cands927D;
function resolveApt920F(v,other){
  return pickAp927D(cands927D(v),other);
}
window.kgmAptResolveR927D=resolveApt920F;
window.kgmAptGroupsR927D=CITY927D;

/* ══ 1022A：組員國籍與基地（使用者：「組員也要分國籍，可能可以多一些泰國籍，因為KGM很多都需要從泰國出發第五航權第二段，
   所以組員旁邊要標注國籍也要可以透過國籍Filter，泰國的可以讓他們飛BKK航線（所有有關BKK航線可以一半泰國組員一半台灣組員）
   等於說只有BKK可以base在泰國 也可以收其他國家的像是日本籍就讓他多飛日本航班但是base只能在台灣」）
   · 泰籍（TH）：基地曼谷，只飛曼谷航線（起點或終點 BKK），每一班每個職類最多一半（choose）。
     正式員工另外招一批泰籍組員（機師 16、客艙 40，泰文姓名，S.staff，nationality:'TH'，base:'BKK'）；
     虛擬組員依各機型族「曼谷航段占比的一半」抽成泰籍、改用泰文姓名。
   · 日籍（JP）／韓籍（KR）：依姓氏判定，基地台北，日本／韓國航班優先派（排序鍵 natPref22）。
   · 其他：台灣籍（TW）。
   · 員工資料有 nationality 就用它。 ══ */
var TH22F=['Somchai','Somsak','Anan','Kittisak','Chaiwat','Thanakorn','Nattapong','Pongsakorn','Wichai','Prasert','Supachai','Arthit','Krit','Napat','Teerawat','Phuwadol',
  'Siriporn','Pimchanok','Kanokwan','Suda','Malee','Ratchanee','Wanida','Natthida','Chanida','Pornthip','Sasithorn','Jiraporn','Kamonchanok','Thitima','Pattama','Nisa',
  'Apinya','Benjamas','Chutima','Duangjai','Kulap','Lalita','Manee','Orawan','Parichat','Rungnapa','Sukanya','Tassanee','Urai','Waraporn','Yupin','Nantana'];
var TH22L=['Srisuk','Chaiyaporn','Wongsakul','Phongphan','Rattanakorn','Sukprasert','Thongchai','Kittikhun','Boonmee','Saetang','Chantharat','Inthasorn','Srisawat','Phanthong',
  'Jaidee','Kaewmanee','Somboon','Yodkaew','Siriwat','Anantachai','Bunyasit','Charoenkul','Detphong','Intharat','Kongsiri','Limsakul','Meesuk','Noppakhun','Pholsri','Rojanawong',
  'Sangthong','Tanasarn','Thammasak','Udomsak','Wattana','Yensuk','Prasertsri','Chaisiri','Mongkol','Suwannarat','Kasemsuk','Pinyo','Rakchat','Sombat','Thanarat','Visetsak','Wiriya','Panya'];
var JP22={SATO:1,SUZUKI:1,TAKAHASHI:1,TANAKA:1,WATANABE:1,ITO:1,YAMAMOTO:1,NAKAMURA:1,KOBAYASHI:1,KATO:1,YOSHIDA:1,YAMADA:1,SASAKI:1,YAMAGUCHI:1,MATSUMOTO:1,INOUE:1,KIMURA:1,HAYASHI:1,SHIMIZU:1};
var KR22={KIM:1,PARK:1,CHOI:1,JUNG:1,KANG:1,CHO:1,YOON:1,JANG:1};
var NAT22={};
function surNat22(name){var w=String(name||'').trim().split(/\s+/),l=String(w[w.length-1]||'').toUpperCase();return JP22[l]?'JP':KR22[l]?'KR':'TW'}
/* i 在 0～2303 之間一對一（名 i%48、姓 (⌊i/48⌋+7i)%48）；正式員工從 2303 往下用、虛擬組員從 0 往上用，不會同名 */
function thName22(i){i=((i%2304)+2304)%2304;return TH22F[i%TH22F.length]+' '+TH22L[(Math.floor(i/TH22F.length)+i*7)%TH22L.length]}
/* 曼谷航段占比（依機型族，今天起 14 天的機隊排班） */
function bkkShare22(){
  var idx=tailTypeIndex(),t0=T(),t1=D(t0,13),o={};
  Object.keys(S.tailAssign||{}).forEach(function(tail){var fm=fam121(idx[tail]||typeOfTail121(tail));if(!fm)return;
    (S.tailAssign[tail]||[]).forEach(function(x){if(!x||!x.date||x.date<t0||x.date>t1)return;var fr=x.fr||String(x.route||'').split('→')[0],to=x.to||String(x.route||'').split('→')[1];
      var c=o[fm]||(o[fm]={n:0,b:0});c.n++;if(fr==='BKK'||to==='BKK')c.b++})});
  var r={};Object.keys(o).forEach(function(k){r[k]=o[k].n?o[k].b/o[k].n:0});return r;
}
/* 虛擬機師的正副比例：三人機組的巡航位置由副機師擔任（1010A），長程班副機師需求是正機師的兩倍；
   落地到下一班 24 小時之後副機師先不夠 → 各機型族的虛擬機師副機師 62%（正式員工的職級不動） */
function rankMix22(pilots){
  var g={};pilots.forEach(function(p){if(p.virtualR121)(g[p.fam||p.rating]=g[p.fam||p.rating]||[]).push(p)});
  Object.keys(g).forEach(function(k){var l=g[k],want=Math.ceil(l.length*0.62),fo=l.filter(function(p){return p.rank==='FO'}).length;
    for(var i=l.length-1;i>=0&&fo<want;i--){var p=l[i];if(p.rank!=='CP'||p.triR1009A)continue;p.rank='FO';p.rankZH='副機師';p.baseRankR1009B='FO';fo++}});
}
function nat22(pilots,cabin){
  rankMix22(pilots);
  var sh=bkkShare22(),st={},bf=Object.keys(sh).filter(function(k){return sh[k]>0}).sort(function(a,b){return sh[b]-sh[a]}),nth=0;
  (S.staff||[]).forEach(function(s){if(s&&s.empId)st[s.empId]=s});
  NAT22={};
  pilots.concat(cabin).forEach(function(p){
    var s=st[p.empId],nt;
    if(s&&!p.virtualR121)nt=s.nationality||surNat22(s.name||p.name);
    else nt=(H(p.empId+'|th22')%1000<Math.round((sh[p.fam]||0)*500))?'TH':surNat22(p.name);
    p.nat22=nt;NAT22[p.empId]=nt;
    if(nt==='TH'){p.base='BKK';
      if(p.virtualR121)p.name=thName22(nth++);
      /* 正式泰籍組員：機型族沒有曼谷航段就改到有曼谷航段的機型族（依占比，員編雜湊） */
      else if(!(sh[p.fam]>0)&&bf.length){var k=bf[H(p.empId+'|thf22')%Math.min(3,bf.length)];p.fam=k;p.rating=k}}
  });
}
window.kgmCrewNatR1022A=function(id){if(NAT22[id])return NAT22[id];var s=(S.staff||[]).filter(function(x){return x&&x.empId===id})[0];return s?(s.nationality||surNat22(s.name)):'TW'};
/* 正式員工：曼谷基地泰籍組員（只建一次；員編被別人用了就往後找空號） */
var THD22=null;
function thaiStaff22(){
  var L=S.staff=S.staff||[],have={},ids={},made=0;if(THD22===L&&L.length===THD22.n22)return 0;   /* 員工名單沒變就不再掃 */
  L.forEach(function(s){if(!s)return;ids[s.empId]=1;if(s.generatedR1022A&&s.nationality==='TH')have[s.role]=(have[s.role]||0)+1});
  var want={pilot:16,cabin:40},ty=+String(T()).slice(0,4),k=0;
  ['pilot','cabin'].forEach(function(role){
    var id0=role==='pilot'?65000:85000,i=0;
    while((have[role]||0)<want[role]&&i<400){var id='K'+(id0+i);i++;if(ids[id])continue;
      var h=H(id+'|th22'),n=(role==='pilot'?0:16)+(have[role]||0),yr=1+h%14;
      L.push({empId:id,name:thName22(2303-n),email:id.toLowerCase()+'@kgm-airways.test',role:role,password:'demo',
        hireDate:(ty-yr)+'-'+('0'+(1+(h>>>4)%12)).slice(-2)+'-'+('0'+(1+(h>>>8)%28)).slice(-2),hireR1006A:1,active:true,base:'BKK',station:'BKK',
        rank:(role==='pilot'?['CP','FO','CR']:['CP','SC','FA'])[(h>>>12)%3],dependents:[],nationality:'TH',generatedR1022A:true});
      ids[id]=1;have[role]=(have[role]||0)+1;made++}
  });
  if(made)setTimeout(function(){try{save()}catch(_){}},0);
  THD22=L;L.n22=L.length;
  return made;
}
/* 飛到外站之前：落地休息夠了之後、落地日起 3 天內（航班日期），這個外站有沒有同機型族的班可以接著飛走
   （tpN＝飛完這一段後這一趟已飛幾段；1 → 哪裡都可以，2 → 只能回 A 或基地，3 → 只能回基地）。結果跟人無關，同一天同一班記一次 */
var OW22={},OWD22='',OX22={};
function orig22(d){var L=window.kgmFlightsOnR121(d),c=OX22[d];if(c&&c.L===L)return c.ix;var ix={};L.forEach(function(g){if(!g.positioning)(ix[g.fr]=ix[g.fr]||[]).push(g)});OX22[d]={L:L,ix:ix};return ix}
function onward22(f,date,tpN,a,hm){
  if(OWD22!==date){OW22={};OWD22=date;var k0=D(date,-2);for(var kk in OX22){if(kk<k0)delete OX22[kk]}}
  var c1=tpN===1&&a===f.to;if(c1&&f.ow22d===date&&f.ow22h===hm)return f.ow22v;   /* 從基地出發（最常見）直接記在航班上 */
  var key=f.code+'|'+f.fr+'|'+f.to+'|'+tpN+'|'+a+'|'+hm;if(OW22[key]!=null){if(c1){f.ow22d=date;f.ow22h=hm;f.ow22v=OW22[key]}return OW22[key]}
  var fm=fam121(f.type),fdp=f.block+90,rest=Math.max(fdp<=480?600:fdp<=720?720:fdp<=960?1200:1440,(f.block>=(+window.KGM_LONGHAUL_MIN_R922||480))?(+window.KGM_LONGHAUL_REST_R922||2880):(+window.KGM_SHORTHAUL_REST_R922||720));
  /* 三天依航班日期算（使用者：10/18 TPE-BKK → 10/21 BKK-X → 10/24 X-BKK → 10/27 BKK-TPE）：落地日（當地）起 3 天內起飛 */
  var lo=f.arrUTC+90+rest,ad=(+f.dd||0),X=[f.to].concat(SIS928[f.to]||[]),ok=false;
  for(var k=ad;k<=ad+3&&!ok;k++){var ix=orig22(D(date,k));
    X.forEach(function(x){(ix[x]||[]).forEach(function(g){if(ok||g.depUTC<lo||fam121(g.type)!==fm)return;
      if(sameCity928(g.to,hm)||tpN<=1||(tpN===2&&a&&sameCity928(g.to,a)))ok=true})})}
  if(c1){f.ow22d=date;f.ow22h=hm;f.ow22v=ok}
  return (OW22[key]=ok);
}
/* 這一趟（離開基地之後）已經飛了幾段營運航段、第一個外站是哪裡 */
function trip22(st,hm){var h=st.days||[],n=0,a='';for(var i=h.length-1;i>=0&&i>=h.length-12;i--){var x=h[i];if(!x)continue;if(!x.deadhead)n++;if(sameCity928(x.fr,hm)){a=x.to;break}}return {n:n,a:a}}
/* 外站第三天（最後一段營運航段的落地日＋3）到了；或是從明天到第三天這個外站都沒有回基地的班（例如不是天天飛）→ 今天就要回 */
function due22(st,date){var h=st.days||[],dl=null;for(var i=h.length-1;i>=0&&i>=h.length-6;i--){var x=h[i];if(x&&!x.deadhead){dl=D(x.date,(+x.dd||0)+3);break}}
  if(!dl)return false;if(date>=dl)return true;
  var hm=st.home||'TPE',X=[st.at].concat(SIS928[st.at]||[]),A=trip22(st,hm).a;if(A&&sameCity928(A,st.at))A='';   /* 回 A 站（第五航權的轉點）也算回得去 */
  for(var d=D(date,1);d<=dl;d=D(d,1)){var ix=orig22(d);if(X.some(function(a){return (ix[a]||[]).some(function(g){return sameCity928(g.to,hm)||(A&&sameCity928(g.to,A))})}))return false}
  return true}
/* 日／韓籍：本國航班 0（優先）、其他航班 2（排後面）；其他國籍 1 */
function natPref22(p,f){var nt=p.nat22;if(nt!=='JP'&&nt!=='KR')return 1;var c=function(a){try{return window.kgmCountryR929(a)}catch(_){return ''}};return (c(f.fr)===nt||c(f.to)===nt)?0:2}

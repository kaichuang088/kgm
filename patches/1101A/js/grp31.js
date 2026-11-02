/* ══ 1103A：團體訂位航點（使用者：「團體訂購航點除了現有航點也可以是 HKT／CXR／日本 A21N 可停的所有航點／中國 A21N 可停的所有航點」）
   · 團體模式（S.search.grp25）時，首頁航點選單多一區「團體專屬航點」：HKT、CXR，以及日本、中國 A321neo 可起降、有定期噴射客機航班的機場
     （跑道約 2,000 公尺以上；中國排除拉薩等高原機場——A321neo 在那裡要特殊性能與限重）。
   · 這些航點 KGM 沒有定期航班 → 選了之後按搜尋，團體方案視窗只能走「自創航班」（包機要有現成航班），並把出發地、目的地、日期、人數帶進申請表。
   · 機場資料（中英文名、座標、時區、洲別）網站沒有的才補（GRP_AP）；已有的一律不動。座標約到 0.01°，只用在航程／機型估算。 */
(function(){
  if(window.__grp31)return;window.__grp31=1;
  function z(){try{return LANG!=='en'}catch(_){return true}}
  /* 代碼: [中文, English, 經度, 緯度] —— 日本 TZ +9、中國 +8 */
  var JP={AKJ:['旭川','Asahikawa',142.45,43.67],KUH:['釧路','Kushiro',144.19,43.04],OBO:['帶廣','Obihiro',143.22,42.73],MMB:['女滿別','Memanbetsu',144.16,43.88],WKJ:['稚內','Wakkanai',141.80,45.40],
    AOJ:['青森','Aomori',140.69,40.73],MSJ:['三澤','Misawa',141.37,40.70],AXT:['秋田','Akita',140.22,39.62],HNA:['花卷','Hanamaki',141.14,39.43],GAJ:['山形','Yamagata',140.37,38.41],FKS:['福島','Fukushima',140.43,37.23],
    KIJ:['新潟','Niigata',139.12,37.96],IBR:['茨城','Ibaraki',140.41,36.18],TOY:['富山','Toyama',137.19,36.65],KMQ:['小松','Komatsu',136.41,36.39],FSZ:['靜岡','Shizuoka',138.19,34.80],ITM:['大阪伊丹','Osaka Itami',135.44,34.79],
    OKJ:['岡山','Okayama',133.85,34.76],HIJ:['廣島','Hiroshima',132.92,34.44],YGJ:['米子','Yonago',133.24,35.49],IZO:['出雲','Izumo',132.89,35.41],UBJ:['山口宇部','Yamaguchi Ube',131.28,33.93],TAK:['高松','Takamatsu',134.02,34.21],
    KCZ:['高知','Kochi',133.67,33.55],TKS:['德島','Tokushima',134.61,34.13],KKJ:['北九州','Kitakyushu',131.03,33.85],SAG:['佐賀','Saga',130.30,33.15],NGS:['長崎','Nagasaki',129.91,32.92],OIT:['大分','Oita',131.74,33.48],
    KMI:['宮崎','Miyazaki',131.45,31.88],KOJ:['鹿兒島','Kagoshima',130.72,31.80],ISG:['石垣','Ishigaki',124.25,24.40],MMY:['宮古','Miyako',125.30,24.78],SHI:['下地島','Shimojishima',125.14,24.83],
    NRT:0,HND:0,KIX:0,NGO:0,FUK:0,OKA:0,CTS:0,SDJ:0,UKB:0,MYJ:0,HKD:0,KMJ:0};
  var CN={PEK:['北京首都','Beijing Capital',116.60,40.08],PKX:['北京大興','Beijing Daxing',116.41,39.51],PVG:0,SHA:['上海虹橋','Shanghai Hongqiao',121.34,31.20],CAN:0,SZX:0,CTU:0,TFU:['成都天府','Chengdu Tianfu',104.44,30.32],
    CKG:0,KMG:['昆明','Kunming',102.93,25.10],XIY:['西安','Xi\'an',108.75,34.45],HGH:0,NKG:['南京','Nanjing',118.86,31.74],XMN:0,FOC:0,WUH:['武漢','Wuhan',114.21,30.78],CSX:['長沙','Changsha',113.22,28.19],
    TAO:['青島','Qingdao',120.09,36.36],TSN:['天津','Tianjin',117.35,39.12],DLC:['大連','Dalian',121.54,38.97],SHE:['瀋陽','Shenyang',123.48,41.64],HRB:['哈爾濱','Harbin',126.25,45.62],CGO:0,TNA:['濟南','Jinan',117.22,36.86],
    NNG:['南寧','Nanning',108.17,22.61],HAK:['海口','Haikou',110.46,19.94],SYX:['三亞','Sanya',109.41,18.30],KWE:['貴陽','Guiyang',106.80,26.54],KWL:['桂林','Guilin',110.04,25.22],LHW:['蘭州','Lanzhou',103.62,36.52],
    URC:['烏魯木齊','Urumqi',87.47,43.91],TYN:['太原','Taiyuan',112.43,37.75],SJW:['石家莊','Shijiazhuang',114.70,38.28],HET:['呼和浩特','Hohhot',111.82,40.85],NGB:['寧波','Ningbo',121.46,29.83],WNZ:['溫州','Wenzhou',120.85,27.91],
    JJN:['泉州晉江','Quanzhou Jinjiang',118.59,24.80],YNT:['煙台','Yantai',121.37,37.66],CGQ:['長春','Changchun',125.68,43.99],HFE:['合肥','Hefei',117.30,31.99],KHN:['南昌','Nanchang',115.90,28.86],NTG:['南通','Nantong',120.98,32.07],
    WUX:['無錫','Wuxi',120.43,31.49],CZX:['常州','Changzhou',119.78,31.92],ZUH:['珠海','Zhuhai',113.38,22.01],SWA:['揭陽潮汕','Jieyang Chaoshan',116.50,23.55],YNJ:['延吉','Yanji',129.45,42.88],YTY:['揚州泰州','Yangzhou Taizhou',119.72,32.56],
    LJG:['麗江','Lijiang',100.25,26.68],JHG:['西雙版納','Xishuangbanna',100.76,21.97],INC:['銀川','Yinchuan',106.39,38.32],DYG:['張家界','Zhangjiajie',110.44,29.10],WEH:['威海','Weihai',122.23,37.19],DLU:['大理','Dali',100.32,25.65]};
  var SEA={HKT:['普吉島','Phuket',98.31,8.11],CXR:['芽莊','Nha Trang',109.22,11.99]};
  var LIST=[];function add(tbl,tz){Object.keys(tbl).forEach(function(a){LIST.push(a);var d=tbl[a];if(!d)return;
      try{if(!CITY_ZH[a])CITY_ZH[a]=d[0]}catch(_){}try{if(!CITY_EN[a])CITY_EN[a]=d[1]}catch(_){}
      try{if(typeof AP_XY!=='undefined'&&!AP_XY[a])AP_XY[a]=[d[2],d[3]]}catch(_){}
      try{if(typeof TZ!=='undefined'&&TZ[a]==null)TZ[a]=tz}catch(_){}
      try{if(typeof REGION_AP_R913!=='undefined'&&!REGION_AP_R913[a])REGION_AP_R913[a]='亞洲'}catch(_){}})}
  add(SEA,7);add(JP,9);add(CN,8);
  try{if(typeof TZ!=='undefined'){TZ.CXR=TZ.CXR==null?7:TZ.CXR}}catch(_){}
  window.KGM_GRP_EXTRA_R1103A=LIST;
  function grpOn(){try{return !!(S.search&&S.search.grp25)}catch(_){return false}}
  function served(fr,to){try{return [].concat(FLIGHTS,S.customFlights||[]).some(function(f){return f&&!f.partner&&/^KX/.test(String(f.code||''))&&((f.fr===fr&&f.to===to)||(f.fr===to&&f.to===fr))})}catch(_){return true}}
  window.kgmGrpServedR1103A=served;
  /* 航點選單：團體模式多一區（只列選單裡還沒有的） */
  window.kgmGrpRegionsR1103A=function(R){if(!grpOn())return R;var have={},out={};Object.keys(R||{}).forEach(function(k){out[k]=R[k];(R[k]||[]).forEach(function(a){have[a]=1})});
    var ex=LIST.filter(function(a){return !have[a]&&(CITY_ZH[a]||CITY_EN[a])});if(ex.length)out[z()?'團體專屬航點（自創航班）':'Group-only destinations (custom flight)']=ex;return out};
  /* 團體方案視窗：沒有 KGM 定期航班的航線只能自創航班；開申請表時帶入出發地、目的地、日期、人數 */
  function hook(){var O=window.kgmGrpPickR1101A;if(typeof O!=='function'||O.__grp31)return;
    var w=function(k,how){var s=S.search||{},fr=s.fr,to=s.to;
      if(fr&&to&&!served(fr,to)&&how!=='custom'){alert(z()?(fr+'→'+to+' 沒有 KGM 定期航班，團體請用「自創航班」（自訂航線與日期，起飛前 3 個月申請）。'):'No scheduled KGM service on this route; use a custom flight.');how='custom'}
      var r=O.call(this,k,how);
      if(how==='custom'){try{var d=S.k27cr=S.k27cr||{kind:'custom'};d.v=d.v||{};if(fr&&!d.v['k27c-fr'])d.v['k27c-fr']=fr;if(to&&!d.v['k27c-to'])d.v['k27c-to']=to;if(s.date&&!d.v['k27c-date'])d.v['k27c-date']=s.date;if(s.ret&&s.date&&s.ret>s.date&&!d.v['k27c-ret'])d.v['k27c-ret']=s.ret;
        var px=+(s.grpPax25||s.pax||0)||((+s.adults||0)+(+s.children||0));if(px&&!d.v['k27c-pax'])d.v['k27c-pax']=String(px);try{render()}catch(_){}}catch(_){}}
      return r};w.__grp31=1;window.kgmGrpPickR1101A=w}
  hook();setTimeout(hook,0);setTimeout(hook,3000);
})();

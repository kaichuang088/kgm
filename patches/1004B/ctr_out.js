/* 1004B：外站報到航廈。成田 T1／仁川 T2／甘迺迪 T1／戴高樂 2E／新加坡 T1 跟 r98 的 A380 停機位（官方資料）一致；
   其餘補上原本沒有、一律被寫成 T1 的機場（KGM 是寰宇一家成員，與夥伴同航廈；美國各機場寫國際線出發的航廈）。 */
var AP_TERM_MAP={ONT:"T2",LHR:"T3",LAX:"TB",JFK:"T1",SFO:"I",SEA:"S",NRT:"T1",HND:"T3",KIX:"T1",ICN:"T2",HKG:"T1",SIN:"T1",BKK:"Main",CDG:"2E",AMS:"3",FRA:"T2",MUC:"T1",SYD:"T1",YVR:"M",TSA:"T1",HNL:"T2",
  YYZ:"T3",MEL:"T2",BNE:"INT",PER:"T1",AKL:"INT",CHC:"INT",DFW:"D",EWR:"B",BOS:"E",ATL:"F",IAH:"D",ORD:"T5",PHX:"T4",IAD:"Main",DTW:"North",LAS:"T3",
  MAD:"T4",FCO:"T3",VIE:"T3",HEL:"T2",BUD:"T2",ZRH:"1",MXP:"T1",BCN:"T1",PRG:"T1",WAW:"A",ATH:"Main",IST:"Main",DOH:"Main",AUH:"A",
  PEK:"T3",PVG:"T2",SHA:"T1",CAN:"T2",SZX:"T3",XMN:"T3",HGH:"T4",CKG:"T3",CTU:"T1",CGO:"T2",MFM:"Main",
  GMP:"INT",PUS:"INT",CJU:"INT",NGO:"T1",FUK:"INT",CTS:"INT",OKA:"INT",SDJ:"INT",HKD:"INT",KMJ:"INT",KOJ:"INT",OKJ:"INT",HIJ:"INT",MYJ:"INT",UKB:"T2",
  HAN:"T2",SGN:"INT",DAD:"T2",CEB:"T2",MNL:"T1",CGK:"T3",DPS:"INT",KUL:"T1",PEN:"Main",DMK:"T1",CNX:"INT",KTI:"Main",MLE:"INT"};
/* 1004B：外站櫃檯編法。使用者：「你櫃檯資訊要確定各國是真的正確的喔，像是我看到『NRT 第 1 航廈 櫃檯 1』但是NRT不是英文字母的櫃檯嗎？全部都要檢查喔」
   L＝字母櫃檯島（日本、韓國、中國大陸、河內、伊斯坦堡…）／ROW＝字母排（曼谷 Row、吉隆坡 Row、舊金山 Row）
   AISLE＝香港登記行段、雪梨 Aisle／ZONE＝倫敦希斯洛 Zone／ROWN＝新加坡數字 Row／NUM＝數字櫃檯（歐美多數機場、澳門、峇里島…） */
var OUTCTR1004B={
  NRT:['L','ABCDEFGHJKL'],HND:['L','ABCDEFGHJKLM'],KIX:['L','ABCDEFGHJK'],NGO:['L','ABCDEFGHJK'],FUK:['L','ABCDEFG'],CTS:['L','ABCDEFG'],
  OKA:['L','ABCDEF'],SDJ:['L','ABC'],HKD:['L','AB'],KMJ:['L','AB'],KOJ:['L','AB'],OKJ:['L','AB'],HIJ:['L','ABC'],MYJ:['L','AB'],UKB:['L','AB'],
  ICN:['L','ABCDEFGH'],GMP:['L','ABCDEF'],PUS:['L','ABCDE'],CJU:['L','ABCD'],
  PEK:['L','ABCDEFGHJKL'],PVG:['L','ABCDEFGHJKLM'],SHA:['L','ABCDEFG'],CAN:['L','ABCDEFGHJKLM'],SZX:['L','ABCDEFGH'],XMN:['L','ABCDEFG'],
  HGH:['L','ABCDEFGH'],CKG:['L','ABCDEFGH'],CTU:['L','ABCDEFG'],CGO:['L','ABCDEFG'],HAN:['L','ABCDEFGHJK'],SGN:['L','ABCDEFGH'],
  IST:['L','ABCDEFGHJKLMNPR'],
  HKG:['AISLE','ABCDEFGHJKL'],SYD:['AISLE','ABCDEFGHJK'],LHR:['ZONE','ABCDEFGH'],
  BKK:['ROW','ABCDEFGHJKLMNPQRSTUVW'],KUL:['ROW','ABCDEFGHJKLM'],SFO:['ROW','ABCDEFG'],
  SIN:['ROWN',[1,13]]
};
function hashCtr1004B(s){var h=0;s=String(s);for(var i=0;i<s.length;i++)h=((h*31)+s.charCodeAt(i))>>>0;return h}
window.kgmOutCtrR1004B=function(ap,c,code){
  if(!c||ap==='TPE'||ap==='TSA')return c;
  var cfg=OUTCTR1004B[ap]||['NUM',[1,40]],h=hashCtr1004B(ap+'|KGM'),off=0;
  /* 曼谷開兩個櫃檯：原本的兩個號碼依序對到相鄰的兩個 */
  var raw=String(c.counter||'');if(/^\d+$/.test(raw)&&ap==='BKK')off=(+raw)%2;
  var st=cfg[0],short='',zh='',en='';
  if(st==='ROWN'||st==='NUM'){var a=cfg[1][0],b=cfg[1][1];var n=a+((h+off)%(b-a+1));short=String(n);
    zh=st==='ROWN'?('第 '+n+' 排報到櫃檯'):('報到櫃檯 '+n);en=st==='ROWN'?('Row '+n):('Counter '+n)}
  else{var L=cfg[1],ch=L.charAt((h+off)%L.length);short=ch;
    zh=st==='L'?('報到櫃檯 '+ch):st==='AISLE'?('報到行段 '+ch):st==='ZONE'?('報到 '+ch+' 區（Zone '+ch+'）'):('報到櫃檯 '+ch+' 排（Row '+ch+'）');
    en=st==='L'?('Counter '+ch):st==='AISLE'?('Aisle '+ch):st==='ZONE'?('Zone '+ch):('Row '+ch)}
  return Object.assign({},c,{term:AP_TERM_MAP[ap]||(c.term&&c.term!=='—'?c.term:'Main'),counter:short,counterZH:zh,counterEN:en,ctrStyleR1004B:st});
};
window.kgmTermLabelR1004B=function(ap,t,zhOn){
  t=String(t||'');var m;
  if(!t||t==='—')return zhOn?'航廈依機場公告':'Terminal per airport';
  if((m=/^T(\d+)$/.exec(t)))return zhOn?('第 '+m[1]+' 航廈'):('Terminal '+m[1]);
  if((m=/^T(\d+)([A-Z])$/.exec(t)))return zhOn?('第 '+m[1]+' 航廈 '+m[2]+' 區'):('Terminal '+m[1]+m[2]);
  if((m=/^(\d)([A-Z])$/.exec(t)))return zhOn?('第 '+m[1]+' 航廈 '+m[2]+' 廳'):('Terminal '+m[1]+m[2]);
  if((m=/^(\d)$/.exec(t)))return ap==='AMS'?(zhOn?('第 '+m[1]+' 出境大廳'):('Departure Hall '+m[1])):ap==='ZRH'?(zhOn?('第 '+m[1]+' 報到大廳'):('Check-in '+m[1])):(zhOn?('第 '+m[1]+' 航廈'):('Terminal '+m[1]));
  var NM={TBIT:['湯姆布萊德利國際航廈（TBIT）','Tom Bradley International Terminal'],TB:['湯姆布萊德利國際航廈（TBIT）','Tom Bradley International Terminal'],I:['國際航廈','International Terminal'],INT:['國際線航廈','International Terminal'],
    M:['主航廈','Main Terminal'],Main:['主航廈','Main Terminal'],North:['北航廈','North Terminal'],S:['主航廈','Main Terminal']};
  if(NM[t])return zhOn?NM[t][0]:NM[t][1];
  if(/^[A-H]$/.test(t))return zhOn?(t+' 航廈'):('Terminal '+t);
  return t;
};
window.kgmCheckinLabelR1004B=function(ap,tl,c,zhOn){
  if(ap==='TPE'||ap==='TSA')return null;
  var x=c&&c.counterZH?c:(c?window.kgmOutCtrR1004B(ap,c,''):null);
  var term=(x&&x.term)||AP_TERM_MAP[ap]||tl;
  return window.kgmTermLabelR1004B(ap,term,zhOn)+(zhOn?'　':' · ')+(x?(zhOn?x.counterZH:x.counterEN):(zhOn?'櫃檯依機場公告':'see airport screens'));
};

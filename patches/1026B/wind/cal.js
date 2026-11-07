const G=Object.assign({},require('./geo.js'),{AUH:[24.43,54.65],DOH:[25.27,51.61],PVG:[31.14,121.81],HNL:[21.32,-157.92]}),DT=require('./dist.js');
const P=JSON.parse(process.argv[2]||'{}');
const W={ampBase:0.6,ampJ:0.5,ampS:35,core:33,coreS:10,coreA:150,polA:60,pol:52,polS:9,sA:70,sC:43,sS:9,s2A:30,s2C:55,shW:60,shWc:47,shS1:120,shS1c:35,shS2:50,shift:[-6,-3,0,3,6],longShift:null,pen:0.02,...P};
function g(x,c,s){return Math.exp(-Math.pow((x-c)/s,2))}
function amp(lon){lon=((lon+540)%360)-180;/* 東經 120–160 最強 */const k=W.ampJ*Math.exp(-Math.pow((lon-140)/W.ampS,2));return W.ampBase+k}
function u(lat,win,lon){const A=lon==null?1:amp(lon);const a=Math.abs(lat);if(a<15)return -10;
  if(lat>=0)return win?(A*W.coreA*g(lat,W.core,W.coreS)+W.polA*g(lat,W.pol,W.polS)):(W.sA*g(lat,W.sC,W.sS)+W.s2A*g(lat,W.s2C,9));
  return win?(W.shW*g(a,W.shWc,9)):(W.shS1*g(a,W.shS1c,10)+W.shS2*g(a,55,9))}
const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI;
function path(a,b,n){const p1=rad(a[0]),l1=rad(a[1]),p2=rad(b[0]),l2=rad(b[1]);const dd=2*Math.asin(Math.sqrt(Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin((l2-l1)/2)**2));const out=[];
  for(let i=0;i<n;i++){const f=(i+0.5)/n,A=Math.sin((1-f)*dd)/Math.sin(dd),B=Math.sin(f*dd)/Math.sin(dd);const x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2),y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2),z=A*Math.sin(p1)+B*Math.sin(p2);
    const lat=Math.atan2(z,Math.sqrt(x*x+y*y)),lon=Math.atan2(y,x);const brg=Math.atan2(Math.sin(l2-lon)*Math.cos(p2),Math.cos(lat)*Math.sin(p2)-Math.sin(lat)*Math.cos(p2)*Math.cos(l2-lon));out.push({lat:deg(lat),lon:deg(lon),east:Math.sin(brg),f})}return out}
function hav(a,b){const p1=rad(a[0]),p2=rad(b[0]),dl=rad(b[1]-a[1]);return 2*6371*Math.asin(Math.sqrt(Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2))}
function mid(a,b){const p=path(a,b,1)[0];return p}
function midpt(a,b){const p1=rad(a[0]),l1=rad(a[1]),p2=rad(b[0]),l2=rad(b[1]);const x=Math.cos(p1)*Math.cos(l1)+Math.cos(p2)*Math.cos(l2),y=Math.cos(p1)*Math.sin(l1)+Math.cos(p2)*Math.sin(l2),z=Math.sin(p1)+Math.sin(p2);return [deg(Math.atan2(z,Math.sqrt(x*x+y*y))),deg(Math.atan2(y,x))]}
function airH(A,B,d,tas,win){
  const S=d>6000?(W.longShift||[-6,-3,0,3,6]):(d>2500?[-6,-3,0,3,6]:[-2,0,2]);const D0=hav(A,B);let best=1e9;
  S.forEach(s=>{let segs;if(!s)segs=[[A,B]];else{const m=midpt(A,B);const wp=[Math.max(-80,Math.min(80,m[0]+s)),m[1]];segs=[[A,wp],[wp,B]]}
    let tt=0;segs.forEach(([p,q])=>{const L=hav(p,q),pts=path(p,q,10);let tail=0;pts.forEach(o=>tail+=u(o.lat,win,o.lon)*o.east);tail/=pts.length;tt+=(d*L/D0)*1.03/Math.max(400,tas+tail)});
    if(tt<best)best=tt});return best}
function dist(a,b){return DT[a+'-'+b]||DT[b+'-'+a]}
const T=[['TPE','NRT',-12],['NRT','TPE',22],['TPE','LAX',-45],['LAX','TPE',30],['TPE','JFK',-35],['JFK','TPE',20],['TPE','LHR',25],['LHR','TPE',-25],['TPE','HKG',3],['HKG','TPE',-3],['TPE','SYD',0],['TPE','BKK',0],['TPE','SFO',-45],['SFO','TPE',30],['TPE','YVR',-40],['YVR','TPE',25],['TPE','CDG',25],['CDG','TPE',-25],['TPE','ICN',-8],['ICN','TPE',12],['BKK','LHR',20],['LHR','BKK',-20],['HNL','NRT',40],['NRT','HNL',-35],['DOH','TPE',-35],['TPE','DOH',40],['TPE','AUH',40],['AUH','TPE',-35],['PVG','DOH',40]];
let err=0;T.forEach(([a,b,t])=>{const d=dist(a,b);const v=(airH(G[a],G[b],d,900,true)-airH(G[a],G[b],d,900,false))*60;err+=(v-t)**2;console.log(a+'-'+b,d,'model',v.toFixed(1),'target',t)});console.log('rmse',Math.sqrt(err/T.length).toFixed(1));

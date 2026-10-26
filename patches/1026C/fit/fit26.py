# 1026B：輪擋時間（block）模型校正 —— 用 2026 年實際航空公司班表（華航／長榮，網路查證）擬合，網站用同一套公式
import json,math,itertools
G=json.load(open('/tmp/j/geo_tz.json'))
def geo(c):return G[c]['geo']
rad=math.radians;deg=math.degrees
def gfun(x,c,s):return math.exp(-((x-c)/s)**2)
def amp(lon):lon=((lon+540)%360)-180;return 0.55+0.7*math.exp(-((lon-140)/25)**2)
XS=[0.0]
def u(lat,win,lon):
    a=abs(lat)
    if a<15:return -10
    A=amp(lon)
    if lat>=0:return (A*180*gfun(lat,33,10)+90*gfun(lat,52,9)) if win else (70*gfun(lat,43,9)+30*gfun(lat,55,9)+XS[0]*gfun(lat,45,10))
    return 60*gfun(a,47,9) if win else (120*gfun(a,35,10)+50*gfun(a,55,9))
def path(a,b,n):
    p1,l1,p2,l2=rad(a[0]),rad(a[1]),rad(b[0]),rad(b[1])
    dd=2*math.asin(math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin((l2-l1)/2)**2))
    out=[]
    for i in range(n):
        f=(i+0.5)/n;A=math.sin((1-f)*dd)/math.sin(dd);B=math.sin(f*dd)/math.sin(dd)
        x=A*math.cos(p1)*math.cos(l1)+B*math.cos(p2)*math.cos(l2);y=A*math.cos(p1)*math.sin(l1)+B*math.cos(p2)*math.sin(l2);z=A*math.sin(p1)+B*math.sin(p2)
        lat=math.atan2(z,math.hypot(x,y));lon=math.atan2(y,x)
        brg=math.atan2(math.sin(l2-lon)*math.cos(p2),math.cos(lat)*math.sin(p2)-math.sin(lat)*math.cos(p2)*math.cos(l2-lon))
        out.append((deg(lat),deg(lon),math.sin(brg)))
    return out
def hav(a,b):
    p1,p2=rad(a[0]),rad(b[0]);dl=rad(b[1]-a[1]);return 2*6371*math.asin(math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
def mid(a,b):
    p1,l1,p2,l2=rad(a[0]),rad(a[1]),rad(b[0]),rad(b[1]);x=math.cos(p1)*math.cos(l1)+math.cos(p2)*math.cos(l2);y=math.cos(p1)*math.sin(l1)+math.cos(p2)*math.sin(l2);z=math.sin(p1)+math.sin(p2)
    return (deg(math.atan2(z,math.hypot(x,y))),deg(math.atan2(y,x)))
SH={'L':[-30,-25,-20,-15,-10,-5,0,5,10,15],'M':[-6,-3,0,3,6],'S':[-2,0,2]}
def air(A,B,tas,win,P):
    d=hav(A,B);S0=SH['L'] if d>6000 else (SH['M'] if d>2500 else SH['S']);best=1e9
    for s in S0:
        if not s:segs=[(A,B)]
        else:
            m=mid(A,B);wp=(max(-80,min(80,m[0]+s)),m[1]);segs=[(A,wp),(wp,B)]
        tt=0
        for p,q in segs:
            L=hav(p,q);pts=path(p,q,10);tail=sum(u(o[0],win,o[1])*o[2] for o in pts)/len(pts)
            w=tail*(P['ws'] if not win else P['ww'])
            w=w*P['tf'] if w>0 else w*P['hf']
            tt+=L*P['rf']/max(400,tas*P['vf']+w)
        best=min(best,tt)
    return best*60
# 實際班表（分鐘，夏季／冬季）；來源見 notes
REAL=[('TPE','NRT','A359',200,200),('NRT','TPE','A359',225,250),('TPE','LAX','B77W',710,700),('LAX','TPE','B77W',790,860),
 ('TPE','JFK','B77W',895,885),('JFK','TPE','B77W',950,None),('TPE','SYD','A359',555,565),('TPE','SIN','A333',272,272),('SIN','TPE','A333',278,278),
 ('TPE','HKG','A21N',125,125),('BKK','TPE','A333',215,215),('TPE','BKK','A333',243,243)]
TAS={'A359':905,'B77W':905,'A333':870,'A21N':830}
def model(fr,to,ty,win,P):
    return P['k0']+P['kd']*hav(geo(fr),geo(to))/1000+air(geo(fr),geo(to),TAS[ty],win,P)

# 參數：k0 固定 overhead（滑行＋爬升下降＋航空公司緩衝）、vf 巡航速度係數、ws／ww 夏／冬高空風倍率、tf 順風打折（排班不敢全算）、hf 逆風加重、rs 短程航路繞行
def model2(fr,to,ty,win,x):
    k0,vf,ws,ww,tf,hf,rs,xs=x;XS[0]=xs;A,B=geo(fr),geo(to);d=hav(A,B)
    P={'vf':vf,'ws':ws,'ww':ww,'tf':tf,'hf':hf,'rf':1.03+rs*math.exp(-d/1500)}
    return k0+air(A,B,TAS[ty],win,P)
def obj(x):
    e=[]
    for fr,to,ty,s,w in REAL:
        e.append(model2(fr,to,ty,False,x)-s)
        if w is not None:e.append(model2(fr,to,ty,True,x)-w)
    return sum(v*v for v in e)/len(e)
BN=[(15,60),(0.8,1.05),(0,4),(0,3),(0,1),(0.8,2.0),(0,0.8),(0,150)]
def clip(x):return [min(max(v,b[0]),b[1]) for v,b in zip(x,BN)]
x=[30,0.95,1.5,1.0,0.5,1.2,0.2,40];f=obj(x);step=[5,0.03,0.5,0.3,0.2,0.2,0.1,20]
for it in range(60):
    imp=False
    for i in range(len(x)):
        for sg in (1,-1):
            y=x[:];y[i]+=sg*step[i];y=clip(y);fy=obj(y)
            if fy<f:x,f,imp=y,fy,True
    if not imp:step=[s/2 for s in step]
    if max(step)<1e-3:break
print('rms',round(math.sqrt(f),1),[round(v,3) for v in x])
for fr,to,ty,s,w in REAL:print(fr,to,'real',s,w,'model',round(model2(fr,to,ty,False,x)),round(model2(fr,to,ty,True,x)))
json.dump({'x':x,'rms':math.sqrt(f)},open('fit26.json','w'))

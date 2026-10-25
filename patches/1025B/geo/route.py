# 1025B：避開關閉空域的航路（離線算好，嵌進網站）。資料：Natural Earth（world-atlas 2.0.2，公有領域）
import json,math,heapq,sys
import numpy as np
from shapely.geometry import shape,Polygon,MultiPolygon
from shapely.ops import unary_union
import shapely
WA=sys.argv[1] if len(sys.argv)>1 else '/tmp/wa/package'
def topo(fn,obj):
    t=json.load(open(fn));sc,tr=t['transform']['scale'],t['transform']['translate'];arcs=[]
    for a in t['arcs']:
        x=y=0;out=[]
        for dx,dy in a:x+=dx;y+=dy;out.append((x*sc[0]+tr[0],y*sc[1]+tr[1]))
        arcs.append(out)
    def ring(ix):
        pts=[]
        for i in ix:
            a=arcs[i] if i>=0 else arcs[~i][::-1]
            pts.extend(a if not pts else a[1:])
        return pts
    res=[]
    for g in t['objects'][obj]['geometries']:
        polys=[]
        if g['type']=='Polygon':polys=[g['arcs']]
        elif g['type']=='MultiPolygon':polys=g['arcs']
        rings=[[ring(r) for r in p] for p in polys]
        res.append((g.get('properties',{}).get('name'),rings))
    return res
from shapely.geometry import box
from shapely import affinity
def unwrap(r):
    out=[];off=0;prev=None
    for x,y in r:
        if prev is not None:
            if x+off-prev>180:off-=360
            elif x+off-prev<-180:off+=360
        out.append((x+off,y));prev=x+off
    return out
def fixpoly(p):
    # 跨換日線的多邊形：經度攤平成連續的再切回 −180～180（不然俄羅斯遠東會變成破洞）
    q=Polygon(unwrap(p[0]),[unwrap(h) for h in p[1:]]).buffer(0);parts=[]
    for k in (-1,0,1):
        c=q.intersection(box(-180+360*k,-90,180+360*k,90))
        if not c.is_empty:parts.append(affinity.translate(c,-360*k,0))
    return unary_union(parts)
ZONES={'Russia':'俄羅斯','Ukraine':'烏克蘭','Belarus':'白俄羅斯','Iran':'伊朗','Iraq':'伊拉克','Syria':'敘利亞','Israel':'以色列','Palestine':'巴勒斯坦','Lebanon':'黎巴嫩','Yemen':'葉門','Afghanistan':'阿富汗','North Korea':'北韓'}
C=topo(WA+'/countries-50m.json','countries')
zp={}
for nm,rings in C:
    if nm in ZONES:
        zp[nm]=unary_union([fixpoly(p) for p in rings if len(p[0])>3])
assert len(zp)==len(ZONES),set(ZONES)-set(zp)
BUF=0.5
zb={k:v.buffer(0.15 if k=='North Korea' else BUF) for k,v in zp.items()}   # 北韓離仁川／金浦很近，緩衝小一點
ZU=unary_union(list(zb.values()));shapely.prepare(ZU)
AP=json.load(open('ap.json'))
R=6371.0
def hav(a,b):
    p1,p2=math.radians(a[0]),math.radians(b[0]);dl=math.radians(b[1]-a[1]);dp=p2-p1
    return 2*R*math.asin(math.sqrt(math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
def gc(a,b,step=25):
    d=hav(a,b);n=max(2,int(d/step)+1);p1,l1,p2,l2=map(math.radians,(a[0],a[1],b[0],b[1]));dd=d/R;out=[]
    for i in range(n+1):
        f=i/n
        if dd<1e-9:out.append(a);continue
        A=math.sin((1-f)*dd)/math.sin(dd);B=math.sin(f*dd)/math.sin(dd)
        x=A*math.cos(p1)*math.cos(l1)+B*math.cos(p2)*math.cos(l2);y=A*math.cos(p1)*math.sin(l1)+B*math.cos(p2)*math.sin(l2);z=A*math.sin(p1)+B*math.sin(p2)
        out.append((math.degrees(math.atan2(z,math.hypot(x,y))),math.degrees(math.atan2(y,x))))
    return out
def blocked(pts):
    xs=np.array([p[1] for p in pts]);ys=np.array([p[0] for p in pts])
    return shapely.contains_xy(ZU,xs,ys)
def hit(a,b):
    pts=gc(a,b);m=blocked(pts);names=set()
    if m.any():
        for k,v in zp.items():
            if shapely.contains_xy(v,np.array([p[1] for p in pts]),np.array([p[0] for p in pts])).any():names.add(k)
    return m.any(),names
# 0.5° 格
ST=0.5;LAT=np.arange(-60,80.01,ST);LON=np.arange(-180,180,ST);NY,NX=len(LAT),len(LON)
gy,gx=np.meshgrid(LAT,LON,indexing='ij');BL=shapely.contains_xy(ZU,gx.ravel(),gy.ravel()).reshape(NY,NX)
def cell(p):return int(round((p[0]-LAT[0])/ST)),int(round((p[1]-LON[0])/ST))%NX
NB=[(dy,dx) for dy in (-2,-1,0,1,2) for dx in (-2,-1,0,1,2) if (dy,dx)!=(0,0) and math.gcd(abs(dy),abs(dx))==1]
def dij(a,b):
    s=cell(a);t=cell(b);dist={s:0};prev={};h=[(hav(a,b),0,s)]
    def ll(c):return (LAT[c[0]],LON[c[1]])
    while h:
        f,g,c=heapq.heappop(h)
        if c==t:break
        if g>dist.get(c,1e18):continue
        for dy,dx in NB:
            y=c[0]+dy;x=(c[1]+dx)%NX
            if y<0 or y>=NY or BL[y,x]:continue
            n=(y,x);ng=g+hav(ll(c),ll(n))
            if ng<dist.get(n,1e18):dist[n]=ng;prev[n]=c;heapq.heappush(h,(ng+hav(ll(n),b),ng,n))
    path=[t];c=t
    while c!=s:c=prev[c];path.append(c)
    pts=[a]+[ll(c) for c in path[::-1][1:-1]]+[b]
    # 拉直：從目前點往後找最遠、整段大圓都不經過關閉空域的點
    out=[pts[0]];i=0
    while i<len(pts)-1:
        j=len(pts)-1
        while j>i+1 and blocked(gc(pts[i],pts[j])).any():j-=1
        out.append(pts[j]);i=j
    return out
res={}
pairs=sorted({tuple(sorted((r['fr'],r['to']))) for r in json.load(open('/tmp/j/dumptt25.json')) if r['code'].startswith('KX') and not r['via']})
for a,b in pairs:
    A,B=AP[a],AP[b];d0=hav(A,B);h,names=hit(A,B)
    if not h or not names:continue
    wp=dij(A,B);d1=sum(hav(wp[i],wp[i+1]) for i in range(len(wp)-1))
    res[a+'-'+b]={'d0':round(d0),'d1':round(d1),'z':sorted(names),'wp':[[round(p[0],1),round(p[1],1)] for p in wp[1:-1]]}
    print(a,b,round(d0),round(d1),'+%d'%round(d1-d0),sorted(names),len(wp)-2,flush=True)
json.dump({'zones':ZONES,'routes':res},open('routes.json','w'),ensure_ascii=False)

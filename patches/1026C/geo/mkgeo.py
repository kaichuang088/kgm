# 1025B：航班資料路線圖的地圖資料（Natural Earth via world-atlas 2.0.2，公有領域）→ js/geo25.js
import json,sys
exec(open('route.py').read().split('# 0.5° 格')[0])
from shapely.geometry import Polygon,MultiPolygon
Q=0.02
def enc(rings):
    # 每個環：起點＋差值，0.02° 整數，再寫成 base-64 變長碼（不用 JSON 數字，檔案小很多）
    A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    out=[]
    for r in rings:
        s=[];px=py=0
        for x,y in r:
            ix,iy=round(x/Q),round(y/Q)
            for v in (ix-px,iy-py):
                v=(v<<1)^(v>>63) if v<0 else v<<1
                if v<0:v=-v
                while True:
                    c=v&31;v>>=5
                    if v:s.append(A[c|32])
                    else:s.append(A[c]);break
            px,py=ix,iy
        out.append(''.join(s))
    return out
def zz(v):return (v<<1) if v>=0 else ((-v)<<1)-1
def enc(rings):
    A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    out=[]
    for r in rings:
        s=[];px=py=0;last=None
        for x,y in r:
            ix,iy=round(x/Q),round(y/Q)
            if last==(ix,iy):continue
            last=(ix,iy)
            for v in (zz(ix-px),zz(iy-py)):
                while True:
                    c=v&31;v>>=5
                    if v:s.append(A[c|32])
                    else:s.append(A[c]);break
            px,py=ix,iy
        if len(r)>=4:out.append(''.join(s))
    return out
def rings_of(g,tol):
    g=g.simplify(tol,preserve_topology=True);res=[]
    for p in (g.geoms if hasattr(g,'geoms') else [g]):
        if p.is_empty or p.area<0.02:continue
        res.append(list(p.exterior.coords))
        for h in p.interiors:res.append(list(h.coords))
    return res
land=[]
for nm,rings in topo(WA+'/land-50m.json','land'):
    for p in rings:
        if len(p[0])<4:continue
        land.append(fixpoly(p))
LAND=unary_union(land)
lr=enc(rings_of(LAND,0.03))
# 國界：50m 國家外框（簡化），畫細線
bd=[]
for nm,rings in topo(WA+'/countries-50m.json','countries'):
    for p in rings:
        if len(p[0])>=4:
            g=fixpoly(p).simplify(0.06)
            for q in (g.geoms if hasattr(g,'geoms') else [g]):
                if not q.is_empty and q.area>0.3:bd.append(list(q.exterior.coords))
br=enc(bd)
zr={}
for k,v in zp.items():zr[k]=enc(rings_of(v,0.04))
RT=json.load(open('routes.json'))
out={'q':Q,'land':lr,'bord':br,'zones':{k:{'zh':ZONES[k],'r':zr[k]} for k in zr},'routes':RT['routes']}
js=json.dumps(out,ensure_ascii=False,separators=(',',':'))
print('land',sum(map(len,lr)),'bord',sum(map(len,br)),'zones',sum(len(''.join(v)) for v in zr.values()),'total',len(js))
open('geo25.json','w').write(js)

import json,math,statistics
AP=json.load(open('ap.json'));RT=json.load(open('routes.json'))['routes']
rad=math.radians;deg=math.degrees
def g(x,c,s):return math.exp(-((x-c)/s)**2)
def amp(lon):lon=((lon+540)%360)-180;return 0.55+0.7*math.exp(-((lon-140)/25)**2)
def u(lat,win,lon):
    a=abs(lat)
    if a<15:return -10
    A=amp(lon)
    if lat>=0:return A*180*g(lat,33,10)+90*g(lat,52,9) if win else 70*g(lat,43,9)+30*g(lat,55,9)
    return 60*g(a,47,9) if win else 120*g(a,35,10)+50*g(a,55,9)
def hav(a,b):
    p1,p2=rad(a[0]),rad(b[0]);dl=rad(b[1]-a[1])
    return 2*6371*math.asin(math.sqrt(math.sin((p2-p1)/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
def path(a,b,n=10):
    p1,l1,p2,l2=rad(a[0]),rad(a[1]),rad(b[0]),rad(b[1]);dd=hav(a,b)/6371;out=[]
    if dd<=0:return out
    for i in range(n):
        f=(i+.5)/n;A=math.sin((1-f)*dd)/math.sin(dd);B=math.sin(f*dd)/math.sin(dd)
        x=A*math.cos(p1)*math.cos(l1)+B*math.cos(p2)*math.cos(l2);y=A*math.cos(p1)*math.sin(l1)+B*math.cos(p2)*math.sin(l2);z=A*math.sin(p1)+B*math.sin(p2)
        lat=math.atan2(z,math.hypot(x,y));lon=math.atan2(y,x)
        brg=math.atan2(math.sin(l2-lon)*math.cos(p2),math.cos(lat)*math.sin(p2)-math.sin(lat)*math.cos(p2)*math.cos(l2-lon))
        out.append((deg(lat),deg(lon),math.sin(brg)))
    return out
def segair(pts,tas,win):
    t=0
    for i in range(len(pts)-1):
        L=hav(pts[i],pts[i+1]);pp=path(pts[i],pts[i+1]);tail=sum(u(a,win,b)*e for a,b,e in pp)/max(1,len(pp))
        t+=L*1.03/max(400,tas+tail)
    return t*60
d=json.load(open('/tmp/j/dumptt25.json'))
res=[]
for r in d:
    if not r['code'].startswith('KX') or r['via']:continue
    A,B=AP[r['fr']],AP[r['to']];D=hav(A,B)
    if D<3000:continue
    rt=RT.get(r['fr']+'-'+r['to']);rv=RT.get(r['to']+'-'+r['fr'])
    wp=None
    if rt and rt['z']:wp=[A]+rt['wp']+[B]
    elif rv and rv['z']:wp=[A]+rv['wp'][::-1]+[B]
    for s in 'sw':
        if not r.get(s):continue
        win=s=='w';gcm=segair([A,B],900,win);pm=segair(wp,900,win) if wp else None
        res.append((r['code'],r['fr'],r['to'],s,r[s]['dur'],gcm,pm))
un=[x[4]-x[5] for x in res if x[6] is None]
c=statistics.median(un);print('unaffected n',len(un),'pad median',round(c),'p25',round(sorted(un)[len(un)//4]),'p75',round(sorted(un)[len(un)*3//4]))
# 受影響：需要的 block＝路徑空中時間＋c
out=[]
for x in res:
    if x[6] is None:continue
    need=x[6]+c;dl=need-x[4]
    out.append((x[0],x[1],x[2],x[3],x[4],round(need),round(dl)))
for o in sorted(out,key=lambda o:-o[6]):print(*o)
print('---- war extra (path-gc air time)')
seen=set()
for x in res:
    if x[6] is None:continue
    k=(x[1],x[2],x[3])
    if k in seen:continue
    seen.add(k);print(x[0],x[1],x[2],x[3],round(x[6]-x[5]))

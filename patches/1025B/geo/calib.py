import json,math
AP=json.load(open('ap.json'));RT=json.load(open('routes.json'))['routes']
def hav(a,b):
    p1,p2=math.radians(a[0]),math.radians(b[0]);dl=math.radians(b[1]-a[1]);dp=p2-p1
    return 2*6371*math.asin(math.sqrt(math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
d=json.load(open('/tmp/j/dumptt25.json'))
rows=[]
for r in d:
    if not r['code'].startswith('KX') or r['via']:continue
    k1=r['fr']+'-'+r['to'];k2=r['to']+'-'+r['fr'];rt=RT.get(k1) or RT.get(k2)
    if rt and not rt['z']:rt=None
    d0=hav(AP[r['fr']],AP[r['to']])
    for s in 'sw':
        if r.get(s):rows.append((r['code'],r['fr'],r['to'],s,d0,rt['d1'] if rt else None,r[s]['dur']))
# 沒受影響的長程：block 與距離
un=[x for x in rows if x[5] is None and x[4]>3000]
import statistics
for s in 'sw':
  q=[x for x in un if x[3]==s]
  sp=[x[4]/((x[6]-35)/60) for x in q]
  print(s,'unaffected n',len(q),'eff speed km/h median',round(statistics.median(sp)),'p10',round(sorted(sp)[len(sp)//10]),'p90',round(sorted(sp)[len(sp)*9//10]))
for x in sorted([x for x in rows if x[5]],key=lambda x:x[0]):
    sp=x[4]/((x[6]-35)/60);need=35+x[5]/sp*60
    print(x[0],x[1],x[2],x[3],'blk',x[6],'gc',round(x[4]),'path',x[5],'gcspeed',round(sp),'eff path speed',round(x[5]/((x[6]-35)/60)))

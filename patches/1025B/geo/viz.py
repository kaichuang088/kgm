import json,sys
sys.argv=['x'];exec(open('route.py').read().split('# 0.5° 格')[0])
import matplotlib;matplotlib.use('Agg');import matplotlib.pyplot as plt
RT=json.load(open('routes.json'))['routes']
L=topo(WA+'/land-110m.json','land')
fig,ax=plt.subplots(figsize=(16,7))
for nm,rings in L:
    for p in rings:
        xs=[q[0] for q in p[0]];ys=[q[1] for q in p[0]];ax.fill(xs,ys,color='#ccc',lw=0)
for k,v in zp.items():
    for g in (v.geoms if hasattr(v,'geoms') else [v]):
        x,y=g.exterior.xy;ax.fill(x,y,color='#f99',alpha=.6,lw=0)
for k in ['TPE-VIE','BKK-LHR','HEL-TPE','JFK-TPE','TPE-WAW','BKK-IST','DOH-TPE','TPE-ZRH']:
    r=RT[k];a,b=k.split('-');pts=[AP[a]]+r['wp']+[AP[b]]
    full=[]
    for i in range(len(pts)-1):full+=gc(pts[i],pts[i+1],100)
    ax.plot([p[1] for p in full],[p[0] for p in full],'.',ms=1.5)
    ax.text(AP[b][1],AP[b][0],k,fontsize=7)
ax.set_xlim(-100,180);ax.set_ylim(-10,80);plt.savefig('/tmp/j/routes_chk.png',dpi=80,bbox_inches='tight')

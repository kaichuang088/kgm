import re,json
s=open('/tmp/j/kgm.html',encoding='utf-8').read()
m=re.search(r'AIRPORT_GEO\s*=\s*\{([^}]*)\}',s).group(1)
G={k:[float(a),float(b)] for k,a,b in re.findall(r'([A-Z]{3}):\[(-?[\d.]+),(-?[\d.]+)\]',m)}
w=open('../js/wind25.js',encoding='utf-8').read()
m2=re.search(r'GEO25=\{(.*?)\};',w,re.S).group(1)
for k,a,b in re.findall(r'([A-Z]{3}):\[(-?[\d.]+),(-?[\d.]+)\]',m2): G.setdefault(k,[float(a),float(b)])
json.dump(G,open('ap.json','w'))
d=json.load(open('/tmp/j/dumptt25.json'))
pairs=sorted({(r['fr'],r['to']) for r in d if r['code'].startswith('KX') and not r['via']})
miss=[p for p in pairs if p[0] not in G or p[1] not in G];print(len(G),'pairs',len(pairs),'missing',miss)

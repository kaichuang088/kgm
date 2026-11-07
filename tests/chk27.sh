#!/bin/bash
F=$1
timeout 300 node legdump.js $F /tmp/j/legs_X.json >/dev/null && python3 - <<'P'
import json,re
A={tuple(x[:4]):x for x in json.load(open('/tmp/j/legs_A.json'))};B={tuple(x[:4]):x for x in json.load(open('/tmp/j/legs_X.json'))}
def m(t):h,mm=t.split(':');return int(h)*60+int(mm)
s=open('/home/user/kgm/patches/1026C/js/bt26.js',encoding='utf-8').read()
E27=set(json.loads(re.search(r'var EARLY27=(\{[^}]*\});',s).group(1)).keys());print('table',len(E27))
bad=[];late=[];a03=[];zero=[];big=[]
for k,b in B.items():
  a=A.get(k)
  if not a or b[8]: continue
  d=(m(b[4])-m(a[4]))%1440
  if d>720:d-=1440
  sea='w' if '2026-10-25'<=k[3]<'2027-03-28' else 's'
  key='|'.join(k[:3])+'|'+sea
  if d<0 and key not in E27: bad.append((k,a[4],b[4],d))
  la=m(b[5])
  if la<180 and not (m(a[5])<180): late.append((k,a[5],b[5]))
  if 180<=la<240: a03.append((k,b[5]))
  if b[4]=='00:00': zero.append(k)
CF={'TSA':(1380,360),'GMP':(1380,360),'NRT':(0,360),'SYD':(1380,360),'FUK':(1320,420),'ITM':(1260,420),'FRA':(1380,300),'ZRH':(1410,360),'ORY':(1410,360),'ADL':(1380,360),'OOL':(1380,360)}
def inc(ap,t):
  c=CF.get(ap)
  if not c:return False
  return (t>=c[0] or t<c[1]) if c[0]>c[1] else (c[0]<=t<c[1])
cfx=[]
for k,b in B.items():
  a=A.get(k)
  if not a or b[8]:continue
  if inc(k[2],m(b[5])) and not inc(k[2],m(a[5])): cfx.append(('arr',k,a[5],b[5]))
  if inc(k[1],m(b[4])) and not inc(k[1],m(a[4])): cfx.append(('dep',k,a[4],b[4]))
print('new curfew',cfx)
print('earlier-not-in-table',bad);print('new 00-02:59',late);print('03xx',a03,'dep00:00',zero)
P
timeout 300 node short27.js $F 2026-10-28,2027-03-20,2027-04-01,2027-10-10,2027-07-15,2027-01-15

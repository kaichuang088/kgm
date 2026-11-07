# 1026B：關閉空域（2026-10-25 查證，見 notes/1026B）→ geo26.json（給 js/geo26.js）
#   每一區：顯示用多邊形（未加緩衝，跟 1025B 一樣的編碼）＋航路用 0.25° 格網（加緩衝，逐列 run-length）
#   航路在瀏覽器裡算（後台可開關、可加自訂空域），這裡不再預先算航路。
import json,sys,math
src=open('../../1025B/geo/mkgeo.py').read()
exec(src.split('zr={}')[0].replace("exec(open('route.py').read().split('# 0.5° 格')[0])","exec(open('route.py').read().split('ZONES={')[0])"))
import numpy as np, shapely
from shapely.geometry import Polygon,box
from shapely.ops import unary_union
C=topo(WA+'/countries-50m.json','countries')
cp={}
for nm,rings in C:cp.setdefault(nm,[]).extend(rings)
def country(nm):return unary_union([fixpoly(p) for p in cp[nm] if len(p[0])>3])
LANDU=LAND
def ll(pts):return Polygon([(lo,la) for la,lo in pts])
Z=[]   # (key, 中文, 英文, 預設開關, 緩衝度, 種類, 依據, 幾何)
def add(k,zh,en,on,buf,kind,basis,geom):Z.append((k,zh,en,on,buf,kind,basis,geom))
for k,zh,en,on,buf,basis in [
 ('Russia','俄羅斯','Russia',1,0.3,'多數航空公司避開（Safe Airspace 2026-10-25）；EASA 建議避開東經 60° 以西（2026-07）'),
 ('Ukraine','烏克蘭','Ukraine',1,0.3,'空域關閉（Safe Airspace 2026-10-25）'),
 ('Belarus','白俄羅斯','Belarus',1,0.3,'歐盟禁飛、多數航空公司避開'),
 ('Iran','伊朗','Iran',1,0.3,'EASA CZIB 不得於德黑蘭飛航情報區任何高度飛行（有效至 2026-11-16）'),
 ('Iraq','伊拉克','Iraq',1,0.5,'EASA CZIB（有效至 2026-11-16）'),
 ('Syria','敘利亞','Syria',1,0.5,'EASA CZIB-2017-03R20（有效至 2026-11-30）'),
 ('Lebanon','黎巴嫩','Lebanon',1,0.5,'EASA CZIB（有效至 2026-11-16）'),
 ('Jordan','約旦','Jordan',1,0.3,'EASA CZIB-2026-08-R3（有效至 2026-11-16）'),
 ('Yemen','葉門','Yemen',1,0.5,'EASA CZIB-2017-07R20 沙那飛航情報區（有效至 2027-04-30）'),
 ('Libya','利比亞','Libya',1,0.5,'EASA CZIB-2017-02R20（有效至 2027-01-31）'),
 ('Sudan','蘇丹','Sudan',1,0.5,'EASA 建議不得進入喀土穆飛航情報區（任何高度）'),
 ('North Korea','北韓','North Korea',1,0.15,'美國 SFAR 79 禁飛平壤飛航情報區東經 132° 以西；Safe Airspace 第二級（飛彈試射）'),
 ('Israel','以色列','Israel',0,0.3,'EASA 只發資訊通報（2026-08-31，自行評估），預設不關'),
 ('Palestine','巴勒斯坦','Palestine',0,0.3,'同以色列飛航情報區，預設不關'),
 ('Afghanistan','阿富汗','Afghanistan',0,0.3,'EASA 等只建議 FL320 以下避開，巡航高度可飛越，預設不關'),
]:add(k,zh,en,on,buf,'country',basis,country(k))
sea=ll([(30.6,47.4),(30.6,50.6),(28.6,51.4),(27.2,54.0),(26.7,56.3),(26.0,57.2),(24.6,58.7),(23.4,58.9),(23.6,57.0),(24.1,55.0),(24.2,52.5),(24.6,51.2),(25.9,50.3),(27.6,48.8),(29.0,48.0)]).difference(LANDU)
add('Gulf','波斯灣水域','Persian Gulf waters',1,0.0,'sea','EASA CZIB：波斯灣與阿曼灣西側水域上空（有效至 2026-11-16）；杜拜、杜哈等機場照常起降（起降機場 300 公里內不受限）',sea)
sau=country('Saudi Arabia')
add('SaudiSE','沙烏地東南部','Saudi Arabia (SE)',1,0.2,'area','EASA CZIB-2026-09-R1（2026-10-09）沙烏地東南部一區（葉門邊境；範圍為概略）',sau.intersection(box(42.5,16.3,52.5,19.6)))
add('SaudiNW','沙烏地西北部','Saudi Arabia (NW)',1,0.2,'area','EASA CZIB-2026-09-R1 沙烏地西北部一區（約旦／亞喀巴灣一帶；範圍為概略）',sau.intersection(box(34.4,28.0,39.6,32.3)))
# 0.25° 格網（緯度 90→−90 一列一列，經度 −180→180）
ST=0.25;LAT=90-ST/2-np.arange(720)*ST;LON=-180+ST/2+np.arange(1440)*ST
gx,gy=np.meshgrid(LON,LAT)
def rle(geom,buf):
    g=geom.buffer(buf) if buf>0 else geom
    m=shapely.contains_xy(g,gx.ravel(),gy.ravel()).reshape(720,1440)
    rows=[]
    for y in range(720):
        r=m[y]
        if not r.any():continue
        d=np.diff(np.concatenate([[0],r.astype(np.int8),[0]]));s=np.where(d==1)[0];e=np.where(d==-1)[0]
        rows.append(str(y)+':'+','.join('%d-%d'%(a,b-1) for a,b in zip(s,e)))
    return ';'.join(rows),int(m.sum())
zones={}
for k,zh,en,on,buf,kind,basis,geom in Z:
    rl,n=rle(geom,buf)
    zones[k]={'zh':zh,'en':en,'on':on,'kind':kind,'basis':basis,'r':enc(rings_of(geom,0.04)),'g':rl}
    print(k,on,kind,'cells',n,'rle',len(rl),flush=True)
G=json.load(open('../../1025B/geo/geo25.json'))
out={'q':G['q'],'land':G['land'],'bord':G['bord'],'zones':zones,'asof':'2026-10-25'}
js=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open('geo26.json','w').write(js);print('total',len(js))

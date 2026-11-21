# 1026B：輪擋時間線性模型（實際班表擬合）block = k0 + k1·d + k2·d·EJ + k3·e^(−d/1500) + 冬季 k4·d·EJ
#   d＝大圓距離（千公里）；EJ＝沿大圓每一點「往東分量 × 西風帶權重（緯度 35° 附近最大）」的平均（往東為正）
import json,math
import numpy as np
exec(open('fit26.py').read().split('# 實際班表')[0])
REAL=[('TPE','NRT',200,200),('NRT','TPE',225,250),('TPE','LAX',710,700),('LAX','TPE',790,860),
 ('TPE','JFK',895,885),('JFK','TPE',950,None),('TPE','SYD',555,565),('TPE','SIN',272,272),('SIN','TPE',278,278),
 ('TPE','HKG',125,125),('BKK','TPE',215,215),('TPE','BKK',243,243),
 ('TPE','OKA',100,95),('OKA','TPE',95,95),('TPE','ICN',155,150),('ICN','TPE',155,None),('TPE','KIX',170,155),('KIX','TPE',175,195),
 ('PVG','TPE',120,None),('TPE','MNL',135,140)]
# 來源（2026 年班表，網路查證）：CI100/101、BR12/11、BR32/31、CI51、CI753/754、CI903、CI834/837、CI120/121、CI160/161、CI152/153、CI502、CI701
def feats(fr,to):
    A,B=geo(fr),geo(to);d=hav(A,B)/1000;pts=path(A,B,24)
    ej=sum(o[2]*math.exp(-((abs(o[0])-35)/15)**2)*(1 if o[0]>=0 else 0.4) for o in pts)/len(pts)
    return d,ej
rows=[];y=[]
for fr,to,s,w in REAL:
    d,ej=feats(fr,to)
    rows.append([1,d,d*ej,math.exp(-d/1.5),0]);y.append(s)
    if w is not None:rows.append([1,d,d*ej,math.exp(-d/1.5),d*ej]);y.append(w)
X=np.array(rows);Y=np.array(y)
k,res,rk,sv=np.linalg.lstsq(X,Y,rcond=None)
pred=X@k;print('k',[round(v,3) for v in k],'rms',round(float(np.sqrt(np.mean((pred-Y)**2))),1))
i=0
for fr,to,s,w in REAL:
    d,ej=feats(fr,to);ps=k[0]+k[1]*d+k[2]*d*ej+k[3]*math.exp(-d/1.5);pw=ps+k[4]*d*ej
    print(fr,to,round(d*1000),'ej',round(ej,2),'real',s,w,'model',round(ps),round(pw))
json.dump({'k':list(k)},open('fit26b.json','w'))

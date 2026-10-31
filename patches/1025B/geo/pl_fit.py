# 1025B R：Payload 限座模型校正（華航 A359 306 席，台北直飛歐洲冬季少賣的經濟艙座位，使用者提供）
import json,numpy as np
C=json.load(open('ci_cal.json'))
SEATS_CI=306;WPAX=100;TAXI=30
T=[];Y=[];K=[]
for k,v in C.items():
    T.append((v['airW']+TAXI)/60);Y.append(SEATS_CI-v['blocked']);K.append(k)
T=np.array(T);Y=np.array(Y)
A=np.vstack([np.ones_like(T),-T]).T
(a,s),res,_,_=np.linalg.lstsq(A,Y,rcond=None)
b=s*WPAX/1.05                   # 每小時有效油耗 kg（燃油＝b×(輪擋×1.05＋1.25)＋300）
Cst=a*WPAX+b*1.25+300           # MTOW−OEW−最低貨郵 kg
print('fit maxPax = %.1f − %.2f×T(h)'%(a,s),' → 有效油耗 %.0f kg/h, 可用載重常數 %.0f kg'%(b,Cst))
pred=a-s*T
for k,t,y,p in zip(K,T,Y,pred):print(k,'block %.2fh'%t,'CI blocked',SEATS_CI-y,'model',round(SEATS_CI-p),'diff',round((SEATS_CI-p)-(SEATS_CI-y)))
print('RMSE seats',round(float(np.sqrt(np.mean((pred-Y)**2))),1))
T0=a/s if False else (a-SEATS_CI)/s       # 少賣＝0 的輪擋時間（小時）
frac=s/SEATS_CI                            # 每多飛 1 小時少賣的座位比例
rf=(T0-TAXI/60)*905/15000                  # 滿載航程係數：A359 型錄航程 15,000 km × rf ＝ 實際能滿載飛的距離（含貨郵、備油）
print('少賣=0 的輪擋 %.2f h；每多 1 小時少賣 %.1f%% 座位；滿載航程係數 %.3f'%(T0,frac*100,rf))
json.dump({'T0':T0,'frac':frac,'rf':rf,'a':a,'s':s},open('pl_fit.json','w'))

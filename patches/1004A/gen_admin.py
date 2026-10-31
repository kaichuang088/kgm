import json
out=[]
def J(x):return json.dumps(x,ensure_ascii=False)
def R(label,old,new,cnt=1):out.append('R(%s,%s,%s,%d);'%(J(label),J(old),J(new),cnt))
def RL(label,layer,old,new,cnt=1):out.append('RL(%s,%s,%s,%s,%d);'%(J(label),J(layer),J(old),J(new),cnt))
hdr='''/* 1004A · 後台（角色與通關密語、競標、會員管理、財務、後台 AI…） */
'''
# ---- #101 角色：後台人員 → 系統人員；新增定價人員；七個職務通關密語 ----
R('role zh','const ROLE_ZH={ground:"地勤人員",cabin:"客艙組員",pilot:"飛行員",backend:"後台人員",service:"客服人員",ceo:"CEO"};',
  'const ROLE_ZH={ground:"地勤人員",cabin:"客艙組員",pilot:"飛行員",backend:"系統人員",pricing:"定價人員",service:"客服人員",ceo:"CEO"};/* 1004A：後台人員改為系統人員，新增定價人員 */')
R('role pass default','rolePass:LS.get("kgm_rolepass",{ground:"GroundCrew988",cabin:"CabinCrew147",pilot:"Pilot744182",backend:"StaffMember132",service:"CustomerService827",ceo:"CEO882CEO1"})',
  'rolePass:LS.get("kgm_rolepass",{ground:"GroundCrew9288",cabin:"CabinCrew1247",pilot:"Pilot744182",pricing:"PriceControl2472",backend:"System0283",service:"CustomerService8297",ceo:"CEO882CEO1"})/* 1004A：使用者指定的新通關密語 */')
R('role tabs pricing','const GATED_TABS={','/* 1004A：定價人員（票價管理、財務與營收、優惠碼、競標、航線）；其餘沿用 */\nROLE_TABS.pricing=["price","finance","coupons","auctions","routes","status","chat","leave","stafftix","salary"];\nconst GATED_TABS={')
R('base salary','const BASE_SALARY={pilot:260000,cabin:82000,ground:55000,backend:60000,service:52000,ceo:320000,admin:65000,other:45000};',
  'const BASE_SALARY={pilot:260000,cabin:82000,ground:55000,backend:60000,pricing:62000,service:52000,ceo:320000,admin:65000,other:45000};')
R('role select dq','["backend","後台人員"]','["backend","系統人員"],["pricing","定價人員"]',2)
R('role select sq',"['backend','後台人員']","['backend','系統人員'],['pricing','定價人員']")
R('role r2k','"後台":"backend","後台人員":"backend"','"後台":"backend","後台人員":"backend","系統":"backend","系統人員":"backend","定價":"pricing","定價人員":"pricing"')
R('role pass list','["ground","cabin","pilot","backend","service","ceo"].map(function(r){return \'<div style="display:grid;grid-template-columns:110px 1fr',
  '["ground","cabin","pilot","pricing","backend","service","ceo"].map(function(r){return \'<div style="display:grid;grid-template-columns:110px 1fr')
R('role pass migrate','S.staff=S.staff||[];S.rolePass=S.rolePass||{};','''S.staff=S.staff||[];S.rolePass=S.rolePass||{};
/* 1004A：職務通關密語一次換成使用者指定的新值（瀏覽器裡存著舊值的也更新；之後 CEO 自己改的照舊保留） */
if(!S.rolePassR929){S.rolePass=Object.assign({},S.rolePass,{ground:"GroundCrew9288",cabin:"CabinCrew1247",pilot:"Pilot744182",pricing:"PriceControl2472",backend:"System0283",service:"CustomerService8297",ceo:"CEO882CEO1"});S.rolePassR929=1;try{LS.set("kgm_rolepass",S.rolePass);LS.set("kgm_rolepass_r929",1)}catch(_){}}
try{if(LS.get("kgm_rolepass_r929",0))S.rolePassR929=1}catch(_){}''')
R('role seed pricing',"var seedJ=[{empId:'KGMADMIN',name:'KGM 後台管理員',email:'admin@kgm.local',role:'backend',password:'KGMAdmin0819'},",
  "var seedJ=[{empId:'KGMADMIN',name:'KGM 系統人員',email:'admin@kgm.local',role:'backend',password:'KGMAdmin0819'},{empId:'KGMPRICING',name:'KGM 定價人員',email:'pricing@kgm.local',role:'pricing',password:'KGMPricing0929'},")
RL('perm def pricing','kgm-0903b-r123',"  service:{bookings:'use',cases0831B:'use',upgmiles:'use',members:'use',milesverify:'use',",
  "  /* 1004A：定價人員 */\n  pricing:{price:'use',finance:'use',coupons:'use',auctions:'use',routes:'use',status:'view',news_r49:'view',\n    leave:'use',stafftix:'use',salary:'view',chat:'use',history:'view'},\n  service:{bookings:'use',cases0831B:'use',upgmiles:'use',members:'use',milesverify:'use',")
open('p_f_admin.js','w').write(hdr+'\n'.join(out)+'\n')

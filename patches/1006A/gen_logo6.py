from common import *
import json
# ══ 1006A #27：聯營航班顯示真的航空公司 logo，不是文字 CX／JL ══
#   根因：logo 是執行時才去外部網站抓（Google favicon／Clearbit）；預覽框或沒有外網時一律失敗，退回文字縮寫。
#   改成把各家 logo 內嵌在檔案裡（取自 MIT 授權的 airlogos 套件，128×128 PNG），外部網址只當備援。
import os
M=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'assets','partner_logos.json')))
R('logo map',
 "  var FINAL_LOGO_DOMAIN_0809C={",
 "  /* 1006A：內嵌的聯營夥伴 logo（不必連外網） */\n"
 "  window.KGM_PARTNER_LOGO_R1006A="+json.dumps(M,ensure_ascii=False)+";\n"
 "  var FINAL_LOGO_DOMAIN_0809C={")
R('logo final use embedded',
 "var src='https://www.google.com/s2/favicons?domain='+encodeURIComponent(dom)+'&sz=128';",
 "var src=(window.KGM_PARTNER_LOGO_R1006A||{})[c.operator]||('https://www.google.com/s2/favicons?domain='+encodeURIComponent(dom)+'&sz=128');   /* 1006A：先用內嵌 logo */")
R('logo clearbit use embedded',
 "<img src=\"https://logo.clearbit.com/'+dom+'?size=128\"",
 "<img src=\"'+((window.KGM_PARTNER_LOGO_R1006A||{})[c.operator]||('https://logo.clearbit.com/'+dom+'?size=128'))+'\"")
R('logo visual use embedded',
 "    var br=(window.kgmAirlineBrandR929&&window.kgmAirlineBrandR929(c.operator))||{code:'OW',color:'#304357'};\n    return '<span class=\"real-air-logo0809c mono929\"",
 "    /* 1006A：有內嵌的真 logo（正方形標誌，不是寬版字標）就直接用，不再只畫代號圓圈 */\n"
 "    var lg6=(window.KGM_PARTNER_LOGO_R1006A||{})[c.operator];\n"
 "    if(lg6)return '<span class=\"real-air-logo0809c partner logo1006A\" title=\"'+safe0815(c.operator)+'\" style=\"background:#fff\"><img src=\"'+lg6+'\" alt=\"'+safe0815(c.operator)+'\" style=\"width:38px;height:38px;object-fit:contain;padding:0\"></span>';\n"
 "    var br=(window.kgmAirlineBrandR929&&window.kgmAirlineBrandR929(c.operator))||{code:'OW',color:'#304357'};\n    return '<span class=\"real-air-logo0809c mono929\"")
RL('r35 op badge logo','kgm-0816a-r35',
 "        '<span class=\"r35-oplogo\" title=\"'+E((z()?'實際承運：':'Operated by ')+op)+'\">'+E(initials(op))+'</span>');",
 "        ((window.KGM_PARTNER_LOGO_R1006A||{})[op]   /* 1006A：承運航空的小標也用真 logo */\n"
 "          ?'<span class=\"r35-oplogo\" title=\"'+E((z()?'實際承運：':'Operated by ')+op)+'\" style=\"background:#fff;border:1px solid #dfe5ea;padding:0 2px\"><img src=\"'+window.KGM_PARTNER_LOGO_R1006A[op]+'\" alt=\"'+E(op)+'\" style=\"height:14px;width:14px;object-fit:contain;display:block\"></span>'\n"
 "          :'<span class=\"r35-oplogo\" title=\"'+E((z()?'實際承運：':'Operated by ')+op)+'\">'+E(initials(op))+'</span>'));")
save('p_h_logo.js','/* 1006A · 聯營夥伴 logo 內嵌 */\n')

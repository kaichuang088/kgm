/* 0928B · 補派（覆蓋補救）也要接對號班（使用者：「0928 飛 KX108 要緊接 0927 KX107」）
   A330 長程版缺機的那約 4,000 段，是在「覆蓋補救」這一步交給 B779 的；原本挑「班最少的那一架」，
   於是昨天飛 KX107 回台北的那架，今天的 KX108 常常給了另一架。
   改成：放得下的飛機裡，先挑「上一段剛好是對號班、30 小時內落地台北」的那一架；沒有才挑班最少的。 */
RL('cont fn','kgm-0823o-r72',
"      return !block.some(function(q){return unavailable72(t,q.date)});\n    }\n",
"      return !block.some(function(q){return unavailable72(t,q.date)});\n    }\n    function cont928(t,block){\n      try{\n        var b0=block[0];if(!b0||b0.noPax||b0.fr!=='TPE')return false;\n        var m=numR72(b0.code);if(m<0)return false;\n        var a=span72(block)[0],v=ivals[t]||[],lo=0,hi=v.length;while(lo<hi){var mid=(lo+hi)>>1;if(v[mid][0]<a)lo=mid+1;else hi=mid}\n        var prev=lo?v[lo-1]:null;if(!prev||prev[3]!=='TPE'||a-prev[1]>1800)return false;\n        var q=(S.tailAssign[t]||[]).filter(function(x){return x&&!x.noPax&&rowEpoch72(x)===prev[0]})[0];if(!q)return false;\n        var k=numR72(q.code);return k>=0&&(k===m||Math.abs(k-m)===1);\n      }catch(_){return false}\n    }\n",1);
RL('cont same type','kgm-0823o-r72',
"      var pick=null,pickType=type;for(var ti=0;ti<tails.length;ti++){var tt=tails[ti];if(!canFit(tt,block))continue;if(!pick||loads[tt]<loads[pick])pick=tt}\n",
"      var pick=null,pickType=type,pickC928=false;for(var ti=0;ti<tails.length;ti++){var tt=tails[ti];if(!canFit(tt,block))continue;var c928=cont928(tt,block);if(!pick||(c928&&!pickC928)||(c928===pickC928&&loads[tt]<loads[pick])){pick=tt;pickC928=c928}}   /* 0928B：先接對號班，再看班數 */\n",1);
RL('cont cross type','kgm-0823o-r72',
"if(!canFit(tail,block))return;var n928=(S.tailAssign[tail]||[]).length;if(n928<bestN928){bestN928=n928;best928=tail}",
"if(!canFit(tail,block))return;var n928=(S.tailAssign[tail]||[]).length-(cont928(tail,block)?1e6:0);if(n928<bestN928){bestN928=n928;best928=tail}",1);

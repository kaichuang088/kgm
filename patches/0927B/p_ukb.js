/* 0927B · UKB：A21X（A321neo 雙艙特別版）也算符合「UKB 只准 A321neo」 */
RL('r6 acftOfFlight ukb','kgm-0812a-r6',
 "acftOfFlight=function(code,date){var rows=scheduledRows6(code);if(rows.some(function(f){return f.acft==='A21N'||f.fr==='UKB'||f.to==='UKB';}))return 'A21N';",
 "acftOfFlight=function(code,date){var rows=scheduledRows6(code);if(rows.some(function(f){return f.acft==='A21N'||f.fr==='UKB'||f.to==='UKB';}))return rows.some(function(f){return f.acft==='A21X';})?'A21X':'A21N';/* 0927B：KX160／KX159 的 A21X 特別版也是 A321neo，照排定機型回報 */");
RL('r6 actualType ukb','kgm-0812a-r6',
 "function actualType6(f,date){if(f.acft==='A21N'||f.fr==='UKB'||f.to==='UKB')return 'A21N';",
 "function actualType6(f,date){if(f.acft==='A21X')return 'A21X';/* 0927B：A21X 特別版是 A321neo，UKB 用它符合規定，不是機型異動 */if(f.acft==='A21N'||f.fr==='UKB'||f.to==='UKB')return 'A21N';");
R('r6 audit ukb',
 "ukbAllA21N:fUkb.every(function(f){return actualType6(f,todayISO())==='A21N';})",
 "ukbAllA21N:fUkb.every(function(f){var t=actualType6(f,todayISO());return t==='A21N'||t==='A21X';})");
R('r6 label ukb',"<div class=\"r6-stat\"><small>UKB</small><b>A21N ONLY</b></div>","<div class=\"r6-stat\"><small>UKB</small><b>A21N / A21X</b></div>");

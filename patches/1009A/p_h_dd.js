/* 1006A · 跨日標示 +1／-1 */
R("dd helper","// ── LANGUAGE ─","/* 1006A：跨日標示（+1／-1）。原本一律 '+'+dd，-1 會變成「+-1」 */\nfunction kgmDdR1006A(n){n=+n||0;return n>0?'+'+n:String(n)}\n// ── LANGUAGE ─",1);
R("dd \"+\"+ff.dd","\"+\"+ff.dd","\"\"+kgmDdR1006A(ff.dd)",1);
R("dd ' +'+f.dd","' +'+f.dd","' '+kgmDdR1006A(f.dd)",5);
R("dd ' +'+v.dd","' +'+v.dd","' '+kgmDdR1006A(v.dd)",1);
R("dd ' +'+x.dd","' +'+x.dd","' '+kgmDdR1006A(x.dd)",5);
R("dd '<sup>+'+s.dd","'<sup>+'+s.dd","'<sup>'+kgmDdR1006A(s.dd)",2);
R("dd ' +'+rec.dd","' +'+rec.dd","' '+kgmDdR1006A(rec.dd)",1);
R("dd '+'+rec.dd","'+'+rec.dd","''+kgmDdR1006A(rec.dd)",1);
R("dd '+'+f.dd","'+'+f.dd","''+kgmDdR1006A(f.dd)",3);
R("dd ' +'+o.dd","' +'+o.dd","' '+kgmDdR1006A(o.dd)",2);
R("dd '<sup>+'+f.dd","'<sup>+'+f.dd","'<sup>'+kgmDdR1006A(f.dd)",1);
R("dd ' +'+c.f.dd","' +'+c.f.dd","' '+kgmDdR1006A(c.f.dd)",1);
R("dd ' +'+l.dd","' +'+l.dd","' '+kgmDdR1006A(l.dd)",1);
R("dd '+'+t.dd","'+'+t.dd","''+kgmDdR1006A(t.dd)",1);
R("dd '+'+r.dd","'+'+r.dd","''+kgmDdR1006A(r.dd)",1);
R("dd ' +'+dd","' +'+dd","' '+kgmDdR1006A(dd)",1);
R("dd sg","'<u>+'+E(sg.dd)","'<u>'+E(kgmDdR1006A(sg.dd))",1);

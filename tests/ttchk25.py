import pymupdf as fitz,re,sys
for f in sys.argv[1:]:
  d=fitz.open(f);bad=[];n=0
  for i,p in enumerate(d):
    pix=p.get_pixmap(dpi=144)
    for b in p.get_text('dict')['blocks']:
      for l in b.get('lines',[]):
        for s in l['spans']:
          if re.fullmatch(r'\d+h\d\dm( ~)?( \d+h\d\dm)?',s['text'].strip()) and s['color']==0xffffff:
            n+=1;x0,y0,x1,y1=s['bbox'];light=0;tot=0
            for xx in range(int(x0*2),int(x1*2),2):
              for yy in (int(y0*2)+1,int(y1*2)-1):
                c=pix.pixel(min(pix.width-1,xx),min(pix.height-1,yy));tot+=1
                if sum(c)>600: light+=1
            if tot and light/tot>0.5: bad.append((i+1,s['text']))
  print(f.split('/')[-1],'white band texts',n,'on light background',len(bad),bad[:10])

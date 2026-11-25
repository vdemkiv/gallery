/* More spaces: Paris, London, Miami, Los Angeles, the Alps, Bilbao, and a museum corridor with a skylit hall. */
(function(){
const K=window.KIT,P=K.paint,R=window.ROOMS,M=R.M,C=R.CITIES,sized=R.sized,rnd=K.rnd;

/* ---------- painted scenery ---------- */
function haze(g,w,h,a,col){g.globalCompositeOperation='source-atop';g.fillStyle=col||`rgba(228,232,236,${a})`;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}
function ridgeLine(w,base,amp,seed){const f=[[.0021,1],[.0057,.45],[.013,.22],[.031,.1],[.07,.05]].map(([k,a])=>[k*(.8+seed*.4),a,rnd(0,7)]);
  return x=>base-amp*f.reduce((s,[k,a,p])=>s+a*Math.sin(x*k+p),0);}
P.ridge=(o)=>K.canvas(o.w||4096,o.h||1024,(g,w,h)=>{g.clearRect(0,0,w,h);const y=ridgeLine(w,h*(o.base||.45),h*(o.amp||.25),Math.random());
  g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=4)g.lineTo(x,y(x));g.lineTo(w,h);g.closePath();
  const gr=g.createLinearGradient(0,h*.2,0,h);(o.stops||[[0,o.col||'#6b7356'],[1,o.col2||o.col||'#4f563f']]).forEach(s=>gr.addColorStop(s[0],s[1]));g.fillStyle=gr;g.fill();
  g.save();g.clip();
  if(o.tex==='scrub'||o.tex==='forest'){const cols=o.dots||['rgba(40,48,30,.5)','rgba(90,96,66,.45)','rgba(30,36,24,.55)'];const n=o.n||9000;
    for(let i=0;i<n;i++){const x=rnd(0,w),yy=rnd(y(x)-4,h);g.fillStyle=cols[i%cols.length];g.beginPath();g.ellipse(x,yy,rnd(2,o.tex==='forest'?7:5),rnd(1.5,o.tex==='forest'?9:4),0,0,7);g.fill();}}
  if(o.tex==='rock'){for(let i=0;i<1800;i++){const x=rnd(0,w),yy=rnd(y(x),h);g.strokeStyle=`rgba(${Math.random()<.5?'40,40,44':'210,212,216'},.25)`;g.lineWidth=rnd(1,3);g.beginPath();g.moveTo(x,yy);g.lineTo(x+rnd(-30,30),yy+rnd(10,60));g.stroke();}}
  if(o.snow){for(let x=0;x<w;x+=3){const t=y(x);const depth=Math.max(0,(h*(o.base||.45)-t))*o.snow;if(depth>2){g.fillStyle='rgba(244,246,248,.92)';g.fillRect(x,t,3,depth*rnd(.6,1.1));}}
    for(let i=0;i<500;i++){const x=rnd(0,w),t=y(x);g.fillStyle='rgba(245,247,250,.8)';g.beginPath();g.moveTo(x,t+rnd(0,80));g.lineTo(x+rnd(-14,14),t+rnd(40,200));g.lineTo(x+rnd(-4,4),t+rnd(40,200));g.fill();}}
  if(o.houses){for(let i=0;i<o.houses;i++){const x=rnd(0,w),t=y(x)+rnd(20,(h-y(x))*.8),s=rnd(8,16);g.fillStyle='#ece7de';g.fillRect(x,t,s*1.3,s);g.fillStyle='#9a4f37';g.beginPath();g.moveTo(x-2,t);g.lineTo(x+s*.65,t-s*.5);g.lineTo(x+s*1.3+2,t);g.fill();g.fillStyle='rgba(40,40,40,.6)';g.fillRect(x+3,t+s*.35,2,3);g.fillRect(x+s*.8,t+s*.35,2,3);}}
  g.restore();K.noise(g,w,h,8);if(o.haze)haze(g,w,h,o.haze,o.hazeCol);});
P.water=(o)=>K.canvas(1024,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,o.far||'#9fb4bf');gr.addColorStop(1,o.near||'#4d6a76');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<5000;i++){const y=rnd(0,h),l=rnd(6,40)*(.3+y/h);g.fillStyle=Math.random()<.5?'rgba(255,255,255,.12)':'rgba(10,30,40,.12)';g.fillRect(rnd(0,w),y,l,1+y/h*1.5);}});
P.grass=(o)=>K.canvas(1024,1024,(g,w,h)=>{g.fillStyle=o.col||'#7c8a55';g.fillRect(0,0,w,h);const cols=o.cols||['#6c7a48','#8f9c63','#5d6a3e','#a3ab76'];K.soft(g,24,(q)=>{for(let i=0;i<46;i++){q.globalAlpha=.35;q.fillStyle=cols[i%cols.length];q.beginPath();q.ellipse(rnd(0,w),rnd(0,h),rnd(60,200),rnd(40,140),rnd(0,3),0,7);q.fill();}});g.globalAlpha=1;for(let i=0;i<14000;i++){g.strokeStyle=cols[i%cols.length];g.globalAlpha=.5;g.lineWidth=1;const x=rnd(0,w),y=rnd(0,h);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-2,2),y-rnd(3,8));g.stroke();}g.globalAlpha=1;});
P.treeLine=(o)=>K.canvas(4096,512,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<o.n;i++){const x=rnd(0,w),hh=rnd(.45,1)*h,ww=hh*rnd(.22,.32);g.fillStyle=o.cols[i%o.cols.length];g.beginPath();g.moveTo(x,h-hh);g.lineTo(x-ww/2,h);g.lineTo(x+ww/2,h);g.fill();}K.noise(g,w,h,10);if(o.haze)haze(g,w,h,o.haze);});

/* a mountain or hill range on a transparent canvas: rock, snow, forest below a tree line, or mottled scrub/pasture */
P.range=(o)=>K.canvas(4096,o.h||1024,(g,w,h)=>{g.clearRect(0,0,w,h);const top=ridgeLine(w,h*o.top,h*o.amp,Math.random());
  const path=(f)=>{g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=3)g.lineTo(x,f(x));g.lineTo(w,h);g.closePath();};
  path(top);const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,o.rock||'#86878a');gr.addColorStop(1,o.rock2||o.rock||'#5d5f62');g.fillStyle=gr;g.fill();
  g.save();path(top);g.clip();
  if(o.rocky){K.soft(g,1.5,(q)=>{for(let i=0;i<3200;i++){const x=rnd(0,w),t=top(x),yy=rnd(t,h);q.strokeStyle=Math.random()<.55?'rgba(32,34,38,.24)':'rgba(222,224,228,.16)';q.lineWidth=rnd(1,4);q.beginPath();q.moveTo(x,yy);q.lineTo(x+rnd(-18,18),yy+rnd(20,110));q.stroke();}});
    // shade the left flank of each ridge so the light reads as coming from one side
    }
  if(o.mottle){const cols=o.mottle;K.soft(g,5,(q)=>{for(let i=0;i<1600;i++){const x=rnd(0,w),yy=rnd(top(x),h);q.globalAlpha=rnd(.15,.4);q.fillStyle=cols[i%cols.length];q.beginPath();q.ellipse(x,yy,rnd(8,40),rnd(4,14),0,0,7);q.fill();}});
    for(let i=0;i<60000;i++){const x=rnd(0,w),yy=rnd(top(x),h);g.globalAlpha=rnd(.15,.45);g.fillStyle=cols[i%cols.length];g.fillRect(x,yy,rnd(1,2.5),rnd(1,2));}g.globalAlpha=1;
    K.soft(g,3,(q)=>{for(let i=0;i<(o.gullies||50);i++){let x=rnd(0,w),yy=top(x)+4;q.strokeStyle=o.gullyCol||'rgba(30,32,24,.22)';q.lineWidth=rnd(2,6);q.beginPath();q.moveTo(x,yy);for(let k=0;k<9;k++){x+=rnd(-14,14);yy+=rnd(20,60);q.lineTo(x,yy);}q.stroke();}});
    }
  if(o.snow){K.soft(g,1.2,(q)=>{const sl=h*(o.snowLine||o.top+.12);for(let x=0;x<w;x+=2){const t=top(x);const d=Math.max(0,sl-t)*rnd(.75,1.1);if(d>1){q.fillStyle=top(x)>top(x-2)?'rgba(214,220,230,.95)':'rgba(247,248,250,.97)';q.fillRect(x,t,2,d);}}
    for(let i=0;i<1100;i++){const x=rnd(0,w),t=top(x);if(t>sl)continue;const L=rnd(30,180);q.strokeStyle='rgba(240,242,246,.7)';q.lineWidth=rnd(1,3.5);q.beginPath();q.moveTo(x,t+rnd(0,30));q.quadraticCurveTo(x+rnd(-10,10),t+L*.5,x+rnd(-16,16),t+L);q.stroke();}});}
  if(o.tree){const tl=ridgeLine(w,h*o.tree,h*.04,Math.random());const f=x=>Math.max(top(x)+6,tl(x));path(f);g.fillStyle=o.forest||'#2c3a2a';g.fill();
    g.save();path(f);g.clip();const cols=o.fcols||['#1c271b','#33442d','#25321f','#3e4f37','#2a3824'];for(let i=0;i<(o.n||40000);i++){const x=rnd(0,w),yy=rnd(f(x)-3,h),s=rnd(1.5,4);g.fillStyle=cols[i%cols.length];g.beginPath();g.moveTo(x,yy-s*2.4);g.lineTo(x-s*.6,yy);g.lineTo(x+s*.6,yy);g.fill();}
      if(o.meadows){for(let i=0;i<o.meadows;i++){const x=rnd(0,w),yy=rnd(f(x)+20,h);K.soft(g,2,(q)=>{q.fillStyle='rgba(122,138,82,.85)';q.beginPath();q.ellipse(x,yy,rnd(20,70),rnd(8,24),rnd(-.3,.3),0,7);q.fill();});if(Math.random()<.5){g.fillStyle='#e8e2d6';g.fillRect(x,yy-3,5,4);g.fillStyle='#5b3a2a';g.fillRect(x-1,yy-5,7,2);}}}
      g.restore();}
  if(o.houses){for(let i=0;i<o.houses;i++){const x=rnd(0,w),t=top(x)+rnd(30,(h-top(x))*.85),s=rnd(4,9);g.fillStyle=Math.random()<.7?'#d6d0c4':'#c4b8a3';g.fillRect(x,t,s*1.4,s);g.fillStyle='#8f4a33';g.beginPath();g.moveTo(x-1,t);g.lineTo(x+s*.7,t-s*.45);g.lineTo(x+s*1.4+1,t);g.fill();}}
  g.restore();K.noise(g,w,h,6);
  const rgb=o.hazeRGB||'214,224,234';g.globalCompositeOperation='source-atop';const hz=g.createLinearGradient(0,0,0,h);hz.addColorStop(0,`rgba(${rgb},${o.haze||0})`);hz.addColorStop(1,`rgba(${rgb},${Math.min(.9,(o.haze||0)+(o.hazeBase||.12))})`);g.fillStyle=hz;g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';});
/* patchwork valley floor seen from far above */
P.fields=(o)=>K.canvas(1024,1024,(g,w,h)=>{g.fillStyle=o.base||'#6b7849';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){g.globalAlpha=.75;g.fillStyle=o.cols[i%o.cols.length];g.save();g.translate(rnd(0,w),rnd(0,h));g.rotate(rnd(-.4,.4));g.fillRect(0,0,rnd(40,150),rnd(18,70));g.restore();}g.globalAlpha=1;
  K.soft(g,2,(q)=>{for(let i=0;i<40;i++){q.fillStyle='rgba(30,42,28,.8)';q.beginPath();q.ellipse(rnd(0,w),rnd(0,h),rnd(20,90),rnd(10,40),rnd(0,3),0,7);q.fill();}});
  for(let i=0;i<70;i++){g.fillStyle='#ece6da';g.fillRect(rnd(0,w),rnd(0,h),4,3);}K.noise(g,w,h,8);});
/* a riverside town: rows of six to nine storey blocks with dark windows and tiled roofs */
P.townBank=(o)=>K.canvas(4096,512,(g,w,h)=>{g.clearRect(0,0,w,h);const pm=w/(o.span||600);let x=0;const cols=['#e6dccb','#d9cdb8','#efe8dc','#cdb9a0','#e2d2c0','#b9a58c','#d6c7a8','#c9c3b6'];
  while(x<w){const bw=rnd(14,32)*pm,fl=Math.round(rnd(5,9)),fh=3.1*pm,bh=fl*fh+1.2*pm;g.fillStyle=cols[Math.floor(rnd(0,cols.length))];g.fillRect(x,h-bh,bw,bh);
    g.fillStyle='rgba(48,46,44,.6)';for(let f=0;f<fl;f++)for(let k=1.2*pm;k<bw-1.4*pm;k+=2.4*pm)g.fillRect(x+k,h-bh+1.2*pm+f*fh+fh*.3,1.1*pm,1.6*pm);
    if(Math.random()<.5){g.fillStyle='rgba(235,235,235,.5)';for(let f=1;f<fl;f+=2)g.fillRect(x,h-bh+1.2*pm+f*fh+fh*.92,bw,.25*pm);}
    g.fillStyle=Math.random()<.6?'#8c4f3a':'#5b5650';g.fillRect(x-2,h-bh-.6*pm,bw+4,1.2*pm);x+=bw+rnd(0,1)*pm;}
  K.noise(g,w,h,8);haze(g,w,h,o.haze||.2,o.hazeCol);});
P.parisFacades=()=>K.canvas(4096,1280,(g,w,h)=>{const pm=w/80;g.clearRect(0,0,w,h);let x=0;const base=h; // 80 m x 25 m
  while(x<w){const bw=rnd(14,20)*pm,stone=`hsl(${rnd(36,42)},${rnd(22,32)}%,${rnd(76,82)}%)`;const gf=4.6*pm,fh=3.1*pm,nf=5,top=base-gf-nf*fh;
    g.fillStyle=stone;g.fillRect(x,top,bw,base-top);
    g.globalAlpha=.18;g.fillStyle='#7d725f';for(let y=top;y<base;y+=0.45*pm)g.fillRect(x,y,bw,1);for(let y=top,r=0;y<base;y+=0.45*pm,r++)for(let k=(r%2)*0.6*pm;k<bw;k+=1.2*pm)g.fillRect(x+k,y,1,0.45*pm);g.globalAlpha=1;
    // ground floor: rusticated with tall arched shopfronts and a carriage door
    const nb=Math.max(3,Math.round(bw/(3.2*pm)));for(let k=0;k<nb;k++){const ox=x+(k+.5)*bw/nb,ow=(k===Math.floor(nb/2)?2.6:2.2)*pm;g.fillStyle=k===Math.floor(nb/2)?'#2d3a33':'#30302f';
      g.beginPath();g.moveTo(ox-ow/2,base);g.lineTo(ox-ow/2,base-gf*.78);g.quadraticCurveTo(ox,base-gf*.98,ox+ow/2,base-gf*.78);g.lineTo(ox+ow/2,base);g.fill();g.fillStyle='rgba(180,190,195,.25)';g.fillRect(ox-ow/2+6,base-gf*.7,ow-12,gf*.4);}
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,base-gf-6,bw,6);
    // five floors of tall French windows; continuous iron balconies on the 2nd and 5th
    const nw=Math.max(3,Math.round(bw/(2.6*pm)));for(let f=0;f<nf;f++){const fy=base-gf-(f+1)*fh;
      for(let k=0;k<nw;k++){const wx=x+(k+.5)*bw/nw,ww=1.15*pm,wh=2.25*pm,wy=fy+fh-wh-0.25*pm;
        g.fillStyle='rgba(120,110,95,.35)';g.fillRect(wx-ww/2-6,wy-10,ww+12,10);
        g.fillStyle=Math.random()<.25?'#9aa5ab':'#2b2d2f';g.fillRect(wx-ww/2,wy,ww,wh);g.fillStyle='rgba(240,238,232,.9)';g.fillRect(wx-2,wy,4,wh);for(let r=1;r<4;r++)g.fillRect(wx-ww/2,wy+r*wh/4,ww,3);
        if(f!==0&&f!==3){g.strokeStyle='#1d1d1d';g.lineWidth=2;g.strokeRect(wx-ww/2,wy+wh*.62,ww,wh*.38);for(let b=wx-ww/2;b<wx+ww/2;b+=7){g.beginPath();g.moveTo(b,wy+wh*.62);g.lineTo(b,wy+wh);g.stroke();}}}
      if(f===0||f===3){const by=fy+fh-0.25*pm;g.fillStyle='rgba(120,110,95,.5)';g.fillRect(x,by,bw,8);g.strokeStyle='#1b1b1b';g.lineWidth=2;g.beginPath();g.moveTo(x,by-1.0*pm);g.lineTo(x+bw,by-1.0*pm);g.stroke();
        for(let b=x;b<x+bw;b+=8){g.beginPath();g.moveTo(b,by-1.0*pm);g.lineTo(b,by);g.stroke();}for(let b=x;b<x+bw;b+=24){g.beginPath();g.arc(b+12,by-0.5*pm,7,0,7);g.stroke();}}}
    // cornice and zinc mansard with dormers and chimney pots
    g.fillStyle='#c9bda6';g.fillRect(x-4,top-14,bw+8,16);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-4,top+2,bw+8,5);
    const mh=3.8*pm;g.fillStyle='#7f878d';g.beginPath();g.moveTo(x,top-14);g.lineTo(x+0.9*pm,top-14-mh);g.lineTo(x+bw-0.9*pm,top-14-mh);g.lineTo(x+bw,top-14);g.fill();
    g.globalAlpha=.25;g.fillStyle='#454b50';for(let k=x+6;k<x+bw;k+=14)g.fillRect(k,top-14-mh+4,2,mh-4);g.globalAlpha=1;
    for(let k=0;k<nw;k++){const dx=x+(k+.5)*bw/nw;g.fillStyle='#e4dccb';g.fillRect(dx-0.55*pm,top-14-mh*.75,1.1*pm,mh*.65);g.fillStyle='#2c2f31';g.fillRect(dx-0.4*pm,top-14-mh*.68,0.8*pm,mh*.5);g.fillStyle='#6e767c';g.beginPath();g.moveTo(dx-0.7*pm,top-14-mh*.75);g.lineTo(dx,top-14-mh*.98);g.lineTo(dx+0.7*pm,top-14-mh*.75);g.fill();}
    for(let c=0;c<2;c++){const cx=x+(c?bw-2.2*pm:1.2*pm);g.fillStyle='#b8a48a';g.fillRect(cx,top-14-mh-1.6*pm,1.0*pm,1.6*pm);g.fillStyle='#a1694f';for(let p=0;p<4;p++)g.fillRect(cx+4+p*9,top-14-mh-1.6*pm-14,6,14);}
    x+=bw+2;}
  K.noise(g,w,h,8);haze(g,w,h,.12);});

P.londonWarehouses=()=>K.canvas(4096,1280,(g,w,h)=>{const pm=w/90;g.clearRect(0,0,w,h);let x=0;
  while(x<w){const bw=rnd(16,26)*pm,nf=Math.round(rnd(5,7)),fh=3.4*pm,top=h-nf*fh-0.6*pm;const hue=rnd(10,22),lit=rnd(24,34);
    g.fillStyle=`hsl(${hue},${rnd(22,34)}%,${lit}%)`;g.fillRect(x,top,bw,h-top);
    g.globalAlpha=.16;for(let y=top;y<h;y+=3){g.fillStyle=Math.random()<.5?'#000':'#d8c8b8';g.fillRect(x,y,bw,1);}g.globalAlpha=1;
    // soot streaks
    g.globalAlpha=.12;g.fillStyle='#111';for(let i=0;i<10;i++){const sx=x+rnd(0,bw);g.fillRect(sx,top,rnd(4,18),rnd(.2,.9)*(h-top));}g.globalAlpha=1;
    // stone bands
    g.fillStyle='#b3a796';for(let f=1;f<nf;f++)g.fillRect(x,top+f*fh,bw,5);g.fillRect(x-4,top-10,bw+8,12);
    // segmental arched windows with small panes
    const nw=Math.max(4,Math.round(bw/(2.4*pm)));const mid=Math.floor(nw/2);
    for(let f=0;f<nf;f++)for(let k=0;k<nw;k++){const wx=x+(k+.5)*bw/nw,ww=1.3*pm,wh=2.1*pm,wy=top+f*fh+fh*.25;
      if(k===mid){g.fillStyle='#1e2a26';g.fillRect(wx-ww*.6,wy-4,ww*1.2,wh+fh*.35);g.strokeStyle='#3d4a44';g.lineWidth=2;g.strokeRect(wx-ww*.6,wy-4,ww*1.2,wh+fh*.35);continue;}
      g.fillStyle='#2a2b2c';g.beginPath();g.moveTo(wx-ww/2,wy+wh);g.lineTo(wx-ww/2,wy+6);g.quadraticCurveTo(wx,wy-8,wx+ww/2,wy+6);g.lineTo(wx+ww/2,wy+wh);g.fill();
      g.fillStyle='rgba(150,160,165,.35)';g.fillRect(wx-ww/2+3,wy+8,ww-6,wh*.4);
      g.strokeStyle='rgba(225,222,214,.85)';g.lineWidth=2;for(let c=1;c<3;c++){g.beginPath();g.moveTo(wx-ww/2+c*ww/3,wy+2);g.lineTo(wx-ww/2+c*ww/3,wy+wh);g.stroke();}for(let r=1;r<4;r++){g.beginPath();g.moveTo(wx-ww/2,wy+r*wh/4);g.lineTo(wx+ww/2,wy+r*wh/4);g.stroke();}
      g.fillStyle='#8a7a68';g.fillRect(wx-ww/2-4,wy+wh,ww+8,6);}
    // hoist beam over the loading bay
    const hx=x+(mid+.5)*bw/nw;g.fillStyle='#1b1b1b';g.fillRect(hx-4,top-0.3*pm,8,1.4*pm);g.fillRect(hx-4,top+0.2*pm,1.4*pm,8);g.fillRect(hx+1.2*pm,top+0.2*pm,2,0.9*pm);
    x+=bw+rnd(0,4);}
  K.noise(g,w,h,10);haze(g,w,h,.2,'rgba(214,218,222,.2)');});

P.skyline=(o)=>K.canvas(4096,512,(g,w,h)=>{g.clearRect(0,0,w,h);let x=rnd(0,200);while(x<w){if(Math.random()<.35){x+=rnd(60,260);continue;}const bw=rnd(14,46),bh=rnd(.15,1)*h*(o.tall||1);g.fillStyle=o.col||'rgba(228,232,236,1)';g.fillRect(x,h-bh,bw,bh);
  g.globalAlpha=.2;g.fillStyle=o.line||'#9fb0bc';for(let y=h-bh+4;y<h;y+=5)g.fillRect(x+2,y,bw-4,1);g.globalAlpha=1;x+=bw+rnd(0,6);}});

/* ---------- materials ---------- */
const Mx={
  oakBoards:(lit)=>K.mat({tile:2.6,rough:.5,bump:.001,draw:(g,w,h)=>{const bw=w/12;for(let c=0;c<12;c++){const off=rnd(0,h);for(let y=-h;y<h*2;y+=h*.7){g.fillStyle=`hsl(${rnd(29,32)},${rnd(24,28)}%,${(lit||44)+rnd(-1.6,1.6)}%)`;g.fillRect(c*bw,y+off,bw,h*.7);
      g.globalAlpha=.1;g.strokeStyle='#5a4128';for(let k=0;k<8;k++){g.lineWidth=rnd(.6,1.6);const x=c*bw+rnd(3,bw-3);g.beginPath();g.moveTo(x,y+off);g.bezierCurveTo(x+rnd(-4,4),y+off+h*.2,x+rnd(-4,4),y+off+h*.45,x,y+off+h*.7);g.stroke();}
      g.globalAlpha=.4;g.fillStyle='#4a3522';g.fillRect(c*bw,y+off,bw,2);g.fillRect(c*bw,y+off,1.5,h*.7);g.globalAlpha=1;}}K.noise(g,w,h,7);}}),
  plaster:(col)=>K.mat({tile:3,rough:.95,bump:.002,draw:(g,w,h)=>{g.fillStyle=col||'#ebe6dd';g.fillRect(0,0,w,h);K.blots(g,w,h,60,['rgba(255,255,255,.5)','rgba(200,190,175,.4)'],60,260,.2);K.noise(g,w,h,6);}}),
  archConcrete:()=>K.mat({tile:3.6,tileY:1.8,rough:.82,bump:.0025,px:1024,py:512,draw:(g,w,h)=>{g.fillStyle='#b4b0a9';g.fillRect(0,0,w,h);
      K.blots(g,w,h,90,['rgba(150,145,138,.22)','rgba(205,201,194,.25)','rgba(170,164,156,.18)'],30,200,.35);
      for(let i=0;i<1800;i++){g.globalAlpha=rnd(.05,.18);g.fillStyle=Math.random()<.5?'#77726b':'#d8d4cd';g.beginPath();g.arc(rnd(0,w),rnd(0,h),rnd(.6,2.2),0,7);g.fill();}g.globalAlpha=1;
      const pw=w/2,ph=h/2;g.strokeStyle='rgba(90,86,80,.45)';g.lineWidth=1.6;for(let x=0;x<=w;x+=pw){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<=h;y+=ph){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
      for(let px=0;px<w;px+=pw)for(let py=0;py<h;py+=ph)for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=px+pw*(i+.5)/3,y=py+ph*(j+.5)/2;
        g.fillStyle='rgba(120,116,110,.35)';g.beginPath();g.arc(x,y,5.5,0,7);g.fill();g.fillStyle='rgba(55,52,48,.8)';g.beginPath();g.arc(x,y,3,0,7);g.fill();}
      K.noise(g,w,h,8);}}),
  boardConcrete:()=>K.mat({tile:3,tileY:2.4,rough:.9,bump:.004,draw:(g,w,h)=>{g.fillStyle='#a9a49c';g.fillRect(0,0,w,h);const bh=h/16;
      for(let r=0;r<16;r++){g.fillStyle=`hsl(35,${rnd(4,8)}%,${rnd(60,68)}%)`;g.fillRect(0,r*bh,w,bh);for(let i=0;i<140;i++){g.globalAlpha=.12;g.fillStyle=Math.random()<.5?'#6f6a63':'#cfcac2';g.fillRect(rnd(0,w),r*bh+rnd(0,bh),rnd(10,120),rnd(1,2));}g.globalAlpha=.35;g.fillStyle='#5f5a53';g.fillRect(0,r*bh,w,1.5);g.globalAlpha=1;}
      g.fillStyle='rgba(60,56,52,.5)';for(let x=w/6;x<w;x+=w/3)for(let y=h/8;y<h;y+=h/4){g.beginPath();g.arc(x,y,4,0,7);g.fill();}K.noise(g,w,h,10);}}),
  terrazzo:()=>K.mat({tile:2,rough:.25,bump:.0008,draw:(g,w,h)=>{g.fillStyle='#e8e4dc';g.fillRect(0,0,w,h);const cols=['#b9b2a6','#8c867d','#d6cfc3','#f6f3ee','#a69f92','#6f6a62'];for(let i=0;i<9000;i++){g.fillStyle=cols[i%cols.length];g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(1,6),rnd(1,4),rnd(0,3),0,7);g.fill();}K.noise(g,w,h,6);}}),
  brickHall:()=>K.mat({tile:3.6,tileY:3.0,rough:.95,bump:.006,draw:(g,w,h)=>{g.fillStyle='#a69685';g.fillRect(0,0,w,h);const bw=64,bh=25.6;
      for(let r=0;r<40;r++){const off=r%2?bw/2:0;for(let c=-1;c<17;c++){g.fillStyle=`hsl(${rnd(10,24)},${rnd(22,36)}%,${rnd(26,40)}%)`;g.fillRect(c*bw+off+2,r*bh+2,bw-4,bh-4);g.globalAlpha=.2;g.fillStyle='#000';g.fillRect(c*bw+off+2,r*bh+bh-5,bw-4,3);g.globalAlpha=1;}}
      K.blots(g,w,h,20,['#d9d1c4','#2a211b'],150,380,.12);K.noise(g,w,h,12);}}),
  sandstone:()=>K.mat({tile:3.2,tileY:2.4,rough:.9,bump:.006,draw:(g,w,h)=>{g.fillStyle='#b8a586';g.fillRect(0,0,w,h);const rows=6,bh=h/rows;
      for(let r=0;r<rows;r++){let x=-rnd(0,150);while(x<w){const bw=rnd(200,340);g.fillStyle=`hsl(${rnd(35,39)},${rnd(18,24)}%,${rnd(62,66)}%)`;g.fillRect(x+2,r*bh+2,bw-4,bh-4);
        for(let i=0;i<60;i++){g.globalAlpha=.1;g.fillStyle=Math.random()<.5?'#6e5f48':'#efe6d4';g.fillRect(x+rnd(0,bw),r*bh+rnd(0,bh),rnd(4,30),rnd(1,3));}g.globalAlpha=1;x+=bw;}}K.noise(g,w,h,12);}}),
  larch:()=>K.mat({tile:3,rough:.7,bump:.002,draw:(g,w,h)=>{const n=20,bw=w/n;for(let c=0;c<n;c++){g.fillStyle=`hsl(${rnd(28,34)},${rnd(34,44)}%,${rnd(52,60)}%)`;g.fillRect(c*bw,0,bw,h);
      g.globalAlpha=.15;g.strokeStyle='#6d4e2e';for(let k=0;k<6;k++){g.lineWidth=rnd(.5,1.5);const x=c*bw+rnd(2,bw-2);g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rnd(-3,3),h*.3,x+rnd(-3,3),h*.7,x,h);g.stroke();}g.globalAlpha=.45;g.fillStyle='#4a3522';g.fillRect(c*bw,0,2,h);g.globalAlpha=1;}K.noise(g,w,h,8);}}),
};

['brickHall','sandstone','archConcrete','boardConcrete','larch'].forEach(k=>{const f=Mx[k];Mx[k]=(...a)=>{const m=f(...a);m.userData.keep=true;return m;};});
function lights(ctx,pts,col,int,dist){pts.forEach(p=>{const l=new ctx.THREE.PointLight(col||0xfff2e4,int||.25,dist||10,2);l.position.set(...p);ctx.scene.add(l);});}
/* Hang a whole series on the walls named in plan (then on any other free wall if needed), as large as fits:
   60 in on the long side when there is room, stepping down to 40 in, then two rows. Doors, windows and corners stay clear. */
R.hangAll=hangAll;function hangAll(S,plan,works,Y){Y=Y||1.72;const raw=works.map(w=>w.asIs?w:Object.assign({},w,{size:null}));
  const segsOf=(cell,side)=>{const c=S.cells[cell];if(!c)return [];const wl=(c.walls||{})[side]||{};if(wl.none)return [];
    const a0=(side==='N'||side==='S')?c.x0:c.z0,a1=(side==='N'||side==='S')?c.x1:c.z1;let free=[[a0+.9,a1-.9]];
    (wl.open||[]).forEach(o=>{const l=o.at-o.w/2-.45,r=o.at+o.w/2+.45;free=free.flatMap(([x,y])=>{const out=[];if(l>x)out.push([x,Math.min(y,l)]);if(r<y)out.push([Math.max(x,r),y]);return out;});});
    return free.filter(([x,y])=>y-x>1.2).map(([x,y])=>({cell,side,x,y,len:y-x,items:[]}));};
  const seen=new Set();const order=[];plan.forEach(([c,sd])=>{seen.add(c+sd);order.push([c,sd]);});
  const extra=[];Object.keys(S.cells).forEach(c=>['N','E','S','W'].forEach(sd=>{if(!seen.has(c+sd))extra.push([c,sd]);}));
  const fw=(w,L)=>w.asIs?w.size.w*.0254+.1:((w.a>=1?L:L*w.a)+12.5)*.0254, GAP=1.2;
  // one row only, always large (60 in long side). If the whole series does not fit, hang the first ones in site order that do.
  let placed=0;function pack(segs,L,partial){placed=0;segs.forEach(g=>{g.items=[];g.used=0;});
    for(const w of raw){const need=fw(w,L);let best=null;for(const g of segs){const add=need+(g.items.length?GAP:0);if(g.used+add<=g.len&&(!best||g.used/g.len<best.used/best.len))best=g;}
      if(!best){if(partial)return true;return false;}best.used+=need+(best.items.length?GAP:0);best.items.push(w);placed++;}return true;}
  let segs=order.flatMap(([c,sd])=>segsOf(c,sd)),L=60,rows=1;
  if(!pack(segs,L,false)){segs=segs.concat(extra.flatMap(([c,sd])=>segsOf(c,sd)));pack(segs,L,true);}
  segs.forEach(g=>{if(!g.items.length)return;const ws=g.items.map(w=>fw(w,L));const tot=ws.reduce((a,b)=>a+b,0)+GAP*(ws.length-1);
    const room=g.len-tot, gap=GAP+(g.items.length>1?Math.min(room/(g.items.length-1),1.0):0);const tot2=ws.reduce((a,b)=>a+b,0)+gap*(ws.length-1);
    let x=(g.x+g.y)/2-tot2/2;g.items.forEach((w,k)=>{const at=x+ws[k]/2;x+=ws[k]+gap;
      if(w.pair){const dy=(L*.0254+.32)/2+.06;w.pair.forEach((pw,j)=>S.hang(g.cell,g.side,at,Y+(w.pair.length>1?(j?-dy:dy):0),R.sized(pw,L)));}
      else S.hang(g.cell,g.side,at,Y,w.asIs?w:R.sized(w,L));});});
  (window.__hang=window.__hang||[]).push({L,rows,placed,n:works.length,segs:segs.filter(g=>g.items.length).length});return {L,rows};}
function benchAt(ctx,list,col){const m=new ctx.THREE.MeshStandardMaterial({color:col||0x5a4634,roughness:.55});list.forEach(([x,z,r,l])=>ctx.bench(x,z,r||0,m,l||2.2));}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

/* ---------- Paris: an enfilade of three salons on the first floor, Haussmann façades across the street ---------- */
C.paris=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const wall=Mx.plaster('#ece7de'),floor=Mx.oakBoards(42),trim=new THREE.MeshStandardMaterial({color:0xf1ece3,roughness:.7});
  const winFrame=new THREE.MeshStandardMaterial({color:0xefebe4,roughness:.6});const h=4.4,z0=-4.2,z1=4.2;
  const door=(at)=>({at,w:1.9,y0:0,y1:3.2,kind:'door'});const win=(at)=>({at,w:1.45,y0:.25,y1:3.55,kind:'window',cols:2,rows:4,fw:.08,bw:.035,frameMat:winFrame,sill:trim});
  const rooms=[['A',-15,-5.15],['B',-4.85,4.85],['C',5.15,15]];
  const S=K.space(ctx,{frameMat:winFrame,cells:rooms.map(([id,x0,x1])=>({id,x0,x1,z0,z1,h,wall,floor,ceil:K.mat({color:0xf2eee8,rough:1}),
    walls:{S:{open:[win((x0+x1)/2-2.3),win((x0+x1)/2+2.3)],revealMat:wall},W:{open:id==='A'?[]:[door(0)]},E:{open:id==='C'?[]:[door(0)]}},
    dress:(ctx,c)=>{ // boiserie: skirting, dado rail, cornice, door surrounds
      const box=(w,hh,d,x,y,z,ry)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),trim);b.position.set(x,y,z);b.rotation.y=ry||0;b.castShadow=true;b.receiveShadow=true;scene.add(b);};
      const W=c.x1-c.x0,cx=(c.x0+c.x1)/2;
      [[W,cx,c.z0+.02,0,null],[c.z1-c.z0,c.x0+.02,0,Math.PI/2,'W'],[c.z1-c.z0,c.x1-.02,0,Math.PI/2,'E']].forEach(([L,x,z,r,sd])=>{
        box(L,.2,.1,x,h-.1,z,r);box(L,.06,.05,x,h-.32,z,r);
        // skirting and dado stop at the door frames instead of running across the opening
        const op=sd?((c.walls[sd]||{}).open||[]):[];let runs=[[-L/2,L/2]];op.forEach(o=>{const a=o.at-o.w/2-.12,b=o.at+o.w/2+.12;runs=runs.flatMap(([u,v])=>{const out=[];if(a>u)out.push([u,Math.min(v,a)]);if(b<v)out.push([Math.max(u,b),v]);return out;});});
        runs.forEach(([u,v])=>{const m=(u+v)/2,l=v-u;const px=sd?x:x+m,pz=sd?m:z;box(l,.2,.03,px,.1,pz,r);box(l,.05,.03,px,.92,pz,r);});
        // door surround
        op.forEach(o=>{const t=.1;[[-1],[1]].forEach(([k])=>box(t,o.y1,.05,x,o.y1/2,o.at+k*(o.w/2+t/2),r));box(o.w+2*t,t,.05,x,o.y1+t/2,o.at,r);});});
      box(W,.2,.1,cx,h-.1,c.z1-.04);
      // ceiling rose and medallion moulding
      const rose=new THREE.Mesh(new THREE.TorusGeometry(.6,.04,8,40),trim);rose.rotation.x=Math.PI/2;rose.position.set(cx,h-.03,0);scene.add(rose);
      const rect=(w,d)=>{[[w,0,-d/2],[w,0,d/2]].forEach(([L,x,z])=>box(L,.04,.06,cx+x,h-.03,z));[[d,-w/2],[d,w/2]].forEach(([L,x])=>box(L,.04,.06,cx+x,h-.03,0,Math.PI/2));};rect(W-1.4,c.z1-c.z0-1.4);
      // tall panels on the north wall around the works
      [-3.2,0,3.2].forEach(dx=>{const pw=2.4,ph=2.6,py=2.35,px=cx+dx;[[pw,px,py+ph/2],[pw,px,py-ph/2]].forEach(([L,x,y])=>box(L,.025,.02,x,y,c.z0+.015));[[ph,px-pw/2],[ph,px+pw/2]].forEach(([L,x])=>box(.025,L,.02,x,py,c.z0+.015));});
    }}))});
  scene.add(new THREE.HemisphereLight(0xfbf7f0,0x8e7a62,.55));
  lights(ctx,[[-10,3.6,0],[0,3.6,0],[10,3.6,0],[-10,3.6,-2.5],[0,3.6,-2.5],[10,3.6,-2.5]],0xffefd9,.22,9);
  K.sun(ctx,{from:[-12,16,40],to:[0,0,0],intensity:.8,size:18,radius:8,color:0xf6f2ec});
  const out=K.outside(ctx,{dir:'S',at:[0,0,z1]});const gy=-6.5;
  out.ground(K.canvas(512,512,(g,w,h)=>{g.fillStyle='#6a6863';g.fillRect(0,0,w,h);K.noise(g,w,h,10);}),0,16.5,300,gy,1.0,0);
  // across the avenue: Haussmann apartment houses on Avenue de Wagram (photo: Thomon, CC BY-SA 4.0)
  out.photo('img/pano/paris-wagram.jpg',16,34,25.5,gy-.6,{copies:3,bright:1.0});
  out.wall(P.sky(2048,1024,{stops:[[0,'#dfe2e4'],[.75,'#eeeeec'],[1,'#f2f1ee']],clouds:'overcast'}),500,1600,600,-60,0,1.1,false);
  const ws=cfg.works.map(w=>w.asIs?w:sized(w,60));
  hangAll(S,[['A','N',[-13.3,-10.1,-6.9]],['B','N',[-3.2,0,3.2]],['C','N',[6.9,10.1,13.3]],['A','W',[-2.2,2.2]],['C','E',[2.2,-2.2]]],ws,1.95);
  benchAt(ctx,[[-10.1,-.6],[0,-.6],[10.1,-.6]],0x3f2e20);
  return {areas:S.areas(.6).concat([{x0:-5.6,x1:-4.4,z0:-.6,z1:.6},{x0:4.4,x1:5.6,z0:-.6,z1:.6}]),eye:1.6,
    start:{pos:V(-13.6,1.6,2.6),look:V(10,1.7,-1.5)},
    views:[{label:'Enfilade',pos:V(-13.6,1.6,0),look:V(15,1.7,0)},{label:'Middle salon',pos:V(0,1.6,3.2),look:V(0,1.85,-4.2)},{label:'Windows',pos:V(1,1.6,-2.6),look:V(-1,2.2,12)}]};
};

/* ---------- London: a large warehouse hall with timber trusses and steel windows, plus a smaller side room ---------- */
C.london=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const brick=Mx.brickHall(),floor=Mx.oakBoards(30),steel=new THREE.MeshStandardMaterial({color:0x1d1e1e,roughness:.55,metalness:.3});
  const timber=new THREE.MeshStandardMaterial({color:0x4b3726,roughness:.85});const plaster=Mx.plaster('#e9e5de');
  const win=(at)=>({at,w:2.3,y0:.95,y1:4.6,kind:'window',cols:3,rows:6,fw:.07,bw:.03,frameMat:steel,sill:new THREE.MeshStandardMaterial({color:0x8d877f,roughness:.9})});
  const S=K.space(ctx,{frameMat:steel,cells:[
    {id:'A',x0:-11,x1:11,z0:-6.5,z1:6.5,h:5.6,wall:brick,floor,ceil:K.mat({color:0x3a2e25,rough:1}),walls:{W:{open:[win(-4),win(0),win(4)],t:.5},S:{open:[{at:-7,w:3.6,y0:0,y1:3.8,kind:'door'}],t:.5}},
      dress:(ctx,c)=>{for(let x=c.x0+2.6;x<c.x1;x+=5.2){const tie=new THREE.Mesh(new THREE.BoxGeometry(.3,.35,c.z1-c.z0),timber);tie.position.set(x,c.h-.45,0);tie.castShadow=true;scene.add(tie);
}
        for(let z=c.z0+1.2;z<c.z1;z+=2.4){const pur=new THREE.Mesh(new THREE.BoxGeometry(c.x1-c.x0,.2,.18),timber);pur.position.set(0,c.h-.12,z);scene.add(pur);}
        // pendant lamps
        for(const x of [-5,0,5])for(const z of [-3.2,3.2]){const cord=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,2.2),steel);cord.position.set(x,c.h-2.3,z);scene.add(cord);
          const sh=new THREE.Mesh(new THREE.ConeGeometry(.28,.26,24,1,true),new THREE.MeshStandardMaterial({color:0x222222,roughness:.5,side:THREE.DoubleSide}));sh.position.set(x,c.h-3.45,z);scene.add(sh);
          const bulb=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),new THREE.MeshBasicMaterial({color:0xfff1d6}));bulb.position.set(x,c.h-3.55,z);scene.add(bulb);}}},
    {id:'B',x0:-11,x1:-1,z0:6.8,z1:14,h:4.6,wall:plaster,floor,ceil:K.mat({color:0xefece6,rough:1}),walls:{N:{open:[{at:-7,w:3.6,y0:0,y1:3.8,kind:'door'}]}}}]});
  scene.add(new THREE.HemisphereLight(0xf3f0ea,0x5a4a3c,.62));
  lights(ctx,[[-7,4.2,-3],[0,4.2,-3],[7,4.2,-3],[-7,4.2,3],[0,4.2,3],[7,4.2,3],[-6,4,10.5]],0xffe8cc,.26,11);
  K.sun(ctx,{from:[-40,22,-6],to:[0,0,0],intensity:.55,size:20,color:0xe9eef3,radius:10});
  // out of the windows: Limehouse Basin, East London (photo: Poly Haven, CC0)
  K.pano(ctx,{src:'img/pano/london-limehouse.jpg',face:'W',arc:215,a0:-25,a1:35,y:1.6,center:[-11,0],sky:'#c4c9cd',ground:'#4e4b47'});
  const ws=cfg.works.map(w=>sized(w,60));
  hangAll(S,[['A','N',[-7.5,-2.5,2.5,7.5]],['A','E',[-3.6,0,3.6]],['A','S',[1.5,7]],['B','S',[-8.4,-3.6]],['B','E',[10.4]],['B','W',[10.4]]],ws,1.85);
  benchAt(ctx,[[-2.5,-1.2,0,2.6],[4.5,-1.2,0,2.6],[-6,11]],0x3a2a1e);
  return {areas:S.areas(.8).concat([{x0:-8.4,x1:-5.6,z0:5,z1:8}]),eye:1.6,
    start:{pos:V(-8,1.6,5),look:V(4,2,-6.5)},
    views:[{label:'Main hall',pos:V(0,1.6,5),look:V(0,2.1,-6.5)},{label:'Windows',pos:V(3,1.6,0),look:V(-11,2.5,0)},{label:'Side room',pos:V(-7,1.6,8),look:V(-6,1.9,14)}]};
};

/* ---------- Miami: a glass gallery on the bay with palms, and a closed skylit room ---------- */
C.miami=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const wall=M.whitePaint(),floor=Mx.terrazzo(),alu=new THREE.MeshStandardMaterial({color:0xd8d8d6,roughness:.4,metalness:.5});
  const S=K.space(ctx,{frameMat:alu,cells:[
    {id:'A',x0:-8,x1:8,z0:-5.5,z1:5.5,h:5,wall,floor,ceil:K.mat({color:0xf4f3f0,rough:1}),walls:{W:{open:[{at:0,w:10.4,y0:0,y1:4.6,kind:'glass',cols:4,rows:1,fw:.09,frameMat:alu}],revealMat:wall},E:{open:[{at:0,w:3,y0:0,y1:3.6,kind:'door'}]}}},
    {id:'B',x0:8.3,x1:20.3,z0:-6.5,z1:6.5,h:5.6,wall,floor,ceil:K.mat({color:0xf4f3f0,rough:1}),walls:{W:{open:[{at:0,w:3,y0:0,y1:3.6,kind:'door'}]}},
      dress:(ctx,c)=>{const glow=new THREE.Mesh(new THREE.PlaneGeometry(8,9),new THREE.MeshBasicMaterial({color:0xfbfbfa}));glow.rotation.x=Math.PI/2;glow.position.set((c.x0+c.x1)/2,c.h-.01,0);scene.add(glow);
        const grid=new THREE.MeshStandardMaterial({color:0xe9e8e4,roughness:1});const add=(m,x,y,z)=>{m.position.set(x,y,z);scene.add(m);};
        for(let x=-4;x<=4;x+=1)add(new THREE.Mesh(new THREE.BoxGeometry(.05,.25,9),grid),(c.x0+c.x1)/2+x,c.h-.13,0);
        for(let z=-4.5;z<=4.5;z+=1)add(new THREE.Mesh(new THREE.BoxGeometry(8,.25,.05),grid),(c.x0+c.x1)/2,c.h-.13,z);}}]});
  scene.add(new THREE.HemisphereLight(0xffffff,0xc9c2b5,.7));
  lights(ctx,[[0,4.4,-3],[0,4.4,3],[14.3,5,-3],[14.3,5,3],[11,5,0],[17.6,5,0]],0xfff7ee,.25,10);
  K.sun(ctx,{from:[-34,14,-10],to:[0,0,0],intensity:1.5,size:16,color:0xfff3e2});
  K.pano(ctx,{src:'img/pano/miami.jpg',face:'W',u:.25,sky:'#32609c',ground:'#b6a697',y:-.4});
  const out=K.outside(ctx,{dir:'W',at:[-8,0,0]});
  out.ground(K.canvas(512,512,(g,w,h)=>{g.fillStyle='#d8d1c3';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,110,95,.35)';for(let x=0;x<w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<h;y+=128){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}K.noise(g,w,h,10);}),.3,7,80,-.02,1.1);
  const glassRail=new THREE.Mesh(new THREE.PlaneGeometry(80,1.05),new THREE.MeshBasicMaterial({color:0xdfeef0,transparent:true,opacity:.12,depthWrite:false}));glassRail.rotation.y=Math.PI;glassRail.position.set(0,.52,7);out.g.add(glassRail);
  const ws=cfg.works.map(w=>sized(w,60));
  hangAll(S,[['A','N',[-4.4,0,4.4]],['A','S',[4.4,0,-4.4]],['A','E',[-3.6,3.6]],['B','N',[11.2,14.3,17.4]],['B','E',[-3.2,3.2]],['B','S',[17.4,14.3,11.2]]],ws,1.75);
  benchAt(ctx,[[1,0,Math.PI/2,2.4],[14.3,0,0,2.4]],0x8f8a82);
  return {areas:S.areas(.7).concat([{x0:7.4,x1:9.2,z0:-1,z1:1}]),eye:1.6,
    start:{pos:V(6.6,1.6,4.2),look:V(-8,1.6,-2.5)},
    views:[{label:'Bay',pos:V(6.4,1.6,0),look:V(-8,1.5,0)},{label:'Gallery',pos:V(-6.2,1.6,3.6),look:V(6,1.75,-5.5)},{label:'Skylight room',pos:V(9.6,1.6,4.6),look:V(20.3,1.8,-4)}]};
};

/* ---------- Los Angeles: two concrete pavilions joined by a glass corridor in a canyon ---------- */
C.losAngeles=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const conc=Mx.archConcrete(),floor=M.greyConcreteFloor('#8f8a81'),steel=new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:.35,metalness:.6});
  const ceil=K.mat({tile:3,color:0xc9c5bd,rough:1});const H=4.2;
  const S=K.space(ctx,{frameMat:steel,cells:[
    {id:'A',x0:-5.2,x1:5.2,z0:-15,z1:-6,h:H,wall:conc,floor,ceil,walls:{S:{open:[{at:0,w:3.0,y0:0,y1:3.2,kind:'door'}]}},dress:clere},
    {id:'K',x0:-1.6,x1:1.6,z0:-5.7,z1:5.7,h:3.4,wall:conc,floor,ceil,ao:false,
      walls:{W:{open:[{at:0,w:11.0,y0:0,y1:3.2,kind:'glass',cols:4,fw:.05,bw:.04}]},E:{open:[{at:0,w:11.0,y0:0,y1:3.2,kind:'glass',cols:4,fw:.05,bw:.04}]},N:{open:[{at:0,w:3.0,y0:0,y1:3.2,kind:'door'}]},S:{open:[{at:0,w:3.0,y0:0,y1:3.2,kind:'door'}]}}},
    {id:'B',x0:-5.2,x1:5.2,z0:6,z1:15,h:H,wall:conc,floor,ceil,walls:{N:{open:[{at:0,w:3.0,y0:0,y1:3.2,kind:'door'}]}},dress:clere}]});
  function clere(ctx,c){const sl=new THREE.Mesh(new THREE.PlaneGeometry(c.x1-c.x0-1.6,.9),new THREE.MeshBasicMaterial({color:0xfbf6ee}));sl.rotation.x=Math.PI/2;sl.position.set(0,c.h-.01,(c.z0+c.z1)/2);scene.add(sl);
    lights(ctx,[[-2.6,c.h-.5,(c.z0+c.z1)/2],[2.6,c.h-.5,(c.z0+c.z1)/2],[0,c.h-.5,c.z0+2],[0,c.h-.5,c.z1-2]],0xfff2e2,.26,8);}
  // a poured concrete terrace the whole complex sits on; beyond its edge the hillside photograph drops away
  const tm=M.greyConcreteFloor('#a29c92');tm.roughness=.85;const terr=new THREE.Mesh(new THREE.BoxGeometry(16,.6,36),[conc,conc,tm,conc,conc,conc]);terr.position.set(0,-.302,0);terr.receiveShadow=true;scene.add(terr);
  if(tm.map){tm.map=tm.map.clone();tm.map.repeat.set(16/3,36/3);tm.map.needsUpdate=true;}
  scene.add(new THREE.HemisphereLight(0xfff6ea,0x9c8a70,.62));
  K.sun(ctx,{from:[-30,12,6],to:[0,0,0],intensity:1.45,size:20,color:0xffe7c8});
  K.pano(ctx,{src:'img/pano/la.jpg',face:'W',u:.30,sky:'#6986bd',ground:'#8a7a5c'});
  hangAll(S,[['A','N'],['A','W'],['A','E'],['B','S'],['B','W'],['B','E']],cfg.works,1.6);
  benchAt(ctx,[[0,-10.5,0,2.4],[0,10.5,0,2.4]],0x3d3127);
  return {areas:S.areas(.7),eye:1.6,
    start:{pos:V(0,1.6,-2.5),look:V(-14,1.7,2)},
    views:[{label:'Glass corridor',pos:V(0,1.6,-4),look:V(-10,2,3)},{label:'North pavilion',pos:V(2,1.6,-7),look:V(-1,1.7,-15)},{label:'South pavilion',pos:V(-2,1.6,7),look:V(1,1.7,15)}]};
};

/* ---------- Alps: a timber-ceilinged gallery with a long window onto peaks, and a quiet inner room ---------- */
C.alps=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const wall=Mx.plaster('#eeebe5'),floor=Mx.oakBoards(48),larch=Mx.larch(),wood=new THREE.MeshStandardMaterial({color:0x7a5a3c,roughness:.6});
  const S=K.space(ctx,{frameMat:wood,cells:[
    {id:'A',x0:-9,x1:9,z0:-6.5,z1:6.5,h:4.4,wall,floor,ceil:larch,walls:{W:{open:[{at:0,w:10.5,y0:.55,y1:3.7,kind:'window',cols:3,fw:.1,frameMat:wood,sill:wood}],t:.5},E:{open:[{at:0,w:2.6,y0:0,y1:3.1,kind:'door'}]}},
      dress:(ctx,c)=>{for(let x=c.x0+1.5;x<c.x1;x+=3){const b=new THREE.Mesh(new THREE.BoxGeometry(.24,.32,c.z1-c.z0),wood);b.position.set(x,c.h-.16,0);b.castShadow=true;scene.add(b);}}},
    {id:'B',x0:9.3,x1:19.6,z0:-5.5,z1:5.5,h:4.2,wall,floor,ceil:K.mat({color:0xf0ede8,rough:1}),walls:{W:{open:[{at:0,w:2.6,y0:0,y1:3.1,kind:'door'}]}}}]});
  scene.add(new THREE.HemisphereLight(0xeef3fa,0x8a7458,.62));
  lights(ctx,[[-4,3.8,-3.5],[4,3.8,-3.5],[-4,3.8,3.5],[4,3.8,3.5],[12.5,3.6,0],[16.5,3.6,0]],0xfff0dc,.24,9);
  K.sun(ctx,{from:[-30,16,-14],to:[0,0,0],intensity:1.35,size:16,color:0xfff6ea});
  K.pano(ctx,{src:'img/pano/alps.jpg',face:'W',u:.875,sky:'#84a8d0',ground:'#747648'});
  const ws=cfg.works.map(w=>sized(w,60));
  hangAll(S,[['A','N',[-4.6,0,4.6]],['A','S',[4.6,0,-4.6]],['A','E',[-3.9,3.9]],['B','N',[11.8,14.45,17.1]],['B','E',[-2.9,2.9]],['B','S',[17.1,14.45,11.8]]],ws,1.75);
  benchAt(ctx,[[-3,0,Math.PI/2,2.4],[14.45,0,0,2.2]],0x4a3524);
  return {areas:S.areas(.7).concat([{x0:8.2,x1:10.4,z0:-1,z1:1}]),eye:1.6,
    start:{pos:V(7.4,1.6,4.8),look:V(-9,1.8,-2)},
    views:[{label:'Mountains',pos:V(6.5,1.6,0),look:V(-9,2.1,0)},{label:'Gallery',pos:V(-7.2,1.6,5),look:V(5,1.75,-6.5)},{label:'Inner room',pos:V(10.4,1.6,4.2),look:V(19.6,1.8,-3)}]};
};

/* ---------- Bilbao: a sandstone hall above the estuary, green hills beyond, and a white inner room ---------- */
C.bilbao=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const stone=Mx.sandstone(),floor=Mx.oakBoards(38),wall2=Mx.plaster('#ece8e1'),wood=new THREE.MeshStandardMaterial({color:0x3b3a37,roughness:.5,metalness:.2});
  const win=(at)=>({at,w:1.9,y0:.7,y1:4.6,kind:'window',cols:2,rows:5,fw:.07,bw:.03,frameMat:wood,sill:new THREE.MeshStandardMaterial({color:0xb3a487,roughness:.9})});
  const S=K.space(ctx,{frameMat:wood,cells:[
    {id:'A',x0:-8,x1:8,z0:-6.5,z1:6.5,h:5.6,wall:stone,floor,ceil:K.mat({color:0xe8e2d6,rough:1}),walls:{W:{open:[win(-3.4),win(3.4)],t:.7},E:{open:[{at:0,w:2.6,y0:0,y1:3.6,kind:'door'}],t:.7}}},
    {id:'B',x0:8.7,x1:19,z0:-5.5,z1:5.5,h:4.6,wall:wall2,floor,ceil:K.mat({color:0xf1eee9,rough:1}),walls:{W:{open:[{at:0,w:2.6,y0:0,y1:3.6,kind:'door'}]}}}]});
  scene.add(new THREE.HemisphereLight(0xf2f4f6,0x7a6a54,.62));
  lights(ctx,[[-3,4.8,-3.5],[3,4.8,-3.5],[-3,4.8,3.5],[3,4.8,3.5],[12,4,0],[16,4,0]],0xfff0dc,.26,10);
  K.sun(ctx,{from:[-34,14,8],to:[0,0,0],intensity:1.0,size:16,color:0xfff2e4,radius:6});
  K.pano(ctx,{src:'img/pano/bilbao.jpg',face:'W',u:.62,sky:'#becce3',ground:'#4f5a5c'});
  const ws=cfg.works.map(w=>sized(w,60));
  hangAll(S,[['A','N',[-4.6,0,4.6]],['A','S',[4.6,0,-4.6]],['A','E',[-3.9,3.9]],['B','N',[11.2,13.85,16.5]],['B','E',[-2.9,2.9]],['B','S',[16.5,13.85,11.2]]],ws,1.85);
  benchAt(ctx,[[0,0,Math.PI/2,2.4],[13.85,0,0,2.2]],0x3a2c20);
  return {areas:S.areas(.7).concat([{x0:7.4,x1:9.6,z0:-1,z1:1}]),eye:1.6,
    start:{pos:V(6.6,1.6,5),look:V(-8,2,-2)},
    views:[{label:'Estuary',pos:V(5,1.6,0),look:V(-8,2.4,0)},{label:'Stone hall',pos:V(-6.6,1.6,5.2),look:V(5,1.85,-6.5)},{label:'Inner room',pos:V(9.8,1.6,4.2),look:V(19,1.8,-3)}]};
};

/* ---------- Museum: a long corridor under a light slot that opens into a tall skylit hall ---------- */
C.museum=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const wall=Mx.plaster('#e6e2da'),floor=M.greyConcreteFloor('#6e6a64');
  const S=K.space(ctx,{cells:[
    {id:'K',x0:-2.5,x1:2.5,z0:-32,z1:0,h:5,wall,floor,ceil:K.mat({color:0x2e2d2b,rough:1}),walls:{N:{open:[{at:0,w:5,y0:0,y1:5,kind:'door'}]}},
      dress:(ctx,c)=>{const sl=new THREE.Mesh(new THREE.BoxGeometry(.5,.02,c.z1-c.z0-1),new THREE.MeshBasicMaterial({color:0xfff5e8}));sl.position.set(0,c.h-.01,(c.z0+c.z1)/2);scene.add(sl);
        for(let z=c.z1-4;z>c.z0;z-=6)lights(ctx,[[0,c.h-.4,z]],0xffecd4,.4,11);}},
    {id:'H',x0:-7.5,x1:7.5,z0:-48,z1:-32.3,h:6.2,wall,floor,ceil:K.mat({color:0xf0eee9,rough:1}),walls:{S:{open:[{at:0,w:5,y0:0,y1:5,kind:'door'}]}},
      dress:(ctx,c)=>{const cz=(c.z0+c.z1)/2;const lan=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({color:0xfbfaf7}));lan.rotation.x=Math.PI/2;lan.position.set(0,c.h-.01,cz);scene.add(lan);
        const vel=new THREE.MeshStandardMaterial({color:0xefede8,roughness:1});[[9,0,cz-4.5],[9,0,cz+4.5]].forEach(([w,x,z])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,.6,.08),vel);b.position.set(x,c.h-.3,z);scene.add(b);});
        [[-4.5,cz],[4.5,cz]].forEach(([x,z])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.08,.6,9),vel);b.position.set(x,c.h-.3,z);scene.add(b);});
        lights(ctx,[[-4,c.h-1,cz-3],[4,c.h-1,cz-3],[-4,c.h-1,cz+3],[4,c.h-1,cz+3]],0xf6f4ef,.32,13);}}]});
  scene.add(new THREE.HemisphereLight(0xf8f4ec,0x4e4943,.55));
  hangAll(S,[['K','W'],['K','E'],['H','N'],['H','W'],['H','E']],cfg.works,1.8);
  benchAt(ctx,[[0,-40,0,2.6],[0,-16,Math.PI/2,2.2]],0x3e3024);
  return {areas:S.areas(.75),eye:1.6,start:{pos:V(0,1.6,-1.5),look:V(0,1.8,-52)},
    views:[{label:'Corridor',pos:V(0,1.6,-1.5),look:V(0,1.8,-48)},{label:'Skylit hall',pos:V(-4.6,1.6,-33.4),look:V(4,2,-47)}]};
};
/* ---------- Brickell: a high-floor gallery over Biscayne Bay for Half Fruit. Room A holds the nine as hung at photoMIAMI; room B, through an opening, hangs all ten large. ---------- */
C.brickell=function(ctx,cfg){const THREE=ctx.THREE,scene=ctx.scene;
  const wall=M.whitePaint(),floor=M.greyConcreteFloor('#cfc9bf'),ceil=K.mat({color:0xf6f5f2,rough:1}),alu=new THREE.MeshStandardMaterial({color:0x2b2b2a,roughness:.35,metalness:.6});
  const door=(at)=>({at,w:2.4,y0:0,y1:2.95,kind:'door'});
  const S=K.space(ctx,{frameMat:alu,cells:[
    {id:'A',x0:-4.5,x1:4.5,z0:0,z1:8,h:3.5,wall,floor,ceil,walls:{E:{open:[{at:4,w:7.6,y0:0,y1:3.35,kind:'glass',cols:3,rows:1,fw:.05,bw:.04}]},N:{open:[door(-1.5)]}},
      dress:(ctx,c)=>{[[-2.2],[1.4]].forEach(([x])=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(.06,6),new THREE.MeshBasicMaterial({color:window.__TEXTILE?0xcfcac2:0xfffbf4}));l.rotation.x=Math.PI/2;l.position.set(x,c.h-.005,4);scene.add(l);});}},
    {id:'B',x0:-9.5,x1:4.5,z0:-10.3,z1:-.3,h:3.5,wall,floor,ceil,walls:{S:{open:[door(-1.5)]}},
      dress:(ctx,c)=>{[-6,-2.5,1].forEach(x=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(.06,8.4),new THREE.MeshBasicMaterial({color:window.__TEXTILE?0xcfcac2:0xfffbf4}));l.rotation.x=Math.PI/2;l.position.set(x,c.h-.005,-5.3);scene.add(l);});}}]});
  scene.add(new THREE.HemisphereLight(0xffffff,0xb9c3c9,.68));
  lights(ctx,[[-2.5,3.1,2.5],[-2.5,3.1,5.5],[1.5,3.1,4],[-7,3.1,-5.3],[-3,3.1,-3],[-3,3.1,-8],[1.5,3.1,-5.3]],0xfff6ec,.24,9);
  K.sun(ctx,{from:[40,22,14],to:[0,0,4],intensity:1.25,size:14,color:0xfff1de});
  // the bay: across Biscayne Bay to Miami Beach, seen from high up
  K.pano(ctx,{src:'img/pano/brickell.jpg',face:'E',arc:165,a0:-24,a1:16,y:1.6,center:[0,4],sky:'#4992d1',ground:'#275877'});
  const IN=.0254,M_=cfg.meta;
  // room A: the nine as a 3 x 3 grid, 12 x 16 in prints framed 16 x 20 in, on the wall facing the window
  const fw=(16+2*1.4+2*.6)*IN,fh=(12+2*1.4+2*.6)*IN,G=4*IN,cz=4,cy=1.6;
  cfg.grid.forEach((w,i)=>{const r=Math.floor(i/3),c=i%3;S.hang('A','W',cz-(c-1)*(fw+G),cy+(1-r)*(fh+G),Object.assign({},w,{size:{w:16,h:12,mat:1.4,mould:.6}}));});
  // room B: all ten, large, one row, in series order: west wall, north wall, east wall
  const big=cfg.works.map(w=>sized(w,60)),Y=1.62;
  const runW=[-1.9,-5.3,-8.7],runN=[-7.6,-4.1,-0.6,2.9],runE=[-8.7,-5.3,-1.9];
  big.slice(0,3).forEach((w,i)=>S.hang('B','W',runW[i],Y,w));
  big.slice(3,7).forEach((w,i)=>S.hang('B','N',runN[i],Y,w));
  big.slice(7,10).forEach((w,i)=>S.hang('B','E',runE[i],Y,w));
  benchAt(ctx,[[-.8,4,Math.PI/2,1.8],[-2.5,-5.3,0,2.4]],0x2f2a25);
  return {areas:S.areas(.7),eye:1.6,
    start:{pos:V(2.6,1.6,6.6),look:V(-4.5,1.6,3.2)},
    views:[{label:'The nine',pos:V(-1.3,1.6,4),look:V(-4.5,1.6,4)},{label:'The bay',pos:V(1.2,1.6,4),look:V(12,1.3,4)},{label:'All ten',pos:V(-1.5,1.6,-1.6),look:V(-3,1.62,-10.3)}]};
};
C.ny=C.newYork||(R.CITIES&&R.CITIES.newYork);C.la=C.losAngeles;
})();

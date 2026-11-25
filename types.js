/* Room types built on rooms.js. Each page calls one of:
   ROOMS.corridor(cfg), ROOMS.cube(cfg), ROOMS.salon(cfg), ROOMS.brick(cfg)
   cfg = {title, subtitle, meta, long (inches, long side of the print), back, works:[{t, f, a}]}  (a = width / height) */
(function(){
const R=window.ROOMS;
function dims(a,L){return a>=1?[L,Math.round(L/a)]:[Math.round(L*a),L];}
function base(cfg,extra){return Object.assign({title:cfg.title,subtitle:cfg.subtitle||'Volodymyr Demkiv',meta:cfg.meta,back:cfg.back,
  label:cfg.label||`A gallery room showing ${cfg.works.length} prints from ${cfg.title}`},extra);}
function hang(ctx,cfg,w,pos,normal,o){const [pw,ph]=dims(w.a,cfg.long);
  return ctx.addWork(Object.assign({title:w.t,file:w.f,w:pw,h:ph,pos,normal},o||{}));}

/* ---------- 1. Long corridor: pale plaster, dark polished concrete, one light line ---------- */
function corridor(cfg){
  const n=cfg.works.length,SP=4.4,L=Math.max(24,8+n*SP);
  R.run(base(cfg,{bg:'#1d1c1a',exposure:.82,poolStrength:.42,label:cfg.label||`A long gallery corridor hung with large prints from ${cfg.title}`,
  build(ctx){
    const {THREE,scene,tex,grain,rnd,bench}=ctx;
    const Wd=4.6,H=4.6,x0=-Wd/2,x1=Wd/2,z0=-L,z1=0;
    scene.fog=new THREE.Fog(0x1d1c1a,18,L+6);
    const plaster=tex(1024,1024,(g,w,h)=>{g.fillStyle='#e4e0d9';g.fillRect(0,0,w,h);
      for(let i=0;i<160;i++){g.globalAlpha=.05;g.fillStyle=Math.random()<.5?'#f2efe9':'#cfcac1';g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(40,200),rnd(30,120),rnd(0,3),0,7);g.fill();}
      g.globalAlpha=1;grain(g,w,h,6);},[L/4,1]);
    const concrete=tex(1024,1024,(g,w,h)=>{g.fillStyle='#57544f';g.fillRect(0,0,w,h);
      for(let i=0;i<120;i++){g.globalAlpha=.06;g.fillStyle=Math.random()<.5?'#6c6862':'#45423e';g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(30,160),rnd(20,90),rnd(0,3),0,7);g.fill();}
      g.globalAlpha=.25;g.strokeStyle='#3c3a36';g.lineWidth=2;g.beginPath();g.moveTo(0,1);g.lineTo(w,1);g.stroke();
      g.globalAlpha=1;grain(g,w,h,12);},[1,L/4.6]);
    const wallMat=new THREE.MeshStandardMaterial({map:plaster,roughness:.95});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(Wd,L),new THREE.MeshStandardMaterial({map:concrete,roughness:.28,metalness:.05}));
    floor.rotation.x=-Math.PI/2;floor.position.set(0,0,-L/2);floor.name='floor';scene.add(floor);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(Wd,L),new THREE.MeshStandardMaterial({color:0x2b2a28,roughness:1}));
    ceil.rotation.x=Math.PI/2;ceil.position.set(0,H,-L/2);scene.add(ceil);
    [[x0,Math.PI/2],[x1,-Math.PI/2]].forEach(([x,r])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(L,H),wallMat);m.position.set(x,H/2,-L/2);m.rotation.y=r;scene.add(m);});
    const endMat=new THREE.MeshStandardMaterial({map:plaster.clone(),roughness:.95});endMat.map.repeat.set(1,1);endMat.map.needsUpdate=true;
    const end=new THREE.Mesh(new THREE.PlaneGeometry(Wd,H),endMat);end.position.set(0,H/2,z0);scene.add(end);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(Wd,H),endMat);back.position.set(0,H/2,z1);back.rotation.y=Math.PI;scene.add(back);
    const slot=new THREE.Mesh(new THREE.BoxGeometry(.06,.01,L-.6),new THREE.MeshBasicMaterial({color:0xfff2de}));slot.position.set(0,H-.006,-L/2);scene.add(slot);
    const gapMat=new THREE.MeshBasicMaterial({color:0x151412});
    [[x0+.003,Math.PI/2],[x1-.003,-Math.PI/2]].forEach(([x,r])=>{const s=new THREE.Mesh(new THREE.PlaneGeometry(L,.03),gapMat);s.position.set(x,.015,-L/2);s.rotation.y=r;scene.add(s);});
    scene.add(new THREE.HemisphereLight(0xfff4e6,0x3a3631,.55));
    scene.add(new THREE.AmbientLight(0xffffff,.08));
    for(let z=-4;z>-L;z-=8){const p=new THREE.PointLight(0xffe9cf,.55,11,2);p.position.set(0,H-.3,z);scene.add(p);}
    cfg.works.forEach((w,k)=>{const left=k%2===0,z=-5-k*SP;
      hang(ctx,cfg,w,new THREE.Vector3(left?x0+.001:x1-.001,1.72,z),new THREE.Vector3(left?1:-1,0,0),{mat:5,mould:1.25});});
    const oak=new THREE.MeshStandardMaterial({color:0x8a6a4a,roughness:.6});
    for(let z=-13;z>-L+5;z-=18)bench(0,z,Math.PI/2,oak,2.2);
    const sp=new THREE.Vector3(0,1.6,-1.2);
    return {bounds:{x0:x0+.7,x1:x1-.7,z0:z0+.8,z1:z1-.6},eye:1.6,start:{pos:sp,look:new THREE.Vector3(0,1.62,z0)},
      views:[{label:'Corridor',pos:sp,look:new THREE.Vector3(0,1.62,z0)},
             {label:'Far end',pos:new THREE.Vector3(0,1.6,z0+2),look:new THREE.Vector3(0,1.62,0)}]};
  }}));
}

/* ---------- 2. New York white cube: white walls, grey concrete, track lights ---------- */
function cube(cfg){
  R.run(base(cfg,{bg:'#1f1f1e',exposure:.8,poolStrength:.3,matColor:0xf4f2ee,
  build(ctx){
    const {THREE,scene,tex,grain,rnd,bench}=ctx;
    const x0=-4.3,x1=4.3,z0=-3.9,z1=3.9,H=4.0,W=x1-x0,D=z1-z0;
    const paint=tex(512,512,(g,w,h)=>{g.fillStyle='#efeeea';g.fillRect(0,0,w,h);grain(g,w,h,3);},[3,2]);
    const wallMat=new THREE.MeshStandardMaterial({map:paint,roughness:.95});
    const conc=tex(1024,1024,(g,w,h)=>{g.fillStyle='#8f8b85';g.fillRect(0,0,w,h);
      for(let i=0;i<140;i++){g.globalAlpha=.05;g.fillStyle=Math.random()<.5?'#a29e98':'#7c7872';g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(30,180),rnd(20,100),rnd(0,3),0,7);g.fill();}
      g.globalAlpha=.3;g.strokeStyle='#6f6b66';g.lineWidth=1.5;g.strokeRect(0,0,w,h);g.globalAlpha=1;grain(g,w,h,9);},[W/3,D/3]);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({map:conc,roughness:.35,metalness:.04}));
    floor.rotation.x=-Math.PI/2;floor.name='floor';scene.add(floor);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({color:0xf2f1ee,roughness:1,emissive:0x1e1e1d}));ceil.rotation.x=Math.PI/2;ceil.position.y=H;scene.add(ceil);
    function plane(w,h,x,y,z,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),wallMat);m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m;}
    plane(W,H,0,H/2,z0,0); plane(D,H,x0,H/2,0,Math.PI/2); plane(D,H,x1,H/2,0,-Math.PI/2);
    // south wall with an open doorway to a dim second room
    const dw=2.2,dh=3.0;plane((W-dw)/2,H,x0+(W-dw)/4,H/2,z1,Math.PI);plane((W-dw)/2,H,x1-(W-dw)/4,H/2,z1,Math.PI);plane(dw,H-dh,0,(H+dh)/2,z1,Math.PI);
    const beyond=new THREE.Mesh(new THREE.PlaneGeometry(dw+2,H),new THREE.MeshBasicMaterial({color:0x6d6b67}));beyond.position.set(0,H/2,z1+2.5);beyond.rotation.y=Math.PI;scene.add(beyond);
    const bfloor=new THREE.Mesh(new THREE.PlaneGeometry(dw+2,2.6),new THREE.MeshBasicMaterial({color:0x58554f}));bfloor.rotation.x=-Math.PI/2;bfloor.position.set(0,.001,z1+1.25);scene.add(bfloor);
    // shadow gap at the base of the walls
    const gap=new THREE.MeshBasicMaterial({color:0x2a2927});
    [[W,0,.012,z0+.002,0],[D,x0+.002,.012,0,Math.PI/2],[D,x1-.002,.012,0,-Math.PI/2]].forEach(([l,x,y,z,r])=>{const s=new THREE.Mesh(new THREE.PlaneGeometry(l,.024),gap);s.position.set(x,y,z);s.rotation.y=r;scene.add(s);});
    // track lights: two black rails with small cans
    const blk=new THREE.MeshStandardMaterial({color:0x151515,roughness:.5});
    [-2.3,2.3].forEach(x=>{const r=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,D-1),blk);r.position.set(x,H-.3,0);scene.add(r);
      for(let z=-2.4;z<=2.4;z+=1.6){const c=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.14,14),blk);c.position.set(x,H-.39,z);scene.add(c);}});
    scene.add(new THREE.HemisphereLight(0xffffff,0xa9a49c,.72));
    [[0,z0+2.2],[0,1.2],[x0+1.8,0],[x1-1.8,0]].forEach(([x,z])=>{const p=new THREE.PointLight(0xfff6ea,.28,9,2);p.position.set(x,H-.5,z);scene.add(p);});
    const slots=[[new THREE.Vector3(-1.75,1.58,z0+.001),new THREE.Vector3(0,0,1)],[new THREE.Vector3(1.75,1.58,z0+.001),new THREE.Vector3(0,0,1)],
      [new THREE.Vector3(x1-.001,1.58,-1.7),new THREE.Vector3(-1,0,0)],[new THREE.Vector3(x1-.001,1.58,1.7),new THREE.Vector3(-1,0,0)],
      [new THREE.Vector3(x0+.001,1.58,1.7),new THREE.Vector3(1,0,0)],[new THREE.Vector3(x0+.001,1.58,-1.7),new THREE.Vector3(1,0,0)]];
    cfg.works.slice(0,6).forEach((w,k)=>hang(ctx,cfg,w,slots[k][0],slots[k][1],{mat:5,mould:1.1}));
    bench(0,.3,0,new THREE.MeshStandardMaterial({color:0x2d2b29,roughness:.5}),2.0);
    const sp=new THREE.Vector3(.4,1.6,z1-1.0);
    return {bounds:{x0:x0+.7,x1:x1-.7,z0:z0+.7,z1:z1-.6},eye:1.6,start:{pos:sp,look:new THREE.Vector3(0,1.5,z0)},
      views:[{label:'Main wall',pos:new THREE.Vector3(0,1.6,z0+3.8),look:new THREE.Vector3(0,1.55,z0)},
             {label:'Whole room',pos:new THREE.Vector3(x1-.75,1.6,z1-.7),look:new THREE.Vector3(x0+1.2,1.35,z0+1)}]};
  }}));
}

/* ---------- 3. Paris salon: panelled white walls, oak boards, tall windows onto zinc roofs ---------- */
function salon(cfg){
  R.run(base(cfg,{bg:'#2b2925',exposure:.78,poolStrength:.25,printTint:cfg.color?0xe6e2dc:0xe2ded6,
  build(ctx){
    const {THREE,scene,tex,grain,rnd,bench}=ctx;
    const x0=-4.6,x1=4.6,z0=-3.6,z1=3.6,H=3.9,W=x1-x0,D=z1-z0;
    const parquet=tex(1024,1024,(g,w,h)=>{const bw=64,bl=512;
      for(let c=0;c<w/bw;c++){const off=rnd(0,bl);for(let y=-bl;y<h+bl;y+=bl){
        g.fillStyle=`hsl(${rnd(29,33)},${rnd(24,30)}%,${rnd(44,49)}%)`;g.fillRect(c*bw,y+off,bw,bl);
        g.globalAlpha=.1;for(let k=0;k<7;k++){g.strokeStyle='#6d5236';g.lineWidth=rnd(.6,1.6);g.beginPath();const x=c*bw+rnd(3,bw-3);g.moveTo(x,y+off);g.bezierCurveTo(x+rnd(-4,4),y+off+bl*.3,x+rnd(-4,4),y+off+bl*.6,x+rnd(-3,3),y+off+bl);g.stroke();}
        g.globalAlpha=.35;g.fillStyle='#5b4430';g.fillRect(c*bw,y+off,bw,1.5);g.fillRect(c*bw,y+off,1.2,bl);g.globalAlpha=1;}}
      grain(g,w,h,7);},[W/3,D/3]);
    const paint=tex(512,512,(g,w,h)=>{g.fillStyle='#ece7de';g.fillRect(0,0,w,h);grain(g,w,h,5);},[4,2]);
    const wallMat=new THREE.MeshStandardMaterial({map:paint,roughness:.92});
    const trim=new THREE.MeshStandardMaterial({color:0xf2eee6,roughness:.7});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({map:parquet,roughness:.45}));
    floor.rotation.x=-Math.PI/2;floor.name='floor';scene.add(floor);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({color:0xf3f0ea,roughness:1,emissive:0x2c2a26}));ceil.rotation.x=Math.PI/2;ceil.position.y=H;scene.add(ceil);
    function plane(w,h,x,y,z,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),wallMat);m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m;}
    plane(W,H,0,H/2,z0,0); plane(W,H,0,H/2,z1,Math.PI); plane(D,H,x1,H/2,0,-Math.PI/2);
    const WIN=[{z:-1.55},{z:1.55}],ww=1.35,wy0=.3,wy1=3.35;let zc=z0;
    WIN.forEach(wn=>{const a=wn.z-ww/2;plane(a-zc,H,x0,H/2,(zc+a)/2,Math.PI/2);zc=wn.z+ww/2;
      plane(ww,wy0,x0,wy0/2,wn.z,Math.PI/2);plane(ww,H-wy1,x0,(H+wy1)/2,wn.z,Math.PI/2);
      const fm=(w,h,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.07,h,w),trim);b.position.set(x0-.02,y,z);scene.add(b);};
      fm(ww,.07,wy0,wn.z);fm(ww,.07,wy1,wn.z);fm(.07,wy1-wy0,(wy0+wy1)/2,wn.z-ww/2);fm(.07,wy1-wy0,(wy0+wy1)/2,wn.z+ww/2);fm(.05,wy1-wy0,(wy0+wy1)/2,wn.z);
      for(let y=wy0+.75;y<wy1-.1;y+=.75)fm(ww,.035,y,wn.z);
      const rv=new THREE.Mesh(new THREE.BoxGeometry(.3,.02,ww),trim);rv.position.set(x0-.15,wy0,wn.z);scene.add(rv);});
    plane(z1-zc,H,x0,H/2,(zc+z1)/2,Math.PI/2);
    const roofs=tex(2048,1024,(g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#dfe5ea');sky.addColorStop(.7,'#f1eee8');sky.addColorStop(1,'#e9e4dc');g.fillStyle=sky;g.fillRect(0,0,w,h);
      let x=0;while(x<w){const bw=rnd(160,320),top=h*rnd(.52,.64);g.fillStyle='#d9d1c4';g.fillRect(x,top+60,bw,h);
        g.fillStyle='#8f969c';g.beginPath();g.moveTo(x,top+60);g.lineTo(x+20,top);g.lineTo(x+bw-20,top);g.lineTo(x+bw,top+60);g.fill();
        g.fillStyle='#7d858c';for(let k=0;k<Math.floor(bw/80);k++)g.fillRect(x+40+k*80,top+15,26,30);
        g.fillStyle='#b8a48d';for(let k=0;k<3;k++){const cx=x+rnd(10,bw-30);g.fillRect(cx,top-rnd(30,60),18,rnd(30,60));}
        g.fillStyle='rgba(120,110,95,.5)';for(let r=top+90;r<h;r+=70)for(let k=x+20;k<x+bw-30;k+=60)g.fillRect(k,r,24,40);
        x+=bw+rnd(0,8);}
      g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,w,h);});
    const out=new THREE.Mesh(new THREE.PlaneGeometry(D*2,H*2.4),new THREE.MeshBasicMaterial({map:roofs,color:0xd6d3cc}));out.position.set(x0-4,H*.75,0);out.rotation.y=Math.PI/2;scene.add(out);
    function box(w,h,d,x,y,z,ry){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),trim);b.position.set(x,y,z);b.rotation.y=ry||0;scene.add(b);}
    [[W,0,z0+.015,0],[W,0,z1-.015,0],[D,x1-.015,0,Math.PI/2]].forEach(([len,x,z,r])=>{box(len,.05,.03,x,.92,z,r);box(len,.16,.03,x,.08,z,r);box(len,.14,.06,x,H-.07,z,r);});
    box(D,.16,.03,x0+.015,.08,0,Math.PI/2);box(D,.14,.06,x0+.03,H-.07,0,Math.PI/2);
    function panel(cx,cy,w,h,wall){const t=.018,dd=.02;
      const put=(pw,ph,px,py)=>{if(wall==='main')box(pw,ph,dd,cx+px,cy+py,z0+.01);else if(wall==='back')box(pw,ph,dd,cx+px,cy+py,z1-.01);else box(pw,ph,dd,x1-.01,cy+py,cx+px,Math.PI/2);};
      put(w,t,0,h/2);put(w,t,0,-h/2);put(t,h,-w/2,0);put(t,h,w/2,0);}
    // tall panels on the main and right walls frame the prints
    [-3.0,0,3.0].forEach(x=>{panel(x,2.15,1.7,2.0,'main');panel(x,.5,1.7,.5,'main');});
    [-2.4,0,2.4].forEach(x=>{panel(x,2.15,1.9,2.0,'back');panel(x,.5,1.9,.5,'back');});
    [-2.2,0,2.2].forEach(z=>{panel(z,2.15,1.7,2.0,'right');panel(z,.5,1.7,.5,'right');});
    const patch=tex(512,512,(g,w,h)=>{g.filter='blur(22px)';g.fillStyle='rgba(255,246,232,.7)';g.beginPath();g.moveTo(60,40);g.lineTo(260,40);g.lineTo(460,470);g.lineTo(260,470);g.fill();
      g.globalCompositeOperation='destination-out';g.filter='blur(4px)';g.fillStyle='#000';for(let y=150;y<470;y+=105)g.fillRect(0,y,w,8);g.fillRect(0,0,w,1);},null);
    WIN.forEach(wn=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),new THREE.MeshBasicMaterial({map:patch,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.35}));
      m.rotation.x=-Math.PI/2;m.position.set(x0+1.7,.004,wn.z+.25);scene.add(m);});
    scene.add(new THREE.HemisphereLight(0xfffaf2,0x8c7458,.62));
    const day=new THREE.DirectionalLight(0xfff3e4,.5);day.position.set(x0-5,4,1);day.target.position.set(1,1,-2);scene.add(day);scene.add(day.target);
    const fill=new THREE.PointLight(0xffefd8,.35,9,2);fill.position.set(0,H-.4,z0+2.2);scene.add(fill);
    const slots=[[new THREE.Vector3(-3.0,2.0,z0+.03),new THREE.Vector3(0,0,1)],[new THREE.Vector3(0,2.0,z0+.03),new THREE.Vector3(0,0,1)],[new THREE.Vector3(3.0,2.0,z0+.03),new THREE.Vector3(0,0,1)],
      [new THREE.Vector3(x1-.03,2.0,-2.2),new THREE.Vector3(-1,0,0)],[new THREE.Vector3(x1-.03,2.0,0),new THREE.Vector3(-1,0,0)],[new THREE.Vector3(x1-.03,2.0,2.2),new THREE.Vector3(-1,0,0)]];
    cfg.works.slice(0,6).forEach((w,k)=>hang(ctx,cfg,w,slots[k][0],slots[k][1],{mat:3.5,mould:.7}));
    bench(.4,-.1,0,new THREE.MeshStandardMaterial({color:0x6e5238,roughness:.55}),1.9);
    const sp=new THREE.Vector3(-1.2,1.6,2.9);
    return {bounds:{x0:x0+.6,x1:x1-.6,z0:z0+.7,z1:z1-.5},eye:1.6,start:{pos:sp,look:new THREE.Vector3(1.2,1.75,z0)},
      views:[{label:'Main wall',pos:new THREE.Vector3(0,1.6,z0+3.4),look:new THREE.Vector3(0,1.85,z0)},
             {label:'Whole room',pos:new THREE.Vector3(x0+.8,1.6,z1-.6),look:new THREE.Vector3(x1-1,1.5,z0+.6)}]};
  }}));
}

/* ---------- 4. London brick: limewashed brick warehouse, timber beams, steel windows ---------- */
function brick(cfg){
  R.run(base(cfg,{bg:'#1e1a17',exposure:.8,poolStrength:.4,
  build(ctx){
    const {THREE,scene,tex,grain,rnd,bench}=ctx;
    const x0=-5.5,x1=5.5,z0=-4,z1=4,H=4.2,W=x1-x0,D=z1-z0;
    // 16 bricks across x 40 courses = 3.6 m x 3.0 m per tile
    const brk=tex(1024,1024,(g,w,h)=>{g.fillStyle='#b9ab9c';g.fillRect(0,0,w,h);const bw=64,bh=25.6;
      for(let r=0;r<40;r++){const off=r%2?bw/2:0;for(let c=-1;c<17;c++){
        g.fillStyle=`hsl(${rnd(14,26)},${rnd(18,30)}%,${rnd(36,46)}%)`;g.fillRect(c*bw+off+2,r*bh+2,bw-4,bh-4);}}
      // old limewash, worn and patchy
      g.filter='blur(40px)';for(let i=0;i<26;i++){g.globalAlpha=rnd(.05,.12);g.fillStyle='#ebe6dc';g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),rnd(200,420),rnd(150,320),rnd(0,3),0,7);g.fill();}
      g.filter='none';g.globalAlpha=.1;g.fillStyle='#e6e0d6';g.fillRect(0,0,w,h);g.globalAlpha=1;grain(g,w,h,10);});
    const brickMat=(len,ht)=>{const t=brk.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(len/3.6,ht/3.0);t.needsUpdate=true;return new THREE.MeshStandardMaterial({map:t,roughness:.95});};
    const planks=tex(1024,1024,(g,w,h)=>{const bw=128,bl=1024;
      for(let c=0;c<w/bw;c++){const off=rnd(0,bl);for(let y=-bl;y<h+bl;y+=bl){
        g.fillStyle=`hsl(${rnd(24,30)},${rnd(22,30)}%,${rnd(24,30)}%)`;g.fillRect(c*bw,y+off,bw,bl);
        g.globalAlpha=.12;for(let k=0;k<10;k++){g.strokeStyle='#1d140d';g.lineWidth=rnd(.6,2);g.beginPath();const x=c*bw+rnd(4,bw-4);g.moveTo(x,y+off);g.bezierCurveTo(x+rnd(-6,6),y+off+bl*.3,x+rnd(-6,6),y+off+bl*.6,x+rnd(-4,4),y+off+bl);g.stroke();}
        g.globalAlpha=.5;g.fillStyle='#1a120c';g.fillRect(c*bw,y+off,bw,2);g.fillRect(c*bw,y+off,2,bl);g.globalAlpha=1;}}
      grain(g,w,h,8);},[D/2.4,W/2.4]);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({map:planks,roughness:.5}));
    floor.rotation.x=-Math.PI/2;floor.name='floor';scene.add(floor);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshStandardMaterial({color:0x3b3029,roughness:1}));ceil.rotation.x=Math.PI/2;ceil.position.y=H;scene.add(ceil);
    const timber=new THREE.MeshStandardMaterial({color:0x4a3526,roughness:.85});
    for(let x=x0+1.1;x<x1;x+=1.85){const b=new THREE.Mesh(new THREE.BoxGeometry(.24,.3,D),timber);b.position.set(x,H-.15,0);scene.add(b);}
    function wall(len,x,z,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(len,H),brickMat(len,H));m.position.set(x,H/2,z);m.rotation.y=ry;scene.add(m);}
    wall(W,0,z0,0);wall(W,0,z1,Math.PI);wall(D,x1,0,-Math.PI/2);
    // west wall: three tall steel windows
    const WIN=[-2.6,0,2.6],ww=1.5,wy0=.95,wy1=3.55;let zc=z0;
    const steel=new THREE.MeshStandardMaterial({color:0x1b1b1a,roughness:.6});
    const seg=(len,ht,y,z)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(len,ht),brickMat(len,ht));m.position.set(x0,y,z);m.rotation.y=Math.PI/2;scene.add(m);};
    WIN.forEach(z=>{const a=z-ww/2;seg(a-zc,H,H/2,(zc+a)/2);zc=z+ww/2;seg(ww,wy0,wy0/2,z);seg(ww,H-wy1,(H+wy1)/2,z);
      const fm=(w,h,y,zz)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.06,h,w),steel);b.position.set(x0-.03,y,zz);scene.add(b);};
      fm(ww,.06,wy0,z);fm(ww,.06,wy1,z);fm(.06,wy1-wy0,(wy0+wy1)/2,z-ww/2);fm(.06,wy1-wy0,(wy0+wy1)/2,z+ww/2);
      for(let k=1;k<3;k++)fm(.025,wy1-wy0,(wy0+wy1)/2,z-ww/2+k*ww/3);
      for(let y=wy0+.43;y<wy1-.1;y+=.43)fm(ww,.025,y,z);
      const sill=new THREE.Mesh(new THREE.BoxGeometry(.32,.05,ww+.1),new THREE.MeshStandardMaterial({color:0x8d877f,roughness:.9}));sill.position.set(x0+.1,wy0-.03,z);scene.add(sill);});
    seg(z1-zc,H,H/2,(zc+z1)/2);
    // outside: overcast sky over the brick warehouse across the street
    const street=tex(2048,1024,(g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#d4d8db');sky.addColorStop(1,'#e6e4df');g.fillStyle=sky;g.fillRect(0,0,w,h);
      g.fillStyle='#7d6f64';g.fillRect(0,h*.28,w,h);
      for(let r=h*.32;r<h;r+=150)for(let x=30;x<w;x+=170){g.fillStyle='#4f5357';g.fillRect(x,r,90,110);g.fillStyle='#8c8780';g.fillRect(x-6,r+110,102,8);}
      g.fillStyle='#5f5248';g.fillRect(0,h*.28,w,16);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,w,h);});
    const out=new THREE.Mesh(new THREE.PlaneGeometry(D*2.2,H*2.4),new THREE.MeshBasicMaterial({map:street,color:0xcfcfcd}));out.position.set(x0-7,H*.8,0);out.rotation.y=Math.PI/2;scene.add(out);
    const patch=tex(256,256,(g,w,h)=>{g.filter='blur(14px)';g.fillStyle='rgba(235,240,245,.6)';g.fillRect(40,30,w-80,h-60);},null);
    WIN.forEach(z=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.6),new THREE.MeshBasicMaterial({map:patch,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.25}));
      m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI/2;m.position.set(x0+1.3,.004,z);scene.add(m);});
    scene.add(new THREE.HemisphereLight(0xfff1e2,0x4a3a2e,.6));
    const day=new THREE.DirectionalLight(0xe9eef4,.32);day.position.set(x0-5,3.5,0);day.target.position.set(1,1,0);scene.add(day);scene.add(day.target);
    [[0,z0+2],[x1-2,0],[0,1.5]].forEach(([x,z])=>{const p=new THREE.PointLight(0xffe6c8,.3,9,2);p.position.set(x,H-.5,z);scene.add(p);});
    const slots=[[new THREE.Vector3(-3.4,1.62,z0+.001),new THREE.Vector3(0,0,1)],[new THREE.Vector3(0,1.62,z0+.001),new THREE.Vector3(0,0,1)],[new THREE.Vector3(3.4,1.62,z0+.001),new THREE.Vector3(0,0,1)],
      [new THREE.Vector3(x1-.001,1.62,-2.5),new THREE.Vector3(-1,0,0)],[new THREE.Vector3(x1-.001,1.62,0),new THREE.Vector3(-1,0,0)],[new THREE.Vector3(x1-.001,1.62,2.5),new THREE.Vector3(-1,0,0)]];
    cfg.works.slice(0,6).forEach((w,k)=>hang(ctx,cfg,w,slots[k][0],slots[k][1],{mat:5,mould:1.1}));
    bench(0,-.6,0,new THREE.MeshStandardMaterial({color:0x5a4330,roughness:.6}),2.0);
    const sp=new THREE.Vector3(-1,1.6,z1-.9);
    return {bounds:{x0:x0+.7,x1:x1-.7,z0:z0+.7,z1:z1-.6},eye:1.6,start:{pos:sp,look:new THREE.Vector3(.6,1.5,z0)},
      views:[{label:'Main wall',pos:new THREE.Vector3(0,1.6,z0+4.4),look:new THREE.Vector3(0,1.6,z0)},
             {label:'Whole room',pos:new THREE.Vector3(x0+.9,1.6,z1-.8),look:new THREE.Vector3(x1-1,1.4,z0+.8)}]};
  }}));
}
Object.assign(R,{corridor,cube,salon,brick});
})();

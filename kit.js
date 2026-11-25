/* Building kit for multi-room spaces (v2).
   A space is a set of cells (rooms and corridors), each an axis-aligned box with its own height.
   Walls are named by the side they sit on: N (z0), S (z1), W (x0), E (x1). Each wall can carry openings:
   {at: centre along the wall in world units (x for N/S, z for W/E), w, y0, y1, kind:'door'|'window'|'glass'}.
   Works hang with hang(cell, side, at, y, work). Everything is in metres. */
(function(){
const K={};
const T=()=>window.THREE;

/* ---------- canvas helpers ---------- */
K.rnd=(a,b)=>a+Math.random()*(b-a);
K.canvas=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;};
K.ctex=(c,srgb=true)=>{const t=new (T().CanvasTexture)(c);if(srgb)t.encoding=T().sRGBEncoding;t.anisotropy=8;t.wrapS=t.wrapT=T().RepeatWrapping;return t;};
K.noise=(g,w,h,amt)=>{const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);};
K.soft=(g,px,fn)=>{const c=document.createElement('canvas');c.width=g.canvas.width;c.height=g.canvas.height;const q=c.getContext('2d');fn(q);q.globalAlpha=1;const pf=g.filter,pa=g.globalAlpha;g.globalAlpha=1;g.filter='blur('+px+'px)';g.drawImage(c,0,0);g.filter=pf||'none';g.globalAlpha=pa;};
K.blots=(g,w,h,n,cols,rmin,rmax,a)=>K.soft(g,Math.round(rmin*.6),(q)=>{for(let i=0;i<n;i++){q.globalAlpha=K.rnd(a*.4,a);q.fillStyle=cols[i%cols.length];q.beginPath();q.ellipse(K.rnd(0,w),K.rnd(0,h),K.rnd(rmin,rmax),K.rnd(rmin*.6,rmax*.7),K.rnd(0,3),0,7);q.fill();}});

/* ---------- materials: texture is tile metres wide; UVs are written in metres so seams line up ---------- */
K.mat=(o)=>{const THREE=T();const m=new THREE.MeshStandardMaterial({color:o.color||0xffffff,roughness:o.rough!=null?o.rough:.9,metalness:o.metal||0});
  if(o.draw){const c=K.canvas(o.px||1024,o.py||o.px||1024,o.draw);m.map=K.ctex(c);if(o.bump){m.bumpMap=K.ctex(c,false);m.bumpScale=o.bump;}}
  m.userData.tile=o.tile||2;m.userData.tileY=o.tileY||m.userData.tile;if(o.emissive)m.emissive=new THREE.Color(o.emissive);return m;};
function uvPlane(w,h,mat,u0,v0){const THREE=T();const g=new THREE.PlaneGeometry(w,h);const tx=mat.userData.tile||2,ty=mat.userData.tileY||tx;
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,(u0+uv.getX(i)*w)/tx,(v0+uv.getY(i)*h)/ty);}uv.needsUpdate=true;return new THREE.Mesh(g,mat);}
K.uvPlane=uvPlane;

/* ---------- textiles and wood for the moody rooms ---------- */
K.TX={
  // woven wall covering (linen / wool): warp and weft threads with slubs; tile .55 m
  fabric:(col,tone)=>K.mat({tile:.55,rough:1,bump:.0008,px:1024,draw:(g,w,h)=>{const r=K.rnd;g.fillStyle=col;g.fillRect(0,0,w,h);const p=3;
      for(let y=0;y<h;y+=p){g.globalAlpha=r(.02,.06);g.fillStyle=Math.random()<.5?'#000':'#fff';g.fillRect(0,y,w,p*.55);}
      for(let x=0;x<w;x+=p){g.globalAlpha=r(.015,.04);g.fillStyle=Math.random()<.5?'#000':'#fff';g.fillRect(x,0,p*.5,h);}
      for(let i=0;i<1600;i++){g.globalAlpha=r(.03,.08);g.fillStyle=Math.random()<.55?(tone||'#fff'):'#000';const y=Math.floor(r(0,h)/p)*p;g.fillRect(r(-40,w),y,r(20,140),p*r(.5,.9));}
      g.globalAlpha=1;K.blots(g,w,h,24,['rgba(255,255,255,.03)','rgba(0,0,0,.03)'],80,260,.2);K.noise(g,w,h,10);}}),
  // wool carpet / felt: dense short fibres; tile 1.1 m
  wool:(col)=>K.mat({tile:1.1,rough:1,bump:.0012,px:1024,draw:(g,w,h)=>{const r=K.rnd;g.fillStyle=col;g.fillRect(0,0,w,h);g.lineCap='round';
      for(let i=0;i<90000;i++){const x=r(0,w),y=r(0,h),a=r(0,6.3),l=r(2,6);g.globalAlpha=r(.03,.08);g.strokeStyle=Math.random()<.5?'#000':'#fff';g.lineWidth=r(.6,1.4);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
      g.globalAlpha=1;K.blots(g,w,h,30,['rgba(255,255,255,.05)','rgba(0,0,0,.07)'],60,220,.4);K.noise(g,w,h,8);}}),
  // smoked oak boards, oiled
  oak:(lit)=>K.mat({tile:2.6,rough:.6,bump:.0012,draw:(g,w,h)=>{const r=K.rnd,bw=w/10;for(let c=0;c<10;c++){const off=r(0,h);for(let y=-h;y<h*2;y+=h*.8){
      g.fillStyle=`hsl(${r(28,33)},${r(14,19)}%,${(lit||24)+r(-2,2)}%)`;g.fillRect(c*bw,y+off,bw,h*.8);
      g.globalAlpha=.14;g.strokeStyle='#120c07';for(let k=0;k<14;k++){g.lineWidth=r(.5,1.8);const x=c*bw+r(3,bw-3);g.beginPath();g.moveTo(x,y+off);g.bezierCurveTo(x+r(-6,6),y+off+h*.25,x+r(-6,6),y+off+h*.55,x+r(-2,2),y+off+h*.8);g.stroke();}
      g.globalAlpha=.6;g.fillStyle='#0d0905';g.fillRect(c*bw,y+off,bw,2);g.fillRect(c*bw,y+off,1.5,h*.8);g.globalAlpha=1;}}K.noise(g,w,h,8);}}),
};
// per space: wall fabric colour, floor (wool colour or 'oak'), and a second room variant
K.TXPAL={
  newYork:{wall:['#e4e0d8','#e4e0d8'],floor:['oak','#b9b4ab']},
  paris:{wall:['#e6e1d7','#e6e1d7','#e6e1d7'],floor:['oak','oak','oak']},
  london:{wall:['#e2ded7','#e2ded7'],floor:['#a9a49b','oak']},
  miami:{wall:['#ebe7df','#ebe7df'],floor:['#cfc9bd','#cfc9bd']},
  losAngeles:{wall:['#dedad3'],floor:['#a8a39a']},
  alps:{wall:['#e4dfd5','#e4dfd5'],floor:['oak','oak']},
  bilbao:{wall:['#e2ddd4','#e2ddd4'],floor:['oak','#aaa59c']},
  museum:{wall:['#e3dfd8'],floor:['#b1aca3']},
  brickell:{wall:['#e8e5df','#e8e5df'],floor:['#bdb8ae','oak']},
};
K.TXPAL.ny=K.TXPAL.newYork;K.TXPAL.la=K.TXPAL.losAngeles;
K.textile=function(spec){const city=window.__TEXTILE;if(!city)return;const P=K.TXPAL[city];if(!P)return;const cache={};
  const get=(k,f)=>cache[k]||(cache[k]=f());
  spec.cells.forEach((c,i)=>{const wc=P.wall[i%P.wall.length],fc=P.floor[i%P.floor.length];
    if(!(c.wall&&c.wall.userData&&c.wall.userData.keep))c.wall=get('w'+wc,()=>K.TX.fabric(wc));
    c.floor=fc==='oak'?get('oak',()=>K.TX.oak(36)):get('f'+fc,()=>K.TX.wool(fc));});};

/* ---------- the space ---------- */
K.space=function(ctx,spec){
  const THREE=T(),scene=ctx.scene;const cells={};const floors=[];K.textile(spec);K._cells=spec.cells;K._windows=[];
  const aoTex=K.ctex(K.canvas(8,256,(g,w,h)=>{const r=g.createLinearGradient(0,h,0,0);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(.35,'rgba(0,0,0,.35)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}),false);
  aoTex.wrapS=aoTex.wrapT=THREE.ClampToEdgeWrapping;
  const aoMat=(o)=>new THREE.MeshBasicMaterial({map:aoTex,color:0x000000,transparent:true,opacity:o,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  spec.cells.forEach(c=>{
    cells[c.id]=c;const W=c.x1-c.x0,D=c.z1-c.z0,H=c.h;c.W=W;c.D=D;
    const fl=uvPlane(W,D,c.floor,c.x0,-c.z1);fl.rotation.x=-Math.PI/2;fl.position.set((c.x0+c.x1)/2,0,(c.z0+c.z1)/2);fl.name='floor';fl.receiveShadow=true;scene.add(fl);floors.push(fl);
    if(c.ceil!==false){const cm=c.ceil||new THREE.MeshStandardMaterial({color:0xf2f0ec,roughness:1});const ce=uvPlane(W,D,cm,c.x0,c.z0);ce.rotation.x=Math.PI/2;ce.position.set((c.x0+c.x1)/2,H,(c.z0+c.z1)/2);ce.receiveShadow=true;scene.add(ce);}
    ['N','S','W','E'].forEach(side=>buildWall(c,side,(c.walls||{})[side]||{}));
    if(c.dress)c.dress(ctx,c);
  });
  function frame(c,side){ // origin and axes for a wall: point(at,y,depth) where depth>0 goes into the room
    const map={N:{o:[0,0,c.z0],u:[1,0,0],n:[0,0,1],a0:c.x0,a1:c.x1},S:{o:[0,0,c.z1],u:[1,0,0],n:[0,0,-1],a0:c.x0,a1:c.x1},
      W:{o:[c.x0,0,0],u:[0,0,1],n:[1,0,0],a0:c.z0,a1:c.z1},E:{o:[c.x1,0,0],u:[0,0,1],n:[-1,0,0],a0:c.z0,a1:c.z1}}[side];
    return map;}
  function place(m,f,at,y,depth,ry){const p=new THREE.Vector3(f.o[0]+f.u[0]*at+f.n[0]*depth,y,f.o[2]+f.u[2]*at+f.n[2]*depth);m.position.copy(p);m.lookAt(p.clone().add(new THREE.Vector3(...f.n)));if(ry)m.rotateY(ry);return m;}
  var thresholdMat=null;
  function buildWall(c,side,wall){
    if(wall.none)return;const f=frame(c,side),H=c.h,mat=wall.mat||c.wall,t=wall.t||.3;mat.side=THREE.DoubleSide;if(wall.revealMat)wall.revealMat.side=THREE.DoubleSide;
    const ops=(wall.open||[]).slice().sort((a,b)=>a.at-b.at);let a=f.a0;
    // plane faces into the room; a wall plane's local +x runs opposite to u on N/E sides because of lookAt, so mirror the at-coordinate
    const seg=(s0,s1,y0,y1)=>{if(s1-s0<.001||y1-y0<.001)return;const w=s1-s0,h=y1-y0;const m=uvPlane(w,h,mat,(side==='S'||side==='W')?-s1:s0,y0);place(m,f,(s0+s1)/2,(y0+y1)/2,0);m.receiveShadow=true;m.castShadow=true;m.material.shadowSide=THREE.DoubleSide;scene.add(m);};
    ops.forEach(o=>{const s0=o.at-o.w/2,s1=o.at+o.w/2;seg(a,s0,0,H);seg(s0,s1,0,o.y0);seg(s0,s1,o.y1,H);a=s1;
      // reveals
      const rv=(w,h,at,y,d,ry,rx)=>{const m=uvPlane(w,h,wall.revealMat||mat,0,0);place(m,f,at,y,-d/2,0);if(ry)m.rotateY(ry);if(rx)m.rotateX(rx);m.receiveShadow=true;m.castShadow=true;scene.add(m);};
      rv(t,o.y1-o.y0,s0,(o.y0+o.y1)/2,t,-Math.PI/2);rv(t,o.y1-o.y0,s1,(o.y0+o.y1)/2,t,Math.PI/2);
      rv(o.w,t,o.at,o.y1,t,0,Math.PI/2);if(o.y0>0)rv(o.w,t,o.at,o.y0,t,0,-Math.PI/2);
      // threshold: a flat stone plate filling this cell's half of the wall thickness, so no gap or overlap shows underfoot
      if(o.y0<=0){const th=new THREE.Mesh(new THREE.PlaneGeometry(o.w,t/2),thresholdMat||(thresholdMat=new THREE.MeshStandardMaterial({color:0xb9b2a6,roughness:.75})));place(th,f,o.at,.001,-t/4);th.rotateX(-Math.PI/2);th.receiveShadow=true;scene.add(th);}
      if(o.kind==='window'||o.kind==='glass'){glazing(f,o,t,wall);(K._windows=K._windows||[]).push({f,o,t,c});}
    });
    seg(a,f.a1,0,H);
    // corner shading where wall meets floor and ceiling (skip across door openings)
    if(c.ao!==false){let b=f.a0;const runs=[];ops.filter(o=>o.y0<.05).forEach(o=>{runs.push([b,o.at-o.w/2]);b=o.at+o.w/2;});runs.push([b,f.a1]);
      runs.forEach(([s0,s1])=>{if(s1-s0<.05)return;const L=s1-s0;
        const w1=new THREE.Mesh(new THREE.PlaneGeometry(L,.55),aoMat(c.aoWall||.28));place(w1,f,(s0+s1)/2,.275,.004);scene.add(w1);
        const f1=new THREE.Mesh(new THREE.PlaneGeometry(L,.6),aoMat(c.aoFloor||.32));place(f1,f,(s0+s1)/2,.003,.3);f1.rotateX(-Math.PI/2);f1.rotateZ(Math.PI);scene.add(f1);});
      const cw=new THREE.Mesh(new THREE.PlaneGeometry(f.a1-f.a0,.5),aoMat(c.aoCeil||.18));place(cw,f,(f.a0+f.a1)/2,H-.25,.004);cw.rotateZ(Math.PI);scene.add(cw);}
    if(wall.dress)wall.dress(ctx,c,f,place);
  }
  function glazing(f,o,t,wall){
    const fm=o.frameMat||wall.frameMat||spec.frameMat||new THREE.MeshStandardMaterial({color:0x1c1c1b,roughness:.5,metalness:.2});
    const bar=(w,h,at,y,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),fm);place(m,f,at,y,-t*.55);m.castShadow=true;scene.add(m);};
    const fw=o.fw||.06,W=o.w,Hh=o.y1-o.y0;
    bar(W,fw,o.at,o.y0+fw/2,.08);bar(W,fw,o.at,o.y1-fw/2,.08);bar(fw,Hh,o.at-W/2+fw/2,(o.y0+o.y1)/2,.08);bar(fw,Hh,o.at+W/2-fw/2,(o.y0+o.y1)/2,.08);
    const cols=o.cols||1,rows=o.rows||1;
    for(let k=1;k<cols;k++)bar(o.bw||fw*.6,Hh,o.at-W/2+k*W/cols,(o.y0+o.y1)/2,.06);
    for(let k=1;k<rows;k++)bar(W,o.bw||fw*.6,o.at,o.y0+k*Hh/rows,.06);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(W,Hh),new THREE.MeshBasicMaterial({color:0xdfe8ee,transparent:true,opacity:.07,depthWrite:false}));gl.userData.glass=true;place(gl,f,o.at,(o.y0+o.y1)/2,-t*.55);scene.add(gl);
    if(o.sill){const s=new THREE.Mesh(new THREE.BoxGeometry(W+.12,.045,.34),o.sill);place(s,f,o.at,o.y0-.02,.06);s.castShadow=true;s.receiveShadow=true;scene.add(s);}
  }
  function hang(cellId,side,at,y,work,o){const c=cells[cellId],f=frame(c,side);
    const p=new THREE.Vector3(f.o[0]+f.u[0]*at+f.n[0]*.002,y,f.o[2]+f.u[2]*at+f.n[2]*.002);
    return ctx.addWork(Object.assign({title:work.t,file:work.f,meta:work.m,pos:p,normal:new THREE.Vector3(...f.n)},work.size||{},o||{}));}
  function wallPoint(cellId,side,at,y,d){const c=cells[cellId],f=frame(c,side);return new THREE.Vector3(f.o[0]+f.u[0]*at+f.n[0]*(d||0),y,f.o[2]+f.u[2]*at+f.n[2]*(d||0));}
  function areas(m){const A=spec.cells.map(c=>({x0:c.x0+(c.mx!=null?c.mx:m),x1:c.x1-(c.mx!=null?c.mx:m),z0:c.z0+(c.mz!=null?c.mz:m),z1:c.z1-(c.mz!=null?c.mz:m)}));
    // a walkable strip through every doorway that leads into another cell
    const inCell=(x,z)=>spec.cells.some(c=>x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1);const L=[];const r=1.6,pad=.35;
    spec.cells.forEach(c=>Object.entries(c.walls||{}).forEach(([side,wl])=>(wl.open||[]).forEach(o=>{if(o.kind!=='door')return;const h=o.w/2-pad;if(h<=.2)return;
      if(side==='N'&&inCell(o.at,c.z0-1))L.push({x0:o.at-h,x1:o.at+h,z0:c.z0-r,z1:c.z0+r});
      if(side==='S'&&inCell(o.at,c.z1+1))L.push({x0:o.at-h,x1:o.at+h,z0:c.z1-r,z1:c.z1+r});
      if(side==='W'&&inCell(c.x0-1,o.at))L.push({x0:c.x0-r,x1:c.x0+r,z0:o.at-h,z1:o.at+h});
      if(side==='E'&&inCell(c.x1+1,o.at))L.push({x0:c.x1-r,x1:c.x1+r,z0:o.at-h,z1:o.at+h});})));
    return A.concat(L,spec.links||[]);}
  return {cells,hang,wallPoint,areas,place,frame};
};

/* ---------- daylight through windows: one shadow-casting sun ---------- */
K.sun=function(ctx,o){const THREE=T();const L=new THREE.DirectionalLight(o.color||0xfff1de,o.intensity||1.2);
  L.position.set(...o.from);L.target.position.set(...(o.to||[0,0,0]));L.castShadow=true;const s=o.size||16;
  Object.assign(L.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:o.far||120});L.shadow.mapSize.set(o.map||2048,o.map||2048);L.shadow.bias=-.0004;L.shadow.normalBias=.02;L.shadow.radius=o.radius||4;
  ctx.scene.add(L);ctx.scene.add(L.target);return L;};

/* ---------- the view outside: a frame whose +z points away from the room, x along the wall ---------- */
K.outside=function(ctx,o){const THREE=T();const g=new THREE.Group();
  const rot={S:0,N:Math.PI,W:-Math.PI/2,E:Math.PI/2}[o.dir];g.rotation.y=rot;g.position.set(...o.at);ctx.scene.add(g);
  const api={g,
    ground(c,d0,d1,w,y,bright,tile){const tx=K.ctex(c);if(tile!==0){const t=tile||10;tx.repeat.set(w/t,(d1-d0)/t);}const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d1-d0),new THREE.MeshBasicMaterial({map:tx,fog:false,color:new THREE.Color(bright||1,bright||1,bright||1)}));m.rotation.x=-Math.PI/2;m.position.set(0,y,(d0+d1)/2);g.add(m);return m;},
    wall(c,d,w,h,y,x,bright,alpha){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:K.ctex(c),transparent:alpha!==false,fog:false,depthWrite:alpha===false,color:new THREE.Color(bright||1,bright||1,bright||1),alphaTest:alpha===false?0:.02}));
      m.rotation.y=Math.PI;m.position.set(x||0,y+h/2,d);g.add(m);return m;},
    // a real photograph standing across the street: d distance, w x h metres, bottom at y; mirror repeats it sideways (n copies)
    photo(src,d,w,h,y,o){o=o||{};const tx=new THREE.TextureLoader().load(src);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=8;const n=o.copies||1;
      if(n>1){tx.wrapS=THREE.MirroredRepeatWrapping;tx.repeat.set(n,1);tx.offset.set(-(n-1)/2,0);}
      const b=o.bright||1;const m=new THREE.Mesh(new THREE.PlaneGeometry(w*n,h),new THREE.MeshBasicMaterial({map:tx,fog:false,toneMapped:false,color:new THREE.Color(b,b,b)}));
      m.rotation.y=Math.PI;m.position.set(o.x||0,y+h/2,d);g.add(m);g.userData.photo=true;return m;},
    box(w,h,dpt,col,x,y,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,dpt),new THREE.MeshBasicMaterial({color:col,fog:false}));m.position.set(x,y+h/2,d);g.add(m);return m;}};
  return api;};


/* a real photographic panorama around the building: a ring band from -25 to +35 degrees, with sky and ground caps.
   face: world direction (N,E,S,W) that the point u of the strip should face. */
K.pano=function(ctx,o){const THREE=T();const R=o.R||3000,a0=o.a0!=null?o.a0:-25,a1=o.a1!=null?o.a1:35,seg=128,rings=13,arc=o.arc?o.arc*Math.PI/180:2*Math.PI;const dirAng={N:0,E:Math.PI/2,S:Math.PI,W:-Math.PI/2}[o.face||'W'];
  const pos=[],uv=[],idx=[];for(let j=0;j<rings;j++){const a=(a0+(a1-a0)*j/(rings-1))*Math.PI/180;const y=R*Math.tan(a);const v=j/(rings-1);
    for(let i=0;i<=seg;i++){const u=i/seg;const th=arc*(u-(o.u||.5))+dirAng;pos.push(R*Math.sin(th),y,-R*Math.cos(th));uv.push(u,v);}}
  for(let j=0;j<rings-1;j++)for(let i=0;i<seg;i++){const p=j*(seg+1)+i,q=p+seg+1;idx.push(p,p+1,q,p+1,q+1,q);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);
  const tx=new THREE.TextureLoader().load(o.src);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=8;tx.wrapS=THREE.RepeatWrapping;
  const b=o.bright||1;const mat=new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide,fog:false,toneMapped:false,color:new THREE.Color(b,b,b),depthWrite:false});
  const g=new THREE.Group();g.userData.pano=true;const band=new THREE.Mesh(geo,mat);band.renderOrder=-10;g.add(band);
  const capM=(c)=>new THREE.MeshBasicMaterial({color:(o.arc?new THREE.Color(c).convertSRGBToLinear():new THREE.Color(c)).multiplyScalar(b),side:THREE.DoubleSide,fog:false,toneMapped:false,depthWrite:false});
  const top=new THREE.Mesh(new THREE.SphereGeometry(R*1.6,48,16,0,Math.PI*2,0,o.arc?(90-a1+1)*Math.PI/180:Math.PI/2*0.62),capM(o.sky||'#7fa3cf'));top.renderOrder=-11;g.add(top);
  const yb=R*Math.tan(a0*Math.PI/180);const bot=new THREE.Mesh(new THREE.CircleGeometry(R*1.2,64),capM(o.ground||'#777'));bot.rotation.x=-Math.PI/2;bot.position.y=yb;bot.renderOrder=-11;g.add(bot);
  const c=o.center||[0,0];g.position.set(c[0],o.y||0,c[1]);ctx.scene.add(g);return g;};
/* ---------- painted scenery ---------- */
const P=K.paint={};
P.sky=(w,h,o)=>K.canvas(w,h,(g)=>{const r=g.createLinearGradient(0,0,0,h);(o.stops||[[0,'#a9c3db'],[1,'#e9eef0']]).forEach(s=>r.addColorStop(s[0],s[1]));g.fillStyle=r;g.fillRect(0,0,w,h);
  if(o.clouds==='cumulus'){for(let i=0;i<o.n||i<26;i++){const cx=K.rnd(0,w),cy=K.rnd(h*.15,h*.75),s=K.rnd(40,140)*(cy/h+.4);g.filter='blur(6px)';
      for(let k=0;k<9;k++){const x=cx+K.rnd(-s*1.6,s*1.6),y=cy+K.rnd(-s*.35,s*.15),r=s*K.rnd(.35,.75);const rg=g.createRadialGradient(x,y-r*.3,r*.1,x,y,r);rg.addColorStop(0,'rgba(255,255,255,.95)');rg.addColorStop(.7,'rgba(246,246,246,.75)');rg.addColorStop(1,'rgba(220,225,232,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
      g.fillStyle='rgba(190,198,210,.25)';g.beginPath();g.ellipse(cx,cy+s*.12,s*1.7,s*.12,0,0,7);g.fill();}g.filter='none';}
  if(o.clouds==='overcast'){g.filter='blur(30px)';for(let i=0;i<60;i++){g.fillStyle=`rgba(${K.rnd(150,215)|0},${K.rnd(155,218)|0},${K.rnd(160,222)|0},.35)`;g.beginPath();g.ellipse(K.rnd(0,w),K.rnd(0,h*.8),K.rnd(120,420),K.rnd(30,90),0,0,7);g.fill();}g.filter='none';}
  if(o.clouds==='thin'){g.filter='blur(14px)';for(let i=0;i<24;i++){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(K.rnd(0,w),K.rnd(0,h*.6),K.rnd(120,380),K.rnd(8,22),K.rnd(-.1,.1),0,7);g.fill();}g.filter='none';}
});
P.flat=(col,amt)=>K.canvas(256,256,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);K.noise(g,w,h,amt||8);});

/* tree and plant silhouettes on transparent canvases */
P.palm=(o)=>K.canvas(512,1024,(g,w,h)=>{o=o||{};const tx=w/2+K.rnd(-40,40),top=h*.14;g.strokeStyle=o.trunk||'#6d6257';g.lineCap='round';
  const bend=K.rnd(-60,60);g.lineWidth=22;g.beginPath();g.moveTo(w/2,h);g.quadraticCurveTo(w/2+bend,h*.55,tx,top);g.stroke();
  g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;for(let y=h;y>top;y-=14){const k=(y-top)/(h-top);const x=w/2+(tx-w/2)*(1-k)+bend*2*k*(1-k)*1;g.beginPath();g.moveTo(x-8,y);g.lineTo(x+8,y);g.stroke();}
  const n=o.n||22;for(let i=0;i<n;i++){const a=-Math.PI/2+(i/n)*Math.PI*2+K.rnd(-.1,.1),len=K.rnd(150,230),droop=K.rnd(.5,1.1);
    const ex=tx+Math.cos(a)*len,ey=top+Math.sin(a)*len*.55+len*.45*droop;g.strokeStyle=o.leaf||'#3f5a3a';g.lineWidth=7;g.beginPath();g.moveTo(tx,top);g.quadraticCurveTo(tx+Math.cos(a)*len*.6,top+Math.sin(a)*len*.4-30,ex,ey);g.stroke();
    g.lineWidth=4;for(let k=.12;k<1;k+=.035){const px=tx+(ex-tx)*k,py=top+(ey-top)*k-30*Math.sin(k*Math.PI)*.6;const ln=44*(1-k*.55);g.beginPath();g.moveTo(px,py);g.lineTo(px+ln*Math.cos(a+1.3),py+ln*Math.sin(a+1.3)+10);g.moveTo(px,py);g.lineTo(px+ln*Math.cos(a-1.3),py+ln*Math.sin(a-1.3)+10);g.stroke();}}
  g.fillStyle='#4a3d2c';g.beginPath();g.arc(tx,top+6,12,0,7);g.fill();});
P.leafy=(o)=>K.canvas(512,768,(g,w,h)=>{o=o||{};g.strokeStyle=o.trunk||'#3c352d';g.lineCap='round';g.lineWidth=14;g.beginPath();g.moveTo(w/2,h);g.lineTo(w/2+K.rnd(-10,10),h*.45);g.stroke();
  for(let i=0;i<7;i++){g.lineWidth=K.rnd(3,7);g.beginPath();g.moveTo(w/2,h*K.rnd(.45,.65));g.lineTo(w/2+K.rnd(-170,170),h*K.rnd(.12,.4));g.stroke();}
  const cols=o.leaves||['#4b5e3c','#5d7048','#3d4f33','#6c7f55'];for(let i=0;i<900;i++){const a=K.rnd(0,7),r=Math.sqrt(Math.random())*K.rnd(.85,1);g.fillStyle=cols[i%cols.length];g.globalAlpha=K.rnd(.5,.95);
    g.beginPath();g.ellipse(w/2+Math.cos(a)*r*200,h*.3+Math.sin(a)*r*170,K.rnd(5,12),K.rnd(3,8),K.rnd(0,3),0,7);g.fill();}g.globalAlpha=1;});
P.pine=(o)=>K.canvas(256,768,(g,w,h)=>{o=o||{};g.fillStyle='#3a2e24';g.fillRect(w/2-5,h*.8,10,h*.2);const col=o.col||'#22301f';
  for(let y=h*.05;y<h*.86;y+=7){const k=(y-h*.05)/(h*.8),hw=6+k*w*.42;g.fillStyle=col;g.globalAlpha=.85;g.beginPath();g.moveTo(w/2,y-10);g.lineTo(w/2-hw*K.rnd(.8,1),y+12);g.lineTo(w/2+hw*K.rnd(.8,1),y+12);g.fill();}g.globalAlpha=1;});

/* ---------- realism: bounce light, soft reflections, window glass, lens ----------
   Everything here is baked once when the room opens: the room is photographed from where you stand into an
   environment map that lights and reflects off every surface. No extra lights per frame, so the rooms stay fast. */
window.ROOMS.realism=function(ctx,room,cfg){const THREE=T(),scene=ctx.scene,renderer=ctx.renderer;
  const R=Object.assign({fill:.5,env:.95,floorRough:.42,view:1.0,veil:.13,spill:.16},cfg.realism||{});
  // daylight and sky fill now come from the room itself, so the flat fills are turned down
  scene.traverse(o=>{if(o.isHemisphereLight||o.isAmbientLight)o.intensity*=R.fill;});
  const mats=new Set();scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial&&!(o.userData.art))mats.add(o.material);});
  scene.traverse(o=>{if(o.name==='floor'&&o.material.isMeshStandardMaterial){const m=o.material;m.roughness=Math.min(m.roughness,R.floorRough);m.userData.floor=true;}});
  mats.forEach(m=>{m.envMapIntensity=m.userData.floor?R.env*.9:R.env;m.needsUpdate=true;});
  // glass: a faint reflection of the room, as real window glass shows from inside
  scene.traverse(o=>{if(o.userData.glass){o.material=new THREE.MeshStandardMaterial({color:0xf2f5f7,roughness:.05,metalness:0,transparent:true,opacity:R.veil,depthWrite:false,envMapIntensity:1.6});}});
  // daylight spilling across the floor in front of every window (painted, not a light)
  const spill=K.ctex(K.canvas(64,256,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,'rgba(255,252,246,1)');r.addColorStop(.35,'rgba(255,252,246,.45)');r.addColorStop(1,'rgba(255,252,246,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
    const s2=g.createLinearGradient(0,0,w,0);s2.addColorStop(0,'rgba(0,0,0,1)');s2.addColorStop(.12,'rgba(0,0,0,0)');s2.addColorStop(.88,'rgba(0,0,0,0)');s2.addColorStop(1,'rgba(0,0,0,1)');g.globalCompositeOperation='destination-out';g.fillStyle=s2;g.fillRect(0,0,w,h);}),false);
  spill.wrapS=spill.wrapT=THREE.ClampToEdgeWrapping;
  (K._windows||[]).forEach(({f,o})=>{if(o.y0>1.2)return;const L=Math.min(4.5,(o.y1-o.y0)*1.1);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(o.w*1.05,L),new THREE.MeshBasicMaterial({map:spill,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:R.spill*(o.y0<.4?1:.7),color:0xfff8ee}));
    const p=new THREE.Vector3(f.o[0]+f.u[0]*o.at+f.n[0]*L/2,.004,f.o[2]+f.u[2]*o.at+f.n[2]*L/2);m.position.copy(p);m.lookAt(p.clone().add(new THREE.Vector3(0,1,0)));
    // texture top edge (v=1 -> v=0 flipped) must face the window
    const n=new THREE.Vector3(...f.n);m.up.set(-n.x,0,-n.z);m.lookAt(p.clone().add(new THREE.Vector3(0,1,0)));m.renderOrder=1;scene.add(m);});
  // lens: a soft vignette, like a photograph of a room
  const v=document.createElement('div');v.setAttribute('aria-hidden','true');v.style.cssText='position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse 85% 80% at 50% 48%,rgba(0,0,0,0) 55%,rgba(16,12,8,.28) 100%)';
  document.getElementById('stage').after(v);
  const pm=new THREE.PMREMGenerator(renderer);pm.compileCubemapShader();
  const cubeRT=new THREE.WebGLCubeRenderTarget(256,{format:THREE.RGBAFormat,generateMipmaps:false,encoding:THREE.sRGBEncoding});
  const cubeCam=new THREE.CubeCamera(.05,9000,cubeRT);scene.add(cubeCam);
  const smallRT=new THREE.WebGLCubeRenderTarget(24,{format:THREE.RGBAFormat,generateMipmaps:false,encoding:THREE.sRGBEncoding});
  const smallCam=new THREE.CubeCamera(.05,9000,smallRT);scene.add(smallCam);
  // bounce light: one soft light probe (spherical harmonics) for the whole space; nearly free to draw
  const probe=new THREE.LightProbe();probe.intensity=R.env;scene.add(probe);
  // reflections: only glass, benches and metal fixtures carry a reflection map (small areas, so it stays fast;
  // a reflection map on the floor cost about 10% per frame, so floors take the bounce light only)
  const cells=(K._cells||[]).slice(0,10);const startP=(room.envAt||room.start.pos).clone();
  const probes=cells.length?cells.map(c=>({c,w:(c.x1-c.x0)*(c.z1-c.z0),p:new THREE.Vector3((c.x0+c.x1)/2,room.eye||1.6,(c.z0+c.z1)/2),rt:null,mats:new Map(),sh:null})):[{c:null,w:1,p:startP.setY(room.eye||1.6),rt:null,mats:new Map(),sh:null}];
  const inCell=(c,v,pad)=>v.x>=c.x0-pad&&v.x<=c.x1+pad&&v.z>=c.z0-pad&&v.z<=c.z1+pad;
  const vc=new THREE.Vector3(),box=new THREE.Box3();
  scene.traverse(o=>{if(!o.isMesh||!o.material||!o.material.isMeshStandardMaterial)return;if(!(o.userData.glass||o.userData.benchPart||o.material.userData.fixture||o.material.metalness>.25))return;box.setFromObject(o);box.getCenter(vc);
    let pr=probes[0];if(cells.length){pr=probes.find(q=>inCell(q.c,vc,.02))||probes.reduce((a,q)=>q.p.distanceToSquared(vc)<a.p.distanceToSquared(vc)?q:a,probes[0]);}
    let m=pr.mats.get(o.material);if(!m){m=o.material.clone();m.userData=Object.assign({},o.material.userData);pr.mats.set(o.material,m);}o.material=m;});
  const px=new Uint8Array(24*24*4),col=new THREE.Color(),dir=new THREE.Vector3(),basis=new Array(9).fill(0);
  function shOf(rt){const sh=new THREE.SphericalHarmonics3();const n=rt.width,ps=2/n;let tw=0;
    for(let f=0;f<6;f++){renderer.readRenderTargetPixels(rt,0,0,n,n,px,f);
      for(let i=0;i<px.length;i+=4){col.setRGB(px[i]/255,px[i+1]/255,px[i+2]/255).convertSRGBToLinear();const k=i/4,cx=-1+(k%n+.5)*ps,cy=1-(Math.floor(k/n)+.5)*ps;
        switch(f){case 0:dir.set(1,cy,-cx);break;case 1:dir.set(-1,cy,cx);break;case 2:dir.set(cx,1,-cy);break;case 3:dir.set(cx,-1,cy);break;case 4:dir.set(cx,cy,1);break;default:dir.set(-cx,cy,-1);}
        const l2=dir.lengthSq(),wt=4/(Math.sqrt(l2)*l2);tw+=wt;dir.normalize();THREE.SphericalHarmonics3.getBasisAt(dir,basis);
        for(let j=0;j<9;j++){sh.coefficients[j].x+=basis[j]*col.r*wt;sh.coefficients[j].y+=basis[j]*col.g*wt;sh.coefficients[j].z+=basis[j]*col.b*wt;}}}
    const nm=4*Math.PI/tw;sh.coefficients.forEach(c=>c.multiplyScalar(nm));return sh;}
  function bakeOne(pr,full){
    const hidden=[];scene.traverse(o=>{if(o.userData.glass&&o.visible){o.visible=false;hidden.push(o);}});probe.visible=false;
    const tm=renderer.toneMapping;renderer.toneMapping=THREE.NoToneMapping;
    smallCam.position.copy(pr.p);smallCam.updateMatrixWorld(true);smallCam.update(renderer,scene);pr.sh=shOf(smallRT);
    if(pr.mats.size&&full!==false){cubeCam.position.copy(pr.p);cubeCam.updateMatrixWorld(true);cubeCam.update(renderer,scene);
      const n=pm.fromCubemap(cubeRT.texture);if(pr.rt)pr.rt.dispose();pr.rt=n;pr.mats.forEach(m=>{m.envMap=n.texture;m.needsUpdate=true;});}
    renderer.toneMapping=tm;hidden.forEach(o=>o.visible=true);probe.visible=true;}
  function bake(){probes.forEach(p=>bakeOne(p));
    // the probe is the floor-area-weighted mix of every room in the space
    const tot=probes.reduce((a,p)=>a+p.w,0);probe.sh.zero();probes.forEach(p=>{for(let j=0;j<9;j++)probe.sh.coefficients[j].addScaledVector(p.sh.coefficients[j],p.w/tot);});}
  bake();
  // bake again once the prints and the view outside have arrived, so they show in the reflections
  let last=0;const again=()=>{const t=performance.now();if(t-last<400)return;last=t;bake();};
  const prev=window.ROOMS.onStart;window.ROOMS.onStart=()=>{if(prev)prev();again();};
  const mgr=THREE.DefaultLoadingManager,prevLoad=mgr.onLoad;mgr.onLoad=function(){if(prevLoad)prevLoad.apply(this,arguments);setTimeout(again,60);};
  window.ROOMS.rebake=bake;
};
window.KIT=K;
})();
